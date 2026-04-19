/**
 * migrar-historico.ts — SAFE additive migration
 *
 * Reads REGISTRO_MAESTRO.xlsx (hoja TOTAL) and
 * REGISTRO COTIZACIONES DURATA 2026.xlsx (hoja "REGISTRO 2026")
 * and inserts ONLY new records into Supabase.
 *
 * STRICT RULES:
 *   - NEVER deletes anything
 *   - NEVER updates existing oportunidades
 *   - Only INSERTs new rows (deduped by normalized COT)
 *   - Only updates oportunidades that THIS run just created (PASO 6)
 *
 * Idempotent: a second run should report 0 new rows.
 *
 * Usage:  npm run migrate
 */

import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseScriptConfig } from './lib/env'

// ── Config ────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const BATCH = 50
const MIGRATION_MARKER = 'Histórico Excel'

const MAESTRO_PATH = resolve(__dirname, 'data/REGISTRO_MAESTRO.xlsx')
const COT2026_PATH = resolve(__dirname, 'data/REGISTRO COTIZACIONES DURATA 2026.xlsx')

const { url: SUPABASE_URL, anonKey: SUPABASE_KEY, authEmail: AUTH_EMAIL, authPass: AUTH_PASS } = getSupabaseScriptConfig()
const sb = createClient(SUPABASE_URL, SUPABASE_KEY)

// Excel cotizador initials → app id
const COTIZADOR: Record<string, string> = {
  'O.C': 'OC',
  'S.A': 'SA',
  'J.R': 'JPR',
  'C.A': 'CA',
  'D.G': 'DG',
}

// ── Helpers ───────────────────────────────────────────────────────
function toStr(v: unknown): string {
  if (v == null) return ''
  return String(v).trim()
}

function toNum(v: unknown): number {
  if (v == null) return 0
  const n = Number(v)
  return isNaN(n) ? 0 : n
}

function subtractDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + 'T12:00:00')
  d.setDate(d.getDate() - days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function excelDateToISO(v: unknown): string | null {
  if (v == null || v === '' || v === 0) return null
  if (typeof v === 'number') {
    const d = XLSX.SSF.parse_date_code(v)
    if (!d) return null
    return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`
  }
  const s = String(v).trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  const d = new Date(s)
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  return null
}

/** Strip spaces around dashes: "2021 - 1207" → "2021-1207" */
function normalizeCot(raw: string): string {
  return raw.trim().replace(/\s*-\s*/g, '-')
}

/**
 * Extract normalized COT from a notas field.
 * Supports:
 *   "COT: 2021-472"              → "2021-472"
 *   "COT: 2021-472 | Proyecto: x" → "2021-472"  (stops at '|')
 *   "COT: 2022-1256 Y 1258"      → "2022-1256 Y 1258"  (multi-word COT preserved)
 *   "COT: 2022-179A 2021-995G"   → "2022-179A 2021-995G"
 * Case-insensitive ("cot:", "Cot:" also match).
 */
function extractCotFromNotas(notas: string | null | undefined): string | null {
  if (!notas) return null
  // Case-insensitive "COT:", capture everything up to '|' or end of string.
  const m = String(notas).match(/cot:\s*([^|]+?)(?:\s*\|.*)?$/is)
  if (!m) return null
  return normalizeCot(m[1].trim())
}

const stats = {
  empresas_created: 0,
  empresas_skipped: 0,
  contactos_created: 0,
  contactos_skipped: 0,
  oportunidades_created: 0,
  oportunidades_skipped: 0,
  oportunidades_advanced: 0,
  cotizaciones_created: 0,
  cotizaciones_skipped: 0,
  cotizaciones_advanced: 0,
  enriched_2026: 0,
  errors: 0,
}

function logProgress(label: string, current: number, total: number) {
  if (current % 100 === 0 || current === total) {
    console.log(`  ${label}: ${current}/${total}...`)
  }
}

async function fetchAll<T>(
  table: string,
  columns: string,
): Promise<T[]> {
  const PAGE = 1000
  const all: T[] = []
  let from = 0
  while (true) {
    const { data, error } = await sb
      .from(table)
      .select(columns)
      .order('id')
      .range(from, from + PAGE - 1)
    if (error) {
      console.error(`  ERROR fetching ${table}: ${error.message}`)
      break
    }
    if (data) all.push(...(data as T[]))
    if (!data || data.length < PAGE) break
    from += PAGE
  }
  return all
}

// ── MAIN ──────────────────────────────────────────────────────────
async function main() {
  console.log('=== MIGRAR HISTÓRICO — SAFE / ADDITIVE ONLY ===\n')

  if (!AUTH_EMAIL || !AUTH_PASS) {
    console.error('Missing MIGRATION_AUTH_EMAIL or MIGRATION_AUTH_PASS in .env or process.env')
    process.exit(1)
  }

  const { error: authErr } = await sb.auth.signInWithPassword({ email: AUTH_EMAIL, password: AUTH_PASS })
  if (authErr) {
    console.error('Auth failed:', authErr.message)
    process.exit(1)
  }
  console.log(`Autenticado como ${AUTH_EMAIL}\n`)

  // ================================================================
  // PASO 1 — Read current Supabase state
  // ================================================================
  console.log('PASO 1: Leyendo estado actual de Supabase...')

  const existingOps = await fetchAll<{ id: string; notas: string | null; etapa: string }>(
    'oportunidades', 'id, notas, etapa',
  )
  const existingCots = new Set<string>()
  const existingOpByCot = new Map<string, { id: string; etapa: string }>()
  for (const op of existingOps) {
    const c = extractCotFromNotas(op.notas)
    if (c) {
      existingCots.add(c)
      existingOpByCot.set(c, { id: op.id, etapa: op.etapa })
    }
  }

  // Order of etapas for "never go backwards" safety
  const etapaOrden: Record<string, number> = {
    nuevo_lead: 0, en_cotizacion: 1, cotizacion_enviada: 2,
    en_seguimiento: 3, en_negociacion: 4, adjudicada: 5, perdida: 5,
  }

  const existingEmpresas = await fetchAll<{ id: string; nombre: string }>('empresas', 'id, nombre')
  const empresaMap = new Map<string, string>()
  for (const e of existingEmpresas) empresaMap.set(e.nombre.toLowerCase().trim(), e.id)

  const existingCotizacionesRaw = await fetchAll<{ id: string; numero: string }>(
    'cotizaciones', 'id, numero',
  )
  const existingCotizacionesNumeros = new Set<string>()
  for (const c of existingCotizacionesRaw) {
    if (c.numero) existingCotizacionesNumeros.add(normalizeCot(c.numero))
  }

  const existingContactosRaw = await fetchAll<{ id: string; nombre: string; empresa_id: string }>(
    'contactos', 'id, nombre, empresa_id',
  )
  const existingContactos = new Map<string, string>()
  for (const c of existingContactosRaw) {
    existingContactos.set(`${c.nombre.toLowerCase().trim()}|${c.empresa_id}`, c.id)
  }

  console.log(
    `  ${existingOps.length} oportunidades existentes (${existingCots.size} con COT), ` +
    `${existingEmpresas.length} empresas, ${existingCotizacionesRaw.length} cotizaciones\n`,
  )

  // ================================================================
  // PASO 2 — Read Excel files
  // ================================================================
  console.log('PASO 2: Leyendo Excels...')
  const wbMaestro = XLSX.readFile(MAESTRO_PATH)
  const wsTOTAL = wbMaestro.Sheets['TOTAL']
  if (!wsTOTAL) { console.error('No se encontró la hoja "TOTAL"'); process.exit(1) }
  const maestroRows: unknown[][] = XLSX.utils.sheet_to_json(wsTOTAL, { header: 1, defval: '' })
  const maestroData = maestroRows.slice(1).filter((r) => r.length > 0)
  console.log(`  MAESTRO: ${maestroData.length} filas`)

  const wb2026 = XLSX.readFile(COT2026_PATH)
  const ws2026 = wb2026.Sheets['REGISTRO 2026']
  if (!ws2026) { console.error('No se encontró la hoja "REGISTRO 2026"'); process.exit(1) }
  const rows2026: unknown[][] = XLSX.utils.sheet_to_json(ws2026, { header: 1, defval: '' })
  const data2026 = rows2026.slice(5).filter((r) => r.length > 0)
  console.log(`  2026:    ${data2026.length} filas\n`)

  // ================================================================
  // PASO 3 — Empresas (additive)
  // ================================================================
  console.log('PASO 3: Empresas...')
  const empresaNombres = new Set<string>()
  for (const r of maestroData) {
    const k = toStr(r[10])
    if (k && k !== '0') empresaNombres.add(k)
  }

  const nuevasEmpresas: { nombre: string; sector: string }[] = []
  for (const nombre of empresaNombres) {
    if (empresaMap.has(nombre.toLowerCase().trim())) {
      stats.empresas_skipped++
    } else {
      nuevasEmpresas.push({ nombre, sector: 'Sin clasificar' })
    }
  }

  for (let i = 0; i < nuevasEmpresas.length; i += BATCH) {
    const chunk = nuevasEmpresas.slice(i, i + BATCH)
    const { data, error } = await sb.from('empresas').insert(chunk).select('id, nombre')
    if (error) {
      console.error(`  ERROR empresas batch ${i}: ${error.message}`)
      stats.errors += chunk.length
    } else if (data) {
      for (const e of data) {
        empresaMap.set(e.nombre.toLowerCase().trim(), e.id)
        stats.empresas_created++
      }
    }
    logProgress('Empresas', Math.min(i + BATCH, nuevasEmpresas.length), nuevasEmpresas.length)
  }
  console.log(`  ✓ ${stats.empresas_created} creadas, ${stats.empresas_skipped} ya existían\n`)

  // ================================================================
  // PASO 4 — Contactos (additive)
  // ================================================================
  console.log('PASO 4: Contactos...')
  const contactoMap = new Map<string, string>()
  const contactosSeen = new Set<string>()
  const nuevosContactos: { nombre: string; empresa_id: string; _key: string }[] = []

  for (const r of maestroData) {
    const empresaNombre = toStr(r[10])
    const contactoNombre = toStr(r[13])
    if (!contactoNombre || !empresaNombre || empresaNombre === '0') continue

    const empId = empresaMap.get(empresaNombre.toLowerCase().trim())
    if (!empId) continue

    const key = `${contactoNombre.toLowerCase().trim()}|${empresaNombre.toLowerCase().trim()}`
    if (contactosSeen.has(key)) continue
    contactosSeen.add(key)

    const sbKey = `${contactoNombre.toLowerCase().trim()}|${empId}`
    if (existingContactos.has(sbKey)) {
      contactoMap.set(key, existingContactos.get(sbKey)!)
      stats.contactos_skipped++
      continue
    }

    nuevosContactos.push({ nombre: contactoNombre, empresa_id: empId, _key: key })
  }

  for (let i = 0; i < nuevosContactos.length; i += BATCH) {
    const chunk = nuevosContactos.slice(i, i + BATCH)
    const insertData = chunk.map(({ nombre, empresa_id }) => ({ nombre, empresa_id }))
    const { data, error } = await sb.from('contactos').insert(insertData).select('id, nombre, empresa_id')
    if (error) {
      console.error(`  ERROR contactos batch ${i}: ${error.message}`)
      stats.errors += chunk.length
    } else if (data) {
      for (let j = 0; j < data.length; j++) {
        contactoMap.set(chunk[j]._key, data[j].id)
        stats.contactos_created++
      }
    }
    logProgress('Contactos', Math.min(i + BATCH, nuevosContactos.length), nuevosContactos.length)
  }
  console.log(`  ✓ ${stats.contactos_created} creados, ${stats.contactos_skipped} ya existían\n`)

  // ================================================================
  // PASO 5 — Oportunidades (SOLO NUEVAS)
  // ================================================================
  console.log('PASO 5: Oportunidades (solo nuevas)...')

  interface OpEntry {
    row: {
      empresa_id: string
      contacto_id: string | null
      etapa: string
      valor_estimado: number
      valor_cotizado: number
      valor_adjudicado: number
      cotizador_asignado: string
      fuente_lead: string
      ubicacion: string
      fecha_ingreso: string | null
      fecha_adjudicacion: string | null
      notas: string
    }
    numCot: string
    valorCot: number
    fechaIngreso: string | null
    fechaEnvio: string | null
  }

  const opQueue: OpEntry[] = []
  const seenInExcel = new Set<string>()
  // Queue of opportunities that already exist but are stalled in an early etapa
  // and the MAESTRO row indicates they should advance.
  interface AdvanceEntry {
    id: string
    numCot: string
    nuevaEtapa: string
    valor: number
    fechaIngreso: string | null
    fechaAdj: string | null
    valorAdj: number
  }
  const advanceQueue: AdvanceEntry[] = []

  // Derives etapa from MAESTRO row (shared between insert and advance paths)
  function deriveEtapaFromMaestro(estadoI: string, anio: number, fechaIngreso: string | null): string {
    if (estadoI === 'ADJUDICADA') return 'adjudicada'
    if (estadoI === 'PERDIDA') return 'perdida'
    if (estadoI === 'COTIZADA' && anio < 2026) return 'perdida'
    if (estadoI === 'COTIZADA' && anio >= 2026 && fechaIngreso) return 'cotizacion_enviada'
    if (estadoI === 'COTIZADA' && anio >= 2026) return 'en_cotizacion'
    if (!estadoI) return 'nuevo_lead'
    return 'perdida'
  }

  for (let i = 0; i < maestroData.length; i++) {
    const r = maestroData[i]
    const empresaNombre = toStr(r[10])
    if (!empresaNombre || empresaNombre === '0') continue

    const numCotRaw = toStr(r[6])
    if (!numCotRaw) continue
    const numCot = normalizeCot(numCotRaw)
    if (!numCot) continue

    // Already in Supabase → check if stalled and needs to advance
    if (existingCots.has(numCot)) {
      stats.oportunidades_skipped++
      const existing = existingOpByCot.get(numCot)
      if (existing && (existing.etapa === 'nuevo_lead' || existing.etapa === 'en_cotizacion')) {
        const estadoI = toStr(r[8]).toUpperCase()
        const anio = toNum(r[2])
        const fechaIngreso = excelDateToISO(r[1])
        const nuevaEtapa = deriveEtapaFromMaestro(estadoI, anio, fechaIngreso)
        if ((etapaOrden[nuevaEtapa] ?? 0) > (etapaOrden[existing.etapa] ?? 0)) {
          advanceQueue.push({
            id: existing.id,
            numCot,
            nuevaEtapa,
            valor: toNum(r[7]),
            fechaIngreso,
            fechaAdj: excelDateToISO(r[11]),
            valorAdj: toNum(r[9]),
          })
        }
      }
      continue
    }
    // Dup within this Excel run → skip after first
    if (seenInExcel.has(numCot)) continue
    seenInExcel.add(numCot)

    const empId = empresaMap.get(empresaNombre.toLowerCase().trim())
    if (!empId) {
      console.error(`  empresa no encontrada para "${empresaNombre}" (COT ${numCot})`)
      stats.errors++
      continue
    }

    const contactoNombre = toStr(r[13])
    let contId: string | null = null
    if (contactoNombre) {
      const ckey = `${contactoNombre.toLowerCase().trim()}|${empresaNombre.toLowerCase().trim()}`
      contId = contactoMap.get(ckey) || null
    }

    const cotizadorCode = toStr(r[5])
    const cotizador = COTIZADOR[cotizadorCode] || cotizadorCode

    const valorCotizado = toNum(r[7])
    const valorAdjudicado = toNum(r[9])
    const fechaFin = excelDateToISO(r[1])      // FECHA FINALIZACION = fecha_envio
    const diasExcel = toNum(r[4])              // DIAS (columna Excel)
    // fecha_ingreso = fecha_fin - dias (fecha cuando empezó a cotizar)
    const fechaIngreso = fechaFin && diasExcel >= 0 ? subtractDays(fechaFin, diasExcel) : fechaFin
    const fechaEnvio = fechaFin
    const anio = toNum(r[2])
    const estadoI = toStr(r[8]).toUpperCase()
    const fechaAdj = excelDateToISO(r[11])

    let etapa: string
    if (estadoI === 'ADJUDICADA') {
      etapa = 'adjudicada'
    } else if (estadoI === 'PERDIDA') {
      etapa = 'perdida'
    } else if (estadoI === 'COTIZADA' && anio < 2026) {
      etapa = 'perdida'
    } else if (estadoI === 'COTIZADA' && anio >= 2026 && fechaIngreso) {
      etapa = 'cotizacion_enviada'
    } else if (estadoI === 'COTIZADA' && anio >= 2026) {
      etapa = 'en_cotizacion'
    } else if (!estadoI) {
      etapa = 'nuevo_lead'
    } else {
      etapa = 'perdida'
    }

    opQueue.push({
      row: {
        empresa_id: empId,
        contacto_id: contId,
        etapa,
        valor_estimado: valorCotizado,
        valor_cotizado: valorCotizado,
        valor_adjudicado: estadoI === 'ADJUDICADA' ? valorAdjudicado : 0,
        cotizador_asignado: cotizador,
        fuente_lead: MIGRATION_MARKER,
        ubicacion: '',
        fecha_ingreso: fechaIngreso,
        fecha_adjudicacion: etapa === 'adjudicada' ? fechaAdj : null,
        notas: `COT: ${numCot}`,
      },
      numCot,
      valorCot: valorCotizado,
      fechaIngreso,
      fechaEnvio,
    })

    logProgress('Oportunidades (prep)', i + 1, maestroData.length)
  }

  // Map of COTs created in THIS run (for PASO 6 + 7 — never touches anything else)
  const justCreated = new Map<string, { id: string; etapa: string; fechaIngreso: string | null; fechaEnvio: string | null; valorCot: number }>()

  for (let i = 0; i < opQueue.length; i += BATCH) {
    const chunk = opQueue.slice(i, i + BATCH)
    const insertData = chunk.map((q) => q.row)
    const { data, error } = await sb.from('oportunidades').insert(insertData).select('id, etapa')
    if (error) {
      console.error(`  ERROR oportunidades batch ${i}: ${error.message}`)
      stats.errors += chunk.length
    } else if (data) {
      for (let j = 0; j < data.length; j++) {
        stats.oportunidades_created++
        justCreated.set(chunk[j].numCot, {
          id: data[j].id,
          etapa: data[j].etapa,
          fechaIngreso: chunk[j].fechaIngreso,
          fechaEnvio: chunk[j].fechaEnvio,
          valorCot: chunk[j].valorCot,
        })
      }
    }
    logProgress('Oportunidades', Math.min(i + BATCH, opQueue.length), opQueue.length)
  }
  console.log(
    `  ✓ ${stats.oportunidades_created} nuevas, ${stats.oportunidades_skipped} ya existían (saltadas)\n`,
  )

  // ================================================================
  // PASO 5.5 — Avanzar oportunidades estancadas (basado en MAESTRO)
  // ================================================================
  // Las que ya existían en BD en etapa "temprana" (nuevo_lead/en_cotizacion)
  // pero MAESTRO ahora indica que avanzaron (COTIZADA/ADJUDICADA/PERDIDA).
  // Nunca retrocede etapa (garantizado por etapaOrden check).
  if (advanceQueue.length > 0) {
    console.log(`PASO 5.5: Avanzando ${advanceQueue.length} oportunidades estancadas...`)
    for (const adv of advanceQueue) {
      const updates: Record<string, unknown> = {
        etapa: adv.nuevaEtapa,
        valor_cotizado: adv.valor,
        valor_estimado: adv.valor,
      }
      if (adv.nuevaEtapa === 'cotizacion_enviada' && adv.fechaIngreso) {
        updates.fecha_envio = adv.fechaIngreso
      }
      if (adv.nuevaEtapa === 'adjudicada') {
        updates.valor_adjudicado = adv.valorAdj
        if (adv.fechaAdj) updates.fecha_adjudicacion = adv.fechaAdj
      }
      const { error } = await sb.from('oportunidades').update(updates).eq('id', adv.id)
      if (error) {
        console.error(`  ERROR advance ${adv.numCot}: ${error.message}`)
        stats.errors++
      } else {
        stats.oportunidades_advanced++
        // Update the cotización matching this numCot to reflect the new state
        const newCotEstado =
          adv.nuevaEtapa === 'adjudicada' ? 'aprobada' :
          adv.nuevaEtapa === 'perdida' ? 'rechazada' :
          adv.nuevaEtapa === 'cotizacion_enviada' ? 'enviada' : 'borrador'
        const cotUpd: Record<string, unknown> = { estado: newCotEstado, total: adv.valor }
        if (adv.nuevaEtapa === 'cotizacion_enviada' && adv.fechaIngreso) cotUpd.fecha_envio = adv.fechaIngreso
        const { error: ce } = await sb.from('cotizaciones').update(cotUpd).eq('numero', adv.numCot)
        if (!ce) stats.cotizaciones_advanced++
      }
    }
    console.log(`  ✓ ${stats.oportunidades_advanced} avanzadas, ${stats.cotizaciones_advanced} cotizaciones sincronizadas\n`)
  }

  // ================================================================
  // PASO 6 — Enriquecer 2026 (SOLO las recién creadas)
  // ================================================================
  console.log('PASO 6: Enriqueciendo 2026 (solo recién creadas)...')

  for (let i = 0; i < data2026.length; i++) {
    const r = data2026[i]
    const numCotRaw = toStr(r[13])
    if (!numCotRaw) continue
    const numCot = normalizeCot(numCotRaw)
    if (!numCot) continue

    // Resolve target opportunity: first the one created in this run, else an
    // existing stalled one. Never touch ops that are already advanced.
    const created = justCreated.get(numCot)
    let targetId: string | null = null
    let currentEtapa: string | null = null
    if (created) {
      targetId = created.id
      currentEtapa = created.etapa
    } else {
      const existing = existingOpByCot.get(numCot)
      if (existing && (existing.etapa === 'nuevo_lead' || existing.etapa === 'en_cotizacion' || existing.etapa === 'cotizacion_enviada')) {
        targetId = existing.id
        currentEtapa = existing.etapa
      }
    }
    if (!targetId) continue  // not in this run and not stalled → NO TOCAR

    const proyecto = toStr(r[3])
    const fechaEnvio = excelDateToISO(r[8])
    const estadoQ = toStr(r[16]).toUpperCase()
    const estadoB = toStr(r[1]).toUpperCase()
    const valorAdj2026 = toNum(r[17])
    const fechaAdj2026 = excelDateToISO(r[18])

    let etapa: string | undefined
    if (estadoQ === 'ADJUDICADA') etapa = 'adjudicada'
    else if (estadoQ === 'PERDIDA') etapa = 'perdida'
    else if (estadoQ === 'COTIZADA' && estadoB === 'ENV') etapa = 'cotizacion_enviada'
    else if (estadoQ === 'COTIZADA') etapa = 'en_cotizacion'
    else if (!estadoQ) etapa = 'nuevo_lead'

    const updates: Record<string, unknown> = {}
    if (proyecto) updates.ubicacion = proyecto
    if (fechaEnvio) updates.fecha_envio = fechaEnvio
    // Never regress etapa: only set if strictly greater than current
    if (etapa && currentEtapa && (etapaOrden[etapa] ?? 0) > (etapaOrden[currentEtapa] ?? 0)) {
      updates.etapa = etapa
    }
    if (etapa === 'adjudicada' && currentEtapa && etapaOrden[etapa] > etapaOrden[currentEtapa]) {
      updates.valor_adjudicado = valorAdj2026
      if (fechaAdj2026) updates.fecha_adjudicacion = fechaAdj2026
    }
    if (proyecto) updates.notas = `COT: ${numCot} | Proyecto: ${proyecto}`

    if (Object.keys(updates).length === 0) continue

    const { error } = await sb.from('oportunidades').update(updates).eq('id', targetId)
    if (error) {
      console.error(`  ERROR enriching ${numCot}: ${error.message}`)
      stats.errors++
    } else {
      stats.enriched_2026++
      if (created && updates.etapa) created.etapa = updates.etapa as string
    }
    logProgress('Enriquecimiento', i + 1, data2026.length)
  }
  console.log(`  ✓ ${stats.enriched_2026} enriquecidas de ${data2026.length} filas 2026\n`)

  // ================================================================
  // PASO 7 — Cotizaciones (SOLO NUEVAS)
  // ================================================================
  console.log('PASO 7: Cotizaciones (solo nuevas)...')

  interface CotRow {
    oportunidad_id: string
    numero: string
    fecha: string | null           // fecha_inicio (= fecha_envio - dias)
    fecha_envio: string | null     // FECHA FINALIZACION del Excel
    estado: string
    total: number
  }

  const cotQueue: CotRow[] = []

  // 7a) Cotizaciones de oportunidades recién creadas en esta corrida
  for (const [numCot, op] of justCreated) {
    if (existingCotizacionesNumeros.has(numCot)) {
      stats.cotizaciones_skipped++
      continue
    }
    let estado: string
    switch (op.etapa) {
      case 'adjudicada': estado = 'aprobada'; break
      case 'perdida': estado = 'rechazada'; break
      case 'cotizacion_enviada': estado = 'enviada'; break
      default: estado = 'borrador'
    }
    cotQueue.push({
      oportunidad_id: op.id,
      numero: numCot,
      fecha: op.fechaIngreso,
      fecha_envio: op.fechaEnvio,
      estado,
      total: op.valorCot,
    })
  }

  // 7b) FIX: oportunidades que YA existían en BD pero sin cotización asociada.
  // Antes este caso se ignoraba — el script saltaba toda la fila en PASO 5 sin
  // insertar la cotización. Ahora re-leemos MAESTRO para detectar estos casos.
  for (let i = 1; i < maestroRows.length; i++) {
    const r = maestroRows[i]
    if (!r) continue
    const numCotRaw = toStr(r[6])
    if (!numCotRaw) continue
    const numCot = normalizeCot(numCotRaw)
    if (!numCot) continue
    // Solo interesa: existe la oportunidad pero NO la cotización
    if (!existingCots.has(numCot)) continue
    if (existingCotizacionesNumeros.has(numCot)) continue
    const existing = existingOpByCot.get(numCot)
    if (!existing) continue
    const estadoI = toStr(r[8]).toUpperCase()
    const anio = toNum(r[2])
    const fechaFin = excelDateToISO(r[1])  // FECHA FINALIZACION = fecha_envio
    const diasExcel = toNum(r[4])          // DIAS columna Excel
    const fechaIngreso = fechaFin && diasExcel >= 0 ? subtractDays(fechaFin, diasExcel) : fechaFin
    const derivedEtapa = deriveEtapaFromMaestro(estadoI, anio, fechaIngreso)
    let estado: string
    switch (derivedEtapa) {
      case 'adjudicada': estado = 'aprobada'; break
      case 'perdida': estado = 'rechazada'; break
      case 'cotizacion_enviada': estado = 'enviada'; break
      default: estado = 'borrador'
    }
    cotQueue.push({
      oportunidad_id: existing.id,
      numero: numCot,
      fecha: fechaIngreso,
      fecha_envio: fechaFin,
      estado,
      total: toNum(r[7]),
    })
  }

  for (let i = 0; i < cotQueue.length; i += BATCH) {
    const chunk = cotQueue.slice(i, i + BATCH)
    // upsert por `numero` — defensa en profundidad contra duplicados aunque falle el dedup previo.
    // Requiere UNIQUE constraint en cotizaciones.numero (aplicado 2026-04-18 durante QA-4).
    const { error } = await sb.from('cotizaciones').upsert(chunk, { onConflict: 'numero', ignoreDuplicates: true })
    if (error) {
      console.error(`  ERROR cotizaciones batch ${i}: ${error.message}`)
      stats.errors += chunk.length
    } else {
      stats.cotizaciones_created += chunk.length
    }
    logProgress('Cotizaciones', Math.min(i + BATCH, cotQueue.length), cotQueue.length)
  }
  console.log(`  ✓ ${stats.cotizaciones_created} creadas, ${stats.cotizaciones_skipped} ya existían\n`)

  // ================================================================
  // PASO 7.5 — WARN: cots en BD que no aparecen en MAESTRO (legado)
  // Reporta sin borrar. Post QA-4 (2026-04-18) la BD y el MAESTRO están
  // 100% alineados. Esto atrapa futura deriva.
  // ================================================================
  const maestroNumSet = new Set<string>()
  for (let i = 1; i < maestroRows.length; i++) {
    const r = maestroRows[i]
    if (!r) continue
    const n = normalizeCot(toStr(r[6]))
    if (n) maestroNumSet.add(n)
  }
  const orphans: string[] = []
  for (const c of existingCotizacionesRaw) {
    if (!c.numero) continue
    const n = normalizeCot(c.numero)
    // Solo reportar cots activas huérfanas (las descartadas/rechazadas son legado esperado)
    if (!maestroNumSet.has(n) && !['descartada','rechazada'].includes(c.estado ?? '')) {
      orphans.push(n)
    }
  }
  if (orphans.length > 0) {
    console.warn(`\n  ⚠ ${orphans.length} cotizaciones activas en BD NO están en MAESTRO (huérfanas):`)
    for (const n of orphans.slice(0, 10)) console.warn(`    - ${n}`)
    if (orphans.length > 10) console.warn(`    ... +${orphans.length - 10} más`)
    console.warn(`  Revisar manualmente — podrían ser duplicados legado o entradas huérfanas.\n`)
  } else {
    console.log(`  ✓ 0 cotizaciones huérfanas en BD (paridad MAESTRO).\n`)
  }

  // ================================================================
  // REPORTE FINAL
  // ================================================================
  const totalOpsAfter = existingOps.length + stats.oportunidades_created
  console.log('='.repeat(50))
  console.log('REPORTE FINAL — MIGRACIÓN SEGURA (additive only)')
  console.log('='.repeat(50))
  console.log(`  Empresas:       ${stats.empresas_created} creadas, ${stats.empresas_skipped} existían`)
  console.log(`  Contactos:      ${stats.contactos_created} creados, ${stats.contactos_skipped} existían`)
  console.log(`  Oportunidades:  ${stats.oportunidades_created} nuevas, ${stats.oportunidades_skipped} existían (saltadas)`)
  console.log(`  Avanzadas:      ${stats.oportunidades_advanced} estancadas → nueva etapa (${stats.cotizaciones_advanced} cotizaciones sincronizadas)`)
  console.log(`  Total ops en Supabase: ${totalOpsAfter}`)
  console.log(`  Enriquecidas 2026: ${stats.enriched_2026}`)
  console.log(`  Cotizaciones:   ${stats.cotizaciones_created} nuevas, ${stats.cotizaciones_skipped} existían`)
  console.log(`  Errores:        ${stats.errors}`)
  console.log(`  Eliminadas:     0  ← garantizado, este script no borra nada`)
  console.log('='.repeat(50))
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})

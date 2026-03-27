/**
 * migrar-historico.ts — ONE-TIME / RERUNNABLE migration script
 *
 * Reads REGISTRO_MAESTRO.xlsx (hoja TOTAL) and
 * REGISTRO COTIZACIONES DURATA 2026.xlsx (hoja REGISTRO 2026)
 * and inserts empresas, contactos, oportunidades and cotizaciones into Supabase.
 *
 * Idempotent: on each run, deletes all migration-created oportunidades
 * (identified by fuente_lead='Histórico Excel') and re-inserts from Excel.
 * Empresas and contactos are additive (skip if exists).
 *
 * Usage:  npm run migrate
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'

// ── Config ────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const BATCH = 50
const MIGRATION_MARKER = 'Histórico Excel' // fuente_lead for all migrated oportunidades

const MAESTRO_PATH = resolve(__dirname, 'data/REGISTRO_MAESTRO.xlsx')
const COT2026_PATH = resolve(__dirname, 'data/REGISTRO COTIZACIONES DURATA 2026.xlsx')

// Read env
const envText = readFileSync(resolve(__dirname, '../.env'), 'utf-8')
const env: Record<string, string> = {}
for (const line of envText.split('\n')) {
  const m = line.match(/^([^=]+)=(.*)$/)
  if (m) env[m[1].trim()] = m[2].trim()
}

const SUPABASE_URL = env['VITE_SUPABASE_URL']
const SUPABASE_KEY = env['VITE_SUPABASE_ANON_KEY']
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── Auth: sign in to pass RLS policies ──────────────────────────
const AUTH_EMAIL = env['MIGRATION_AUTH_EMAIL'] || 'saguirre@durata.co'
const AUTH_PASS = env['MIGRATION_AUTH_PASS'] || 'Durata2026!'

// ── Cotizador map ─────────────────────────────────────────────────
// Map Excel initials → app COTIZADORES id (used in cotizador_asignado)
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

// Counters
const stats = {
  empresas_created: 0,
  empresas_skipped: 0,
  contactos_created: 0,
  contactos_skipped: 0,
  oportunidades_deleted: 0,
  oportunidades_created: 0,
  cotizaciones_created: 0,
  enriched_2026: 0,
  errors: 0,
}

function logProgress(label: string, current: number, total: number) {
  if (current % 100 === 0 || current === total) {
    console.log(`  ${label}: ${current}/${total}...`)
  }
}

/** Paginated fetch — always uses .order('id') for consistent pagination */
async function fetchAll<T>(
  table: string,
  columns: string,
  filter?: { column: string; value: string },
): Promise<T[]> {
  const PAGE = 1000
  const all: T[] = []
  let from = 0
  while (true) {
    let q = sb.from(table).select(columns).order('id').range(from, from + PAGE - 1)
    if (filter) q = q.eq(filter.column, filter.value)
    const { data, error } = await q
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
  console.log('=== MIGRAR HISTÓRICO — DURATA CRM ===\n')

  // Authenticate to pass RLS
  const { error: authErr } = await sb.auth.signInWithPassword({ email: AUTH_EMAIL, password: AUTH_PASS })
  if (authErr) {
    console.error('Auth failed:', authErr.message)
    process.exit(1)
  }
  console.log(`Autenticado como ${AUTH_EMAIL}\n`)

  // ── PASO 0: Clean slate — delete all migration-created oportunidades
  // Cotizaciones linked to them CASCADE delete automatically
  console.log('PASO 0: Limpiando datos de migraciones anteriores...')
  {
    // Fetch IDs of all migration oportunidades
    const migOps = await fetchAll<{ id: string }>(
      'oportunidades', 'id',
      { column: 'fuente_lead', value: MIGRATION_MARKER },
    )
    console.log(`  ${migOps.length} oportunidades de migración encontradas`)

    if (migOps.length > 0) {
      for (let i = 0; i < migOps.length; i += BATCH) {
        const chunk = migOps.slice(i, i + BATCH)
        const ids = chunk.map(o => o.id)
        const { error } = await sb.from('oportunidades').delete().in('id', ids)
        if (error) {
          console.error(`  ERROR deleting batch ${i}: ${error.message}`)
          stats.errors += chunk.length
        } else {
          stats.oportunidades_deleted += chunk.length
        }
        logProgress('Eliminando', Math.min(i + BATCH, migOps.length), migOps.length)
      }
      console.log(`  ✓ ${stats.oportunidades_deleted} oportunidades eliminadas (cotizaciones CASCADE)`)
    } else {
      console.log('  ✓ Sin datos previos de migración')
    }

    // Also clean up any legacy migration ops that used 'Otro' as fuente_lead
    // (from earlier buggy runs that didn't use MIGRATION_MARKER)
    const legacyOps = await fetchAll<{ id: string; notas: string }>(
      'oportunidades', 'id, notas',
      { column: 'fuente_lead', value: 'Otro' },
    )
    const legacyCotOps = legacyOps.filter(o => String(o.notas || '').startsWith('COT:'))
    if (legacyCotOps.length > 0) {
      console.log(`  Limpiando ${legacyCotOps.length} oportunidades legacy (fuente_lead=Otro + COT:)...`)
      for (let i = 0; i < legacyCotOps.length; i += BATCH) {
        const chunk = legacyCotOps.slice(i, i + BATCH)
        const ids = chunk.map(o => o.id)
        const { error } = await sb.from('oportunidades').delete().in('id', ids)
        if (error) {
          console.error(`  ERROR deleting legacy batch ${i}: ${error.message}`)
          stats.errors += chunk.length
        } else {
          stats.oportunidades_deleted += chunk.length
        }
      }
      console.log(`  ✓ ${legacyCotOps.length} legacy eliminadas`)
    }
    console.log()
  }

  // ── Read REGISTRO_MAESTRO ──────────────────────────────────────
  console.log('Leyendo REGISTRO_MAESTRO.xlsx...')
  const wbMaestro = XLSX.readFile(MAESTRO_PATH)
  const wsTOTAL = wbMaestro.Sheets['TOTAL']
  if (!wsTOTAL) {
    console.error('No se encontró la hoja "TOTAL" en REGISTRO_MAESTRO.xlsx')
    process.exit(1)
  }
  const maestroRows: unknown[][] = XLSX.utils.sheet_to_json(wsTOTAL, { header: 1, defval: '' })
  const maestroData = maestroRows.slice(1).filter((r) => r.length > 0)
  console.log(`  ${maestroData.length} filas leídas de hoja TOTAL\n`)

  // ── Read REGISTRO 2026 ────────────────────────────────────────
  console.log('Leyendo REGISTRO COTIZACIONES DURATA 2026.xlsx...')
  const wb2026 = XLSX.readFile(COT2026_PATH)
  const ws2026 = wb2026.Sheets['REGISTRO 2026']
  if (!ws2026) {
    console.error('No se encontró la hoja "REGISTRO 2026"')
    process.exit(1)
  }
  const rows2026: unknown[][] = XLSX.utils.sheet_to_json(ws2026, { header: 1, defval: '' })
  const data2026 = rows2026.slice(5).filter((r) => r.length > 0)
  console.log(`  ${data2026.length} filas leídas de hoja REGISTRO 2026\n`)

  // ================================================================
  // PASO 1 — Empresas únicas (additive, skip existing)
  // ================================================================
  console.log('PASO 1: Creando empresas...')

  const empresaNombres = new Set<string>()
  for (const r of maestroData) {
    const k = toStr(r[10])
    if (k && k !== '0') empresaNombres.add(k)
  }
  console.log(`  ${empresaNombres.size} nombres únicos de empresa encontrados`)

  const existingEmpresas = await fetchAll<{ id: string; nombre: string }>('empresas', 'id, nombre')
  const empresaMap = new Map<string, string>()
  for (const e of existingEmpresas) empresaMap.set(e.nombre.toLowerCase().trim(), e.id)
  console.log(`  ${existingEmpresas.length} empresas ya existentes en Supabase`)

  const nuevasEmpresas: { nombre: string; sector: string }[] = []
  for (const nombre of empresaNombres) {
    if (!empresaMap.has(nombre.toLowerCase().trim())) {
      nuevasEmpresas.push({ nombre, sector: 'Sin clasificar' })
    } else {
      stats.empresas_skipped++
    }
  }

  if (nuevasEmpresas.length > 0) {
    console.log(`  Insertando ${nuevasEmpresas.length} empresas nuevas...`)
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
  }
  console.log(`  ✓ Empresas: ${stats.empresas_created} creadas, ${stats.empresas_skipped} ya existían\n`)

  // ================================================================
  // PASO 2 — Contactos (additive, skip existing)
  // ================================================================
  console.log('PASO 2: Creando contactos...')

  const existingContactosRaw = await fetchAll<{ id: string; nombre: string; empresa_id: string }>(
    'contactos', 'id, nombre, empresa_id',
  )
  const existingContactos = new Map<string, string>()
  for (const c of existingContactosRaw) {
    existingContactos.set(`${c.nombre.toLowerCase().trim()}|${c.empresa_id}`, c.id)
  }

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

  if (nuevosContactos.length > 0) {
    console.log(`  Insertando ${nuevosContactos.length} contactos nuevos...`)
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
  }
  console.log(`  ✓ Contactos: ${stats.contactos_created} creados, ${stats.contactos_skipped} ya existían\n`)

  // ================================================================
  // PASO 3 — Oportunidades (from REGISTRO_MAESTRO) — fresh insert
  // ================================================================
  console.log('PASO 3: Creando oportunidades...')

  // Build a map from numCot → array of oportunidad rows
  // (same numCot can appear for different empresas, e.g. bare years "2021")
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
    empresaId: string
  }

  const opQueue: OpEntry[] = []
  const seenKeys = new Set<string>() // Prevent in-Excel dups: numCot||empresa_id

  for (let i = 0; i < maestroData.length; i++) {
    const r = maestroData[i]
    const empresaNombre = toStr(r[10])
    if (!empresaNombre || empresaNombre === '0') continue

    const numCot = toStr(r[6])
    if (!numCot) continue

    const empId = empresaMap.get(empresaNombre.toLowerCase().trim())
    if (!empId) { stats.errors++; continue }

    // Deduplicate within Excel (same COT + same empresa = skip)
    const key = `${numCot}||${empId}`
    if (seenKeys.has(key)) continue
    seenKeys.add(key)

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
    const fechaIngreso = excelDateToISO(r[1])
    const anio = toNum(r[2])
    const estadoI = toStr(r[8]).toUpperCase()
    const fechaAdj = excelDateToISO(r[11])

    let etapa: string
    if (estadoI === 'ADJUDICADA') {
      etapa = 'adjudicada'
    } else if (estadoI === 'COTIZADA' && anio < 2026) {
      etapa = 'perdida' // old cotizaciones without adjudication assumed lost
    } else if (estadoI === 'COTIZADA' && anio >= 2026) {
      etapa = 'cotizacion_enviada'
    } else if (anio >= 2026 && (!estadoI || estadoI === '')) {
      etapa = 'nuevo_lead' // 2026+ without status → pending
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
        valor_adjudicado: valorAdjudicado,
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
      empresaId: empId,
    })

    logProgress('Oportunidades (prep)', i + 1, maestroData.length)
  }

  console.log(`  ${opQueue.length} oportunidades a insertar (${5197 - opQueue.length} filtradas/dedup)`)

  // opResults: we need to track by composite key since numCot alone isn't unique
  // For cotizaciones (step 5), we'll use numCot → first oportunidad
  const opByNumCot = new Map<string, { id: string; etapa: string; fechaIngreso: string | null; valorCot: number }>()
  // For enrichment (step 4), we use numCot → id (only standard format COTs)
  const opIdByNumCot = new Map<string, string>()

  if (opQueue.length > 0) {
    console.log(`  Insertando ${opQueue.length} oportunidades...`)
    for (let i = 0; i < opQueue.length; i += BATCH) {
      const chunk = opQueue.slice(i, i + BATCH)
      const insertData = chunk.map((q) => q.row)
      const { data, error } = await sb.from('oportunidades').insert(insertData).select('id, notas, etapa')
      if (error) {
        console.error(`  ERROR oportunidades batch ${i}: ${error.message}`)
        stats.errors += chunk.length
      } else if (data) {
        for (let j = 0; j < data.length; j++) {
          const nc = chunk[j].numCot
          stats.oportunidades_created++
          // For cotizaciones: store first occurrence per numCot
          if (!opByNumCot.has(nc)) {
            opByNumCot.set(nc, {
              id: data[j].id,
              etapa: data[j].etapa,
              fechaIngreso: chunk[j].fechaIngreso,
              valorCot: chunk[j].valorCot,
            })
          }
          // For enrichment: store id by numCot (standard format only)
          if (nc.includes('-')) {
            opIdByNumCot.set(nc, data[j].id)
          }
        }
      }
      logProgress('Oportunidades', Math.min(i + BATCH, opQueue.length), opQueue.length)
    }
  }
  console.log(`  ✓ Oportunidades: ${stats.oportunidades_created} creadas\n`)

  // ================================================================
  // PASO 4 — Enriquecer 2026 con REGISTRO 2026
  // ================================================================
  console.log('PASO 4: Enriqueciendo oportunidades 2026...')

  for (let i = 0; i < data2026.length; i++) {
    const r = data2026[i]
    const numCot = toStr(r[13])
    if (!numCot || !numCot.includes('-')) continue

    const opId = opIdByNumCot.get(numCot)
    if (!opId) continue

    const proyecto = toStr(r[3])
    const fechaEnvio = excelDateToISO(r[8])
    const estadoQ = toStr(r[16]).toUpperCase()
    const estadoB = toStr(r[1]).toUpperCase()
    const valorAdj2026 = toNum(r[17])
    const fechaAdj2026 = excelDateToISO(r[18])

    let etapa: string | undefined
    if (estadoQ === 'ADJUDICADA') {
      etapa = 'adjudicada'
    } else if (estadoQ === 'PERDIDA') {
      etapa = 'perdida'
    } else if (estadoQ === 'COTIZADA' && estadoB === 'ENV') {
      etapa = 'cotizacion_enviada'
    } else if (estadoQ === 'COTIZADA') {
      etapa = 'en_cotizacion'
    } else if (!estadoQ || estadoQ === '') {
      // No status in Excel → pending, not yet quoted
      etapa = 'nuevo_lead'
    }

    const updates: Record<string, unknown> = {}
    if (proyecto) updates.ubicacion = proyecto
    if (fechaEnvio) updates.fecha_envio = fechaEnvio
    if (etapa) updates.etapa = etapa
    if (etapa === 'adjudicada') {
      updates.valor_adjudicado = valorAdj2026
      if (fechaAdj2026) updates.fecha_adjudicacion = fechaAdj2026
    }
    if (proyecto) {
      // Since we just created these, notas is "COT: XXXX"
      updates.notas = `COT: ${numCot} | Proyecto: ${proyecto}`
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await sb.from('oportunidades').update(updates).eq('id', opId)
      if (error) {
        console.error(`  ERROR enriching ${numCot}: ${error.message}`)
        stats.errors++
      } else {
        stats.enriched_2026++
        // Update local state for cotización mapping
        const local = opByNumCot.get(numCot)
        if (local && etapa) local.etapa = etapa
      }
    }

    logProgress('Enriquecimiento 2026', i + 1, data2026.length)
  }
  console.log(`  ✓ Enriquecidas: ${stats.enriched_2026} oportunidades actualizadas\n`)

  // ================================================================
  // PASO 5 — Cotizaciones (one per unique numCot)
  // ================================================================
  console.log('PASO 5: Creando cotizaciones...')

  interface CotRow {
    oportunidad_id: string
    numero: string
    fecha: string | null
    estado: string
    total: number
  }

  const cotQueue: CotRow[] = []

  for (const [numCot, op] of opByNumCot) {
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
      estado,
      total: op.valorCot,
    })
  }

  if (cotQueue.length > 0) {
    console.log(`  Insertando ${cotQueue.length} cotizaciones...`)
    for (let i = 0; i < cotQueue.length; i += BATCH) {
      const chunk = cotQueue.slice(i, i + BATCH)
      const { error } = await sb.from('cotizaciones').insert(chunk)
      if (error) {
        console.error(`  ERROR cotizaciones batch ${i}: ${error.message}`)
        stats.errors += chunk.length
      } else {
        stats.cotizaciones_created += chunk.length
      }
      logProgress('Cotizaciones', Math.min(i + BATCH, cotQueue.length), cotQueue.length)
    }
  }
  console.log(`  ✓ Cotizaciones: ${stats.cotizaciones_created} creadas\n`)

  // ================================================================
  // REPORTE FINAL
  // ================================================================
  console.log('='.repeat(50))
  console.log('REPORTE FINAL')
  console.log('='.repeat(50))
  console.log(`  Eliminadas prev: ${stats.oportunidades_deleted} oportunidades + cotizaciones CASCADE`)
  console.log(`  Empresas:        ${stats.empresas_created} creadas, ${stats.empresas_skipped} ya existían`)
  console.log(`  Contactos:       ${stats.contactos_created} creados, ${stats.contactos_skipped} ya existían`)
  console.log(`  Oportunidades:   ${stats.oportunidades_created} creadas`)
  console.log(`  Enriquecidas:    ${stats.enriched_2026} (2026)`)
  console.log(`  Cotizaciones:    ${stats.cotizaciones_created} creadas`)
  console.log(`  Errores:         ${stats.errors}`)
  console.log('='.repeat(50))
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})

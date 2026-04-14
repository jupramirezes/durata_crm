/**
 * corregir-fechas.ts — ONE-TIME date correction script
 *
 * The original migration stored FECHA_FINALIZACION (envío date) as fecha_ingreso
 * and left fecha_envio null. This script reads REGISTRO_MAESTRO.xlsx to correct:
 *   - fecha_envio = FECHA_FINALIZACION (col 2, index 1)
 *   - fecha_ingreso = FECHA_FINALIZACION - DIAS (col 5, index 4)
 *
 * Also fixes:
 *   - Normalizes "J.R " → "JPR" in cotizador_asignado
 *   - Sets etapa = 'en_cotizacion' for borrador cotizaciones without fecha_envio
 *
 * Usage: npx tsx scripts/corregir-fechas.ts
 */

import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseScriptConfig } from './lib/env'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const BATCH = 50

const MAESTRO_PATH = resolve(__dirname, 'data/REGISTRO_MAESTRO.xlsx')

const { url: SUPABASE_URL, anonKey: SUPABASE_KEY, authEmail: AUTH_EMAIL, authPass: AUTH_PASS } = getSupabaseScriptConfig()
const sb = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── Helpers ─────────────────────────────────────────────
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

function subtractDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + 'T12:00:00Z') // noon to avoid DST issues
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString().slice(0, 10)
}

/** Paginated fetch */
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
    if (error) { console.error(`  ERROR fetching ${table}: ${error.message}`); break }
    if (data) all.push(...(data as T[]))
    if (!data || data.length < PAGE) break
    from += PAGE
  }
  return all
}

// ── MAIN ────────────────────────────────────────────────
async function main() {
  console.log('=== CORREGIR FECHAS HISTÓRICAS — DURATA CRM ===\n')

  if (!AUTH_EMAIL || !AUTH_PASS) {
    console.error('Missing MIGRATION_AUTH_EMAIL or MIGRATION_AUTH_PASS in .env or process.env')
    process.exit(1)
  }

  // Authenticate to pass RLS
  const { error: authErr } = await sb.auth.signInWithPassword({ email: AUTH_EMAIL, password: AUTH_PASS })
  if (authErr) {
    console.error('Auth failed:', authErr.message)
    process.exit(1)
  }
  console.log(`Autenticado como ${AUTH_EMAIL}\n`)

  // ── PASO 1: Read Excel ──────────────────────────────
  console.log('PASO 1: Leyendo REGISTRO_MAESTRO.xlsx...')
  const wb = XLSX.readFile(MAESTRO_PATH)
  const ws = wb.Sheets['TOTAL']
  if (!ws) { console.error('No se encontró la hoja "TOTAL"'); process.exit(1) }
  const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
  const data = rows.slice(1).filter(r => r.length > 0)
  console.log(`  ${data.length} filas leídas\n`)

  // Build map: numCot → { fecha_envio, dias, fecha_ingreso }
  interface ExcelRow {
    numCot: string
    fechaEnvio: string | null  // FECHA_FINALIZACION = actual envío date
    dias: number               // DIAS column
    fechaIngreso: string | null // computed: fechaEnvio - dias
  }

  const excelMap = new Map<string, ExcelRow>()
  for (const r of data) {
    const numCot = toStr(r[6]) // col 7 (0-indexed = 6)
    if (!numCot) continue
    const fechaEnvio = excelDateToISO(r[1]) // col 2 (0-indexed = 1) = FECHA_FINALIZACION
    const dias = toNum(r[4])                 // col 5 (0-indexed = 4) = DIAS
    const fechaIngreso = fechaEnvio && dias > 0 ? subtractDays(fechaEnvio, dias) : fechaEnvio
    excelMap.set(numCot, { numCot, fechaEnvio, dias, fechaIngreso })
  }
  console.log(`  ${excelMap.size} cotizaciones únicas con datos de fecha\n`)

  // ── PASO 2: Fetch cotizaciones from Supabase to map numero → oportunidad_id ──
  console.log('PASO 2: Leyendo cotizaciones de Supabase...')
  const cotizaciones = await fetchAll<{ id: string; numero: string; oportunidad_id: string }>(
    'cotizaciones', 'id, numero, oportunidad_id'
  )
  console.log(`  ${cotizaciones.length} cotizaciones en Supabase`)

  // Map numero → oportunidad_id
  const cotToOp = new Map<string, string>()
  for (const c of cotizaciones) {
    cotToOp.set(c.numero, c.oportunidad_id)
  }

  // ── PASO 3: Match Excel rows to oportunidades and update dates ──
  console.log('\nPASO 3: Actualizando fechas en oportunidades...')

  let updated = 0
  let notFound = 0
  let noDate = 0
  let errors = 0

  // Collect updates to batch
  const updates: { opId: string; fecha_ingreso: string; fecha_envio: string }[] = []

  for (const [numCot, excelRow] of excelMap) {
    const opId = cotToOp.get(numCot)
    if (!opId) {
      notFound++
      continue
    }
    if (!excelRow.fechaEnvio) {
      noDate++
      continue
    }
    updates.push({
      opId,
      fecha_ingreso: excelRow.fechaIngreso!,
      fecha_envio: excelRow.fechaEnvio,
    })
  }

  console.log(`  ${updates.length} oportunidades a actualizar`)
  console.log(`  ${notFound} cotizaciones del Excel no encontradas en Supabase`)
  console.log(`  ${noDate} sin fecha en Excel`)

  // Execute updates in batches
  for (let i = 0; i < updates.length; i += BATCH) {
    const chunk = updates.slice(i, i + BATCH)
    // Supabase doesn't support bulk UPDATE with different values per row,
    // so we do individual updates (still batched for progress reporting)
    const promises = chunk.map(u =>
      sb.from('oportunidades')
        .update({ fecha_ingreso: u.fecha_ingreso, fecha_envio: u.fecha_envio })
        .eq('id', u.opId)
    )
    const results = await Promise.all(promises)
    for (const res of results) {
      if (res.error) {
        errors++
        if (errors <= 3) console.error(`  ERROR: ${res.error.message}`)
      } else {
        updated++
      }
    }
    if ((i + BATCH) % 200 === 0 || i + BATCH >= updates.length) {
      console.log(`  Progreso: ${Math.min(i + BATCH, updates.length)}/${updates.length}`)
    }
  }

  console.log(`\n  ✓ ${updated} oportunidades actualizadas`)
  if (errors > 0) console.log(`  ✗ ${errors} errores`)

  // ── PASO 4: Normalize "J.R " → "JPR" ──
  console.log('\nPASO 4: Normalizando cotizador "J.R " → "JPR"...')
  {
    const { data, error } = await sb.from('oportunidades')
      .update({ cotizador_asignado: 'JPR' })
      .eq('cotizador_asignado', 'J.R ')
    if (error) {
      console.error(`  ERROR: ${error.message}`)
    } else {
      console.log('  ✓ Normalizados (J.R  → JPR)')
    }
  }

  // Also normalize other variants that might exist
  const normalizations: [string, string][] = [
    ['O.C', 'OC'],
    ['S.A', 'SA'],
    ['J.R', 'JPR'],
    ['C.A', 'CA'],
    ['D.G', 'DG'],
  ]
  for (const [from, to] of normalizations) {
    const { error } = await sb.from('oportunidades')
      .update({ cotizador_asignado: to })
      .eq('cotizador_asignado', from)
    if (error) console.error(`  ERROR normalizing ${from}: ${error.message}`)
  }
  console.log('  ✓ Todas las variantes normalizadas')

  // ── PASO 5: Fix borrador/no-envio → en_cotizacion ──
  console.log('\nPASO 5: Corrigiendo etapa para cotizaciones sin envío...')
  {
    // Find oportunidades that are 'cotizacion_enviada' but have no fecha_envio
    // and are not adjudicada/perdida
    const { data: opsToFix, error: fetchErr } = await sb.from('oportunidades')
      .select('id')
      .eq('etapa', 'cotizacion_enviada')
      .is('fecha_envio', null)

    if (fetchErr) {
      console.error(`  ERROR fetching: ${fetchErr.message}`)
    } else if (opsToFix && opsToFix.length > 0) {
      console.log(`  ${opsToFix.length} oportunidades en 'cotizacion_enviada' sin fecha_envio`)
      const ids = opsToFix.map(o => o.id)
      for (let i = 0; i < ids.length; i += BATCH) {
        const chunk = ids.slice(i, i + BATCH)
        const { error } = await sb.from('oportunidades')
          .update({ etapa: 'en_cotizacion' })
          .in('id', chunk)
        if (error) console.error(`  ERROR: ${error.message}`)
      }
      console.log(`  ✓ ${opsToFix.length} oportunidades movidas a 'en_cotizacion'`)
    } else {
      console.log('  ✓ No hay oportunidades que corregir')
    }
  }

  // ── PASO 6: Verify ──
  console.log('\nPASO 6: Verificación...')
  {
    const { data: sample } = await sb.from('oportunidades')
      .select('id, fecha_ingreso, fecha_envio, cotizador_asignado')
      .not('fecha_envio', 'is', null)
      .limit(5)
    if (sample) {
      console.log('  Muestra de 5 oportunidades con fechas corregidas:')
      for (const o of sample) {
        const dias = o.fecha_envio && o.fecha_ingreso
          ? Math.floor((new Date(o.fecha_envio).getTime() - new Date(o.fecha_ingreso).getTime()) / 86400000)
          : '?'
        console.log(`    ${o.cotizador_asignado} | ingreso: ${o.fecha_ingreso} | envío: ${o.fecha_envio} | días: ${dias}`)
      }
    }

    // Check distinct cotizador_asignado values
    const { data: distinctCot } = await sb.from('oportunidades')
      .select('cotizador_asignado')
    if (distinctCot) {
      const unique = [...new Set(distinctCot.map(o => o.cotizador_asignado))].sort()
      console.log(`\n  DISTINCT cotizador_asignado: ${unique.join(', ')}`)
    }

    // Count by fecha_envio presence
    const { data: allOps } = await sb.from('oportunidades').select('fecha_envio, fecha_ingreso')
    if (allOps) {
      const withEnvio = allOps.filter(o => o.fecha_envio).length
      const withIngreso = allOps.filter(o => o.fecha_ingreso).length
      console.log(`\n  Total oportunidades: ${allOps.length}`)
      console.log(`  Con fecha_envio: ${withEnvio}`)
      console.log(`  Con fecha_ingreso: ${withIngreso}`)

      // Calculate average dias
      const diasArr: number[] = []
      for (const o of allOps) {
        if (o.fecha_envio && o.fecha_ingreso) {
          const diff = Math.floor((new Date(o.fecha_envio).getTime() - new Date(o.fecha_ingreso).getTime()) / 86400000)
          if (diff >= 0) diasArr.push(diff)
        }
      }
      const avg = diasArr.length > 0 ? diasArr.reduce((s, d) => s + d, 0) / diasArr.length : 0
      console.log(`  Promedio DÍAS (ingreso→envío): ${avg.toFixed(1)} (de ${diasArr.length} registros con ambas fechas)`)
    }
  }

  console.log('\n=== CORRECCIÓN COMPLETADA ===')
}

main().catch(err => {
  console.error('FATAL:', err)
  process.exit(1)
})

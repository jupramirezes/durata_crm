/**
 * Diagnóstico pre-migración.
 * Simula lo que haría `npm run migrate` sin insertar nada.
 * Lee los 2 Excels + estado actual de Supabase y reporta:
 *   - Filas inválidas en el Excel (sin empresa / sin COT / fechas raras)
 *   - COTs del Excel que YA existen en Supabase (se saltarían)
 *   - COTs del Excel que NO existen y se insertarían
 *   - COTs duplicados dentro del Excel mismo
 *   - 2026 sheet: cuántas pre-llenadas vs cuántas con data real
 *
 * No modifica Supabase ni los archivos Excel.
 */
import { readFileSync, existsSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import XLSX from 'xlsx'
import { resolve } from 'path'

// Load .env manually (avoid dotenv dependency)
if (existsSync(resolve('.env'))) {
  for (const raw of readFileSync('.env', 'utf-8').split('\n')) {
    const line = raw.replace(/\r$/, '').trim()
    if (!line || line.startsWith('#')) continue
    // Support both KEY=val and KEY: val
    const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*[:=]\s*(.*)$/)
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

const MAESTRO_PATH = resolve('scripts/data/REGISTRO_MAESTRO.xlsx')
const COT2026_PATH = resolve('scripts/data/REGISTRO COTIZACIONES DURATA 2026.xlsx')

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Faltan credenciales de Supabase en .env')
  process.exit(1)
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY)

// Auth (required — RLS blocks anon reads)
const AUTH_EMAIL = process.env.MIGRATION_AUTH_EMAIL
const AUTH_PASS = process.env.MIGRATION_AUTH_PASS
if (AUTH_EMAIL && AUTH_PASS) {
  const { error } = await sb.auth.signInWithPassword({ email: AUTH_EMAIL, password: AUTH_PASS })
  if (error) { console.error('Auth falló:', error.message); process.exit(1) }
  console.log(`Autenticado como ${AUTH_EMAIL}\n`)
} else {
  console.log('⚠ Sin credenciales MIGRATION_AUTH_* → RLS puede ocultar filas\n')
}

const norm = s => String(s || '').trim().replace(/\s*-\s*/g, '-')
const strOf = v => String(v == null ? '' : v).trim()
const numOf = v => { const n = Number(v); return isNaN(n) ? 0 : n }

// ── Read Excels ──────────────────────────────────────────────────
console.log('Leyendo Excels...')
const wbMaestro = XLSX.readFile(MAESTRO_PATH)
const wsTOTAL = wbMaestro.Sheets['TOTAL']
const maestroRows = XLSX.utils.sheet_to_json(wsTOTAL, { header: 1, defval: '' }).slice(1)

const wb2026 = XLSX.readFile(COT2026_PATH)
const ws2026 = wb2026.Sheets['REGISTRO 2026']
const rows2026 = XLSX.utils.sheet_to_json(ws2026, { header: 1, defval: '' }).slice(5)

console.log(`  MAESTRO:    ${maestroRows.length} filas`)
console.log(`  2026:       ${rows2026.length} filas\n`)

// ── Read Supabase state ─────────────────────────────────────────
console.log('Leyendo Supabase...')
async function fetchAll(table, cols) {
  const PAGE = 1000
  const all = []
  let from = 0
  while (true) {
    const { data, error } = await sb.from(table).select(cols).order('id').range(from, from + PAGE - 1)
    if (error) { console.error(`  ERROR ${table}: ${error.message}`); break }
    if (data) all.push(...data)
    if (!data || data.length < PAGE) break
    from += PAGE
  }
  return all
}

const existingOps = await fetchAll('oportunidades', 'id, notas')
const existingCots = new Set()
for (const op of existingOps) {
  const m = String(op.notas || '').match(/cot:\s*([^|]+?)(?:\s*\|.*)?$/is)
  if (m) existingCots.add(norm(m[1]))
}
const existingCotizaciones = await fetchAll('cotizaciones', 'id, numero')
const existingCotizacionesNumeros = new Set(existingCotizaciones.filter(c => c.numero).map(c => norm(c.numero)))

console.log(`  Oportunidades:   ${existingOps.length} (${existingCots.size} con COT en notas)`)
console.log(`  Cotizaciones:    ${existingCotizaciones.length}\n`)

// ── Analyze MAESTRO ─────────────────────────────────────────────
console.log('='.repeat(60))
console.log('MAESTRO (hoja TOTAL)')
console.log('='.repeat(60))

const stats = {
  total: maestroRows.length,
  sin_cot: 0,
  sin_empresa: [],
  cot_invalido: [],
  ya_existe_op: 0,
  ya_existe_cot: 0,
  se_insertaria: 0,
  dup_en_excel: new Map(),
}

const seenInExcel = new Map()

for (let i = 0; i < maestroRows.length; i++) {
  const r = maestroRows[i]
  if (!r || !r.length) continue

  const empresa = strOf(r[10])
  const cot = norm(strOf(r[6]))
  const valor = numOf(r[7])
  const estado = strOf(r[8]).toUpperCase()
  const cotizador = strOf(r[5])
  const fila = i + 2  // +1 por slice(1), +1 porque Excel es 1-indexed

  if (!cot) { stats.sin_cot++; continue }

  // Duplicados dentro del Excel
  if (seenInExcel.has(cot)) {
    if (!stats.dup_en_excel.has(cot)) {
      stats.dup_en_excel.set(cot, [seenInExcel.get(cot)])
    }
    stats.dup_en_excel.get(cot).push({ fila, empresa, valor, estado, cotizador })
    continue
  }
  seenInExcel.set(cot, { fila, empresa, valor, estado, cotizador })

  // Ya existe en Supabase?
  if (existingCots.has(cot)) { stats.ya_existe_op++; continue }

  // Sin empresa o empresa = "0"
  if (!empresa || empresa === '0') {
    stats.sin_empresa.push({ fila, cot, valor, estado, cotizador })
    continue
  }

  // Cotización también ya existe?
  if (existingCotizacionesNumeros.has(cot)) stats.ya_existe_cot++

  stats.se_insertaria++
}

console.log(`  Total filas MAESTRO:           ${stats.total}`)
console.log(`  Sin COT (vacío):               ${stats.sin_cot}`)
console.log(`  Sin empresa (no insertables):  ${stats.sin_empresa.length}`)
console.log(`  YA existen en Supabase:        ${stats.ya_existe_op}`)
console.log(`  Se insertarían (nuevas):       ${stats.se_insertaria}`)
console.log(`  Duplicados en Excel:           ${stats.dup_en_excel.size} grupos`)

if (stats.sin_empresa.length > 0) {
  console.log('\n  📋 FILAS SIN EMPRESA (no se insertan - completar si quieres que entren):')
  for (const s of stats.sin_empresa) {
    console.log(`     Fila K${s.fila} — ${s.cot.padEnd(14)} (${s.cotizador || '?'}, $${s.valor.toLocaleString()}, ${s.estado || 'sin estado'})`)
  }
}

if (stats.dup_en_excel.size > 0) {
  console.log('\n  ⚠ DUPLICADOS EN EL EXCEL (mismo COT más de una vez):')
  for (const [cot, rows] of stats.dup_en_excel) {
    console.log(`     ${cot}: ${rows.length} filas → ${rows.map(r => `fila ${r.fila}`).join(', ')}`)
  }
}

// ── Analyze 2026 sheet ──────────────────────────────────────────
console.log('\n' + '='.repeat(60))
console.log('2026 (hoja REGISTRO 2026)')
console.log('='.repeat(60))

const stats2026 = {
  total: rows2026.length,
  sin_cot: 0,
  sin_empresa: [],
  pre_llenadas_futuras: [],  // COT presente pero sin empresa y sin proyecto
  completas: 0,
  ya_existen: 0,
}

for (let i = 0; i < rows2026.length; i++) {
  const r = rows2026[i]
  if (!r || !r.length) continue

  const fila = i + 6  // slice(5) + 1 por Excel 1-indexed = i+6
  const cotRaw = strOf(r[13])
  const cot = norm(cotRaw)
  const empresa = strOf(r[4])  // col E = razón social
  const proyecto = strOf(r[3])  // col D = proyecto
  const cotizador = strOf(r[5])
  const valor = numOf(r[15])

  if (!cot) { stats2026.sin_cot++; continue }

  if (existingCots.has(cot)) { stats2026.ya_existen++; continue }

  if (!empresa && !proyecto) {
    stats2026.pre_llenadas_futuras.push({ fila, cot, cotizador })
    continue
  }

  if (!empresa) {
    stats2026.sin_empresa.push({ fila, cot, proyecto, valor, cotizador })
    continue
  }

  stats2026.completas++
}

console.log(`  Total filas 2026:              ${stats2026.total}`)
console.log(`  Sin COT (vacío):               ${stats2026.sin_cot}`)
console.log(`  YA existen en Supabase:        ${stats2026.ya_existen}`)
console.log(`  Completas (empresa + data):    ${stats2026.completas}`)
console.log(`  Pre-llenadas (COT sin data):   ${stats2026.pre_llenadas_futuras.length}`)
console.log(`  Sin empresa pero con data:     ${stats2026.sin_empresa.length}`)

if (stats2026.sin_empresa.length > 0) {
  console.log('\n  📋 FILAS 2026 CON DATA PERO SIN EMPRESA (completar antes de migrar):')
  for (const s of stats2026.sin_empresa) {
    console.log(`     Fila ${s.fila} — ${s.cot.padEnd(14)} ${s.proyecto ? `(${s.proyecto})` : ''} ${s.cotizador || '?'}, $${s.valor.toLocaleString()}`)
  }
}

if (stats2026.pre_llenadas_futuras.length > 0 && stats2026.pre_llenadas_futuras.length <= 20) {
  console.log('\n  📋 COTs 2026 pre-llenados (esperan data):')
  console.log(`     ${stats2026.pre_llenadas_futuras.map(p => p.cot).join(', ')}`)
}

// ── Resumen final ─────────────────────────────────────────────
console.log('\n' + '='.repeat(60))
console.log('RESUMEN')
console.log('='.repeat(60))

const totalInsertablesMaestro = stats.se_insertaria
const totalInsertables2026 = stats2026.completas
const totalInsertables = totalInsertablesMaestro + totalInsertables2026

console.log(`  ✓ Si corrés migrate ahora, se insertarán ~${totalInsertables} oportunidades nuevas`)
console.log(`      • MAESTRO: ${totalInsertablesMaestro}`)
console.log(`      • 2026:    ${totalInsertables2026}`)

const accionables = stats.sin_empresa.length + stats2026.sin_empresa.length
if (accionables > 0) {
  console.log(`  ⚠ ${accionables} filas con data real pero SIN empresa — completar antes de migrar si querés que entren`)
}

if (stats.dup_en_excel.size > 0) {
  console.log(`  ⚠ ${stats.dup_en_excel.size} COTs duplicados dentro del MAESTRO — el script deduplicará (conserva primera)`)
}

console.log('\n✓ Diagnóstico completo. El script NO modificó nada.')

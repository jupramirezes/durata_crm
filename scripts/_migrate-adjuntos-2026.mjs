/**
 * Migración masiva de adjuntos 2026 — M10.
 *
 * Recorre las carpetas de red de DURATA y sube cada archivo al bucket
 * archivos-oportunidades de Supabase Storage, luego actualiza la cotización
 * correspondiente con archivo_apu_url / archivo_pdf_url.
 *
 * Uso:
 *   node scripts/_migrate-adjuntos-2026.mjs --dry-run       # solo reporta, no sube nada
 *   node scripts/_migrate-adjuntos-2026.mjs                  # ejecuta la migración real
 *   node scripts/_migrate-adjuntos-2026.mjs --apu-only       # solo APUs
 *   node scripts/_migrate-adjuntos-2026.mjs --pdf-only       # solo PDFs
 *
 * Configuración de rutas (editable abajo):
 *   APU_ROOT: carpeta raíz de APUs (se busca recursivamente)
 *   PDF_ROOT: carpeta de PDFs (búsqueda plana, sin subcarpetas)
 *
 * Regex de match: extrae `2026-XXX[A-Z]?` del nombre del archivo.
 *   - "APU 2026-443 ALGO.xlsx" → 2026-443
 *   - "Cotizacion_2026-443A.pdf" → 2026-443A
 *   - "2026 - 443.xlsx" → 2026-443 (normalizado)
 *
 * Solo se procesan cotizaciones 2026 (numero LIKE '2026-%').
 */
import { readdirSync, statSync, createReadStream } from 'fs'
import { resolve, join, extname } from 'path'
import { readFileSync, existsSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// ── .env loader ─────────────────────────────────────────────
if (existsSync(resolve('.env'))) {
  for (const raw of readFileSync('.env', 'utf-8').split('\n')) {
    const line = raw.replace(/\r$/, '').trim()
    if (!line || line.startsWith('#')) continue
    const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*[:=]\s*(.*)$/)
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

// ── CLI args ────────────────────────────────────────────────
const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const APU_ONLY = args.includes('--apu-only')
const PDF_ONLY = args.includes('--pdf-only')

// ── Config de rutas ─────────────────────────────────────────
const APU_ROOT = 'P:\\Cotización\\1. COTIZACION 2026\\3. APU'  // 4 subcarpetas por cotizador
const PDF_ROOT = 'P:\\Cotización\\2. PDF PARA ENVIO\\COTIZACIONES 2026'

const BUCKET = 'archivos-oportunidades'
const MAX_SIZE_MB = 10

// ── Supabase client ─────────────────────────────────────────
const sb = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
)
const { error: authErr } = await sb.auth.signInWithPassword({
  email: process.env.MIGRATION_AUTH_EMAIL,
  password: process.env.MIGRATION_AUTH_PASS,
})
if (authErr) { console.error('Auth failed:', authErr.message); process.exit(1) }

// ── Helpers ─────────────────────────────────────────────────
function normalizeCot(raw) {
  return String(raw).trim().replace(/\s*-\s*/g, '-').toUpperCase()
}

// Extrae # COT del nombre de archivo. Soporta:
//   "APU 2026-443.xlsx", "2026 - 443.pdf", "COT_2026_443A.xlsx"
const COT_RE = /\b(20\d{2})[\s_-]{1,3}(\d{3,5})([A-Z])?\b/i

function extractCot(filename) {
  const m = filename.match(COT_RE)
  if (!m) return null
  const year = m[1]
  const num = m[2]
  const letter = (m[3] || '').toUpperCase()
  return `${year}-${num}${letter}`
}

function sanitizeFileName(name) {
  const dot = name.lastIndexOf('.')
  const base = dot > 0 ? name.slice(0, dot) : name
  const ext = dot > 0 ? name.slice(dot) : ''
  const safeBase = base
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 120)
  return (safeBase || 'archivo') + ext.toLowerCase()
}

// Walk recursively and collect files matching predicate
function walk(dir, predicate, out = []) {
  if (!existsSync(dir)) return out
  let entries
  try { entries = readdirSync(dir) } catch { return out }
  for (const name of entries) {
    const full = join(dir, name)
    let st
    try { st = statSync(full) } catch { continue }
    if (st.isDirectory()) walk(full, predicate, out)
    else if (predicate(name)) out.push({ path: full, name, size: st.size })
  }
  return out
}

// ── Fetch cotizaciones 2026 from Supabase ───────────────────
console.log('Cargando cotizaciones 2026 de Supabase…')
const { data: cots, error: cotsErr } = await sb
  .from('cotizaciones')
  .select('id, oportunidad_id, numero, archivo_apu_url, archivo_pdf_url')
  .like('numero', '2026-%')
if (cotsErr) { console.error('Error cargando cotizaciones:', cotsErr.message); process.exit(1) }

const cotMap = new Map()
for (const c of cots) cotMap.set(normalizeCot(c.numero), c)
console.log(`  ${cots.length} cotizaciones 2026 en BD\n`)

// ── Scan APU files ──────────────────────────────────────────
let apuFiles = []
if (!PDF_ONLY) {
  console.log(`Escaneando APUs en ${APU_ROOT}…`)
  apuFiles = walk(APU_ROOT, n => /\.(xlsx|xlsm|xls)$/i.test(n) && !n.startsWith('~$'))
  console.log(`  ${apuFiles.length} archivos encontrados`)
}

let pdfFiles = []
if (!APU_ONLY) {
  console.log(`Escaneando PDFs en ${PDF_ROOT}…`)
  pdfFiles = walk(PDF_ROOT, n => /\.pdf$/i.test(n))
  console.log(`  ${pdfFiles.length} archivos encontrados\n`)
}

// ── Match files to cotizaciones ─────────────────────────────
function classify(files, kind) {
  const stats = { matched: [], no_match: [], already_has: [], too_big: [], duplicate_match: new Map() }
  for (const f of files) {
    const cot_num = extractCot(f.name)
    if (!cot_num) { stats.no_match.push(f); continue }
    const cot = cotMap.get(normalizeCot(cot_num))
    if (!cot) { stats.no_match.push({ ...f, cot_num }); continue }
    const alreadyField = kind === 'apu' ? cot.archivo_apu_url : cot.archivo_pdf_url
    if (alreadyField) { stats.already_has.push({ ...f, cot_num, cot_id: cot.id }); continue }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) { stats.too_big.push({ ...f, cot_num }); continue }
    // Dedup: si hay 2+ archivos para el mismo COT, solo subir el primero, reportar los demás
    if (stats.duplicate_match.has(cot_num)) {
      stats.duplicate_match.get(cot_num).push(f.name)
    } else {
      stats.duplicate_match.set(cot_num, [])
      stats.matched.push({ ...f, cot_num, cot_id: cot.id, oportunidad_id: cot.oportunidad_id })
    }
  }
  return stats
}

const apuStats = PDF_ONLY ? null : classify(apuFiles, 'apu')
const pdfStats = APU_ONLY ? null : classify(pdfFiles, 'pdf')

function printReport(label, stats) {
  console.log(`─── ${label} ───`)
  console.log(`  Match (para subir):    ${stats.matched.length}`)
  console.log(`  Ya tienen adjunto:     ${stats.already_has.length}`)
  console.log(`  Sin match en BD:       ${stats.no_match.length}`)
  console.log(`  >10MB (omitir):        ${stats.too_big.length}`)
  const dupes = [...stats.duplicate_match.entries()].filter(([, v]) => v.length > 0)
  console.log(`  Duplicados mismo COT:  ${dupes.length} grupos`)
  if (stats.no_match.length > 0 && stats.no_match.length <= 10) {
    console.log(`    Ejemplos sin match:`)
    for (const f of stats.no_match.slice(0, 5)) console.log(`      - ${f.name}${f.cot_num ? ` (COT ${f.cot_num} no está en BD)` : ''}`)
  }
}

console.log('\n══════════════════════════════════════')
console.log('  REPORTE')
console.log('══════════════════════════════════════')
if (apuStats) printReport('APUs (xlsx)', apuStats)
if (pdfStats) printReport('PDFs', pdfStats)

if (DRY_RUN) {
  console.log('\n🔍 DRY-RUN mode — no se subió nada. Ejecuta sin --dry-run para aplicar.')
  process.exit(0)
}

// ── Upload ──────────────────────────────────────────────────
async function uploadOne(f, kind) {
  const fileBuffer = readFileSync(f.path)
  const safeName = sanitizeFileName(f.name)
  const storagePath = `${f.oportunidad_id}/cotizaciones/${f.cot_id}/${kind}_${safeName}`
  const contentType = kind === 'apu'
    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    : 'application/pdf'
  const { error: upErr } = await sb.storage.from(BUCKET).upload(storagePath, fileBuffer, {
    upsert: true, contentType,
  })
  if (upErr) return { ok: false, error: upErr.message }

  const updates = kind === 'apu'
    ? { archivo_apu_url: storagePath, archivo_apu_nombre: f.name }
    : { archivo_pdf_url: storagePath, archivo_pdf_nombre: f.name }
  const { error: updErr } = await sb.from('cotizaciones').update(updates).eq('id', f.cot_id)
  if (updErr) return { ok: false, error: updErr.message }
  return { ok: true }
}

async function runBatch(label, stats, kind) {
  if (!stats || stats.matched.length === 0) return
  console.log(`\nSubiendo ${stats.matched.length} ${label}…`)
  let ok = 0, fail = 0
  for (let i = 0; i < stats.matched.length; i++) {
    const f = stats.matched[i]
    const res = await uploadOne(f, kind)
    if (res.ok) ok++
    else { fail++; console.error(`  ✗ ${f.name}: ${res.error}`) }
    if ((i + 1) % 25 === 0) console.log(`  progreso: ${i + 1}/${stats.matched.length} (${ok} ok, ${fail} fail)`)
  }
  console.log(`  ✓ ${ok} subidos, ✗ ${fail} fallaron`)
}

if (apuStats) await runBatch('APUs', apuStats, 'apu')
if (pdfStats) await runBatch('PDFs', pdfStats, 'pdf')

console.log('\n✓ Migración completa')

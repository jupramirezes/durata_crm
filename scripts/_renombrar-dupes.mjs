/**
 * Rename plan for duplicate COTs.
 * Reads: data/_duplicates.json + MAESTRO + 2026 Excel
 * Outputs: SQL UPDATE block + collision check SQL + summary
 *
 * Throwaway script — not committed.
 */
import { readFileSync, writeFileSync } from 'fs'
import XLSX from 'xlsx'
import { resolve } from 'path'

const normalizeCot = s => String(s || '').trim().replace(/\s*-\s*/g, '-')
const strOf = v => String(v == null ? '' : v).trim()

// Match trailing A-Z letters (can be multi-letter theoretically, but typical is 1)
function splitBaseSuffix(cot) {
  const m = cot.match(/^(.+?)([A-Z]*)$/)
  if (!m) return { base: cot, suffix: '' }
  return { base: m[1], suffix: m[2] }
}

// Convert 0 -> A, 1 -> B, ..., 25 -> Z, 26 -> AA, 27 -> AB ...
function indexToLetters(idx) {
  let s = ''
  let n = idx
  while (true) {
    s = String.fromCharCode(65 + (n % 26)) + s
    n = Math.floor(n / 26) - 1
    if (n < 0) break
  }
  return s
}

// ── Load all COTs from Excel MAESTRO + 2026 ──
const allKnownCots = new Set()
const cotsByBase = new Map() // base → Set(suffix)

function registerCot(c) {
  const norm = normalizeCot(c)
  if (!norm) return
  allKnownCots.add(norm)
  const { base, suffix } = splitBaseSuffix(norm)
  if (!cotsByBase.has(base)) cotsByBase.set(base, new Set())
  cotsByBase.get(base).add(suffix)
}

const wbM = XLSX.readFile(resolve('scripts/data/REGISTRO_MAESTRO.xlsx'))
for (const r of XLSX.utils.sheet_to_json(wbM.Sheets['TOTAL'], { header: 1, defval: '' }).slice(1)) {
  if (r && r.length) registerCot(strOf(r[6]))
}
const wb2 = XLSX.readFile(resolve('scripts/data/REGISTRO COTIZACIONES DURATA 2026.xlsx'))
for (const r of XLSX.utils.sheet_to_json(wb2.Sheets['REGISTRO 2026'], { header: 1, defval: '' }).slice(5)) {
  if (r && r.length) registerCot(strOf(r[13]))
}

// Also register all duplicate COTs as existing (the one we KEEP stays with that COT)
const dupes = JSON.parse(readFileSync(resolve('scripts/data/_duplicates.json'), 'utf-8'))
for (const d of dupes) registerCot(d.cot)

console.log(`Universo de COTs conocidos: ${allKnownCots.size} (MAESTRO + 2026 + duplicados supabase)`)

// ── Group duplicates by cot, sort by (created_at, id) so "oldest" is stable ──
const byCot = new Map()
for (const d of dupes) {
  if (!byCot.has(d.cot)) byCot.set(d.cot, [])
  byCot.get(d.cot).push(d)
}
for (const arr of byCot.values()) arr.sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id))

// ── Assign new suffixes ──
const renames = [] // { id, oldCot, newCot, base }
let groupsWithLetterRestart = 0

for (const [cot, rows] of byCot) {
  if (rows.length < 2) continue
  const { base } = splitBaseSuffix(cot)
  // Taken suffixes: everything already known for this base, PLUS suffixes we assign in this run
  const taken = new Set(cotsByBase.get(base) || [])
  // First row keeps its COT (nothing to rename)
  // For each subsequent row, pick next free A, B, C, ...
  let letterIdx = 0
  for (let i = 1; i < rows.length; i++) {
    let newSuffix
    while (true) {
      newSuffix = indexToLetters(letterIdx++)
      if (!taken.has(newSuffix)) break
      if (letterIdx > 700) throw new Error(`Runaway for base ${base}`)
    }
    taken.add(newSuffix)
    const newCot = base + newSuffix
    cotsByBase.get(base).add(newSuffix)
    allKnownCots.add(newCot)
    renames.push({ id: rows[i].id, oldCot: cot, newCot, base })
  }
  if (letterIdx > 0) groupsWithLetterRestart++
}

console.log(`\nGrupos duplicados procesados: ${byCot.size}`)
console.log(`Filas a renombrar:             ${renames.length}`)
console.log()

// ── Group renames by base for a nice preview ──
const renamesByBase = new Map()
for (const r of renames) {
  if (!renamesByBase.has(r.base)) renamesByBase.set(r.base, [])
  renamesByBase.get(r.base).push(r)
}

console.log('Preview de renombrados (primeros 10 grupos):')
let shown = 0
for (const [base, rs] of renamesByBase) {
  if (shown >= 10) break
  console.log(`  ${base}:  ${rs.map(r => `${r.oldCot}→${r.newCot}`).join(', ')}`)
  shown++
}
if (renamesByBase.size > 10) console.log(`  ... (${renamesByBase.size - 10} grupos más)`)

// ── Generate SQL ──
let sql = '-- ============================================================\n'
sql += '-- Rename plan for duplicate COTs in oportunidades.notas\n'
sql += `-- Generated: ${new Date().toISOString()}\n`
sql += `-- Total renames: ${renames.length} (in ${renamesByBase.size} base groups)\n`
sql += '--\n'
sql += '-- STRATEGY: for each duplicate group, keep the oldest row with its\n'
sql += '-- current COT and rename the rest with the next free A-Z suffix that\n'
sql += '-- does NOT collide with MAESTRO + 2026 + existing Supabase data.\n'
sql += '-- ============================================================\n\n'

sql += '-- STEP 1: collision check — run this first. Must return 0 rows.\n'
sql += '-- (verifies none of the new COTs we plan to write already exist in Supabase)\n'
sql += 'SELECT cot FROM (VALUES\n'
const candidates = [...new Set(renames.map(r => r.newCot))]
sql += candidates.map(c => `  ('${c}')`).join(',\n') + '\n'
sql += ') AS t(cot)\n'
sql += 'WHERE cot IN (\n'
sql += "  SELECT substring(notas from 'COT:\\s*([^\\s|]+)')\n"
sql += "  FROM oportunidades WHERE notas LIKE 'COT:%'\n"
sql += ');\n\n'

sql += '-- STEP 2: if STEP 1 returned zero rows, run this batch UPDATE.\n'
sql += '-- Wrapped in a transaction so you can ROLLBACK if anything looks off.\n'
sql += 'BEGIN;\n\n'

// Group by (oldCot → [newCot, id]) and emit one UPDATE per (id, newCot).
// Use regexp_replace to swap only the COT portion of notas, preserving any
// "COT: xxx | Proyecto: yyy" suffix.
for (const r of renames) {
  sql += `UPDATE oportunidades SET notas = regexp_replace(notas, 'COT:\\s*${r.oldCot.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&')}', 'COT: ${r.newCot}') WHERE id = '${r.id}';\n`
}

sql += '\n-- Verification BEFORE commit:\n'
sql += '-- (a) the renamed rows now have their new COTs\n'
sql += `-- (b) todos los cot_unicos debe subir a ${5122 + renames.length} (from 5122)\n`
sql += "-- SELECT COUNT(DISTINCT substring(notas from 'COT:\\s*([^\\s|]+)')) FROM oportunidades WHERE notas LIKE 'COT:%';\n\n"

sql += '-- If everything looks good:\n'
sql += 'COMMIT;\n'
sql += '-- Otherwise:\n'
sql += '-- ROLLBACK;\n'

writeFileSync(resolve('scripts/data/_renombrar-dupes.sql'), sql)
console.log(`\n✓ SQL escrito en: scripts/data/_renombrar-dupes.sql (${sql.length} bytes)`)
console.log(`  Con STEP 1 (collision check) + STEP 2 (UPDATEs en transaction)`)

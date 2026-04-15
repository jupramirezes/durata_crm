/**
 * Genera SQL UPDATE final para arreglar los duplicados en Supabase.
 * Estrategia:
 *   SIMPLE_DUP: UPDATE por id (siguiendo created_at, el primero se queda, los demás van a próxima letra libre).
 *   MULTI_VAL_MATCH: UPDATE WHERE valor_cotizado = V  (mapea cada valor a su COT correcto en MAESTRO).
 *   MULTI_VAL_PARTIAL: UPDATE WHERE valor_cotizado = V, para los valores que matchean único.
 */
import { readFileSync, writeFileSync } from 'fs'
import XLSX from 'xlsx'
import { resolve } from 'path'

const norm = s => String(s || '').trim().replace(/\s*-\s*/g, '-')
const strOf = v => String(v == null ? '' : v).trim()
const numOf = v => { const n = Number(v); return isNaN(n) ? 0 : n }
const splitBase = c => { const m = String(c).match(/^(.+?)([A-Z]*)$/); return m ? { base: m[1], suffix: m[2] } : { base: c, suffix: '' } }
const idxToLetter = idx => { let s = '', n = idx; while (true) { s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26) - 1; if (n < 0) break } return s }
const regexEscape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&')

// ── Load MAESTRO per base ──
const maestroByBase = new Map()
const wb = XLSX.readFile(resolve('scripts/data/REGISTRO_MAESTRO.xlsx'))
for (const r of XLSX.utils.sheet_to_json(wb.Sheets['TOTAL'], { header: 1, defval: '' }).slice(1)) {
  if (!r || !r.length) continue
  const cot = norm(r[6]); if (!cot) continue
  const { base } = splitBase(cot)
  if (!maestroByBase.has(base)) maestroByBase.set(base, [])
  maestroByBase.get(base).push({ cot, valor: numOf(r[7]) })
}
for (const rows of maestroByBase.values()) {
  rows.sort((a, b) => splitBase(a.cot).suffix.localeCompare(splitBase(b.cot).suffix))
}

// ── Load diag ──
const diag = JSON.parse(readFileSync(resolve('scripts/data/_diag-output.json'), 'utf-8'))

// ── Load duplicate IDs sorted by created_at ──
const dupRows = JSON.parse(readFileSync(resolve('scripts/data/_duplicates.json'), 'utf-8'))
const byCot = new Map()
for (const d of dupRows) {
  if (!byCot.has(d.cot)) byCot.set(d.cot, [])
  byCot.get(d.cot).push(d)
}
for (const arr of byCot.values()) arr.sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id))

// ── Build plan ──
const stmts = []
const summary = { simple_dup: 0, multi_val_match: 0, multi_val_partial: 0, label_fix: 0, no_change: 0 }

for (const d of diag) {
  const { base, cot, copies, valores } = d
  if (copies < 2) continue
  const supaRows = byCot.get(cot) || []
  const maestroRows = maestroByBase.get(base) || []

  // CASE A: single value (SIMPLE_DUP or LABEL_FIX)
  if (valores.length === 1) {
    const v = valores[0]
    const match = maestroRows.find(m => m.valor === v)
    if (match && match.cot === cot) {
      // SIMPLE_DUP: keep first, rename extras to next free letter
      stmts.push(`-- SIMPLE_DUP: ${cot} × ${copies} valor=${v} (MAESTRO match exacto → ${match.cot})`)
      const taken = new Set(maestroRows.map(m => splitBase(m.cot).suffix))
      let letterIdx = 0
      for (let i = 1; i < supaRows.length; i++) {
        let s
        do { s = idxToLetter(letterIdx++) } while (taken.has(s))
        taken.add(s)
        const newCot = base + s
        stmts.push(`UPDATE oportunidades SET notas = regexp_replace(notas, 'COT:\\s*${regexEscape(cot)}', 'COT: ${newCot}') WHERE id = '${supaRows[i].id}';`)
        summary.simple_dup++
      }
    } else if (match) {
      // LABEL_FIX: Supabase label ≠ MAESTRO's label → rename FIRST copy to MAESTRO's, rest to next letters
      stmts.push(`-- LABEL_FIX: Supabase usa ${cot}, MAESTRO tiene ${match.cot} para valor=${v}`)
      stmts.push(`UPDATE oportunidades SET notas = regexp_replace(notas, 'COT:\\s*${regexEscape(cot)}', 'COT: ${match.cot}') WHERE id = '${supaRows[0].id}';`)
      summary.label_fix++
      const taken = new Set(maestroRows.map(m => splitBase(m.cot).suffix))
      let letterIdx = 0
      for (let i = 1; i < supaRows.length; i++) {
        let s
        do { s = idxToLetter(letterIdx++) } while (taken.has(s))
        taken.add(s)
        const newCot = base + s
        stmts.push(`UPDATE oportunidades SET notas = regexp_replace(notas, 'COT:\\s*${regexEscape(cot)}', 'COT: ${newCot}') WHERE id = '${supaRows[i].id}';`)
        summary.simple_dup++
      }
    } else {
      // FALLBACK: no MAESTRO row with this value → assume dup, rename extras
      stmts.push(`-- FALLBACK: ${cot} × ${copies} valor=${v} (no hay match en MAESTRO)`)
      const taken = new Set(maestroRows.map(m => splitBase(m.cot).suffix))
      let letterIdx = 0
      for (let i = 1; i < supaRows.length; i++) {
        let s
        do { s = idxToLetter(letterIdx++) } while (taken.has(s))
        taken.add(s)
        const newCot = base + s
        stmts.push(`UPDATE oportunidades SET notas = regexp_replace(notas, 'COT:\\s*${regexEscape(cot)}', 'COT: ${newCot}') WHERE id = '${supaRows[i].id}';`)
        summary.simple_dup++
      }
    }
    stmts.push('')
    continue
  }

  // CASE B: multi-value → use WHERE valor_cotizado = V
  stmts.push(`-- MULTI_VAL: ${cot} × ${copies} valores=[${valores.join(',')}]`)
  for (const v of valores) {
    const matches = maestroRows.filter(m => m.valor === v)
    if (matches.length === 1) {
      const target = matches[0].cot
      if (target === cot) {
        stmts.push(`--   valor=${v} ya tiene cot correcto (${cot}), no UPDATE necesario`)
        summary.no_change++
      } else {
        stmts.push(`UPDATE oportunidades SET notas = regexp_replace(notas, 'COT:\\s*${regexEscape(cot)}', 'COT: ${target}') WHERE notas LIKE 'COT:%${cot}%' AND valor_cotizado = ${v};`)
        summary.multi_val_match++
      }
    } else if (matches.length === 0) {
      stmts.push(`--   valor=${v}: ⚠ no hay match en MAESTRO, fila se queda como ${cot} (próxima migración puede traer el COT correcto)`)
      summary.multi_val_partial++
    } else {
      // Multiple MAESTRO matches: prefer base (no suffix) which equals cot
      const preferBase = matches.find(m => m.cot === cot)
      if (preferBase) {
        stmts.push(`--   valor=${v}: MAESTRO tiene ${matches.length} coincidencias; se prefiere ${cot} (queda como está)`)
        summary.no_change++
      } else {
        const target = matches[0].cot
        stmts.push(`UPDATE oportunidades SET notas = regexp_replace(notas, 'COT:\\s*${regexEscape(cot)}', 'COT: ${target}') WHERE notas LIKE 'COT:%${cot}%' AND valor_cotizado = ${v};  -- (1 de ${matches.length} matches)`)
        summary.multi_val_match++
      }
    }
  }
  stmts.push('')
}

// Assemble SQL file
const totalUpdates = summary.simple_dup + summary.multi_val_match + summary.label_fix
const header = `-- ============================================================
-- Rename plan final para duplicados de oportunidades.notas
-- Generated: ${new Date().toISOString()}
--
-- Estrategia:
--   SIMPLE_DUP    ${String(summary.simple_dup).padStart(4)} UPDATEs  (dup real, extras a letra libre)
--   MULTI_VAL     ${String(summary.multi_val_match).padStart(4)} UPDATEs  (matchea contra MAESTRO por valor)
--   LABEL_FIX     ${String(summary.label_fix).padStart(4)} UPDATEs  (Supabase usa COT incorrecto, remap a MAESTRO)
--   NO_CHANGE     ${String(summary.no_change).padStart(4)}          (fila ya tiene el COT correcto)
--   PARTIAL/NOMTH ${String(summary.multi_val_partial).padStart(4)}          (queda sin cambiar, puede traer próxima migración)
--   TOTAL UPDATEs ${String(totalUpdates).padStart(4)}
--
-- Todo en una transacción. Validar con las queries al final antes del COMMIT.
-- ============================================================

BEGIN;

`
const footer = `
-- VERIFICACIÓN antes del COMMIT:
-- (a) debe dar 0 filas (no quedan duplicados con mismo cot)
SELECT cot, COUNT(*) AS copies
FROM (SELECT substring(notas from 'COT:\\s*([^\\s|]+)') AS cot FROM oportunidades WHERE notas LIKE 'COT:%') t
GROUP BY cot HAVING COUNT(*) > 1;

-- (b) debe subir a ~5155 (igualando MAESTRO)
SELECT COUNT(DISTINCT substring(notas from 'COT:\\s*([^\\s|]+)')) AS cots_unicos,
       COUNT(*) AS total_filas
FROM oportunidades WHERE notas LIKE 'COT:%';

-- Si todo OK:
COMMIT;
-- Si algo raro:
-- ROLLBACK;
`

const full = header + stmts.join('\n') + footer
writeFileSync(resolve('scripts/data/_sql-final.sql'), full)

console.log('SUMMARY:')
console.log(`  SIMPLE_DUP UPDATES:     ${summary.simple_dup}`)
console.log(`  MULTI_VAL UPDATES:      ${summary.multi_val_match}`)
console.log(`  LABEL_FIX UPDATES:      ${summary.label_fix}`)
console.log(`  NO_CHANGE (no touch):   ${summary.no_change}`)
console.log(`  PARTIAL/NO_MATCH:       ${summary.multi_val_partial}`)
console.log(`  TOTAL UPDATES:          ${totalUpdates}`)
console.log(`\n✓ SQL escrito: scripts/data/_sql-final.sql (${full.length} bytes, ${stmts.length} lines)`)

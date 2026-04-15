/**
 * Resuelve cada grupo y genera:
 *   (a) SQL UPDATE final
 *   (b) Resumen por grupo con el plan concreto
 *
 * Estrategia:
 *   SIMPLE_DUP (mismo valor, MAESTRO tiene 1 match): mantener 1 copia con COT actual,
 *     renombrar N-1 extras a próxima letra libre (no colisiona con MAESTRO ni Supabase).
 *   MULTI_VAL_MATCH (valores distintos, cada uno matchea un COT distinto de MAESTRO):
 *     renombrar cada fila al COT que MAESTRO tiene con ese valor.
 *   MULTI_VAL_PARTIAL: cuando MAESTRO tiene múltiples COTs con el mismo valor,
 *     preferir el COT actual (base sin letra) para esa fila.
 */
import { readFileSync, writeFileSync } from 'fs'
import XLSX from 'xlsx'
import { resolve } from 'path'

const norm = s => String(s || '').trim().replace(/\s*-\s*/g, '-')
const strOf = v => String(v == null ? '' : v).trim()
const numOf = v => { const n = Number(v); return isNaN(n) ? 0 : n }
const splitBase = c => { const m = String(c).match(/^(.+?)([A-Z]*)$/); return m ? { base: m[1], suffix: m[2] } : { base: c, suffix: '' } }
const idxToLetter = idx => { let s = '', n = idx; while (true) { s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26) - 1; if (n < 0) break } return s }

// ── Load duplicates (with full rows) ──
const dupRows = JSON.parse(readFileSync(resolve('scripts/data/_duplicates.json'), 'utf-8'))
// The _duplicates.json only has {cot, id, created_at}. We need valor_cotizado too.
// Reconstruct from original query output pasted by user:
// Fortunately, _diag-output.json has the values grouped by cot.
// For multi-value groups we need to know which row has which value.
// Let me re-read the user's ORIGINAL paste of rows (scripts/data/_duplicates.json was trimmed).
// Since we don't have valor per row, we'll need to ask the user to re-query per group,
// OR use a different match strategy.

// Strategy: match by COT + creation order → pair with MAESTRO rows sorted by suffix order.
// This works as long as MAESTRO and Supabase insertion order match for each group.

// ── Load MAESTRO per base ──
const maestroByBase = new Map()
const wb = XLSX.readFile(resolve('scripts/data/REGISTRO_MAESTRO.xlsx'))
for (const r of XLSX.utils.sheet_to_json(wb.Sheets['TOTAL'], { header: 1, defval: '' }).slice(1)) {
  if (!r || !r.length) continue
  const cot = norm(r[6]); if (!cot) continue
  const { base } = splitBase(cot)
  if (!maestroByBase.has(base)) maestroByBase.set(base, [])
  maestroByBase.get(base).push({ cot, valor: numOf(r[7]), estado: strOf(r[8]).toUpperCase(), empresa: strOf(r[10]) })
}
// Sort each base's COTs by suffix alphabetically (no suffix first)
for (const rows of maestroByBase.values()) {
  rows.sort((a, b) => {
    const sa = splitBase(a.cot).suffix, sb = splitBase(b.cot).suffix
    return sa.localeCompare(sb)
  })
}

// ── Build set of all existing COTs (MAESTRO + Supabase via diag) for collision check ──
const allCots = new Set()
for (const rows of maestroByBase.values()) for (const r of rows) allCots.add(r.cot)
// Also 2026 Excel
const wb2 = XLSX.readFile(resolve('scripts/data/REGISTRO COTIZACIONES DURATA 2026.xlsx'))
for (const r of XLSX.utils.sheet_to_json(wb2.Sheets['REGISTRO 2026'], { header: 1, defval: '' }).slice(5)) {
  if (r && r.length) { const c = norm(r[13]); if (c) allCots.add(c) }
}
// And Supabase via diag
const diag = JSON.parse(readFileSync(resolve('scripts/data/_diag-output.json'), 'utf-8'))
for (const d of diag) allCots.add(d.cot)

// ── Group duplicates by cot, preserving created_at order ──
const byCot = new Map()
for (const d of dupRows) {
  if (!byCot.has(d.cot)) byCot.set(d.cot, [])
  byCot.get(d.cot).push(d)
}
for (const arr of byCot.values()) arr.sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id))

// ── Generate renames ──
const renames = []  // { id, oldCot, newCot, reason }
const reportLines = []

for (const d of diag) {
  const { base, cot, copies, valores } = d
  if (copies < 2) continue
  const supaRows = byCot.get(cot) || []
  if (supaRows.length !== copies) {
    console.warn(`[warn] ${cot}: diag says ${copies} but dup JSON has ${supaRows.length}`)
    continue
  }
  const maestroRows = maestroByBase.get(base) || []

  // CASE A: single value
  if (valores.length === 1) {
    const v = valores[0]
    const matches = maestroRows.filter(m => m.valor === v)
    if (matches.length === 1 && matches[0].cot === cot) {
      // Simple dup: keep first copy with cot, rename extras to next free letter
      const taken = new Set(maestroRows.map(m => splitBase(m.cot).suffix))
      let letterIdx = 0
      reportLines.push(`\n[SIMPLE_DUP] ${cot} × ${copies} valor=${v} (empresa=${matches[0].empresa})`)
      for (let i = 1; i < supaRows.length; i++) {
        let s
        do { s = idxToLetter(letterIdx++) } while (taken.has(s))
        taken.add(s)
        const newCot = base + s
        renames.push({ id: supaRows[i].id, oldCot: cot, newCot, reason: 'SIMPLE_DUP' })
        reportLines.push(`  ${supaRows[i].id} ${cot} → ${newCot}`)
      }
    } else if (matches.length === 1) {
      // Supabase label differs from MAESTRO's → rename ALL copies to MAESTRO's label
      // (the "kept" one also needs renaming since its COT is wrong)
      reportLines.push(`\n[LABEL_MISMATCH] Supabase uses ${cot} but MAESTRO has ${matches[0].cot} for value=${v}. Renaming all.`)
      const taken = new Set(maestroRows.map(m => splitBase(m.cot).suffix))
      // One goes to MAESTRO's exact cot. Rest to next free letters.
      renames.push({ id: supaRows[0].id, oldCot: cot, newCot: matches[0].cot, reason: 'LABEL_FIX' })
      reportLines.push(`  ${supaRows[0].id} ${cot} → ${matches[0].cot}`)
      let letterIdx = 0
      for (let i = 1; i < supaRows.length; i++) {
        let s
        do { s = idxToLetter(letterIdx++) } while (taken.has(s))
        taken.add(s)
        const newCot = base + s
        renames.push({ id: supaRows[i].id, oldCot: cot, newCot, reason: 'SIMPLE_DUP_AFTER_LABEL_FIX' })
        reportLines.push(`  ${supaRows[i].id} ${cot} → ${newCot}`)
      }
    } else {
      // No MAESTRO match or ambiguous — fallback: treat as simple dup, use next free letter
      reportLines.push(`\n[FALLBACK] ${cot} × ${copies} valor=${v}: no single MAESTRO match. Using next free letter for extras.`)
      const taken = new Set(maestroRows.map(m => splitBase(m.cot).suffix))
      let letterIdx = 0
      for (let i = 1; i < supaRows.length; i++) {
        let s
        do { s = idxToLetter(letterIdx++) } while (taken.has(s))
        taken.add(s)
        const newCot = base + s
        renames.push({ id: supaRows[i].id, oldCot: cot, newCot, reason: 'FALLBACK' })
        reportLines.push(`  ${supaRows[i].id} ${cot} → ${newCot}`)
      }
    }
    continue
  }

  // CASE B: multi-value
  // Need to match each Supabase row to a MAESTRO COT by value.
  // But _duplicates.json doesn't have valor per row! We need it.
  // Fallback: leave as manual review. Print diagnostics.
  reportLines.push(`\n[MULTI_VAL] ${cot} × ${copies} valores=${valores.join(',')}`)
  reportLines.push(`  MAESTRO tiene para base ${base}:`)
  for (const m of maestroRows) reportLines.push(`    ${m.cot.padEnd(14)} valor=${m.valor}`)
  reportLines.push(`  ⚠ Necesito saber qué valor tiene cada ID en Supabase para renombrar correctamente.`)
  reportLines.push(`  Plan tentativo (asumiendo orden MAESTRO = orden created_at supabase):`)
  // Pair by sorted-order heuristic (already sorted by suffix in maestroRows; supaRows by created_at)
  for (let i = 0; i < supaRows.length && i < maestroRows.length; i++) {
    const target = maestroRows[i].cot
    reportLines.push(`    ${supaRows[i].id} → ${target} (MAESTRO valor=${maestroRows[i].valor})`)
  }
}

console.log(reportLines.join('\n'))
console.log(`\n\n✓ Plan total: ${renames.length} renames generados (auto-resolvibles)`)
console.log(`  Multi-val groups (${diag.filter(d => d.copies > 1 && d.valores.length > 1).length}) necesitan lookup de valor por ID`)

// Save plan so far
writeFileSync(resolve('scripts/data/_plan-updates.json'), JSON.stringify({ renames, reportLines }, null, 2))
console.log(`✓ Escrito: scripts/data/_plan-updates.json`)

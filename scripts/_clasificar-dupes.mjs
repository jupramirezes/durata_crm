/**
 * Clasifica cada grupo duplicado cruzando contra MAESTRO.
 * Determina, para cada caso, si se puede auto-arreglar matcheando por valor.
 */
import { readFileSync } from 'fs'
import XLSX from 'xlsx'
import { resolve } from 'path'

const norm = s => String(s || '').trim().replace(/\s*-\s*/g, '-')
const strOf = v => String(v == null ? '' : v).trim()
const numOf = v => { const n = Number(v); return isNaN(n) ? 0 : n }
const splitBase = c => { const m = String(c).match(/^(.+?)([A-Z]*)$/); return m ? { base: m[1], suffix: m[2] } : { base: c, suffix: '' } }

// ── Read MAESTRO per base ──
const maestroByBase = new Map()  // base → [ { cot, valor, estado, empresa } ]
const wb = XLSX.readFile(resolve('scripts/data/REGISTRO_MAESTRO.xlsx'))
for (const r of XLSX.utils.sheet_to_json(wb.Sheets['TOTAL'], { header: 1, defval: '' }).slice(1)) {
  if (!r || !r.length) continue
  const cot = norm(r[6]); if (!cot) continue
  const { base } = splitBase(cot)
  const entry = {
    cot, valor: numOf(r[7]), estado: strOf(r[8]).toUpperCase(), empresa: strOf(r[10]),
  }
  if (!maestroByBase.has(base)) maestroByBase.set(base, [])
  maestroByBase.get(base).push(entry)
}

// ── Read diag output (state of Supabase per base) ──
const diag = JSON.parse(readFileSync(resolve('scripts/data/_diag-output.json'), 'utf-8'))
const supaByBase = new Map()
for (const d of diag) {
  if (!supaByBase.has(d.base)) supaByBase.set(d.base, [])
  supaByBase.get(d.base).push(d)
}

// ── Classify ──
const cases = {
  SIMPLE_DUP: [],     // Supabase tiene 1 COT con N copias mismo valor, MAESTRO tiene 1 match
  MULTI_VAL_MATCH: [],// Supabase tiene 1 COT con N copias valores distintos, MAESTRO tiene matches exactos por valor
  MULTI_VAL_PARTIAL: [], // Supabase valores distintos pero MAESTRO no tiene match completo
  NO_MAESTRO: [],     // Supabase tiene copias pero MAESTRO no tiene este base
  AMBIGUOUS: [],      // Otro / revisar manual
}

for (const [base, supaRows] of supaByBase) {
  const maestroRows = maestroByBase.get(base) || []
  // Filter supa to duplicated entries only (copies > 1)
  const dupEntries = supaRows.filter(s => s.copies > 1)
  if (dupEntries.length === 0) continue

  for (const entry of dupEntries) {
    const { cot, copies, valores } = entry
    const n = copies

    // CASO A: valor único, n copias
    if (valores.length === 1) {
      const v = valores[0]
      const maestroMatches = maestroRows.filter(m => m.valor === v)
      // Usually MAESTRO has exactly 1 row with this valor → simple dup
      if (maestroMatches.length === 1 && maestroMatches[0].cot === cot) {
        // The Supabase COT matches MAESTRO's COT. N-1 extras are pure duplicates.
        cases.SIMPLE_DUP.push({ base, cot, copies: n, valor: v, maestroCot: maestroMatches[0].cot, extrasToRename: n - 1 })
      } else if (maestroMatches.length === 1) {
        // Supabase label differs from MAESTRO's. Rename ALL copies to MAESTRO's label.
        cases.AMBIGUOUS.push({ base, cot, copies: n, valor: v, reason: `Supabase label=${cot} but MAESTRO has ${maestroMatches[0].cot} with that value`, maestroCot: maestroMatches[0].cot })
      } else if (maestroMatches.length === 0) {
        cases.AMBIGUOUS.push({ base, cot, copies: n, valor: v, reason: 'No MAESTRO row with this value' })
      } else {
        cases.AMBIGUOUS.push({ base, cot, copies: n, valor: v, reason: `${maestroMatches.length} MAESTRO rows with this value`, maestroCots: maestroMatches.map(m => m.cot) })
      }
      continue
    }

    // CASO B: múltiples valores, se supone match por valor con MAESTRO
    const valMatchMap = {} // valor → MAESTRO COT
    let allMatched = true
    for (const v of valores) {
      const matches = maestroRows.filter(m => m.valor === v)
      if (matches.length === 1) {
        valMatchMap[v] = matches[0].cot
      } else {
        allMatched = false
        valMatchMap[v] = null
      }
    }

    if (allMatched) {
      cases.MULTI_VAL_MATCH.push({ base, cot, copies: n, valores, valMatchMap })
    } else {
      cases.MULTI_VAL_PARTIAL.push({ base, cot, copies: n, valores, valMatchMap })
    }
  }
}

// ── Report ──
console.log('════════════════════════════════════════')
console.log('CLASIFICACIÓN DE GRUPOS DUPLICADOS')
console.log('════════════════════════════════════════\n')

console.log(`SIMPLE_DUP (dup real, MAESTRO tiene 1 fila):  ${cases.SIMPLE_DUP.length} grupos`)
const simpleTotal = cases.SIMPLE_DUP.reduce((s, c) => s + c.extrasToRename, 0)
console.log(`  → filas a renombrar: ${simpleTotal}`)

console.log(`\nMULTI_VAL_MATCH (dupes multi-valor con match perfecto en MAESTRO):  ${cases.MULTI_VAL_MATCH.length} grupos`)
for (const c of cases.MULTI_VAL_MATCH) {
  console.log(`  ${c.cot} × ${c.copies}: ${Object.entries(c.valMatchMap).map(([v, m]) => `${v}→${m}`).join(', ')}`)
}

console.log(`\nMULTI_VAL_PARTIAL (match parcial):  ${cases.MULTI_VAL_PARTIAL.length} grupos`)
for (const c of cases.MULTI_VAL_PARTIAL) {
  console.log(`  ${c.cot} × ${c.copies}: ${Object.entries(c.valMatchMap).map(([v, m]) => `${v}→${m || '?'}`).join(', ')}`)
}

console.log(`\nAMBIGUOUS (revisar manualmente):  ${cases.AMBIGUOUS.length} grupos`)
for (const c of cases.AMBIGUOUS) {
  console.log(`  ${c.cot} × ${c.copies} valor=${c.valor}: ${c.reason}`)
}

// Save classifier output for next step
import { writeFileSync } from 'fs'
writeFileSync(resolve('scripts/data/_clasificacion.json'), JSON.stringify(cases, null, 2))
console.log('\n✓ Output guardado en: scripts/data/_clasificacion.json')

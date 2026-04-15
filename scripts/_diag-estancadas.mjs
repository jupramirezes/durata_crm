/**
 * Diagnóstico de oportunidades "estancadas":
 * oportunidades en BD que están en nuevo_lead / en_cotizacion pero
 * en el Excel (MAESTRO o 2026) ya tienen data que sugiere que avanzaron.
 *
 * Solo reporta, no modifica nada.
 */
import { readFileSync, existsSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import XLSX from 'xlsx'
import { resolve } from 'path'

if (existsSync(resolve('.env'))) {
  for (const raw of readFileSync('.env', 'utf-8').split('\n')) {
    const line = raw.replace(/\r$/, '').trim()
    if (!line || line.startsWith('#')) continue
    const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*[:=]\s*(.*)$/)
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

const SB_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SB_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
const sb = createClient(SB_URL, SB_KEY)
const { error: ae } = await sb.auth.signInWithPassword({ email: process.env.MIGRATION_AUTH_EMAIL, password: process.env.MIGRATION_AUTH_PASS })
if (ae) { console.error('Auth failed'); process.exit(1) }

const norm = s => String(s || '').trim().replace(/\s*-\s*/g, '-')
const strOf = v => String(v == null ? '' : v).trim()
const numOf = v => { const n = Number(v); return isNaN(n) ? 0 : n }

function excelDateToISO(v) {
  if (v == null || v === '' || v === 0) return null
  if (typeof v === 'number') {
    const d = XLSX.SSF.parse_date_code(v)
    if (!d) return null
    return `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`
  }
  const s = String(v).trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  return null
}

// Fetch stalled ops
const { data: stalled } = await sb.from('oportunidades')
  .select('id, etapa, notas, valor_cotizado, fecha_envio, empresa_id')
  .in('etapa', ['nuevo_lead', 'en_cotizacion'])

const stalledByCot = new Map()
for (const op of stalled || []) {
  const m = String(op.notas || '').match(/cot:\s*([^|]+?)(?:\s*\|.*)?$/is)
  if (m) stalledByCot.set(norm(m[1]), op)
}

console.log(`Oportunidades estancadas en BD: ${stalledByCot.size}\n`)

// Read MAESTRO
const wbM = XLSX.readFile('scripts/data/REGISTRO_MAESTRO.xlsx')
const rowsM = XLSX.utils.sheet_to_json(wbM.Sheets['TOTAL'], { header: 1, defval: '' }).slice(1)
const maestroByCot = new Map()
for (const r of rowsM) {
  const cot = norm(strOf(r[6]))
  if (!cot) continue
  maestroByCot.set(cot, {
    cotizador: strOf(r[5]),
    valor: numOf(r[7]),
    estado: strOf(r[8]).toUpperCase(),
    empresa: strOf(r[10]),
    fechaFinalizacion: excelDateToISO(r[4]),  // columna fecha finalización
    valorAdjudicado: numOf(r[9]),
    fechaAdj: excelDateToISO(r[11]),
  })
}

// Read 2026
const wb26 = XLSX.readFile('scripts/data/REGISTRO COTIZACIONES DURATA 2026.xlsx')
const rows26 = XLSX.utils.sheet_to_json(wb26.Sheets['REGISTRO 2026'], { header: 1, defval: '' }).slice(5)
const sheetByCot = new Map()
for (const r of rows26) {
  const cot = norm(strOf(r[13]))
  if (!cot) continue
  sheetByCot.set(cot, {
    estadoEnvio: strOf(r[1]).toUpperCase(),  // ENV / PEND / etc
    proyecto: strOf(r[3]),
    empresa: strOf(r[4]),
    fechaEnvio: excelDateToISO(r[8]),
    valor: numOf(r[15]),
    estadoFinal: strOf(r[16]).toUpperCase(), // COTIZADA / ADJUDICADA / PERDIDA
    valorAdj: numOf(r[17]),
    fechaAdj: excelDateToISO(r[18]),
  })
}

// Cross-check
console.log('COT         | BD etapa      | Excel MAESTRO estado | 2026 estadoB | 2026 estadoQ | fechaEnvio | valor     | Sugerencia')
console.log('─'.repeat(145))

const updates = []
for (const [cot, op] of stalledByCot) {
  const m = maestroByCot.get(cot) || {}
  const s = sheetByCot.get(cot) || {}

  // Determinar etapa sugerida
  let sugerida = null
  if (m.estado === 'ADJUDICADA' || s.estadoFinal === 'ADJUDICADA') sugerida = 'adjudicada'
  else if (m.estado === 'PERDIDA' || s.estadoFinal === 'PERDIDA') sugerida = 'perdida'
  else if (m.estado === 'COTIZADA' || s.estadoFinal === 'COTIZADA' || s.estadoEnvio === 'ENV') sugerida = 'cotizacion_enviada'

  const ordenActual = { nuevo_lead: 0, en_cotizacion: 1, cotizacion_enviada: 2, en_seguimiento: 3, en_negociacion: 4, adjudicada: 5, perdida: 5 }
  const avanzar = sugerida && ordenActual[sugerida] > ordenActual[op.etapa]

  console.log(
    `${cot.padEnd(11)} | ${op.etapa.padEnd(13)} | ${(m.estado || '?').padEnd(20)} | ${(s.estadoEnvio || '?').padEnd(12)} | ${(s.estadoFinal || '?').padEnd(12)} | ${(s.fechaEnvio || '?').padEnd(10)} | ${String(s.valor || m.valor || 0).padEnd(9)} | ${avanzar ? '→ ' + sugerida : '(mantener)'}`
  )

  if (avanzar) {
    updates.push({
      id: op.id, cot,
      etapa: sugerida,
      fecha_envio: s.fechaEnvio || null,
      valor_cotizado: s.valor || m.valor || 0,
      ubicacion: s.proyecto || null,
      valor_adjudicado: (sugerida === 'adjudicada') ? (s.valorAdj || m.valorAdjudicado || 0) : undefined,
      fecha_adjudicacion: (sugerida === 'adjudicada') ? (s.fechaAdj || m.fechaAdj || null) : undefined,
    })
  }
}

console.log(`\n✓ ${updates.length} oportunidades a actualizar\n`)
console.log('Sugerencia de updates:')
for (const u of updates) {
  console.log(`  ${u.cot.padEnd(11)} → ${u.etapa}, fecha_envio=${u.fecha_envio}, valor=${u.valor_cotizado}`)
}

// Save updates for next step
import { writeFileSync } from 'fs'
writeFileSync('scripts/data/_estancadas-updates.json', JSON.stringify(updates, null, 2))
console.log(`\nGuardado: scripts/data/_estancadas-updates.json`)

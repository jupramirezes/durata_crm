#!/usr/bin/env node
/**
 * Cross-check integral: REGISTRO_MAESTRO.xlsx vs Supabase
 *
 * Verifica:
 *   1. Las 13 cots con total=0 en BD — ¿qué dice el MAESTRO?
 *   2. Conteos y sumas año por año (2017-2026)
 *   3. Dashboard 2026 mes por mes
 *
 * Uso: node scripts/_check-cots-maestro.mjs
 */

import XLSX from 'xlsx'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

// Minimal .env loader (accepts both KEY=value and KEY: value)
try {
  const env = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '..', '.env'), 'utf-8')
  for (const line of env.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*[=:]\s*(.*)\s*$/i)
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
    }
  }
} catch {}

const __dirname = dirname(fileURLToPath(import.meta.url))
const MAESTRO_PATH = resolve(__dirname, 'data/REGISTRO_MAESTRO.xlsx')

const SUPA_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
if (!SUPA_URL || !SUPA_KEY) {
  console.error('Missing SUPABASE env vars')
  process.exit(1)
}
const sb = createClient(SUPA_URL, SUPA_KEY)

// Auth (necesario por RLS — uso mismas credenciales que migrar-historico.ts)
const AUTH_EMAIL = process.env.MIGRATION_AUTH_EMAIL
const AUTH_PASS = process.env.MIGRATION_AUTH_PASS
if (AUTH_EMAIL && AUTH_PASS) {
  const { error } = await sb.auth.signInWithPassword({ email: AUTH_EMAIL, password: AUTH_PASS })
  if (error) { console.error('Auth failed:', error.message); process.exit(1) }
  console.log(`  Autenticado como ${AUTH_EMAIL}`)
}

// ─────────────────────────────────────────────────────────
// 1. Load MAESTRO
// ─────────────────────────────────────────────────────────
console.log(`\n▸ Reading ${MAESTRO_PATH}`)
const wb = XLSX.readFile(MAESTRO_PATH)
const ws = wb.Sheets['TOTAL']
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
console.log(`  MAESTRO.TOTAL: ${rows.length - 1} filas de datos`)

// Column indices (confirmed via header inspection):
// 1=fecha_fin, 2=anio, 3=mes, 4=dias, 5=cotizador, 6=numero,
// 7=valor, 8=estado ("COTIZADA"/"ADJUDICADA"/...), 9=valor_adj, 11=fecha_adj
function normNum(raw) {
  return String(raw || '').trim().replace(/\s*-\s*/g, '-')
}

function excelDateToISO(v) {
  if (!v) return null
  if (typeof v === 'number') {
    const d = new Date((v - 25569) * 86400 * 1000)
    return d.toISOString().slice(0, 10)
  }
  return null
}

// Build MAESTRO map: numero → { valor, estado, anio, fecha_fin }
const MES_MAP = { ENERO:1,FEBRERO:2,MARZO:3,ABRIL:4,MAYO:5,JUNIO:6,JULIO:7,AGOSTO:8,SEPTIEMBRE:9,OCTUBRE:10,NOVIEMBRE:11,DICIEMBRE:12 }
const maestroMap = new Map()
for (let i = 1; i < rows.length; i++) {
  const r = rows[i]
  const num = normNum(r[6])
  if (!num) continue
  const mesRaw = String(r[3] || '').toUpperCase().trim()
  maestroMap.set(num, {
    valor: Number(r[7]) || 0,
    estado: String(r[8] || '').toUpperCase().trim(),
    anio: Number(r[2]) || null,
    mes: MES_MAP[mesRaw] || Number(mesRaw) || null,
    fecha_fin: excelDateToISO(r[1]),
    valor_adj: Number(r[9]) || 0,
    fecha_adj: excelDateToISO(r[11]),
  })
}
console.log(`  MAESTRO distinct numeros: ${maestroMap.size}`)

// ─────────────────────────────────────────────────────────
// 2. Load Supabase cots (all)
// ─────────────────────────────────────────────────────────
console.log(`\n▸ Reading Supabase cotizaciones`)
const allCots = []
let from = 0
const PAGE = 1000
while (true) {
  const { data, error } = await sb
    .from('cotizaciones')
    .select('id, numero, estado, total, fecha, fecha_envio, oportunidad_id, created_at')
    .range(from, from + PAGE - 1)
  if (error) { console.error(error); process.exit(1) }
  if (!data || data.length === 0) break
  allCots.push(...data)
  if (data.length < PAGE) break
  from += PAGE
}
console.log(`  Supabase cotizaciones: ${allCots.length}`)

const supaMap = new Map()
for (const c of allCots) supaMap.set(normNum(c.numero), c)

// ─────────────────────────────────────────────────────────
// 3. SECTION A: las 13 cots con total=0 — ¿qué dice MAESTRO?
// ─────────────────────────────────────────────────────────
const zeroTotal = allCots.filter(c =>
  !['descartada','rechazada','borrador'].includes(c.estado) &&
  (c.total == null || Number(c.total) === 0)
)
console.log(`\n════════════════════════════════════════════════════════════════`)
console.log(`SECCIÓN A — ${zeroTotal.length} cots en BD con total=0 (activas)`)
console.log(`════════════════════════════════════════════════════════════════`)
console.log('Numero          | BD estado | MAESTRO valor | MAESTRO estado | Accion sugerida')
console.log('─'.repeat(100))
let actionableZeros = 0
for (const c of zeroTotal.sort((a, b) => a.numero.localeCompare(b.numero))) {
  const m = maestroMap.get(normNum(c.numero))
  const action = !m
    ? 'NO EN MAESTRO → descartar'
    : m.valor > 0
    ? `UPDATE total=${m.valor}`
    : 'OK (MAESTRO también 0)'
  if (action !== 'OK (MAESTRO también 0)') actionableZeros++
  console.log(
    `${c.numero.padEnd(16)}| ${String(c.estado).padEnd(10)}| ${
      m ? String(m.valor).padStart(13) : '(no encontrado)'.padStart(13)
    } | ${m ? (m.estado || '-').padEnd(15) : '-'.padEnd(15)}| ${action}`
  )
}

// ─────────────────────────────────────────────────────────
// 4. SECTION B: cross-check año por año
// ─────────────────────────────────────────────────────────
console.log(`\n════════════════════════════════════════════════════════════════`)
console.log(`SECCIÓN B — Cross-check año por año`)
console.log(`════════════════════════════════════════════════════════════════`)
console.log('Año  | MAESTRO cots | Supa cots activ | Δ cots | MAESTRO $         | Supa $            | Δ $')
console.log('─'.repeat(110))

// Aggregate MAESTRO by year
const maestroByYear = new Map()
for (const [num, m] of maestroMap) {
  if (!m.anio) continue
  const y = m.anio
  if (!maestroByYear.has(y)) maestroByYear.set(y, { count: 0, sum: 0 })
  const ref = maestroByYear.get(y)
  ref.count++
  ref.sum += m.valor
}

// Aggregate Supabase by year — use SAME logic as MAESTRO (fiscal year by fecha_envio)
// MAESTRO.AÑO column = anio comercial (= anio de fecha_finalizacion = fecha_envio en BD)
function yearFromCot(c) {
  // Prefer fecha_envio (matches MAESTRO "FECHA FINALIZACION" / AÑO column)
  if (c.fecha_envio) return Number(String(c.fecha_envio).slice(0, 4))
  if (c.fecha) return Number(String(c.fecha).slice(0, 4))
  // Fallback to numero prefix
  const m = String(c.numero || '').match(/^(\d{4})-/)
  if (m) return Number(m[1])
  return null
}

const supaByYear = new Map()
for (const c of allCots) {
  // MATCH DASHBOARD: excluye descartada + borradores con total=0
  if (c.estado === 'descartada') continue
  if (c.estado === 'borrador' && (!c.total || Number(c.total) === 0)) continue
  const y = yearFromCot(c)
  if (!y) continue
  if (!supaByYear.has(y)) supaByYear.set(y, { count: 0, sum: 0 })
  const ref = supaByYear.get(y)
  ref.count++
  ref.sum += Number(c.total) || 0
}

const allYears = [...new Set([...maestroByYear.keys(), ...supaByYear.keys()])].sort()
let totalMaestroSum = 0, totalSupaSum = 0, totalMaestroCount = 0, totalSupaCount = 0
for (const y of allYears) {
  const m = maestroByYear.get(y) || { count: 0, sum: 0 }
  const s = supaByYear.get(y) || { count: 0, sum: 0 }
  totalMaestroCount += m.count
  totalSupaCount += s.count
  totalMaestroSum += m.sum
  totalSupaSum += s.sum
  const delta_c = s.count - m.count
  const delta_s = s.sum - m.sum
  const mark = delta_c === 0 && delta_s === 0 ? '✓' : '⚠'
  console.log(
    `${String(y).padEnd(5)}| ${String(m.count).padStart(12)} | ${String(s.count).padStart(15)} | ${
      (delta_c > 0 ? '+' + delta_c : String(delta_c)).padStart(6)
    } | ${m.sum.toLocaleString('es-CO').padStart(17)} | ${s.sum.toLocaleString('es-CO').padStart(17)} | ${
      ((delta_s >= 0 ? '+' : '') + delta_s.toLocaleString('es-CO')).padStart(15)
    } ${mark}`
  )
}
console.log('─'.repeat(110))
console.log(
  `TOT  | ${String(totalMaestroCount).padStart(12)} | ${String(totalSupaCount).padStart(15)} | ${
    String(totalSupaCount - totalMaestroCount).padStart(6)
  } | ${totalMaestroSum.toLocaleString('es-CO').padStart(17)} | ${totalSupaSum.toLocaleString('es-CO').padStart(17)} | ${
    ((totalSupaSum - totalMaestroSum >= 0 ? '+' : '') + (totalSupaSum - totalMaestroSum).toLocaleString('es-CO')).padStart(15)
  }`
)

// ─────────────────────────────────────────────────────────
// 5. SECTION C: Dashboard 2026 mes por mes
// ─────────────────────────────────────────────────────────
console.log(`\n════════════════════════════════════════════════════════════════`)
console.log(`SECCIÓN C — Dashboard 2026 mes por mes`)
console.log(`════════════════════════════════════════════════════════════════`)

const m2026 = new Map()
for (const [num, m] of maestroMap) {
  if (m.anio !== 2026) continue
  const mes = m.mes || (m.fecha_fin ? Number(m.fecha_fin.slice(5,7)) : null)
  if (!mes) continue
  if (!m2026.has(mes)) m2026.set(mes, { count: 0, sum: 0 })
  const ref = m2026.get(mes)
  ref.count++
  ref.sum += m.valor
}

const s2026 = new Map()
for (const c of allCots) {
  // MATCH DASHBOARD LOGIC: excluye descartada + borradores con total=0
  if (c.estado === 'descartada') continue
  if (c.estado === 'borrador' && (!c.total || Number(c.total) === 0)) continue
  const y = yearFromCot(c)
  if (y !== 2026) continue
  const dateStr = c.fecha_envio || c.fecha
  if (!dateStr) continue
  const mes = Number(String(dateStr).slice(5,7))
  if (!mes) continue
  if (!s2026.has(mes)) s2026.set(mes, { count: 0, sum: 0 })
  const ref = s2026.get(mes)
  ref.count++
  ref.sum += Number(c.total) || 0
}

console.log('Mes | MAESTRO cots | Supa cots | Δ cots | MAESTRO $       | Supa $          | Δ $')
console.log('─'.repeat(100))
const mesesAbr = { 1:'Ene',2:'Feb',3:'Mar',4:'Abr',5:'May',6:'Jun',7:'Jul',8:'Ago',9:'Sep',10:'Oct',11:'Nov',12:'Dic' }
let tmc=0, tsc=0, tms=0, tss=0
for (let mes = 1; mes <= 12; mes++) {
  const m = m2026.get(mes) || { count: 0, sum: 0 }
  const s = s2026.get(mes) || { count: 0, sum: 0 }
  if (m.count === 0 && s.count === 0) continue
  tmc += m.count; tsc += s.count; tms += m.sum; tss += s.sum
  const mark = m.count === s.count && Math.abs(m.sum - s.sum) < 1 ? '✓' : '⚠'
  console.log(
    `${mesesAbr[mes].padEnd(4)}| ${String(m.count).padStart(12)} | ${String(s.count).padStart(9)} | ${
      String(s.count - m.count).padStart(6)
    } | ${m.sum.toLocaleString('es-CO').padStart(15)} | ${s.sum.toLocaleString('es-CO').padStart(15)} | ${
      ((s.sum - m.sum).toLocaleString('es-CO')).padStart(12)
    } ${mark}`
  )
}
console.log('─'.repeat(100))
console.log(
  `TOT | ${String(tmc).padStart(12)} | ${String(tsc).padStart(9)} | ${String(tsc - tmc).padStart(6)} | ${
    tms.toLocaleString('es-CO').padStart(15)
  } | ${tss.toLocaleString('es-CO').padStart(15)} | ${
    (tss - tms).toLocaleString('es-CO').padStart(12)
  }`
)

// ─────────────────────────────────────────────────────────
// 6. SECTION D: cots en BD ausentes del MAESTRO (legado a limpiar)
// ─────────────────────────────────────────────────────────
console.log(`\n════════════════════════════════════════════════════════════════`)
console.log(`SECCIÓN D — Cots en BD ausentes del MAESTRO`)
console.log(`════════════════════════════════════════════════════════════════`)
const huerfanas = []
for (const c of allCots) {
  if (['descartada','rechazada'].includes(c.estado)) continue
  if (!maestroMap.has(normNum(c.numero))) {
    huerfanas.push(c)
  }
}
console.log(`  ${huerfanas.length} cotizaciones activas en BD NO están en MAESTRO`)
if (huerfanas.length > 0 && huerfanas.length <= 30) {
  for (const c of huerfanas) {
    console.log(`    ${c.numero.padEnd(24)} estado=${c.estado.padEnd(10)} total=${c.total}`)
  }
} else if (huerfanas.length > 30) {
  console.log(`  (primeras 30)`)
  for (const c of huerfanas.slice(0, 30)) {
    console.log(`    ${c.numero.padEnd(24)} estado=${c.estado.padEnd(10)} total=${c.total}`)
  }
}

// ─────────────────────────────────────────────────────────
// 7. SECTION E: cots en MAESTRO ausentes de BD (faltantes)
// ─────────────────────────────────────────────────────────
console.log(`\n════════════════════════════════════════════════════════════════`)
console.log(`SECCIÓN E — Cots en MAESTRO ausentes de BD (no migradas)`)
console.log(`════════════════════════════════════════════════════════════════`)
const faltantes = []
for (const [num, m] of maestroMap) {
  if (m.anio === 1900) continue // filas con fecha rota
  if (!supaMap.has(num)) {
    faltantes.push({ numero: num, ...m })
  } else {
    // Si existe pero está descartada/rechazada y MAESTRO dice activa, también es faltante efectivo
    const s = supaMap.get(num)
    if (['descartada','rechazada'].includes(s.estado) && ['COTIZADA','ADJUDICADA'].includes(m.estado)) {
      faltantes.push({ numero: num, ...m, nota: `en BD como ${s.estado}` })
    }
  }
}
console.log(`  ${faltantes.length} cotizaciones del MAESTRO ausentes/rechazadas en BD`)
console.log(`  Total valor MAESTRO de las faltantes: $${faltantes.reduce((a, f) => a + f.valor, 0).toLocaleString('es-CO')}\n`)

// Agrupar por año para priorizar
const faltByYear = new Map()
for (const f of faltantes) {
  if (!faltByYear.has(f.anio)) faltByYear.set(f.anio, [])
  faltByYear.get(f.anio).push(f)
}
for (const [y, list] of [...faltByYear.entries()].sort((a,b)=>a[0]-b[0])) {
  const sumY = list.reduce((a, f) => a + f.valor, 0)
  console.log(`  ${y}: ${list.length} cots, $${sumY.toLocaleString('es-CO')}`)
  for (const f of list.slice(0, 20)) {
    console.log(`    ${f.numero.padEnd(16)} ${String(f.estado).padEnd(12)} $${String(f.valor).padStart(12)} ${f.fecha_fin || '-'}${f.nota ? ' — ' + f.nota : ''}`)
  }
  if (list.length > 20) console.log(`    ... +${list.length - 20} más`)
}

// ─────────────────────────────────────────────────────────
// 8. SECTION F: campos desalineados (mismo número, distinto total/fecha)
// ─────────────────────────────────────────────────────────
console.log(`\n════════════════════════════════════════════════════════════════`)
console.log(`SECCIÓN F — Cots con mismatch total/fecha_envio (solo 2026)`)
console.log(`════════════════════════════════════════════════════════════════`)

const mismatches = []
for (const [num, m] of maestroMap) {
  if (m.anio !== 2026) continue
  const s = supaMap.get(num)
  if (!s) continue
  if (['descartada','rechazada'].includes(s.estado)) continue

  const mValor = Number(m.valor) || 0
  const sTotal = Number(s.total) || 0
  const fechaDiff = m.fecha_fin !== s.fecha_envio
  const totalDiff = Math.abs(mValor - sTotal) > 0.5

  if (fechaDiff || totalDiff) {
    mismatches.push({
      numero: num,
      maestro_valor: mValor,
      supa_total: sTotal,
      maestro_fecha: m.fecha_fin,
      supa_fecha: s.fecha_envio,
      supa_estado: s.estado,
    })
  }
}

console.log(`  ${mismatches.length} mismatches en 2026`)
console.log('Numero       | MAESTRO valor | Supa total   | MAESTRO fecha | Supa fecha    | Estado BD')
console.log('─'.repeat(120))
for (const m of mismatches) {
  const valDiff = m.maestro_valor !== m.supa_total
  const fechaDiff = m.maestro_fecha !== m.supa_fecha
  console.log(
    `${m.numero.padEnd(13)}| ${String(m.maestro_valor).padStart(13)} | ${String(m.supa_total).padStart(12)} | ${
      String(m.maestro_fecha || '-').padEnd(13)
    } | ${String(m.supa_fecha || '-').padEnd(13)} | ${m.supa_estado}` +
    (valDiff ? ' [VALOR]' : '') +
    (fechaDiff ? ' [FECHA]' : '')
  )
}
const sumMaestro = mismatches.reduce((a, m) => a + m.maestro_valor, 0)
const sumSupa = mismatches.reduce((a, m) => a + m.supa_total, 0)
console.log('─'.repeat(120))
console.log(`  Suma MAESTRO: $${sumMaestro.toLocaleString('es-CO')}`)
console.log(`  Suma Supa:    $${sumSupa.toLocaleString('es-CO')}`)
console.log(`  Delta:        $${(sumSupa - sumMaestro).toLocaleString('es-CO')}`)

console.log(`\n═══ REPORTE COMPLETO ═══\n`)

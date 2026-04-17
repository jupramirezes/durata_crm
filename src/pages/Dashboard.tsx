import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { ETAPAS, COTIZADORES, Etapa, matchCotizador, findCotizador } from '../types'
import { formatCOP, daysSince, getAvatarColor } from '../lib/utils'
import { PageHeader, KPICard, EtapaBadge } from '../components/ui'
import { Target, DollarSign, FileText, TrendingUp, Users, BarChart3, CalendarClock, Calendar, ArrowUpRight, ArrowDownRight, Minus, ChevronRight, Bell, AlertTriangle } from 'lucide-react'

/* ── helpers ───────────────────────────────────────────── */

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const FULL_MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function monthLabel(year: number, month: number) {
  return `${MONTH_NAMES[month]} ${year}`
}

/** Parse "YYYY-MM-DD" as LOCAL date (not UTC).
 * Critical: new Date('2026-04-01') treats it as UTC midnight, which in Colombia (UTC-5)
 * becomes 2026-03-31 19:00 local — silently shifting the month. This function avoids that. */
function parseLocalDate(s?: string | null): Date | null {
  if (!s) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(s)
  if (!match) return null
  const [, y, m, d] = match
  return new Date(Number(y), Number(m) - 1, Number(d))
}
function getMonthLocal(s?: string | null): number { return parseLocalDate(s)?.getMonth() ?? -1 }
function getYearLocal(s?: string | null): number { return parseLocalDate(s)?.getFullYear() ?? -1 }

/** Calculates days between fecha_ingreso and fecha_envio for oportunidades that have both.
 * Guards against null/empty fecha_ingreso which new Date() interprets as epoch 1970 and
 * produces absurd ~20500 day values. */
function calcDiasElaboracion(ops: { fecha_ingreso?: string | null; fecha_envio?: string | null }[]): number[] {
  const dias: number[] = []
  for (const o of ops) {
    if (!o.fecha_envio || !o.fecha_ingreso) continue
    const ingDate = parseLocalDate(o.fecha_ingreso)
    const envDate = parseLocalDate(o.fecha_envio)
    if (!ingDate || !envDate) continue
    const ing = ingDate.getTime()
    const env = envDate.getTime()
    if (!isFinite(ing) || !isFinite(env) || ing <= 0 || env <= 0) continue
    const diff = Math.floor((env - ing) / 86400000)
    // Cap outliers: if diff > 365 days it's almost certainly bad data (old fecha_ingreso)
    if (diff >= 0 && diff <= 365) dias.push(diff)
  }
  return dias
}

/** Calculates days between fecha (cotización creation) and fecha_envio for cotizaciones.
 * Used for monthly/yearly metrics — aligns with Excel REGISTRO which measures per-cotización. */
function calcDiasCotizaciones(cots: { fecha?: string | null; fecha_envio?: string | null }[]): number[] {
  const dias: number[] = []
  for (const c of cots) {
    if (!c.fecha || !c.fecha_envio) continue
    const iniDate = parseLocalDate(c.fecha)
    const envDate = parseLocalDate(c.fecha_envio)
    if (!iniDate || !envDate) continue
    const ini = iniDate.getTime()
    const env = envDate.getTime()
    if (!isFinite(ini) || !isFinite(env) || ini <= 0 || env <= 0) continue
    const diff = Math.floor((env - ini) / 86400000)
    if (diff >= 0 && diff <= 365) dias.push(diff)
  }
  return dias
}

/** Returns -1 as sentinel for "no data" (empty array). 0 = same-day avg (valid).
 * fmtDias distinguishes: -1 → "—", 0-0.5 → "<1d", else → "N.Nd". */
function avgDias(dias: number[]): number {
  return dias.length > 0 ? dias.reduce((s, d) => s + d, 0) / dias.length : -1
}

function fmtDias(val: number): string {
  if (!isFinite(val) || val < 0) return '—'
  if (val < 0.5) return '<1d'
  return `${val.toFixed(1)}d`
}

/** Percent badge with color coding: green >15%, yellow 8-15%, red <8% */
function PctBadge({ value }: { value: number }) {
  const cls = value >= 15 ? 'bg-[#ecfdf5] text-[#059669]'
    : value >= 8 ? 'bg-[#fffbeb] text-[#d97706]'
    : value > 0 ? 'bg-[#fef2f2] text-[#dc2626]'
    : 'bg-gray-100 text-gray-400'
  return <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>{value.toFixed(1)}%</span>
}

/** Variation badge */
function VariationBadge({ value, suffix = '%', invert = false }: { value: number; suffix?: string; invert?: boolean }) {
  const positive = invert ? value < 0 : value > 0
  const negative = invert ? value > 0 : value < 0
  if (Math.abs(value) < 0.1) return <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Minus size={10} />0{suffix}</span>
  return (
    <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${positive ? 'text-emerald-600' : negative ? 'text-red-500' : 'text-gray-400'}`}>
      {positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
      {value > 0 ? '+' : ''}{value.toFixed(1)}{suffix}
    </span>
  )
}

// D-11: 'recotizada' ahora es estado terminal alternativo — NO cuenta como pipeline activo.
const PIPELINE_ACTIVO: Etapa[] = ['cotizacion_enviada', 'en_seguimiento', 'en_negociacion']
const MIN_PIPELINE_VALOR = 20_000_000

/* ── types ────────────────────────────────────────────── */

type MetricsRow = {
  label: string
  cotQty: number
  cotValor: number
  adjQty: number
  adjValor: number
  pctAdj: number
  avgCot: number
  avgAdj: number
  avgDias: number
}

/* ── Section wrapper ─────────────────────────────────── */
function Section({ title, subtitle, icon: Icon, summary, children, defaultOpen = false }: {
  title: string; subtitle?: string; icon: React.ElementType; summary?: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-7 py-6 hover:bg-[#f8fafc] transition-colors text-left cursor-pointer">
        <ChevronRight size={20} className={`text-[var(--color-text-muted)] shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
        <Icon size={20} className="text-[var(--color-primary)] shrink-0" />
        <div className="flex-1 min-w-0 ml-1">
          <h3 className="font-semibold text-[17px] text-[var(--color-text)]">{title}</h3>
          {subtitle && !open && <p className="text-[13px] text-[#94a3b8] mt-0.5">{subtitle}</p>}
        </div>
        {summary && !open && <span className="text-sm font-semibold text-[var(--color-primary)] tabular-nums shrink-0">{summary}</span>}
      </button>
      {open && (
        <div className="px-7 pb-6 animate-fade-in">
          {subtitle && <p className="text-[13px] text-[#94a3b8] mb-4">{subtitle}</p>}
          {children}
        </div>
      )}
    </div>
  )
}

/* ── component ─────────────────────────────────────────── */

export default function Dashboard() {
  const { state, refresh } = useStore()
  const [refreshing, setRefreshing] = useState(false)
  async function handleRefresh() {
    setRefreshing(true)
    try { await refresh() } finally { setRefreshing(false) }
  }
  const { oportunidades, cotizaciones, empresas } = state
  const navigate = useNavigate()

  const now = new Date()
  const dateStr = now.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const currentMonthLabel = `${FULL_MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`

  // Pre-build lookup: oportunidad_id -> oportunidad
  const opMap = useMemo(() => new Map(oportunidades.map(o => [o.id, o])), [oportunidades])

  // Pre-build lookup: empresa_id -> empresa name
  const empresaNameMap = useMemo(() => new Map(empresas.map(e => [e.id, e.nombre])), [empresas])

  /* ── ALERTAS: cotizaciones sin respuesta ────────────── */
  const alertas = useMemo(() => {
    const nowMs = Date.now()
    const items = oportunidades
      .filter(o => o.etapa === 'cotizacion_enviada')
      .map(o => {
        // Prefer fecha_envio > fecha_ingreso > fecha_ultimo_contacto.
        // If ALL are null (common in historical data), skip — we can't compute age.
        const refDate = o.fecha_envio || o.fecha_ingreso || o.fecha_ultimo_contacto
        if (!refDate) return null
        const refMs = new Date(refDate).getTime()
        if (!Number.isFinite(refMs) || refMs <= 0) return null
        const dias = Math.floor((nowMs - refMs) / 86400000)
        // Sanity cap: reject absurd values (more than 10 years) — data corruption
        if (dias > 3650 || dias < 0) return null
        const cots = cotizaciones.filter(c => c.oportunidad_id === o.id)
        const ultimaCot = cots.length > 0 ? cots.sort((a, b) => b.numero.localeCompare(a.numero))[0] : null
        return {
          id: o.id,
          empresa: empresaNameMap.get(o.empresa_id) || '—',
          cotizacion: ultimaCot ? `COT-${ultimaCot.numero}` : '—',
          valor: o.valor_cotizado,
          dias,
          cotizador: findCotizador(o.cotizador_asignado)?.iniciales || '—',
        }
      })
      .filter((a): a is NonNullable<typeof a> => a !== null && a.dias > 7)
      .sort((a, b) => b.dias - a.dias)
    const over7 = items.length
    const over14 = items.filter(a => a.dias > 14).length
    const over30 = items.filter(a => a.dias > 30).length
    return { items, over7, over14, over30 }
  }, [oportunidades, cotizaciones, empresaNameMap])

  /* ── SECCIÓN 1: Resumen general ───────────────────── */
  const { activas, valorPipeline, cotsMes, totalMes, tasaCierre, tasaCierreValor, etapaCounts, totalOps, adjOportunidades } = useMemo(() => {
    // D-11: 'recotizada' es estado terminal — se excluye del pipeline activo para no inflar el KPI.
    const activas = oportunidades.filter(o => o.etapa !== 'adjudicada' && o.etapa !== 'perdida' && o.etapa !== 'recotizada')
    const valorPipeline = activas.reduce((s, o) => s + o.valor_cotizado, 0)
    // D-09: Match Excel REGISTRO = todas las cotizaciones cotizadas (enviadas/aprobadas/rechazadas/borrador con valor).
    // Solo se excluyen las 'descartada' (versiones viejas de recotizaciones) y borradores vacíos (total=0).
    const activeCots = cotizaciones.filter(c => c.estado !== 'descartada' && !(c.estado === 'borrador' && c.total === 0))
    const cotsMes = activeCots.filter(c => {
      return getMonthLocal(c.fecha_envio || c.fecha) === now.getMonth() && getYearLocal(c.fecha_envio || c.fecha) === now.getFullYear()
    })
    const totalMes = cotsMes.reduce((s, c) => s + c.total, 0)
    const adjOps = oportunidades.filter(o => o.etapa === 'adjudicada')
    const perOps = oportunidades.filter(o => o.etapa === 'perdida')
    // Tasa por CANTIDAD (original)
    const tasaCierre = adjOps.length + perOps.length > 0 ? Math.round((adjOps.length / (adjOps.length + perOps.length)) * 100) : 0
    // Tasa por VALOR: suma adjudicado / (suma adjudicado + suma cotizado perdido)
    const valorAdjudicado = adjOps.reduce((s, o) => s + (o.valor_adjudicado || o.valor_cotizado || 0), 0)
    const valorPerdido = perOps.reduce((s, o) => s + (o.valor_cotizado || 0), 0)
    const tasaCierreValor = valorAdjudicado + valorPerdido > 0
      ? Math.round((valorAdjudicado / (valorAdjudicado + valorPerdido)) * 100)
      : 0
    const etapaCounts = ETAPAS.map(e => ({ ...e, count: oportunidades.filter(o => o.etapa === e.key).length }))
    const totalOps = oportunidades.length || 1
    return { activas, valorPipeline, cotsMes, totalMes, tasaCierre, tasaCierreValor, etapaCounts, totalOps, adjOportunidades: adjOps }
  }, [oportunidades, cotizaciones])

  function getAdjMonth(o: typeof oportunidades[0]): { year: number; month: number } | null {
    const fa = o.fecha_adjudicacion
    if (fa) {
      const d = parseLocalDate(fa)
      if (d) return { year: d.getFullYear(), month: d.getMonth() }
    }
    if (o.fecha_ultimo_contacto) {
      const d = parseLocalDate(o.fecha_ultimo_contacto)
      if (d) return { year: d.getFullYear(), month: d.getMonth() }
    }
    return null
  }

  /* ── SECCIÓN 2: Métricas mensuales (últimos 6 meses) */
  const last6: { year: number; month: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    last6.push({ year: d.getFullYear(), month: d.getMonth() })
  }

  function buildMonthRow(year: number, month: number): MetricsRow {
    // D-09: Excluir borradores (no son cotizaciones emitidas)
    const cotsM = cotizaciones
      .filter(c => c.estado !== 'descartada' && !(c.estado === 'borrador' && c.total === 0))
      .filter(c => getMonthLocal(c.fecha_envio || c.fecha) === month && getYearLocal(c.fecha_envio || c.fecha) === year)
    const cotValor = cotsM.reduce((s, c) => s + c.total, 0)

    const adjOps = adjOportunidades.filter(o => {
      const m = getAdjMonth(o)
      return m && m.year === year && m.month === month
    })
    const adjValor = adjOps.reduce((s, o) => s + o.valor_adjudicado, 0)

    const pctAdj = cotValor > 0 ? (adjValor / cotValor) * 100 : 0

    const avgCot = cotsM.length > 0 ? cotValor / cotsM.length : 0
    const avgAdj = adjOps.length > 0 ? adjValor / adjOps.length : 0

    // D-09: Usar fecha de la cotización (creación → envío) para que coincida con el Excel REGISTRO.
    // Antes se usaba fecha_ingreso/fecha_envio de la oportunidad, que frecuentemente son iguales.
    const diasArr = calcDiasCotizaciones(cotsM)

    return { label: monthLabel(year, month), cotQty: cotsM.length, cotValor, adjQty: adjOps.length, adjValor, pctAdj, avgCot, avgAdj, avgDias: avgDias(diasArr) }
  }

  const monthRows = useMemo(() => last6.map(m => buildMonthRow(m.year, m.month)), [oportunidades, cotizaciones])

  /* ── SECCIÓN 3: Métricas por cotizador ─────────────── */
  const cotizadorRows = useMemo(() => COTIZADORES.map(cot => {
    const opsC = oportunidades.filter(o => matchCotizador(o.cotizador_asignado, cot.id))
    const cotsC = cotizaciones.filter(c => { const op = opMap.get(c.oportunidad_id); return op && matchCotizador(op.cotizador_asignado, cot.id) })
    const cotValor = cotsC.reduce((s, c) => s + c.total, 0)
    const adjOps = opsC.filter(o => o.etapa === 'adjudicada')
    const adjValor = adjOps.reduce((s, o) => s + o.valor_adjudicado, 0)

    const pctAdj = cotValor > 0 ? (adjValor / cotValor) * 100 : 0

    const avgCot = cotsC.length > 0 ? cotValor / cotsC.length : 0
    const avgAdj = adjOps.length > 0 ? adjValor / adjOps.length : 0

    const diasArr = calcDiasElaboracion(opsC)

    return { iniciales: cot.iniciales, nombre: cot.nombre, cotQty: cotsC.length, cotValor, adjQty: adjOps.length, adjValor, pctAdj, avgCot, avgAdj, avgDias: avgDias(diasArr) }
  }), [oportunidades, cotizaciones])

  /* ── SECCIÓN 4: Pipeline activo — Reunión semanal ─── */
  const pipelineActivo = useMemo(() => oportunidades
    .filter(o => PIPELINE_ACTIVO.includes(o.etapa) && o.valor_cotizado > MIN_PIPELINE_VALOR)
    .sort((a, b) => b.valor_cotizado - a.valor_cotizado)
    .map(o => {
      const empresa = empresas.find(e => e.id === o.empresa_id)
      const opCots = cotizaciones.filter(c => c.oportunidad_id === o.id)
      const lastCot = opCots[opCots.length - 1]
      const cotizador = findCotizador(o.cotizador_asignado)
      const diasEnvio = o.fecha_envio ? daysSince(o.fecha_envio) : null
      return { id: o.id, empresa: empresa?.nombre ?? '—', etapa: o.etapa, fechaEnvio: o.fecha_envio ?? null, numeroCot: lastCot?.numero ?? '—', valorCotizado: o.valor_cotizado, diasDesdeEnvio: diasEnvio, cotizador: cotizador?.iniciales ?? '—', cotizadorNombre: cotizador?.nombre ?? '' }
    }), [oportunidades, cotizaciones, empresas])

  /* ── SECCIÓN 5: Top 10 clientes ───────────────────── */
  const empresaStats = useMemo(() => empresas.map(emp => {
    const ops = oportunidades.filter(o => o.empresa_id === emp.id)
    const valorCotizado = ops.reduce((s, o) => s + o.valor_cotizado, 0)
    const valorAdjudicado = ops.filter(o => o.etapa === 'adjudicada').reduce((s, o) => s + o.valor_adjudicado, 0)
    const pctAdj = valorCotizado > 0 ? (valorAdjudicado / valorCotizado) * 100 : 0
    const diasArr = calcDiasElaboracion(ops)
    return { nombre: emp.nombre, opCount: ops.length, valorCotizado, valorAdjudicado, pctAdj, avgDias: avgDias(diasArr) }
  }).sort((a, b) => b.valorCotizado - a.valorCotizado).slice(0, 10), [oportunidades, empresas])

  /* ── SECCIÓN 6: Evolución anual ───────────────────── */
  const years = [2021, 2022, 2023, 2024, 2025, 2026]
  const { yearRows, totalRow } = useMemo(() => { const yearRows: MetricsRow[] = years.map(year => {
    // D-09: Excluir borradores (match Excel REGISTRO)
    const cotsY = cotizaciones
      .filter(c => c.estado !== 'descartada' && !(c.estado === 'borrador' && c.total === 0))
      .filter(c => getYearLocal(c.fecha_envio || c.fecha) === year)
    const cotValor = cotsY.reduce((s, c) => s + c.total, 0)

    const adjOpsY = adjOportunidades.filter(o => {
      const m = getAdjMonth(o)
      return m && m.year === year
    })
    const adjValor = adjOpsY.reduce((s, o) => s + o.valor_adjudicado, 0)
    const pctAdj = cotValor > 0 ? (adjValor / cotValor) * 100 : 0
    const avgCot = cotsY.length > 0 ? cotValor / cotsY.length : 0
    const avgAdj = adjOpsY.length > 0 ? adjValor / adjOpsY.length : 0

    // D-09: Días elaboración desde fecha cotización → fecha envío (cotización-level, no opp)
    const diasArr = calcDiasCotizaciones(cotsY)

    return { label: String(year), cotQty: cotsY.length, cotValor, adjQty: adjOpsY.length, adjValor, pctAdj, avgCot, avgAdj, avgDias: avgDias(diasArr) }
  })

  // TOTAL row
  const totalRow: MetricsRow = {
    label: 'TOTAL',
    cotQty: yearRows.reduce((s, r) => s + r.cotQty, 0),
    cotValor: yearRows.reduce((s, r) => s + r.cotValor, 0),
    adjQty: yearRows.reduce((s, r) => s + r.adjQty, 0),
    adjValor: yearRows.reduce((s, r) => s + r.adjValor, 0),
    pctAdj: yearRows.reduce((s, r) => s + r.cotValor, 0) > 0
      ? (yearRows.reduce((s, r) => s + r.adjValor, 0) / yearRows.reduce((s, r) => s + r.cotValor, 0)) * 100 : 0,
    avgCot: yearRows.reduce((s, r) => s + r.cotQty, 0) > 0
      ? yearRows.reduce((s, r) => s + r.cotValor, 0) / yearRows.reduce((s, r) => s + r.cotQty, 0) : 0,
    avgAdj: yearRows.reduce((s, r) => s + r.adjQty, 0) > 0
      ? yearRows.reduce((s, r) => s + r.adjValor, 0) / yearRows.reduce((s, r) => s + r.adjQty, 0) : 0,
    // D-09: TOTAL row también usa cotizaciones (no oportunidades) para consistencia con filas anuales
    avgDias: avgDias(calcDiasCotizaciones(
      cotizaciones.filter(c => c.estado !== 'descartada' && !(c.estado === 'borrador' && c.total === 0))
    )),
  }
  return { yearRows, totalRow }
  }, [oportunidades, cotizaciones])

  /* ── SECCIÓN 7: Comparativo vs año anterior ─────── */
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() // 0-indexed, so March = 2
  const periodLabel = `${MONTH_NAMES[0]}-${MONTH_NAMES[currentMonth]} ${currentYear}`
  const prevPeriodLabel = `${MONTH_NAMES[0]}-${MONTH_NAMES[currentMonth]} ${currentYear - 1}`

  function buildPeriodMetrics(year: number, throughMonth: number) {
    // D-09: Excluir borradores (match Excel REGISTRO)
    const periodCots = cotizaciones
      .filter(c => c.estado !== 'descartada' && !(c.estado === 'borrador' && c.total === 0))
      .filter(c => {
        const m = getMonthLocal(c.fecha_envio || c.fecha), y = getYearLocal(c.fecha_envio || c.fecha)
        return y === year && m >= 0 && m <= throughMonth
      })
    const cotValor = periodCots.reduce((s, c) => s + c.total, 0)
    const cotQty = periodCots.length

    const periodAdj = adjOportunidades.filter(o => {
      const m = getAdjMonth(o)
      return m && m.year === year && m.month <= throughMonth
    })
    const adjValor = periodAdj.reduce((s, o) => s + o.valor_adjudicado, 0)
    const adjQty = periodAdj.length

    const pctAdj = cotValor > 0 ? (adjValor / cotValor) * 100 : 0

    // D-09: Usar fecha/fecha_envio de la cotización (no de la oportunidad)
    const diasArr = calcDiasCotizaciones(periodCots)
    const dias = avgDias(diasArr)

    return { cotQty, cotValor, adjQty, adjValor, pctAdj, dias }
  }

  const thisYearMetrics = buildPeriodMetrics(currentYear, currentMonth)
  const prevYearMetrics = buildPeriodMetrics(currentYear - 1, currentMonth)

  function pctChange(current: number, prev: number) {
    if (prev === 0) return current > 0 ? 100 : 0
    return ((current - prev) / prev) * 100
  }

  const comparativo = useMemo(() => [
    { metric: 'Cotizaciones', prev: String(prevYearMetrics.cotQty), curr: String(thisYearMetrics.cotQty), variation: pctChange(thisYearMetrics.cotQty, prevYearMetrics.cotQty), suffix: '%' },
    { metric: 'Valor cotizado', prev: formatCOP(prevYearMetrics.cotValor), curr: formatCOP(thisYearMetrics.cotValor), variation: pctChange(thisYearMetrics.cotValor, prevYearMetrics.cotValor), suffix: '%' },
    { metric: 'Adjudicaciones', prev: String(prevYearMetrics.adjQty), curr: String(thisYearMetrics.adjQty), variation: pctChange(thisYearMetrics.adjQty, prevYearMetrics.adjQty), suffix: '%' },
    { metric: 'Valor adjudicado', prev: formatCOP(prevYearMetrics.adjValor), curr: formatCOP(thisYearMetrics.adjValor), variation: pctChange(thisYearMetrics.adjValor, prevYearMetrics.adjValor), suffix: '%' },
    { metric: '% Adjudicación', prev: `${prevYearMetrics.pctAdj.toFixed(1)}%`, curr: `${thisYearMetrics.pctAdj.toFixed(1)}%`, variation: thisYearMetrics.pctAdj - prevYearMetrics.pctAdj, suffix: 'pp' },
    { metric: 'Días promedio', prev: fmtDias(prevYearMetrics.dias), curr: fmtDias(thisYearMetrics.dias), variation: pctChange(Math.max(thisYearMetrics.dias, 0), Math.max(prevYearMetrics.dias, 0)), suffix: '%', invert: true },
  ], [oportunidades, cotizaciones])

  /* ── Table styles ────────────────────────────────── */
  const thCls = 'py-3.5 px-4 font-semibold text-xs uppercase tracking-[0.06em] text-[#94a3b8]'
  const tdCls = 'py-4 px-4 text-sm'

  /** Reusable metrics table header */
  function MetricsTableHead() {
    return (
      <thead>
        <tr className="border-b-2 border-[#f1f5f9]">
          <th className={`${thCls} text-left`}>Período</th>
          <th className={`${thCls} text-center`}>Cots</th>
          <th className={`${thCls} text-right`}>Valor cotizado</th>
          <th className={`${thCls} text-center`}>Adj</th>
          <th className={`${thCls} text-right`}>Valor adj.</th>
          <th className={`${thCls} text-center`}>% Adj</th>
          <th className={`${thCls} text-right`}>Prom cot.</th>
          <th className={`${thCls} text-right`}>Prom adj.</th>
          <th className={`${thCls} text-center`}>Días prom.</th>
        </tr>
      </thead>
    )
  }

  /** Reusable metrics table row */
  function MetricsTableRow({ r, bold }: { r: MetricsRow; bold?: boolean; idx?: number }) {
    const w = bold ? 'font-semibold' : ''
    return (
      <tr className={`border-b border-[#f8fafc] last:border-0 hover:bg-[#fafbfc] transition-colors ${bold ? 'bg-slate-50/80 border-t-2 border-t-[#f1f5f9]' : ''}`}>
        <td className={`${tdCls} font-semibold text-[var(--color-text)] ${w}`}>{r.label}</td>
        <td className={`${tdCls} text-center tabular-nums ${w}`}>{r.cotQty}</td>
        <td className={`${tdCls} text-right tabular-nums font-semibold text-[var(--color-text)] ${w}`}>{formatCOP(r.cotValor)}</td>
        <td className={`${tdCls} text-center tabular-nums ${w}`}>{r.adjQty}</td>
        <td className={`${tdCls} text-right tabular-nums font-semibold text-[var(--color-text)] ${w}`}>{formatCOP(r.adjValor)}</td>
        <td className={`${tdCls} text-center`}><PctBadge value={r.pctAdj} /></td>
        <td className={`${tdCls} text-right tabular-nums text-[#334155]`}>{formatCOP(r.avgCot)}</td>
        <td className={`${tdCls} text-right tabular-nums text-[#334155]`}>{formatCOP(r.avgAdj)}</td>
        <td className={`${tdCls} text-center text-[#64748b]`}>{fmtDias(r.avgDias)}</td>
      </tr>
    )
  }

  return (
    <div className="px-8 py-8 space-y-5 animate-fade-in max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Dashboard"
          subtitle={dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}
        />
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="mt-1 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-[var(--color-border)] bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
          title="Recargar datos desde Supabase"
        >
          <svg className={refreshing ? 'animate-spin' : ''} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg>
          {refreshing ? 'Actualizando…' : 'Actualizar datos'}
        </button>
      </div>

      {/* ─── ALERTA BANNER ───────────────────────────── */}
      {alertas.over7 > 0 && (
        <div className="flex items-center gap-4 rounded-xl border border-[#fef3c7] bg-[#fffbeb] px-6 py-4">
          <Bell size={20} className="text-amber-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#92400e]">
              {alertas.over7} cotizacion{alertas.over7 !== 1 ? 'es' : ''} lleva{alertas.over7 === 1 ? '' : 'n'} más de 7 días sin respuesta
            </p>
            {(alertas.over14 > 0 || alertas.over30 > 0) && (
              <p className="text-xs text-[#92400e] mt-0.5 opacity-80">
                {alertas.over14 > 0 && `${alertas.over14} de más de 14 días`}
                {alertas.over14 > 0 && alertas.over30 > 0 && ' · '}
                {alertas.over30 > 0 && `${alertas.over30} de más de 30 días`}
              </p>
            )}
          </div>
          <button
            onClick={() => navigate('/pipeline')}
            className="shrink-0 text-xs font-semibold text-[#92400e] hover:text-[#78350f] border border-[#fde68a] bg-white/60 rounded-lg px-4 py-2 hover:bg-white transition-colors"
          >Ver en pipeline</button>
        </div>
      )}

      {/* ─── KPI CARDS ──────────────────────────────── */}
      <div className="grid grid-cols-5 gap-3">
        <KPICard small label="Oportunidades activas" value={String(activas.length)} icon={Target} subtitle="En pipeline actual" />
        <KPICard small label="Valor del pipeline" value={formatCOP(valorPipeline)} icon={DollarSign} subtitle="Suma valor cotizado activo" />
        <KPICard small label={`Cotizaciones del mes (${cotsMes.length})`} value={formatCOP(totalMes)} icon={FileText} subtitle={currentMonthLabel} />
        <KPICard small label="Tasa cierre (cantidad)" value={`${tasaCierre}%`} icon={TrendingUp} subtitle="Adj / (Adj + Perd)" />
        <KPICard small label="Tasa cierre (valor)" value={`${tasaCierreValor}%`} icon={DollarSign} subtitle="$Adj / ($Adj + $Perd)" />
      </div>

      {/* ─── PIPELINE BAR ───────────────────────────── */}
      <div className="card p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[#94a3b8] mb-3">Distribucion del pipeline</p>
        <div className="flex h-4 rounded-lg overflow-hidden gap-px">
          {etapaCounts.map(e => {
            const pct = (e.count / totalOps) * 100
            if (pct < 0.5) return null
            return (
              <div
                key={e.key}
                className="flex items-center justify-center text-white text-[10px] font-semibold transition-all relative group"
                style={{ width: `${pct}%`, background: e.color, minWidth: e.count > 0 ? 24 : 0 }}
                title={`${e.label}: ${e.count}`}
              >
                {pct > 4 && e.count}
              </div>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-4">
          {etapaCounts.map(e => (
            <div key={e.key} className="flex items-center gap-2 text-[13px] text-[#64748b]">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: e.color }} />
              {e.label} ({e.count})
            </div>
          ))}
        </div>
      </div>

      {/* ─── ALERTAS DE SEGUIMIENTO ──────────────── */}
      {alertas.items.length > 0 && (
        <Section
          title="Alertas de seguimiento"
          subtitle="Cotizaciones enviadas sin respuesta"
          icon={AlertTriangle}
          summary={`${alertas.items.length} requieren seguimiento`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-[#f1f5f9]">
                  <th className={`${thCls} pl-3`}>Empresa</th>
                  <th className={thCls}>Cotización</th>
                  <th className={`${thCls} text-right`}>Valor</th>
                  <th className={`${thCls} text-center`}>Días sin respuesta</th>
                  <th className={`${thCls} text-center pr-3`}>Cot.</th>
                </tr>
              </thead>
              <tbody>
                {alertas.items.map(a => {
                  const badgeCls = a.dias > 30
                    ? 'bg-[#fef2f2] text-[#991b1b]'
                    : a.dias > 14
                    ? 'bg-[#fef2f2] text-[#dc2626]'
                    : 'bg-[#fffbeb] text-[#d97706]'
                  return (
                    <tr
                      key={a.id}
                      onClick={() => navigate(`/oportunidades/${a.id}`)}
                      className="border-b border-[#f8fafc] last:border-0 hover:bg-[#fafbfc] transition-colors cursor-pointer"
                    >
                      <td className={`${tdCls} pl-3 font-semibold text-[var(--color-text)] max-w-48 truncate`}>{a.empresa}</td>
                      <td className={`${tdCls} tabular-nums text-[#334155]`}>{a.cotizacion}</td>
                      <td className={`${tdCls} text-right tabular-nums font-semibold text-[var(--color-text)]`}>{formatCOP(a.valor)}</td>
                      <td className={`${tdCls} text-center`}>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badgeCls}`}>
                          {a.dias > 30 && <AlertTriangle size={11} />}
                          {a.dias}d
                        </span>
                      </td>
                      <td className={`${tdCls} text-center pr-3 font-semibold text-[#64748b]`}>{a.cotizador}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* ─── COMPARATIVO VS AÑO ANTERIOR ─────────── */}
      <Section title="Comparativo vs año anterior" subtitle={`${prevPeriodLabel} vs ${periodLabel}`} icon={TrendingUp} summary={`${comparativo[1]?.variation > 0 ? '+' : ''}${comparativo[1]?.variation.toFixed(1)}% valor cotizado`} defaultOpen>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-[#f1f5f9]">
                <th className={`${thCls} pl-3`}>Métrica</th>
                <th className={`${thCls} text-right`}>{prevPeriodLabel}</th>
                <th className={`${thCls} text-right`}>{periodLabel}</th>
                <th className={`${thCls} text-center pr-3`}>Variación</th>
              </tr>
            </thead>
            <tbody>
              {comparativo.map((row, i) => (
                <tr key={i} className="border-b border-[#f8fafc] last:border-0 hover:bg-[#fafbfc] transition-colors">
                  <td className="py-4 pl-3 text-sm font-medium text-[var(--color-text)]">{row.metric}</td>
                  <td className="py-4 text-right text-sm tabular-nums text-[#64748b]">{row.prev}</td>
                  <td className="py-4 text-right text-sm tabular-nums font-semibold text-[var(--color-text)]">{row.curr}</td>
                  <td className="py-4 text-center pr-3">
                    <VariationBadge value={row.variation} suffix={row.suffix} invert={row.invert} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ─── MÉTRICAS MENSUALES ─────────────────────── */}
      <Section title="Métricas mensuales" subtitle="Últimos 6 meses — Adj. por fecha de adjudicacion — % sobre valor" icon={CalendarClock} summary={`${monthRows[monthRows.length - 1]?.cotQty || 0} cots este mes`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <MetricsTableHead />
            <tbody>
              {monthRows.map((r, i) => <MetricsTableRow key={i} r={r} idx={i} />)}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ─── MÉTRICAS POR COTIZADOR ─────────────────── */}
      <Section title="Métricas por cotizador" subtitle="Historico total — % sobre valor" icon={Users} summary={`${COTIZADORES.length} cotizadores`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-[#f1f5f9]">
                <th className={`${thCls} pl-3`}>Cotizador</th>
                <th className={`${thCls} text-center`}>Cots</th>
                <th className={`${thCls} text-right`}>Valor cotizado</th>
                <th className={`${thCls} text-center`}>Adj</th>
                <th className={`${thCls} text-right`}>Valor adj.</th>
                <th className={`${thCls} text-center`}>% Adj</th>
                <th className={`${thCls} text-right`}>Prom cot.</th>
                <th className={`${thCls} text-right`}>Prom adj.</th>
                <th className={`${thCls} text-center`}>Días prom.</th>
              </tr>
            </thead>
            <tbody>
              {cotizadorRows.map((r, i) => (
                <tr key={i} className="border-b border-[#f8fafc] last:border-0 hover:bg-[#fafbfc] transition-colors">
                  <td className={`${tdCls} pl-3 font-medium text-[var(--color-text)]`}>
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: getAvatarColor(r.nombre) }}>{r.iniciales}</span>
                      <span className="truncate">{r.nombre}</span>
                    </div>
                  </td>
                  <td className={`${tdCls} text-center tabular-nums`}>{r.cotQty}</td>
                  <td className={`${tdCls} text-right tabular-nums font-semibold text-[var(--color-text)]`}>{formatCOP(r.cotValor)}</td>
                  <td className={`${tdCls} text-center tabular-nums`}>{r.adjQty}</td>
                  <td className={`${tdCls} text-right tabular-nums font-semibold text-[var(--color-text)]`}>{formatCOP(r.adjValor)}</td>
                  <td className={`${tdCls} text-center`}><PctBadge value={r.pctAdj} /></td>
                  <td className={`${tdCls} text-right tabular-nums text-[#334155]`}>{formatCOP(r.avgCot)}</td>
                  <td className={`${tdCls} text-right tabular-nums text-[#334155]`}>{formatCOP(r.avgAdj)}</td>
                  <td className={`${tdCls} text-center pr-3 text-[#64748b]`}>{fmtDias(r.avgDias)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ─── EVOLUCIÓN ANUAL ──────────────────────────── */}
      <Section title="Evolucion anual" subtitle="2021–2026 — Adj. por fecha de adjudicacion — % sobre valor" icon={Calendar} summary={`${totalRow.cotQty} cots totales`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <MetricsTableHead />
            <tbody>
              {yearRows.map((r, i) => <MetricsTableRow key={i} r={r} idx={i} />)}
              <MetricsTableRow r={totalRow} bold />
            </tbody>
          </table>
        </div>
      </Section>

      {/* ─── PIPELINE ACTIVO ────────────────────────── */}
      <Section title="Pipeline activo — Reunion semanal" subtitle={`> ${formatCOP(MIN_PIPELINE_VALOR)} · ${pipelineActivo.length} oportunidades`} icon={BarChart3} summary={`${pipelineActivo.length} oportunidades`}>
        {pipelineActivo.length === 0 ? (
          <p className="text-sm text-[#94a3b8] text-center py-8">No hay oportunidades en seguimiento activo con valor mayor a {formatCOP(MIN_PIPELINE_VALOR)}.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-[#f1f5f9]">
                  <th className={`${thCls} pl-3`}>Empresa</th>
                  <th className={thCls}>Etapa</th>
                  <th className={`${thCls} text-center`}>Fecha envío</th>
                  <th className={thCls}>Cotización</th>
                  <th className={`${thCls} text-right`}>Valor</th>
                  <th className={`${thCls} text-center`}>Días desde envío</th>
                  <th className={`${thCls} text-center pr-3`}>Cot.</th>
                </tr>
              </thead>
              <tbody>
                {pipelineActivo.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => navigate(`/oportunidades/${r.id}`)}
                    className="border-b border-[#f8fafc] last:border-0 hover:bg-blue-50/60 transition-colors cursor-pointer"
                    title="Ver oportunidad"
                  >
                    <td className={`${tdCls} pl-3 font-semibold text-[var(--color-text)] max-w-36 truncate`}>{r.empresa}</td>
                    <td className={tdCls}><EtapaBadge etapa={r.etapa} /></td>
                    <td className={`${tdCls} text-center text-[#64748b]`}>
                      {r.fechaEnvio && new Date(r.fechaEnvio).getFullYear() >= 2000 ? new Date(r.fechaEnvio).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className={`${tdCls} tabular-nums text-[#334155]`}>{r.numeroCot}</td>
                    <td className={`${tdCls} text-right tabular-nums font-semibold text-[var(--color-accent-green)]`}>{formatCOP(r.valorCotizado)}</td>
                    <td className={`${tdCls} text-center`}>
                      {r.diasDesdeEnvio !== null ? (
                        <span className={`font-semibold ${r.diasDesdeEnvio > 14 ? 'text-red-500' : r.diasDesdeEnvio > 7 ? 'text-amber-500' : 'text-[var(--color-text)]'}`}>{r.diasDesdeEnvio}d</span>
                      ) : '—'}
                    </td>
                    <td className={`${tdCls} text-center pr-3`}>
                      <span className="inline-block w-7 h-7 rounded-full text-[9px] font-bold text-white leading-7 text-center" style={{ background: getAvatarColor(r.cotizadorNombre) }} title={r.cotizadorNombre}>{r.cotizador}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* ─── TOP 10 CLIENTES ────────────────────────── */}
      <Section title="Top 10 clientes" subtitle="Por valor cotizado — % sobre valor" icon={Target} summary={empresaStats[0]?.nombre || ''}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-[#f1f5f9]">
                <th className={`${thCls} pl-3`}>#</th>
                <th className={thCls}>Empresa</th>
                <th className={`${thCls} text-center`}>Ops</th>
                <th className={`${thCls} text-right`}>Valor cotizado</th>
                <th className={`${thCls} text-right`}>Valor adj.</th>
                <th className={`${thCls} text-center`}>% Adj</th>
                <th className={`${thCls} text-center`}>Días prom.</th>
              </tr>
            </thead>
            <tbody>
              {empresaStats.map((r, i) => (
                <tr key={i} className="border-b border-[#f8fafc] last:border-0 hover:bg-[#fafbfc] transition-colors">
                  <td className={`${tdCls} pl-3 font-semibold text-[#94a3b8]`}>{i + 1}</td>
                  <td className={`${tdCls} font-semibold text-[var(--color-text)]`}>{r.nombre}</td>
                  <td className={`${tdCls} text-center tabular-nums`}>{r.opCount}</td>
                  <td className={`${tdCls} text-right tabular-nums font-semibold text-[var(--color-text)]`}>{formatCOP(r.valorCotizado)}</td>
                  <td className={`${tdCls} text-right tabular-nums text-[#334155]`}>{formatCOP(r.valorAdjudicado)}</td>
                  <td className={`${tdCls} text-center`}><PctBadge value={r.pctAdj} /></td>
                  <td className={`${tdCls} text-center pr-3 text-[#64748b]`}>{fmtDias(r.avgDias)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  )
}

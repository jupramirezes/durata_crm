import { useStore } from '../lib/store'
import { ETAPAS, COTIZADORES, Etapa, matchCotizador, findCotizador } from '../types'
import { formatCOP, daysSince, getAvatarColor } from '../lib/utils'
import { PageHeader, KPICard, EtapaBadge } from '../components/ui'
import { Target, DollarSign, FileText, TrendingUp, Users, BarChart3, CalendarClock, Calendar, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

/* ── helpers ───────────────────────────────────────────── */

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const FULL_MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function monthLabel(year: number, month: number) {
  return `${MONTH_NAMES[month]} ${year}`
}

/** Calculates days between fecha_ingreso and fecha_envio for oportunidades that have both */
function calcDiasElaboracion(ops: { fecha_ingreso: string; fecha_envio?: string | null }[]): number[] {
  const dias: number[] = []
  for (const o of ops) {
    if (o.fecha_envio) {
      const diff = Math.floor((new Date(o.fecha_envio).getTime() - new Date(o.fecha_ingreso).getTime()) / 86400000)
      if (diff >= 0) dias.push(diff)
    }
  }
  return dias
}

function avgDias(dias: number[]): number {
  return dias.length > 0 ? dias.reduce((s, d) => s + d, 0) / dias.length : 0
}

function fmtDias(val: number): string {
  return val > 0 ? `${val.toFixed(1)}d` : '—'
}

/** Percent badge with color coding: green >15%, yellow 8-15%, red <8% */
function PctBadge({ value }: { value: number }) {
  const cls = value >= 15 ? 'bg-emerald-50 text-emerald-700'
    : value >= 8 ? 'bg-amber-50 text-amber-700'
    : value > 0 ? 'bg-red-50 text-red-600'
    : 'bg-gray-100 text-gray-400'
  return <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${cls}`}>{value.toFixed(1)}%</span>
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
function Section({ title, subtitle, icon: Icon, children }: {
  title: string; subtitle?: string; icon: React.ElementType; children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-lg p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--color-border)]">
        <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center">
          <Icon size={14} className="text-[var(--color-primary)]" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-[var(--color-text)]">{title}</h3>
          {subtitle && <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

/* ── component ─────────────────────────────────────────── */

export default function Dashboard() {
  const { state } = useStore()
  const { oportunidades, cotizaciones, empresas } = state

  const now = new Date()
  const dateStr = now.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const currentMonthLabel = `${FULL_MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`

  // Pre-build lookup: oportunidad_id -> oportunidad
  const opMap = new Map(oportunidades.map(o => [o.id, o]))

  /* ── SECCIÓN 1: Resumen general ───────────────────── */
  const activas = oportunidades.filter(o => o.etapa !== 'adjudicada' && o.etapa !== 'perdida')
  const valorPipeline = activas.reduce((s, o) => s + o.valor_cotizado, 0)

  const cotsMes = cotizaciones.filter(c => {
    const d = new Date(c.fecha)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const totalMes = cotsMes.reduce((s, c) => s + c.total, 0)

  const adjTotal = oportunidades.filter(o => o.etapa === 'adjudicada').length
  const perTotal = oportunidades.filter(o => o.etapa === 'perdida').length
  const tasaCierre = adjTotal + perTotal > 0 ? Math.round((adjTotal / (adjTotal + perTotal)) * 100) : 0

  /* ── Pipeline distribution bar ───────────────────── */
  const etapaCounts = ETAPAS.map(e => ({
    ...e,
    count: oportunidades.filter(o => o.etapa === e.key).length,
  }))
  const totalOps = oportunidades.length || 1

  /* ── Shared: adjudicaciones indexed by month of fecha_adjudicacion ── */
  const adjOportunidades = oportunidades.filter(o => o.etapa === 'adjudicada')

  function getAdjMonth(o: typeof oportunidades[0]): { year: number; month: number } | null {
    const fa = o.fecha_adjudicacion
    if (fa) {
      const d = new Date(fa)
      if (!isNaN(d.getTime())) return { year: d.getFullYear(), month: d.getMonth() }
    }
    if (o.fecha_ultimo_contacto) {
      const d = new Date(o.fecha_ultimo_contacto)
      if (!isNaN(d.getTime())) return { year: d.getFullYear(), month: d.getMonth() }
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
    const cotsM = cotizaciones.filter(c => { const d = new Date(c.fecha); return d.getMonth() === month && d.getFullYear() === year })
    const cotValor = cotsM.reduce((s, c) => s + c.total, 0)

    const adjOps = adjOportunidades.filter(o => {
      const m = getAdjMonth(o)
      return m && m.year === year && m.month === month
    })
    const adjValor = adjOps.reduce((s, o) => s + o.valor_adjudicado, 0)

    const pctAdj = cotValor > 0 ? (adjValor / cotValor) * 100 : 0

    const avgCot = cotsM.length > 0 ? cotValor / cotsM.length : 0
    const avgAdj = adjOps.length > 0 ? adjValor / adjOps.length : 0

    const opsThisMonth = new Set(cotsM.map(c => c.oportunidad_id))
    const diasArr = calcDiasElaboracion(
      [...opsThisMonth].map(opId => opMap.get(opId)).filter((x): x is typeof oportunidades[0] => x !== null)
    )

    return { label: monthLabel(year, month), cotQty: cotsM.length, cotValor, adjQty: adjOps.length, adjValor, pctAdj, avgCot, avgAdj, avgDias: avgDias(diasArr) }
  }

  const monthRows = last6.map(m => buildMonthRow(m.year, m.month))

  /* ── SECCIÓN 3: Métricas por cotizador ─────────────── */
  const cotizadorRows = COTIZADORES.map(cot => {
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
  })

  /* ── SECCIÓN 4: Pipeline activo — Reunión semanal ─── */
  const pipelineActivo = oportunidades
    .filter(o => PIPELINE_ACTIVO.includes(o.etapa) && o.valor_cotizado > MIN_PIPELINE_VALOR)
    .sort((a, b) => b.valor_cotizado - a.valor_cotizado)
    .map(o => {
      const empresa = empresas.find(e => e.id === o.empresa_id)
      const opCots = cotizaciones.filter(c => c.oportunidad_id === o.id)
      const lastCot = opCots[opCots.length - 1]
      const cotizador = findCotizador(o.cotizador_asignado)
      const diasEnvio = o.fecha_envio ? daysSince(o.fecha_envio) : null
      return { id: o.id, empresa: empresa?.nombre ?? '—', etapa: o.etapa, fechaEnvio: o.fecha_envio ?? null, numeroCot: lastCot?.numero ?? '—', valorCotizado: o.valor_cotizado, diasDesdeEnvio: diasEnvio, cotizador: cotizador?.iniciales ?? '—', cotizadorNombre: cotizador?.nombre ?? '' }
    })

  /* ── SECCIÓN 5: Top 10 clientes ───────────────────── */
  const empresaStats = empresas.map(emp => {
    const ops = oportunidades.filter(o => o.empresa_id === emp.id)
    const valorCotizado = ops.reduce((s, o) => s + o.valor_cotizado, 0)
    const valorAdjudicado = ops.filter(o => o.etapa === 'adjudicada').reduce((s, o) => s + o.valor_adjudicado, 0)
    const pctAdj = valorCotizado > 0 ? (valorAdjudicado / valorCotizado) * 100 : 0
    const diasArr = calcDiasElaboracion(ops)
    return { nombre: emp.nombre, opCount: ops.length, valorCotizado, valorAdjudicado, pctAdj, avgDias: avgDias(diasArr) }
  }).sort((a, b) => b.valorCotizado - a.valorCotizado).slice(0, 10)

  /* ── SECCIÓN 6: Evolución anual ───────────────────── */
  const years = [2021, 2022, 2023, 2024, 2025, 2026]
  const yearRows: MetricsRow[] = years.map(year => {
    const cotsY = cotizaciones.filter(c => new Date(c.fecha).getFullYear() === year)
    const cotValor = cotsY.reduce((s, c) => s + c.total, 0)

    const adjOpsY = adjOportunidades.filter(o => {
      const m = getAdjMonth(o)
      return m && m.year === year
    })
    const adjValor = adjOpsY.reduce((s, o) => s + o.valor_adjudicado, 0)
    const pctAdj = cotValor > 0 ? (adjValor / cotValor) * 100 : 0
    const avgCot = cotsY.length > 0 ? cotValor / cotsY.length : 0
    const avgAdj = adjOpsY.length > 0 ? adjValor / adjOpsY.length : 0

    const opsThisYear = new Set(cotsY.map(c => c.oportunidad_id))
    const diasArr = calcDiasElaboracion(
      [...opsThisYear].map(opId => opMap.get(opId)).filter((x): x is typeof oportunidades[0] => x !== null)
    )

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
    avgDias: avgDias(calcDiasElaboracion(oportunidades)),
  }

  /* ── SECCIÓN 7: Comparativo vs año anterior ─────── */
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() // 0-indexed, so March = 2
  const periodLabel = `${MONTH_NAMES[0]}-${MONTH_NAMES[currentMonth]} ${currentYear}`
  const prevPeriodLabel = `${MONTH_NAMES[0]}-${MONTH_NAMES[currentMonth]} ${currentYear - 1}`

  function buildPeriodMetrics(year: number, throughMonth: number) {
    const periodCots = cotizaciones.filter(c => {
      const d = new Date(c.fecha)
      return d.getFullYear() === year && d.getMonth() <= throughMonth
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

    const opsIds = new Set(periodCots.map(c => c.oportunidad_id))
    const diasArr = calcDiasElaboracion(
      [...opsIds].map(opId => opMap.get(opId)).filter((x): x is typeof oportunidades[0] => x !== null)
    )
    const dias = avgDias(diasArr)

    return { cotQty, cotValor, adjQty, adjValor, pctAdj, dias }
  }

  const thisYearMetrics = buildPeriodMetrics(currentYear, currentMonth)
  const prevYearMetrics = buildPeriodMetrics(currentYear - 1, currentMonth)

  function pctChange(current: number, prev: number) {
    if (prev === 0) return current > 0 ? 100 : 0
    return ((current - prev) / prev) * 100
  }

  const comparativo = [
    { metric: 'Cotizaciones', prev: String(prevYearMetrics.cotQty), curr: String(thisYearMetrics.cotQty), variation: pctChange(thisYearMetrics.cotQty, prevYearMetrics.cotQty), suffix: '%' },
    { metric: 'Valor cotizado', prev: formatCOP(prevYearMetrics.cotValor), curr: formatCOP(thisYearMetrics.cotValor), variation: pctChange(thisYearMetrics.cotValor, prevYearMetrics.cotValor), suffix: '%' },
    { metric: 'Adjudicaciones', prev: String(prevYearMetrics.adjQty), curr: String(thisYearMetrics.adjQty), variation: pctChange(thisYearMetrics.adjQty, prevYearMetrics.adjQty), suffix: '%' },
    { metric: 'Valor adjudicado', prev: formatCOP(prevYearMetrics.adjValor), curr: formatCOP(thisYearMetrics.adjValor), variation: pctChange(thisYearMetrics.adjValor, prevYearMetrics.adjValor), suffix: '%' },
    { metric: '% Adjudicación', prev: `${prevYearMetrics.pctAdj.toFixed(1)}%`, curr: `${thisYearMetrics.pctAdj.toFixed(1)}%`, variation: thisYearMetrics.pctAdj - prevYearMetrics.pctAdj, suffix: 'pp' },
    { metric: 'Días promedio', prev: thisYearMetrics.dias > 0 ? prevYearMetrics.dias.toFixed(1) : '—', curr: thisYearMetrics.dias > 0 ? thisYearMetrics.dias.toFixed(1) : '—', variation: pctChange(thisYearMetrics.dias, prevYearMetrics.dias), suffix: '%', invert: true },
  ]

  /* ── Table styles ────────────────────────────────── */
  const thCls = 'pb-2 pt-1 font-semibold text-[10px] uppercase tracking-wider text-slate-500 bg-slate-50'
  const tdCls = 'py-2 text-xs'

  /** Reusable metrics table header */
  function MetricsTableHead() {
    return (
      <thead>
        <tr>
          <th className={`${thCls} pl-3 rounded-tl-md`}>Período</th>
          <th className={`${thCls} text-center`}>Cots</th>
          <th className={`${thCls} text-right`}>Valor cotizado</th>
          <th className={`${thCls} text-center`}>Adj</th>
          <th className={`${thCls} text-right`}>Valor adj.</th>
          <th className={`${thCls} text-center`}>% Adj</th>
          <th className={`${thCls} text-right`}>Prom cot.</th>
          <th className={`${thCls} text-right`}>Prom adj.</th>
          <th className={`${thCls} text-center pr-3 rounded-tr-md`}>Días prom.</th>
        </tr>
      </thead>
    )
  }

  /** Reusable metrics table row */
  function MetricsTableRow({ r, bold, idx }: { r: MetricsRow; bold?: boolean; idx?: number }) {
    const w = bold ? 'font-bold' : ''
    const zebra = !bold && idx !== undefined && idx % 2 === 1 ? 'bg-slate-50/50' : ''
    return (
      <tr className={`border-b border-slate-100 last:border-0 hover:bg-blue-50/40 transition-colors ${bold ? 'bg-slate-50 border-t-2 border-slate-200' : ''} ${zebra}`}>
        <td className={`${tdCls} pl-3 font-medium text-[var(--color-text)] ${w}`}>{r.label}</td>
        <td className={`${tdCls} text-center ${w}`}>{r.cotQty}</td>
        <td className={`${tdCls} text-right font-mono ${w}`}>{formatCOP(r.cotValor)}</td>
        <td className={`${tdCls} text-center ${w}`}>{r.adjQty}</td>
        <td className={`${tdCls} text-right font-mono ${w}`}>{formatCOP(r.adjValor)}</td>
        <td className={`${tdCls} text-center`}><PctBadge value={r.pctAdj} /></td>
        <td className={`${tdCls} text-right font-mono`}>{formatCOP(r.avgCot)}</td>
        <td className={`${tdCls} text-right font-mono`}>{formatCOP(r.avgAdj)}</td>
        <td className={`${tdCls} text-center pr-3`}>{fmtDias(r.avgDias)}</td>
      </tr>
    )
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-[1400px] mx-auto">
      <PageHeader
        title="Dashboard"
        subtitle={dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}
      />

      {/* ─── KPI CARDS ──────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Oportunidades activas" value={String(activas.length)} icon={Target} subtitle="En pipeline actual (excluye adjudicadas y perdidas)" />
        <KPICard label="Valor del pipeline" value={formatCOP(valorPipeline)} icon={DollarSign} small subtitle="Suma de valor cotizado en pipeline activo" />
        <KPICard label={`Cotizaciones del mes (${cotsMes.length})`} value={formatCOP(totalMes)} icon={FileText} small subtitle={currentMonthLabel} />
        <KPICard label="Tasa de cierre" value={`${tasaCierre}%`} icon={TrendingUp} subtitle="Historica — por cantidad de cotizaciones" />
      </div>

      {/* ─── PIPELINE BAR ───────────────────────────── */}
      <div className="bg-white border border-[var(--color-border)] rounded-lg p-5 shadow-sm">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Distribución del pipeline</p>
        <div className="flex h-8 rounded-md overflow-hidden gap-px">
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
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
          {etapaCounts.map(e => (
            <div key={e.key} className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: e.color }} />
              {e.label} ({e.count})
            </div>
          ))}
        </div>
      </div>

      {/* ─── COMPARATIVO VS AÑO ANTERIOR ─────────── */}
      <Section title="Comparativo vs año anterior" subtitle={`${prevPeriodLabel} vs ${periodLabel}`} icon={TrendingUp}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className={`${thCls} pl-3 rounded-tl-md`}>Métrica</th>
                <th className={`${thCls} text-right`}>{prevPeriodLabel}</th>
                <th className={`${thCls} text-right`}>{periodLabel}</th>
                <th className={`${thCls} text-center pr-3 rounded-tr-md`}>Variación</th>
              </tr>
            </thead>
            <tbody>
              {comparativo.map((row, i) => (
                <tr key={i} className={`border-b border-slate-100 last:border-0 hover:bg-blue-50/40 transition-colors ${i % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                  <td className="py-2.5 pl-3 text-xs font-medium text-[var(--color-text)]">{row.metric}</td>
                  <td className="py-2.5 text-right text-xs font-mono text-slate-500">{row.prev}</td>
                  <td className="py-2.5 text-right text-xs font-mono font-semibold text-[var(--color-text)]">{row.curr}</td>
                  <td className="py-2.5 text-center pr-3">
                    <VariationBadge value={row.variation} suffix={row.suffix} invert={row.invert} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ─── MÉTRICAS MENSUALES ─────────────────────── */}
      <Section title="Métricas mensuales" subtitle="Últimos 6 meses — Adj. por fecha de adjudicación — % sobre valor" icon={CalendarClock}>
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
      <Section title="Métricas por cotizador" subtitle="Histórico total — % sobre valor" icon={Users}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className={`${thCls} pl-3 rounded-tl-md`}>Cotizador</th>
                <th className={`${thCls} text-center`}>Cots</th>
                <th className={`${thCls} text-right`}>Valor cotizado</th>
                <th className={`${thCls} text-center`}>Adj</th>
                <th className={`${thCls} text-right`}>Valor adj.</th>
                <th className={`${thCls} text-center`}>% Adj</th>
                <th className={`${thCls} text-right`}>Prom cot.</th>
                <th className={`${thCls} text-right`}>Prom adj.</th>
                <th className={`${thCls} text-center pr-3 rounded-tr-md`}>Días prom.</th>
              </tr>
            </thead>
            <tbody>
              {cotizadorRows.map((r, i) => (
                <tr key={i} className={`border-b border-slate-100 last:border-0 hover:bg-blue-50/40 transition-colors ${i % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                  <td className={`${tdCls} pl-3 font-medium text-[var(--color-text)]`}>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ background: getAvatarColor(r.nombre) }}>{r.iniciales}</span>
                      <span className="truncate">{r.nombre}</span>
                    </div>
                  </td>
                  <td className={`${tdCls} text-center`}>{r.cotQty}</td>
                  <td className={`${tdCls} text-right font-mono`}>{formatCOP(r.cotValor)}</td>
                  <td className={`${tdCls} text-center`}>{r.adjQty}</td>
                  <td className={`${tdCls} text-right font-mono`}>{formatCOP(r.adjValor)}</td>
                  <td className={`${tdCls} text-center`}><PctBadge value={r.pctAdj} /></td>
                  <td className={`${tdCls} text-right font-mono`}>{formatCOP(r.avgCot)}</td>
                  <td className={`${tdCls} text-right font-mono`}>{formatCOP(r.avgAdj)}</td>
                  <td className={`${tdCls} text-center pr-3`}>{fmtDias(r.avgDias)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ─── EVOLUCIÓN ANUAL ──────────────────────────── */}
      <Section title="Evolución anual" subtitle="2021–2026 — Adj. por fecha de adjudicación — % sobre valor" icon={Calendar}>
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
      <Section title="Pipeline activo — Reunión semanal" subtitle={`> ${formatCOP(MIN_PIPELINE_VALOR)} · ${pipelineActivo.length} oportunidades`} icon={BarChart3}>
        {pipelineActivo.length === 0 ? (
          <p className="text-xs text-[var(--color-text-muted)] text-center py-6">No hay oportunidades en seguimiento activo con valor mayor a {formatCOP(MIN_PIPELINE_VALOR)}.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className={`${thCls} pl-3 rounded-tl-md`}>Empresa</th>
                  <th className={thCls}>Etapa</th>
                  <th className={`${thCls} text-center`}>Fecha envío</th>
                  <th className={thCls}>Cotización</th>
                  <th className={`${thCls} text-right`}>Valor</th>
                  <th className={`${thCls} text-center`}>Días desde envío</th>
                  <th className={`${thCls} text-center pr-3 rounded-tr-md`}>Cot.</th>
                </tr>
              </thead>
              <tbody>
                {pipelineActivo.map((r, i) => (
                  <tr key={r.id} className={`border-b border-slate-100 last:border-0 hover:bg-blue-50/40 transition-colors ${i % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                    <td className={`${tdCls} pl-3 font-medium text-[var(--color-text)] max-w-36 truncate`}>{r.empresa}</td>
                    <td className={tdCls}><EtapaBadge etapa={r.etapa} /></td>
                    <td className={`${tdCls} text-center text-slate-500`}>
                      {r.fechaEnvio && new Date(r.fechaEnvio).getFullYear() >= 2000 ? new Date(r.fechaEnvio).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className={`${tdCls} font-mono`}>{r.numeroCot}</td>
                    <td className={`${tdCls} text-right font-mono font-semibold text-[var(--color-accent-green)]`}>{formatCOP(r.valorCotizado)}</td>
                    <td className={`${tdCls} text-center`}>
                      {r.diasDesdeEnvio !== null ? (
                        <span className={`font-semibold ${r.diasDesdeEnvio > 14 ? 'text-red-500' : r.diasDesdeEnvio > 7 ? 'text-amber-500' : 'text-[var(--color-text)]'}`}>{r.diasDesdeEnvio}d</span>
                      ) : '—'}
                    </td>
                    <td className={`${tdCls} text-center pr-3`}>
                      <span className="inline-block w-6 h-6 rounded-full text-[8px] font-bold text-white leading-6 text-center" style={{ background: getAvatarColor(r.cotizadorNombre) }} title={r.cotizadorNombre}>{r.cotizador}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* ─── TOP 10 CLIENTES ────────────────────────── */}
      <Section title="Top 10 clientes" subtitle="Por valor cotizado — % sobre valor" icon={Target}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className={`${thCls} pl-3 rounded-tl-md`}>#</th>
                <th className={thCls}>Empresa</th>
                <th className={`${thCls} text-center`}>Ops</th>
                <th className={`${thCls} text-right`}>Valor cotizado</th>
                <th className={`${thCls} text-right`}>Valor adj.</th>
                <th className={`${thCls} text-center`}>% Adj</th>
                <th className={`${thCls} text-center pr-3 rounded-tr-md`}>Días prom.</th>
              </tr>
            </thead>
            <tbody>
              {empresaStats.map((r, i) => (
                <tr key={i} className={`border-b border-slate-100 last:border-0 hover:bg-blue-50/40 transition-colors ${i % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                  <td className={`${tdCls} pl-3 font-semibold text-slate-400`}>{i + 1}</td>
                  <td className={`${tdCls} font-medium text-[var(--color-text)]`}>{r.nombre}</td>
                  <td className={`${tdCls} text-center`}>{r.opCount}</td>
                  <td className={`${tdCls} text-right font-mono font-semibold`}>{formatCOP(r.valorCotizado)}</td>
                  <td className={`${tdCls} text-right font-mono`}>{formatCOP(r.valorAdjudicado)}</td>
                  <td className={`${tdCls} text-center`}><PctBadge value={r.pctAdj} /></td>
                  <td className={`${tdCls} text-center pr-3`}>{fmtDias(r.avgDias)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  )
}

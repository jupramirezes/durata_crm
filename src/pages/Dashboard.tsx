import { useStore } from '../lib/store'
import { ETAPAS, COTIZADORES, Etapa, matchCotizador, findCotizador } from '../types'
import { formatCOP, daysSince, getAvatarColor } from '../lib/utils'
import { PageHeader, KPICard, EtapaBadge } from '../components/ui'
import { Target, DollarSign, FileText, TrendingUp, Users, BarChart3, CalendarClock, Calendar } from 'lucide-react'

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

/** Percent badge with color coding */
function PctBadge({ value }: { value: number }) {
  const cls = value >= 50 ? 'bg-emerald-50 text-emerald-700' : value > 0 ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-400'
  return <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${cls}`}>{value.toFixed(1)}%</span>
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
  // Fix 3: Adjudicaciones count by MONTH OF ADJUDICACIÓN (fecha_adjudicacion),
  // falling back to historial entry date if fecha_adjudicacion is missing
  const adjOportunidades = oportunidades.filter(o => o.etapa === 'adjudicada')

  function getAdjMonth(o: typeof oportunidades[0]): { year: number; month: number } | null {
    // Primary: fecha_adjudicacion from Supabase
    const fa = o.fecha_adjudicacion
    if (fa) {
      const d = new Date(fa)
      if (!isNaN(d.getTime())) return { year: d.getFullYear(), month: d.getMonth() }
    }
    // Fallback: fecha_ultimo_contacto (often set when stage changes)
    if (o.fecha_ultimo_contacto) {
      const d = new Date(o.fecha_ultimo_contacto)
      if (!isNaN(d.getTime())) return { year: d.getFullYear(), month: d.getMonth() }
    }
    return null
  }

  /* ── Shared: oportunidades with computed fecha_envio (from their cotizaciones) ── */
  // For "días" calculation: fecha_ingreso → last fecha_envio of cotizaciones
  function getOpFechaEnvio(opId: string): string | null {
    const opCots = cotizaciones.filter(c => c.oportunidad_id === opId && c.fecha_envio)
    if (opCots.length === 0) return null
    return opCots.sort((a, b) => new Date(b.fecha_envio!).getTime() - new Date(a.fecha_envio!).getTime())[0].fecha_envio!
  }

  /* ── SECCIÓN 2: Métricas mensuales (últimos 6 meses) */
  const last6: { year: number; month: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    last6.push({ year: d.getFullYear(), month: d.getMonth() })
  }

  function buildMonthRow(year: number, month: number): MetricsRow {
    // Cotizaciones of this month (by fecha cotización)
    const cotsM = cotizaciones.filter(c => { const d = new Date(c.fecha); return d.getMonth() === month && d.getFullYear() === year })
    const cotValor = cotsM.reduce((s, c) => s + c.total, 0)

    // Fix 3: Adjudicaciones by month of ADJUDICACIÓN, not cotización
    const adjOps = adjOportunidades.filter(o => {
      const m = getAdjMonth(o)
      return m && m.year === year && m.month === month
    })
    const adjValor = adjOps.reduce((s, o) => s + o.valor_adjudicado, 0)

    // Fix 4: % Adj = valor_adjudicado / valor_cotizado (over VALUE, not quantity)
    const pctAdj = cotValor > 0 ? (adjValor / cotValor) * 100 : 0

    const avgCot = cotsM.length > 0 ? cotValor / cotsM.length : 0
    const avgAdj = adjOps.length > 0 ? adjValor / adjOps.length : 0

    // Fix 5: Días = fecha_ingreso → fecha_envio (from oportunidades that had cotizaciones this month)
    const opsThisMonth = new Set(cotsM.map(c => c.oportunidad_id))
    const diasArr = calcDiasElaboracion(
      [...opsThisMonth].map(opId => {
        const op = opMap.get(opId)
        return op ? { fecha_ingreso: op.fecha_ingreso, fecha_envio: getOpFechaEnvio(opId) } : null
      }).filter((x): x is { fecha_ingreso: string; fecha_envio: string | null } => x !== null)
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

    // Fix 4: % Adj over VALUE
    const pctAdj = cotValor > 0 ? (adjValor / cotValor) * 100 : 0

    const avgCot = cotsC.length > 0 ? cotValor / cotsC.length : 0
    const avgAdj = adjOps.length > 0 ? adjValor / adjOps.length : 0

    // Fix 5: Días from oportunidades of this cotizador
    const diasArr = calcDiasElaboracion(
      opsC.map(o => ({ fecha_ingreso: o.fecha_ingreso, fecha_envio: getOpFechaEnvio(o.id) }))
    )

    return { iniciales: cot.iniciales, nombre: cot.nombre, cotQty: cotsC.length, cotValor, adjQty: adjOps.length, adjValor, pctAdj, avgCot, avgAdj, avgDias: avgDias(diasArr) }
  })

  /* ── SECCIÓN 4: Pipeline activo — Reunión semanal ─── */
  // Fix 7: Only >$20M, with fecha_envio and días desde envío columns
  const pipelineActivo = oportunidades
    .filter(o => PIPELINE_ACTIVO.includes(o.etapa) && o.valor_cotizado > MIN_PIPELINE_VALOR)
    .sort((a, b) => b.valor_cotizado - a.valor_cotizado)
    .map(o => {
      const empresa = empresas.find(e => e.id === o.empresa_id)
      const opCots = cotizaciones.filter(c => c.oportunidad_id === o.id)
      const lastEnviada = opCots.filter(c => c.fecha_envio).sort((a, b) => new Date(b.fecha_envio!).getTime() - new Date(a.fecha_envio!).getTime())[0]
      const cotizador = findCotizador(o.cotizador_asignado)
      const diasEnvio = lastEnviada?.fecha_envio ? daysSince(lastEnviada.fecha_envio) : null
      return { id: o.id, empresa: empresa?.nombre ?? '—', etapa: o.etapa, fechaEnvio: lastEnviada?.fecha_envio ?? null, numeroCot: lastEnviada?.numero ?? (opCots[opCots.length - 1]?.numero ?? '—'), valorCotizado: o.valor_cotizado, diasDesdeEnvio: diasEnvio, cotizador: cotizador?.iniciales ?? '—', cotizadorNombre: cotizador?.nombre ?? '' }
    })

  /* ── SECCIÓN 5: Top 10 clientes ───────────────────── */
  // Fix 4: % Adj over value for top clients too
  const empresaStats = empresas.map(emp => {
    const ops = oportunidades.filter(o => o.empresa_id === emp.id)
    const valorCotizado = ops.reduce((s, o) => s + o.valor_cotizado, 0)
    const valorAdjudicado = ops.filter(o => o.etapa === 'adjudicada').reduce((s, o) => s + o.valor_adjudicado, 0)
    const pctAdj = valorCotizado > 0 ? (valorAdjudicado / valorCotizado) * 100 : 0
    // Fix 5: Días for top clients
    const diasArr = calcDiasElaboracion(
      ops.map(o => ({ fecha_ingreso: o.fecha_ingreso, fecha_envio: getOpFechaEnvio(o.id) }))
    )
    return { nombre: emp.nombre, opCount: ops.length, valorCotizado, valorAdjudicado, pctAdj, avgDias: avgDias(diasArr) }
  }).sort((a, b) => b.valorCotizado - a.valorCotizado).slice(0, 10)

  /* ── SECCIÓN 6: Evolución anual ───────────────────── */
  // Fix 8: Yearly breakdown from 2021 to current year
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
      [...opsThisYear].map(opId => {
        const op = opMap.get(opId)
        return op ? { fecha_ingreso: op.fecha_ingreso, fecha_envio: getOpFechaEnvio(opId) } : null
      }).filter((x): x is { fecha_ingreso: string; fecha_envio: string | null } => x !== null)
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
    avgDias: (() => {
      const allDias = oportunidades
        .map(o => ({ fecha_ingreso: o.fecha_ingreso, fecha_envio: getOpFechaEnvio(o.id) }))
      return avgDias(calcDiasElaboracion(allDias))
    })(),
  }

  /* ── Table styles ────────────────────────────────── */
  const thCls = 'pb-2 pt-1 font-medium text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]'
  const tdCls = 'py-1.5 text-xs'

  /** Reusable metrics table header */
  function MetricsTableHead() {
    return (
      <thead>
        <tr className="border-b border-[var(--color-border)]">
          <th className={thCls}>Período</th>
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
  function MetricsTableRow({ r, bold }: { r: MetricsRow; bold?: boolean }) {
    const w = bold ? 'font-bold' : ''
    return (
      <tr className={`border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface)] transition-colors ${bold ? 'bg-gray-50' : ''}`}>
        <td className={`${tdCls} font-medium text-[var(--color-text)] ${w}`}>{r.label}</td>
        <td className={`${tdCls} text-center ${w}`}>{r.cotQty}</td>
        <td className={`${tdCls} text-right font-mono ${w}`}>{formatCOP(r.cotValor)}</td>
        <td className={`${tdCls} text-center ${w}`}>{r.adjQty}</td>
        <td className={`${tdCls} text-right font-mono ${w}`}>{formatCOP(r.adjValor)}</td>
        <td className={`${tdCls} text-center`}><PctBadge value={r.pctAdj} /></td>
        <td className={`${tdCls} text-right font-mono`}>{formatCOP(r.avgCot)}</td>
        <td className={`${tdCls} text-right font-mono`}>{formatCOP(r.avgAdj)}</td>
        <td className={`${tdCls} text-center`}>{fmtDias(r.avgDias)}</td>
      </tr>
    )
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in max-w-[1400px] mx-auto">
      <PageHeader
        title="Dashboard"
        subtitle={dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}
      />

      {/* ─── KPI CARDS ──────────────────────────────── */}
      {/* Fix 2: Add contextual subtitles to each KPI */}
      <div className="grid grid-cols-4 gap-3">
        <KPICard label="Oportunidades activas" value={String(activas.length)} icon={Target} subtitle="En pipeline actual (excluye adjudicadas y perdidas)" />
        <KPICard label="Valor del pipeline" value={formatCOP(valorPipeline)} icon={DollarSign} small subtitle="Suma de valor cotizado en pipeline activo" />
        <KPICard label={`Cotizaciones del mes (${cotsMes.length})`} value={formatCOP(totalMes)} icon={FileText} small subtitle={currentMonthLabel} />
        <KPICard label="Tasa de cierre" value={`${tasaCierre}%`} icon={TrendingUp} subtitle="Historica — por cantidad de cotizaciones" />
      </div>

      {/* ─── PIPELINE BAR ───────────────────────────── */}
      <div className="bg-white border border-[var(--color-border)] rounded-lg p-4">
        <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Distribución del pipeline</p>
        <div className="flex h-7 rounded overflow-hidden gap-px">
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
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {etapaCounts.map(e => (
            <div key={e.key} className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
              <div className="w-2 h-2 rounded-sm" style={{ background: e.color }} />
              {e.label} ({e.count})
            </div>
          ))}
        </div>
      </div>

      {/* ─── MÉTRICAS MENSUALES ─────────────────────── */}
      <div className="bg-white border border-[var(--color-border)] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <CalendarClock size={14} className="text-[var(--color-primary-light)]" />
          <h3 className="font-semibold text-sm text-[var(--color-text)]">Métricas mensuales</h3>
          <span className="text-[10px] text-[var(--color-text-muted)]">Últimos 6 meses — Adj. por fecha de adjudicación — % sobre valor</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <MetricsTableHead />
            <tbody>
              {monthRows.map((r, i) => <MetricsTableRow key={i} r={r} />)}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MÉTRICAS POR COTIZADOR ─────────────────── */}
      <div className="bg-white border border-[var(--color-border)] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users size={14} className="text-[var(--color-primary-light)]" />
          <h3 className="font-semibold text-sm text-[var(--color-text)]">Métricas por cotizador</h3>
          <span className="text-[10px] text-[var(--color-text-muted)]">Histórico total — % sobre valor</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className={thCls}>Cotizador</th>
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
                <tr key={i} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface)] transition-colors">
                  <td className={`${tdCls} font-medium text-[var(--color-text)]`}>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ background: getAvatarColor(r.nombre) }}>{r.iniciales}</span>
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
                  <td className={`${tdCls} text-center`}>{fmtDias(r.avgDias)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── EVOLUCIÓN ANUAL ──────────────────────────── */}
      {/* Fix 8: Yearly evolution table */}
      <div className="bg-white border border-[var(--color-border)] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={14} className="text-[var(--color-primary-light)]" />
          <h3 className="font-semibold text-sm text-[var(--color-text)]">Evolución anual</h3>
          <span className="text-[10px] text-[var(--color-text-muted)]">2021–2026 — Adj. por fecha de adjudicación — % sobre valor</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <MetricsTableHead />
            <tbody>
              {yearRows.map((r, i) => <MetricsTableRow key={i} r={r} />)}
              <MetricsTableRow r={totalRow} bold />
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── PIPELINE ACTIVO ────────────────────────── */}
      {/* Fix 7: Only >$20M, sorted by valor desc */}
      <div className="bg-white border border-[var(--color-border)] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={14} className="text-[var(--color-primary-light)]" />
          <h3 className="font-semibold text-sm text-[var(--color-text)]">Pipeline activo — Reunión semanal</h3>
          <span className="text-[10px] text-[var(--color-text-muted)]">{`> ${formatCOP(MIN_PIPELINE_VALOR)}`}</span>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-blue-50 text-[var(--color-primary)] font-semibold">{pipelineActivo.length}</span>
        </div>
        {pipelineActivo.length === 0 ? (
          <p className="text-xs text-[var(--color-text-muted)] text-center py-6">No hay oportunidades en seguimiento activo con valor mayor a {formatCOP(MIN_PIPELINE_VALOR)}.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className={thCls}>Empresa</th>
                  <th className={thCls}>Etapa</th>
                  <th className={`${thCls} text-center`}>Fecha envío</th>
                  <th className={thCls}>Cotización</th>
                  <th className={`${thCls} text-right`}>Valor</th>
                  <th className={`${thCls} text-center`}>Días desde envío</th>
                  <th className={`${thCls} text-center`}>Cot.</th>
                </tr>
              </thead>
              <tbody>
                {pipelineActivo.map(r => (
                  <tr key={r.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface)] transition-colors">
                    <td className={`${tdCls} font-medium text-[var(--color-text)] max-w-36 truncate`}>{r.empresa}</td>
                    <td className={tdCls}><EtapaBadge etapa={r.etapa} /></td>
                    <td className={`${tdCls} text-center text-[var(--color-text-muted)]`}>
                      {r.fechaEnvio ? new Date(r.fechaEnvio).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className={`${tdCls} font-mono`}>{r.numeroCot}</td>
                    <td className={`${tdCls} text-right font-mono font-semibold text-[var(--color-accent-green)]`}>{formatCOP(r.valorCotizado)}</td>
                    <td className={`${tdCls} text-center`}>
                      {r.diasDesdeEnvio !== null ? (
                        <span className={`font-semibold ${r.diasDesdeEnvio > 14 ? 'text-red-500' : r.diasDesdeEnvio > 7 ? 'text-amber-500' : 'text-[var(--color-text)]'}`}>{r.diasDesdeEnvio}d</span>
                      ) : '—'}
                    </td>
                    <td className={`${tdCls} text-center`}>
                      <span className="inline-block w-5 h-5 rounded-full text-[8px] font-bold text-white leading-5 text-center" style={{ background: getAvatarColor(r.cotizadorNombre) }} title={r.cotizadorNombre}>{r.cotizador}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── TOP 10 CLIENTES ────────────────────────── */}
      {/* Fix 4 & 5: % Adj over value + Días prom column */}
      <div className="bg-white border border-[var(--color-border)] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target size={14} className="text-[var(--color-primary-light)]" />
          <h3 className="font-semibold text-sm text-[var(--color-text)]">Top 10 clientes</h3>
          <span className="text-[10px] text-[var(--color-text-muted)]">Por valor cotizado — % sobre valor</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className={thCls}>#</th>
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
                <tr key={i} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface)] transition-colors">
                  <td className={`${tdCls} font-semibold text-[var(--color-text-muted)]`}>{i + 1}</td>
                  <td className={`${tdCls} font-medium text-[var(--color-text)]`}>{r.nombre}</td>
                  <td className={`${tdCls} text-center`}>{r.opCount}</td>
                  <td className={`${tdCls} text-right font-mono font-semibold`}>{formatCOP(r.valorCotizado)}</td>
                  <td className={`${tdCls} text-right font-mono`}>{formatCOP(r.valorAdjudicado)}</td>
                  <td className={`${tdCls} text-center`}><PctBadge value={r.pctAdj} /></td>
                  <td className={`${tdCls} text-center`}>{fmtDias(r.avgDias)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

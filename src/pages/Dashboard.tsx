import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { ETAPAS, COTIZADORES, Etapa, matchCotizador, findCotizador } from '../types'
import { formatCOP, daysSince, getAvatarColor } from '../lib/utils'
import { ArrowUpRight, ArrowDownRight, Minus, AlertTriangle, Download, Plus, ChevronRight } from 'lucide-react'

/* ── helpers ───────────────────────────────────────────── */

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const FULL_MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function monthLabel(year: number, month: number) { return `${MONTH_NAMES[month]} ${year}` }

function parseLocalDate(s?: string | null): Date | null {
  if (!s) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(s)
  if (!match) return null
  const [, y, m, d] = match
  return new Date(Number(y), Number(m) - 1, Number(d))
}
function getMonthLocal(s?: string | null): number { return parseLocalDate(s)?.getMonth() ?? -1 }
function getYearLocal(s?: string | null): number { return parseLocalDate(s)?.getFullYear() ?? -1 }

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
    if (diff >= 0 && diff <= 365) dias.push(diff)
  }
  return dias
}

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

function avgDias(dias: number[]): number {
  return dias.length > 0 ? dias.reduce((s, d) => s + d, 0) / dias.length : -1
}

function fmtDias(val: number): string {
  if (!isFinite(val) || val < 0) return '—'
  if (val < 0.5) return '<1d'
  return `${val.toFixed(1)}d`
}

function pctClass(v: number) { return v >= 15 ? 'pos' : v >= 8 ? 'flat' : v > 0 ? 'neg' : 'flat' }

function Pct({ value }: { value: number }) {
  return <span className={`delta ${pctClass(value)}`}>{value.toFixed(1)}%</span>
}

function Delta({ value, suffix = '%', invert = false }: { value: number; suffix?: string; invert?: boolean }) {
  const positive = invert ? value < 0 : value > 0
  const negative = invert ? value > 0 : value < 0
  if (Math.abs(value) < 0.1) {
    return <span className="delta flat"><Minus size={10} />0{suffix}</span>
  }
  return (
    <span className={`delta ${positive ? 'pos' : negative ? 'neg' : 'flat'}`}>
      {positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
      {value > 0 ? '+' : ''}{value.toFixed(1)}{suffix}
    </span>
  )
}

const PIPELINE_ACTIVO: Etapa[] = ['cotizacion_enviada', 'en_seguimiento', 'en_negociacion']
const MIN_PIPELINE_VALOR = 20_000_000

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
  const navigate = useNavigate()
  const [alertsOpen, setAlertsOpen] = useState(true)

  const now = new Date()
  const dateStr = now.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const currentMonthLabel = `${FULL_MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`

  const opMap = useMemo(() => new Map(oportunidades.map(o => [o.id, o])), [oportunidades])
  const empresaNameMap = useMemo(() => new Map(empresas.map(e => [e.id, e.nombre])), [empresas])

  /* ── ALERTAS: cotizaciones sin respuesta ────────────── */
  const alertas = useMemo(() => {
    const nowMs = Date.now()
    const items = oportunidades
      .filter(o => o.etapa === 'cotizacion_enviada')
      .map(o => {
        const refDate = o.fecha_envio || o.fecha_ingreso || o.fecha_ultimo_contacto
        if (!refDate) return null
        const refMs = new Date(refDate).getTime()
        if (!Number.isFinite(refMs) || refMs <= 0) return null
        const dias = Math.floor((nowMs - refMs) / 86400000)
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
    const activas = oportunidades.filter(o => o.etapa !== 'adjudicada' && o.etapa !== 'perdida' && o.etapa !== 'recotizada')
    const valorPipeline = activas.reduce((s, o) => s + o.valor_cotizado, 0)
    const activeCots = cotizaciones.filter(c => c.estado !== 'descartada' && !(c.estado === 'borrador' && c.total === 0))
    const cotsMes = activeCots.filter(c => getMonthLocal(c.fecha_envio || c.fecha) === now.getMonth() && getYearLocal(c.fecha_envio || c.fecha) === now.getFullYear())
    const totalMes = cotsMes.reduce((s, c) => s + c.total, 0)
    const adjOps = oportunidades.filter(o => o.etapa === 'adjudicada')
    const perOps = oportunidades.filter(o => o.etapa === 'perdida')
    const tasaCierre = adjOps.length + perOps.length > 0 ? Math.round((adjOps.length / (adjOps.length + perOps.length)) * 100) : 0
    const valorAdjudicado = adjOps.reduce((s, o) => s + (o.valor_adjudicado || o.valor_cotizado || 0), 0)
    const valorPerdido = perOps.reduce((s, o) => s + (o.valor_cotizado || 0), 0)
    const tasaCierreValor = valorAdjudicado + valorPerdido > 0 ? Math.round((valorAdjudicado / (valorAdjudicado + valorPerdido)) * 100) : 0
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
    const diasArr = calcDiasCotizaciones(cotsM)
    return { label: monthLabel(year, month), cotQty: cotsM.length, cotValor, adjQty: adjOps.length, adjValor, pctAdj, avgCot, avgAdj, avgDias: avgDias(diasArr) }
  }

  const monthRows = useMemo(() => last6.map(m => buildMonthRow(m.year, m.month)), [oportunidades, cotizaciones])

  /* ── SECCIÓN 3: Cotizador ─────────────── */
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

  /* ── SECCIÓN 4: Pipeline activo ─── */
  const pipelineActivo = useMemo(() => oportunidades
    .filter(o => PIPELINE_ACTIVO.includes(o.etapa) && o.valor_cotizado > MIN_PIPELINE_VALOR)
    .sort((a, b) => b.valor_cotizado - a.valor_cotizado)
    .map(o => {
      const empresa = empresas.find(e => e.id === o.empresa_id)
      const opCots = cotizaciones.filter(c => c.oportunidad_id === o.id)
      const lastCot = opCots[opCots.length - 1]
      const cotizador = findCotizador(o.cotizador_asignado)
      const diasEnvio = o.fecha_envio ? daysSince(o.fecha_envio) : null
      return {
        id: o.id,
        empresa: empresa?.nombre ?? '—',
        etapa: o.etapa,
        etapaLabel: ETAPAS.find(e => e.key === o.etapa)?.label ?? o.etapa,
        etapaColor: ETAPAS.find(e => e.key === o.etapa)?.color ?? 'var(--color-text-label)',
        fechaEnvio: o.fecha_envio ?? null,
        numeroCot: lastCot?.numero ?? '—',
        valorCotizado: o.valor_cotizado,
        diasDesdeEnvio: diasEnvio,
        cotizador: cotizador?.iniciales ?? '—',
        cotizadorNombre: cotizador?.nombre ?? '',
      }
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
  const { yearRows, totalRow } = useMemo(() => {
    const yearRows: MetricsRow[] = years.map(year => {
      const cotsY = cotizaciones
        .filter(c => c.estado !== 'descartada' && !(c.estado === 'borrador' && c.total === 0))
        .filter(c => getYearLocal(c.fecha_envio || c.fecha) === year)
      const cotValor = cotsY.reduce((s, c) => s + c.total, 0)
      const adjOpsY = adjOportunidades.filter(o => { const m = getAdjMonth(o); return m && m.year === year })
      const adjValor = adjOpsY.reduce((s, o) => s + o.valor_adjudicado, 0)
      const pctAdj = cotValor > 0 ? (adjValor / cotValor) * 100 : 0
      const avgCot = cotsY.length > 0 ? cotValor / cotsY.length : 0
      const avgAdj = adjOpsY.length > 0 ? adjValor / adjOpsY.length : 0
      const diasArr = calcDiasCotizaciones(cotsY)
      return { label: String(year), cotQty: cotsY.length, cotValor, adjQty: adjOpsY.length, adjValor, pctAdj, avgCot, avgAdj, avgDias: avgDias(diasArr) }
    })
    const totalRow: MetricsRow = {
      label: 'TOTAL',
      cotQty: yearRows.reduce((s, r) => s + r.cotQty, 0),
      cotValor: yearRows.reduce((s, r) => s + r.cotValor, 0),
      adjQty: yearRows.reduce((s, r) => s + r.adjQty, 0),
      adjValor: yearRows.reduce((s, r) => s + r.adjValor, 0),
      pctAdj: yearRows.reduce((s, r) => s + r.cotValor, 0) > 0 ? (yearRows.reduce((s, r) => s + r.adjValor, 0) / yearRows.reduce((s, r) => s + r.cotValor, 0)) * 100 : 0,
      avgCot: yearRows.reduce((s, r) => s + r.cotQty, 0) > 0 ? yearRows.reduce((s, r) => s + r.cotValor, 0) / yearRows.reduce((s, r) => s + r.cotQty, 0) : 0,
      avgAdj: yearRows.reduce((s, r) => s + r.adjQty, 0) > 0 ? yearRows.reduce((s, r) => s + r.adjValor, 0) / yearRows.reduce((s, r) => s + r.adjQty, 0) : 0,
      avgDias: avgDias(calcDiasCotizaciones(cotizaciones.filter(c => c.estado !== 'descartada' && !(c.estado === 'borrador' && c.total === 0)))),
    }
    return { yearRows, totalRow }
  }, [oportunidades, cotizaciones])

  /* ── SECCIÓN 7: Comparativo vs año anterior ─────── */
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const periodLabel = `${MONTH_NAMES[0]}–${MONTH_NAMES[currentMonth]} ${currentYear}`
  const prevPeriodLabel = `${MONTH_NAMES[0]}–${MONTH_NAMES[currentMonth]} ${currentYear - 1}`

  function buildPeriodMetrics(year: number, throughMonth: number) {
    const periodCots = cotizaciones
      .filter(c => c.estado !== 'descartada' && !(c.estado === 'borrador' && c.total === 0))
      .filter(c => {
        const m = getMonthLocal(c.fecha_envio || c.fecha), y = getYearLocal(c.fecha_envio || c.fecha)
        return y === year && m >= 0 && m <= throughMonth
      })
    const cotValor = periodCots.reduce((s, c) => s + c.total, 0)
    const cotQty = periodCots.length
    const periodAdj = adjOportunidades.filter(o => { const m = getAdjMonth(o); return m && m.year === year && m.month <= throughMonth })
    const adjValor = periodAdj.reduce((s, o) => s + o.valor_adjudicado, 0)
    const adjQty = periodAdj.length
    const pctAdj = cotValor > 0 ? (adjValor / cotValor) * 100 : 0
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
    { metric: 'Valor cotizado', prev: formatCOP(prevYearMetrics.cotValor, { short: true }), curr: formatCOP(thisYearMetrics.cotValor, { short: true }), variation: pctChange(thisYearMetrics.cotValor, prevYearMetrics.cotValor), suffix: '%' },
    { metric: 'Adjudicaciones', prev: String(prevYearMetrics.adjQty), curr: String(thisYearMetrics.adjQty), variation: pctChange(thisYearMetrics.adjQty, prevYearMetrics.adjQty), suffix: '%' },
    { metric: 'Valor adjudicado', prev: formatCOP(prevYearMetrics.adjValor, { short: true }), curr: formatCOP(thisYearMetrics.adjValor, { short: true }), variation: pctChange(thisYearMetrics.adjValor, prevYearMetrics.adjValor), suffix: '%' },
    { metric: '% Adjudicación', prev: `${prevYearMetrics.pctAdj.toFixed(1)}%`, curr: `${thisYearMetrics.pctAdj.toFixed(1)}%`, variation: thisYearMetrics.pctAdj - prevYearMetrics.pctAdj, suffix: 'pp' },
    { metric: 'Días promedio', prev: fmtDias(prevYearMetrics.dias), curr: fmtDias(thisYearMetrics.dias), variation: pctChange(Math.max(thisYearMetrics.dias, 0), Math.max(prevYearMetrics.dias, 0)), suffix: '%', invert: true },
  ], [oportunidades, cotizaciones])

  /* ── render ────────────────────────────────── */

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">{dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}</div>
        </div>
        <div className="ml-auto flex gap-2 items-end">
          <button className="btn-d sm" onClick={() => navigate('/pipeline')}>
            <Plus size={13} />
            Nueva oportunidad
          </button>
        </div>
      </div>

      {/* ─── ALERTA BANNER ─── */}
      {alertas.over7 > 0 && alertsOpen && (
        <div className="alert-banner">
          <AlertTriangle size={16} style={{ color: 'var(--color-accent-yellow)', flexShrink: 0 }} />
          <div>
            <div className="t">
              {alertas.over7} cotización{alertas.over7 !== 1 ? 'es' : ''} sin respuesta &gt;7 días
            </div>
            <div className="d">
              {alertas.over14 > 0 && `${alertas.over14} con 7-14 días`}
              {alertas.over14 > 0 && alertas.over30 > 0 && ' · '}
              {alertas.over30 > 0 && `${alertas.over30} con más de 30 días · requieren seguimiento`}
            </div>
          </div>
          <div className="cta flex gap-2">
            <button className="btn-d sm" onClick={() => navigate('/pipeline')}>Ver en pipeline <ChevronRight size={12} /></button>
            <button className="btn-d sm ghost" onClick={() => setAlertsOpen(false)} title="Descartar">×</button>
          </div>
        </div>
      )}

      {/* ─── KPI GRID ─── */}
      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-label">Oportunidades activas</div>
          <div className="kpi-value">{activas.length}</div>
          <div className="kpi-meta">en pipeline actual</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Valor del pipeline</div>
          <div className="kpi-value tabular-nums">{formatCOP(valorPipeline, { short: true })}</div>
          <div className="kpi-meta">cotizado activo</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Cotizaciones del mes</div>
          <div className="kpi-value">{cotsMes.length}</div>
          <div className="kpi-meta">{currentMonthLabel} · <span className="mono">{formatCOP(totalMes, { short: true })}</span></div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Tasa cierre (cantidad)</div>
          <div className="kpi-value">{tasaCierre}<span className="unit">%</span></div>
          <div className="kpi-meta">adj / (adj + perd)</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Tasa cierre (valor)</div>
          <div className="kpi-value">{tasaCierreValor}<span className="unit">%</span></div>
          <div className="kpi-meta">$adj / ($adj + $perd)</div>
        </div>
      </div>

      {/* ─── PIPELINE DISTRIBUTION ─── */}
      <div className="section">
        <div className="section-head">
          <h2>Distribución del pipeline</h2>
          <span className="sub">· {activas.length} oportunidades activas · {formatCOP(valorPipeline, { short: true })}</span>
          <div className="spacer" />
          <button className="btn-d sm ghost" onClick={() => navigate('/pipeline')}>Ver detalle <ChevronRight size={12} /></button>
        </div>
        <div className="section-body">
          <div className="pipeline-bar">
            {etapaCounts.map(e => {
              const pct = (e.count / totalOps) * 100
              if (pct < 0.5) return null
              return <div key={e.key} style={{ flex: pct, background: e.color, minWidth: e.count > 0 ? 4 : 0 }} title={`${e.label}: ${e.count}`} />
            })}
          </div>
          <div className="legend">
            {etapaCounts.map(e => (
              <div className="legend-item" key={e.key}>
                <span className="stage-dot" style={{ background: e.color }} />
                <span className="lbl">{e.label}</span>
                <span className="val">{e.count.toLocaleString('es-CO')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 2-COL: ALERTAS + COMPARATIVO ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
        <div className="section" style={{ margin: 0 }}>
          <div className="section-head">
            <h2>Alertas de seguimiento</h2>
            <span className="sub">sin respuesta &gt;7 días</span>
            <div className="spacer" />
            <span className="mono" style={{ fontSize: 11, color: 'var(--color-text-label)' }}>{Math.min(alertas.items.length, 8)} / {alertas.items.length}</span>
          </div>
          <div className="section-body tight">
            {alertas.items.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', fontSize: 12.5, color: 'var(--color-text-label)' }}>Sin alertas — todas las cotizaciones al día.</div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th className="num">Valor</th>
                    <th className="num">Días</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {alertas.items.slice(0, 8).map(a => (
                    <tr key={a.id} onClick={() => navigate(`/oportunidades/${a.id}`)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{a.empresa}</div>
                        <div className="mono" style={{ fontSize: 11, color: 'var(--color-text-label)' }}>{a.cotizacion}</div>
                      </td>
                      <td className="num">{formatCOP(a.valor, { short: true })}</td>
                      <td className="num">
                        <span className="mono" style={{ color: a.dias > 30 ? 'var(--color-accent-red)' : a.dias > 14 ? 'var(--color-accent-yellow)' : 'var(--color-text-label)' }}>
                          {a.dias}d
                        </span>
                      </td>
                      <td style={{ width: 56 }}>
                        <span className="avatar xs" style={{ background: getAvatarColor(a.cotizador), color: '#fff', border: 'none' }}>{a.cotizador}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="section" style={{ margin: 0 }}>
          <div className="section-head">
            <h2>Comparativo vs. año anterior</h2>
            <span className="sub">{prevPeriodLabel} vs. {periodLabel}</span>
          </div>
          <div className="section-body tight">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Métrica</th>
                  <th className="num">{prevPeriodLabel}</th>
                  <th className="num">{periodLabel}</th>
                  <th className="num">Var.</th>
                </tr>
              </thead>
              <tbody>
                {comparativo.map((r, i) => (
                  <tr key={i}>
                    <td>{r.metric}</td>
                    <td className="num" style={{ color: 'var(--color-text-label)' }}>{r.prev}</td>
                    <td className="num" style={{ fontWeight: 600 }}>{r.curr}</td>
                    <td className="num"><Delta value={r.variation} suffix={r.suffix} invert={r.invert} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── MÉTRICAS MENSUALES ─── */}
      <div className="section">
        <div className="section-head">
          <h2>Métricas mensuales</h2>
          <span className="sub">últimos 6 meses · cotizaciones · adjudicadas · tasa de cierre</span>
          <div className="spacer" />
          <button className="btn-d sm ghost"><Download size={12} /> Exportar</button>
        </div>
        <div className="section-body tight">
          <table className="tbl">
            <thead>
              <tr>
                <th>Mes</th>
                <th className="num">Cots</th>
                <th className="num">Valor cotizado</th>
                <th className="num">Adj</th>
                <th className="num">Valor adj.</th>
                <th className="num">% Cierre</th>
                <th style={{ width: 140 }}>Tendencia</th>
              </tr>
            </thead>
            <tbody>
              {monthRows.map((m, i) => {
                const partial = i === monthRows.length - 1
                return (
                  <tr key={i}>
                    <td>
                      <span style={{ fontWeight: partial ? 600 : 500 }}>{m.label}</span>
                      {partial && <span className="mono" style={{ color: 'var(--color-text-label)', fontSize: 10, marginLeft: 6 }}>en curso</span>}
                    </td>
                    <td className="num">{m.cotQty}</td>
                    <td className="num">{formatCOP(m.cotValor, { short: true })}</td>
                    <td className="num">{m.adjQty}</td>
                    <td className="num">{formatCOP(m.adjValor, { short: true })}</td>
                    <td className="num"><Pct value={m.pctAdj} /></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--color-surface-2)', borderRadius: 10, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: Math.min(m.pctAdj * 2, 100) + '%', background: 'var(--color-primary)' }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── PIPELINE ACTIVO — REUNIÓN SEMANAL ─── */}
      <div className="section">
        <div className="section-head">
          <h2>Pipeline activo · reunión semanal</h2>
          <span className="sub">&gt; {formatCOP(MIN_PIPELINE_VALOR, { short: true })} · {pipelineActivo.length} oportunidades</span>
        </div>
        <div className="section-body tight">
          {pipelineActivo.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', fontSize: 12.5, color: 'var(--color-text-label)' }}>Sin oportunidades con valor superior a {formatCOP(MIN_PIPELINE_VALOR, { short: true })}</div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Etapa</th>
                  <th className="num">Envío</th>
                  <th>Cot #</th>
                  <th className="num">Valor</th>
                  <th className="num">Días</th>
                  <th style={{ width: 56 }}>Cot.</th>
                </tr>
              </thead>
              <tbody>
                {pipelineActivo.slice(0, 12).map(r => (
                  <tr key={r.id} onClick={() => navigate(`/oportunidades/${r.id}`)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 500, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.empresa}</td>
                    <td>
                      <span className="stage-pill">
                        <span className="stage-dot" style={{ background: r.etapaColor }} />
                        {r.etapaLabel}
                      </span>
                    </td>
                    <td className="num" style={{ color: 'var(--color-text-label)' }}>
                      {r.fechaEnvio && new Date(r.fechaEnvio).getFullYear() >= 2000 ? new Date(r.fechaEnvio).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) : '—'}
                    </td>
                    <td className="mono" style={{ color: 'var(--color-text-muted)' }}>{r.numeroCot}</td>
                    <td className="num" style={{ fontWeight: 600 }}>{formatCOP(r.valorCotizado, { short: true })}</td>
                    <td className="num">
                      {r.diasDesdeEnvio !== null ? (
                        <span className="mono" style={{ color: r.diasDesdeEnvio > 14 ? 'var(--color-accent-red)' : r.diasDesdeEnvio > 7 ? 'var(--color-accent-yellow)' : 'var(--color-text-label)' }}>
                          {r.diasDesdeEnvio}d
                        </span>
                      ) : '—'}
                    </td>
                    <td><span className="avatar xs" style={{ background: getAvatarColor(r.cotizadorNombre), color: '#fff', border: 'none' }} title={r.cotizadorNombre}>{r.cotizador}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ─── TOP 10 CLIENTES ─── */}
      <div className="section">
        <div className="section-head">
          <h2>Top 10 clientes</h2>
          <span className="sub">por valor cotizado histórico</span>
        </div>
        <div className="section-body tight">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Empresa</th>
                <th className="num">Ops</th>
                <th className="num">Valor cotizado</th>
                <th className="num">Valor adj.</th>
                <th className="num">% Adj</th>
                <th className="num">Días prom.</th>
              </tr>
            </thead>
            <tbody>
              {empresaStats.map((r, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--color-text-faint)', fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ fontWeight: 500 }}>{r.nombre}</td>
                  <td className="num">{r.opCount}</td>
                  <td className="num" style={{ fontWeight: 600 }}>{formatCOP(r.valorCotizado, { short: true })}</td>
                  <td className="num">{formatCOP(r.valorAdjudicado, { short: true })}</td>
                  <td className="num"><Pct value={r.pctAdj} /></td>
                  <td className="num" style={{ color: 'var(--color-text-label)' }}>{fmtDias(r.avgDias)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MÉTRICAS POR COTIZADOR ─── */}
      <div className="section">
        <div className="section-head">
          <h2>Métricas por cotizador</h2>
          <span className="sub">histórico · % sobre valor</span>
        </div>
        <div className="section-body tight">
          <table className="tbl">
            <thead>
              <tr>
                <th>Cotizador</th>
                <th className="num">Cots</th>
                <th className="num">Valor cotizado</th>
                <th className="num">Adj</th>
                <th className="num">Valor adj.</th>
                <th className="num">% Adj</th>
                <th className="num">Días prom.</th>
              </tr>
            </thead>
            <tbody>
              {cotizadorRows.map((r, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="avatar sm" style={{ background: getAvatarColor(r.nombre), color: '#fff', border: 'none' }}>{r.iniciales}</span>
                      <span style={{ fontWeight: 500 }}>{r.nombre}</span>
                    </div>
                  </td>
                  <td className="num">{r.cotQty}</td>
                  <td className="num" style={{ fontWeight: 600 }}>{formatCOP(r.cotValor, { short: true })}</td>
                  <td className="num">{r.adjQty}</td>
                  <td className="num">{formatCOP(r.adjValor, { short: true })}</td>
                  <td className="num"><Pct value={r.pctAdj} /></td>
                  <td className="num" style={{ color: 'var(--color-text-label)' }}>{fmtDias(r.avgDias)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── EVOLUCIÓN ANUAL ─── */}
      <div className="section">
        <div className="section-head">
          <h2>Evolución anual</h2>
          <span className="sub">2021–2026</span>
        </div>
        <div className="section-body tight">
          <table className="tbl">
            <thead>
              <tr>
                <th>Año</th>
                <th className="num">Cots</th>
                <th className="num">Valor cotizado</th>
                <th className="num">Adj</th>
                <th className="num">Valor adj.</th>
                <th className="num">% Adj</th>
                <th className="num">Prom cot.</th>
              </tr>
            </thead>
            <tbody>
              {yearRows.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{r.label}</td>
                  <td className="num">{r.cotQty}</td>
                  <td className="num" style={{ fontWeight: 600 }}>{formatCOP(r.cotValor, { short: true })}</td>
                  <td className="num">{r.adjQty}</td>
                  <td className="num">{formatCOP(r.adjValor, { short: true })}</td>
                  <td className="num"><Pct value={r.pctAdj} /></td>
                  <td className="num" style={{ color: 'var(--color-text-label)' }}>{formatCOP(r.avgCot, { short: true })}</td>
                </tr>
              ))}
              <tr style={{ background: 'var(--color-surface-2)', fontWeight: 600 }}>
                <td>{totalRow.label}</td>
                <td className="num">{totalRow.cotQty}</td>
                <td className="num">{formatCOP(totalRow.cotValor, { short: true })}</td>
                <td className="num">{totalRow.adjQty}</td>
                <td className="num">{formatCOP(totalRow.adjValor, { short: true })}</td>
                <td className="num"><Pct value={totalRow.pctAdj} /></td>
                <td className="num" style={{ color: 'var(--color-text-label)' }}>{formatCOP(totalRow.avgCot, { short: true })}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

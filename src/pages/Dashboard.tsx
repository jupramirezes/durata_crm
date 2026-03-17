import { useStore } from '../lib/store'
import { ETAPAS, COTIZADORES, Etapa } from '../types'
import { formatCOP, daysSince, getAvatarColor } from '../lib/utils'
import { PageHeader, KPICard, EtapaBadge } from '../components/ui'
import { Target, DollarSign, FileText, TrendingUp, Users, BarChart3, CalendarClock } from 'lucide-react'

/* ── helpers ───────────────────────────────────────────── */

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function monthLabel(year: number, month: number) {
  return `${MONTH_NAMES[month]} ${year}`
}

const PIPELINE_ACTIVO: Etapa[] = ['cotizacion_enviada', 'en_seguimiento', 'en_negociacion']

/* ── component ─────────────────────────────────────────── */

export default function Dashboard() {
  const { state } = useStore()
  const { oportunidades, cotizaciones, empresas } = state

  const now = new Date()
  const dateStr = now.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

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

  /* ── SECCIÓN 2: Métricas mensuales (últimos 6 meses) */
  const last6: { year: number; month: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    last6.push({ year: d.getFullYear(), month: d.getMonth() })
  }

  type MonthRow = { label: string; cotQty: number; cotValor: number; adjQty: number; adjValor: number; pctAdj: number; avgCot: number; avgAdj: number; avgDias: number }

  function buildMonthRow(year: number, month: number): MonthRow {
    const cotsM = cotizaciones.filter(c => { const d = new Date(c.fecha); return d.getMonth() === month && d.getFullYear() === year })
    const cotValor = cotsM.reduce((s, c) => s + c.total, 0)
    const adjOps = oportunidades.filter(o => {
      if (o.etapa !== 'adjudicada') return false
      const opCots = cotizaciones.filter(c => c.oportunidad_id === o.id)
      if (opCots.length === 0) return false
      const lastCot = opCots.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0]
      const d = new Date(lastCot.fecha)
      return d.getMonth() === month && d.getFullYear() === year
    })
    const adjValor = adjOps.reduce((s, o) => s + o.valor_adjudicado, 0)
    const pctAdj = cotsM.length > 0 ? Math.round((adjOps.length / cotsM.length) * 100) : 0
    const avgCot = cotsM.length > 0 ? cotValor / cotsM.length : 0
    const avgAdj = adjOps.length > 0 ? adjValor / adjOps.length : 0
    const diasArr: number[] = []
    cotsM.forEach(c => {
      if (c.fecha_envio) {
        const op = oportunidades.find(o => o.id === c.oportunidad_id)
        if (op) { const diff = Math.floor((new Date(c.fecha_envio).getTime() - new Date(op.fecha_ingreso).getTime()) / 86400000); if (diff >= 0) diasArr.push(diff) }
      }
    })
    const avgDias = diasArr.length > 0 ? Math.round(diasArr.reduce((s, d) => s + d, 0) / diasArr.length) : 0
    return { label: monthLabel(year, month), cotQty: cotsM.length, cotValor, adjQty: adjOps.length, adjValor, pctAdj, avgCot, avgAdj, avgDias }
  }

  const monthRows = last6.map(m => buildMonthRow(m.year, m.month))

  /* ── SECCIÓN 3: Métricas por cotizador ─────────────── */
  const cotizadorRows = COTIZADORES.map(cot => {
    const opsC = oportunidades.filter(o => o.cotizador_asignado === cot.id)
    const cotsC = cotizaciones.filter(c => { const op = oportunidades.find(o => o.id === c.oportunidad_id); return op && op.cotizador_asignado === cot.id })
    const cotValor = cotsC.reduce((s, c) => s + c.total, 0)
    const adjOps = opsC.filter(o => o.etapa === 'adjudicada')
    const adjValor = adjOps.reduce((s, o) => s + o.valor_adjudicado, 0)
    const perOps = opsC.filter(o => o.etapa === 'perdida')
    const pctAdj = adjOps.length + perOps.length > 0 ? Math.round((adjOps.length / (adjOps.length + perOps.length)) * 100) : 0
    const avgCot = cotsC.length > 0 ? cotValor / cotsC.length : 0
    const avgAdj = adjOps.length > 0 ? adjValor / adjOps.length : 0
    const diasArr: number[] = []
    cotsC.forEach(c => {
      if (c.fecha_envio) {
        const op = oportunidades.find(o => o.id === c.oportunidad_id)
        if (op) { const diff = Math.floor((new Date(c.fecha_envio).getTime() - new Date(op.fecha_ingreso).getTime()) / 86400000); if (diff >= 0) diasArr.push(diff) }
      }
    })
    const avgDias = diasArr.length > 0 ? Math.round(diasArr.reduce((s, d) => s + d, 0) / diasArr.length) : 0
    return { iniciales: cot.iniciales, nombre: cot.nombre, cotQty: cotsC.length, cotValor, adjQty: adjOps.length, adjValor, pctAdj, avgCot, avgAdj, avgDias }
  })

  /* ── SECCIÓN 4: Pipeline activo ────────────────────── */
  const pipelineActivo = oportunidades
    .filter(o => PIPELINE_ACTIVO.includes(o.etapa))
    .sort((a, b) => b.valor_cotizado - a.valor_cotizado)
    .map(o => {
      const empresa = empresas.find(e => e.id === o.empresa_id)
      const opCots = cotizaciones.filter(c => c.oportunidad_id === o.id)
      const lastEnviada = opCots.filter(c => c.fecha_envio).sort((a, b) => new Date(b.fecha_envio!).getTime() - new Date(a.fecha_envio!).getTime())[0]
      const cotizador = COTIZADORES.find(c => c.id === o.cotizador_asignado)
      const diasEnvio = lastEnviada?.fecha_envio ? daysSince(lastEnviada.fecha_envio) : null
      return { id: o.id, empresa: empresa?.nombre ?? '—', etapa: o.etapa, fechaEnvio: lastEnviada?.fecha_envio ?? null, numeroCot: lastEnviada?.numero ?? (opCots[opCots.length - 1]?.numero ?? '—'), valorCotizado: o.valor_cotizado, diasDesdeEnvio: diasEnvio, cotizador: cotizador?.iniciales ?? '—', cotizadorNombre: cotizador?.nombre ?? '' }
    })

  /* ── SECCIÓN 5: Top 10 clientes ───────────────────── */
  const empresaStats = empresas.map(emp => {
    const ops = oportunidades.filter(o => o.empresa_id === emp.id)
    const valorCotizado = ops.reduce((s, o) => s + o.valor_cotizado, 0)
    const valorAdjudicado = ops.filter(o => o.etapa === 'adjudicada').reduce((s, o) => s + o.valor_adjudicado, 0)
    const adj = ops.filter(o => o.etapa === 'adjudicada').length
    const per = ops.filter(o => o.etapa === 'perdida').length
    const tasa = adj + per > 0 ? Math.round((adj / (adj + per)) * 100) : 0
    return { nombre: emp.nombre, opCount: ops.length, valorCotizado, valorAdjudicado, tasa }
  }).sort((a, b) => b.valorCotizado - a.valorCotizado).slice(0, 10)

  /* ── Table styles ────────────────────────────────── */
  const thCls = 'pb-2 pt-1 font-medium text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]'
  const tdCls = 'py-1.5 text-xs'

  return (
    <div className="p-6 space-y-5 animate-fade-in max-w-[1400px] mx-auto">
      <PageHeader
        title="Dashboard"
        subtitle={dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}
      />

      {/* ─── KPI CARDS ──────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        <KPICard label="Oportunidades activas" value={String(activas.length)} icon={Target} />
        <KPICard label="Valor del pipeline" value={formatCOP(valorPipeline)} icon={DollarSign} small />
        <KPICard label={`Cotizaciones del mes (${cotsMes.length})`} value={formatCOP(totalMes)} icon={FileText} small />
        <KPICard label="Tasa de cierre" value={`${tasaCierre}%`} icon={TrendingUp} />
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
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className={thCls}>Mes</th>
                <th className={`${thCls} text-center`}>Cots</th>
                <th className={`${thCls} text-right`}>Valor cotizado</th>
                <th className={`${thCls} text-center`}>Adj</th>
                <th className={`${thCls} text-right`}>Valor adj.</th>
                <th className={`${thCls} text-center`}>% Adj</th>
                <th className={`${thCls} text-right`}>Prom cot.</th>
                <th className={`${thCls} text-right`}>Prom adj.</th>
                <th className={`${thCls} text-center`}>Días</th>
              </tr>
            </thead>
            <tbody>
              {monthRows.map((r, i) => (
                <tr key={i} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface)] transition-colors">
                  <td className={`${tdCls} font-medium text-[var(--color-text)]`}>{r.label}</td>
                  <td className={`${tdCls} text-center`}>{r.cotQty}</td>
                  <td className={`${tdCls} text-right font-mono`}>{formatCOP(r.cotValor)}</td>
                  <td className={`${tdCls} text-center`}>{r.adjQty}</td>
                  <td className={`${tdCls} text-right font-mono`}>{formatCOP(r.adjValor)}</td>
                  <td className={`${tdCls} text-center`}>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${r.pctAdj >= 50 ? 'bg-emerald-50 text-emerald-700' : r.pctAdj > 0 ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-400'}`}>{r.pctAdj}%</span>
                  </td>
                  <td className={`${tdCls} text-right font-mono`}>{formatCOP(r.avgCot)}</td>
                  <td className={`${tdCls} text-right font-mono`}>{formatCOP(r.avgAdj)}</td>
                  <td className={`${tdCls} text-center`}>{r.avgDias > 0 ? `${r.avgDias}d` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MÉTRICAS POR COTIZADOR ─────────────────── */}
      <div className="bg-white border border-[var(--color-border)] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users size={14} className="text-[var(--color-primary-light)]" />
          <h3 className="font-semibold text-sm text-[var(--color-text)]">Métricas por cotizador</h3>
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
                <th className={`${thCls} text-center`}>Días</th>
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
                  <td className={`${tdCls} text-center`}>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${r.pctAdj >= 50 ? 'bg-emerald-50 text-emerald-700' : r.pctAdj > 0 ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-400'}`}>{r.pctAdj}%</span>
                  </td>
                  <td className={`${tdCls} text-right font-mono`}>{formatCOP(r.avgCot)}</td>
                  <td className={`${tdCls} text-right font-mono`}>{formatCOP(r.avgAdj)}</td>
                  <td className={`${tdCls} text-center`}>{r.avgDias > 0 ? `${r.avgDias}d` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── PIPELINE ACTIVO ────────────────────────── */}
      <div className="bg-white border border-[var(--color-border)] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={14} className="text-[var(--color-primary-light)]" />
          <h3 className="font-semibold text-sm text-[var(--color-text)]">Pipeline activo — Reunión semanal</h3>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-blue-50 text-[var(--color-primary)] font-semibold">{pipelineActivo.length}</span>
        </div>
        {pipelineActivo.length === 0 ? (
          <p className="text-xs text-[var(--color-text-muted)] text-center py-6">No hay oportunidades en seguimiento activo.</p>
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
                  <th className={`${thCls} text-center`}>Días</th>
                  <th className={`${thCls} text-center`}>Cot.</th>
                </tr>
              </thead>
              <tbody>
                {pipelineActivo.map(r => (
                  <tr key={r.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface)] transition-colors">
                    <td className={`${tdCls} font-medium text-[var(--color-text)] max-w-36 truncate`}>{r.empresa}</td>
                    <td className={tdCls}><EtapaBadge etapa={r.etapa} /></td>
                    <td className={`${tdCls} text-center text-[var(--color-text-muted)]`}>
                      {r.fechaEnvio ? new Date(r.fechaEnvio).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) : '—'}
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
      <div className="bg-white border border-[var(--color-border)] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target size={14} className="text-[var(--color-primary-light)]" />
          <h3 className="font-semibold text-sm text-[var(--color-text)]">Top 10 clientes</h3>
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
                <th className={`${thCls} text-center`}>Tasa</th>
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
                  <td className={`${tdCls} text-center`}>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${r.tasa >= 50 ? 'bg-emerald-50 text-emerald-700' : r.tasa > 0 ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-400'}`}>{r.tasa}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

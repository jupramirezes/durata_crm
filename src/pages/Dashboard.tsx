import { useStore } from '../lib/store'
import { ETAPAS, COTIZADORES, Etapa } from '../types'
import { formatCOP, daysSince, getAvatarColor } from '../lib/utils'
import { Target, DollarSign, FileText, TrendingUp, Users, BarChart3, CalendarClock } from 'lucide-react'

/* ── helpers ───────────────────────────────────────────── */

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function monthLabel(year: number, month: number) {
  return `${MONTH_NAMES[month]} ${year}`
}

function etapaLabel(etapa: Etapa) {
  return ETAPAS.find(e => e.key === etapa)?.label ?? etapa
}

const PIPELINE_ACTIVO: Etapa[] = ['cotizacion_enviada', 'en_seguimiento', 'en_negociacion']

/* ── component ─────────────────────────────────────────── */

export default function Dashboard() {
  const { state } = useStore()
  const { oportunidades, cotizaciones, empresas } = state

  const now = new Date()

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

  /* ── SECCIÓN 2: Métricas mensuales (últimos 6 meses) */
  const last6: { year: number; month: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    last6.push({ year: d.getFullYear(), month: d.getMonth() })
  }

  type MonthRow = {
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

  function buildMonthRow(year: number, month: number, filterCots: typeof cotizaciones, filterOps: typeof oportunidades): MonthRow {
    const cotsM = filterCots.filter(c => {
      const d = new Date(c.fecha)
      return d.getMonth() === month && d.getFullYear() === year
    })
    const cotValor = cotsM.reduce((s, c) => s + c.total, 0)

    // Adjudicaciones del mes: oportunidades adjudicadas cuya última cotización fue en este mes
    const adjOps = filterOps.filter(o => {
      if (o.etapa !== 'adjudicada') return false
      const opCots = filterCots.filter(c => c.oportunidad_id === o.id)
      if (opCots.length === 0) return false
      const lastCot = opCots.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0]
      const d = new Date(lastCot.fecha)
      return d.getMonth() === month && d.getFullYear() === year
    })
    const adjValor = adjOps.reduce((s, o) => s + o.valor_adjudicado, 0)

    const pctAdj = cotsM.length > 0 ? Math.round((adjOps.length / cotsM.length) * 100) : 0
    const avgCot = cotsM.length > 0 ? cotValor / cotsM.length : 0
    const avgAdj = adjOps.length > 0 ? adjValor / adjOps.length : 0

    // Días promedio ingreso → envío
    const diasArr: number[] = []
    cotsM.forEach(c => {
      if (c.fecha_envio) {
        const op = filterOps.find(o => o.id === c.oportunidad_id)
        if (op) {
          const diff = Math.floor((new Date(c.fecha_envio).getTime() - new Date(op.fecha_ingreso).getTime()) / 86400000)
          if (diff >= 0) diasArr.push(diff)
        }
      }
    })
    const avgDias = diasArr.length > 0 ? Math.round(diasArr.reduce((s, d) => s + d, 0) / diasArr.length) : 0

    return {
      label: monthLabel(year, month),
      cotQty: cotsM.length,
      cotValor,
      adjQty: adjOps.length,
      adjValor,
      pctAdj,
      avgCot,
      avgAdj,
      avgDias,
    }
  }

  const monthRows: MonthRow[] = last6.map(m => buildMonthRow(m.year, m.month, cotizaciones, oportunidades))

  /* ── SECCIÓN 3: Métricas por cotizador ─────────────── */
  const cotizadorRows = COTIZADORES.map(cot => {
    const opsC = oportunidades.filter(o => o.cotizador_asignado === cot.id)
    const cotsC = cotizaciones.filter(c => {
      const op = oportunidades.find(o => o.id === c.oportunidad_id)
      return op && op.cotizador_asignado === cot.id
    })
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
        if (op) {
          const diff = Math.floor((new Date(c.fecha_envio).getTime() - new Date(op.fecha_ingreso).getTime()) / 86400000)
          if (diff >= 0) diasArr.push(diff)
        }
      }
    })
    const avgDias = diasArr.length > 0 ? Math.round(diasArr.reduce((s, d) => s + d, 0) / diasArr.length) : 0

    return {
      iniciales: cot.iniciales,
      nombre: cot.nombre,
      cotQty: cotsC.length,
      cotValor,
      adjQty: adjOps.length,
      adjValor,
      pctAdj,
      avgCot,
      avgAdj,
      avgDias,
    }
  })

  /* ── SECCIÓN 4: Pipeline activo — Reunión semanal ── */
  const pipelineActivo = oportunidades
    .filter(o => PIPELINE_ACTIVO.includes(o.etapa))
    .sort((a, b) => b.valor_cotizado - a.valor_cotizado)
    .map(o => {
      const empresa = empresas.find(e => e.id === o.empresa_id)
      const opCots = cotizaciones.filter(c => c.oportunidad_id === o.id)
      const lastEnviada = opCots
        .filter(c => c.fecha_envio)
        .sort((a, b) => new Date(b.fecha_envio!).getTime() - new Date(a.fecha_envio!).getTime())[0]
      const cotizador = COTIZADORES.find(c => c.id === o.cotizador_asignado)
      const diasEnvio = lastEnviada?.fecha_envio ? daysSince(lastEnviada.fecha_envio) : null
      return {
        id: o.id,
        empresa: empresa?.nombre ?? '—',
        etapa: o.etapa,
        fechaEnvio: lastEnviada?.fecha_envio ?? null,
        numeroCot: lastEnviada?.numero ?? (opCots[opCots.length - 1]?.numero ?? '—'),
        valorCotizado: o.valor_cotizado,
        diasDesdeEnvio: diasEnvio,
        cotizador: cotizador?.iniciales ?? '—',
        cotizadorNombre: cotizador?.nombre ?? '',
      }
    })

  /* ── SECCIÓN 5: Top 5 clientes ────────────────────── */
  const empresaStats = empresas.map(emp => {
    const ops = oportunidades.filter(o => o.empresa_id === emp.id)
    const valorCotizado = ops.reduce((s, o) => s + o.valor_cotizado, 0)
    const valorAdjudicado = ops.filter(o => o.etapa === 'adjudicada').reduce((s, o) => s + o.valor_adjudicado, 0)
    const adj = ops.filter(o => o.etapa === 'adjudicada').length
    const per = ops.filter(o => o.etapa === 'perdida').length
    const tasa = adj + per > 0 ? Math.round((adj / (adj + per)) * 100) : 0
    return { nombre: emp.nombre, opCount: ops.length, valorCotizado, valorAdjudicado, tasa }
  })
    .sort((a, b) => b.valorCotizado - a.valorCotizado)
    .slice(0, 5)

  /* ── Table header helper ───────────────────────────── */
  const thClass = 'pb-2.5 pt-1 font-semibold text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]'
  const tdClass = 'py-2 text-xs'

  /* ── RENDER ────────────────────────────────────────── */
  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text)]">Dashboard</h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Resumen general de la operación comercial</p>
      </div>

      {/* ─── SECCIÓN 1: RESUMEN ─────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Oportunidades activas', value: String(activas.length), icon: Target, iconBg: 'bg-cyan-50', iconColor: 'text-[var(--color-primary)]' },
          { label: 'Valor del pipeline', value: formatCOP(valorPipeline), icon: DollarSign, iconBg: 'bg-amber-50', iconColor: 'text-amber-600', small: true },
          { label: `Cotizaciones del mes (${cotsMes.length})`, value: formatCOP(totalMes), icon: FileText, iconBg: 'bg-purple-50', iconColor: 'text-purple-600', small: true },
          { label: 'Tasa de cierre', value: `${tasaCierre}%`, icon: TrendingUp, iconBg: 'bg-emerald-50', iconColor: 'text-[var(--color-accent-green)]' },
        ].map((card, i) => (
          <div key={i} className="bg-white border border-[var(--color-border)] rounded-xl p-5">
            <p className="text-xs text-[var(--color-text-muted)] mb-2">{card.label}</p>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${card.iconBg} flex items-center justify-center`}>
                <card.icon size={18} className={card.iconColor} />
              </div>
              <span className={`${card.small ? 'text-xl' : 'text-2xl'} font-bold text-[var(--color-text)]`}>{card.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ─── SECCIÓN 2: MÉTRICAS MENSUALES ──────────── */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarClock size={16} className="text-[var(--color-primary)]" />
          <h3 className="font-semibold text-sm text-[var(--color-text)]">Métricas mensuales</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className={thClass}>Mes</th>
                <th className={`${thClass} text-center`}>Cotizaciones</th>
                <th className={`${thClass} text-right`}>Valor cotizado</th>
                <th className={`${thClass} text-center`}>Adjudicaciones</th>
                <th className={`${thClass} text-right`}>Valor adjudicado</th>
                <th className={`${thClass} text-center`}>% Adj.</th>
                <th className={`${thClass} text-right`}>Prom. cotizado</th>
                <th className={`${thClass} text-right`}>Prom. adjudicado</th>
                <th className={`${thClass} text-center`}>Días prom.</th>
              </tr>
            </thead>
            <tbody>
              {monthRows.map((r, i) => (
                <tr key={i} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface)] transition-colors">
                  <td className={`${tdClass} font-semibold text-[var(--color-text)]`}>{r.label}</td>
                  <td className={`${tdClass} text-center`}>{r.cotQty}</td>
                  <td className={`${tdClass} text-right font-mono`}>{formatCOP(r.cotValor)}</td>
                  <td className={`${tdClass} text-center`}>{r.adjQty}</td>
                  <td className={`${tdClass} text-right font-mono`}>{formatCOP(r.adjValor)}</td>
                  <td className={`${tdClass} text-center`}>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${r.pctAdj >= 50 ? 'bg-green-100 text-green-700' : r.pctAdj > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                      {r.pctAdj}%
                    </span>
                  </td>
                  <td className={`${tdClass} text-right font-mono`}>{formatCOP(r.avgCot)}</td>
                  <td className={`${tdClass} text-right font-mono`}>{formatCOP(r.avgAdj)}</td>
                  <td className={`${tdClass} text-center`}>{r.avgDias > 0 ? `${r.avgDias}d` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── SECCIÓN 3: MÉTRICAS POR COTIZADOR ─────── */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users size={16} className="text-[var(--color-primary)]" />
          <h3 className="font-semibold text-sm text-[var(--color-text)]">Métricas por cotizador</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className={thClass}>Cotizador</th>
                <th className={`${thClass} text-center`}>Cotizaciones</th>
                <th className={`${thClass} text-right`}>Valor cotizado</th>
                <th className={`${thClass} text-center`}>Adjudicaciones</th>
                <th className={`${thClass} text-right`}>Valor adjudicado</th>
                <th className={`${thClass} text-center`}>% Adj.</th>
                <th className={`${thClass} text-right`}>Prom. cotizado</th>
                <th className={`${thClass} text-right`}>Prom. adjudicado</th>
                <th className={`${thClass} text-center`}>Días prom.</th>
              </tr>
            </thead>
            <tbody>
              {cotizadorRows.map((r, i) => (
                <tr key={i} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface)] transition-colors">
                  <td className={`${tdClass} font-semibold text-[var(--color-text)]`}>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                        style={{ background: getAvatarColor(r.nombre) }}
                      >
                        {r.iniciales}
                      </span>
                      <span className="truncate">{r.nombre}</span>
                    </div>
                  </td>
                  <td className={`${tdClass} text-center`}>{r.cotQty}</td>
                  <td className={`${tdClass} text-right font-mono`}>{formatCOP(r.cotValor)}</td>
                  <td className={`${tdClass} text-center`}>{r.adjQty}</td>
                  <td className={`${tdClass} text-right font-mono`}>{formatCOP(r.adjValor)}</td>
                  <td className={`${tdClass} text-center`}>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${r.pctAdj >= 50 ? 'bg-green-100 text-green-700' : r.pctAdj > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                      {r.pctAdj}%
                    </span>
                  </td>
                  <td className={`${tdClass} text-right font-mono`}>{formatCOP(r.avgCot)}</td>
                  <td className={`${tdClass} text-right font-mono`}>{formatCOP(r.avgAdj)}</td>
                  <td className={`${tdClass} text-center`}>{r.avgDias > 0 ? `${r.avgDias}d` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── SECCIÓN 4: PIPELINE ACTIVO — REUNIÓN ──── */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} className="text-[var(--color-primary)]" />
          <h3 className="font-semibold text-sm text-[var(--color-text)]">Pipeline activo — Reunión semanal</h3>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-cyan-50 text-[var(--color-primary)] font-bold">{pipelineActivo.length} oportunidades</span>
        </div>
        {pipelineActivo.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)] text-center py-6">No hay oportunidades en seguimiento activo.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className={thClass}>Empresa</th>
                  <th className={thClass}>Estado</th>
                  <th className={`${thClass} text-center`}>Fecha envío</th>
                  <th className={thClass}>N° Cotización</th>
                  <th className={`${thClass} text-right`}>Valor cotizado</th>
                  <th className={`${thClass} text-center`}>Días desde envío</th>
                  <th className={`${thClass} text-center`}>Cotizador</th>
                </tr>
              </thead>
              <tbody>
                {pipelineActivo.map(r => {
                  const etapaInfo = ETAPAS.find(e => e.key === r.etapa)
                  return (
                    <tr key={r.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface)] transition-colors">
                      <td className={`${tdClass} font-semibold text-[var(--color-text)] max-w-40 truncate`}>{r.empresa}</td>
                      <td className={tdClass}>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-bold text-white"
                          style={{ background: etapaInfo?.color }}
                        >
                          {etapaLabel(r.etapa)}
                        </span>
                      </td>
                      <td className={`${tdClass} text-center text-[var(--color-text-muted)]`}>
                        {r.fechaEnvio ? new Date(r.fechaEnvio).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) : '—'}
                      </td>
                      <td className={`${tdClass} font-mono`}>{r.numeroCot}</td>
                      <td className={`${tdClass} text-right font-mono font-bold text-[var(--color-accent-green)]`}>{formatCOP(r.valorCotizado)}</td>
                      <td className={`${tdClass} text-center`}>
                        {r.diasDesdeEnvio !== null ? (
                          <span className={`font-bold ${r.diasDesdeEnvio > 14 ? 'text-red-500' : r.diasDesdeEnvio > 7 ? 'text-amber-500' : 'text-[var(--color-text)]'}`}>
                            {r.diasDesdeEnvio}d
                          </span>
                        ) : '—'}
                      </td>
                      <td className={`${tdClass} text-center`}>
                        <span
                          className="inline-block w-6 h-6 rounded-full text-[9px] font-bold text-white leading-6 text-center"
                          style={{ background: getAvatarColor(r.cotizadorNombre) }}
                          title={r.cotizadorNombre}
                        >
                          {r.cotizador}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── SECCIÓN 5: TOP 5 CLIENTES ─────────────── */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target size={16} className="text-[var(--color-primary)]" />
          <h3 className="font-semibold text-sm text-[var(--color-text)]">Top 5 clientes</h3>
        </div>
        {empresaStats.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)] text-center py-6">No hay datos de empresas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className={thClass}>#</th>
                  <th className={thClass}>Empresa</th>
                  <th className={`${thClass} text-center`}># Oportunidades</th>
                  <th className={`${thClass} text-right`}>Valor total cotizado</th>
                  <th className={`${thClass} text-right`}>Valor adjudicado</th>
                  <th className={`${thClass} text-center`}>Tasa adj.</th>
                </tr>
              </thead>
              <tbody>
                {empresaStats.map((r, i) => (
                  <tr key={i} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface)] transition-colors">
                    <td className={`${tdClass} font-bold text-[var(--color-text-muted)]`}>{i + 1}</td>
                    <td className={`${tdClass} font-semibold text-[var(--color-text)]`}>{r.nombre}</td>
                    <td className={`${tdClass} text-center`}>{r.opCount}</td>
                    <td className={`${tdClass} text-right font-mono font-bold`}>{formatCOP(r.valorCotizado)}</td>
                    <td className={`${tdClass} text-right font-mono`}>{formatCOP(r.valorAdjudicado)}</td>
                    <td className={`${tdClass} text-center`}>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${r.tasa >= 50 ? 'bg-green-100 text-green-700' : r.tasa > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                        {r.tasa}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

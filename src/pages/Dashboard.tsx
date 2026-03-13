import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { ETAPAS } from '../types'
import { formatCOP } from '../lib/utils'
import { Target, FileText, TrendingUp, DollarSign, ArrowRight } from 'lucide-react'

export default function Dashboard() {
  const { state } = useStore()
  const navigate = useNavigate()
  const { oportunidades, cotizaciones, empresas } = state

  const now = new Date()
  const cotsMes = cotizaciones.filter(c => {
    const d = new Date(c.fecha)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const totalMes = cotsMes.reduce((s, c) => s + c.total, 0)

  const activas = oportunidades.filter(o => o.etapa !== 'adjudicada' && o.etapa !== 'perdida').length
  const valorPipeline = oportunidades
    .filter(o => o.etapa !== 'adjudicada' && o.etapa !== 'perdida')
    .reduce((s, o) => s + o.valor_estimado, 0)
  const adjudicadas = oportunidades.filter(o => o.etapa === 'adjudicada').length
  const perdidas = oportunidades.filter(o => o.etapa === 'perdida').length
  const tasaCierre = adjudicadas + perdidas > 0 ? Math.round((adjudicadas / (adjudicadas + perdidas)) * 100) : 0

  // Pipeline bar chart data
  const etapaCounts = ETAPAS.map(e => ({
    ...e,
    count: oportunidades.filter(o => o.etapa === e.key).length,
  }))
  const maxCount = Math.max(...etapaCounts.map(e => e.count), 1)

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text)]">Dashboard</h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Resumen general de tu operacion comercial</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-5">
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-6">
          <p className="text-sm text-[var(--color-text-muted)] mb-2">Oportunidades activas</p>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-cyan-50 flex items-center justify-center">
              <Target size={20} className="text-[var(--color-primary)]" />
            </div>
            <span className="text-3xl font-bold text-[var(--color-text)]">{activas}</span>
          </div>
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-xl p-6">
          <p className="text-sm text-[var(--color-text-muted)] mb-2">Valor del pipeline</p>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center">
              <DollarSign size={20} className="text-amber-600" />
            </div>
            <span className="text-2xl font-bold text-[var(--color-text)]">{formatCOP(valorPipeline)}</span>
          </div>
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-xl p-6">
          <p className="text-sm text-[var(--color-text-muted)] mb-2">Cotizaciones del mes</p>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-purple-50 flex items-center justify-center">
              <FileText size={20} className="text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-[var(--color-text)]">{formatCOP(totalMes)}</span>
          </div>
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-xl p-6">
          <p className="text-sm text-[var(--color-text-muted)] mb-2">Tasa de cierre</p>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center">
              <TrendingUp size={20} className="text-[var(--color-accent-green)]" />
            </div>
            <span className="text-3xl font-bold text-[var(--color-text)]">{tasaCierre}%</span>
          </div>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-2 gap-6">
        {/* Pipeline */}
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-6">
          <h3 className="font-semibold text-[var(--color-text)] mb-5">Pipeline</h3>
          <div className="space-y-3">
            {etapaCounts.map(e => {
              const pct = (e.count / maxCount) * 100
              return (
                <div key={e.key} className="flex items-center gap-3">
                  <span className="text-xs text-[var(--color-text-muted)] w-32 truncate">{e.label}</span>
                  <div className="flex-1 h-6 bg-[var(--color-surface)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: e.color }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-text)] w-6 text-right">{e.count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Cotizaciones recientes */}
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-[var(--color-text)]">Cotizaciones recientes</h3>
            <button onClick={() => navigate('/cotizaciones')} className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1">
              Ver todas <ArrowRight size={12} />
            </button>
          </div>
          {cotizaciones.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={32} className="text-[var(--color-border-light)] mx-auto mb-3" />
              <p className="text-sm text-[var(--color-text-muted)]">No hay cotizaciones aun.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--color-text-muted)] text-xs border-b border-[var(--color-border)]">
                  <th className="pb-2 font-medium">Numero</th>
                  <th className="pb-2 font-medium">Empresa</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                  <th className="pb-2 font-medium text-right">Estado</th>
                </tr>
              </thead>
              <tbody>
                {cotizaciones.slice(-5).reverse().map(c => {
                  const oportunidad = state.oportunidades.find(o => o.id === c.oportunidad_id)
                  const empresa = oportunidad ? empresas.find(e => e.id === oportunidad.empresa_id) : null
                  return (
                    <tr
                      key={c.id}
                      onClick={() => navigate('/cotizaciones')}
                      className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface)] cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 font-mono text-xs">{c.numero}</td>
                      <td className="py-2.5 text-[var(--color-text)]">{empresa?.nombre || '\u2014'}</td>
                      <td className="py-2.5 text-right font-bold">{formatCOP(c.total)}</td>
                      <td className="py-2.5 text-right">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          c.estado === 'aprobada' ? 'bg-green-100 text-green-700' :
                          c.estado === 'rechazada' ? 'bg-red-100 text-red-700' :
                          c.estado === 'enviada' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{c.estado}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

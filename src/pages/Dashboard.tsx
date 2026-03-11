import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { ETAPAS } from '../types'
import { formatCOP, getInitials, getAvatarColor } from '../lib/utils'
import { Users, FileText, TrendingUp, DollarSign, ArrowRight } from 'lucide-react'

export default function Dashboard() {
  const { state } = useStore()
  const navigate = useNavigate()
  const { clientes, cotizaciones } = state

  const now = new Date()
  const cotsMes = cotizaciones.filter(c => {
    const d = new Date(c.fecha)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const totalMes = cotsMes.reduce((s, c) => s + c.total, 0)
  const activos = clientes.filter(c => !['cerrado', 'perdido'].includes(c.etapa)).length

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Resumen general de tu operacion comercial</p>
      </div>

      {/* Hero card */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[#0f1a2e] to-[var(--color-surface)] p-7">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--color-text-muted)] mb-1">Cotizaciones este mes</p>
            <p className="text-4xl font-bold text-[var(--color-accent-green)]">{formatCOP(totalMes)}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-2">{cotsMes.length} cotizacion{cotsMes.length !== 1 ? 'es' : ''} generada{cotsMes.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <DollarSign size={32} className="text-[var(--color-accent-green)]" />
          </div>
        </div>
        <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-border)] hover:border-[var(--color-border-light)] transition-all duration-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><Users size={20} className="text-[var(--color-primary)]" /></div>
            <span className="text-sm text-[var(--color-text-muted)]">Clientes activos</span>
          </div>
          <span className="text-3xl font-bold">{activos}</span>
          <div className="mt-3 h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
            <div className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500" style={{ width: `${Math.min(activos / Math.max(clientes.length, 1) * 100, 100)}%` }} />
          </div>
        </div>
        <div className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-border)] hover:border-[var(--color-border-light)] transition-all duration-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center"><FileText size={20} className="text-[var(--color-accent-purple)]" /></div>
            <span className="text-sm text-[var(--color-text-muted)]">Total cotizaciones</span>
          </div>
          <span className="text-3xl font-bold">{cotizaciones.length}</span>
          <div className="mt-3 h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
            <div className="h-full rounded-full bg-[var(--color-accent-purple)] transition-all duration-500" style={{ width: `${Math.min(cotizaciones.length * 10, 100)}%` }} />
          </div>
        </div>
        <div className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-border)] hover:border-[var(--color-border-light)] transition-all duration-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"><TrendingUp size={20} className="text-[var(--color-accent-green)]" /></div>
            <span className="text-sm text-[var(--color-text-muted)]">Cerrados</span>
          </div>
          <span className="text-3xl font-bold">{clientes.filter(c => c.etapa === 'cerrado').length}</span>
          <div className="mt-3 h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
            <div className="h-full rounded-full bg-[var(--color-accent-green)] transition-all duration-500" style={{ width: `${Math.min(clientes.filter(c => c.etapa === 'cerrado').length / Math.max(clientes.length, 1) * 100, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Pipeline mini */}
      <div className="grid grid-cols-6 gap-2">
        {ETAPAS.map(e => {
          const count = clientes.filter(c => c.etapa === e.key).length
          return (
            <div key={e.key} onClick={() => navigate('/pipeline')} className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border)] text-center hover:border-[var(--color-border-light)] transition-all duration-200 cursor-pointer">
              <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ background: e.color }} />
              <span className="text-2xl font-bold block">{count}</span>
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">{e.label}</span>
            </div>
          )
        })}
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold">Ultimos clientes</h3>
            <button onClick={() => navigate('/clientes')} className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1">Ver todos <ArrowRight size={12} /></button>
          </div>
          <div className="space-y-1">
            {clientes.slice(-5).reverse().map(c => {
              const etapa = ETAPAS.find(e => e.key === c.etapa)
              return (
                <div key={c.id} onClick={() => navigate(`/clientes/${c.id}`)} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--color-surface-hover)] cursor-pointer transition-all duration-200">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: getAvatarColor(c.nombre) }}>{getInitials(c.nombre)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{c.nombre}</div>
                    <div className="text-xs text-[var(--color-text-muted)] truncate">{c.empresa}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0" style={{ background: etapa?.color + '18', color: etapa?.color }}>{etapa?.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold">Cotizaciones recientes</h3>
            <button onClick={() => navigate('/cotizaciones')} className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1">Ver todas <ArrowRight size={12} /></button>
          </div>
          {cotizaciones.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={32} className="text-[var(--color-border-light)] mx-auto mb-3" />
              <p className="text-sm text-[var(--color-text-muted)]">No hay cotizaciones aun.</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Configura un producto y genera tu primera cotizacion.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cotizaciones.slice(-5).reverse().map(c => {
                const cliente = state.clientes.find(cl => cl.id === c.cliente_id)
                return (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-border-light)] transition-all duration-200">
                    <div>
                      <span className="text-sm font-medium font-mono">{c.numero}</span>
                      <span className="text-xs text-[var(--color-text-muted)] ml-2">{cliente?.nombre}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.estado === 'aprobada' ? 'bg-green-500/15 text-green-400' : c.estado === 'rechazada' ? 'bg-red-500/15 text-red-400' : c.estado === 'enviada' ? 'bg-blue-500/15 text-blue-400' : 'bg-gray-500/15 text-gray-400'}`}>{c.estado}</span>
                      <span className="text-sm font-bold">{formatCOP(c.total)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

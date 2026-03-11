import { useStore } from '../lib/store'
import { ETAPAS } from '../types'
import { formatCOP, formatDate } from '../lib/utils'

export default function Dashboard() {
  const { state } = useStore()
  const { clientes, cotizaciones } = state

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      <div className="grid grid-cols-3 gap-4">
        {ETAPAS.map(e => {
          const count = clientes.filter(c => c.etapa === e.key).length
          return (
            <div key={e.key} className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--color-text-muted)]">{e.label}</span>
                <span className="w-3 h-3 rounded-full" style={{ background: e.color }} />
              </div>
              <span className="text-3xl font-bold">{count}</span>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)]">
          <h3 className="font-semibold mb-4">Últimos clientes</h3>
          <div className="space-y-3">
            {clientes.slice(-5).reverse().map(c => (
              <div key={c.id} className="flex justify-between items-center text-sm">
                <div>
                  <div className="font-medium">{c.nombre}</div>
                  <div className="text-[var(--color-text-muted)]">{c.empresa}</div>
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">{formatDate(c.fecha_ingreso)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)]">
          <h3 className="font-semibold mb-4">Cotizaciones recientes</h3>
          {cotizaciones.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">No hay cotizaciones aún. Configura un producto para un cliente y genera tu primera cotización.</p>
          ) : (
            <div className="space-y-3">
              {cotizaciones.slice(-5).reverse().map(c => (
                <div key={c.id} className="flex justify-between items-center text-sm">
                  <span className="font-medium">{c.numero}</span>
                  <span>{formatCOP(c.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

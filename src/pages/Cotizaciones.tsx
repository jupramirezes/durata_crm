import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { formatCOP, formatDate } from '../lib/utils'
import { FileText } from 'lucide-react'

export default function Cotizaciones() {
  const { state, dispatch } = useStore()
  const navigate = useNavigate()

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">Cotizaciones</h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">{state.cotizaciones.length} cotizacion{state.cotizaciones.length !== 1 ? 'es' : ''} generada{state.cotizaciones.length !== 1 ? 's' : ''}</p>
      </div>

      {state.cotizaciones.length === 0 ? (
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-16 text-center">
          <FileText size={48} className="text-[var(--color-border-light)] mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)] font-medium">No hay cotizaciones generadas aun.</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-2">Ve a un cliente, configura un producto, y genera tu primera cotizacion.</p>
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-muted)]">
                <th className="px-5 py-3.5 font-medium">Numero</th>
                <th className="px-5 py-3.5 font-medium">Cliente</th>
                <th className="px-5 py-3.5 font-medium">Empresa</th>
                <th className="px-5 py-3.5 font-medium">Fecha</th>
                <th className="px-5 py-3.5 font-medium text-right">Total</th>
                <th className="px-5 py-3.5 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {state.cotizaciones.map((c, i) => {
                const cliente = state.clientes.find(cl => cl.id === c.cliente_id)
                return (
                  <tr key={c.id} className={`border-b border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-all duration-200 ${i % 2 === 1 ? 'bg-[var(--color-bg)]/50' : ''}`}>
                    <td className="px-5 py-3.5 font-medium font-mono">{c.numero}</td>
                    <td className="px-5 py-3.5 cursor-pointer hover:text-[var(--color-primary)]" onClick={() => cliente && navigate(`/clientes/${cliente.id}`)}>{cliente?.nombre}</td>
                    <td className="px-5 py-3.5 text-[var(--color-text-muted)]">{cliente?.empresa}</td>
                    <td className="px-5 py-3.5 text-[var(--color-text-muted)]">{formatDate(c.fecha)}</td>
                    <td className="px-5 py-3.5 text-right font-bold">{formatCOP(c.total)}</td>
                    <td className="px-5 py-3.5">
                      <select value={c.estado} onChange={e => dispatch({ type: 'UPDATE_COTIZACION_ESTADO', payload: { id: c.id, estado: e.target.value as any } })} className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] font-medium">
                        <option value="borrador">Borrador</option>
                        <option value="enviada">Enviada</option>
                        <option value="aprobada">Aprobada</option>
                        <option value="rechazada">Rechazada</option>
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

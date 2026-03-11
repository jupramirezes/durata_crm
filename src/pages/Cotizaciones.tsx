import { useStore } from '../lib/store'
import { formatCOP, formatDate } from '../lib/utils'

export default function Cotizaciones() {
  const { state, dispatch } = useStore()

  return (
    <div className="p-8 space-y-5">
      <h2 className="text-2xl font-bold">Cotizaciones</h2>

      {state.cotizaciones.length === 0 ? (
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-12 text-center">
          <p className="text-[var(--color-text-muted)]">No hay cotizaciones generadas aún.</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-2">Ve a un cliente, configura un producto, y genera tu primera cotización.</p>
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-muted)]">
                <th className="px-4 py-3 font-medium">Número</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {state.cotizaciones.map(c => {
                const cliente = state.clientes.find(cl => cl.id === c.cliente_id)
                return (
                  <tr key={c.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]">
                    <td className="px-4 py-3 font-medium font-mono">{c.numero}</td>
                    <td className="px-4 py-3">{cliente?.nombre}</td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">{cliente?.empresa}</td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">{formatDate(c.fecha)}</td>
                    <td className="px-4 py-3 text-right font-bold">{formatCOP(c.total)}</td>
                    <td className="px-4 py-3">
                      <select value={c.estado} onChange={e => dispatch({ type: 'UPDATE_COTIZACION_ESTADO', payload: { id: c.id, estado: e.target.value as any } })} className="text-xs px-2 py-1 rounded bg-[var(--color-bg)] border border-[var(--color-border)]">
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

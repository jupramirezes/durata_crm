import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { formatCOP, formatDate } from '../lib/utils'
import { FileText, Copy, Trash2, Edit3 } from 'lucide-react'

export default function Cotizaciones() {
  const { state, dispatch } = useStore()
  const navigate = useNavigate()

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text)]">Cotizaciones</h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">{state.cotizaciones.length} cotizacion{state.cotizaciones.length !== 1 ? 'es' : ''} generada{state.cotizaciones.length !== 1 ? 's' : ''}</p>
      </div>

      {state.cotizaciones.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--color-border)] p-16 text-center">
          <FileText size={48} className="text-[var(--color-border)] mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)] font-medium">No hay cotizaciones generadas aun.</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-2">Ve a un cliente, configura un producto, y genera tu primera cotizacion.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F1F5F9] text-left text-[var(--color-text-muted)]">
                <th className="px-5 py-3.5 font-medium">Numero</th>
                <th className="px-5 py-3.5 font-medium">Cliente</th>
                <th className="px-5 py-3.5 font-medium">Empresa</th>
                <th className="px-5 py-3.5 font-medium">Fecha</th>
                <th className="px-5 py-3.5 font-medium text-right">Total</th>
                <th className="px-5 py-3.5 font-medium">Estado</th>
                <th className="px-5 py-3.5 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {state.cotizaciones.map((c, i) => {
                const cliente = state.clientes.find(cl => cl.id === c.cliente_id)
                return (
                  <tr key={c.id} className={`border-t border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-all duration-200 ${i % 2 === 1 ? 'bg-[var(--color-surface)]' : 'bg-white'}`}>
                    <td className="px-5 py-3.5 font-medium font-mono text-[var(--color-text)]">{c.numero}</td>
                    <td className="px-5 py-3.5 cursor-pointer hover:text-[var(--color-primary)] text-[var(--color-text)]" onClick={() => cliente && navigate(`/clientes/${cliente.id}`)}>{cliente?.nombre}</td>
                    <td className="px-5 py-3.5 text-[var(--color-text-muted)]">{cliente?.empresa}</td>
                    <td className="px-5 py-3.5 text-[var(--color-text-muted)]">{formatDate(c.fecha)}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-[var(--color-text)]">{formatCOP(c.total)}</td>
                    <td className="px-5 py-3.5">
                      <select value={c.estado} onChange={e => dispatch({ type: 'UPDATE_COTIZACION_ESTADO', payload: { id: c.id, estado: e.target.value as any } })} className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] font-medium text-[var(--color-text)]">
                        <option value="borrador">Borrador</option>
                        <option value="enviada">Enviada</option>
                        <option value="aprobada">Aprobada</option>
                        <option value="rechazada">Rechazada</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/cotizaciones/${c.id}/editar`)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-[var(--color-primary)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] font-medium transition-all duration-200"
                          title="Editar cotizaci&oacute;n"
                        >
                          <Edit3 size={12} /> Editar
                        </button>
                        <button
                          onClick={() => {
                            const nuevoNumero = prompt('Numero de la nueva cotizacion:') || ''
                            if (nuevoNumero) {
                              dispatch({ type: 'DUPLICATE_COTIZACION', payload: { originalId: c.id, nuevoNumero } })
                            }
                          }}
                          className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] transition-all duration-200"
                          title="Duplicar"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('¿Eliminar esta cotizacion?')) {
                              dispatch({ type: 'DELETE_COTIZACION', payload: { id: c.id } })
                            }
                          }}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 border border-red-200 transition-all duration-200"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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

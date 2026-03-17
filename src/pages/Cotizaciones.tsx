import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { formatCOP, formatDate } from '../lib/utils'
import { PageHeader } from '../components/ui'
import { FileText, Copy, Trash2, Edit3 } from 'lucide-react'

export default function Cotizaciones() {
  const { state, dispatch } = useStore()
  const navigate = useNavigate()

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <PageHeader
        title="Cotizaciones"
        subtitle={`${state.cotizaciones.length} cotizacion${state.cotizaciones.length !== 1 ? 'es' : ''} generada${state.cotizaciones.length !== 1 ? 's' : ''}`}
      />

      {state.cotizaciones.length === 0 ? (
        <div className="bg-white rounded-lg border border-[var(--color-border)] p-12 text-center">
          <FileText size={36} className="text-[var(--color-border)] mx-auto mb-3" />
          <p className="text-[var(--color-text-muted)] text-sm font-medium">No hay cotizaciones generadas aun.</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1.5">Ve a una oportunidad, configura un producto, y genera tu primera cotizacion.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[var(--color-border)] overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[var(--color-surface)] text-left text-[var(--color-text-muted)]">
                <th className="px-4 py-2.5 font-medium">Numero</th>
                <th className="px-4 py-2.5 font-medium">Empresa</th>
                <th className="px-4 py-2.5 font-medium">Contacto</th>
                <th className="px-4 py-2.5 font-medium">Fecha</th>
                <th className="px-4 py-2.5 font-medium text-right">Total</th>
                <th className="px-4 py-2.5 font-medium">Estado</th>
                <th className="px-4 py-2.5 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {state.cotizaciones.map((c, i) => {
                const oportunidad = state.oportunidades.find(o => o.id === c.oportunidad_id)
                const empresa = oportunidad ? state.empresas.find(e => e.id === oportunidad.empresa_id) : null
                const contacto = oportunidad ? state.contactos.find(ct => ct.id === oportunidad.contacto_id) : null
                return (
                  <tr key={c.id} className={`border-t border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors ${i % 2 === 1 ? 'bg-[var(--color-surface)]' : 'bg-white'}`}>
                    <td className="px-4 py-2.5 font-medium font-mono text-[var(--color-text)]">{c.numero}</td>
                    <td className="px-4 py-2.5 cursor-pointer hover:text-[var(--color-primary)] text-[var(--color-text)]" onClick={() => oportunidad && navigate(`/oportunidades/${oportunidad.id}`)}>{empresa?.nombre || '\u2014'}</td>
                    <td className="px-4 py-2.5 text-[var(--color-text-muted)]">{contacto?.nombre || '\u2014'}</td>
                    <td className="px-4 py-2.5 text-[var(--color-text-muted)]">{formatDate(c.fecha)}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-[var(--color-text)] font-mono">{formatCOP(c.total)}</td>
                    <td className="px-4 py-2.5">
                      <select value={c.estado} onChange={e => dispatch({ type: 'UPDATE_COTIZACION_ESTADO', payload: { id: c.id, estado: e.target.value as any } })} className="text-[10px] px-2 py-1 rounded bg-[var(--color-surface)] border border-[var(--color-border)] font-medium text-[var(--color-text)]">
                        <option value="borrador">Borrador</option>
                        <option value="enviada">Enviada</option>
                        <option value="aprobada">Aprobada</option>
                        <option value="rechazada">Rechazada</option>
                      </select>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/cotizaciones/${c.id}/editar`)}
                          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded text-[var(--color-primary)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] font-medium transition-all"
                        >
                          <Edit3 size={10} /> Editar
                        </button>
                        <button
                          onClick={() => {
                            const nuevoNumero = prompt('Numero de la nueva cotizacion:') || ''
                            if (nuevoNumero) {
                              dispatch({ type: 'DUPLICATE_COTIZACION', payload: { originalId: c.id, nuevoNumero } })
                            }
                          }}
                          className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] transition-all"
                          title="Duplicar"
                        >
                          <Copy size={12} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('\u00bfEliminar esta cotizacion?')) {
                              dispatch({ type: 'DELETE_COTIZACION', payload: { id: c.id } })
                            }
                          }}
                          className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 border border-red-200 transition-all"
                          title="Eliminar"
                        >
                          <Trash2 size={12} />
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

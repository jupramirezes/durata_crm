import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { ETAPAS, Etapa } from '../types'
import { daysSince, getInitials, getAvatarColor } from '../lib/utils'
import { Plus, Clock } from 'lucide-react'
import ClienteFormModal from '../components/ClienteFormModal'

export default function Pipeline() {
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  function onDragStart(e: React.DragEvent, clienteId: string) {
    e.dataTransfer.setData('text/plain', clienteId)
    e.dataTransfer.effectAllowed = 'move'
    setDragging(clienteId)
  }
  function onDragOver(e: React.DragEvent, etapaKey: string) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverCol(etapaKey)
  }
  function onDragLeave() { setDragOverCol(null) }
  function onDrop(e: React.DragEvent, etapa: Etapa) {
    e.preventDefault()
    const clienteId = e.dataTransfer.getData('text/plain')
    if (clienteId) dispatch({ type: 'MOVE_ETAPA', payload: { clienteId, nuevaEtapa: etapa } })
    setDragging(null)
    setDragOverCol(null)
  }
  function onDragEnd() { setDragging(null); setDragOverCol(null) }

  return (
    <div className="p-6 h-screen flex flex-col animate-fade-in">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Pipeline</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{state.clientes.length} clientes en total</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> Nuevo cliente
        </button>
      </div>

      <div className="flex-1 flex gap-3 overflow-x-auto pb-4">
        {ETAPAS.map(etapa => {
          const clientes = state.clientes.filter(c => c.etapa === etapa.key)
          const isOver = dragOverCol === etapa.key
          return (
            <div
              key={etapa.key}
              onDragOver={e => onDragOver(e, etapa.key)}
              onDragLeave={onDragLeave}
              onDrop={e => onDrop(e, etapa.key)}
              className={`flex-shrink-0 w-[260px] rounded-2xl border flex flex-col transition-all duration-200 ${
                isOver
                  ? 'bg-cyan-50 border-cyan-300'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)]'
              }`}
            >
              <div className="p-3.5 border-b border-[var(--color-border)] flex items-center gap-2.5">
                <span className="text-[13px] font-semibold flex-1 text-[var(--color-text)]">{etapa.label}</span>
                <span
                  className="w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold"
                  style={{ background: etapa.color + '20', color: etapa.color }}
                >
                  {clientes.length}
                </span>
              </div>
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {clientes.map(c => {
                  const dias = daysSince(c.fecha_ingreso)
                  const productos = state.productos.filter(p => p.cliente_id === c.id)
                  const tieneCotizacion = state.cotizaciones.some(cot => cot.cliente_id === c.id)
                  return (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={e => onDragStart(e, c.id)}
                      onDragEnd={onDragEnd}
                      onClick={() => navigate(`/clientes/${c.id}`)}
                      className={`bg-white rounded-xl p-3.5 border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-border-light)] transition-all duration-200 ${
                        dragging === c.id ? 'opacity-50 scale-95' : 'hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                          style={{ background: getAvatarColor(c.nombre) }}
                        >
                          {getInitials(c.nombre)}
                        </div>
                        <div className="font-semibold text-sm truncate text-[var(--color-text)]">{c.nombre}</div>
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)] truncate mb-2 ml-[38px]">{c.empresa}</div>
                      <div className="flex items-center gap-2 ml-[38px] flex-wrap">
                        <span className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
                          <Clock size={10} /> hace {dias} dias
                        </span>
                        {productos.length > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">
                            {productos.length === 1 ? '1 producto' : `${productos.length} productos`}
                          </span>
                        )}
                        {tieneCotizacion && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                            Cotizado
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {showModal && <ClienteFormModal onClose={() => setShowModal(false)} />}
    </div>
  )
}

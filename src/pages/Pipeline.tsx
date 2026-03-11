import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { ETAPAS, Etapa } from '../types'
import { daysSince, getInitials, getAvatarColor } from '../lib/utils'
import { GripVertical, Plus, Clock } from 'lucide-react'
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
          <h2 className="text-2xl font-bold">Pipeline</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{state.clientes.length} clientes en total</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-[#4f8cff] to-[#3b7aed] hover:opacity-90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-blue-500/20">
          <Plus size={16} /> Nuevo cliente
        </button>
      </div>

      <div className="flex-1 flex gap-3 overflow-x-auto pb-4">
        {ETAPAS.map(etapa => {
          const clientes = state.clientes.filter(c => c.etapa === etapa.key)
          const isOver = dragOverCol === etapa.key
          return (
            <div key={etapa.key}
              onDragOver={e => onDragOver(e, etapa.key)}
              onDragLeave={onDragLeave}
              onDrop={e => onDrop(e, etapa.key)}
              className={`flex-shrink-0 w-[260px] rounded-2xl border flex flex-col transition-all duration-200 ${
                isOver
                  ? 'bg-blue-500/5 border-blue-500/30 ring-1 ring-blue-500/20'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)]'
              }`}
            >
              <div className="p-3.5 border-b border-[var(--color-border)] flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: etapa.color }} />
                <span className="text-[13px] font-semibold flex-1">{etapa.label}</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg" style={{ background: etapa.color + '18', color: etapa.color }}>{clientes.length}</span>
              </div>
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {clientes.map(c => {
                  const dias = daysSince(c.fecha_ingreso)
                  const productos = state.productos.filter(p => p.cliente_id === c.id)
                  return (
                    <div key={c.id} draggable onDragStart={e => onDragStart(e, c.id)} onDragEnd={onDragEnd}
                      onClick={() => navigate(`/clientes/${c.id}`)}
                      className={`bg-[var(--color-bg)] rounded-xl p-3.5 border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-border-light)] transition-all duration-200 ${
                        dragging === c.id ? 'opacity-40 scale-95 rotate-1' : 'hover:shadow-lg hover:shadow-black/20'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <GripVertical size={14} className="mt-1 text-[var(--color-text-muted)] cursor-grab shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0" style={{ background: getAvatarColor(c.nombre) }}>{getInitials(c.nombre)}</div>
                            <div className="font-medium text-sm truncate">{c.nombre}</div>
                          </div>
                          <div className="text-xs text-[var(--color-text-muted)] truncate mb-2">{c.empresa}</div>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
                              <Clock size={10} /> {dias}d
                            </span>
                            {productos.length > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 font-medium">{productos.length} prod.</span>
                            )}
                          </div>
                        </div>
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

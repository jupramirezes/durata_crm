import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { ETAPAS, Etapa } from '../types'
import { formatDate } from '../lib/utils'
import { GripVertical, Plus } from 'lucide-react'
import ClienteFormModal from '../components/ClienteFormModal'

export default function Pipeline() {
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const [dragging, setDragging] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  function onDragStart(e: React.DragEvent, clienteId: string) {
    e.dataTransfer.setData('clienteId', clienteId)
    setDragging(clienteId)
  }
  function onDragOver(e: React.DragEvent) { e.preventDefault() }
  function onDrop(e: React.DragEvent, etapa: Etapa) {
    e.preventDefault()
    const clienteId = e.dataTransfer.getData('clienteId')
    dispatch({ type: 'MOVE_ETAPA', payload: { clienteId, nuevaEtapa: etapa } })
    setDragging(null)
  }

  return (
    <div className="p-6 h-screen flex flex-col">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">Pipeline</h2>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-4 py-2 rounded-lg text-sm transition-colors">
          <Plus size={16} /> Nuevo cliente
        </button>
      </div>

      <div className="flex-1 flex gap-3 overflow-x-auto pb-4">
        {ETAPAS.map(etapa => {
          const clientes = state.clientes.filter(c => c.etapa === etapa.key)
          return (
            <div key={etapa.key}
              onDragOver={onDragOver}
              onDrop={e => onDrop(e, etapa.key)}
              className="flex-shrink-0 w-64 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] flex flex-col"
            >
              <div className="p-3 border-b border-[var(--color-border)] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: etapa.color }} />
                <span className="text-sm font-semibold flex-1">{etapa.label}</span>
                <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg)] px-2 py-0.5 rounded-full">{clientes.length}</span>
              </div>
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {clientes.map(c => (
                  <div key={c.id} draggable onDragStart={e => onDragStart(e, c.id)}
                    onClick={() => navigate(`/clientes/${c.id}`)}
                    className={`bg-[var(--color-bg)] rounded-lg p-3 border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-primary)] transition-all ${dragging === c.id ? 'opacity-40' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical size={14} className="mt-1 text-[var(--color-text-muted)] cursor-grab" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{c.nombre}</div>
                        <div className="text-xs text-[var(--color-text-muted)] truncate">{c.empresa}</div>
                        <div className="text-xs text-[var(--color-text-muted)] mt-1">{formatDate(c.fecha_ingreso)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {showModal && <ClienteFormModal onClose={() => setShowModal(false)} />}
    </div>
  )
}

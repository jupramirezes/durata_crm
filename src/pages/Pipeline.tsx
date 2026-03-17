import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { ETAPAS, Etapa, COTIZADORES, MOTIVOS_PERDIDA } from '../types'
import { daysSince, formatCOP, getAvatarColor } from '../lib/utils'
import { Plus, Clock, X, History } from 'lucide-react'
import OportunidadFormModal from '../components/OportunidadFormModal'

const ETAPAS_ACTIVAS: Set<string> = new Set([
  'nuevo_lead', 'en_cotizacion', 'cotizacion_enviada', 'en_seguimiento', 'en_negociacion',
])

function isActive(op: { etapa: string; fecha_ingreso?: string }): boolean {
  if (ETAPAS_ACTIVAS.has(op.etapa)) return true
  // 2026+ oportunidades siempre se muestran
  const year = op.fecha_ingreso ? new Date(op.fecha_ingreso).getFullYear() : 0
  return year >= 2026
}

export default function Pipeline() {
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showHistoricas, setShowHistoricas] = useState(false)
  const [adjudicadaModal, setAdjudicadaModal] = useState<string | null>(null)
  const [perdidaModal, setPerdidaModal] = useState<string | null>(null)
  const [valorAdjudicado, setValorAdjudicado] = useState(0)
  const [motivoPerdida, setMotivoPerdida] = useState<string>(MOTIVOS_PERDIDA[0])

  const filtered = useMemo(
    () => showHistoricas ? state.oportunidades : state.oportunidades.filter(isActive),
    [state.oportunidades, showHistoricas],
  )

  const activeCount = useMemo(
    () => state.oportunidades.filter(isActive).length,
    [state.oportunidades],
  )

  function onDragStart(e: React.DragEvent, oportunidadId: string) {
    e.dataTransfer.setData('text/plain', oportunidadId)
    e.dataTransfer.effectAllowed = 'move'
    setDragging(oportunidadId)
  }
  function onDragOver(e: React.DragEvent, etapaKey: string) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverCol(etapaKey)
  }
  function onDragLeave() { setDragOverCol(null) }
  function onDrop(e: React.DragEvent, etapa: Etapa) {
    e.preventDefault()
    const oportunidadId = e.dataTransfer.getData('text/plain')
    if (!oportunidadId) return
    setDragging(null)
    setDragOverCol(null)

    if (etapa === 'adjudicada') {
      const op = state.oportunidades.find(o => o.id === oportunidadId)
      setValorAdjudicado(op?.valor_cotizado || 0)
      setAdjudicadaModal(oportunidadId)
      return
    }
    if (etapa === 'perdida') {
      setMotivoPerdida(MOTIVOS_PERDIDA[0])
      setPerdidaModal(oportunidadId)
      return
    }
    dispatch({ type: 'MOVE_ETAPA', payload: { oportunidadId, nuevaEtapa: etapa } })
  }
  function onDragEnd() { setDragging(null); setDragOverCol(null) }

  function confirmAdjudicada() {
    if (!adjudicadaModal) return
    dispatch({ type: 'MOVE_ETAPA', payload: { oportunidadId: adjudicadaModal, nuevaEtapa: 'adjudicada', valor_adjudicado: valorAdjudicado } })
    setAdjudicadaModal(null)
  }

  function confirmPerdida() {
    if (!perdidaModal) return
    dispatch({ type: 'MOVE_ETAPA', payload: { oportunidadId: perdidaModal, nuevaEtapa: 'perdida', motivo_perdida: motivoPerdida } })
    setPerdidaModal(null)
  }

  return (
    <div className="p-6 h-screen flex flex-col animate-fade-in">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Pipeline</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            {activeCount} oportunidades activas
            {showHistoricas && ` (${state.oportunidades.length} total)`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHistoricas(!showHistoricas)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
              showHistoricas
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'
            }`}
          >
            <History size={14} />
            {showHistoricas ? 'Ocultando históricas' : 'Mostrar históricas'}
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus size={16} /> Nueva oportunidad
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-3 overflow-x-auto pb-4">
        {ETAPAS.map(etapa => {
          const oportunidades = filtered.filter(o => o.etapa === etapa.key)
          const isOver = dragOverCol === etapa.key
          return (
            <div
              key={etapa.key}
              onDragOver={e => onDragOver(e, etapa.key)}
              onDragLeave={onDragLeave}
              onDrop={e => onDrop(e, etapa.key)}
              className={`flex-shrink-0 w-[230px] rounded-2xl border flex flex-col transition-all duration-200 ${
                isOver
                  ? 'bg-cyan-50 border-cyan-300'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)]'
              }`}
            >
              <div className="p-3 border-b border-[var(--color-border)] flex items-center gap-2">
                <span className="text-[12px] font-semibold flex-1 text-[var(--color-text)] truncate">{etapa.label}</span>
                <span
                  className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold"
                  style={{ background: etapa.color + '20', color: etapa.color }}
                >
                  {oportunidades.length}
                </span>
              </div>
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {oportunidades.map(o => {
                  const empresa = state.empresas.find(e => e.id === o.empresa_id)
                  const contacto = state.contactos.find(c => c.id === o.contacto_id)
                  const cotizador = COTIZADORES.find(c => c.id === o.cotizador_asignado)
                  const dias = daysSince(o.fecha_ingreso)
                  return (
                    <div
                      key={o.id}
                      draggable
                      onDragStart={e => onDragStart(e, o.id)}
                      onDragEnd={onDragEnd}
                      onClick={() => navigate(`/oportunidades/${o.id}`)}
                      className={`bg-white rounded-xl p-3 border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-border-light)] transition-all duration-200 ${
                        dragging === o.id ? 'opacity-50 scale-95' : 'hover:shadow-md'
                      }`}
                    >
                      <div className="font-semibold text-sm truncate text-[var(--color-text)] mb-0.5">{empresa?.nombre}</div>
                      <div className="text-xs text-[var(--color-text-muted)] truncate mb-2">{contacto?.nombre}</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[var(--color-accent-green)]">{formatCOP(o.valor_cotizado)}</span>
                        {cotizador && (
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded font-bold text-white"
                            style={{ background: getAvatarColor(cotizador.nombre) }}
                          >
                            {cotizador.iniciales}
                          </span>
                        )}
                        <span className="flex items-center gap-0.5 text-[10px] text-[var(--color-text-muted)] ml-auto">
                          <Clock size={9} /> {dias}d
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {showModal && <OportunidadFormModal onClose={() => setShowModal(false)} />}

      {/* Adjudicada modal */}
      {adjudicadaModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-[var(--color-border)] w-full max-w-sm p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Adjudicar oportunidad</h3>
              <button onClick={() => setAdjudicadaModal(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1"><X size={18} /></button>
            </div>
            <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Valor adjudicado (COP)</label>
            <input type="number" value={valorAdjudicado || ''} onChange={e => setValorAdjudicado(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl text-sm mb-1" />
            {valorAdjudicado > 0 && <p className="text-xs text-[var(--color-text-muted)] mb-4">{formatCOP(valorAdjudicado)}</p>}
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setAdjudicadaModal(null)} className="px-4 py-2 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] rounded-xl">Cancelar</button>
              <button onClick={confirmAdjudicada} className="px-4 py-2 bg-[var(--color-accent-green)] text-white text-sm font-bold rounded-xl hover:opacity-90">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Perdida modal */}
      {perdidaModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-[var(--color-border)] w-full max-w-sm p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Motivo de p&eacute;rdida</h3>
              <button onClick={() => setPerdidaModal(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1"><X size={18} /></button>
            </div>
            <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Motivo</label>
            <select value={motivoPerdida} onChange={e => setMotivoPerdida(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm mb-4">
              {MOTIVOS_PERDIDA.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={() => setPerdidaModal(null)} className="px-4 py-2 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] rounded-xl">Cancelar</button>
              <button onClick={confirmPerdida} className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-xl hover:opacity-90">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

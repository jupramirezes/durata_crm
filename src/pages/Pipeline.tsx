import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { ETAPAS, Etapa, COTIZADORES, MOTIVOS_PERDIDA, findCotizador, matchCotizador } from '../types'
import { daysSince, formatCOP, getAvatarColor } from '../lib/utils'
import { Plus, Clock, X, History, Search, StickyNote } from 'lucide-react'
import OportunidadFormModal from '../components/OportunidadFormModal'

const ETAPAS_ACTIVAS: Set<string> = new Set([
  'nuevo_lead', 'en_cotizacion', 'cotizacion_enviada', 'en_seguimiento', 'en_negociacion',
])

function isActive(op: { etapa: string; fecha_ingreso?: string }): boolean {
  if (ETAPAS_ACTIVAS.has(op.etapa)) return true
  const year = op.fecha_ingreso ? new Date(op.fecha_ingreso).getFullYear() : 0
  return year >= 2026
}

const VALOR_PRESETS = [
  { label: 'Todos', min: 0 },
  { label: '>$20M', min: 20_000_000 },
  { label: '>$50M', min: 50_000_000 },
  { label: '>$100M', min: 100_000_000 },
]

const YEARS = [2021, 2022, 2023, 2024, 2025, 2026]
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export default function Pipeline() {
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showHistoricas, setShowHistoricas] = useState(false)
  const [filtroCotizador, setFiltroCotizador] = useState<string>('')
  const [filtroYear, setFiltroYear] = useState<string>('')
  const [filtroMonth, setFiltroMonth] = useState<string>('')
  const [filtroValorMin, setFiltroValorMin] = useState(0)
  const [searchEmpresa, setSearchEmpresa] = useState('')
  const [adjudicadaModal, setAdjudicadaModal] = useState<string | null>(null)
  const [perdidaModal, setPerdidaModal] = useState<string | null>(null)
  const [valorAdjudicado, setValorAdjudicado] = useState(0)
  const [motivoPerdida, setMotivoPerdida] = useState<string>(MOTIVOS_PERDIDA[0])

  // Build empresa name lookup for search
  const empresaMap = useMemo(() => {
    const m = new Map<string, string>()
    for (const e of state.empresas) m.set(e.id, e.nombre.toLowerCase())
    return m
  }, [state.empresas])

  // Build contacto lookup
  const contactoMap = useMemo(() => {
    const m = new Map<string, string>()
    for (const c of state.contactos) m.set(c.id, c.nombre)
    return m
  }, [state.contactos])

  const filtered = useMemo(() => {
    let ops = showHistoricas ? state.oportunidades : state.oportunidades.filter(isActive)
    if (filtroCotizador) ops = ops.filter(o => matchCotizador(o.cotizador_asignado, filtroCotizador))
    if (filtroYear) {
      const y = Number(filtroYear)
      ops = ops.filter(o => new Date(o.fecha_ingreso).getFullYear() === y)
    }
    if (filtroMonth) {
      const m = Number(filtroMonth)
      ops = ops.filter(o => new Date(o.fecha_ingreso).getMonth() === m)
    }
    if (filtroValorMin > 0) {
      ops = ops.filter(o => o.valor_cotizado >= filtroValorMin)
    }
    if (searchEmpresa.trim()) {
      const q = searchEmpresa.trim().toLowerCase()
      ops = ops.filter(o => (empresaMap.get(o.empresa_id) || '').includes(q))
    }
    return ops
  }, [state.oportunidades, showHistoricas, filtroCotizador, filtroYear, filtroMonth, filtroValorMin, searchEmpresa, empresaMap])

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
    e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverCol(etapaKey)
  }
  function onDragLeave() { setDragOverCol(null) }
  function onDrop(e: React.DragEvent, etapa: Etapa) {
    e.preventDefault()
    const oportunidadId = e.dataTransfer.getData('text/plain')
    if (!oportunidadId) return
    setDragging(null); setDragOverCol(null)
    if (etapa === 'adjudicada') { const op = state.oportunidades.find(o => o.id === oportunidadId); setValorAdjudicado(op?.valor_cotizado || 0); setAdjudicadaModal(oportunidadId); return }
    if (etapa === 'perdida') { setMotivoPerdida(MOTIVOS_PERDIDA[0]); setPerdidaModal(oportunidadId); return }
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

  const hasFilters = filtroCotizador || filtroYear || filtroMonth || filtroValorMin > 0 || searchEmpresa.trim()

  return (
    <div className="p-5 h-screen flex flex-col animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">Pipeline</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {activeCount} activas{showHistoricas && ` (${state.oportunidades.length} total)`}
            {hasFilters && ` — ${filtered.length} filtradas`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Cotizador filter chips */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFiltroCotizador('')}
              className={`text-[10px] px-2 py-1 rounded font-medium transition-colors ${!filtroCotizador ? 'bg-[var(--color-primary)] text-white' : 'bg-white border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]'}`}
            >Todos</button>
            {COTIZADORES.map(c => (
              <button
                key={c.id}
                onClick={() => setFiltroCotizador(filtroCotizador === c.id ? '' : c.id)}
                className={`text-[10px] px-2 py-1 rounded font-medium transition-colors ${filtroCotizador === c.id ? 'text-white' : 'bg-white border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]'}`}
                style={filtroCotizador === c.id ? { background: getAvatarColor(c.nombre) } : {}}
              >{c.iniciales}</button>
            ))}
          </div>
          <button
            onClick={() => setShowHistoricas(!showHistoricas)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-colors border ${
              showHistoricas ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]'
            }`}
          >
            <History size={12} />
            Históricas
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-4 py-2 rounded-md text-xs font-semibold transition-colors"
          >
            <Plus size={14} /> Nueva
          </button>
        </div>
      </div>

      {/* Fix 10: Additional filters row */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="relative">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            value={searchEmpresa}
            onChange={e => setSearchEmpresa(e.target.value)}
            placeholder="Buscar empresa..."
            className="pl-7 pr-2 py-1.5 rounded text-[10px] border border-[var(--color-border)] bg-white w-36"
          />
        </div>
        <select
          value={filtroYear}
          onChange={e => setFiltroYear(e.target.value)}
          className="px-2 py-1.5 rounded text-[10px] border border-[var(--color-border)] bg-white"
        >
          <option value="">Año: Todos</option>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          value={filtroMonth}
          onChange={e => setFiltroMonth(e.target.value)}
          className="px-2 py-1.5 rounded text-[10px] border border-[var(--color-border)] bg-white"
        >
          <option value="">Mes: Todos</option>
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <div className="flex items-center gap-1">
          {VALOR_PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => setFiltroValorMin(filtroValorMin === p.min ? 0 : p.min)}
              className={`text-[10px] px-2 py-1 rounded font-medium transition-colors ${filtroValorMin === p.min ? 'bg-[var(--color-primary)] text-white' : 'bg-white border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]'}`}
            >{p.label}</button>
          ))}
        </div>
        {hasFilters && (
          <button
            onClick={() => { setFiltroCotizador(''); setFiltroYear(''); setFiltroMonth(''); setFiltroValorMin(0); setSearchEmpresa('') }}
            className="text-[10px] px-2 py-1 rounded font-medium text-red-500 hover:bg-red-50 border border-red-200 transition-colors"
          >Limpiar filtros</button>
        )}
      </div>

      <div className="flex-1 flex gap-2 overflow-x-auto pb-3">
        {ETAPAS.map(etapa => {
          // Fix 9: Sort cards by valor_cotizado descending
          const oportunidades = filtered
            .filter(o => o.etapa === etapa.key)
            .sort((a, b) => b.valor_cotizado - a.valor_cotizado)
          const valorTotal = oportunidades.reduce((s, o) => s + o.valor_cotizado, 0)
          const isOver = dragOverCol === etapa.key
          return (
            <div
              key={etapa.key}
              onDragOver={e => onDragOver(e, etapa.key)}
              onDragLeave={onDragLeave}
              onDrop={e => onDrop(e, etapa.key)}
              className={`flex-shrink-0 w-[300px] rounded-xl border flex flex-col transition-all duration-150 ${
                isOver ? 'bg-blue-50 border-blue-300 shadow-md' : 'bg-white border-[var(--color-border)]'
              }`}
            >
              {/* Column header with color bar */}
              <div className="rounded-t-lg overflow-hidden">
                <div className="h-[3px]" style={{ background: etapa.color }} />
                <div className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold flex-1 text-[var(--color-text)]">{etapa.label}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: etapa.color + '18', color: etapa.color }}>{oportunidades.length}</span>
                  </div>
                  {valorTotal > 0 && (
                    <span className="text-[13px] text-[var(--color-text-muted)] tabular-nums mt-1 block">{formatCOP(valorTotal)}</span>
                  )}
                </div>
              </div>
              <div className="flex-1 px-2.5 pb-2.5 space-y-3 overflow-y-auto">
                {oportunidades.map(o => {
                  const empresa = state.empresas.find(e => e.id === o.empresa_id)
                  const contactoNombre = contactoMap.get(o.contacto_id)
                  const cotizador = findCotizador(o.cotizador_asignado)
                  const dias = daysSince(o.fecha_ingreso)
                  const hasNotas = o.notas && o.notas.trim().length > 0
                  return (
                    <div
                      key={o.id}
                      draggable
                      onDragStart={e => onDragStart(e, o.id)}
                      onDragEnd={onDragEnd}
                      onClick={() => navigate(`/oportunidades/${o.id}`)}
                      className={`bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)] cursor-pointer transition-all duration-250 ${
                        dragging === o.id ? 'opacity-40 scale-95' : 'hover:shadow-lg hover:border-slate-300 hover:-translate-y-[3px]'
                      }`}
                    >
                      <div className="font-semibold text-[15px] truncate text-[var(--color-text)] mb-1">{empresa?.nombre}</div>
                      {contactoNombre && (
                        <div className="text-sm text-[var(--color-text-muted)] truncate mb-2">{contactoNombre}</div>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold tabular-nums" style={{ color: o.valor_cotizado > 100_000_000 ? 'var(--color-accent-green)' : 'var(--color-text)' }}>{formatCOP(o.valor_cotizado)}</span>
                        {cotizador && (
                          <span className="text-[10px] w-7 h-7 rounded-full font-bold text-white flex items-center justify-center" style={{ background: getAvatarColor(cotizador.nombre) }} title={cotizador.nombre}>{cotizador.iniciales}</span>
                        )}
                        {hasNotas && (
                          <span title="Tiene notas"><StickyNote size={12} className="text-amber-400" /></span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] ml-auto bg-slate-100 px-2.5 py-1 rounded-full">
                          <Clock size={10} /> {dias}d
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
          <div className="bg-white rounded-lg border border-[var(--color-border)] w-full max-w-sm p-5 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-sm">Adjudicar oportunidad</h3>
              <button onClick={() => setAdjudicadaModal(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1"><X size={16} /></button>
            </div>
            <label className="text-[10px] font-medium text-[var(--color-text-muted)] mb-1 block">Valor adjudicado (COP)</label>
            <input type="number" value={valorAdjudicado || ''} onChange={e => setValorAdjudicado(Number(e.target.value))} className="w-full px-3 py-2 rounded-md text-sm mb-1 border border-[var(--color-border)]" />
            {valorAdjudicado > 0 && <p className="text-xs text-[var(--color-text-muted)] mb-3">{formatCOP(valorAdjudicado)}</p>}
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setAdjudicadaModal(null)} className="px-3 py-1.5 text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] rounded-md">Cancelar</button>
              <button onClick={confirmAdjudicada} className="px-3 py-1.5 bg-[var(--color-accent-green)] text-white text-xs font-semibold rounded-md hover:opacity-90">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Perdida modal */}
      {perdidaModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg border border-[var(--color-border)] w-full max-w-sm p-5 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-sm">Motivo de pérdida</h3>
              <button onClick={() => setPerdidaModal(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1"><X size={16} /></button>
            </div>
            <label className="text-[10px] font-medium text-[var(--color-text-muted)] mb-1 block">Motivo</label>
            <select value={motivoPerdida} onChange={e => setMotivoPerdida(e.target.value)} className="w-full px-3 py-2 rounded-md text-sm mb-4 border border-[var(--color-border)]">
              {MOTIVOS_PERDIDA.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setPerdidaModal(null)} className="px-3 py-1.5 text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] rounded-md">Cancelar</button>
              <button onClick={confirmPerdida} className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-md hover:opacity-90">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

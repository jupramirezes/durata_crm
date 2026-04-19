import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { ETAPAS, Etapa, COTIZADORES, MOTIVOS_PERDIDA, findCotizador, matchCotizador } from '../types'
import { daysSince, formatCOP, getAvatarColor } from '../lib/utils'
import { Plus, Clock, X, History, Search, StickyNote, User } from 'lucide-react'
import OportunidadFormModal from '../components/OportunidadFormModal'
import { supabase } from '../lib/supabase'
import { CONFIG_DEFAULTS } from '../hooks/useConfiguracion'

// D-11: 'recotizada' es estado terminal alternativo — la columna aparece (por iterar ETAPAS),
// pero NO se considera activa en el filtro por defecto "solo activas".
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

const DATE_RANGE_OPTIONS = [
  { label: 'Rango: Todos', value: '' },
  { label: 'Esta semana', value: 'week' },
  { label: 'Este mes', value: 'month' },
  { label: 'Este trimestre', value: 'quarter' },
  { label: 'Este año', value: 'year' },
]

function emailToCotizadorId(email: string | undefined): string | null {
  if (!email) return null
  const local = email.split('@')[0].toLowerCase()
  const MAP: Record<string, string> = {
    presupuestos: 'OC', presupuestos2: 'JPR',
    saguirre: 'SA', araque: 'CA', caraque: 'CA', dgalindo: 'DG',
  }
  if (MAP[local]) return MAP[local]
  for (const c of COTIZADORES) {
    if (c.id.toLowerCase() === local || (c as any).correo?.split('@')[0]?.toLowerCase() === local) return c.id
  }
  return null
}

function getDateRangeFilter(range: string): (fecha: string) => boolean {
  if (!range) return () => true
  const now = new Date()
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  switch (range) {
    case 'week': {
      const day = now.getDay()
      const monday = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (day === 0 ? 6 : day - 1)))
      return (f) => new Date(f) >= monday
    }
    case 'month': {
      const first = new Date(now.getFullYear(), now.getMonth(), 1)
      return (f) => new Date(f) >= first
    }
    case 'quarter': {
      const qMonth = Math.floor(now.getMonth() / 3) * 3
      const first = new Date(now.getFullYear(), qMonth, 1)
      return (f) => new Date(f) >= first
    }
    case 'year': {
      const first = new Date(now.getFullYear(), 0, 1)
      return (f) => new Date(f) >= first
    }
    default: return () => true
  }
}

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
  const [fechaAdjudicacion, setFechaAdjudicacion] = useState(new Date().toISOString().split('T')[0])
  const [motivoPerdida, setMotivoPerdida] = useState<string>(MOTIVOS_PERDIDA[0])
  const [filtroMisCots, setFiltroMisCots] = useState(false)
  const [filtroDateRange, setFiltroDateRange] = useState('')
  const [filtroSector, setFiltroSector] = useState('')
  const [sortBy, setSortBy] = useState<'valor_desc' | 'valor_asc' | 'fecha_desc' | 'fecha_asc' | 'empresa_asc' | 'cotizador' | 'numero_desc'>('valor_desc')
  const [currentUserCotId, setCurrentUserCotId] = useState<string | null>(null)
  const [tooltipData, setTooltipData] = useState<{ id: string; x: number; y: number } | null>(null)
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) setCurrentUserCotId(emailToCotizadorId(session.user.email))
    })
  }, [])

  const empresaMap = useMemo(() => {
    const m = new Map<string, string>()
    for (const e of state.empresas) m.set(e.id, e.nombre.toLowerCase())
    return m
  }, [state.empresas])

  const contactoMap = useMemo(() => {
    const m = new Map<string, string>()
    for (const c of state.contactos) m.set(c.id, c.nombre)
    return m
  }, [state.contactos])

  const sectorMap = useMemo(() => {
    const m = new Map<string, string>()
    for (const e of state.empresas) m.set(e.id, e.sector || '')
    return m
  }, [state.empresas])

  const cotNumeroMap = useMemo(() => {
    const m = new Map<string, string>()
    for (const c of state.cotizaciones) {
      if (c.numero) m.set(c.oportunidad_id, c.numero.toLowerCase())
    }
    return m
  }, [state.cotizaciones])

  const filtered = useMemo(() => {
    let ops = showHistoricas ? state.oportunidades : state.oportunidades.filter(isActive)
    if (filtroCotizador) ops = ops.filter(o => matchCotizador(o.cotizador_asignado, filtroCotizador))
    if (filtroMisCots && currentUserCotId) ops = ops.filter(o => matchCotizador(o.cotizador_asignado, currentUserCotId))
    if (filtroYear) {
      const y = Number(filtroYear)
      ops = ops.filter(o => new Date(o.fecha_ingreso).getFullYear() === y)
    }
    if (filtroMonth) {
      const m = Number(filtroMonth)
      ops = ops.filter(o => new Date(o.fecha_ingreso).getMonth() === m)
    }
    if (filtroDateRange) {
      const check = getDateRangeFilter(filtroDateRange)
      ops = ops.filter(o => check(o.fecha_ingreso))
    }
    if (filtroValorMin > 0) {
      ops = ops.filter(o => o.valor_cotizado >= filtroValorMin)
    }
    if (filtroSector) {
      ops = ops.filter(o => sectorMap.get(o.empresa_id) === filtroSector)
    }
    if (searchEmpresa.trim()) {
      const q = searchEmpresa.trim().toLowerCase()
      ops = ops.filter(o =>
        (empresaMap.get(o.empresa_id) || '').includes(q) ||
        (cotNumeroMap.get(o.id) || '').includes(q) ||
        (contactoMap.get(o.contacto_id) || '').toLowerCase().includes(q)
      )
    }
    return ops
  }, [state.oportunidades, showHistoricas, filtroCotizador, filtroMisCots, currentUserCotId, filtroYear, filtroMonth, filtroDateRange, filtroValorMin, filtroSector, searchEmpresa, empresaMap, sectorMap, cotNumeroMap, contactoMap])

  const activeCount = useMemo(() => state.oportunidades.filter(isActive).length, [state.oportunidades])

  const pipelineValue = useMemo(
    () => state.oportunidades
      .filter(o => !['adjudicada', 'perdida', 'recotizada'].includes(o.etapa))
      .reduce((s, o) => s + o.valor_cotizado, 0),
    [state.oportunidades]
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
    if (etapa === 'adjudicada') {
      const op = state.oportunidades.find(o => o.id === oportunidadId)
      setValorAdjudicado(op?.valor_cotizado || 0)
      setFechaAdjudicacion(new Date().toISOString().split('T')[0])
      setAdjudicadaModal(oportunidadId)
      return
    }
    if (etapa === 'perdida') { setMotivoPerdida(MOTIVOS_PERDIDA[0]); setPerdidaModal(oportunidadId); return }
    dispatch({ type: 'MOVE_ETAPA', payload: { oportunidadId, nuevaEtapa: etapa } })
  }
  function onDragEnd() { setDragging(null); setDragOverCol(null) }

  function confirmAdjudicada() {
    if (!adjudicadaModal) return
    dispatch({ type: 'MOVE_ETAPA', payload: { oportunidadId: adjudicadaModal, nuevaEtapa: 'adjudicada', valor_adjudicado: valorAdjudicado, fecha_adjudicacion: fechaAdjudicacion } })
    setAdjudicadaModal(null)
  }
  function confirmPerdida() {
    if (!perdidaModal) return
    dispatch({ type: 'MOVE_ETAPA', payload: { oportunidadId: perdidaModal, nuevaEtapa: 'perdida', motivo_perdida: motivoPerdida } })
    setPerdidaModal(null)
  }

  function handleCardMouseEnter(e: React.MouseEvent, id: string) {
    const rect = e.currentTarget.getBoundingClientRect()
    tooltipTimerRef.current = setTimeout(() => {
      setTooltipData({ id, x: rect.left, y: rect.bottom + 6 })
    }, 400)
  }
  function handleCardMouseLeave() {
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current)
    tooltipTimerRef.current = null
    setTooltipData(null)
  }

  const hasFilters = filtroCotizador || filtroYear || filtroMonth || filtroValorMin > 0 || searchEmpresa.trim() || filtroMisCots || filtroDateRange || filtroSector

  return (
    <div className="pipeline-shell">
      {/* Toolbar */}
      <div className="pipeline-toolbar">
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--color-text)' }}>Pipeline</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--color-text-label)', marginTop: 2 }}>
            {activeCount} activas{showHistoricas && ` · ${state.oportunidades.length} total`}
            {' · '}{formatCOP(pipelineValue, { short: true })}
            {hasFilters && ` · ${filtered.length} filtradas`}
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Cotizador pills */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--color-surface-2)', borderRadius: 7, padding: 2, border: '1px solid var(--color-border)' }}>
          <button className={`chip ${!filtroCotizador ? 'on' : ''}`} style={{ border: 0, height: 22, fontSize: 11, padding: '0 10px' }} onClick={() => setFiltroCotizador('')}>Todos</button>
          {COTIZADORES.map(c => (
            <button
              key={c.id}
              className={`chip ${filtroCotizador === c.id ? 'on' : ''}`}
              style={{ border: 0, height: 22, fontSize: 11, padding: '0 10px' }}
              onClick={() => setFiltroCotizador(filtroCotizador === c.id ? '' : c.id)}
              title={c.nombre}
            >{c.iniciales}</button>
          ))}
        </div>

        <select className="chip chip-select" value={filtroYear} onChange={e => setFiltroYear(e.target.value)}>
          <option value="">Año: Todos</option>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select className="chip chip-select" value={filtroMonth} onChange={e => setFiltroMonth(e.target.value)}>
          <option value="">Mes: Todos</option>
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select className="chip chip-select" value={filtroDateRange} onChange={e => setFiltroDateRange(e.target.value)}>
          {DATE_RANGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select className="chip chip-select" value={filtroSector} onChange={e => setFiltroSector(e.target.value)}>
          <option value="">Sector: Todos</option>
          {CONFIG_DEFAULTS.sectores.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {VALOR_PRESETS.filter(p => p.min > 0).map(p => (
          <button
            key={p.label}
            className={`chip ${filtroValorMin === p.min ? 'on' : ''}`}
            onClick={() => setFiltroValorMin(filtroValorMin === p.min ? 0 : p.min)}
          >{p.label}</button>
        ))}

        {currentUserCotId && (
          <button className={`chip ${filtroMisCots ? 'on' : ''}`} onClick={() => setFiltroMisCots(!filtroMisCots)}>
            <User />Mis cots
          </button>
        )}

        <button className={`chip ${showHistoricas ? 'on' : ''}`} onClick={() => setShowHistoricas(!showHistoricas)}>
          <History />Históricas
        </button>

        <select className="chip chip-select" value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} title="Ordenar tarjetas">
          <option value="valor_desc">Orden: Valor ↓</option>
          <option value="valor_asc">Valor ↑</option>
          <option value="fecha_desc">Fecha recientes</option>
          <option value="fecha_asc">Fecha antiguas</option>
          <option value="empresa_asc">Empresa A-Z</option>
          <option value="cotizador">Cotizador</option>
          <option value="numero_desc">Número COT ↓</option>
        </select>

        <div style={{ position: 'relative', minWidth: 220 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-label)' }} />
          <input
            value={searchEmpresa}
            onChange={e => setSearchEmpresa(e.target.value)}
            placeholder="Buscar empresa, cotización…"
            className="chip"
            style={{ paddingLeft: 28, paddingRight: 10, height: 26, width: '100%', fontSize: 12, color: 'var(--color-text)', background: 'var(--color-surface)' }}
          />
        </div>

        {hasFilters && (
          <button
            onClick={() => { setFiltroCotizador(''); setFiltroYear(''); setFiltroMonth(''); setFiltroValorMin(0); setSearchEmpresa(''); setFiltroMisCots(false); setFiltroDateRange(''); setFiltroSector('') }}
            className="chip"
            style={{ color: 'var(--color-accent-red)', borderColor: 'var(--color-border)' }}
            title="Limpiar filtros"
          >
            <X />Limpiar
          </button>
        )}

        <button className="btn-d accent sm" onClick={() => setShowModal(true)}>
          <Plus />Nueva
        </button>
      </div>

      {/* Columns */}
      <div className="kanban">
        {ETAPAS.map(etapa => {
          const oportunidades = filtered
            .filter(o => o.etapa === etapa.key)
            .sort((a, b) => {
              switch (sortBy) {
                case 'valor_asc': return a.valor_cotizado - b.valor_cotizado
                case 'fecha_desc': return (b.fecha_envio || b.fecha_ingreso || '').localeCompare(a.fecha_envio || a.fecha_ingreso || '')
                case 'fecha_asc': return (a.fecha_envio || a.fecha_ingreso || '').localeCompare(b.fecha_envio || b.fecha_ingreso || '')
                case 'empresa_asc': {
                  const ea = state.empresas.find(e => e.id === a.empresa_id)?.nombre || ''
                  const eb = state.empresas.find(e => e.id === b.empresa_id)?.nombre || ''
                  return ea.localeCompare(eb)
                }
                case 'cotizador': return (a.cotizador_asignado || '').localeCompare(b.cotizador_asignado || '')
                case 'numero_desc': {
                  const ca = state.cotizaciones.find(c => c.oportunidad_id === a.id)?.numero || ''
                  const cb = state.cotizaciones.find(c => c.oportunidad_id === b.id)?.numero || ''
                  return cb.localeCompare(ca)
                }
                default: return b.valor_cotizado - a.valor_cotizado
              }
            })
          const valorTotal = oportunidades.reduce((s, o) => s + o.valor_cotizado, 0)
          const isOver = dragOverCol === etapa.key
          return (
            <div
              key={etapa.key}
              onDragOver={e => onDragOver(e, etapa.key)}
              onDragLeave={onDragLeave}
              onDrop={e => onDrop(e, etapa.key)}
              className={`col ${isOver ? 'drop-active' : ''}`}
            >
              <div className="col-head">
                <span className="stage-dot" style={{ background: etapa.color }} />
                <span className="name">{etapa.label}</span>
                <span className="cnt">{oportunidades.length}</span>
                {valorTotal > 0 && <span className="sum">{formatCOP(valorTotal, { short: true })}</span>}
              </div>
              <div className="col-list">
                {oportunidades.map(o => {
                  const empresa = state.empresas.find(e => e.id === o.empresa_id)
                  const contactoNombre = contactoMap.get(o.contacto_id)
                  const cotizador = findCotizador(o.cotizador_asignado)
                  const dias = daysSince(o.fecha_ingreso)
                  const hasNotas = o.notas && o.notas.trim().length > 0
                  const oppCots = state.cotizaciones.filter(c => c.oportunidad_id === o.id)
                  const activeCot = oppCots.find(c => c.estado !== 'descartada') || oppCots[oppCots.length - 1]
                  const cotNumero = activeCot?.numero
                  const urgencyDias = o.etapa === 'cotizacion_enviada'
                    ? Math.floor((Date.now() - new Date(o.fecha_envio || o.fecha_ingreso).getTime()) / 86400000)
                    : 0
                  const urgencyClass = urgencyDias > 30 ? 'urgent-hot' : urgencyDias > 14 ? 'urgent-hot' : urgencyDias > 7 ? 'urgent-warn' : ''
                  const ageClass = dias > 30 ? 'hot' : dias > 7 ? 'warn' : ''
                  return (
                    <div
                      key={o.id}
                      draggable
                      onDragStart={e => onDragStart(e, o.id)}
                      onDragEnd={onDragEnd}
                      onClick={() => navigate(`/oportunidades/${o.id}`)}
                      onMouseEnter={(e) => hasNotas && handleCardMouseEnter(e, o.id)}
                      onMouseLeave={handleCardMouseLeave}
                      className={`opp-card ${urgencyClass} ${dragging === o.id ? 'dragging' : ''}`}
                    >
                      <div className="row1">
                        <span className="company" title={empresa?.nombre}>{empresa?.nombre || '—'}</span>
                        {cotNumero && <span className="num">{cotNumero}</span>}
                      </div>
                      <div className="contact">
                        {contactoNombre && contactoNombre !== '—' ? contactoNombre : '\u00A0'}
                      </div>
                      <div className="row2">
                        <span className="val">{o.valor_cotizado === 0 ? '—' : formatCOP(o.valor_cotizado, { short: true })}</span>
                        {hasNotas && <StickyNote size={11} style={{ color: 'var(--color-accent-yellow)' }} />}
                        {cotizador ? (
                          <span
                            className="avatar xs"
                            style={{ background: getAvatarColor(cotizador.nombre), color: '#fff', border: 'none' }}
                            title={cotizador.nombre}
                          >{cotizador.iniciales}</span>
                        ) : (
                          <span className="avatar xs" style={{ opacity: 0.3 }}>—</span>
                        )}
                        <span className={`age ${ageClass}`}>
                          <Clock size={10} />{isFinite(dias) && dias >= 0 ? `${dias}d` : '—'}
                        </span>
                      </div>
                    </div>
                  )
                })}
                {oportunidades.length === 0 && (
                  <div style={{ padding: '16px 10px', textAlign: 'center', fontSize: 11, color: 'var(--color-text-faint)' }}>
                    Sin oportunidades
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showModal && <OportunidadFormModal onClose={() => setShowModal(false)} />}

      {/* Tooltip (notes) */}
      {tooltipData && (() => {
        const opp = state.oportunidades.find(o => o.id === tooltipData.id)
        if (!opp?.notas) return null
        const notas = opp.notas.split('\n').filter(Boolean).slice(-2)
        if (notas.length === 0) return null
        const empresa = state.empresas.find(e => e.id === opp.empresa_id)
        return (
          <div
            style={{
              position: 'fixed',
              left: Math.min(tooltipData.x, window.innerWidth - 320),
              top: Math.min(tooltipData.y, window.innerHeight - 120),
              zIndex: 9999,
              pointerEvents: 'none',
            }}
            className="animate-tooltip"
          >
            <div className="card" style={{ maxWidth: 300, padding: 12, boxShadow: 'var(--shadow-pop)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>{empresa?.nombre || '—'}</div>
              {notas.map((n, i) => (
                <div key={i} style={{ fontSize: 11.5, color: 'var(--color-text-muted)', paddingTop: i > 0 ? 6 : 0, borderTop: i > 0 ? '1px solid var(--color-border-light)' : 'none', marginTop: i > 0 ? 6 : 0 }}>
                  {n}
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Adjudicada modal */}
      {adjudicadaModal && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-[var(--color-surface)] modal-card w-full max-w-md" style={{ padding: 28 }}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-semibold text-[17px] text-[var(--color-text)]">Adjudicar oportunidad</h3>
              <button onClick={() => setAdjudicadaModal(null)} className="text-[var(--color-text-label)] hover:text-[var(--color-text)] p-1" style={{ minHeight: 0 }}><X size={18} /></button>
            </div>
            <label className="text-[12px] font-mono uppercase tracking-[0.06em] text-[var(--color-text-label)] mb-2 block">Valor adjudicado (COP)</label>
            <input type="number" value={valorAdjudicado || ''} onChange={e => setValorAdjudicado(Number(e.target.value))} className="w-full px-3 py-2 text-sm mb-1" />
            {valorAdjudicado > 0 && <p className="text-xs text-[var(--color-text-label)] mb-4 font-mono">{formatCOP(valorAdjudicado)}</p>}
            <label className="text-[12px] font-mono uppercase tracking-[0.06em] text-[var(--color-text-label)] mb-2 block mt-3">Fecha de adjudicación</label>
            <input type="date" value={fechaAdjudicacion} onChange={e => setFechaAdjudicacion(e.target.value)} className="w-full px-3 py-2 text-sm" />
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setAdjudicadaModal(null)} className="btn-d">Cancelar</button>
              <button onClick={confirmAdjudicada} className="btn-d accent">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Perdida modal */}
      {perdidaModal && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-[var(--color-surface)] modal-card w-full max-w-md" style={{ padding: 28 }}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-semibold text-[17px] text-[var(--color-text)]">Motivo de pérdida</h3>
              <button onClick={() => setPerdidaModal(null)} className="text-[var(--color-text-label)] hover:text-[var(--color-text)] p-1" style={{ minHeight: 0 }}><X size={18} /></button>
            </div>
            <label className="text-[12px] font-mono uppercase tracking-[0.06em] text-[var(--color-text-label)] mb-2 block">Motivo</label>
            <select value={motivoPerdida} onChange={e => setMotivoPerdida(e.target.value)} className="w-full px-3 py-2 text-sm mb-4">
              {MOTIVOS_PERDIDA.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setPerdidaModal(null)} className="btn-d">Cancelar</button>
              <button onClick={confirmPerdida} className="btn-d" style={{ background: 'var(--color-accent-red)', color: '#fff', borderColor: 'var(--color-accent-red)' }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

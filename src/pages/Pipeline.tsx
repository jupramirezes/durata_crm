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
  { label: 'Todos', value: '' },
  { label: 'Esta semana', value: 'week' },
  { label: 'Este mes', value: 'month' },
  { label: 'Este trimestre', value: 'quarter' },
  { label: 'Este ano', value: 'year' },
]

/** Map email local part to cotizador ID */
function emailToCotizadorId(email: string | undefined): string | null {
  if (!email) return null
  const local = email.split('@')[0].toLowerCase()
  const MAP: Record<string, string> = {
    presupuestos: 'OC', presupuestos2: 'JPR',
    saguirre: 'SA', caraque: 'CA', dgalindo: 'DG',
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

/* gradient top colors for each stage */
const ETAPA_GRADIENT: Record<string, string> = {
  nuevo_lead: 'from-emerald-50 to-white',
  en_cotizacion: 'from-amber-50 to-white',
  cotizacion_enviada: 'from-blue-50 to-white',
  recotizada: 'from-violet-50 to-white',
  en_seguimiento: 'from-indigo-50 to-white',
  en_negociacion: 'from-purple-50 to-white',
  adjudicada: 'from-green-50 to-white',
  perdida: 'from-red-50 to-white',
}

/* Tooltip is now rendered as a fixed-position portal at the end of the component */

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
  // New filters
  const [filtroMisCots, setFiltroMisCots] = useState(false)
  const [filtroDateRange, setFiltroDateRange] = useState('')
  const [filtroSector, setFiltroSector] = useState('')
  const [sortBy, setSortBy] = useState<'valor_desc' | 'valor_asc' | 'fecha_desc' | 'fecha_asc' | 'empresa_asc' | 'cotizador' | 'numero_desc'>('valor_desc')
  const [currentUserCotId, setCurrentUserCotId] = useState<string | null>(null)
  const [tooltipData, setTooltipData] = useState<{ id: string; x: number; y: number } | null>(null)
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Detect logged-in user's cotizador ID
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setCurrentUserCotId(emailToCotizadorId(session.user.email))
      }
    })
  }, [])

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

  // Build empresa sector lookup
  const sectorMap = useMemo(() => {
    const m = new Map<string, string>()
    for (const e of state.empresas) m.set(e.id, e.sector || '')
    return m
  }, [state.empresas])

  // Build cotización numero lookup by oportunidad_id (for search)
  const cotNumeroMap = useMemo(() => {
    const m = new Map<string, string>()
    for (const c of state.cotizaciones) {
      // Keep the latest (or overwrite — last wins, which is fine for search)
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
    if (etapa === 'adjudicada') { const op = state.oportunidades.find(o => o.id === oportunidadId); setValorAdjudicado(op?.valor_cotizado || 0); setFechaAdjudicacion(new Date().toISOString().split('T')[0]); setAdjudicadaModal(oportunidadId); return }
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

  const filterBtnCls = (active: boolean) => `h-10 px-5 rounded-[10px] text-[13px] font-medium transition-all border ${
    active ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white border-[#e2e8f0] text-[#334155] hover:border-[var(--color-primary)] hover:bg-[#f8fafc]'
  }`

  const filterPillCls = (active: boolean) => `h-9 px-3.5 rounded-full text-[13px] font-medium transition-all ${
    active ? 'text-white' : 'bg-white border border-[#e2e8f0] text-[var(--color-text-muted)] hover:bg-[#f8fafc]'
  }`

  return (
    <div className="p-6 h-screen flex flex-col animate-fade-in">
      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--color-text)] tracking-tight">Pipeline</h1>
          <p className="text-sm text-[#94a3b8] mt-0.5">
            {activeCount} activas{showHistoricas && ` (${state.oportunidades.length} total)`}
            {hasFilters && ` — ${filtered.length} filtradas`}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Cotizador filter pills */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFiltroCotizador('')}
              className={filterPillCls(!filtroCotizador)}
              style={!filtroCotizador ? { background: 'var(--color-primary)' } : {}}
            >Todos</button>
            {COTIZADORES.map(c => (
              <button
                key={c.id}
                onClick={() => setFiltroCotizador(filtroCotizador === c.id ? '' : c.id)}
                className={filterPillCls(filtroCotizador === c.id)}
                style={filtroCotizador === c.id ? { background: getAvatarColor(c.nombre) } : {}}
              >{c.iniciales}</button>
            ))}
          </div>
          <button
            onClick={() => setShowHistoricas(!showHistoricas)}
            className={`flex items-center gap-1.5 ${filterBtnCls(showHistoricas)}`}
          >
            <History size={14} />
            Históricas
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 h-10 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-5 rounded-[10px] text-[13px] font-semibold transition-colors"
          >
            <Plus size={14} /> Nueva
          </button>
        </div>
      </div>

      {/* ── Filters row ── */}
      <div className="flex items-center gap-2.5 mb-4 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input
            value={searchEmpresa}
            onChange={e => setSearchEmpresa(e.target.value)}
            placeholder="Buscar empresa, contacto, cotización..."
            className="pl-10 pr-4 h-[42px] rounded-[10px] text-sm border border-[#e2e8f0] bg-white w-80 focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
          />
        </div>
        <select
          value={filtroYear}
          onChange={e => setFiltroYear(e.target.value)}
          className={filterBtnCls(!!filtroYear)}
        >
          <option value="">Año: Todos</option>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          value={filtroMonth}
          onChange={e => setFiltroMonth(e.target.value)}
          className={filterBtnCls(!!filtroMonth)}
        >
          <option value="">Mes: Todos</option>
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <div className="flex items-center gap-1.5">
          {VALOR_PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => setFiltroValorMin(filtroValorMin === p.min ? 0 : p.min)}
              className={filterBtnCls(filtroValorMin === p.min)}
            >{p.label}</button>
          ))}
        </div>
        {/* Mis cotizaciones toggle */}
        {currentUserCotId && (
          <button
            onClick={() => setFiltroMisCots(!filtroMisCots)}
            className={`flex items-center gap-1.5 ${filterBtnCls(filtroMisCots)}`}
          >
            <User size={14} />
            Mis cotizaciones
          </button>
        )}
        {/* Date range */}
        <select
          value={filtroDateRange}
          onChange={e => setFiltroDateRange(e.target.value)}
          className={filterBtnCls(!!filtroDateRange)}
        >
          {DATE_RANGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {/* Sector */}
        <select
          value={filtroSector}
          onChange={e => setFiltroSector(e.target.value)}
          className={filterBtnCls(!!filtroSector)}
        >
          <option value="">Sector: Todos</option>
          {CONFIG_DEFAULTS.sectores.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="h-10 px-3 rounded-[10px] text-[13px] border border-[var(--color-border)] bg-white text-[var(--color-text)]"
          title="Ordenar tarjetas del pipeline"
        >
          <option value="valor_desc">Orden: Valor ↓</option>
          <option value="valor_asc">Valor ↑</option>
          <option value="fecha_desc">Fecha recientes</option>
          <option value="fecha_asc">Fecha antiguas</option>
          <option value="empresa_asc">Empresa A-Z</option>
          <option value="cotizador">Cotizador</option>
          <option value="numero_desc">Número COT ↓</option>
        </select>
        {hasFilters && (
          <button
            onClick={() => { setFiltroCotizador(''); setFiltroYear(''); setFiltroMonth(''); setFiltroValorMin(0); setSearchEmpresa(''); setFiltroMisCots(false); setFiltroDateRange(''); setFiltroSector('') }}
            className="h-10 px-4 rounded-[10px] text-[13px] font-medium text-red-500 hover:bg-red-50 border border-red-200 transition-colors"
          >Limpiar filtros</button>
        )}
      </div>

      {/* ── Columns ── */}
      <div className="flex-1 flex gap-3 overflow-x-auto pb-3">
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
          const gradient = ETAPA_GRADIENT[etapa.key] || 'from-gray-50 to-white'
          return (
            <div
              key={etapa.key}
              onDragOver={e => onDragOver(e, etapa.key)}
              onDragLeave={onDragLeave}
              onDrop={e => onDrop(e, etapa.key)}
              className={`flex-shrink-0 w-[300px] rounded-xl flex flex-col transition-all duration-150 ${
                isOver ? 'bg-blue-50 ring-2 ring-blue-300 shadow-md' : 'bg-[#f8fafc]'
              }`}
            >
              {/* Column header */}
              <div className="rounded-t-xl overflow-hidden">
                <div className="h-[3px]" style={{ background: etapa.color }} />
                <div className={`px-5 py-4 bg-gradient-to-b ${gradient}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold flex-1 text-[var(--color-text)]">{etapa.label}</span>
                    <span className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ background: etapa.color }}>{oportunidades.length}</span>
                  </div>
                  {valorTotal > 0 && (
                    <span className="text-sm text-[#64748b] tabular-nums mt-1 block font-medium">{formatCOP(valorTotal)}</span>
                  )}
                </div>
              </div>
              <div className="flex-1 px-2.5 pb-2.5 space-y-2.5 overflow-y-auto">
                {oportunidades.map(o => {
                  const empresa = state.empresas.find(e => e.id === o.empresa_id)
                  const contactoNombre = contactoMap.get(o.contacto_id)
                  const cotizador = findCotizador(o.cotizador_asignado)
                  const dias = daysSince(o.fecha_ingreso)
                  const hasNotas = o.notas && o.notas.trim().length > 0
                  // Latest active cotización number (prefer non-descartada)
                  const oppCots = state.cotizaciones.filter(c => c.oportunidad_id === o.id)
                  const activeCot = oppCots.find(c => c.estado !== 'descartada') || oppCots[oppCots.length - 1]
                  const cotNumero = activeCot?.numero
                  // Urgency border for cotizacion_enviada
                  const urgencyDias = o.etapa === 'cotizacion_enviada'
                    ? Math.floor((Date.now() - new Date(o.fecha_envio || o.fecha_ingreso).getTime()) / 86400000)
                    : 0
                  const urgencyBorder = urgencyDias > 30
                    ? 'border-l-[3px] border-l-[#991b1b]'
                    : urgencyDias > 14
                    ? 'border-l-[3px] border-l-[#ef4444]'
                    : urgencyDias > 7
                    ? 'border-l-[3px] border-l-[#f59e0b]'
                    : ''
                  return (
                    <div
                      key={o.id}
                      draggable
                      onDragStart={e => onDragStart(e, o.id)}
                      onDragEnd={onDragEnd}
                      onClick={() => navigate(`/oportunidades/${o.id}`)}
                      onMouseEnter={(e) => hasNotas && handleCardMouseEnter(e, o.id)}
                      onMouseLeave={handleCardMouseLeave}
                      className={`relative bg-white rounded-xl p-[18px_20px] border border-[#f1f5f9] cursor-pointer transition-all duration-250 shadow-[0_1px_3px_rgba(0,0,0,0.03)] ${urgencyBorder} ${
                        dragging === o.id ? 'opacity-40 scale-95' : 'hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] hover:-translate-y-[3px]'
                      }`}
                    >
                      {cotNumero && (
                        <span className="absolute top-2 right-2 text-[10px] font-semibold text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded-md tabular-nums">
                          {cotNumero}
                        </span>
                      )}
                      <div className="font-semibold text-[15px] truncate text-[var(--color-text)] mb-1 pr-16">{empresa?.nombre}</div>
                      {contactoNombre && (
                        <div className="text-sm text-[#64748b] truncate mb-2">{contactoNombre}</div>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold tabular-nums" style={{ color: o.valor_cotizado > 100_000_000 ? 'var(--color-accent-green)' : 'var(--color-text)' }}>{formatCOP(o.valor_cotizado)}</span>
                        {cotizador && (
                          <span className="text-[10px] w-7 h-7 rounded-full font-bold text-white flex items-center justify-center" style={{ background: getAvatarColor(cotizador.nombre) }} title={cotizador.nombre}>{cotizador.iniciales}</span>
                        )}
                        {hasNotas && (
                          <span title="Tiene notas"><StickyNote size={12} className="text-amber-400" /></span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-[#64748b] ml-auto bg-[#f1f5f9] px-2.5 py-1 rounded-full">
                          <Clock size={10} /> {dias}d
                        </span>
                      </div>
                      {/* Tooltip rendered via fixed portal below */}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {showModal && <OportunidadFormModal onClose={() => setShowModal(false)} />}

      {/* Fixed-position tooltip portal for notes */}
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
            <div className="bg-white rounded-[10px] p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-[#e2e8f0]" style={{ maxWidth: 300 }}>
              <div className="text-[12px] font-semibold text-[#334155] mb-1.5">{empresa?.nombre || '—'}</div>
              {notas.map((n, i) => (
                <div key={i} className={`text-[12px] text-[#64748b] py-1 ${i > 0 ? 'border-t border-[#f1f5f9]' : ''}`}>
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
          <div className="bg-white modal-card w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl">Adjudicar oportunidad</h3>
              <button onClick={() => setAdjudicadaModal(null)} className="text-[#64748b] hover:text-[var(--color-text)] p-1"><X size={20} /></button>
            </div>
            <label className="text-[13px] font-medium text-[#334155] mb-2 block">Valor adjudicado (COP)</label>
            <input type="number" value={valorAdjudicado || ''} onChange={e => setValorAdjudicado(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl text-sm mb-1 border border-[#e2e8f0]" />
            {valorAdjudicado > 0 && <p className="text-sm text-[#64748b] mb-4 tabular-nums">{formatCOP(valorAdjudicado)}</p>}
            <label className="text-[13px] font-medium text-[#334155] mb-2 block mt-3">Fecha de adjudicación</label>
            <input type="date" value={fechaAdjudicacion} onChange={e => setFechaAdjudicacion(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm border border-[#e2e8f0]" />
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setAdjudicadaModal(null)} className="px-5 py-3 text-sm text-[#64748b] hover:bg-[#f8fafc] rounded-xl">Cancelar</button>
              <button onClick={confirmAdjudicada} className="px-5 py-3 h-12 bg-[var(--color-accent-green)] text-white text-sm font-semibold rounded-xl hover:opacity-90">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Perdida modal */}
      {perdidaModal && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white modal-card w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl">Motivo de pérdida</h3>
              <button onClick={() => setPerdidaModal(null)} className="text-[#64748b] hover:text-[var(--color-text)] p-1"><X size={20} /></button>
            </div>
            <label className="text-[13px] font-medium text-[#334155] mb-2 block">Motivo</label>
            <select value={motivoPerdida} onChange={e => setMotivoPerdida(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm mb-4 border border-[#e2e8f0]">
              {MOTIVOS_PERDIDA.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setPerdidaModal(null)} className="px-5 py-3 text-sm text-[#64748b] hover:bg-[#f8fafc] rounded-xl">Cancelar</button>
              <button onClick={confirmPerdida} className="px-5 py-3 h-12 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { ETAPAS, COTIZADORES, MOTIVOS_PERDIDA, findCotizador, CONFIG_MESA_DEFAULT, Etapa } from '../types'
import { formatDate, formatCOP, daysSince } from '../lib/utils'
import { EtapaBadge, EstadoBadge } from '../components/ui'
import CotizacionModal from '../components/CotizacionModal'
import { generarPdfCotizacion } from '../lib/generar-pdf'
import { uploadProductFile, getSignedUrl, acceptString } from '../hooks/useStorage'
import { showToast } from '../components/Toast'
import * as svcOportunidades from '../hooks/useOportunidades'
import {
  ArrowLeft, FileText, Package, Trash2, Building2, User, Edit3,
  StickyNote, Send, Wrench, X, ChevronDown, Copy, Download, Clock,
  ArrowRightLeft, MessageSquare, Box, Phone, Mail, AlertCircle,
  Paperclip, FileSpreadsheet, File,
} from 'lucide-react'

const CATEGORIAS_PRODUCTO = [
  'Mesas', 'Pozuelos', 'Pasamanos', 'Banos', 'Muebles',
  'Repisas', 'Autoservicios', 'Campanas', 'Carcamos', 'Passthrough',
  'Estanterias', 'BBQ', 'Otro',
]

// ── Timeline event type ──
interface TimelineEvent {
  id: string
  type: 'nota' | 'etapa' | 'producto' | 'cotizacion'
  timestamp: string
  sortDate: number
  title: string
  detail?: string
  color: string
  icon: React.ElementType
}

export default function OportunidadDetalle() {
  const { id } = useParams()
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const oportunidad = state.oportunidades.find(o => o.id === id)
  const empresa = oportunidad ? state.empresas.find(e => e.id === oportunidad.empresa_id) : null
  const contacto = oportunidad ? state.contactos.find(c => c.id === oportunidad.contacto_id) : null
  const historial = state.historial.filter(h => h.oportunidad_id === id)
  const productos = state.productos.filter(p => p.oportunidad_id === id)
  const cotizaciones = state.cotizaciones.filter(c => c.oportunidad_id === id)
  const cotizador = oportunidad ? findCotizador(oportunidad.cotizador_asignado) : null

  const [showCotModal, setShowCotModal] = useState(false)
  const [notaTexto, setNotaTexto] = useState('')
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showManualForm, setShowManualForm] = useState(false)
  const [showEtapaDropdown, setShowEtapaDropdown] = useState(false)
  const [showAdjudicadaModal, setShowAdjudicadaModal] = useState(false)
  const [showPerdidaModal, setShowPerdidaModal] = useState(false)
  const [valorAdjudicado, setValorAdjudicado] = useState('')
  const [motivoPerdida, setMotivoPerdida] = useState('')
  const [manualForm, setManualForm] = useState({
    categoria: 'Mesas',
    descripcion: '',
    cantidad: 1,
    precio_unitario: 0,
    notas: '',
  })
  // Duplicate to other client state
  const [dupCotId, setDupCotId] = useState<string | null>(null)
  const [dupSearch, setDupSearch] = useState('')
  const [dupSelectedEmpId, setDupSelectedEmpId] = useState<string | null>(null)
  const [dupSelectedOppId, setDupSelectedOppId] = useState<string | null>(null)
  const [manualApuFile, setManualApuFile] = useState<File | null>(null)
  const [manualPdfFile, setManualPdfFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const apuInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  // For inline file attach on existing products
  const [attachingProduct, setAttachingProduct] = useState<string | null>(null)
  const attachApuRef = useRef<HTMLInputElement>(null)
  const attachPdfRef = useRef<HTMLInputElement>(null)

  if (!oportunidad || !empresa) return <div className="p-6 text-[var(--color-text-muted)]">Oportunidad no encontrada</div>

  // After the guard, oportunidad & empresa are guaranteed non-null.
  // TypeScript doesn't track this across closures, so we alias them with definite types.
  const opp: NonNullable<typeof oportunidad> = oportunidad
  const emp: NonNullable<typeof empresa> = empresa

  const diasEnPipeline = daysSince(opp.fecha_ingreso)

  // ── Total cotizado historico con esta emp ──
  const totalHistoricoEmpresa = state.oportunidades
    .filter(o => o.empresa_id === emp.id)
    .reduce((s, o) => s + (o.valor_cotizado || 0), 0)

  // ══════════════════════════════════════════════════
  // TIMELINE UNIFICADO (CAMBIO 3)
  // ══════════════════════════════════════════════════
  const timelineEvents = useMemo<TimelineEvent[]>(() => {
    const events: TimelineEvent[] = []

    // a) Cambios de etapa
    for (const h of historial) {
      const etapaAnterior = ETAPAS.find(e => e.key === h.etapa_anterior)
      const etapaNueva = ETAPAS.find(e => e.key === h.etapa_nueva)
      events.push({
        id: `etapa-${h.id}`,
        type: 'etapa',
        timestamp: h.created_at,
        sortDate: new Date(h.created_at).getTime(),
        title: `Movida de ${etapaAnterior?.label || h.etapa_anterior} \u2192 ${etapaNueva?.label || h.etapa_nueva}`,
        color: etapaNueva?.color || '#6b7280',
        icon: ArrowRightLeft,
      })
    }

    // b) Notas
    if (opp.notas) {
      const lines = opp.notas.split('\n').filter(l => l.trim())
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const match = line.match(/^\[(.+?)\]\s*(.*)$/)
        if (match) {
          // Parse date from "[DD/MM/YYYY HH:MM]" format
          const tsParts = match[1].match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/)
          let sortDate = Date.now() - (lines.length - i) * 1000 // fallback
          if (tsParts) {
            sortDate = new Date(
              Number(tsParts[3]), Number(tsParts[2]) - 1, Number(tsParts[1]),
              Number(tsParts[4]), Number(tsParts[5])
            ).getTime()
          }
          events.push({
            id: `nota-${i}`,
            type: 'nota',
            timestamp: match[1],
            sortDate,
            title: match[2],
            color: '#f59e0b',
            icon: MessageSquare,
          })
        } else {
          events.push({
            id: `nota-${i}`,
            type: 'nota',
            timestamp: '',
            sortDate: Date.now() - (lines.length - i) * 1000,
            title: line,
            color: '#f59e0b',
            icon: MessageSquare,
          })
        }
      }
    }

    // c) Productos agregados
    for (const p of productos) {
      events.push({
        id: `prod-${p.id}`,
        type: 'producto',
        timestamp: '',
        sortDate: 0,
        title: `Producto: ${p.subtipo}`,
        detail: p.precio_calculado ? `${formatCOP(p.precio_calculado)} x ${p.cantidad}` : undefined,
        color: '#8b5cf6',
        icon: Box,
      })
    }

    // d) Cotizaciones generadas
    for (const c of cotizaciones) {
      events.push({
        id: `cot-${c.id}`,
        type: 'cotizacion',
        timestamp: c.fecha,
        sortDate: new Date(c.fecha).getTime(),
        title: `Cotizacion ${c.numero} generada`,
        detail: formatCOP(c.total),
        color: '#3b82f6',
        icon: FileText,
      })
    }

    // Sort: newest first, items without date go to the bottom
    events.sort((a, b) => b.sortDate - a.sortDate)
    return events
  }, [historial, opp.notas, productos, cotizaciones])

  // ══════════════════════════════════════════════════
  // HANDLERS
  // ══════════════════════════════════════════════════

  function getDefaultNumero(baseNumero?: string) {
    // If editing (versioning), suggest next letter version
    if (baseNumero) {
      const letterMatch = baseNumero.match(/^(.+?)([A-Z])$/)
      if (letterMatch) {
        const nextLetter = String.fromCharCode(letterMatch[2].charCodeAt(0) + 1)
        return `${letterMatch[1]}${nextLetter}`
      }
      return `${baseNumero}A`
    }
    // New cotización: find max number for current year
    const year = new Date().getFullYear()
    const prefix = `${year}-`
    let maxNum = 0
    for (const c of state.cotizaciones) {
      if (c.numero.startsWith(prefix)) {
        const rest = c.numero.slice(prefix.length).replace(/[A-Z]+$/, '') // strip version letters
        const n = parseInt(rest, 10)
        if (n > maxNum) maxNum = n
      }
    }
    return `${year}-${maxNum + 1}`
  }

  function handleCrearCotizacion(data: { numero: string; tiempoEntrega: string; incluyeTransporte: boolean; condicionesItems: string[]; noIncluyeItems: string[] }) {
    if (productos.length === 0 || !opp) return
    const fecha = new Date().toISOString().split('T')[0]
    const cotId = crypto.randomUUID()

    const lines: { descripcion: string; cantidad: number; precio_unitario: number; unidad?: string }[] = productos.map(p => ({
      descripcion: p.descripcion_comercial || p.subtipo,
      cantidad: p.cantidad,
      precio_unitario: p.precio_calculado || 0,
      unidad: 'UND',
    }))

    const subtotal = lines.reduce((s, l) => s + l.precio_unitario * l.cantidad, 0)
    const total = subtotal + subtotal * 0.19

    dispatch({
      type: 'ADD_COTIZACION',
      payload: {
        id: cotId,
        oportunidad_id: opp.id,
        numero: data.numero,
        fecha,
        estado: 'borrador',
        total,
        tiempoEntrega: data.tiempoEntrega,
        incluyeTransporte: data.incluyeTransporte,
        condicionesItems: data.condicionesItems,
        noIncluyeItems: data.noIncluyeItems,
        productos_snapshot: lines,
      },
    })
    setShowCotModal(false)
    setTimeout(() => navigate(`/cotizaciones/${cotId}/editar`), 100)
  }

  function handleAddNota() {
    if (!notaTexto.trim() || !opp) return
    const now = new Date()
    const ts = now.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' + now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    const newEntry = `[${ts}] ${notaTexto.trim()}`
    const updatedNotas = opp.notas
      ? opp.notas + '\n' + newEntry
      : newEntry
    dispatch({ type: 'UPDATE_OPORTUNIDAD', payload: { id: opp.id, notas: updatedNotas } })
    setNotaTexto('')
  }

  function handleMoveEtapa(nuevaEtapa: Etapa) {
    setShowEtapaDropdown(false)
    if (nuevaEtapa === opp.etapa) return
    if (nuevaEtapa === 'adjudicada') {
      setValorAdjudicado(String(opp.valor_cotizado || ''))
      setShowAdjudicadaModal(true)
      return
    }
    if (nuevaEtapa === 'perdida') {
      setMotivoPerdida('')
      setShowPerdidaModal(true)
      return
    }
    if (window.confirm(`\u00bfMover a "${ETAPAS.find(e => e.key === nuevaEtapa)?.label}"?`)) {
      dispatch({ type: 'MOVE_ETAPA', payload: { oportunidadId: opp.id, nuevaEtapa } })
    }
  }

  function confirmAdjudicada() {
    dispatch({
      type: 'MOVE_ETAPA',
      payload: {
        oportunidadId: opp.id,
        nuevaEtapa: 'adjudicada',
        valor_adjudicado: Number(valorAdjudicado) || 0,
      },
    })
    setShowAdjudicadaModal(false)
  }

  function confirmPerdida() {
    dispatch({
      type: 'MOVE_ETAPA',
      payload: {
        oportunidadId: opp.id,
        nuevaEtapa: 'perdida',
        motivo_perdida: motivoPerdida || 'Sin especificar',
      },
    })
    setShowPerdidaModal(false)
  }

  function handleDuplicarProducto(prodId: string) {
    const prod = productos.find(p => p.id === prodId)
    if (!prod) return
    dispatch({
      type: 'ADD_PRODUCTO',
      payload: {
        oportunidad_id: prod.oportunidad_id,
        categoria: prod.categoria,
        subtipo: prod.subtipo,
        configuracion: { ...prod.configuracion },
        apu_resultado: prod.apu_resultado ? { ...prod.apu_resultado } : undefined,
        precio_calculado: prod.precio_calculado,
        descripcion_comercial: prod.descripcion_comercial,
        cantidad: prod.cantidad,
      },
    })
  }

  function handleDuplicarCotizacionSame(cotId: string) {
    const cot = cotizaciones.find(c => c.id === cotId)
    const nuevoNumero = cot ? getDefaultNumero(cot.numero) : getDefaultNumero()
    const newId = crypto.randomUUID()
    dispatch({ type: 'DUPLICATE_COTIZACION', payload: { originalId: cotId, nuevoNumero, newId } })
    setTimeout(() => navigate(`/cotizaciones/${newId}/editar`), 100)
  }

  function handleDuplicarCotizacion(cotId: string) {
    setDupCotId(cotId)
    setDupSearch('')
    setDupSelectedEmpId(null)
    setDupSelectedOppId(null)
  }

  function handleDupToOtherClient() {
    if (!dupCotId || !dupSelectedOppId) return
    const cot = state.cotizaciones.find(c => c.id === dupCotId)
    if (!cot) return
    const nuevoNumero = getDefaultNumero(cot.numero)
    const newId = crypto.randomUUID()
    // Create cotización copy on the target oportunidad
    dispatch({
      type: 'ADD_COTIZACION',
      payload: {
        id: newId,
        oportunidad_id: dupSelectedOppId,
        numero: nuevoNumero,
        fecha: new Date().toISOString().split('T')[0],
        total: cot.total,
        estado: 'borrador' as const,
        productos_snapshot: cot.productos_snapshot,
        condicionesItems: cot.condicionesItems,
        noIncluyeItems: cot.noIncluyeItems,
      } as any,
    })
    setDupCotId(null)
    showToast('success', `Cotizacion ${nuevoNumero} duplicada en otra oportunidad`)
    setTimeout(() => navigate(`/oportunidades/${dupSelectedOppId}`), 100)
  }

  function handleDescargarPdf(cotId: string) {
    const cot = cotizaciones.find(c => c.id === cotId)
    if (!cot || !contacto) return
    try {
      generarPdfCotizacion({
        numero: cot.numero,
        fecha: cot.fecha,
        nombreProducto: productos[0]?.subtipo || 'Producto',
        cliente: {
          empresa: emp.nombre,
          nombre: contacto.nombre,
          whatsapp: contacto.whatsapp || '',
          correo: contacto.correo || '',
          nit: emp.nit || '',
          ubicacion: opp.ubicacion || emp.direccion || '',
        },
        productos: productos.map(p => ({ ...p, unidad: 'UND' })),
        tiempoEntrega: cot.tiempoEntrega || '25 dias habiles',
        incluyeTransporte: cot.incluyeTransporte ?? true,
        condicionesItems: cot.condicionesItems || [],
        noIncluyeItems: cot.noIncluyeItems || [],
        cotizadorAsignado: opp.cotizador_asignado,
      })
    } catch (err) {
      console.error('Error generando PDF:', err)
    }
  }

  // Extract spec badges from description
  function extractSpecs(desc: string | undefined): string[] {
    if (!desc) return []
    const specs: string[] = []
    const acero = desc.match(/\b(304|430)\b/)
    if (acero) specs.push(acero[0])
    const acabado = desc.match(/\b(mate|satinado|brillante)\b/i)
    if (acabado) specs.push(acabado[0])
    const calibre = desc.match(/\b(cal(?:ibre)?\s*\d+)\b/i)
    if (calibre) specs.push(calibre[0])
    const dims = desc.match(/(\d+[.,]\d+)\s*x\s*(\d+[.,]\d+)/i)
    if (dims) specs.push(`${dims[1]}x${dims[2]}m`)
    return specs
  }

  // ══════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════

  return (
    <div className="p-6 animate-fade-in max-w-[1400px]">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-4">
        <ArrowLeft size={14} /> Volver
      </button>

      {/* ═══ CAMBIO 1: HEADER FUERTE ═══ */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 mb-5">
        <div className="flex items-start justify-between gap-4">
          {/* Left: company info */}
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Building2 size={22} className="text-[var(--color-primary)]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-[var(--color-text)] truncate">{emp.nombre}</h1>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Contacto: <span className="font-medium text-[var(--color-text)]">{contacto?.nombre || '\u2014'}</span>
                {contacto?.cargo && <span> \u2014 {contacto.cargo}</span>}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                Fuente: {opp.fuente_lead} &bull; Ingreso: {formatDate(opp.fecha_ingreso)} &bull; Cotizador: {cotizador?.nombre || opp.cotizador_asignado}
              </p>
            </div>
          </div>

          {/* Right: stage badge + days */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <EtapaBadge etapa={opp.etapa} size="md" />
              <div className="flex items-center gap-1 mt-1.5 justify-end">
                <Clock size={11} className="text-[var(--color-text-muted)]" />
                <span className="text-[10px] text-[var(--color-text-muted)] font-medium">{diasEnPipeline} dias en pipeline</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--color-border)]">
          <button
            onClick={() => document.getElementById('nota-input')?.focus()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-colors"
          >
            <StickyNote size={13} /> + Nota
          </button>

          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-colors"
            >
              <Package size={13} /> + Producto
            </button>
            {showAddMenu && (
              <div className="absolute left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-[var(--color-border)] z-20 overflow-hidden">
                <button
                  onClick={() => { setShowAddMenu(false); navigate(`/oportunidades/${id}/configurar`) }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-[var(--color-surface)] transition-colors text-left"
                >
                  <Wrench size={14} className="text-[var(--color-primary)]" /> Configurar Mesa
                </button>
                <button
                  onClick={() => { setShowAddMenu(false); setShowManualForm(true) }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-[var(--color-surface)] transition-colors text-left border-t border-[var(--color-border)]"
                >
                  <Package size={14} className="text-purple-500" /> Producto manual
                </button>
              </div>
            )}
          </div>

          {productos.length > 0 && (
            <button
              onClick={() => setShowCotModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
            >
              <FileText size={13} /> Generar cotizacion
            </button>
          )}

          {/* Move stage dropdown */}
          <div className="relative ml-auto">
            <button
              onClick={() => setShowEtapaDropdown(!showEtapaDropdown)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[var(--color-primary)] hover:opacity-90 text-white transition-colors"
            >
              Mover etapa <ChevronDown size={13} />
            </button>
            {showEtapaDropdown && (
              <div className="absolute right-0 mt-1 w-52 bg-white rounded-lg shadow-lg border border-[var(--color-border)] z-20 py-1 overflow-hidden">
                {ETAPAS.map(e => (
                  <button
                    key={e.key}
                    onClick={() => handleMoveEtapa(e.key)}
                    disabled={e.key === opp.etapa}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                      e.key === opp.etapa
                        ? 'bg-[var(--color-surface)] text-[var(--color-text-muted)] cursor-not-allowed'
                        : 'hover:bg-[var(--color-surface)]'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: e.color }} />
                    <span className="font-medium">{e.label}</span>
                    {e.key === opp.etapa && <span className="ml-auto text-[9px] text-[var(--color-text-muted)]">actual</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (window.confirm('\u00bfSeguro que deseas eliminar esta opp? Se eliminaran tambien sus productos y cotizaciones.')) {
                dispatch({ type: 'DELETE_OPORTUNIDAD', payload: { id: opp.id } })
                navigate('/pipeline')
              }
            }}
            className="flex items-center gap-1 text-[10px] px-2.5 py-2 rounded-lg text-red-500 hover:bg-red-50 border border-red-200 font-medium transition-all"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* ═══ CAMBIO 2: LAYOUT 2 COLUMNAS ═══ */}
      <div className="flex gap-5 items-start">
        {/* ─── LEFT COLUMN (70%) ─── */}
        <div className="flex-[7] min-w-0 space-y-5">

          {/* ═══ CAMBIO 3: TIMELINE UNIFICADO ═══ */}
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={14} className="text-[var(--color-primary)]" />
              <h3 className="font-semibold text-sm text-[var(--color-text)]">Actividad</h3>
              {timelineEvents.length > 0 && (
                <span className="text-[9px] font-bold text-[var(--color-primary)] bg-blue-50 px-1.5 py-0.5 rounded">{timelineEvents.length}</span>
              )}
            </div>

            {/* Add note input */}
            <div className="flex gap-2 mb-4">
              <input
                id="nota-input"
                value={notaTexto}
                onChange={e => setNotaTexto(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddNota() } }}
                placeholder="Escribir una nota..."
                className="flex-1 px-3 py-2.5 rounded-lg text-xs border border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
              />
              <button
                onClick={handleAddNota}
                disabled={!notaTexto.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={12} /> Agregar
              </button>
            </div>

            {/* Timeline feed */}
            {timelineEvents.length === 0 ? (
              <p className="text-[10px] text-[var(--color-text-muted)] text-center py-6">Sin actividad registrada. Agrega la primera nota arriba.</p>
            ) : (
              <div className="space-y-0 max-h-[400px] overflow-y-auto pr-1">
                {timelineEvents.map((ev, i) => {
                  const Icon = ev.icon
                  return (
                    <div key={ev.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10"
                          style={{ background: ev.color + '18' }}
                        >
                          <Icon size={13} style={{ color: ev.color }} />
                        </div>
                        {i < timelineEvents.length - 1 && <div className="w-0.5 flex-1 bg-[var(--color-border)] min-h-[12px]" />}
                      </div>
                      <div className="pb-3 pt-1 min-w-0 flex-1">
                        <div className="text-xs text-[var(--color-text)] leading-relaxed">{ev.title}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {ev.timestamp && (
                            <span className="text-[10px] text-[var(--color-text-muted)]">
                              {ev.type === 'etapa' ? formatDate(ev.timestamp) : ev.timestamp}
                            </span>
                          )}
                          {ev.detail && (
                            <span className="text-[10px] font-semibold font-mono" style={{ color: ev.color }}>{ev.detail}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ═══ CAMBIO 4: PRODUCTOS MEJORADOS ═══ */}
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Package size={14} className="text-purple-500" />
                <h3 className="font-semibold text-sm text-[var(--color-text)]">Productos</h3>
                {productos.length > 0 && (
                  <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">{productos.length}</span>
                )}
              </div>
            </div>

            {productos.length === 0 ? (
              <div className="text-center py-8">
                <Package size={28} className="text-[var(--color-border)] mx-auto mb-2" />
                <p className="text-xs text-[var(--color-text-muted)] mb-3">Sin productos configurados.</p>
                <button
                  onClick={() => navigate(`/oportunidades/${id}/configurar`)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[var(--color-primary)] hover:opacity-90 text-white transition-all"
                >
                  <Wrench size={13} /> Configurar primer producto
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {productos.map(p => {
                  const specs = extractSpecs(p.descripcion_comercial)
                  const descShort = p.descripcion_comercial
                    ? p.descripcion_comercial.length > 100
                      ? p.descripcion_comercial.slice(0, 100) + '...'
                      : p.descripcion_comercial
                    : ''
                  return (
                    <div key={p.id} className="bg-[var(--color-surface)] rounded-lg p-4 border border-[var(--color-border)] hover:border-gray-300 transition-all">
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-xs text-[var(--color-text)]">{p.subtipo}</span>
                            <span className="text-[9px] text-[var(--color-text-muted)] bg-gray-100 px-1.5 py-0.5 rounded">{p.categoria}</span>
                          </div>
                          {descShort && (
                            <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed mb-2">{descShort}</p>
                          )}
                          {specs.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {specs.map((s, i) => (
                                <span key={i} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">{s}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="font-bold text-sm text-[var(--color-text)] font-mono">{formatCOP(p.precio_calculado || 0)}</div>
                          <div className="text-[10px] text-[var(--color-text-muted)]">{'\u00d7'} {p.cantidad} = <span className="font-semibold font-mono">{formatCOP((p.precio_calculado || 0) * p.cantidad)}</span></div>
                          <div className="flex items-center justify-end gap-1 mt-2">
                            <button
                              onClick={() => navigate(`/oportunidades/${id}/configurar?editar=${p.id}`)}
                              className="p-1.5 rounded text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                              title="Editar"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDuplicarProducto(p.id)}
                              className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                              title="Duplicar"
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              onClick={() => setAttachingProduct(attachingProduct === p.id ? null : p.id)}
                              className={`p-1.5 rounded transition-all ${attachingProduct === p.id ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                              title="Adjuntar archivo"
                            >
                              <Paperclip size={13} />
                            </button>
                            <button
                              onClick={() => { if (window.confirm('\u00bfEliminar este producto?')) dispatch({ type: 'DELETE_PRODUCTO', payload: { id: p.id } }) }}
                              className="p-1.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                              title="Eliminar"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                      {/* Attached files display */}
                      {(p.archivo_apu_nombre || p.archivo_pdf_nombre) && (
                        <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex flex-wrap gap-2">
                          {p.archivo_apu_nombre && (
                            <button
                              onClick={async () => {
                                if (!p.archivo_apu_url) return
                                const url = await getSignedUrl(p.archivo_apu_url)
                                if (url) window.open(url, '_blank')
                              }}
                              className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-50 border border-green-200 hover:bg-green-100 transition-all text-[10px] text-green-800"
                            >
                              <FileSpreadsheet size={12} className="text-green-600" />
                              {p.archivo_apu_nombre}
                              <Download size={10} />
                            </button>
                          )}
                          {p.archivo_pdf_nombre && (
                            <button
                              onClick={async () => {
                                if (!p.archivo_pdf_url) return
                                const url = await getSignedUrl(p.archivo_pdf_url)
                                if (url) window.open(url, '_blank')
                              }}
                              className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-50 border border-red-200 hover:bg-red-100 transition-all text-[10px] text-red-700"
                            >
                              <File size={12} className="text-red-500" />
                              {p.archivo_pdf_nombre}
                              <Download size={10} />
                            </button>
                          )}
                        </div>
                      )}
                      {/* Inline attach area */}
                      {attachingProduct === p.id && (
                        <div className="mt-3 pt-3 border-t border-dashed border-blue-200 bg-blue-50/30 rounded-lg p-3">
                          <div className="text-[10px] font-semibold text-blue-700 mb-2">Adjuntar archivos</div>
                          <div className="flex gap-2 flex-wrap">
                            <input ref={attachApuRef} type="file" accept={acceptString('apu')} className="hidden" onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file || !opp) return
                              setUploading(true)
                              const res = await uploadProductFile(opp.id, p.id, file, 'apu')
                              if ('error' in res) { alert(res.error); setUploading(false); return }
                              await svcOportunidades.updateProducto({ id: p.id, archivo_apu_url: res.url, archivo_apu_nombre: res.nombre } as any)
                              dispatch({ type: 'UPDATE_PRODUCTO', payload: { id: p.id, archivo_apu_url: res.url, archivo_apu_nombre: res.nombre } as any })
                              setUploading(false)
                              setAttachingProduct(null)
                            }} />
                            <button onClick={() => attachApuRef.current?.click()} disabled={uploading} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-green-300 bg-white hover:bg-green-50 text-[10px] text-green-700 transition-all disabled:opacity-50">
                              <FileSpreadsheet size={12} /> {p.archivo_apu_nombre ? 'Reemplazar APU' : 'Subir APU (.xlsx)'}
                            </button>
                            <input ref={attachPdfRef} type="file" accept={acceptString('pdf')} className="hidden" onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file || !opp) return
                              setUploading(true)
                              const res = await uploadProductFile(opp.id, p.id, file, 'pdf')
                              if ('error' in res) { alert(res.error); setUploading(false); return }
                              await svcOportunidades.updateProducto({ id: p.id, archivo_pdf_url: res.url, archivo_pdf_nombre: res.nombre } as any)
                              dispatch({ type: 'UPDATE_PRODUCTO', payload: { id: p.id, archivo_pdf_url: res.url, archivo_pdf_nombre: res.nombre } as any })
                              setUploading(false)
                              setAttachingProduct(null)
                            }} />
                            <button onClick={() => attachPdfRef.current?.click()} disabled={uploading} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-300 bg-white hover:bg-red-50 text-[10px] text-red-600 transition-all disabled:opacity-50">
                              <File size={12} /> {p.archivo_pdf_nombre ? 'Reemplazar PDF' : 'Subir PDF (.pdf)'}
                            </button>
                          </div>
                          {uploading && <p className="text-[10px] text-blue-500 mt-1">Subiendo...</p>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ═══ CAMBIO 5: COTIZACIONES MEJORADAS ═══ */}
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-[var(--color-primary)]" />
                <h3 className="font-semibold text-sm text-[var(--color-text)]">Cotizaciones</h3>
                {cotizaciones.length > 0 && (
                  <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{cotizaciones.length}</span>
                )}
              </div>
            </div>

            {cotizaciones.length === 0 ? (
              <div className="text-center py-8">
                <FileText size={28} className="text-[var(--color-border)] mx-auto mb-2" />
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Sin cotizaciones.</p>
                <p className="text-[10px] text-[var(--color-text-muted)] mb-3">Agrega productos y genera una.</p>
                {productos.length > 0 && (
                  <button
                    onClick={() => setShowCotModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-all"
                  >
                    <FileText size={13} /> Generar primera cotizacion
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {cotizaciones.map(c => {
                  const prodCount = c.productos_snapshot?.length || 0
                  return (
                    <div key={c.id} className="bg-[var(--color-surface)] rounded-lg p-4 border border-[var(--color-border)] hover:border-gray-300 transition-all">
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-xs text-[var(--color-text)] font-mono">{c.numero}</span>
                            <EstadoBadge estado={c.estado} />
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
                            <span>{formatDate(c.fecha)}</span>
                            <span>{prodCount} producto{prodCount !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="font-bold text-sm text-[var(--color-text)] font-mono">{formatCOP(c.total)}</div>
                          <div className="text-[9px] text-[var(--color-text-muted)]">con IVA</div>
                          <div className="flex items-center justify-end gap-1 mt-2">
                            <button
                              onClick={() => navigate(`/cotizaciones/${c.id}/editar`)}
                              className="p-1.5 rounded text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                              title="Ver/Editar"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDescargarPdf(c.id)}
                              className="p-1.5 rounded text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                              title="Descargar PDF"
                            >
                              <Download size={13} />
                            </button>
                            <button
                              onClick={() => handleDuplicarCotizacion(c.id)}
                              className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                              title="Duplicar"
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              onClick={() => { if (window.confirm('\u00bfEliminar esta cotizacion?')) dispatch({ type: 'DELETE_COTIZACION', payload: { id: c.id } }) }}
                              className="p-1.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                              title="Eliminar"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT COLUMN - SIDEBAR (30%) ─── */}
        <div className="flex-[3] min-w-[260px] max-w-[340px] space-y-4 sticky top-6">
          {/* ═══ CAMBIO 2: SIDEBAR RESUMEN ═══ */}
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
            <div className="text-center mb-4 pb-4 border-b border-[var(--color-border)]">
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold mb-1">Valor cotizado</p>
              <p className="text-2xl font-bold text-[var(--color-text)] font-mono">{formatCOP(opp.valor_cotizado)}</p>
              {opp.valor_adjudicado > 0 && (
                <p className="text-sm font-bold text-[var(--color-accent-green)] font-mono mt-1">
                  Adjudicado: {formatCOP(opp.valor_adjudicado)}
                </p>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-text-muted)]">Etapa</span>
                <EtapaBadge etapa={opp.etapa} size="sm" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-text-muted)]">Cotizador</span>
                <select
                  value={opp.cotizador_asignado}
                  onChange={e => {
                    dispatch({ type: 'UPDATE_OPORTUNIDAD', payload: { id: opp.id, cotizador_asignado: e.target.value } })
                    const c = findCotizador(e.target.value)
                    showToast('success', `Cotizador actualizado a ${c?.nombre || e.target.value}`)
                  }}
                  className="text-sm font-medium bg-transparent border-none cursor-pointer text-right pr-0 focus:ring-0 focus:outline-none hover:text-[var(--color-primary)] transition-colors"
                >
                  {COTIZADORES.map(c => (
                    <option key={c.id} value={c.id}>{c.iniciales} — {c.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-text-muted)]">Empresa</span>
                <button
                  onClick={() => navigate(`/empresas/${emp.id}`)}
                  className="font-medium text-[var(--color-primary)] hover:underline truncate max-w-[150px]"
                >
                  {emp.nombre}
                </button>
              </div>

              {/* Contacto info */}
              <div className="pt-2 border-t border-[var(--color-border)]">
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold mb-2">Contacto</p>
                <p className="font-medium text-[var(--color-text)] mb-1">{contacto?.nombre || '\u2014'}</p>
                {contacto?.whatsapp && (
                  <a href={`tel:${contacto.whatsapp}`} className="flex items-center gap-1.5 text-[10px] text-[var(--color-primary)] hover:underline mb-0.5">
                    <Phone size={10} /> {contacto.whatsapp}
                  </a>
                )}
                {contacto?.correo && (
                  <a href={`mailto:${contacto.correo}`} className="flex items-center gap-1.5 text-[10px] text-[var(--color-primary)] hover:underline">
                    <Mail size={10} /> {contacto.correo}
                  </a>
                )}
              </div>

              <div className="pt-2 border-t border-[var(--color-border)] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Dias en pipeline</span>
                  <span className="font-medium">{diasEnPipeline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Fecha ingreso</span>
                  <span className="font-medium">{formatDate(opp.fecha_ingreso)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Fuente</span>
                  <span className="font-medium">{opp.fuente_lead}</span>
                </div>
                {emp.sector && (
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">Sector</span>
                    <span className="font-medium">{emp.sector}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ═══ CAMBIO 6: EMPRESA CARD ═══ */}
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Building2 size={12} className="text-[var(--color-primary)]" />
              <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Empresa</span>
            </div>
            <div className="space-y-1 text-[10px]">
              <div className="font-medium text-xs text-[var(--color-text)]">{emp.nombre}</div>
              <div className="text-[var(--color-text-muted)]">NIT: {emp.nit || '\u2014'}</div>
              <div className="text-[var(--color-text-muted)]">{emp.direccion || '\u2014'}</div>
              <div className="text-[var(--color-text-muted)]">{emp.sector}</div>
            </div>
            <button onClick={() => navigate(`/empresas/${emp.id}`)} className="text-[10px] text-[var(--color-primary)] hover:underline mt-2 block">
              Ver todas las oportunidades
            </button>
            {totalHistoricoEmpresa > 0 && (
              <div className="mt-2 pt-2 border-t border-[var(--color-border)]">
                <span className="text-[9px] text-[var(--color-text-muted)]">Total historico cotizado:</span>
                <span className="text-[10px] font-bold font-mono text-[var(--color-text)] ml-1">{formatCOP(totalHistoricoEmpresa)}</span>
              </div>
            )}
          </div>

          {/* ═══ CAMBIO 6: CONTACTO CARD ═══ */}
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <User size={12} className="text-[var(--color-primary)]" />
              <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Contacto</span>
            </div>
            {contacto ? (
              <div className="space-y-1.5">
                <div className="font-medium text-xs text-[var(--color-text)]">{contacto.nombre}</div>
                <div className="text-[10px] text-[var(--color-text-muted)]">{contacto.cargo || '\u2014'}</div>
                {contacto.correo ? (
                  <a href={`mailto:${contacto.correo}`} className="flex items-center gap-1.5 text-[10px] text-[var(--color-primary)] hover:underline">
                    <Mail size={10} /> {contacto.correo}
                  </a>
                ) : (
                  <span className="text-[10px] text-[var(--color-text-muted)]">Sin correo</span>
                )}
                {contacto.whatsapp ? (
                  <a href={`tel:${contacto.whatsapp}`} className="flex items-center gap-1.5 text-[10px] text-[var(--color-primary)] hover:underline">
                    <Phone size={10} /> {contacto.whatsapp}
                  </a>
                ) : (
                  <span className="text-[10px] text-[var(--color-text-muted)]">Sin telefono</span>
                )}
                {(!contacto.correo || !contacto.whatsapp) && (
                  <div className="flex items-center gap-1 mt-1 text-[9px] text-amber-600">
                    <AlertCircle size={10} /> Datos incompletos
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[10px] text-amber-600">
                <AlertCircle size={12} /> Sin contacto asignado
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ MODALS ═══ */}

      {/* Cotizacion modal */}
      {showCotModal && (
        <CotizacionModal
          defaultNumero={getDefaultNumero()}
          onConfirm={handleCrearCotizacion}
          onClose={() => setShowCotModal(false)}
        />
      )}

      {/* Adjudicada modal */}
      {showAdjudicadaModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowAdjudicadaModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
              <h3 className="font-semibold text-sm text-[var(--color-text)]">Marcar como Adjudicada</h3>
              <button onClick={() => setShowAdjudicadaModal(false)} className="p-1 rounded hover:bg-[var(--color-surface)]"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Valor adjudicado (COP)</label>
                <input
                  type="number"
                  value={valorAdjudicado}
                  onChange={e => setValorAdjudicado(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--color-border)] font-mono"
                  placeholder="0"
                  min={0}
                  step={1000}
                  autoFocus
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
              <button onClick={() => setShowAdjudicadaModal(false)} className="px-4 py-2 rounded-lg text-xs font-medium text-[var(--color-text-muted)] hover:bg-white border border-[var(--color-border)] transition-colors">Cancelar</button>
              <button
                onClick={confirmAdjudicada}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-all"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Perdida modal */}
      {showPerdidaModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowPerdidaModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
              <h3 className="font-semibold text-sm text-[var(--color-text)]">Marcar como Perdida</h3>
              <button onClick={() => setShowPerdidaModal(false)} className="p-1 rounded hover:bg-[var(--color-surface)]"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Motivo de perdida</label>
                <select
                  value={motivoPerdida}
                  onChange={e => setMotivoPerdida(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs border border-[var(--color-border)] bg-white"
                  autoFocus
                >
                  <option value="">Seleccionar motivo...</option>
                  {MOTIVOS_PERDIDA.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
              <button onClick={() => setShowPerdidaModal(false)} className="px-4 py-2 rounded-lg text-xs font-medium text-[var(--color-text-muted)] hover:bg-white border border-[var(--color-border)] transition-colors">Cancelar</button>
              <button
                onClick={confirmPerdida}
                disabled={!motivoPerdida}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-500 hover:bg-red-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual product modal */}
      {showManualForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowManualForm(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
              <h3 className="font-semibold text-sm text-[var(--color-text)]">Producto manual</h3>
              <button onClick={() => setShowManualForm(false)} className="p-1 rounded hover:bg-[var(--color-surface)]"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Categoria</label>
                <select value={manualForm.categoria} onChange={e => setManualForm(f => ({ ...f, categoria: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-xs border border-[var(--color-border)] bg-white">
                  {CATEGORIAS_PRODUCTO.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Descripcion comercial</label>
                <textarea value={manualForm.descripcion} onChange={e => setManualForm(f => ({ ...f, descripcion: e.target.value }))} rows={3} placeholder="Descripcion del producto para la cotizacion..." className="w-full px-3 py-2 rounded-lg text-xs border border-[var(--color-border)] resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Cantidad</label>
                  <input type="number" value={manualForm.cantidad} onChange={e => setManualForm(f => ({ ...f, cantidad: Math.max(1, Number(e.target.value)) }))} min={1} className="w-full px-3 py-2 rounded-lg text-xs border border-[var(--color-border)]" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Precio unitario (COP)</label>
                  <input type="number" value={manualForm.precio_unitario} onChange={e => setManualForm(f => ({ ...f, precio_unitario: Math.max(0, Number(e.target.value)) }))} min={0} step={1000} className="w-full px-3 py-2 rounded-lg text-xs border border-[var(--color-border)]" />
                </div>
              </div>
              {manualForm.precio_unitario > 0 && manualForm.cantidad > 0 && (
                <div className="text-right text-xs text-[var(--color-text-muted)]">
                  Total: <span className="font-bold text-[var(--color-text)] font-mono">{formatCOP(manualForm.precio_unitario * manualForm.cantidad)}</span>
                </div>
              )}
              <div>
                <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Notas internas (opcional)</label>
                <textarea value={manualForm.notas} onChange={e => setManualForm(f => ({ ...f, notas: e.target.value }))} rows={2} placeholder="Notas para referencia del cotizador..." className="w-full px-3 py-2 rounded-lg text-xs border border-[var(--color-border)] resize-none" />
              </div>

              {/* File uploads */}
              <div className="border-t border-[var(--color-border)] pt-4">
                <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block mb-2">Archivos adjuntos (opcional)</label>
                <div className="space-y-2">
                  {/* APU file */}
                  <div className="flex items-center gap-2">
                    <input ref={apuInputRef} type="file" accept={acceptString('apu')} className="hidden" onChange={e => { if (e.target.files?.[0]) setManualApuFile(e.target.files[0]) }} />
                    {manualApuFile ? (
                      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex-1">
                        <FileSpreadsheet size={14} className="text-green-600 shrink-0" />
                        <span className="text-xs text-green-800 truncate flex-1">{manualApuFile.name}</span>
                        <button onClick={() => { setManualApuFile(null); if (apuInputRef.current) apuInputRef.current.value = '' }} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                      </div>
                    ) : (
                      <button onClick={() => apuInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/30 text-xs text-[var(--color-text-muted)] transition-all flex-1">
                        <FileSpreadsheet size={14} className="text-green-500" /> Archivo APU (.xlsx)
                      </button>
                    )}
                  </div>
                  {/* PDF file */}
                  <div className="flex items-center gap-2">
                    <input ref={pdfInputRef} type="file" accept={acceptString('pdf')} className="hidden" onChange={e => { if (e.target.files?.[0]) setManualPdfFile(e.target.files[0]) }} />
                    {manualPdfFile ? (
                      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex-1">
                        <File size={14} className="text-red-500 shrink-0" />
                        <span className="text-xs text-red-800 truncate flex-1">{manualPdfFile.name}</span>
                        <button onClick={() => { setManualPdfFile(null); if (pdfInputRef.current) pdfInputRef.current.value = '' }} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                      </div>
                    ) : (
                      <button onClick={() => pdfInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/30 text-xs text-[var(--color-text-muted)] transition-all flex-1">
                        <File size={14} className="text-red-400" /> PDF Cotizacion (.pdf)
                      </button>
                    )}
                  </div>
                </div>
                {uploadError && <p className="text-[10px] text-red-500 mt-1">{uploadError}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
              <button onClick={() => { setShowManualForm(false); setManualApuFile(null); setManualPdfFile(null); setUploadError('') }} className="px-4 py-2 rounded-lg text-xs font-medium text-[var(--color-text-muted)] hover:bg-white border border-[var(--color-border)] transition-colors">Cancelar</button>
              <button
                disabled={!manualForm.descripcion.trim() || manualForm.precio_unitario <= 0 || uploading}
                onClick={async () => {
                  if (!opp) return
                  setUploading(true)
                  setUploadError('')

                  const descFull = manualForm.notas.trim()
                    ? `${manualForm.descripcion}\n[Nota: ${manualForm.notas.trim()}]`
                    : manualForm.descripcion

                  // Create the product first to get an ID
                  const prodId = crypto.randomUUID()
                  const prodPayload: Record<string, unknown> = {
                    id: prodId,
                    oportunidad_id: opp.id,
                    categoria: manualForm.categoria,
                    subtipo: `${manualForm.categoria} (manual)`,
                    configuracion: CONFIG_MESA_DEFAULT,
                    precio_calculado: manualForm.precio_unitario,
                    descripcion_comercial: descFull,
                    cantidad: manualForm.cantidad,
                  }

                  // Upload files if any
                  if (manualApuFile) {
                    const res = await uploadProductFile(opp.id, prodId, manualApuFile, 'apu')
                    if ('error' in res) { setUploadError(res.error); setUploading(false); return }
                    prodPayload.archivo_apu_url = res.url
                    prodPayload.archivo_apu_nombre = res.nombre
                  }
                  if (manualPdfFile) {
                    const res = await uploadProductFile(opp.id, prodId, manualPdfFile, 'pdf')
                    if ('error' in res) { setUploadError(res.error); setUploading(false); return }
                    prodPayload.archivo_pdf_url = res.url
                    prodPayload.archivo_pdf_nombre = res.nombre
                  }

                  dispatch({
                    type: 'ADD_PRODUCTO',
                    payload: {
                      id: prodId,
                      oportunidad_id: opp.id,
                      categoria: manualForm.categoria,
                      subtipo: `${manualForm.categoria} (manual)`,
                      configuracion: CONFIG_MESA_DEFAULT,
                      precio_calculado: manualForm.precio_unitario,
                      descripcion_comercial: descFull,
                      cantidad: manualForm.cantidad,
                      archivo_apu_url: (prodPayload.archivo_apu_url as string) ?? null,
                      archivo_apu_nombre: (prodPayload.archivo_apu_nombre as string) ?? null,
                      archivo_pdf_url: (prodPayload.archivo_pdf_url as string) ?? null,
                      archivo_pdf_nombre: (prodPayload.archivo_pdf_nombre as string) ?? null,
                    } as any,
                  })

                  // If files were uploaded, update the product in Supabase with the file URLs
                  if (manualApuFile || manualPdfFile) {
                    const updates: Record<string, unknown> = { id: prodId }
                    if (prodPayload.archivo_apu_url) { updates.archivo_apu_url = prodPayload.archivo_apu_url; updates.archivo_apu_nombre = prodPayload.archivo_apu_nombre }
                    if (prodPayload.archivo_pdf_url) { updates.archivo_pdf_url = prodPayload.archivo_pdf_url; updates.archivo_pdf_nombre = prodPayload.archivo_pdf_nombre }
                    svcOportunidades.updateProducto(updates as any)
                  }

                  setShowManualForm(false)
                  setManualForm({ categoria: 'Mesas', descripcion: '', cantidad: 1, precio_unitario: 0, notas: '' })
                  setManualApuFile(null)
                  setManualPdfFile(null)
                  setUploadError('')
                  setUploading(false)
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[var(--color-primary)] hover:opacity-90 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {uploading ? 'Subiendo...' : 'Guardar producto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate to other client modal */}
      {dupCotId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setDupCotId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
              <h3 className="font-bold text-base text-[var(--color-text)]">Duplicar cotizacion</h3>
              <button onClick={() => setDupCotId(null)} className="p-1 rounded hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <button
                onClick={() => { handleDuplicarCotizacionSame(dupCotId); setDupCotId(null) }}
                className="w-full text-left px-4 py-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-blue-50/30 transition-all"
              >
                <p className="font-semibold text-sm">Duplicar en esta oportunidad</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Crea una version nueva (A, B, C...)</p>
              </button>
              <div className="border border-[var(--color-border)] rounded-xl p-4">
                <p className="font-semibold text-sm mb-3">Duplicar para otro cliente</p>
                <input
                  type="text"
                  value={dupSearch}
                  onChange={e => { setDupSearch(e.target.value); setDupSelectedEmpId(null); setDupSelectedOppId(null) }}
                  placeholder="Buscar empresa..."
                  className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--color-border)]"
                />
                {dupSearch.length >= 2 && !dupSelectedEmpId && (
                  <div className="mt-2 max-h-32 overflow-y-auto border border-[var(--color-border)] rounded-lg">
                    {state.empresas.filter(e => e.nombre.toLowerCase().includes(dupSearch.toLowerCase())).slice(0, 8).map(e => (
                      <button key={e.id} onClick={() => { setDupSelectedEmpId(e.id); setDupSearch(e.nombre) }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 truncate">
                        {e.nombre}
                      </button>
                    ))}
                  </div>
                )}
                {dupSelectedEmpId && (
                  <div className="mt-3">
                    <p className="text-xs text-[var(--color-text-muted)] mb-1.5 font-medium">Seleccionar oportunidad:</p>
                    <div className="max-h-28 overflow-y-auto space-y-1">
                      {state.oportunidades.filter(o => o.empresa_id === dupSelectedEmpId).map(o => (
                        <button
                          key={o.id}
                          onClick={() => setDupSelectedOppId(o.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${dupSelectedOppId === o.id ? 'bg-blue-50 border border-[var(--color-primary)] text-[var(--color-primary)]' : 'border border-[var(--color-border)] hover:bg-slate-50'}`}
                        >
                          {o.ubicacion || o.etapa} — {formatCOP(o.valor_cotizado)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {dupSelectedOppId && (
                  <button onClick={handleDupToOtherClient} className="mt-3 w-full py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-bold hover:opacity-90 transition-all">
                    Duplicar cotizacion
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click-away to close dropdowns */}
      {(showEtapaDropdown || showAddMenu) && (
        <div className="fixed inset-0 z-10" onClick={() => { setShowEtapaDropdown(false); setShowAddMenu(false) }} />
      )}
    </div>
  )
}

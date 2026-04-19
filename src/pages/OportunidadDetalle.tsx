import { useState, useMemo, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore, todayLocalISO } from '../lib/store'
import { ETAPAS, COTIZADORES, MOTIVOS_PERDIDA, findCotizador, CONFIG_MESA_DEFAULT, Etapa } from '../types'
import { formatDate, formatCOP, daysSince, downloadBlob, getAvatarColor } from '../lib/utils'
import { EtapaBadge } from '../components/ui'
import CotizacionModal from '../components/CotizacionModal'
import { generarPdfCotizacion } from '../lib/generar-pdf'
import { uploadProductFile, getSignedUrl, acceptString, uploadOppFile, listOppFiles, deleteProductFile, uploadCotizacionFile } from '../hooks/useStorage'
import * as svcCotizaciones from '../hooks/useCotizaciones'
import { showToast } from '../components/Toast'
import { exportApuExcel, exportApuConsolidado } from '../lib/exportar-apu'
import * as svcOportunidades from '../hooks/useOportunidades'
import {
  ArrowLeft, FileText, Package, Trash2, User, Edit3,
  StickyNote, Send, Wrench, X, ChevronDown, Copy, Download,
  ArrowRightLeft, MessageSquare, Box, Phone, Mail, AlertCircle,
  Paperclip, FileSpreadsheet, File as FileIcon, RotateCcw, Plus,
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
  const empContactos = oportunidad ? state.contactos.filter(c => c.empresa_id === oportunidad.empresa_id) : []
  const historial = state.historial.filter(h => h.oportunidad_id === id)
  const productos = state.productos.filter(p => p.oportunidad_id === id)
  const cotizaciones = state.cotizaciones.filter(c => c.oportunidad_id === id)
  const cotizador = oportunidad ? findCotizador(oportunidad.cotizador_asignado) : null

  const [showCotModal, setShowCotModal] = useState(false)
  const [notaTexto, setNotaTexto] = useState('')
  const [tab, setTab] = useState<'actividad' | 'productos' | 'cotizaciones' | 'adjuntos'>('actividad')
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showManualForm, setShowManualForm] = useState(false)
  const [showEtapaDropdown, setShowEtapaDropdown] = useState(false)
  const [showAdjudicadaModal, setShowAdjudicadaModal] = useState(false)
  const [showPerdidaModal, setShowPerdidaModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [catalogProducts, setCatalogProducts] = useState<{ id: string; nombre: string; activo: boolean }[]>([])
  const [editingContacto, setEditingContacto] = useState(false)
  const [contactoForm, setContactoForm] = useState({ nombre: '', cargo: '', correo: '', whatsapp: '' })
  // Note editing state
  const [editingNotaIdx, setEditingNotaIdx] = useState<number | null>(null)
  const [editingNotaText, setEditingNotaText] = useState('')
  // Assign contact state
  const [showAssignContacto, setShowAssignContacto] = useState(false)
  const [creatingContacto, setCreatingContacto] = useState(false)
  const [newContactoForm, setNewContactoForm] = useState({ nombre: '', cargo: '', correo: '', whatsapp: '' })
  // Archivos state
  const [archivos, setArchivos] = useState<{ name: string; path: string; size: number; created: string }[]>([])
  const [uploadingFile, setUploadingFile] = useState(false)
  const [valorAdjudicado, setValorAdjudicado] = useState('')
  const [fechaAdjudicacion, setFechaAdjudicacion] = useState(new Date().toISOString().split('T')[0])
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
  // Load archivos from storage
  useEffect(() => {
    if (opp?.id) listOppFiles(opp.id).then(setArchivos)
  }, [opp?.id])

  // Load catalog products from Supabase for the product selector
  useEffect(() => {
    import('../lib/supabase').then(({ supabase }) => {
      supabase.from('productos_catalogo').select('id, nombre, activo').order('orden').then(({ data }) => {
        if (data) setCatalogProducts(data)
      })
    })
  }, [])

  async function handleUploadFile(file: File) {
    if (!opp) return
    setUploadingFile(true)
    const result = await uploadOppFile(opp.id, file)
    if ('error' in result) {
      showToast('error', result.error)
    } else {
      showToast('success', `${file.name} subido`)
      listOppFiles(opp.id).then(setArchivos)
    }
    setUploadingFile(false)
  }

  async function handleDeleteFile(path: string, name: string) {
    if (!window.confirm(`¿Eliminar "${name}"?`)) return
    const { error } = await deleteProductFile(path)
    if (error) showToast('error', error)
    else {
      showToast('success', 'Archivo eliminado')
      if (opp) listOppFiles(opp.id).then(setArchivos)
    }
  }

  async function handleDownloadFile(path: string, name: string) {
    const url = await getSignedUrl(path)
    if (url) {
      const a = document.createElement('a')
      a.href = url
      a.download = name
      a.target = '_blank'
      a.click()
    } else showToast('error', 'No se pudo obtener enlace de descarga')
  }

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
    // Parse en zona local (Bogotá) — evita que "2026-04-19" caiga el 18 en UTC-5.
    // Desempate por número de cot para que recotización A quede DESPUÉS de la original.
    for (const c of cotizaciones) {
      const fechaRef = c.fecha_envio || c.fecha
      const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(fechaRef || '')
      let sortDate = 0
      if (m) {
        const numSuffix = c.numero.match(/([A-Z])$/)?.[1] ?? ''
        const suffixWeight = numSuffix ? numSuffix.charCodeAt(0) - 64 : 0 // A=1, B=2…
        sortDate = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 0, 0, 0, suffixWeight).getTime()
      }
      events.push({
        id: `cot-${c.id}`,
        type: 'cotizacion',
        timestamp: fechaRef,
        sortDate,
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
    // Auto-move nuevo_lead → en_cotizacion when generating the first cotización.
    // MOVE_ETAPA is dispatched explicitly (not relying on ADD_COTIZACION reducer)
    // so we get a proper historial entry and the Supabase sync fires.
    if (opp.etapa === 'nuevo_lead') {
      dispatch({ type: 'MOVE_ETAPA', payload: { oportunidadId: opp.id, nuevaEtapa: 'en_cotizacion' } })
    }
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

  function handleEditNota(lineIdx: number) {
    if (!opp.notas) return
    const lines = opp.notas.split('\n').filter(l => l.trim())
    if (lineIdx >= lines.length) return
    const line = lines[lineIdx]
    const match = line.match(/^\[(.+?)\]\s*(.*)$/)
    setEditingNotaText(match ? match[2] : line)
    setEditingNotaIdx(lineIdx)
  }

  function handleSaveEditNota() {
    if (!opp.notas || editingNotaIdx === null) return
    const lines = opp.notas.split('\n').filter(l => l.trim())
    if (editingNotaIdx >= lines.length) return
    const line = lines[editingNotaIdx]
    const match = line.match(/^\[(.+?)\]\s*(.*)$/)
    lines[editingNotaIdx] = match ? `[${match[1]}] ${editingNotaText.trim()}` : editingNotaText.trim()
    dispatch({ type: 'UPDATE_OPORTUNIDAD', payload: { id: opp.id, notas: lines.join('\n') } })
    setEditingNotaIdx(null)
    setEditingNotaText('')
  }

  function handleDeleteNota(lineIdx: number) {
    if (!opp.notas) return
    if (!window.confirm('¿Eliminar esta nota?')) return
    const lines = opp.notas.split('\n').filter(l => l.trim())
    lines.splice(lineIdx, 1)
    dispatch({ type: 'UPDATE_OPORTUNIDAD', payload: { id: opp.id, notas: lines.join('\n') } })
  }

  function handleAssignContacto(contactoId: string) {
    dispatch({ type: 'UPDATE_OPORTUNIDAD', payload: { id: opp.id, contacto_id: contactoId } })
    setShowAssignContacto(false)
    setCreatingContacto(false)
    showToast('success', 'Contacto asignado')
  }

  function handleCreateContacto() {
    if (!newContactoForm.nombre.trim()) return
    const contactoId = crypto.randomUUID()
    dispatch({
      type: 'ADD_CONTACTO',
      payload: {
        id: contactoId,
        empresa_id: opp.empresa_id,
        nombre: newContactoForm.nombre.trim(),
        cargo: newContactoForm.cargo.trim(),
        correo: newContactoForm.correo.trim(),
        whatsapp: newContactoForm.whatsapp.trim(),
        notas: '',
      },
    })
    dispatch({ type: 'UPDATE_OPORTUNIDAD', payload: { id: opp.id, contacto_id: contactoId } })
    setCreatingContacto(false)
    setNewContactoForm({ nombre: '', cargo: '', correo: '', whatsapp: '' })
    setShowAssignContacto(false)
    showToast('success', 'Contacto creado y asignado')
  }

  function handleMoveEtapa(nuevaEtapa: Etapa) {
    setShowEtapaDropdown(false)
    if (nuevaEtapa === opp.etapa) return
    if (nuevaEtapa === 'adjudicada') {
      setValorAdjudicado(String(opp.valor_cotizado || ''))
      setFechaAdjudicacion(new Date().toISOString().split('T')[0])
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
        fecha_adjudicacion: fechaAdjudicacion,
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

  // NOTE: "Duplicar en esta oportunidad" was removed — it collided with RECOTIZAR
  // (both appended suffix A). Use RECOTIZAR instead for a new version of the same
  // cotización on this opportunity.

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
    const nuevoNumero = getDefaultNumero()  // fresh consecutive, not letter version — it's a new opp
    const newCotId = crypto.randomUUID()
    // Feedback JP 2026-04-19: duplicar debe copiar TAMBIÉN los productos_oportunidad
    // con su APU + configuración + imágenes. Antes solo copiaba el snapshot (lectura).
    const srcProductos = state.productos.filter(p => p.oportunidad_id === cot.oportunidad_id)
    for (const p of srcProductos) {
      dispatch({
        type: 'ADD_PRODUCTO',
        payload: {
          oportunidad_id: dupSelectedOppId,
          categoria: p.categoria,
          subtipo: p.subtipo,
          configuracion: p.configuracion,
          apu_resultado: p.apu_resultado,
          precio_calculado: p.precio_calculado,
          descripcion_comercial: p.descripcion_comercial,
          cantidad: p.cantidad,
          imagen_render: p.imagen_render,
        } as Omit<typeof p, 'id'>,
      })
    }
    dispatch({
      type: 'ADD_COTIZACION',
      payload: {
        id: newCotId,
        oportunidad_id: dupSelectedOppId,
        numero: nuevoNumero,
        fecha: todayLocalISO(),
        total: cot.total,
        estado: 'borrador' as const,
        productos_snapshot: cot.productos_snapshot,
        condicionesItems: cot.condicionesItems,
        noIncluyeItems: cot.noIncluyeItems,
      } as any,
    })
    const targetOpp = state.oportunidades.find(o => o.id === dupSelectedOppId)
    if (targetOpp?.etapa === 'nuevo_lead') {
      dispatch({ type: 'MOVE_ETAPA', payload: { oportunidadId: dupSelectedOppId, nuevaEtapa: 'en_cotizacion' } })
    }
    setDupCotId(null)
    showToast('success', `Cotizacion ${nuevoNumero} duplicada en otra oportunidad (${srcProductos.length} productos)`)
    setTimeout(() => navigate(`/oportunidades/${dupSelectedOppId}`), 100)
  }

  /** Duplicar cotización como NUEVA oportunidad (misma o distinta empresa). */
  function handleDupAsNewOportunidad() {
    if (!dupCotId || !dupSelectedEmpId) return
    const cot = state.cotizaciones.find(c => c.id === dupCotId)
    if (!cot) return
    const nuevoNumero = getDefaultNumero()
    const newOppId = crypto.randomUUID()
    const newCotId = crypto.randomUUID()
    // 1) Create new oportunidad in nuevo_lead
    dispatch({
      type: 'ADD_OPORTUNIDAD',
      payload: {
        id: newOppId,
        empresa_id: dupSelectedEmpId,
        contacto_id: null as any,
        etapa: 'nuevo_lead',
        valor_estimado: cot.total,
        valor_cotizado: cot.total,
        valor_adjudicado: 0,
        cotizador_asignado: opp.cotizador_asignado,
        fuente_lead: 'Duplicada',
        motivo_perdida: '',
        ubicacion: opp.ubicacion || '',
        fecha_ingreso: todayLocalISO(),
        fecha_ultimo_contacto: todayLocalISO(),
        notas: `COT: ${nuevoNumero} | Duplicada de ${cot.numero}`,
      } as any,
    })
    // 2) Copy productos_oportunidad (not just the snapshot — the real products with APU)
    const srcProductos = state.productos.filter(p => p.oportunidad_id === cot.oportunidad_id)
    for (const p of srcProductos) {
      dispatch({
        type: 'ADD_PRODUCTO',
        payload: {
          oportunidad_id: newOppId,
          categoria: p.categoria,
          subtipo: p.subtipo,
          configuracion: p.configuracion,
          apu_resultado: p.apu_resultado,
          precio_calculado: p.precio_calculado,
          descripcion_comercial: p.descripcion_comercial,
          cantidad: p.cantidad,
          imagen_render: p.imagen_render,
        } as Omit<typeof p, 'id'>,
      })
    }
    // 3) Create cotización copy on new oportunidad
    dispatch({
      type: 'ADD_COTIZACION',
      payload: {
        id: newCotId,
        oportunidad_id: newOppId,
        numero: nuevoNumero,
        fecha: todayLocalISO(),
        total: cot.total,
        estado: 'borrador' as const,
        productos_snapshot: cot.productos_snapshot,
        condicionesItems: cot.condicionesItems,
        noIncluyeItems: cot.noIncluyeItems,
      } as any,
    })
    setDupCotId(null)
    showToast('success', `Nueva oportunidad con cotización ${nuevoNumero} creada`)
    setTimeout(() => navigate(`/oportunidades/${newOppId}`), 100)
  }

  function handleDescargarPdf(cotId: string) {
    const cot = cotizaciones.find(c => c.id === cotId)
    if (!cot || !contacto) return
    try {
      const { blob, filename } = generarPdfCotizacion({
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

      // Trigger download immediately
      downloadBlob(blob, filename)

      // Fire-and-forget: upload PDF to Supabase Storage and persist URL
      const file = new File([blob], filename, { type: 'application/pdf' })
      uploadCotizacionFile(opp.id, cot.id, file, 'pdf').then(res => {
        if ('error' in res) {
          console.warn('[PDF upload] Error:', res.error)
          return
        }
        dispatch({
          type: 'UPDATE_COTIZACION',
          payload: {
            id: cot.id,
            archivo_pdf_url: res.url,
            archivo_pdf_nombre: res.nombre,
          },
        })
        svcCotizaciones.updateCotizacion({
          id: cot.id,
          archivo_pdf_url: res.url,
          archivo_pdf_nombre: res.nombre,
        } as any)
      })

      // D-03: Auto-generate and upload APU (one workbook, sheet per product)
      const apuItems = productos
        .filter(p => !!p.apu_resultado)
        .map(p => ({
          resultado: p.apu_resultado!,
          config: p.configuracion || CONFIG_MESA_DEFAULT,
          productoNombre: p.descripcion_comercial || p.subtipo,
        }))

      if (apuItems.length > 0) {
        const { blob: apuBlob, filename: apuFilename } = exportApuConsolidado({
          products: apuItems,
          cotizacionNumero: cot.numero,
          empresaNombre: emp.nombre,
          contactoNombre: contacto?.nombre,
        })
        const apuFile = new File([apuBlob], apuFilename, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        uploadCotizacionFile(opp.id, cot.id, apuFile, 'apu').then(res => {
          if ('error' in res) {
            console.warn('[APU auto-upload] Error:', res.error)
            return
          }
          dispatch({
            type: 'UPDATE_COTIZACION',
            payload: {
              id: cot.id,
              archivo_apu_url: res.url,
              archivo_apu_nombre: res.nombre,
            },
          })
          svcCotizaciones.updateCotizacion({
            id: cot.id,
            archivo_apu_url: res.url,
            archivo_apu_nombre: res.nombre,
          } as any)
        })
      }
    } catch (err) {
      console.error('Error generando PDF:', err)
    }
  }

  // Extract spec badges from description
  // ══════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════

  // Compute margin for meta-grid
  const costoTotal = productos.reduce((s, p: any) => s + (p.total_costo || 0), 0)
  const margenPct = opp.valor_cotizado > 0 ? ((opp.valor_cotizado - costoTotal) / opp.valor_cotizado) * 100 : 0

  return (
    <div className="detail-page animate-fade-in">
      <div className="detail-main">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="btn-d ghost sm"
          style={{ marginBottom: 14, padding: '0 8px' }}
        >
          <ArrowLeft size={13} /> Volver
        </button>

        {/* Header */}
        <div className="opp-header">
          <div className="body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--color-text-label)' }}>
                {opp.id.slice(0, 8).toUpperCase()}
              </span>
              <EtapaBadge etapa={opp.etapa} size="sm" />
            </div>
            <div className="opp-title">{emp.nombre}</div>
            <div className="opp-company-line">
              {contacto ? (
                <><strong>{contacto.nombre}</strong>
                  {contacto.cargo && (<><span className="sep">·</span><span>{contacto.cargo}</span></>)}
                </>
              ) : (
                <button
                  onClick={() => { setShowAssignContacto(true); document.getElementById('contacto-card')?.scrollIntoView({ behavior: 'smooth' }) }}
                  style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontSize: 12.5, minHeight: 0 }}
                >Agregar contacto</button>
              )}
              <span className="sep">·</span>
              <span>Fuente: {opp.fuente_lead}</span>
              <span className="sep">·</span>
              <span>Ingreso: {formatDate(opp.fecha_ingreso)}</span>
              <span className="sep">·</span>
              <span>Cotizador: {cotizador?.nombre || opp.cotizador_asignado}</span>
            </div>
          </div>

          <div className="opp-header-actions">
            <button
              onClick={() => document.getElementById('nota-input')?.focus()}
              className="btn-d sm"
            ><StickyNote size={12} /> Nota</button>

            <button
              onClick={() => setShowProductModal(true)}
              className="btn-d sm"
            ><Package size={12} /> Producto</button>

            {productos.length > 0 && (
              <button
                onClick={() => {
                  const draft = cotizaciones
                    .filter(c => c.oportunidad_id === opp.id && c.estado === 'borrador')
                    .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))[0]
                  if (draft) navigate(`/cotizaciones/${draft.id}/editar`)
                  else setShowCotModal(true)
                }}
                className="btn-d sm"
                style={{ background: 'var(--color-accent-green)', color: '#fff', borderColor: 'var(--color-accent-green)' }}
              ><FileText size={12} /> Cotización</button>
            )}

            <div className="relative">
              <button
                onClick={() => setShowEtapaDropdown(!showEtapaDropdown)}
                className="btn-d accent sm"
              >Mover etapa <ChevronDown size={12} /></button>
              {showEtapaDropdown && (
                <div className="absolute right-0 mt-1 z-20 py-1 overflow-hidden" style={{ width: 220, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-pop)' }}>
                  {ETAPAS.map(e => (
                    <button
                      key={e.key}
                      onClick={() => handleMoveEtapa(e.key)}
                      disabled={e.key === opp.etapa}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left"
                      style={{
                        background: e.key === opp.etapa ? 'var(--color-surface-2)' : 'transparent',
                        color: e.key === opp.etapa ? 'var(--color-text-label)' : 'var(--color-text)',
                        cursor: e.key === opp.etapa ? 'not-allowed' : 'pointer',
                        minHeight: 0,
                      }}
                      onMouseEnter={(ev) => { if (e.key !== opp.etapa) ev.currentTarget.style.background = 'var(--color-surface-2)' }}
                      onMouseLeave={(ev) => { if (e.key !== opp.etapa) ev.currentTarget.style.background = 'transparent' }}
                    >
                      <span className="stage-dot" style={{ background: e.color }} />
                      <span style={{ fontWeight: 500 }}>{e.label}</span>
                      {e.key === opp.etapa && <span className="mono" style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--color-text-faint)' }}>actual</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (window.confirm('¿Seguro que deseas eliminar esta oportunidad? Se eliminarán también sus productos y cotizaciones.')) {
                  dispatch({ type: 'DELETE_OPORTUNIDAD', payload: { id: opp.id } })
                  navigate('/pipeline')
                }
              }}
              className="btn-d ghost icon sm"
              style={{ color: 'var(--color-accent-red)' }}
              title="Eliminar oportunidad"
            ><Trash2 size={12} /></button>
          </div>
        </div>

        {/* Motivo pérdida banner */}
        {opp.etapa === 'perdida' && (
          <div className="alert-banner" style={{ borderLeftColor: 'var(--color-accent-red)' }}>
            <AlertCircle size={14} style={{ color: 'var(--color-accent-red)', flexShrink: 0 }} />
            <div>
              <div className="t">Oportunidad perdida</div>
              <div className="d">Motivo: {opp.motivo_perdida || 'No registrado'}</div>
            </div>
          </div>
        )}

        {/* Meta grid */}
        <div className="meta-grid">
          <div className="meta-cell">
            <div className="l">Valor cotizado</div>
            <div className="v mono">{opp.valor_cotizado > 0 ? formatCOP(opp.valor_cotizado, { short: true }) : '—'}</div>
          </div>
          <div className="meta-cell">
            <div className="l">Costo</div>
            <div className="v mono">{costoTotal > 0 ? formatCOP(costoTotal, { short: true }) : '—'}</div>
          </div>
          <div className="meta-cell">
            <div className="l">Margen</div>
            <div className="v mono">{isFinite(margenPct) && opp.valor_cotizado > 0 ? `${margenPct.toFixed(1)}%` : '—'}</div>
          </div>
          <div className="meta-cell">
            <div className="l">Días pipeline</div>
            <div className="v mono">{diasEnPipeline}d</div>
          </div>
        </div>

      {/* Tabs + content (directly inside detail-main; aside is sibling outside) */}

          {/* ═══ TABS ═══ */}
          <div className="tabs">
            <button className={`tab ${tab === 'actividad' ? 'active' : ''}`} onClick={() => setTab('actividad')}>
              Actividad<span className="n">{timelineEvents.length}</span>
            </button>
            <button className={`tab ${tab === 'productos' ? 'active' : ''}`} onClick={() => setTab('productos')}>
              Productos<span className="n">{productos.length}</span>
            </button>
            <button className={`tab ${tab === 'cotizaciones' ? 'active' : ''}`} onClick={() => setTab('cotizaciones')}>
              Cotizaciones<span className="n">{cotizaciones.filter(c => c.oportunidad_id === opp.id).length}</span>
            </button>
            <button className={`tab ${tab === 'adjuntos' ? 'active' : ''}`} onClick={() => setTab('adjuntos')}>
              Adjuntos<span className="n">{archivos.length}</span>
            </button>
          </div>

          {tab === 'actividad' && (<>
            {/* Quick note input (handoff: .note-bar con avatar + input + botones) */}
            <div className="note-bar">
              <span className="avatar sm" style={{ background: cotizador ? getAvatarColor(cotizador.nombre) : 'var(--color-surface-3)', color: cotizador ? '#fff' : 'var(--color-text)', border: 'none' }}>
                {cotizador?.iniciales || '—'}
              </span>
              <input
                id="nota-input"
                value={notaTexto}
                onChange={e => setNotaTexto(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddNota() } }}
                placeholder="Añadir una nota, mención o actualización…"
              />
              <button
                onClick={handleAddNota}
                disabled={!notaTexto.trim()}
                className="btn-d primary sm"
              >
                <Send size={12} /> Publicar
              </button>
            </div>

            {/* Timeline (handoff: .timeline + .tl-item) */}
            {timelineEvents.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', fontSize: 13, color: 'var(--color-text-label)' }}>
                Sin actividad registrada. Agregá la primera nota arriba.
              </div>
            ) : (
              <div className="timeline" style={{ maxHeight: 640, overflowY: 'auto' }}>
                {timelineEvents.map((ev) => {
                  const accentClass = ev.type === 'cotizacion' ? 'adj' : ev.type === 'producto' || ev.type === 'nota' ? 'accent' : ''
                  const isCotTitle = ev.type === 'nota' && ev.title.startsWith('COT:')
                  const isEditingThis = ev.type === 'nota' && editingNotaIdx !== null && ev.id === `nota-${editingNotaIdx}`
                  const notaIdx = ev.type === 'nota' ? Number(ev.id.replace('nota-', '')) : -1

                  return (
                    <div key={ev.id} className={`tl-item ${accentClass}`}>
                      <div className="hd">
                        {isEditingThis ? (
                          <div style={{ flex: 1, display: 'flex', gap: 6 }}>
                            <input
                              value={editingNotaText}
                              onChange={e => setEditingNotaText(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') handleSaveEditNota(); if (e.key === 'Escape') setEditingNotaIdx(null) }}
                              autoFocus
                              style={{ flex: 1, fontSize: 12.5, padding: '4px 8px', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)' }}
                            />
                            <button onClick={handleSaveEditNota} className="btn-d sm primary">OK</button>
                            <button onClick={() => setEditingNotaIdx(null)} className="btn-d sm ghost">✕</button>
                          </div>
                        ) : (
                          <>
                            <span className="t" style={{ fontWeight: isCotTitle ? 600 : 500 }}>{ev.title}</span>
                            {ev.detail && (
                              <span className="mono" style={{ fontSize: 11, color: ev.color, fontWeight: 500 }}>{ev.detail}</span>
                            )}
                            {ev.timestamp && (
                              <span className="time">{ev.type === 'cotizacion' ? formatDate(ev.timestamp) : ev.timestamp}</span>
                            )}
                            {ev.type === 'nota' && !isEditingThis && (
                              <span style={{ display: 'inline-flex', gap: 2, marginLeft: 4 }}>
                                <button
                                  onClick={() => handleEditNota(notaIdx)}
                                  className="btn-d ghost icon sm"
                                  title="Editar nota"
                                ><Edit3 size={11} /></button>
                                <button
                                  onClick={() => handleDeleteNota(notaIdx)}
                                  className="btn-d ghost icon sm"
                                  style={{ color: 'var(--color-accent-red)' }}
                                  title="Eliminar nota"
                                ><X size={11} /></button>
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>)}

          {tab === 'productos' && (<>
            <div className="tab-section-head">
              <h3>Productos configurados</h3>
              <span className="count">{productos.length}</span>
              <div className="spacer" />
              <button onClick={() => setShowProductModal(true)} className="btn-d sm">
                <Plus size={12} /> Agregar producto
              </button>
            </div>

            {productos.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)' }}>
                <Package size={28} style={{ color: 'var(--color-text-faint)', margin: '0 auto 8px' }} />
                <p style={{ fontSize: 12.5, color: 'var(--color-text-label)', marginBottom: 12 }}>Sin productos configurados.</p>
                <button
                  onClick={() => setShowProductModal(true)}
                  className="btn-d primary sm"
                >
                  <Wrench size={12} /> Configurar primer producto
                </button>
              </div>
            ) : (
              <div>
                {productos.map(p => {
                  const descShort = p.descripcion_comercial
                    ? (p.descripcion_comercial.length > 140 ? p.descripcion_comercial.slice(0, 140) + '…' : p.descripcion_comercial)
                    : ''
                  const unitPrice = p.precio_calculado || 0
                  const qty = p.cantidad || 1
                  const total = unitPrice * qty

                  return (
                    <div key={p.id}>
                      <div className="product-card">
                        {/* Thumb */}
                        <div className="product-thumb">
                          {p.imagen_render ? (
                            <img src={p.imagen_render} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          ) : (
                            p.subtipo?.slice(0, 8) || 'render'
                          )}
                        </div>
                        {/* Info */}
                        <div style={{ minWidth: 0 }}>
                          <div className="name">{p.subtipo || '—'}</div>
                          <div className="spec">{p.categoria || '—'}</div>
                          {descShort && <div className="desc">{descShort}</div>}
                        </div>
                        {/* Price + actions */}
                        <div className="price">
                          <div className="p">{formatCOP(total, { short: true })}</div>
                          <div className="q">{qty} × {formatCOP(unitPrice, { short: true })}</div>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', marginTop: 8 }}>
                            <button
                              onClick={() => {
                                const pid = p.configuracion?.producto_id
                                if (!pid || pid === 'mesa') navigate(`/oportunidades/${id}/configurar?editar=${p.id}`)
                                else navigate(`/oportunidades/${id}/configurar-producto/${pid}?editar=${p.id}`)
                              }}
                              className="btn-d ghost icon sm"
                              title="Editar configuración"
                            ><Edit3 size={12} /></button>
                            <button
                              onClick={() => handleDuplicarProducto(p.id)}
                              className="btn-d ghost icon sm"
                              title="Duplicar"
                            ><Copy size={12} /></button>
                            <button
                              onClick={() => setAttachingProduct(attachingProduct === p.id ? null : p.id)}
                              className="btn-d ghost icon sm"
                              style={{ color: attachingProduct === p.id ? 'var(--color-primary)' : undefined }}
                              title="Adjuntar archivo"
                            ><Paperclip size={12} /></button>
                            {p.apu_resultado && (
                              <button
                                onClick={() => {
                                  const cot = cotizaciones.length > 0 ? cotizaciones[cotizaciones.length - 1] : null
                                  const { blob: apuBlob, filename: apuFilename } = exportApuExcel({
                                    resultado: p.apu_resultado!,
                                    config: p.configuracion || CONFIG_MESA_DEFAULT,
                                    cotizacionNumero: cot?.numero,
                                    empresaNombre: emp.nombre,
                                    contactoNombre: contacto?.nombre,
                                  })
                                  downloadBlob(apuBlob, apuFilename)
                                  if (cot) {
                                    const apuFile = new File([apuBlob], apuFilename, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
                                    uploadCotizacionFile(opp.id, cot.id, apuFile, 'apu').then(res => {
                                      if ('error' in res) { console.warn('[APU upload] Error:', res.error); return }
                                      dispatch({ type: 'UPDATE_COTIZACION', payload: { id: cot.id, archivo_apu_url: res.url, archivo_apu_nombre: res.nombre } })
                                      svcCotizaciones.updateCotizacion({ id: cot.id, archivo_apu_url: res.url, archivo_apu_nombre: res.nombre } as any)
                                    })
                                  }
                                }}
                                className="btn-d ghost icon sm"
                                style={{ color: 'var(--color-accent-green)' }}
                                title="Descargar APU Excel"
                              ><FileSpreadsheet size={12} /></button>
                            )}
                            <button
                              onClick={() => { if (window.confirm('¿Eliminar este producto?')) dispatch({ type: 'DELETE_PRODUCTO', payload: { id: p.id } }) }}
                              className="btn-d ghost icon sm"
                              style={{ color: 'var(--color-accent-red)' }}
                              title="Eliminar"
                            ><Trash2 size={12} /></button>
                          </div>
                        </div>
                      </div>

                      {/* Adjuntos del producto (APU/PDF) como chips .att */}
                      {(p.archivo_apu_nombre || p.archivo_pdf_nombre) && (
                        <div style={{ marginLeft: 16, marginTop: 6, marginBottom: 6 }}>
                          {p.archivo_apu_nombre && (
                            <div className="att" onClick={async () => {
                              if (!p.archivo_apu_url) return
                              const url = await getSignedUrl(p.archivo_apu_url)
                              if (url) window.open(url, '_blank')
                            }}>
                              <span className="ext xlsx">XLSX</span>
                              <span className="name">{p.archivo_apu_nombre}</span>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  if (!window.confirm(`¿Eliminar "${p.archivo_apu_nombre}"?`)) return
                                  if (p.archivo_apu_url) await deleteProductFile(p.archivo_apu_url).catch(() => {})
                                  await svcOportunidades.updateProducto({ id: p.id, archivo_apu_url: null, archivo_apu_nombre: null } as any)
                                  dispatch({ type: 'UPDATE_PRODUCTO', payload: { id: p.id, archivo_apu_url: null, archivo_apu_nombre: null } as any })
                                  showToast('success', 'APU eliminado')
                                }}
                                className="btn-d ghost icon sm"
                                style={{ color: 'var(--color-accent-red)' }}
                                title="Eliminar APU"
                              ><X size={11} /></button>
                            </div>
                          )}
                          {p.archivo_pdf_nombre && (
                            <div className="att" onClick={async () => {
                              if (!p.archivo_pdf_url) return
                              const url = await getSignedUrl(p.archivo_pdf_url)
                              if (url) window.open(url, '_blank')
                            }}>
                              <span className="ext pdf">PDF</span>
                              <span className="name">{p.archivo_pdf_nombre}</span>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  if (!window.confirm(`¿Eliminar "${p.archivo_pdf_nombre}"?`)) return
                                  if (p.archivo_pdf_url) await deleteProductFile(p.archivo_pdf_url).catch(() => {})
                                  await svcOportunidades.updateProducto({ id: p.id, archivo_pdf_url: null, archivo_pdf_nombre: null } as any)
                                  dispatch({ type: 'UPDATE_PRODUCTO', payload: { id: p.id, archivo_pdf_url: null, archivo_pdf_nombre: null } as any })
                                  showToast('success', 'PDF eliminado')
                                }}
                                className="btn-d ghost icon sm"
                                style={{ color: 'var(--color-accent-red)' }}
                                title="Eliminar PDF"
                              ><X size={11} /></button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Inline attach area */}
                      {attachingProduct === p.id && (
                        <div style={{ marginLeft: 16, marginTop: 6, marginBottom: 12, padding: 10, border: '1px dashed var(--color-primary-line)', borderRadius: 'var(--radius-md)', background: 'var(--color-primary-weak)' }}>
                          <div className="mono" style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--color-primary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Adjuntar archivos</div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <input ref={attachApuRef} type="file" accept={acceptString('apu')} style={{ display: 'none' }} onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file || !opp) return
                              setUploading(true)
                              const res = await uploadProductFile(opp.id, p.id, file, 'apu')
                              if ('error' in res) { alert(res.error); setUploading(false); return }
                              await svcOportunidades.updateProducto({ id: p.id, archivo_apu_url: res.url, archivo_apu_nombre: res.nombre } as any)
                              dispatch({ type: 'UPDATE_PRODUCTO', payload: { id: p.id, archivo_apu_url: res.url, archivo_apu_nombre: res.nombre } as any })
                              setUploading(false); setAttachingProduct(null)
                            }} />
                            <button onClick={() => attachApuRef.current?.click()} disabled={uploading} className="btn-d sm">
                              <FileSpreadsheet size={12} /> {p.archivo_apu_nombre ? 'Reemplazar APU' : 'Subir APU (.xlsx)'}
                            </button>
                            <input ref={attachPdfRef} type="file" accept={acceptString('pdf')} style={{ display: 'none' }} onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file || !opp) return
                              setUploading(true)
                              const res = await uploadProductFile(opp.id, p.id, file, 'pdf')
                              if ('error' in res) { alert(res.error); setUploading(false); return }
                              await svcOportunidades.updateProducto({ id: p.id, archivo_pdf_url: res.url, archivo_pdf_nombre: res.nombre } as any)
                              dispatch({ type: 'UPDATE_PRODUCTO', payload: { id: p.id, archivo_pdf_url: res.url, archivo_pdf_nombre: res.nombre } as any })
                              setUploading(false); setAttachingProduct(null)
                            }} />
                            <button onClick={() => attachPdfRef.current?.click()} disabled={uploading} className="btn-d sm">
                              <FileIcon size={12} /> {p.archivo_pdf_nombre ? 'Reemplazar PDF' : 'Subir PDF (.pdf)'}
                            </button>
                          </div>
                          {uploading && <p className="mono" style={{ fontSize: 11, color: 'var(--color-primary)', marginTop: 6 }}>Subiendo…</p>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>)}

          {tab === 'adjuntos' && (<>
          <div className="tab-section-head">
            <h3>Adjuntos de la oportunidad</h3>
            <span className="count">{archivos.length}</span>
            <div className="spacer" />
            <label className={`btn-d sm ${uploadingFile ? '' : 'primary'}`} style={{ cursor: uploadingFile ? 'wait' : 'pointer' }}>
              <Paperclip size={12} /> {uploadingFile ? 'Subiendo…' : 'Subir archivo'}
              <input type="file" className="hidden" accept=".pdf,.xlsx,.xlsm,.xls,.png,.jpg,.jpeg,.doc,.docx" disabled={uploadingFile} onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadFile(f); e.target.value = '' }} />
            </label>
          </div>

          {archivos.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', fontSize: 12.5, color: 'var(--color-text-label)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              Sin archivos adjuntos
            </div>
          ) : (
            <div>
              {archivos.map(f => {
                const ext = (f.name.split('.').pop() || '').toLowerCase()
                const sizeStr = f.size > 1048576 ? `${(f.size / 1048576).toFixed(1)} MB` : f.size > 0 ? `${Math.round(f.size / 1024)} KB` : ''
                return (
                  <div key={f.path} className="att" onClick={() => handleDownloadFile(f.path, f.name)}>
                    <span className={`ext ${ext}`}>{ext || 'FILE'}</span>
                    <span className="name" title={f.name}>{f.name}</span>
                    <span className="size">{sizeStr}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownloadFile(f.path, f.name) }}
                      className="btn-d ghost icon sm"
                      title="Descargar"
                    ><Download size={12} /></button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteFile(f.path, f.name) }}
                      className="btn-d ghost icon sm"
                      style={{ color: 'var(--color-accent-red)' }}
                      title="Eliminar"
                    ><Trash2 size={12} /></button>
                  </div>
                )
              })}
            </div>
          )}

          </>)}

          {tab === 'cotizaciones' && (<>
            {(() => {
              const oppCots = cotizaciones.filter(c => c.oportunidad_id === opp.id)
              const activeCots = oppCots.filter(c => c.estado !== 'descartada')
              const discardedCots = oppCots.filter(c => c.estado === 'descartada')
              const recotizableBtn = [...oppCots]
                .filter(c => c.estado === 'borrador' || c.estado === 'enviada')
                .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))[0]

              function handleRecotizar(cotId: string) {
                const cot = oppCots.find(c => c.id === cotId)
                if (!cot) return
                const base = cot.numero.replace(/[A-Z]$/, '')
                const currentLetter = cot.numero.match(/([A-Z])$/)?.[1]
                const nextLetter = currentLetter ? String.fromCharCode(currentLetter.charCodeAt(0) + 1) : 'A'
                const nuevoNumero = base + nextLetter
                const newCotId = crypto.randomUUID()
                dispatch({ type: 'RECOTIZAR', payload: { cotizacionId: cotId, nuevoNumero, newCotId } })
                showToast('success', `Recotización ${nuevoNumero} creada. La ${cot.numero} fue descartada.`)
              }

              function renderQuoteRow(c: typeof oppCots[0], isDiscarded: boolean) {
                // Si la cot no tiene snapshot aún (ej. borrador reci\u00e9n creado por RECOTIZAR
                // que hereda los productos de la oportunidad), mostrar conteo/total derivados
                // de productos_oportunidad — evita que aparezca "0 productos · $0".
                const hasSnapshot = (c.productos_snapshot?.length ?? 0) > 0
                const prodCount = hasSnapshot
                  ? c.productos_snapshot!.length
                  : (c.estado === 'borrador' ? productos.length : 0)
                const displayTotal = hasSnapshot || c.estado !== 'borrador' || c.total > 0
                  ? c.total
                  : productos.reduce((s, p) => s + (p.precio_calculado || 0) * (p.cantidad || 1), 0)
                const filesCount = (c.archivo_apu_nombre ? 1 : 0) + (c.archivo_pdf_nombre ? 1 : 0)
                return (
                  <div key={c.id}>
                    <div className="quote-row" style={{ opacity: isDiscarded ? 0.55 : 1 }}>
                      <span className="num" style={{ textDecoration: isDiscarded ? 'line-through' : 'none' }}>#{c.numero}</span>
                      <div className="meta">
                        <span className="title">{prodCount} producto{prodCount !== 1 ? 's' : ''} · Cotización {c.estado}</span>
                        {formatDate(c.fecha)} · <span className={`state-pill ${c.estado}`} style={{ marginLeft: 2 }}>{c.estado}</span>{filesCount > 0 && ` · ${filesCount} archivo${filesCount !== 1 ? 's' : ''}`}
                      </div>
                      <div className="total">{formatCOP(displayTotal, { short: true })}</div>
                      <div className="actions">
                        {!isDiscarded && (c.estado === 'enviada' || c.estado === 'borrador') && (
                          <button onClick={() => handleRecotizar(c.id)} className="btn-d ghost icon sm" style={{ color: 'var(--color-accent-yellow)' }} title="Recotizar"><ArrowRightLeft size={12} /></button>
                        )}
                        <button onClick={() => navigate(`/cotizaciones/${c.id}/editar`)} className="btn-d sm" title="Abrir editor"><Edit3 size={11} /> Abrir</button>
                        <button onClick={() => handleDescargarPdf(c.id)} className="btn-d ghost icon sm" title="Descargar PDF"><Download size={12} /></button>
                        {isDiscarded && opp.etapa !== 'adjudicada' && opp.etapa !== 'perdida' && (
                          <button
                            onClick={() => {
                              const activeCount = oppCots.filter(ct => ct.estado === 'borrador' || ct.estado === 'enviada').length
                              const msg = activeCount > 0
                                ? `¿Reactivar ${c.numero}?\n\nLa cotización activa actual pasará a "descartada".`
                                : `¿Reactivar ${c.numero}?`
                              if (!window.confirm(msg)) return
                              dispatch({ type: 'REACTIVAR_COTIZACION', payload: { cotizacionDescartadaId: c.id } })
                              showToast('success', `${c.numero} reactivada`)
                            }}
                            className="btn-d ghost icon sm"
                            style={{ color: 'var(--color-accent-purple)' }}
                            title="Reactivar versión"
                          ><RotateCcw size={12} /></button>
                        )}
                        {!isDiscarded && (
                          <>
                            <button onClick={() => handleDuplicarCotizacion(c.id)} className="btn-d ghost icon sm" title="Duplicar"><Copy size={12} /></button>
                            <button
                              onClick={() => { if (window.confirm('¿Eliminar esta cotización?')) dispatch({ type: 'DELETE_COTIZACION', payload: { id: c.id } }) }}
                              className="btn-d ghost icon sm"
                              style={{ color: 'var(--color-accent-red)' }}
                              title="Eliminar"
                            ><Trash2 size={12} /></button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Adjuntos de cotización como .att chips */}
                    {(c.archivo_apu_nombre || c.archivo_pdf_nombre) && (
                      <div style={{ marginLeft: 16, marginTop: 6, marginBottom: 6 }}>
                        <CotAdjuntos cot={c} oportunidadId={opp.id} />
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <>
                  <div className="tab-section-head">
                    <h3>Cotizaciones</h3>
                    <span className="count">{oppCots.length}</span>
                    <div className="spacer" />
                    {recotizableBtn && (
                      <button
                        onClick={() => handleRecotizar(recotizableBtn.id)}
                        className="btn-d sm"
                        style={{ background: 'var(--color-accent-yellow)', color: '#fff', borderColor: 'var(--color-accent-yellow)' }}
                        title={`Crear nueva versión de ${recotizableBtn.numero}`}
                      ><ArrowRightLeft size={12} /> Recotizar</button>
                    )}
                  </div>

                  {oppCots.length === 0 ? (
                    <div style={{ padding: 32, textAlign: 'center', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                      <FileText size={28} style={{ color: 'var(--color-text-faint)', margin: '0 auto 8px' }} />
                      <p style={{ fontSize: 12.5, color: 'var(--color-text-label)', marginBottom: 4 }}>Sin cotizaciones.</p>
                      <p style={{ fontSize: 11, color: 'var(--color-text-label)', marginBottom: 12 }}>Agregá productos y generá una.</p>
                      {productos.length > 0 && (
                        <button
                          onClick={() => setShowCotModal(true)}
                          className="btn-d primary sm"
                        ><FileText size={12} /> Generar primera cotización</button>
                      )}
                    </div>
                  ) : (
                    <div>
                      {activeCots.map(c => renderQuoteRow(c, false))}
                      {discardedCots.length > 0 && (
                        <details style={{ marginTop: 12 }}>
                          <summary className="mono" style={{ cursor: 'pointer', fontSize: 11, color: 'var(--color-text-label)', padding: '8px 0', userSelect: 'none' }}>
                            Ver versiones anteriores ({discardedCots.length})
                          </summary>
                          <div style={{ marginTop: 8 }}>
                            {discardedCots.map(c => renderQuoteRow(c, true))}
                          </div>
                        </details>
                      )}
                    </div>
                  )}
                </>
              )
            })()}
          </>)}

        </div> {/* close .detail-main */}

        {/* ─── ASIDE (sibling of detail-main, fills 320px right column) ─── */}
        <aside className="detail-aside">
          {/* Value card */}
          <div className="aside-value">
            <div className="l">Valor cotizado</div>
            <div className="v mono">{formatCOP(opp.valor_cotizado)}</div>
            <div style={{ marginTop: 10 }}><EtapaBadge etapa={opp.etapa} size="sm" /></div>
            {opp.valor_adjudicado > 0 && (
              <div className="mono" style={{ marginTop: 8, fontSize: 12, color: 'var(--color-accent-green)' }}>
                Adjudicado: {formatCOP(opp.valor_adjudicado)}
              </div>
            )}
          </div>

          {/* Propiedades */}
          <div className="aside-h">Propiedades</div>
          <div className="prop-list">
            <div className="prop-row">
              <div className="k">Cotizador</div>
              <div className="v">
                <select
                  value={opp.cotizador_asignado}
                  onChange={e => {
                    dispatch({ type: 'UPDATE_OPORTUNIDAD', payload: { id: opp.id, cotizador_asignado: e.target.value } })
                    const c = findCotizador(e.target.value)
                    showToast('success', `Cotizador actualizado a ${c?.nombre || e.target.value}`)
                  }}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text)', fontWeight: 500, fontSize: 12.5, padding: 0, textAlign: 'right', minHeight: 0 }}
                >
                  {COTIZADORES.map(c => (
                    <option key={c.id} value={c.id}>{c.iniciales} — {c.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="prop-row">
              <div className="k">Días pipeline</div>
              <div className="v mono">{diasEnPipeline}d</div>
            </div>
            <div className="prop-row">
              <div className="k">Ingreso</div>
              <div className="v mono">{formatDate(opp.fecha_ingreso)}</div>
            </div>
            <div className="prop-row">
              <div className="k">Envío</div>
              <div className="v mono" style={{ color: opp.fecha_envio ? 'var(--color-text)' : 'var(--color-text-label)' }}>
                {opp.fecha_envio ? formatDate(opp.fecha_envio) : '—'}
              </div>
            </div>
            <div className="prop-row">
              <div className="k">Fuente</div>
              <div className="v">{opp.fuente_lead || '—'}</div>
            </div>
            <div className="prop-row">
              <div className="k">Sector</div>
              <div className="v">{emp.sector || '—'}</div>
            </div>
            <div className="prop-row">
              <div className="k">Ubicación</div>
              <div className="v" style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={opp.ubicacion || ''}>
                {opp.ubicacion || '—'}
              </div>
            </div>
          </div>

          {/* Empresa card */}
          <div className="aside-h">Empresa</div>
          <div className="aside-card">
            <button
              onClick={() => navigate(`/empresas/${emp.id}`)}
              style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-primary)', background: 'transparent', border: 'none', padding: 0, minHeight: 0, cursor: 'pointer' }}
            >{emp.nombre}</button>
            <div className="mono" style={{ fontSize: 11, color: 'var(--color-text-label)', marginTop: 2 }}>
              NIT: {emp.nit || '—'}{emp.sector ? ` · ${emp.sector}` : ''}
            </div>
            {emp.direccion && (
              <div style={{ fontSize: 11, color: 'var(--color-text-label)', marginTop: 2 }}>{emp.direccion}</div>
            )}
            {totalHistoricoEmpresa > 0 && (
              <>
                <div style={{ height: 1, background: 'var(--color-border)', margin: '10px 0' }} />
                <div style={{ fontSize: 11, color: 'var(--color-text-label)' }}>Histórico cotizado</div>
                <div className="mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginTop: 2 }}>
                  {formatCOP(totalHistoricoEmpresa)}
                </div>
              </>
            )}
            <button
              onClick={() => navigate(`/empresas/${emp.id}`)}
              style={{ display: 'block', marginTop: 10, fontSize: 11, color: 'var(--color-primary)', background: 'transparent', border: 'none', padding: 0, minHeight: 0, cursor: 'pointer' }}
            >Ver todas las oportunidades →</button>
          </div>

          {/* Contacto card */}
          <div className="aside-h">Contacto</div>
          <div id="contacto-card" className="aside-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <User size={14} className="text-[var(--color-primary)]" />
                <span className="text-[13px] font-bold text-[var(--color-text)]">Contacto</span>
              </div>
              {contacto && !editingContacto && (
                <button
                  onClick={() => {
                    setContactoForm({ nombre: contacto.nombre, cargo: contacto.cargo || '', correo: contacto.correo || '', whatsapp: contacto.whatsapp || '' })
                    setEditingContacto(true)
                  }}
                  className="p-1 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                  title="Editar contacto"
                >
                  <Edit3 size={12} />
                </button>
              )}
            </div>
            {contacto && !editingContacto ? (
              <div className="space-y-1.5">
                <div className="font-medium text-xs text-[var(--color-text)]">{contacto.nombre}</div>
                <div className="text-[10px] text-[var(--color-text-muted)]">{contacto.cargo || '—'}</div>
                {contacto.correo ? (
                  <a href={`mailto:${contacto.correo}`} className="flex items-center gap-1.5 text-[10px] text-[var(--color-primary)] hover:underline">
                    <Mail size={10} /> {contacto.correo}
                  </a>
                ) : !contacto.whatsapp ? null : (
                  <div className="text-[10px] text-[var(--color-text-muted)]">Sin correo</div>
                )}
                {contacto.whatsapp ? (
                  <a href={`tel:${contacto.whatsapp}`} className="flex items-center gap-1.5 text-[10px] text-[var(--color-primary)] hover:underline">
                    <Phone size={10} /> {contacto.whatsapp}
                  </a>
                ) : !contacto.correo ? null : (
                  <div className="text-[10px] text-[var(--color-text-muted)]">Sin teléfono</div>
                )}
                {(!contacto.correo || !contacto.whatsapp) && (
                  <div className="flex items-center gap-1 mt-1.5 text-[13px] text-amber-600">
                    <AlertCircle size={12} /> Datos incompletos
                  </div>
                )}
              </div>
            ) : contacto && editingContacto ? (
              <div className="space-y-2">
                <input value={contactoForm.nombre} onChange={e => setContactoForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre" className="w-full text-xs px-3 py-2 rounded-lg border border-[var(--color-border)]" />
                <input value={contactoForm.cargo} onChange={e => setContactoForm(p => ({ ...p, cargo: e.target.value }))} placeholder="Cargo" className="w-full text-xs px-3 py-2 rounded-lg border border-[var(--color-border)]" />
                <input value={contactoForm.correo} onChange={e => setContactoForm(p => ({ ...p, correo: e.target.value }))} placeholder="Email" type="email" className="w-full text-xs px-3 py-2 rounded-lg border border-[var(--color-border)]" />
                <input value={contactoForm.whatsapp} onChange={e => setContactoForm(p => ({ ...p, whatsapp: e.target.value }))} placeholder="Teléfono/WhatsApp" className="w-full text-xs px-3 py-2 rounded-lg border border-[var(--color-border)]" />
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={async () => {
                      const updated = { ...contacto, ...contactoForm }
                      dispatch({ type: 'UPDATE_CONTACTO', payload: updated })
                      await svcOportunidades.updateContacto(updated)
                      setEditingContacto(false)
                      showToast('success', 'Contacto actualizado')
                    }}
                    className="flex-1 text-xs font-semibold py-2 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 transition-all"
                  >Guardar</button>
                  <button onClick={() => setEditingContacto(false)} className="text-xs py-2 px-3 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]">Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <div className="flex items-center justify-center gap-1 text-[10px] text-amber-600 mb-2">
                  <AlertCircle size={12} /> Sin contacto asignado
                </div>
                {!showAssignContacto && !creatingContacto ? (
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setShowAssignContacto(true)}
                      className="text-[10px] text-[var(--color-primary)] hover:underline font-medium"
                    >Asignar existente</button>
                    <span className="text-[10px] text-[var(--color-text-muted)]">o</span>
                    <button
                      onClick={() => { setCreatingContacto(true); setNewContactoForm({ nombre: '', cargo: '', correo: '', whatsapp: '' }) }}
                      className="text-[10px] text-[var(--color-primary)] hover:underline font-medium"
                    >Crear nuevo</button>
                  </div>
                ) : creatingContacto ? (
                  <div className="space-y-2 text-left">
                    <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Nuevo contacto para {emp.nombre}</p>
                    <input value={newContactoForm.nombre} onChange={e => setNewContactoForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre *" className="w-full text-xs px-3 py-2 rounded-lg border border-[var(--color-border)]" autoFocus />
                    <input value={newContactoForm.cargo} onChange={e => setNewContactoForm(p => ({ ...p, cargo: e.target.value }))} placeholder="Cargo" className="w-full text-xs px-3 py-2 rounded-lg border border-[var(--color-border)]" />
                    <input value={newContactoForm.correo} onChange={e => setNewContactoForm(p => ({ ...p, correo: e.target.value }))} placeholder="Email" type="email" className="w-full text-xs px-3 py-2 rounded-lg border border-[var(--color-border)]" />
                    <input value={newContactoForm.whatsapp} onChange={e => setNewContactoForm(p => ({ ...p, whatsapp: e.target.value }))} placeholder="Telefono/WhatsApp" className="w-full text-xs px-3 py-2 rounded-lg border border-[var(--color-border)]" />
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleCreateContacto}
                        disabled={!newContactoForm.nombre.trim()}
                        className="flex-1 text-xs font-semibold py-2 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 transition-all disabled:opacity-40"
                      >Crear y asignar</button>
                      <button onClick={() => setCreatingContacto(false)} className="text-xs py-2 px-3 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-left">
                    {empContactos.length === 0 ? (
                      <p className="text-[10px] text-[var(--color-text-muted)]">No hay contactos para esta empresa</p>
                    ) : empContactos.map(c => (
                      <button key={c.id} onClick={() => handleAssignContacto(c.id)} className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors border border-[var(--color-border)]">
                        <div className="font-medium">{c.nombre}</div>
                        {c.cargo && <div className="text-[10px] text-[var(--color-text-muted)]">{c.cargo}</div>}
                      </button>
                    ))}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[var(--color-border)]">
                      <button
                        onClick={() => { setCreatingContacto(true); setShowAssignContacto(false); setNewContactoForm({ nombre: '', cargo: '', correo: '', whatsapp: '' }) }}
                        className="text-[10px] text-[var(--color-primary)] hover:underline font-medium"
                      >+ Crear nuevo contacto</button>
                      <span className="text-[10px] text-[var(--color-text-muted)]">|</span>
                      <button onClick={() => setShowAssignContacto(false)} className="text-[10px] text-[var(--color-text-muted)] hover:underline">Cancelar</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

      {/* ═══ MODALS ═══ */}

      {/* Product selection modal */}
      {showProductModal && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 animate-fade-in" onMouseDown={e => { if (e.target === e.currentTarget) setShowProductModal(false) }}>
          <div className="bg-white modal-card w-full max-w-2xl mx-4" onMouseDown={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-5 border-b border-[var(--color-border)]">
              <div>
                <h3 className="font-bold text-lg">Agregar producto</h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Selecciona el tipo de producto a configurar</p>
              </div>
              <button onClick={() => setShowProductModal(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
            <div className="grid grid-cols-3 gap-4 p-6">
              {(() => {
                // Build product list: Mesa (always, uses legacy configurator), catalog products, manual
                const PRODUCT_ICONS: Record<string, string> = {
                  mesa: '🍽️', mesas: '🍽️',
                  carcamo: '🔧',
                  estanteria_graduable: '📚', estanteria: '📚',
                  repisa: '📦',
                  ductos: '🔩',
                  barras_discapacitados: '♿',
                  pozuelo: '🚰', pozuelos: '🚰',
                  lavaescobas: '🧹',
                  caja_sifonada: '📥',
                  pasamanos: '🛡️',
                  autoservicios: '🍱',
                  muebles: '🪑',
                  manual: '✏️',
                }
                const getIcon = (id: string) => PRODUCT_ICONS[id.toLowerCase()] ?? '⚙️'
                const STATIC_PRODUCTS = [
                  { id: 'Pozuelos', name: 'Pozuelos', desc: 'Pozuelos y pocetas' },
                  { id: 'Pasamanos', name: 'Pasamanos', desc: 'Pasamanos y barandas' },
                  { id: 'Autoservicios', name: 'Autoservicios', desc: 'Líneas de servicio' },
                  { id: 'Muebles', name: 'Muebles', desc: 'Mobiliario general' },
                ]
                const catalogIds = new Set(catalogProducts.filter(p => p.activo).map(p => p.id))
                const items: { name: string; desc: string; icon: string; active: boolean; action?: () => void }[] = [
                  // Mesa always uses ConfiguradorMesa (has 3D)
                  { name: 'Mesas', desc: 'Configurar mesa inoxidable', icon: '🍽️', active: true, action: () => { setShowProductModal(false); navigate(`/oportunidades/${id}/configurar`) } },
                  // Other catalog products → ConfiguradorGenerico
                  ...STATIC_PRODUCTS.map(sp => {
                    const catId = sp.id.toLowerCase()
                    const isInCatalog = catalogIds.has(catId)
                    return {
                      name: sp.name, desc: sp.desc, icon: getIcon(sp.id),
                      active: isInCatalog,
                      action: isInCatalog ? () => { setShowProductModal(false); navigate(`/oportunidades/${id}/configurar-producto/${catId}`) } : undefined,
                    }
                  }),
                  // Dynamic catalog products not in the static list
                  ...catalogProducts.filter(p => p.activo && p.id !== 'mesa' && !STATIC_PRODUCTS.some(sp => sp.id.toLowerCase() === p.id))
                    .map(p => ({
                      name: p.nombre, desc: `Configurar ${p.nombre}`, icon: getIcon(p.id),
                      active: true,
                      action: () => { setShowProductModal(false); navigate(`/oportunidades/${id}/configurar-producto/${p.id}`) },
                    })),
                  // Manual product always available
                  { name: 'Producto Manual', desc: 'Cualquier producto — precio y descripción libre', icon: getIcon('manual'), active: true, action: () => { setShowProductModal(false); setShowManualForm(true) } },
                ]
                return items.map(item => (
                  <button
                    key={item.name}
                    onClick={item.action}
                    disabled={!item.active}
                    className={`text-left p-5 rounded-[var(--radius-lg)] border transition-all ${
                      item.active
                        ? 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-hover)] cursor-pointer'
                        : 'border-[var(--color-border)] bg-[var(--color-surface-2)] opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div className="font-semibold text-sm text-[var(--color-text)]">{item.name}</div>
                    <div className="text-[10px] text-[var(--color-text-muted)] mt-1">{item.desc}</div>
                    <div className="mt-2">
                      {item.active ? (
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">ACTIVO</span>
                      ) : (
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-label)]">🔒 PRÓXIMO</span>
                      )}
                    </div>
                  </button>
                ))
              })()}
            </div>
            </div>
          </div>
        </div>
      )}

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
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50" onClick={() => setShowAdjudicadaModal(false)}>
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] w-full max-w-sm mx-4" style={{ boxShadow: 'var(--shadow-modal)' }} onClick={e => e.stopPropagation()}>
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
              <div>
                <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Fecha de adjudicación</label>
                <input
                  type="date"
                  value={fechaAdjudicacion}
                  onChange={e => setFechaAdjudicacion(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--color-border)]"
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
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50" onClick={() => setShowPerdidaModal(false)}>
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] w-full max-w-sm mx-4" style={{ boxShadow: 'var(--shadow-modal)' }} onClick={e => e.stopPropagation()}>
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
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50" onClick={() => setShowManualForm(false)}>
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] overflow-y-auto" style={{ boxShadow: 'var(--shadow-modal)' }} onClick={e => e.stopPropagation()}>
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
                        <FileIcon size={14} className="text-red-500 shrink-0" />
                        <span className="text-xs text-red-800 truncate flex-1">{manualPdfFile.name}</span>
                        <button onClick={() => { setManualPdfFile(null); if (pdfInputRef.current) pdfInputRef.current.value = '' }} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                      </div>
                    ) : (
                      <button onClick={() => pdfInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/30 text-xs text-[var(--color-text-muted)] transition-all flex-1">
                        <FileIcon size={14} className="text-red-400" /> PDF Cotizacion (.pdf)
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
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] w-full max-w-md mx-4 overflow-hidden animate-scale-in" style={{ boxShadow: 'var(--shadow-modal)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
              <h3 className="font-bold text-base text-[var(--color-text)]">Duplicar para otro cliente</h3>
              <button onClick={() => setDupCotId(null)} className="p-1 rounded hover:bg-[var(--color-surface-hover)]"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-[var(--color-text-muted)]">
                Para crear una nueva versión en esta misma oportunidad usa <span className="font-semibold">Recotizar</span>.
              </p>
              <div className="border border-[var(--color-border)] rounded-xl p-4">
                <p className="font-semibold text-sm mb-3">Selecciona la oportunidad destino</p>
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
                      <button key={e.id} onClick={() => { setDupSelectedEmpId(e.id); setDupSearch(e.nombre) }} className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--color-surface-hover)] truncate">
                        {e.nombre}
                      </button>
                    ))}
                  </div>
                )}
                {dupSelectedEmpId && (
                  <div className="mt-3">
                    <p className="text-xs text-[var(--color-text-muted)] mb-1.5 font-medium">Elige destino:</p>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      <button
                        onClick={handleDupAsNewOportunidad}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all border border-dashed border-[var(--color-primary)] bg-blue-50/40 text-[var(--color-primary)] font-semibold hover:bg-blue-50"
                      >
                        + Crear nueva oportunidad con esta cotización
                      </button>
                      {state.oportunidades.filter(o => o.empresa_id === dupSelectedEmpId).map(o => (
                        <button
                          key={o.id}
                          onClick={() => setDupSelectedOppId(o.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${dupSelectedOppId === o.id ? 'bg-blue-50 border border-[var(--color-primary)] text-[var(--color-primary)]' : 'border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'}`}
                        >
                          {o.ubicacion || o.etapa} — {formatCOP(o.valor_cotizado)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {dupSelectedOppId && (
                  <button onClick={handleDupToOtherClient} className="mt-3 w-full py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-bold hover:opacity-90 transition-all">
                    Duplicar en oportunidad seleccionada
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

/* ── Adjuntos por cotización (M10) ─────────────────────────────── */
import type { Cotizacion } from '../types'

function CotAdjuntos({ cot, oportunidadId }: { cot: Cotizacion; oportunidadId: string }) {
  const { dispatch } = useStore()
  const [uploading, setUploading] = useState<'apu' | 'pdf' | null>(null)
  const apuRef = useRef<HTMLInputElement>(null)
  const pdfRef = useRef<HTMLInputElement>(null)

  async function handleUpload(file: File, kind: 'apu' | 'pdf') {
    setUploading(kind)
    const res = await uploadCotizacionFile(oportunidadId, cot.id, file, kind)
    if ('error' in res) {
      showToast('error', res.error)
    } else {
      const updates = kind === 'apu'
        ? { id: cot.id, archivo_apu_url: res.url, archivo_apu_nombre: res.nombre }
        : { id: cot.id, archivo_pdf_url: res.url, archivo_pdf_nombre: res.nombre }
      await svcCotizaciones.updateCotizacion(updates)
      dispatch({ type: 'UPDATE_COTIZACION', payload: updates })
      showToast('success', `${kind.toUpperCase()} adjuntado a ${cot.numero}`)
    }
    setUploading(null)
  }

  async function handleDownload(url: string, _name: string) {
    const signed = await getSignedUrl(url)
    if (signed) window.open(signed, '_blank')
    else showToast('error', 'No se pudo generar el enlace')
  }

  async function handleRemove(kind: 'apu' | 'pdf') {
    const url = kind === 'apu' ? cot.archivo_apu_url : cot.archivo_pdf_url
    const nombre = kind === 'apu' ? cot.archivo_apu_nombre : cot.archivo_pdf_nombre
    if (!window.confirm(`¿Eliminar adjunto "${nombre}" de ${cot.numero}?`)) return
    if (url) await deleteProductFile(url).catch(() => {})
    const updates = kind === 'apu'
      ? { id: cot.id, archivo_apu_url: null, archivo_apu_nombre: null }
      : { id: cot.id, archivo_pdf_url: null, archivo_pdf_nombre: null }
    await svcCotizaciones.updateCotizacion(updates)
    dispatch({ type: 'UPDATE_COTIZACION', payload: updates as any })
    showToast('success', `${kind.toUpperCase()} eliminado`)
  }

  return (
    <div className="mt-3 pt-3 border-t border-dashed border-[var(--color-border)] flex flex-wrap gap-2">
      {/* APU */}
      {cot.archivo_apu_nombre && cot.archivo_apu_url ? (
        <div className="inline-flex items-stretch rounded bg-green-50 border border-green-200 overflow-hidden">
          <button
            onClick={() => handleDownload(cot.archivo_apu_url!, cot.archivo_apu_nombre!)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-green-100 text-[10px] text-green-800"
          >
            <FileSpreadsheet size={12} /> {cot.archivo_apu_nombre} <Download size={10} />
          </button>
          <button
            onClick={() => handleRemove('apu')}
            className="px-1.5 border-l border-green-200 hover:bg-red-100 hover:text-red-600 text-green-700 text-[10px]"
            title="Eliminar APU"
          >
            <X size={10} />
          </button>
        </div>
      ) : (
        <>
          <input ref={apuRef} type="file" accept={acceptString('apu')} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, 'apu') }} />
          <button
            onClick={() => apuRef.current?.click()}
            disabled={uploading !== null}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-dashed border-green-300 bg-white hover:bg-green-50 text-[10px] text-green-700 disabled:opacity-50"
          >
            <FileSpreadsheet size={12} /> {uploading === 'apu' ? 'Subiendo…' : '+ APU Excel'}
          </button>
        </>
      )}
      {/* PDF */}
      {cot.archivo_pdf_nombre && cot.archivo_pdf_url ? (
        <div className="inline-flex items-stretch rounded bg-red-50 border border-red-200 overflow-hidden">
          <button
            onClick={() => handleDownload(cot.archivo_pdf_url!, cot.archivo_pdf_nombre!)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-red-100 text-[10px] text-red-700"
          >
            <FileIcon size={12} /> {cot.archivo_pdf_nombre} <Download size={10} />
          </button>
          <button
            onClick={() => handleRemove('pdf')}
            className="px-1.5 border-l border-red-200 hover:bg-red-100 hover:text-red-700 text-red-700 text-[10px]"
            title="Eliminar PDF"
          >
            <X size={10} />
          </button>
        </div>
      ) : (
        <>
          <input ref={pdfRef} type="file" accept={acceptString('pdf')} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, 'pdf') }} />
          <button
            onClick={() => pdfRef.current?.click()}
            disabled={uploading !== null}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-dashed border-red-300 bg-white hover:bg-red-50 text-[10px] text-red-600 disabled:opacity-50"
          >
            <FileIcon size={12} /> {uploading === 'pdf' ? 'Subiendo…' : '+ PDF'}
          </button>
        </>
      )}
    </div>
  )
}

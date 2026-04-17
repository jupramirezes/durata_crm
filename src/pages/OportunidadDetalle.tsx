import { useState, useMemo, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore, todayLocalISO } from '../lib/store'
import { ETAPAS, COTIZADORES, MOTIVOS_PERDIDA, findCotizador, CONFIG_MESA_DEFAULT, Etapa } from '../types'
import { formatDate, formatCOP, daysSince, downloadBlob } from '../lib/utils'
import { EtapaBadge, EstadoBadge } from '../components/ui'
import CotizacionModal from '../components/CotizacionModal'
import { generarPdfCotizacion } from '../lib/generar-pdf'
import { uploadProductFile, getSignedUrl, acceptString, uploadOppFile, listOppFiles, deleteProductFile, uploadCotizacionFile } from '../hooks/useStorage'
import * as svcCotizaciones from '../hooks/useCotizaciones'
import { showToast } from '../components/Toast'
import { exportApuExcel, exportApuConsolidado } from '../lib/exportar-apu'
import * as svcOportunidades from '../hooks/useOportunidades'
import {
  ArrowLeft, FileText, Package, Trash2, Building2, User, Edit3,
  StickyNote, Send, Wrench, X, ChevronDown, Copy, Download, Clock,
  ArrowRightLeft, MessageSquare, Box, Phone, Mail, AlertCircle,
  Paperclip, FileSpreadsheet, File as FileIcon, RotateCcw,
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
    showToast('success', `Cotizacion ${nuevoNumero} duplicada en otra oportunidad`)
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
    // 2) Create cotización copy on new oportunidad
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
    <div className="px-10 py-8 animate-fade-in max-w-[1400px]">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[13px] text-[#94a3b8] hover:text-[var(--color-text)] transition-colors mb-5">
        <ArrowLeft size={14} /> Volver
      </button>

      {/* ═══ CAMBIO 1: HEADER FUERTE ═══ */}
      <div className="card p-7 mb-7">
        <div className="flex items-start justify-between gap-4">
          {/* Left: company info */}
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Building2 size={22} className="text-[var(--color-primary)]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[32px] font-bold text-[var(--color-text)] truncate tracking-tight leading-tight mb-1">{emp.nombre}</h1>
              {contacto ? (
                <p className="text-base text-[#64748b] mt-1">
                  {contacto.nombre}{contacto.cargo && ` — ${contacto.cargo}`}
                </p>
              ) : (
                <button
                  onClick={() => { setShowAssignContacto(true); document.getElementById('contacto-card')?.scrollIntoView({ behavior: 'smooth' }) }}
                  className="text-[13px] text-[var(--color-primary)] hover:underline mt-1"
                >Agregar contacto</button>
              )}
              <p className="text-[13px] text-[#94a3b8] mt-1">
                Fuente: {opp.fuente_lead} &bull; Ingreso: {formatDate(opp.fecha_ingreso)} &bull; Cotizador: {cotizador?.nombre || opp.cotizador_asignado}
              </p>
            </div>
          </div>

          {/* Right: stage badge + days */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <EtapaBadge etapa={opp.etapa} size="md" />
              <div className="flex items-center gap-1 mt-2 justify-end">
                <Clock size={12} className="text-[#94a3b8]" />
                <span className="text-[13px] text-[#94a3b8] font-medium">{diasEnPipeline} dias en pipeline</span>
              </div>
            </div>
          </div>
        </div>

        {/* Motivo pérdida banner */}
        {opp.etapa === 'perdida' && (
          <div className="mt-4 rounded-lg p-3 bg-[#FEF2F2] border border-[#FECACA] flex items-center gap-2">
            <AlertCircle size={16} className="text-[#991B1B] shrink-0" />
            <span className="text-sm text-[#991B1B] font-medium">
              Oportunidad perdida — Motivo: {opp.motivo_perdida || 'No registrado'}
            </span>
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-2.5 mt-5 pt-5 border-t border-[#f1f5f9]">
          <button
            onClick={() => document.getElementById('nota-input')?.focus()}
            className="flex items-center gap-1.5 h-11 px-6 rounded-[10px] text-sm font-medium border border-[#e2e8f0] text-[#334155] hover:shadow-sm hover:opacity-90 transition-all"
          >
            <StickyNote size={14} /> + Nota
          </button>

          <button
            onClick={() => setShowProductModal(true)}
            className="flex items-center gap-1.5 h-11 px-6 rounded-[10px] text-sm font-medium border border-[#e2e8f0] text-[#334155] hover:shadow-sm hover:opacity-90 transition-all"
          >
            <Package size={14} /> + Producto
          </button>

          {productos.length > 0 && (
            <button
              onClick={() => {
                // If there's an existing draft for this opp (e.g. just-recotizada or previously started),
                // go to its editor instead of creating a new one — prevents duplicate cotizaciones.
                const draft = cotizaciones
                  .filter(c => c.oportunidad_id === opp.id && c.estado === 'borrador')
                  .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))[0]
                if (draft) {
                  navigate(`/cotizaciones/${draft.id}/editar`)
                } else {
                  setShowCotModal(true)
                }
              }}
              className="flex items-center gap-1.5 h-11 px-6 rounded-[10px] text-sm font-medium bg-[#059669] hover:opacity-90 text-white transition-all shadow-sm"
            >
              <FileText size={14} /> Generar cotizacion
            </button>
          )}

          {/* Move stage dropdown */}
          <div className="relative ml-auto">
            <button
              onClick={() => setShowEtapaDropdown(!showEtapaDropdown)}
              className="flex items-center gap-1.5 h-11 px-6 rounded-[10px] text-sm font-medium bg-[var(--color-primary)] hover:opacity-90 text-white transition-all shadow-sm"
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
      <div className="flex gap-8 items-start">
        {/* ─── LEFT COLUMN (70%) ─── */}
        <div className="flex-[7] min-w-0 space-y-7">

          {/* ═══ CAMBIO 3: TIMELINE UNIFICADO ═══ */}
          <div className="card p-7 mb-8">
            <div className="flex items-center gap-2.5 mb-2 pb-4 border-b border-[#e2e8f0]">
              <Clock size={18} className="text-[var(--color-primary)]" />
              <h3 className="font-bold text-xl text-[var(--color-text)]">Actividad</h3>
              {timelineEvents.length > 0 && (
                <span className="text-[10px] font-bold text-[var(--color-primary)] bg-blue-50 px-2 py-0.5 rounded">{timelineEvents.length}</span>
              )}
            </div>

            {/* Add note input */}
            <div className="relative mb-6 mt-5">
              <input
                id="nota-input"
                value={notaTexto}
                onChange={e => setNotaTexto(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddNota() } }}
                placeholder="Escribir una nota..."
                className="w-full h-[52px] px-5 pr-28 rounded-xl text-[15px] border border-[#e2e8f0] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] focus:outline-none transition-all placeholder:text-[#94a3b8]"
              />
              <button
                onClick={handleAddNota}
                disabled={!notaTexto.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--color-primary)] text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <Send size={13} /> Agregar
              </button>
            </div>

            {/* Timeline feed */}
            {timelineEvents.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)] text-center py-8">Sin actividad registrada. Agrega la primera nota arriba.</p>
            ) : (
              <div className="relative ml-5 max-h-[600px] overflow-y-auto pr-2">
                {/* Vertical line */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#e2e8f0]" />
                <div className="space-y-3 pl-8">
                  {timelineEvents.map((ev) => {
                    const Icon = ev.icon
                    const isCotTitle = ev.type === 'nota' && ev.title.startsWith('COT:')
                    const bgCard = ev.type === 'nota' ? 'bg-[#fffbeb] border-[#fef3c7]'
                      : ev.type === 'producto' ? 'bg-[#f5f3ff] border-[#ede9fe]'
                      : ev.type === 'cotizacion' ? 'bg-[#ecfdf5] border-[#d1fae5]'
                      : ''
                    const isInline = ev.type === 'etapa'
                    return (
                      <div key={ev.id} className="relative">
                        {/* Dot on the timeline line */}
                        <div
                          className="absolute -left-8 top-1 w-3 h-3 rounded-full border-2 border-white z-10"
                          style={{ background: ev.color, marginLeft: '-2px' }}
                        />
                        {isInline ? (
                          <div className="py-1">
                            <span className="text-[14px] text-[#64748b]">{ev.title}</span>
                            {ev.timestamp && <span className="text-[13px] text-[#94a3b8] ml-3">{formatDate(ev.timestamp)}</span>}
                          </div>
                        ) : (
                          <div className={`rounded-[12px] border ${isCotTitle ? 'p-4 mb-4' : 'p-[14px]'} ${bgCard} group/note`}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                <Icon size={isCotTitle ? 16 : 14} style={{ color: ev.color }} className="shrink-0 mt-0.5" />
                                {ev.type === 'nota' && editingNotaIdx !== null && ev.id === `nota-${editingNotaIdx}` ? (
                                  <div className="flex-1 flex gap-1.5">
                                    <input value={editingNotaText} onChange={e => setEditingNotaText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSaveEditNota(); if (e.key === 'Escape') setEditingNotaIdx(null) }} autoFocus className="flex-1 text-sm px-2 py-1 rounded border border-amber-300 bg-white" />
                                    <button onClick={handleSaveEditNota} className="text-xs px-2 py-1 rounded bg-amber-500 text-white hover:bg-amber-600">OK</button>
                                    <button onClick={() => setEditingNotaIdx(null)} className="text-xs px-2 py-1 rounded text-[var(--color-text-muted)] hover:bg-white">✕</button>
                                  </div>
                                ) : (
                                  <span className={isCotTitle ? 'text-[16px] font-bold text-slate-800' : 'text-[14px] text-[#334155]'}>{ev.title}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {ev.type === 'nota' && editingNotaIdx === null && (
                                  <div className="flex gap-1 opacity-0 group-hover/note:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); const idx = Number(ev.id.replace('nota-', '')); handleEditNota(idx) }} className="p-0.5 rounded text-[var(--color-text-muted)] hover:text-amber-600 hover:bg-amber-50" title="Editar nota"><Edit3 size={11} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); const idx = Number(ev.id.replace('nota-', '')); handleDeleteNota(idx) }} className="p-0.5 rounded text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50" title="Eliminar nota"><X size={11} /></button>
                                  </div>
                                )}
                                {ev.detail && <span className="text-xs font-semibold tabular-nums" style={{ color: ev.color }}>{ev.detail}</span>}
                                {ev.timestamp && <span className="text-xs text-[#94a3b8]">{ev.type === 'cotizacion' ? formatDate(ev.timestamp) : ev.timestamp}</span>}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ═══ CAMBIO 4: PRODUCTOS MEJORADOS ═══ */}
          <div className="card p-7 mb-8">
            <div className="flex justify-between items-center mb-2 pb-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2.5">
                <Package size={18} className="text-purple-500" />
                <h3 className="font-bold text-xl text-[var(--color-text)]">Productos</h3>
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
                  onClick={() => setShowProductModal(true)}
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
                    <div key={p.id} className="bg-white rounded-xl p-5 border border-[#f1f5f9] hover:shadow-[var(--shadow-card-hover)] transition-all group">
                      <div className="flex justify-between items-start gap-3">
                        {/* Thumbnail */}
                        {p.imagen_render && (
                          <img
                            src={p.imagen_render}
                            alt="Render 3D"
                            className="w-[80px] h-[60px] object-contain rounded-lg border border-[var(--color-border)] shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-base text-[var(--color-text)]">{p.subtipo}</span>
                            <span className="text-xs text-[#64748b] bg-[#f1f5f9] px-2.5 py-0.5 rounded-full">{p.categoria}</span>
                          </div>
                          {descShort && (
                            <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed mb-2">{descShort}</p>
                          )}
                          {specs.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {specs.map((s, i) => (
                                <span key={i} className="text-xs font-medium px-2.5 py-0.5 rounded-xl bg-[#f0f9ff] text-[#0369a1]">{s}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="font-bold text-lg text-[var(--color-text)] tabular-nums">{formatCOP(p.precio_calculado || 0)}</div>
                          <div className="text-[13px] text-[#94a3b8] tabular-nums">{'\u00d7'} {p.cantidad} = <span className="font-semibold text-[var(--color-text)]">{formatCOP((p.precio_calculado || 0) * p.cantidad)}</span></div>
                          <div className="flex items-center justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                const pid = p.configuracion?.producto_id
                                if (!pid || pid === 'mesa') {
                                  navigate(`/oportunidades/${id}/configurar?editar=${p.id}`)
                                } else {
                                  navigate(`/oportunidades/${id}/configurar-producto/${pid}?editar=${p.id}`)
                                }
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#64748b] transition-all"
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
                            {(() => {
                              const pid = (p.configuracion?.producto_id || '').toLowerCase()
                              const spreadsheetEligible = pid === 'mesa' || pid === 'carcamo'
                              if (!spreadsheetEligible) return null
                              return (
                                <button
                                  onClick={() => navigate(`/oportunidades/${id}/spreadsheet/${pid}`)}
                                  className="p-1.5 rounded text-amber-600 hover:text-amber-800 hover:bg-amber-50 transition-all border border-dashed border-amber-300"
                                  title="Probar cotizador tipo Excel (experimental)"
                                >
                                  <span className="text-[11px] font-semibold">🧪 Spreadsheet</span>
                                </button>
                              )
                            })()}
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

                                  // Fire-and-forget: upload APU to Supabase Storage
                                  if (cot) {
                                    const apuFile = new File([apuBlob], apuFilename, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
                                    uploadCotizacionFile(opp.id, cot.id, apuFile, 'apu').then(res => {
                                      if ('error' in res) {
                                        console.warn('[APU upload] Error:', res.error)
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
                                }}
                                className="p-1.5 rounded text-green-500 hover:text-green-700 hover:bg-green-50 transition-all"
                                title="Descargar APU Excel"
                              >
                                <FileSpreadsheet size={13} />
                              </button>
                            )}
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
                            <div className="inline-flex items-stretch rounded bg-green-50 border border-green-200 overflow-hidden">
                              <button
                                onClick={async () => {
                                  if (!p.archivo_apu_url) return
                                  const url = await getSignedUrl(p.archivo_apu_url)
                                  if (url) window.open(url, '_blank')
                                }}
                                className="flex items-center gap-1.5 px-2 py-1 hover:bg-green-100 transition-all text-[10px] text-green-800"
                              >
                                <FileSpreadsheet size={12} className="text-green-600" />
                                {p.archivo_apu_nombre}
                                <Download size={10} />
                              </button>
                              <button
                                onClick={async () => {
                                  if (!window.confirm(`¿Eliminar adjunto "${p.archivo_apu_nombre}"?`)) return
                                  if (p.archivo_apu_url) await deleteProductFile(p.archivo_apu_url).catch(() => {})
                                  await svcOportunidades.updateProducto({ id: p.id, archivo_apu_url: null, archivo_apu_nombre: null } as any)
                                  dispatch({ type: 'UPDATE_PRODUCTO', payload: { id: p.id, archivo_apu_url: null, archivo_apu_nombre: null } as any })
                                  showToast('success', 'APU eliminado')
                                }}
                                className="px-1.5 border-l border-green-200 hover:bg-red-100 hover:text-red-600 text-green-700 text-[10px]"
                                title="Eliminar APU"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          )}
                          {p.archivo_pdf_nombre && (
                            <div className="inline-flex items-stretch rounded bg-red-50 border border-red-200 overflow-hidden">
                              <button
                                onClick={async () => {
                                  if (!p.archivo_pdf_url) return
                                  const url = await getSignedUrl(p.archivo_pdf_url)
                                  if (url) window.open(url, '_blank')
                                }}
                                className="flex items-center gap-1.5 px-2 py-1 hover:bg-red-100 transition-all text-[10px] text-red-700"
                              >
                                <FileIcon size={12} className="text-red-500" />
                                {p.archivo_pdf_nombre}
                                <Download size={10} />
                              </button>
                              <button
                                onClick={async () => {
                                  if (!window.confirm(`¿Eliminar adjunto "${p.archivo_pdf_nombre}"?`)) return
                                  if (p.archivo_pdf_url) await deleteProductFile(p.archivo_pdf_url).catch(() => {})
                                  await svcOportunidades.updateProducto({ id: p.id, archivo_pdf_url: null, archivo_pdf_nombre: null } as any)
                                  dispatch({ type: 'UPDATE_PRODUCTO', payload: { id: p.id, archivo_pdf_url: null, archivo_pdf_nombre: null } as any })
                                  showToast('success', 'PDF eliminado')
                                }}
                                className="px-1.5 border-l border-red-200 hover:bg-red-100 hover:text-red-700 text-red-700 text-[10px]"
                                title="Eliminar PDF"
                              >
                                <X size={10} />
                              </button>
                            </div>
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
                              <FileIcon size={12} /> {p.archivo_pdf_nombre ? 'Reemplazar PDF' : 'Subir PDF (.pdf)'}
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

          {/* ═══ ARCHIVOS ADJUNTOS ═══ */}
          <div className="card p-7 mb-8">
            <div className="flex justify-between items-center mb-2 pb-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2.5">
                <Paperclip size={18} className="text-slate-500" />
                <h3 className="font-bold text-xl text-[var(--color-text)]">Archivos adjuntos</h3>
                {archivos.length > 0 && (
                  <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{archivos.length}</span>
                )}
              </div>
              <label className={`flex items-center gap-1.5 h-10 px-5 rounded-lg text-sm font-semibold cursor-pointer transition-all ${uploadingFile ? 'bg-gray-100 text-gray-400' : 'bg-[var(--color-primary)] text-white hover:opacity-90'}`}>
                <Paperclip size={13} /> {uploadingFile ? 'Subiendo...' : '+ Subir archivo'}
                <input type="file" className="hidden" accept=".pdf,.xlsx,.xlsm,.xls,.png,.jpg,.jpeg,.doc,.docx" disabled={uploadingFile} onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadFile(f); e.target.value = '' }} />
              </label>
            </div>
            {archivos.length === 0 ? (
              <p className="text-[14px] text-slate-400 text-center py-6">Sin archivos adjuntos</p>
            ) : (
              <div className="space-y-2">
                {archivos.map(f => {
                  const ext = f.name.split('.').pop()?.toLowerCase() || ''
                  const isExcel = ['xlsx', 'xlsm', 'xls'].includes(ext)
                  const isPdf = ext === 'pdf'
                  const iconColor = isExcel ? 'text-emerald-500' : isPdf ? 'text-red-500' : 'text-slate-400'
                  const IconFile = isExcel ? FileSpreadsheet : isPdf ? FileIcon : Paperclip
                  const sizeStr = f.size > 1048576 ? `${(f.size / 1048576).toFixed(1)} MB` : f.size > 0 ? `${Math.round(f.size / 1024)} KB` : ''
                  return (
                    <div key={f.path} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface)] group transition-colors">
                      <IconFile size={18} className={iconColor} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{f.name}</div>
                        <div className="text-[10px] text-[var(--color-text-muted)]">{sizeStr}</div>
                      </div>
                      <button onClick={() => handleDownloadFile(f.path, f.name)} className="text-xs text-[var(--color-primary)] hover:underline opacity-0 group-hover:opacity-100 transition-opacity" title="Descargar"><Download size={14} /></button>
                      <button onClick={() => handleDeleteFile(f.path, f.name)} className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" title="Eliminar"><Trash2 size={14} /></button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ═══ CAMBIO 5: COTIZACIONES MEJORADAS ═══ */}
          <div className="card p-7">
            <div className="flex justify-between items-center mb-2 pb-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2.5">
                <FileText size={18} className="text-[var(--color-primary)]" />
                <h3 className="font-bold text-xl text-[var(--color-text)]">Cotizaciones</h3>
                {cotizaciones.length > 0 && (
                  <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{cotizaciones.length}</span>
                )}
              </div>
              {(() => {
                const recotizableBtn = [...cotizaciones]
                  .filter(c => c.estado === 'borrador' || c.estado === 'enviada')
                  .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))[0]
                if (!recotizableBtn) return null
                const base = recotizableBtn.numero.replace(/[A-Z]$/, '')
                return (
                  <button
                    onClick={() => {
                      const ok = window.confirm(
                        `¿Desea recotizar esta oportunidad?\n\nSe creará una nueva versión de ${recotizableBtn.numero}. Las cotizaciones previas con el número ${base} quedarán descartadas.`
                      )
                      if (!ok) return
                      const currentLetter = recotizableBtn.numero.match(/([A-Z])$/)?.[1]
                      const nextLetter = currentLetter ? String.fromCharCode(currentLetter.charCodeAt(0) + 1) : 'A'
                      const nuevoNumero = base + nextLetter
                      const newCotId = crypto.randomUUID()
                      dispatch({ type: 'RECOTIZAR', payload: { cotizacionId: recotizableBtn.id, nuevoNumero, newCotId } })
                      showToast('success', `Recotización ${nuevoNumero} creada. La ${recotizableBtn.numero} fue descartada.`)
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg transition-all"
                    title={`Crear nueva versión de ${recotizableBtn.numero}`}
                  >
                    <ArrowRightLeft size={16} />
                    RECOTIZAR
                  </button>
                )
              })()}
            </div>

            {(() => {
              const activeCots = cotizaciones.filter(c => c.estado !== 'descartada')
              const discardedCots = cotizaciones.filter(c => c.estado === 'descartada')

              function handleRecotizar(cotId: string) {
                const cot = cotizaciones.find(c => c.id === cotId)
                if (!cot) return
                // Calculate next version letter
                const base = cot.numero.replace(/[A-Z]$/, '')
                const currentLetter = cot.numero.match(/([A-Z])$/)?.[1]
                const nextLetter = currentLetter ? String.fromCharCode(currentLetter.charCodeAt(0) + 1) : 'A'
                const nuevoNumero = base + nextLetter
                // Generate id here so reducer, URL, and DB all share the same UUID
                const newCotId = crypto.randomUUID()
                dispatch({ type: 'RECOTIZAR', payload: { cotizacionId: cotId, nuevoNumero, newCotId } })
                showToast('success', `Recotización ${nuevoNumero} creada. La ${cot.numero} fue descartada.`)
              }

              function renderCotCard(c: typeof cotizaciones[0], isDiscarded: boolean) {
                const prodCount = c.productos_snapshot?.length || 0
                return (
                  <div key={c.id} className={`bg-white rounded-xl p-5 border border-[#f1f5f9] transition-all group ${isDiscarded ? 'opacity-50' : 'hover:shadow-[var(--shadow-card-hover)]'}`}>
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-semibold text-[15px] font-mono ${isDiscarded ? 'text-gray-400 line-through' : 'text-[var(--color-text)]'}`}>{c.numero}</span>
                          <EstadoBadge estado={c.estado} />
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
                          <span>{formatDate(c.fecha)}</span>
                          <span>{prodCount} producto{prodCount !== 1 ? 's' : ''}</span>
                          {c.archivo_apu_nombre && <span className="text-emerald-600">· APU</span>}
                          {c.archivo_pdf_nombre && <span className="text-red-500">· PDF</span>}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className={`font-bold text-lg tabular-nums ${isDiscarded ? 'text-gray-400' : 'text-[var(--color-text)]'}`}>{formatCOP(c.total)}</div>
                        <div className="text-[9px] text-[var(--color-text-muted)]">con IVA</div>
                        <div className="flex items-center justify-end gap-1 mt-2">
                          {!isDiscarded && (c.estado === 'enviada' || c.estado === 'borrador') && (
                            <button
                              onClick={() => handleRecotizar(c.id)}
                              className="p-1.5 rounded text-amber-500 hover:text-amber-700 hover:bg-amber-50 transition-all"
                              title="Recotizar (crear nueva versión)"
                            >
                              <ArrowRightLeft size={13} />
                            </button>
                          )}
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
                          {isDiscarded && opp.etapa !== 'adjudicada' && opp.etapa !== 'perdida' && (
                            <button
                              onClick={() => {
                                const activeCount = cotizaciones.filter(ct => ct.estado === 'borrador' || ct.estado === 'enviada').length
                                const msg = activeCount > 0
                                  ? `¿Reactivar ${c.numero}?\n\nLa cotización activa actual pasará a "descartada" y ${c.numero} volverá a estar activa.`
                                  : `¿Reactivar ${c.numero}?\n\nSe restaurará como cotización activa.`
                                if (!window.confirm(msg)) return
                                dispatch({ type: 'REACTIVAR_COTIZACION', payload: { cotizacionDescartadaId: c.id } })
                                showToast('success', `${c.numero} reactivada`)
                              }}
                              className="p-1.5 rounded text-violet-500 hover:text-violet-700 hover:bg-violet-50 transition-all"
                              title="Reactivar esta versión (la versión activa actual pasará a descartada)"
                            >
                              <RotateCcw size={13} />
                            </button>
                          )}
                          {!isDiscarded && (
                            <>
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
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Adjuntos de cotización (M10): APU + PDF + file uploads */}
                    <CotAdjuntos cot={c} oportunidadId={opp.id} />
                  </div>
                )
              }

              if (cotizaciones.length === 0) return (
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
              )
              return (
                <div className="space-y-3">
                  {activeCots.map(c => renderCotCard(c, false))}
                  {discardedCots.length > 0 && (
                    <details className="group/versions">
                      <summary className="cursor-pointer text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] py-2 select-none">
                        Ver versiones anteriores ({discardedCots.length})
                      </summary>
                      <div className="space-y-2 mt-2">
                        {discardedCots.map(c => renderCotCard(c, true))}
                      </div>
                    </details>
                  )}
                </div>
              )
            })()}
          </div>
        </div>

        {/* ─── RIGHT COLUMN - SIDEBAR (30%) ─── */}
        <div className="flex-[3] min-w-[340px] max-w-[380px] space-y-5 sticky top-6">
          {/* ═══ CAMBIO 2: SIDEBAR RESUMEN ═══ */}
          <div className="card p-7">
            <div className="mb-6 pb-6 border-b border-[#f1f5f9]">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#94a3b8] mb-1">Valor cotizado</p>
              <p className="text-[32px] font-extrabold text-[#059669] tabular-nums leading-tight">{formatCOP(opp.valor_cotizado)}</p>
              {opp.valor_adjudicado > 0 && (
                <p className="text-sm font-bold text-[var(--color-accent-green)] font-mono mt-1">
                  Adjudicado: {formatCOP(opp.valor_adjudicado)}
                </p>
              )}
            </div>

            <div className="space-y-3.5 text-[14px]">
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-medium text-slate-500">Etapa</span>
                <EtapaBadge etapa={opp.etapa} size="sm" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-medium text-slate-500">Cotizador</span>
                <select
                  value={opp.cotizador_asignado}
                  onChange={e => {
                    dispatch({ type: 'UPDATE_OPORTUNIDAD', payload: { id: opp.id, cotizador_asignado: e.target.value } })
                    const c = findCotizador(e.target.value)
                    showToast('success', `Cotizador actualizado a ${c?.nombre || e.target.value}`)
                  }}
                  className="text-[14px] font-medium bg-transparent border-none cursor-pointer text-right pr-0 focus:ring-0 focus:outline-none hover:text-[var(--color-primary)] transition-colors"
                >
                  {COTIZADORES.map(c => (
                    <option key={c.id} value={c.id}>{c.iniciales} — {c.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-medium text-slate-500">Empresa</span>
                <button
                  onClick={() => navigate(`/empresas/${emp.id}`)}
                  className="text-[14px] font-medium text-[var(--color-primary)] hover:underline truncate max-w-[180px]"
                >
                  {emp.nombre}
                </button>
              </div>

              <div className="pt-3 border-t border-[var(--color-border)] space-y-3.5">
                <div className="flex justify-between">
                  <span className="text-[13px] text-slate-500">Dias en pipeline</span>
                  <span className="text-[14px] font-medium">{diasEnPipeline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-slate-500">Fecha ingreso</span>
                  <span className="text-[14px] font-medium">{formatDate(opp.fecha_ingreso)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-slate-500">Fecha envio</span>
                  <span className="text-[14px] font-medium">{opp.fecha_envio ? formatDate(opp.fecha_envio) : 'Sin fecha de envio'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-slate-500">Fuente</span>
                  <span className="text-[14px] font-medium">{opp.fuente_lead}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[13px] text-slate-500 shrink-0">Ubicacion</span>
                  <span className="text-[14px] font-medium text-right truncate" title={opp.ubicacion || ''}>
                    {opp.ubicacion || '—'}
                  </span>
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
          <div className="card p-5 mt-5">
            <div className="flex items-center gap-1.5 mb-3">
              <Building2 size={14} className="text-[var(--color-primary)]" />
              <span className="text-[13px] font-bold text-[var(--color-text)]">Empresa</span>
            </div>
            <div className="space-y-1.5 text-[13px]">
              <div className="font-medium text-[14px] text-[var(--color-text)]">{emp.nombre}</div>
              <div className="text-slate-500">NIT: {emp.nit || '—'}</div>
              <div className="text-slate-500">{emp.direccion || '—'}</div>
              <div className="text-slate-500">{emp.sector}</div>
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

          {/* ═══ CAMBIO 6: CONTACTO CARD (editable) ═══ */}
          <div id="contacto-card" className="card p-5 mt-5">
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
        </div>
      </div>

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
                    className={`text-left p-5 rounded-xl border transition-all ${
                      item.active
                        ? 'border-[var(--color-border)] bg-white hover:shadow-md hover:border-[var(--color-primary)] cursor-pointer'
                        : 'border-[var(--color-border)] bg-gray-50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div className="font-semibold text-sm text-[var(--color-text)]">{item.name}</div>
                    <div className="text-[10px] text-[var(--color-text-muted)] mt-1">{item.desc}</div>
                    <div className="mt-2">
                      {item.active ? (
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">ACTIVO</span>
                      ) : (
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">🔒 PRÓXIMO</span>
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
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50" onClick={() => setShowManualForm(false)}>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
              <h3 className="font-bold text-base text-[var(--color-text)]">Duplicar para otro cliente</h3>
              <button onClick={() => setDupCotId(null)} className="p-1 rounded hover:bg-slate-100"><X size={16} /></button>
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
                      <button key={e.id} onClick={() => { setDupSelectedEmpId(e.id); setDupSearch(e.nombre) }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 truncate">
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

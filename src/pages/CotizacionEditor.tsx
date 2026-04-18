import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { CotizacionProducto, CONFIG_MESA_DEFAULT, findCotizador } from '../types'
import { formatCOP, formatDate, downloadBlob, getAvatarColor } from '../lib/utils'
import { generarPdfCotizacion } from '../lib/generar-pdf'
import { exportApuExcel, exportApuConsolidado } from '../lib/exportar-apu'
import { uploadCotizacionFile } from '../hooks/useStorage'
import { supabase, isSupabaseReady } from '../hooks/useSupabase'
import * as svcCotizaciones from '../hooks/useCotizaciones'
import PdfNameModal from '../components/PdfNameModal'
import {
  ArrowLeft, FileText, Save, Download, Plus, Trash2, Check,
  Mail, Phone, MapPin, Hash, Building2, X, FileSpreadsheet, Image as ImageIcon
} from 'lucide-react'

/**
 * Read a File as base64 data URL. Used for D-07 (imagen por producto):
 * we store the data URL in the cotización snapshot so the PDF generator
 * can embed it synchronously via doc.addImage().
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export default function CotizacionEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useStore()

  const cotizacion = state.cotizaciones.find(c => c.id === id)
  const oportunidad = cotizacion ? state.oportunidades.find(o => o.id === cotizacion.oportunidad_id) : null
  const empresa = oportunidad ? state.empresas.find(e => e.id === oportunidad.empresa_id) : null
  const contacto = oportunidad ? state.contactos.find(ct => ct.id === oportunidad.contacto_id) : null
  const cotizadorInfo = oportunidad ? findCotizador(oportunidad.cotizador_asignado) : null
  const productosOportunidad = cotizacion ? state.productos.filter(p => p.oportunidad_id === cotizacion.oportunidad_id) : []

  // Editor line = CotizacionProducto + optional link back to productos_oportunidad.
  // _productoId is local-only UI state; it is stripped before persisting to productos_snapshot.
  // Lines loaded from state.productos get their _productoId pre-filled so edits stay in sync.
  // Lines added via "Agregar linea" start with _productoId=undefined and get a new product
  // created in saveDraft/handleGenerarPdf so they appear in the oportunidad Products section.
  type EditorLine = CotizacionProducto & { _productoId?: string }

  const initialProductos: EditorLine[] = useMemo(() => {
    if (cotizacion?.productos_snapshot && cotizacion.productos_snapshot.length > 0) {
      return cotizacion.productos_snapshot.map(p => {
        const match = productosOportunidad.find(op =>
          (op.descripcion_comercial || op.subtipo) === p.descripcion &&
          (op.precio_calculado || 0) === p.precio_unitario &&
          op.cantidad === p.cantidad,
        )
        return { ...p, _productoId: match?.id }
      })
    }
    return productosOportunidad.map(p => ({
      descripcion: p.descripcion_comercial || p.subtipo,
      cantidad: p.cantidad,
      precio_unitario: p.precio_calculado || 0,
      unidad: 'UND',
      _productoId: p.id,
    }))
  }, [cotizacion?.id])

  const [productos, setProductos] = useState<EditorLine[]>(initialProductos)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tiempoEntrega, setTiempoEntrega] = useState(cotizacion?.tiempoEntrega || '25 d\u00edas h\u00e1biles o a convenir')
  const [incluyeTransporte, setIncluyeTransporte] = useState(cotizacion?.incluyeTransporte ?? true)
  const [condicionesText, setCondicionesText] = useState(cotizacion?.condicionesItems?.join('\n') || '')
  const [noIncluyeText, setNoIncluyeText] = useState(cotizacion?.noIncluyeItems?.join('\n') || '')
  const [imagenModal, setImagenModal] = useState<string | null>(null)
  // D-07: track which line is currently uploading an image (disables button + spinner)
  const [imgUploadingIdx, setImgUploadingIdx] = useState<number | null>(null)

  // Auto-suggest product name — short COMMERCIAL name, max 40 chars
  const suggestedProductName = useMemo(() => {
    if (productos.length === 0) return 'Producto'

    function getCategory(desc: string): string {
      const d = desc.toLowerCase()
      // Check for most specific matches first
      if (d.includes('barra abatible') || d.includes('barra discapac')) return 'Barra Discapacitados'
      if (d.includes('barra l')) return 'Barra L Discapacitados'
      if (d.includes('barra')) return 'Barra'
      if (d.includes('lavaollas')) return 'Lavaollas'
      if (d.includes('lavaescobas')) return 'Lavaescobas'
      if (d.includes('lavabotas')) return 'Lavabotas'
      if (d.includes('vertedero')) return 'Vertedero'
      if (d.includes('caja sifonada')) return 'Caja Sifonada'
      if (d.includes('deslizador')) return 'Deslizador Bandejas'
      if (d.includes('ducto')) return 'Ducto'
      if (d.includes('gabinete corredizo')) return 'Gabinete Corredizo'
      if (d.includes('gabinete')) return 'Gabinete'
      if (d.includes('mueble inferior')) return 'Mueble Inferior'
      if (d.includes('mueble superior')) return 'Mueble Superior'
      if (d.includes('mueble')) return 'Mueble'
      if (d.includes('mesa')) return 'Mesa'
      if (d.includes('mesón') || d.includes('meson')) return 'Mesón'
      if (d.includes('pozuelo') || d.includes('poceta')) return 'Pozuelo'
      if (d.includes('campana isla')) return 'Campana Isla'
      if (d.includes('campana mural')) return 'Campana Mural'
      if (d.includes('campana')) return 'Campana'
      if (d.includes('estantería graduable') || d.includes('estanteria graduable')) return 'Estantería Graduable'
      if (d.includes('estantería perforada') || d.includes('estanteria perforada')) return 'Estantería Perforada'
      if (d.includes('estantería ranurada') || d.includes('estanteria ranurada')) return 'Estantería Ranurada'
      if (d.includes('escabiladero')) return 'Escabiladero'
      if (d.includes('estante') || d.includes('repisa')) return 'Estantería'
      if (d.includes('cárcamo') || d.includes('carcamo')) return 'Cárcamo'
      if (d.includes('autoservicio')) return 'Autoservicio'
      if (d.includes('pasamanos')) return 'Pasamanos'
      return 'Mobiliario'
    }

    if (productos.length === 1) {
      const desc = productos[0].descripcion || ''
      const cat = getCategory(desc)
      // Extract dimensions like "2.00x0.70" or "200x70"
      const dimMatch = desc.match(/(\d+[.,]\d+)\s*x\s*(\d+[.,]\d+)/i)
      if (dimMatch) {
        const name = `${cat} Inoxidable ${dimMatch[1]}x${dimMatch[2]}`
        return name.length <= 40 ? name : `${cat} ${dimMatch[1]}x${dimMatch[2]}`
      }
      return `${cat} Inoxidable`
    }

    // Multiple products: combine categories
    const cats = [...new Set(productos.map(p => getCategory(p.descripcion)))]
    const pluralize = (s: string) => s.endsWith('a') ? s + 's' : s.endsWith('l') ? s + 'es' : s + 's'
    if (cats.length === 1) return `${pluralize(cats[0])} Inoxidables`
    if (cats.length === 2) return `${pluralize(cats[0])} y ${pluralize(cats[1])}`
    return 'Mobiliario Inoxidable'
  }, [productos])

  const subtotal = productos.reduce((s, p) => s + p.precio_unitario * p.cantidad, 0)
  const iva = subtotal * 0.19
  const total = subtotal + iva

  function updateProducto(index: number, field: keyof CotizacionProducto, value: any) {
    setProductos(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p))
  }

  // D-07: upload/replace/remove image attached to a quote line.
  // - Store base64 data URL in snapshot (for sync PDF embedding)
  // - Fire-and-forget upload to Supabase Storage (durable copy)
  // - Mirror into productos_oportunidad.imagen_render when there is a linked producto
  async function handleImageUpload(index: number, file: File) {
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen (PNG, JPG, WEBP).')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen excede 5MB.')
      return
    }
    setImgUploadingIdx(index)
    try {
      const dataUrl = await fileToDataUrl(file)
      // Update editor state immediately (preview + PDF source)
      setProductos(prev => prev.map((p, i) => i === index ? { ...p, imagen_url: dataUrl } : p))

      // Also mirror to linked productos_oportunidad.imagen_render so the thumbnail
      // in the product card (OportunidadDetalle) reflects the attached image.
      const line = productos[index]
      if (line?._productoId && oportunidad) {
        dispatch({ type: 'UPDATE_PRODUCTO', payload: { id: line._productoId, imagen_render: dataUrl } })
      }
    } catch (err) {
      console.warn('[Imagen producto] readAsDataURL failed:', err)
      alert('No se pudo leer la imagen.')
      setImgUploadingIdx(null)
      return
    }

    // Fire-and-forget: upload to Supabase Storage for durable persistence.
    // uploadProductFile in useStorage is scoped to APU/PDF kinds only; for images
    // we write directly to the bucket under the scoped path so the image survives
    // page reloads even if the snapshot is cleared.
    if (oportunidad && cotizacion && isSupabaseReady) {
      const line = productos[index]
      const scopeId = line?._productoId || cotizacion.id
      try {
        const safe = file.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '_')
        const path = `${oportunidad.id}/${scopeId}/img_${Date.now()}_${safe}`
        const { error } = await supabase.storage.from('archivos-oportunidades').upload(path, file, {
          upsert: true,
          contentType: file.type || 'image/jpeg',
        })
        if (error) {
          console.warn('[Imagen producto] upload failed:', error.message)
        } else {
          setProductos(prev => prev.map((p, i) => i === index ? { ...p, imagen_storage_path: path } : p))
        }
      } catch (err) {
        console.warn('[Imagen producto] upload threw:', err)
      }
    }
    setImgUploadingIdx(null)
  }

  function removeImage(index: number) {
    setProductos(prev => prev.map((p, i) => i === index ? { ...p, imagen_url: null, imagen_storage_path: null } : p))
    const line = productos[index]
    if (line?._productoId) {
      dispatch({ type: 'UPDATE_PRODUCTO', payload: { id: line._productoId, imagen_render: null } })
    }
  }

  function removeProducto(index: number) {
    setProductos(prev => prev.filter((_, i) => i !== index))
  }

  function addProducto() {
    setProductos(prev => [...prev, { descripcion: 'Nuevo producto', cantidad: 1, precio_unitario: 0, unidad: 'UND' }])
  }

  /**
   * For each editor line without a linked productos_oportunidad row, create one.
   * Returns the lines updated with their new _productoId so subsequent saves don't
   * duplicate and so the snapshot we persist has a clean match back to products.
   */
  function syncLinesToProducts(lines: EditorLine[]): EditorLine[] {
    if (!oportunidad) return lines
    return lines.map(line => {
      if (line._productoId) return line
      if (!line.descripcion.trim() || line.precio_unitario <= 0) return line
      const newProdId = crypto.randomUUID()
      dispatch({
        type: 'ADD_PRODUCTO',
        payload: {
          id: newProdId,
          oportunidad_id: oportunidad.id,
          categoria: 'Manual',
          subtipo: 'Producto manual',
          configuracion: CONFIG_MESA_DEFAULT,
          precio_calculado: line.precio_unitario,
          descripcion_comercial: line.descripcion,
          cantidad: line.cantidad,
        } as any,
      })
      return { ...line, _productoId: newProdId }
    })
  }

  /** Strip editor-only fields before persisting to the cotización snapshot. */
  function toSnapshot(lines: EditorLine[]): CotizacionProducto[] {
    return lines.map(({ _productoId: _omit, ...rest }) => rest)
  }

  function saveDraft() {
    if (!cotizacion) return
    const synced = syncLinesToProducts(productos)
    setProductos(synced)
    dispatch({
      type: 'UPDATE_COTIZACION',
      payload: {
        id: cotizacion.id,
        total,
        productos_snapshot: toSnapshot(synced),
        tiempoEntrega,
        incluyeTransporte,
        condicionesItems: condicionesText.split('\n').filter(l => l.trim()),
        noIncluyeItems: noIncluyeText.split('\n').filter(l => l.trim()),
      },
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function handleGenerarPdf(nombreProducto: string) {
    if (!empresa || !contacto || productos.length === 0 || !cotizacion) return
    // Make sure any manual lines are mirrored into productos_oportunidad before the PDF is saved
    const synced = syncLinesToProducts(productos)
    setProductos(synced)
    const fecha = cotizacion.fecha || new Date().toISOString().split('T')[0]
    const numero = cotizacion.numero

    const condicionesItems = condicionesText.split('\n').filter(l => l.trim())
    const noIncluyeItems = noIncluyeText.split('\n').filter(l => l.trim())

    const productosForPdf = synced.map((p, i) => {
      // D-07: prefer user-attached image (imagen_url) over auto-captured 3D render.
      // Fall back to the linked producto's imagen_render so products created via
      // configurador still show their 3D render in the PDF even without manual upload.
      const srcProd = productosOportunidad.find(pp => pp.id === p._productoId)
      const imagenParaPdf = p.imagen_url || srcProd?.imagen_render || null
      return {
        id: String(i),
        oportunidad_id: oportunidad?.id || '',
        categoria: 'Mesas',
        subtipo: p.descripcion,
        configuracion: {} as any,
        precio_calculado: p.precio_unitario,
        descripcion_comercial: p.descripcion,
        cantidad: p.cantidad,
        unidad: p.unidad || 'UND',
        imagen_render: imagenParaPdf,
      }
    })
    const { blob, filename, totalFinal } = generarPdfCotizacion({
      numero,
      fecha,
      nombreProducto,
      tiempoEntrega,
      incluyeTransporte,
      condicionesItems,
      noIncluyeItems,
      cotizadorAsignado: oportunidad?.cotizador_asignado,
      cliente: {
        empresa: empresa?.nombre || '',
        nombre: contacto?.nombre || '',
        whatsapp: contacto?.whatsapp || '',
        correo: contacto?.correo || '',
        nit: empresa?.nit || '',
        ubicacion: oportunidad?.ubicacion || empresa?.direccion || '',
      },
      productos: productosForPdf,
    })

    // Trigger download immediately
    downloadBlob(blob, filename)

    dispatch({
      type: 'UPDATE_COTIZACION',
      payload: {
        id: cotizacion.id,
        total: totalFinal,
        productos_snapshot: toSnapshot(synced),
        tiempoEntrega,
        incluyeTransporte,
        condicionesItems,
        noIncluyeItems,
      },
    })

    // Fire-and-forget: upload PDF to Supabase Storage and persist URL
    if (oportunidad) {
      const file = new File([blob], filename, { type: 'application/pdf' })
      uploadCotizacionFile(oportunidad.id, cotizacion.id, file, 'pdf').then(res => {
        if ('error' in res) {
          console.warn('[PDF upload] Error:', res.error)
          return
        }
        dispatch({
          type: 'UPDATE_COTIZACION',
          payload: {
            id: cotizacion.id,
            archivo_pdf_url: res.url,
            archivo_pdf_nombre: res.nombre,
          },
        })
        svcCotizaciones.updateCotizacion({
          id: cotizacion.id,
          archivo_pdf_url: res.url,
          archivo_pdf_nombre: res.nombre,
        } as any)
      })

      // D-03: Auto-generate and upload APU (one workbook with a sheet per product)
      // Match each synced line back to its productos_oportunidad row (which holds apu_resultado + configuracion)
      const apuItems = synced
        .map(line => {
          const prod = productosOportunidad.find(pp => pp.id === line._productoId)
            || productosOportunidad.find(pp =>
              (pp.descripcion_comercial || pp.subtipo) === line.descripcion &&
              (pp.precio_calculado || 0) === line.precio_unitario,
            )
          if (!prod || !prod.apu_resultado) return null
          return {
            resultado: prod.apu_resultado,
            config: prod.configuracion || CONFIG_MESA_DEFAULT,
            productoNombre: prod.descripcion_comercial || prod.subtipo,
          }
        })
        .filter((x): x is NonNullable<typeof x> => x !== null)

      if (apuItems.length > 0) {
        const { blob: apuBlob, filename: apuFilename } = exportApuConsolidado({
          products: apuItems,
          cotizacionNumero: numero,
          empresaNombre: empresa?.nombre,
          contactoNombre: contacto?.nombre,
        })
        const apuFile = new File([apuBlob], apuFilename, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        uploadCotizacionFile(oportunidad.id, cotizacion.id, apuFile, 'apu').then(res => {
          if ('error' in res) {
            console.warn('[APU auto-upload] Error:', res.error)
            return
          }
          dispatch({
            type: 'UPDATE_COTIZACION',
            payload: {
              id: cotizacion.id,
              archivo_apu_url: res.url,
              archivo_apu_nombre: res.nombre,
            },
          })
          svcCotizaciones.updateCotizacion({
            id: cotizacion.id,
            archivo_apu_url: res.url,
            archivo_apu_nombre: res.nombre,
          } as any)
        })
      }
    }

    setShowPdfModal(false)
  }

  if (!cotizacion) {
    // A-05: during hydration, cotizaciones[] is empty — show a spinner instead of
    // "not found" to avoid the false-negative on direct URL navigation to /cotizaciones/:id
    if (!state.isHydrated) {
      return (
        <div className="p-6 flex items-center justify-center min-h-[200px]">
          <div className="w-7 h-7 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      )
    }
    return (
      <div className="p-6 text-[var(--color-text-muted)]">
        <p className="text-sm">Cotizacion no encontrada.</p>
        <button onClick={() => navigate('/cotizaciones')} className="mt-3 text-[var(--color-primary)] hover:underline text-xs">
          Volver a cotizaciones
        </button>
      </div>
    )
  }
  if (!oportunidad || !empresa) {
    return (
      <div className="p-6 text-[var(--color-text-muted)]">
        <p className="text-sm">Cotización <b>{cotizacion.numero}</b> tiene referencias incompletas (oportunidad o empresa no existen).</p>
        <p className="text-xs mt-2">Esta cotización histórica puede no ser editable. <button onClick={() => navigate('/cotizaciones')} className="text-[var(--color-primary)] hover:underline">Volver</button></p>
      </div>
    )
  }
  // NOTE: `contacto` may be null for historical cotizaciones that never had a
  // contacto_id assigned. All usages below are guarded with `?.` accessor.

  function fmtQty(n: number): string {
    if (Number.isInteger(n)) return String(n)
    return n.toFixed(2).replace(/\.?0+$/, '')
  }

  // Calcula cotizaciones-hermanas (mismo número base, variantes A/B/C) → versiones
  const numeroBase = cotizacion.numero.replace(/[A-Z]$/, '')
  const versiones = state.cotizaciones
    .filter(c => c.oportunidad_id === oportunidad.id && c.numero.replace(/[A-Z]$/, '') === numeroBase)
    .sort((a, b) => a.numero.localeCompare(b.numero))

  return (
    <div className="cotedit-page">
      {saved && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-md animate-fade-in" style={{ background: 'var(--color-accent-green)', color: '#fff', boxShadow: 'var(--shadow-pop)' }}>
          <Check size={14} strokeWidth={3} />
          <span style={{ fontSize: 12, fontWeight: 600 }}>Borrador guardado</span>
        </div>
      )}

      {/* Sticky header (crumbs + actions + info row) */}
      <div className="cotedit-header">
        <div className="cotedit-topbar">
          <button onClick={() => navigate(-1)} className="btn-d ghost sm" style={{ padding: '0 8px' }}>
            <ArrowLeft size={13} /> Volver
          </button>
          <div className="crumb">
            <span>Cotizaciones</span>
            <span className="sep">/</span>
            <span className="cur mono">{cotizacion.numero}</span>
          </div>
          <div style={{ flex: 1 }} />
          <button onClick={saveDraft} className="btn-d sm">
            <Save size={12} /> Guardar borrador
          </button>
          {(() => {
            const prodsConApu = productosOportunidad.filter(pp => pp.apu_resultado)
            if (prodsConApu.length < 2) return null
            return (
              <button
                onClick={() => {
                  const items = prodsConApu.map(pp => ({
                    resultado: pp.apu_resultado!,
                    config: pp.configuracion || CONFIG_MESA_DEFAULT,
                    productoNombre: pp.descripcion_comercial || pp.subtipo,
                  }))
                  const { blob, filename } = exportApuConsolidado({
                    products: items,
                    cotizacionNumero: cotizacion?.numero || 'SIN_NUMERO',
                    empresaNombre: empresa?.nombre,
                    contactoNombre: contacto?.nombre,
                  })
                  downloadBlob(blob, filename)
                  if (oportunidad && cotizacion) {
                    const apuFile = new File([blob], filename, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
                    uploadCotizacionFile(oportunidad.id, cotizacion.id, apuFile, 'apu').then(res => {
                      if ('error' in res) { console.warn('[APU Consolidado upload] Error:', res.error); return }
                      dispatch({ type: 'UPDATE_COTIZACION', payload: { id: cotizacion.id, archivo_apu_url: res.url, archivo_apu_nombre: res.nombre } })
                      svcCotizaciones.updateCotizacion({ id: cotizacion.id, archivo_apu_url: res.url, archivo_apu_nombre: res.nombre } as any)
                    })
                  }
                }}
                className="btn-d sm"
                style={{ color: 'var(--color-accent-green)' }}
                title="Genera un solo Excel con una hoja por producto"
              >
                <FileSpreadsheet size={12} /> APU consolidado
              </button>
            )
          })()}
          <button
            onClick={() => { if (subtotal <= 0) { alert('No se puede generar PDF con total $0'); return } setShowPdfModal(true) }}
            className="btn-d accent sm"
            disabled={subtotal <= 0}
            style={{ opacity: subtotal <= 0 ? 0.4 : 1 }}
          >
            <Download size={12} /> Descargar PDF
          </button>
        </div>

        {/* Cotización info row */}
        <div className="cotedit-inforow">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span className="mono" style={{ fontSize: 12, color: 'var(--color-text-label)' }}>{cotizacion.numero}</span>
              <span className={`state-pill ${cotizacion.estado}`}>{cotizacion.estado}</span>
              {versiones.length > 1 && (
                <div style={{ display: 'flex', gap: 4 }}>
                  {versiones.map(v => {
                    const letter = v.numero.match(/([A-Z])$/)?.[1] || 'A'
                    const active = v.id === cotizacion.id
                    return (
                      <span
                        key={v.id}
                        onClick={() => !active && navigate(`/cotizaciones/${v.id}/editar`)}
                        style={{
                          display: 'inline-block', padding: '2px 7px', borderRadius: 4,
                          fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 600,
                          background: active ? 'var(--color-text)' : 'var(--color-surface-2)',
                          color: active ? 'var(--color-surface)' : 'var(--color-text-label)',
                          border: '1px solid ' + (active ? 'var(--color-text)' : 'var(--color-border)'),
                          letterSpacing: '0.04em',
                          cursor: active ? 'default' : 'pointer',
                        }}
                        title={active ? 'Versión actual' : `Cambiar a versión ${letter}`}
                      >v{letter}</span>
                    )
                  })}
                </div>
              )}
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--color-text)' }}>{empresa.nombre}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-label)', marginTop: 2 }}>
              {contacto?.nombre || 'Sin contacto'}
              {oportunidad.ubicacion && ` · ${oportunidad.ubicacion}`}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14, fontSize: 11.5 }}>
            {cotizadorInfo && (
              <div>
                <div className="mono" style={{ fontSize: 9.5, color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cotizador</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                  <span className="avatar sm" style={{ background: getAvatarColor(cotizadorInfo.nombre), color: '#fff', border: 'none' }}>{cotizadorInfo.iniciales}</span>
                  <span style={{ color: 'var(--color-text)' }}>{cotizadorInfo.nombre}</span>
                </div>
              </div>
            )}
            <div>
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Creada</div>
              <div className="mono" style={{ marginTop: 3, color: 'var(--color-text)' }}>{formatDate(cotizacion.fecha)}</div>
            </div>
            {/[A-Z]$/.test(cotizacion.numero) && (
              <div>
                <div className="mono" style={{ fontSize: 9.5, color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recotización</div>
                <div className="mono" style={{ marginTop: 3, color: 'var(--color-accent-yellow)' }}>de {numeroBase}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body grid: main + aside */}
      <div className="cotedit-body">
        {/* Main content */}
        <div className="main-col" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Client info strip (compact, bordered hairline — info ya está en header) */}
          <div className="meta-grid" style={{ marginBottom: 0 }}>
            <div className="meta-cell">
              <div className="l">NIT</div>
              <div className="v mono" style={{ fontSize: 13 }}>{empresa.nit || '—'}</div>
            </div>
            <div className="meta-cell">
              <div className="l">Correo</div>
              <div className="v" style={{ fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={contacto?.correo || ''}>
                {contacto?.correo || '—'}
              </div>
            </div>
            <div className="meta-cell">
              <div className="l">WhatsApp</div>
              <div className="v mono" style={{ fontSize: 13 }}>{contacto?.whatsapp || '—'}</div>
            </div>
            <div className="meta-cell">
              <div className="l">Ubicación</div>
              <div className="v" style={{ fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={oportunidad.ubicacion || empresa.direccion || ''}>
                {oportunidad.ubicacion || empresa.direccion || '—'}
              </div>
            </div>
          </div>

          {/* Products table (handoff: section + tbl) */}
          <div className="section" style={{ marginTop: 0 }}>
            <div className="section-head">
              <h2>Líneas de cotización</h2>
              <span className="sub">· {productos.length} {productos.length === 1 ? 'producto' : 'productos'}</span>
              <div className="spacer" />
              <button onClick={addProducto} className="btn-d sm">
                <Plus size={12} /> Agregar línea
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[var(--color-surface)] text-left text-[var(--color-text-muted)]">
                    <th className="px-3 py-3 font-medium w-16 text-center">Cant</th>
                    <th className="px-3 py-3 font-medium w-16 text-center">Und</th>
                    <th className="px-3 py-3 font-medium" style={{ minWidth: 280 }}>Descripción</th>
                    <th className="px-3 py-3 font-medium w-28 text-center">Imagen</th>
                    <th className="px-3 py-3 font-medium w-32 text-right">Precio Unit.</th>
                    <th className="px-3 py-3 font-medium w-28 text-right">Total</th>
                    <th className="px-3 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((p, i) => (
                    <tr key={i} className="border-t border-[var(--color-border)] hover:bg-[#fafbfc] transition-colors" style={{ minHeight: 60 }}>
                      <td className="px-3 py-3 text-center">
                        <input
                          type="number"
                          value={p.cantidad}
                          onChange={e => updateProducto(i, 'cantidad', Math.max(1, Number(e.target.value)))}
                          min={1}
                          step="any"
                          className="w-14 text-xs text-center px-2 py-2 rounded-lg border border-[var(--color-border)]"
                        />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <input
                          type="text"
                          value={p.unidad || 'UND'}
                          onChange={e => updateProducto(i, 'unidad', e.target.value)}
                          className="w-14 text-xs text-center px-2 py-2 rounded-lg border border-[var(--color-border)]"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <textarea
                          value={p.descripcion}
                          onChange={e => updateProducto(i, 'descripcion', e.target.value)}
                          rows={2}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-[var(--color-border)] resize-none leading-relaxed"
                        />
                      </td>
                      <td className="px-3 py-3 text-center">
                        {(() => {
                          const srcProd = productosOportunidad.find(pp =>
                            (pp.descripcion_comercial || pp.subtipo) === p.descripcion
                          )
                          // D-07: effective image = user-attached on line OR 3D render saved at creation
                          const effectiveImage = p.imagen_url || srcProd?.imagen_render || null
                          const hasUserImage = !!p.imagen_url
                          const uploading = imgUploadingIdx === i

                          if (effectiveImage) {
                            return (
                              <div className="relative group inline-block">
                                <img
                                  src={effectiveImage}
                                  alt={hasUserImage ? 'Imagen producto' : 'Render 3D'}
                                  className="w-[100px] h-[75px] object-contain rounded-lg border border-[var(--color-border)] cursor-pointer hover:shadow-lg transition-shadow"
                                  onClick={() => setImagenModal(effectiveImage)}
                                />
                                <div className="flex justify-center gap-1 mt-1">
                                  <label className="text-[9px] text-[var(--color-primary)] hover:underline cursor-pointer font-medium">
                                    Cambiar
                                    <input
                                      type="file"
                                      accept="image/png,image/jpeg,image/webp"
                                      className="hidden"
                                      disabled={uploading}
                                      onChange={e => {
                                        const f = e.target.files?.[0]
                                        if (f) handleImageUpload(i, f)
                                        e.currentTarget.value = ''
                                      }}
                                    />
                                  </label>
                                  {hasUserImage && (
                                    <>
                                      <span className="text-[9px] text-[var(--color-text-muted)]">|</span>
                                      <button
                                        type="button"
                                        onClick={() => removeImage(i)}
                                        className="text-[9px] text-red-500 hover:underline font-medium"
                                      >Eliminar</button>
                                    </>
                                  )}
                                </div>
                                {uploading && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-lg">
                                    <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                                  </div>
                                )}
                              </div>
                            )
                          }

                          // No image yet → show "Adjuntar imagen" button
                          return (
                            <label className="inline-flex flex-col items-center gap-1 text-[10px] text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium cursor-pointer border border-dashed border-[var(--color-border)] rounded-lg px-2 py-3 hover:border-[var(--color-primary)] transition-colors">
                              {uploading
                                ? <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                                : <ImageIcon size={16} />}
                              <span>{uploading ? 'Subiendo...' : 'Adjuntar imagen'}</span>
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                disabled={uploading}
                                onChange={e => {
                                  const f = e.target.files?.[0]
                                  if (f) handleImageUpload(i, f)
                                  e.currentTarget.value = ''
                                }}
                              />
                            </label>
                          )
                        })()}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <input
                          type="number"
                          value={p.precio_unitario}
                          onChange={e => updateProducto(i, 'precio_unitario', Math.max(0, Number(e.target.value)))}
                          min={0}
                          className="w-28 text-xs text-right px-3 py-2 rounded-lg border border-[var(--color-border)] tabular-nums"
                        />
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-xs tabular-nums">{formatCOP(p.precio_unitario * p.cantidad)}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          {(() => {
                            const srcProd = productosOportunidad.find(pp =>
                              (pp.descripcion_comercial || pp.subtipo) === p.descripcion && pp.apu_resultado
                            )
                            if (!srcProd) return null
                            return (
                              <button
                                onClick={() => {
                                  const { blob: apuBlob, filename: apuFilename } = exportApuExcel({
                                    resultado: srcProd.apu_resultado!,
                                    config: srcProd.configuracion || CONFIG_MESA_DEFAULT,
                                    cotizacionNumero: cotizacion?.numero,
                                    empresaNombre: empresa?.nombre,
                                    contactoNombre: contacto?.nombre,
                                  })
                                  downloadBlob(apuBlob, apuFilename)

                                  // Fire-and-forget: upload APU to Supabase Storage
                                  if (oportunidad && cotizacion) {
                                    const apuFile = new File([apuBlob], apuFilename, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
                                    uploadCotizacionFile(oportunidad.id, cotizacion.id, apuFile, 'apu').then(res => {
                                      if ('error' in res) {
                                        console.warn('[APU upload] Error:', res.error)
                                        return
                                      }
                                      dispatch({
                                        type: 'UPDATE_COTIZACION',
                                        payload: {
                                          id: cotizacion.id,
                                          archivo_apu_url: res.url,
                                          archivo_apu_nombre: res.nombre,
                                        },
                                      })
                                      svcCotizaciones.updateCotizacion({
                                        id: cotizacion.id,
                                        archivo_apu_url: res.url,
                                        archivo_apu_nombre: res.nombre,
                                      } as any)
                                    })
                                  }
                                }}
                                className="p-1.5 rounded-lg text-green-500 hover:text-green-700 hover:bg-green-50 transition-all"
                                title="Descargar APU Excel"
                              >
                                <FileSpreadsheet size={14} />
                              </button>
                            )
                          })()}
                          <button onClick={() => removeProducto(i)} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Datos generales */}
          <div className="section" style={{ marginTop: 0 }}>
            <div className="section-head">
              <h2>Datos generales</h2>
              <span className="sub">tiempo de entrega · transporte</span>
            </div>
            <div className="section-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label className="mono" style={{ fontSize: 10, color: 'var(--color-text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>
                  Tiempo de entrega
                </label>
                <input
                  type="text"
                  value={tiempoEntrega}
                  onChange={e => setTiempoEntrega(e.target.value)}
                  style={{ width: '100%', fontSize: 12.5, padding: '7px 10px' }}
                />
              </div>
              <div>
                <label className="mono" style={{ fontSize: 10, color: 'var(--color-text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>
                  Transporte
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: incluyeTransporte ? 'var(--color-primary-weak)' : 'var(--color-surface)', cursor: 'pointer', fontSize: 12.5 }}>
                  <input
                    type="checkbox"
                    checked={incluyeTransporte}
                    onChange={e => setIncluyeTransporte(e.target.checked)}
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  <span style={{ fontWeight: 500 }}>Incluye transporte</span>
                </label>
              </div>
            </div>
          </div>

          <div className="section" style={{ marginTop: 0 }}>
            <div className="section-head">
              <h2>Condiciones comerciales</h2>
              <span className="sub">· {condicionesText.split('\n').filter(l => l.trim()).length} cláusulas</span>
              <div className="spacer" />
              <button
                onClick={() => setCondicionesText(prev => prev + (prev ? '\n' : '') + '')}
                className="btn-d sm"
              ><Plus size={12} /> Agregar</button>
            </div>
            <div className="section-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {condicionesText.split('\n').map((line, i) => {
                // Aprox altura por caracteres — mínimo 2 líneas, hasta 10 según longitud
                const estRows = Math.min(10, Math.max(2, Math.ceil((line.length || 1) / 80)))
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <textarea
                      value={line}
                      onChange={e => {
                        const lines = condicionesText.split('\n')
                        lines[i] = e.target.value
                        setCondicionesText(lines.join('\n'))
                      }}
                      rows={estRows}
                      style={{
                        flex: 1,
                        fontSize: 12.5,
                        padding: '8px 10px',
                        lineHeight: 1.5,
                        resize: 'vertical',
                        fontFamily: 'inherit',
                      }}
                      placeholder="Nueva cláusula…"
                    />
                    <button
                      onClick={() => {
                        const lines = condicionesText.split('\n').filter((_, idx) => idx !== i)
                        setCondicionesText(lines.join('\n'))
                      }}
                      className="btn-d ghost icon sm"
                      style={{ color: 'var(--color-accent-red)', marginTop: 4 }}
                      title="Eliminar cláusula"
                    ><X size={12} /></button>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="section" style={{ marginTop: 0 }}>
            <div className="section-head">
              <h2>No incluye</h2>
              <span className="sub">· {noIncluyeText.split('\n').filter(l => l.trim()).length} ítems</span>
              <div className="spacer" />
              <button
                onClick={() => setNoIncluyeText(prev => prev + (prev ? '\n' : '') + '')}
                className="btn-d sm"
              ><Plus size={12} /> Agregar</button>
            </div>
            <div className="section-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {noIncluyeText.split('\n').map((line, i) => {
                const estRows = Math.min(10, Math.max(2, Math.ceil((line.length || 1) / 80)))
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <textarea
                      value={line}
                      onChange={e => {
                        const lines = noIncluyeText.split('\n')
                        lines[i] = e.target.value
                        setNoIncluyeText(lines.join('\n'))
                      }}
                      rows={estRows}
                      style={{
                        flex: 1,
                        fontSize: 12.5,
                        padding: '8px 10px',
                        lineHeight: 1.5,
                        resize: 'vertical',
                        fontFamily: 'inherit',
                      }}
                      placeholder="Nuevo ítem…"
                    />
                    <button
                      onClick={() => {
                        const lines = noIncluyeText.split('\n').filter((_, idx) => idx !== i)
                        setNoIncluyeText(lines.join('\n'))
                      }}
                      className="btn-d ghost icon sm"
                      style={{ color: 'var(--color-accent-red)', marginTop: 4 }}
                      title="Eliminar ítem"
                    ><X size={12} /></button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ─── ASIDE (handoff pattern: Totales + Actions + Versiones) ─── */}
        <aside className="side-col">
          {/* Totales card */}
          <div className="cotedit-totales">
            <div className="l">Totales</div>
            <div className="row">
              <span className="k">Subtotal</span>
              <span className="v">{formatCOP(subtotal)}</span>
            </div>
            <div className="row">
              <span className="k">IVA (19%)</span>
              <span className="v">{formatCOP(iva)}</span>
            </div>
            <div className="grand">
              <span className="k">Total</span>
              <span className="v">{formatCOP(total)}</span>
            </div>
            <div className="sub-stats">
              <div className="stat">
                <div className="l">Productos</div>
                <div className="v">{productos.length}</div>
              </div>
              <div className="stat">
                <div className="l">Líneas</div>
                <div className="v">{productos.length}</div>
              </div>
            </div>
          </div>

          {/* Actions stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
            <button
              onClick={() => setShowPdfModal(true)}
              disabled={total <= 0}
              className="btn-d accent"
              style={{ justifyContent: 'center', height: 36, opacity: total <= 0 ? 0.4 : 1 }}
            >
              <Download size={13} /> Descargar PDF
            </button>
            <button
              onClick={saveDraft}
              className="btn-d"
              style={{ justifyContent: 'flex-start' }}
            >
              <Save size={12} /> Guardar borrador
            </button>
            {oportunidad && (
              <button
                onClick={() => navigate(`/oportunidades/${oportunidad.id}`)}
                className="btn-d"
                style={{ justifyContent: 'flex-start' }}
              >
                <ArrowLeft size={12} /> Volver a oportunidad
              </button>
            )}
          </div>

          {total <= 0 && (
            <p style={{ fontSize: 11, color: 'var(--color-accent-red)', textAlign: 'center', marginBottom: 12 }}>
              No se puede generar PDF con total $0
            </p>
          )}

          {/* Versiones card (cotizaciones hermanas) */}
          {versiones.length > 1 && (
            <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 14 }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--color-text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                Versiones ({versiones.length})
              </div>
              {versiones.map(v => {
                const letter = v.numero.match(/([A-Z])$/)?.[1] || 'A'
                const active = v.id === cotizacion.id
                return (
                  <div
                    key={v.id}
                    onClick={() => !active && navigate(`/cotizaciones/${v.id}/editar`)}
                    style={{
                      display: 'flex',
                      gap: 10,
                      padding: '8px 0',
                      borderBottom: '1px solid var(--color-border-light)',
                      alignItems: 'flex-start',
                      cursor: active ? 'default' : 'pointer',
                    }}
                  >
                    <span style={{
                      display: 'inline-block', padding: '2px 7px', borderRadius: 4,
                      fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 600,
                      background: active ? 'var(--color-text)' : 'var(--color-surface-2)',
                      color: active ? 'var(--color-surface)' : 'var(--color-text-label)',
                      border: '1px solid ' + (active ? 'var(--color-text)' : 'var(--color-border)'),
                      letterSpacing: '0.04em', flexShrink: 0,
                    }}>v{letter}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)', lineHeight: 1.35 }}>
                        <span className={`state-pill ${v.estado}`} style={{ fontSize: 9 }}>{v.estado}</span>
                      </div>
                      <div className="mono" style={{ fontSize: 10, color: 'var(--color-text-faint)', marginTop: 2 }}>{formatDate(v.fecha)}</div>
                    </div>
                    <div className="mono" style={{ textAlign: 'right', fontSize: 10.5, color: 'var(--color-text-label)' }}>
                      {v.total ? formatCOP(v.total, { short: true }) : '—'}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </aside>
      </div>

      {showPdfModal && (
        <PdfNameModal
          defaultNumero={cotizacion.numero}
          defaultNombreProducto={suggestedProductName}
          empresaNombre={empresa?.nombre || ''}
          contactoNombre={contacto?.nombre || ''}
          onConfirm={handleGenerarPdf}
          onClose={() => setShowPdfModal(false)}
        />
      )}

      {/* Image modal */}
      {imagenModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center modal-overlay animate-fade-in"
          onClick={() => setImagenModal(null)}
        >
          <div className="relative bg-white modal-card p-4 max-w-2xl" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setImagenModal(null)}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
            >
              <X size={16} />
            </button>
            <img src={imagenModal} alt="Render 3D completo" className="w-full rounded-lg" />
          </div>
        </div>
      )}
    </div>
  )
}

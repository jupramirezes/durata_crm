import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { CotizacionProducto, CONFIG_MESA_DEFAULT } from '../types'
import { formatCOP, formatDate } from '../lib/utils'
import { generarPdfCotizacion } from '../lib/generar-pdf'
import { exportApuExcel } from '../lib/exportar-apu'
import PdfNameModal from '../components/PdfNameModal'
import {
  ArrowLeft, FileText, Save, Download, Plus, Trash2, Check,
  Mail, Phone, MapPin, Hash, Building2, X, FileSpreadsheet
} from 'lucide-react'

export default function CotizacionEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useStore()

  const cotizacion = state.cotizaciones.find(c => c.id === id)
  const oportunidad = cotizacion ? state.oportunidades.find(o => o.id === cotizacion.oportunidad_id) : null
  const empresa = oportunidad ? state.empresas.find(e => e.id === oportunidad.empresa_id) : null
  const contacto = oportunidad ? state.contactos.find(ct => ct.id === oportunidad.contacto_id) : null
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

    const productosForPdf = synced.map((p, i) => ({
      id: String(i),
      oportunidad_id: oportunidad?.id || '',
      categoria: 'Mesas',
      subtipo: p.descripcion,
      configuracion: {} as any,
      precio_calculado: p.precio_unitario,
      descripcion_comercial: p.descripcion,
      cantidad: p.cantidad,
      unidad: p.unidad || 'UND',
    }))
    const totalPdf = generarPdfCotizacion({
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
    dispatch({
      type: 'UPDATE_COTIZACION',
      payload: {
        id: cotizacion.id,
        total: totalPdf,
        productos_snapshot: toSnapshot(synced),
        tiempoEntrega,
        incluyeTransporte,
        condicionesItems,
        noIncluyeItems,
      },
    })
    setShowPdfModal(false)
  }

  if (!cotizacion) {
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

  return (
    <div className="p-6 max-w-5xl animate-fade-in">
      {saved && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <Check size={16} strokeWidth={3} />
          <span className="text-xs font-semibold">Borrador guardado</span>
        </div>
      )}

      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] mb-4 transition-colors">
        <ArrowLeft size={14} /> Volver
      </button>

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <FileText size={20} className="text-[var(--color-accent-green)]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Editar Cotizacion <span className="font-mono text-[var(--color-primary)]">{cotizacion.numero}</span></h2>
            <p className="text-xs text-[var(--color-text-muted)]">Fecha: {formatDate(cotizacion.fecha)} &bull; Estado: {cotizacion.estado}</p>
            {/[A-Z]$/.test(cotizacion.numero) && (
              <p className="text-[10px] text-amber-600 mt-0.5">Recotización de COT-{cotizacion.numero.replace(/[A-Z]$/, '')}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={saveDraft} className="flex items-center gap-1.5 bg-white border border-[var(--color-border)] hover:border-gray-300 text-[var(--color-text)] h-11 px-6 rounded-[10px] text-sm font-semibold transition-all">
            <Save size={14} /> Guardar borrador
          </button>
          <button onClick={() => { if (subtotal <= 0) { alert('No se puede generar PDF con total $0'); return } setShowPdfModal(true) }} className="flex items-center gap-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white h-11 px-6 rounded-[10px] text-sm font-bold transition-all disabled:opacity-40" disabled={subtotal <= 0}>
            <Download size={14} /> Descargar PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-5">
        {/* Main content */}
        <div className="space-y-4">
          {/* Client info */}
          <div className="bg-white rounded-lg border border-[var(--color-border)] p-4">
            <h3 className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2.5">Datos del cliente</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <Building2 size={12} className="text-[var(--color-text-muted)]" />
                <span className="font-medium">{empresa.nombre}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Mail size={12} className="text-[var(--color-text-muted)]" />
                <span>{contacto?.correo || '—'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Phone size={12} className="text-[var(--color-text-muted)]" />
                <span>{contacto?.whatsapp || '—'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <MapPin size={12} className="text-[var(--color-text-muted)]" />
                <span>{oportunidad.ubicacion || empresa.direccion || '—'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Hash size={12} className="text-[var(--color-text-muted)]" />
                <span>NIT: {empresa.nit || '—'}</span>
              </div>
            </div>
          </div>

          {/* Products table */}
          <div className="bg-white rounded-lg border border-[var(--color-border)] p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Lineas de cotizacion</h3>
              <button onClick={addProducto} className="flex items-center gap-1 text-[10px] text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium">
                <Plus size={12} /> Agregar linea
              </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-[var(--color-border)]">
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
                          if (srcProd?.imagen_render) {
                            return (
                              <div className="relative group">
                                <img
                                  src={srcProd.imagen_render}
                                  alt="Render 3D"
                                  className="w-[100px] h-[75px] object-contain rounded-lg border border-[var(--color-border)] cursor-pointer hover:shadow-lg transition-shadow"
                                  onClick={() => setImagenModal(srcProd.imagen_render!)}
                                />
                              </div>
                            )
                          }
                          if (srcProd?.apu_resultado) {
                            return (
                              <span className="text-[10px] text-[#94a3b8] italic">Render guardado al crear</span>
                            )
                          }
                          return null
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
                                onClick={() => exportApuExcel({
                                  resultado: srcProd.apu_resultado!,
                                  config: srcProd.configuracion || CONFIG_MESA_DEFAULT,
                                  cotizacionNumero: cotizacion?.numero,
                                  empresaNombre: empresa?.nombre,
                                  contactoNombre: contacto?.nombre,
                                })}
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

          {/* Conditions */}
          <div className="bg-white rounded-lg border border-[var(--color-border)] p-4">
            <h3 className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2.5">Datos generales</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-medium text-[var(--color-text-muted)] mb-1 block">Tiempo de entrega</label>
                <input
                  type="text"
                  value={tiempoEntrega}
                  onChange={e => setTiempoEntrega(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md text-xs border border-[var(--color-border)]"
                />
              </div>
              <label className="flex items-center gap-2 text-xs cursor-pointer rounded-md p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)]">
                <input type="checkbox" checked={incluyeTransporte} onChange={e => setIncluyeTransporte(e.target.checked)} className="rounded shrink-0" />
                <span>Incluye transporte</span>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[var(--color-border)] p-4">
            <h3 className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Condiciones comerciales</h3>
            <div className="space-y-2">
              {condicionesText.split('\n').map((line, i) => (
                <div key={i} className="flex items-start gap-2">
                  <input
                    type="text"
                    value={line}
                    onChange={e => {
                      const lines = condicionesText.split('\n')
                      lines[i] = e.target.value
                      setCondicionesText(lines.join('\n'))
                    }}
                    className="flex-1 text-xs px-3 py-2.5 rounded-lg bg-slate-50 border border-[var(--color-border)] focus:bg-white focus:border-[var(--color-primary)] transition-colors"
                  />
                  <button
                    onClick={() => {
                      const lines = condicionesText.split('\n').filter((_, idx) => idx !== i)
                      setCondicionesText(lines.join('\n'))
                    }}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 mt-0.5"
                  ><X size={12} /></button>
                </div>
              ))}
              <button
                onClick={() => setCondicionesText(prev => prev + (prev ? '\n' : '') + '')}
                className="flex items-center gap-1 text-[10px] text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium mt-1"
              ><Plus size={12} /> Agregar condición</button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[var(--color-border)] p-4">
            <h3 className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">No incluye</h3>
            <div className="space-y-2">
              {noIncluyeText.split('\n').map((line, i) => (
                <div key={i} className="flex items-start gap-2">
                  <input
                    type="text"
                    value={line}
                    onChange={e => {
                      const lines = noIncluyeText.split('\n')
                      lines[i] = e.target.value
                      setNoIncluyeText(lines.join('\n'))
                    }}
                    className="flex-1 text-xs px-3 py-2.5 rounded-lg bg-slate-50 border border-[var(--color-border)] focus:bg-white focus:border-[var(--color-primary)] transition-colors"
                  />
                  <button
                    onClick={() => {
                      const lines = noIncluyeText.split('\n').filter((_, idx) => idx !== i)
                      setNoIncluyeText(lines.join('\n'))
                    }}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 mt-0.5"
                  ><X size={12} /></button>
                </div>
              ))}
              <button
                onClick={() => setNoIncluyeText(prev => prev + (prev ? '\n' : '') + '')}
                className="flex items-center gap-1 text-[10px] text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium mt-1"
              ><Plus size={12} /> Agregar ítem</button>
            </div>
          </div>
        </div>

        {/* Sidebar - Totals */}
        <div className="space-y-3 sticky top-4 self-start">
          {/* Total card */}
          <div className="relative overflow-hidden rounded-lg border border-emerald-500/30" style={{ background: 'linear-gradient(135deg, #059669 0%, #34d399 100%)' }}>
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/10 -translate-y-5 translate-x-5" />
            <div className="p-4 text-center relative">
              <div className="text-[9px] text-white/70 uppercase tracking-widest font-semibold mb-0.5">Total con IVA</div>
              <div className="text-2xl font-black text-white font-mono">{formatCOP(total)}</div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-white rounded-lg border border-[var(--color-border)] p-4 space-y-2.5">
            <h4 className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Resumen</h4>

            <div className="space-y-1.5">
              {productos.map((p, i) => (
                <div key={i} className="flex justify-between text-[10px]">
                  <span className="text-[var(--color-text-muted)] truncate max-w-36">{fmtQty(p.cantidad)} {p.unidad || 'UND'} - {p.descripcion}</span>
                  <span className="font-medium whitespace-nowrap ml-2 font-mono">{formatCOP(p.precio_unitario * p.cantidad)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-[var(--color-border)] pt-2.5 space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Subtotal</span><span className="font-medium font-mono">{formatCOP(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">IVA (19%)</span><span className="font-medium font-mono">{formatCOP(iva)}</span></div>
              <div className="flex justify-between font-bold text-sm border-t border-[var(--color-border)] pt-2"><span>Total</span><span className="text-[var(--color-accent-green)] font-mono">{formatCOP(total)}</span></div>
            </div>
          </div>

          <button onClick={saveDraft} className="w-full flex items-center justify-center gap-2 bg-white border border-[var(--color-border)] hover:border-gray-300 text-[var(--color-text)] h-12 px-7 rounded-xl text-sm font-semibold transition-all">
            <Save size={16} /> Guardar borrador
          </button>
          {total <= 0 && (
            <p className="text-xs text-red-500 text-center">No se puede generar PDF con total $0</p>
          )}
          <button onClick={() => setShowPdfModal(true)} disabled={total <= 0} className={`w-full flex items-center justify-center gap-2 h-12 px-7 rounded-xl text-sm font-bold transition-all ${total <= 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white'}`}>
            <Download size={16} /> Descargar PDF
          </button>
        </div>
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

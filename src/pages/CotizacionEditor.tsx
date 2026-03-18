import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { CotizacionProducto } from '../types'
import { formatCOP, formatDate } from '../lib/utils'
import { generarPdfCotizacion } from '../lib/generar-pdf'
import PdfNameModal from '../components/PdfNameModal'
import {
  ArrowLeft, FileText, Save, Download, Plus, Trash2, Check,
  Mail, Phone, MapPin, Hash, Building2
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

  const initialProductos: CotizacionProducto[] = useMemo(() => {
    if (cotizacion?.productos_snapshot && cotizacion.productos_snapshot.length > 0) {
      return cotizacion.productos_snapshot
    }
    return productosOportunidad.map(p => ({
      descripcion: p.descripcion_comercial || p.subtipo,
      cantidad: p.cantidad,
      precio_unitario: p.precio_calculado || 0,
      unidad: 'UND',
    }))
  }, [cotizacion?.id])

  const [productos, setProductos] = useState<CotizacionProducto[]>(initialProductos)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tiempoEntrega, setTiempoEntrega] = useState(cotizacion?.tiempoEntrega || '25 d\u00edas h\u00e1biles o a convenir')
  const [incluyeTransporte, setIncluyeTransporte] = useState(cotizacion?.incluyeTransporte ?? true)
  const [condicionesText, setCondicionesText] = useState(cotizacion?.condicionesItems?.join('\n') || '')
  const [noIncluyeText, setNoIncluyeText] = useState(cotizacion?.noIncluyeItems?.join('\n') || '')

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

  function saveDraft() {
    if (!cotizacion) return
    dispatch({
      type: 'UPDATE_COTIZACION',
      payload: {
        id: cotizacion.id,
        total,
        productos_snapshot: productos,
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
    const fecha = cotizacion.fecha || new Date().toISOString().split('T')[0]
    const numero = cotizacion.numero

    const condicionesItems = condicionesText.split('\n').filter(l => l.trim())
    const noIncluyeItems = noIncluyeText.split('\n').filter(l => l.trim())

    const productosForPdf = productos.map((p, i) => ({
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
      cliente: {
        empresa: empresa.nombre,
        nombre: contacto.nombre,
        whatsapp: contacto.whatsapp,
        correo: contacto.correo,
        nit: empresa.nit,
        ubicacion: oportunidad?.ubicacion || empresa.direccion,
      },
      productos: productosForPdf,
    })
    dispatch({
      type: 'UPDATE_COTIZACION',
      payload: {
        id: cotizacion.id,
        total: totalPdf,
        productos_snapshot: productos,
        tiempoEntrega,
        incluyeTransporte,
        condicionesItems,
        noIncluyeItems,
      },
    })
    setShowPdfModal(false)
  }

  if (!cotizacion || !oportunidad || !empresa || !contacto) {
    return (
      <div className="p-6 text-[var(--color-text-muted)]">
        <p className="text-sm">Cotizacion no encontrada.</p>
        <button onClick={() => navigate('/cotizaciones')} className="mt-3 text-[var(--color-primary)] hover:underline text-xs">
          Volver a cotizaciones
        </button>
      </div>
    )
  }

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
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={saveDraft} className="flex items-center gap-1.5 bg-white border border-[var(--color-border)] hover:border-gray-300 text-[var(--color-text)] px-3 py-2 rounded-md text-xs font-semibold transition-all">
            <Save size={12} /> Guardar borrador
          </button>
          <button onClick={() => setShowPdfModal(true)} className="flex items-center gap-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-3 py-2 rounded-md text-xs font-bold transition-all">
            <Download size={12} /> Descargar PDF
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
                <span>{contacto.correo || '\u2014'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Phone size={12} className="text-[var(--color-text-muted)]" />
                <span>{contacto.whatsapp || '\u2014'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <MapPin size={12} className="text-[var(--color-text-muted)]" />
                <span>{oportunidad.ubicacion || empresa.direccion || '\u2014'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Hash size={12} className="text-[var(--color-text-muted)]" />
                <span>NIT: {empresa.nit || '\u2014'}</span>
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
                    <th className="px-2.5 py-2 font-medium w-14 text-center">Cant</th>
                    <th className="px-2.5 py-2 font-medium w-14 text-center">Und</th>
                    <th className="px-2.5 py-2 font-medium">Descripcion</th>
                    <th className="px-2.5 py-2 font-medium w-24 text-right">Precio Unit.</th>
                    <th className="px-2.5 py-2 font-medium w-24 text-right">Total</th>
                    <th className="px-2.5 py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((p, i) => (
                    <tr key={i} className={`border-t border-[var(--color-border)] ${i % 2 === 1 ? 'bg-[var(--color-surface)]' : 'bg-white'}`}>
                      <td className="px-2.5 py-1.5 text-center">
                        <input
                          type="number"
                          value={p.cantidad}
                          onChange={e => updateProducto(i, 'cantidad', Number(e.target.value))}
                          min={0}
                          step="any"
                          className="w-12 text-[10px] text-center px-1 py-1 rounded border border-[var(--color-border)]"
                        />
                      </td>
                      <td className="px-2.5 py-1.5 text-center">
                        <input
                          type="text"
                          value={p.unidad || 'UND'}
                          onChange={e => updateProducto(i, 'unidad', e.target.value)}
                          className="w-10 text-[10px] text-center px-1 py-1 rounded border border-[var(--color-border)]"
                        />
                      </td>
                      <td className="px-2.5 py-1.5">
                        <textarea
                          value={p.descripcion}
                          onChange={e => updateProducto(i, 'descripcion', e.target.value)}
                          rows={2}
                          className="w-full text-[10px] px-1.5 py-1 rounded border border-[var(--color-border)] resize-none"
                        />
                      </td>
                      <td className="px-2.5 py-1.5 text-right">
                        <input
                          type="number"
                          value={p.precio_unitario}
                          onChange={e => updateProducto(i, 'precio_unitario', Math.max(0, Number(e.target.value)))}
                          min={0}
                          className="w-20 text-[10px] text-right px-1.5 py-1 rounded border border-[var(--color-border)]"
                        />
                      </td>
                      <td className="px-2.5 py-1.5 text-right font-bold text-[10px] font-mono">{formatCOP(p.precio_unitario * p.cantidad)}</td>
                      <td className="px-2.5 py-1.5">
                        <button onClick={() => removeProducto(i)} className="p-0.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-all">
                          <Trash2 size={12} />
                        </button>
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
            <h3 className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2.5">Condiciones comerciales</h3>
            <textarea
              value={condicionesText}
              onChange={e => setCondicionesText(e.target.value)}
              rows={5}
              placeholder="Una condicion por linea..."
              className="w-full text-[10px] px-2.5 py-1.5 rounded-md border border-[var(--color-border)] resize-none leading-relaxed"
            />
          </div>

          <div className="bg-white rounded-lg border border-[var(--color-border)] p-4">
            <h3 className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2.5">No incluye</h3>
            <textarea
              value={noIncluyeText}
              onChange={e => setNoIncluyeText(e.target.value)}
              rows={3}
              placeholder="Una clausula por linea..."
              className="w-full text-[10px] px-2.5 py-1.5 rounded-md border border-[var(--color-border)] resize-none leading-relaxed"
            />
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

          <button onClick={saveDraft} className="w-full flex items-center justify-center gap-2 bg-white border border-[var(--color-border)] hover:border-gray-300 text-[var(--color-text)] px-4 py-2.5 rounded-lg text-xs font-semibold transition-all">
            <Save size={14} /> Guardar borrador
          </button>
          {total <= 0 && (
            <p className="text-[10px] text-red-500 text-center">No se puede generar PDF con total $0</p>
          )}
          <button onClick={() => setShowPdfModal(true)} disabled={total <= 0} className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${total <= 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white'}`}>
            <Download size={14} /> Descargar PDF
          </button>
        </div>
      </div>

      {showPdfModal && (
        <PdfNameModal
          defaultNumero={cotizacion.numero}
          onConfirm={handleGenerarPdf}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </div>
  )
}

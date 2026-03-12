import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { ETAPAS } from '../types'
import { formatDate, formatCOP, getInitials, getAvatarColor } from '../lib/utils'
import CotizacionModal from '../components/CotizacionModal'
import { ArrowLeft, Plus, FileText, Mail, Phone, MapPin, Calendar, Tag, Package, Hash, Trash2 } from 'lucide-react'

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={14} className="text-[var(--color-text-muted)]" />
        <span className="text-xs text-[var(--color-text-muted)] font-medium">{label}</span>
      </div>
      <span className="text-sm text-[var(--color-text)]">{value || '\u2014'}</span>
    </div>
  )
}

export default function ClienteDetalle() {
  const { id } = useParams()
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const cliente = state.clientes.find(c => c.id === id)
  const historial = state.historial.filter(h => h.cliente_id === id).reverse()
  const productos = state.productos.filter(p => p.cliente_id === id)
  const cotizaciones = state.cotizaciones.filter(c => c.cliente_id === id)

  const [showCotModal, setShowCotModal] = useState(false)

  if (!cliente) return <div className="p-8 text-[var(--color-text-muted)]">Cliente no encontrado</div>

  const etapa = ETAPAS.find(e => e.key === cliente.etapa)

  function getDefaultNumero() {
    const year = new Date().getFullYear()
    const numExistentes = state.cotizaciones.filter(c => c.numero.startsWith(`COT-${year}-`)).length
    return `COT-${year}-${String(numExistentes + 1).padStart(3, '0')}`
  }

  function handleCrearCotizacion(data: { numero: string; tiempoEntrega: string; incluyeTransporte: boolean; condicionesItems: string[]; noIncluyeItems: string[] }) {
    if (productos.length === 0 || !cliente) return
    const fecha = new Date().toISOString().split('T')[0]
    const subtotal = productos.reduce((s, p) => s + (p.precio_calculado || 0) * p.cantidad, 0)
    const total = subtotal + subtotal * 0.19
    const cotId = String(Date.now())
    dispatch({
      type: 'ADD_COTIZACION',
      payload: {
        cliente_id: cliente.id,
        numero: data.numero,
        fecha,
        estado: 'borrador',
        total,
        tiempoEntrega: data.tiempoEntrega,
        incluyeTransporte: data.incluyeTransporte,
        condicionesItems: data.condicionesItems,
        noIncluyeItems: data.noIncluyeItems,
        productos_snapshot: productos.map(p => ({
          descripcion: p.descripcion_comercial || p.subtipo,
          cantidad: p.cantidad,
          precio_unitario: p.precio_calculado || 0,
        })),
      },
    })
    setShowCotModal(false)
    // Navigate to editor with the new cotizacion
    setTimeout(() => navigate(`/cotizaciones/${cotId}/editar`), 100)
  }

  return (
    <div className="p-8 space-y-6 max-w-5xl animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-200">
        <ArrowLeft size={16} /> Volver
      </button>

      {/* Header */}
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-lg" style={{ background: getAvatarColor(cliente.nombre) }}>
          {getInitials(cliente.nombre)}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-[var(--color-text)]">{cliente.nombre}</h2>
          <p className="text-[var(--color-text-muted)]">{cliente.empresa}</p>
        </div>
        <span className="text-sm px-4 py-1.5 rounded-full font-medium border" style={{ background: etapa?.color + '15', color: etapa?.color, borderColor: etapa?.color + '30' }}>{etapa?.label}</span>
      </div>

      {/* Info grid */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
        <div className="grid grid-cols-3 gap-6">
          <InfoItem icon={Mail} label="Correo" value={cliente.correo} />
          <InfoItem icon={Phone} label="WhatsApp" value={cliente.whatsapp} />
          <InfoItem icon={MapPin} label="Ubicacion" value={cliente.ubicacion} />
          <InfoItem icon={Hash} label="NIT" value={cliente.nit} />
          <InfoItem icon={Calendar} label="Fecha ingreso" value={formatDate(cliente.fecha_ingreso)} />
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Tag size={14} className="text-[var(--color-text-muted)]" />
              <span className="text-xs text-[var(--color-text-muted)] font-medium">Etapa</span>
            </div>
            <select value={cliente.etapa} onChange={e => dispatch({ type: 'MOVE_ETAPA', payload: { clienteId: cliente.id, nuevaEtapa: e.target.value as any } })} className="px-3 py-1.5 rounded-lg text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)]">
              {ETAPAS.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
            </select>
          </div>
        </div>
        {cliente.notas && (
          <div className="mt-5 pt-5 border-t border-[var(--color-border)]">
            <span className="text-xs text-[var(--color-text-muted)] font-medium block mb-1.5">Notas</span>
            <p className="text-sm leading-relaxed text-[var(--color-text)]">{cliente.notas}</p>
          </div>
        )}
      </div>

      {/* Timeline */}
      {historial.length > 0 && (
        <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
          <h3 className="font-semibold text-[var(--color-text)] mb-4">Historial de etapas</h3>
          <div className="space-y-0">
            {historial.map((h, i) => {
              const etapaNueva = ETAPAS.find(e => e.key === h.etapa_nueva)
              return (
                <div key={h.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full shrink-0 z-10 ring-4 ring-white" style={{ background: etapaNueva?.color }} />
                    {i < historial.length - 1 && <div className="w-0.5 flex-1 bg-[var(--color-border)] min-h-[20px]" />}
                  </div>
                  <div className="pb-4 -mt-0.5">
                    <div className="text-sm">
                      <span className="text-[var(--color-text-muted)]">{ETAPAS.find(e => e.key === h.etapa_anterior)?.label}</span>
                      <span className="text-[var(--color-text-muted)] mx-1.5">{'\u2192'}</span>
                      <span className="font-medium text-[var(--color-text)]">{etapaNueva?.label}</span>
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{formatDate(h.created_at)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Productos */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-semibold text-[var(--color-text)]">Productos solicitados</h3>
          <button onClick={() => navigate(`/clientes/${id}/configurar`)} className="flex items-center gap-2 bg-[var(--color-primary)] hover:opacity-90 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200">
            <Plus size={14} /> Agregar producto
          </button>
        </div>
        {productos.length === 0 ? (
          <div className="text-center py-8">
            <Package size={32} className="text-[var(--color-border)] mx-auto mb-3" />
            <p className="text-sm text-[var(--color-text-muted)]">Sin productos configurados.</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Haz clic en &quot;Agregar producto&quot; para comenzar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {productos.map(p => (
              <div key={p.id} className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)] hover:border-gray-300 transition-all duration-200">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 mt-0.5">
                      <Package size={18} className="text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-[var(--color-text)]">{p.subtipo}</div>
                      <div className="text-xs text-[var(--color-text-muted)] mt-1 max-w-2xl leading-relaxed">{p.descripcion_comercial}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 shrink-0 ml-4">
                    <div className="text-right">
                      <div className="font-bold text-lg text-[var(--color-text)]">{formatCOP(p.precio_calculado || 0)}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{'\u00d7'} {p.cantidad} und</div>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm('¿Eliminar este producto?')) {
                          dispatch({ type: 'DELETE_PRODUCTO', payload: { id: p.id } })
                        }
                      }}
                      className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                      title="Eliminar producto"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cotizaciones */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-semibold text-[var(--color-text)]">Cotizaciones</h3>
          {productos.length > 0 && (
            <button onClick={() => setShowCotModal(true)} className="flex items-center gap-2 bg-[var(--color-primary)] hover:opacity-90 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200">
              <FileText size={14} /> Generar cotizacion
            </button>
          )}
        </div>
        {cotizaciones.length === 0 ? (
          <div className="text-center py-8">
            <FileText size={32} className="text-[var(--color-border)] mx-auto mb-3" />
            <p className="text-sm text-[var(--color-text-muted)]">No hay cotizaciones generadas para este cliente.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F1F5F9] text-left text-[var(--color-text-muted)]">
                  <th className="px-4 py-3 font-medium">Numero</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cotizaciones.map((c, i) => (
                  <tr key={c.id} className={`border-t border-[var(--color-border)] ${i % 2 === 1 ? 'bg-[var(--color-surface)]' : 'bg-white'}`}>
                    <td className="px-4 py-3 font-mono text-sm text-[var(--color-text)]">{c.numero}</td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">{formatDate(c.fecha)}</td>
                    <td className="px-4 py-3 text-right font-bold text-[var(--color-text)]">{formatCOP(c.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium border ${c.estado === 'aprobada' ? 'bg-green-50 text-green-700 border-green-200' : c.estado === 'rechazada' ? 'bg-red-50 text-red-700 border-red-200' : c.estado === 'enviada' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>{c.estado}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/cotizaciones/${c.id}/editar`)}
                          className="text-xs px-3 py-1.5 rounded-lg text-[var(--color-primary)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] font-medium transition-all duration-200"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('¿Eliminar esta cotizacion?')) {
                              dispatch({ type: 'DELETE_COTIZACION', payload: { id: c.id } })
                            }
                          }}
                          className="text-xs px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 border border-red-200 font-medium transition-all duration-200"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCotModal && (
        <CotizacionModal
          defaultNumero={getDefaultNumero()}
          onConfirm={handleCrearCotizacion}
          onClose={() => setShowCotModal(false)}
        />
      )}
    </div>
  )
}

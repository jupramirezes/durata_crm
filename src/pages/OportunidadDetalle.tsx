import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { ETAPAS, findCotizador } from '../types'
import { formatDate, formatCOP } from '../lib/utils'
import { EtapaBadge, EstadoBadge } from '../components/ui'
import CotizacionModal from '../components/CotizacionModal'
import { ArrowLeft, Plus, FileText, Package, Trash2, Building2, Target, User, Edit3 } from 'lucide-react'

export default function OportunidadDetalle() {
  const { id } = useParams()
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const oportunidad = state.oportunidades.find(o => o.id === id)
  const empresa = oportunidad ? state.empresas.find(e => e.id === oportunidad.empresa_id) : null
  const contacto = oportunidad ? state.contactos.find(c => c.id === oportunidad.contacto_id) : null
  const historial = state.historial.filter(h => h.oportunidad_id === id).reverse()
  const productos = state.productos.filter(p => p.oportunidad_id === id)
  const cotizaciones = state.cotizaciones.filter(c => c.oportunidad_id === id)
  const cotizador = oportunidad ? findCotizador(oportunidad.cotizador_asignado) : null

  const [showCotModal, setShowCotModal] = useState(false)

  if (!oportunidad || !empresa) return <div className="p-6 text-[var(--color-text-muted)]">Oportunidad no encontrada</div>

  function getDefaultNumero() {
    const year = new Date().getFullYear()
    const numExistentes = state.cotizaciones.filter(c => c.numero.startsWith(`COT-${year}-`)).length
    return `COT-${year}-${String(numExistentes + 1).padStart(3, '0')}`
  }

  function handleCrearCotizacion(data: { numero: string; tiempoEntrega: string; incluyeTransporte: boolean; condicionesItems: string[]; noIncluyeItems: string[] }) {
    if (productos.length === 0 || !oportunidad) return
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
        oportunidad_id: oportunidad.id,
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

  return (
    <div className="p-6 space-y-4 max-w-5xl animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
        <ArrowLeft size={14} /> Volver
      </button>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <Target size={22} className="text-[var(--color-primary)]" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">{empresa.nombre}</h2>
          <p className="text-xs text-[var(--color-text-muted)]">{contacto?.nombre} &bull; {cotizador?.nombre}</p>
        </div>
        <div className="flex items-center gap-2">
          <EtapaBadge etapa={oportunidad.etapa} size="md" />
          <button
            onClick={() => {
              if (window.confirm('¿Seguro que deseas eliminar esta oportunidad? Se eliminarán también sus productos y cotizaciones.')) {
                dispatch({ type: 'DELETE_OPORTUNIDAD', payload: { id: oportunidad.id } })
                navigate('/pipeline')
              }
            }}
            className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-md text-red-500 hover:bg-red-50 border border-red-200 font-medium transition-all"
          >
            <Trash2 size={12} /> Eliminar
          </button>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-[var(--color-border)] p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Building2 size={12} className="text-[var(--color-primary)]" />
            <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Empresa</span>
          </div>
          <div className="text-xs font-medium mb-1">{empresa.nombre}</div>
          <div className="text-[10px] text-[var(--color-text-muted)] space-y-0.5">
            <div>NIT: {empresa.nit || '\u2014'}</div>
            <div>{empresa.direccion || '\u2014'}</div>
            <div>{empresa.sector}</div>
          </div>
          <button onClick={() => navigate(`/empresas/${empresa.id}`)} className="text-[10px] text-[var(--color-primary)] hover:underline mt-1.5 block">
            Ver todas las oportunidades
          </button>
        </div>

        <div className="bg-white rounded-lg border border-[var(--color-border)] p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <User size={12} className="text-[var(--color-primary)]" />
            <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Contacto</span>
          </div>
          <div className="text-xs font-medium mb-1">{contacto?.nombre}</div>
          <div className="text-[10px] text-[var(--color-text-muted)] space-y-0.5">
            <div>{contacto?.cargo || '\u2014'}</div>
            <div>{contacto?.correo || '\u2014'}</div>
            <div>{contacto?.whatsapp || '\u2014'}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[var(--color-border)] p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Target size={12} className="text-[var(--color-primary)]" />
            <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Oportunidad</span>
          </div>
          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Valor cotizado</span><span className="font-bold text-xs font-mono">{formatCOP(oportunidad.valor_cotizado)}</span></div>
            {oportunidad.valor_adjudicado > 0 && <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Valor adjudicado</span><span className="font-bold text-xs text-[var(--color-accent-green)] font-mono">{formatCOP(oportunidad.valor_adjudicado)}</span></div>}
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Fuente</span><span>{oportunidad.fuente_lead}</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Ingreso</span><span>{formatDate(oportunidad.fecha_ingreso)}</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Cotizador</span><span>{cotizador?.nombre}</span></div>
          </div>
        </div>
      </div>

      {oportunidad.notas && (
        <div className="bg-white rounded-lg border border-[var(--color-border)] p-4">
          <span className="text-[10px] text-[var(--color-text-muted)] font-medium block mb-1">Notas</span>
          <p className="text-xs leading-relaxed text-[var(--color-text)]">{oportunidad.notas}</p>
        </div>
      )}

      {/* Timeline */}
      {historial.length > 0 && (
        <div className="bg-white rounded-lg border border-[var(--color-border)] p-4">
          <h3 className="font-semibold text-xs text-[var(--color-text)] mb-3">Historial de etapas</h3>
          <div className="space-y-0">
            {historial.map((h, i) => {
              const etapaNueva = ETAPAS.find(e => e.key === h.etapa_nueva)
              return (
                <div key={h.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0 z-10 ring-3 ring-white" style={{ background: etapaNueva?.color }} />
                    {i < historial.length - 1 && <div className="w-0.5 flex-1 bg-[var(--color-border)] min-h-[16px]" />}
                  </div>
                  <div className="pb-3 -mt-0.5">
                    <div className="text-xs">
                      <span className="text-[var(--color-text-muted)]">{ETAPAS.find(e => e.key === h.etapa_anterior)?.label}</span>
                      <span className="text-[var(--color-text-muted)] mx-1">{'\u2192'}</span>
                      <span className="font-medium text-[var(--color-text)]">{etapaNueva?.label}</span>
                    </div>
                    <div className="text-[10px] text-[var(--color-text-muted)]">{formatDate(h.created_at)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Productos */}
      <div className="bg-white rounded-lg border border-[var(--color-border)] p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-xs text-[var(--color-text)]">Productos solicitados</h3>
          <button onClick={() => navigate(`/oportunidades/${id}/configurar`)} className="flex items-center gap-1.5 bg-[var(--color-primary)] hover:opacity-90 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-all">
            <Plus size={12} /> Agregar producto
          </button>
        </div>
        {productos.length === 0 ? (
          <div className="text-center py-6">
            <Package size={24} className="text-[var(--color-border)] mx-auto mb-2" />
            <p className="text-xs text-[var(--color-text-muted)]">Sin productos configurados.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {productos.map(p => (
              <div key={p.id} className="bg-[var(--color-surface)] rounded-lg p-3.5 border border-[var(--color-border)] hover:border-gray-300 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0 mt-0.5">
                      <Package size={14} className="text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-xs text-[var(--color-text)]">{p.subtipo}</div>
                      <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5 max-w-2xl leading-relaxed">{p.descripcion_comercial}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 shrink-0 ml-3">
                    <div className="text-right">
                      <div className="font-bold text-sm text-[var(--color-text)] font-mono">{formatCOP(p.precio_calculado || 0)}</div>
                      <div className="text-[10px] text-[var(--color-text-muted)]">{'\u00d7'} {p.cantidad} und</div>
                    </div>
                    <button
                      onClick={() => navigate(`/oportunidades/${id}/configurar?editar=${p.id}`)}
                      className="p-1.5 rounded text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                      title="Editar producto"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => { if (window.confirm('\u00bfEliminar este producto?')) dispatch({ type: 'DELETE_PRODUCTO', payload: { id: p.id } }) }}
                      className="p-1.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cotizaciones */}
      <div className="bg-white rounded-lg border border-[var(--color-border)] p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-xs text-[var(--color-text)]">Cotizaciones</h3>
          {productos.length > 0 && (
            <button onClick={() => setShowCotModal(true)} className="flex items-center gap-1.5 bg-[var(--color-primary)] hover:opacity-90 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-all">
              <FileText size={12} /> Generar cotizacion
            </button>
          )}
        </div>
        {cotizaciones.length === 0 ? (
          <div className="text-center py-6">
            <FileText size={24} className="text-[var(--color-border)] mx-auto mb-2" />
            <p className="text-xs text-[var(--color-text-muted)]">No hay cotizaciones generadas.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-[var(--color-border)]">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[var(--color-surface)] text-left text-[var(--color-text-muted)]">
                  <th className="px-3 py-2 font-medium">Numero</th>
                  <th className="px-3 py-2 font-medium">Fecha</th>
                  <th className="px-3 py-2 font-medium text-right">Total</th>
                  <th className="px-3 py-2 font-medium">Estado</th>
                  <th className="px-3 py-2 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cotizaciones.map((c, i) => (
                  <tr key={c.id} className={`border-t border-[var(--color-border)] ${i % 2 === 1 ? 'bg-[var(--color-surface)]' : 'bg-white'}`}>
                    <td className="px-3 py-2 font-mono">{c.numero}</td>
                    <td className="px-3 py-2 text-[var(--color-text-muted)]">{formatDate(c.fecha)}</td>
                    <td className="px-3 py-2 text-right font-bold font-mono">{formatCOP(c.total)}</td>
                    <td className="px-3 py-2"><EstadoBadge estado={c.estado} /></td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => navigate(`/cotizaciones/${c.id}/editar`)} className="text-[10px] px-2 py-1 rounded text-[var(--color-primary)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] font-medium transition-all">Editar</button>
                        <button onClick={() => { if (window.confirm('\u00bfEliminar esta cotizacion?')) dispatch({ type: 'DELETE_COTIZACION', payload: { id: c.id } }) }} className="text-[10px] px-2 py-1 rounded text-red-500 hover:bg-red-50 border border-red-200 font-medium transition-all">Eliminar</button>
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

import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { ETAPAS } from '../types'
import { formatDate, formatCOP } from '../lib/utils'
import { ArrowLeft, Plus, FileText } from 'lucide-react'

export default function ClienteDetalle() {
  const { id } = useParams()
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const cliente = state.clientes.find(c => c.id === id)
  const historial = state.historial.filter(h => h.cliente_id === id).reverse()
  const productos = state.productos.filter(p => p.cliente_id === id)
  const cotizaciones = state.cotizaciones.filter(c => c.cliente_id === id)

  if (!cliente) return <div className="p-8 text-[var(--color-text-muted)]">Cliente no encontrado</div>

  const etapa = ETAPAS.find(e => e.key === cliente.etapa)

  function generarCotizacion() {
    if (productos.length === 0 || !cliente) return
    const year = new Date().getFullYear()
    const numExistentes = state.cotizaciones.filter(c => c.numero.startsWith(`COT-${year}-`)).length
    const numero = `COT-${year}-${String(numExistentes + 1).padStart(3, '0')}`
    const total = productos.reduce((sum, p) => sum + (p.precio_calculado || 0) * p.cantidad, 0)
    dispatch({
      type: 'ADD_COTIZACION',
      payload: { cliente_id: cliente.id, numero, fecha: new Date().toISOString().split('T')[0], estado: 'borrador', total },
    })
  }

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-white">
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{cliente.nombre}</h2>
          <p className="text-[var(--color-text-muted)]">{cliente.empresa}</p>
        </div>
        <span className="text-sm px-3 py-1 rounded-full font-medium" style={{ background: etapa?.color + '22', color: etapa?.color }}>{etapa?.label}</span>
      </div>

      {/* Info del cliente */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5 grid grid-cols-3 gap-4 text-sm">
        <div><span className="text-[var(--color-text-muted)] block mb-1">NIT</span>{cliente.nit || '—'}</div>
        <div><span className="text-[var(--color-text-muted)] block mb-1">Ubicación</span>{cliente.ubicacion || '—'}</div>
        <div><span className="text-[var(--color-text-muted)] block mb-1">Correo</span>{cliente.correo || '—'}</div>
        <div><span className="text-[var(--color-text-muted)] block mb-1">WhatsApp</span>{cliente.whatsapp || '—'}</div>
        <div><span className="text-[var(--color-text-muted)] block mb-1">Fecha ingreso</span>{formatDate(cliente.fecha_ingreso)}</div>
        <div><span className="text-[var(--color-text-muted)] block mb-1">Etapa</span>
          <select value={cliente.etapa} onChange={e => dispatch({ type: 'MOVE_ETAPA', payload: { clienteId: cliente.id, nuevaEtapa: e.target.value as any } })} className="px-2 py-1 rounded text-sm">
            {ETAPAS.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
          </select>
        </div>
        {cliente.notas && <div className="col-span-3"><span className="text-[var(--color-text-muted)] block mb-1">Notas</span>{cliente.notas}</div>}
      </div>

      {/* Historial de etapas */}
      {historial.length > 0 && (
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5">
          <h3 className="font-semibold mb-3">Historial de etapas</h3>
          <div className="space-y-2">
            {historial.map(h => (
              <div key={h.id} className="text-sm text-[var(--color-text-muted)]">
                {formatDate(h.created_at)} — {ETAPAS.find(e => e.key === h.etapa_anterior)?.label} → <span className="text-white">{ETAPAS.find(e => e.key === h.etapa_nueva)?.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Productos solicitados */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Productos solicitados</h3>
          <button onClick={() => navigate(`/clientes/${id}/configurar`)} className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-3 py-1.5 rounded-lg text-sm">
            <Plus size={14} /> Agregar producto
          </button>
        </div>
        {productos.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">Sin productos configurados. Haz clic en "Agregar producto" para comenzar.</p>
        ) : (
          <div className="space-y-3">
            {productos.map(p => (
              <div key={p.id} className="bg-[var(--color-bg)] rounded-lg p-4 border border-[var(--color-border)]">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-sm">{p.subtipo}</div>
                    <div className="text-xs text-[var(--color-text-muted)] mt-1 max-w-2xl">{p.descripcion_comercial}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCOP(p.precio_calculado || 0)}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">× {p.cantidad}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cotizaciones */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Cotizaciones</h3>
          {productos.length > 0 && (
            <button onClick={generarCotizacion} className="flex items-center gap-2 bg-[var(--color-accent-green)] hover:opacity-90 text-white px-3 py-1.5 rounded-lg text-sm">
              <FileText size={14} /> Generar cotización
            </button>
          )}
        </div>
        {cotizaciones.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">No hay cotizaciones generadas para este cliente.</p>
        ) : (
          <div className="space-y-2">
            {cotizaciones.map(c => (
              <div key={c.id} className="flex justify-between items-center text-sm bg-[var(--color-bg)] rounded-lg p-3 border border-[var(--color-border)]">
                <span className="font-medium">{c.numero}</span>
                <span>{formatDate(c.fecha)}</span>
                <span className="font-bold">{formatCOP(c.total)}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${c.estado === 'aprobada' ? 'bg-green-900/30 text-green-400' : c.estado === 'rechazada' ? 'bg-red-900/30 text-red-400' : 'bg-blue-900/30 text-blue-400'}`}>{c.estado}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

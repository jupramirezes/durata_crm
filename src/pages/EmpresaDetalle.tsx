import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { COTIZADORES } from '../types'
import { formatCOP, formatDate, getAvatarColor } from '../lib/utils'
import { EtapaBadge } from '../components/ui'
import { ArrowLeft, Building2, MapPin, Hash, Target, Trash2 } from 'lucide-react'

export default function EmpresaDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useStore()
  const empresa = state.empresas.find(e => e.id === id)
  if (!empresa) return <div className="p-6 text-[var(--color-text-muted)]">Empresa no encontrada</div>

  const contactos = state.contactos.filter(c => c.empresa_id === id)
  const oportunidades = state.oportunidades.filter(o => o.empresa_id === id)
  const valorCotizado = oportunidades.reduce((s, o) => s + o.valor_cotizado, 0)
  const valorAdjudicado = oportunidades.reduce((s, o) => s + o.valor_adjudicado, 0)

  return (
    <div className="p-6 max-w-5xl animate-fade-in">
      <button onClick={() => navigate('/empresas')} className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] mb-4 transition-colors">
        <ArrowLeft size={14} /> Volver a empresas
      </button>

      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <Building2 size={20} className="text-[var(--color-primary)]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{empresa.nombre}</h2>
          <p className="text-xs text-[var(--color-text-muted)]">{empresa.sector} &bull; NIT: {empresa.nit}</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-lg border border-[var(--color-border)] p-3">
          <p className="text-[10px] text-[var(--color-text-muted)] mb-0.5 font-medium uppercase tracking-wider">Oportunidades</p>
          <p className="text-xl font-bold">{oportunidades.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-[var(--color-border)] p-3">
          <p className="text-[10px] text-[var(--color-text-muted)] mb-0.5 font-medium uppercase tracking-wider">Valor cotizado</p>
          <p className="text-xl font-bold font-mono">{formatCOP(valorCotizado)}</p>
        </div>
        <div className="bg-white rounded-lg border border-[var(--color-border)] p-3">
          <p className="text-[10px] text-[var(--color-text-muted)] mb-0.5 font-medium uppercase tracking-wider">Valor adjudicado</p>
          <p className="text-xl font-bold text-[var(--color-accent-green)] font-mono">{formatCOP(valorAdjudicado)}</p>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-white rounded-lg border border-[var(--color-border)] p-4">
          <h3 className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2.5">Datos de empresa</h3>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2"><MapPin size={12} className="text-[var(--color-text-muted)]" />{empresa.direccion || '\u2014'}</div>
            <div className="flex items-center gap-2"><Hash size={12} className="text-[var(--color-text-muted)]" />NIT: {empresa.nit || '\u2014'}</div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-[var(--color-border)] p-4">
          <h3 className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2.5">Contactos ({contactos.length})</h3>
          <div className="space-y-1.5">
            {contactos.map(c => (
              <div key={c.id} className="flex items-center gap-2 text-xs">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold text-white" style={{ background: getAvatarColor(c.nombre) }}>{c.nombre.charAt(0)}</div>
                <div>
                  <span className="font-medium">{c.nombre}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] ml-1.5">{c.cargo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Oportunidades */}
      <div className="bg-white rounded-lg border border-[var(--color-border)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center gap-2">
          <Target size={14} className="text-[var(--color-primary)]" />
          <h3 className="font-semibold text-xs">Oportunidades</h3>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[var(--color-surface)] text-[var(--color-text-muted)] text-left">
              <th className="px-4 py-2 font-medium">Contacto</th>
              <th className="px-4 py-2 font-medium">Etapa</th>
              <th className="px-4 py-2 font-medium">Cotizador</th>
              <th className="px-4 py-2 font-medium text-right">Valor cot.</th>
              <th className="px-4 py-2 font-medium">Fecha</th>
              <th className="px-4 py-2 font-medium w-8"></th>
            </tr>
          </thead>
          <tbody>
            {oportunidades.map(o => {
              const contacto = state.contactos.find(c => c.id === o.contacto_id)
              const cotizador = COTIZADORES.find(c => c.id === o.cotizador_asignado)
              return (
                <tr
                  key={o.id}
                  onClick={() => navigate(`/oportunidades/${o.id}`)}
                  className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-2.5 font-medium">{contacto?.nombre}</td>
                  <td className="px-4 py-2.5"><EtapaBadge etapa={o.etapa} /></td>
                  <td className="px-4 py-2.5">{cotizador?.iniciales}</td>
                  <td className="px-4 py-2.5 text-right font-bold font-mono">{formatCOP(o.valor_cotizado)}</td>
                  <td className="px-4 py-2.5 text-[var(--color-text-muted)]">{formatDate(o.fecha_ingreso)}</td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={(ev) => {
                        ev.stopPropagation()
                        if (window.confirm('¿Seguro que deseas eliminar esta oportunidad?')) {
                          dispatch({ type: 'DELETE_OPORTUNIDAD', payload: { id: o.id } })
                        }
                      }}
                      className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                      title="Eliminar oportunidad"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { ETAPAS, COTIZADORES } from '../types'
import { formatCOP, formatDate, getAvatarColor } from '../lib/utils'
import { ArrowLeft, Building2, MapPin, Hash, Target, Trash2 } from 'lucide-react'

export default function EmpresaDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useStore()
  const empresa = state.empresas.find(e => e.id === id)
  if (!empresa) return <div className="p-8 text-[var(--color-text-muted)]">Empresa no encontrada</div>

  const contactos = state.contactos.filter(c => c.empresa_id === id)
  const oportunidades = state.oportunidades.filter(o => o.empresa_id === id)
  const valorCotizado = oportunidades.reduce((s, o) => s + o.valor_cotizado, 0)
  const valorAdjudicado = oportunidades.reduce((s, o) => s + o.valor_adjudicado, 0)

  return (
    <div className="p-8 max-w-5xl animate-fade-in">
      <button onClick={() => navigate('/empresas')} className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] mb-5 transition-colors">
        <ArrowLeft size={16} /> Volver a empresas
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center shrink-0">
          <Building2 size={24} className="text-[var(--color-primary)]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{empresa.nombre}</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{empresa.sector} &bull; NIT: {empresa.nit}</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-4">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">Oportunidades</p>
          <p className="text-2xl font-bold">{oportunidades.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-4">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">Valor cotizado</p>
          <p className="text-2xl font-bold">{formatCOP(valorCotizado)}</p>
        </div>
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-4">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">Valor adjudicado</p>
          <p className="text-2xl font-bold text-[var(--color-accent-green)]">{formatCOP(valorAdjudicado)}</p>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
          <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">Datos de empresa</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><MapPin size={14} className="text-[var(--color-text-muted)]" />{empresa.direccion || '\u2014'}</div>
            <div className="flex items-center gap-2"><Hash size={14} className="text-[var(--color-text-muted)]" />NIT: {empresa.nit || '\u2014'}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
          <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">Contactos ({contactos.length})</h3>
          <div className="space-y-2">
            {contactos.map(c => (
              <div key={c.id} className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ background: getAvatarColor(c.nombre) }}>{c.nombre.charAt(0)}</div>
                <div>
                  <span className="font-medium">{c.nombre}</span>
                  <span className="text-xs text-[var(--color-text-muted)] ml-2">{c.cargo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Oportunidades */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center gap-2">
          <Target size={16} className="text-[var(--color-primary)]" />
          <h3 className="font-semibold text-sm">Oportunidades</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F1F5F9] text-[var(--color-text-muted)] text-left text-xs">
              <th className="px-5 py-2.5 font-medium">Contacto</th>
              <th className="px-5 py-2.5 font-medium">Etapa</th>
              <th className="px-5 py-2.5 font-medium">Cotizador</th>
              <th className="px-5 py-2.5 font-medium text-right">Valor cot.</th>
              <th className="px-5 py-2.5 font-medium">Fecha</th>
              <th className="px-5 py-2.5 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody>
            {oportunidades.map(o => {
              const contacto = state.contactos.find(c => c.id === o.contacto_id)
              const etapa = ETAPAS.find(e => e.key === o.etapa)
              const cotizador = COTIZADORES.find(c => c.id === o.cotizador_asignado)
              return (
                <tr
                  key={o.id}
                  onClick={() => navigate(`/oportunidades/${o.id}`)}
                  className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3 font-medium">{contacto?.nombre}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: etapa?.color + '15', color: etapa?.color }}>{etapa?.label}</span>
                  </td>
                  <td className="px-5 py-3 text-xs">{cotizador?.iniciales}</td>
                  <td className="px-5 py-3 text-right font-bold">{formatCOP(o.valor_cotizado)}</td>
                  <td className="px-5 py-3 text-[var(--color-text-muted)]">{formatDate(o.fecha_ingreso)}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={(ev) => {
                        ev.stopPropagation()
                        if (window.confirm('¿Seguro que deseas eliminar esta oportunidad?')) {
                          dispatch({ type: 'DELETE_OPORTUNIDAD', payload: { id: o.id } })
                        }
                      }}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                      title="Eliminar oportunidad"
                    >
                      <Trash2 size={14} />
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

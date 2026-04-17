import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { findCotizador } from '../types'
import { formatCOP, formatDate, getAvatarColor } from '../lib/utils'
import { EtapaBadge } from '../components/ui'
import { showToast } from '../components/Toast'
import { ArrowLeft, Building2, MapPin, Hash, Target, Trash2, Edit3, Check, X, Phone, Mail } from 'lucide-react'

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

  // Edit empresa state
  const [editingEmpresa, setEditingEmpresa] = useState(false)
  const [empForm, setEmpForm] = useState({ nit: '', direccion: '', sector: '', telefono: '' })

  // Edit contacto state
  const [editingContactoId, setEditingContactoId] = useState<string | null>(null)
  const [contactoForm, setContactoForm] = useState({ nombre: '', cargo: '', correo: '', whatsapp: '' })

  function startEditEmpresa() {
    if (!empresa) return
    setEmpForm({
      nit: empresa.nit || '',
      direccion: empresa.direccion || '',
      sector: empresa.sector || '',
      telefono: (empresa as any).telefono || '',
    })
    setEditingEmpresa(true)
  }

  function saveEmpresa() {
    if (!empresa) return
    dispatch({ type: 'UPDATE_EMPRESA', payload: { ...empresa, ...empForm } })
    setEditingEmpresa(false)
    showToast('success', 'Empresa actualizada')
  }

  function startEditContacto(c: typeof contactos[0]) {
    setContactoForm({ nombre: c.nombre, cargo: c.cargo || '', correo: c.correo || '', whatsapp: c.whatsapp || '' })
    setEditingContactoId(c.id)
  }

  function saveContacto(c: typeof contactos[0]) {
    dispatch({ type: 'UPDATE_CONTACTO', payload: { ...c, ...contactoForm } })
    setEditingContactoId(null)
    showToast('success', 'Contacto actualizado')
  }

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
          <p className="text-xl font-bold tabular-nums">{formatCOP(valorCotizado)}</p>
        </div>
        <div className="bg-white rounded-lg border border-[var(--color-border)] p-3">
          <p className="text-[10px] text-[var(--color-text-muted)] mb-0.5 font-medium uppercase tracking-wider">Valor adjudicado</p>
          <p className="text-xl font-bold text-[var(--color-accent-green)] tabular-nums">{formatCOP(valorAdjudicado)}</p>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Datos empresa - editable */}
        <div className="bg-white rounded-lg border border-[var(--color-border)] p-4">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Datos de empresa</h3>
            {!editingEmpresa ? (
              <button onClick={startEditEmpresa} className="p-1 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors" title="Editar empresa">
                <Edit3 size={12} />
              </button>
            ) : (
              <div className="flex gap-1">
                <button onClick={saveEmpresa} className="p-1 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors" title="Guardar"><Check size={12} /></button>
                <button onClick={() => setEditingEmpresa(false)} className="p-1 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] transition-colors" title="Cancelar"><X size={12} /></button>
              </div>
            )}
          </div>
          {!editingEmpresa ? (
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><Hash size={12} className="text-[var(--color-text-muted)]" />NIT: {empresa.nit || '\u2014'}</div>
              <div className="flex items-center gap-2"><MapPin size={12} className="text-[var(--color-text-muted)]" />{empresa.direccion || '\u2014'}</div>
              <div className="flex items-center gap-2"><Building2 size={12} className="text-[var(--color-text-muted)]" />Sector: {empresa.sector || '\u2014'}</div>
              <div className="flex items-center gap-2"><Phone size={12} className="text-[var(--color-text-muted)]" />Tel: {(empresa as any).telefono || '\u2014'}</div>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <label className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider">NIT</label>
                <input value={empForm.nit} onChange={e => setEmpForm(p => ({ ...p, nit: e.target.value }))} className="w-full text-xs px-3 py-2 rounded-lg border border-[var(--color-border)]" />
              </div>
              <div>
                <label className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider">Dirección</label>
                <input value={empForm.direccion} onChange={e => setEmpForm(p => ({ ...p, direccion: e.target.value }))} className="w-full text-xs px-3 py-2 rounded-lg border border-[var(--color-border)]" />
              </div>
              <div>
                <label className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider">Sector</label>
                <input value={empForm.sector} onChange={e => setEmpForm(p => ({ ...p, sector: e.target.value }))} className="w-full text-xs px-3 py-2 rounded-lg border border-[var(--color-border)]" />
              </div>
              <div>
                <label className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider">Teléfono</label>
                <input value={empForm.telefono} onChange={e => setEmpForm(p => ({ ...p, telefono: e.target.value }))} className="w-full text-xs px-3 py-2 rounded-lg border border-[var(--color-border)]" />
              </div>
            </div>
          )}
        </div>

        {/* Contactos - editable */}
        <div className="bg-white rounded-lg border border-[var(--color-border)] p-4">
          <h3 className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2.5">Contactos ({contactos.length})</h3>
          <div className="space-y-2">
            {contactos.map(c => (
              <div key={c.id}>
                {editingContactoId === c.id ? (
                  <div className="space-y-1.5 p-2 bg-[var(--color-surface)] rounded-lg">
                    <input value={contactoForm.nombre} onChange={e => setContactoForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre" className="w-full text-xs px-2 py-1.5 rounded border border-[var(--color-border)]" />
                    <input value={contactoForm.cargo} onChange={e => setContactoForm(p => ({ ...p, cargo: e.target.value }))} placeholder="Cargo" className="w-full text-xs px-2 py-1.5 rounded border border-[var(--color-border)]" />
                    <input value={contactoForm.correo} onChange={e => setContactoForm(p => ({ ...p, correo: e.target.value }))} placeholder="Email" className="w-full text-xs px-2 py-1.5 rounded border border-[var(--color-border)]" />
                    <input value={contactoForm.whatsapp} onChange={e => setContactoForm(p => ({ ...p, whatsapp: e.target.value }))} placeholder="Teléfono" className="w-full text-xs px-2 py-1.5 rounded border border-[var(--color-border)]" />
                    <div className="flex gap-1.5 pt-1">
                      <button onClick={() => saveContacto(c)} className="text-[10px] font-medium px-3 py-1.5 rounded bg-[var(--color-primary)] text-white hover:opacity-90">Guardar</button>
                      <button onClick={() => setEditingContactoId(null)} className="text-[10px] px-3 py-1.5 rounded text-[var(--color-text-muted)] hover:bg-white">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs group">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold text-white shrink-0" style={{ background: getAvatarColor(c.nombre) }}>{c.nombre.charAt(0)}</div>
                    <div className="min-w-0 flex-1">
                      <span className="font-medium">{c.nombre}</span>
                      <span className="text-[10px] text-[var(--color-text-muted)] ml-1.5">{c.cargo}</span>
                      {c.correo && <div className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1"><Mail size={9} />{c.correo}</div>}
                      {c.whatsapp && <div className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1"><Phone size={9} />{c.whatsapp}</div>}
                    </div>
                    <button onClick={() => startEditContacto(c)} className="p-1 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface)] opacity-0 group-hover:opacity-100 transition-all" title="Editar contacto">
                      <Edit3 size={11} />
                    </button>
                  </div>
                )}
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
              const cotizador = findCotizador(o.cotizador_asignado)
              return (
                <tr
                  key={o.id}
                  onClick={() => navigate(`/oportunidades/${o.id}`)}
                  className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-2.5 font-medium">{contacto?.nombre}</td>
                  <td className="px-4 py-2.5"><EtapaBadge etapa={o.etapa} /></td>
                  <td className="px-4 py-2.5">{cotizador?.iniciales}</td>
                  <td className="px-4 py-2.5 text-right font-bold tabular-nums">{formatCOP(o.valor_cotizado)}</td>
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

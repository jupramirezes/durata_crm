import { useState, useMemo } from 'react'
import { useStore } from '../lib/store'
import { SECTORES, COTIZADORES, FUENTES_LEAD, Sector, FuenteLead, Empresa } from '../types'
import { formatCOP } from '../lib/utils'
import { X, Building2, UserPlus, Target, ChevronRight, Search } from 'lucide-react'

interface Props { onClose: () => void; onCreated?: (oportunidadId: string) => void }

type Step = 'empresa' | 'contacto' | 'oportunidad'

export default function OportunidadFormModal({ onClose, onCreated }: Props) {
  const { state, dispatch } = useStore()
  const [step, setStep] = useState<Step>('empresa')

  // === Empresa state ===
  const [empresaMode, setEmpresaMode] = useState<'search' | 'create'>('search')
  const [empresaSearch, setEmpresaSearch] = useState('')
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string | null>(null)
  const [newEmpresa, setNewEmpresa] = useState({ nombre: '', nit: '', direccion: '', sector: 'Alimentos' as Sector, notas: '' })

  // === Contacto state ===
  const [contactoMode, setContactoMode] = useState<'select' | 'create'>('select')
  const [selectedContactoId, setSelectedContactoId] = useState<string | null>(null)
  const [newContacto, setNewContacto] = useState({ nombre: '', cargo: '', correo: '', whatsapp: '+57', notas: '' })

  // === Oportunidad state ===
  const [oportunidad, setOportunidad] = useState({
    valor_estimado: 0,
    cotizador_asignado: 'OC',
    fuente_lead: 'WhatsApp' as FuenteLead,
    ubicacion: '',
    notas: '',
  })

  // Derived
  const empresasFiltradas = useMemo(() => {
    if (!empresaSearch.trim()) return state.empresas.slice(0, 8)
    const q = empresaSearch.toLowerCase()
    return state.empresas.filter(e => e.nombre.toLowerCase().includes(q) || e.nit.includes(q)).slice(0, 8)
  }, [empresaSearch, state.empresas])

  const selectedEmpresa = selectedEmpresaId ? state.empresas.find(e => e.id === selectedEmpresaId) : null
  const contactosEmpresa = selectedEmpresaId ? state.contactos.filter(c => c.empresa_id === selectedEmpresaId) : []
  const oportunidadesEmpresa = selectedEmpresaId ? state.oportunidades.filter(o => o.empresa_id === selectedEmpresaId) : []
  const valorCotizadoEmpresa = oportunidadesEmpresa.reduce((s, o) => s + o.valor_cotizado, 0)

  function handleSelectEmpresa(e: Empresa) {
    setSelectedEmpresaId(e.id)
    setEmpresaMode('search')
    // Auto-select first contact if exists
    const contacts = state.contactos.filter(c => c.empresa_id === e.id)
    if (contacts.length > 0) {
      setSelectedContactoId(contacts[0].id)
      setContactoMode('select')
    } else {
      setContactoMode('create')
    }
  }

  function goToContacto() {
    if (empresaMode === 'create') {
      if (!newEmpresa.nombre.trim()) return
      // Create the empresa first
      const empresaId = String(Date.now())
      dispatch({
        type: 'ADD_EMPRESA',
        payload: { ...newEmpresa },
      })
      // Since the store generates ID, find the latest
      setSelectedEmpresaId(empresaId)
      setContactoMode('create')
    }
    setStep('contacto')
  }

  function goToOportunidad() {
    if (contactoMode === 'create') {
      if (!newContacto.nombre.trim()) return
    }
    setStep('oportunidad')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (oportunidad.valor_estimado <= 0) return

    let empresaId = selectedEmpresaId
    // If creating new empresa
    if (!empresaId && empresaMode === 'create') {
      dispatch({ type: 'ADD_EMPRESA', payload: newEmpresa })
      // Get the latest empresa
      empresaId = String(state.empresas.length + 1)
    }
    if (!empresaId) return

    let contactoId = selectedContactoId
    // If creating new contacto
    if (contactoMode === 'create' && !contactoId) {
      dispatch({ type: 'ADD_CONTACTO', payload: { ...newContacto, empresa_id: empresaId } })
      contactoId = String(state.contactos.length + 1)
    }
    if (!contactoId) return

    const oportunidadId = String(Date.now())
    dispatch({
      type: 'ADD_OPORTUNIDAD',
      payload: {
        empresa_id: empresaId,
        contacto_id: contactoId,
        etapa: 'nuevo_lead',
        valor_estimado: oportunidad.valor_estimado,
        valor_cotizado: 0,
        valor_adjudicado: 0,
        cotizador_asignado: oportunidad.cotizador_asignado,
        fuente_lead: oportunidad.fuente_lead,
        motivo_perdida: '',
        ubicacion: oportunidad.ubicacion,
        fecha_ingreso: new Date().toISOString().split('T')[0],
        fecha_ultimo_contacto: new Date().toISOString().split('T')[0],
        notas: oportunidad.notas,
      },
    })
    onCreated?.(oportunidadId)
    onClose()
  }

  const stepIdx = step === 'empresa' ? 0 : step === 'contacto' ? 1 : 2
  const steps = [
    { key: 'empresa', label: 'Empresa', icon: Building2 },
    { key: 'contacto', label: 'Contacto', icon: UserPlus },
    { key: 'oportunidad', label: 'Oportunidad', icon: Target },
  ]

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-[var(--color-border)] w-full max-w-xl shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-[var(--color-border)]">
          <h3 className="text-lg font-bold">Nueva Oportunidad</h3>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1.5 rounded-lg hover:bg-[var(--color-surface)]"><X size={20} /></button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${i <= stepIdx ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-border)] text-[var(--color-text-muted)]'}`}>
                <s.icon size={12} /> {s.label}
              </div>
              {i < 2 && <ChevronRight size={12} className="text-[var(--color-text-muted)]" />}
            </div>
          ))}
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[55vh] overflow-y-auto">
          {step === 'empresa' && (
            <>
              {/* Toggle search/create */}
              <div className="flex gap-2 mb-2">
                <button type="button" onClick={() => setEmpresaMode('search')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${empresaMode === 'search' ? 'bg-blue-500/15 text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'}`}>
                  Buscar existente
                </button>
                <button type="button" onClick={() => { setEmpresaMode('create'); setSelectedEmpresaId(null) }} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${empresaMode === 'create' ? 'bg-blue-500/15 text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'}`}>
                  Crear nueva
                </button>
              </div>

              {empresaMode === 'search' && (
                <>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-3 text-[var(--color-text-muted)]" />
                    <input value={empresaSearch} onChange={e => setEmpresaSearch(e.target.value)} placeholder="Buscar por nombre o NIT..." className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm" />
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {empresasFiltradas.map(e => (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => handleSelectEmpresa(e)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${selectedEmpresaId === e.id ? 'bg-blue-500/10 border border-[var(--color-primary)]/30' : 'hover:bg-[var(--color-surface-hover)] border border-transparent'}`}
                      >
                        <div className="font-medium">{e.nombre}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">{e.nit} &bull; {e.sector}</div>
                      </button>
                    ))}
                  </div>
                  {selectedEmpresa && (
                    <div className="bg-emerald-50 rounded-xl p-3 text-xs border border-emerald-200">
                      <span className="font-semibold text-emerald-800">{selectedEmpresa.nombre}</span>
                      <span className="text-emerald-600 ml-2">{oportunidadesEmpresa.length} oportunidades &bull; {formatCOP(valorCotizadoEmpresa)} cotizado</span>
                    </div>
                  )}
                </>
              )}

              {empresaMode === 'create' && (
                <div className="space-y-3">
                  <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Nombre *</label>
                    <input value={newEmpresa.nombre} onChange={e => setNewEmpresa(p => ({ ...p, nombre: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">NIT</label>
                      <input value={newEmpresa.nit} onChange={e => setNewEmpresa(p => ({ ...p, nit: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm" />
                    </div>
                    <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Sector</label>
                      <select value={newEmpresa.sector} onChange={e => setNewEmpresa(p => ({ ...p, sector: e.target.value as Sector }))} className="w-full px-3 py-2.5 rounded-xl text-sm">
                        {SECTORES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Direcci&oacute;n</label>
                    <input value={newEmpresa.direccion} onChange={e => setNewEmpresa(p => ({ ...p, direccion: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm" />
                  </div>
                </div>
              )}
            </>
          )}

          {step === 'contacto' && (
            <>
              {contactosEmpresa.length > 0 && (
                <div className="flex gap-2 mb-2">
                  <button type="button" onClick={() => setContactoMode('select')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${contactoMode === 'select' ? 'bg-blue-500/15 text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'}`}>
                    Seleccionar existente
                  </button>
                  <button type="button" onClick={() => { setContactoMode('create'); setSelectedContactoId(null) }} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${contactoMode === 'create' ? 'bg-blue-500/15 text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'}`}>
                    Crear nuevo
                  </button>
                </div>
              )}

              {contactoMode === 'select' && contactosEmpresa.length > 0 && (
                <div className="space-y-1">
                  {contactosEmpresa.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedContactoId(c.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${selectedContactoId === c.id ? 'bg-blue-500/10 border border-[var(--color-primary)]/30' : 'hover:bg-[var(--color-surface-hover)] border border-transparent'}`}
                    >
                      <div className="font-medium">{c.nombre}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{c.cargo} &bull; {c.correo}</div>
                    </button>
                  ))}
                </div>
              )}

              {(contactoMode === 'create' || contactosEmpresa.length === 0) && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Nombre *</label>
                      <input value={newContacto.nombre} onChange={e => setNewContacto(p => ({ ...p, nombre: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm" required />
                    </div>
                    <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Cargo</label>
                      <input value={newContacto.cargo} onChange={e => setNewContacto(p => ({ ...p, cargo: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Correo</label>
                      <input type="email" value={newContacto.correo} onChange={e => setNewContacto(p => ({ ...p, correo: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm" />
                    </div>
                    <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">WhatsApp</label>
                      <input value={newContacto.whatsapp} onChange={e => setNewContacto(p => ({ ...p, whatsapp: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 'oportunidad' && (
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Valor estimado (COP) *</label>
                <input type="number" value={oportunidad.valor_estimado || ''} onChange={e => setOportunidad(p => ({ ...p, valor_estimado: Number(e.target.value) }))} className="w-full px-3 py-2.5 rounded-xl text-sm" required min={1} />
                {oportunidad.valor_estimado > 0 && <p className="text-xs text-[var(--color-text-muted)] mt-1">{formatCOP(oportunidad.valor_estimado)}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Cotizador asignado</label>
                  <select value={oportunidad.cotizador_asignado} onChange={e => setOportunidad(p => ({ ...p, cotizador_asignado: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm">
                    {COTIZADORES.map(c => <option key={c.id} value={c.id}>{c.nombre} ({c.iniciales})</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Fuente del lead</label>
                  <select value={oportunidad.fuente_lead} onChange={e => setOportunidad(p => ({ ...p, fuente_lead: e.target.value as FuenteLead }))} className="w-full px-3 py-2.5 rounded-xl text-sm">
                    {FUENTES_LEAD.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Ubicaci&oacute;n del proyecto</label>
                <input value={oportunidad.ubicacion} onChange={e => setOportunidad(p => ({ ...p, ubicacion: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm" />
              </div>
              <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Notas</label>
                <textarea value={oportunidad.notas} onChange={e => setOportunidad(p => ({ ...p, notas: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm h-20 resize-none" />
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--color-border)] flex justify-between">
          <button type="button" onClick={step === 'empresa' ? onClose : () => setStep(step === 'contacto' ? 'empresa' : 'contacto')} className="px-5 py-2.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-xl hover:bg-[var(--color-surface-hover)] transition-all">
            {step === 'empresa' ? 'Cancelar' : 'Atr\u00e1s'}
          </button>
          {step !== 'oportunidad' ? (
            <button type="button" onClick={step === 'empresa' ? goToContacto : goToOportunidad} disabled={step === 'empresa' && empresaMode === 'search' && !selectedEmpresaId} className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50">
              Siguiente <ChevronRight size={14} />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit as any} className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-accent-green)] hover:opacity-90 text-white rounded-xl text-sm font-bold transition-all">
              <Target size={14} /> Crear oportunidad
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

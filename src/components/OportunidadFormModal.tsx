import { useState, useMemo, useEffect } from 'react'
import { useStore } from '../lib/store'
import { SECTORES, COTIZADORES, FUENTES_LEAD, Empresa } from '../types'
import { formatCOP } from '../lib/utils'
import { supabase } from '../lib/supabase'
import { X, Building2, UserPlus, Target, ChevronRight, Search, CheckCircle } from 'lucide-react'
import { loadConfig } from '../hooks/useConfiguracion'

// Map auth email → cotizador ID
const EMAIL_TO_COTIZADOR: Record<string, string> = {
  'saguirre@durata.co': 'SA',
  'presupuestos@durata.co': 'OC',
  'presupuestos2@durata.co': 'JPR',
  'araque@durata.co': 'CA',
  'caraque@durata.co': 'CA', // legacy — mantener hasta que todos los clientes viejos hayan migrado
  'dgalindo@durata.co': 'DG',
}

interface Props { onClose: () => void; onCreated?: (oportunidadId: string) => void }

type Step = 'empresa' | 'contacto' | 'oportunidad'

export default function OportunidadFormModal({ onClose, onCreated }: Props) {
  const { state, dispatch } = useStore()
  const [step, setStep] = useState<Step>('empresa')

  // === Empresa state ===
  const [empresaMode, setEmpresaMode] = useState<'search' | 'create'>('search')
  const [empresaSearch, setEmpresaSearch] = useState('')
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string | null>(null)
  const [newEmpresa, setNewEmpresa] = useState({ nombre: '', nit: '', direccion: '', sector: 'Alimentos' as string, notas: '' })

  // === Contacto state ===
  const [contactoMode, setContactoMode] = useState<'select' | 'create'>('create')
  const [selectedContactoId, setSelectedContactoId] = useState<string | null>(null)
  const [newContacto, setNewContacto] = useState({ nombre: '', cargo: '', correo: '', whatsapp: '+57', notas: '' })
  const [contactoMatch, setContactoMatch] = useState<string | null>(null) // matched existing contact id
  const [editContacto, setEditContacto] = useState({ nombre: '', cargo: '', correo: '', whatsapp: '' })

  // === Oportunidad state (cotizador defaults to logged-in user) ===
  const [oportunidad, setOportunidad] = useState({
    cotizador_asignado: 'OC',
    fuente_lead: 'WhatsApp' as string,
    ubicacion: '',
    notas: '',
  })

  // Dynamic config lists (fuentes_lead, sectores from configuracion_sistema)
  const [cfgFuentes, setCfgFuentes] = useState<string[]>([...FUENTES_LEAD])
  const [cfgSectores, setCfgSectores] = useState<string[]>([...SECTORES])

  // Auto-assign cotizador from logged-in user + load dynamic config
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        const cotId = EMAIL_TO_COTIZADOR[session.user.email]
        if (cotId) setOportunidad(p => ({ ...p, cotizador_asignado: cotId }))
      }
    })
    loadConfig().then(cfg => {
      if (cfg.fuentes_lead?.length) setCfgFuentes(cfg.fuentes_lead)
      if (cfg.sectores?.length) setCfgSectores(cfg.sectores)
    })
  }, [])

  // Derived
  const empresasFiltradas = useMemo(() => {
    if (!empresaSearch.trim()) return state.empresas.slice(0, 8)
    const q = empresaSearch.toLowerCase()
    return state.empresas.filter(e => e.nombre.toLowerCase().includes(q) || e.nit.includes(q)).slice(0, 8)
  }, [empresaSearch, state.empresas])

  // Check if selected contact has been edited
  const selectedContactoOriginal = selectedContactoId ? state.contactos.find(c => c.id === selectedContactoId) : null
  const hasContactChanges = selectedContactoOriginal && contactoMode === 'select' && (
    editContacto.nombre !== selectedContactoOriginal.nombre ||
    editContacto.cargo !== (selectedContactoOriginal.cargo || '') ||
    editContacto.correo !== (selectedContactoOriginal.correo || '') ||
    editContacto.whatsapp !== (selectedContactoOriginal.whatsapp || '')
  )

  const selectedEmpresa = selectedEmpresaId ? state.empresas.find(e => e.id === selectedEmpresaId) : null
  const contactosEmpresa = selectedEmpresaId ? state.contactos.filter(c => c.empresa_id === selectedEmpresaId) : []
  const oportunidadesEmpresa = selectedEmpresaId ? state.oportunidades.filter(o => o.empresa_id === selectedEmpresaId) : []
  const valorCotizadoEmpresa = oportunidadesEmpresa.reduce((s, o) => s + o.valor_cotizado, 0)

  function handleSelectEmpresa(e: Empresa) {
    setSelectedEmpresaId(e.id)
    setEmpresaMode('search')
    const contacts = state.contactos.filter(c => c.empresa_id === e.id)
    if (contacts.length > 0) {
      setSelectedContactoId(contacts[0].id)
      setContactoMode('select')
    } else {
      setContactoMode('create')
    }
  }

  function goToContacto() {
    if (empresaMode === 'create' && !newEmpresa.nombre.trim()) return
    if (empresaMode === 'search' && !selectedEmpresaId) return
    setStep('contacto')
  }

  function goToOportunidad() {
    // If no existing contacts for this empresa, we're always creating
    const effectiveMode = contactosEmpresa.length === 0 ? 'create' : contactoMode
    if (effectiveMode === 'create' && !newContacto.nombre.trim()) return
    if (effectiveMode === 'select' && !selectedContactoId) return
    setStep('oportunidad')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    let empresaId = selectedEmpresaId

    // Create empresa if needed
    if (empresaMode === 'create' && !empresaId) {
      if (!newEmpresa.nombre.trim()) return
      empresaId = crypto.randomUUID()
      dispatch({ type: 'ADD_EMPRESA', payload: { ...newEmpresa, id: empresaId } })
    }
    if (!empresaId) return

    // Create or reuse contacto (and update if edited)
    let contactoId = selectedContactoId
    const effectiveContactoMode = contactosEmpresa.length === 0 ? 'create' : contactoMode

    // If selecting an existing contact and user edited the fields, update it
    if (effectiveContactoMode === 'select' && contactoId && hasContactChanges && selectedContactoOriginal) {
      dispatch({ type: 'UPDATE_CONTACTO', payload: { ...selectedContactoOriginal, ...editContacto } })
    }

    if (effectiveContactoMode === 'create') {
      if (contactoMatch) {
        // Reuse matched contact (and update if data changed)
        contactoId = contactoMatch
        const existingContact = state.contactos.find(c => c.id === contactoMatch)
        if (existingContact) dispatch({ type: 'UPDATE_CONTACTO', payload: { ...existingContact, ...newContacto, empresa_id: empresaId } })
      } else if (!contactoId) {
        if (!newContacto.nombre.trim()) return
        contactoId = crypto.randomUUID()
        dispatch({ type: 'ADD_CONTACTO', payload: { ...newContacto, empresa_id: empresaId, id: contactoId } })
      }
    }
    if (!contactoId) return

    // Create oportunidad
    const oportunidadId = crypto.randomUUID()
    dispatch({
      type: 'ADD_OPORTUNIDAD',
      payload: {
        id: oportunidadId,
        empresa_id: empresaId,
        contacto_id: contactoId,
        etapa: 'nuevo_lead',
        valor_estimado: 0,
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
    <div
      className="fixed inset-0 z-50 flex items-start justify-center animate-fade-in"
      style={{ paddingTop: '6vh', paddingBottom: '4vh', background: 'rgba(20,24,28,0.36)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(640px, 92vw)',
          maxHeight: '90vh',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-pop)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>Nueva oportunidad</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-label)', marginTop: 2 }}>
              Crea una oportunidad en 3 pasos · empresa → contacto → datos
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <button
            onClick={onClose}
            className="btn-d ghost icon sm"
            style={{ color: 'var(--color-text-label)' }}
          ><X size={14} /></button>
        </div>

        {/* Steps indicator (handoff: mono numbers with separators) */}
        <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-surface-2)' }}>
          {steps.map((s, i) => (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                className="mono"
                style={{
                  fontSize: 10.5,
                  padding: '2px 8px',
                  borderRadius: 3,
                  background: i < stepIdx ? 'var(--color-primary-weak)' : i === stepIdx ? 'var(--color-text)' : 'transparent',
                  color: i < stepIdx ? 'var(--color-primary)' : i === stepIdx ? 'var(--color-surface)' : 'var(--color-text-label)',
                  border: '1px solid ' + (i === stepIdx ? 'var(--color-text)' : i < stepIdx ? 'var(--color-primary-line)' : 'var(--color-border)'),
                  fontWeight: i === stepIdx ? 600 : 500,
                  letterSpacing: '0.04em',
                }}
              >{i + 1}. {s.label}</span>
              {i < steps.length - 1 && <span style={{ color: 'var(--color-text-faint)', fontSize: 11 }}>→</span>}
            </div>
          ))}
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: 20, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {step === 'empresa' && (
            <>
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
                      <select value={newEmpresa.sector} onChange={e => setNewEmpresa(p => ({ ...p, sector: e.target.value as string }))} className="w-full px-3 py-2.5 rounded-xl text-sm">
                        {cfgSectores.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Direccion</label>
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
                <div className="space-y-2">
                  <div className="space-y-1">
                    {contactosEmpresa.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedContactoId(c.id)
                          setEditContacto({ nombre: c.nombre, cargo: c.cargo || '', correo: c.correo || '', whatsapp: c.whatsapp || '' })
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${selectedContactoId === c.id ? 'bg-blue-500/10 border border-[var(--color-primary)]/30' : 'hover:bg-[var(--color-surface-hover)] border border-transparent'}`}
                      >
                        <div className="font-medium">{c.nombre}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">{c.cargo} &bull; {c.correo}</div>
                      </button>
                    ))}
                  </div>
                  {selectedContactoId && (
                    <div className="space-y-3 pt-2 border-t border-[var(--color-border)]">
                      <p className="text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider">Datos del contacto (editables)</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Nombre</label>
                          <input value={editContacto.nombre} onChange={e => setEditContacto(p => ({ ...p, nombre: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm" />
                        </div>
                        <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Cargo</label>
                          <input value={editContacto.cargo} onChange={e => setEditContacto(p => ({ ...p, cargo: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Correo</label>
                          <input type="email" value={editContacto.correo} onChange={e => setEditContacto(p => ({ ...p, correo: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm" />
                        </div>
                        <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">WhatsApp</label>
                          <input value={editContacto.whatsapp} onChange={e => setEditContacto(p => ({ ...p, whatsapp: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm" />
                        </div>
                      </div>
                      {hasContactChanges && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
                          <CheckCircle size={13} /> Se actualizarán los datos al crear la oportunidad
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {(contactoMode === 'create' || contactosEmpresa.length === 0) && (
                <div className="space-y-3">
                  {contactoMatch && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
                      <CheckCircle size={13} /> Contacto existente encontrado — datos pre-llenados
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Nombre *</label>
                      <input value={newContacto.nombre} onChange={e => {
                        const val = e.target.value
                        setNewContacto(p => ({ ...p, nombre: val }))
                        // Auto-match existing contact by name
                        if (val.trim().length >= 3) {
                          const match = contactosEmpresa.find(c => c.nombre.toLowerCase().includes(val.toLowerCase()))
                          if (match) {
                            setContactoMatch(match.id)
                            setNewContacto({ nombre: match.nombre, cargo: match.cargo || '', correo: match.correo || '', whatsapp: match.whatsapp || '+57', notas: '' })
                          } else {
                            setContactoMatch(null)
                          }
                        } else {
                          setContactoMatch(null)
                        }
                      }} className="w-full px-3 py-2.5 rounded-xl text-sm" required />
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
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Cotizador asignado</label>
                  <select value={oportunidad.cotizador_asignado} onChange={e => setOportunidad(p => ({ ...p, cotizador_asignado: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm">
                    {COTIZADORES.map(c => <option key={c.id} value={c.id}>{c.nombre} ({c.iniciales})</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Fuente del lead</label>
                  <select value={oportunidad.fuente_lead} onChange={e => setOportunidad(p => ({ ...p, fuente_lead: e.target.value as string }))} className="w-full px-3 py-2.5 rounded-xl text-sm">
                    {cfgFuentes.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Ubicacion del proyecto</label>
                <input value={oportunidad.ubicacion} onChange={e => setOportunidad(p => ({ ...p, ubicacion: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm" />
              </div>
              <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Notas</label>
                <textarea value={oportunidad.notas} onChange={e => setOportunidad(p => ({ ...p, notas: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm h-20 resize-none" />
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          {step !== 'empresa' && (
            <button
              type="button"
              onClick={() => setStep(step === 'contacto' ? 'empresa' : 'contacto')}
              className="btn-d sm"
            >
              <ChevronRight size={12} style={{ transform: 'rotate(180deg)' }} /> Anterior
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button type="button" onClick={onClose} className="btn-d sm">Cancelar</button>
          {step !== 'oportunidad' ? (
            <button
              type="button"
              onClick={step === 'empresa' ? goToContacto : goToOportunidad}
              disabled={step === 'empresa' && empresaMode === 'search' && !selectedEmpresaId}
              className="btn-d accent sm"
            >
              Siguiente <ChevronRight size={12} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit as any}
              className="btn-d accent sm"
              style={{ background: 'var(--color-accent-green)', borderColor: 'var(--color-accent-green)' }}
            >
              <Target size={12} /> Crear oportunidad
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

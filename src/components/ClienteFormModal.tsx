import { useState } from 'react'
import { useStore } from '../lib/store'
import { ETAPAS, Etapa } from '../types'
import { X, UserPlus } from 'lucide-react'

interface Props { onClose: () => void; initial?: Partial<{ nombre: string; empresa: string }> }

export default function ClienteFormModal({ onClose }: Props) {
  const { dispatch } = useStore()
  const [form, setForm] = useState({
    nombre: '', nit: '', empresa: '', ubicacion: '', correo: '', whatsapp: '+57',
    etapa: 'lead_entrante' as Etapa, notas: '', fecha_ingreso: new Date().toISOString().split('T')[0],
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre || !form.empresa) return
    dispatch({ type: 'ADD_CLIENTE', payload: form })
    onClose()
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] w-full max-w-lg p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <UserPlus size={20} className="text-[var(--color-primary)]" />
            </div>
            <h3 className="text-lg font-bold">Nuevo Cliente</h3>
          </div>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)]"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Nombre *</label><input value={form.nombre} onChange={set('nombre')} className="w-full px-3 py-2.5 rounded-xl text-sm" required /></div>
            <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">NIT</label><input value={form.nit} onChange={set('nit')} className="w-full px-3 py-2.5 rounded-xl text-sm" /></div>
            <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Empresa *</label><input value={form.empresa} onChange={set('empresa')} className="w-full px-3 py-2.5 rounded-xl text-sm" required /></div>
            <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Ubicacion</label><input value={form.ubicacion} onChange={set('ubicacion')} className="w-full px-3 py-2.5 rounded-xl text-sm" /></div>
            <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Correo</label><input type="email" value={form.correo} onChange={set('correo')} className="w-full px-3 py-2.5 rounded-xl text-sm" /></div>
            <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">WhatsApp</label><input value={form.whatsapp} onChange={set('whatsapp')} className="w-full px-3 py-2.5 rounded-xl text-sm" /></div>
            <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Fecha ingreso</label><input type="date" value={form.fecha_ingreso} onChange={set('fecha_ingreso')} className="w-full px-3 py-2.5 rounded-xl text-sm" /></div>
            <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Etapa</label>
              <select value={form.etapa} onChange={set('etapa')} className="w-full px-3 py-2.5 rounded-xl text-sm">
                {ETAPAS.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
              </select>
            </div>
          </div>
          <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Notas</label><textarea value={form.notas} onChange={set('notas')} className="w-full px-3 py-2.5 rounded-xl text-sm h-20 resize-none" /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm text-[var(--color-text-muted)] hover:text-white rounded-xl hover:bg-[var(--color-surface-hover)] transition-all duration-200">Cancelar</button>
            <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-[#4f8cff] to-[#3b7aed] hover:opacity-90 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-blue-500/20">Guardar cliente</button>
          </div>
        </form>
      </div>
    </div>
  )
}

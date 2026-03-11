import { useState } from 'react'
import { useStore } from '../lib/store'
import { ETAPAS, Etapa } from '../types'
import { X } from 'lucide-react'

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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold">Nuevo Cliente</h3>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-[var(--color-text-muted)] mb-1 block">Nombre *</label><input value={form.nombre} onChange={set('nombre')} className="w-full px-3 py-2 rounded-lg text-sm" required /></div>
            <div><label className="text-xs text-[var(--color-text-muted)] mb-1 block">NIT</label><input value={form.nit} onChange={set('nit')} className="w-full px-3 py-2 rounded-lg text-sm" /></div>
            <div><label className="text-xs text-[var(--color-text-muted)] mb-1 block">Empresa *</label><input value={form.empresa} onChange={set('empresa')} className="w-full px-3 py-2 rounded-lg text-sm" required /></div>
            <div><label className="text-xs text-[var(--color-text-muted)] mb-1 block">Ubicación</label><input value={form.ubicacion} onChange={set('ubicacion')} className="w-full px-3 py-2 rounded-lg text-sm" /></div>
            <div><label className="text-xs text-[var(--color-text-muted)] mb-1 block">Correo</label><input type="email" value={form.correo} onChange={set('correo')} className="w-full px-3 py-2 rounded-lg text-sm" /></div>
            <div><label className="text-xs text-[var(--color-text-muted)] mb-1 block">WhatsApp</label><input value={form.whatsapp} onChange={set('whatsapp')} className="w-full px-3 py-2 rounded-lg text-sm" /></div>
            <div><label className="text-xs text-[var(--color-text-muted)] mb-1 block">Fecha ingreso</label><input type="date" value={form.fecha_ingreso} onChange={set('fecha_ingreso')} className="w-full px-3 py-2 rounded-lg text-sm" /></div>
            <div><label className="text-xs text-[var(--color-text-muted)] mb-1 block">Etapa</label>
              <select value={form.etapa} onChange={set('etapa')} className="w-full px-3 py-2 rounded-lg text-sm">
                {ETAPAS.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
              </select>
            </div>
          </div>
          <div><label className="text-xs text-[var(--color-text-muted)] mb-1 block">Notas</label><textarea value={form.notas} onChange={set('notas')} className="w-full px-3 py-2 rounded-lg text-sm h-20" /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-white">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg text-sm">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { ETAPAS } from '../types'
import { formatDate } from '../lib/utils'
import { Search, Plus } from 'lucide-react'
import ClienteFormModal from '../components/ClienteFormModal'

export default function Clientes() {
  const { state } = useStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filtroEtapa, setFiltroEtapa] = useState('')
  const [showModal, setShowModal] = useState(false)

  const filtered = state.clientes.filter(c => {
    const matchSearch = !search || c.nombre.toLowerCase().includes(search.toLowerCase()) || c.empresa.toLowerCase().includes(search.toLowerCase())
    const matchEtapa = !filtroEtapa || c.etapa === filtroEtapa
    return matchSearch && matchEtapa
  })

  return (
    <div className="p-8 space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Clientes</h2>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-4 py-2 rounded-lg text-sm"><Plus size={16} /> Nuevo</button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o empresa..." className="w-full pl-9 pr-3 py-2 rounded-lg text-sm" />
        </div>
        <select value={filtroEtapa} onChange={e => setFiltroEtapa(e.target.value)} className="px-3 py-2 rounded-lg text-sm">
          <option value="">Todas las etapas</option>
          {ETAPAS.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
        </select>
      </div>

      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-muted)]">
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Empresa</th>
              <th className="px-4 py-3 font-medium">Ubicación</th>
              <th className="px-4 py-3 font-medium">Etapa</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const etapa = ETAPAS.find(e => e.key === c.etapa)
              return (
                <tr key={c.id} onClick={() => navigate(`/clientes/${c.id}`)} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors">
                  <td className="px-4 py-3 font-medium">{c.nombre}</td>
                  <td className="px-4 py-3">{c.empresa}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{c.ubicacion}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full" style={{ background: etapa?.color + '22', color: etapa?.color }}>{etapa?.label}</span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{formatDate(c.fecha_ingreso)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && <ClienteFormModal onClose={() => setShowModal(false)} />}
    </div>
  )
}

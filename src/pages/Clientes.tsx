import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { ETAPAS } from '../types'
import { formatDate, getInitials, getAvatarColor } from '../lib/utils'
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
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Clientes</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{state.clientes.length} clientes registrados</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> Nuevo cliente
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o empresa..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm border border-[var(--color-border)] bg-white focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <select
          value={filtroEtapa}
          onChange={e => setFiltroEtapa(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm min-w-[180px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[var(--color-primary)]"
        >
          <option value="">Todas las etapas</option>
          {ETAPAS.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F1F5F9] text-[var(--color-text-muted)] text-left">
              <th className="px-5 py-3.5 font-semibold">Nombre</th>
              <th className="px-5 py-3.5 font-semibold">Empresa</th>
              <th className="px-5 py-3.5 font-semibold">Ubicacion</th>
              <th className="px-5 py-3.5 font-semibold">Productos</th>
              <th className="px-5 py-3.5 font-semibold">Cotizaciones</th>
              <th className="px-5 py-3.5 font-semibold">Etapa</th>
              <th className="px-5 py-3.5 font-semibold">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => {
              const etapa = ETAPAS.find(e => e.key === c.etapa)
              const productoCount = state.productos.filter(p => p.cliente_id === c.id).length
              const cotizacionCount = state.cotizaciones.filter(cot => cot.cliente_id === c.id).length
              return (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/clientes/${c.id}`)}
                  className={`border-b border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors ${
                    i % 2 === 1 ? 'bg-[var(--color-surface)]' : 'bg-white'
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ background: getAvatarColor(c.nombre) }}
                      >
                        {getInitials(c.nombre)}
                      </div>
                      <span className="font-medium text-[var(--color-text)]">{c.nombre}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[var(--color-text)]">{c.empresa}</td>
                  <td className="px-5 py-3.5 text-[var(--color-text-muted)]">{c.ubicacion}</td>
                  <td className="px-5 py-3.5 text-center text-[var(--color-text)]">{productoCount}</td>
                  <td className="px-5 py-3.5 text-center text-[var(--color-text)]">{cotizacionCount}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className="text-xs px-3 py-1 rounded-full font-medium"
                      style={{ background: etapa?.color + '15', color: etapa?.color }}
                    >
                      {etapa?.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[var(--color-text-muted)]">{formatDate(c.fecha_ingreso)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
          Mostrando {filtered.length} de {state.clientes.length} clientes
        </div>
      </div>

      {showModal && <ClienteFormModal onClose={() => setShowModal(false)} />}
    </div>
  )
}

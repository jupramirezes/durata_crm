import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { SECTORES } from '../types'
import { formatCOP, getInitials, getAvatarColor } from '../lib/utils'
import { Search } from 'lucide-react'

export default function Empresas() {
  const { state } = useStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filtroSector, setFiltroSector] = useState('')

  const filtered = state.empresas.filter(e => {
    const matchSearch = !search || e.nombre.toLowerCase().includes(search.toLowerCase()) || e.nit.includes(search)
    const matchSector = !filtroSector || e.sector === filtroSector
    return matchSearch && matchSector
  })

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Empresas</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{state.empresas.length} empresas registradas</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o NIT..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm border border-[var(--color-border)] bg-white focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <select
          value={filtroSector}
          onChange={e => setFiltroSector(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm min-w-[180px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[var(--color-primary)]"
        >
          <option value="">Todos los sectores</option>
          {SECTORES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F1F5F9] text-[var(--color-text-muted)] text-left">
              <th className="px-5 py-3.5 font-semibold">Empresa</th>
              <th className="px-5 py-3.5 font-semibold">Sector</th>
              <th className="px-5 py-3.5 font-semibold text-center">Oportunidades</th>
              <th className="px-5 py-3.5 font-semibold text-right">Valor cotizado</th>
              <th className="px-5 py-3.5 font-semibold text-right">Valor adjudicado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => {
              const oportunidades = state.oportunidades.filter(o => o.empresa_id === e.id)
              const valorCotizado = oportunidades.reduce((s, o) => s + o.valor_cotizado, 0)
              const valorAdjudicado = oportunidades.reduce((s, o) => s + o.valor_adjudicado, 0)
              return (
                <tr
                  key={e.id}
                  onClick={() => navigate(`/empresas/${e.id}`)}
                  className={`border-b border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors ${
                    i % 2 === 1 ? 'bg-[var(--color-surface)]' : 'bg-white'
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ background: getAvatarColor(e.nombre) }}
                      >
                        {getInitials(e.nombre)}
                      </div>
                      <div>
                        <span className="font-medium text-[var(--color-text)]">{e.nombre}</span>
                        <div className="text-xs text-[var(--color-text-muted)]">{e.nit}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)] font-medium">{e.sector}</span>
                  </td>
                  <td className="px-5 py-3.5 text-center font-medium text-[var(--color-text)]">{oportunidades.length}</td>
                  <td className="px-5 py-3.5 text-right text-[var(--color-text)]">{formatCOP(valorCotizado)}</td>
                  <td className="px-5 py-3.5 text-right font-bold text-[var(--color-accent-green)]">{formatCOP(valorAdjudicado)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
          Mostrando {filtered.length} de {state.empresas.length} empresas
        </div>
      </div>
    </div>
  )
}

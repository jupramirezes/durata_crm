import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { formatCOP } from '../lib/utils'
import { Search, Save, Upload } from 'lucide-react'

const GRUPO_COLORS: Record<string, string> = {
  INOX: 'bg-blue-50 text-blue-700 border-blue-200',
  HIERRO: 'bg-orange-50 text-orange-700 border-orange-200',
  ABRASIVOS: 'bg-red-50 text-red-700 border-red-200',
}

function getGrupoColor(grupo: string) {
  return GRUPO_COLORS[grupo.toUpperCase()] || 'bg-gray-50 text-gray-700 border-gray-200'
}

export default function Precios() {
  const navigate = useNavigate()
  const { state, dispatch } = useStore()
  const [search, setSearch] = useState('')
  const [filtroGrupo, setFiltroGrupo] = useState('TODOS')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editingProvId, setEditingProvId] = useState<string | null>(null)
  const [editProvValue, setEditProvValue] = useState('')
  const [lastEditedId, setLastEditedId] = useState<string | null>(null)

  const grupos = useMemo(() => {
    const set = new Set(state.precios.map(p => p.grupo))
    return Array.from(set).sort()
  }, [state.precios])

  const filtered = state.precios.filter(p => {
    const matchSearch = !search || p.nombre.toLowerCase().includes(search.toLowerCase()) || p.codigo.toLowerCase().includes(search.toLowerCase()) || p.grupo.toLowerCase().includes(search.toLowerCase())
    const matchGrupo = filtroGrupo === 'TODOS' || p.grupo === filtroGrupo
    return matchSearch && matchGrupo
  })

  function startEdit(id: string, precio: number) {
    setEditingId(id)
    setEditValue(String(precio))
  }

  function saveEdit(id: string) {
    dispatch({ type: 'UPDATE_PRECIO', payload: { id, precio: Number(editValue) } })
    setEditingId(null)
    setLastEditedId(id)
    setTimeout(() => setLastEditedId(null), 3000)
  }

  function startProvEdit(id: string, proveedor: string) {
    setEditingProvId(id)
    setEditProvValue(proveedor)
  }

  function saveProvEdit(id: string) {
    dispatch({ type: 'UPDATE_PRECIO_PROVEEDOR', payload: { id, proveedor: editProvValue } })
    setEditingProvId(null)
    setLastEditedId(id)
    setTimeout(() => setLastEditedId(null), 3000)
  }

  const isRecent = (date: string) => {
    return (Date.now() - new Date(date).getTime()) < 7 * 86400000
  }

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Precios Maestro</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{state.precios.length} materiales y accesorios. Haz clic en un precio o proveedor para editarlo.</p>
        </div>
        <button
          onClick={() => navigate('/precios/importar')}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-xl text-sm font-medium hover:brightness-110 transition"
        >
          <Upload size={16} />
          Importar CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, codigo o categoria..."
          className="w-full pl-12 pr-4 py-3 rounded-xl text-sm bg-white border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
        />
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFiltroGrupo('TODOS')}
          className={`text-xs px-4 py-2 rounded-full font-medium border transition-all duration-200 ${filtroGrupo === 'TODOS' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white text-gray-600 border-[var(--color-border)] hover:border-gray-300'}`}
        >
          TODOS
        </button>
        {grupos.map(g => (
          <button
            key={g}
            onClick={() => setFiltroGrupo(g)}
            className={`text-xs px-4 py-2 rounded-full font-medium border transition-all duration-200 ${filtroGrupo === g ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white text-gray-600 border-[var(--color-border)] hover:border-gray-300'}`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F1F5F9] text-left text-[var(--color-text-muted)]">
              <th className="px-5 py-3.5 font-medium">Grupo</th>
              <th className="px-5 py-3.5 font-medium">Nombre</th>
              <th className="px-5 py-3.5 font-medium">Codigo</th>
              <th className="px-5 py-3.5 font-medium">Unidad</th>
              <th className="px-5 py-3.5 font-medium text-right">Precio</th>
              <th className="px-5 py-3.5 font-medium">Proveedor</th>
              <th className="px-5 py-3.5 font-medium">Ultima actualizacion</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} className={`border-t border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-all duration-300 ${i % 2 === 1 ? 'bg-[var(--color-surface)]' : 'bg-white'} ${lastEditedId === p.id ? 'bg-yellow-50' : ''}`}>
                <td className="px-5 py-3">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium border ${getGrupoColor(p.grupo)}`}>{p.grupo}</span>
                </td>
                <td className="px-5 py-3 text-xs text-[var(--color-text)] max-w-xs truncate">{p.nombre}</td>
                <td className="px-5 py-3 text-xs text-[var(--color-text-muted)] font-mono">{p.codigo}</td>
                <td className="px-5 py-3 text-xs text-[var(--color-text)]">{p.unidad}</td>
                <td className="px-5 py-3 text-right">
                  {editingId === p.id ? (
                    <div className="flex items-center gap-1.5 justify-end">
                      <input
                        type="number"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        className="w-28 px-2 py-1.5 rounded-lg text-sm text-right bg-white border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveEdit(p.id)
                          if (e.key === 'Escape') setEditingId(null)
                        }}
                      />
                      <button onClick={() => saveEdit(p.id)} className="text-green-600 hover:opacity-80 p-1 rounded-lg hover:bg-green-50 transition-all duration-200"><Save size={14} /></button>
                    </div>
                  ) : (
                    <span onClick={() => startEdit(p.id, p.precio)} className="cursor-pointer hover:text-[var(--color-primary)] font-medium transition-colors duration-200 text-[var(--color-text)]">{formatCOP(p.precio)}</span>
                  )}
                </td>
                <td className="px-5 py-3 text-xs">
                  {editingProvId === p.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={editProvValue}
                        onChange={e => setEditProvValue(e.target.value)}
                        className="w-32 px-2 py-1.5 rounded-lg text-sm bg-white border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveProvEdit(p.id)
                          if (e.key === 'Escape') setEditingProvId(null)
                        }}
                      />
                      <button onClick={() => saveProvEdit(p.id)} className="text-green-600 hover:opacity-80 p-1 rounded-lg hover:bg-green-50 transition-all duration-200"><Save size={14} /></button>
                    </div>
                  ) : (
                    <span onClick={() => startProvEdit(p.id, p.proveedor)} className="cursor-pointer hover:text-[var(--color-primary)] transition-colors duration-200 text-[var(--color-text-muted)]">{p.proveedor || '\u2014'}</span>
                  )}
                </td>
                <td className="px-5 py-3 text-xs text-[var(--color-text-muted)]">
                  <div className="flex items-center gap-2">
                    {p.updated_at}
                    {isRecent(p.updated_at) && <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 font-medium border border-green-200">Reciente</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="text-sm text-[var(--color-text-muted)] text-center">
        Mostrando {filtered.length} de {state.precios.length} materiales
      </div>
    </div>
  )
}

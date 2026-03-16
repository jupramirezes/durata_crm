import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { formatCOP } from '../lib/utils'
import { Search, Save, Upload, ChevronLeft, ChevronRight, Filter } from 'lucide-react'

const GRUPO_COLORS: Record<string, string> = {
  INOX: 'bg-blue-50 text-blue-700 border-blue-200',
  HIERRO: 'bg-orange-50 text-orange-700 border-orange-200',
  ALUMINIO: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  VIDRIO: 'bg-purple-50 text-purple-700 border-purple-200',
  OTROS: 'bg-gray-50 text-gray-700 border-gray-200',
  'MANO DE OBRA': 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

function getGrupoColor(grupo: string) {
  return GRUPO_COLORS[grupo.toUpperCase()] || 'bg-gray-50 text-gray-700 border-gray-200'
}

const PAGE_SIZE_OPTIONS = [25, 50, 100, 0] as const // 0 = Todos

export default function Precios() {
  const navigate = useNavigate()
  const { state, dispatch } = useStore()

  // ── Filters ──
  const [search, setSearch] = useState('')
  const [filtroGrupo, setFiltroGrupo] = useState('TODOS')
  const [filtroSubgrupo, setFiltroSubgrupo] = useState('TODOS')
  const [filtroPrecio, setFiltroPrecio] = useState<'todos' | 'con_precio' | 'sin_precio'>('todos')

  // ── Pagination ──
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(50)

  // ── Inline editing ──
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editingProvId, setEditingProvId] = useState<string | null>(null)
  const [editProvValue, setEditProvValue] = useState('')
  const [lastEditedId, setLastEditedId] = useState<string | null>(null)

  // ── Derived: unique groups ──
  const grupos = useMemo(() => {
    const set = new Set(state.precios.map(p => p.grupo))
    return Array.from(set).sort()
  }, [state.precios])

  // ── Derived: subgroups (filtered by selected grupo) ──
  const subgrupos = useMemo(() => {
    const base = filtroGrupo === 'TODOS' ? state.precios : state.precios.filter(p => p.grupo === filtroGrupo)
    const set = new Set(base.map(p => p.subgrupo || '').filter(Boolean))
    return Array.from(set).sort()
  }, [state.precios, filtroGrupo])

  // ── Filtered data ──
  const filtered = useMemo(() => {
    return state.precios.filter(p => {
      const matchSearch = !search || p.nombre.toLowerCase().includes(search.toLowerCase()) || p.codigo.toLowerCase().includes(search.toLowerCase())
      const matchGrupo = filtroGrupo === 'TODOS' || p.grupo === filtroGrupo
      const matchSubgrupo = filtroSubgrupo === 'TODOS' || (p.subgrupo || '') === filtroSubgrupo
      const matchPrecio = filtroPrecio === 'todos' || (filtroPrecio === 'con_precio' ? p.precio > 0 : p.precio === 0)
      return matchSearch && matchGrupo && matchSubgrupo && matchPrecio
    })
  }, [state.precios, search, filtroGrupo, filtroSubgrupo, filtroPrecio])

  // ── Paginated data ──
  const totalPages = pageSize === 0 ? 1 : Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginatedData = pageSize === 0 ? filtered : filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  // Reset page when filters change
  function resetPage() { setPage(1) }

  // ── Edit handlers ──
  function startEdit(id: string, precio: number) {
    setEditingId(id)
    setEditValue(String(precio))
  }

  function saveEdit(id: string) {
    dispatch({ type: 'UPDATE_PRECIO', payload: { id, precio: Number(editValue) } })
    setEditingId(null)
    setLastEditedId(id)
    setTimeout(() => setLastEditedId(null), 2500)
  }

  function startProvEdit(id: string, proveedor: string) {
    setEditingProvId(id)
    setEditProvValue(proveedor)
  }

  function saveProvEdit(id: string) {
    dispatch({ type: 'UPDATE_PRECIO_PROVEEDOR', payload: { id, proveedor: editProvValue } })
    setEditingProvId(null)
    setLastEditedId(id)
    setTimeout(() => setLastEditedId(null), 2500)
  }

  const isRecent = (date: string) => (Date.now() - new Date(date).getTime()) < 7 * 86400000

  // ── Select styling helper ──
  const selectCls = 'px-3 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]'

  return (
    <div className="p-8 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Precios Maestro</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Mostrando {filtered.length === state.precios.length ? state.precios.length : `${filtered.length} de ${state.precios.length}`} materiales.
            Clic en precio o proveedor para editar.
          </p>
        </div>
        <button
          onClick={() => navigate('/precios/importar')}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-xl text-sm font-medium hover:brightness-110 transition"
        >
          <Upload size={16} />
          Importar CSV
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-[var(--color-text-muted)]" />
          <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Filtros</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Grupo */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-1 block">Grupo</label>
            <select
              value={filtroGrupo}
              onChange={e => { setFiltroGrupo(e.target.value); setFiltroSubgrupo('TODOS'); resetPage() }}
              className={selectCls + ' w-full'}
            >
              <option value="TODOS">Todos los grupos</option>
              {grupos.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Subgrupo (depends on grupo) */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-1 block">Subgrupo</label>
            <select
              value={filtroSubgrupo}
              onChange={e => { setFiltroSubgrupo(e.target.value); resetPage() }}
              className={selectCls + ' w-full'}
              disabled={subgrupos.length === 0}
            >
              <option value="TODOS">Todos los subgrupos</option>
              {subgrupos.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Nombre search */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-1 block">Nombre</label>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); resetPage() }}
                placeholder="Buscar por nombre o codigo..."
                className={selectCls + ' w-full pl-8'}
              />
            </div>
          </div>

          {/* Precio filter */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-1 block">Precio</label>
            <select
              value={filtroPrecio}
              onChange={e => { setFiltroPrecio(e.target.value as typeof filtroPrecio); resetPage() }}
              className={selectCls + ' w-full'}
            >
              <option value="todos">Todos</option>
              <option value="con_precio">Con precio (&gt;0)</option>
              <option value="sin_precio">Sin precio (=0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F1F5F9] text-left text-[var(--color-text-muted)]">
                <th className="px-4 py-3 font-medium">Grupo</th>
                <th className="px-4 py-3 font-medium">Subgrupo</th>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Codigo</th>
                <th className="px-4 py-3 font-medium">Und</th>
                <th className="px-4 py-3 font-medium text-right">Precio</th>
                <th className="px-4 py-3 font-medium">Proveedor</th>
                <th className="px-4 py-3 font-medium">Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-[var(--color-text-muted)]">
                    No se encontraron materiales con los filtros actuales
                  </td>
                </tr>
              ) : (
                paginatedData.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`border-t border-[var(--color-border)] hover:bg-blue-50/40 transition-all duration-200 ${
                      i % 2 === 1 ? 'bg-[var(--color-surface)]' : 'bg-white'
                    } ${lastEditedId === p.id ? 'bg-yellow-50 ring-1 ring-yellow-200' : ''}`}
                  >
                    {/* Grupo */}
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border whitespace-nowrap ${getGrupoColor(p.grupo)}`}>
                        {p.grupo}
                      </span>
                    </td>

                    {/* Subgrupo */}
                    <td className="px-4 py-2.5 text-xs text-[var(--color-text-muted)]">
                      {p.subgrupo || '\u2014'}
                    </td>

                    {/* Nombre */}
                    <td className="px-4 py-2.5 text-xs text-[var(--color-text)] max-w-xs truncate" title={p.nombre}>
                      {p.nombre}
                    </td>

                    {/* Codigo */}
                    <td className="px-4 py-2.5 text-xs text-[var(--color-text-muted)] font-mono">
                      {p.codigo || '\u2014'}
                    </td>

                    {/* Unidad */}
                    <td className="px-4 py-2.5 text-xs text-[var(--color-text)]">{p.unidad}</td>

                    {/* Precio (editable) */}
                    <td className="px-4 py-2.5 text-right">
                      {editingId === p.id ? (
                        <div className="flex items-center gap-1 justify-end">
                          <input
                            type="number"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            className="w-28 px-2 py-1 rounded-lg text-xs text-right bg-white border border-[var(--color-primary)]/40 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveEdit(p.id)
                              if (e.key === 'Escape') setEditingId(null)
                            }}
                            onBlur={() => setEditingId(null)}
                          />
                          <button onClick={() => saveEdit(p.id)} className="text-green-600 hover:opacity-80 p-0.5 rounded hover:bg-green-50 transition"><Save size={13} /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 justify-end">
                          <span
                            onClick={() => startEdit(p.id, p.precio)}
                            className={`cursor-pointer hover:text-[var(--color-primary)] font-medium transition-colors text-xs ${p.precio === 0 ? 'text-red-400' : 'text-[var(--color-text)]'}`}
                          >
                            {p.precio === 0 ? '$0' : formatCOP(p.precio)}
                          </span>
                          {lastEditedId === p.id && (
                            <span className="text-[10px] text-green-600 font-medium animate-fade-in">Actualizado ✓</span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Proveedor (editable) */}
                    <td className="px-4 py-2.5 text-xs">
                      {editingProvId === p.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editProvValue}
                            onChange={e => setEditProvValue(e.target.value)}
                            className="w-28 px-2 py-1 rounded-lg text-xs bg-white border border-[var(--color-primary)]/40 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveProvEdit(p.id)
                              if (e.key === 'Escape') setEditingProvId(null)
                            }}
                            onBlur={() => setEditingProvId(null)}
                          />
                          <button onClick={() => saveProvEdit(p.id)} className="text-green-600 hover:opacity-80 p-0.5 rounded hover:bg-green-50 transition"><Save size={13} /></button>
                        </div>
                      ) : (
                        <span
                          onClick={() => startProvEdit(p.id, p.proveedor)}
                          className="cursor-pointer hover:text-[var(--color-primary)] transition-colors text-[var(--color-text-muted)]"
                        >
                          {p.proveedor || '\u2014'}
                        </span>
                      )}
                    </td>

                    {/* Updated */}
                    <td className="px-4 py-2.5 text-xs text-[var(--color-text-muted)]">
                      <div className="flex items-center gap-1.5">
                        {p.updated_at?.split('T')[0] || '\u2014'}
                        {p.updated_at && isRecent(p.updated_at) && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 font-medium border border-green-200">Nuevo</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)] bg-[#F8FAFC]">
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <span>Filas por pagina:</span>
            {PAGE_SIZE_OPTIONS.map(size => (
              <button
                key={size}
                onClick={() => { setPageSize(size); setPage(1) }}
                className={`px-2 py-1 rounded-md font-medium transition ${
                  pageSize === size
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]'
                }`}
              >
                {size === 0 ? 'Todos' : size}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-[var(--color-text-muted)]">
              Mostrando {filtered.length === 0 ? 0 : (safePage - 1) * (pageSize || filtered.length) + 1}–{Math.min(safePage * (pageSize || filtered.length), filtered.length)} de {filtered.length}
            </span>
            {pageSize > 0 && totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="px-2 font-medium text-[var(--color-text)]">
                  {safePage} <span className="text-[var(--color-text-muted)] font-normal">de</span> {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

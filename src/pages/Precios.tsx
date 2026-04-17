import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { formatCOP } from '../lib/utils'
import { PageHeader } from '../components/ui'
import { Search, Save, Upload, ChevronLeft, ChevronRight, Filter, ChevronUp, ChevronDown } from 'lucide-react'

type SortKey = 'grupo' | 'subgrupo' | 'nombre' | 'codigo' | 'unidad' | 'precio' | 'proveedor' | 'updated_at'
type SortDir = 'asc' | 'desc'

const GRUPO_COLORS: Record<string, string> = {
  INOX: 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]',
  HIERRO: 'bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]',
  ALUMINIO: 'bg-[#f0f9ff] text-[#0284c7] border-[#bae6fd]',
  VIDRIO: 'bg-[#faf5ff] text-[#7c3aed] border-[#e9d5ff]',
  OTROS: 'bg-gray-50 text-gray-600 border-gray-200',
  'MANO DE OBRA': 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

function getGrupoColor(grupo: string) {
  return GRUPO_COLORS[grupo.toUpperCase()] || 'bg-gray-50 text-gray-700 border-gray-200'
}

const PAGE_SIZE_OPTIONS = [25, 50, 100, 0] as const

export default function Precios() {
  const navigate = useNavigate()
  const { state, dispatch } = useStore()

  const [search, setSearch] = useState('')
  const [filtroGrupo, setFiltroGrupo] = useState('TODOS')
  const [filtroSubgrupo, setFiltroSubgrupo] = useState('TODOS')
  const [filtroPrecio, setFiltroPrecio] = useState<'todos' | 'con_precio' | 'sin_precio'>('todos')

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(50)
  const [sortKey, setSortKey] = useState<SortKey>('grupo')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }
  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronDown size={10} className="opacity-30" />
    return sortDir === 'desc' ? <ChevronDown size={10} className="text-[var(--color-primary)]" /> : <ChevronUp size={10} className="text-[var(--color-primary)]" />
  }

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editingProvId, setEditingProvId] = useState<string | null>(null)
  const [editProvValue, setEditProvValue] = useState('')
  const [lastEditedId, setLastEditedId] = useState<string | null>(null)

  const grupos = useMemo(() => {
    const set = new Set(state.precios.map(p => p.grupo))
    return Array.from(set).sort()
  }, [state.precios])

  const subgrupos = useMemo(() => {
    const base = filtroGrupo === 'TODOS' ? state.precios : state.precios.filter(p => p.grupo === filtroGrupo)
    const set = new Set(base.map(p => p.subgrupo || '').filter(Boolean))
    return Array.from(set).sort()
  }, [state.precios, filtroGrupo])

  const filtered = useMemo(() => {
    const res = state.precios.filter(p => {
      const s = search.toLowerCase()
      const matchSearch = !search || (p.nombre || '').toLowerCase().includes(s) || (p.codigo || '').toLowerCase().includes(s) || (p.proveedor || '').toLowerCase().includes(s)
      const matchGrupo = filtroGrupo === 'TODOS' || p.grupo === filtroGrupo
      const matchSubgrupo = filtroSubgrupo === 'TODOS' || (p.subgrupo || '') === filtroSubgrupo
      const matchPrecio = filtroPrecio === 'todos' || (filtroPrecio === 'con_precio' ? p.precio > 0 : p.precio === 0)
      return matchSearch && matchGrupo && matchSubgrupo && matchPrecio
    })
    const mult = sortDir === 'asc' ? 1 : -1
    return [...res].sort((a, b) => {
      const av = (a as any)[sortKey]
      const bv = (b as any)[sortKey]
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * mult
      return String(av || '').localeCompare(String(bv || '')) * mult
    })
  }, [state.precios, search, filtroGrupo, filtroSubgrupo, filtroPrecio, sortKey, sortDir])

  const totalPages = pageSize === 0 ? 1 : Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginatedData = pageSize === 0 ? filtered : filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  function resetPage() { setPage(1) }

  function startEdit(id: string, precio: number) {
    setEditingId(id)
    setEditValue(String(precio))
  }

  function saveEdit(id: string) {
    dispatch({ type: 'UPDATE_PRECIO', payload: { id, precio: Math.max(0, Number(editValue) || 0) } })
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

  const selectCls = 'px-2.5 py-1.5 text-[10px] rounded-md border border-[var(--color-border)] bg-white text-[var(--color-text)]'

  return (
    <div className="px-8 py-8 space-y-5 animate-fade-in">
      <PageHeader
        title="Precios Maestro"
        subtitle={`${filtered.length === state.precios.length ? state.precios.length : `${filtered.length} de ${state.precios.length}`} materiales. Clic en precio o proveedor para editar.`}
        actions={
          <button
            onClick={() => navigate('/precios/importar')}
            className="flex items-center gap-1.5 h-[42px] px-6 bg-[var(--color-primary)] text-white rounded-[10px] text-sm font-medium hover:opacity-90 transition-all"
          >
            <Upload size={14} /> Importar CSV
          </button>
        }
      />

      {/* Sin precio banner */}
      {(() => {
        const sinPrecio = state.precios.filter(p => p.precio === 0).length
        const pct = state.precios.length > 0 ? ((sinPrecio / state.precios.length) * 100).toFixed(1) : '0'
        return sinPrecio > 0 ? (
          <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-[10px] px-5 py-3 text-[#92400e] text-sm">
            <strong>{sinPrecio}</strong> de {state.precios.length} materiales sin precio ({pct}%)
          </div>
        ) : null
      })()}

      {/* Filters bar */}
      <div className="card p-4">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Filter size={12} className="text-[var(--color-text-muted)]" />
          <span className="text-[9px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Filtros</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <div>
            <label className="text-[9px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-0.5 block">Grupo</label>
            <select
              value={filtroGrupo}
              onChange={e => { setFiltroGrupo(e.target.value); setFiltroSubgrupo('TODOS'); resetPage() }}
              className={selectCls + ' w-full'}
            >
              <option value="TODOS">Todos los grupos</option>
              {grupos.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[9px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-0.5 block">Subgrupo</label>
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
          <div>
            <label className="text-[9px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-0.5 block">Nombre</label>
            <div className="relative">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); resetPage() }}
                placeholder="Buscar por nombre o codigo..."
                className={selectCls + ' w-full pl-7'}
              />
            </div>
          </div>
          <div>
            <label className="text-[9px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-0.5 block">Precio</label>
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
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="bg-[var(--color-surface)] text-left text-[var(--color-text-muted)]">
                <th className="px-3 py-2.5 font-medium"><button onClick={() => toggleSort('grupo')} className="flex items-center gap-1 hover:text-[var(--color-text)]">Grupo <SortIcon col="grupo" /></button></th>
                <th className="px-3 py-2.5 font-medium"><button onClick={() => toggleSort('subgrupo')} className="flex items-center gap-1 hover:text-[var(--color-text)]">Subgrupo <SortIcon col="subgrupo" /></button></th>
                <th className="px-3 py-2.5 font-medium"><button onClick={() => toggleSort('nombre')} className="flex items-center gap-1 hover:text-[var(--color-text)]">Nombre <SortIcon col="nombre" /></button></th>
                <th className="px-3 py-2.5 font-medium"><button onClick={() => toggleSort('codigo')} className="flex items-center gap-1 hover:text-[var(--color-text)]">Codigo <SortIcon col="codigo" /></button></th>
                <th className="px-3 py-2.5 font-medium"><button onClick={() => toggleSort('unidad')} className="flex items-center gap-1 hover:text-[var(--color-text)]">Und <SortIcon col="unidad" /></button></th>
                <th className="px-3 py-2.5 font-medium text-right"><button onClick={() => toggleSort('precio')} className="flex items-center gap-1 hover:text-[var(--color-text)] ml-auto">Precio <SortIcon col="precio" /></button></th>
                <th className="px-3 py-2.5 font-medium"><button onClick={() => toggleSort('proveedor')} className="flex items-center gap-1 hover:text-[var(--color-text)]">Proveedor <SortIcon col="proveedor" /></button></th>
                <th className="px-3 py-2.5 font-medium"><button onClick={() => toggleSort('updated_at')} className="flex items-center gap-1 hover:text-[var(--color-text)]">Actualizado <SortIcon col="updated_at" /></button></th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-10 text-center text-xs text-[var(--color-text-muted)]">
                    No se encontraron materiales con los filtros actuales
                  </td>
                </tr>
              ) : (
                paginatedData.map((p) => (
                  <tr
                    key={p.id}
                    className={`border-b border-[#f8fafc] hover:bg-[#fafbfc] transition-colors ${lastEditedId === p.id ? 'bg-yellow-50 ring-1 ring-yellow-200' : ''}`}
                  >
                    <td className="px-3 py-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium border whitespace-nowrap ${getGrupoColor(p.grupo)}`}>
                        {p.grupo}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[var(--color-text-muted)]">{p.subgrupo || '\u2014'}</td>
                    <td className="px-3 py-2 text-[var(--color-text)] max-w-xs truncate" title={p.nombre}>{p.nombre}</td>
                    <td className="px-3 py-2 text-[var(--color-text-muted)] font-mono">{p.codigo || '\u2014'}</td>
                    <td className="px-3 py-2 text-[var(--color-text)]">{p.unidad}</td>
                    <td className="px-3 py-2 text-right">
                      {editingId === p.id ? (
                        <div className="flex items-center gap-1 justify-end">
                          <input
                            type="number"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            className="w-24 px-1.5 py-0.5 rounded text-[10px] text-right bg-white border border-[var(--color-primary)]/40"
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveEdit(p.id)
                              if (e.key === 'Escape') setEditingId(null)
                            }}
                            onBlur={() => setEditingId(null)}
                          />
                          <button onMouseDown={e => { e.preventDefault(); saveEdit(p.id) }} className="text-green-600 hover:opacity-80 p-0.5 rounded hover:bg-green-50"><Save size={11} /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 justify-end">
                          <span
                            onClick={() => startEdit(p.id, p.precio)}
                            className={`cursor-pointer hover:text-[var(--color-primary)] font-medium transition-colors tabular-nums ${p.precio === 0 ? 'text-[#94a3b8]' : 'text-[var(--color-text)]'}`}
                          >
                            {p.precio === 0 ? '—' : formatCOP(p.precio)}
                          </span>
                          {lastEditedId === p.id && (
                            <span className="text-[8px] text-green-600 font-medium animate-fade-in">OK</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editingProvId === p.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editProvValue}
                            onChange={e => setEditProvValue(e.target.value)}
                            className="w-24 px-1.5 py-0.5 rounded text-[10px] bg-white border border-[var(--color-primary)]/40"
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveProvEdit(p.id)
                              if (e.key === 'Escape') setEditingProvId(null)
                            }}
                            onBlur={() => setEditingProvId(null)}
                          />
                          <button onMouseDown={e => { e.preventDefault(); saveProvEdit(p.id) }} className="text-green-600 hover:opacity-80 p-0.5 rounded hover:bg-green-50"><Save size={11} /></button>
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
                    <td className="px-3 py-2 text-[var(--color-text-muted)]">
                      <div className="flex items-center gap-1">
                        {p.updated_at?.split('T')[0] || '\u2014'}
                        {p.updated_at && isRecent(p.updated_at) && (
                          <span className="text-[8px] px-1 py-0.5 rounded bg-green-50 text-green-700 font-medium border border-green-200">Nuevo</span>
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
        <div className="flex items-center justify-between px-3 py-2.5 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
            <span>Filas por pagina:</span>
            {PAGE_SIZE_OPTIONS.map(size => (
              <button
                key={size}
                onClick={() => { setPageSize(size); setPage(1) }}
                className={`px-1.5 py-0.5 rounded font-medium transition ${
                  pageSize === size
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]'
                }`}
              >
                {size === 0 ? 'Todos' : size}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-[var(--color-text-muted)]">
              Mostrando {filtered.length === 0 ? 0 : (safePage - 1) * (pageSize || filtered.length) + 1}–{Math.min(safePage * (pageSize || filtered.length), filtered.length)} de {filtered.length}
            </span>
            {pageSize > 0 && totalPages > 1 && (
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="p-1 rounded hover:bg-[var(--color-surface-hover)] transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={12} />
                </button>
                <span className="px-1.5 font-medium text-[var(--color-text)]">
                  {safePage} <span className="text-[var(--color-text-muted)] font-normal">de</span> {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="p-1 rounded hover:bg-[var(--color-surface-hover)] transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

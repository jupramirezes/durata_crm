import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { formatCOP } from '../lib/utils'
import { Search, Save, Upload, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X, Plus } from 'lucide-react'

type SortKey = 'grupo' | 'subgrupo' | 'nombre' | 'codigo' | 'unidad' | 'precio' | 'proveedor' | 'updated_at'
type SortDir = 'asc' | 'desc'

const PAGE_SIZE_OPTIONS = [25, 50, 100, 0] as const

export default function Precios() {
  const navigate = useNavigate()
  const { state, dispatch } = useStore()

  const [search, setSearch] = useState('')
  const [filtroGrupo, setFiltroGrupo] = useState('TODOS')
  const [filtroPrecio, setFiltroPrecio] = useState<'todos' | 'con_precio' | 'sin_precio'>('todos')

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(50)
  const [sortKey, setSortKey] = useState<SortKey>('grupo')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editingProvId, setEditingProvId] = useState<string | null>(null)
  const [editProvValue, setEditProvValue] = useState('')
  const [lastEditedId, setLastEditedId] = useState<string | null>(null)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }
  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronDown size={9} style={{ opacity: 0.3 }} />
    return sortDir === 'desc'
      ? <ChevronDown size={9} style={{ color: 'var(--color-primary)' }} />
      : <ChevronUp size={9} style={{ color: 'var(--color-primary)' }} />
  }

  const grupos = useMemo(() => {
    const set = new Set(state.precios.map(p => p.grupo).filter(Boolean))
    return Array.from(set).sort()
  }, [state.precios])

  const grupoCounts = useMemo(() => {
    const m: Record<string, number> = { TODOS: state.precios.length }
    for (const p of state.precios) m[p.grupo] = (m[p.grupo] || 0) + 1
    return m
  }, [state.precios])

  const filtered = useMemo(() => {
    const res = state.precios.filter(p => {
      const s = search.toLowerCase()
      const matchSearch = !search
        || (p.nombre || '').toLowerCase().includes(s)
        || (p.codigo || '').toLowerCase().includes(s)
        || (p.proveedor || '').toLowerCase().includes(s)
      const matchGrupo = filtroGrupo === 'TODOS' || p.grupo === filtroGrupo
      const matchPrecio = filtroPrecio === 'todos'
        || (filtroPrecio === 'con_precio' ? p.precio > 0 : p.precio === 0)
      return matchSearch && matchGrupo && matchPrecio
    })
    const mult = sortDir === 'asc' ? 1 : -1
    return [...res].sort((a, b) => {
      const av = (a as any)[sortKey]
      const bv = (b as any)[sortKey]
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * mult
      return String(av || '').localeCompare(String(bv || '')) * mult
    })
  }, [state.precios, search, filtroGrupo, filtroPrecio, sortKey, sortDir])

  const totalPages = pageSize === 0 ? 1 : Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginatedData = pageSize === 0 ? filtered : filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

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
  const sinPrecioCount = state.precios.filter(p => p.precio === 0).length
  const hasFilters = !!(search || filtroGrupo !== 'TODOS' || filtroPrecio !== 'todos')

  return (
    <div className="list-page">
      <div className="list-head">
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
          <div>
            <div className="title">Precios Maestros</div>
            <div className="sub">
              {state.precios.length.toLocaleString('es-CO')} materiales
              {sinPrecioCount > 0 && ` · ${sinPrecioCount.toLocaleString('es-CO')} sin precio`}
              {hasFilters && ` · ${filtered.length.toLocaleString('es-CO')} filtrados`}
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <button onClick={() => navigate('/precios/importar')} className="btn-d sm">
            <Upload size={12} /> Importar CSV
          </button>
          <button className="btn-d primary sm" disabled title="Próximamente">
            <Plus size={12} /> Nuevo ítem
          </button>
        </div>
      </div>

      <div className="list-toolbar">
        {/* Chip all + grupos */}
        <button
          className={`chip ${filtroGrupo === 'TODOS' ? 'on' : ''}`}
          onClick={() => { setFiltroGrupo('TODOS'); setPage(1) }}
        >
          Todos ({grupoCounts.TODOS.toLocaleString('es-CO')})
        </button>
        {grupos.map(g => (
          <button
            key={g}
            className={`chip ${filtroGrupo === g ? 'on' : ''}`}
            onClick={() => { setFiltroGrupo(filtroGrupo === g ? 'TODOS' : g); setPage(1) }}
          >
            {g} ({(grupoCounts[g] || 0).toLocaleString('es-CO')})
          </button>
        ))}

        <div style={{ width: 1, height: 20, background: 'var(--color-border)', margin: '0 4px' }} />

        <select
          className="chip chip-select"
          value={filtroPrecio}
          onChange={e => { setFiltroPrecio(e.target.value as typeof filtroPrecio); setPage(1) }}
          style={{ minWidth: 140 }}
        >
          <option value="todos">Precio: Todos</option>
          <option value="con_precio">Con precio (&gt;0)</option>
          <option value="sin_precio">Sin precio (=0)</option>
        </select>

        {hasFilters && (
          <button
            className="chip"
            onClick={() => { setSearch(''); setFiltroGrupo('TODOS'); setFiltroPrecio('todos'); setPage(1) }}
            style={{ color: 'var(--color-accent-red)' }}
          >
            <X />Limpiar
          </button>
        )}

        <div style={{ flex: 1 }} />

        <div className="search-input" style={{ flex: '0 0 280px' }}>
          <Search />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar por código, nombre o proveedor…"
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-label)', minHeight: 0, padding: 2 }}>
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="list-scroll">
        <table className="list-tbl">
          <thead>
            <tr>
              <th style={{ width: '18%' }} className="sortable" onClick={() => toggleSort('codigo')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Código <SortIcon col="codigo" /></span>
              </th>
              <th className="sortable" onClick={() => toggleSort('nombre')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Nombre <SortIcon col="nombre" /></span>
              </th>
              <th className="sortable" onClick={() => toggleSort('grupo')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Grupo <SortIcon col="grupo" /></span>
              </th>
              <th className="sortable" onClick={() => toggleSort('unidad')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Und <SortIcon col="unidad" /></span>
              </th>
              <th className="sortable" onClick={() => toggleSort('proveedor')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Proveedor <SortIcon col="proveedor" /></span>
              </th>
              <th className="num sortable" onClick={() => toggleSort('precio')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Precio <SortIcon col="precio" /></span>
              </th>
              <th className="num sortable" onClick={() => toggleSort('updated_at')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Actualizado <SortIcon col="updated_at" /></span>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-label)' }}>
                  {hasFilters ? 'Sin materiales para los filtros aplicados' : 'Aún no hay precios registrados. Importa CSV para empezar.'}
                </td>
              </tr>
            ) : (
              paginatedData.map((p) => (
                <tr
                  key={p.id}
                  style={{
                    background: lastEditedId === p.id ? 'var(--color-primary-weak)' : undefined,
                  }}
                >
                  <td className="mono" style={{ color: 'var(--color-text-muted)', fontSize: 11.5 }}>
                    {p.codigo || <span style={{ color: 'var(--color-text-faint)' }}>—</span>}
                  </td>
                  <td className="primary-cell">{p.nombre}</td>
                  <td>
                    <span className="stage-pill">
                      <span className="stage-dot" style={{ background: 'var(--color-text-label)' }} />
                      {p.grupo}
                    </span>
                    {p.subgrupo && (
                      <div className="mono" style={{ fontSize: 10.5, color: 'var(--color-text-label)', marginTop: 2 }}>{p.subgrupo}</div>
                    )}
                  </td>
                  <td className="mono" style={{ color: 'var(--color-text-label)' }}>{p.unidad || '—'}</td>
                  <td onClick={e => e.stopPropagation()}>
                    {editingProvId === p.id ? (
                      <input
                        type="text"
                        value={editProvValue}
                        onChange={e => setEditProvValue(e.target.value)}
                        style={{ width: 140, padding: '3px 6px', fontSize: 12, border: '1px solid var(--color-primary)' }}
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveProvEdit(p.id)
                          if (e.key === 'Escape') setEditingProvId(null)
                        }}
                        onBlur={() => saveProvEdit(p.id)}
                      />
                    ) : (
                      <span
                        onClick={() => startProvEdit(p.id, p.proveedor)}
                        style={{ cursor: 'pointer', color: p.proveedor ? 'var(--color-text)' : 'var(--color-text-faint)' }}
                      >
                        {p.proveedor || '—'}
                      </span>
                    )}
                  </td>
                  <td className="num" onClick={e => e.stopPropagation()}>
                    {editingId === p.id ? (
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', alignItems: 'center' }}>
                        <input
                          type="number"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          style={{ width: 110, padding: '3px 6px', fontSize: 12, textAlign: 'right', border: '1px solid var(--color-primary)' }}
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveEdit(p.id)
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                          onBlur={() => setEditingId(null)}
                        />
                        <button
                          onMouseDown={e => { e.preventDefault(); saveEdit(p.id) }}
                          className="btn-d ghost icon sm"
                          style={{ color: 'var(--color-accent-green)' }}
                        ><Save size={11} /></button>
                      </div>
                    ) : (
                      <span
                        onClick={() => startEdit(p.id, p.precio)}
                        style={{
                          cursor: 'pointer',
                          fontWeight: p.precio > 0 ? 600 : 400,
                          color: p.precio === 0 ? 'var(--color-text-faint)' : 'var(--color-text)',
                        }}
                      >
                        {p.precio === 0 ? '—' : formatCOP(p.precio)}
                      </span>
                    )}
                  </td>
                  <td className="num" style={{ color: 'var(--color-text-label)' }}>
                    <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center', justifyContent: 'flex-end' }}>
                      {p.updated_at?.split('T')[0] || '—'}
                      {p.updated_at && isRecent(p.updated_at) && (
                        <span className="mono" style={{ fontSize: 9, padding: '1px 4px', borderRadius: 3, background: 'var(--color-primary-weak)', color: 'var(--color-primary)', border: '1px solid var(--color-primary-line)' }}>nuevo</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="list-foot">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Mostrando {filtered.length === 0 ? 0 : (safePage - 1) * (pageSize || filtered.length) + 1}–{Math.min(safePage * (pageSize || filtered.length), filtered.length)} de {filtered.length.toLocaleString('es-CO')}</span>
          <span style={{ color: 'var(--color-text-faint)' }}>·</span>
          <span style={{ color: 'var(--color-text-label)' }}>Filas:</span>
          {PAGE_SIZE_OPTIONS.map(size => (
            <button
              key={size}
              onClick={() => { setPageSize(size); setPage(1) }}
              className={`chip ${pageSize === size ? 'on' : ''}`}
              style={{ height: 22, fontSize: 11, padding: '0 8px' }}
            >
              {size === 0 ? 'Todos' : size}
            </button>
          ))}
        </div>
        {pageSize > 0 && totalPages > 1 && (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="btn-d ghost icon sm"
              style={{ opacity: safePage === 1 ? 0.4 : 1 }}
            ><ChevronLeft size={12} /></button>
            <span className="mono" style={{ padding: '0 8px', fontSize: 11.5, color: 'var(--color-text)' }}>
              {safePage} <span style={{ color: 'var(--color-text-label)' }}>de</span> {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="btn-d ghost icon sm"
              style={{ opacity: safePage === totalPages ? 0.4 : 1 }}
            ><ChevronRight size={12} /></button>
          </div>
        )}
      </div>
    </div>
  )
}

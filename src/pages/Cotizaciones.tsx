import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { findCotizador, COTIZADORES } from '../types'
import { formatCOP, formatDate, getAvatarColor } from '../lib/utils'
import { Copy, Trash2, ChevronUp, ChevronDown, Search, Download, X } from 'lucide-react'
import { exportCotizacionesExcel } from '../lib/exportar-cotizaciones'

const PAGE_SIZE = 50

type SortKey = 'numero' | 'empresa' | 'fecha' | 'total' | 'estado' | 'cotizador'
type SortDir = 'asc' | 'desc'

const ESTADOS = ['borrador', 'enviada', 'aprobada', 'rechazada', 'descartada'] as const

export default function Cotizaciones() {
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [sortKey, setSortKey] = useState<SortKey>('fecha')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroCotizador, setFiltroCotizador] = useState('')

  const opMap = useMemo(() => new Map(state.oportunidades.map(o => [o.id, o])), [state.oportunidades])
  const empMap = useMemo(() => new Map(state.empresas.map(e => [e.id, e])), [state.empresas])
  const contactMap = useMemo(() => new Map(state.contactos.map(c => [c.id, c])), [state.contactos])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortKey(key); setSortDir('desc') }
    setPage(0)
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronDown size={9} style={{ opacity: 0.3 }} />
    return sortDir === 'desc'
      ? <ChevronDown size={9} style={{ color: 'var(--color-primary)' }} />
      : <ChevronUp size={9} style={{ color: 'var(--color-primary)' }} />
  }

  const enriched = useMemo(() => {
    return state.cotizaciones.map(c => {
      const op = opMap.get(c.oportunidad_id)
      const emp = op ? empMap.get(op.empresa_id) : null
      const contacto = op ? contactMap.get(op.contacto_id) : null
      const cotizador = op ? findCotizador(op.cotizador_asignado) : null
      return {
        ...c,
        empresaNombre: emp?.nombre ?? '—',
        contactoNombre: contacto?.nombre ?? '—',
        cotizadorNombre: cotizador?.nombre ?? '—',
        cotizadorIniciales: cotizador?.iniciales ?? '—',
        cotizadorId: cotizador?.id ?? '',
        oportunidad: op,
        productosCount: c.productos_snapshot?.length ?? 0,
      }
    })
  }, [state.cotizaciones, opMap, empMap, contactMap])

  const estadoCounts = useMemo(() => {
    const m: Record<string, number> = { all: enriched.length }
    for (const e of enriched) m[e.estado] = (m[e.estado] || 0) + 1
    return m
  }, [enriched])

  const filtered = useMemo(() => {
    let result = enriched
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(c =>
        c.numero.toLowerCase().includes(q) ||
        c.empresaNombre.toLowerCase().includes(q) ||
        c.contactoNombre.toLowerCase().includes(q)
      )
    }
    if (filtroEstado) result = result.filter(c => c.estado === filtroEstado)
    if (filtroCotizador) result = result.filter(c => c.cotizadorId === filtroCotizador)
    return result
  }, [enriched, search, filtroEstado, filtroCotizador])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'numero': cmp = a.numero.localeCompare(b.numero); break
        case 'empresa': cmp = a.empresaNombre.localeCompare(b.empresaNombre); break
        case 'fecha': cmp = new Date(a.fecha).getTime() - new Date(b.fecha).getTime(); break
        case 'total': cmp = a.total - b.total; break
        case 'estado': cmp = a.estado.localeCompare(b.estado); break
        case 'cotizador': cmp = a.cotizadorNombre.localeCompare(b.cotizadorNombre); break
      }
      return sortDir === 'desc' ? -cmp : cmp
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const visible = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const hasFilters = !!(search || filtroEstado || filtroCotizador)

  return (
    <div className="list-page">
      <div className="list-head">
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
          <div>
            <div className="title">Cotizaciones</div>
            <div className="sub">
              {state.cotizaciones.length.toLocaleString('es-CO')} cotizaciones generadas
              {hasFilters && ` · ${filtered.length.toLocaleString('es-CO')} filtradas`}
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => {
              exportCotizacionesExcel({
                cotizaciones: sorted,
                oportunidades: state.oportunidades,
                empresas: state.empresas,
                contactos: state.contactos,
              })
            }}
            className="btn-d sm"
            title={`Exportar ${filtered.length} cotizaciones a Excel`}
          >
            <Download size={12} /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="list-toolbar">
        {/* Estado chips */}
        <button className={`chip ${!filtroEstado ? 'on' : ''}`} onClick={() => { setFiltroEstado(''); setPage(0) }}>
          Todos ({estadoCounts.all.toLocaleString('es-CO')})
        </button>
        {ESTADOS.map(e => (
          <button
            key={e}
            className={`chip ${filtroEstado === e ? 'on' : ''}`}
            onClick={() => { setFiltroEstado(filtroEstado === e ? '' : e); setPage(0) }}
          >
            {e.charAt(0).toUpperCase() + e.slice(1)} ({(estadoCounts[e] || 0).toLocaleString('es-CO')})
          </button>
        ))}

        <div style={{ width: 1, height: 20, background: 'var(--color-border)', margin: '0 4px' }} />

        <select
          className="chip chip-select"
          value={filtroCotizador}
          onChange={e => { setFiltroCotizador(e.target.value); setPage(0) }}
          style={{ minWidth: 120 }}
        >
          <option value="">Cotizador: Todos</option>
          {COTIZADORES.map(c => <option key={c.id} value={c.id}>{c.iniciales} — {c.nombre}</option>)}
        </select>

        {hasFilters && (
          <button
            className="chip"
            onClick={() => { setSearch(''); setFiltroEstado(''); setFiltroCotizador(''); setPage(0) }}
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
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            placeholder="Buscar por # o empresa…"
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
              <th className="sortable" style={{ width: 90 }} onClick={() => toggleSort('numero')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>#<SortIcon col="numero" /></span>
              </th>
              <th className="sortable" style={{ width: 110 }} onClick={() => toggleSort('fecha')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Fecha<SortIcon col="fecha" /></span>
              </th>
              <th className="sortable" onClick={() => toggleSort('empresa')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Empresa · Contacto<SortIcon col="empresa" /></span>
              </th>
              <th className="sortable" onClick={() => toggleSort('estado')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Estado<SortIcon col="estado" /></span>
              </th>
              <th className="sortable" onClick={() => toggleSort('cotizador')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Cotizador<SortIcon col="cotizador" /></span>
              </th>
              <th className="num" title="Número de productos/líneas en la cotización">Productos</th>
              <th className="num sortable" onClick={() => toggleSort('total')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Total<SortIcon col="total" /></span>
              </th>
              <th style={{ width: 110 }}></th>
            </tr>
          </thead>
          <tbody>
            {visible.map(c => {
              const goToOportunidad = () => c.oportunidad && navigate(`/oportunidades/${c.oportunidad.id}`)
              const rowClickable = !!c.oportunidad
              return (
                <tr key={c.id} onClick={rowClickable ? goToOportunidad : undefined} style={{ cursor: rowClickable ? 'pointer' : 'default' }}>
                  <td className="mono primary-cell">{c.numero}</td>
                  <td className="mono" style={{ color: 'var(--color-text-label)' }}>{formatDate(c.fecha)}</td>
                  <td>
                    <div className="primary-cell">{c.empresaNombre}</div>
                    <div className="sub-cell" style={{ fontFamily: 'inherit' }}>{c.contactoNombre}</div>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <select
                      value={c.estado}
                      onChange={e => dispatch({ type: 'UPDATE_COTIZACION_ESTADO', payload: { id: c.id, estado: e.target.value as any } })}
                      className={`state-pill ${c.estado}`}
                      style={{ cursor: 'pointer', border: undefined, padding: '2px 8px' }}
                    >
                      {ESTADOS.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
                    </select>
                  </td>
                  <td>
                    {c.cotizadorIniciales !== '—' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          className="avatar xs"
                          style={{ background: getAvatarColor(c.cotizadorNombre), color: '#fff', border: 'none' }}
                          title={c.cotizadorNombre}
                        >{c.cotizadorIniciales}</span>
                        <span style={{ fontSize: 12 }}>{c.cotizadorIniciales}</span>
                      </div>
                    ) : <span style={{ color: 'var(--color-text-faint)' }}>—</span>}
                  </td>
                  <td className="num">{c.productosCount || '—'}</td>
                  <td className="num" style={{ fontWeight: 600 }}>
                    {c.total ? formatCOP(c.total, { short: true }) : '—'}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => {
                          const nuevoNumero = prompt('Número de la nueva cotización:') || ''
                          if (nuevoNumero) {
                            const newId = crypto.randomUUID()
                            dispatch({ type: 'DUPLICATE_COTIZACION', payload: { originalId: c.id, nuevoNumero, newId } })
                          }
                        }}
                        className="btn-d ghost icon sm"
                        title="Duplicar"
                      ><Copy size={12} /></button>
                      <button
                        onClick={() => {
                          if (window.confirm('¿Eliminar esta cotización?')) {
                            dispatch({ type: 'DELETE_COTIZACION', payload: { id: c.id } })
                          }
                        }}
                        className="btn-d ghost icon sm"
                        style={{ color: 'var(--color-accent-red)' }}
                        title="Eliminar"
                      ><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-label)' }}>
                  {hasFilters ? 'Sin cotizaciones para los filtros aplicados' : 'No hay cotizaciones generadas aún. Desde una oportunidad, configura un producto y generá la primera.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="list-foot">
        <span>
          Mostrando {visible.length} de {sorted.length.toLocaleString('es-CO')} cotizaciones · página {page + 1} de {totalPages || 1}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="btn-d sm"
            style={{ opacity: page === 0 ? 0.4 : 1 }}
          >Anterior</button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number
            if (totalPages <= 5) pageNum = i
            else if (page < 3) pageNum = i
            else if (page > totalPages - 4) pageNum = totalPages - 5 + i
            else pageNum = page - 2 + i
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`btn-d sm ${page === pageNum ? 'accent' : ''}`}
                style={{ minWidth: 28, justifyContent: 'center' }}
              >{pageNum + 1}</button>
            )
          })}
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="btn-d sm"
            style={{ opacity: page >= totalPages - 1 ? 0.4 : 1 }}
          >Siguiente</button>
        </div>
      </div>
    </div>
  )
}

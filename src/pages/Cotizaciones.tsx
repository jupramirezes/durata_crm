import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { findCotizador } from '../types'
import { formatCOP, formatDate, getAvatarColor } from '../lib/utils'
import { PageHeader } from '../components/ui'
import { FileText, Copy, Trash2, ExternalLink, ChevronUp, ChevronDown, Search, Download } from 'lucide-react'
import { exportCotizacionesExcel } from '../lib/exportar-cotizaciones'

const PAGE_SIZE = 50

type SortKey = 'numero' | 'empresa' | 'fecha' | 'total' | 'estado' | 'cotizador'
type SortDir = 'asc' | 'desc'

export default function Cotizaciones() {
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [sortKey, setSortKey] = useState<SortKey>('fecha')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  // Pre-build lookups
  const opMap = useMemo(() => new Map(state.oportunidades.map(o => [o.id, o])), [state.oportunidades])
  const empMap = useMemo(() => new Map(state.empresas.map(e => [e.id, e])), [state.empresas])
  const contactMap = useMemo(() => new Map(state.contactos.map(c => [c.id, c])), [state.contactos])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
    setPage(0)
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronDown size={10} className="opacity-30" />
    return sortDir === 'desc'
      ? <ChevronDown size={10} className="text-[var(--color-primary)]" />
      : <ChevronUp size={10} className="text-[var(--color-primary)]" />
  }

  const enriched = useMemo(() => {
    return state.cotizaciones.map(c => {
      const op = opMap.get(c.oportunidad_id)
      const emp = op ? empMap.get(op.empresa_id) : null
      const contacto = op ? contactMap.get(op.contacto_id) : null
      const cotizador = op ? findCotizador(op.cotizador_asignado) : null
      return { ...c, empresaNombre: emp?.nombre ?? '—', contactoNombre: contacto?.nombre ?? '—', cotizadorNombre: cotizador?.nombre ?? '—', cotizadorIniciales: cotizador?.iniciales ?? '—', oportunidad: op }
    })
  }, [state.cotizaciones, opMap, empMap, contactMap])

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
    if (filtroEstado) {
      result = result.filter(c => c.estado === filtroEstado)
    }
    return result
  }, [enriched, search, filtroEstado])

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

  const thBtn = 'flex items-center gap-1 cursor-pointer select-none hover:text-[var(--color-primary)] transition-colors'

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Cotizaciones"
          subtitle={`${state.cotizaciones.length} cotizacion${state.cotizaciones.length !== 1 ? 'es' : ''} generada${state.cotizaciones.length !== 1 ? 's' : ''}`}
        />
        <button
          onClick={() => {
            exportCotizacionesExcel({
              cotizaciones: sorted,
              oportunidades: state.oportunidades,
              empresas: state.empresas,
              contactos: state.contactos,
            })
          }}
          className="mt-6 flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-medium bg-[var(--color-accent-green)] hover:opacity-90 text-white transition-all shadow-sm"
          title={`Exportar ${filtered.length} cotizaciones visibles a Excel`}
        >
          <Download size={14} /> Exportar Excel
        </button>
      </div>

      {/* Search and filter bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            placeholder="Buscar por número, empresa o contacto..."
            className="w-full pl-9 pr-3 py-2 rounded-lg text-xs border border-[var(--color-border)] bg-white"
          />
        </div>
        <select
          value={filtroEstado}
          onChange={e => { setFiltroEstado(e.target.value); setPage(0) }}
          className="px-3 py-2 rounded-lg text-xs min-w-[140px] border border-[var(--color-border)] bg-white"
        >
          <option value="">Todos los estados</option>
          <option value="borrador">Borrador</option>
          <option value="enviada">Enviada</option>
          <option value="aprobada">Aprobada</option>
          <option value="rechazada">Rechazada</option>
        </select>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-lg border border-[var(--color-border)] p-12 text-center">
          <FileText size={36} className="text-[var(--color-border)] mx-auto mb-3" />
          <p className="text-[var(--color-text-muted)] text-sm font-medium">No hay cotizaciones generadas aún.</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1.5">Ve a una oportunidad, configura un producto, y genera tu primera cotización.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[var(--color-border)] overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[var(--color-surface)] text-left text-[var(--color-text-muted)]">
                <th className="px-4 py-2.5 font-medium">
                  <button onClick={() => toggleSort('numero')} className={thBtn}>
                    # <SortIcon col="numero" />
                  </button>
                </th>
                <th className="px-4 py-2.5 font-medium">
                  <button onClick={() => toggleSort('empresa')} className={thBtn}>
                    Empresa <SortIcon col="empresa" />
                  </button>
                </th>
                <th className="px-4 py-2.5 font-medium">Contacto</th>
                <th className="px-4 py-2.5 font-medium">
                  <button onClick={() => toggleSort('fecha')} className={thBtn}>
                    Fecha <SortIcon col="fecha" />
                  </button>
                </th>
                <th className="px-4 py-2.5 font-medium text-right">
                  <button onClick={() => toggleSort('total')} className={`${thBtn} justify-end ml-auto`}>
                    Total <SortIcon col="total" />
                  </button>
                </th>
                <th className="px-4 py-2.5 font-medium">
                  <button onClick={() => toggleSort('estado')} className={thBtn}>
                    Estado <SortIcon col="estado" />
                  </button>
                </th>
                <th className="px-4 py-2.5 font-medium">
                  <button onClick={() => toggleSort('cotizador')} className={thBtn}>
                    Cotizador <SortIcon col="cotizador" />
                  </button>
                </th>
                <th className="px-4 py-2.5 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c, i) => {
                const goToOportunidad = () => c.oportunidad && navigate(`/oportunidades/${c.oportunidad.id}`)
                const rowClickable = !!c.oportunidad
                return (
                <tr
                  key={c.id}
                  onClick={rowClickable ? goToOportunidad : undefined}
                  className={`border-t border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors ${i % 2 === 1 ? 'bg-[var(--color-surface)]' : 'bg-white'} ${rowClickable ? 'cursor-pointer' : ''}`}
                >
                  <td className="px-4 py-2.5 font-medium font-mono text-[var(--color-text)]">{c.numero}</td>
                  <td className="px-4 py-2.5 text-[var(--color-text)]">{c.empresaNombre}</td>
                  <td className="px-4 py-2.5 text-[var(--color-text-muted)]">{c.contactoNombre}</td>
                  <td className="px-4 py-2.5 text-[var(--color-text-muted)]">{formatDate(c.fecha)}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-[var(--color-text)] font-mono">{formatCOP(c.total)}</td>
                  <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                    <select value={c.estado} onChange={e => dispatch({ type: 'UPDATE_COTIZACION_ESTADO', payload: { id: c.id, estado: e.target.value as any } })} className="text-[10px] px-2 py-1 rounded bg-[var(--color-surface)] border border-[var(--color-border)] font-medium text-[var(--color-text)]">
                      <option value="borrador">Borrador</option>
                      <option value="enviada">Enviada</option>
                      <option value="aprobada">Aprobada</option>
                      <option value="rechazada">Rechazada</option>
                    </select>
                  </td>
                  <td className="px-4 py-2.5">
                    {c.cotizadorIniciales !== '—' ? (
                      <span
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[8px] font-bold text-white"
                        style={{ background: getAvatarColor(c.cotizadorNombre) }}
                        title={c.cotizadorNombre}
                      >{c.cotizadorIniciales}</span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {rowClickable && (
                        <button
                          onClick={goToOportunidad}
                          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded text-[var(--color-primary)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] font-medium transition-all"
                          title="Ver oportunidad"
                        >
                          <ExternalLink size={10} /> Ver
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const nuevoNumero = prompt('Numero de la nueva cotizacion:') || ''
                          if (nuevoNumero) {
                            const newId = crypto.randomUUID()
                            dispatch({ type: 'DUPLICATE_COTIZACION', payload: { originalId: c.id, nuevoNumero, newId } })
                          }
                        }}
                        className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] transition-all"
                        title="Duplicar"
                      >
                        <Copy size={12} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('\u00bfEliminar esta cotización?')) {
                            dispatch({ type: 'DELETE_COTIZACION', payload: { id: c.id } })
                          }
                        }}
                        className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 border border-red-200 transition-all"
                        title="Eliminar"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>

          {/* Pagination footer */}
          <div className="px-4 py-2.5 border-t border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface)]">
            <span className="text-[10px] text-[var(--color-text-muted)]">
              {sorted.length} cotizaciones{filtered.length !== state.cotizaciones.length && ' (filtradas)'}
              {' · Página {0} de {1}'.replace('{0}', String(page + 1)).replace('{1}', String(totalPages || 1))}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="text-[10px] px-2 py-1 rounded border border-[var(--color-border)] font-medium disabled:opacity-30 hover:bg-white transition-colors"
              >Anterior</button>
              {/* Show page numbers (max 5 visible) */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) { pageNum = i }
                else if (page < 3) { pageNum = i }
                else if (page > totalPages - 4) { pageNum = totalPages - 5 + i }
                else { pageNum = page - 2 + i }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`text-[10px] w-6 h-6 rounded font-medium transition-colors ${
                      page === pageNum ? 'bg-[var(--color-primary)] text-white' : 'border border-[var(--color-border)] hover:bg-white'
                    }`}
                  >{pageNum + 1}</button>
                )
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="text-[10px] px-2 py-1 rounded border border-[var(--color-border)] font-medium disabled:opacity-30 hover:bg-white transition-colors"
              >Siguiente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { CONFIG_DEFAULTS } from '../hooks/useConfiguracion'
import { formatCOP, getInitials, getAvatarColor } from '../lib/utils'
import { PageHeader } from '../components/ui'
import { Search, ChevronUp, ChevronDown, Trash2, AlertTriangle } from 'lucide-react'

const PAGE_SIZE = 50

type SortKey = 'nombre' | 'opCount' | 'valorCotizado' | 'valorAdjudicado'
type SortDir = 'asc' | 'desc'

export default function Empresas() {
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filtroSector, setFiltroSector] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [sortKey, setSortKey] = useState<SortKey>('valorCotizado')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [deleteModal, setDeleteModal] = useState<string | null>(null)

  const empresaStats = useMemo(() => {
    const map = new Map<string, { opCount: number; valorCotizado: number; valorAdjudicado: number }>()
    for (const o of state.oportunidades) {
      let s = map.get(o.empresa_id)
      if (!s) { s = { opCount: 0, valorCotizado: 0, valorAdjudicado: 0 }; map.set(o.empresa_id, s) }
      s.opCount++
      s.valorCotizado += o.valor_cotizado
      s.valorAdjudicado += o.valor_adjudicado
    }
    return map
  }, [state.oportunidades])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronDown size={10} className="opacity-30" />
    return sortDir === 'desc'
      ? <ChevronDown size={10} className="text-[var(--color-primary)]" />
      : <ChevronUp size={10} className="text-[var(--color-primary)]" />
  }

  const filtered = useMemo(() => {
    let result = state.empresas.filter(e => {
      const matchSearch = !search || e.nombre.toLowerCase().includes(search.toLowerCase()) || e.nit.includes(search)
      const matchSector = !filtroSector || e.sector === filtroSector
      return matchSearch && matchSector
    })

    // Sort
    result = [...result].sort((a, b) => {
      const statsA = empresaStats.get(a.id)
      const statsB = empresaStats.get(b.id)
      let cmp = 0
      switch (sortKey) {
        case 'nombre':
          cmp = a.nombre.localeCompare(b.nombre)
          break
        case 'opCount':
          cmp = (statsA?.opCount ?? 0) - (statsB?.opCount ?? 0)
          break
        case 'valorCotizado':
          cmp = (statsA?.valorCotizado ?? 0) - (statsB?.valorCotizado ?? 0)
          break
        case 'valorAdjudicado':
          cmp = (statsA?.valorAdjudicado ?? 0) - (statsB?.valorAdjudicado ?? 0)
          break
      }
      return sortDir === 'desc' ? -cmp : cmp
    })

    return result
  }, [state.empresas, search, filtroSector, sortKey, sortDir, empresaStats])

  const visible = filtered.slice(0, visibleCount)

  // Delete modal data
  const deleteEmpresa = deleteModal ? state.empresas.find(e => e.id === deleteModal) : null
  const deleteContactos = deleteModal ? state.contactos.filter(c => c.empresa_id === deleteModal).length : 0
  const deleteOportunidades = deleteModal ? state.oportunidades.filter(o => o.empresa_id === deleteModal).length : 0
  const deleteCotizaciones = deleteModal ? state.cotizaciones.filter(c => {
    const op = state.oportunidades.find(o => o.id === c.oportunidad_id)
    return op && op.empresa_id === deleteModal
  }).length : 0

  function confirmDelete() {
    if (!deleteModal) return
    dispatch({ type: 'DELETE_EMPRESA', payload: { id: deleteModal } })
    setDeleteModal(null)
  }

  const thBtn = 'flex items-center gap-1 cursor-pointer select-none hover:text-[var(--color-primary)] transition-colors'

  return (
    <div className="px-8 py-8 space-y-5 animate-fade-in">
      <PageHeader
        title="Empresas"
        subtitle={`${state.empresas.length} empresas registradas`}
      />

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setVisibleCount(PAGE_SIZE) }}
            placeholder="Buscar por nombre o NIT..."
            className="w-full pl-9 pr-3 py-2 rounded-lg text-xs border border-[var(--color-border)] bg-white"
          />
        </div>
        <select
          value={filtroSector}
          onChange={e => { setFiltroSector(e.target.value); setVisibleCount(PAGE_SIZE) }}
          className="px-3 py-2 rounded-lg text-xs min-w-[160px] border border-[var(--color-border)] bg-white"
        >
          <option value="">Todos los sectores</option>
          {CONFIG_DEFAULTS.sectores.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-[#f1f5f9] text-left">
              <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-[0.06em] text-[#94a3b8]">
                <button onClick={() => toggleSort('nombre')} className={thBtn}>
                  Empresa <SortIcon col="nombre" />
                </button>
              </th>
              <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-[0.06em] text-[#94a3b8]">Sector</th>
              <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-[0.06em] text-[#94a3b8] text-center">
                <button onClick={() => toggleSort('opCount')} className={`${thBtn} justify-center`}>
                  Oportunidades <SortIcon col="opCount" />
                </button>
              </th>
              <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-[0.06em] text-[#94a3b8] text-right">
                <button onClick={() => toggleSort('valorCotizado')} className={`${thBtn} justify-end ml-auto`}>
                  Valor cotizado <SortIcon col="valorCotizado" />
                </button>
              </th>
              <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-[0.06em] text-[#94a3b8] text-right">
                <button onClick={() => toggleSort('valorAdjudicado')} className={`${thBtn} justify-end ml-auto`}>
                  Valor adjudicado <SortIcon col="valorAdjudicado" />
                </button>
              </th>
              <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-[0.06em] text-[#94a3b8] text-center w-12"></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((e) => {
              const stats = empresaStats.get(e.id)
              return (
                <tr
                  key={e.id}
                  className={`border-b border-[#f8fafc] hover:bg-[#fafbfc] transition-colors`}
                >
                  <td className="px-5 py-4 cursor-pointer" onClick={() => navigate(`/empresas/${e.id}`)}>
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                        style={{ background: getAvatarColor(e.nombre) }}
                      >
                        {getInitials(e.nombre)}
                      </div>
                      <div>
                        <span className="font-medium text-[var(--color-text)] hover:text-[var(--color-primary)]">{e.nombre}</span>
                        <div className="text-[10px] text-[var(--color-text-muted)]">{e.nit}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)] font-medium">{e.sector}</span>
                  </td>
                  <td className="px-5 py-4 text-center font-medium text-[var(--color-text)]">{stats?.opCount ?? 0}</td>
                  <td className="px-5 py-4 text-right text-[var(--color-text)] font-mono">{formatCOP(stats?.valorCotizado ?? 0)}</td>
                  <td className="px-5 py-4 text-right font-bold text-[var(--color-accent-green)] font-mono">{formatCOP(stats?.valorAdjudicado ?? 0)}</td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={(ev) => { ev.stopPropagation(); setDeleteModal(e.id) }}
                      className="p-1 rounded text-red-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Eliminar empresa"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="px-5 py-4 border-t border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface)]">
          <span className="text-[10px] text-[var(--color-text-muted)]">
            Mostrando {visible.length} de {filtered.length} empresas
          </span>
          {visibleCount < filtered.length && (
            <button
              onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
              className="text-[10px] font-medium text-[var(--color-primary)] hover:underline"
            >
              Cargar más ({filtered.length - visibleCount} restantes)
            </button>
          )}
        </div>
      </div>

      {/* Fix 13: Delete confirmation modal */}
      {deleteModal && deleteEmpresa && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white modal-card w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[var(--color-text)]">Eliminar {deleteEmpresa.nombre}?</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            <div className="bg-red-50 rounded-md p-3 mb-4 text-xs text-red-700 space-y-1">
              <p>Se eliminarán también:</p>
              <ul className="list-disc list-inside ml-2">
                <li>{deleteContactos} contacto{deleteContactos !== 1 ? 's' : ''}</li>
                <li>{deleteOportunidades} oportunidad{deleteOportunidades !== 1 ? 'es' : ''}</li>
                <li>{deleteCotizaciones} cotizaci{deleteCotizaciones !== 1 ? 'ones' : 'ón'}</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteModal(null)} className="px-3 py-1.5 text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] rounded-md">Cancelar</button>
              <button onClick={confirmDelete} className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-md hover:bg-red-600 transition-colors">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

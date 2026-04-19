import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { CONFIG_DEFAULTS } from '../hooks/useConfiguracion'
import { formatCOP } from '../lib/utils'
import { Search, ChevronUp, ChevronDown, Trash2, AlertTriangle, Plus, Download, X } from 'lucide-react'

const PAGE_SIZE = 50

type SortKey = 'nombre' | 'opCount' | 'adjCount' | 'valorCotizado' | 'ultContacto'
type SortDir = 'asc' | 'desc'

function formatDays(date: string | null | undefined): { str: string; days: number | null } {
  if (!date) return { str: '—', days: null }
  const ts = new Date(date).getTime()
  if (!isFinite(ts) || ts <= 0) return { str: '—', days: null }
  const days = Math.floor((Date.now() - ts) / 86400000)
  if (days < 0 || days > 3650) return { str: '—', days: null }
  if (days === 0) return { str: 'Hoy', days: 0 }
  if (days === 1) return { str: 'Ayer', days: 1 }
  if (days < 30) return { str: `${days}d`, days }
  if (days < 365) return { str: `${Math.floor(days / 30)}mes`, days }
  return { str: `${Math.floor(days / 365)}a`, days }
}

export default function Empresas() {
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filtroSector, setFiltroSector] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [sortKey, setSortKey] = useState<SortKey>('valorCotizado')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [deleteModal, setDeleteModal] = useState<string | null>(null)
  const [showNuevaModal, setShowNuevaModal] = useState(false)
  const [nuevaNombre, setNuevaNombre] = useState('')
  const [nuevaNit, setNuevaNit] = useState('')
  const [nuevaSector, setNuevaSector] = useState('')

  const sectoresDisponibles = useMemo(() => {
    const fromData = [...new Set(state.empresas.map(e => e.sector).filter(Boolean))]
    const fromDefaults = CONFIG_DEFAULTS.sectores
    const merged = [...new Set([...fromDefaults, ...fromData])].sort()
    return merged
  }, [state.empresas])

  const empresaStats = useMemo(() => {
    const map = new Map<string, { opCount: number; adjCount: number; valorCotizado: number; valorAdjudicado: number; ultContacto: string | null }>()
    for (const o of state.oportunidades) {
      let s = map.get(o.empresa_id)
      if (!s) { s = { opCount: 0, adjCount: 0, valorCotizado: 0, valorAdjudicado: 0, ultContacto: null }; map.set(o.empresa_id, s) }
      s.opCount++
      if (o.etapa === 'adjudicada') s.adjCount++
      s.valorCotizado += o.valor_cotizado
      s.valorAdjudicado += o.valor_adjudicado
      const ref = o.fecha_ultimo_contacto || o.fecha_envio || o.fecha_ingreso
      if (ref && (!s.ultContacto || ref > s.ultContacto)) s.ultContacto = ref
    }
    return map
  }, [state.oportunidades])

  const contactosCountMap = useMemo(() => {
    const m = new Map<string, number>()
    for (const c of state.contactos) m.set(c.empresa_id, (m.get(c.empresa_id) || 0) + 1)
    return m
  }, [state.contactos])

  const contactoPrincipalMap = useMemo(() => {
    const m = new Map<string, string>()
    for (const c of state.contactos) if (!m.has(c.empresa_id)) m.set(c.empresa_id, c.nombre)
    return m
  }, [state.contactos])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortKey(key); setSortDir('desc') }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronDown size={9} style={{ opacity: 0.3 }} />
    return sortDir === 'desc'
      ? <ChevronDown size={9} style={{ color: 'var(--color-primary)' }} />
      : <ChevronUp size={9} style={{ color: 'var(--color-primary)' }} />
  }

  const filtered = useMemo(() => {
    let result = state.empresas.filter(e => {
      const matchSearch = !search || e.nombre.toLowerCase().includes(search.toLowerCase()) || (e.nit || '').includes(search)
      const matchSector = !filtroSector || e.sector === filtroSector
      return matchSearch && matchSector
    })

    result = [...result].sort((a, b) => {
      const sA = empresaStats.get(a.id)
      const sB = empresaStats.get(b.id)
      let cmp = 0
      switch (sortKey) {
        case 'nombre': cmp = a.nombre.localeCompare(b.nombre); break
        case 'opCount': cmp = (sA?.opCount ?? 0) - (sB?.opCount ?? 0); break
        case 'adjCount': cmp = (sA?.adjCount ?? 0) - (sB?.adjCount ?? 0); break
        case 'valorCotizado': cmp = (sA?.valorCotizado ?? 0) - (sB?.valorCotizado ?? 0); break
        case 'ultContacto': cmp = (sA?.ultContacto || '').localeCompare(sB?.ultContacto || ''); break
      }
      return sortDir === 'desc' ? -cmp : cmp
    })

    return result
  }, [state.empresas, search, filtroSector, sortKey, sortDir, empresaStats])

  const visible = filtered.slice(0, visibleCount)
  const totalOpps = state.oportunidades.length

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

  function confirmNueva() {
    const nombre = nuevaNombre.trim()
    if (!nombre) return
    dispatch({ type: 'ADD_EMPRESA', payload: { nombre, nit: nuevaNit.trim() || null, sector: nuevaSector.trim() || null } as any })
    setShowNuevaModal(false)
    setNuevaNombre('')
    setNuevaNit('')
    setNuevaSector('')
  }

  function handleExport() {
    const header = ['Nombre', 'NIT', 'Sector', 'Oportunidades', 'Adjudicadas', 'Valor cotizado', 'Ultimo contacto']
    const rows = filtered.map(e => [
      JSON.stringify(e.nombre || ''),
      JSON.stringify(e.nit || ''),
      JSON.stringify(e.sector || ''),
      empresaStats.get(e.id)?.opCount || 0,
      empresaStats.get(e.id)?.adjCount || 0,
      empresaStats.get(e.id)?.valorCotizado || 0,
      JSON.stringify(formatDays(empresaStats.get(e.id)?.ultContacto).str),
    ])
    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `empresas-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="list-page">
      <div className="list-head">
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
          <div>
            <div className="title">Empresas</div>
            <div className="sub">{state.empresas.length.toLocaleString('es-CO')} empresas · {totalOpps.toLocaleString('es-CO')} oportunidades históricas</div>
          </div>
          <div style={{ flex: 1 }} />
          <button className="btn-d primary sm" onClick={() => setShowNuevaModal(true)}><Plus size={13} /> Nueva empresa</button>
        </div>
      </div>

      <div className="list-toolbar">
        <div className="search-input" style={{ flex: '0 0 300px' }}>
          <Search />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setVisibleCount(PAGE_SIZE) }}
            placeholder="Buscar por nombre o NIT…"
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-label)', minHeight: 0, padding: 2 }}>
              <X size={12} />
            </button>
          )}
        </div>

        <select
          className="chip chip-select"
          value={filtroSector}
          onChange={e => { setFiltroSector(e.target.value); setVisibleCount(PAGE_SIZE) }}
          style={{ minWidth: 140 }}
        >
          <option value="">Sector: Todos</option>
          {sectoresDisponibles.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {(search || filtroSector) && (
          <button
            className="chip"
            onClick={() => { setSearch(''); setFiltroSector('') }}
            style={{ color: 'var(--color-accent-red)' }}
          >
            <X />Limpiar
          </button>
        )}

        <div style={{ flex: 1 }} />

        <button className="btn-d ghost sm" onClick={handleExport}><Download size={12} /> Exportar</button>
      </div>

      <div className="list-scroll">
        <table className="list-tbl">
          <thead>
            <tr>
              <th className="sortable" style={{ width: '30%' }} onClick={() => toggleSort('nombre')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Empresa <SortIcon col="nombre" /></span>
              </th>
              <th>Sector</th>
              <th>Contacto principal</th>
              <th className="num sortable" onClick={() => toggleSort('opCount')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Oport. <SortIcon col="opCount" /></span>
              </th>
              <th className="num sortable" onClick={() => toggleSort('adjCount')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Adj. <SortIcon col="adjCount" /></span>
              </th>
              <th className="num sortable" onClick={() => toggleSort('valorCotizado')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Histórico <SortIcon col="valorCotizado" /></span>
              </th>
              <th className="num sortable" onClick={() => toggleSort('ultContacto')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Últ. contacto <SortIcon col="ultContacto" /></span>
              </th>
              <th style={{ width: 32 }}></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((e) => {
              const stats = empresaStats.get(e.id)
              const contactoPrincipal = contactoPrincipalMap.get(e.id)
              const contactosCount = contactosCountMap.get(e.id) || 0
              const ultContacto = formatDays(stats?.ultContacto)
              return (
                <tr key={e.id} onClick={() => navigate(`/empresas/${e.id}`)}>
                  <td>
                    <div className="primary-cell">{e.nombre}</div>
                    <div className="sub-cell">NIT {e.nit || '—'}</div>
                  </td>
                  <td>
                    {e.sector ? (
                      <span className="stage-pill">
                        <span className="stage-dot" style={{ background: 'var(--color-text-label)' }} />
                        {e.sector}
                      </span>
                    ) : <span style={{ color: 'var(--color-text-faint)' }}>—</span>}
                  </td>
                  <td>
                    {contactoPrincipal ? (
                      <>
                        <div>{contactoPrincipal}</div>
                        {contactosCount > 1 && <div className="sub-cell" style={{ fontFamily: 'inherit' }}>{contactosCount} contactos</div>}
                      </>
                    ) : <span style={{ color: 'var(--color-text-faint)' }}>Sin contacto</span>}
                  </td>
                  <td className="num">{stats?.opCount ?? 0}</td>
                  <td className="num">
                    <span style={{ color: (stats?.adjCount ?? 0) > 0 ? 'var(--color-accent-green)' : 'var(--color-text-label)' }}>
                      {stats?.adjCount ?? 0}
                    </span>
                  </td>
                  <td className="num">{formatCOP(stats?.valorCotizado ?? 0, { short: true })}</td>
                  <td className="num">
                    <span style={{ color: ultContacto.days !== null && ultContacto.days > 60 ? 'var(--color-accent-red)' : ultContacto.days !== null && ultContacto.days > 14 ? 'var(--color-accent-yellow)' : 'var(--color-text-label)' }}>
                      {ultContacto.str}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={(ev) => { ev.stopPropagation(); setDeleteModal(e.id) }}
                      className="btn-d ghost icon sm"
                      style={{ color: 'var(--color-accent-red)' }}
                      title="Eliminar empresa"
                    ><Trash2 size={12} /></button>
                  </td>
                </tr>
              )
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-label)' }}>
                  Sin empresas para los filtros aplicados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="list-foot">
        <span>Mostrando {visible.length.toLocaleString('es-CO')} de {filtered.length.toLocaleString('es-CO')} empresas</span>
        {visibleCount < filtered.length && (
          <button
            onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
            className="btn-d sm"
          >
            Cargar más ({(filtered.length - visibleCount).toLocaleString('es-CO')} restantes)
          </button>
        )}
      </div>

      {/* Nueva empresa modal */}
      {showNuevaModal && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowNuevaModal(false)}>
          <div className="bg-[var(--color-surface)] modal-card w-full max-w-md" style={{ padding: 24 }} onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-[15px] text-[var(--color-text)] mb-4">Nueva empresa</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[var(--color-text-label)] mb-1 block">Nombre *</label>
                <input autoFocus value={nuevaNombre} onChange={e => setNuevaNombre(e.target.value)} className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-md" placeholder="Razón social" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--color-text-label)] mb-1 block">NIT</label>
                <input value={nuevaNit} onChange={e => setNuevaNit(e.target.value)} className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-md" placeholder="Opcional" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--color-text-label)] mb-1 block">Sector</label>
                <select value={nuevaSector} onChange={e => setNuevaSector(e.target.value)} className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-md">
                  <option value="">—</option>
                  {sectoresDisponibles.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowNuevaModal(false)} className="btn-d">Cancelar</button>
              <button onClick={confirmNueva} disabled={!nuevaNombre.trim()} className="btn-d primary">Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteModal && deleteEmpresa && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-[var(--color-surface)] modal-card w-full max-w-md" style={{ padding: 24 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--color-surface-3)' }}>
                <AlertTriangle size={18} style={{ color: 'var(--color-accent-red)' }} />
              </div>
              <div>
                <h3 className="font-semibold text-[15px] text-[var(--color-text)]">¿Eliminar {deleteEmpresa.nombre}?</h3>
                <p className="text-xs text-[var(--color-text-label)]">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            <div className="rounded-md p-3 mb-4 text-xs space-y-1" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
              <p style={{ color: 'var(--color-text)', fontWeight: 500 }}>Se eliminarán también:</p>
              <ul className="list-disc list-inside ml-2" style={{ color: 'var(--color-text-muted)' }}>
                <li>{deleteContactos} contacto{deleteContactos !== 1 ? 's' : ''}</li>
                <li>{deleteOportunidades} oportunidad{deleteOportunidades !== 1 ? 'es' : ''}</li>
                <li>{deleteCotizaciones} cotizaci{deleteCotizaciones !== 1 ? 'ones' : 'ón'}</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteModal(null)} className="btn-d">Cancelar</button>
              <button onClick={confirmDelete} className="btn-d" style={{ background: 'var(--color-accent-red)', color: '#fff', borderColor: 'var(--color-accent-red)' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useLocation, useParams } from 'react-router-dom'
import { Search, Bell, RefreshCw } from 'lucide-react'
import { useStore } from '../lib/store'

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/pipeline': 'Pipeline',
  '/empresas': 'Empresas',
  '/cotizaciones': 'Cotizaciones',
  '/precios': 'Precios',
  '/precios/importar': 'Importar precios',
  '/config': 'Configuración',
}

function Crumb({ items }: { items: string[] }) {
  if (items.length === 0) return null
  return (
    <div className="crumb">
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="sep">/</span>}
          <span className={i === items.length - 1 ? 'cur' : ''}>{c}</span>
        </span>
      ))}
    </div>
  )
}

function useCrumbs(): string[] {
  const { pathname } = useLocation()
  const params = useParams()
  const { state } = useStore()

  // Dashboard
  if (pathname === '/') return ['Dashboard']

  // Static routes
  if (ROUTE_LABELS[pathname]) return [ROUTE_LABELS[pathname]]

  // /empresas/:id
  if (pathname.startsWith('/empresas/') && params.id) {
    const e = state.empresas.find(x => x.id === params.id)
    return ['Empresas', e?.nombre || params.id]
  }

  // /oportunidades/:id...
  if (pathname.startsWith('/oportunidades/') && params.id) {
    const o = state.oportunidades.find(x => x.id === params.id)
    const crumb: string[] = ['Pipeline', o?.nombre || params.id]
    if (pathname.includes('/configurar-producto/')) crumb.push('Configurar producto')
    else if (pathname.endsWith('/configurar')) crumb.push('Configurar mesa')
    else if (pathname.includes('/spreadsheet/')) crumb.push('Spreadsheet')
    return crumb
  }

  // /cotizaciones/:id/editar
  if (pathname.startsWith('/cotizaciones/') && params.id) {
    return ['Cotizaciones', 'Editar']
  }

  return ['Dashboard']
}

function openGlobalSearch() {
  // GlobalSearch listens for Ctrl+K globally — dispatch it.
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))
}

export default function Topbar() {
  const crumbs = useCrumbs()
  const { refresh } = useStore()

  return (
    <div className="topbar">
      <Crumb items={crumbs} />

      <button
        type="button"
        className="tb-search"
        onClick={openGlobalSearch}
        aria-label="Buscar"
      >
        <Search />
        <span>Buscar empresa, cotización, producto…</span>
        <span className="kbd">⌘K</span>
      </button>

      <div className="tb-actions">
        <button className="btn-d ghost icon" title="Notificaciones" aria-label="Notificaciones">
          <Bell />
        </button>
        <button className="btn-d" onClick={() => refresh()} title="Actualizar datos">
          <RefreshCw />
          Actualizar
        </button>
      </div>
    </div>
  )
}

import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Kanban, Users, FileText, DollarSign, Settings } from 'lucide-react'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pipeline', icon: Kanban, label: 'Pipeline' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/cotizaciones', icon: FileText, label: 'Cotizaciones' },
  { to: '/precios', icon: DollarSign, label: 'Precios' },
  { to: '/config', icon: Settings, label: 'Configuración' },
]

export default function Sidebar() {
  return (
    <aside className="w-60 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-[var(--color-primary)]">DURATA</span>
          <span className="text-[var(--color-text-muted)] text-sm font-normal ml-2">CRM</span>
        </h1>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]'
              }`
            }>
            <l.icon size={18} />
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
        DURATA® S.A.S. — v1.0
      </div>
    </aside>
  )
}

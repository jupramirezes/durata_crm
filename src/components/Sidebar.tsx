import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Kanban, Users, FileText, DollarSign, Settings } from 'lucide-react'

const navGroups = [
  {
    label: 'Principal',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/pipeline', icon: Kanban, label: 'Pipeline' },
      { to: '/clientes', icon: Users, label: 'Clientes' },
    ],
  },
  {
    label: 'Comercial',
    items: [
      { to: '/cotizaciones', icon: FileText, label: 'Cotizaciones' },
      { to: '/precios', icon: DollarSign, label: 'Precios' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { to: '/config', icon: Settings, label: 'Configuracion' },
    ],
  },
]

export default function Sidebar() {
  return (
    <aside className="w-[232px] bg-[var(--color-sidebar)] border-r border-[var(--color-border)] flex flex-col h-screen sticky top-0 shrink-0">
      <div className="px-5 py-5 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <img src="/logo-durata.png" alt="DURATA" className="h-10 object-contain" />
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none text-[var(--color-text)]">
              DURATA
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Sistema de Cotizacion</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] px-3 mb-2 font-semibold">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map(l => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[#E0F2FE] text-[var(--color-primary)]'
                        : 'text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
                    }`
                  }
                  style={({ isActive }) =>
                    isActive
                      ? { boxShadow: 'inset 3px 0 0 var(--color-primary)' }
                      : {}
                  }
                >
                  <l.icon size={18} />
                  {l.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-[var(--color-border)]">
        <p className="text-[10px] text-[var(--color-text-muted)] font-medium">DURATA® S.A.S. — v1.0</p>
      </div>
    </aside>
  )
}

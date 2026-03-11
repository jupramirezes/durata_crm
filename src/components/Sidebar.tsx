import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Kanban, Users, FileText, DollarSign, Settings, Hexagon } from 'lucide-react'

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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4f8cff] to-[#a78bfa] flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
            <Hexagon size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none">
              <span className="text-[var(--color-primary)]">DURATA</span>
              <span className="text-[var(--color-text-muted)] text-xs font-semibold ml-1.5">CRM</span>
            </h1>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1 tracking-wider uppercase">Sistema de Cotizacion</p>
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
                        ? 'text-[var(--color-primary)]'
                        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]'
                    }`
                  }
                  style={({ isActive }) =>
                    isActive
                      ? { background: 'linear-gradient(90deg, rgba(79,140,255,0.12), transparent)', boxShadow: 'inset 3px 0 0 var(--color-primary)' }
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
        <p className="text-[10px] text-[var(--color-text-muted)] font-medium">DURATA® S.A.S.</p>
        <p className="text-[10px] text-[var(--color-border-light)]">v1.0</p>
      </div>
    </aside>
  )
}

import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Kanban, Users, FileText, DollarSign, Settings, Menu, X } from 'lucide-react'

const navGroups = [
  {
    label: 'Principal',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/pipeline', icon: Kanban, label: 'Pipeline' },
      { to: '/empresas', icon: Users, label: 'Empresas' },
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

function SidebarContent({ onClose }: { onClose?: () => void }) {
  return (
    <>
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="/logo-durata.png"
            alt="DURATA"
            className="h-8 object-contain brightness-0 invert"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div>
            <span className="text-sm font-bold text-white tracking-tight">DURATA</span>
            <span className="text-sm font-bold text-[var(--color-primary-light)] ml-1">CRM</span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white md:hidden p-1">
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-3 space-y-5 overflow-y-auto">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="text-[9px] uppercase tracking-[0.15em] text-slate-500 px-3 mb-1.5 font-semibold">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map(l => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors duration-150 ${
                      isActive
                        ? 'bg-[var(--color-sidebar-active)] text-white border-l-[3px] border-[var(--color-primary-light)] -ml-px'
                        : 'text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-hover)] hover:text-white'
                    }`
                  }
                >
                  <l.icon size={16} />
                  {l.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-5 py-3 border-t border-[var(--color-sidebar-border)]">
        <p className="text-[10px] text-slate-500 font-medium">v0.9 MVP</p>
      </div>
    </>
  )
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 p-2 rounded-lg bg-[var(--color-sidebar)] text-white md:hidden"
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <aside
            className="absolute left-0 top-0 bottom-0 w-[240px] bg-[var(--color-sidebar)] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[240px] bg-[var(--color-sidebar)] flex-col h-screen sticky top-0 shrink-0">
        <SidebarContent />
      </aside>
    </>
  )
}

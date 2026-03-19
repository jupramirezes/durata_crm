import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Kanban, Users, FileText, DollarSign, Settings, Menu, X, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

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

/** Extract display name from email: saguirre@durata.co → S. Aguirre */
function displayName(user: User | null): string {
  if (!user?.email) return 'Usuario'
  const local = user.email.split('@')[0] // e.g. "saguirre", "presupuestos2", "caraque"

  // Known mappings for non-obvious emails
  const KNOWN: Record<string, string> = {
    presupuestos: 'O. Cossio',
    presupuestos2: 'J.P. Ramírez',
  }
  if (KNOWN[local]) return KNOWN[local]

  // Try to extract first initial + last name from concatenated form (e.g. "saguirre" → "S. Aguirre")
  // Heuristic: first letter is initial, rest is last name
  if (local.length > 2) {
    return `${local[0].toUpperCase()}. ${local.slice(1, 2).toUpperCase()}${local.slice(2)}`
  }
  return local
}

function SidebarContent({ onClose, user }: { onClose?: () => void; user: User | null }) {
  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <>
      <div className="px-5 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-baseline">
            <span className="text-lg font-extrabold text-white tracking-tight">DURATA</span>
            <span className="text-lg font-extrabold text-[#3b82f6] ml-1.5">CRM</span>
          </div>
          <p className="text-[9px] text-slate-400 -mt-0.5 tracking-wide">Sistema de Cotización</p>
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
        {user ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white font-medium">{displayName(user)}</p>
              <p className="text-[9px] text-slate-500 truncate max-w-[140px]">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <p className="text-[10px] text-slate-500 font-medium">v0.9 MVP</p>
        )}
      </div>
    </>
  )
}

export default function Sidebar({ user }: { user: User | null }) {
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
            <SidebarContent onClose={() => setMobileOpen(false)} user={user} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[240px] bg-[var(--color-sidebar)] flex-col h-screen sticky top-0 shrink-0">
        <SidebarContent user={user} />
      </aside>
    </>
  )
}

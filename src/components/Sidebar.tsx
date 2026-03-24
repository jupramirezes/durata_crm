import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Kanban, Users, FileText, DollarSign, Settings, Menu, X, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import GlobalSearch from './GlobalSearch'

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

function displayName(user: User | null): string {
  if (!user?.email) return 'Usuario'
  const local = user.email.split('@')[0]
  const KNOWN: Record<string, string> = {
    presupuestos: 'O. Cossio',
    presupuestos2: 'J.P. Ramírez',
  }
  if (KNOWN[local]) return KNOWN[local]
  if (local.length > 2) {
    return `${local[0].toUpperCase()}. ${local.slice(1, 2).toUpperCase()}${local.slice(2)}`
  }
  return local
}

function getInitials(user: User | null): string {
  const name = displayName(user)
  const parts = name.replace('.', '').trim().split(/\s+/)
  return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2)
}

function SidebarContent({ onClose, user }: { onClose?: () => void; user: User | null }) {
  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <>
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-white tracking-tight">DURATA</span>
            <span className="text-xl font-extrabold text-[var(--color-primary)]">CRM</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 tracking-wider font-medium">Sistema de Cotizacion</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white md:hidden p-1 rounded-md">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <GlobalSearch />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-6 overflow-y-auto">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="text-[11px] uppercase tracking-[0.08em] text-[#475569] px-3 mb-2 font-medium">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map(l => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 h-11 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-[var(--color-sidebar-active)] text-[var(--color-sidebar-text-active)] border-l-[3px] border-[var(--color-primary)] -ml-px'
                        : 'text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-hover)] hover:text-white'
                    }`
                  }
                >
                  <l.icon size={20} className="shrink-0" />
                  {l.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-[var(--color-sidebar-border)]">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--color-primary)] flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">{getInitials(user)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{displayName(user)}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/5 transition-colors shrink-0"
              title="Cerrar sesion"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-500 font-medium">v0.9 MVP</p>
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
        className="fixed top-3 left-3 z-50 p-2.5 rounded-lg bg-[var(--color-sidebar)] text-white md:hidden shadow-md"
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
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

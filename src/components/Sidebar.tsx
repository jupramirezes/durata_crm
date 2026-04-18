import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Kanban, Building2, FileText, Banknote, Settings, Menu, X, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import { useStore } from '../lib/store'

function displayName(user: User | null): string {
  if (!user?.email) return 'Usuario'
  const local = user.email.split('@')[0]
  const KNOWN: Record<string, string> = { presupuestos: 'O. Cossio', presupuestos2: 'J.P. Ramirez' }
  if (KNOWN[local]) return KNOWN[local]
  if (local.length > 2) return `${local[0].toUpperCase()}. ${local.slice(1, 2).toUpperCase()}${local.slice(2)}`
  return local
}

function getInitials(user: User | null): string {
  const name = displayName(user)
  return name.replace('.', '').trim().split(/\s+/).map(p => p[0]).join('').toUpperCase().slice(0, 2)
}

function fmtCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k'
  return String(n)
}

function SidebarContent({ onClose, user }: { onClose?: () => void; user: User | null }) {
  const { state } = useStore()

  const pipelineCount = state.oportunidades.filter(o => !['perdida', 'recotizada'].includes(o.etapa)).length
  const empresasCount = state.empresas.length
  const cotizacionesCount = state.cotizaciones.length

  async function handleLogout() { await supabase.auth.signOut() }

  const groups: Array<{ label: string; items: Array<{ to: string; icon: typeof LayoutDashboard; label: string; count?: number; end?: boolean }> }> = [
    {
      label: 'Principal',
      items: [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { to: '/pipeline', icon: Kanban, label: 'Pipeline', count: pipelineCount },
      ],
    },
    {
      label: 'Comercial',
      items: [
        { to: '/empresas', icon: Building2, label: 'Empresas', count: empresasCount },
        { to: '/cotizaciones', icon: FileText, label: 'Cotizaciones', count: cotizacionesCount },
        { to: '/precios', icon: Banknote, label: 'Precios' },
      ],
    },
    {
      label: 'Sistema',
      items: [
        { to: '/config', icon: Settings, label: 'Configuración' },
      ],
    },
  ]

  return (
    <>
      <div className="sb-brand">
        <div className="sb-mark">D</div>
        <div className="sb-brand-text flex-1">
          <div className="n">Durata</div>
          <div className="s">CRM · Cotizador</div>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden text-[var(--color-text-label)]" aria-label="Cerrar menú">
            <X size={16} />
          </button>
        )}
      </div>

      <nav className="sb-nav">
        {groups.map(group => (
          <div key={group.label} className="sb-group">
            <div className="sb-group-label">{group.label}</div>
            {group.items.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={onClose}
                className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
              >
                <l.icon />
                <span>{l.label}</span>
                {l.count != null && <span className="count">{fmtCount(l.count)}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sb-foot">
        {user ? (
          <>
            <div className="avatar">{getInitials(user)}</div>
            <div className="who">
              <div className="n">{displayName(user)}</div>
              <div className="r">{user.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="text-[var(--color-text-label)] hover:text-[var(--color-accent-red)] p-1 rounded-md"
              style={{ minHeight: 0 }}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut size={14} />
            </button>
          </>
        ) : (
          <div className="who"><div className="r">v0.9 MVP</div></div>
        )}
      </div>
    </>
  )
}

export default function Sidebar({ user }: { user: User | null }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 p-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] md:hidden shadow-sm"
        style={{ minHeight: 0 }}
        aria-label="Abrir menú"
      >
        <Menu size={16} />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" />
          <aside
            className="sb absolute left-0 top-0 bottom-0 w-[232px]"
            onClick={e => e.stopPropagation()}
            style={{ position: 'absolute', height: 'auto' }}
          >
            <SidebarContent onClose={() => setMobileOpen(false)} user={user} />
          </aside>
        </div>
      )}

      <aside className="sb hidden md:flex">
        <SidebarContent user={user} />
      </aside>
    </>
  )
}

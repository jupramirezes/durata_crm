import { ETAPAS } from '../types'

/* ── EtapaBadge ─────────────────────────────────────── */

export function EtapaBadge({ etapa, size = 'sm' }: { etapa: string; size?: 'sm' | 'md' }) {
  const info = ETAPAS.find(e => e.key === etapa)
  if (!info) return <span className="text-xs text-[var(--color-text-muted)]">{etapa}</span>
  const cls = size === 'md'
    ? 'text-xs px-4 py-1.5 rounded-full font-medium'
    : 'text-[11px] px-2.5 py-1 rounded-full font-medium'
  return (
    <span className={cls} style={{ background: info.color + '14', color: info.color }}>
      {info.label}
    </span>
  )
}

/* ── KPICard ────────────────────────────────────────── */

export function KPICard({ label, value, subtitle }: {
  label: string
  value: string
  icon?: React.ElementType
  small?: boolean
  subtitle?: string
}) {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl p-6 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow duration-200">
      <p className="text-xs font-medium uppercase tracking-[0.05em] text-[var(--color-text-muted)] mb-3">{label}</p>
      <p className="text-3xl font-extrabold text-[var(--color-text)] tabular-nums tracking-tight">{value}</p>
      {subtitle && <p className="text-[13px] text-[var(--color-text-muted)] mt-2">{subtitle}</p>}
    </div>
  )
}

/* ── PageHeader ─────────────────────────────────────── */

export function PageHeader({ title, subtitle, actions }: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-[var(--color-text-muted)] mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

/* ── EstadoBadge (for cotizaciones) ─────────────────── */

const ESTADO_STYLES: Record<string, string> = {
  borrador: 'bg-slate-100 text-slate-600',
  enviada: 'bg-blue-50 text-blue-700',
  aprobada: 'bg-emerald-50 text-emerald-700',
  rechazada: 'bg-red-50 text-red-700',
}

export function EstadoBadge({ estado }: { estado: string }) {
  return (
    <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${ESTADO_STYLES[estado] || ESTADO_STYLES.borrador}`}>
      {estado}
    </span>
  )
}

import { ETAPAS } from '../types'

/* ── EtapaBadge ─────────────────────────────────────── */

export function EtapaBadge({ etapa, size = 'sm' }: { etapa: string; size?: 'sm' | 'md' }) {
  const info = ETAPAS.find(e => e.key === etapa)
  if (!info) return <span className="text-xs text-[var(--color-text-muted)]">{etapa}</span>
  const cls = size === 'md'
    ? 'text-xs px-3 py-1 rounded-md font-medium'
    : 'text-[10px] px-2 py-0.5 rounded font-medium'
  return (
    <span className={cls} style={{ background: info.color + '18', color: info.color }}>
      {info.label}
    </span>
  )
}

/* ── KPICard ────────────────────────────────────────── */

export function KPICard({ label, value, icon: Icon, small }: {
  label: string
  value: string
  icon: React.ElementType
  small?: boolean
}) {
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-[var(--color-text-muted)]">{label}</p>
        <Icon size={15} className="text-[var(--color-text-muted)] opacity-50" />
      </div>
      <span className={`${small ? 'text-lg' : 'text-2xl'} font-semibold text-[var(--color-text)]`}>{value}</span>
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
    <div className="flex items-center justify-between mb-5">
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-text)]">{title}</h1>
        {subtitle && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

/* ── EstadoBadge (for cotizaciones) ─────────────────── */

const ESTADO_STYLES: Record<string, string> = {
  borrador: 'bg-gray-100 text-gray-600',
  enviada: 'bg-blue-50 text-blue-700',
  aprobada: 'bg-emerald-50 text-emerald-700',
  rechazada: 'bg-red-50 text-red-700',
}

export function EstadoBadge({ estado }: { estado: string }) {
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${ESTADO_STYLES[estado] || ESTADO_STYLES.borrador}`}>
      {estado}
    </span>
  )
}

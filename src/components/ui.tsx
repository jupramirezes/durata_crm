import { ETAPAS } from '../types'

/* ── EtapaBadge ─────────────────────────────────────── */

export function EtapaBadge({ etapa, size = 'sm' }: { etapa: string; size?: 'sm' | 'md' }) {
  const info = ETAPAS.find(e => e.key === etapa)
  if (!info) return <span className="text-xs text-[var(--color-text-muted)]">{etapa}</span>
  const cls = size === 'md'
    ? 'text-sm px-5 py-1.5 rounded-full font-semibold'
    : 'text-[11px] px-3 py-1 rounded-full font-medium'
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
    <div className="card card-hover p-7 min-h-[130px] flex flex-col justify-between">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#94a3b8] mb-2">{label}</p>
      <p className="text-[44px] font-extrabold text-[var(--color-text)] tabular-nums tracking-tight leading-none my-2">{value}</p>
      {subtitle && <p className="text-[13px] text-[#94a3b8] mt-2">{subtitle}</p>}
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
        <h1 className="text-[28px] font-bold text-[var(--color-text)] tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-[#94a3b8] mt-1">{subtitle}</p>}
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
  descartada: 'bg-gray-100 text-gray-400 line-through',
}

export function EstadoBadge({ estado }: { estado: string }) {
  return (
    <span className={`text-[11px] px-3 py-1 rounded-full font-medium ${ESTADO_STYLES[estado] || ESTADO_STYLES.borrador}`}>
      {estado}
    </span>
  )
}

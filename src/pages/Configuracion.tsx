import { Building2, Users, Settings, Database, AlertCircle } from 'lucide-react'

export default function Configuracion() {
  return (
    <div className="p-8 space-y-6 max-w-4xl animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text)]">Configuración</h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Parámetros del sistema</p>
      </div>

      {/* Datos empresa */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center">
            <Building2 size={18} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text)]">Datos de la empresa</h3>
            <span className="text-[10px] text-[var(--color-accent-yellow)] font-medium">Próximamente editable</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-[var(--color-text-muted)] text-xs font-medium block mb-1">Razón social</span><span className="font-medium">DURATA® S.A.S.</span></div>
          <div><span className="text-[var(--color-text-muted)] text-xs font-medium block mb-1">NIT</span><span>890.939.027-6</span></div>
          <div><span className="text-[var(--color-text-muted)] text-xs font-medium block mb-1">Ciudad</span><span>Itagüí, Antioquia</span></div>
          <div><span className="text-[var(--color-text-muted)] text-xs font-medium block mb-1">Teléfono</span><span>444 43 70</span></div>
        </div>
      </div>

      {/* Equipo comercial */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
            <Users size={18} className="text-[var(--color-accent-purple)]" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text)]">Equipo comercial</h3>
            <span className="text-[10px] text-[var(--color-accent-yellow)] font-medium">Próximamente editable</span>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { nombre: 'Sebastián Aguirre', cargo: 'Director comercial', tel: '317 666 8023' },
            { nombre: 'Omar Cossio', cargo: 'Comercial', tel: '444 43 70 ext 108' },
            { nombre: 'Juan Pablo Ramírez', cargo: 'Comercial', tel: '' },
          ].map(p => (
            <div key={p.nombre} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
              <div><span className="font-medium text-sm">{p.nombre}</span><span className="text-xs text-[var(--color-text-muted)] ml-2">{p.cargo}</span></div>
              {p.tel && <span className="text-xs text-[var(--color-text-muted)]">{p.tel}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Parámetros */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Settings size={18} className="text-[var(--color-accent-green)]" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text)]">Parámetros de cotización</h3>
            <span className="text-[10px] text-[var(--color-accent-yellow)] font-medium">Próximamente editable</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-[var(--color-text-muted)] text-xs font-medium block mb-1">Margen default</span><span className="font-medium">38%</span></div>
          <div><span className="text-[var(--color-text-muted)] text-xs font-medium block mb-1">IVA</span><span className="font-medium">19%</span></div>
          <div><span className="text-[var(--color-text-muted)] text-xs font-medium block mb-1">Validez cotización</span><span>10 días calendario</span></div>
          <div><span className="text-[var(--color-text-muted)] text-xs font-medium block mb-1">Tiempo de entrega</span><span>20 días hábiles</span></div>
        </div>
      </div>

      {/* Base de datos */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
            <Database size={18} className="text-[var(--color-accent-yellow)]" />
          </div>
          <h3 className="font-semibold text-[var(--color-text)]">Base de datos</h3>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <AlertCircle size={16} className="text-[var(--color-accent-yellow)] shrink-0" />
          <div>
            <span className="text-sm font-medium text-[var(--color-text)]">localStorage (modo demo)</span>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Próximamente: Supabase para datos compartidos</p>
          </div>
        </div>
      </div>
    </div>
  )
}

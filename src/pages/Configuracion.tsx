import { Building2, Users, Settings, Database, AlertCircle, CheckCircle } from 'lucide-react'
import { PageHeader } from '../components/ui'
import { isSupabaseReady } from '../lib/supabase'

export default function Configuracion() {
  return (
    <div className="p-6 space-y-4 max-w-4xl animate-fade-in">
      <PageHeader title="Configuración" subtitle="Parámetros del sistema" />

      {/* Datos empresa */}
      <div className="bg-white rounded-lg border border-[var(--color-border)] p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center">
            <Building2 size={14} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <h3 className="font-semibold text-xs text-[var(--color-text)]">Datos de la empresa</h3>
            <span className="text-[9px] text-[var(--color-accent-yellow)] font-medium">Próximamente editable</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div><span className="text-[var(--color-text-muted)] text-[10px] font-medium block mb-0.5">Razón social</span><span className="font-medium">DURATA® S.A.S.</span></div>
          <div><span className="text-[var(--color-text-muted)] text-[10px] font-medium block mb-0.5">NIT</span><span>890.939.027-6</span></div>
          <div><span className="text-[var(--color-text-muted)] text-[10px] font-medium block mb-0.5">Ciudad</span><span>Itagüí, Antioquia</span></div>
          <div><span className="text-[var(--color-text-muted)] text-[10px] font-medium block mb-0.5">Teléfono</span><span>444 43 70</span></div>
        </div>
      </div>

      {/* Equipo comercial */}
      <div className="bg-white rounded-lg border border-[var(--color-border)] p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-md bg-purple-50 flex items-center justify-center">
            <Users size={14} className="text-[var(--color-accent-purple)]" />
          </div>
          <div>
            <h3 className="font-semibold text-xs text-[var(--color-text)]">Equipo comercial</h3>
            <span className="text-[9px] text-[var(--color-accent-yellow)] font-medium">Próximamente editable</span>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { nombre: 'Sebastián Aguirre', cargo: 'Director comercial', tel: '317 666 8023' },
            { nombre: 'Omar Cossio', cargo: 'Comercial', tel: '444 43 70 ext 108' },
            { nombre: 'Juan Pablo Ramírez', cargo: 'Comercial', tel: '' },
            { nombre: 'Camilo Araque', cargo: 'Comercial', tel: '' },
            { nombre: 'Daniela Galindo', cargo: 'Comercial', tel: '' },
          ].map(p => (
            <div key={p.nombre} className="flex items-center justify-between py-1.5 border-b border-[var(--color-border)] last:border-0">
              <div><span className="font-medium text-xs">{p.nombre}</span><span className="text-[10px] text-[var(--color-text-muted)] ml-1.5">{p.cargo}</span></div>
              {p.tel && <span className="text-[10px] text-[var(--color-text-muted)]">{p.tel}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Parámetros */}
      <div className="bg-white rounded-lg border border-[var(--color-border)] p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-md bg-emerald-50 flex items-center justify-center">
            <Settings size={14} className="text-[var(--color-accent-green)]" />
          </div>
          <div>
            <h3 className="font-semibold text-xs text-[var(--color-text)]">Parámetros de cotización</h3>
            <span className="text-[9px] text-[var(--color-accent-yellow)] font-medium">Próximamente editable</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div><span className="text-[var(--color-text-muted)] text-[10px] font-medium block mb-0.5">Margen default</span><span className="font-medium">38%</span></div>
          <div><span className="text-[var(--color-text-muted)] text-[10px] font-medium block mb-0.5">IVA</span><span className="font-medium">19%</span></div>
          <div><span className="text-[var(--color-text-muted)] text-[10px] font-medium block mb-0.5">Validez cotización</span><span>10 días calendario</span></div>
          <div><span className="text-[var(--color-text-muted)] text-[10px] font-medium block mb-0.5">Tiempo de entrega</span><span>20 días hábiles</span></div>
        </div>
      </div>

      {/* Base de datos */}
      <div className="bg-white rounded-lg border border-[var(--color-border)] p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-md bg-amber-50 flex items-center justify-center">
            <Database size={14} className="text-[var(--color-accent-yellow)]" />
          </div>
          <h3 className="font-semibold text-xs text-[var(--color-text)]">Base de datos</h3>
        </div>
        {isSupabaseReady ? (
          <div className="flex items-center gap-2.5 p-2.5 rounded-md bg-emerald-50 border border-emerald-200">
            <CheckCircle size={14} className="text-[var(--color-accent-green)] shrink-0" />
            <div>
              <span className="text-xs font-medium text-[var(--color-text)]">Supabase conectado</span>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Los datos se sincronizan en tiempo real con la base de datos</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 p-2.5 rounded-md bg-amber-50 border border-amber-200">
            <AlertCircle size={14} className="text-[var(--color-accent-yellow)] shrink-0" />
            <div>
              <span className="text-xs font-medium text-[var(--color-text)]">localStorage (modo demo)</span>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Configura Supabase para datos compartidos</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

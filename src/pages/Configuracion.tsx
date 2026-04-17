import { useState, useEffect, useCallback } from 'react'
import { Building2, Users, Settings, GitBranch, FileText, Tag, Plus, Trash2, Save, Database, CheckCircle, AlertCircle } from 'lucide-react'
import { PageHeader } from '../components/ui'
import { isSupabaseReady } from '../lib/supabase'
import { ETAPAS } from '../types'
import {
  type ConfigSistema,
  type DatosEmpresa,
  type Cotizador,
  type DefaultsCotizacion,
  CONFIG_DEFAULTS,
  loadConfig,
  saveConfig,
} from '../hooks/useConfiguracion'

/* ── Tab definition ─────────────────────────────────────────── */

const TABS = [
  { key: 'empresa', label: 'Empresa', icon: Building2 },
  { key: 'equipo', label: 'Equipo comercial', icon: Users },
  { key: 'pipeline', label: 'Pipeline', icon: GitBranch },
  { key: 'cotizacion', label: 'Cotización', icon: FileText },
  { key: 'fuentes', label: 'Fuentes de lead', icon: Tag },
  { key: 'sectores', label: 'Sectores', icon: Settings },
] as const

type TabKey = typeof TABS[number]['key']

/* ── Shared sub-components ──────────────────────────────────── */

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">{children}</label>
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] text-xs bg-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20 transition-colors"
    />
  )
}

function SaveButton({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="flex items-center gap-1.5 h-12 px-6 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-[15px] font-semibold rounded-xl transition-colors shadow-[0_4px_12px_rgba(59,130,246,0.3)] disabled:opacity-50"
    >
      <Save size={15} />
      {saving ? 'Guardando…' : 'Guardar cambios'}
    </button>
  )
}

function EditableList({ items, onChange, placeholder }: { items: string[]; onChange: (items: string[]) => void; placeholder?: string }) {
  const [newItem, setNewItem] = useState('')
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 group">
          <input
            type="text"
            value={item}
            onChange={e => { const next = [...items]; next[i] = e.target.value; onChange(next) }}
            className="flex-1 px-3 py-1.5 rounded-md border border-[var(--color-border)] text-xs bg-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
          <button
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="text-[var(--color-text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && newItem.trim()) {
              onChange([...items, newItem.trim()])
              setNewItem('')
            }
          }}
          placeholder={placeholder ?? 'Agregar…'}
          className="flex-1 px-3 py-1.5 rounded-md border border-dashed border-[var(--color-border)] text-xs bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
        />
        <button
          onClick={() => { if (newItem.trim()) { onChange([...items, newItem.trim()]); setNewItem('') } }}
          className="text-[var(--color-primary)] hover:bg-blue-50 p-1 rounded transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────── */

export default function Configuracion() {
  const [tab, setTab] = useState<TabKey>('empresa')
  const [config, setConfig] = useState<ConfigSistema>(CONFIG_DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    loadConfig().then(c => { setConfig(c); setLoading(false) })
  }, [])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }, [])

  async function handleSave(key: keyof ConfigSistema, value: unknown) {
    setSaving(true)
    setConfig(prev => ({ ...prev, [key]: value }))
    const ok = await saveConfig(key, value)
    setSaving(false)
    if (ok) {
      showToast('Cambios guardados')
    } else {
      showToast('Error: solo se guardó localmente, no en servidor')
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-[var(--color-primary)] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="px-8 py-8 max-w-4xl animate-fade-in">
      <PageHeader title="Configuración" subtitle="Parámetros del sistema" />

      {/* ─── TABS ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] mt-5 mb-6 overflow-x-auto">
        {TABS.map(t => {
          const Icon = t.icon
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 h-11 px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                active
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-gray-300'
              }`}
            >
              <Icon size={13} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ─── TAB CONTENT ───────────────────────────────────── */}
      {tab === 'empresa' && <TabEmpresa data={config.datos_empresa} onSave={v => handleSave('datos_empresa', v)} saving={saving} />}
      {tab === 'equipo' && <TabEquipo data={config.cotizadores} onSave={v => handleSave('cotizadores', v)} saving={saving} />}
      {tab === 'pipeline' && (
        <TabPipeline
          customs={config.etapas_custom || {}}
          onSave={v => handleSave('etapas_custom', v)}
          saving={saving}
        />
      )}
      {tab === 'cotizacion' && <TabCotizacion data={config.defaults_cotizacion} onSave={v => handleSave('defaults_cotizacion', v)} saving={saving} />}
      {tab === 'fuentes' && <TabListaEditable items={config.fuentes_lead} onSave={v => handleSave('fuentes_lead', v)} saving={saving} label="Fuentes de lead" placeholder="Nueva fuente…" />}
      {tab === 'sectores' && <TabListaEditable items={config.sectores} onSave={v => handleSave('sectores', v)} saving={saving} label="Sectores" placeholder="Nuevo sector…" />}

      {/* ─── DB STATUS (bottom) ────────────────────────────── */}
      <div className="mt-6 card p-4">
        <div className="flex items-center gap-2.5">
          <Database size={14} className="text-[var(--color-text-muted)]" />
          {isSupabaseReady ? (
            <div className="flex items-center gap-2">
              <CheckCircle size={13} className="text-[var(--color-accent-green)]" />
              <span className="text-[11px] text-[var(--color-text)]">Supabase conectado — datos sincronizados</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertCircle size={13} className="text-[var(--color-accent-yellow)]" />
              <span className="text-[11px] text-[var(--color-text)]">localStorage — modo offline</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── TOAST ─────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-5 right-5 bg-[var(--color-text)] text-white px-4 py-2.5 rounded-lg text-xs font-medium shadow-lg animate-fade-in flex items-center gap-2 z-50">
          <CheckCircle size={14} />
          {toast}
        </div>
      )}
    </div>
  )
}

/* ── Tab 1: Datos de la empresa ─────────────────────────────── */

function TabEmpresa({ data, onSave, saving }: { data: DatosEmpresa; onSave: (v: DatosEmpresa) => void; saving: boolean }) {
  const [form, setForm] = useState(data)
  const set = (key: keyof DatosEmpresa, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-sm text-[var(--color-text)]">Datos de la empresa</h3>
        <SaveButton onClick={() => onSave(form)} saving={saving} />
      </div>
      <p className="text-[10px] text-[var(--color-text-muted)] -mt-3">Estos datos se usan en el encabezado del PDF de cotización.</p>
      <div className="grid grid-cols-2 gap-4">
        <div><FieldLabel>Razón social</FieldLabel><TextInput value={form.nombre} onChange={v => set('nombre', v)} /></div>
        <div><FieldLabel>NIT</FieldLabel><TextInput value={form.nit} onChange={v => set('nit', v)} /></div>
        <div><FieldLabel>Dirección</FieldLabel><TextInput value={form.direccion} onChange={v => set('direccion', v)} /></div>
        <div><FieldLabel>Teléfono</FieldLabel><TextInput value={form.telefono} onChange={v => set('telefono', v)} /></div>
        <div><FieldLabel>Correo</FieldLabel><TextInput value={form.correo} onChange={v => set('correo', v)} placeholder="ventas@durata.co" /></div>
        <div><FieldLabel>URL del logo</FieldLabel><TextInput value={form.logo_url} onChange={v => set('logo_url', v)} placeholder="https://…" /></div>
      </div>
    </div>
  )
}

/* ── Tab 2: Equipo comercial ────────────────────────────────── */

function TabEquipo({ data, onSave, saving }: { data: Cotizador[]; onSave: (v: Cotizador[]) => void; saving: boolean }) {
  const [list, setList] = useState(data)
  const [adding, setAdding] = useState(false)
  const [newCot, setNewCot] = useState({ nombre: '', iniciales: '', correo: '' })

  function addCotizador() {
    if (!newCot.nombre.trim() || !newCot.iniciales.trim()) return
    const id = newCot.iniciales.replace(/\./g, '').toUpperCase()
    setList([...list, { id, nombre: newCot.nombre, iniciales: newCot.iniciales, correo: newCot.correo, activo: true }])
    setNewCot({ nombre: '', iniciales: '', correo: '' })
    setAdding(false)
  }

  function toggleActivo(idx: number) {
    const next = [...list]
    next[idx] = { ...next[idx], activo: !next[idx].activo }
    setList(next)
  }

  function removeCotizador(idx: number) {
    setList(list.filter((_, i) => i !== idx))
  }

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm text-[var(--color-text)]">Equipo comercial</h3>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Cotizadores inactivos no aparecen en dropdowns pero se mantienen en datos históricos.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdding(!adding)}
            className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-medium rounded-md hover:bg-gray-100 transition-colors"
          >
            <Plus size={13} /> Agregar
          </button>
          <SaveButton onClick={() => onSave(list)} saving={saving} />
        </div>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className="pb-2 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Nombre</th>
            <th className="pb-2 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-center">Iniciales</th>
            <th className="pb-2 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Correo</th>
            <th className="pb-2 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-center">Activo</th>
            <th className="pb-2 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {list.map((c, i) => (
            <tr key={c.id} className={`border-b border-[var(--color-border)] last:border-0 ${!c.activo ? 'opacity-50' : ''}`}>
              <td className="py-2.5">
                <input
                  type="text"
                  value={c.nombre}
                  onChange={e => { const next = [...list]; next[i] = { ...next[i], nombre: e.target.value }; setList(next) }}
                  className="text-xs font-medium bg-transparent border-none outline-none w-full"
                />
              </td>
              <td className="py-2.5 text-center">
                <span className="text-[10px] font-bold text-[var(--color-primary)] bg-blue-50 px-2 py-0.5 rounded">{c.iniciales}</span>
              </td>
              <td className="py-2.5">
                <input
                  type="text"
                  value={c.correo}
                  onChange={e => { const next = [...list]; next[i] = { ...next[i], correo: e.target.value }; setList(next) }}
                  placeholder="correo@durata.co"
                  className="text-xs text-[var(--color-text-muted)] bg-transparent border-none outline-none w-full"
                />
              </td>
              <td className="py-2.5 text-center">
                <button
                  onClick={() => toggleActivo(i)}
                  className={`w-8 h-4 rounded-full relative transition-colors ${c.activo ? 'bg-[var(--color-accent-green)]' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${c.activo ? 'left-4' : 'left-0.5'}`} />
                </button>
              </td>
              <td className="py-2.5 text-center">
                <button onClick={() => removeCotizador(i)} className="text-[var(--color-text-muted)] hover:text-red-500 p-1 transition-colors">
                  <Trash2 size={12} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {adding && (
        <div className="flex items-end gap-3 p-3 bg-[var(--color-surface)] rounded-lg border border-dashed border-[var(--color-border)]">
          <div className="flex-1"><FieldLabel>Nombre</FieldLabel><TextInput value={newCot.nombre} onChange={v => setNewCot({ ...newCot, nombre: v })} placeholder="Nombre completo" /></div>
          <div className="w-24"><FieldLabel>Iniciales</FieldLabel><TextInput value={newCot.iniciales} onChange={v => setNewCot({ ...newCot, iniciales: v })} placeholder="X.Y" /></div>
          <div className="flex-1"><FieldLabel>Correo</FieldLabel><TextInput value={newCot.correo} onChange={v => setNewCot({ ...newCot, correo: v })} placeholder="correo@…" /></div>
          <button onClick={addCotizador} className="px-3 py-2 bg-[var(--color-primary)] text-white text-xs font-semibold rounded-md hover:bg-[var(--color-primary-hover)] transition-colors">
            Agregar
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Tab 3: Pipeline (editable label + color) ───────────────── */

function TabPipeline({ customs, onSave, saving }: {
  customs: Record<string, { label?: string; color?: string }>
  onSave: (v: Record<string, { label?: string; color?: string }>) => void
  saving: boolean
}) {
  const [draft, setDraft] = useState(customs)
  const hasChanges = JSON.stringify(draft) !== JSON.stringify(customs)

  function updateField(key: string, field: 'label' | 'color', value: string) {
    setDraft(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  function resetOne(key: string) {
    const next = { ...draft }
    delete next[key]
    setDraft(next)
  }

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm text-[var(--color-text)]">Etapas del pipeline</h3>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Personaliza el nombre visible y color. La clave técnica no se puede cambiar.</p>
        </div>
        <button
          onClick={() => onSave(draft)}
          disabled={!hasChanges || saving}
          className="px-4 py-2 bg-[var(--color-primary)] text-white text-xs font-semibold rounded-md hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Guardando…' : hasChanges ? 'Guardar cambios' : 'Sin cambios'}
        </button>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className="pb-2 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider w-8">#</th>
            <th className="pb-2 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Color</th>
            <th className="pb-2 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Etapa (editable)</th>
            <th className="pb-2 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Clave</th>
            <th className="pb-2 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider w-20"></th>
          </tr>
        </thead>
        <tbody>
          {ETAPAS.map((e, i) => {
            const override = draft[e.key] || {}
            const currentLabel = override.label ?? e.label
            const currentColor = override.color ?? e.color
            const hasOverride = override.label !== undefined || override.color !== undefined
            return (
              <tr key={e.key} className="border-b border-[var(--color-border)] last:border-0">
                <td className="py-2.5 text-xs text-[var(--color-text-muted)] font-medium">{i + 1}</td>
                <td className="py-2.5">
                  <input
                    type="color"
                    value={currentColor}
                    onChange={ev => updateField(e.key, 'color', ev.target.value)}
                    className="w-8 h-7 rounded cursor-pointer border border-[var(--color-border)]"
                    title={currentColor}
                  />
                </td>
                <td className="py-2.5">
                  <input
                    type="text"
                    value={currentLabel}
                    onChange={ev => updateField(e.key, 'label', ev.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md text-xs border border-[var(--color-border)]"
                    placeholder={e.label}
                  />
                </td>
                <td className="py-2.5 text-[10px] font-mono text-[var(--color-text-muted)]">{e.key}</td>
                <td className="py-2.5">
                  {hasOverride && (
                    <button
                      onClick={() => resetOne(e.key)}
                      className="text-[10px] text-red-500 hover:text-red-700 font-medium"
                      title="Restaurar valores por defecto"
                    >
                      Resetear
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {hasChanges && (
        <p className="text-[10px] text-amber-600">Tenés cambios sin guardar. Recargar la página después de guardar para ver los cambios en Pipeline y Dashboard.</p>
      )}
    </div>
  )
}

/* ── Tab 4: Defaults de cotización ──────────────────────────── */

function TabCotizacion({ data, onSave, saving }: { data: DefaultsCotizacion; onSave: (v: DefaultsCotizacion) => void; saving: boolean }) {
  const [form, setForm] = useState(data)

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm text-[var(--color-text)]">Defaults de cotización</h3>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Valores por defecto al crear una cotización nueva. Son editables por cotización.</p>
        </div>
        <SaveButton onClick={() => onSave(form)} saving={saving} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div><FieldLabel>Tiempo de entrega</FieldLabel><TextInput value={form.tiempo_entrega} onChange={v => setForm({ ...form, tiempo_entrega: v })} /></div>
        <div><FieldLabel>Validez de oferta</FieldLabel><TextInput value={form.validez_oferta} onChange={v => setForm({ ...form, validez_oferta: v })} /></div>
      </div>

      <div>
        <FieldLabel>Condiciones comerciales</FieldLabel>
        <EditableList items={form.condiciones} onChange={v => setForm({ ...form, condiciones: v })} placeholder="Nueva condición…" />
      </div>

      <div>
        <FieldLabel>No incluye</FieldLabel>
        <EditableList items={form.no_incluye} onChange={v => setForm({ ...form, no_incluye: v })} placeholder="Nuevo ítem…" />
      </div>
    </div>
  )
}

/* ── Tabs 5 & 6: Editable string list (fuentes / sectores) ── */

function TabListaEditable({ items, onSave, saving, label, placeholder }: { items: string[]; onSave: (v: string[]) => void; saving: boolean; label: string; placeholder: string }) {
  const [list, setList] = useState(items)

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm text-[var(--color-text)]">{label}</h3>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Se usan en los dropdowns al crear registros. Presiona Enter para agregar.</p>
        </div>
        <SaveButton onClick={() => onSave(list)} saving={saving} />
      </div>
      <EditableList items={list} onChange={setList} placeholder={placeholder} />
    </div>
  )
}

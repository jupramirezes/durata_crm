import { supabase, isSupabaseReady } from './useSupabase'

// ── Types ────────────────────────────────────────────────────

export interface DatosEmpresa {
  nombre: string
  nit: string
  direccion: string
  telefono: string
  correo: string
  logo_url: string
}

export interface Cotizador {
  id: string
  nombre: string
  iniciales: string
  correo: string
  activo: boolean
}

export interface DefaultsCotizacion {
  tiempo_entrega: string
  validez_oferta: string
  condiciones: string[]
  no_incluye: string[]
}

export interface ConfigSistema {
  datos_empresa: DatosEmpresa
  cotizadores: Cotizador[]
  defaults_cotizacion: DefaultsCotizacion
  fuentes_lead: string[]
  sectores: string[]
}

// ── Defaults ─────────────────────────────────────────────────

export const CONFIG_DEFAULTS: ConfigSistema = {
  datos_empresa: {
    nombre: 'DURATA® S.A.S.',
    nit: '890.939.027-6',
    direccion: 'Itagüí, Antioquia',
    telefono: '444 43 70',
    correo: '',
    logo_url: '',
  },
  cotizadores: [
    { id: 'OC', nombre: 'Omar Cossio', iniciales: 'O.C', correo: '', activo: true },
    { id: 'SA', nombre: 'Sebastián Aguirre', iniciales: 'S.A', correo: '', activo: true },
    { id: 'JPR', nombre: 'Juan Pablo Ramírez', iniciales: 'J.R', correo: '', activo: true },
    { id: 'CA', nombre: 'Cristian Arango', iniciales: 'C.A', correo: '', activo: true },
    { id: 'DG', nombre: 'Daniel Gómez', iniciales: 'D.G', correo: '', activo: true },
  ],
  defaults_cotizacion: {
    tiempo_entrega: '15 días hábiles',
    validez_oferta: '30 días calendario',
    condiciones: [
      'Precios no incluyen IVA',
      '50% anticipo, 50% contra entrega',
      'Precios sujetos a variación del acero',
    ],
    no_incluye: [
      'Obra civil',
      'Instalaciones eléctricas e hidráulicas',
      'Instalación (cotizar aparte)',
    ],
  },
  fuentes_lead: ['Referido', 'Página web', 'WhatsApp', 'Llamada', 'Licitación', 'Histórico Excel', 'Otro'],
  sectores: ['Restaurantes', 'Clínicas/Hospitales', 'Hoteles', 'Industrial', 'Residencial', 'Institucional', 'Comercial', 'Otro'],
}

const LS_KEY = 'durata_config'

// ── localStorage helpers ─────────────────────────────────────

function loadFromLS(): ConfigSistema {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...CONFIG_DEFAULTS, ...parsed }
    }
  } catch { /* ignore */ }
  return { ...CONFIG_DEFAULTS }
}

function saveToLS(config: ConfigSistema) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(config))
  } catch (err) {
    console.warn('[config] localStorage save failed:', (err as Error).message)
  }
}

// ── Supabase helpers ─────────────────────────────────────────

async function ensureTable(): Promise<boolean> {
  if (!isSupabaseReady) return false
  // Try a read — if it fails, table doesn't exist yet
  const { error } = await supabase.from('configuracion_sistema').select('id').limit(1)
  if (error && error.code === '42P01') {
    // Table doesn't exist — we can't create it from the client (need SQL editor)
    console.warn('[config] configuracion_sistema table not found. Run schema migration.')
    return false
  }
  return !error
}

async function loadFromSupabase(): Promise<Partial<ConfigSistema>> {
  if (!isSupabaseReady) return {}
  const hasTable = await ensureTable()
  if (!hasTable) return {}

  const { data, error } = await supabase
    .from('configuracion_sistema')
    .select('clave, valor')

  if (error || !data) return {}

  const result: Record<string, unknown> = {}
  for (const row of data) {
    result[row.clave] = row.valor
  }
  return result as Partial<ConfigSistema>
}

async function saveKeyToSupabase(clave: string, valor: unknown): Promise<boolean> {
  if (!isSupabaseReady) return false
  const { error } = await supabase
    .from('configuracion_sistema')
    .upsert({ clave, valor, updated_at: new Date().toISOString() }, { onConflict: 'clave' })
  if (error) {
    console.warn('[config] Supabase save failed for', clave, error.message)
    return false
  }
  return true
}

// ── Public API ───────────────────────────────────────────────

export async function loadConfig(): Promise<ConfigSistema> {
  const local = loadFromLS()
  const remote = await loadFromSupabase()

  // Merge: remote wins if present
  const merged: ConfigSistema = {
    datos_empresa: (remote.datos_empresa as DatosEmpresa) ?? local.datos_empresa,
    cotizadores: (remote.cotizadores as Cotizador[]) ?? local.cotizadores,
    defaults_cotizacion: (remote.defaults_cotizacion as DefaultsCotizacion) ?? local.defaults_cotizacion,
    fuentes_lead: (remote.fuentes_lead as string[]) ?? local.fuentes_lead,
    sectores: (remote.sectores as string[]) ?? local.sectores,
  }

  // Cache locally
  saveToLS(merged)
  return merged
}

export async function saveConfig(key: keyof ConfigSistema, value: unknown): Promise<void> {
  // Update localStorage
  const current = loadFromLS()
  ;(current as unknown as Record<string, unknown>)[key] = value
  saveToLS(current)

  // Sync to Supabase (fire-and-forget)
  saveKeyToSupabase(key, value)
}

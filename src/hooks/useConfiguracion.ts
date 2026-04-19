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

export interface EtapaCustom {
  label?: string
  color?: string
}

export interface ConfigSistema {
  datos_empresa: DatosEmpresa
  cotizadores: Cotizador[]
  defaults_cotizacion: DefaultsCotizacion
  fuentes_lead: string[]
  sectores: string[]
  /** Overrides for etapa labels/colors (by key). Keys themselves are NEVER customizable
   * — the reducer depends on hardcoded keys. Only visible label/color can be changed. */
  etapas_custom?: Record<string, EtapaCustom>
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
    { id: 'CA', nombre: 'Camilo Araque', iniciales: 'C.A', correo: '', activo: true },
    { id: 'DG', nombre: 'Daniela Galindo', iniciales: 'D.G', correo: '', activo: true },
  ],
  defaults_cotizacion: {
    tiempo_entrega: '25 días hábiles o a convenir',
    validez_oferta: '30 días calendario',
    // Texto completo que se inyecta por defecto al crear una nueva cotización.
    // Coincide con CONDICIONES_OPTIONS de CotizacionModal. Editable aquí globalmente
    // y también por cotización individual.
    condiciones: [
      'Tiempo de entrega: __TIEMPO__, este tiempo corre a partir de la orden de compra, pago del anticipo, la firma de los planos definitivos, la validación de los diseños y los acabados solicitados.',
      'IVA: Se cobrará de acuerdo a la tarifa vigente en el momento del despacho. No incluye impuestos adicionales gubernamentales, en caso de existir serán asumidos por el cliente y adicionados a la factura final.',
      'Cantidades: El presupuesto puede variar de acuerdo a lo realmente Suministrado, el cual será el valor final de la factura.',
      'Daños: Los daños causados en los acabados de los elementos de Durata® por cuenta de la obra serán asumidos por el cliente, la recepción de los elementos implica responsabilidad en el cuidado de los mismos.',
      'Garantía: DURATA ofrece garantía de 1 AÑO MATERIALES Y CORRECTO FUNCIONAMIENTO, SIEMPRE Y CUANDO SEA INSTALADO POR DURATA.',
    ],
    // Coincide con NO_INCLUYE_OPTIONS de CotizacionModal.
    no_incluye: [
      'Suministro ni instalación de canastilla, superboard, desagües, sellado a muro, grifería, pruebas de soldadura, Chapas y/o pasadores en puertas, ningún elemento que no esté especificado en la presente cotización.',
      'Obra civil, demolición y cuarto para herramienta y personal, ni uniformes fuera de los institucionales de durata.',
      'Andamios, estos serán suministrados por la obra incluido su respectivo transporte vertical y horizontal hasta el punto de trabajo.',
      'Personal SISO permanente, en caso de requerirlo tiene un valor de 180.000$ por día. +TTE',
      'El elemento cotizado corresponde a una valoración numérica de la propuesta del cliente, los diseños, los cálculos de dicho sistema y su cumplimiento con la NSR son responsabilidad directa del cliente y exonera a Durata® SAS de cualquier compromiso con estabilidad del elemento.',
    ],
  },
  fuentes_lead: ['Referido', 'Página web', 'WhatsApp', 'Llamada', 'Licitación', 'Residente', 'Histórico Excel', 'Otro'],
  sectores: ['Restaurantes', 'Clínicas/Hospitales', 'Hoteles', 'Industrial', 'Residencial', 'Institucional', 'Comercial', 'Otro'],
  etapas_custom: {},
}

/** Lee la config custom desde localStorage (sync). Usado por ETAPAS_WITH_OVERRIDES en types. */
export function loadEtapasCustomSync(): Record<string, EtapaCustom> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed.etapas_custom || {}
  } catch { return {} }
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

/** Detecta si defaults_cotizacion es la versión vieja (labels cortos) y
 * la migra al texto completo del handoff. Heurística: una condición que
 * NO contiene dos puntos (:) es probablemente un label corto.
 * Así si el usuario editó manualmente los textos, no se sobrescriben. */
function migrateDefaultsIfNeeded(d: DefaultsCotizacion | undefined | null): DefaultsCotizacion {
  if (!d) return CONFIG_DEFAULTS.defaults_cotizacion
  const hasLegalText = d.condiciones.some(c => c.includes(':') && c.length > 100)
  if (hasLegalText) return d
  // Todos cortos → defaults del usuario están desactualizados, migrar
  return {
    tiempo_entrega: d.tiempo_entrega || CONFIG_DEFAULTS.defaults_cotizacion.tiempo_entrega,
    validez_oferta: d.validez_oferta || CONFIG_DEFAULTS.defaults_cotizacion.validez_oferta,
    condiciones: CONFIG_DEFAULTS.defaults_cotizacion.condiciones,
    no_incluye: CONFIG_DEFAULTS.defaults_cotizacion.no_incluye,
  }
}

export async function loadConfig(): Promise<ConfigSistema> {
  const local = loadFromLS()
  const remote = await loadFromSupabase()

  // Merge: remote wins if present
  const merged: ConfigSistema = {
    datos_empresa: (remote.datos_empresa as DatosEmpresa) ?? local.datos_empresa,
    cotizadores: (remote.cotizadores as Cotizador[]) ?? local.cotizadores,
    defaults_cotizacion: migrateDefaultsIfNeeded(
      (remote.defaults_cotizacion as DefaultsCotizacion) ?? local.defaults_cotizacion
    ),
    fuentes_lead: (remote.fuentes_lead as string[]) ?? local.fuentes_lead,
    sectores: (remote.sectores as string[]) ?? local.sectores,
    etapas_custom: (remote.etapas_custom as Record<string, EtapaCustom>) ?? local.etapas_custom ?? {},
  }

  // Cache locally
  saveToLS(merged)
  return merged
}

export async function saveConfig(key: keyof ConfigSistema, value: unknown): Promise<boolean> {
  // Update localStorage
  const current = loadFromLS()
  ;(current as unknown as Record<string, unknown>)[key] = value
  saveToLS(current)

  // Sync to Supabase (await so callers know if it failed)
  const ok = await saveKeyToSupabase(key, value)
  if (!ok) {
    console.warn('[config] Supabase write failed for key:', key, '— saved to localStorage only')
  }
  return ok
}

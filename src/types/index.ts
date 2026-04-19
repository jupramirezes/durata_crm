// ==============================
// ETAPAS (8 stages pipeline)
// ==============================
export type Etapa = 'nuevo_lead' | 'en_cotizacion' | 'cotizacion_enviada' | 'en_seguimiento' | 'en_negociacion' | 'adjudicada' | 'recotizada' | 'perdida'

interface EtapaDef { key: Etapa; label: string; color: string }

// Colors: muted OKLCH chroma-unified palette from the redesign (warm-paper aesthetic).
// Users can override per-etapa via /config (localStorage) if they want stronger hues.
const ETAPAS_DEFAULTS: EtapaDef[] = [
  { key: 'nuevo_lead', label: 'Nuevo Lead', color: 'oklch(0.62 0.04 260)' },
  { key: 'en_cotizacion', label: 'En Cotización', color: 'oklch(0.58 0.08 290)' },
  { key: 'cotizacion_enviada', label: 'Cotización Enviada', color: 'oklch(0.60 0.09 220)' },
  { key: 'en_seguimiento', label: 'En Seguimiento', color: 'oklch(0.68 0.10 90)' },
  { key: 'en_negociacion', label: 'En Negociación', color: 'oklch(0.62 0.13 50)' },
  { key: 'adjudicada', label: 'Adjudicada', color: 'oklch(0.58 0.10 155)' },
  // D-11: estado terminal alternativo — oportunidades con cotizaciones descartadas/consolidadas.
  // NO suma al pipeline activo (ver Dashboard/Pipeline filters). getActiveCotizacionValor sigue
  // excluyendo descartadas/rechazadas: el valor refleja cotización nueva en borrador (0 si no hay).
  { key: 'recotizada', label: 'Recotizada/Consolidada', color: 'oklch(0.58 0.08 310)' },
  { key: 'perdida', label: 'Perdida', color: 'oklch(0.58 0.10 28)' },
]

/** Reads custom label/color overrides from localStorage (set by Configuración page). */
function readEtapasCustom(): Record<string, { label?: string; color?: string }> {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('durata_config') : null
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed.etapas_custom || {}
  } catch { return {} }
}

/** ETAPAS is a Proxy-like getter that applies customizations from localStorage each read.
 * Keys are NEVER customizable — reducer logic depends on them. Only label/color. */
export const ETAPAS: EtapaDef[] = new Proxy(ETAPAS_DEFAULTS, {
  get(target, prop) {
    if (prop === 'map' || prop === 'filter' || prop === 'find' || prop === 'forEach' || prop === 'length' || prop === Symbol.iterator) {
      const custom = readEtapasCustom()
      const merged = target.map(e => ({
        ...e,
        label: custom[e.key]?.label || e.label,
        color: custom[e.key]?.color || e.color,
      }))
      // Forward the call to the merged array
      const val = merged[prop as keyof typeof merged]
      return typeof val === 'function' ? val.bind(merged) : val
    }
    return target[prop as keyof typeof target]
  },
}) as EtapaDef[]

// ==============================
// CONSTANTS
// ==============================
// Default sectors — canonical values live in CONFIG_DEFAULTS (useConfiguracion.ts).
// Users can add custom sectors via /config, so the type is string (not a union).
export const SECTORES: string[] = ['Restaurantes', 'Clínicas/Hospitales', 'Hoteles', 'Industrial', 'Residencial', 'Institucional', 'Comercial', 'Otro']
export type Sector = string

export const COTIZADORES = [
  { id: 'OC', nombre: 'Omar Cossio', iniciales: 'O.C' },
  { id: 'SA', nombre: 'Sebastián Aguirre', iniciales: 'S.A' },
  { id: 'JPR', nombre: 'Juan Pablo Ramírez', iniciales: 'J.R' },
  { id: 'CA', nombre: 'Camilo Araque', iniciales: 'C.A' },
  { id: 'DG', nombre: 'Daniela Galindo', iniciales: 'D.G' },
] as const

// Default lead sources — canonical values live in CONFIG_DEFAULTS (useConfiguracion.ts).
// Users can add custom fuentes via /config, so the type is string (not a union).
export const FUENTES_LEAD: string[] = ['Referido', 'Página web', 'WhatsApp', 'Llamada', 'Licitación', 'Residente', 'Histórico Excel', 'Otro']
export type FuenteLead = string

export const MOTIVOS_PERDIDA = ['Precio', 'Tiempo de entrega', 'Eligió competencia', 'Cambió de alcance', 'Sin respuesta', 'Presupuesto cancelado', 'Proyecto congelado', 'Licitación del cliente', 'Otro'] as const

// Reverse lookup: resolves cotizador_asignado whether it's stored as id ('OC'), iniciales ('O.C'), nombre, or legacy variants
const _cotizadorIndex = new Map<string, typeof COTIZADORES[number]>()
const _COTIZADOR_ALIASES: Record<string, string> = {
  // Initials with dots (Excel format)
  'O.C': 'OC', 'S.A': 'SA', 'J.R': 'JPR', 'J.R ': 'JPR', 'C.A': 'CA', 'D.G': 'DG',
  // Short IDs
  'OC': 'OC', 'SA': 'SA', 'JPR': 'JPR', 'CA': 'CA', 'DG': 'DG',
  // Legacy name variants stored in Supabase from migration
  'Cristian Arango': 'CA', 'Daniel Gómez': 'DG',
}
for (const c of COTIZADORES) {
  _cotizadorIndex.set(c.id, c)
  _cotizadorIndex.set(c.nombre, c)
  _cotizadorIndex.set(c.iniciales, c)
}
// Also register all aliases
for (const [alias, id] of Object.entries(_COTIZADOR_ALIASES)) {
  const cot = COTIZADORES.find(c => c.id === id)
  if (cot) _cotizadorIndex.set(alias, cot)
}
/** Find a COTIZADOR by id, iniciales, nombre, or alias (handles mixed legacy data) */
export function findCotizador(cotizadorAsignado: string | null | undefined) {
  if (cotizadorAsignado == null) return null
  return _cotizadorIndex.get(cotizadorAsignado) ?? _cotizadorIndex.get(cotizadorAsignado.trim()) ?? null
}
/** Check if a cotizador_asignado value matches a given COTIZADOR id */
export function matchCotizador(cotizadorAsignado: string | null | undefined, cotId: string) {
  if (cotizadorAsignado == null) return false
  const resolved = findCotizador(cotizadorAsignado)
  return resolved ? resolved.id === cotId : false
}
export type MotivoPerdida = typeof MOTIVOS_PERDIDA[number]

// ==============================
// EMPRESA
// ==============================
export interface Empresa {
  id: string
  nombre: string
  nit: string
  direccion: string
  sector: Sector
  notas: string
  created_at: string
}

// ==============================
// CONTACTO
// ==============================
export interface Contacto {
  id: string
  empresa_id: string
  nombre: string
  cargo: string
  correo: string
  whatsapp: string
  notas: string
  created_at: string
}

// ==============================
// OPORTUNIDAD (moves through pipeline)
// ==============================
export interface Oportunidad {
  id: string
  empresa_id: string
  contacto_id: string
  etapa: Etapa
  valor_estimado: number
  valor_cotizado: number
  valor_adjudicado: number
  cotizador_asignado: string
  fuente_lead: FuenteLead
  motivo_perdida: string
  ubicacion: string
  fecha_ingreso: string
  fecha_envio?: string | null
  fecha_adjudicacion?: string
  fecha_ultimo_contacto: string
  notas: string
  created_at: string
}

// ==============================
// HISTORIAL ETAPA
// ==============================
export interface HistorialEtapa {
  id: string
  oportunidad_id: string
  etapa_anterior: string
  etapa_nueva: string
  created_at: string
}

// ==============================
// PRODUCTO (linked to oportunidad)
// ==============================

/** Generic product snapshot — saved when adding product to order */
export interface ProductoSnapshot {
  producto_id: string
  variables: Record<string, number | string | boolean>
  lineas_apu: Array<{
    nombre: string
    seccion: string
    cantidad: number
    cantidad_override?: number
    precio_unitario: number
    precio_override?: number
    total: number
    material_codigo?: string
  }>
  totales: {
    insumos: number
    mo: number
    transporte: number
    laser: number
    poliza: number
    costo_total: number
    margen: number
    precio_venta: number
  }
  descripcion_comercial: string
  version_fecha: string
}

/** Detect if a configuracion object is legacy (ConfigMesa) or new (ProductoSnapshot) */
export function isProductoSnapshot(cfg: Record<string, any>): cfg is ProductoSnapshot {
  return 'producto_id' in cfg && 'lineas_apu' in cfg
}

export interface ProductoCliente {
  id: string
  oportunidad_id: string
  categoria: string
  subtipo: string
  configuracion: Record<string, any>  // ProductoSnapshot (new) or ConfigMesa (legacy)
  apu_resultado?: ApuResultado
  precio_calculado?: number
  descripcion_comercial?: string
  cantidad: number
  archivo_apu_url?: string | null
  archivo_apu_nombre?: string | null
  archivo_pdf_url?: string | null
  archivo_pdf_nombre?: string | null
  imagen_render?: string | null
}

// ==============================
// MESA CONFIGURATION
// ==============================
export interface ConfigMesa {
  largo: number
  ancho: number
  alto: number
  tipo_acero: '304' | '430'
  acabado: 'mate' | 'satinado' | 'brillante'
  calibre: string
  refuerzo: 'omegas' | 'rh_15mm'
  ancho_omegas: number
  salp_long: number
  salp_lat: number
  alto_salp: number
  babero: boolean
  alto_babero: number
  babero_costados: number
  entrepaños: number
  patas: number
  ruedas: boolean
  tipo_rueda: string
  cant_ruedas: number
  tipo_nivelador: string
  pozuelos_rect: number
  pozuelo_dims: { largo: number; ancho: number; alto: number }[]
  pozuelos_redondos: number
  escabiladero: boolean
  bandejeros: number
  vertederos: number
  diam_vertedero: number
  prof_vertedero: number
  push_pedal: boolean
  poliza: boolean
  instalado: boolean
  margen: number
}

export interface ApuLinea {
  descripcion: string
  material: string
  cantidad: number
  unidad: string
  precio_unitario: number
  desperdicio: number
  total: number
}

export interface ApuResultado {
  lineas: ApuLinea[]
  costo_insumos: number
  costo_mo: number
  costo_transporte: number
  costo_laser: number
  costo_poliza: number
  costo_total: number
  precio_venta: number
  precio_comercial: number
  margen: number
  descripcion_comercial: string
}

// ==============================
// COTIZACION
// ==============================
export interface CotizacionProducto {
  descripcion: string
  cantidad: number
  precio_unitario: number
  unidad?: string
  /**
   * Imagen adjunta al producto en la cotización (D-07).
   * Data URL base64 (image/jpeg o image/png) — se usa directamente en el PDF
   * vía doc.addImage(), y se persiste en el snapshot de la cotización.
   */
  imagen_url?: string | null
  /** Storage path en bucket `archivos-oportunidades` (persistencia durable). */
  imagen_storage_path?: string | null
}

export interface Cotizacion {
  id: string
  oportunidad_id: string
  numero: string
  fecha: string
  estado: 'borrador' | 'enviada' | 'aprobada' | 'rechazada' | 'descartada'
  total: number
  fecha_envio?: string
  // Editor fields (optional, populated when editing)
  productos_snapshot?: CotizacionProducto[]
  tiempoEntrega?: string
  incluyeTransporte?: boolean
  condicionesItems?: string[]
  noIncluyeItems?: string[]
  // Adjuntos por cotización (M10) — storage path + filename original
  archivo_apu_url?: string | null
  archivo_apu_nombre?: string | null
  archivo_pdf_url?: string | null
  archivo_pdf_nombre?: string | null
}

// ==============================
// PRECIOS MAESTROS
// ==============================
export interface PrecioMaestro {
  id: string
  grupo: string
  subgrupo: string
  nombre: string
  codigo: string
  unidad: string
  precio: number
  proveedor: string
  updated_at: string
}

// ==============================
// DEFAULTS
// ==============================
export const CONFIG_MESA_DEFAULT: ConfigMesa = {
  largo: 2.0, ancho: 0.7, alto: 0.9,
  tipo_acero: '304', acabado: 'mate', calibre: 'cal_18',
  refuerzo: 'omegas', ancho_omegas: 0.15,
  salp_long: 0, salp_lat: 0, alto_salp: 0.10,
  babero: false, alto_babero: 0.25, babero_costados: 0,
  entrepaños: 1, patas: 4,
  ruedas: false, tipo_rueda: 'inox_3_freno', cant_ruedas: 4, tipo_nivelador: 'inox_cuadrado',
  pozuelos_rect: 0, pozuelo_dims: [], pozuelos_redondos: 0,
  escabiladero: false, bandejeros: 3,
  vertederos: 0, diam_vertedero: 0.45, prof_vertedero: 0.50,
  push_pedal: false, poliza: false, instalado: true, margen: 0.38,
}

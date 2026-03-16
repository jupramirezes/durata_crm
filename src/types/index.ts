// ==============================
// ETAPAS (7 stages pipeline)
// ==============================
export type Etapa = 'nuevo_lead' | 'en_cotizacion' | 'cotizacion_enviada' | 'en_seguimiento' | 'en_negociacion' | 'adjudicada' | 'perdida'

export const ETAPAS: { key: Etapa; label: string; color: string }[] = [
  { key: 'nuevo_lead', label: 'Nuevo Lead', color: '#3b82f6' },
  { key: 'en_cotizacion', label: 'En Cotización', color: '#a855f7' },
  { key: 'cotizacion_enviada', label: 'Cotización Enviada', color: '#06b6d4' },
  { key: 'en_seguimiento', label: 'En Seguimiento', color: '#eab308' },
  { key: 'en_negociacion', label: 'En Negociación', color: '#f97316' },
  { key: 'adjudicada', label: 'Adjudicada', color: '#22c55e' },
  { key: 'perdida', label: 'Perdida', color: '#ef4444' },
]

// ==============================
// CONSTANTS
// ==============================
export const SECTORES = ['Alimentos', 'Salud', 'Construcción', 'Industrial', 'Sector Público', 'Persona Natural', 'Otro'] as const
export type Sector = typeof SECTORES[number]

export const COTIZADORES = [
  { id: 'OC', nombre: 'Omar Cossio', iniciales: 'O.C' },
  { id: 'SA', nombre: 'Sebastián Aguirre', iniciales: 'S.A' },
  { id: 'JPR', nombre: 'Juan Pablo Ramírez', iniciales: 'J.R' },
  { id: 'CA', nombre: 'Camilo Araque', iniciales: 'C.A' },
] as const

export const FUENTES_LEAD = ['WhatsApp', 'Correo', 'Llamada', 'Referido', 'Licitación', 'Web', 'Otro'] as const
export type FuenteLead = typeof FUENTES_LEAD[number]

export const MOTIVOS_PERDIDA = ['Precio', 'Tiempo de entrega', 'Eligió competencia', 'Cambió de alcance', 'Sin respuesta', 'Presupuesto cancelado', 'Otro'] as const
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
export interface ProductoCliente {
  id: string
  oportunidad_id: string
  categoria: string
  subtipo: string
  configuracion: ConfigMesa
  apu_resultado?: ApuResultado
  precio_calculado?: number
  descripcion_comercial?: string
  cantidad: number
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
}

export interface Cotizacion {
  id: string
  oportunidad_id: string
  numero: string
  fecha: string
  estado: 'borrador' | 'enviada' | 'aprobada' | 'rechazada'
  total: number
  fecha_envio?: string
  // Editor fields (optional, populated when editing)
  productos_snapshot?: CotizacionProducto[]
  tiempoEntrega?: string
  incluyeTransporte?: boolean
  condicionesItems?: string[]
  noIncluyeItems?: string[]
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

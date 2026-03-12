export type Etapa = 'lead_entrante' | 'en_cotizacion' | 'seguimiento' | 'en_negociacion' | 'cerrado' | 'perdido'

export const ETAPAS: { key: Etapa; label: string; color: string }[] = [
  { key: 'lead_entrante', label: 'Lead Entrante', color: '#3b82f6' },
  { key: 'en_cotizacion', label: 'En Cotización', color: '#a855f7' },
  { key: 'seguimiento', label: 'Seguimiento', color: '#eab308' },
  { key: 'en_negociacion', label: 'En Negociación', color: '#f97316' },
  { key: 'cerrado', label: 'Cerrado (Ganado)', color: '#22c55e' },
  { key: 'perdido', label: 'Perdido', color: '#ef4444' },
]

export interface Cliente {
  id: string
  nombre: string
  nit: string
  empresa: string
  ubicacion: string
  correo: string
  whatsapp: string
  etapa: Etapa
  notas: string
  fecha_ingreso: string
  created_at?: string
}

export interface HistorialEtapa {
  id: string
  cliente_id: string
  etapa_anterior: string
  etapa_nueva: string
  created_at: string
}

export interface ProductoCliente {
  id: string
  cliente_id: string
  categoria: string
  subtipo: string
  configuracion: ConfigMesa
  apu_resultado?: ApuResultado
  precio_calculado?: number
  descripcion_comercial?: string
  cantidad: number
}

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

export interface CotizacionProducto {
  descripcion: string
  cantidad: number
  precio_unitario: number
}

export interface Cotizacion {
  id: string
  cliente_id: string
  numero: string
  fecha: string
  estado: 'borrador' | 'enviada' | 'aprobada' | 'rechazada'
  total: number
  cliente?: Cliente
  // Editor fields (optional, populated when editing)
  productos_snapshot?: CotizacionProducto[]
  tiempoEntrega?: string
  incluyeTransporte?: boolean
  condicionesItems?: string[]
  noIncluyeItems?: string[]
}

export interface PrecioMaestro {
  id: string
  grupo: string
  nombre: string
  codigo: string
  unidad: string
  precio: number
  proveedor: string
  updated_at: string
}

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

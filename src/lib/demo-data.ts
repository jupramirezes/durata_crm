import { Empresa, Contacto, Oportunidad, PrecioMaestro, Etapa } from '../types'

export const DEMO_PRECIOS: PrecioMaestro[] = [
  { id: '1', grupo: 'INOX', nombre: 'LAMINA LISA ACERO INOXIDABLE 304 MATE CAL 18', codigo: 'AILA010118', unidad: 'm\u00b2', precio: 98964, proveedor: 'WESCO', updated_at: '2025-11-06' },
  { id: '2', grupo: 'INOX', nombre: 'LAMINA LISA ACERO INOXIDABLE 304 MATE CAL 20', codigo: 'AILA010120', unidad: 'm\u00b2', precio: 74442, proveedor: 'WESCO', updated_at: '2025-11-06' },
  { id: '3', grupo: 'INOX', nombre: 'LAMINA LISA ACERO INOXIDABLE 304 MATE CAL 16', codigo: 'AILA010116', unidad: 'm\u00b2', precio: 125544, proveedor: 'WESCO', updated_at: '2025-11-06' },
  { id: '4', grupo: 'INOX', nombre: 'LAMINA LISA ACERO INOXIDABLE 304 MATE CAL 14', codigo: 'AILA010114', unidad: 'm\u00b2', precio: 159683, proveedor: 'WESCO', updated_at: '2025-11-06' },
  { id: '5', grupo: 'INOX', nombre: 'LAMINA LISA ACERO INOXIDABLE 304 MATE CAL 12', codigo: 'AILA010112', unidad: 'm\u00b2', precio: 213247, proveedor: 'WESCO', updated_at: '2025-11-06' },
  { id: '6', grupo: 'INOX', nombre: 'LAMINA LISA ACERO INOXIDABLE 304 SATINADO CAL 20', codigo: 'AILA010220', unidad: 'm\u00b2', precio: 82521, proveedor: 'WESCO', updated_at: '2025-11-06' },
  { id: '7', grupo: 'INOX', nombre: 'LAMINA LISA ACERO INOXIDABLE 304 SATINADO CAL 18', codigo: 'AILA010218', unidad: 'm\u00b2', precio: 97872, proveedor: 'WESCO', updated_at: '2025-11-06' },
  { id: '8', grupo: 'INOX', nombre: 'LAMINA LISA ACERO INOXIDABLE 430 BRILLANTE CAL 18', codigo: 'AILA020318', unidad: 'm\u00b2', precio: 79249, proveedor: 'WESCO', updated_at: '2025-06-16' },
  { id: '9', grupo: 'INOX', nombre: 'LAMINA LISA ACERO INOXIDABLE 430 SATINADO CAL 18', codigo: 'AILA020218', unidad: 'm\u00b2', precio: 68164, proveedor: 'WESCO', updated_at: '2025-06-16' },
  { id: '10', grupo: 'INOX', nombre: 'TUBO ACERO INOXIDABLE CUADRADO 1 1/2" CAL 16', codigo: 'AITC180016', unidad: 'ml', precio: 19775, proveedor: 'WESCO', updated_at: '2025-11-06' },
  { id: '11', grupo: 'INOX', nombre: 'NIVELADOR NACIONAL INOX CUADRADO 1 1/2"', codigo: 'FENI010118', unidad: 'und', precio: 23344, proveedor: 'RAMIREZ', updated_at: '2025-11-06' },
  { id: '12', grupo: 'INOX', nombre: 'NIVELADOR NACIONAL PLASTICO CUADRADO 1 1/2"', codigo: 'FENI010119', unidad: 'und', precio: 8400, proveedor: 'RAMIREZ', updated_at: '2025-11-06' },
  { id: '13', grupo: 'INOX', nombre: 'RUEDAS INOX CON FRENO 3"', codigo: 'FERU010121', unidad: 'und', precio: 57035, proveedor: 'ANT. RODACHINES', updated_at: '2025-11-06' },
  { id: '14', grupo: 'INOX', nombre: 'RUEDAS INOX SIN FRENO 3"', codigo: 'FERU010221', unidad: 'und', precio: 43605, proveedor: 'ANT. RODACHINES', updated_at: '2025-11-06' },
  { id: '15', grupo: 'INOX', nombre: 'RUEDAS INOX CON FRENO 2"', codigo: 'FERU010119', unidad: 'und', precio: 33680, proveedor: 'ANT. RODACHINES', updated_at: '2025-11-06' },
  { id: '16', grupo: 'INOX', nombre: 'RUEDAS INOX CON FRENO 4"', codigo: 'FERU010123', unidad: 'und', precio: 182218, proveedor: 'IMSA', updated_at: '2025-11-06' },
  { id: '17', grupo: 'INOX', nombre: 'POZUELO INOX REDONDO 37', codigo: 'FEPO010137', unidad: 'und', precio: 127500, proveedor: 'RAMIREZ', updated_at: '2025-11-06' },
  { id: '18', grupo: 'INOX', nombre: 'ANGULO ACERO INOXIDABLE 1 1/2" x 1/8"', codigo: 'AIAG03002', unidad: 'ml', precio: 21380, proveedor: 'WESCO', updated_at: '2025-11-06' },
  { id: '19', grupo: 'INOX', nombre: 'DISCOS CORTE 4 1/2"', codigo: 'ABDI100124', unidad: 'und', precio: 1483, proveedor: 'VARIOS', updated_at: '2025-11-06' },
  { id: '20', grupo: 'INOX', nombre: 'DISCOS FLAP INOX 4 1/2" GRANO 60', codigo: 'ABDI802060', unidad: 'und', precio: 21073, proveedor: 'VARIOS', updated_at: '2025-11-06' },
  { id: '21', grupo: 'INOX', nombre: 'PA\u00d1O SCOTCH BRITE 3M', codigo: 'ABPA020001', unidad: 'und', precio: 5644, proveedor: 'VARIOS', updated_at: '2025-11-06' },
  { id: '22', grupo: 'INOX', nombre: 'LIJA ZC INOX GRANO 80', codigo: 'ABLI202080', unidad: 'und', precio: 2777, proveedor: 'VARIOS', updated_at: '2025-11-06' },
  { id: '23', grupo: 'INOX', nombre: 'GRATA ALAMBRE INOX 2"', codigo: 'ABGR200019', unidad: 'und', precio: 5443, proveedor: 'VARIOS', updated_at: '2025-11-06' },
  { id: '24', grupo: 'OTROS', nombre: 'MADERA RH AGLOMERADO 15 MM', codigo: 'FEOM090015', unidad: 'm\u00b2', precio: 39119, proveedor: 'VARIOS', updated_at: '2025-11-06' },
  { id: '25', grupo: 'OTROS', nombre: 'PEGA PL 285', codigo: 'FEOM120100', unidad: 'gl', precio: 38886, proveedor: 'VARIOS', updated_at: '2025-11-06' },
]

// ID counters
let empresaIdCounter = 5
let contactoIdCounter = 5
let oportunidadIdCounter = 5
export function nextEmpresaId() { return String(++empresaIdCounter) }
export function nextContactoId() { return String(++contactoIdCounter) }
export function nextOportunidadId() { return String(++oportunidadIdCounter) }

export const DEMO_EMPRESAS: Empresa[] = [
  { id: '1', nombre: 'Restaurante El Sabor', nit: '900.123.456-7', direccion: 'Medell\u00edn, El Poblado', sector: 'Alimentos', notas: '', created_at: '2026-01-01' },
  { id: '2', nombre: 'Hotel Palma Real', nit: '800.456.789-1', direccion: 'Cartagena, Bocagrande', sector: 'Alimentos', notas: '', created_at: '2026-01-01' },
  { id: '3', nombre: 'Cocinas Industriales del Valle', nit: '901.789.012-3', direccion: 'Cali, Centro', sector: 'Industrial', notas: '', created_at: '2026-01-01' },
  { id: '4', nombre: 'Club Social Laureles', nit: '900.321.654-8', direccion: 'Medell\u00edn, Laureles', sector: 'Alimentos', notas: '', created_at: '2026-01-01' },
  { id: '5', nombre: 'Catering Express', nit: '800.654.987-2', direccion: 'Envigado', sector: 'Alimentos', notas: '', created_at: '2026-01-01' },
]

export const DEMO_CONTACTOS: Contacto[] = [
  { id: '1', empresa_id: '1', nombre: 'Mar\u00eda Garc\u00eda', cargo: 'Gerente', correo: 'maria@elsabor.co', whatsapp: '+573001234567', notas: '', created_at: '2026-01-01' },
  { id: '2', empresa_id: '2', nombre: 'Carlos P\u00e9rez', cargo: 'Director de Operaciones', correo: 'carlos@palmareal.co', whatsapp: '+573109876543', notas: '', created_at: '2026-01-01' },
  { id: '3', empresa_id: '3', nombre: 'Ana Rodr\u00edguez', cargo: 'Jefe de Compras', correo: 'ana@cocinasv.co', whatsapp: '+573207654321', notas: '', created_at: '2026-01-01' },
  { id: '4', empresa_id: '4', nombre: 'Roberto Mej\u00eda', cargo: 'Administrador', correo: 'roberto@clublaureles.co', whatsapp: '+573154567890', notas: '', created_at: '2026-01-01' },
  { id: '5', empresa_id: '5', nombre: 'Patricia V\u00e9lez', cargo: 'Gerente General', correo: 'patricia@cateringexp.co', whatsapp: '+573178901234', notas: '', created_at: '2026-01-01' },
]

export const DEMO_OPORTUNIDADES: Oportunidad[] = [
  { id: '1', empresa_id: '1', contacto_id: '1', etapa: 'nuevo_lead' as Etapa, valor_estimado: 4500000, valor_cotizado: 0, valor_adjudicado: 0, cotizador_asignado: 'OC', fuente_lead: 'WhatsApp', motivo_perdida: '', ubicacion: 'Medell\u00edn, El Poblado', fecha_ingreso: '2026-03-05', fecha_ultimo_contacto: '2026-03-05', notas: 'Interesada en mesas para cocina nueva', created_at: '2026-03-05' },
  { id: '2', empresa_id: '2', contacto_id: '2', etapa: 'en_cotizacion' as Etapa, valor_estimado: 18000000, valor_cotizado: 0, valor_adjudicado: 0, cotizador_asignado: 'SA', fuente_lead: 'Correo', motivo_perdida: '', ubicacion: 'Cartagena, Bocagrande', fecha_ingreso: '2026-02-20', fecha_ultimo_contacto: '2026-03-01', notas: 'Proyecto de remodelaci\u00f3n cocina industrial. 8 mesas + pozuelos.', created_at: '2026-02-20' },
  { id: '3', empresa_id: '3', contacto_id: '3', etapa: 'en_negociacion' as Etapa, valor_estimado: 25000000, valor_cotizado: 22000000, valor_adjudicado: 0, cotizador_asignado: 'JPR', fuente_lead: 'Licitaci\u00f3n', motivo_perdida: '', ubicacion: 'Cali, Centro', fecha_ingreso: '2026-01-15', fecha_ultimo_contacto: '2026-02-28', notas: 'Pidi\u00f3 descuento del 5% en pedido de 12 mesas', created_at: '2026-01-15' },
  { id: '4', empresa_id: '4', contacto_id: '4', etapa: 'adjudicada' as Etapa, valor_estimado: 9000000, valor_cotizado: 8500000, valor_adjudicado: 8200000, cotizador_asignado: 'OC', fuente_lead: 'Referido', motivo_perdida: '', ubicacion: 'Medell\u00edn, Laureles', fecha_ingreso: '2026-01-02', fecha_ultimo_contacto: '2026-02-15', notas: 'Pedido confirmado: 3 mesas con escabiladero', created_at: '2026-01-02' },
  { id: '5', empresa_id: '5', contacto_id: '5', etapa: 'perdida' as Etapa, valor_estimado: 6000000, valor_cotizado: 5800000, valor_adjudicado: 0, cotizador_asignado: 'CA', fuente_lead: 'WhatsApp', motivo_perdida: 'Precio', ubicacion: 'Envigado', fecha_ingreso: '2025-12-10', fecha_ultimo_contacto: '2026-01-20', notas: 'Eligi\u00f3 otro proveedor por precio', created_at: '2025-12-10' },
]

import { Cliente, PrecioMaestro, Etapa } from '../types'

export const DEMO_PRECIOS: PrecioMaestro[] = [
  { id: '1', grupo: 'INOX', nombre: 'LAMINA LISA ACERO INOXIDABLE 304 MATE CAL 18', codigo: 'AILA010118', unidad: 'm²', precio: 98964, proveedor: 'WESCO', updated_at: '2025-11-06' },
  { id: '2', grupo: 'INOX', nombre: 'LAMINA LISA ACERO INOXIDABLE 304 MATE CAL 20', codigo: 'AILA010120', unidad: 'm²', precio: 74442, proveedor: 'WESCO', updated_at: '2025-11-06' },
  { id: '3', grupo: 'INOX', nombre: 'LAMINA LISA ACERO INOXIDABLE 304 MATE CAL 16', codigo: 'AILA010116', unidad: 'm²', precio: 125544, proveedor: 'WESCO', updated_at: '2025-11-06' },
  { id: '4', grupo: 'INOX', nombre: 'LAMINA LISA ACERO INOXIDABLE 304 MATE CAL 14', codigo: 'AILA010114', unidad: 'm²', precio: 159683, proveedor: 'WESCO', updated_at: '2025-11-06' },
  { id: '5', grupo: 'INOX', nombre: 'LAMINA LISA ACERO INOXIDABLE 304 MATE CAL 12', codigo: 'AILA010112', unidad: 'm²', precio: 213247, proveedor: 'WESCO', updated_at: '2025-11-06' },
  { id: '6', grupo: 'INOX', nombre: 'LAMINA LISA ACERO INOXIDABLE 304 SATINADO CAL 20', codigo: 'AILA010220', unidad: 'm²', precio: 82521, proveedor: 'WESCO', updated_at: '2025-11-06' },
  { id: '7', grupo: 'INOX', nombre: 'LAMINA LISA ACERO INOXIDABLE 304 SATINADO CAL 18', codigo: 'AILA010218', unidad: 'm²', precio: 97872, proveedor: 'WESCO', updated_at: '2025-11-06' },
  { id: '8', grupo: 'INOX', nombre: 'LAMINA LISA ACERO INOXIDABLE 430 BRILLANTE CAL 18', codigo: 'AILA020318', unidad: 'm²', precio: 79249, proveedor: 'WESCO', updated_at: '2025-06-16' },
  { id: '9', grupo: 'INOX', nombre: 'LAMINA LISA ACERO INOXIDABLE 430 SATINADO CAL 18', codigo: 'AILA020218', unidad: 'm²', precio: 68164, proveedor: 'WESCO', updated_at: '2025-06-16' },
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
  { id: '21', grupo: 'INOX', nombre: 'PAÑO SCOTCH BRITE 3M', codigo: 'ABPA020001', unidad: 'und', precio: 5644, proveedor: 'VARIOS', updated_at: '2025-11-06' },
  { id: '22', grupo: 'INOX', nombre: 'LIJA ZC INOX GRANO 80', codigo: 'ABLI202080', unidad: 'und', precio: 2777, proveedor: 'VARIOS', updated_at: '2025-11-06' },
  { id: '23', grupo: 'INOX', nombre: 'GRATA ALAMBRE INOX 2"', codigo: 'ABGR200019', unidad: 'und', precio: 5443, proveedor: 'VARIOS', updated_at: '2025-11-06' },
  { id: '24', grupo: 'OTROS', nombre: 'MADERA RH AGLOMERADO 15 MM', codigo: 'FEOM090015', unidad: 'm²', precio: 39119, proveedor: 'VARIOS', updated_at: '2025-11-06' },
  { id: '25', grupo: 'OTROS', nombre: 'PEGA PL 285', codigo: 'FEOM120100', unidad: 'gl', precio: 38886, proveedor: 'VARIOS', updated_at: '2025-11-06' },
]

let clienteIdCounter = 5
export function nextClienteId() { return String(++clienteIdCounter) }

export const DEMO_CLIENTES: Cliente[] = [
  { id: '1', nombre: 'María García', nit: '900.123.456-7', empresa: 'Restaurante El Sabor', ubicacion: 'Medellín, El Poblado', correo: 'maria@elsabor.co', whatsapp: '+573001234567', etapa: 'lead_entrante' as Etapa, notas: 'Interesada en mesas para cocina nueva', fecha_ingreso: '2026-03-05' },
  { id: '2', nombre: 'Carlos Pérez', nit: '800.456.789-1', empresa: 'Hotel Palma Real', ubicacion: 'Cartagena, Bocagrande', correo: 'carlos@palmareal.co', whatsapp: '+573109876543', etapa: 'en_cotizacion' as Etapa, notas: 'Proyecto de remodelación cocina industrial. 8 mesas + pozuelos.', fecha_ingreso: '2026-02-20' },
  { id: '3', nombre: 'Ana Rodríguez', nit: '901.789.012-3', empresa: 'Cocinas Industriales del Valle', ubicacion: 'Cali, Centro', correo: 'ana@cocinasv.co', whatsapp: '+573207654321', etapa: 'en_negociacion' as Etapa, notas: 'Pidió descuento del 5% en pedido de 12 mesas', fecha_ingreso: '2026-01-15' },
  { id: '4', nombre: 'Roberto Mejía', nit: '900.321.654-8', empresa: 'Club Social Laureles', ubicacion: 'Medellín, Laureles', correo: 'roberto@clublaureles.co', whatsapp: '+573154567890', etapa: 'cerrado' as Etapa, notas: 'Pedido confirmado: 3 mesas con escabiladero', fecha_ingreso: '2026-01-02' },
  { id: '5', nombre: 'Patricia Vélez', nit: '800.654.987-2', empresa: 'Catering Express', ubicacion: 'Envigado', correo: 'patricia@cateringexp.co', whatsapp: '+573178901234', etapa: 'perdido' as Etapa, notas: 'Eligió otro proveedor por precio', fecha_ingreso: '2025-12-10' },
]

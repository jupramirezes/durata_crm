import { Empresa, Contacto, Oportunidad, PrecioMaestro, Etapa } from '../types'

// Stable UUIDs for demo data (so Supabase uuid columns accept them)
const DEMO_IDS = {
  emp1: '00000001-0001-4000-8000-000000000001',
  emp2: '00000001-0001-4000-8000-000000000002',
  emp3: '00000001-0001-4000-8000-000000000003',
  emp4: '00000001-0001-4000-8000-000000000004',
  emp5: '00000001-0001-4000-8000-000000000005',
  con1: '00000002-0002-4000-8000-000000000001',
  con2: '00000002-0002-4000-8000-000000000002',
  con3: '00000002-0002-4000-8000-000000000003',
  con4: '00000002-0002-4000-8000-000000000004',
  con5: '00000002-0002-4000-8000-000000000005',
  opp1: '00000003-0003-4000-8000-000000000001',
  opp2: '00000003-0003-4000-8000-000000000002',
  opp3: '00000003-0003-4000-8000-000000000003',
  opp4: '00000003-0003-4000-8000-000000000004',
  opp5: '00000003-0003-4000-8000-000000000005',
}

export const DEMO_PRECIOS: PrecioMaestro[] = [
  { id: '00000004-0004-4000-8000-000000000001', grupo: 'INOX', nombre: 'LAMINA LISA ACERO INOXIDABLE 304 MATE CAL 18', codigo: 'AILA010118', unidad: 'm²', precio: 98964, proveedor: 'WESCO', updated_at: '2025-11-06' },
  { id: '00000004-0004-4000-8000-000000000002', grupo: 'INOX', nombre: 'LAMINA LISA ACERO INOXIDABLE 304 MATE CAL 20', codigo: 'AILA010120', unidad: 'm²', precio: 74442, proveedor: 'WESCO', updated_at: '2025-11-06' },
  { id: '00000004-0004-4000-8000-000000000003', grupo: 'INOX', nombre: 'LAMINA LISA ACERO INOXIDABLE 304 MATE CAL 16', codigo: 'AILA010116', unidad: 'm²', precio: 125544, proveedor: 'WESCO', updated_at: '2025-11-06' },
  { id: '00000004-0004-4000-8000-000000000004', grupo: 'INOX', nombre: 'LAMINA LISA ACERO INOXIDABLE 304 MATE CAL 14', codigo: 'AILA010114', unidad: 'm²', precio: 159683, proveedor: 'WESCO', updated_at: '2025-11-06' },
  { id: '00000004-0004-4000-8000-000000000005', grupo: 'INOX', nombre: 'LAMINA LISA ACERO INOXIDABLE 304 MATE CAL 12', codigo: 'AILA010112', unidad: 'm²', precio: 213247, proveedor: 'WESCO', updated_at: '2025-11-06' },
  { id: '00000004-0004-4000-8000-000000000006', grupo: 'INOX', nombre: 'LAMINA LISA ACERO INOXIDABLE 304 SATINADO CAL 20', codigo: 'AILA010220', unidad: 'm²', precio: 82521, proveedor: 'WESCO', updated_at: '2025-11-06' },
  { id: '00000004-0004-4000-8000-000000000007', grupo: 'INOX', nombre: 'LAMINA LISA ACERO INOXIDABLE 304 SATINADO CAL 18', codigo: 'AILA010218', unidad: 'm²', precio: 97872, proveedor: 'WESCO', updated_at: '2025-11-06' },
  { id: '00000004-0004-4000-8000-000000000008', grupo: 'INOX', nombre: 'LAMINA LISA ACERO INOXIDABLE 430 BRILLANTE CAL 18', codigo: 'AILA020318', unidad: 'm²', precio: 79249, proveedor: 'WESCO', updated_at: '2025-06-16' },
  { id: '00000004-0004-4000-8000-000000000009', grupo: 'INOX', nombre: 'LAMINA LISA ACERO INOXIDABLE 430 SATINADO CAL 18', codigo: 'AILA020218', unidad: 'm²', precio: 68164, proveedor: 'WESCO', updated_at: '2025-06-16' },
  { id: '00000004-0004-4000-8000-000000000010', grupo: 'INOX', nombre: 'TUBO ACERO INOXIDABLE CUADRADO 1 1/2" CAL 16', codigo: 'AITC180016', unidad: 'ml', precio: 19775, proveedor: 'WESCO', updated_at: '2025-11-06' },
  { id: '00000004-0004-4000-8000-000000000011', grupo: 'INOX', nombre: 'NIVELADOR NACIONAL INOX CUADRADO 1 1/2"', codigo: 'FENI010118', unidad: 'und', precio: 23344, proveedor: 'RAMIREZ', updated_at: '2025-11-06' },
  { id: '00000004-0004-4000-8000-000000000012', grupo: 'INOX', nombre: 'NIVELADOR NACIONAL PLASTICO CUADRADO 1 1/2"', codigo: 'FENI010119', unidad: 'und', precio: 8400, proveedor: 'RAMIREZ', updated_at: '2025-11-06' },
  { id: '00000004-0004-4000-8000-000000000013', grupo: 'INOX', nombre: 'RUEDAS INOX CON FRENO 3"', codigo: 'FERU010121', unidad: 'und', precio: 57035, proveedor: 'ANT. RODACHINES', updated_at: '2025-11-06' },
  { id: '00000004-0004-4000-8000-000000000014', grupo: 'INOX', nombre: 'RUEDAS INOX SIN FRENO 3"', codigo: 'FERU010221', unidad: 'und', precio: 43605, proveedor: 'ANT. RODACHINES', updated_at: '2025-11-06' },
  { id: '00000004-0004-4000-8000-000000000015', grupo: 'INOX', nombre: 'RUEDAS INOX CON FRENO 2"', codigo: 'FERU010119', unidad: 'und', precio: 33680, proveedor: 'ANT. RODACHINES', updated_at: '2025-11-06' },
  { id: '00000004-0004-4000-8000-000000000016', grupo: 'INOX', nombre: 'RUEDAS INOX CON FRENO 4"', codigo: 'FERU010123', unidad: 'und', precio: 182218, proveedor: 'IMSA', updated_at: '2025-11-06' },
  { id: '00000004-0004-4000-8000-000000000017', grupo: 'INOX', nombre: 'POZUELO INOX REDONDO 37', codigo: 'FEPO010137', unidad: 'und', precio: 127500, proveedor: 'RAMIREZ', updated_at: '2025-11-06' },
  { id: '00000004-0004-4000-8000-000000000018', grupo: 'INOX', nombre: 'ANGULO ACERO INOXIDABLE 1 1/2" x 1/8"', codigo: 'AIAG03002', unidad: 'ml', precio: 21380, proveedor: 'WESCO', updated_at: '2025-11-06' },
  { id: '00000004-0004-4000-8000-000000000019', grupo: 'INOX', nombre: 'DISCOS CORTE 4 1/2"', codigo: 'ABDI100124', unidad: 'und', precio: 1483, proveedor: 'VARIOS', updated_at: '2025-11-06' },
  { id: '00000004-0004-4000-8000-000000000020', grupo: 'INOX', nombre: 'DISCOS FLAP INOX 4 1/2" GRANO 60', codigo: 'ABDI802060', unidad: 'und', precio: 21073, proveedor: 'VARIOS', updated_at: '2025-11-06' },
  { id: '00000004-0004-4000-8000-000000000021', grupo: 'INOX', nombre: 'PAÑO SCOTCH BRITE 3M', codigo: 'ABPA020001', unidad: 'und', precio: 5644, proveedor: 'VARIOS', updated_at: '2025-11-06' },
  { id: '00000004-0004-4000-8000-000000000022', grupo: 'INOX', nombre: 'LIJA ZC INOX GRANO 80', codigo: 'ABLI202080', unidad: 'und', precio: 2777, proveedor: 'VARIOS', updated_at: '2025-11-06' },
  { id: '00000004-0004-4000-8000-000000000023', grupo: 'INOX', nombre: 'GRATA ALAMBRE INOX 2"', codigo: 'ABGR200019', unidad: 'und', precio: 5443, proveedor: 'VARIOS', updated_at: '2025-11-06' },
  { id: '00000004-0004-4000-8000-000000000024', grupo: 'OTROS', nombre: 'MADERA RH AGLOMERADO 15 MM', codigo: 'FEOM090015', unidad: 'm²', precio: 39119, proveedor: 'VARIOS', updated_at: '2025-11-06' },
  { id: '00000004-0004-4000-8000-000000000025', grupo: 'OTROS', nombre: 'PEGA PL 285', codigo: 'FEOM120100', unidad: 'gl', precio: 38886, proveedor: 'VARIOS', updated_at: '2025-11-06' },
]

// ID generation now uses UUID
export function nextEmpresaId() { return crypto.randomUUID() }
export function nextContactoId() { return crypto.randomUUID() }
export function nextOportunidadId() { return crypto.randomUUID() }

export const DEMO_EMPRESAS: Empresa[] = [
  { id: DEMO_IDS.emp1, nombre: 'Restaurante El Sabor', nit: '900.123.456-7', direccion: 'Medellín, El Poblado', sector: 'Alimentos', notas: '', created_at: '2026-01-01' },
  { id: DEMO_IDS.emp2, nombre: 'Hotel Palma Real', nit: '800.456.789-1', direccion: 'Cartagena, Bocagrande', sector: 'Alimentos', notas: '', created_at: '2026-01-01' },
  { id: DEMO_IDS.emp3, nombre: 'Cocinas Industriales del Valle', nit: '901.789.012-3', direccion: 'Cali, Centro', sector: 'Industrial', notas: '', created_at: '2026-01-01' },
  { id: DEMO_IDS.emp4, nombre: 'Club Social Laureles', nit: '900.321.654-8', direccion: 'Medellín, Laureles', sector: 'Alimentos', notas: '', created_at: '2026-01-01' },
  { id: DEMO_IDS.emp5, nombre: 'Catering Express', nit: '800.654.987-2', direccion: 'Envigado', sector: 'Alimentos', notas: '', created_at: '2026-01-01' },
]

export const DEMO_CONTACTOS: Contacto[] = [
  { id: DEMO_IDS.con1, empresa_id: DEMO_IDS.emp1, nombre: 'María García', cargo: 'Gerente', correo: 'maria@elsabor.co', whatsapp: '+573001234567', notas: '', created_at: '2026-01-01' },
  { id: DEMO_IDS.con2, empresa_id: DEMO_IDS.emp2, nombre: 'Carlos Pérez', cargo: 'Director de Operaciones', correo: 'carlos@palmareal.co', whatsapp: '+573109876543', notas: '', created_at: '2026-01-01' },
  { id: DEMO_IDS.con3, empresa_id: DEMO_IDS.emp3, nombre: 'Ana Rodríguez', cargo: 'Jefe de Compras', correo: 'ana@cocinasv.co', whatsapp: '+573207654321', notas: '', created_at: '2026-01-01' },
  { id: DEMO_IDS.con4, empresa_id: DEMO_IDS.emp4, nombre: 'Roberto Mejía', cargo: 'Administrador', correo: 'roberto@clublaureles.co', whatsapp: '+573154567890', notas: '', created_at: '2026-01-01' },
  { id: DEMO_IDS.con5, empresa_id: DEMO_IDS.emp5, nombre: 'Patricia Vélez', cargo: 'Gerente General', correo: 'patricia@cateringexp.co', whatsapp: '+573178901234', notas: '', created_at: '2026-01-01' },
]

export const DEMO_OPORTUNIDADES: Oportunidad[] = [
  { id: DEMO_IDS.opp1, empresa_id: DEMO_IDS.emp1, contacto_id: DEMO_IDS.con1, etapa: 'nuevo_lead' as Etapa, valor_estimado: 4500000, valor_cotizado: 0, valor_adjudicado: 0, cotizador_asignado: 'OC', fuente_lead: 'WhatsApp', motivo_perdida: '', ubicacion: 'Medellín, El Poblado', fecha_ingreso: '2026-03-05', fecha_ultimo_contacto: '2026-03-05', notas: 'Interesada en mesas para cocina nueva', created_at: '2026-03-05' },
  { id: DEMO_IDS.opp2, empresa_id: DEMO_IDS.emp2, contacto_id: DEMO_IDS.con2, etapa: 'en_cotizacion' as Etapa, valor_estimado: 18000000, valor_cotizado: 0, valor_adjudicado: 0, cotizador_asignado: 'SA', fuente_lead: 'Correo', motivo_perdida: '', ubicacion: 'Cartagena, Bocagrande', fecha_ingreso: '2026-02-20', fecha_ultimo_contacto: '2026-03-01', notas: 'Proyecto de remodelación cocina industrial. 8 mesas + pozuelos.', created_at: '2026-02-20' },
  { id: DEMO_IDS.opp3, empresa_id: DEMO_IDS.emp3, contacto_id: DEMO_IDS.con3, etapa: 'en_negociacion' as Etapa, valor_estimado: 25000000, valor_cotizado: 22000000, valor_adjudicado: 0, cotizador_asignado: 'JPR', fuente_lead: 'Licitación', motivo_perdida: '', ubicacion: 'Cali, Centro', fecha_ingreso: '2026-01-15', fecha_ultimo_contacto: '2026-02-28', notas: 'Pidió descuento del 5% en pedido de 12 mesas', created_at: '2026-01-15' },
  { id: DEMO_IDS.opp4, empresa_id: DEMO_IDS.emp4, contacto_id: DEMO_IDS.con4, etapa: 'adjudicada' as Etapa, valor_estimado: 9000000, valor_cotizado: 8500000, valor_adjudicado: 8200000, cotizador_asignado: 'OC', fuente_lead: 'Referido', motivo_perdida: '', ubicacion: 'Medellín, Laureles', fecha_ingreso: '2026-01-02', fecha_ultimo_contacto: '2026-02-15', notas: 'Pedido confirmado: 3 mesas con escabiladero', created_at: '2026-01-02' },
  { id: DEMO_IDS.opp5, empresa_id: DEMO_IDS.emp5, contacto_id: DEMO_IDS.con5, etapa: 'perdida' as Etapa, valor_estimado: 6000000, valor_cotizado: 5800000, valor_adjudicado: 0, cotizador_asignado: 'CA', fuente_lead: 'WhatsApp', motivo_perdida: 'Precio', ubicacion: 'Envigado', fecha_ingreso: '2025-12-10', fecha_ultimo_contacto: '2026-01-20', notas: 'Eligió otro proveedor por precio', created_at: '2025-12-10' },
]

/**
 * fixtures-productos.ts — Test fixtures for verifying APU calculations
 *
 * Each fixture contains:
 * - producto_id: matches productos_catalogo.id
 * - nombre: human-readable test name
 * - materiales: MaterialTemplate[] — from producto_materiales
 * - lineas: LineaAPU[] — from producto_lineas_apu
 * - tarifasMO: Record<string, number> — from tarifas_mo_producto
 * - variables: Variables — user config with defaults
 * - esperado: expected output values
 * - tolerancia: acceptable difference in COP pesos
 *
 * These fixtures replicate the seed data from supabase/seed-productos.sql
 * so tests can run without network access.
 */

import type { Variables, MaterialTemplate, LineaAPU } from '../evaluar-formula'

export interface ProductoFixture {
  producto_id: string
  nombre: string
  materiales: MaterialTemplate[]
  lineas: LineaAPU[]
  tarifasMO: Record<string, number>
  variables: Variables
  margen: number
  esperado: {
    /** Approximate expected sale price (precioVenta = costoTotal / (1 - margen)) */
    precioVenta: number
    /** Optional sub-totals for detailed verification */
    totalInsumos?: number
    totalMO?: number
    totalTransporte?: number
    totalLaser?: number
  }
  tolerancia: number
}

/* ══════════════════════════════════════════════════════════ */
/* MESA — 2.00 × 0.70 × 0.90, cal 18, 1 entrepaño, margen 38% */
/* ══════════════════════════════════════════════════════════ */

const MESA_MATERIALES: MaterialTemplate[] = [
  { alias: 'lamina_mesa', template_nombre: 'LAMINA LISA ACERO INOXIDABLE {tipo_acero} {acabado} CAL {calibre}', es_fijo: false, codigo: 'AILA010118' },
  { alias: 'lamina_babero', template_nombre: 'LAMINA LISA ACERO INOXIDABLE {tipo_acero} SATINADO CAL 20', es_fijo: false, codigo: 'AILA010220' },
  { alias: 'lamina_pozuelo', template_nombre: 'LAMINA LISA ACERO INOXIDABLE {tipo_acero} {acabado} CAL {calibre}', es_fijo: false, codigo: 'AILA010118' },
  { alias: 'lamina_vertedero', template_nombre: 'LAMINA LISA ACERO INOXIDABLE {tipo_acero} {acabado} CAL 16', es_fijo: false, codigo: 'AILA010116' },
  { alias: 'tubo_patas', template_nombre: 'TUBO ACERO INOXIDABLE CUADRADO 1 1/2 CAL 16', es_fijo: false, codigo: 'AITC180016' },
  { alias: 'niveladores', template_nombre: 'NIVELADOR NACIONAL INOX CUADRADO 1 1/2', es_fijo: false, codigo: 'FENI010118' },
  { alias: 'pozuelo_redondo', template_nombre: 'POZUELO INOX REDONDO 37', es_fijo: false, codigo: 'FEPO010137' },
  { alias: 'rh_15mm', template_nombre: 'MADERA RH AGLOMERADO 15 MM', es_fijo: false, codigo: 'FEOM090015' },
  { alias: 'tornillos', template_nombre: 'TORNILLO INOX AVELLANADO 12 X 2', es_fijo: false },
  { alias: 'cinta_3m', template_nombre: 'CINTA 3M ACERO', es_fijo: false },
  { alias: 'pl285', template_nombre: 'PEGA PL 285', es_fijo: false, codigo: 'FEOM120100' },
  { alias: 'tubo_vertedero', template_nombre: 'TUBO ACERO INOXIDABLE CUADRADO 3 CAL 16', es_fijo: false },
  { alias: 'disco_corte', template_nombre: 'DISCOS CORTE 4 1/2', es_fijo: false, codigo: 'ABDI100124' },
  { alias: 'disco_flap', template_nombre: 'DISCOS FLAP INOX 4 1/2 GRANO 60', es_fijo: false, codigo: 'ABDI802060' },
  { alias: 'pano', template_nombre: 'PAÑO SCOTCH BRITE 3M', es_fijo: false, codigo: 'ABPA020001' },
  { alias: 'lija', template_nombre: 'LIJA ZC INOX GRANO 80', es_fijo: false, codigo: 'ABLI202080' },
  { alias: 'grata', template_nombre: 'GRATA ALAMBRE INOX 2', es_fijo: false, codigo: 'ABGR200019' },
  { alias: 'angulo_escab', template_nombre: 'ANGULO ACERO INOXIDABLE 1 1/2 x 1/8', es_fijo: false, codigo: 'AIAG03002' },
  { alias: 'ruedas_3', template_nombre: 'RUEDAS INOX CON FRENO 3', es_fijo: false, codigo: 'FERU010121' },
  { alias: 'argon', template_nombre: 'ARGÓN', es_fijo: true, precio_fijo: 4000 },
  { alias: 'empaque', template_nombre: 'EMPAQUE', es_fijo: true, precio_fijo: 3500 },
  { alias: 'platina_ruedas', template_nombre: 'PLATINA RUEDAS', es_fijo: true, precio_fijo: 12270 },
  { alias: 'laser', template_nombre: 'CORTE LÁSER', es_fijo: true, precio_fijo: 6500 },
  { alias: 'tte_elementos', template_nombre: 'TRANSPORTE ELEMENTOS', es_fijo: true, precio_fijo: 15000 },
  { alias: 'tte_regreso', template_nombre: 'TRANSPORTE REGRESO', es_fijo: true, precio_fijo: 5000 },
  { alias: 'push_pedal_item', template_nombre: 'PUSH PEDAL', es_fijo: true, precio_fijo: 348000 },
  { alias: 'grifo', template_nombre: 'GRIFO', es_fijo: true, precio_fijo: 74000 },
  { alias: 'canastilla', template_nombre: 'CANASTILLA', es_fijo: true, precio_fijo: 24000 },
]

const MESA_LINEAS: LineaAPU[] = [
  { seccion: 'insumos', orden: 1, descripcion: 'Acero mesa', material_alias: 'lamina_mesa', formula_cantidad: '(largo+0.12)*(ancho+0.12)+((alto_salpicadero+0.04)*salp_longitudinal*largo+(alto_salpicadero+0.04)*salp_costado*ancho)', desperdicio: 0 },
  { seccion: 'insumos', orden: 2, descripcion: 'Omegas mesa', material_alias: 'lamina_mesa', formula_cantidad: '(1 - refuerzo_rh) * (desarrollo_omegas*largo*ceil(ancho/0.6) + desarrollo_omegas*ancho*(ceil(largo/2) + 2*(pozuelos_rect+pozuelo_redondo)) + 0.078*(salp_longitudinal*largo+salp_costado*ancho))', desperdicio: 0 },
  { seccion: 'insumos', orden: 3, descripcion: 'Entrepaño', material_alias: 'lamina_mesa', formula_cantidad: '(largo+0.12)*(ancho+0.12)*entrepanos', desperdicio: 0, condicion: 'entrepanos > 0' },
  { seccion: 'insumos', orden: 4, descripcion: 'Babero', material_alias: 'lamina_babero', formula_cantidad: '(alto_babero+0.06)*(largo+0.06)*babero + (ancho+0.06)*(alto_babero+0.06)*babero_costados', desperdicio: 0, condicion: 'babero == 1' },
  { seccion: 'insumos', orden: 5, descripcion: 'Pozuelo rect', material_alias: 'lamina_pozuelo', formula_cantidad: '((poz_largo+poz_alto*2)*poz_ancho + poz_largo*poz_alto*2) * pozuelos_rect', desperdicio: 0.10, condicion: 'pozuelos_rect > 0' },
  { seccion: 'insumos', orden: 6, descripcion: 'Pozuelo redondo', material_alias: 'pozuelo_redondo', formula_cantidad: 'pozuelo_redondo', desperdicio: 0, condicion: 'pozuelo_redondo > 0' },
  { seccion: 'insumos', orden: 7, descripcion: 'Omegas entrepaño', material_alias: 'lamina_mesa', formula_cantidad: '(desarrollo_omegas*largo*ceil(ancho/0.6) + desarrollo_omegas*ancho*ceil(largo/2)) * entrepanos', desperdicio: 0, condicion: 'entrepanos > 0' },
  { seccion: 'insumos', orden: 8, descripcion: 'Patas', material_alias: 'tubo_patas', formula_cantidad: 'patas*alto + (1 - min(entrepanos, 1))*(largo + ancho*patas/2)', desperdicio: 0.10 },
  { seccion: 'insumos', orden: 9, descripcion: 'Niveladores', material_alias: 'niveladores', formula_cantidad: 'patas', desperdicio: 0, condicion: 'ruedas == 0' },
  { seccion: 'insumos', orden: 10, descripcion: 'Cinta 3M', material_alias: 'cinta_3m', formula_cantidad: 'ceil(((largo*ceil(ancho/0.6) + ancho*(ceil(largo/2) + 2*(pozuelos_rect+pozuelo_redondo))) + (largo*ceil(ancho/0.6) + ancho*ceil(largo/2))*entrepanos) * 2 / metros_rollo_cinta)', desperdicio: 0, condicion: 'refuerzo_rh == 0' },
  { seccion: 'insumos', orden: 11, descripcion: 'Argón', material_alias: 'argon', formula_cantidad: 'largo + largo*entrepanos + patas/4 + pozuelos_rect + pozuelo_redondo + vertedero*4', desperdicio: 0 },
  { seccion: 'insumos', orden: 12, descripcion: 'Disco corte', material_alias: 'disco_corte', formula_cantidad: '(largo + largo*entrepanos + patas/4 + pozuelos_rect + pozuelo_redondo + vertedero*4) / 3', desperdicio: 0 },
  { seccion: 'insumos', orden: 13, descripcion: 'Disco flap', material_alias: 'disco_flap', formula_cantidad: '(largo + largo*entrepanos + patas/4 + pozuelos_rect + pozuelo_redondo + vertedero*4) / 8', desperdicio: 0 },
  { seccion: 'insumos', orden: 14, descripcion: 'Paño', material_alias: 'pano', formula_cantidad: '(largo + largo*entrepanos + patas/4 + pozuelos_rect + pozuelo_redondo + vertedero*4) / 3', desperdicio: 0 },
  { seccion: 'insumos', orden: 15, descripcion: 'Lija', material_alias: 'lija', formula_cantidad: '(largo + largo*entrepanos + patas/4 + pozuelos_rect + pozuelo_redondo + vertedero*4) / 4', desperdicio: 0 },
  { seccion: 'insumos', orden: 16, descripcion: 'Grata', material_alias: 'grata', formula_cantidad: '(largo + largo*entrepanos + patas/4 + pozuelos_rect + pozuelo_redondo + vertedero*4) / 30', desperdicio: 0 },
  { seccion: 'insumos', orden: 17, descripcion: 'Empaque', material_alias: 'empaque', formula_cantidad: 'largo', desperdicio: 0 },
  { seccion: 'mo', orden: 1, descripcion: 'MO Acero', material_alias: 'MO_ACERO', formula_cantidad: 'largo + pozuelos_rect + pozuelo_redondo + entrepanos*largo + (escabiladero)*(ancho*2)', desperdicio: 0 },
  { seccion: 'mo', orden: 2, descripcion: 'MO Pulido', material_alias: 'MO_PULIDO', formula_cantidad: 'largo + pozuelos_rect + pozuelo_redondo + entrepanos*largo + (escabiladero)*(ancho*2)', desperdicio: 0 },
  { seccion: 'mo', orden: 3, descripcion: 'MO Patas', material_alias: 'MO_PATAS', formula_cantidad: 'patas', desperdicio: 0 },
  { seccion: 'mo', orden: 4, descripcion: 'MO Instalación', material_alias: 'MO_INSTALACION', formula_cantidad: 'largo', desperdicio: 0, condicion: 'instalado == 1' },
  { seccion: 'transporte', orden: 1, descripcion: 'TTE Elementos', material_alias: 'tte_elementos', formula_cantidad: 'max(largo, 1)', desperdicio: 0 },
  { seccion: 'transporte', orden: 2, descripcion: 'TTE Regreso', material_alias: 'tte_regreso', formula_cantidad: 'max(largo, 1)', desperdicio: 0 },
  { seccion: 'laser', orden: 1, descripcion: 'Corte láser', material_alias: 'laser', formula_cantidad: 'ceil(largo + pozuelos_rect + pozuelo_redondo + vertedero + largo*entrepanos)', desperdicio: 0 },
]

const MESA_TARIFAS_MO: Record<string, number> = {
  MO_ACERO: 30000, MO_PULIDO: 23000, MO_PATAS: 10000, MO_INSTALACION: 22200,
}

/* ══════════════════════════════════════════════════════════ */
/* CÁRCAMO — 1.00 × 0.25 × 0.095, cal cuerpo 18, tapa 12   */
/* ══════════════════════════════════════════════════════════ */

const CARCAMO_MATERIALES: MaterialTemplate[] = [
  { alias: 'lamina_cuerpo', template_nombre: 'LAMINA ACERO CAL {calibre_cuerpo}', es_fijo: false, codigo: 'AILA0101{calibre_cuerpo}' },
  { alias: 'lamina_tapa', template_nombre: 'LAMINA ACERO CAL {calibre_tapa}', es_fijo: false, codigo: 'AILA0101{calibre_tapa}' },
  { alias: 'tubo_desague', template_nombre: 'TUBO 2" DESAGÜE', es_fijo: false, codigo: 'AITO020016' },
  { alias: 'granada_lam', template_nombre: 'GRANADA LÁMINA CAL 20', es_fijo: false, codigo: 'AILA010120' },
  { alias: 'disco_corte', template_nombre: 'DISCOS CORTE 4 1/2', es_fijo: false, codigo: 'ABDI100124' },
  { alias: 'disco_flap', template_nombre: 'DISCOS FLAP INOX', es_fijo: false, codigo: 'ABDI802060' },
  { alias: 'pano', template_nombre: 'PAÑO SCOTCH BRITE', es_fijo: false, codigo: 'ABPA020001' },
  { alias: 'lija', template_nombre: 'LIJA ZC', es_fijo: false, codigo: 'ABLI202080' },
  { alias: 'grata', template_nombre: 'GRATA', es_fijo: false, codigo: 'ABGR200019' },
  { alias: 'argon_carc', template_nombre: 'ARGÓN CÁRCAMO', es_fijo: true, precio_fijo: 8000 },
  { alias: 'empaque_carc', template_nombre: 'EMPAQUE CÁRCAMO', es_fijo: true, precio_fijo: 1500 },
  { alias: 'tornillo_carc', template_nombre: 'TORNILLOS CÁRCAMO', es_fijo: true, precio_fijo: 850 },
  { alias: 'mo_sold_carc', template_nombre: 'MO SOLDADURA', es_fijo: true, precio_fijo: 62000 },
  { alias: 'mo_pulido_carc', template_nombre: 'MO PULIDO', es_fijo: true, precio_fijo: 25000 },
  { alias: 'mo_instal_carc', template_nombre: 'MO INSTALACIÓN', es_fijo: true, precio_fijo: 11500 },
  { alias: 'mo_punz_carc', template_nombre: 'MO PUNZONADO', es_fijo: true, precio_fijo: 97900 },
  { alias: 'mo_dobles_carc', template_nombre: 'MO DOBLES', es_fijo: true, precio_fijo: 1800 },
  { alias: 'tte_elem_carc', template_nombre: 'TTE ELEMENTOS', es_fijo: true, precio_fijo: 30000 },
  { alias: 'tte_pers_ida', template_nombre: 'TTE PERSONAL IDA', es_fijo: true, precio_fijo: 15000 },
  { alias: 'tte_pers_reg', template_nombre: 'TTE PERSONAL REGRESO', es_fijo: true, precio_fijo: 15000 },
  { alias: 'laser_carc', template_nombre: 'PROCESO LÁSER', es_fijo: true, precio_fijo: 6500 },
]

const CARCAMO_LINEAS: LineaAPU[] = [
  { seccion: 'insumos', orden: 1, descripcion: 'Acero Cuerpo', material_alias: 'lamina_cuerpo', formula_cantidad: '(largo*alto*2)+(ancho*alto*2)+(largo*ancho)', desperdicio: 0 },
  { seccion: 'insumos', orden: 2, descripcion: 'Acero Tapa', material_alias: 'lamina_tapa', formula_cantidad: '(largo+0.04)*(ancho+0.04)', desperdicio: 0 },
  { seccion: 'insumos', orden: 3, descripcion: 'Tubo 2" Desagüe', material_alias: 'tubo_desague', formula_cantidad: 'largo_desague', desperdicio: 0 },
  { seccion: 'insumos', orden: 4, descripcion: 'Granada lámina cal 20', material_alias: 'granada_lam', formula_cantidad: '2*3.1416*0.038*0.1', desperdicio: 0 },
  { seccion: 'insumos', orden: 5, descripcion: 'Argón', material_alias: 'argon_carc', formula_cantidad: 'largo', desperdicio: 0 },
  { seccion: 'insumos', orden: 6, descripcion: 'Disco de corte', material_alias: 'disco_corte', formula_cantidad: 'largo/3', desperdicio: 0 },
  { seccion: 'insumos', orden: 7, descripcion: 'Disco flap', material_alias: 'disco_flap', formula_cantidad: 'largo/6', desperdicio: 0 },
  { seccion: 'insumos', orden: 8, descripcion: 'Paño Scotch Brite', material_alias: 'pano', formula_cantidad: 'largo/3', desperdicio: 0 },
  { seccion: 'insumos', orden: 9, descripcion: 'Lija zirconio', material_alias: 'lija', formula_cantidad: 'largo/4', desperdicio: 0 },
  { seccion: 'insumos', orden: 10, descripcion: 'Grata', material_alias: 'grata', formula_cantidad: 'largo/25', desperdicio: 0 },
  { seccion: 'insumos', orden: 11, descripcion: 'Empaque', material_alias: 'empaque_carc', formula_cantidad: 'largo', desperdicio: 0 },
  { seccion: 'insumos', orden: 12, descripcion: 'Tornillos', material_alias: 'tornillo_carc', formula_cantidad: 'largo*4', desperdicio: 0 },
  { seccion: 'mo', orden: 13, descripcion: 'MO Soldadura', material_alias: 'mo_sold_carc', formula_cantidad: 'largo', desperdicio: 0 },
  { seccion: 'mo', orden: 14, descripcion: 'MO Pulido', material_alias: 'mo_pulido_carc', formula_cantidad: 'largo', desperdicio: 0 },
  { seccion: 'mo', orden: 15, descripcion: 'MO Instalación', material_alias: 'mo_instal_carc', formula_cantidad: 'instalacion * largo', desperdicio: 0, condicion: 'instalacion == 1' },
  { seccion: 'mo', orden: 16, descripcion: 'MO Punzonado', material_alias: 'mo_punz_carc', formula_cantidad: 'largo*ancho', desperdicio: 0 },
  { seccion: 'mo', orden: 17, descripcion: 'MO Dobles', material_alias: 'mo_dobles_carc', formula_cantidad: '8', desperdicio: 0 },
  { seccion: 'transporte', orden: 18, descripcion: 'TTE Elementos', material_alias: 'tte_elem_carc', formula_cantidad: 'largo', desperdicio: 0 },
  { seccion: 'transporte', orden: 19, descripcion: 'TTE Personal Ida', material_alias: 'tte_pers_ida', formula_cantidad: 'largo', desperdicio: 0 },
  { seccion: 'transporte', orden: 20, descripcion: 'TTE Personal Regreso', material_alias: 'tte_pers_reg', formula_cantidad: 'largo', desperdicio: 0 },
  { seccion: 'laser', orden: 21, descripcion: 'Proceso láser', material_alias: 'laser_carc', formula_cantidad: 'largo*6', desperdicio: 0 },
]

/* ══════════════════════════════════════════════════════════ */
/* ESTANTERÍA GRADUABLE — 2.00 × 0.65 × 1.80, 5 entrepaños  */
/* ══════════════════════════════════════════════════════════ */

const EST_MATERIALES: MaterialTemplate[] = [
  { alias: 'lamina_entrep', template_nombre: 'LÁMINA ENTREPAÑO CAL {calibre_entrepano}', es_fijo: false, codigo: 'AILA0101{calibre_entrepano}' },
  { alias: 'lamina_patas', template_nombre: 'LÁMINA PATAS CAL {calibre_patas}', es_fijo: false, codigo: 'AILA0101{calibre_patas}' },
  { alias: 'lamina_omegas', template_nombre: 'LÁMINA OMEGAS CAL 18', es_fijo: false, codigo: 'AILA010118' },
  { alias: 'niveladores_est', template_nombre: 'NIVELADORES', es_fijo: false, codigo: 'FENI010118' },
  { alias: 'disco_corte_est', template_nombre: 'DISCOS CORTE', es_fijo: false, codigo: 'ABDI100124' },
  { alias: 'disco_flap_est', template_nombre: 'DISCOS FLAP', es_fijo: false, codigo: 'ABDI802060' },
  { alias: 'pano_est', template_nombre: 'PAÑO SCOTCH BRITE', es_fijo: false, codigo: 'ABPA020001' },
  { alias: 'lija_est', template_nombre: 'LIJA ZC', es_fijo: false, codigo: 'ABLI202080' },
  { alias: 'grata_est', template_nombre: 'GRATA', es_fijo: false, codigo: 'ABGR200019' },
  { alias: 'tornillo_est', template_nombre: 'TORNILLOS EST', es_fijo: true, precio_fijo: 800 },
  { alias: 'cinta_est', template_nombre: 'CINTA EST', es_fijo: true, precio_fijo: 11500 },
  { alias: 'argon_est', template_nombre: 'ARGÓN EST', es_fijo: true, precio_fijo: 4500 },
  { alias: 'empaque_est', template_nombre: 'EMPAQUE EST', es_fijo: true, precio_fijo: 8000 },
  { alias: 'mo_acero_est', template_nombre: 'MO ACERO', es_fijo: true, precio_fijo: 31080 },
  { alias: 'mo_pulido_est', template_nombre: 'MO PULIDO', es_fijo: true, precio_fijo: 12765 },
  { alias: 'mo_parales_est', template_nombre: 'MO PULIDA PARALES', es_fijo: true, precio_fijo: 24420 },
  { alias: 'mo_ensamble_est', template_nombre: 'MO ENSAMBLE', es_fijo: true, precio_fijo: 29970 },
  { alias: 'mo_instal_est', template_nombre: 'MO INSTALACIÓN', es_fijo: true, precio_fijo: 16650 },
  { alias: 'tte_elem_est', template_nombre: 'TTE ELEMENTOS', es_fijo: true, precio_fijo: 35000 },
  { alias: 'tte_reg_est', template_nombre: 'TTE REGRESO', es_fijo: true, precio_fijo: 10000 },
  { alias: 'laser_est', template_nombre: 'LÁSER PARALES', es_fijo: true, precio_fijo: 6500 },
]

const EST_LINEAS: LineaAPU[] = [
  { seccion: 'insumos', orden: 1, descripcion: 'Acero Entrepaño', material_alias: 'lamina_entrep', formula_cantidad: '(largo+0.13)*(ancho+0.13)*num_entrepanos', desperdicio: 0 },
  { seccion: 'insumos', orden: 2, descripcion: 'Acero Patas', material_alias: 'lamina_patas', formula_cantidad: 'alto*num_patas*0.13', desperdicio: 0 },
  { seccion: 'insumos', orden: 3, descripcion: 'Omegas', material_alias: 'lamina_omegas', formula_cantidad: '0.2*largo*num_entrepanos + 0.15*ancho*2*num_entrepanos', desperdicio: 0 },
  { seccion: 'insumos', orden: 4, descripcion: 'Niveladores', material_alias: 'niveladores_est', formula_cantidad: 'num_patas', desperdicio: 0 },
  { seccion: 'insumos', orden: 5, descripcion: 'Tornillos', material_alias: 'tornillo_est', formula_cantidad: '8*num_entrepanos', desperdicio: 0 },
  { seccion: 'insumos', orden: 6, descripcion: 'Cinta', material_alias: 'cinta_est', formula_cantidad: 'largo*num_entrepanos + ancho*num_entrepanos', desperdicio: 0 },
  { seccion: 'insumos', orden: 7, descripcion: 'Argón', material_alias: 'argon_est', formula_cantidad: 'largo*num_entrepanos', desperdicio: 0 },
  { seccion: 'insumos', orden: 8, descripcion: 'Disco de corte', material_alias: 'disco_corte_est', formula_cantidad: 'largo*num_entrepanos/4', desperdicio: 0 },
  { seccion: 'insumos', orden: 9, descripcion: 'Disco flap', material_alias: 'disco_flap_est', formula_cantidad: 'largo*num_entrepanos/4', desperdicio: 0 },
  { seccion: 'insumos', orden: 10, descripcion: 'Paño', material_alias: 'pano_est', formula_cantidad: 'largo*num_entrepanos/3', desperdicio: 0 },
  { seccion: 'insumos', orden: 11, descripcion: 'Lija zirconio', material_alias: 'lija_est', formula_cantidad: 'largo*num_entrepanos/3', desperdicio: 0 },
  { seccion: 'insumos', orden: 12, descripcion: 'Grata', material_alias: 'grata_est', formula_cantidad: 'largo*num_entrepanos/10', desperdicio: 0 },
  { seccion: 'insumos', orden: 13, descripcion: 'Empaque', material_alias: 'empaque_est', formula_cantidad: 'largo/1.5', desperdicio: 0 },
  { seccion: 'mo', orden: 14, descripcion: 'MO Acero', material_alias: 'mo_acero_est', formula_cantidad: 'largo*num_entrepanos', desperdicio: 0 },
  { seccion: 'mo', orden: 15, descripcion: 'MO Pulido', material_alias: 'mo_pulido_est', formula_cantidad: 'largo*num_entrepanos', desperdicio: 0 },
  { seccion: 'mo', orden: 16, descripcion: 'MO Pulida parales', material_alias: 'mo_parales_est', formula_cantidad: 'num_patas', desperdicio: 0 },
  { seccion: 'mo', orden: 17, descripcion: 'MO Ensamble', material_alias: 'mo_ensamble_est', formula_cantidad: '1', desperdicio: 0 },
  { seccion: 'mo', orden: 18, descripcion: 'MO Instalación', material_alias: 'mo_instal_est', formula_cantidad: 'instalacion * largo', desperdicio: 0, condicion: 'instalacion == 1' },
  { seccion: 'transporte', orden: 19, descripcion: 'TTE Elementos', material_alias: 'tte_elem_est', formula_cantidad: 'largo', desperdicio: 0 },
  { seccion: 'transporte', orden: 20, descripcion: 'TTE Regreso', material_alias: 'tte_reg_est', formula_cantidad: 'largo', desperdicio: 0 },
  { seccion: 'laser', orden: 21, descripcion: 'Láser parales', material_alias: 'laser_est', formula_cantidad: 'num_patas*alto*2 + num_entrepanos', desperdicio: 0 },
]

/* ══════════════════════════════════════════════════════════ */
/* EXPORTED FIXTURES                                         */
/* ══════════════════════════════════════════════════════════ */

export const FIXTURES_PRODUCTOS: ProductoFixture[] = [
  {
    producto_id: 'mesa',
    nombre: 'Mesa base 200x70x90, cal 18, 1 entrepaño',
    materiales: MESA_MATERIALES,
    lineas: MESA_LINEAS,
    tarifasMO: MESA_TARIFAS_MO,
    variables: {
      largo: 2, ancho: 0.7, alto: 0.9,
      tipo_acero: '304', acabado: 'MATE', calibre: '18',
      desarrollo_omegas: 0.15,
      salp_longitudinal: 0, salp_costado: 0, alto_salpicadero: 0.10,
      babero: 0, alto_babero: 0.25, babero_costados: 0,
      refuerzo_rh: 0,
      entrepanos: 1, patas: 4,
      ruedas: 0, num_ruedas: 4,
      pozuelos_rect: 0, poz_largo: 0.54, poz_ancho: 0.39, poz_alto: 0.18,
      pozuelo_redondo: 0,
      escabiladero: 0, cant_bandejeros: 3,
      vertedero: 0, diametro_vertedero: 0.45, prof_vertedero: 0.50,
      poliza: 0, instalado: 1, push_pedal: 0,
      tornillos_por_m: 4, pl285_m2_galon: 4, metros_rollo_cinta: 32,
    },
    margen: 0.38,
    esperado: {
      precioVenta: 2074000,
      totalMO: 296400,
      totalTransporte: 40000,
      totalLaser: 26000,
    },
    tolerancia: 400000, // DEMO_PRECIOS lacks cinta_3m, tornillos — wider tolerance; with real precios <1%
  },
  {
    producto_id: 'carcamo',
    nombre: 'Cárcamo base 1x0.25x0.095',
    materiales: CARCAMO_MATERIALES,
    lineas: CARCAMO_LINEAS,
    tarifasMO: {},  // Cárcamo uses es_fijo materials for MO, no tarifas_mo_producto
    variables: {
      largo: 1, ancho: 0.25, alto: 0.095,
      calibre_cuerpo: '18', calibre_tapa: '12',
      largo_desague: 0.2,
      instalacion: 0, poliza: 0,
    },
    margen: 0.38,
    esperado: {
      precioVenta: 587000,
    },
    tolerancia: 50000,
  },
  {
    producto_id: 'estanteria_graduable',
    nombre: 'Estantería 2x0.65x1.8, 5 entrepaños',
    materiales: EST_MATERIALES,
    lineas: EST_LINEAS,
    tarifasMO: {},  // Estantería uses es_fijo materials for MO
    variables: {
      largo: 2, ancho: 0.65, alto: 1.8,
      num_entrepanos: 5, num_patas: 4,
      calibre_entrepano: '18', calibre_patas: '12',
      instalacion: 0, poliza: 0,
    },
    margen: 0.38,
    esperado: {
      precioVenta: 4068000,
    },
    tolerancia: 500000,
  },
]

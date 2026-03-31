/**
 * seed-productos-nuevos.ts — Seeds Cárcamo and Estantería Graduable
 * into the generic CPQ engine tables.
 *
 * Usage: npx tsx scripts/seed-productos-nuevos.ts
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envText = readFileSync(resolve(__dirname, '../.env'), 'utf-8')
const env: Record<string, string> = {}
for (const line of envText.split('\n')) {
  const m = line.match(/^([^=]+)=(.*)$/)
  if (m) env[m[1].trim()] = m[2].trim()
}
const sb = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY'])

// Helper to insert and log
async function insert(table: string, row: Record<string, unknown>) {
  const { error } = await sb.from(table).insert(row)
  if (error) console.error(`  ✗ ${table}: ${error.message}`)
}

async function main() {
  console.log('=== SEED PRODUCTOS NUEVOS ===\n')

  const { error: authErr } = await sb.auth.signInWithPassword({
    email: env['MIGRATION_AUTH_EMAIL'] || 'saguirre@durata.co',
    password: env['MIGRATION_AUTH_PASS'] || 'Durata2026!',
  })
  if (authErr) { console.error('Auth failed:', authErr.message); process.exit(1) }

  // Clean existing data
  for (const pid of ['carcamo', 'estanteria_graduable']) {
    await sb.from('producto_lineas_apu').delete().eq('producto_id', pid)
    await sb.from('producto_materiales').delete().eq('producto_id', pid)
    await sb.from('producto_variables').delete().eq('producto_id', pid)
    await sb.from('tarifas_mo_producto').delete().eq('producto_id', pid)
    await sb.from('productos_catalogo').delete().eq('id', pid)
  }
  console.log('Limpiado datos existentes.\n')

  // ═══════════════════════════════════════════
  // CÁRCAMO
  // ═══════════════════════════════════════════
  console.log('── CÁRCAMO ──')
  await insert('productos_catalogo', { id: 'carcamo', nombre: 'Cárcamo', grupo: 'Cárcamos', margen_default: 0.38, activo: true, orden: 3 })

  // Variables
  const carcVars = [
    { nombre: 'largo', label: 'Largo (m)', tipo: 'numero', default_valor: '1', min_val: 0.3, max_val: 3, unidad: 'm', grupo_ui: 'Dimensiones principales', orden: 10 },
    { nombre: 'ancho', label: 'Ancho (m)', tipo: 'numero', default_valor: '0.25', min_val: 0.15, max_val: 1, unidad: 'm', grupo_ui: 'Dimensiones principales', orden: 11 },
    { nombre: 'alto', label: 'Alto (m)', tipo: 'numero', default_valor: '0.095', min_val: 0.05, max_val: 0.5, unidad: 'm', grupo_ui: 'Dimensiones principales', orden: 12 },
    { nombre: 'calibre_cuerpo', label: 'Calibre cuerpo', tipo: 'seleccion', default_valor: '18', grupo_ui: 'Material', orden: 20, opciones: ['18', '16'] },
    { nombre: 'calibre_tapa', label: 'Calibre tapa', tipo: 'seleccion', default_valor: '12', grupo_ui: 'Material', orden: 21, opciones: ['12', '14'] },
    { nombre: 'largo_desague', label: 'Largo desagüe (m)', tipo: 'numero', default_valor: '0.2', min_val: 0.1, max_val: 1, unidad: 'm', grupo_ui: 'Desagüe', orden: 30 },
    { nombre: 'instalacion', label: 'Incluir instalación', tipo: 'toggle', default_valor: '0', grupo_ui: 'Extras', orden: 90 },
    { nombre: 'poliza', label: 'Incluir póliza', tipo: 'toggle', default_valor: '0', grupo_ui: 'Extras', orden: 91 },
  ]
  for (const v of carcVars) await insert('producto_variables', { producto_id: 'carcamo', ...v, opciones: v.opciones ?? null })
  console.log(`  ${carcVars.length} variables`)

  // Materials (code-based lookups for láminas + fixed prices)
  const carcMats = [
    { alias: 'lamina_cuerpo', template_nombre: 'LAMINA ACERO CAL {calibre_cuerpo}', codigo: 'AILA0101{calibre_cuerpo}' },
    { alias: 'lamina_tapa', template_nombre: 'LAMINA ACERO CAL {calibre_tapa}', codigo: 'AILA0101{calibre_tapa}' },
    { alias: 'tubo_desague', template_nombre: 'TUBO 2" DESAGÜE', codigo: 'AITO020016' },
    { alias: 'granada_lam', template_nombre: 'GRANADA LÁMINA CAL 20', codigo: 'AILA010120' },
    { alias: 'disco_corte', template_nombre: 'DISCOS CORTE 4 1/2', codigo: 'ABDI100124' },
    { alias: 'disco_flap', template_nombre: 'DISCOS FLAP INOX', codigo: 'ABDI802060' },
    { alias: 'pano', template_nombre: 'PAÑO SCOTCH BRITE', codigo: 'ABPA020001' },
    { alias: 'lija', template_nombre: 'LIJA ZC', codigo: 'ABLI202080' },
    { alias: 'grata', template_nombre: 'GRATA', codigo: 'ABGR200019' },
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
  for (const m of carcMats) await insert('producto_materiales', { producto_id: 'carcamo', alias: m.alias, template_nombre: m.template_nombre, es_fijo: m.es_fijo || false, precio_fijo: m.precio_fijo ?? null, codigo: m.codigo ?? null })
  console.log(`  ${carcMats.length} materiales`)

  // APU Lines
  const carcLineas = [
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
  for (const l of carcLineas) await insert('producto_lineas_apu', { producto_id: 'carcamo', ...l, condicion: l.condicion ?? null })
  console.log(`  ${carcLineas.length} líneas APU`)

  // ═══════════════════════════════════════════
  // ESTANTERÍA GRADUABLE
  // ═══════════════════════════════════════════
  console.log('\n── ESTANTERÍA GRADUABLE ──')
  await insert('productos_catalogo', { id: 'estanteria_graduable', nombre: 'Estantería Graduable', grupo: 'Estanterías', margen_default: 0.38, activo: true, orden: 4 })

  const estVars = [
    { nombre: 'largo', label: 'Largo (m)', tipo: 'numero', default_valor: '2', min_val: 0.5, max_val: 3, unidad: 'm', grupo_ui: 'Dimensiones principales', orden: 10 },
    { nombre: 'ancho', label: 'Ancho (m)', tipo: 'numero', default_valor: '0.65', min_val: 0.3, max_val: 1, unidad: 'm', grupo_ui: 'Dimensiones principales', orden: 11 },
    { nombre: 'alto', label: 'Alto (m)', tipo: 'numero', default_valor: '1.8', min_val: 1, max_val: 2.5, unidad: 'm', grupo_ui: 'Dimensiones principales', orden: 12 },
    { nombre: 'num_entrepanos', label: 'Número de entrepaños', tipo: 'numero', default_valor: '5', min_val: 2, max_val: 8, unidad: 'und', grupo_ui: 'Configuración', orden: 20 },
    { nombre: 'num_patas', label: 'Número de patas', tipo: 'numero', default_valor: '4', min_val: 4, max_val: 6, unidad: 'und', grupo_ui: 'Configuración', orden: 21 },
    { nombre: 'calibre_entrepano', label: 'Calibre entrepaño', tipo: 'seleccion', default_valor: '18', grupo_ui: 'Material', orden: 30, opciones: ['18', '16'] },
    { nombre: 'calibre_patas', label: 'Calibre patas', tipo: 'seleccion', default_valor: '12', grupo_ui: 'Material', orden: 31, opciones: ['12', '14'] },
    { nombre: 'instalacion', label: 'Incluir instalación', tipo: 'toggle', default_valor: '0', grupo_ui: 'Extras', orden: 90 },
    { nombre: 'poliza', label: 'Incluir póliza', tipo: 'toggle', default_valor: '0', grupo_ui: 'Extras', orden: 91 },
  ]
  for (const v of estVars) await insert('producto_variables', { producto_id: 'estanteria_graduable', ...v, opciones: v.opciones ?? null })
  console.log(`  ${estVars.length} variables`)

  const estMats = [
    { alias: 'lamina_entrep', template_nombre: 'LÁMINA ENTREPAÑO CAL {calibre_entrepano}', codigo: 'AILA0101{calibre_entrepano}' },
    { alias: 'lamina_patas', template_nombre: 'LÁMINA PATAS CAL {calibre_patas}', codigo: 'AILA0101{calibre_patas}' },
    { alias: 'lamina_omegas', template_nombre: 'LÁMINA OMEGAS CAL 18', codigo: 'AILA010118' },
    { alias: 'niveladores_est', template_nombre: 'NIVELADORES', codigo: 'FENI010118' },
    { alias: 'disco_corte_est', template_nombre: 'DISCOS CORTE', codigo: 'ABDI100124' },
    { alias: 'disco_flap_est', template_nombre: 'DISCOS FLAP', codigo: 'ABDI802060' },
    { alias: 'pano_est', template_nombre: 'PAÑO SCOTCH BRITE', codigo: 'ABPA020001' },
    { alias: 'lija_est', template_nombre: 'LIJA ZC', codigo: 'ABLI202080' },
    { alias: 'grata_est', template_nombre: 'GRATA', codigo: 'ABGR200019' },
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
  for (const m of estMats) await insert('producto_materiales', { producto_id: 'estanteria_graduable', alias: m.alias, template_nombre: m.template_nombre, es_fijo: m.es_fijo || false, precio_fijo: m.precio_fijo ?? null, codigo: m.codigo ?? null })
  console.log(`  ${estMats.length} materiales`)

  const estLineas = [
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
  for (const l of estLineas) await insert('producto_lineas_apu', { producto_id: 'estanteria_graduable', ...l, condicion: l.condicion ?? null })
  console.log(`  ${estLineas.length} líneas APU`)

  // Summary
  console.log('\n✓ Seed completado')
  console.log('  Cárcamo: 8 vars, 21 materiales, 21 líneas')
  console.log('  Estantería: 9 vars, 21 materiales, 21 líneas')
  process.exit(0)
}

main()

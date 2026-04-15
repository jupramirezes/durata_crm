/**
 * Dump de productos_catalogo desde Supabase a supabase/productos/_auto/<id>.sql
 *
 * Para cada producto activo:
 *   - productos_catalogo row
 *   - producto_variables rows
 *   - producto_materiales rows
 *   - producto_lineas_apu rows
 *   - tarifas_mo_producto rows (solo Mesa)
 *
 * Preserva los 4 archivos manuales en supabase/productos/ (mesa, carcamo,
 * estanteria_graduable, repisa). Los autogenerados van a _auto/ para que
 * queden claramente separados.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

if (existsSync(resolve('.env'))) {
  for (const raw of readFileSync('.env', 'utf-8').split('\n')) {
    const line = raw.replace(/\r$/, '').trim()
    if (!line || line.startsWith('#')) continue
    const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*[:=]\s*(.*)$/)
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

const sb = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
)
const { error: ae } = await sb.auth.signInWithPassword({
  email: process.env.MIGRATION_AUTH_EMAIL,
  password: process.env.MIGRATION_AUTH_PASS,
})
if (ae) { console.error('Auth failed:', ae.message); process.exit(1) }

// SQL literal quoting
function q(v) {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  if (typeof v === 'number') return String(v)
  if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`
  return `'${String(v).replace(/'/g, "''")}'`
}

// Fetch all product rows
const { data: productos } = await sb.from('productos_catalogo').select('*').eq('activo', true).order('nombre')
if (!productos?.length) { console.error('No products found'); process.exit(1) }

const OUT_DIR = resolve('supabase/productos/_auto')
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')

let filesWritten = 0
let totalRows = 0

for (const prod of productos) {
  const pid = prod.id
  const fileName = /^[a-z0-9_-]+$/i.test(pid) ? pid : slug(prod.nombre)

  // Fetch dependents in parallel
  const [varsR, matsR, linR, moR] = await Promise.all([
    sb.from('producto_variables').select('*').eq('producto_id', pid).order('orden'),
    sb.from('producto_materiales').select('*').eq('producto_id', pid),
    sb.from('producto_lineas_apu').select('*').eq('producto_id', pid).order('orden'),
    sb.from('tarifas_mo_producto').select('*').eq('producto_id', pid),
  ])

  const vars = varsR.data || []
  const mats = matsR.data || []
  const lineas = linR.data || []
  const tarifas = moR.data || []

  const out = []
  out.push(`-- ============================================================`)
  out.push(`-- PRODUCTO: ${prod.nombre}`)
  out.push(`-- ID: ${pid}`)
  out.push(`-- Grupo: ${prod.grupo}`)
  out.push(`-- Dump automático desde Supabase (${new Date().toISOString().slice(0,10)})`)
  out.push(`-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs`)
  out.push(`-- ============================================================`)
  out.push('')
  out.push(`-- Limpiar datos previos del producto`)
  out.push(`DELETE FROM tarifas_mo_producto WHERE producto_id = ${q(pid)};`)
  out.push(`DELETE FROM producto_lineas_apu WHERE producto_id = ${q(pid)};`)
  out.push(`DELETE FROM producto_materiales WHERE producto_id = ${q(pid)};`)
  out.push(`DELETE FROM producto_variables WHERE producto_id = ${q(pid)};`)
  out.push(`DELETE FROM productos_catalogo WHERE id = ${q(pid)};`)
  out.push('')

  // productos_catalogo
  out.push(`-- productos_catalogo`)
  out.push(
    `INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES`
  )
  out.push(`  (${q(prod.id)}, ${q(prod.nombre)}, ${q(prod.grupo)}, ${q(prod.margen_default)}, ${q(prod.desc_template)}, ${q(prod.activo)}, ${q(prod.orden)});`)
  out.push('')

  // producto_variables
  if (vars.length) {
    out.push(`-- producto_variables (${vars.length})`)
    out.push(`INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES`)
    out.push(vars.map(v =>
      `  (${q(pid)}, ${q(v.nombre)}, ${q(v.label)}, ${q(v.tipo)}, ${q(v.default_valor)}, ${q(v.min_val)}, ${q(v.max_val)}, ${q(v.unidad)}, ${q(v.grupo_ui)}, ${q(v.orden)}, ${q(v.opciones)}, ${q(v.nota)})`
    ).join(',\n') + ';')
    out.push('')
  }

  // producto_materiales
  if (mats.length) {
    out.push(`-- producto_materiales (${mats.length})`)
    out.push(`INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES`)
    out.push(mats.map(m =>
      `  (${q(pid)}, ${q(m.alias)}, ${q(m.template_nombre)}, ${q(m.es_fijo)}, ${q(m.precio_fijo)}, ${q(m.unidad)}, ${q(m.codigo)})`
    ).join(',\n') + ';')
    out.push('')
  }

  // producto_lineas_apu
  if (lineas.length) {
    out.push(`-- producto_lineas_apu (${lineas.length})`)
    out.push(`INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES`)
    out.push(lineas.map(l =>
      `  (${q(pid)}, ${q(l.seccion)}, ${q(l.orden)}, ${q(l.descripcion)}, ${q(l.material_alias)}, ${q(l.formula_cantidad)}, ${q(l.desperdicio)}, ${q(l.condicion)}, ${q(l.margen_override)}, ${q(l.nota)})`
    ).join(',\n') + ';')
    out.push('')
  }

  // tarifas_mo_producto (solo Mesa la tiene)
  if (tarifas.length) {
    out.push(`-- tarifas_mo_producto (${tarifas.length})`)
    out.push(`INSERT INTO tarifas_mo_producto (producto_id, codigo, descripcion, precio, unidad) VALUES`)
    out.push(tarifas.map(t =>
      `  (${q(pid)}, ${q(t.codigo)}, ${q(t.descripcion)}, ${q(t.precio)}, ${q(t.unidad)})`
    ).join(',\n') + ';')
    out.push('')
  }

  writeFileSync(resolve(OUT_DIR, `${fileName}.sql`), out.join('\n') + '\n')
  filesWritten++
  const count = vars.length + mats.length + lineas.length + tarifas.length + 1
  totalRows += count
  console.log(`  ✓ ${fileName}.sql — ${count} rows (${vars.length} vars, ${mats.length} mats, ${lineas.length} líneas, ${tarifas.length} MO)`)
}

// Index file
const index = [
  '# Dump automático del catálogo de productos',
  `**Fecha**: ${new Date().toISOString().slice(0,10)}`,
  `**Productos**: ${productos.length}`,
  `**Total rows**: ${totalRows}`,
  '',
  '## Regenerar',
  '```bash',
  'node scripts/_dump-productos.mjs',
  '```',
  '',
  '## Restaurar un producto',
  '```bash',
  'npx tsx scripts/seed-producto.ts supabase/productos/_auto/<producto>.sql',
  '```',
  '',
  '## Diferencia con `supabase/productos/*.sql` (sin _auto/)',
  'Los archivos en el directorio padre son **mantenidos manualmente** (mesa, carcamo,',
  'estanteria_graduable, repisa) con comentarios explicativos y estructura cuidada.',
  'Los de `_auto/` son dump directo de la BD — sin formato decorativo.',
  '',
  '## Productos incluidos',
  '',
  '| ID | Nombre | Grupo |',
  '|---|---|---|',
  ...productos.map(p => `| \`${p.id}\` | ${p.nombre} | ${p.grupo} |`),
].join('\n')
writeFileSync(resolve(OUT_DIR, 'README.md'), index + '\n')

console.log(`\n✓ ${filesWritten} archivos escritos en supabase/productos/_auto/`)
console.log(`✓ Total: ${totalRows} rows dumpeadas`)
console.log(`✓ README.md con índice creado`)

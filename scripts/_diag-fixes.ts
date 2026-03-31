import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envText = readFileSync(resolve(__dirname, '../.env'), 'utf-8')
const env: Record<string, string> = {}
for (const line of envText.split('\n')) { const m = line.match(/^([^=]+)=(.*)$/); if (m) env[m[1].trim()] = m[2].trim() }
const sb = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY'])

async function main() {
  await sb.auth.signInWithPassword({ email: 'saguirre@durata.co', password: 'Durata2026!' })

  // Fix 1: Find the correct tubo code
  console.log('=== Fix 1: Tubo desagüe ===')
  const { data: tubos } = await sb.from('precios_maestro').select('nombre, codigo, precio').ilike('nombre', '%tubo%2%inox%').limit(10)
  console.log('Tubos INOX 2":')
  for (const t of (tubos || [])) console.log(`  "${t.nombre}" | ${t.codigo} | $${t.precio}`)

  const { data: tubos2 } = await sb.from('precios_maestro').select('nombre, codigo, precio').ilike('codigo', 'AITC19%').limit(5)
  console.log('\nCodigos AITC19*:')
  for (const t of (tubos2 || [])) console.log(`  "${t.nombre}" | ${t.codigo} | $${t.precio}`)

  const { data: tubos3 } = await sb.from('precios_maestro').select('nombre, codigo, precio').ilike('codigo', 'AITO%').limit(5)
  console.log('\nCodigos AITO*:')
  for (const t of (tubos3 || [])) console.log(`  "${t.nombre}" | ${t.codigo} | $${t.precio}`)

  // Fix 2: Check poliza in carcamo APU
  console.log('\n=== Fix 2: Póliza ===')
  const { data: polizaLines } = await sb.from('producto_lineas_apu').select('*').eq('producto_id', 'carcamo').ilike('descripcion', '%liza%')
  console.log('Cárcamo póliza lines:', polizaLines?.length || 0)
  for (const l of (polizaLines || [])) console.log(`  seccion=${l.seccion} condicion="${l.condicion}" formula="${l.formula_cantidad}" material="${l.material_alias}"`)

  const { data: polizaEst } = await sb.from('producto_lineas_apu').select('*').eq('producto_id', 'estanteria_graduable').ilike('descripcion', '%liza%')
  console.log('Estantería póliza lines:', polizaEst?.length || 0)

  // Check how poliza works in evaluar-formula.ts
  const { data: polizaMesa } = await sb.from('producto_lineas_apu').select('*').eq('producto_id', 'mesa').eq('seccion', 'poliza')
  console.log('\nMesa póliza lines:', polizaMesa?.length || 0)
  for (const l of (polizaMesa || [])) console.log(`  seccion=${l.seccion} condicion="${l.condicion}" formula="${l.formula_cantidad}" nota="${l.nota}"`)

  // Check configuracion_sistema for poliza %
  const { data: config } = await sb.from('configuracion_sistema').select('*')
  console.log('\nConfiguracion sistema:')
  for (const c of (config || [])) console.log(`  ${c.clave}: ${JSON.stringify(c.valor).substring(0, 100)}`)

  // Check tubo_desague material alias
  const { data: matDesague } = await sb.from('producto_materiales').select('*').eq('producto_id', 'carcamo').eq('alias', 'tubo_desague')
  console.log('\n=== Tubo desagüe material entry ===')
  for (const m of (matDesague || [])) console.log(`  alias=${m.alias} template="${m.template_nombre}" codigo=${m.codigo} es_fijo=${m.es_fijo}`)

  process.exit(0)
}
main()

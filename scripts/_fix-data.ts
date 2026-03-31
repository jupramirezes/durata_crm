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

  // Fix 1: Update tubo desague code
  console.log('Fix 1: Updating tubo desague code...')
  const { error: e1 } = await sb.from('producto_materiales')
    .update({ codigo: 'AITC190018', template_nombre: 'TUBO ACERO INOXIDABLE CUADRADO 2 CAL 18' })
    .eq('producto_id', 'carcamo').eq('alias', 'tubo_desague')
  console.log(e1 ? `  ✗ ${e1.message}` : '  ✓ tubo_desague → AITC190018')

  // Fix 2: Add póliza lines to cárcamo and estantería
  console.log('\nFix 2: Adding póliza lines...')
  for (const pid of ['carcamo', 'estanteria_graduable']) {
    // Check if already exists
    const { data: existing } = await sb.from('producto_lineas_apu')
      .select('id').eq('producto_id', pid).eq('seccion', 'poliza')
    if (existing && existing.length > 0) {
      console.log(`  ${pid}: póliza line already exists, skipping`)
      continue
    }
    const { error } = await sb.from('producto_lineas_apu').insert({
      producto_id: pid,
      seccion: 'poliza',
      orden: 99,
      descripcion: 'Póliza todo riesgo',
      material_alias: '',
      formula_cantidad: '1',
      desperdicio: 0,
      condicion: 'poliza == 1',
      nota: 'Precio = 2% del costo total antes de póliza',
    })
    console.log(error ? `  ✗ ${pid}: ${error.message}` : `  ✓ ${pid}: póliza line added`)
  }

  // Verify
  console.log('\nVerification:')
  const { data: mat } = await sb.from('producto_materiales').select('alias, codigo').eq('producto_id', 'carcamo').eq('alias', 'tubo_desague')
  console.log(`  tubo_desague: ${mat?.[0]?.codigo}`)
  for (const pid of ['carcamo', 'estanteria_graduable']) {
    const { data: pol } = await sb.from('producto_lineas_apu').select('descripcion, condicion').eq('producto_id', pid).eq('seccion', 'poliza')
    console.log(`  ${pid} póliza: ${pol?.length || 0} lines`)
  }

  process.exit(0)
}
main()

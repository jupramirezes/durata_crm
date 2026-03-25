/**
 * check-counts.ts — Report record counts for each table in Supabase
 *
 * Usage: npx tsx scripts/check-counts.ts
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read env
const envText = readFileSync(resolve(__dirname, '../.env'), 'utf-8')
const env: Record<string, string> = {}
for (const line of envText.split('\n')) {
  const m = line.match(/^([^=]+)=(.*)$/)
  if (m) env[m[1].trim()] = m[2].trim()
}

const SUPABASE_URL = env['VITE_SUPABASE_URL']
const SUPABASE_KEY = env['VITE_SUPABASE_ANON_KEY']
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const TABLES = [
  'empresas',
  'contactos',
  'oportunidades',
  'historial_etapas',
  'productos_oportunidad',
  'cotizaciones',
  'precios_maestro',
  'tarifas_mo',
  'configuracion_sistema',
]

async function main() {
  console.log('=== DURATA CRM — Conteo de registros ===\n')
  console.log(`Fecha: ${new Date().toLocaleString('es-CO')}\n`)

  let total = 0

  for (const table of TABLES) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.log(`  ${table.padEnd(25)} ERROR: ${error.message}`)
    } else {
      const c = count ?? 0
      total += c
      console.log(`  ${table.padEnd(25)} ${String(c).padStart(6)} registros`)
    }
  }

  console.log(`${'─'.repeat(40)}`)
  console.log(`  ${'TOTAL'.padEnd(25)} ${String(total).padStart(6)} registros\n`)
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})

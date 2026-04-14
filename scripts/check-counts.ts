/**
 * check-counts.ts — Report record counts for each table in Supabase
 *
 * Usage: npx tsx scripts/check-counts.ts
 */

import { createClient } from '@supabase/supabase-js'
import { getSupabaseScriptConfig } from './lib/env'

const { url: SUPABASE_URL, anonKey: SUPABASE_KEY, authEmail: AUTH_EMAIL, authPass: AUTH_PASS } = getSupabaseScriptConfig()
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
  'productos_catalogo',
  'producto_variables',
  'producto_materiales',
  'producto_lineas_apu',
  'tarifas_mo_producto',
]

async function main() {
  if (!AUTH_EMAIL || !AUTH_PASS) {
    console.error('Missing MIGRATION_AUTH_EMAIL or MIGRATION_AUTH_PASS in .env or process.env')
    process.exit(1)
  }

  const { error: authErr } = await supabase.auth.signInWithPassword({ email: AUTH_EMAIL, password: AUTH_PASS })
  if (authErr) { console.error('Auth failed:', authErr.message); process.exit(1) }

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

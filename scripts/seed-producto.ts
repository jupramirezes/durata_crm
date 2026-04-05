/**
 * seed-producto.ts — Inserts a single product from a verified SQL file.
 *
 * Usage: npx tsx scripts/seed-producto.ts supabase/productos/repisa.sql
 *
 * What it does:
 * 1. Reads the SQL file
 * 2. Connects to Supabase (.env credentials)
 * 3. Executes the SQL
 * 4. Verifies: counts variables, materiales, lineas
 * 5. Reports result
 *
 * That's it. No validation, no translation. The SQL is already verified.
 */

import { readFileSync } from 'fs'
import { resolve, dirname, basename } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { createClient } = require('@supabase/supabase-js')

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read .env
const envText = readFileSync(resolve(__dirname, '../.env'), 'utf-8')
const env: Record<string, string> = {}
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([^#=][^=]*)=(.*)$/)
  if (m) env[m[1].trim()] = m[2].trim()
}

const sb = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY'])

function parseValues(raw: string): string[] {
  const result: string[] = []
  let current = '', inQuote = false
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]
    if (ch === "'" && !inQuote) { inQuote = true; continue }
    if (ch === "'" && inQuote) { if (raw[i + 1] === "'") { current += "'"; i++; continue }; inQuote = false; continue }
    if (inQuote) { current += ch; continue }
    if (ch === ',') { result.push(current.trim()); current = ''; continue }
    current += ch
  }
  if (current.trim()) result.push(current.trim())
  return result
}

async function main() {
  const sqlFile = process.argv[2]
  if (!sqlFile) {
    console.error('Usage: npx tsx scripts/seed-producto.ts <file.sql>')
    process.exit(1)
  }

  const absPath = resolve(sqlFile)
  const sql = readFileSync(absPath, 'utf-8')
  const pid = basename(absPath, '.sql')

  console.log(`Seeding: ${pid} from ${basename(absPath)}`)

  // Auth
  const { error: authErr } = await sb.auth.signInWithPassword({
    email: 'saguirre@durata.co', password: 'Durata2026!',
  })
  if (authErr) { console.error('Auth failed:', authErr.message); process.exit(1) }

  // Parse and execute
  const stmts = sql.split(';').map(s => s.replace(/--.*$/gm, '').trim()).filter(s => s.length > 10)
  let ok = 0, errors = 0

  for (const stmt of stmts) {
    if (stmt.startsWith('DELETE')) {
      const tbl = stmt.match(/DELETE FROM (\w+)/)?.[1]
      const pidMatch = stmt.match(/producto_id\s*=\s*'([^']+)'/)?.[1]
      if (tbl && pidMatch) await sb.from(tbl).delete().eq('producto_id', pidMatch)
      continue
    }
    if (!stmt.startsWith('INSERT')) continue

    const tbl = stmt.match(/INSERT INTO (\w+)/)?.[1]
    if (!tbl) continue

    const colMatch = stmt.match(/\(([^)]+)\)\s*VALUES\s*\((.+)\)/s)
    if (!colMatch) continue

    const cols = colMatch[1].split(',').map(c => c.trim())
    const vals = parseValues(colMatch[2])

    const row: Record<string, any> = {}
    for (let i = 0; i < cols.length && i < vals.length; i++) {
      const v = vals[i]
      if (v === 'NULL') row[cols[i]] = null
      else if (v === 'true') row[cols[i]] = true
      else if (v === 'false') row[cols[i]] = false
      else if (/^-?\d+(\.\d+)?$/.test(v)) row[cols[i]] = parseFloat(v)
      else if (v.startsWith('[') || v.startsWith('{')) { try { row[cols[i]] = JSON.parse(v) } catch { row[cols[i]] = v } }
      else row[cols[i]] = v
    }

    if (tbl === 'productos_catalogo') {
      const { error } = await sb.from(tbl).upsert(row, { onConflict: 'id' })
      if (error) { errors++; console.log(`  ERR ${tbl}: ${error.message}`) } else ok++
    } else {
      const { error } = await sb.from(tbl).insert(row)
      if (error) { errors++; console.log(`  ERR ${tbl}/${row.nombre || row.alias || row.descripcion}: ${error.message}`) } else ok++
    }
  }

  // Verify
  const { data: vars } = await sb.from('producto_variables').select('nombre').eq('producto_id', pid)
  const { data: mats } = await sb.from('producto_materiales').select('alias').eq('producto_id', pid)
  const { data: lines } = await sb.from('producto_lineas_apu').select('descripcion').eq('producto_id', pid)

  console.log(`\nResult: ${ok} inserted, ${errors} errors`)
  console.log(`  Variables: ${vars?.length || 0}`)
  console.log(`  Materiales: ${mats?.length || 0}`)
  console.log(`  Lineas APU: ${lines?.length || 0}`)

  if (errors > 0) process.exit(1)
  console.log(`\n${pid} seeded successfully.`)
}

main()

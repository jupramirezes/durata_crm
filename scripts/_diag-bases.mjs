/** Generates a diagnostic SQL that the user runs in Supabase to show,
 * for each duplicate base, which COT variants currently exist and how many copies.
 */
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const splitBase = c => {
  const m = String(c).match(/^(.+?)([A-Z]*)$/)
  return m ? m[1] : c
}

const dupes = JSON.parse(readFileSync(resolve('scripts/data/_duplicates.json'), 'utf-8'))
const bases = [...new Set(dupes.map(d => splitBase(d.cot)))].sort()

const sql = `-- Diagnostico: para cada base COT con duplicados, muestra que variantes
-- existen actualmente en Supabase y cuantas copias de cada una.
-- Pegame el output y ajusto el plan de renombrado.

WITH expanded AS (
  SELECT
    id,
    substring(notas from 'COT:\\s*([^\\s|]+)') AS cot,
    regexp_replace(substring(notas from 'COT:\\s*([^\\s|]+)'), '[A-Z]+$', '') AS base,
    valor_cotizado
  FROM oportunidades
  WHERE notas LIKE 'COT:%'
)
SELECT base, cot, COUNT(*) AS copies,
       array_agg(DISTINCT valor_cotizado ORDER BY valor_cotizado) AS valores
FROM expanded
WHERE base IN (
${bases.map(b => `  '${b}'`).join(',\n')}
)
GROUP BY base, cot
ORDER BY base, cot;
`

writeFileSync(resolve('scripts/data/_diag-bases.sql'), sql)
console.log(`✓ ${bases.length} bases únicas`)
console.log(`✓ SQL escrito en: scripts/data/_diag-bases.sql (${sql.length} bytes)`)

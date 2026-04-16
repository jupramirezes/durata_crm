---
name: durata-qa-invariants
description: Verify all 8 database invariants for DURATA CRM via Supabase MCP
---

# DURATA QA Invariants Check

Run all 8 database invariants against production Supabase and report pass/fail.

## Invariants

Execute this single query via `mcp__supabase__execute_sql`:

```sql
SELECT 
  'cot_asignado_0' AS inv, COUNT(*)::text AS val, CASE WHEN COUNT(*)=0 THEN 'PASS' ELSE 'FAIL' END AS status
  FROM oportunidades WHERE cotizador_asignado = '0'
UNION ALL
SELECT 'adj_sin_aprobada', COUNT(*)::text, CASE WHEN COUNT(*)=0 THEN 'PASS' ELSE 'FAIL' END
  FROM oportunidades o WHERE o.etapa='adjudicada' AND NOT EXISTS (SELECT 1 FROM cotizaciones c WHERE c.oportunidad_id=o.id AND c.estado='aprobada')
UNION ALL
SELECT 'perdida_con_aprobada', COUNT(*)::text, CASE WHEN COUNT(*)=0 THEN 'PASS' ELSE 'FAIL' END
  FROM oportunidades o WHERE o.etapa='perdida' AND EXISTS (SELECT 1 FROM cotizaciones c WHERE c.oportunidad_id=o.id AND c.estado='aprobada')
UNION ALL
-- valor_desync aplica solo a ops NO perdidas. Para etapa='perdida' el valor_cotizado
-- es histórico (incluye rechazadas) por diseño — ver commit 15797b6.
SELECT 'valor_desync', COUNT(*)::text, CASE WHEN COUNT(*)=0 THEN 'PASS' ELSE 'FAIL' END
  FROM oportunidades o WHERE o.etapa != 'perdida' AND o.valor_cotizado != COALESCE((SELECT SUM(c.total) FROM cotizaciones c WHERE c.oportunidad_id=o.id AND c.estado NOT IN ('descartada','rechazada')), 0)
UNION ALL
SELECT 'cot_sin_estado', COUNT(*)::text, CASE WHEN COUNT(*)=0 THEN 'PASS' ELSE 'FAIL' END
  FROM cotizaciones WHERE estado IS NULL OR estado = ''
UNION ALL
SELECT 'cot_con_espacios', COUNT(*)::text, CASE WHEN COUNT(*)=0 THEN 'PASS' ELSE 'FAIL' END
  FROM cotizaciones WHERE numero ~ '\s-|-\s'
UNION ALL
SELECT 'cot_numero_duplicado', COUNT(*)::text, CASE WHEN COUNT(*)=0 THEN 'PASS' ELSE 'FAIL' END
  FROM (SELECT 1 FROM cotizaciones GROUP BY numero HAVING COUNT(*)>1) t
UNION ALL
SELECT 'ops_huerfanas', COUNT(*)::text, CASE WHEN COUNT(*)=0 THEN 'PASS' ELSE 'FAIL' END
  FROM oportunidades WHERE empresa_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM empresas WHERE id = oportunidades.empresa_id);
```

## Report format

Present as a table:
| Invariant | Value | Status |
|---|---|---|

If ALL pass: report "All 8 invariants PASS".
If any FAIL: investigate immediately — show the failing rows and suggest fix.

## Also check counts

```sql
SELECT 
  (SELECT COUNT(*) FROM oportunidades) AS oportunidades,
  (SELECT COUNT(*) FROM cotizaciones) AS cotizaciones,
  (SELECT COUNT(*) FROM empresas) AS empresas,
  (SELECT COUNT(*) FROM contactos) AS contactos;
```

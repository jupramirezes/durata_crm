---
name: durata-migrate
description: Run the full DURATA CRM migration pipeline (diagnostic → migrate → verify invariants)
---

# DURATA Migration Pipeline

Run the complete migration sequence for DURATA CRM. This includes:
1. Pre-migration diagnostic (Excel validation)
2. Data migration (npm run migrate)
3. Post-migration invariant verification via Supabase MCP
4. Stalled opportunity detection

## Steps

### Step 1: Diagnostic
Run `node scripts/_diag-migracion.mjs` and report:
- How many new oportunidades will be inserted (MAESTRO + 2026)
- Filas sin empresa (not insertable)
- Duplicados en Excel (if any)

### Step 2: Migrate
Run `npm run migrate` and capture the output. Report:
- Empresas/Contactos/Oportunidades created
- Cotizaciones created
- Enriched from 2026 sheet
- Errors (must be 0)
- Oportunidades advanced (PASO 5.5)

### Step 3: Verify Invariants
Run these SQL queries via `mcp__supabase__execute_sql`:

```sql
SELECT 
  (SELECT COUNT(*) FROM oportunidades WHERE cotizador_asignado = '0') AS cot0,
  (SELECT COUNT(*) FROM oportunidades o WHERE o.etapa='adjudicada' AND NOT EXISTS (SELECT 1 FROM cotizaciones c WHERE c.oportunidad_id=o.id AND c.estado='aprobada')) AS adj_sin_apr,
  (SELECT COUNT(*) FROM oportunidades o WHERE o.valor_cotizado != COALESCE((SELECT SUM(c.total) FROM cotizaciones c WHERE c.oportunidad_id=o.id AND c.estado NOT IN ('descartada','rechazada')), 0)) AS valor_desync,
  (SELECT COUNT(*) FROM cotizaciones WHERE estado IS NULL OR estado = '') AS cot_sin_estado,
  (SELECT COUNT(*) FROM cotizaciones WHERE numero ~ '\s-|-\s') AS cot_con_espacios;
```

ALL values must be 0. If any is non-zero, investigate and fix before reporting success.

### Step 4: Stalled Detection
Run `node scripts/_diag-estancadas.mjs` and report any oportunidades in nuevo_lead that should have advanced.

### Step 5: Idempotency Check
Run `npm run migrate` a SECOND time. It must report 0 new across all categories.

## Report format
Provide a table with before/after counts for: oportunidades, cotizaciones, empresas, contactos.
Flag any invariant violations.

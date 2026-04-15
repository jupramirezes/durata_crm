-- N-03: Normalize valor_cotizado for 15 desynchronized oportunidades
--
-- Background: valor_cotizado should equal SUM(total) of cotizaciones with
-- estado NOT IN ('descartada', 'rechazada'). A code bug left 15 opps with
-- stale values (valor_cotizado > 0 but SUM of active cots = 0).
--
-- This script recalculates valor_cotizado from the actual cotizaciones table.
-- Idempotent — safe to run multiple times.
-- Reversible — the previous values are wrong by definition, no need to restore.

BEGIN;

-- Recompute valor_cotizado for ALL oportunidades from their active cotizaciones
WITH active_totals AS (
    SELECT
        oportunidad_id,
        COALESCE(SUM(total), 0) AS correct_valor
    FROM cotizaciones
    WHERE estado NOT IN ('descartada', 'rechazada')
    GROUP BY oportunidad_id
)
UPDATE oportunidades o
SET    valor_cotizado = COALESCE(at.correct_valor, 0)
FROM   active_totals at
WHERE  at.oportunidad_id = o.id
  AND  o.valor_cotizado != COALESCE(at.correct_valor, 0);  -- only update if different

-- Also zero out opps that have NO active cotizaciones but valor_cotizado > 0
UPDATE oportunidades
SET    valor_cotizado = 0
WHERE  valor_cotizado > 0
  AND  NOT EXISTS (
           SELECT 1 FROM cotizaciones c
           WHERE  c.oportunidad_id = oportunidades.id
             AND  c.estado NOT IN ('descartada', 'rechazada')
       );

COMMIT;

-- Verify:
-- SELECT o.id, o.valor_cotizado, COALESCE(SUM(c.total),0) AS sum_active
-- FROM oportunidades o
-- LEFT JOIN cotizaciones c ON c.oportunidad_id = o.id AND c.estado NOT IN ('descartada','rechazada')
-- GROUP BY o.id, o.valor_cotizado
-- HAVING o.valor_cotizado != COALESCE(SUM(c.total), 0);
-- → should return 0 rows after running this script

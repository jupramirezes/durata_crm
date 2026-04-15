-- C-02: Fix 12 adjudicadas sin cotización 'aprobada' (Invariante 3 rota)
--
-- Background: MOVE_ETAPA → adjudicada should mark the most recent active cotización
-- as 'aprobada'. For 12 historical oportunidades this didn't happen (imported before
-- the sync logic existed, or sync failed silently).
--
-- Strategy: for each 'adjudicada' opp without any 'aprobada' cotización,
--   1. Find its most recent non-descartada, non-rechazada cotización
--   2. Mark it as 'aprobada'
--   3. Mark all other non-descartada cotizaciones of that opp as 'rechazada'
--
-- Reversible: wrap in a transaction. Save a backup to a temp table if desired.
-- Idempotent: the WHERE clause only targets opps that still lack an 'aprobada' cot.

BEGIN;

-- Identify the winner cotización per orphan adjudicada opp
-- (most recent by fecha among estado NOT IN ('descartada', 'rechazada'))
WITH orphan_opps AS (
    SELECT o.id AS opp_id
    FROM   oportunidades o
    WHERE  o.etapa = 'adjudicada'
      AND  NOT EXISTS (
               SELECT 1 FROM cotizaciones c
               WHERE  c.oportunidad_id = o.id AND c.estado = 'aprobada'
           )
),
ranked_cots AS (
    SELECT
        c.id        AS cot_id,
        c.oportunidad_id,
        c.estado,
        c.fecha,
        ROW_NUMBER() OVER (
            PARTITION BY c.oportunidad_id
            ORDER BY COALESCE(c.fecha, '1900-01-01') DESC
        ) AS rn
    FROM cotizaciones c
    JOIN orphan_opps oo ON oo.opp_id = c.oportunidad_id
    WHERE c.estado NOT IN ('descartada', 'rechazada')
),
winner_cots AS (
    SELECT cot_id, oportunidad_id FROM ranked_cots WHERE rn = 1
)
-- Step A: mark winner as 'aprobada'
UPDATE cotizaciones
SET    estado = 'aprobada'
FROM   winner_cots
WHERE  cotizaciones.id = winner_cots.cot_id;

-- Step B: mark remaining active (non-descartada) cotizaciones of those opps as 'rechazada'
WITH orphan_opps AS (
    SELECT o.id AS opp_id
    FROM   oportunidades o
    WHERE  o.etapa = 'adjudicada'
),
winners AS (
    SELECT c.id
    FROM   cotizaciones c
    JOIN   orphan_opps oo ON oo.opp_id = c.oportunidad_id
    WHERE  c.estado = 'aprobada'
)
UPDATE cotizaciones
SET    estado = 'rechazada'
WHERE  oportunidad_id IN (SELECT opp_id FROM orphan_opps)
  AND  estado NOT IN ('descartada', 'aprobada')
  AND  id NOT IN (SELECT id FROM winners);

COMMIT;

-- Verify:
-- SELECT o.id, o.etapa, COUNT(c.id) FILTER (WHERE c.estado='aprobada') AS n_aprobadas
-- FROM oportunidades o LEFT JOIN cotizaciones c ON c.oportunidad_id = o.id
-- WHERE o.etapa = 'adjudicada'
-- GROUP BY o.id, o.etapa
-- HAVING COUNT(c.id) FILTER (WHERE c.estado='aprobada') = 0;
-- → should return 0 rows after running this script

-- N-02 / M-08: Normalize cotizador_asignado='0' (legacy import artifact)
-- Run once on production. Idempotent — safe to run multiple times.
-- Reversible: the original '0' value was meaningless, so there is no restore.
--
-- Strategy:
--   • If the opp has a linked contacto with a known cotizador email prefix, use that.
--   • Otherwise SET NULL (null = "unassigned") which the UI treats as "—".

BEGIN;

-- Step 1: log which rows are affected (useful for audit)
-- SELECT id, cotizador_asignado, created_at FROM oportunidades WHERE cotizador_asignado = '0';

-- Step 2: set to NULL — UI already handles NULL gracefully
UPDATE oportunidades
SET    cotizador_asignado = NULL
WHERE  cotizador_asignado = '0';

-- Step 3: also trim whitespace from any trailing-space values (belt-and-suspenders;
-- the hydration one-time fix already did this, but keep it here for completeness)
UPDATE oportunidades
SET    cotizador_asignado = TRIM(cotizador_asignado)
WHERE  cotizador_asignado IS NOT NULL
  AND  cotizador_asignado != TRIM(cotizador_asignado);

COMMIT;

-- Verify:
-- SELECT COUNT(*) FROM oportunidades WHERE cotizador_asignado = '0';  -- should be 0
-- SELECT COUNT(*) FROM oportunidades WHERE cotizador_asignado IS NULL; -- shows unassigned

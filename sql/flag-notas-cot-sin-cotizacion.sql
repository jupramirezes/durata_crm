-- N-04: Flag 15 oportunidades with "COT:" in notas but no cotización in DB
--
-- Background: during historical Excel import, some rows had cotización numbers
-- written into the notas field (e.g. "COT: 2024-123") but no actual cotización
-- record was created. These need manual review.
--
-- This script ONLY flags them — it does NOT delete or modify business data.
-- It adds/updates a notas suffix " [migracion_incompleta]" for easy filtering.

-- First, identify the affected rows (read-only preview):
-- SELECT id, cotizador_asignado, notas
-- FROM oportunidades
-- WHERE notas ILIKE '%COT:%'
--   AND NOT EXISTS (
--       SELECT 1 FROM cotizaciones c WHERE c.oportunidad_id = oportunidades.id
--   );

-- To apply the flag (run when ready for manual review cleanup):
BEGIN;

UPDATE oportunidades
SET    notas = notas || ' [migracion_incompleta]'
WHERE  notas ILIKE '%COT:%'
  AND  notas NOT ILIKE '%[migracion_incompleta]%'  -- idempotent
  AND  NOT EXISTS (
           SELECT 1 FROM cotizaciones c
           WHERE  c.oportunidad_id = oportunidades.id
       );

COMMIT;

-- After manual review, to remove the flag from a specific opp:
-- UPDATE oportunidades SET notas = REPLACE(notas, ' [migracion_incompleta]', '') WHERE id = '<uuid>';

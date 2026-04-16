-- URGENTE 2026-04-15 20:XX: Restore valor_cotizado desde cotizaciones históricas.
--
-- Contexto: el script fix-valor-cotizado.sql (del QA session) aplicó la
-- definición "valor_cotizado = SUM(total) de cotizaciones activas" (excluyendo
-- rechazada/descartada). Eso dejó 3580 oportunidades (la mayoría perdidas)
-- con valor_cotizado=0, rompiendo:
--   - Dashboard "Top clientes" (CONCONCRETO mostró $0 cotizado histórico)
--   - Tasa de cierre por valor (85% falso porque valor perdido ≈ 0)
--
-- Definición correcta (consistente con uso en Dashboard y reportes):
--   valor_cotizado = monto cotizado al cliente en la cotización más reciente
--   no-descartada (incluye rechazadas — el valor se cotizó, aunque se perdiera).
--
-- Idempotente. Reversible parcialmente (valores anteriores no se guardaron,
-- pero este script reconstruye desde la fuente de verdad en cotizaciones).

BEGIN;

WITH last_cot_per_op AS (
  SELECT DISTINCT ON (oportunidad_id)
    oportunidad_id, total
  FROM cotizaciones
  WHERE estado != 'descartada' AND total > 0
  ORDER BY oportunidad_id, fecha DESC NULLS LAST, created_at DESC NULLS LAST
)
UPDATE oportunidades o
SET valor_cotizado = lc.total
FROM last_cot_per_op lc
WHERE lc.oportunidad_id = o.id
  AND o.valor_cotizado != lc.total;

COMMIT;

-- Verificación post-fix:
-- SELECT
--   (SELECT COUNT(*) FROM oportunidades WHERE valor_cotizado = 0) AS ops_valor_cero,
--   ROUND(100.0 * SUM(valor_adjudicado) FILTER (WHERE etapa='adjudicada') /
--         NULLIF(SUM(valor_adjudicado) FILTER (WHERE etapa='adjudicada') +
--                SUM(valor_cotizado) FILTER (WHERE etapa='perdida'), 0), 1)::text || '%' AS tasa_cierre_valor
-- FROM oportunidades;
-- → ops_valor_cero debe ser bajo (~45, ops sin ninguna cotización)
-- → tasa_cierre_valor debe estar ~8% histórico

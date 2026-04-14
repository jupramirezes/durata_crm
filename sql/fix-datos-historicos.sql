-- ============================================================
-- Fix de datos históricos migrados
-- Run en Supabase Dashboard > SQL Editor
-- Fecha: 2026-04-15
-- ============================================================
-- Las cotizaciones que venían de la migración inicial (marzo 2026)
-- quedaron con estado NULL o vacío porque el script viejo no
-- seteaba ese campo. Además algunos números de cotización quedaron
-- con espacios alrededor del guión (" - ") antes de la normalización
-- aplicada en abril.
--
-- Este script hace dos cosas:
--   1) Deriva el estado de la cotización desde el etapa de la
--      oportunidad asociada (NULL/vacío → estado calculado)
--   2) Normaliza el campo numero (quita espacios alrededor del -)
--
-- Ambos cambios están en una transacción. Corré los SELECTs de
-- verificación antes del COMMIT.
-- ============================================================

BEGIN;

-- ────────────────────────────────────────────────────────────
-- STEP 1 — Dry run: cuantas cotizaciones tienen estado NULL/vacío
-- ────────────────────────────────────────────────────────────
SELECT
  COUNT(*) FILTER (WHERE estado IS NULL) AS null_estado,
  COUNT(*) FILTER (WHERE estado = '') AS empty_estado,
  COUNT(*) AS total_cotizaciones
FROM cotizaciones;

-- ────────────────────────────────────────────────────────────
-- STEP 2 — Derivar estado desde la etapa de la oportunidad asociada
-- ────────────────────────────────────────────────────────────
-- Mapping:
--   adjudicada         → aprobada
--   perdida            → rechazada
--   cotizacion_enviada → enviada
--   en_cotizacion      → borrador
--   nuevo_lead         → borrador
--   en_seguimiento     → enviada     (ya se envió, está en follow-up)
--   en_negociacion     → enviada     (ya se envió, está en negociación)
-- Solo toca cotizaciones donde estado IS NULL o estado = ''.
-- ────────────────────────────────────────────────────────────
UPDATE cotizaciones c
SET estado = CASE o.etapa
  WHEN 'adjudicada'         THEN 'aprobada'
  WHEN 'perdida'            THEN 'rechazada'
  WHEN 'cotizacion_enviada' THEN 'enviada'
  WHEN 'en_cotizacion'      THEN 'borrador'
  WHEN 'nuevo_lead'         THEN 'borrador'
  WHEN 'en_seguimiento'     THEN 'enviada'
  WHEN 'en_negociacion'     THEN 'enviada'
  ELSE 'borrador'
END
FROM oportunidades o
WHERE c.oportunidad_id = o.id
  AND (c.estado IS NULL OR c.estado = '');

-- ────────────────────────────────────────────────────────────
-- STEP 3 — Normalizar el campo 'numero' (quitar espacios alrededor del -)
-- ────────────────────────────────────────────────────────────
-- Captura cualquier variante: " - ", " -", "- ". Deja "xxx-yyy".
-- ────────────────────────────────────────────────────────────
UPDATE cotizaciones
SET numero = regexp_replace(numero, '\s*-\s*', '-', 'g')
WHERE numero ~ '\s-|-\s';

-- ────────────────────────────────────────────────────────────
-- VERIFICACIÓN antes del COMMIT
-- ────────────────────────────────────────────────────────────

-- (a) No debe quedar ninguna cotización con estado NULL/vacío
SELECT COUNT(*) AS todavia_sin_estado
FROM cotizaciones
WHERE estado IS NULL OR estado = '';

-- (b) No debe quedar ningún numero con espacios alrededor del guión
SELECT COUNT(*) AS todavia_con_espacios
FROM cotizaciones
WHERE numero ~ '\s-|-\s';

-- (c) Distribución final de estados
SELECT estado, COUNT(*) AS cantidad
FROM cotizaciones
GROUP BY estado
ORDER BY cantidad DESC;

-- (d) Cross-check con oportunidades: cotizaciones "aprobada" deberían
-- pertenecer a oportunidades "adjudicada", etc.
SELECT c.estado, o.etapa, COUNT(*) AS cantidad
FROM cotizaciones c
JOIN oportunidades o ON o.id = c.oportunidad_id
GROUP BY c.estado, o.etapa
ORDER BY c.estado, o.etapa;

-- ────────────────────────────────────────────────────────────
-- Si (a) y (b) dan 0 y (c)/(d) se ven coherentes:
COMMIT;
-- Sino:
-- ROLLBACK;
-- ────────────────────────────────────────────────────────────

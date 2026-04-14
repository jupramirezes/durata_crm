-- ============================================================
-- Migration: add file/render columns to productos_oportunidad
-- Run once in Supabase SQL Editor on any existing DB created
-- before these columns existed. Safe to re-run.
-- ============================================================
-- The client code (src/hooks/useOportunidades.ts sanitizeProducto)
-- whitelists these columns when inserting/updating a product; if
-- they are missing the INSERT fails silently and manual products
-- never persist.
-- ============================================================

ALTER TABLE productos_oportunidad ADD COLUMN IF NOT EXISTS imagen_render      text;
ALTER TABLE productos_oportunidad ADD COLUMN IF NOT EXISTS archivo_apu_url    text;
ALTER TABLE productos_oportunidad ADD COLUMN IF NOT EXISTS archivo_apu_nombre text;
ALTER TABLE productos_oportunidad ADD COLUMN IF NOT EXISTS archivo_pdf_url    text;
ALTER TABLE productos_oportunidad ADD COLUMN IF NOT EXISTS archivo_pdf_nombre text;

COMMENT ON COLUMN productos_oportunidad.imagen_render
  IS 'Base64-encoded PNG of 3D render from configurador.';
COMMENT ON COLUMN productos_oportunidad.archivo_apu_url
  IS 'Supabase Storage URL of uploaded APU Excel.';
COMMENT ON COLUMN productos_oportunidad.archivo_pdf_url
  IS 'Supabase Storage URL of uploaded producto PDF.';

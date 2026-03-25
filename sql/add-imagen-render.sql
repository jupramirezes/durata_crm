-- Add imagen_render column to productos_oportunidad table
-- This stores a base64-encoded PNG of the 3D render captured from the configurador
-- Run this in Supabase SQL Editor

ALTER TABLE productos_oportunidad
  ADD COLUMN IF NOT EXISTS imagen_render text;

COMMENT ON COLUMN productos_oportunidad.imagen_render
  IS 'Base64-encoded PNG of 3D render from configurador. Used in cotización editor and PDF.';

-- ============================================================
-- DURATA CRM — RLS Fix: authenticated-only access
-- Run in Supabase Dashboard > SQL Editor
-- Date: 2026-03-24
-- ============================================================
-- This replaces the "Allow all for anon" policies with
-- "authenticated_access" policies that require a valid session.
-- After running this, only logged-in users can read/write data.
-- ============================================================

-- 1. empresas
DROP POLICY IF EXISTS "Allow all for anon" ON empresas;
DROP POLICY IF EXISTS "authenticated_access" ON empresas;
CREATE POLICY "authenticated_access" ON empresas
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 2. contactos
DROP POLICY IF EXISTS "Allow all for anon" ON contactos;
DROP POLICY IF EXISTS "authenticated_access" ON contactos;
CREATE POLICY "authenticated_access" ON contactos
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 3. oportunidades
DROP POLICY IF EXISTS "Allow all for anon" ON oportunidades;
DROP POLICY IF EXISTS "authenticated_access" ON oportunidades;
CREATE POLICY "authenticated_access" ON oportunidades
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 4. historial_etapas
DROP POLICY IF EXISTS "Allow all for anon" ON historial_etapas;
DROP POLICY IF EXISTS "authenticated_access" ON historial_etapas;
CREATE POLICY "authenticated_access" ON historial_etapas
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 5. productos_oportunidad
DROP POLICY IF EXISTS "Allow all for anon" ON productos_oportunidad;
DROP POLICY IF EXISTS "authenticated_access" ON productos_oportunidad;
CREATE POLICY "authenticated_access" ON productos_oportunidad
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 6. cotizaciones
DROP POLICY IF EXISTS "Allow all for anon" ON cotizaciones;
DROP POLICY IF EXISTS "authenticated_access" ON cotizaciones;
CREATE POLICY "authenticated_access" ON cotizaciones
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 7. precios_maestro
DROP POLICY IF EXISTS "Allow all for anon" ON precios_maestro;
DROP POLICY IF EXISTS "authenticated_access" ON precios_maestro;
CREATE POLICY "authenticated_access" ON precios_maestro
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 8. configuracion_sistema
DROP POLICY IF EXISTS "Allow all for anon" ON configuracion_sistema;
DROP POLICY IF EXISTS "authenticated_access" ON configuracion_sistema;
CREATE POLICY "authenticated_access" ON configuracion_sistema
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 9. tarifas_mo (unused but secure it anyway)
DROP POLICY IF EXISTS "Allow all for anon" ON tarifas_mo;
DROP POLICY IF EXISTS "authenticated_access" ON tarifas_mo;
CREATE POLICY "authenticated_access" ON tarifas_mo
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Verify: list all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;

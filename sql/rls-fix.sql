-- ============================================================
-- DURATA CRM — RLS Fix: authenticated-only access
-- Run in Supabase Dashboard > SQL Editor
-- Last updated: 2026-04-14 (dev/fix-rls-persistencia)
-- ============================================================
--
-- DIAGNOSTICO DEL BUG (2026-04-14):
--   Sintoma: oportunidades creadas por presupuestos2@durata.co no
--   persisten al recargar, aunque aparecen en la sesion. Otros usuarios
--   (saguirre@durata.co) funcionaban correctamente.
--
-- Causa raiz:
--   Las policies usaban `auth.role() = 'authenticated'`. `auth.role()`
--   depende del claim "role" del JWT, que puede estar ausente, mal
--   formado, o tener un valor distinto a 'authenticated' (ej. 'anon',
--   NULL) cuando un usuario fue creado en Supabase Auth con una
--   configuracion no estandar (aud claim, custom hooks, etc).
--   Cuando esto ocurre:
--     - El INSERT pasa WITH CHECK pero la RLS silenciosamente rechaza
--       la fila (PostgREST devuelve 201 sin datos).
--     - El fire-and-forget sync en store.tsx no bloquea el dispatch,
--       asi que el UI muestra la oportunidad (esta en Redux).
--     - Al recargar, el hydrate SELECT no encuentra la fila
--       (USING evalua false) -> la oportunidad "desaparece".
--
-- Fix:
--   Cambiar a `auth.uid() IS NOT NULL` en USING y WITH CHECK.
--   auth.uid() lee el claim "sub" (user UUID), que se establece
--   siempre que la sesion es valida, independiente del role.
--   Es el chequeo recomendado por Supabase para "cualquier usuario
--   autenticado".
--
-- Verificacion post-aplicacion:
--   1. Login con presupuestos2@durata.co
--   2. Crear oportunidad desde el UI
--   3. Recargar la pagina -> la oportunidad debe seguir ahi
--   4. Correr la query SELECT al final para confirmar policies
-- ============================================================

-- 1. empresas
DROP POLICY IF EXISTS "Allow all for anon" ON empresas;
DROP POLICY IF EXISTS "authenticated_access" ON empresas;
CREATE POLICY "authenticated_access" ON empresas
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 2. contactos
DROP POLICY IF EXISTS "Allow all for anon" ON contactos;
DROP POLICY IF EXISTS "authenticated_access" ON contactos;
CREATE POLICY "authenticated_access" ON contactos
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 3. oportunidades
DROP POLICY IF EXISTS "Allow all for anon" ON oportunidades;
DROP POLICY IF EXISTS "authenticated_access" ON oportunidades;
CREATE POLICY "authenticated_access" ON oportunidades
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 4. historial_etapas
DROP POLICY IF EXISTS "Allow all for anon" ON historial_etapas;
DROP POLICY IF EXISTS "authenticated_access" ON historial_etapas;
CREATE POLICY "authenticated_access" ON historial_etapas
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 5. productos_oportunidad
DROP POLICY IF EXISTS "Allow all for anon" ON productos_oportunidad;
DROP POLICY IF EXISTS "authenticated_access" ON productos_oportunidad;
CREATE POLICY "authenticated_access" ON productos_oportunidad
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 6. cotizaciones
DROP POLICY IF EXISTS "Allow all for anon" ON cotizaciones;
DROP POLICY IF EXISTS "authenticated_access" ON cotizaciones;
CREATE POLICY "authenticated_access" ON cotizaciones
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 7. precios_maestro
DROP POLICY IF EXISTS "Allow all for anon" ON precios_maestro;
DROP POLICY IF EXISTS "authenticated_access" ON precios_maestro;
CREATE POLICY "authenticated_access" ON precios_maestro
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 8. configuracion_sistema
DROP POLICY IF EXISTS "Allow all for anon" ON configuracion_sistema;
DROP POLICY IF EXISTS "authenticated_access" ON configuracion_sistema;
CREATE POLICY "authenticated_access" ON configuracion_sistema
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 9. tarifas_mo (unused but secure it anyway)
DROP POLICY IF EXISTS "Allow all for anon" ON tarifas_mo;
DROP POLICY IF EXISTS "authenticated_access" ON tarifas_mo;
CREATE POLICY "authenticated_access" ON tarifas_mo
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Verify: list all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;

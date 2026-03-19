-- ============================================================
-- DURATA CRM — Schema SQL para Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- Extensión UUID (habilitada por defecto en Supabase)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. EMPRESAS
-- ============================================================
CREATE TABLE IF NOT EXISTS empresas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      text NOT NULL,
  nit         text DEFAULT '',
  sector      text DEFAULT 'Otro',
  direccion   text DEFAULT '',
  notas       text DEFAULT '',
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_empresas_nombre ON empresas (nombre);

-- ============================================================
-- 2. CONTACTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS contactos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id  uuid REFERENCES empresas(id) ON DELETE CASCADE,
  nombre      text NOT NULL,
  cargo       text DEFAULT '',
  correo      text DEFAULT '',
  whatsapp    text DEFAULT '',
  notas       text DEFAULT '',
  created_at  timestamptz DEFAULT now()
);

-- ============================================================
-- 3. OPORTUNIDADES
-- ============================================================
CREATE TABLE IF NOT EXISTS oportunidades (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id            uuid REFERENCES empresas(id) ON DELETE SET NULL,
  contacto_id           uuid REFERENCES contactos(id) ON DELETE SET NULL,
  etapa                 text NOT NULL DEFAULT 'nuevo_lead',
  valor_estimado        numeric DEFAULT 0,
  valor_cotizado        numeric DEFAULT 0,
  valor_adjudicado      numeric DEFAULT 0,
  cotizador_asignado    text DEFAULT '',
  fuente_lead           text DEFAULT 'Otro',
  motivo_perdida        text DEFAULT '',
  ubicacion             text DEFAULT '',
  fecha_ingreso         date DEFAULT CURRENT_DATE,
  fecha_envio           date,
  fecha_adjudicacion    date,
  fecha_ultimo_contacto date DEFAULT CURRENT_DATE,
  notas                 text DEFAULT '',
  created_at            timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oportunidades_etapa ON oportunidades (etapa);

-- ============================================================
-- 4. HISTORIAL DE ETAPAS
-- ============================================================
CREATE TABLE IF NOT EXISTS historial_etapas (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  oportunidad_id  uuid REFERENCES oportunidades(id) ON DELETE CASCADE,
  etapa_anterior  text NOT NULL,
  etapa_nueva     text NOT NULL,
  created_at      timestamptz DEFAULT now()
);

-- ============================================================
-- 5. PRODUCTOS DE OPORTUNIDAD
-- ============================================================
CREATE TABLE IF NOT EXISTS productos_oportunidad (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  oportunidad_id        uuid REFERENCES oportunidades(id) ON DELETE CASCADE,
  categoria             text DEFAULT '',
  subtipo               text DEFAULT '',
  configuracion         jsonb DEFAULT '{}',
  apu_resultado         jsonb,
  precio_calculado      numeric DEFAULT 0,
  descripcion_comercial text DEFAULT '',
  cantidad              int DEFAULT 1,
  created_at            timestamptz DEFAULT now()
);

-- ============================================================
-- 6. COTIZACIONES
-- ============================================================
CREATE TABLE IF NOT EXISTS cotizaciones (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  oportunidad_id      uuid REFERENCES oportunidades(id) ON DELETE CASCADE,
  numero              text UNIQUE NOT NULL,
  fecha               date DEFAULT CURRENT_DATE,
  fecha_envio         date,
  estado              text DEFAULT 'borrador',
  total               numeric DEFAULT 0,
  productos_snapshot  jsonb DEFAULT '[]',
  tiempo_entrega      text DEFAULT '',
  incluye_transporte  boolean DEFAULT true,
  condiciones_items   jsonb DEFAULT '[]',
  no_incluye_items    jsonb DEFAULT '[]',
  created_at          timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cotizaciones_numero ON cotizaciones (numero);

-- ============================================================
-- 7. PRECIOS MAESTRO
-- ============================================================
CREATE TABLE IF NOT EXISTS precios_maestro (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo       text DEFAULT 'OTROS',
  subgrupo    text DEFAULT '',
  nombre      text NOT NULL,
  codigo      text UNIQUE,          -- NULL for items without warehouse code
  unidad      text DEFAULT 'und',
  precio      numeric DEFAULT 0,
  proveedor   text DEFAULT '',
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_precios_maestro_codigo ON precios_maestro (codigo);

-- ============================================================
-- 8. TARIFAS MANO DE OBRA
-- ============================================================
CREATE TABLE IF NOT EXISTS tarifas_mo (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  concepto    text NOT NULL,
  unidad      text DEFAULT 'ml',
  tarifa      numeric DEFAULT 0,
  updated_at  timestamptz DEFAULT now()
);

-- ============================================================
-- 9. CONFIGURACIÓN DEL SISTEMA
-- ============================================================
CREATE TABLE IF NOT EXISTS configuracion_sistema (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clave       text UNIQUE NOT NULL,
  valor       jsonb DEFAULT '{}',
  updated_at  timestamptz DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY — Permisivo para anon (sin auth por ahora)
-- ============================================================

ALTER TABLE empresas             ENABLE ROW LEVEL SECURITY;
ALTER TABLE contactos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE oportunidades        ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_etapas     ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_oportunidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones         ENABLE ROW LEVEL SECURITY;
ALTER TABLE precios_maestro      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarifas_mo              ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_sistema   ENABLE ROW LEVEL SECURITY;

-- Policies: permitir todo para anon y authenticated
CREATE POLICY "Allow all for anon" ON empresas              FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON contactos              FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON oportunidades          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON historial_etapas       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON productos_oportunidad  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON cotizaciones           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON precios_maestro        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON tarifas_mo              FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON configuracion_sistema   FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- AUTH: Crear usuarios en Supabase Dashboard → Authentication → Users → Add user
-- Email provider debe estar habilitado (Settings → Authentication → Providers → Email)
-- Deshabilitar "Confirm email" para uso interno
--
-- Usuarios a crear:
--   saguirre@durata.co    / Durata2026!  (Sebastián Aguirre - Director Comercial)
--   presupuestos@durata.co / Durata2026!  (Omar Cossio - Comercial)
--   presupuestos2@durata.co / Durata2026! (Juan Pablo Ramírez - Comercial)
--   caraque@durata.co     / Durata2026!  (Camilo Araque - Comercial)
--   dgalindo@durata.co    / Durata2026!  (Daniela Galindo - Comercial)
--
-- TODO FASE 2 - RLS con auth:
-- Actualmente las políticas son USING (true) para rol anon.
-- Cuando se active RLS por usuario autenticado:
--   1. Cambiar políticas a USING (auth.role() = 'authenticated')
--   2. Agregar campo user_id a oportunidades, cotizaciones
--   3. Crear políticas per-cotizador si se necesita aislamiento
-- ============================================================

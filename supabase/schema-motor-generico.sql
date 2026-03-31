-- ============================================================
-- SCHEMA: Motor Genérico de Cálculo APU
-- ============================================================
-- Estas tablas alimentan el motor data-driven en:
--   src/lib/evaluar-formula.ts  (evaluador de fórmulas)
--   src/lib/motor-generico.ts   (bridge ConfigMesa <-> fórmulas)
--
-- Ejecutar en Supabase SQL Editor sobre una DB vacía o existente.
-- Las tablas usan IF NOT EXISTS para ser idempotentes.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. productos_catalogo
-- ────────────────────────────────────────────────────────────
-- Catálogo de productos configurables (Mesa, Cárcamo, Estantería, etc.)
-- Cada producto tiene su propia definición de variables, materiales y líneas APU.
CREATE TABLE IF NOT EXISTS productos_catalogo (
  id             text PRIMARY KEY,                    -- ej: 'mesa', 'carcamo', 'estanteria_graduable'
  nombre         text NOT NULL,                       -- Nombre comercial: 'Mesa', 'Cárcamo'
  grupo          text NOT NULL DEFAULT '',             -- Agrupación: 'Mesas', 'Cárcamos', 'Estanterías'
  margen_default real NOT NULL DEFAULT 0.38,           -- Margen de utilidad por defecto (38%)
  activo         boolean NOT NULL DEFAULT true,        -- Si está disponible para configurar
  orden          integer NOT NULL DEFAULT 0,           -- Orden de aparición en UI
  created_at     timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE productos_catalogo IS 'Catálogo de productos configurables del motor genérico APU';
COMMENT ON COLUMN productos_catalogo.id IS 'Identificador slug del producto (mesa, carcamo, etc.)';
COMMENT ON COLUMN productos_catalogo.margen_default IS 'Margen de utilidad por defecto (0.38 = 38%)';

-- ────────────────────────────────────────────────────────────
-- 2. producto_variables
-- ────────────────────────────────────────────────────────────
-- Variables configurables por el usuario para cada producto.
-- Definen los sliders, selects y toggles del ConfiguradorGenerico.
-- Los nombres de las variables se usan en las fórmulas de producto_lineas_apu.
CREATE TABLE IF NOT EXISTS producto_variables (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  producto_id    text NOT NULL REFERENCES productos_catalogo(id) ON DELETE CASCADE,
  nombre         text NOT NULL,                       -- Nombre de la variable en fórmulas: 'largo', 'ancho', 'calibre_cuerpo'
  label          text NOT NULL,                       -- Label para UI: 'Largo (m)', 'Calibre cuerpo'
  tipo           text NOT NULL DEFAULT 'numero',      -- 'numero' | 'seleccion' | 'toggle' | 'calculado'
  default_valor  text NOT NULL DEFAULT '0',            -- Valor por defecto como string
  min_val        real,                                 -- Mínimo para tipo=numero
  max_val        real,                                 -- Máximo para tipo=numero
  unidad         text,                                 -- 'm', 'und', 'mm', etc.
  grupo_ui       text NOT NULL DEFAULT 'General',      -- Sección en el UI: 'Dimensiones principales', 'Material'
  orden          integer NOT NULL DEFAULT 0,           -- Orden dentro del grupo
  opciones       jsonb,                                -- Para tipo=seleccion: ["18", "16", "14"]
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE(producto_id, nombre)
);

COMMENT ON TABLE producto_variables IS 'Variables configurables por producto — alimentan sliders/selects del configurador';
COMMENT ON COLUMN producto_variables.nombre IS 'Nombre usado en fórmulas de producto_lineas_apu (ej: largo, calibre_cuerpo)';
COMMENT ON COLUMN producto_variables.tipo IS 'numero=slider, seleccion=dropdown, toggle=switch, calculado=derivado';
COMMENT ON COLUMN producto_variables.opciones IS 'Array JSON de opciones para tipo seleccion';

-- ────────────────────────────────────────────────────────────
-- 3. producto_materiales
-- ────────────────────────────────────────────────────────────
-- Templates de materiales — mapean un alias a un nombre de material
-- en precios_maestro, con soporte para variables ({calibre}, {tipo_acero}).
-- También soportan precios fijos (es_fijo=true) para items como argón, empaque.
CREATE TABLE IF NOT EXISTS producto_materiales (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  producto_id     text NOT NULL REFERENCES productos_catalogo(id) ON DELETE CASCADE,
  alias           text NOT NULL,                      -- Alias usado en producto_lineas_apu.material_alias
  template_nombre text NOT NULL,                      -- Template con variables: 'LAMINA ACERO CAL {calibre_cuerpo}'
  es_fijo         boolean NOT NULL DEFAULT false,      -- true = usa precio_fijo, false = busca en precios_maestro
  precio_fijo     real,                                -- Precio fijo cuando es_fijo=true
  codigo          text,                                -- Código SKU para lookup directo en precios_maestro
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(producto_id, alias)
);

COMMENT ON TABLE producto_materiales IS 'Templates de materiales por producto — resuelven alias a precios';
COMMENT ON COLUMN producto_materiales.alias IS 'Alias referenciado desde producto_lineas_apu.material_alias';
COMMENT ON COLUMN producto_materiales.template_nombre IS 'Nombre con placeholders {variable} que se resuelven con valores del usuario';
COMMENT ON COLUMN producto_materiales.codigo IS 'Código SKU para lookup directo en precios_maestro (más confiable que nombre)';

-- ────────────────────────────────────────────────────────────
-- 4. producto_lineas_apu
-- ────────────────────────────────────────────────────────────
-- Líneas del APU — cada línea tiene una fórmula de cantidad que se evalúa
-- con las variables del usuario. El motor calcula: cantidad * precio * (1 + desperdicio).
-- Secciones: 'insumos', 'mo', 'transporte', 'laser', 'poliza', 'addon', 'otros'
CREATE TABLE IF NOT EXISTS producto_lineas_apu (
  id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  producto_id      text NOT NULL REFERENCES productos_catalogo(id) ON DELETE CASCADE,
  seccion          text NOT NULL DEFAULT 'insumos',   -- 'insumos' | 'mo' | 'transporte' | 'laser' | 'poliza' | 'addon' | 'otros'
  orden            integer NOT NULL DEFAULT 0,        -- Orden dentro de la sección
  descripcion      text NOT NULL,                     -- Texto descriptivo: 'Acero Cuerpo', 'MO Soldadura'
  material_alias   text NOT NULL DEFAULT '',           -- Alias del material en producto_materiales (o tarifa MO)
  formula_cantidad text NOT NULL DEFAULT '0',          -- Fórmula evaluable: 'largo*ancho*2 + alto*largo*2'
  desperdicio      real NOT NULL DEFAULT 0,            -- Factor de desperdicio: 0.10 = 10%
  condicion        text,                               -- Condición para activar la línea: 'babero == 1', 'instalacion == 1'
  margen_override  real,                               -- Override de margen para esta línea específica
  nota             text,                               -- Nota interna
  created_at       timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE producto_lineas_apu IS 'Líneas de cálculo APU por producto — cada línea tiene fórmula de cantidad';
COMMENT ON COLUMN producto_lineas_apu.formula_cantidad IS 'Expresión evaluable con mathjs: soporta variables, ceil(), max(), IF, ROUNDUP, CEILING';
COMMENT ON COLUMN producto_lineas_apu.condicion IS 'Expresión booleana — si evalúa a 0/false, la línea se desactiva';
COMMENT ON COLUMN producto_lineas_apu.desperdicio IS 'Factor multiplicador de desperdicio (0.10 = +10% sobre cantidad*precio)';

-- ────────────────────────────────────────────────────────────
-- 5. tarifas_mo_producto
-- ────────────────────────────────────────────────────────────
-- Tarifas de mano de obra específicas por producto.
-- El motor busca primero aquí (por codigo = material_alias),
-- antes de buscar en producto_materiales.
CREATE TABLE IF NOT EXISTS tarifas_mo_producto (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  producto_id  text NOT NULL REFERENCES productos_catalogo(id) ON DELETE CASCADE,
  codigo       text NOT NULL,                          -- Código MO: 'MO_ACERO', 'MO_PULIDO', 'mo_sold_carc'
  descripcion  text NOT NULL DEFAULT '',               -- Descripción: 'Mano de obra soldadura'
  precio       real NOT NULL DEFAULT 0,                -- Tarifa por unidad
  unidad       text NOT NULL DEFAULT 'ml',             -- 'ml', 'und', 'm²', 'hr'
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(producto_id, codigo)
);

COMMENT ON TABLE tarifas_mo_producto IS 'Tarifas de mano de obra por producto — lookup por codigo = material_alias';

-- ────────────────────────────────────────────────────────────
-- Row Level Security
-- ────────────────────────────────────────────────────────────
-- Todas las tablas requieren autenticación para lectura/escritura.

ALTER TABLE productos_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE producto_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE producto_materiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE producto_lineas_apu ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarifas_mo_producto ENABLE ROW LEVEL SECURITY;

-- Read access for authenticated users
CREATE POLICY IF NOT EXISTS "productos_catalogo_read" ON productos_catalogo
  FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "producto_variables_read" ON producto_variables
  FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "producto_materiales_read" ON producto_materiales
  FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "producto_lineas_apu_read" ON producto_lineas_apu
  FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "tarifas_mo_producto_read" ON tarifas_mo_producto
  FOR SELECT TO authenticated USING (true);

-- Write access for authenticated users (admin operations)
CREATE POLICY IF NOT EXISTS "productos_catalogo_write" ON productos_catalogo
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "producto_variables_write" ON producto_variables
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "producto_materiales_write" ON producto_materiales
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "producto_lineas_apu_write" ON producto_lineas_apu
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "tarifas_mo_producto_write" ON tarifas_mo_producto
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_producto_variables_producto ON producto_variables(producto_id);
CREATE INDEX IF NOT EXISTS idx_producto_materiales_producto ON producto_materiales(producto_id);
CREATE INDEX IF NOT EXISTS idx_producto_lineas_apu_producto ON producto_lineas_apu(producto_id, orden);
CREATE INDEX IF NOT EXISTS idx_tarifas_mo_producto_producto ON tarifas_mo_producto(producto_id);

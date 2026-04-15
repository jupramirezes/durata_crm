-- ============================================================
-- PRODUCTO: Estantería Perforada
-- ID: a28c1c1d-13f6-45b1-b4e1-6424b7e5f999
-- Grupo: estanterias
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = 'a28c1c1d-13f6-45b1-b4e1-6424b7e5f999';
DELETE FROM producto_lineas_apu WHERE producto_id = 'a28c1c1d-13f6-45b1-b4e1-6424b7e5f999';
DELETE FROM producto_materiales WHERE producto_id = 'a28c1c1d-13f6-45b1-b4e1-6424b7e5f999';
DELETE FROM producto_variables WHERE producto_id = 'a28c1c1d-13f6-45b1-b4e1-6424b7e5f999';
DELETE FROM productos_catalogo WHERE id = 'a28c1c1d-13f6-45b1-b4e1-6424b7e5f999';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'Estantería Perforada', 'estanterias', 38, '[instalado:Suministro e instalación de|Suministro de] estantería perforada en acero inoxidable 304 satinado de {largo} m de largo x {ancho} m de ancho x {alto} m de alto, con {num_entrepanos} entrepaños perforados en cal 18 satinado con omegas de refuerzo, {num_patas} parales en lámina cal 12 2B con niveladores, soldadura TIG con gas argón, acabado pulido satinado. [poliza:Incluye póliza.|Sin póliza.]', true, 32);

-- producto_variables (8)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'largo', 'Largo', 'numero', '2', 0.5, 4, NULL, 'Dimensiones', 1, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'ancho', 'Ancho', 'numero', '0.65', 0.3, 1.5, NULL, 'Dimensiones', 2, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'alto', 'Alto', 'numero', '1.8', 0.5, 2.5, NULL, 'Dimensiones', 3, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'num_entrepanos', '# Entrepaños', 'numero', '4', 1, 8, NULL, 'Estructura', 4, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'num_patas', '# Patas', 'numero', '4', 2, 8, NULL, 'Estructura', 5, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'instalado', 'Incluye Instalación', 'toggle', 'true', NULL, NULL, NULL, 'Extras', 6, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'poliza', 'Requiere Póliza', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 7, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'poliza_pct', 'Póliza %', 'numero', '2', 1, 10, NULL, 'Extras', 8, NULL, NULL);

-- producto_materiales (23)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'acero_entrepano', 'Acero entrepaño cal 18 sat', false, NULL, 'm²', 'AILA010218'),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'acero_omegas', 'Acero omegas cal 18 2B', false, NULL, 'm²', 'AILA010118'),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'acero_patas', 'Acero patas cal 12 2B', false, NULL, 'm²', 'AILA010112'),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'niveladores', 'Niveladores + tornillo + tuerca', false, NULL, 'und', 'FENI010118'),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'disco_corte', 'Disco de corte', false, NULL, 'und', 'ABDI100124'),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'disco_flap', 'Disco flap', false, NULL, 'und', 'ABDI802060'),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'pano', 'Paño Scotch Brite', false, NULL, 'und', 'ABPA020001'),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'lija', 'Lija zirconio', false, NULL, 'und', 'ABLI202080'),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'grata', 'Grata', false, NULL, 'und', 'ABGR200019'),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'mo_instalacion', 'MO Instalación', true, 16650, 'und', ''),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'tte_elementos', 'TTE Elementos', true, 35000, 'und', ''),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'tte_ida', 'TTE Personal Ida', true, 0, 'und', ''),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'tte_regreso', 'TTE Personal Regreso', true, 10000, 'und', ''),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'laser', 'Corte láser', true, 6500, 'und', ''),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'tornillos', 'Tornillos fijación entrepaños', true, 800, 'und', ''),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'cinta', 'Cinta 3M', true, 11500, 'ml', ''),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'argon', 'Argón', true, 4500, 'und', ''),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'empaque', 'Empaque y embalaje', true, 8000, 'und', ''),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'mo_acero', 'MO Acero', true, 31080, 'und', ''),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'mo_pulido', 'MO Pulido', true, 12210, 'und', ''),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'mo_parales', 'MO Pulida parales con argón', true, 24420, 'und', ''),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'mo_ensamble', 'MO Ensamble', true, 29970, 'und', ''),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'mo_laser_parales', 'MO Láser parales', true, 6500, 'und', '');

-- producto_lineas_apu (24)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'insumos', 1, 'Acero entrepaño cal 18 sat', 'acero_entrepano', '(largo + 0.13) * (ancho + 0.13) * num_entrepanos', 0, NULL, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'insumos', 2, 'Acero omegas cal 18 2B', 'acero_omegas', '0.2 * largo * num_entrepanos + 0.15 * ancho * 2 * num_entrepanos', 0, NULL, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'insumos', 3, 'Acero patas cal 12 2B', 'acero_patas', 'alto * num_patas * 0.13', 0, NULL, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'insumos', 4, 'Niveladores', 'niveladores', 'num_patas', 0, NULL, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'insumos', 5, 'Tornillos fijación entrepaños', 'tornillos', '8 * num_entrepanos', 0, NULL, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'insumos', 6, 'Cinta 3M', 'cinta', 'largo * num_entrepanos + ancho * num_entrepanos', 0, NULL, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'insumos', 7, 'Argón', 'argon', 'largo * num_entrepanos', 0, NULL, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'insumos', 8, 'Disco de corte', 'disco_corte', 'largo * num_entrepanos / 4', 0, NULL, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'insumos', 9, 'Disco flap', 'disco_flap', 'largo * num_entrepanos / 4', 0, NULL, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'insumos', 10, 'Paño Scotch Brite', 'pano', 'largo * num_entrepanos / 3', 0, NULL, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'insumos', 11, 'Lija zirconio', 'lija', 'largo * num_entrepanos / 3', 0, NULL, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'insumos', 12, 'Grata', 'grata', 'largo * num_entrepanos / 10', 0, NULL, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'insumos', 13, 'Empaque y embalaje', 'empaque', 'largo / 1.5', 0, NULL, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'mo', 14, 'MO Acero', 'mo_acero', 'largo * num_entrepanos', 0, NULL, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'mo', 15, 'MO Pulido', 'mo_pulido', 'largo * num_entrepanos', 0, NULL, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'mo', 16, 'MO Pulida parales con argón', 'mo_parales', 'num_patas', 0, NULL, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'mo', 17, 'MO Ensamble', 'mo_ensamble', '1', 0, NULL, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'mo', 18, 'MO Láser parales', 'mo_laser_parales', 'num_patas * 5', 0, NULL, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'mo', 19, 'MO Instalación', 'mo_instalacion', 'IF(instalado, largo, 0)', 0, NULL, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'transporte', 20, 'TTE Elementos', 'tte_elementos', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'transporte', 21, 'TTE Personal Ida', 'tte_ida', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'transporte', 22, 'TTE Personal Regreso', 'tte_regreso', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'laser', 23, 'Corte láser entrepaños', 'laser', '3 * largo * num_entrepanos', 0, NULL, NULL, NULL),
  ('a28c1c1d-13f6-45b1-b4e1-6424b7e5f999', 'poliza', 24, 'Póliza', NULL, '1', 0, 'poliza', NULL, NULL);


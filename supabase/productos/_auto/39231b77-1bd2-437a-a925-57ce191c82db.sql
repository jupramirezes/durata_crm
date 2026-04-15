-- ============================================================
-- PRODUCTO: Caja Sifonada Hierro
-- ID: 39231b77-1bd2-437a-a925-57ce191c82db
-- Grupo: accesorios
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = '39231b77-1bd2-437a-a925-57ce191c82db';
DELETE FROM producto_lineas_apu WHERE producto_id = '39231b77-1bd2-437a-a925-57ce191c82db';
DELETE FROM producto_materiales WHERE producto_id = '39231b77-1bd2-437a-a925-57ce191c82db';
DELETE FROM producto_variables WHERE producto_id = '39231b77-1bd2-437a-a925-57ce191c82db';
DELETE FROM productos_catalogo WHERE id = '39231b77-1bd2-437a-a925-57ce191c82db';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'Caja Sifonada Hierro', 'accesorios', 38, '[instalado:Suministro e instalación de|Suministro de] caja sifonada en lámina de hierro CR calibre 18, de {largo} m de largo x {ancho} m de ancho x {alto} m de alto, con tapa punzonada en lámina cal.12, rejilla en platina de hierro 1 pulg x 1/4 pulg, granada colectora en lámina cal.20, desagüe en tubo cuadrado 2 pulg cal.18, soldadura TIG con gas argón, acabado con pulido y satinado. [poliza:Incluye póliza.|Sin póliza.]', true, 23);

-- producto_variables (7)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'largo', 'Largo', 'numero', '0.3', 0.1, 1.5, NULL, 'Dimensiones', 1, NULL, NULL),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'ancho', 'Ancho', 'numero', '0.3', 0.1, 1.5, NULL, 'Dimensiones', 2, NULL, NULL),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'alto', 'Alto', 'numero', '0.25', 0.1, 0.8, NULL, 'Dimensiones', 3, NULL, NULL),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'largo_tubo_desague', 'Largo Tubo Desagüe', 'numero', '0.2', 0.1, 1, NULL, 'Configuración', 4, NULL, NULL),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'instalado', 'Incluye Instalación', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 5, NULL, NULL),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'poliza', 'Requiere Póliza', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 6, NULL, NULL),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'poliza_pct', 'Póliza %', 'numero', '2', 1, 10, NULL, 'Extras', 7, NULL, NULL);

-- producto_materiales (21)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'acero_cuerpo', 'Acero cuerpo hierro cal 18', false, NULL, 'm²', 'HLL0001018'),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'acero_pestanas', 'Acero pestañas hierro cal 18', false, NULL, 'm²', 'HLL0001018'),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'tapa', 'Tapa punzonada cal 12', false, NULL, 'm²', 'HLL0001012'),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'granada', 'Granada lámina cal 20', false, NULL, 'm²', 'HLL0001020'),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'platina', 'Platina 1"x1/4" rejilla', false, NULL, 'ml', 'HPL1600004'),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'tubo_desague', 'Tubo desagüe 2" cal 18', false, NULL, 'ml', 'HTMC019018'),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'argon', 'Argón', true, 3000, 'und', ''),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'disco_corte', 'Disco de corte', false, NULL, 'und', 'ABDI100124'),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'disco_flap', 'Disco flap', false, NULL, 'und', 'ABDI802060'),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'pano', 'Paño Scotch Brite', false, NULL, 'und', 'ABPA020001'),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'lija', 'Lija zirconio', false, NULL, 'und', 'ABLI202080'),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'grata', 'Grata', false, NULL, 'und', 'ABGR200019'),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'empaque', 'Empaque y embalaje', true, 1500, 'und', ''),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'mo_soldadura', 'MO Soldadura', true, 33000, 'und', ''),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'mo_pulido', 'MO Pulido', true, 22000, 'und', ''),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'mo_punzonado', 'MO Punzonado', true, 74479, 'und', ''),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'mo_dobles', 'MO Dobles', true, 700, 'und', ''),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'tte_elementos', 'TTE Elementos', true, 0, 'und', ''),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'tte_ida', 'TTE Personal Ida', true, 15000, 'und', ''),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'tte_regreso', 'TTE Personal Regreso', true, 0, 'und', ''),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'laser', 'Corte láser', true, 6500, 'und', '');

-- producto_lineas_apu (21)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'insumos', 1, 'Acero cuerpo hierro cal 18', 'acero_cuerpo', '((alto * (largo - 0.1) * 2) + ((ancho - 0.1) * alto * 2)) + (largo * ancho)', 0, NULL, NULL, NULL),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'insumos', 2, 'Acero pestañas', 'acero_pestanas', '((largo * 0.05) * 2) + ((ancho * 0.05) * 2)', 0, NULL, NULL, NULL),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'insumos', 3, 'Tapa punzonada cal 12', 'tapa', 'largo * ancho * 2', 0, NULL, NULL, NULL),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'insumos', 4, 'Granada lámina cal 20', 'granada', '(2 * 3.1416 * 0.0384 * 0.15) + 0.05', 0, NULL, NULL, NULL),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'insumos', 5, 'Platina 1"x1/4" rejilla', 'platina', 'largo * 3 + ancho * 2', 0, NULL, NULL, NULL),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'insumos', 6, 'Tubo desagüe 2" cal 18', 'tubo_desague', 'largo_tubo_desague', 0, NULL, NULL, NULL),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'insumos', 7, 'Argón', 'argon', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'insumos', 8, 'Disco de corte', 'disco_corte', 'largo / 2', 0, NULL, NULL, NULL),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'insumos', 9, 'Disco flap', 'disco_flap', 'largo / 2', 0, NULL, NULL, NULL),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'insumos', 10, 'Paño Scotch Brite', 'pano', 'largo / 2', 0, NULL, NULL, NULL),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'insumos', 11, 'Lija zirconio', 'lija', 'largo / 4', 0, NULL, NULL, NULL),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'insumos', 12, 'Grata', 'grata', 'largo / 5', 0, NULL, NULL, NULL),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'insumos', 13, 'Empaque y embalaje', 'empaque', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'mo', 14, 'MO Soldadura', 'mo_soldadura', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'mo', 15, 'MO Pulido', 'mo_pulido', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'mo', 16, 'MO Punzonado', 'mo_punzonado', 'largo * ancho * 2', 0, NULL, NULL, NULL),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'mo', 17, 'MO Dobles', 'mo_dobles', '14', 0, NULL, NULL, NULL),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'transporte', 18, 'TTE Elementos', 'tte_elementos', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'transporte', 19, 'TTE Personal Ida', 'tte_ida', '1', 0, NULL, NULL, NULL),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'transporte', 20, 'TTE Personal Regreso', 'tte_regreso', '1', 0, NULL, NULL, NULL),
  ('39231b77-1bd2-437a-a925-57ce191c82db', 'poliza', 21, 'Póliza', NULL, '1', 0, 'poliza', NULL, NULL);


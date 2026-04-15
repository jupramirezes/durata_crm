-- ============================================================
-- PRODUCTO: Caja Sifonada Inox
-- ID: 3547a7da-459a-4d69-9ba9-c63e4be290b2
-- Grupo: accesorios
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = '3547a7da-459a-4d69-9ba9-c63e4be290b2';
DELETE FROM producto_lineas_apu WHERE producto_id = '3547a7da-459a-4d69-9ba9-c63e4be290b2';
DELETE FROM producto_materiales WHERE producto_id = '3547a7da-459a-4d69-9ba9-c63e4be290b2';
DELETE FROM producto_variables WHERE producto_id = '3547a7da-459a-4d69-9ba9-c63e4be290b2';
DELETE FROM productos_catalogo WHERE id = '3547a7da-459a-4d69-9ba9-c63e4be290b2';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'Caja Sifonada Inox', 'accesorios', 38, '[instalado:Suministro e instalación de|Suministro de] caja sifonada en acero inoxidable AISI 304 mate calibre 18 de {largo} m de largo x {ancho} m de ancho x {alto} m de profundidad, con tapa punzonada en lámina 3mm, granada en lámina cal 20, rejilla en platina inox 1 pulg x 1/4 pulg y tubo de desagüe de 2 pulg cal 18. Soldadura TIG con gas argón. Acabado pulido grado alimentario. [poliza:Incluye póliza.|Sin póliza.]', true, 24);

-- producto_variables (7)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'largo', 'Largo', 'numero', '0.3', 0.1, 1.5, NULL, 'Dimensiones', 1, NULL, NULL),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'ancho', 'Ancho', 'numero', '0.3', 0.1, 1.5, NULL, 'Dimensiones', 2, NULL, NULL),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'alto', 'Alto', 'numero', '0.25', 0.1, 0.8, NULL, 'Dimensiones', 3, NULL, NULL),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'largo_tubo_desague', 'Largo Tubo Desagüe', 'numero', '0.2', 0.1, 1, NULL, 'Configuración', 4, NULL, NULL),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'instalado', 'Incluye Instalación', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 5, NULL, NULL),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'poliza', 'Requiere Póliza', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 6, NULL, NULL),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'poliza_pct', 'Póliza %', 'numero', '2', 1, 10, NULL, 'Extras', 7, NULL, NULL);

-- producto_materiales (20)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'acero_cuerpo', 'Acero cuerpo cal 18', false, NULL, 'm²', 'AILA010118'),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'acero_tapa_int', 'Acero tapa interna cal 18', false, NULL, 'm²', 'AILA010118'),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'tapa_punzonada', 'Tapa punzonada lámina 3mm', false, NULL, 'm²', 'AILA010106'),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'granada', 'Granada lámina cal 20', false, NULL, 'm²', 'AILA010120'),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'platina', 'Platina inox 1"x1/4" rejilla', false, NULL, 'ml', 'AIPL080004'),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'tubo_desague', 'Tubo desagüe 2" cal 18', false, NULL, 'ml', 'AITR190018'),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'argon', 'Argón', true, 10000, 'und', ''),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'disco_corte', 'Disco de corte', false, NULL, 'und', 'ABDI100124'),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'disco_flap', 'Disco flap', false, NULL, 'und', 'ABDI802060'),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'pano', 'Paño Scotch Brite', false, NULL, 'und', 'ABPA020001'),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'lija', 'Lija zirconio', false, NULL, 'und', 'ABLI202080'),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'grata', 'Grata', false, NULL, 'und', 'ABGR200019'),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'empaque', 'Empaque y embalaje', true, 3500, 'und', ''),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'mo_soldadura', 'MO Soldadura', true, 83250, 'und', ''),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'mo_pulido', 'MO Pulido', true, 38850, 'und', ''),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'mo_dobles', 'MO Dobles', true, 1665, 'und', ''),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'tte_elementos', 'TTE Elementos', true, 30000, 'und', ''),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'tte_ida', 'TTE Personal Ida', true, 0, 'und', ''),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'tte_regreso', 'TTE Personal Regreso', true, 0, 'und', ''),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'laser', 'Corte láser', true, 6500, 'und', '');

-- producto_lineas_apu (21)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'insumos', 1, 'Acero cuerpo cal 18', 'acero_cuerpo', '(alto + 0.08 + largo + alto) * ancho + (ancho * (alto + 0.04) * 2)', 0, NULL, NULL, NULL),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'insumos', 2, 'Acero tapa interna cal 18', 'acero_tapa_int', '(largo + 0.1) * (ancho + 0.1)', 0, NULL, NULL, NULL),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'insumos', 3, 'Tapa punzonada lámina 3mm', 'tapa_punzonada', 'largo * ancho', 0, NULL, NULL, NULL),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'insumos', 4, 'Granada lámina cal 20', 'granada', '((2 * 3.1416 * 0.0384 * 0.15) + 0.05) * 2', 0, NULL, NULL, NULL),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'insumos', 5, 'Platina inox 1"x1/4" rejilla', 'platina', 'largo * 3 + ancho * 3', 0, NULL, NULL, NULL),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'insumos', 6, 'Tubo desagüe 2" cal 18', 'tubo_desague', 'largo_tubo_desague', 0, NULL, NULL, NULL),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'insumos', 7, 'Argón', 'argon', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'insumos', 8, 'Disco de corte', 'disco_corte', 'IF(largo < 1, 1, largo) / 2', 0, NULL, NULL, NULL),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'insumos', 9, 'Disco flap', 'disco_flap', 'IF(largo < 1, 1, largo) / 2', 0, NULL, NULL, NULL),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'insumos', 10, 'Paño Scotch Brite', 'pano', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'insumos', 11, 'Lija zirconio', 'lija', 'largo / 2', 0, NULL, NULL, NULL),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'insumos', 12, 'Grata', 'grata', 'largo / 5', 0, NULL, NULL, NULL),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'insumos', 13, 'Empaque y embalaje', 'empaque', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'mo', 14, 'MO Soldadura', 'mo_soldadura', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'mo', 15, 'MO Pulido', 'mo_pulido', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'mo', 16, 'MO Dobles', 'mo_dobles', '14', 0, NULL, NULL, NULL),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'transporte', 17, 'TTE Elementos', 'tte_elementos', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'transporte', 18, 'TTE Personal Ida', 'tte_ida', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'transporte', 19, 'TTE Personal Regreso', 'tte_regreso', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'laser', 20, 'Corte láser', 'laser', '7', 0, NULL, NULL, NULL),
  ('3547a7da-459a-4d69-9ba9-c63e4be290b2', 'poliza', 21, 'Póliza', NULL, '1', 0, 'poliza', NULL, NULL);


-- ============================================================
-- PRODUCTO: Cárcamo
-- ID: carcamo
-- Grupo: Cárcamos
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = 'carcamo';
DELETE FROM producto_lineas_apu WHERE producto_id = 'carcamo';
DELETE FROM producto_materiales WHERE producto_id = 'carcamo';
DELETE FROM producto_variables WHERE producto_id = 'carcamo';
DELETE FROM productos_catalogo WHERE id = 'carcamo';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('carcamo', 'Cárcamo', 'Cárcamos', 0.38, NULL, true, 3);

-- producto_variables (8)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('carcamo', 'largo', 'Largo (m)', 'numero', '1', 0.3, 3, 'm', 'Dimensiones principales', 10, NULL, NULL),
  ('carcamo', 'ancho', 'Ancho (m)', 'numero', '0.25', 0.15, 1, 'm', 'Dimensiones principales', 11, NULL, NULL),
  ('carcamo', 'alto', 'Alto (m)', 'numero', '0.095', 0.05, 0.5, 'm', 'Dimensiones principales', 12, NULL, NULL),
  ('carcamo', 'calibre_cuerpo', 'Calibre cuerpo', 'seleccion', '18', NULL, NULL, NULL, 'Material', 20, '["18","16"]'::jsonb, NULL),
  ('carcamo', 'calibre_tapa', 'Calibre tapa', 'seleccion', '12', NULL, NULL, NULL, 'Material', 21, '["12","14"]'::jsonb, NULL),
  ('carcamo', 'largo_desague', 'Largo desagüe (m)', 'numero', '0.2', 0.1, 1, 'm', 'Desagüe', 30, NULL, NULL),
  ('carcamo', 'instalacion', 'Incluir instalación', 'toggle', '0', NULL, NULL, NULL, 'Extras', 90, NULL, NULL),
  ('carcamo', 'poliza', 'Incluir póliza', 'toggle', '0', NULL, NULL, NULL, 'Extras', 91, NULL, NULL);

-- producto_materiales (21)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('carcamo', 'lamina_cuerpo', 'LAMINA ACERO CAL {calibre_cuerpo}', false, NULL, NULL, 'AILA0101{calibre_cuerpo}'),
  ('carcamo', 'disco_flap', 'DISCOS FLAP INOX', false, NULL, NULL, 'ABDI802060'),
  ('carcamo', 'lija', 'LIJA ZC', false, NULL, NULL, 'ABLI202080'),
  ('carcamo', 'mo_sold_carc', 'MO SOLDADURA', true, 62000, NULL, NULL),
  ('carcamo', 'mo_instal_carc', 'MO INSTALACIÓN', true, 11500, NULL, NULL),
  ('carcamo', 'tte_pers_reg', 'TTE PERSONAL REGRESO', true, 15000, NULL, NULL),
  ('carcamo', 'lamina_tapa', 'LAMINA ACERO CAL {calibre_tapa}', false, NULL, NULL, 'AILA0101{calibre_tapa}'),
  ('carcamo', 'pano', 'PAÑO SCOTCH BRITE', false, NULL, NULL, 'ABPA020001'),
  ('carcamo', 'grata', 'GRATA', false, NULL, NULL, 'ABGR200019'),
  ('carcamo', 'mo_pulido_carc', 'MO PULIDO', true, 25000, NULL, NULL),
  ('carcamo', 'mo_punz_carc', 'MO PUNZONADO', true, 97900, NULL, NULL),
  ('carcamo', 'laser_carc', 'PROCESO LÁSER', true, 6500, NULL, NULL),
  ('carcamo', 'tubo_desague', 'TUBO ACERO INOXIDABLE CUADRADO 2 CAL 18', false, NULL, NULL, 'AITC190018'),
  ('carcamo', 'argon_carc', 'ARGÓN CÁRCAMO', true, 8000, NULL, NULL),
  ('carcamo', 'mo_dobles_carc', 'MO DOBLES', true, 1800, NULL, NULL),
  ('carcamo', 'granada_lam', 'GRANADA LÁMINA CAL 20', false, NULL, NULL, 'AILA010120'),
  ('carcamo', 'empaque_carc', 'EMPAQUE CÁRCAMO', true, 1500, NULL, NULL),
  ('carcamo', 'tte_elem_carc', 'TTE ELEMENTOS', true, 30000, NULL, NULL),
  ('carcamo', 'disco_corte', 'DISCOS CORTE 4 1/2', false, NULL, NULL, 'ABDI100124'),
  ('carcamo', 'tornillo_carc', 'TORNILLOS CÁRCAMO', true, 850, NULL, NULL),
  ('carcamo', 'tte_pers_ida', 'TTE PERSONAL IDA', true, 15000, NULL, NULL);

-- producto_lineas_apu (22)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('carcamo', 'insumos', 1, 'Acero Cuerpo', 'lamina_cuerpo', '(largo*alto*2)+(ancho*alto*2)+(largo*ancho)', 0, NULL, NULL, NULL),
  ('carcamo', 'insumos', 2, 'Acero Tapa', 'lamina_tapa', '(largo+0.04)*(ancho+0.04)', 0, NULL, NULL, NULL),
  ('carcamo', 'insumos', 3, 'Tubo 2" Desagüe', 'tubo_desague', 'largo_desague', 0, NULL, NULL, NULL),
  ('carcamo', 'insumos', 4, 'Granada lámina cal 20', 'granada_lam', '2*3.1416*0.038*0.1', 0, NULL, NULL, NULL),
  ('carcamo', 'insumos', 5, 'Argón', 'argon_carc', 'largo', 0, NULL, NULL, NULL),
  ('carcamo', 'insumos', 6, 'Disco de corte', 'disco_corte', 'largo/3', 0, NULL, NULL, NULL),
  ('carcamo', 'insumos', 7, 'Disco flap', 'disco_flap', 'largo/6', 0, NULL, NULL, NULL),
  ('carcamo', 'insumos', 8, 'Paño Scotch Brite', 'pano', 'largo/3', 0, NULL, NULL, NULL),
  ('carcamo', 'insumos', 9, 'Lija zirconio', 'lija', 'largo/4', 0, NULL, NULL, NULL),
  ('carcamo', 'insumos', 10, 'Grata', 'grata', 'largo/25', 0, NULL, NULL, NULL),
  ('carcamo', 'insumos', 11, 'Empaque', 'empaque_carc', 'largo', 0, NULL, NULL, NULL),
  ('carcamo', 'insumos', 12, 'Tornillos', 'tornillo_carc', 'largo*4', 0, NULL, NULL, NULL),
  ('carcamo', 'mo', 13, 'MO Soldadura', 'mo_sold_carc', 'largo', 0, NULL, NULL, NULL),
  ('carcamo', 'mo', 14, 'MO Pulido', 'mo_pulido_carc', 'largo', 0, NULL, NULL, NULL),
  ('carcamo', 'mo', 15, 'MO Instalación', 'mo_instal_carc', 'instalacion * largo', 0, 'instalacion == 1', NULL, NULL),
  ('carcamo', 'mo', 16, 'MO Punzonado', 'mo_punz_carc', 'largo*ancho', 0, NULL, NULL, NULL),
  ('carcamo', 'mo', 17, 'MO Dobles', 'mo_dobles_carc', '8', 0, NULL, NULL, NULL),
  ('carcamo', 'transporte', 18, 'TTE Elementos', 'tte_elem_carc', 'largo', 0, NULL, NULL, NULL),
  ('carcamo', 'transporte', 19, 'TTE Personal Ida', 'tte_pers_ida', 'largo', 0, NULL, NULL, NULL),
  ('carcamo', 'transporte', 20, 'TTE Personal Regreso', 'tte_pers_reg', 'largo', 0, NULL, NULL, NULL),
  ('carcamo', 'laser', 21, 'Proceso láser', 'laser_carc', 'largo*6', 0, NULL, NULL, NULL),
  ('carcamo', 'poliza', 99, 'Póliza todo riesgo', '', '1', 0, 'poliza == 1', NULL, 'Precio = 2% del costo total antes de póliza');


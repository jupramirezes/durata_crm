-- ============================================================
-- PRODUCTO: Barra Recta Discapacitados
-- ID: barra_recta
-- Grupo: otros
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = 'barra_recta';
DELETE FROM producto_lineas_apu WHERE producto_id = 'barra_recta';
DELETE FROM producto_materiales WHERE producto_id = 'barra_recta';
DELETE FROM producto_variables WHERE producto_id = 'barra_recta';
DELETE FROM productos_catalogo WHERE id = 'barra_recta';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('barra_recta', 'Barra Recta Discapacitados', 'otros', 38, 'Suministro [instalado:e instalación|] de barra de seguridad recta para discapacitados en tubo acero inoxidable 304 de 1-1/2 pulg calibre {calibre_tubo} de {largo} m de largo, con {codos} codo(s) inox ornamental(es) y {bridas} brida(s) de fijación con tapa decorativa, soldadura TIG con argón, acabado pulido satinado. [poliza:Con póliza|Sin póliza]', true, 20);

-- producto_variables (7)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('barra_recta', 'largo', 'Largo', 'numero', '2', 0.3, 5, 'm', 'Dimensiones', 1, NULL, NULL),
  ('barra_recta', 'calibre_tubo', 'Calibre tubo', 'seleccion', '18', NULL, NULL, NULL, 'Material', 2, '["16","18","20"]'::jsonb, NULL),
  ('barra_recta', 'codos', '# Codos', 'numero', '2', 0, 6, 'und', 'Configuración', 3, NULL, NULL),
  ('barra_recta', 'bridas', '# Bridas', 'numero', '3', 0, 8, 'und', 'Configuración', 4, NULL, NULL),
  ('barra_recta', 'instalado', 'Incluye instalación', 'toggle', '1', NULL, NULL, NULL, 'Extras', 5, NULL, NULL),
  ('barra_recta', 'poliza', 'Requiere Póliza', 'toggle', '0', NULL, NULL, NULL, 'Extras', 6, NULL, NULL),
  ('barra_recta', 'poliza_pct', 'Póliza %', 'numero', '2', 0, 10, '%', 'Extras', 7, NULL, NULL);

-- producto_materiales (16)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('barra_recta', 'tubo', 'Tubo inox 1-1/2 pulg', false, NULL, 'ml', 'AITC1800{calibre_tubo}'),
  ('barra_recta', 'codo', 'Codo inox 1-1/2 pulg', false, NULL, 'und', 'FECO0101{calibre_tubo}'),
  ('barra_recta', 'disco_corte', 'Disco de corte', false, NULL, 'und', 'ABDI100124'),
  ('barra_recta', 'disco_flap', 'Disco flap', false, NULL, 'und', 'ABDI802060'),
  ('barra_recta', 'pano', 'Paño Scotch Brite', false, NULL, 'und', 'ABPA020001'),
  ('barra_recta', 'lija', 'Lija zirconio', false, NULL, 'und', 'ABLI202080'),
  ('barra_recta', 'grata', 'Grata', false, NULL, 'und', 'ABGR200019'),
  ('barra_recta', 'brida_mat', 'Brida 3/16 con tapa', true, 6500, 'und', ''),
  ('barra_recta', 'tapa_brida', 'Tapa brida decorativa', true, 4000, 'und', ''),
  ('barra_recta', 'argon', 'Argón', true, 5000, 'und', ''),
  ('barra_recta', 'empaque', 'Empaque y embalaje', true, 3000, 'und', ''),
  ('barra_recta', 'tornillos', 'Tornillos', true, 1200, 'und', ''),
  ('barra_recta', 'mo_soldadura', 'MO Soldadura', true, 16650, 'und', ''),
  ('barra_recta', 'mo_pulido', 'MO Pulido', true, 7770, 'und', ''),
  ('barra_recta', 'mo_instalacion', 'MO Instalación', true, 16650, 'und', ''),
  ('barra_recta', 'tte_elementos', 'TTE Elementos', true, 4000, 'und', '');

-- producto_lineas_apu (19)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('barra_recta', 'insumos', 1, 'Tubo inox 1-1/2 pulg', 'tubo', 'largo', 0, NULL, NULL, NULL),
  ('barra_recta', 'insumos', 2, 'Codo inox ornamental', 'codo', 'codos', 0, NULL, NULL, NULL),
  ('barra_recta', 'insumos', 3, 'Brida de fijación', 'brida_mat', 'bridas', 0, NULL, NULL, NULL),
  ('barra_recta', 'insumos', 4, 'Tapa brida decorativa', 'tapa_brida', 'bridas', 0, NULL, NULL, NULL),
  ('barra_recta', 'insumos', 5, 'Argón', 'argon', 'IF(largo<1,1,largo)', 0, NULL, NULL, NULL),
  ('barra_recta', 'insumos', 6, 'Disco de corte', 'disco_corte', 'largo/2', 0, NULL, NULL, NULL),
  ('barra_recta', 'insumos', 7, 'Disco flap', 'disco_flap', 'largo/6', 0, NULL, NULL, NULL),
  ('barra_recta', 'insumos', 8, 'Paño Scotch Brite', 'pano', 'largo/4', 0, NULL, NULL, NULL),
  ('barra_recta', 'insumos', 9, 'Lijas de zirconio', 'lija', 'largo/4', 0, NULL, NULL, NULL),
  ('barra_recta', 'insumos', 10, 'Grata', 'grata', 'largo/10', 0, NULL, NULL, NULL),
  ('barra_recta', 'insumos', 11, 'Empaque y embalaje', 'empaque', 'IF(largo<1,1,largo)', 0, NULL, NULL, NULL),
  ('barra_recta', 'insumos', 12, 'Tornillos', 'tornillos', 'bridas*2', 0, NULL, NULL, NULL),
  ('barra_recta', 'mo', 13, 'MO Soldadura', 'mo_soldadura', 'IF(largo<1,1,largo)', 0, NULL, NULL, NULL),
  ('barra_recta', 'mo', 14, 'MO Pulido', 'mo_pulido', 'IF(largo<1,1,largo)', 0, NULL, NULL, NULL),
  ('barra_recta', 'mo', 15, 'MO Instalación', 'mo_instalacion', 'IF(instalado==1,IF(largo<1,1,largo),0)', 0, NULL, NULL, NULL),
  ('barra_recta', 'transporte', 16, 'TTE Elementos', 'tte_elementos', 'IF(largo<1,1,largo)', 0, NULL, NULL, NULL),
  ('barra_recta', 'transporte', 17, 'TTE Personal Ida', NULL, 'IF(largo<1,1,largo)', 0, NULL, NULL, NULL),
  ('barra_recta', 'transporte', 18, 'TTE Personal Regreso', NULL, 'IF(largo<1,1,largo)', 0, NULL, NULL, NULL),
  ('barra_recta', 'poliza', 19, 'Póliza todo riesgo', '', '1', 0, 'poliza == 1', NULL, NULL);


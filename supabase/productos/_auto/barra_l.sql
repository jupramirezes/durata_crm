-- ============================================================
-- PRODUCTO: Barra L Discapacitados (Piso-Muro)
-- ID: barra_l
-- Grupo: otros
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = 'barra_l';
DELETE FROM producto_lineas_apu WHERE producto_id = 'barra_l';
DELETE FROM producto_materiales WHERE producto_id = 'barra_l';
DELETE FROM producto_variables WHERE producto_id = 'barra_l';
DELETE FROM productos_catalogo WHERE id = 'barra_l';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('barra_l', 'Barra L Discapacitados (Piso-Muro)', 'otros', 38, 'Suministro [instalado:e instalación|] de barra de seguridad en L (piso-muro) para discapacitados en tubo acero inoxidable 304 de 1-1/2 pulg calibre {calibre_tubo} de {largo} m de largo x {altura} m de alto, con {codos} codo(s) inox ornamental(es) y {bridas} brida(s) de fijación con tapa decorativa, soldadura TIG con argón, acabado pulido satinado. [poliza:Con póliza|Sin póliza]', true, 21);

-- producto_variables (8)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('barra_l', 'largo', 'Largo', 'numero', '0.7', 0.3, 3, 'm', 'Dimensiones', 1, NULL, NULL),
  ('barra_l', 'altura', 'Altura', 'numero', '0.9', 0.3, 1.5, 'm', 'Dimensiones', 2, NULL, NULL),
  ('barra_l', 'calibre_tubo', 'Calibre tubo', 'seleccion', '18', NULL, NULL, NULL, 'Material', 3, '["16","18","20"]'::jsonb, NULL),
  ('barra_l', 'codos', '# Codos', 'numero', '2', 0, 6, 'und', 'Configuración', 4, NULL, NULL),
  ('barra_l', 'bridas', '# Bridas', 'numero', '3', 0, 8, 'und', 'Configuración', 5, NULL, NULL),
  ('barra_l', 'instalado', 'Incluye instalación', 'toggle', '1', NULL, NULL, NULL, 'Extras', 6, NULL, NULL),
  ('barra_l', 'poliza', 'Requiere Póliza', 'toggle', '0', NULL, NULL, NULL, 'Extras', 7, NULL, NULL),
  ('barra_l', 'poliza_pct', 'Póliza %', 'numero', '2', 0, 10, '%', 'Extras', 8, NULL, NULL);

-- producto_materiales (16)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('barra_l', 'tubo', 'Tubo inox 1-1/2 pulg', false, NULL, 'ml', 'AITC1800{calibre_tubo}'),
  ('barra_l', 'codo', 'Codo inox 1-1/2 pulg', false, NULL, 'und', 'FECO0101{calibre_tubo}'),
  ('barra_l', 'disco_corte', 'Disco de corte', false, NULL, 'und', 'ABDI100124'),
  ('barra_l', 'disco_flap', 'Disco flap', false, NULL, 'und', 'ABDI802060'),
  ('barra_l', 'pano', 'Paño Scotch Brite', false, NULL, 'und', 'ABPA020001'),
  ('barra_l', 'lija', 'Lija zirconio', false, NULL, 'und', 'ABLI202080'),
  ('barra_l', 'grata', 'Grata', false, NULL, 'und', 'ABGR200019'),
  ('barra_l', 'brida_mat', 'Brida 3/16 con tapa', true, 6500, 'und', ''),
  ('barra_l', 'tapa_brida', 'Tapa brida decorativa', true, 4000, 'und', ''),
  ('barra_l', 'argon', 'Argón', true, 5000, 'und', ''),
  ('barra_l', 'empaque', 'Empaque y embalaje', true, 3000, 'und', ''),
  ('barra_l', 'tornillos', 'Tornillos', true, 1200, 'und', ''),
  ('barra_l', 'mo_soldadura', 'MO Soldadura', true, 19980, 'und', ''),
  ('barra_l', 'mo_pulido', 'MO Pulido', true, 9990, 'und', ''),
  ('barra_l', 'mo_instalacion', 'MO Instalación', true, 22200, 'und', ''),
  ('barra_l', 'tte_elementos', 'TTE Elementos', true, 4000, 'und', '');

-- producto_lineas_apu (19)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('barra_l', 'insumos', 1, 'Tubo inox 1-1/2 pulg', 'tubo', 'largo+altura+0.4', 0, NULL, NULL, NULL),
  ('barra_l', 'insumos', 2, 'Codo inox ornamental', 'codo', 'codos', 0, NULL, NULL, NULL),
  ('barra_l', 'insumos', 3, 'Brida de fijación', 'brida_mat', 'bridas', 0, NULL, NULL, NULL),
  ('barra_l', 'insumos', 4, 'Tapa brida decorativa', 'tapa_brida', 'bridas', 0, NULL, NULL, NULL),
  ('barra_l', 'insumos', 5, 'Argón', 'argon', '1', 0, NULL, NULL, NULL),
  ('barra_l', 'insumos', 6, 'Disco de corte', 'disco_corte', 'largo/2', 0, NULL, NULL, NULL),
  ('barra_l', 'insumos', 7, 'Disco flap', 'disco_flap', 'largo/6', 0, NULL, NULL, NULL),
  ('barra_l', 'insumos', 8, 'Paño Scotch Brite', 'pano', 'largo/4', 0, NULL, NULL, NULL),
  ('barra_l', 'insumos', 9, 'Lijas de zirconio', 'lija', 'largo/4', 0, NULL, NULL, NULL),
  ('barra_l', 'insumos', 10, 'Grata', 'grata', 'largo/10', 0, NULL, NULL, NULL),
  ('barra_l', 'insumos', 11, 'Empaque y embalaje', 'empaque', '1', 0, NULL, NULL, NULL),
  ('barra_l', 'insumos', 12, 'Tornillos', 'tornillos', '6', 0, NULL, NULL, NULL),
  ('barra_l', 'mo', 13, 'MO Soldadura', 'mo_soldadura', 'IF(largo<1,1,largo)', 0, NULL, NULL, NULL),
  ('barra_l', 'mo', 14, 'MO Pulido', 'mo_pulido', 'IF(largo<1,1,largo)', 0, NULL, NULL, NULL),
  ('barra_l', 'mo', 15, 'MO Instalación', 'mo_instalacion', 'IF(instalado==1,IF(largo<1,1,largo),0)', 0, NULL, NULL, NULL),
  ('barra_l', 'transporte', 16, 'TTE Elementos', 'tte_elementos', '1', 0, NULL, NULL, NULL),
  ('barra_l', 'transporte', 17, 'TTE Personal Ida', NULL, '1', 0, NULL, NULL, NULL),
  ('barra_l', 'transporte', 18, 'TTE Personal Regreso', NULL, '1', 0, NULL, NULL, NULL),
  ('barra_l', 'poliza', 19, 'Póliza todo riesgo', '', '1', 0, 'poliza == 1', NULL, NULL);


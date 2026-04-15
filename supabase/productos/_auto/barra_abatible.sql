-- ============================================================
-- PRODUCTO: Barra Abatible Discapacitados
-- ID: barra_abatible
-- Grupo: otros
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = 'barra_abatible';
DELETE FROM producto_lineas_apu WHERE producto_id = 'barra_abatible';
DELETE FROM producto_materiales WHERE producto_id = 'barra_abatible';
DELETE FROM producto_variables WHERE producto_id = 'barra_abatible';
DELETE FROM productos_catalogo WHERE id = 'barra_abatible';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('barra_abatible', 'Barra Abatible Discapacitados', 'otros', 38, 'Suministro [instalado:e instalación|] de barra abatible para discapacitados en tubo acero inoxidable 304 de 1-1/2 pulg calibre {calibre_tubo} de {largo} m de largo x {ancho} m de ancho, con {codos} codo(s) inox ornamental(es) y {bujes} buje(s) inox 25mm con eje inox 1/2 pulg para abatimiento, soldadura TIG con argón, acabado pulido satinado. [poliza:Con póliza|Sin póliza]', true, 22);

-- producto_variables (8)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('barra_abatible', 'largo', 'Largo', 'numero', '0.65', 0.3, 3, 'm', 'Dimensiones', 1, NULL, NULL),
  ('barra_abatible', 'ancho', 'Ancho', 'numero', '0.2', 0.1, 0.5, 'm', 'Dimensiones', 2, NULL, NULL),
  ('barra_abatible', 'calibre_tubo', 'Calibre tubo', 'seleccion', '18', NULL, NULL, NULL, 'Material', 3, '["16","18","20"]'::jsonb, NULL),
  ('barra_abatible', 'codos', '# Codos', 'numero', '2', 0, 6, 'und', 'Configuración', 4, NULL, NULL),
  ('barra_abatible', 'bujes', '# Bujes', 'numero', '1', 0, 4, 'und', 'Configuración', 5, NULL, NULL),
  ('barra_abatible', 'instalado', 'Incluye instalación', 'toggle', '1', NULL, NULL, NULL, 'Extras', 6, NULL, NULL),
  ('barra_abatible', 'poliza', 'Requiere Póliza', 'toggle', '0', NULL, NULL, NULL, 'Extras', 7, NULL, NULL),
  ('barra_abatible', 'poliza_pct', 'Póliza %', 'numero', '2', 0, 10, '%', 'Extras', 8, NULL, NULL);

-- producto_materiales (21)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('barra_abatible', 'tubo', 'Tubo inox 1-1/2 pulg', false, NULL, 'ml', 'AITC1800{calibre_tubo}'),
  ('barra_abatible', 'codo', 'Codo inox 1-1/2 pulg', false, NULL, 'und', 'FECO0101{calibre_tubo}'),
  ('barra_abatible', 'lamina_pared', 'Lámina pared cal 12', false, NULL, 'm2', 'AILA010112'),
  ('barra_abatible', 'u_inox', 'U en inox cal 14', true, 299000, 'm2', ''),
  ('barra_abatible', 'disco_corte', 'Disco de corte', false, NULL, 'und', 'ABDI100124'),
  ('barra_abatible', 'disco_flap', 'Disco flap', false, NULL, 'und', 'ABDI802060'),
  ('barra_abatible', 'pano', 'Paño Scotch Brite', false, NULL, 'und', 'ABPA020001'),
  ('barra_abatible', 'lija', 'Lija zirconio', false, NULL, 'und', 'ABLI202080'),
  ('barra_abatible', 'grata', 'Grata', false, NULL, 'und', 'ABGR200019'),
  ('barra_abatible', 'buje', 'Buje inox 25mm', true, 13000, 'und', ''),
  ('barra_abatible', 'eje', 'Eje inox 1/2 pulg', true, 11964, 'ml', ''),
  ('barra_abatible', 'argon', 'Argón', true, 7000, 'und', ''),
  ('barra_abatible', 'empaque', 'Empaque y embalaje', true, 3000, 'und', ''),
  ('barra_abatible', 'tornillos', 'Tornillos', true, 1200, 'und', ''),
  ('barra_abatible', 'mo_soldadura', 'MO Soldadura', true, 24420, 'und', ''),
  ('barra_abatible', 'mo_pulido', 'MO Pulido', true, 22200, 'und', ''),
  ('barra_abatible', 'mo_instalacion', 'MO Instalación', true, 27750, 'und', ''),
  ('barra_abatible', 'tte_elementos', 'TTE Elementos', true, 5000, 'und', ''),
  ('barra_abatible', 'tte_ida', 'TTE Personal Ida', true, 1000, 'und', ''),
  ('barra_abatible', 'tte_regreso', 'TTE Personal Regreso', true, 1000, 'und', ''),
  ('barra_abatible', 'laser', 'Corte láser', true, 6500, 'und', '');

-- producto_lineas_apu (22)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('barra_abatible', 'insumos', 1, 'Tubo inox 1-1/2 pulg', 'tubo', '(largo*2)+(ancho*2)', 0, NULL, NULL, NULL),
  ('barra_abatible', 'insumos', 2, 'Codo inox ornamental', 'codo', 'codos', 0, NULL, NULL, NULL),
  ('barra_abatible', 'insumos', 3, 'Lámina a pared', 'lamina_pared', '0.33*0.12', 0, NULL, NULL, NULL),
  ('barra_abatible', 'insumos', 4, 'Buje inox 25mm', 'buje', 'bujes', 0, NULL, NULL, NULL),
  ('barra_abatible', 'insumos', 5, 'Eje inox 1/2 pulg', 'eje', '0.2', 0, NULL, NULL, NULL),
  ('barra_abatible', 'insumos', 6, 'U en inox', 'u_inox', '0.15*0.06*3', 0, NULL, NULL, NULL),
  ('barra_abatible', 'insumos', 7, 'Argón', 'argon', '1', 0, NULL, NULL, NULL),
  ('barra_abatible', 'insumos', 8, 'Disco de corte', 'disco_corte', 'largo/2', 0, NULL, NULL, NULL),
  ('barra_abatible', 'insumos', 9, 'Disco flap', 'disco_flap', 'largo/6', 0, NULL, NULL, NULL),
  ('barra_abatible', 'insumos', 10, 'Paño Scotch Brite', 'pano', 'largo/4', 0, NULL, NULL, NULL),
  ('barra_abatible', 'insumos', 11, 'Lijas de zirconio', 'lija', 'largo/4', 0, NULL, NULL, NULL),
  ('barra_abatible', 'insumos', 12, 'Grata', 'grata', 'largo/10', 0, NULL, NULL, NULL),
  ('barra_abatible', 'insumos', 13, 'Empaque y embalaje', 'empaque', '1', 0, NULL, NULL, NULL),
  ('barra_abatible', 'insumos', 14, 'Tornillos', 'tornillos', '6', 0, NULL, NULL, NULL),
  ('barra_abatible', 'mo', 15, 'MO Soldadura', 'mo_soldadura', 'IF(largo<1,1,largo)', 0, NULL, NULL, NULL),
  ('barra_abatible', 'mo', 16, 'MO Pulido', 'mo_pulido', 'IF(largo<1,1,largo)', 0, NULL, NULL, NULL),
  ('barra_abatible', 'mo', 17, 'MO Instalación', 'mo_instalacion', 'IF(instalado==1,IF(largo<1,1,largo),0)', 0, NULL, NULL, NULL),
  ('barra_abatible', 'transporte', 18, 'TTE Elementos', 'tte_elementos', '1', 0, NULL, NULL, NULL),
  ('barra_abatible', 'transporte', 19, 'TTE Personal Ida', 'tte_ida', '1', 0, NULL, NULL, NULL),
  ('barra_abatible', 'transporte', 20, 'TTE Personal Regreso', 'tte_regreso', '1', 0, NULL, NULL, NULL),
  ('barra_abatible', 'laser', 21, 'Corte láser', 'laser', '2', 0, NULL, NULL, NULL),
  ('barra_abatible', 'poliza', 22, 'Póliza todo riesgo', '', '1', 0, 'poliza == 1', NULL, NULL);


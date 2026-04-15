-- ============================================================
-- PRODUCTO: Ductos
-- ID: ductos
-- Grupo: campanas
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = 'ductos';
DELETE FROM producto_lineas_apu WHERE producto_id = 'ductos';
DELETE FROM producto_materiales WHERE producto_id = 'ductos';
DELETE FROM producto_variables WHERE producto_id = 'ductos';
DELETE FROM productos_catalogo WHERE id = 'ductos';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('ductos', 'Ductos', 'campanas', 38, 'Suministro e instalación de ductos en acero inoxidable 304 de {largo} m de largo, sección {ancho} m x {alto} m, con {codos} codo(s) y {uniones} unión(es), soldadura TIG con argón, acabado satinado', true, 11);

-- producto_variables (10)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('ductos', 'largo', 'Largo', 'numero', '4', 1, 20, 'm', 'Dimensiones', 1, NULL, NULL),
  ('ductos', 'ancho', 'Ancho sección', 'numero', '0.45', 0.1, 1.5, 'm', 'Dimensiones', 2, NULL, NULL),
  ('ductos', 'alto', 'Alto sección', 'numero', '0.45', 0.1, 1.5, 'm', 'Dimensiones', 3, NULL, NULL),
  ('ductos', 'codos', '# Codos', 'numero', '2', 0, 10, 'und', 'Configuración', 4, NULL, NULL),
  ('ductos', 'uniones', '# Uniones', 'numero', '3', 0, 10, 'und', 'Configuración', 5, NULL, NULL),
  ('ductos', 'acero_cuerpo', 'Calibre cuerpo/codos', 'seleccion', '20', NULL, NULL, NULL, 'Material', 6, '["14","16","18","20"]'::jsonb, NULL),
  ('ductos', 'acero_uniones', 'Calibre uniones', 'seleccion', '18', NULL, NULL, NULL, 'Material', 7, '["14","16","18","20"]'::jsonb, NULL),
  ('ductos', 'instalado', 'Incluye instalación', 'toggle', '1', NULL, NULL, NULL, 'Extras', 8, NULL, NULL),
  ('ductos', 'poliza', 'Requiere Póliza', 'toggle', '0', NULL, NULL, NULL, 'Extras', 9, NULL, NULL),
  ('ductos', 'poliza_pct', 'Póliza %', 'numero', '2', 0, 10, '%', 'Extras', 10, NULL, NULL);

-- producto_materiales (13)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('ductos', 'lamina_cuerpo', 'Lámina 304 satinado', false, NULL, 'm2', 'AILA0102{acero_cuerpo}'),
  ('ductos', 'lamina_uniones', 'Lámina 304 satinado', false, NULL, 'm2', 'AILA0102{acero_uniones}'),
  ('ductos', 'argon', 'Argón', true, 3500, 'und', ''),
  ('ductos', 'tornilleria', 'Tornillería', true, 450, 'und', ''),
  ('ductos', 'empaques', 'Empaques', true, 5500, 'und', ''),
  ('ductos', 'abrasivos', 'Abrasivos', true, 2500, 'und', ''),
  ('ductos', 'empaque_emb', 'Empaque y embalaje', true, 4500, 'und', ''),
  ('ductos', 'torn_fijacion', 'Tornillos fijación', true, 1200, 'und', ''),
  ('ductos', 'mo_soldadura', 'MO Soldadura', true, 35000, 'm', ''),
  ('ductos', 'mo_pulido', 'MO Pulido', true, 8800, 'm', ''),
  ('ductos', 'mo_instalacion', 'MO Instalación', true, 25000, 'm', ''),
  ('ductos', 'tte_elementos', 'TTE Elementos', true, 15000, 'und', ''),
  ('ductos', 'tte_personal', 'TTE Personal Ida', true, 3000, 'und', '');

-- producto_lineas_apu (17)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('ductos', 'insumos', 1, 'Lámina cuerpo', 'lamina_cuerpo', 'ancho*2+alto*2', 0, NULL, NULL, NULL),
  ('ductos', 'insumos', 2, 'Lámina codos', 'lamina_cuerpo', 'ancho*4+alto*4', 0, NULL, NULL, NULL),
  ('ductos', 'insumos', 3, 'Lámina uniones', 'lamina_uniones', 'largo*(ancho*2+alto*2)*0.15', 0, NULL, NULL, NULL),
  ('ductos', 'insumos', 4, 'Argón', 'argon', 'largo', 0, NULL, NULL, NULL),
  ('ductos', 'insumos', 5, 'Tornillería', 'tornilleria', 'largo*8', 0, NULL, NULL, NULL),
  ('ductos', 'insumos', 6, 'Empaques', 'empaques', 'largo', 0, NULL, NULL, NULL),
  ('ductos', 'insumos', 7, 'Abrasivos', 'abrasivos', 'largo', 0, NULL, NULL, NULL),
  ('ductos', 'insumos', 8, 'Empaque y embalaje', 'empaque_emb', 'largo', 0, NULL, NULL, NULL),
  ('ductos', 'insumos', 9, 'Fijaciones a techo', 'lamina_cuerpo', '(largo/0.8)*1.52*0.15', 0, NULL, NULL, NULL),
  ('ductos', 'insumos', 10, 'Tornillos fijación', 'torn_fijacion', '(largo/0.8)*4', 0, NULL, NULL, NULL),
  ('ductos', 'mo', 11, 'MO Soldadura', 'mo_soldadura', 'largo+codos', 0, NULL, NULL, NULL),
  ('ductos', 'mo', 12, 'MO Pulido', 'mo_pulido', 'largo+codos', 0, NULL, NULL, NULL),
  ('ductos', 'mo', 13, 'MO Instalación', 'mo_instalacion', 'IF(instalado==1,largo+codos,0)', 0, NULL, NULL, NULL),
  ('ductos', 'transporte', 14, 'TTE Elementos', 'tte_elementos', 'largo', 0, NULL, NULL, NULL),
  ('ductos', 'transporte', 15, 'TTE Personal Ida', 'tte_personal', 'largo', 0, NULL, NULL, NULL),
  ('ductos', 'transporte', 16, 'TTE Personal Regreso', NULL, '0', 0, NULL, NULL, NULL),
  ('ductos', 'poliza', 17, 'Póliza todo riesgo', '', '1', 0, 'poliza == 1', NULL, NULL);


-- ============================================================
-- PRODUCTO: Repisa
-- ID: repisa
-- Grupo: otros
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = 'repisa';
DELETE FROM producto_lineas_apu WHERE producto_id = 'repisa';
DELETE FROM producto_materiales WHERE producto_id = 'repisa';
DELETE FROM producto_variables WHERE producto_id = 'repisa';
DELETE FROM productos_catalogo WHERE id = 'repisa';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('repisa', 'Repisa', 'otros', 38, 'Suministro de repisa de pared en acero inoxidable 304 satinado de {largo} m de largo x {ancho} m de ancho', true, 10);

-- producto_variables (14)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('repisa', 'largo', 'Largo', 'numero', '1.8', 0.3, 5, 'm', 'Dimensiones', 1, NULL, NULL),
  ('repisa', 'ancho', 'Ancho', 'numero', '0.3', 0.1, 1, 'm', 'Dimensiones', 2, NULL, NULL),
  ('repisa', 'acero_repisa', 'Calibre repisa', 'seleccion', '18', NULL, NULL, NULL, 'Material', 3, '["12","14","16","18","20"]'::jsonb, NULL),
  ('repisa', 'acero_omegas', 'Calibre omegas', 'seleccion', '18', NULL, NULL, NULL, 'Material', 4, '["12","14","16","18","20"]'::jsonb, NULL),
  ('repisa', 'acero_pieamigos', 'Calibre pieamigos', 'seleccion', '14', NULL, NULL, NULL, 'Material', 5, '["12","14","16","18","20"]'::jsonb, NULL),
  ('repisa', 'pieamigos_extras', '# Pieamigos extras', 'numero', '2', 0, 6, 'und', 'Configuración', 6, NULL, NULL),
  ('repisa', 'pieamigos_integrado', '# Pieamigos integrado', 'numero', '0', 0, 6, 'und', 'Configuración', 7, NULL, NULL),
  ('repisa', 'tiene_omega', 'Tiene omega', 'toggle', '1', NULL, NULL, NULL, 'Configuración', 8, NULL, NULL),
  ('repisa', 'ancho_omega', 'Ancho omega', 'numero', '0.2', 0.1, 0.4, 'm', 'Configuración', 9, NULL, NULL),
  ('repisa', 'salpicadero_long', '# Salpicadero longitudinal', 'numero', '0', 0, 4, 'und', 'Accesorios', 10, NULL, NULL),
  ('repisa', 'salpicadero_costado', '# Salpicadero costado', 'numero', '0', 0, 4, 'und', 'Accesorios', 11, NULL, NULL),
  ('repisa', 'alto_salpicadero', 'Alto salpicadero', 'numero', '0', 0, 0.3, 'm', 'Accesorios', 12, NULL, NULL),
  ('repisa', 'instalado', 'Incluye instalación', 'toggle', '0', NULL, NULL, NULL, 'Extras', 13, NULL, NULL),
  ('repisa', 'poliza', 'Requiere Póliza', 'toggle', '0', NULL, NULL, NULL, 'Extras', 14, NULL, NULL);

-- producto_materiales (18)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('repisa', 'lamina_repisa', 'Lámina 304 satinado', false, NULL, 'm2', 'AILA0102{acero_repisa}'),
  ('repisa', 'lamina_omegas', 'Lámina 304 satinado', false, NULL, 'm2', 'AILA0102{acero_omegas}'),
  ('repisa', 'lamina_pieamigo', 'Lámina 304 satinado', false, NULL, 'm2', 'AILA0102{acero_pieamigos}'),
  ('repisa', 'disco_corte', 'Disco corte 4 1/2', false, NULL, 'und', 'ABDI100124'),
  ('repisa', 'disco_flap', 'Disco flap 4 1/2 grano 60', false, NULL, 'und', 'ABDI802060'),
  ('repisa', 'pano', 'Paño Scotch Brite 3M', false, NULL, 'und', 'ABPA020001'),
  ('repisa', 'lija', 'Lija zirconio grano 80', false, NULL, 'und', 'ABLI202080'),
  ('repisa', 'grata', 'Grata alambre inox 2 pulg', false, NULL, 'und', 'ABGR200019'),
  ('repisa', 'tornillos', 'Tornillos', true, 800, 'und', ''),
  ('repisa', 'argon', 'Argón', true, 1500, 'und', ''),
  ('repisa', 'empaque', 'Empaque y embalaje', true, 3500, 'und', ''),
  ('repisa', 'cinta', 'Cinta 3M', true, 11500, 'und', ''),
  ('repisa', 'mo_acero', 'MO Acero', true, 30000, 'm', ''),
  ('repisa', 'mo_pulido', 'MO Pulido', true, 20000, 'm', ''),
  ('repisa', 'mo_pieamigos', 'MO Pieamigos', true, 8880, 'und', ''),
  ('repisa', 'mo_instalacion', 'MO Instalación', true, 24420, 'm', ''),
  ('repisa', 'tte_elementos', 'TTE Elementos', true, 40000, 'und', ''),
  ('repisa', 'laser', 'Corte láser', true, 6500, 'und', '');

-- producto_lineas_apu (21)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('repisa', 'insumos', 1, 'Acero repisa', 'lamina_repisa', '((largo+IF(pieamigos_integrado>0,pieamigos_integrado*0.3,0.12))*(ancho+0.12)+((alto_salpicadero+0.04)*salpicadero_long*largo+(alto_salpicadero+0.04)*salpicadero_costado*ancho))+0.08*largo*2', 0, NULL, NULL, NULL),
  ('repisa', 'insumos', 2, 'Omega', 'lamina_omegas', 'IF(tiene_omega==1,ROUNDUP(ancho/0.4,0)*largo*ancho_omega,0)', 0, 'tiene_omega==1', NULL, NULL),
  ('repisa', 'insumos', 3, 'Pieamigo', 'lamina_pieamigo', '((ancho+0.06)*(0.3+0.06)/2)*pieamigos_extras', 0, NULL, NULL, NULL),
  ('repisa', 'insumos', 4, 'Tornillos', 'tornillos', '3*(pieamigos_extras+pieamigos_integrado)', 0, NULL, NULL, NULL),
  ('repisa', 'insumos', 5, 'Argón', 'argon', 'largo+ancho', 0, NULL, NULL, NULL),
  ('repisa', 'insumos', 6, 'Disco de corte', 'disco_corte', '(largo+ancho)/3', 0, NULL, NULL, NULL),
  ('repisa', 'insumos', 7, 'Disco flap', 'disco_flap', '(largo+ancho)/8', 0, NULL, NULL, NULL),
  ('repisa', 'insumos', 8, 'Paño Scotch Brite', 'pano', '(largo+ancho)/3', 0, NULL, NULL, NULL),
  ('repisa', 'insumos', 9, 'Lijas de zirconio', 'lija', '(largo+ancho)/4', 0, NULL, NULL, NULL),
  ('repisa', 'insumos', 10, 'Grata', 'grata', '(largo+ancho)/30', 0, NULL, NULL, NULL),
  ('repisa', 'insumos', 11, 'Empaque y embalaje', 'empaque', 'largo', 0, NULL, NULL, NULL),
  ('repisa', 'insumos', 12, 'Cinta', 'cinta', 'largo*ROUNDUP(ancho/0.4,0)', 0, NULL, NULL, NULL),
  ('repisa', 'mo', 13, 'MO Acero', 'mo_acero', 'largo', 0, NULL, NULL, NULL),
  ('repisa', 'mo', 14, 'MO Pulido', 'mo_pulido', 'largo', 0, NULL, NULL, NULL),
  ('repisa', 'mo', 15, 'MO Pieamigos', 'mo_pieamigos', 'pieamigos_extras', 0, NULL, NULL, NULL),
  ('repisa', 'mo', 16, 'MO Instalación', 'mo_instalacion', 'IF(instalado==1,largo,0)', 0, NULL, NULL, NULL),
  ('repisa', 'transporte', 17, 'TTE Elementos', 'tte_elementos', 'largo', 0, NULL, NULL, NULL),
  ('repisa', 'transporte', 18, 'TTE Personal Ida', NULL, 'largo', 0, NULL, NULL, NULL),
  ('repisa', 'transporte', 19, 'TTE Personal Regreso', NULL, 'largo', 0, NULL, NULL, NULL),
  ('repisa', 'laser', 20, 'Corte láser', 'laser', 'ROUNDUP(largo,0)', 0, NULL, NULL, NULL),
  ('repisa', 'poliza', 21, 'Póliza todo riesgo', '', '1', 0, 'poliza == 1', NULL, NULL);


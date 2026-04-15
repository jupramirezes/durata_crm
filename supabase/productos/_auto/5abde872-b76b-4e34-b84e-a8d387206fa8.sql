-- ============================================================
-- PRODUCTO: Lavaescobas Fregadero
-- ID: 5abde872-b76b-4e34-b84e-a8d387206fa8
-- Grupo: accesorios
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = '5abde872-b76b-4e34-b84e-a8d387206fa8';
DELETE FROM producto_lineas_apu WHERE producto_id = '5abde872-b76b-4e34-b84e-a8d387206fa8';
DELETE FROM producto_materiales WHERE producto_id = '5abde872-b76b-4e34-b84e-a8d387206fa8';
DELETE FROM producto_variables WHERE producto_id = '5abde872-b76b-4e34-b84e-a8d387206fa8';
DELETE FROM productos_catalogo WHERE id = '5abde872-b76b-4e34-b84e-a8d387206fa8';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'Lavaescobas Fregadero', 'accesorios', 38, '[instalado:Suministro e instalación de|Suministro de] lavaescobas con fregadero en acero inoxidable 304 calibre 18 2B de {largo} m de largo x {ancho} m de ancho, pozuelo de {profundo} m de profundidad, babero frontal de {alto_babero} m de alto, {salp_long} salpicadero longitudinal y {salp_costado} salpicaderos laterales de {alto_salpicadero} m de alto, [tiene_patas:{num_patas} patas en tubo cuadrado 1-1/2 pulg cal.16 de {altura_patas} m con niveladores|sin patas], [tiene_fregadero:incluye fregadero lateral integrado, |]soldadura TIG con argón, acabado pulido satinado. [poliza:Incluye póliza.|Sin póliza.]', true, 22);

-- producto_variables (15)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'largo', 'Largo', 'numero', '1.2', 0.5, 4, NULL, 'Dimensiones', 1, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'ancho', 'Ancho', 'numero', '0.6', 0.3, 1.5, NULL, 'Dimensiones', 2, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'profundo', 'Profundo Pozuelo', 'numero', '0.3', 0.15, 0.6, NULL, 'Dimensiones', 3, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'alto_babero', 'Alto Babero', 'numero', '0.4', 0.2, 1, NULL, 'Dimensiones', 4, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'alto_salpicadero', 'Alto Salpicadero', 'numero', '0.8', 0.1, 1.5, NULL, 'Configuración', 5, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'salp_long', '# Salpicadero Longitudinal', 'numero', '1', 0, 2, NULL, 'Configuración', 6, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'salp_costado', '# Salpicadero Costado', 'numero', '2', 0, 4, NULL, 'Configuración', 7, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'baberos_laterales', '# Baberos Laterales', 'numero', '0', 0, 2, NULL, 'Configuración', 8, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'tiene_fregadero', 'Tiene Fregadero', 'toggle', 'true', NULL, NULL, NULL, 'Configuración', 9, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'tiene_patas', 'Tiene Patas', 'toggle', 'true', NULL, NULL, NULL, 'Configuración', 10, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'num_patas', '# Patas', 'numero', '4', 1, 8, NULL, 'Configuración', 11, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'altura_patas', 'Altura Patas', 'numero', '0.75', 0.3, 1.2, NULL, 'Configuración', 12, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'instalado', 'Incluye Instalación', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 13, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'poliza', 'Requiere Póliza', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 14, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'poliza_pct', 'Póliza %', 'numero', '2', 1, 10, NULL, 'Extras', 15, NULL, NULL);

-- producto_materiales (20)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'acero_cuerpo', 'Acero lavaescobas cal 18', false, NULL, 'm²', 'AILA010118'),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'acero_fregadero', 'Acero fregadero cal 18', false, NULL, 'm²', 'AILA010118'),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'acero_babero', 'Acero babero frontal cal 18', false, NULL, 'm²', 'AILA010118'),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'tubo_patas', 'Tubo 1-1/2 cal 16 patas', false, NULL, 'ml', 'AITC180016'),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'niveladores', 'Niveladores', false, NULL, 'und', 'FENI010118'),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'argon', 'Argón', true, 5500, 'und', ''),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'disco_corte', 'Disco de corte', false, NULL, 'und', 'ABDI100124'),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'disco_flap', 'Disco flap', false, NULL, 'und', 'ABDI802060'),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'pano', 'Paño Scotch Brite', false, NULL, 'und', 'ABPA020001'),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'lija', 'Lija zirconio', false, NULL, 'und', 'ABLI202080'),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'grata', 'Grata', false, NULL, 'und', 'ABGR200019'),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'empaque', 'Empaque y embalaje', true, 3500, 'und', ''),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'mo_acero', 'MO Acero', true, 98790, 'und', ''),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'mo_pulido', 'MO Pulido', true, 62160, 'und', ''),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'mo_patas', 'MO Patas', true, 22200, 'und', ''),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'mo_instalacion', 'MO Instalación', true, 22200, 'und', ''),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'tte_elementos', 'TTE Elementos', true, 60000, 'und', ''),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'tte_ida', 'TTE Personal Ida', true, 0, 'und', ''),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'tte_regreso', 'TTE Personal Regreso', true, 20000, 'und', ''),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'laser', 'Corte láser', true, 6500, 'und', '');

-- producto_lineas_apu (21)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'insumos', 1, 'Acero lavaescobas cal 18', 'acero_cuerpo', '((largo + 0.04) * (profundo + 0.04)) * 2 + ((ancho + 0.04) * (profundo + 0.04)) * 2 + ((salp_long * (alto_salpicadero / 2) * largo) + (salp_costado * (alto_salpicadero / 2) * ancho))', 0, NULL, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'insumos', 2, 'Acero fregadero con lateral cal 18', 'acero_fregadero', '(((largo / 2) + 0.45) * (ancho + 0.1) + ancho * 0.7) * IF(tiene_fregadero, 1, 0)', 0, NULL, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'insumos', 3, 'Acero babero completo frontal', 'acero_babero', '(largo / 2) * (alto_babero + 0.5) + (largo / 2) * alto_babero + (alto_babero + 0.04) * ancho * baberos_laterales', 0, NULL, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'insumos', 4, 'Tubo 1-1/2 cal 16 patas', 'tubo_patas', 'IF(tiene_patas, altura_patas * num_patas, 0)', 0, NULL, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'insumos', 5, 'Niveladores', 'niveladores', 'IF(tiene_patas, num_patas, 0)', 0, NULL, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'insumos', 6, 'Argón', 'argon', 'largo * 2', 0, NULL, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'insumos', 7, 'Disco de corte', 'disco_corte', '(largo * 2) / 3', 0, NULL, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'insumos', 8, 'Disco flap', 'disco_flap', '(largo * 2) / 8', 0, NULL, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'insumos', 9, 'Paño Scotch Brite', 'pano', '(largo * 2) / 3', 0, NULL, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'insumos', 10, 'Lija zirconio', 'lija', '(largo * 2) / 4', 0, NULL, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'insumos', 11, 'Grata', 'grata', '(largo * 2) / 30', 0, NULL, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'insumos', 12, 'Empaque y embalaje', 'empaque', 'largo * 2', 0, NULL, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'mo', 13, 'MO Acero', 'mo_acero', 'largo * 2', 0, NULL, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'mo', 14, 'MO Pulido', 'mo_pulido', 'largo * 2', 0, NULL, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'mo', 15, 'MO Patas', 'mo_patas', 'num_patas * IF(tiene_patas, 1, 0)', 0, NULL, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'mo', 16, 'MO Instalación', 'mo_instalacion', 'IF(instalado, largo * 2, 0)', 0, NULL, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'transporte', 17, 'TTE Elementos', 'tte_elementos', 'largo', 0, NULL, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'transporte', 18, 'TTE Personal Ida', 'tte_ida', 'largo', 0, NULL, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'transporte', 19, 'TTE Personal Regreso', 'tte_regreso', 'largo', 0, NULL, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'laser', 20, 'Corte láser', 'laser', 'largo * 4', 0, NULL, NULL, NULL),
  ('5abde872-b76b-4e34-b84e-a8d387206fa8', 'poliza', 21, 'Póliza', NULL, '1', 0, 'poliza', NULL, NULL);


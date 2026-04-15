-- ============================================================
-- PRODUCTO: Lavabotas
-- ID: 3fb1108f-594b-41fd-ac50-b331beb28ab9
-- Grupo: accesorios
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = '3fb1108f-594b-41fd-ac50-b331beb28ab9';
DELETE FROM producto_lineas_apu WHERE producto_id = '3fb1108f-594b-41fd-ac50-b331beb28ab9';
DELETE FROM producto_materiales WHERE producto_id = '3fb1108f-594b-41fd-ac50-b331beb28ab9';
DELETE FROM producto_variables WHERE producto_id = '3fb1108f-594b-41fd-ac50-b331beb28ab9';
DELETE FROM productos_catalogo WHERE id = '3fb1108f-594b-41fd-ac50-b331beb28ab9';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'Lavabotas', 'accesorios', 38, '[instalado:Suministro e instalación de|Suministro de] lavabotas industrial en acero inoxidable AISI 304 mate cal.16 de {largo} m de largo x {ancho} m de ancho, pozuelo de {profundo} m de profundidad, salpicadero de {alto_salpicadero} m de alto, babero de {alto_babero} m de alto, [tiene_patas:{num_patas} patas en tubo redondo inox 3 pulg cal.16 de {alto_patas} m de alto, |sin patas, ]incluye {num_push} push orinal, cepillo para lavabotas, bisagra continua oculta inox, piso de botas en acero inox cal.16, bridas de piso y tornillería. Soldadura TIG con gas argón, acabado pulido mate sanitario. [poliza:Incluye póliza.|Sin póliza.]', true, 30);

-- producto_variables (12)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'largo', 'Largo', 'numero', '0.4', 0.3, 2, NULL, 'Dimensiones', 1, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'ancho', 'Ancho', 'numero', '0.4', 0.3, 1, NULL, 'Dimensiones', 2, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'profundo', 'Profundo Pozuelo', 'numero', '0.4', 0.15, 0.6, NULL, 'Dimensiones', 3, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'alto_salpicadero', 'Alto Salpicadero', 'numero', '0.52', 0.1, 1, NULL, 'Dimensiones', 4, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'alto_babero', 'Alto Babero', 'numero', '0.5', 0.2, 1, NULL, 'Dimensiones', 5, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'tiene_patas', 'Tiene Patas', 'toggle', 'true', NULL, NULL, NULL, 'Estructura', 6, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'num_patas', '# Patas', 'numero', '4', 2, 8, NULL, 'Estructura', 7, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'alto_patas', 'Alto Patas', 'numero', '0.2', 0.1, 0.5, NULL, 'Estructura', 8, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'num_push', '# Push Orinal', 'numero', '1', 0, 4, NULL, 'Accesorios', 9, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'instalado', 'Incluye Instalación', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 10, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'poliza', 'Requiere Póliza', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 11, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'poliza_pct', 'Póliza %', 'numero', '2', 1, 10, NULL, 'Extras', 12, NULL, NULL);

-- producto_materiales (27)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'acero_pozuelo', 'Acero pozuelo cal 16', false, NULL, 'm²', 'AILA010116'),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'acero_espaldar', 'Acero espaldar cal 16', false, NULL, 'm²', 'AILA010116'),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'acero_babero', 'Acero babero cal 16', false, NULL, 'm²', 'AILA010116'),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'tubo_patas', 'Tubo redondo 3" cal 16', false, NULL, 'ml', 'AITR210016'),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'bridas', 'Bridas de piso', true, 16909, 'und', ''),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'tornillos', 'Tornillos', true, 2500, 'und', ''),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'cepillo', 'Cepillo para lavabotas', true, 47000, 'und', ''),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'gancho', 'Gancho soporte', true, 6000, 'und', ''),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'push_orinal', 'Push orinal', true, 140000, 'und', ''),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'bisagra', 'Bisagra continua oculta', false, NULL, 'ml', 'FEBI010101'),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'acero_piso', 'Acero piso de botas cal 16', false, NULL, 'm²', 'AILA010116'),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'laser_piso', 'Láser piso de botas', true, 6500, 'und', ''),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'argon', 'Argón', true, 4500, 'und', ''),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'disco_corte', 'Disco de corte', false, NULL, 'und', 'ABDI100124'),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'disco_flap', 'Disco flap', false, NULL, 'und', 'ABDI802060'),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'pano', 'Paño Scotch Brite', false, NULL, 'und', 'ABPA020001'),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'lija', 'Lija zirconio', false, NULL, 'und', 'ABLI202080'),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'grata', 'Grata', false, NULL, 'und', 'ABGR200019'),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'empaque', 'Empaque y embalaje', true, 9000, 'und', ''),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'mo_acero', 'MO Acero', true, 150000, 'und', ''),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'mo_pulido', 'MO Pulido', true, 80000, 'und', ''),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'mo_patas', 'MO Patas', true, 8000, 'und', ''),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'mo_instalacion', 'MO Instalación', true, 60000, 'und', ''),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'tte_elementos', 'TTE Elementos', true, 70000, 'und', ''),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'tte_ida', 'TTE Personal Ida', true, 0, 'und', ''),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'tte_regreso', 'TTE Personal Regreso', true, 15000, 'und', ''),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'laser', 'Corte láser', true, 6500, 'und', '');

-- producto_lineas_apu (28)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'insumos', 1, 'Acero pozuelo cal 16', 'acero_pozuelo', '(largo + profundo * 2 + 0.04) * (ancho + 0.04) + (largo + 0.04) * (profundo + 0.04) * 2', 0, NULL, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'insumos', 2, 'Acero espaldar cal 16', 'acero_espaldar', '(largo + 0.04) * (alto_salpicadero + 0.04)', 0, NULL, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'insumos', 3, 'Acero babero cal 16', 'acero_babero', '(largo + 0.04) * (alto_babero + 0.04) + (ancho + 0.04) * (alto_babero + 0.04) * 2', 0, NULL, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'insumos', 4, 'Tubo redondo 3" cal 16', 'tubo_patas', 'IF(tiene_patas, num_patas * alto_patas + (largo * 2 + 0.2), 0)', 0, NULL, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'insumos', 5, 'Bridas de piso', 'bridas', 'IF(tiene_patas, num_patas, 0)', 0, NULL, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'insumos', 6, 'Tornillos', 'tornillos', 'IF(tiene_patas, num_patas * 3, 0)', 0, NULL, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'insumos', 7, 'Cepillo para lavabotas', 'cepillo', 'ROUNDUP(largo / 0.6, 0)', 0, NULL, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'insumos', 8, 'Gancho soporte', 'gancho', 'ROUNDUP(largo / 0.6, 0)', 0, NULL, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'insumos', 9, 'Push orinal', 'push_orinal', 'num_push', 0, NULL, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'insumos', 10, 'Bisagra continua oculta', 'bisagra', 'ancho * 1.1', 0, NULL, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'insumos', 11, 'Acero piso de botas cal 16', 'acero_piso', '(largo + 0.04) * (ancho + 0.04)', 0, NULL, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'insumos', 12, 'Láser piso de botas', 'laser_piso', 'IF(tiene_patas, num_patas, 0)', 0, NULL, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'insumos', 13, 'Argón', 'argon', 'largo * 2', 0, NULL, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'insumos', 14, 'Disco de corte', 'disco_corte', 'largo * 2', 0, NULL, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'insumos', 15, 'Disco flap', 'disco_flap', 'largo * 2', 0, NULL, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'insumos', 16, 'Paño Scotch Brite', 'pano', 'largo * 2', 0, NULL, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'insumos', 17, 'Lija zirconio', 'lija', 'largo * 2', 0, NULL, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'insumos', 18, 'Grata', 'grata', 'largo / 5', 0, NULL, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'insumos', 19, 'Empaque y embalaje', 'empaque', 'largo * 2', 0, NULL, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'mo', 20, 'MO Acero', 'mo_acero', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'mo', 21, 'MO Pulido', 'mo_pulido', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'mo', 22, 'MO Patas', 'mo_patas', 'IF(tiene_patas, num_patas, 0)', 0, NULL, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'mo', 23, 'MO Instalación', 'mo_instalacion', 'IF(instalado, IF(largo < 1, 1, largo), 0)', 0, NULL, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'transporte', 24, 'TTE Elementos', 'tte_elementos', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'transporte', 25, 'TTE Personal Ida', 'tte_ida', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'transporte', 26, 'TTE Personal Regreso', 'tte_regreso', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'laser', 27, 'Corte láser', 'laser', 'IF(largo < 1, 1, largo) * 2', 0, NULL, NULL, NULL),
  ('3fb1108f-594b-41fd-ac50-b331beb28ab9', 'poliza', 28, 'Póliza', NULL, '1', 0, 'poliza', NULL, NULL);


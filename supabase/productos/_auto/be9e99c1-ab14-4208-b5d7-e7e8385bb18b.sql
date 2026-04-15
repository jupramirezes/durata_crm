-- ============================================================
-- PRODUCTO: Pozuelo Corrido Industrial
-- ID: be9e99c1-ab14-4208-b5d7-e7e8385bb18b
-- Grupo: pozuelos
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = 'be9e99c1-ab14-4208-b5d7-e7e8385bb18b';
DELETE FROM producto_lineas_apu WHERE producto_id = 'be9e99c1-ab14-4208-b5d7-e7e8385bb18b';
DELETE FROM producto_materiales WHERE producto_id = 'be9e99c1-ab14-4208-b5d7-e7e8385bb18b';
DELETE FROM producto_variables WHERE producto_id = 'be9e99c1-ab14-4208-b5d7-e7e8385bb18b';
DELETE FROM productos_catalogo WHERE id = 'be9e99c1-ab14-4208-b5d7-e7e8385bb18b';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'Pozuelo Corrido Industrial', 'pozuelos', 38, '[instalado:Suministro e instalación de|Suministro de] pozuelo corrido industrial en acero inoxidable 304 calibre 18 de {largo} m de largo x {ancho} m de ancho x {profundo} m de profundidad, con salpicadero trasero de {alto_salpicadero} m de alto y {salp_laterales} salpicadero(s) lateral(es), [tiene_babero:con babero de {alto_babero} m de alto y {babero_laterales} babero(s) lateral(es), |sin babero, ][tiene_patas:{num_patas} patas en tubo cuadrado 1-1/2 pulg cal 16 de {alto_patas} m con niveladores, |sin patas, ][tiene_pieamigos:{pieamigos} pieamigo(s) en acero cal 14, |sin pieamigos, ]soldadura TIG con gas argón, acabado pulido satinado. [poliza:Incluye póliza.|Sin póliza.]', true, 41);

-- producto_variables (16)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'largo', 'Largo', 'numero', '2', 0.5, 5, NULL, 'Dimensiones', 1, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'ancho', 'Ancho', 'numero', '0.6', 0.3, 1.2, NULL, 'Dimensiones', 2, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'profundo', 'Profundidad', 'numero', '0.3', 0.1, 0.6, NULL, 'Dimensiones', 3, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'alto_salpicadero', 'Alto Salpicadero', 'numero', '0.2', 0.05, 0.5, NULL, 'Dimensiones', 4, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'salp_laterales', '# Salpicadero Laterales', 'numero', '2', 0, 4, NULL, 'Configuración', 5, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'tiene_babero', 'Tiene Babero', 'toggle', 'false', NULL, NULL, NULL, 'Configuración', 6, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'alto_babero', 'Alto Babero', 'numero', '0.4', 0.1, 1, NULL, 'Configuración', 7, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'babero_laterales', '# Babero Laterales', 'numero', '2', 0, 2, NULL, 'Configuración', 8, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'tiene_pieamigos', 'Tiene Pieamigos', 'toggle', 'false', NULL, NULL, NULL, 'Estructura', 9, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'pieamigos', '# Pieamigos', 'numero', '0', 0, 6, NULL, 'Estructura', 10, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'tiene_patas', 'Tiene Patas', 'toggle', 'false', NULL, NULL, NULL, 'Estructura', 11, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'num_patas', '# Patas', 'numero', '0', 0, 6, NULL, 'Estructura', 12, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'alto_patas', 'Alto Patas', 'numero', '0.9', 0.3, 1.2, NULL, 'Estructura', 13, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'instalado', 'Incluye Instalación', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 14, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'poliza', 'Requiere Póliza', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 15, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'poliza_pct', 'Póliza %', 'numero', '2', 1, 10, NULL, 'Extras', 16, NULL, NULL);

-- producto_materiales (22)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'acero_mesa', 'Acero mesa cal 18 2B', false, NULL, 'm²', 'AILA010118'),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'acero_babero', 'Acero babero cal 18 2B', false, NULL, 'm²', 'AILA010118'),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'acero_pieamigo', 'Acero pieamigo cal 14', false, NULL, 'm²', 'AILA010114'),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'tornillos', 'Tornillos', true, 800, 'und', ''),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'tubo_patas', 'Tubo cuadrado 1-1/2" cal 16', false, NULL, 'ml', 'AITC180016'),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'niveladores', 'Niveladores', false, NULL, 'und', 'FENI010118'),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'argon', 'Argón', true, 3500, 'und', ''),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'disco_corte', 'Disco de corte', false, NULL, 'und', 'ABDI100124'),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'disco_flap', 'Disco flap', false, NULL, 'und', 'ABDI802060'),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'pano', 'Paño Scotch Brite', false, NULL, 'und', 'ABPA020001'),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'lija', 'Lija zirconio', false, NULL, 'und', 'ABLI202080'),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'grata', 'Grata', false, NULL, 'und', 'ABGR200019'),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'empaque', 'Empaque y embalaje', true, 5500, 'und', ''),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'mo_acero', 'MO Acero', true, 77700, 'und', ''),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'mo_pulido', 'MO Pulido', true, 32190, 'und', ''),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'mo_pieamigos', 'MO Pieamigos', true, 15540, 'und', ''),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'mo_patas', 'MO Patas', true, 17760, 'und', ''),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'mo_instalacion', 'MO Instalación', true, 33300, 'und', ''),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'tte_elementos', 'TTE Elementos', true, 70000, 'und', ''),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'tte_ida', 'TTE Personal Ida', true, 0, 'und', ''),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'tte_regreso', 'TTE Personal Regreso', true, 25000, 'und', ''),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'laser', 'Corte láser', true, 6500, 'und', '');

-- producto_lineas_apu (23)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'insumos', 1, 'Acero mesa cal 18 2B', 'acero_mesa', '((largo + 0.08) * ((ancho + 0.08) + alto_salpicadero + profundo * 2)) + (ancho * (alto_salpicadero + 0.06) * salp_laterales) + profundo * ancho * 2', 0, NULL, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'insumos', 2, 'Acero babero cal 18 2B', 'acero_babero', 'IF(tiene_babero, (largo + 0.04) * (alto_babero + 0.04) + ancho * (alto_babero + 0.04) * babero_laterales, 0)', 0, NULL, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'insumos', 3, 'Acero pieamigo cal 14', 'acero_pieamigo', 'IF(tiene_pieamigos, pieamigos * (0.5 * 0.4), 0)', 0, NULL, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'insumos', 4, 'Tornillos', 'tornillos', 'pieamigos * 3 + 3', 0, NULL, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'insumos', 5, 'Tubo cuadrado 1-1/2" cal 16', 'tubo_patas', 'IF(tiene_patas, alto_patas * num_patas + largo + ancho * (num_patas / 2), 0)', 0, NULL, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'insumos', 6, 'Niveladores', 'niveladores', 'num_patas', 0, NULL, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'insumos', 7, 'Argón', 'argon', 'largo + profundo + alto_babero + alto_salpicadero + IF(tiene_patas, 0.25, 0)', 0, NULL, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'insumos', 8, 'Disco de corte', 'disco_corte', '(largo + profundo + alto_babero + alto_salpicadero + IF(tiene_patas, 0.25, 0)) / 3', 0, NULL, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'insumos', 9, 'Disco flap', 'disco_flap', '(largo + profundo + alto_babero + alto_salpicadero + IF(tiene_patas, 0.25, 0)) / 8', 0, NULL, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'insumos', 10, 'Paño Scotch Brite', 'pano', '(largo + profundo + alto_babero + alto_salpicadero + IF(tiene_patas, 0.25, 0)) / 3', 0, NULL, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'insumos', 11, 'Lija zirconio', 'lija', '(largo + profundo + alto_babero + alto_salpicadero + IF(tiene_patas, 0.25, 0)) / 4', 0, NULL, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'insumos', 12, 'Grata', 'grata', '(largo + profundo + alto_babero + alto_salpicadero + IF(tiene_patas, 0.25, 0)) / 30', 0, NULL, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'insumos', 13, 'Empaque y embalaje', 'empaque', 'largo', 0, NULL, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'mo', 14, 'MO Acero', 'mo_acero', 'largo + profundo + alto_babero + alto_salpicadero', 0, NULL, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'mo', 15, 'MO Pulido', 'mo_pulido', 'largo + profundo + alto_babero + alto_salpicadero', 0, NULL, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'mo', 16, 'MO Pieamigos', 'mo_pieamigos', 'pieamigos', 0, NULL, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'mo', 17, 'MO Patas', 'mo_patas', 'IF(tiene_patas, num_patas, 0)', 0, NULL, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'mo', 18, 'MO Instalación', 'mo_instalacion', 'IF(instalado, largo, 0)', 0, NULL, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'transporte', 19, 'TTE Elementos', 'tte_elementos', '1', 0, NULL, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'transporte', 20, 'TTE Personal Ida', 'tte_ida', '1', 0, NULL, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'transporte', 21, 'TTE Personal Regreso', 'tte_regreso', '1', 0, NULL, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'laser', 22, 'Corte láser', 'laser', 'ROUNDUP(largo * 2, 0)', 0, NULL, NULL, NULL),
  ('be9e99c1-ab14-4208-b5d7-e7e8385bb18b', 'poliza', 23, 'Póliza', NULL, '1', 0, 'poliza', NULL, NULL);


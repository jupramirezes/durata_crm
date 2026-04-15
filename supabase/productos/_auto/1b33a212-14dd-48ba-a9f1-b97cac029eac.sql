-- ============================================================
-- PRODUCTO: Vertedero
-- ID: 1b33a212-14dd-48ba-a9f1-b97cac029eac
-- Grupo: accesorios
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = '1b33a212-14dd-48ba-a9f1-b97cac029eac';
DELETE FROM producto_lineas_apu WHERE producto_id = '1b33a212-14dd-48ba-a9f1-b97cac029eac';
DELETE FROM producto_materiales WHERE producto_id = '1b33a212-14dd-48ba-a9f1-b97cac029eac';
DELETE FROM producto_variables WHERE producto_id = '1b33a212-14dd-48ba-a9f1-b97cac029eac';
DELETE FROM productos_catalogo WHERE id = '1b33a212-14dd-48ba-a9f1-b97cac029eac';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'Vertedero', 'accesorios', 38, '[instalado:Suministro e instalación de|Suministro de] vertedero industrial en acero inoxidable 304 de {largo} m de largo x {ancho} m de ancho, pozuelo cilíndrico de {diam_vert} m de diámetro x {alto_vert} m de profundidad, babero de {alto_babero} m de alto en cal 20 satinado, {salp_long} salpicadero(s) longitudinal(es) y {salp_costado} salpicadero(s) de costado de {alto_salpicadero} m de alto, [tiene_patas:{num_patas} patas en tubo cuadrado 1-1/2 pulg cal 16 de {altura_patas} m con niveladores inox, |sin patas (sobreponer), ]refuerzo inferior en tubo redondo 3 pulg cal 16, {baberos_laterales} babero(s) lateral(es), soldadura TIG con gas argón, acabado pulido satinado, {chapetas} chapetas de fijación. [poliza:Incluye póliza.|Sin póliza.]', true, 31);

-- producto_variables (17)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'largo', 'Largo', 'numero', '0.6', 0.3, 2, NULL, 'Dimensiones', 1, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'ancho', 'Ancho', 'numero', '0.6', 0.3, 1.5, NULL, 'Dimensiones', 2, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'profundo', 'Profundo Pozuelo', 'numero', '0.35', 0.15, 0.6, NULL, 'Dimensiones', 3, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'alto_salpicadero', 'Alto Salpicadero', 'numero', '0.1', 0.05, 0.5, NULL, 'Dimensiones', 4, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'alto_babero', 'Alto Babero', 'numero', '0.45', 0.1, 1, NULL, 'Dimensiones', 5, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'salp_long', '# Salpicadero Long', 'numero', '1', 0, 2, NULL, 'Configuración', 6, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'salp_costado', '# Salpicadero Costado', 'numero', '1', 0, 4, NULL, 'Configuración', 7, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'baberos_laterales', '# Baberos Laterales', 'numero', '1', 0, 2, NULL, 'Configuración', 8, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'diam_vert', 'Diámetro Vertedero', 'numero', '0.45', 0.2, 1, NULL, 'Vertedero', 9, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'alto_vert', 'Alto Vertedero', 'numero', '0.5', 0.2, 1, NULL, 'Vertedero', 10, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'tiene_patas', 'Tiene Patas', 'toggle', 'false', NULL, NULL, NULL, 'Estructura', 11, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'num_patas', '# Patas', 'numero', '0', 0, 6, NULL, 'Estructura', 12, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'altura_patas', 'Altura Patas', 'numero', '0.9', 0.3, 1.2, NULL, 'Estructura', 13, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'chapetas', '# Chapetas', 'numero', '2', 0, 6, NULL, 'Configuración', 14, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'instalado', 'Incluye Instalación', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 15, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'poliza', 'Requiere Póliza', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 16, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'poliza_pct', 'Póliza %', 'numero', '2', 1, 10, NULL, 'Extras', 17, NULL, NULL);

-- producto_materiales (22)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'acero_mesa', 'Acero mesa cal 18', false, NULL, 'm²', 'AILA010118'),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'acero_babero', 'Acero babero cal 20 sat', false, NULL, 'm²', 'AILA010220'),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'acero_pozuelo', 'Acero pozuelo y sistema cal 16', false, NULL, 'm²', 'AILA010116'),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'tubo_3', 'Tubo redondo 3" cal 16', false, NULL, 'ml', 'AITR210016'),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'tubo_patas', 'Tubo cuadrado 1-1/2" cal 16', false, NULL, 'ml', 'AITC180016'),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'niveladores', 'Niveladores', false, NULL, 'und', 'FENI010118'),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'chapetas_mat', 'Chapetas + tornillos', true, 4000, 'und', ''),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'argon', 'Argón', true, 16000, 'und', ''),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'disco_corte', 'Disco de corte', false, NULL, 'und', 'ABDI100124'),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'disco_flap', 'Disco flap', false, NULL, 'und', 'ABDI802060'),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'pano', 'Paño Scotch Brite', false, NULL, 'und', 'ABPA020001'),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'lija', 'Lija zirconio', false, NULL, 'und', 'ABLI202080'),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'grata', 'Grata', false, NULL, 'und', 'ABGR200019'),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'empaque', 'Empaque y embalaje', true, 3500, 'und', ''),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'mo_acero', 'MO Acero', true, 127650, 'und', ''),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'mo_pulido', 'MO Pulido', true, 77700, 'und', ''),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'mo_patas', 'MO Patas', true, 11100, 'und', ''),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'mo_instalacion', 'MO Instalación', true, 22200, 'und', ''),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'tte_elementos', 'TTE Elementos', true, 45000, 'und', ''),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'tte_ida', 'TTE Personal Ida', true, 0, 'und', ''),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'tte_regreso', 'TTE Personal Regreso', true, 15000, 'und', ''),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'laser', 'Corte láser', true, 6500, 'und', '');

-- producto_lineas_apu (23)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'insumos', 1, 'Acero mesa cal 18', 'acero_mesa', '(largo + alto_salpicadero * 2) * (ancho + alto_salpicadero * 2) * 1.1', 0, NULL, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'insumos', 2, 'Acero babero cal 20 sat', 'acero_babero', 'largo * (alto_babero + 0.04) + ancho * (alto_babero + 0.04) * baberos_laterales', 0, NULL, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'insumos', 3, 'Acero pozuelo y sistema cal 16', 'acero_pozuelo', 'diam_vert * 3.1416 * alto_vert + (0.2 * 0.2 * 3.1416) * 2', 0, NULL, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'insumos', 4, 'Tubo redondo 3" cal 16', 'tubo_3', '0.2', 0, NULL, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'insumos', 5, 'Tubo cuadrado 1-1/2" cal 16 patas', 'tubo_patas', 'IF(tiene_patas, altura_patas * num_patas + largo + ancho * 2, 0)', 0, NULL, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'insumos', 6, 'Niveladores', 'niveladores', 'num_patas', 0, NULL, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'insumos', 7, 'Chapetas + tornillos', 'chapetas_mat', 'chapetas', 0, NULL, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'insumos', 8, 'Argón', 'argon', 'largo + ancho + profundo', 0, NULL, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'insumos', 9, 'Disco de corte', 'disco_corte', '(largo + ancho + profundo) / 3', 0, NULL, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'insumos', 10, 'Disco flap', 'disco_flap', '(largo + ancho + profundo) / 8', 0, NULL, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'insumos', 11, 'Paño Scotch Brite', 'pano', '(largo + ancho + profundo) / 3', 0, NULL, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'insumos', 12, 'Lija zirconio', 'lija', '(largo + ancho + profundo) / 4', 0, NULL, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'insumos', 13, 'Grata', 'grata', '(largo + ancho + profundo) / 30', 0, NULL, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'insumos', 14, 'Empaque y embalaje', 'empaque', 'largo * 2', 0, NULL, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'mo', 15, 'MO Acero', 'mo_acero', 'largo + ancho + profundo', 0, NULL, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'mo', 16, 'MO Pulido', 'mo_pulido', 'largo + ancho + profundo', 0, NULL, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'mo', 17, 'MO Patas', 'mo_patas', 'num_patas * IF(tiene_patas, 1, 0)', 0, NULL, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'mo', 18, 'MO Instalación', 'mo_instalacion', 'IF(instalado, largo + ancho + profundo, 0)', 0, NULL, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'transporte', 19, 'TTE Elementos', 'tte_elementos', 'largo + ancho + profundo', 0, NULL, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'transporte', 20, 'TTE Personal Ida', 'tte_ida', 'largo + ancho + profundo', 0, NULL, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'transporte', 21, 'TTE Personal Regreso', 'tte_regreso', 'largo + ancho + profundo', 0, NULL, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'laser', 22, 'Corte láser', 'laser', 'largo * 10', 0, NULL, NULL, NULL),
  ('1b33a212-14dd-48ba-a9f1-b97cac029eac', 'poliza', 23, 'Póliza', NULL, '1', 0, 'poliza', NULL, NULL);


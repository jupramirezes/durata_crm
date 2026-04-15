-- ============================================================
-- PRODUCTO: Lavaescobas Sencillo
-- ID: 0ad70dd0-16da-4e1d-a822-b506c0632146
-- Grupo: accesorios
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = '0ad70dd0-16da-4e1d-a822-b506c0632146';
DELETE FROM producto_lineas_apu WHERE producto_id = '0ad70dd0-16da-4e1d-a822-b506c0632146';
DELETE FROM producto_materiales WHERE producto_id = '0ad70dd0-16da-4e1d-a822-b506c0632146';
DELETE FROM producto_variables WHERE producto_id = '0ad70dd0-16da-4e1d-a822-b506c0632146';
DELETE FROM productos_catalogo WHERE id = '0ad70dd0-16da-4e1d-a822-b506c0632146';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'Lavaescobas Sencillo', 'accesorios', 38, '[instalado:Suministro e instalación de|Suministro de] lavatraperas en acero inoxidable 304 cal.18 acabado 2B de {largo} m de largo x {ancho} m de ancho x {alto_lavaescobas} m de alto, pozuelo de {profundo} m de profundidad, {salp_long} salpicadero longitudinal de {alto_salpicadero} m y {salp_costado} salpicadero de costado de {alto_salpicadero} m, babero de {alto_babero} m de alto, [tiene_patas:{num_patas} pata en tubo cuadrado 1-1/2 pulg cal.16 con niveladores|sin patas], soldadura TIG con gas argón, acabado pulido satinado. [poliza:Incluye póliza.|Sin póliza.]', true, 21);

-- producto_variables (13)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'largo', 'Largo', 'numero', '0.62', 0.3, 3, NULL, 'Dimensiones', 1, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'ancho', 'Ancho', 'numero', '0.45', 0.3, 1.5, NULL, 'Dimensiones', 2, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'profundo', 'Profundo Pozuelo', 'numero', '0.35', 0.15, 0.6, NULL, 'Dimensiones', 3, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'alto_lavaescobas', 'Alto Lavaescobas', 'numero', '0.6', 0.4, 1.2, NULL, 'Dimensiones', 4, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'salp_long', '# Salpicadero Longitudinal', 'numero', '1', 0, 2, NULL, 'Configuración', 5, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'salp_costado', '# Salpicadero Costado', 'numero', '1', 0, 2, NULL, 'Configuración', 6, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'alto_salpicadero', 'Alto Salpicadero', 'numero', '0.2', 0.1, 0.5, NULL, 'Configuración', 7, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'alto_babero', 'Alto Babero', 'numero', '0.45', 0.2, 1, NULL, 'Configuración', 8, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'tiene_patas', 'Tiene Patas', 'toggle', 'true', NULL, NULL, NULL, 'Configuración', 9, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'num_patas', '# Patas', 'numero', '1', 1, 6, NULL, 'Configuración', 10, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'instalado', 'Incluye Instalación', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 11, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'poliza', 'Requiere Póliza', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 12, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'poliza_pct', 'Póliza %', 'numero', '2', 1, 10, NULL, 'Extras', 13, NULL, NULL);

-- producto_materiales (21)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'acero_cuerpo', 'Acero lavaescobas cal 18 2B', false, NULL, 'm²', 'AILA010118'),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'acero_babero', 'Acero babero cal 18 satinado', false, NULL, 'm²', 'AILA010218'),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'tubo_patas', 'Tubo 1-1/2 cal 16 patas', false, NULL, 'ml', 'AITC180016'),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'niveladores', 'Niveladores', false, NULL, 'und', 'FENI010118'),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'argon', 'Argón', true, 6000, 'und', ''),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'disco_corte', 'Disco de corte', false, NULL, 'und', 'ABDI100124'),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'disco_flap', 'Disco flap', false, NULL, 'und', 'ABDI802060'),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'pano', 'Paño Scotch Brite', false, NULL, 'und', 'ABPA020001'),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'lija', 'Lija zirconio', false, NULL, 'und', 'ABLI202080'),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'grata', 'Grata', false, NULL, 'und', 'ABGR200019'),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'empaque', 'Empaque y embalaje', true, 3500, 'und', ''),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'chapetas', 'Chapetas', true, 4000, 'und', ''),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'tornillos', 'Tornillos', true, 1000, 'und', ''),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'mo_acero', 'MO Acero', true, 77700, 'und', ''),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'mo_pulido', 'MO Pulido', true, 46620, 'und', ''),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'mo_patas', 'MO Patas', true, 8880, 'und', ''),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'mo_instalacion', 'MO Instalación', true, 33300, 'und', ''),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'tte_elementos', 'TTE Elementos', true, 50000, 'und', ''),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'tte_ida', 'TTE Personal Ida', true, 0, 'und', ''),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'tte_regreso', 'TTE Personal Regreso', true, 10000, 'und', ''),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'laser', 'Corte láser', true, 6500, 'und', '');

-- producto_lineas_apu (22)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'insumos', 1, 'Acero lavaescobas cal 18 2B', 'acero_cuerpo', '((largo + 0.12) + (profundo * 2)) * ((ancho + 0.12) + (profundo * 2)) + alto_salpicadero * (salp_long + salp_costado)', 0, NULL, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'insumos', 2, 'Acero babero cal 18 satinado', 'acero_babero', 'largo * (alto_babero + 0.04) + ancho * (alto_babero + 0.04) * 2', 0, NULL, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'insumos', 3, 'Tubo 1-1/2 cal 16 patas', 'tubo_patas', 'IF(tiene_patas, (alto_lavaescobas - profundo + 0.1) * num_patas, 0)', 0, NULL, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'insumos', 4, 'Niveladores', 'niveladores', 'IF(tiene_patas, num_patas, 0)', 0, NULL, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'insumos', 5, 'Argón', 'argon', 'largo + ancho + profundo + num_patas / 4', 0, NULL, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'insumos', 6, 'Disco de corte', 'disco_corte', '(largo + ancho + profundo + num_patas / 4) / 3', 0, NULL, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'insumos', 7, 'Disco flap', 'disco_flap', '(largo + ancho + profundo + num_patas / 4) / 8', 0, NULL, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'insumos', 8, 'Paño Scotch Brite', 'pano', '(largo + ancho + profundo + num_patas / 4) / 3', 0, NULL, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'insumos', 9, 'Lija zirconio', 'lija', '(largo + ancho + profundo + num_patas / 4) / 4', 0, NULL, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'insumos', 10, 'Grata', 'grata', '(largo + ancho + profundo + num_patas / 4) / 30', 0, NULL, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'insumos', 11, 'Empaque y embalaje', 'empaque', 'largo * 2', 0, NULL, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'insumos', 12, 'Chapetas', 'chapetas', 'ROUNDUP(largo / 0.3, 0)', 0, NULL, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'insumos', 13, 'Tornillos', 'tornillos', 'ROUNDUP(largo / 0.3, 0) * 2', 0, NULL, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'mo', 14, 'MO Acero', 'mo_acero', 'largo + ancho + profundo', 0, NULL, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'mo', 15, 'MO Pulido', 'mo_pulido', 'largo + ancho + profundo', 0, NULL, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'mo', 16, 'MO Patas', 'mo_patas', 'num_patas * IF(tiene_patas, 1, 0)', 0, NULL, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'mo', 17, 'MO Instalación', 'mo_instalacion', 'IF(instalado, largo + ancho + profundo, 0)', 0, NULL, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'transporte', 18, 'TTE Elementos', 'tte_elementos', '1', 0, NULL, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'transporte', 19, 'TTE Personal Ida', 'tte_ida', '0', 0, NULL, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'transporte', 20, 'TTE Personal Regreso', 'tte_regreso', '1', 0, NULL, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'laser', 21, 'Corte láser', 'laser', 'ROUNDUP(largo / 0.3, 0)', 0, NULL, NULL, NULL),
  ('0ad70dd0-16da-4e1d-a822-b506c0632146', 'poliza', 22, 'Póliza', NULL, '1', 0, 'poliza', NULL, NULL);


-- ============================================================
-- PRODUCTO: Pozuelo Quirúrgico
-- ID: f47bf64d-6c9b-46b5-b6ff-5015eac1203b
-- Grupo: pozuelos
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = 'f47bf64d-6c9b-46b5-b6ff-5015eac1203b';
DELETE FROM producto_lineas_apu WHERE producto_id = 'f47bf64d-6c9b-46b5-b6ff-5015eac1203b';
DELETE FROM producto_materiales WHERE producto_id = 'f47bf64d-6c9b-46b5-b6ff-5015eac1203b';
DELETE FROM producto_variables WHERE producto_id = 'f47bf64d-6c9b-46b5-b6ff-5015eac1203b';
DELETE FROM productos_catalogo WHERE id = 'f47bf64d-6c9b-46b5-b6ff-5015eac1203b';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'Pozuelo Quirúrgico', 'pozuelos', 38, '[instalado:Suministro e instalación de|Suministro de] pozuelo quirúrgico para quirófano en acero inoxidable AISI 304 satinado calibre 18 de {largo} m de largo x {ancho} m de ancho x {alto} m de alto, con salpicadero trasero de {alto_salpicadero} m, {babero_frontal} babero frontal y {babero_lateral} babero(s) lateral(es) de {alto_babero} m de alto, {pieamigos} pieamigos en lámina cal 14, chapeta espaldar en lámina cal 12, [tiene_patas:{num_patas} pata(s) en tubo cuadrado inox 1-1/2 pulg cal 16 de {alto_patas} m con niveladores|sin patas]. Soldadura TIG con gas argón, acabado satinado pulido. [poliza:Incluye póliza.|Sin póliza.]', true, 40);

-- producto_variables (15)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'largo', 'Largo Pozuelo', 'numero', '2', 0.5, 4, NULL, 'Dimensiones', 1, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'ancho', 'Ancho Pozuelo', 'numero', '0.6', 0.3, 1.2, NULL, 'Dimensiones', 2, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'alto', 'Alto Pozuelo', 'numero', '0.3', 0.1, 0.6, NULL, 'Dimensiones', 3, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'alto_salpicadero', 'Alto Salpicadero', 'numero', '0.2', 0.05, 0.5, NULL, 'Dimensiones', 4, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'alto_babero', 'Alto Babero', 'numero', '0.4', 0.1, 1, NULL, 'Dimensiones', 5, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'babero_frontal', '# Babero Frontal', 'numero', '1', 0, 1, NULL, 'Configuración', 6, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'babero_lateral', '# Babero Lateral', 'numero', '2', 0, 2, NULL, 'Configuración', 7, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'pieamigos', '# Pieamigos', 'numero', '2', 0, 6, NULL, 'Configuración', 8, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'valvula_pie', '# Válvula de Pie', 'numero', '0', 0, 4, NULL, 'Configuración', 9, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'tiene_patas', 'Tiene Patas', 'toggle', 'false', NULL, NULL, NULL, 'Estructura', 10, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'num_patas', '# Patas', 'numero', '0', 0, 6, NULL, 'Estructura', 11, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'alto_patas', 'Alto Patas', 'numero', '0.9', 0.3, 1.2, NULL, 'Estructura', 12, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'instalado', 'Incluye Instalación', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 13, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'poliza', 'Requiere Póliza', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 14, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'poliza_pct', 'Póliza %', 'numero', '2', 1, 10, NULL, 'Extras', 15, NULL, NULL);

-- producto_materiales (21)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'acero_pozuelo', 'Acero pozuelo con babero y salpicadero cal 18 sat', false, NULL, 'm²', 'AILA010218'),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'argon', 'Argón', true, 10000, 'und', ''),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'disco_corte', 'Disco de corte', false, NULL, 'und', 'ABDI100124'),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'disco_flap', 'Disco flap', false, NULL, 'und', 'ABDI802060'),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'lija_agua', 'Lija papel agua grano 120', false, NULL, 'und', 'ABLI101120'),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'lija_zirconio', 'Lija zirconio', false, NULL, 'und', 'ABLI202080'),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'pano', 'Paño Scotch Brite', false, NULL, 'und', 'ABPA020001'),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'grata', 'Grata', false, NULL, 'und', 'ABGR200019'),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'tornillos', 'Tornillos fijación', true, 600, 'und', ''),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'chapeta', 'Acero chapeta espaldar cal 12', false, NULL, 'm²', 'AILA010112'),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'pieamigos_mat', 'Pieamigos lámina cal 14', false, NULL, 'm²', 'AILA010114'),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'tubo_patas', 'Tubo cuadrado 1-1/2" cal 16', false, NULL, 'ml', 'AITC180016'),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'niveladores', 'Niveladores', false, NULL, 'und', 'FENI010118'),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'mo_soldadura', 'MO Soldadura', true, 108780, 'und', ''),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'mo_pulido', 'MO Pulido', true, 61050, 'und', ''),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'mo_instalacion', 'MO Instalación', true, 33300, 'und', ''),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'mo_patas', 'MO Patas', true, 17205, 'und', ''),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'tte_elementos', 'TTE Elementos', true, 35000, 'und', ''),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'tte_ida', 'TTE Personal Ida', true, 0, 'und', ''),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'tte_regreso', 'TTE Personal Regreso', true, 25000, 'und', ''),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'laser', 'Corte láser', true, 6500, 'und', '');

-- producto_lineas_apu (22)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'insumos', 1, 'Acero pozuelo con babero y salpicadero cal 18', 'acero_pozuelo', '((largo + (alto_salpicadero + 0.05) * 2 + alto * 2) * (ancho + alto_salpicadero + alto + 0.15)) + ((largo + 0.06) * (alto_babero + 0.06)) * babero_frontal + ((ancho + 0.06) * alto_babero * babero_lateral)', 0, NULL, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'insumos', 2, 'Argón', 'argon', 'largo + num_patas / 2', 0, NULL, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'insumos', 3, 'Disco de corte', 'disco_corte', '(largo + num_patas / 2) / 3', 0, NULL, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'insumos', 4, 'Disco flap', 'disco_flap', '(largo + num_patas / 2) / 8', 0, NULL, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'insumos', 5, 'Lija papel agua grano 120', 'lija_agua', '(largo + num_patas / 2) / 3', 0, NULL, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'insumos', 6, 'Lija zirconio', 'lija_zirconio', '(largo + num_patas / 2) / 8', 0, NULL, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'insumos', 7, 'Paño Scotch Brite', 'pano', '(largo + num_patas / 2) / 8', 0, NULL, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'insumos', 8, 'Grata', 'grata', '(largo + num_patas / 2) / 30', 0, NULL, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'insumos', 9, 'Tornillos fijación', 'tornillos', 'largo * 3', 0, NULL, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'insumos', 10, 'Acero chapeta espaldar cal 12', 'chapeta', '0.15 * 0.1 * (largo + 1)', 0, NULL, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'insumos', 11, 'Pieamigos lámina cal 14', 'pieamigos_mat', 'pieamigos * ((0.55 * 0.45) / 2) * 1.05', 0, NULL, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'insumos', 12, 'Tubo cuadrado 1-1/2" cal 16', 'tubo_patas', 'num_patas * alto_patas + (IF(num_patas > 0, largo + ancho * (num_patas / 2), 0))', 0, NULL, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'insumos', 13, 'Niveladores', 'niveladores', 'num_patas', 0, NULL, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'mo', 14, 'MO Soldadura', 'mo_soldadura', 'largo', 0, NULL, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'mo', 15, 'MO Pulido', 'mo_pulido', 'largo', 0, NULL, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'mo', 16, 'MO Instalación', 'mo_instalacion', 'IF(instalado, largo, 0)', 0, NULL, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'mo', 17, 'MO Patas', 'mo_patas', 'num_patas', 0, NULL, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'transporte', 18, 'TTE Elementos', 'tte_elementos', 'largo', 0, NULL, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'transporte', 19, 'TTE Personal Ida', 'tte_ida', 'largo / 2', 0, NULL, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'transporte', 20, 'TTE Personal Regreso', 'tte_regreso', 'largo / 2', 0, NULL, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'laser', 21, 'Corte láser', 'laser', 'ROUNDUP(largo * 2, 0)', 0, NULL, NULL, NULL),
  ('f47bf64d-6c9b-46b5-b6ff-5015eac1203b', 'poliza', 22, 'Póliza', NULL, '1', 0, 'poliza', NULL, NULL);


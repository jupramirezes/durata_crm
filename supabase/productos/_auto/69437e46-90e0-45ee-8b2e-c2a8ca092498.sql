-- ============================================================
-- PRODUCTO: Pozuelo Cuadrado Babero
-- ID: 69437e46-90e0-45ee-8b2e-c2a8ca092498
-- Grupo: pozuelos
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = '69437e46-90e0-45ee-8b2e-c2a8ca092498';
DELETE FROM producto_lineas_apu WHERE producto_id = '69437e46-90e0-45ee-8b2e-c2a8ca092498';
DELETE FROM producto_materiales WHERE producto_id = '69437e46-90e0-45ee-8b2e-c2a8ca092498';
DELETE FROM producto_variables WHERE producto_id = '69437e46-90e0-45ee-8b2e-c2a8ca092498';
DELETE FROM productos_catalogo WHERE id = '69437e46-90e0-45ee-8b2e-c2a8ca092498';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'Pozuelo Cuadrado Babero', 'pozuelos', 38, '[instalado:Suministro e instalación de|Suministro de] pozuelo cuadrado en acero inoxidable 304 mate calibre 18 con babero y pedestal, de {largo} m de largo x {ancho} m de ancho x {alto} m de alto, salpicadero de {alto_salpicadero} m, babero de {alto_babero} m, {babero_frontal} babero frontal y {babero_lateral} baberos laterales, pedestal de {ancho_pedestal} m x {largo_pedestal} m x {alto_pedestal} m, {valvula_pie} válvula de pie con pedal, grifería inox, canastilla 4 pulg, [tiene_patas:{num_patas} patas en tubo 1-1/2 pulg, |sin patas, ][tiene_pieamigos:{pieamigos} pieamigos cal 14, |sin pieamigos, ]soldadura TIG con argón, acabado pulido satinado. [poliza:Incluye póliza.|Sin póliza.]', true, 42);

-- producto_variables (19)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'largo', 'Largo Pozuelo', 'numero', '0.5', 0.3, 2, NULL, 'Dimensiones', 1, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'ancho', 'Ancho Pozuelo', 'numero', '0.45', 0.2, 1, NULL, 'Dimensiones', 2, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'alto', 'Alto Pozuelo', 'numero', '0.3', 0.1, 0.6, NULL, 'Dimensiones', 3, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'alto_salpicadero', 'Alto Salpicadero', 'numero', '0.1', 0.05, 0.5, NULL, 'Dimensiones', 4, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'alto_babero', 'Alto Babero', 'numero', '0.4', 0.1, 1, NULL, 'Dimensiones', 5, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'babero_frontal', '# Babero Frontal', 'numero', '1', 0, 1, NULL, 'Configuración', 6, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'babero_lateral', '# Babero Lateral', 'numero', '2', 0, 2, NULL, 'Configuración', 7, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'ancho_pedestal', 'Ancho Pedestal', 'numero', '0.2', 0.1, 0.5, NULL, 'Pedestal', 8, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'largo_pedestal', 'Largo Pedestal', 'numero', '0.2', 0.1, 0.5, NULL, 'Pedestal', 9, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'alto_pedestal', 'Alto Pedestal', 'numero', '0.5', 0.2, 1, NULL, 'Pedestal', 10, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'valvula_pie', '# Válvula de Pie', 'numero', '1', 0, 4, NULL, 'Accesorios', 11, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'pieamigos', '# Pieamigos', 'numero', '0', 0, 6, NULL, 'Estructura', 12, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'tiene_pieamigos', 'Tiene Pieamigos', 'toggle', 'false', NULL, NULL, NULL, 'Estructura', 13, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'tiene_patas', 'Tiene Patas', 'toggle', 'false', NULL, NULL, NULL, 'Estructura', 14, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'num_patas', '# Patas', 'numero', '0', 0, 6, NULL, 'Estructura', 15, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'alto_patas', 'Alto Patas', 'numero', '0', 0, 1.2, NULL, 'Estructura', 16, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'instalado', 'Incluye Instalación', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 17, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'poliza', 'Requiere Póliza', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 18, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'poliza_pct', 'Póliza %', 'numero', '2', 1, 10, NULL, 'Extras', 19, NULL, NULL);

-- producto_materiales (34)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'acero_pozuelo', 'Acero pozuelo con babero y salpicadero', false, NULL, 'm²', 'AILA010118'),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'acero_pedestal', 'Acero pedestal', false, NULL, 'm²', 'AILA010118'),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'argon', 'Argón', true, 10000, 'und', ''),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'disco_corte', 'Disco de corte', false, NULL, 'und', 'ABDI100124'),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'disco_flap', 'Disco flap', false, NULL, 'und', 'ABDI802060'),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'lija', 'Lija', true, 7400, 'und', ''),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'platina_pedal', 'Platina pedal pie 2" x 1/4"', true, 571631, 'und', ''),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'platina_soporte', 'Platina soporte pedal 1"x3/16', true, 6000, 'ml', ''),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'tornillos_pivote', 'Tornillos inox pivote inferior', true, 1000, 'und', ''),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'varilla', 'Varilla 1/4" amarre pedal', true, 2200, 'ml', ''),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'resorte', 'Resorte inox Woehler', true, 10000, 'und', ''),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'valvula_inox', 'Válvula inox 1/2', true, 20500, 'und', ''),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'niples', 'Niples soporte válvula', true, 4500, 'und', ''),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'angulo', 'Ángulo 1" soporte válvula', false, NULL, 'und', 'AIAG02002'),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'tornillos_hex', 'Tornillos inox hexagonales', true, 1000, 'und', ''),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'griferia', 'Grifería inox', false, NULL, 'und', 'FEGR020002'),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'manguera_40', 'Manguera 40 cms', true, 5500, 'und', ''),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'manguera_60', 'Manguera 60 cms', true, 7000, 'und', ''),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'canastilla', 'Canastilla 4"', false, NULL, 'und', 'FEGR010103'),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'lija_zirconio', 'Lija zirconio', false, NULL, 'und', 'ABLI202080'),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'pano', 'Paño Scotch Brite', false, NULL, 'und', 'ABPA020001'),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'grata', 'Grata', false, NULL, 'und', 'ABGR200019'),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'tornillos_fij', 'Tornillos fijación', true, 800, 'und', ''),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'chapeta', 'Acero chapeta espaldar', false, NULL, 'm²', 'AILA010118'),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'tubo_patas', 'Tubo cuadrado 1-1/2" cal 16', false, NULL, 'ml', 'AITC180016'),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'pieamigos_mat', 'Pieamigos lámina cal 14', false, NULL, 'm²', 'AILA010114'),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'mo_soldadura', 'MO Soldadura', true, 61050, 'und', ''),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'mo_pulido', 'MO Pulido', true, 49950, 'und', ''),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'mo_instalacion', 'MO Instalación', true, 25530, 'und', ''),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'mo_pedestal', 'MO Pedestal y Push Pedal', true, 33300, 'und', ''),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'tte_elementos', 'TTE Elementos', true, 70000, 'und', ''),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'tte_ida', 'TTE Personal Ida', true, 0, 'und', ''),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'tte_regreso', 'TTE Personal Regreso', true, 25000, 'und', ''),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'laser', 'Corte láser', true, 6500, 'und', '');

-- producto_lineas_apu (35)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'insumos', 1, 'Acero pozuelo con babero y salpicadero', 'acero_pozuelo', '((largo + (alto_salpicadero + 0.05) * 2 + alto * 2) * (ancho + alto_salpicadero + 0.15)) + ((largo + 0.06) * (alto_babero + 0.06)) * babero_frontal + ((ancho + 0.06) * alto_babero * babero_lateral)', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'insumos', 2, 'Acero pedestal', 'acero_pedestal', '((ancho_pedestal + 0.02 + (largo_pedestal + 0.03) * 2) * (alto_pedestal + 0.05)) * valvula_pie', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'insumos', 3, 'Argón', 'argon', 'largo + 0.3', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'insumos', 4, 'Disco de corte', 'disco_corte', 'largo + 0.3', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'insumos', 5, 'Disco flap', 'disco_flap', 'largo + 0.3', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'insumos', 6, 'Lija', 'lija', 'largo + 0.3', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'insumos', 7, 'Platina pedal pie', 'platina_pedal', '0.05 * 0.05 * valvula_pie', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'insumos', 8, 'Platina soporte pedal', 'platina_soporte', '0.25 * valvula_pie', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'insumos', 9, 'Tornillos pivote inferior', 'tornillos_pivote', '1 * valvula_pie', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'insumos', 10, 'Varilla 1/4" amarre pedal', 'varilla', '0.6 * valvula_pie', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'insumos', 11, 'Resorte inox Woehler', 'resorte', 'valvula_pie', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'insumos', 12, 'Válvula inox 1/2', 'valvula_inox', 'valvula_pie', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'insumos', 13, 'Niples soporte válvula', 'niples', '2 * valvula_pie', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'insumos', 14, 'Ángulo 1" soporte válvula', 'angulo', 'valvula_pie', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'insumos', 15, 'Tornillos inox hexagonales', 'tornillos_hex', '2 * valvula_pie', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'insumos', 16, 'Grifería inox', 'griferia', 'valvula_pie', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'insumos', 17, 'Manguera 40 cms', 'manguera_40', 'valvula_pie', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'insumos', 18, 'Manguera 60 cms', 'manguera_60', 'valvula_pie', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'insumos', 19, 'Canastilla 4"', 'canastilla', 'valvula_pie', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'insumos', 20, 'Lija zirconio', 'lija_zirconio', 'largo + 0.3', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'insumos', 21, 'Paño Scotch Brite', 'pano', '(largo + 0.3) * 1.5', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'insumos', 22, 'Grata', 'grata', '(largo + 0.3) / 10', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'insumos', 23, 'Tornillos fijación', 'tornillos_fij', '6', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'insumos', 24, 'Acero chapeta espaldar', 'chapeta', '0.2 * 0.1 * 3', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'insumos', 25, 'Tubo cuadrado 1-1/2" cal 16', 'tubo_patas', 'IF(tiene_patas, num_patas * alto_patas + largo + ancho * (num_patas / 2), 0)', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'insumos', 26, 'Pieamigos lámina cal 14', 'pieamigos_mat', 'IF(tiene_pieamigos, pieamigos * (0.6 * 0.4), 0)', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'mo', 27, 'MO Soldadura', 'mo_soldadura', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'mo', 28, 'MO Pulido', 'mo_pulido', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'mo', 29, 'MO Instalación', 'mo_instalacion', 'IF(instalado, IF(largo < 1, 1, largo), 0)', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'mo', 30, 'MO Pedestal y Push Pedal', 'mo_pedestal', 'valvula_pie', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'transporte', 31, 'TTE Elementos', 'tte_elementos', '1', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'transporte', 32, 'TTE Personal Ida', 'tte_ida', '1', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'transporte', 33, 'TTE Personal Regreso', 'tte_regreso', '1', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'laser', 34, 'Corte láser', 'laser', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('69437e46-90e0-45ee-8b2e-c2a8ca092498', 'poliza', 35, 'Póliza', NULL, '1', 0, 'poliza', NULL, NULL);


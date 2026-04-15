-- ============================================================
-- PRODUCTO: Pozuelo Pedestal Ancho
-- ID: 05c37c2f-3e93-4d5b-82b0-d6af77015dd1
-- Grupo: pozuelos
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = '05c37c2f-3e93-4d5b-82b0-d6af77015dd1';
DELETE FROM producto_lineas_apu WHERE producto_id = '05c37c2f-3e93-4d5b-82b0-d6af77015dd1';
DELETE FROM producto_materiales WHERE producto_id = '05c37c2f-3e93-4d5b-82b0-d6af77015dd1';
DELETE FROM producto_variables WHERE producto_id = '05c37c2f-3e93-4d5b-82b0-d6af77015dd1';
DELETE FROM productos_catalogo WHERE id = '05c37c2f-3e93-4d5b-82b0-d6af77015dd1';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'Pozuelo Pedestal Ancho', 'pozuelos', 38, '[instalado:Suministro e instalación de|Suministro de] pozuelo con pedestal ancho en acero inoxidable 304, pedestal cal 20 sat de {ancho_pedestal} m x {largo_pedestal} m x {alto} m, mesa cal 18 de {largo_mesa} m x {ancho_mesa} m, [tiene_poz_redondo:pozuelo esférico redondo 37cm, |][tiene_poz_rect:{num_pozuelos} pozuelo(s) rectangular(es) de {alto_pozuelo} m, |]salpicadero de {alto_salpicadero} m, [tiene_rh:refuerzo RH 12mm, |]soldadura TIG con argón, acabado pulido satinado. [poliza:Incluye póliza.|Sin póliza.]', true, 44);

-- producto_variables (17)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'ancho_pedestal', 'Ancho Pedestal', 'numero', '0.4', 0.2, 1, NULL, 'Pedestal', 1, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'largo_pedestal', 'Largo Pedestal', 'numero', '0.45', 0.2, 1, NULL, 'Pedestal', 2, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'alto', 'Alto', 'numero', '0.85', 0.5, 1.2, NULL, 'Pedestal', 3, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'largo_mesa', 'Largo Mesa', 'numero', '0.4', 0.2, 1.5, NULL, 'Mesa', 4, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'ancho_mesa', 'Ancho Mesa', 'numero', '0.45', 0.2, 1, NULL, 'Mesa', 5, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'alto_pozuelo', 'Alto Pozuelo', 'numero', '0.4', 0.1, 0.6, NULL, 'Pozuelo', 6, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'alto_salpicadero', 'Alto Salpicadero', 'numero', '0.2', 0, 0.5, NULL, 'Mesa', 7, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'salp_laterales', '# Salpicaderos Laterales', 'numero', '0', 0, 4, NULL, 'Mesa', 8, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'num_pozuelos', '# Pozuelos Rectangulares', 'numero', '0', 0, 4, NULL, 'Pozuelo', 9, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'tiene_poz_redondo', 'Pozuelo Redondo', 'toggle', 'true', NULL, NULL, NULL, 'Pozuelo', 10, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'tiene_poz_rect', 'Pozuelos Rectangulares', 'toggle', 'false', NULL, NULL, NULL, 'Pozuelo', 11, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'tiene_rh', 'Madera RH 12mm', 'toggle', 'true', NULL, NULL, NULL, 'Configuración', 12, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'valvula_pie_tic', '# Válvula Pie TIC', 'numero', '0', 0, 4, NULL, 'Accesorios', 13, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'precio_push', 'Precio Push Pedal', 'numero', '280000', 100000, 500000, NULL, 'Accesorios', 14, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'instalado', 'Incluye Instalación', 'toggle', 'true', NULL, NULL, NULL, 'Extras', 15, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'poliza', 'Requiere Póliza', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 16, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'poliza_pct', 'Póliza %', 'numero', '2', 1, 10, NULL, 'Extras', 17, NULL, NULL);

-- producto_materiales (26)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'acero_pedestal', 'Acero pedestal cal 20 sat', false, NULL, 'm²', 'AILA010218'),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'acero_mesa', 'Acero mesa cal 18', false, NULL, 'm²', 'AILA010118'),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'acero_pozuelo', 'Acero pozuelo cal 18', false, NULL, 'm²', 'AILA010118'),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'poz_redondo', 'Pozuelo redondo 37cm', false, NULL, 'und', 'FEPO010137'),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'rh_12mm', 'RH 15mm', false, NULL, 'm²', 'FEOM090015'),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'griferia_cromada', 'Grifería cromada especial', true, 37800, 'und', ''),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'manguera_40', 'Manguera 40 cms', true, 5500, 'und', ''),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'manguera_60', 'Manguera 60 cms', true, 7000, 'und', ''),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'canastilla', 'Canastilla 4"', false, NULL, 'und', 'FEGR010103'),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'argon', 'Argón', true, 10000, 'und', ''),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'disco_corte', 'Disco de corte', false, NULL, 'und', 'ABDI100124'),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'disco_flap', 'Disco flap', false, NULL, 'und', 'ABDI802060'),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'lija_agua', 'Lija papel agua grano 80', false, NULL, 'und', 'ABLI101080'),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'lija_zirconio', 'Lija zirconio', false, NULL, 'und', 'ABLI202080'),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'pano', 'Paño Scotch Brite', false, NULL, 'und', 'ABPA020001'),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'grata', 'Grata', false, NULL, 'und', 'ABGR200019'),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'tornillos', 'Tornillos fijación', true, 800, 'und', ''),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'chapeta', 'Acero chapeta espaldar', true, 298000, 'und', ''),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'empaque', 'Empaque y embalaje', true, 8000, 'und', ''),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'mo_soldadura', 'MO Soldadura', true, 77700, 'und', ''),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'mo_pulido', 'MO Pulido', true, 38850, 'und', ''),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'mo_instalacion', 'MO Instalación', true, 27750, 'und', ''),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'tte_elementos', 'TTE Elementos', true, 70000, 'und', ''),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'tte_ida', 'TTE Personal Ida', true, 0, 'und', ''),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'tte_regreso', 'TTE Personal Regreso', true, 25000, 'und', ''),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'laser', 'Corte láser', true, 6500, 'und', '');

-- producto_lineas_apu (27)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'insumos', 1, 'Acero pedestal cal 20 sat', 'acero_pedestal', '((ancho_pedestal + 0.05) * 2 + largo_pedestal) * (alto + 0.1)', 0, NULL, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'insumos', 2, 'Acero mesa cal 18', 'acero_mesa', '((largo_mesa + 0.12) + ((alto_salpicadero + 0.06) * salp_laterales)) * ((ancho_mesa + 0.05) + (alto_salpicadero + 0.04))', 0, NULL, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'insumos', 3, 'Acero pozuelo cal 18', 'acero_pozuelo', '((ancho_mesa - 0.1) * (alto_pozuelo * 2 + (largo_mesa - 0.08)) + (alto_pozuelo * ancho_mesa * 2)) * num_pozuelos', 0, NULL, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'insumos', 4, 'Pozuelo redondo 37cm', 'poz_redondo', 'IF(tiene_poz_redondo, 1, 0)', 0, NULL, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'insumos', 5, 'RH 12mm', 'rh_12mm', 'IF(tiene_rh, largo_mesa * ancho_mesa, 0)', 0, NULL, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'insumos', 6, 'Grifería cromada especial', 'griferia_cromada', 'valvula_pie_tic', 0, NULL, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'insumos', 7, 'Manguera 40 cms', 'manguera_40', 'valvula_pie_tic', 0, NULL, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'insumos', 8, 'Manguera 60 cms', 'manguera_60', 'valvula_pie_tic', 0, NULL, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'insumos', 9, 'Canastilla 4"', 'canastilla', 'valvula_pie_tic', 0, NULL, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'insumos', 10, 'Argón', 'argon', 'IF(ancho_pedestal < 1, 1, ancho_pedestal)', 0, NULL, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'insumos', 11, 'Disco de corte', 'disco_corte', 'IF(ancho_pedestal < 1, 1, ancho_pedestal)', 0, NULL, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'insumos', 12, 'Disco flap', 'disco_flap', 'IF(ancho_pedestal < 1, 1, ancho_pedestal) * 0.7', 0, NULL, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'insumos', 13, 'Lija papel agua grano 80', 'lija_agua', 'IF(ancho_pedestal < 1, 1, ancho_pedestal)', 0, NULL, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'insumos', 14, 'Lija zirconio', 'lija_zirconio', 'IF(ancho_pedestal < 1, 1, ancho_pedestal) * 0.6', 0, NULL, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'insumos', 15, 'Paño Scotch Brite', 'pano', 'IF(ancho_pedestal < 1, 1, ancho_pedestal)', 0, NULL, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'insumos', 16, 'Grata', 'grata', 'IF(ancho_pedestal < 1, 1, ancho_pedestal) / 5', 0, NULL, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'insumos', 17, 'Tornillos fijación', 'tornillos', 'IF(ancho_pedestal < 1, 1, ancho_pedestal) * 6', 0, NULL, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'insumos', 18, 'Acero chapeta espaldar', 'chapeta', '0.1 * 0.2', 0, NULL, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'insumos', 19, 'Empaque y embalaje', 'empaque', 'IF(ancho_pedestal < 1, 1, ancho_pedestal)', 0, NULL, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'mo', 20, 'MO Soldadura', 'mo_soldadura', 'alto + num_pozuelos / 2 + IF(tiene_poz_redondo, 0.5, 0)', 0, NULL, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'mo', 21, 'MO Pulido', 'mo_pulido', 'alto + num_pozuelos / 2 + IF(tiene_poz_redondo, 0.5, 0)', 0, NULL, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'mo', 22, 'MO Instalación', 'mo_instalacion', 'IF(instalado, IF(ancho_pedestal < 1, 1, ancho_pedestal), 0)', 0, NULL, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'transporte', 23, 'TTE Elementos', 'tte_elementos', 'IF(ancho_pedestal < 1, 1, ancho_pedestal)', 0, NULL, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'transporte', 24, 'TTE Personal Ida', 'tte_ida', 'IF(ancho_pedestal < 1, 1, ancho_pedestal)', 0, NULL, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'transporte', 25, 'TTE Personal Regreso', 'tte_regreso', 'IF(ancho_pedestal < 1, 1, ancho_pedestal)', 0, NULL, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'laser', 26, 'Corte láser', 'laser', '2', 0, NULL, NULL, NULL),
  ('05c37c2f-3e93-4d5b-82b0-d6af77015dd1', 'poliza', 27, 'Póliza', NULL, '1', 0, 'poliza', NULL, NULL);


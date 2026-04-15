-- ============================================================
-- PRODUCTO: Pozuelo Esférico Babero
-- ID: f75d7089-97da-4252-a22a-229c0efb4833
-- Grupo: pozuelos
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = 'f75d7089-97da-4252-a22a-229c0efb4833';
DELETE FROM producto_lineas_apu WHERE producto_id = 'f75d7089-97da-4252-a22a-229c0efb4833';
DELETE FROM producto_materiales WHERE producto_id = 'f75d7089-97da-4252-a22a-229c0efb4833';
DELETE FROM producto_variables WHERE producto_id = 'f75d7089-97da-4252-a22a-229c0efb4833';
DELETE FROM productos_catalogo WHERE id = 'f75d7089-97da-4252-a22a-229c0efb4833';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'Pozuelo Esférico Babero', 'pozuelos', 38, '[instalado:Suministro e instalación de|Suministro de] lavamanos industrial con pedal de pie en acero inoxidable 304 de {num_puestos} puesto(s), mesa en lámina calibre 18 de {largo} m de largo x {ancho} m de ancho x {alto} m de alto, [tiene_pozuelo:con pozuelo esférico redondo de 37 cm integrado, |sin pozuelo, ]babero semi-circular cal 20 de {alto_babero} m de alto, salpicadero de {alto_salpicadero} m, grifería inoxidable con válvula TIC de pie, mangueras de conexión, canastilla 4 pulg, [tiene_rh:refuerzo en madera RH 15mm, |]soldadura TIG con argón, acabado pulido satinado. [poliza:Incluye póliza.|Sin póliza.]', true, 43);

-- producto_variables (15)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'largo', 'Largo Mesa', 'numero', '0.45', 0.3, 2, NULL, 'Dimensiones', 1, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'ancho', 'Ancho Mesa', 'numero', '0.5', 0.3, 1.2, NULL, 'Dimensiones', 2, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'alto', 'Alto', 'numero', '0.5', 0.3, 1.2, NULL, 'Dimensiones', 3, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'alto_salpicadero', 'Alto Salpicadero', 'numero', '0.1', 0, 0.5, NULL, 'Dimensiones', 4, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'salp_laterales', '# Salpicaderos Laterales', 'numero', '0', 0, 4, NULL, 'Dimensiones', 5, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'alto_babero', 'Alto Babero', 'numero', '0.4', 0.1, 1, NULL, 'Dimensiones', 6, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'tiene_pedestal', 'Tiene Pedestal', 'toggle', 'false', NULL, NULL, NULL, 'Estructura', 7, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'largo_pedestal', 'Largo Pedestal', 'numero', '0', 0, 0.5, NULL, 'Estructura', 8, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'ancho_pedestal', 'Ancho Pedestal', 'numero', '0', 0, 0.5, NULL, 'Estructura', 9, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'num_puestos', '# Puestos (Válvula Pie)', 'numero', '2', 1, 6, NULL, 'Accesorios', 10, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'tiene_pozuelo', 'Pozuelo Redondo', 'toggle', 'true', NULL, NULL, NULL, 'Configuración', 11, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'tiene_rh', 'Madera RH 15mm', 'toggle', 'true', NULL, NULL, NULL, 'Configuración', 12, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'instalado', 'Incluye Instalación', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 13, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'poliza', 'Requiere Póliza', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 14, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'poliza_pct', 'Póliza %', 'numero', '2', 1, 10, NULL, 'Extras', 15, NULL, NULL);

-- producto_materiales (25)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'acero_pedestal', 'Acero pedestal cal 18 2B', false, NULL, 'm²', 'AILA010118'),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'acero_mesa', 'Acero mesa cal 18 2B', false, NULL, 'm²', 'AILA010118'),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'acero_babero', 'Acero babero semi-circular cal 20', false, NULL, 'm²', 'AILA010220'),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'poz_redondo', 'Pozuelo redondo 37cm', false, NULL, 'und', 'FEPO010137'),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'rh_15mm', 'RH 15mm', false, NULL, 'm²', 'FEOM090015'),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'griferia', 'Grifería inox', false, NULL, 'und', 'FEGR020002'),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'manguera_40', 'Manguera 40 cms', true, 5500, 'und', ''),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'manguera_60', 'Manguera 60 cms', true, 7000, 'und', ''),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'canastilla', 'Canastilla 4"', false, NULL, 'und', 'FEGR010103'),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'argon', 'Argón', true, 10000, 'und', ''),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'disco_corte', 'Disco de corte', false, NULL, 'und', 'ABDI100124'),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'disco_flap', 'Disco flap', false, NULL, 'und', 'ABDI802060'),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'lija_agua', 'Lija papel agua grano 120', false, NULL, 'und', 'ABLI101120'),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'pano', 'Paño Scotch Brite', false, NULL, 'und', 'ABPA020001'),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'lija_zirconio', 'Lija zirconio', false, NULL, 'und', 'ABLI202080'),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'grata', 'Grata', false, NULL, 'und', 'ABGR200019'),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'tornillos', 'Tornillos fijación', true, 800, 'und', ''),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'chapeta', 'Acero chapeta espaldar', true, 298000, 'und', ''),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'mo_soldadura', 'MO Soldadura', true, 66600, 'und', ''),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'mo_pulido', 'MO Pulido', true, 36630, 'und', ''),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'mo_instalacion', 'MO Instalación', true, 33300, 'und', ''),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'tte_elementos', 'TTE Elementos', true, 35000, 'und', ''),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'tte_ida', 'TTE Personal Ida', true, 0, 'und', ''),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'tte_regreso', 'TTE Personal Regreso', true, 25000, 'und', ''),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'laser', 'Corte láser', true, 6500, 'und', '');

-- producto_lineas_apu (26)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'insumos', 1, 'Acero pedestal cal 18 2B', 'acero_pedestal', '(ancho_pedestal + 0.05) * 2 + IF(tiene_pedestal, largo_pedestal * (alto + 0.1), 0)', 0, NULL, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'insumos', 2, 'Acero mesa cal 18 2B', 'acero_mesa', '((largo + 0.1) + ((alto_salpicadero + 0.04) * salp_laterales)) * (ancho + (alto_salpicadero + 0.05))', 0, NULL, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'insumos', 3, 'Acero babero semi-circular cal 20', 'acero_babero', '(3.1416 * ((ancho * 2) / 2) + 0.1) * alto_babero', 0, NULL, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'insumos', 4, 'Pozuelo redondo 37cm', 'poz_redondo', 'IF(tiene_pozuelo, 1, 0)', 0, NULL, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'insumos', 5, 'RH 15mm', 'rh_15mm', 'IF(tiene_rh, largo * ancho, 0)', 0, NULL, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'insumos', 6, 'Grifería inox', 'griferia', 'num_puestos', 0, NULL, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'insumos', 7, 'Manguera 40 cms', 'manguera_40', 'num_puestos', 0, NULL, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'insumos', 8, 'Manguera 60 cms', 'manguera_60', 'num_puestos', 0, NULL, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'insumos', 9, 'Canastilla 4"', 'canastilla', 'num_puestos', 0, NULL, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'insumos', 10, 'Argón', 'argon', 'num_puestos', 0, NULL, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'insumos', 11, 'Disco de corte', 'disco_corte', 'num_puestos / 3', 0, NULL, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'insumos', 12, 'Disco flap', 'disco_flap', 'num_puestos / 8', 0, NULL, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'insumos', 13, 'Lija papel agua grano 120', 'lija_agua', 'num_puestos / 3', 0, NULL, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'insumos', 14, 'Paño Scotch Brite', 'pano', 'num_puestos / 4', 0, NULL, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'insumos', 15, 'Lija zirconio', 'lija_zirconio', 'num_puestos / 4', 0, NULL, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'insumos', 16, 'Grata', 'grata', 'num_puestos / 30', 0, NULL, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'insumos', 17, 'Tornillos fijación', 'tornillos', 'num_puestos * 4', 0, NULL, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'insumos', 18, 'Acero chapeta espaldar', 'chapeta', '0.15 * largo', 0, NULL, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'mo', 19, 'MO Soldadura', 'mo_soldadura', 'num_puestos', 0, NULL, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'mo', 20, 'MO Pulido', 'mo_pulido', 'num_puestos', 0, NULL, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'mo', 21, 'MO Instalación', 'mo_instalacion', 'IF(instalado, num_puestos, 0)', 0, NULL, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'transporte', 22, 'TTE Elementos', 'tte_elementos', 'num_puestos', 0, NULL, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'transporte', 23, 'TTE Personal Ida', 'tte_ida', '1', 0, NULL, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'transporte', 24, 'TTE Personal Regreso', 'tte_regreso', '1', 0, NULL, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'laser', 25, 'Corte láser', 'laser', 'num_puestos', 0, NULL, NULL, NULL),
  ('f75d7089-97da-4252-a22a-229c0efb4833', 'poliza', 26, 'Póliza', NULL, '1', 0, 'poliza', NULL, NULL);


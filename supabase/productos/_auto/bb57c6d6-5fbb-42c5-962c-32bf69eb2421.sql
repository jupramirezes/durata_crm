-- ============================================================
-- PRODUCTO: Gabinete
-- ID: bb57c6d6-5fbb-42c5-962c-32bf69eb2421
-- Grupo: muebles
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = 'bb57c6d6-5fbb-42c5-962c-32bf69eb2421';
DELETE FROM producto_lineas_apu WHERE producto_id = 'bb57c6d6-5fbb-42c5-962c-32bf69eb2421';
DELETE FROM producto_materiales WHERE producto_id = 'bb57c6d6-5fbb-42c5-962c-32bf69eb2421';
DELETE FROM producto_variables WHERE producto_id = 'bb57c6d6-5fbb-42c5-962c-32bf69eb2421';
DELETE FROM productos_catalogo WHERE id = 'bb57c6d6-5fbb-42c5-962c-32bf69eb2421';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'Gabinete', 'muebles', 38, '[instalado:Suministro e instalación de|Suministro de] gabinete cerrado en acero inoxidable 304 satinado de {largo} m de largo x {ancho} m de ancho x {alto} m de alto, con {num_puertas} puertas entamboradas cal 20 con chapa Yale y pasador, {num_entrepanos} entrepaños interiores en cal 18 sat, {num_divisiones} división(es) vertical(es) interna(s), estructura en {num_patas} patas de tubo cuadrado 1-1/2 pulg cal 16 con niveladores inox, bisagras de piano inox 1 pulg, soldadura TIG con argón, acabado pulido satinado grado alimentario. [poliza:Incluye póliza.|Sin póliza.]', true, 36);

-- producto_variables (12)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'largo', 'Largo', 'numero', '0.5', 0.3, 3, NULL, 'Dimensiones', 1, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'ancho', 'Ancho', 'numero', '0.5', 0.3, 1, NULL, 'Dimensiones', 2, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'alto', 'Alto', 'numero', '2.1', 0.5, 2.5, NULL, 'Dimensiones', 3, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'num_puertas', '# Puertas', 'numero', '4', 1, 8, NULL, 'Configuración', 4, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'num_divisiones', '# Divisiones Verticales', 'numero', '1', 0, 4, NULL, 'Configuración', 5, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'num_patas', '# Patas', 'numero', '4', 2, 8, NULL, 'Configuración', 6, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'num_entrepanos', '# Entrepaños', 'numero', '4', 1, 8, NULL, 'Configuración', 7, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'num_chapas', '# Chapas', 'numero', '2', 0, 4, NULL, 'Configuración', 8, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'instalado', 'Incluye Instalación', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 9, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'poliza', 'Requiere Póliza', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 10, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'poliza_pct', 'Póliza %', 'numero', '2', 1, 10, NULL, 'Extras', 11, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'mts_cinta_rollo', 'Mts Cinta x Rollo', 'numero', '20', 10, 50, NULL, 'Configuración', 12, NULL, NULL);

-- producto_materiales (28)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'acero_cuerpo', 'Acero cuerpo cal 18 sat', false, NULL, 'm²', 'AILA010218'),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'acero_entrepano', 'Acero entrepaño cal 18 sat', false, NULL, 'm²', 'AILA010218'),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'acero_omegas', 'Acero omegas cal 18 2B', false, NULL, 'm²', 'AILA010118'),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'acero_puertas', 'Acero puertas entamboradas cal 20', false, NULL, 'm²', 'AILA010220'),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'acero_divisiones', 'Acero divisiones cal 18 2B', false, NULL, 'm²', 'AILA010118'),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'icopor', 'Icopor 25mm', false, NULL, 'm²', 'FEOM060025'),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'bisagra', 'Bisagra piano inox 1"', false, NULL, 'ml', 'FEBI010416'),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'manija', 'Manija', true, 14000, 'und', ''),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'chapa', 'Chapa Yale', false, NULL, 'und', 'FECH010101'),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'pasador', 'Pasador inox', false, NULL, 'und', 'FEPA010100'),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'tubo_patas', 'Tubo cuadrado 1-1/2" cal 16', false, NULL, 'ml', 'AITC180016'),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'niveladores', 'Niveladores', false, NULL, 'und', 'FENI010118'),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'argon', 'Argón', true, 6000, 'und', ''),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'disco_corte', 'Disco de corte', false, NULL, 'und', 'ABDI100124'),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'disco_flap', 'Disco flap', false, NULL, 'und', 'ABDI802060'),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'pano', 'Paño Scotch Brite', false, NULL, 'und', 'ABPA020001'),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'lija', 'Lija zirconio', false, NULL, 'und', 'ABLI202080'),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'grata', 'Grata', false, NULL, 'und', 'ABGR200019'),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'empaque', 'Empaque y embalaje', true, 9000, 'und', ''),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'cinta', 'Cinta 3M', true, 11500, 'rollo', ''),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'mo_acero', 'MO Acero', true, 49950, 'und', ''),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'mo_pulido', 'MO Pulido', true, 27750, 'und', ''),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'mo_puertas', 'MO Puertas', true, 16650, 'und', ''),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'mo_instalacion', 'MO Instalación', true, 55500, 'und', ''),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'tte_elementos', 'TTE Elementos', true, 70000, 'und', ''),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'tte_ida', 'TTE Personal Ida', true, 0, 'und', ''),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'tte_regreso', 'TTE Personal Regreso', true, 25000, 'und', ''),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'laser', 'Corte láser', true, 6500, 'und', '');

-- producto_lineas_apu (29)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'insumos', 1, 'Acero cuerpo cal 18 sat', 'acero_cuerpo', '(largo + 0.04) * (alto + 0.04) + ((ancho + 0.04) * (alto + 0.04)) * 2 + ((largo + 0.1 * ancho + 0.1) * 2)', 0, NULL, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'insumos', 2, 'Acero entrepaño cal 18 sat', 'acero_entrepano', '(largo + 0.12) * (ancho + 0.12) * num_entrepanos', 0, NULL, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'insumos', 3, 'Acero omegas cal 18 2B', 'acero_omegas', '0.2 * largo * num_entrepanos + 0.2 * largo + 2 * 0.2 * alto', 0, NULL, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'insumos', 4, 'Acero puertas entamboradas cal 20', 'acero_puertas', '((largo + 0.14) * (alto + 0.14)) * 2', 0, NULL, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'insumos', 5, 'Acero divisiones cal 18 2B', 'acero_divisiones', '((0.14 + ancho) * (0.04 + alto)) * num_divisiones', 0, NULL, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'insumos', 6, 'Icopor 25mm', 'icopor', 'largo * alto', 0, NULL, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'insumos', 7, 'Bisagra piano inox 1"', 'bisagra', 'alto * num_puertas', 0, NULL, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'insumos', 8, 'Manija', 'manija', 'num_chapas * 2', 0, NULL, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'insumos', 9, 'Chapa Yale', 'chapa', 'num_chapas', 0, NULL, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'insumos', 10, 'Pasador inox', 'pasador', 'num_chapas', 0, NULL, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'insumos', 11, 'Tubo cuadrado 1-1/2" cal 16', 'tubo_patas', '0.2 * num_patas', 0, NULL, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'insumos', 12, 'Niveladores', 'niveladores', 'num_patas', 0, NULL, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'insumos', 13, 'Argón', 'argon', 'largo * (num_entrepanos + 2) + alto + num_puertas / 2', 0, NULL, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'insumos', 14, 'Disco de corte', 'disco_corte', '(largo * (num_entrepanos + 2) + alto + num_puertas / 2) / 3', 0, NULL, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'insumos', 15, 'Disco flap', 'disco_flap', '(largo * (num_entrepanos + 2) + alto + num_puertas / 2) / 8', 0, NULL, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'insumos', 16, 'Paño Scotch Brite', 'pano', '(largo * (num_entrepanos + 2) + alto + num_puertas / 2) / 3', 0, NULL, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'insumos', 17, 'Lija zirconio', 'lija', '(largo * (num_entrepanos + 2) + alto + num_puertas / 2) / 4', 0, NULL, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'insumos', 18, 'Grata', 'grata', '(largo * (num_entrepanos + 2) + alto + num_puertas / 2) / 30', 0, NULL, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'insumos', 19, 'Empaque y embalaje', 'empaque', 'largo', 0, NULL, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'insumos', 20, 'Cinta 3M', 'cinta', '(largo + largo * num_entrepanos) / mts_cinta_rollo', 0, NULL, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'mo', 21, 'MO Acero', 'mo_acero', 'largo * (num_entrepanos + 2) + alto', 0, NULL, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'mo', 22, 'MO Pulido', 'mo_pulido', 'largo * (num_entrepanos + 2) + alto', 0, NULL, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'mo', 23, 'MO Puertas', 'mo_puertas', 'num_puertas', 0, NULL, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'mo', 24, 'MO Instalación', 'mo_instalacion', 'IF(instalado, largo * (num_entrepanos + 2) + alto, 0)', 0, NULL, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'transporte', 25, 'TTE Elementos', 'tte_elementos', '1', 0, NULL, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'transporte', 26, 'TTE Personal Ida', 'tte_ida', '1', 0, NULL, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'transporte', 27, 'TTE Personal Regreso', 'tte_regreso', '1', 0, NULL, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'laser', 28, 'Corte láser', 'laser', 'INT(largo * num_entrepanos + alto + num_puertas / 2)', 0, NULL, NULL, NULL),
  ('bb57c6d6-5fbb-42c5-962c-32bf69eb2421', 'poliza', 29, 'Póliza', NULL, '1', 0, 'poliza', NULL, NULL);


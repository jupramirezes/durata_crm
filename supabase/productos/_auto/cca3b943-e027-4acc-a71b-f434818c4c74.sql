-- ============================================================
-- PRODUCTO: Gabinete Corredizo
-- ID: cca3b943-e027-4acc-a71b-f434818c4c74
-- Grupo: muebles
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = 'cca3b943-e027-4acc-a71b-f434818c4c74';
DELETE FROM producto_lineas_apu WHERE producto_id = 'cca3b943-e027-4acc-a71b-f434818c4c74';
DELETE FROM producto_materiales WHERE producto_id = 'cca3b943-e027-4acc-a71b-f434818c4c74';
DELETE FROM producto_variables WHERE producto_id = 'cca3b943-e027-4acc-a71b-f434818c4c74';
DELETE FROM productos_catalogo WHERE id = 'cca3b943-e027-4acc-a71b-f434818c4c74';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'Gabinete Corredizo', 'muebles', 38, '[instalado:Suministro e instalación de|Suministro de] gabinete en acero inoxidable 304 satinado con puertas corredizas, de {largo} m de largo x {ancho} m de ancho x {alto} m de alto, {num_puertas} puertas corredizas con riel full extensión, chapa botón y pasador inox, {num_divisiones} división(es) vertical(es), {num_entrepanos} entrepaños, {num_patas} patas en tubo cuadrado 1-1/2 pulg cal.16 con niveladores inox, icopor 25mm, soldadura TIG con gas argón, acabado satinado. [poliza:Incluye póliza.|Sin póliza.]', true, 37);

-- producto_variables (12)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'largo', 'Largo', 'numero', '1.2', 0.3, 3, NULL, 'Dimensiones', 1, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'ancho', 'Ancho', 'numero', '0.5', 0.3, 1, NULL, 'Dimensiones', 2, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'alto', 'Alto', 'numero', '2.1', 0.5, 2.5, NULL, 'Dimensiones', 3, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'num_puertas', '# Puertas', 'numero', '2', 1, 6, NULL, 'Configuración', 4, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'num_divisiones', '# Divisiones', 'numero', '1', 0, 4, NULL, 'Configuración', 5, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'num_patas', '# Patas', 'numero', '4', 2, 8, NULL, 'Configuración', 6, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'num_entrepanos', '# Entrepaños', 'numero', '4', 1, 8, NULL, 'Configuración', 7, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'num_chapas', '# Chapas', 'numero', '1', 0, 4, NULL, 'Configuración', 8, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'instalado', 'Incluye Instalación', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 9, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'poliza', 'Requiere Póliza', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 10, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'poliza_pct', 'Póliza %', 'numero', '2', 1, 10, NULL, 'Extras', 11, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'mts_cinta_rollo', 'Mts Cinta x Rollo', 'numero', '20', 10, 50, NULL, 'Configuración', 12, NULL, NULL);

-- producto_materiales (28)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'acero_cuerpo', 'Acero cuerpo cal 20 sat', false, NULL, 'm²', 'AILA010220'),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'acero_entrepano', 'Acero entrepaño cal 18 sat', false, NULL, 'm²', 'AILA010218'),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'acero_omegas', 'Acero omegas cal 18 sat', false, NULL, 'm²', 'AILA010218'),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'acero_puerta', 'Acero puerta sencilla cal 20', false, NULL, 'm²', 'AILA010220'),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'acero_divisiones', 'Acero divisiones cal 20', false, NULL, 'm²', 'AILA010220'),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'icopor', 'Icopor 25mm', false, NULL, 'm²', 'FEOM060025'),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'riel', 'Riel superior e inferior', false, NULL, 'ml', 'FERI010045'),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'ruedas', 'Ruedas corredizo', true, 8000, 'und', ''),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'manija', 'Manija', false, NULL, 'und', 'FEMA016020'),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'chapa', 'Chapa botón', false, NULL, 'und', 'FECH020101'),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'pasador', 'Pasador inox', false, NULL, 'und', 'FEPA010100'),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'tubo_patas', 'Tubo cuadrado 1-1/2" cal 16', false, NULL, 'ml', 'AITC180016'),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'niveladores', 'Niveladores', false, NULL, 'und', 'FENI010118'),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'argon', 'Argón', true, 4000, 'und', ''),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'disco_corte', 'Disco de corte', false, NULL, 'und', 'ABDI100124'),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'disco_flap', 'Disco flap', false, NULL, 'und', 'ABDI802060'),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'pano', 'Paño Scotch Brite', false, NULL, 'und', 'ABPA020001'),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'lija', 'Lija zirconio', false, NULL, 'und', 'ABLI202080'),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'grata', 'Grata', false, NULL, 'und', 'ABGR200019'),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'empaque', 'Empaque y embalaje', true, 9000, 'und', ''),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'cinta', 'Cinta 3M', false, NULL, 'rollo', 'FEOM040501'),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'mo_acero', 'MO Acero', true, 36075, 'und', ''),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'mo_pulido', 'MO Pulido', true, 24420, 'und', ''),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'mo_puertas', 'MO Puertas', true, 18870, 'und', ''),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'mo_instalacion', 'MO Instalación', true, 44400, 'und', ''),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'tte_elementos', 'TTE Elementos', true, 50000, 'und', ''),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'tte_ida', 'TTE Personal Ida', true, 20000, 'und', ''),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'tte_regreso', 'TTE Personal Regreso', true, 0, 'und', '');

-- producto_lineas_apu (29)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'insumos', 1, 'Acero cuerpo cal 20 sat', 'acero_cuerpo', '(largo + 0.04) * (alto + 0.04) + ((ancho + 0.04) * (alto + 0.04)) * 2 + (((largo + 0.1 * ancho + 0.1) * 2))', 0, NULL, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'insumos', 2, 'Acero entrepaño cal 18 sat', 'acero_entrepano', '(largo + 0.12) * (ancho + 0.12) * num_entrepanos', 0, NULL, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'insumos', 3, 'Acero omegas cal 18 sat', 'acero_omegas', '0.2 * largo * num_entrepanos', 0, NULL, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'insumos', 4, 'Acero puerta sencilla cal 20', 'acero_puerta', '(largo + 0.14) * (alto + 0.14)', 0, NULL, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'insumos', 5, 'Acero divisiones cal 20', 'acero_divisiones', '((0.04 + ancho) * (0.04 + alto)) * num_divisiones', 0, NULL, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'insumos', 6, 'Icopor 25mm', 'icopor', 'largo * alto', 0, NULL, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'insumos', 7, 'Riel superior e inferior', 'riel', 'largo * 2', 0, NULL, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'insumos', 8, 'Ruedas corredizo', 'ruedas', 'num_puertas * 2', 0, NULL, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'insumos', 9, 'Manija', 'manija', 'num_puertas', 0, NULL, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'insumos', 10, 'Chapa botón', 'chapa', 'num_chapas', 0, NULL, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'insumos', 11, 'Pasador inox', 'pasador', 'num_chapas', 0, NULL, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'insumos', 12, 'Tubo cuadrado 1-1/2" cal 16', 'tubo_patas', '0.2 * num_patas', 0, NULL, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'insumos', 13, 'Niveladores', 'niveladores', 'num_patas', 0, NULL, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'insumos', 14, 'Argón', 'argon', 'largo + largo * num_entrepanos', 0, NULL, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'insumos', 15, 'Disco de corte', 'disco_corte', '(largo + largo * num_entrepanos) / 3', 0, NULL, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'insumos', 16, 'Disco flap', 'disco_flap', '(largo + largo * num_entrepanos) / 8', 0, NULL, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'insumos', 17, 'Paño Scotch Brite', 'pano', '(largo + largo * num_entrepanos) / 2', 0, NULL, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'insumos', 18, 'Lija zirconio', 'lija', '(largo + largo * num_entrepanos) / 3', 0, NULL, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'insumos', 19, 'Grata', 'grata', '(largo + largo * num_entrepanos) / 30', 0, NULL, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'insumos', 20, 'Empaque y embalaje', 'empaque', 'largo', 0, NULL, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'insumos', 21, 'Cinta 3M', 'cinta', '(largo + largo * num_entrepanos) / mts_cinta_rollo', 0, NULL, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'mo', 22, 'MO Acero', 'mo_acero', 'largo + largo * num_entrepanos', 0, NULL, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'mo', 23, 'MO Pulido', 'mo_pulido', 'largo + largo * num_entrepanos', 0, NULL, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'mo', 24, 'MO Puertas', 'mo_puertas', 'num_puertas', 0, NULL, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'mo', 25, 'MO Instalación', 'mo_instalacion', 'IF(instalado, largo, 0)', 0, NULL, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'transporte', 26, 'TTE Elementos', 'tte_elementos', 'largo', 0, NULL, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'transporte', 27, 'TTE Personal Ida', 'tte_ida', 'largo', 0, NULL, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'transporte', 28, 'TTE Personal Regreso', 'tte_regreso', 'largo', 0, NULL, NULL, NULL),
  ('cca3b943-e027-4acc-a71b-f434818c4c74', 'poliza', 29, 'Póliza', NULL, '1', 0, 'poliza', NULL, NULL);


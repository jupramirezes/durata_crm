-- ============================================================
-- PRODUCTO: Estantería Escabiladero
-- ID: d5173086-024b-4593-ba5a-d978acdf23f3
-- Grupo: estanterias
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = 'd5173086-024b-4593-ba5a-d978acdf23f3';
DELETE FROM producto_lineas_apu WHERE producto_id = 'd5173086-024b-4593-ba5a-d978acdf23f3';
DELETE FROM producto_materiales WHERE producto_id = 'd5173086-024b-4593-ba5a-d978acdf23f3';
DELETE FROM producto_variables WHERE producto_id = 'd5173086-024b-4593-ba5a-d978acdf23f3';
DELETE FROM productos_catalogo WHERE id = 'd5173086-024b-4593-ba5a-d978acdf23f3';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'Estantería Escabiladero', 'estanterias', 38, '[instalado:Suministro e instalación de|Suministro de] estantería tipo escabiladero en acero inoxidable AISI 304 de {largo} m de largo x {ancho} m de ancho x {alto} m de alto, con {num_niveles} niveles de ángulos en lámina calibre 14, {num_patas} patas en tubo cuadrado 1 pulg calibre 16, 2 ruedas con freno y 2 sin freno en inox 4 pulg, manija de {largo_manija} m en tubo 1 pulg, soldadura TIG con gas argón, acabado pulido satinado. [poliza:Incluye póliza.|Sin póliza.]', true, 34);

-- producto_variables (10)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'largo', 'Largo', 'numero', '0.6', 0.3, 2, NULL, 'Dimensiones', 1, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'ancho', 'Ancho', 'numero', '0.45', 0.3, 1.2, NULL, 'Dimensiones', 2, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'alto', 'Alto', 'numero', '1.7', 0.5, 2.5, NULL, 'Dimensiones', 3, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'num_angulos', '# Ángulos', 'numero', '38', 10, 80, NULL, 'Estructura', 4, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'num_niveles', '# Niveles', 'numero', '6', 2, 12, NULL, 'Estructura', 5, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'num_patas', '# Patas', 'numero', '4', 2, 6, NULL, 'Estructura', 6, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'largo_manija', 'Largo Manija', 'numero', '0.4', 0.2, 1, NULL, 'Estructura', 7, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'instalado', 'Incluye Instalación', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 8, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'poliza', 'Requiere Póliza', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 9, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'poliza_pct', 'Póliza %', 'numero', '2', 1, 10, NULL, 'Extras', 10, NULL, NULL);

-- producto_materiales (20)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'tubo_estructura', 'Tubo inox 1" cal 16', false, NULL, 'ml', 'AITC160016'),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'acero_angulos', 'Acero ángulos cal 14', false, NULL, 'm²', 'AILA010114'),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'platina_ruedas', 'Platina fijación ruedas cal 12', false, NULL, 'm²', 'AILA010112'),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'ruedas_freno', 'Ruedas inox 4" con freno', false, NULL, 'und', 'FERU010123'),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'ruedas_sin_freno', 'Ruedas inox 4" sin freno', false, NULL, 'und', 'FERU010223'),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'tubo_manija', 'Tubo inox 1" cal 16 manija', false, NULL, 'ml', 'AITC160016'),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'argon', 'Argón', true, 25000, 'und', ''),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'disco_corte', 'Disco de corte', false, NULL, 'und', 'ABDI100124'),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'disco_flap', 'Disco flap', false, NULL, 'und', 'ABDI802060'),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'pano', 'Paño Scotch Brite', false, NULL, 'und', 'ABPA020001'),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'lija', 'Lija zirconio', false, NULL, 'und', 'ABLI202080'),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'grata', 'Grata', false, NULL, 'und', 'ABGR200019'),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'empaque', 'Empaque y embalaje', true, 10000, 'und', ''),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'mo_acero', 'MO Acero', true, 41070, 'und', ''),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'mo_pulido', 'MO Pulido', true, 24420, 'und', ''),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'mo_ensamble', 'MO Ensamble', true, 16650, 'und', ''),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'mo_dobles', 'MO Dobles', true, 1332, 'und', ''),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'tte_elementos', 'TTE Elementos', true, 70000, 'und', ''),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'tte_ida', 'TTE Personal Ida', true, 0, 'und', ''),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'tte_regreso', 'TTE Personal Regreso', true, 0, 'und', '');

-- producto_lineas_apu (21)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'insumos', 1, 'Tubo inox 1" cal 16 estructura', 'tubo_estructura', '(alto * num_patas) + (largo * num_niveles) + (ancho * num_niveles)', 0, NULL, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'insumos', 2, 'Acero ángulos cal 14', 'acero_angulos', '0.1 * largo * num_angulos', 0, NULL, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'insumos', 3, 'Platina fijación ruedas cal 12', 'platina_ruedas', '0.1 * 0.1 * 4', 0, NULL, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'insumos', 4, 'Ruedas inox 4" con freno', 'ruedas_freno', 'num_patas / 2', 0, NULL, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'insumos', 5, 'Ruedas inox 4" sin freno', 'ruedas_sin_freno', 'num_patas / 2', 0, NULL, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'insumos', 6, 'Tubo inox 1" cal 16 manija', 'tubo_manija', 'largo_manija', 0, NULL, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'insumos', 7, 'Argón', 'argon', 'largo * 1.6', 0, NULL, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'insumos', 8, 'Disco de corte', 'disco_corte', 'largo * 1.5', 0, NULL, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'insumos', 9, 'Disco flap', 'disco_flap', 'largo * 1.4', 0, NULL, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'insumos', 10, 'Paño Scotch Brite', 'pano', 'alto', 0, NULL, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'insumos', 11, 'Lija zirconio', 'lija', 'alto', 0, NULL, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'insumos', 12, 'Grata', 'grata', 'largo * 0.2', 0, NULL, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'insumos', 13, 'Empaque y embalaje', 'empaque', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'mo', 14, 'MO Acero', 'mo_acero', 'alto * 1.8', 0, NULL, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'mo', 15, 'MO Pulido', 'mo_pulido', 'alto * 1.2', 0, NULL, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'mo', 16, 'MO Ensamble', 'mo_ensamble', '1', 0, NULL, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'mo', 17, 'MO Dobles', 'mo_dobles', 'num_angulos * 2', 0, NULL, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'transporte', 18, 'TTE Elementos', 'tte_elementos', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'transporte', 19, 'TTE Personal Ida', 'tte_ida', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'transporte', 20, 'TTE Personal Regreso', 'tte_regreso', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('d5173086-024b-4593-ba5a-d978acdf23f3', 'poliza', 21, 'Póliza', NULL, '1', 0, 'poliza', NULL, NULL);


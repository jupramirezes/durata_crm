-- ============================================================
-- PRODUCTO: Estantería Ranurada
-- ID: d75102a3-2353-460b-8d72-16b37d4e444a
-- Grupo: estanterias
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = 'd75102a3-2353-460b-8d72-16b37d4e444a';
DELETE FROM producto_lineas_apu WHERE producto_id = 'd75102a3-2353-460b-8d72-16b37d4e444a';
DELETE FROM producto_materiales WHERE producto_id = 'd75102a3-2353-460b-8d72-16b37d4e444a';
DELETE FROM producto_variables WHERE producto_id = 'd75102a3-2353-460b-8d72-16b37d4e444a';
DELETE FROM productos_catalogo WHERE id = 'd75102a3-2353-460b-8d72-16b37d4e444a';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'Estantería Ranurada', 'estanterias', 38, '[instalado:Suministro e instalación de|Suministro de] estantería ranurada en acero inoxidable AISI 304 satinado de {largo} m de largo x {ancho} m de ancho x {alto} m de alto, con {num_entrepanos} entrepaño(s) ranurado(s) en lámina calibre 18 con omegas de refuerzo de {ancho_omegas} m, {num_patas} parales en lámina calibre 12 2B con niveladores inox roscados, soldadura TIG con gas argón, acabado pulido satinado grado alimentario. [poliza:Incluye póliza.|Sin póliza.]', true, 33);

-- producto_variables (9)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'largo', 'Largo', 'numero', '1.5', 0.5, 4, NULL, 'Dimensiones', 1, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'ancho', 'Ancho', 'numero', '0.6', 0.3, 1.5, NULL, 'Dimensiones', 2, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'alto', 'Alto', 'numero', '1.8', 0.5, 2.5, NULL, 'Dimensiones', 3, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'num_entrepanos', '# Entrepaños', 'numero', '4', 1, 8, NULL, 'Estructura', 4, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'num_patas', '# Patas', 'numero', '4', 2, 8, NULL, 'Estructura', 5, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'ancho_omegas', 'Ancho Omegas', 'numero', '0.15', 0.05, 0.3, NULL, 'Estructura', 6, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'instalado', 'Incluye Instalación', 'toggle', 'true', NULL, NULL, NULL, 'Extras', 7, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'poliza', 'Requiere Póliza', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 8, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'poliza_pct', 'Póliza %', 'numero', '2', 1, 10, NULL, 'Extras', 9, NULL, NULL);

-- producto_materiales (21)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'acero_entrepano', 'Acero entrepaños ranurados cal 18', false, NULL, 'm²', 'AILA010118'),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'acero_patas', 'Acero patas cal 12 2B', false, NULL, 'm²', 'AILA010112'),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'niveladores', 'Niveladores', false, NULL, 'und', 'FENI010118'),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'tornillos', 'Tornillos fijación', true, 1600, 'und', ''),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'argon', 'Argón', true, 4000, 'und', ''),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'disco_corte', 'Disco de corte', false, NULL, 'und', 'ABDI100124'),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'disco_flap', 'Disco flap', false, NULL, 'und', 'ABDI802060'),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'pano', 'Paño Scotch Brite', false, NULL, 'und', 'ABPA020001'),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'lija', 'Lija zirconio', false, NULL, 'und', 'ABLI202080'),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'grata', 'Grata', false, NULL, 'und', 'ABGR200019'),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'empaque', 'Empaque y embalaje', true, 6000, 'und', ''),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'mo_acero', 'MO Acero', true, 49950, 'und', ''),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'mo_pulido', 'MO Pulido', true, 27750, 'und', ''),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'mo_parales', 'MO Pulida parales con argón', true, 24420, 'und', ''),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'mo_repisados', 'MO Repisados', true, 1665, 'und', ''),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'mo_ensamble', 'MO Ensamble', true, 29970, 'und', ''),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'mo_instalacion', 'MO Instalación', true, 22200, 'und', ''),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'tte_elementos', 'TTE Elementos', true, 35000, 'und', ''),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'tte_ida', 'TTE Personal Ida', true, 0, 'und', ''),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'tte_regreso', 'TTE Personal Regreso', true, 0, 'und', ''),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'laser', 'Corte láser', true, 6500, 'und', '');

-- producto_lineas_apu (22)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'insumos', 1, 'Acero entrepaños ranurados cal 18', 'acero_entrepano', '((ancho_omegas * ancho) * (largo / 0.09) + ancho_omegas * (largo * 2 + ancho * 2)) * num_entrepanos * 1.05', 0, NULL, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'insumos', 2, 'Acero patas cal 12 2B', 'acero_patas', '0.13 * alto * num_patas * 1.05', 0, NULL, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'insumos', 3, 'Niveladores', 'niveladores', 'num_patas', 0, NULL, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'insumos', 4, 'Tornillos fijación', 'tornillos', '8 * num_entrepanos', 0, NULL, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'insumos', 5, 'Argón', 'argon', 'largo * num_entrepanos', 0, NULL, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'insumos', 6, 'Disco de corte', 'disco_corte', '(largo * num_entrepanos) / 2', 0, NULL, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'insumos', 7, 'Disco flap', 'disco_flap', '(largo * num_entrepanos) / 4', 0, NULL, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'insumos', 8, 'Paño Scotch Brite', 'pano', '(largo * num_entrepanos) / 2', 0, NULL, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'insumos', 9, 'Lija zirconio', 'lija', '(largo * num_entrepanos) / 4', 0, NULL, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'insumos', 10, 'Grata', 'grata', '(largo * num_entrepanos) / 10', 0, NULL, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'insumos', 11, 'Empaque y embalaje', 'empaque', 'largo', 0, NULL, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'mo', 12, 'MO Acero', 'mo_acero', 'largo * num_entrepanos', 0, NULL, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'mo', 13, 'MO Pulido', 'mo_pulido', 'largo * num_entrepanos', 0, NULL, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'mo', 14, 'MO Pulida parales con argón', 'mo_parales', 'num_patas', 0, NULL, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'mo', 15, 'MO Repisados', 'mo_repisados', '((largo / 0.09) + 2 + 2) * num_entrepanos * 2', 0, NULL, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'mo', 16, 'MO Ensamble', 'mo_ensamble', '1', 0, NULL, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'mo', 17, 'MO Instalación', 'mo_instalacion', 'IF(instalado, largo, 0)', 0, NULL, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'transporte', 18, 'TTE Elementos', 'tte_elementos', 'largo', 0, NULL, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'transporte', 19, 'TTE Personal Ida', 'tte_ida', 'largo', 0, NULL, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'transporte', 20, 'TTE Personal Regreso', 'tte_regreso', 'largo', 0, NULL, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'laser', 21, 'Corte láser', 'laser', '(largo / 0.09) * num_entrepanos * (10 / 60)', 0, NULL, NULL, NULL),
  ('d75102a3-2353-460b-8d72-16b37d4e444a', 'poliza', 22, 'Póliza', NULL, '1', 0, 'poliza', NULL, NULL);


-- ============================================================
-- PRODUCTO: Estantería Graduable
-- ID: estanteria_graduable
-- Grupo: Estanterías
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = 'estanteria_graduable';
DELETE FROM producto_lineas_apu WHERE producto_id = 'estanteria_graduable';
DELETE FROM producto_materiales WHERE producto_id = 'estanteria_graduable';
DELETE FROM producto_variables WHERE producto_id = 'estanteria_graduable';
DELETE FROM productos_catalogo WHERE id = 'estanteria_graduable';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('estanteria_graduable', 'Estantería Graduable', 'Estanterías', 0.38, '[instalacion:Suministro e instalación de|Suministro de] estantería graduable en acero inoxidable AISI 304 de {largo} m de largo x {ancho} m de ancho x {alto} m de alto, con {num_entrepanos} entrepaño(s) en lámina calibre {calibre_entrepano} con refuerzos tipo omega, altura regulable mediante {num_patas} parales en lámina calibre {calibre_patas} 2B con niveladores inox roscados, soldadura TIG con gas argón, acabado pulido satinado grado alimentario. [poliza:Incluye póliza.|Sin póliza.]', true, 4);

-- producto_variables (9)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('estanteria_graduable', 'largo', 'Largo (m)', 'numero', '2', 0.5, 3, 'm', 'Dimensiones principales', 10, NULL, NULL),
  ('estanteria_graduable', 'ancho', 'Ancho (m)', 'numero', '0.65', 0.3, 1, 'm', 'Dimensiones principales', 11, NULL, NULL),
  ('estanteria_graduable', 'alto', 'Alto (m)', 'numero', '1.8', 1, 2.5, 'm', 'Dimensiones principales', 12, NULL, NULL),
  ('estanteria_graduable', 'num_entrepanos', 'Número de entrepaños', 'numero', '5', 2, 8, 'und', 'Configuración', 20, NULL, NULL),
  ('estanteria_graduable', 'num_patas', 'Número de patas', 'numero', '4', 4, 6, 'und', 'Configuración', 21, NULL, NULL),
  ('estanteria_graduable', 'calibre_entrepano', 'Calibre entrepaño', 'seleccion', '18', NULL, NULL, NULL, 'Material', 30, '["18","16"]'::jsonb, NULL),
  ('estanteria_graduable', 'calibre_patas', 'Calibre patas', 'seleccion', '12', NULL, NULL, NULL, 'Material', 31, '["12","14"]'::jsonb, NULL),
  ('estanteria_graduable', 'instalacion', 'Incluir instalación', 'toggle', '0', NULL, NULL, NULL, 'Extras', 90, NULL, NULL),
  ('estanteria_graduable', 'poliza', 'Incluir póliza', 'toggle', '0', NULL, NULL, NULL, 'Extras', 91, NULL, NULL);

-- producto_materiales (21)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('estanteria_graduable', 'lamina_omegas', 'LÁMINA OMEGAS CAL 18', false, NULL, NULL, 'AILA010118'),
  ('estanteria_graduable', 'disco_corte_est', 'DISCOS CORTE', false, NULL, NULL, 'ABDI100124'),
  ('estanteria_graduable', 'tornillo_est', 'TORNILLOS EST', true, 800, NULL, NULL),
  ('estanteria_graduable', 'argon_est', 'ARGÓN EST', true, 4500, NULL, NULL),
  ('estanteria_graduable', 'mo_ensamble_est', 'MO ENSAMBLE', true, 29970, NULL, NULL),
  ('estanteria_graduable', 'tte_elem_est', 'TTE ELEMENTOS', true, 35000, NULL, NULL),
  ('estanteria_graduable', 'niveladores_est', 'NIVELADORES', false, NULL, NULL, 'FENI010118'),
  ('estanteria_graduable', 'disco_flap_est', 'DISCOS FLAP', false, NULL, NULL, 'ABDI802060'),
  ('estanteria_graduable', 'cinta_est', 'CINTA EST', true, 11500, NULL, NULL),
  ('estanteria_graduable', 'empaque_est', 'EMPAQUE EST', true, 8000, NULL, NULL),
  ('estanteria_graduable', 'mo_instal_est', 'MO INSTALACIÓN', true, 16650, NULL, NULL),
  ('estanteria_graduable', 'tte_reg_est', 'TTE REGRESO', true, 10000, NULL, NULL),
  ('estanteria_graduable', 'pano_est', 'PAÑO SCOTCH BRITE', false, NULL, NULL, 'ABPA020001'),
  ('estanteria_graduable', 'mo_acero_est', 'MO ACERO', true, 31080, NULL, NULL),
  ('estanteria_graduable', 'laser_est', 'LÁSER PARALES', true, 6500, NULL, NULL),
  ('estanteria_graduable', 'lamina_entrep', 'LÁMINA ENTREPAÑO CAL {calibre_entrepano}', false, NULL, NULL, 'AILA0101{calibre_entrepano}'),
  ('estanteria_graduable', 'lija_est', 'LIJA ZC', false, NULL, NULL, 'ABLI202080'),
  ('estanteria_graduable', 'mo_pulido_est', 'MO PULIDO', true, 12765, NULL, NULL),
  ('estanteria_graduable', 'lamina_patas', 'LÁMINA PATAS CAL {calibre_patas}', false, NULL, NULL, 'AILA0101{calibre_patas}'),
  ('estanteria_graduable', 'grata_est', 'GRATA', false, NULL, NULL, 'ABGR200019'),
  ('estanteria_graduable', 'mo_parales_est', 'MO PULIDA PARALES', true, 24420, NULL, NULL);

-- producto_lineas_apu (22)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('estanteria_graduable', 'insumos', 1, 'Acero Entrepaño', 'lamina_entrep', '(largo+0.13)*(ancho+0.13)*num_entrepanos', 0, NULL, NULL, NULL),
  ('estanteria_graduable', 'insumos', 2, 'Acero Patas', 'lamina_patas', 'alto*num_patas*0.13', 0, NULL, NULL, NULL),
  ('estanteria_graduable', 'insumos', 3, 'Omegas', 'lamina_omegas', '0.2*largo*num_entrepanos + 0.15*ancho*2*num_entrepanos', 0, NULL, NULL, NULL),
  ('estanteria_graduable', 'insumos', 4, 'Niveladores', 'niveladores_est', 'num_patas', 0, NULL, NULL, NULL),
  ('estanteria_graduable', 'insumos', 5, 'Tornillos', 'tornillo_est', '8*num_entrepanos', 0, NULL, NULL, NULL),
  ('estanteria_graduable', 'insumos', 6, 'Cinta', 'cinta_est', 'largo*num_entrepanos + ancho*num_entrepanos', 0, NULL, NULL, NULL),
  ('estanteria_graduable', 'insumos', 7, 'Argón', 'argon_est', 'largo*num_entrepanos', 0, NULL, NULL, NULL),
  ('estanteria_graduable', 'insumos', 8, 'Disco de corte', 'disco_corte_est', 'largo*num_entrepanos/4', 0, NULL, NULL, NULL),
  ('estanteria_graduable', 'insumos', 9, 'Disco flap', 'disco_flap_est', 'largo*num_entrepanos/4', 0, NULL, NULL, NULL),
  ('estanteria_graduable', 'insumos', 10, 'Paño', 'pano_est', 'largo*num_entrepanos/3', 0, NULL, NULL, NULL),
  ('estanteria_graduable', 'insumos', 11, 'Lija zirconio', 'lija_est', 'largo*num_entrepanos/3', 0, NULL, NULL, NULL),
  ('estanteria_graduable', 'insumos', 12, 'Grata', 'grata_est', 'largo*num_entrepanos/10', 0, NULL, NULL, NULL),
  ('estanteria_graduable', 'insumos', 13, 'Empaque', 'empaque_est', 'largo/1.5', 0, NULL, NULL, NULL),
  ('estanteria_graduable', 'mo', 14, 'MO Acero', 'mo_acero_est', 'largo*num_entrepanos', 0, NULL, NULL, NULL),
  ('estanteria_graduable', 'mo', 15, 'MO Pulido', 'mo_pulido_est', 'largo*num_entrepanos', 0, NULL, NULL, NULL),
  ('estanteria_graduable', 'mo', 16, 'MO Pulida parales', 'mo_parales_est', 'num_patas', 0, NULL, NULL, NULL),
  ('estanteria_graduable', 'mo', 17, 'MO Ensamble', 'mo_ensamble_est', '1', 0, NULL, NULL, NULL),
  ('estanteria_graduable', 'mo', 18, 'MO Instalación', 'mo_instal_est', 'instalacion * largo', 0, 'instalacion == 1', NULL, NULL),
  ('estanteria_graduable', 'transporte', 19, 'TTE Elementos', 'tte_elem_est', 'largo', 0, NULL, NULL, NULL),
  ('estanteria_graduable', 'transporte', 20, 'TTE Regreso', 'tte_reg_est', 'largo', 0, NULL, NULL, NULL),
  ('estanteria_graduable', 'laser', 21, 'Láser parales', 'laser_est', 'num_patas*alto*2 + num_entrepanos', 0, NULL, NULL, NULL),
  ('estanteria_graduable', 'poliza', 99, 'Póliza todo riesgo', '', '1', 0, 'poliza == 1', NULL, 'Precio = 2% del costo total antes de póliza');


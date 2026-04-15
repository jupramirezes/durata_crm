-- ============================================================
-- PRODUCTO: Campana
-- ID: acb8071b-74ee-481f-888d-87b65bcc63ae
-- Grupo: campanas
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = 'acb8071b-74ee-481f-888d-87b65bcc63ae';
DELETE FROM producto_lineas_apu WHERE producto_id = 'acb8071b-74ee-481f-888d-87b65bcc63ae';
DELETE FROM producto_materiales WHERE producto_id = 'acb8071b-74ee-481f-888d-87b65bcc63ae';
DELETE FROM producto_variables WHERE producto_id = 'acb8071b-74ee-481f-888d-87b65bcc63ae';
DELETE FROM productos_catalogo WHERE id = 'acb8071b-74ee-481f-888d-87b65bcc63ae';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'Campana', 'campanas', 38, '[instalado:Suministro e instalación de|Suministro de] campana extractora en acero inoxidable AISI 304 satinado calibre {calibre_cuerpo} de {largo} m de largo x {profundidad} m de profundidad x {alto} m de alto, con {num_filtros} filtros de grasa estándar de 38 cm, suspensión mediante {num_guayas} guayas inox 1/4 pulg con grilletes, {num_valvulas} válvula(s) bola inox 1/2 pulg para drenaje, soldadura TIG con gas argón, acabado satinado pulido. [poliza:Incluye póliza.|Sin póliza.]', true, 26);

-- producto_variables (12)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'largo', 'Largo', 'numero', '1.6', 0.5, 5, NULL, 'Dimensiones', 1, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'profundidad', 'Profundidad', 'numero', '1.1', 0.5, 2, NULL, 'Dimensiones', 2, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'alto', 'Alto', 'numero', '0.6', 0.3, 1.5, NULL, 'Dimensiones', 3, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'calibre_cuerpo', 'Calibre Cuerpo', 'numero', '18', 14, 22, NULL, 'Material', 4, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'calibre_tapa', 'Calibre Tapa', 'numero', '20', 14, 22, NULL, 'Material', 5, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'num_filtros', '# Filtros', 'numero', '6', 1, 20, NULL, 'Configuración', 6, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'precio_filtro', 'Precio Filtro', 'numero', '110000', 50000, 300000, NULL, 'Configuración', 7, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'num_valvulas', '# Válvulas', 'numero', '1', 0, 4, NULL, 'Configuración', 8, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'num_guayas', '# Guayas', 'numero', '4', 2, 8, NULL, 'Configuración', 9, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'instalado', 'Incluye Instalación', 'toggle', 'true', NULL, NULL, NULL, 'Extras', 10, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'poliza', 'Requiere Póliza', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 11, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'poliza_pct', 'Póliza %', 'numero', '2', 1, 10, NULL, 'Extras', 12, NULL, NULL);

-- producto_materiales (24)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'acero_anterior', 'Acero anterior sat', false, NULL, 'm²', 'AILA0102{calibre_cuerpo}'),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'acero_posterior', 'Acero posterior sat', false, NULL, 'm²', 'AILA0102{calibre_cuerpo}'),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'acero_laterales', 'Acero laterales sat', false, NULL, 'm²', 'AILA0102{calibre_cuerpo}'),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'acero_tapa', 'Acero tapa superior sat', false, NULL, 'm²', 'AILA0102{calibre_tapa}'),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'filtros', 'Filtros estándar 38cm', true, 1, 'und', ''),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'valvula', 'Válvula bola inox 1/2', false, NULL, 'und', 'FEVA010008'),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'argon', 'Argón', true, 8000, 'und', ''),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'disco_corte', 'Disco de corte', false, NULL, 'und', 'ABDI100124'),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'disco_flap', 'Disco flap', false, NULL, 'und', 'ABDI802060'),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'pano', 'Paño Scotch Brite', false, NULL, 'und', 'ABPA020001'),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'lija', 'Lija zirconio', false, NULL, 'und', 'ABLI202080'),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'fresas', 'Fresas', true, 3900, 'und', ''),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'grata', 'Grata', false, NULL, 'und', 'ABGR200019'),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'empaque', 'Empaque y embalaje', true, 9000, 'und', ''),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'guayas', 'Guayas de fijación', false, NULL, 'ml', 'FEGY000104'),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'grilletes', 'Grilletes', false, NULL, 'und', 'FEGR010000'),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'tornillos_ojo', 'Tornillos con ojo', true, 5500, 'und', ''),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'mo_acero', 'MO Acero', true, 120000, 'und', ''),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'mo_pulido', 'MO Pulido', true, 30000, 'und', ''),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'mo_instalacion', 'MO Instalación', true, 90000, 'und', ''),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'tte_elementos', 'TTE Elementos', true, 40000, 'und', ''),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'tte_ida', 'TTE Personal Ida', true, 0, 'und', ''),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'tte_regreso', 'TTE Personal Regreso', true, 15000, 'und', ''),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'laser', 'Corte láser', true, 6500, 'und', '');

-- producto_lineas_apu (25)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'insumos', 1, 'Acero anterior sat', 'acero_anterior', '(largo + 0.1) * (alto + 0.25) + largo * 0.25', 0, NULL, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'insumos', 2, 'Acero posterior sat', 'acero_posterior', '(largo + 0.02) * (alto + 0.12) + (largo * 0.25)', 0, NULL, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'insumos', 3, 'Acero laterales sat', 'acero_laterales', '(alto + 0.13) * ((profundidad + 0.08) * 2)', 0, NULL, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'insumos', 4, 'Filtros estándar 38cm', 'filtros', 'num_filtros * precio_filtro', 0, NULL, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'insumos', 5, 'Acero tapa superior sat', 'acero_tapa', 'largo * profundidad * 1.1', 0, NULL, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'insumos', 6, 'Válvula bola inox 1/2', 'valvula', 'num_valvulas', 0, NULL, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'insumos', 7, 'Argón', 'argon', 'largo', 0, NULL, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'insumos', 8, 'Disco de corte', 'disco_corte', 'largo', 0, NULL, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'insumos', 9, 'Disco flap', 'disco_flap', 'largo / 3', 0, NULL, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'insumos', 10, 'Paño Scotch Brite', 'pano', 'largo', 0, NULL, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'insumos', 11, 'Lija zirconio', 'lija', 'largo / 2', 0, NULL, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'insumos', 12, 'Fresas', 'fresas', 'largo / 3', 0, NULL, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'insumos', 13, 'Grata', 'grata', 'largo / 5', 0, NULL, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'insumos', 14, 'Empaque y embalaje', 'empaque', 'largo', 0, NULL, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'insumos', 15, 'Guayas de fijación', 'guayas', '2.5 * num_guayas', 0, NULL, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'insumos', 16, 'Grilletes', 'grilletes', '4 * num_guayas', 0, NULL, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'insumos', 17, 'Tornillos con ojo', 'tornillos_ojo', 'num_guayas', 0, NULL, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'mo', 18, 'MO Acero', 'mo_acero', 'largo', 0, NULL, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'mo', 19, 'MO Pulido', 'mo_pulido', 'largo', 0, NULL, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'mo', 20, 'MO Instalación', 'mo_instalacion', 'IF(instalado, largo, 0)', 0, NULL, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'transporte', 21, 'TTE Elementos', 'tte_elementos', 'largo', 0, NULL, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'transporte', 22, 'TTE Personal Ida', 'tte_ida', 'largo', 0, NULL, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'transporte', 23, 'TTE Personal Regreso', 'tte_regreso', 'largo', 0, NULL, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'laser', 24, 'Corte láser', 'laser', 'largo * profundidad * alto * 4.47', 0, NULL, NULL, NULL),
  ('acb8071b-74ee-481f-888d-87b65bcc63ae', 'poliza', 25, 'Póliza', NULL, '1', 0, 'poliza', NULL, NULL);


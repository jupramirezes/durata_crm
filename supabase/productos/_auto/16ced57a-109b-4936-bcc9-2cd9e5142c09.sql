-- ============================================================
-- PRODUCTO: Campana Isla
-- ID: 16ced57a-109b-4936-bcc9-2cd9e5142c09
-- Grupo: campanas
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = '16ced57a-109b-4936-bcc9-2cd9e5142c09';
DELETE FROM producto_lineas_apu WHERE producto_id = '16ced57a-109b-4936-bcc9-2cd9e5142c09';
DELETE FROM producto_materiales WHERE producto_id = '16ced57a-109b-4936-bcc9-2cd9e5142c09';
DELETE FROM producto_variables WHERE producto_id = '16ced57a-109b-4936-bcc9-2cd9e5142c09';
DELETE FROM productos_catalogo WHERE id = '16ced57a-109b-4936-bcc9-2cd9e5142c09';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'Campana Isla', 'campanas', 38, '[instalado:Suministro e instalación de|Suministro de] campana extractora tipo isla en acero inoxidable AISI 304 satinado calibre {calibre_cuerpo} de {largo} m de largo x {profundidad} m de profundidad x {alto} m de alto, cuerpo en lámina cal {calibre_cuerpo} y tapa superior en lámina cal {calibre_tapa}, con {num_filtros} filtros de grasa estándar de 38 cm, suspensión mediante {num_guayas} guayas inox 1/4 pulg con grilletes, {num_valvulas} válvula(s) bola inox 1/2 pulg para drenaje, soldadura TIG con gas argón, acabado satinado pulido. [poliza:Incluye póliza.|Sin póliza.]', true, 28);

-- producto_variables (12)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'largo', 'Largo', 'numero', '1.6', 0.5, 5, NULL, 'Dimensiones', 1, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'profundidad', 'Profundidad', 'numero', '1.4', 0.5, 3, NULL, 'Dimensiones', 2, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'alto', 'Alto', 'numero', '0.6', 0.3, 1.5, NULL, 'Dimensiones', 3, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'calibre_cuerpo', 'Calibre Cuerpo', 'numero', '18', 14, 22, NULL, 'Material', 4, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'calibre_tapa', 'Calibre Tapa', 'numero', '20', 14, 22, NULL, 'Material', 5, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'num_filtros', '# Filtros', 'numero', '8', 1, 30, NULL, 'Configuración', 6, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'precio_filtro', 'Precio Filtro', 'numero', '110000', 50000, 300000, NULL, 'Configuración', 7, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'num_valvulas', '# Válvulas', 'numero', '1', 0, 4, NULL, 'Configuración', 8, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'num_guayas', '# Guayas', 'numero', '4', 2, 8, NULL, 'Configuración', 9, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'instalado', 'Incluye Instalación', 'toggle', 'true', NULL, NULL, NULL, 'Extras', 10, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'poliza', 'Requiere Póliza', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 11, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'poliza_pct', 'Póliza %', 'numero', '2', 1, 10, NULL, 'Extras', 12, NULL, NULL);

-- producto_materiales (25)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'acero_anterior', 'Acero anterior sat', false, NULL, 'm²', 'AILA0102{calibre_cuerpo}'),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'acero_posterior', 'Acero posterior sat', false, NULL, 'm²', 'AILA0102{calibre_cuerpo}'),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'acero_intermedia', 'Acero intermedia sat', false, NULL, 'm²', 'AILA0102{calibre_cuerpo}'),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'acero_laterales', 'Acero laterales sat', false, NULL, 'm²', 'AILA0102{calibre_cuerpo}'),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'acero_tapa', 'Acero tapa superior sat', false, NULL, 'm²', 'AILA0102{calibre_tapa}'),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'filtros', 'Filtros estándar 38cm', true, 1, 'und', ''),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'guayas', 'Guayas de fijación', false, NULL, 'ml', 'FEGY000104'),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'grilletes', 'Grilletes', false, NULL, 'und', 'FEGR010000'),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'valvula', 'Válvula bola inox 1/2', false, NULL, 'und', 'FEVA010008'),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'tornillos_ojo', 'Tornillos con ojo', true, 5500, 'und', ''),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'argon', 'Argón', true, 8000, 'und', ''),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'disco_corte', 'Disco de corte', false, NULL, 'und', 'ABDI100124'),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'disco_flap', 'Disco flap', false, NULL, 'und', 'ABDI802060'),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'pano', 'Paño Scotch Brite', false, NULL, 'und', 'ABPA020001'),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'lija', 'Lija zirconio', false, NULL, 'und', 'ABLI202080'),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'fresas', 'Fresas', true, 3900, 'und', ''),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'grata', 'Grata', false, NULL, 'und', 'ABGR200019'),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'empaque', 'Empaque y embalaje', true, 9000, 'und', ''),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'mo_acero', 'MO Acero', true, 177600, 'und', ''),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'mo_pulido', 'MO Pulido', true, 38850, 'und', ''),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'mo_instalacion', 'MO Instalación', true, 119880, 'und', ''),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'tte_elementos', 'TTE Elementos', true, 40000, 'und', ''),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'tte_ida', 'TTE Personal Ida', true, 0, 'und', ''),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'tte_regreso', 'TTE Personal Regreso', true, 15000, 'und', ''),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'laser', 'Corte láser', true, 6500, 'und', '');

-- producto_lineas_apu (26)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'insumos', 1, 'Acero anterior sat', 'acero_anterior', '(largo + 0.1) * (alto + 0.25) + largo * 0.25', 0, NULL, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'insumos', 2, 'Acero posterior sat', 'acero_posterior', '(largo + 0.02) * (alto + 0.12) + (largo * 0.25)', 0, NULL, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'insumos', 3, 'Acero intermedia sat', 'acero_intermedia', '0.3 * largo', 0, NULL, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'insumos', 4, 'Acero laterales sat', 'acero_laterales', '(alto + 0.13) * ((profundidad + 0.08) * 2)', 0, NULL, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'insumos', 5, 'Acero tapa superior sat', 'acero_tapa', 'largo * profundidad * 1.1', 0, NULL, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'insumos', 6, 'Filtros estándar 38cm', 'filtros', 'num_filtros * precio_filtro', 0, NULL, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'insumos', 7, 'Guayas de fijación', 'guayas', '2.5 * num_guayas', 0, NULL, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'insumos', 8, 'Grilletes', 'grilletes', '4 * num_guayas', 0, NULL, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'insumos', 9, 'Válvula bola inox 1/2', 'valvula', 'num_valvulas', 0, NULL, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'insumos', 10, 'Tornillos con ojo', 'tornillos_ojo', 'num_guayas', 0, NULL, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'insumos', 11, 'Argón', 'argon', 'largo', 0, NULL, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'insumos', 12, 'Disco de corte', 'disco_corte', 'largo', 0, NULL, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'insumos', 13, 'Disco flap', 'disco_flap', 'largo / 3', 0, NULL, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'insumos', 14, 'Paño Scotch Brite', 'pano', 'largo * 1.5', 0, NULL, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'insumos', 15, 'Lija zirconio', 'lija', 'largo / 2', 0, NULL, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'insumos', 16, 'Fresas', 'fresas', 'largo / 3', 0, NULL, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'insumos', 17, 'Grata', 'grata', 'largo / 5', 0, NULL, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'insumos', 18, 'Empaque y embalaje', 'empaque', 'largo', 0, NULL, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'mo', 19, 'MO Acero', 'mo_acero', 'largo', 0, NULL, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'mo', 20, 'MO Pulido', 'mo_pulido', 'largo', 0, NULL, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'mo', 21, 'MO Instalación', 'mo_instalacion', 'IF(instalado, largo, 0)', 0, NULL, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'transporte', 22, 'TTE Elementos', 'tte_elementos', 'largo', 0, NULL, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'transporte', 23, 'TTE Personal Ida', 'tte_ida', 'largo', 0, NULL, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'transporte', 24, 'TTE Personal Regreso', 'tte_regreso', 'largo', 0, NULL, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'laser', 25, 'Corte láser', 'laser', 'largo * profundidad * alto * 4.47', 0, NULL, NULL, NULL),
  ('16ced57a-109b-4936-bcc9-2cd9e5142c09', 'poliza', 26, 'Póliza', NULL, '1', 0, 'poliza', NULL, NULL);


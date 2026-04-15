-- ============================================================
-- PRODUCTO: Campana Mural
-- ID: cf57da93-2808-4ec6-9ce4-460ecdafe5de
-- Grupo: campanas
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = 'cf57da93-2808-4ec6-9ce4-460ecdafe5de';
DELETE FROM producto_lineas_apu WHERE producto_id = 'cf57da93-2808-4ec6-9ce4-460ecdafe5de';
DELETE FROM producto_materiales WHERE producto_id = 'cf57da93-2808-4ec6-9ce4-460ecdafe5de';
DELETE FROM producto_variables WHERE producto_id = 'cf57da93-2808-4ec6-9ce4-460ecdafe5de';
DELETE FROM productos_catalogo WHERE id = 'cf57da93-2808-4ec6-9ce4-460ecdafe5de';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'Campana Mural', 'campanas', 38, '[instalado:Suministro e instalación de|Suministro de] campana extractora tipo mural en acero inoxidable AISI 304 satinado calibre {calibre_cuerpo} de {largo} m de largo x {profundidad} m de profundidad x {alto} m de alto, con {num_filtros} filtros de grasa tipo 430 calibre 22 de 500x500 mm, {num_guayas} guayas inoxidables de 1/4 pulg para fijación a muro con grilletes, {num_valvulas} válvula de drenaje bola inox 1/2 pulg, soldadura TIG con gas argón, acabado pulido satinado sanitario. [poliza:Incluye póliza.|Sin póliza.]', true, 27);

-- producto_variables (12)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'largo', 'Largo', 'numero', '1.6', 0.5, 5, NULL, 'Dimensiones', 1, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'profundidad', 'Profundidad', 'numero', '1.1', 0.5, 2, NULL, 'Dimensiones', 2, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'alto', 'Alto', 'numero', '0.6', 0.3, 1.5, NULL, 'Dimensiones', 3, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'calibre_cuerpo', 'Calibre Cuerpo', 'numero', '18', 14, 22, NULL, 'Material', 4, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'calibre_tapa', 'Calibre Tapa', 'numero', '20', 14, 22, NULL, 'Material', 5, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'num_filtros', '# Filtros', 'numero', '4', 1, 20, NULL, 'Configuración', 6, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'precio_filtro', 'Precio Filtro', 'numero', '110000', 50000, 300000, NULL, 'Configuración', 7, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'num_valvulas', '# Válvulas', 'numero', '1', 0, 4, NULL, 'Configuración', 8, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'num_guayas', '# Guayas', 'numero', '2', 2, 8, NULL, 'Configuración', 9, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'instalado', 'Incluye Instalación', 'toggle', 'true', NULL, NULL, NULL, 'Extras', 10, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'poliza', 'Requiere Póliza', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 11, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'poliza_pct', 'Póliza %', 'numero', '2', 1, 10, NULL, 'Extras', 12, NULL, NULL);

-- producto_materiales (24)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'acero_anterior', 'Acero anterior sat', false, NULL, 'm²', 'AILA0102{calibre_cuerpo}'),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'acero_posterior', 'Acero posterior sat', false, NULL, 'm²', 'AILA0102{calibre_cuerpo}'),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'acero_laterales', 'Acero laterales sat', false, NULL, 'm²', 'AILA0102{calibre_cuerpo}'),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'acero_tapa', 'Acero tapa superior sat', false, NULL, 'm²', 'AILA0102{calibre_tapa}'),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'filtros', 'Filtros tipo 430 cal 22', true, 1, 'und', ''),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'guayas', 'Guayas de fijación', false, NULL, 'ml', 'FEGY000104'),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'grilletes', 'Grilletes', false, NULL, 'und', 'FEGR010000'),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'tornillos_ojo', 'Tornillos con ojo', true, 5500, 'und', ''),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'valvula', 'Válvula bola inox 1/2', false, NULL, 'und', 'FEVA010008'),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'argon', 'Argón', true, 8000, 'und', ''),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'disco_corte', 'Disco de corte', false, NULL, 'und', 'ABDI100124'),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'disco_flap', 'Disco flap', false, NULL, 'und', 'ABDI802060'),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'pano', 'Paño Scotch Brite', false, NULL, 'und', 'ABPA020001'),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'lija', 'Lija zirconio', false, NULL, 'und', 'ABLI202080'),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'fresas', 'Fresas', true, 3900, 'und', ''),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'grata', 'Grata', false, NULL, 'und', 'ABGR200019'),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'empaque', 'Empaque y embalaje', true, 9000, 'und', ''),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'mo_acero', 'MO Acero', true, 160950, 'und', ''),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'mo_pulido', 'MO Pulido', true, 42180, 'und', ''),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'mo_instalacion', 'MO Instalación', true, 122100, 'und', ''),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'tte_elementos', 'TTE Elementos', true, 40000, 'und', ''),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'tte_ida', 'TTE Personal Ida', true, 0, 'und', ''),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'tte_regreso', 'TTE Personal Regreso', true, 15000, 'und', ''),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'laser', 'Corte láser', true, 6500, 'und', '');

-- producto_lineas_apu (25)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'insumos', 1, 'Acero anterior sat', 'acero_anterior', '(largo + 0.1) * (alto + 0.25) + largo * 0.25', 0, NULL, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'insumos', 2, 'Acero posterior sat', 'acero_posterior', '(largo + 0.02) * (alto + 0.12) + (largo * 0.25)', 0, NULL, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'insumos', 3, 'Acero laterales sat', 'acero_laterales', '(alto + 0.13) * ((profundidad + 0.08) * 2)', 0, NULL, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'insumos', 4, 'Acero tapa superior sat', 'acero_tapa', 'largo * profundidad * 1.1', 0, NULL, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'insumos', 5, 'Filtros tipo 430 cal 22', 'filtros', 'num_filtros * precio_filtro', 0, NULL, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'insumos', 6, 'Guayas de fijación', 'guayas', '2.5 * num_guayas', 0, NULL, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'insumos', 7, 'Grilletes', 'grilletes', '4 * num_guayas', 0, NULL, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'insumos', 8, 'Tornillos con ojo', 'tornillos_ojo', 'num_guayas * 2', 0, NULL, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'insumos', 9, 'Válvula bola inox 1/2', 'valvula', 'num_valvulas', 0, NULL, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'insumos', 10, 'Argón', 'argon', 'largo', 0, NULL, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'insumos', 11, 'Disco de corte', 'disco_corte', 'largo', 0, NULL, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'insumos', 12, 'Disco flap', 'disco_flap', 'largo / 3', 0, NULL, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'insumos', 13, 'Paño Scotch Brite', 'pano', 'largo * 1.5', 0, NULL, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'insumos', 14, 'Lija zirconio', 'lija', 'largo / 2', 0, NULL, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'insumos', 15, 'Fresas', 'fresas', 'largo / 3', 0, NULL, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'insumos', 16, 'Grata', 'grata', 'largo / 5', 0, NULL, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'insumos', 17, 'Empaque y embalaje', 'empaque', 'largo', 0, NULL, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'mo', 18, 'MO Acero', 'mo_acero', 'largo', 0, NULL, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'mo', 19, 'MO Pulido', 'mo_pulido', 'largo', 0, NULL, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'mo', 20, 'MO Instalación', 'mo_instalacion', 'IF(instalado, largo, 0)', 0, NULL, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'transporte', 21, 'TTE Elementos', 'tte_elementos', 'largo', 0, NULL, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'transporte', 22, 'TTE Personal Ida', 'tte_ida', 'largo', 0, NULL, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'transporte', 23, 'TTE Personal Regreso', 'tte_regreso', 'largo', 0, NULL, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'laser', 24, 'Corte láser', 'laser', 'largo * profundidad * alto * 4.47', 0, NULL, NULL, NULL),
  ('cf57da93-2808-4ec6-9ce4-460ecdafe5de', 'poliza', 25, 'Póliza', NULL, '1', 0, 'poliza', NULL, NULL);


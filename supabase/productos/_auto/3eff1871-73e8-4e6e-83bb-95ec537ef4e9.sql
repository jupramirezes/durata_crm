-- ============================================================
-- PRODUCTO: Lavaollas
-- ID: 3eff1871-73e8-4e6e-83bb-95ec537ef4e9
-- Grupo: accesorios
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = '3eff1871-73e8-4e6e-83bb-95ec537ef4e9';
DELETE FROM producto_lineas_apu WHERE producto_id = '3eff1871-73e8-4e6e-83bb-95ec537ef4e9';
DELETE FROM producto_materiales WHERE producto_id = '3eff1871-73e8-4e6e-83bb-95ec537ef4e9';
DELETE FROM producto_variables WHERE producto_id = '3eff1871-73e8-4e6e-83bb-95ec537ef4e9';
DELETE FROM productos_catalogo WHERE id = '3eff1871-73e8-4e6e-83bb-95ec537ef4e9';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'Lavaollas', 'accesorios', 38, '[instalado:Suministro e instalación de|Suministro de] mesa lavaollas en acero inoxidable 304 calibre {calibre_mesa} de {largo} m de largo x {ancho} m de ancho x {alto} m de alto, con {num_pozuelos} pozuelo(s) de {poz_largo} m x {poz_ancho} m x {poz_alto} m de profundidad, {num_patas} patas en tubo cuadrado 1-1/2 pulg cal.16, {salp_long} salpicadero(s) longitudinal(es) de {alto_salpicadero} m de alto, {salp_costado} salpicadero(s) en costado(s), niveladores en acero inoxidable, soldadura TIG con gas argón, acabado pulido satinado. [poliza:Incluye póliza.|Sin póliza.]', true, 29);

-- producto_variables (16)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'largo', 'Largo', 'numero', '0.8', 0.5, 3, NULL, 'Dimensiones', 1, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'ancho', 'Ancho', 'numero', '0.8', 0.4, 2, NULL, 'Dimensiones', 2, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'alto', 'Alto', 'numero', '0.9', 0.5, 1.2, NULL, 'Dimensiones', 3, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'calibre_mesa', 'Calibre Mesa', 'numero', '18', 14, 20, NULL, 'Material', 4, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'calibre_pozuelo', 'Calibre Pozuelo', 'numero', '16', 14, 20, NULL, 'Material', 5, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'num_pozuelos', '# Pozuelos', 'numero', '1', 1, 4, NULL, 'Configuración', 6, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'poz_largo', 'Largo Pozuelo', 'numero', '0.7', 0.3, 1.2, NULL, 'Configuración', 7, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'poz_ancho', 'Ancho Pozuelo', 'numero', '0.7', 0.3, 1, NULL, 'Configuración', 8, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'poz_alto', 'Alto Pozuelo', 'numero', '0.4', 0.15, 0.6, NULL, 'Configuración', 9, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'num_patas', '# Patas', 'numero', '4', 2, 8, NULL, 'Estructura', 10, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'salp_long', '# Salpicadero Long', 'numero', '1', 0, 2, NULL, 'Estructura', 11, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'salp_costado', '# Salpicadero Costado', 'numero', '2', 0, 4, NULL, 'Estructura', 12, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'alto_salpicadero', 'Alto Salpicadero', 'numero', '0.1', 0.05, 0.5, NULL, 'Estructura', 13, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'instalado', 'Incluye Instalación', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 14, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'poliza', 'Requiere Póliza', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 15, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'poliza_pct', 'Póliza %', 'numero', '2', 1, 10, NULL, 'Extras', 16, NULL, NULL);

-- producto_materiales (19)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'acero_mesa', 'Acero mesa', false, NULL, 'm²', 'AILA0101{calibre_mesa}'),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'acero_pozuelo', 'Acero pozuelo', false, NULL, 'm²', 'AILA0101{calibre_pozuelo}'),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'tubo_patas', 'Tubo cuadrado 1-1/2 cal 16', false, NULL, 'ml', 'AITC180016'),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'niveladores', 'Niveladores', false, NULL, 'und', 'FENI010118'),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'argon', 'Argón', true, 18000, 'und', ''),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'disco_corte', 'Disco de corte', false, NULL, 'und', 'ABDI100124'),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'disco_flap', 'Disco flap', false, NULL, 'und', 'ABDI802060'),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'pano', 'Paño Scotch Brite', false, NULL, 'und', 'ABPA020001'),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'lija', 'Lija zirconio', false, NULL, 'und', 'ABLI202080'),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'grata', 'Grata', false, NULL, 'und', 'ABGR200019'),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'empaque', 'Empaque y embalaje', true, 3500, 'und', ''),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'mo_acero', 'MO Acero', true, 83250, 'und', ''),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'mo_pulido', 'MO Pulido', true, 55500, 'und', ''),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'mo_patas', 'MO Postura y pulida patas', true, 15540, 'und', ''),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'mo_instalacion', 'MO Instalación', true, 22200, 'und', ''),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'tte_elementos', 'TTE Elementos', true, 25000, 'und', ''),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'tte_ida', 'TTE Personal Ida', true, 0, 'und', ''),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'tte_regreso', 'TTE Personal Regreso', true, 10000, 'und', ''),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'laser', 'Corte láser', true, 6500, 'und', '');

-- producto_lineas_apu (20)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'insumos', 1, 'Acero mesa', 'acero_mesa', '(largo + 0.12) * (ancho + 0.12) + ((alto_salpicadero + 0.04) * salp_long * largo + (alto_salpicadero + 0.04) * salp_costado * ancho)', 0, NULL, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'insumos', 2, 'Acero pozuelo', 'acero_pozuelo', '((poz_largo * poz_alto * 2) + (poz_ancho * poz_alto * 2) + (poz_largo * poz_ancho)) * num_pozuelos * 1.1', 0, NULL, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'insumos', 3, 'Tubo cuadrado 1-1/2 cal 16', 'tubo_patas', 'alto * num_patas + (ancho * (num_patas / 2) + largo)', 0, NULL, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'insumos', 4, 'Niveladores', 'niveladores', 'num_patas', 0, NULL, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'insumos', 5, 'Argón', 'argon', 'largo * 2 + poz_largo + poz_alto', 0, NULL, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'insumos', 6, 'Disco de corte', 'disco_corte', '(largo * 2 + poz_largo + poz_alto) / 3', 0, NULL, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'insumos', 7, 'Disco flap', 'disco_flap', '(largo * 2 + poz_largo + poz_alto) / 8', 0, NULL, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'insumos', 8, 'Paño Scotch Brite', 'pano', '(largo * 2 + poz_largo + poz_alto) / 3', 0, NULL, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'insumos', 9, 'Lija zirconio', 'lija', '(largo * 2 + poz_largo + poz_alto) / 4', 0, NULL, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'insumos', 10, 'Grata', 'grata', '(largo * 2 + poz_largo + poz_alto) / 30', 0, NULL, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'insumos', 11, 'Empaque y embalaje', 'empaque', 'largo * 2 + poz_largo + poz_alto', 0, NULL, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'mo', 12, 'MO Acero', 'mo_acero', 'largo * 2 + poz_largo + poz_alto', 0, NULL, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'mo', 13, 'MO Pulido', 'mo_pulido', 'largo * 2 + poz_largo + poz_alto', 0, NULL, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'mo', 14, 'MO Postura y pulida patas', 'mo_patas', 'num_patas', 0, NULL, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'mo', 15, 'MO Instalación', 'mo_instalacion', 'IF(instalado, 1, 0)', 0, NULL, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'transporte', 16, 'TTE Elementos', 'tte_elementos', 'largo * 2 + poz_largo + poz_alto', 0, NULL, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'transporte', 17, 'TTE Personal Ida', 'tte_ida', 'largo * 2 + poz_largo + poz_alto', 0, NULL, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'transporte', 18, 'TTE Personal Regreso', 'tte_regreso', 'largo * 2 + poz_largo + poz_alto', 0, NULL, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'laser', 19, 'Corte láser', 'laser', '(largo * 2 + poz_largo + poz_alto) * 2', 0, NULL, NULL, NULL),
  ('3eff1871-73e8-4e6e-83bb-95ec537ef4e9', 'poliza', 20, 'Póliza', NULL, '1', 0, 'poliza', NULL, NULL);


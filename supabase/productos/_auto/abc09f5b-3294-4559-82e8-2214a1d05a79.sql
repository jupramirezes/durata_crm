-- ============================================================
-- PRODUCTO: Mesón
-- ID: abc09f5b-3294-4559-82e8-2214a1d05a79
-- Grupo: mesones
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = 'abc09f5b-3294-4559-82e8-2214a1d05a79';
DELETE FROM producto_lineas_apu WHERE producto_id = 'abc09f5b-3294-4559-82e8-2214a1d05a79';
DELETE FROM producto_materiales WHERE producto_id = 'abc09f5b-3294-4559-82e8-2214a1d05a79';
DELETE FROM producto_variables WHERE producto_id = 'abc09f5b-3294-4559-82e8-2214a1d05a79';
DELETE FROM productos_catalogo WHERE id = 'abc09f5b-3294-4559-82e8-2214a1d05a79';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'Mesón', 'mesones', 38, '[instalado:Suministro e instalación de|Suministro de] mesón en acero inoxidable AISI 304 de {largo} m de largo x {ancho} m de ancho, con {num_pieamigos} pieamigo(s) en acero cal 14, {salp_long} salpicadero(s) longitudinal(es) de {alto_salpicadero} m de alto y {salp_costado} salpicadero(s) de costado, [posee_babero:con babero de {alto_babero} m x {babero_costados} costado(s), |sin babero, ][refuerzo_rh:refuerzo en RH 15 mm, |]{omegas_largo} omega(s) a lo largo de {ancho_omegas} m y {omegas_ancho} omega(s) a lo ancho en acero cal 18, [tiene_pozuelo:{num_pozuelos} pozuelo(s) de {poz_largo} x {poz_ancho} x {poz_alto} m, |][tiene_poz_redondo:{num_poz_redondo} pozuelo(s) redondo(s) de 370 mm, |][tiene_vertedero:{num_vertederos} vertedero(s) de {diam_vertedero} m diám x {prof_vertedero} m prof, |]soldadura TIG con gas argón, acabado satinado pulido. [poliza:Incluye póliza.|Sin póliza.]', true, 25);

-- producto_variables (24)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'largo', 'Largo', 'numero', '2', 0.5, 5, NULL, 'Dimensiones', 1, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'ancho', 'Ancho', 'numero', '0.55', 0.3, 1.5, NULL, 'Dimensiones', 2, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'ancho_omegas', 'Ancho Omegas', 'numero', '0.15', 0.05, 0.3, NULL, 'Estructura', 3, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'omegas_largo', '# Omegas a lo largo', 'numero', '1', 0, 6, NULL, 'Estructura', 4, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'omegas_ancho', '# Omegas a lo ancho', 'numero', '2', 0, 6, NULL, 'Estructura', 5, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'num_pieamigos', '# Pieamigos', 'numero', '1', 0, 6, NULL, 'Estructura', 6, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'salp_long', '# Salpicadero Longitudinal', 'numero', '1', 0, 2, NULL, 'Salpicadero', 7, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'salp_costado', '# Salpicadero Costado', 'numero', '2', 0, 4, NULL, 'Salpicadero', 8, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'alto_salpicadero', 'Alto Salpicadero', 'numero', '0.1', 0.05, 0.5, NULL, 'Salpicadero', 9, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'refuerzo_rh', 'Refuerzo RH 15mm', 'toggle', 'false', NULL, NULL, NULL, 'Estructura', 10, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'posee_babero', 'Posee Babero', 'toggle', 'true', NULL, NULL, NULL, 'Babero', 11, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'alto_babero', 'Alto Babero', 'numero', '0.25', 0.1, 0.6, NULL, 'Babero', 12, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'babero_costados', '# Babero Costados', 'numero', '1', 0, 2, NULL, 'Babero', 13, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'num_pozuelos', '# Pozuelos', 'numero', '1', 0, 4, NULL, 'Pozuelo', 14, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'poz_largo', 'Largo Pozuelo', 'numero', '0.54', 0.2, 1, NULL, 'Pozuelo', 15, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'poz_ancho', 'Ancho Pozuelo', 'numero', '0.39', 0.2, 0.8, NULL, 'Pozuelo', 16, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'poz_alto', 'Alto Pozuelo', 'numero', '0.18', 0.1, 0.5, NULL, 'Pozuelo', 17, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'num_poz_redondo', '# Pozuelo Redondo', 'numero', '1', 0, 4, NULL, 'Pozuelo', 18, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'num_vertederos', '# Vertederos', 'numero', '0', 0, 4, NULL, 'Vertedero', 19, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'diam_vertedero', 'Diámetro Vertedero', 'numero', '0.45', 0.2, 1, NULL, 'Vertedero', 20, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'prof_vertedero', 'Prof Vertedero', 'numero', '0.5', 0.2, 1, NULL, 'Vertedero', 21, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'instalado', 'Incluye Instalación', 'toggle', 'true', NULL, NULL, NULL, 'Extras', 22, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'poliza', 'Requiere Póliza', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 23, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'poliza_pct', 'Póliza %', 'numero', '2', 1, 10, NULL, 'Extras', 24, NULL, NULL);

-- producto_materiales (31)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'acero_mesa', 'Acero mesa cal 18 2B', false, NULL, 'm²', 'AILA010118'),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'acero_omegas', 'Acero omegas cal 18', false, NULL, 'm²', 'AILA010118'),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'acero_pieamigo', 'Acero pieamigo cal 14', false, NULL, 'm²', 'AILA010114'),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'acero_babero', 'Acero babero satinado cal 20', false, NULL, 'm²', 'AILA010220'),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'acero_pozuelo', 'Acero pozuelo cal 18 2B', false, NULL, 'm²', 'AILA010118'),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'poz_redondo', 'Pozuelo redondo 370mm', false, NULL, 'und', 'FEPO010137'),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'rh_15mm', 'RH 15mm aglomerado', false, NULL, 'm²', 'FEOM090015'),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'tornillos', 'Tornillos', true, 1000, 'und', ''),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'cinta_3m', 'Cinta 3M', true, 11500, 'ml', ''),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'pl285', 'PL-285 (galón)', false, NULL, 'gal', 'FEOM120100'),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'acero_vertedero', 'Acero vertedero cal 16 2B', false, NULL, 'm²', 'AILA010116'),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'tubo_vertedero', 'Tubo 3" inox vertedero', false, NULL, 'ml', 'AITC210016'),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'argon_vertedero', 'Argón vertedero', true, 15000, 'und', ''),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'abrasivos_vertedero', 'Abrasivos vertedero', true, 12000, 'und', ''),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'argon', 'Argón', true, 4000, 'und', ''),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'disco_corte', 'Disco de corte', false, NULL, 'und', 'ABDI100124'),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'disco_flap', 'Disco flap', false, NULL, 'und', 'ABDI802060'),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'pano', 'Paño Scotch Brite', false, NULL, 'und', 'ABPA020001'),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'lija', 'Lija zirconio', false, NULL, 'und', 'ABLI202080'),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'grata', 'Grata', false, NULL, 'und', 'ABGR200019'),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'empaque', 'Empaque y embalaje', true, 3500, 'und', ''),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'mo_acero', 'MO Acero', true, 30000, 'und', ''),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'mo_pulido', 'MO Pulido', true, 23000, 'und', ''),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'mo_pieamigos', 'MO Pieamigos', true, 10000, 'und', ''),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'mo_pozuelos_prof', 'MO Pozuelos profundos', true, 1, 'und', ''),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'mo_vertedero', 'MO Vertedero', true, 60000, 'und', ''),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'mo_instalacion', 'MO Instalación', true, 40000, 'und', ''),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'tte_elementos', 'TTE Elementos', true, 15000, 'und', ''),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'tte_ida', 'TTE Personal Ida', true, 0, 'und', ''),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'tte_regreso', 'TTE Personal Regreso', true, 5000, 'und', ''),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'laser', 'Corte láser', true, 6500, 'und', '');

-- producto_lineas_apu (32)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'insumos', 1, 'Acero mesa cal 18 2B', 'acero_mesa', '(largo + 0.12) * (ancho + 0.12) + ((alto_salpicadero + 0.04) * salp_long * largo + (alto_salpicadero + 0.04) * salp_costado * ancho)', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'insumos', 2, 'Acero omegas', 'acero_omegas', 'IF(refuerzo_rh, 0, (ancho_omegas + 0.05) * largo * omegas_largo + ancho_omegas * ancho * omegas_ancho + ancho_omegas * ancho * num_pozuelos)', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'insumos', 3, 'Acero pieamigo cal 14', 'acero_pieamigo', 'num_pieamigos * ancho * 0.45 / 2 * 1.1', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'insumos', 4, 'Acero babero satinado cal 20', 'acero_babero', '(alto_babero + 0.06) * (largo + 0.06) * IF(posee_babero, 1, 0) + (ancho + 0.06) * (alto_babero + 0.06) * babero_costados', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'insumos', 5, 'Acero pozuelo cal 18 2B', 'acero_pozuelo', '(poz_largo + poz_alto * 2) * (poz_ancho + poz_alto * 2) * num_pozuelos * 1.1', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'insumos', 6, 'Pozuelo redondo 370mm', 'poz_redondo', 'num_poz_redondo', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'insumos', 7, 'RH 15mm aglomerado', 'rh_15mm', 'IF(refuerzo_rh, largo * ancho, 0)', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'insumos', 8, 'Tornillos', 'tornillos', 'largo * 4', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'insumos', 9, 'Cinta 3M', 'cinta_3m', 'largo * omegas_largo + ancho * omegas_ancho + ancho * 2 * num_pozuelos', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'insumos', 10, 'PL-285 (galón)', 'pl285', '((largo + 0.12) * (ancho + 0.12) + ((alto_salpicadero + 0.04) * salp_long * largo + (alto_salpicadero + 0.04) * salp_costado * ancho)) / 4', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'insumos', 11, 'Acero vertedero cal 16 2B', 'acero_vertedero', '(diam_vertedero * 3.1416 * prof_vertedero + (0.2 * 0.2 * 3.1416) * 2) * num_vertederos', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'insumos', 12, 'Tubo 3" inox vertedero', 'tubo_vertedero', '0.25 * num_vertederos', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'insumos', 13, 'Argón vertedero', 'argon_vertedero', 'num_vertederos', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'insumos', 14, 'Abrasivos vertedero', 'abrasivos_vertedero', 'num_vertederos', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'insumos', 15, 'Argón', 'argon', 'largo + num_pozuelos + num_poz_redondo + num_vertederos * 4', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'insumos', 16, 'Disco de corte', 'disco_corte', '(largo + num_pozuelos + num_poz_redondo + num_vertederos * 4) / 3', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'insumos', 17, 'Disco flap', 'disco_flap', '(largo + num_pozuelos + num_poz_redondo + num_vertederos * 4) / 8', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'insumos', 18, 'Paño Scotch Brite', 'pano', '(largo + num_pozuelos + num_poz_redondo + num_vertederos * 4) / 3', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'insumos', 19, 'Lija zirconio', 'lija', '(largo + num_pozuelos + num_poz_redondo + num_vertederos * 4) / 4', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'insumos', 20, 'Grata', 'grata', '(largo + num_pozuelos + num_poz_redondo + num_vertederos * 4) / 30', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'insumos', 21, 'Empaque y embalaje', 'empaque', 'largo', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'mo', 22, 'MO Acero', 'mo_acero', 'largo + num_pozuelos + num_poz_redondo', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'mo', 23, 'MO Pulido', 'mo_pulido', 'largo + num_pozuelos + num_poz_redondo', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'mo', 24, 'MO Pieamigos', 'mo_pieamigos', 'num_pieamigos', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'mo', 25, 'MO Pozuelos profundos', 'mo_pozuelos_prof', 'IF(poz_alto > 0.24, num_pozuelos * poz_alto * 100000 * 1.12, 0)', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'mo', 26, 'MO Vertedero', 'mo_vertedero', 'num_vertederos', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'mo', 27, 'MO Instalación', 'mo_instalacion', 'IF(instalado, largo, 0)', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'transporte', 28, 'TTE Elementos', 'tte_elementos', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'transporte', 29, 'TTE Personal Ida', 'tte_ida', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'transporte', 30, 'TTE Personal Regreso', 'tte_regreso', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'laser', 31, 'Corte láser', 'laser', 'ROUNDUP(largo, 0) + num_vertederos * 5', 0, NULL, NULL, NULL),
  ('abc09f5b-3294-4559-82e8-2214a1d05a79', 'poliza', 32, 'Póliza', NULL, '1', 0, 'poliza', NULL, NULL);


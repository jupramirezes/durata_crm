-- ============================================================
-- PRODUCTO: Mueble Inferior
-- ID: 353cf35e-9806-49c7-854b-3d89c25d31e5
-- Grupo: muebles
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = '353cf35e-9806-49c7-854b-3d89c25d31e5';
DELETE FROM producto_lineas_apu WHERE producto_id = '353cf35e-9806-49c7-854b-3d89c25d31e5';
DELETE FROM producto_materiales WHERE producto_id = '353cf35e-9806-49c7-854b-3d89c25d31e5';
DELETE FROM producto_variables WHERE producto_id = '353cf35e-9806-49c7-854b-3d89c25d31e5';
DELETE FROM productos_catalogo WHERE id = '353cf35e-9806-49c7-854b-3d89c25d31e5';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'Mueble Inferior', 'muebles', 38, '[instalado:Suministro e instalación de|Suministro de] mueble bajo en acero inoxidable AISI 304 de {largo} m de largo x {ancho} m de ancho x {alto} m de alto, con {num_puertas} puertas, {num_entrepanos} entrepaño(s), {num_patas} patas en tubo cuadrado 1-1/2 pulg cal.16 con niveladores, {num_divisiones} división(es) vertical(es), [tiene_pozuelo:{num_pozuelos} pozuelo(s) de {poz_largo} x {poz_ancho} x {poz_alto} m, |][tiene_poz_redondo:{num_poz_redondo} pozuelo(s) redondo(s), |][tiene_cajones:{torre_cajones} torre(s) de cajones con {cajones_por_division} cajón(es) c/u, |]altura libre desde piso {altura_libre_piso} m, [tiene_omegas:con omegas de refuerzo, |]soldadura TIG con gas argón, acabado satinado pulido. [poliza:Incluye póliza.|Sin póliza.]', true, 39);

-- producto_variables (28)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'largo', 'Largo', 'numero', '2.43', 0.5, 5, NULL, 'Dimensiones', 1, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'ancho', 'Ancho', 'numero', '0.8', 0.3, 1.2, NULL, 'Dimensiones', 2, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'alto', 'Alto', 'numero', '0.9', 0.5, 1.2, NULL, 'Dimensiones', 3, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'altura_libre_piso', 'Altura Libre Piso', 'numero', '0.1', 0, 0.3, NULL, 'Dimensiones', 4, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'num_puertas', '# Puertas', 'numero', '4', 0, 8, NULL, 'Configuración', 5, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'num_divisiones', '# Divisiones Verticales', 'numero', '1', 0, 4, NULL, 'Configuración', 6, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'num_patas', '# Patas', 'numero', '4', 2, 8, NULL, 'Configuración', 7, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'num_entrepanos', '# Entrepaños', 'numero', '1', 0, 6, NULL, 'Configuración', 8, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'salp_long', '# Salpicadero Long', 'numero', '0', 0, 2, NULL, 'Salpicadero', 9, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'salp_lateral', '# Salpicadero Lateral', 'numero', '0', 0, 4, NULL, 'Salpicadero', 10, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'alto_salpicadero', 'Alto Salpicadero', 'numero', '0', 0, 0.5, NULL, 'Salpicadero', 11, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'tiene_omegas', 'Tiene Omegas', 'toggle', 'false', NULL, NULL, NULL, 'Configuración', 12, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'torre_cajones', '# Torre Cajones', 'numero', '0', 0, 4, NULL, 'Cajones', 13, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'cajones_por_division', '# Cajones por División', 'numero', '0', 0, 6, NULL, 'Cajones', 14, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'largo_cajon', 'Largo Cajón', 'numero', '0', 0, 1, NULL, 'Cajones', 15, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'alto_cajon', 'Alto Cajón', 'numero', '0', 0, 0.5, NULL, 'Cajones', 16, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'num_pozuelos', '# Pozuelos', 'numero', '1', 0, 4, NULL, 'Pozuelo', 17, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'num_poz_redondo', '# Pozuelo Redondo', 'numero', '0', 0, 4, NULL, 'Pozuelo', 18, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'poz_largo', 'Largo Pozuelo', 'numero', '0.6', 0.2, 1.2, NULL, 'Pozuelo', 19, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'poz_ancho', 'Ancho Pozuelo', 'numero', '0.45', 0.2, 0.8, NULL, 'Pozuelo', 20, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'poz_alto', 'Alto Pozuelo', 'numero', '0.25', 0.1, 0.5, NULL, 'Pozuelo', 21, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'incluye_push', 'Push+Grifo+Canastilla', 'toggle', 'true', NULL, NULL, NULL, 'Accesorios', 22, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'precio_push', 'Precio Push', 'numero', '348000', 100000, 600000, NULL, 'Accesorios', 23, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'precio_grifo', 'Precio Grifo', 'numero', '74000', 30000, 200000, NULL, 'Accesorios', 24, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'precio_canastilla', 'Precio Canastilla', 'numero', '24000', 10000, 100000, NULL, 'Accesorios', 25, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'instalado', 'Incluye Instalación', 'toggle', 'true', NULL, NULL, NULL, 'Extras', 26, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'poliza', 'Requiere Póliza', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 27, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'poliza_pct', 'Póliza %', 'numero', '2', 1, 10, NULL, 'Extras', 28, NULL, NULL);

-- producto_materiales (38)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'acero_cuerpo', 'Acero cuerpo cal 18 sat', false, NULL, 'm²', 'AILA010218'),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'acero_mesa', 'Acero mesa cal 18 2B', false, NULL, 'm²', 'AILA010118'),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'acero_omegas', 'Acero omegas cal 18 2B', false, NULL, 'm²', 'AILA010118'),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'acero_entrepano', 'Acero entrepaño cal 18 sat', false, NULL, 'm²', 'AILA010218'),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'acero_pozuelo', 'Acero pozuelo cal 18 2B', false, NULL, 'm²', 'AILA010118'),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'poz_redondo', 'Pozuelo redondo 370mm', false, NULL, 'und', 'FEPO010137'),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'acero_puerta', 'Acero puerta cal 20 sat', false, NULL, 'm²', 'AILA010220'),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'acero_cajones', 'Acero cajones cal 20 sat', false, NULL, 'm²', 'AILA010220'),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'acero_divisiones', 'Acero divisiones cal 20 sat', false, NULL, 'm²', 'AILA010220'),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'icopor', 'Icopor 25mm', false, NULL, 'm²', 'FEOM060025'),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'cinta', 'Cinta enmascarar', false, NULL, 'ml', 'FEOM040202'),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'bisagras', 'Bisagras ocultas', false, NULL, 'und', 'FEBI010101'),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'manija', 'Manija tipo Roma', false, NULL, 'und', 'FEMA011508'),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'chapa', 'Chapa Yale', false, NULL, 'und', 'FECH010101'),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'pasador', 'Pasador inox', false, NULL, 'und', 'FEPA010100'),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'rieles', 'Rieles 450mm x 45kg', false, NULL, 'und', 'FERI010045'),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'tubo_patas', 'Tubo cuadrado 1-1/2" cal 16', false, NULL, 'ml', 'AITC180016'),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'niveladores', 'Niveladores plástico', false, NULL, 'und', 'FENI010119'),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'argon', 'Argón', true, 6000, 'und', ''),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'disco_corte', 'Disco de corte', false, NULL, 'und', 'ABDI100124'),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'disco_flap', 'Disco flap', false, NULL, 'und', 'ABDI802060'),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'pano', 'Paño Scotch Brite', false, NULL, 'und', 'ABPA020001'),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'lija', 'Lija zirconio', false, NULL, 'und', 'ABLI202080'),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'grata', 'Grata tela grano 36', false, NULL, 'und', 'ABGR100036'),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'empaque', 'Empaque y embalaje', true, 5500, 'und', ''),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'push_grifo', 'Push+Grifo+Canastilla', true, 1, 'und', ''),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'mo_acero_meson', 'MO Acero mesón y cuerpo', true, 40000, 'und', ''),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'mo_acero_entrepano', 'MO Acero entrepaño', true, 40000, 'und', ''),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'mo_acero_pozuelos', 'MO Acero pozuelos', true, 40000, 'und', ''),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'mo_pulido', 'MO Pulido', true, 30000, 'und', ''),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'mo_puertas', 'MO Puertas', true, 12210, 'und', ''),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'mo_cajones', 'MO Cajones', true, 17760, 'und', ''),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'mo_poz_profundo', 'MO Poz Profundo', true, 1, 'und', ''),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'mo_instalacion', 'MO Instalación', true, 38850, 'und', ''),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'tte_elementos', 'TTE Elementos', true, 35000, 'und', ''),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'tte_ida', 'TTE Personal Ida', true, 0, 'und', ''),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'tte_regreso', 'TTE Personal Regreso', true, 0, 'und', ''),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'laser', 'Corte láser', true, 6500, 'und', '');

-- producto_lineas_apu (39)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'insumos', 1, 'Acero cuerpo cal 18 sat', 'acero_cuerpo', '(largo + 0.04) * (alto - altura_libre_piso + 0.04) + (ancho + 0.04) * (alto - altura_libre_piso + 0.04) * 2 + (largo + 0.1) * (ancho + 0.1)', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'insumos', 2, 'Acero mesa cal 18 2B', 'acero_mesa', '(largo + alto_salpicadero * salp_lateral + 0.15) * (ancho + alto_salpicadero * salp_long + 0.06)', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'insumos', 3, 'Acero omegas cal 18 2B', 'acero_omegas', 'IF(tiene_omegas, 0.2 * largo * ROUNDUP(ancho / 0.6, 0), 0) + 0.15 * ancho * num_patas / 2 + num_pozuelos * 0.15 * ancho * 2', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'insumos', 4, 'Acero entrepaño cal 18 sat', 'acero_entrepano', '((largo - largo_cajon * torre_cajones + 0.06) * (ancho - 0.1) + 0.1 * largo + 0.15 * ancho * num_patas / 2) * num_entrepanos', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'insumos', 5, 'Acero pozuelo cal 18 2B', 'acero_pozuelo', '(poz_largo + poz_alto * 2) * (poz_ancho + poz_alto * 2) * num_pozuelos', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'insumos', 6, 'Pozuelo redondo 370mm', 'poz_redondo', 'num_poz_redondo', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'insumos', 7, 'Acero puerta cal 20 sat', 'acero_puerta', 'IF(num_puertas > 0, ((largo - (largo_cajon * torre_cajones) + (num_puertas * 0.03)) * (alto - altura_libre_piso + 0.06)) * 2, 0)', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'insumos', 8, 'Acero cajones cal 20 sat', 'acero_cajones', '((largo_cajon + (alto_cajon * 2 / 3) * 2) * (ancho + 0.03) + ((largo_cajon + 0.03) * (alto_cajon + 0.03) * 3)) * cajones_por_division * torre_cajones', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'insumos', 9, 'Acero divisiones cal 20 sat', 'acero_divisiones', '(ancho + 0.04) * (alto - altura_libre_piso + 0.04) * num_divisiones', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'insumos', 10, 'Icopor 25mm', 'icopor', 'largo * (alto - altura_libre_piso)', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'insumos', 11, 'Cinta enmascarar', 'cinta', 'ancho * num_patas / 2 + num_pozuelos * ancho * 2 + IF(tiene_omegas, largo * ROUNDUP(ancho / 0.6, 0) + (largo * ROUNDUP(ancho / 0.6, 0) + ancho * num_patas / 2) * num_entrepanos, 0)', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'insumos', 12, 'Bisagras ocultas', 'bisagras', 'num_puertas * 2', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'insumos', 13, 'Manija tipo Roma', 'manija', 'num_puertas + cajones_por_division * torre_cajones', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'insumos', 14, 'Chapa Yale', 'chapa', 'ROUNDUP(num_puertas / 2 + torre_cajones * cajones_por_division, 0)', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'insumos', 15, 'Pasador inox', 'pasador', 'ROUNDUP(num_puertas / 2, 0)', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'insumos', 16, 'Rieles 450mm x 45kg', 'rieles', 'cajones_por_division * torre_cajones', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'insumos', 17, 'Tubo cuadrado 1-1/2" cal 16', 'tubo_patas', '(altura_libre_piso + 0.1) * num_patas', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'insumos', 18, 'Niveladores plástico', 'niveladores', 'num_patas', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'insumos', 19, 'Argón', 'argon', 'largo + largo * num_entrepanos + largo * 0.5 + num_pozuelos + num_poz_redondo + (num_puertas + torre_cajones * cajones_por_division) / 2', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'insumos', 20, 'Disco de corte', 'disco_corte', '(largo + largo * num_entrepanos + largo * 0.5 + num_pozuelos + num_poz_redondo + (num_puertas + torre_cajones * cajones_por_division) / 2) / 3', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'insumos', 21, 'Disco flap', 'disco_flap', '(largo + largo * num_entrepanos + largo * 0.5 + num_pozuelos + num_poz_redondo + (num_puertas + torre_cajones * cajones_por_division) / 2) / 8', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'insumos', 22, 'Paño Scotch Brite', 'pano', '(largo + largo * num_entrepanos + largo * 0.5 + num_pozuelos + num_poz_redondo + (num_puertas + torre_cajones * cajones_por_division) / 2) / 3', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'insumos', 23, 'Lija zirconio', 'lija', '(largo + largo * num_entrepanos + largo * 0.5 + num_pozuelos + num_poz_redondo + (num_puertas + torre_cajones * cajones_por_division) / 2) / 4', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'insumos', 24, 'Grata tela grano 36', 'grata', '(largo + largo * num_entrepanos + largo * 0.5 + num_pozuelos + num_poz_redondo + (num_puertas + torre_cajones * cajones_por_division) / 2) / 30', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'insumos', 25, 'Empaque y embalaje', 'empaque', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'addon', 26, 'Push + Grifo + Canastilla', 'push_grifo', 'IF(incluye_push, precio_push + precio_grifo + precio_canastilla, 0)', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'mo', 27, 'MO Acero mesón y cuerpo', 'mo_acero_meson', 'largo + alto * 2', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'mo', 28, 'MO Acero entrepaño', 'mo_acero_entrepano', 'num_entrepanos * (largo - largo_cajon * torre_cajones)', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'mo', 29, 'MO Acero pozuelos', 'mo_acero_pozuelos', 'num_pozuelos + num_poz_redondo', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'mo', 30, 'MO Pulido', 'mo_pulido', '(largo + alto * 2) + num_entrepanos * (largo - largo_cajon * torre_cajones) + (num_pozuelos + num_poz_redondo)', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'mo', 31, 'MO Puertas', 'mo_puertas', 'num_puertas', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'mo', 32, 'MO Cajones', 'mo_cajones', 'torre_cajones * cajones_por_division', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'mo', 33, 'MO Poz Profundo', 'mo_poz_profundo', 'IF(poz_alto > 0.24, num_pozuelos * poz_alto * 100 * 1000 * 1.11, 0)', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'mo', 34, 'MO Instalación', 'mo_instalacion', 'IF(instalado, IF(largo < 1, 1, largo), 0)', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'transporte', 35, 'TTE Elementos', 'tte_elementos', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'transporte', 36, 'TTE Personal Ida', 'tte_ida', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'transporte', 37, 'TTE Personal Regreso', 'tte_regreso', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'laser', 38, 'Corte láser', 'laser', 'ROUNDUP(largo + largo * num_entrepanos + num_pozuelos + num_puertas / 2 + torre_cajones * cajones_por_division, 0) * 1.15', 0, NULL, NULL, NULL),
  ('353cf35e-9806-49c7-854b-3d89c25d31e5', 'poliza', 39, 'Póliza', NULL, '1', 0, 'poliza', NULL, NULL);


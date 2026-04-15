-- ============================================================
-- PRODUCTO: Pozuelo Solo
-- ID: 8b1cd428-c583-44cb-8cdd-7ef00314c71a
-- Grupo: accesorios
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = '8b1cd428-c583-44cb-8cdd-7ef00314c71a';
DELETE FROM producto_lineas_apu WHERE producto_id = '8b1cd428-c583-44cb-8cdd-7ef00314c71a';
DELETE FROM producto_materiales WHERE producto_id = '8b1cd428-c583-44cb-8cdd-7ef00314c71a';
DELETE FROM producto_variables WHERE producto_id = '8b1cd428-c583-44cb-8cdd-7ef00314c71a';
DELETE FROM productos_catalogo WHERE id = '8b1cd428-c583-44cb-8cdd-7ef00314c71a';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'Pozuelo Solo', 'accesorios', 38, '[instalado:Suministro e instalación de|Suministro de] pozuelo quirúrgico independiente en acero inoxidable AISI 304 mate calibre 18 de {largo} m de largo x {ancho} m de ancho x {alto} m de alto, con 8 dobleces perimetrales para refuerzo estructural, {troquel_agua} troquel(es) para desagüe de agua, babero frontal en acero inoxidable 304, soldadura TIG con gas argón continua, acabado pulido sanitario grado quirúrgico, apto para uso hospitalario en quirófanos y áreas estériles. [poliza:Incluye póliza.|Sin póliza.]', true, 20);

-- producto_variables (7)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'largo', 'Largo Pozuelo', 'numero', '0.44', 0.2, 2, NULL, 'Dimensiones', 1, NULL, NULL),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'ancho', 'Ancho Pozuelo', 'numero', '0.44', 0.2, 2, NULL, 'Dimensiones', 2, NULL, NULL),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'alto', 'Alto Pozuelo', 'numero', '0.2', 0.1, 0.5, NULL, 'Dimensiones', 3, NULL, NULL),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'troquel_agua', '# Troquel Agua', 'numero', '1', 0, 4, NULL, 'Configuración', 4, NULL, NULL),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'instalado', 'Incluye Instalación', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 5, NULL, NULL),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'poliza', 'Requiere Póliza', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 6, NULL, NULL),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'poliza_pct', 'Póliza %', 'numero', '2', 1, 10, NULL, 'Extras', 7, NULL, NULL);

-- producto_materiales (12)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'acero_pozuelo', 'Acero de pozuelo cal 16', false, NULL, 'm²', 'AILA010116'),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'dobles', 'Dobles', true, 500, 'und', ''),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'troquel', 'Troquel agua', true, 15000, 'und', ''),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'argon', 'Argón', true, 15000, 'und', ''),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'abrasivos', 'Abrasivos', true, 10000, 'und', ''),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'mo_soldadura', 'MO Soldadura', true, 90000, 'und', ''),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'mo_pulido', 'MO Pulido', true, 50000, 'und', ''),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'mo_instalacion', 'MO Instalación', true, 30000, 'und', ''),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'tte_elementos', 'TTE Elementos', true, 40000, 'und', ''),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'tte_ida', 'TTE Personal Ida', true, 0, 'und', ''),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'tte_regreso', 'TTE Personal Regreso', true, 0, 'und', ''),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'laser', 'Corte láser', true, 6500, 'und', '');

-- producto_lineas_apu (13)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'insumos', 1, 'Acero de pozuelo cal 16', 'acero_pozuelo', '(alto + largo + alto + 0.05) * (alto + ancho + alto + 0.05)', 0, NULL, NULL, NULL),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'insumos', 2, 'Dobles perimetrales', 'dobles', '8', 0, NULL, NULL, NULL),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'insumos', 3, 'Troquel agua', 'troquel', 'troquel_agua', 0, NULL, NULL, NULL),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'insumos', 4, 'Argón', 'argon', '1 + largo', 0, NULL, NULL, NULL),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'insumos', 5, 'Abrasivos', 'abrasivos', '1 + largo', 0, NULL, NULL, NULL),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'mo', 6, 'MO Soldadura', 'mo_soldadura', '1 + largo', 0, NULL, NULL, NULL),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'mo', 7, 'MO Pulido', 'mo_pulido', '1 + largo', 0, NULL, NULL, NULL),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'mo', 8, 'MO Instalación', 'mo_instalacion', 'IF(instalado, IF(largo < 1, 1, largo), 0)', 0, NULL, NULL, NULL),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'transporte', 9, 'TTE Elementos', 'tte_elementos', '1 + largo', 0, NULL, NULL, NULL),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'transporte', 10, 'TTE Personal Ida', 'tte_ida', '1 + largo', 0, NULL, NULL, NULL),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'transporte', 11, 'TTE Personal Regreso', 'tte_regreso', '1 + largo', 0, NULL, NULL, NULL),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'laser', 12, 'Corte láser', 'laser', 'largo * 6', 0, NULL, NULL, NULL),
  ('8b1cd428-c583-44cb-8cdd-7ef00314c71a', 'poliza', 13, 'Póliza', NULL, '1', 0, 'poliza', NULL, NULL);


-- ============================================================
-- PRODUCTO: Deslizador Bandejas
-- ID: b00a14b6-9283-4218-8205-ac9e1282a238
-- Grupo: autoservicios
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = 'b00a14b6-9283-4218-8205-ac9e1282a238';
DELETE FROM producto_lineas_apu WHERE producto_id = 'b00a14b6-9283-4218-8205-ac9e1282a238';
DELETE FROM producto_materiales WHERE producto_id = 'b00a14b6-9283-4218-8205-ac9e1282a238';
DELETE FROM producto_variables WHERE producto_id = 'b00a14b6-9283-4218-8205-ac9e1282a238';
DELETE FROM productos_catalogo WHERE id = 'b00a14b6-9283-4218-8205-ac9e1282a238';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'Deslizador Bandejas', 'autoservicios', 38, '[instalado:Suministro e instalación de|Suministro de] deslizador de bandejas en acero inoxidable, estructura en tubo cuadrado 1-1/4 pulg cal 18, {num_tubos} tubos de {longitud} m de longitud, {num_pieamigos} pieamigos en lámina AISI 304 cal 14, fijación a muro o mueble con tornillería. Soldadura TIG, acabado pulido. [poliza:Incluye póliza.|Sin póliza.]', true, 35);

-- producto_variables (6)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'longitud', 'Longitud', 'numero', '2', 0.5, 5, NULL, 'Dimensiones', 1, NULL, NULL),
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'num_pieamigos', '# Pieamigos', 'numero', '3', 1, 8, NULL, 'Estructura', 2, NULL, NULL),
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'num_tubos', '# Tubos', 'numero', '4', 2, 8, NULL, 'Estructura', 3, NULL, NULL),
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'instalado', 'Incluye Instalación', 'toggle', 'true', NULL, NULL, NULL, 'Extras', 4, NULL, NULL),
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'poliza', 'Requiere Póliza', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 5, NULL, NULL),
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'poliza_pct', 'Póliza %', 'numero', '2', 1, 10, NULL, 'Extras', 6, NULL, NULL);

-- producto_materiales (11)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'tubo', 'Tubo 1-1/4 cal 18', false, NULL, 'ml', 'AITC170015'),
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'tapas', 'Tapas de tubos', true, 1500, 'und', ''),
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'pieamigos', 'Pieamigos lámina cal 14', false, NULL, 'm²', 'AILA010114'),
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'tornillos', 'Tornillería a muro', true, 800, 'und', ''),
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'mo_soldadura', 'MO Soldadura', true, 21090, 'und', ''),
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'mo_pulido', 'MO Pulido', true, 12210, 'und', ''),
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'mo_instalacion', 'MO Instalación', true, 88800, 'und', ''),
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'tte_elementos', 'TTE Elementos', true, 30000, 'und', ''),
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'tte_ida', 'TTE Personal Ida', true, 15000, 'und', ''),
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'tte_regreso', 'TTE Personal Regreso', true, 0, 'und', ''),
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'laser', 'Corte láser', true, 6500, 'und', '');

-- producto_lineas_apu (12)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'insumos', 1, 'Tubo 1-1/4 cal 18', 'tubo', 'longitud * num_tubos', 0, NULL, NULL, NULL),
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'insumos', 2, 'Tapas de tubos', 'tapas', 'num_tubos * num_tubos / 2', 0, NULL, NULL, NULL),
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'insumos', 3, 'Pieamigos lámina cal 14', 'pieamigos', 'num_pieamigos * (0.45 * 0.35 / 2) * 1.05', 0, NULL, NULL, NULL),
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'insumos', 4, 'Tornillería a muro', 'tornillos', 'num_pieamigos * 2', 0, NULL, NULL, NULL),
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'mo', 5, 'MO Soldadura', 'mo_soldadura', 'longitud * num_tubos', 0, NULL, NULL, NULL),
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'mo', 6, 'MO Pulido', 'mo_pulido', 'longitud * num_tubos', 0, NULL, NULL, NULL),
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'mo', 7, 'MO Instalación', 'mo_instalacion', 'IF(instalado, 1, 0)', 0, NULL, NULL, NULL),
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'transporte', 8, 'TTE Elementos', 'tte_elementos', 'IF(instalado, 1, 0)', 0, NULL, NULL, NULL),
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'transporte', 9, 'TTE Personal Ida', 'tte_ida', 'IF(instalado, 1, 0)', 0, NULL, NULL, NULL),
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'transporte', 10, 'TTE Personal Regreso', 'tte_regreso', '0', 0, NULL, NULL, NULL),
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'laser', 11, 'Corte láser', 'laser', 'num_tubos', 0, NULL, NULL, NULL),
  ('b00a14b6-9283-4218-8205-ac9e1282a238', 'poliza', 12, 'Póliza', NULL, '1', 0, 'poliza', NULL, NULL);


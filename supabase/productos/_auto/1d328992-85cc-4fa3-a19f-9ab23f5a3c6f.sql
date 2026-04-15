-- ============================================================
-- PRODUCTO: Mueble Superior
-- ID: 1d328992-85cc-4fa3-a19f-9ab23f5a3c6f
-- Grupo: muebles
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = '1d328992-85cc-4fa3-a19f-9ab23f5a3c6f';
DELETE FROM producto_lineas_apu WHERE producto_id = '1d328992-85cc-4fa3-a19f-9ab23f5a3c6f';
DELETE FROM producto_materiales WHERE producto_id = '1d328992-85cc-4fa3-a19f-9ab23f5a3c6f';
DELETE FROM producto_variables WHERE producto_id = '1d328992-85cc-4fa3-a19f-9ab23f5a3c6f';
DELETE FROM productos_catalogo WHERE id = '1d328992-85cc-4fa3-a19f-9ab23f5a3c6f';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'Mueble Superior', 'muebles', 38, '[instalado:Suministro e instalación de|Suministro de] mueble superior (gabinete aéreo) en acero inoxidable AISI 304, de {largo} m de largo x {ancho} m de ancho x {alto} m de alto, cuerpo en lámina cal.18 satinado, {num_entrepanos} entrepaño(s) interno(s) cal.18 satinado, {num_puertas} puertas entamboradas cal.20 satinado con bisagras mariposa y manija tipo Roma, [vidrio_puertas:con vidrio templado 5mm en puertas, |sin vidrio en puertas, ]{num_divisiones} división(es) interna(s), [tiene_chapa:con chapa Yale y pasador inox, |sin chapa, ]fijación a muro mediante chapetas en acero inox, soldadura TIG con argón, acabado pulido satinado. [poliza:Incluye póliza.|Sin póliza.]', true, 38);

-- producto_variables (11)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'largo', 'Largo', 'numero', '3', 0.5, 5, NULL, 'Dimensiones', 1, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'ancho', 'Ancho', 'numero', '0.35', 0.2, 0.8, NULL, 'Dimensiones', 2, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'alto', 'Alto', 'numero', '0.7', 0.3, 1.5, NULL, 'Dimensiones', 3, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'num_puertas', '# Puertas', 'numero', '8', 1, 12, NULL, 'Configuración', 4, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'num_divisiones', '# Divisiones', 'numero', '2', 0, 6, NULL, 'Configuración', 5, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'num_entrepanos', '# Entrepaños', 'numero', '1', 0, 6, NULL, 'Configuración', 6, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'vidrio_puertas', 'Vidrio Templado en Puertas', 'toggle', 'true', NULL, NULL, NULL, 'Configuración', 7, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'tiene_chapa', 'Tiene Chapa', 'toggle', 'true', NULL, NULL, NULL, 'Configuración', 8, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'instalado', 'Incluye Instalación', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 9, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'poliza', 'Requiere Póliza', 'toggle', 'false', NULL, NULL, NULL, 'Extras', 10, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'poliza_pct', 'Póliza %', 'numero', '2', 1, 10, NULL, 'Extras', 11, NULL, NULL);

-- producto_materiales (29)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'acero_cuerpo', 'Acero cuerpo cal 18 sat', false, NULL, 'm²', 'AILA010218'),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'acero_omegas', 'Acero omegas cal 18 2B', false, NULL, 'm²', 'AILA010118'),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'acero_entrepano', 'Acero entrepaño cal 18 sat', false, NULL, 'm²', 'AILA010218'),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'acero_puerta', 'Acero puerta entamborada cal 20', false, NULL, 'm²', 'AILA010220'),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'acero_divisiones', 'Acero divisiones cal 20', false, NULL, 'm²', 'AILA010220'),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'chapeta', 'Chapeta fijación', true, 4000, 'und', ''),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'tornillos', 'Tornillos', true, 800, 'und', ''),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'vidrio', 'Vidrio templado 5mm', false, NULL, 'm²', 'VIIN100005'),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'icopor', 'Icopor 25mm', false, NULL, 'm²', 'FEOM060025'),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'cinta', 'Cinta 3M', true, 11500, 'ml', ''),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'bisagras', 'Bisagras mariposa', true, 28000, 'und', ''),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'manija', 'Manija tipo Roma', false, NULL, 'und', 'FEMA011508'),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'chapa', 'Chapa Yale', false, NULL, 'und', 'FECH010101'),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'pasador', 'Pasador inox', false, NULL, 'und', 'FEPA010100'),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'argon', 'Argón', true, 6000, 'und', ''),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'disco_corte', 'Disco de corte', false, NULL, 'und', 'ABDI100124'),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'disco_flap', 'Disco flap', false, NULL, 'und', 'ABDI802060'),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'pano', 'Paño Scotch Brite', false, NULL, 'und', 'ABPA020001'),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'lija', 'Lija zirconio', false, NULL, 'und', 'ABLI202080'),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'grata', 'Grata', false, NULL, 'und', 'ABGR200019'),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'empaque', 'Empaque y embalaje', true, 8000, 'und', ''),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'mo_acero', 'MO Acero', true, 27750, 'und', ''),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'mo_pulido', 'MO Pulido', true, 21090, 'und', ''),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'mo_puertas', 'MO Puertas', true, 7770, 'und', ''),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'mo_instalacion', 'MO Instalación', true, 38850, 'und', ''),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'tte_elementos', 'TTE Elementos', true, 10000, 'und', ''),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'tte_ida', 'TTE Personal Ida', true, 0, 'und', ''),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'tte_regreso', 'TTE Personal Regreso', true, 5000, 'und', ''),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'laser', 'Corte láser', true, 6500, 'und', '');

-- producto_lineas_apu (30)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'insumos', 1, 'Acero cuerpo cal 18 sat', 'acero_cuerpo', '(largo + 0.04) * (alto + 0.04) + (ancho + 0.04) * (alto + 0.04) * 2 + (largo + 0.1) * (ancho + 0.1) * 2', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'insumos', 2, 'Acero omegas cal 18 2B', 'acero_omegas', '0.15 * largo', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'insumos', 3, 'Acero entrepaño cal 18 sat', 'acero_entrepano', '(largo + 0.1) * (ancho + 0.1 - 0.05) * num_entrepanos + 0.15 * (largo + ancho * 2) * num_entrepanos', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'insumos', 4, 'Acero puerta entamborada cal 20', 'acero_puerta', '(largo + (num_puertas * 0.03) + 0.04) * (alto + 0.04) * 2', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'insumos', 5, 'Acero divisiones cal 20', 'acero_divisiones', '(ancho + 0.04) * (alto + 0.04) * num_divisiones', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'insumos', 6, 'Chapeta fijación', 'chapeta', 'ROUNDUP(largo / 0.5 + 2, 0)', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'insumos', 7, 'Tornillos', 'tornillos', 'ROUNDUP(largo / 0.5 + 2, 0) * 2', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'insumos', 8, 'Vidrio templado 5mm', 'vidrio', 'IF(vidrio_puertas, ((largo / num_puertas) - 0.1) * (alto - 0.1) * num_puertas, 0)', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'insumos', 9, 'Icopor 25mm', 'icopor', 'largo * alto', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'insumos', 10, 'Cinta 3M', 'cinta', 'largo + largo * num_entrepanos', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'insumos', 11, 'Bisagras mariposa', 'bisagras', 'num_puertas * 2', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'insumos', 12, 'Manija tipo Roma', 'manija', 'num_puertas', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'insumos', 13, 'Chapa Yale', 'chapa', 'IF(tiene_chapa, num_puertas / 2, 0)', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'insumos', 14, 'Pasador inox', 'pasador', 'IF(tiene_chapa, num_puertas / 2, 0)', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'insumos', 15, 'Argón', 'argon', 'largo + largo * num_entrepanos + largo * 0.5 + num_puertas / 2', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'insumos', 16, 'Disco de corte', 'disco_corte', '(largo + largo * num_entrepanos + largo * 0.5 + num_puertas / 2) / 3', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'insumos', 17, 'Disco flap', 'disco_flap', '(largo + largo * num_entrepanos + largo * 0.5 + num_puertas / 2) / 8', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'insumos', 18, 'Paño Scotch Brite', 'pano', '(largo + largo * num_entrepanos + largo * 0.5 + num_puertas / 2) / 3', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'insumos', 19, 'Lija zirconio', 'lija', '(largo + largo * num_entrepanos + largo * 0.5 + num_puertas / 2) / 4', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'insumos', 20, 'Grata', 'grata', '(largo + largo * num_entrepanos + largo * 0.5 + num_puertas / 2) / 30', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'insumos', 21, 'Empaque y embalaje', 'empaque', 'largo', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'mo', 22, 'MO Acero', 'mo_acero', 'largo + largo * num_entrepanos + largo * 0.5', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'mo', 23, 'MO Pulido', 'mo_pulido', 'largo + largo * num_entrepanos + largo * 0.5', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'mo', 24, 'MO Puertas', 'mo_puertas', 'num_puertas', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'mo', 25, 'MO Instalación', 'mo_instalacion', 'IF(instalado, largo, 0)', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'transporte', 26, 'TTE Elementos', 'tte_elementos', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'transporte', 27, 'TTE Personal Ida', 'tte_ida', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'transporte', 28, 'TTE Personal Regreso', 'tte_regreso', 'IF(largo < 1, 1, largo)', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'laser', 29, 'Corte láser', 'laser', 'ROUNDUP(largo + largo * num_entrepanos + num_puertas / 2, 0)', 0, NULL, NULL, NULL),
  ('1d328992-85cc-4fa3-a19f-9ab23f5a3c6f', 'poliza', 30, 'Póliza', NULL, '1', 0, 'poliza', NULL, NULL);


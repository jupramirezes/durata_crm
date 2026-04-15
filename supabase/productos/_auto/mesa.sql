-- ============================================================
-- PRODUCTO: Mesa en acero inoxidable
-- ID: mesa
-- Grupo: Mesas
-- Dump automático desde Supabase (2026-04-15)
-- NO editar manualmente — regenerar con: node scripts/_dump-productos.mjs
-- ============================================================

-- Limpiar datos previos del producto
DELETE FROM tarifas_mo_producto WHERE producto_id = 'mesa';
DELETE FROM producto_lineas_apu WHERE producto_id = 'mesa';
DELETE FROM producto_materiales WHERE producto_id = 'mesa';
DELETE FROM producto_variables WHERE producto_id = 'mesa';
DELETE FROM productos_catalogo WHERE id = 'mesa';

-- productos_catalogo
INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, desc_template, activo, orden) VALUES
  ('mesa', 'Mesa en acero inoxidable', 'Mesas', 0.38, NULL, true, 1);

-- producto_variables (34)
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones, nota) VALUES
  ('mesa', 'largo', 'Largo (m)', 'numero', '2', 0.3, 5, 'm', 'Dimensiones principales', 10, NULL, NULL),
  ('mesa', 'ancho', 'Ancho (m)', 'numero', '0.7', 0.3, 2, 'm', 'Dimensiones principales', 11, NULL, NULL),
  ('mesa', 'alto', 'Alto (m)', 'numero', '0.9', 0.5, 1.5, 'm', 'Dimensiones principales', 12, NULL, NULL),
  ('mesa', 'desarrollo_omegas', 'Desarrollo omegas (m)', 'numero', '0.15', 0.1, 0.2, 'm', 'Dimensiones principales', 13, NULL, NULL),
  ('mesa', 'tipo_acero', 'Tipo de acero', 'seleccion', '304', NULL, NULL, NULL, 'Material', 20, '["304","430"]'::jsonb, NULL),
  ('mesa', 'acabado', 'Acabado', 'seleccion', 'MATE', NULL, NULL, NULL, 'Material', 21, '["MATE","BRILLANTE","SATINADO"]'::jsonb, NULL),
  ('mesa', 'calibre', 'Calibre', 'seleccion', '18', NULL, NULL, NULL, 'Material', 22, '["14","16","18","20"]'::jsonb, NULL),
  ('mesa', 'salp_longitudinal', 'Salpicaderos longitudinales', 'numero', '1', 0, 2, 'und', 'Salpicaderos', 30, NULL, NULL),
  ('mesa', 'salp_costado', 'Salpicaderos costado', 'numero', '1', 0, 2, 'und', 'Salpicaderos', 31, NULL, NULL),
  ('mesa', 'alto_salpicadero', 'Alto salpicadero (m)', 'numero', '0.10', 0, 0.3, 'm', 'Salpicaderos', 32, NULL, NULL),
  ('mesa', 'babero', 'Babero', 'toggle', '1', NULL, NULL, NULL, 'Babero', 40, NULL, NULL),
  ('mesa', 'alto_babero', 'Alto babero (m)', 'numero', '0.25', 0.05, 0.3, 'm', 'Babero', 41, NULL, NULL),
  ('mesa', 'babero_costados', 'Baberos en costados', 'numero', '0', 0, 2, 'und', 'Babero', 42, NULL, NULL),
  ('mesa', 'entrepanos', 'Entrepaños', 'numero', '1', 0, 3, 'und', 'Entrepaños y soporte', 50, NULL, NULL),
  ('mesa', 'patas', 'Patas (calculado)', 'calculado', '4+2*max(0,ceil((largo-2)/2))', NULL, NULL, NULL, 'Entrepaños y soporte', 51, NULL, NULL),
  ('mesa', 'ruedas', 'Ruedas (en vez de niveladores)', 'toggle', '0', NULL, NULL, NULL, 'Entrepaños y soporte', 52, NULL, NULL),
  ('mesa', 'num_ruedas', 'Número de ruedas', 'numero', '4', 4, 8, 'und', 'Entrepaños y soporte', 53, NULL, NULL),
  ('mesa', 'refuerzo_rh', 'Refuerzo RH', 'toggle', '0', NULL, NULL, NULL, 'Refuerzo', 55, NULL, NULL),
  ('mesa', 'pozuelos_rect', 'Pozuelos rectangulares', 'numero', '1', 0, 3, 'und', 'Pozuelos', 60, NULL, NULL),
  ('mesa', 'poz_largo', 'Largo pozuelo (m)', 'numero', '0.54', 0.3, 0.8, 'm', 'Pozuelos', 61, NULL, NULL),
  ('mesa', 'poz_ancho', 'Ancho pozuelo (m)', 'numero', '0.39', 0.25, 0.6, 'm', 'Pozuelos', 62, NULL, NULL),
  ('mesa', 'poz_alto', 'Alto pozuelo (m)', 'numero', '0.18', 0.1, 0.4, 'm', 'Pozuelos', 63, NULL, NULL),
  ('mesa', 'pozuelo_redondo', 'Pozuelos redondos', 'numero', '1', 0, 2, 'und', 'Pozuelos', 64, NULL, NULL),
  ('mesa', 'escabiladero', 'Escabiladero', 'toggle', '0', NULL, NULL, NULL, 'Escabiladero', 70, NULL, NULL),
  ('mesa', 'cant_bandejeros', 'Cantidad bandejeros', 'numero', '3', 2, 8, 'und', 'Escabiladero', 71, NULL, NULL),
  ('mesa', 'vertedero', 'Vertederos', 'numero', '0', 0, 2, 'und', 'Vertedero', 80, NULL, NULL),
  ('mesa', 'diametro_vertedero', 'Diámetro vertedero (m)', 'numero', '0.45', 0.2, 0.6, 'm', 'Vertedero', 81, NULL, NULL),
  ('mesa', 'prof_vertedero', 'Profundidad vertedero (m)', 'numero', '0.50', 0.3, 0.8, 'm', 'Vertedero', 82, NULL, NULL),
  ('mesa', 'poliza', 'Incluir póliza', 'toggle', '0', NULL, NULL, NULL, 'Extras y parámetros', 90, NULL, NULL),
  ('mesa', 'instalado', 'Incluir instalación', 'toggle', '1', NULL, NULL, NULL, 'Extras y parámetros', 91, NULL, NULL),
  ('mesa', 'push_pedal', 'Push pedal (grifo + canastilla)', 'toggle', '0', NULL, NULL, NULL, 'Extras y parámetros', 92, NULL, NULL),
  ('mesa', 'tornillos_por_m', 'Tornillos por metro', 'calculado', '4', NULL, NULL, NULL, '_constantes', 900, NULL, NULL),
  ('mesa', 'pl285_m2_galon', 'm² por galón PL-285', 'calculado', '4', NULL, NULL, NULL, '_constantes', 901, NULL, NULL),
  ('mesa', 'metros_rollo_cinta', 'Metros por rollo cinta', 'calculado', '32', NULL, NULL, NULL, '_constantes', 902, NULL, NULL);

-- producto_materiales (28)
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, unidad, codigo) VALUES
  ('mesa', 'lamina_mesa', 'LAMINA LISA ACERO INOXIDABLE {tipo_acero} {acabado} CAL {calibre}', false, NULL, NULL, 'AILA010118'),
  ('mesa', 'lamina_babero', 'LAMINA LISA ACERO INOXIDABLE {tipo_acero} SATINADO CAL 20', false, NULL, NULL, 'AILA010220'),
  ('mesa', 'lamina_pozuelo', 'LAMINA LISA ACERO INOXIDABLE {tipo_acero} {acabado} CAL {calibre}', false, NULL, NULL, 'AILA010118'),
  ('mesa', 'lamina_vertedero', 'LAMINA LISA ACERO INOXIDABLE {tipo_acero} {acabado} CAL 16', false, NULL, NULL, 'AILA010116'),
  ('mesa', 'tubo_patas', 'TUBO ACERO INOXIDABLE CUADRADO 1 1/2 CAL 16', false, NULL, NULL, 'AITC180016'),
  ('mesa', 'niveladores', 'NIVELADOR NACIONAL INOX CUADRADO 1 1/2', false, NULL, NULL, 'FENI010118'),
  ('mesa', 'pozuelo_redondo', 'POZUELO INOX REDONDO 37', false, NULL, NULL, 'FEPO010137'),
  ('mesa', 'rh_15mm', 'MADERA RH AGLOMERADO 15 MM', false, NULL, NULL, 'FEOM090015'),
  ('mesa', 'tornillos', 'TORNILLO INOX AVELLANADO 12 X 2', false, NULL, NULL, 'TRTI011219'),
  ('mesa', 'cinta_3m', 'CINTA 3M ACERO', false, NULL, NULL, 'FEOM040501'),
  ('mesa', 'pl285', 'PEGA PL 285', false, NULL, NULL, 'FEOM120100'),
  ('mesa', 'tubo_vertedero', 'TUBO ACERO INOXIDABLE CUADRADO 3 CAL 16', false, NULL, NULL, 'AITC210016'),
  ('mesa', 'disco_corte', 'DISCOS CORTE 4 1/2', false, NULL, NULL, 'ABDI100124'),
  ('mesa', 'disco_flap', 'DISCOS FLAP INOX 4 1/2 GRANO 60', false, NULL, NULL, 'ABDI802060'),
  ('mesa', 'pano', 'PAÑO SCOTCH BRITE 3M', false, NULL, NULL, 'ABPA020001'),
  ('mesa', 'lija', 'LIJA ZC INOX GRANO 80', false, NULL, NULL, 'ABLI202080'),
  ('mesa', 'grata', 'GRATA ALAMBRE INOX 2', false, NULL, NULL, 'ABGR200019'),
  ('mesa', 'angulo_escab', 'ANGULO ACERO INOXIDABLE 1 1/2 x 1/8', false, NULL, NULL, 'AIAG03002'),
  ('mesa', 'ruedas_3', 'RUEDAS INOX CON FRENO 3', false, NULL, NULL, 'FERU010121'),
  ('mesa', 'argon', 'ARGÓN', true, 4000, NULL, NULL),
  ('mesa', 'empaque', 'EMPAQUE', true, 3500, NULL, NULL),
  ('mesa', 'platina_ruedas', 'PLATINA RUEDAS', true, 12270, NULL, NULL),
  ('mesa', 'laser', 'CORTE LÁSER', true, 6500, NULL, NULL),
  ('mesa', 'grifo', 'GRIFO', true, 74000, NULL, NULL),
  ('mesa', 'tte_elementos', 'TRANSPORTE ELEMENTOS', true, 15000, NULL, NULL),
  ('mesa', 'tte_regreso', 'TRANSPORTE REGRESO', true, 5000, NULL, NULL),
  ('mesa', 'push_pedal_item', 'PUSH PEDAL', true, 348000, NULL, NULL),
  ('mesa', 'canastilla', 'CANASTILLA', true, 24000, NULL, NULL);

-- producto_lineas_apu (38)
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion, margen_override, nota) VALUES
  ('mesa', 'transporte', 1, 'Transporte elementos', 'tte_elementos', 'max(largo, 1)', 0, NULL, NULL, NULL),
  ('mesa', 'insumos', 1, 'Acero mesa (superficie + salpicaderos)', 'lamina_mesa', '(largo+0.12)*(ancho+0.12)+((alto_salpicadero+0.04)*salp_longitudinal*largo+(alto_salpicadero+0.04)*salp_costado*ancho)', 0, NULL, NULL, NULL),
  ('mesa', 'addon', 1, 'Push pedal', 'push_pedal_item', '1', 0, 'push_pedal == 1', 0.2, NULL),
  ('mesa', 'mo', 1, 'MO Acero (soldadura TIG)', 'MO_ACERO', 'largo + pozuelos_rect + pozuelo_redondo + entrepanos*largo + (escabiladero)*(ancho*2)', 0, NULL, NULL, NULL),
  ('mesa', 'poliza', 1, 'Póliza todo riesgo', '', '1', 0, 'poliza == 1', NULL, 'Precio = 2% del costo total antes de póliza'),
  ('mesa', 'laser', 1, 'Corte láser', 'laser', 'ceil(largo + pozuelos_rect + pozuelo_redondo + vertedero + largo*entrepanos)', 0, NULL, NULL, NULL),
  ('mesa', 'addon', 2, 'Grifo', 'grifo', '1', 0, 'push_pedal == 1', 0.2, NULL),
  ('mesa', 'mo', 2, 'MO Pulido', 'MO_PULIDO', 'largo + pozuelos_rect + pozuelo_redondo + entrepanos*largo + (escabiladero)*(ancho*2)', 0, NULL, NULL, NULL),
  ('mesa', 'transporte', 2, 'Transporte personal regreso', 'tte_regreso', 'max(largo, 1)', 0, NULL, NULL, NULL),
  ('mesa', 'insumos', 2, 'Omegas mesa', 'lamina_mesa', '(1 - refuerzo_rh) * (desarrollo_omegas*largo*ceil(ancho/0.6) + desarrollo_omegas*ancho*(ceil(largo/2) + 2*(pozuelos_rect+pozuelo_redondo)) + 0.078*(salp_longitudinal*largo+salp_costado*ancho))', 0, NULL, NULL, NULL),
  ('mesa', 'addon', 3, 'Canastilla', 'canastilla', '1', 0, 'push_pedal == 1', 0.2, NULL),
  ('mesa', 'insumos', 3, 'Entrepaño', 'lamina_mesa', '(largo+0.12)*(ancho+0.12)*entrepanos', 0, 'entrepanos > 0', NULL, NULL),
  ('mesa', 'mo', 3, 'MO Patas', 'MO_PATAS', 'patas', 0, NULL, NULL, NULL),
  ('mesa', 'insumos', 4, 'Babero satinado', 'lamina_babero', '(alto_babero+0.06)*(largo+0.06)*babero + (ancho+0.06)*(alto_babero+0.06)*babero_costados', 0, 'babero == 1', NULL, NULL),
  ('mesa', 'mo', 4, 'MO Pozuelos profundos', 'MO_POZ_PROF', 'pozuelos_rect', 0, 'poz_alto > 0.24', NULL, NULL),
  ('mesa', 'mo', 5, 'MO Vertedero', 'MO_VERTEDERO', 'vertedero', 0, 'vertedero > 0', NULL, NULL),
  ('mesa', 'insumos', 5, 'Pozuelo rectangular', 'lamina_pozuelo', '((poz_largo+poz_alto*2)*poz_ancho + poz_largo*poz_alto*2) * pozuelos_rect', 0.1, 'pozuelos_rect > 0', NULL, NULL),
  ('mesa', 'mo', 6, 'MO Instalación', 'MO_INSTALACION', 'largo', 0, 'instalado == 1', NULL, NULL),
  ('mesa', 'insumos', 6, 'Pozuelo redondo 370mm', 'pozuelo_redondo', 'pozuelo_redondo', 0, 'pozuelo_redondo > 0', NULL, NULL),
  ('mesa', 'insumos', 7, 'Omegas entrepaño', 'lamina_mesa', '(desarrollo_omegas*largo*ceil(ancho/0.6) + desarrollo_omegas*ancho*ceil(largo/2)) * entrepanos', 0, 'entrepanos > 0', NULL, NULL),
  ('mesa', 'insumos', 8, 'Patas (tubo cuadrado)', 'tubo_patas', 'patas*alto + (1 - min(entrepanos, 1))*(largo + ancho*patas/2)', 0.1, NULL, NULL, NULL),
  ('mesa', 'insumos', 9, 'Niveladores', 'niveladores', 'patas', 0, 'ruedas == 0', NULL, NULL),
  ('mesa', 'insumos', 10, 'RH 15mm', 'rh_15mm', 'largo*ancho', 0, 'refuerzo_rh == 1', NULL, NULL),
  ('mesa', 'insumos', 11, 'Tornillos', 'tornillos', 'largo*tornillos_por_m', 0, 'refuerzo_rh == 1', NULL, NULL),
  ('mesa', 'insumos', 12, 'Cinta 3M', 'cinta_3m', 'ceil(((largo*ceil(ancho/0.6) + ancho*(ceil(largo/2) + 2*(pozuelos_rect+pozuelo_redondo))) + (largo*ceil(ancho/0.6) + ancho*ceil(largo/2))*entrepanos) * 2 / metros_rollo_cinta)', 0, 'refuerzo_rh == 0', NULL, NULL),
  ('mesa', 'insumos', 13, 'PL-285 (pegante)', 'pl285', '(largo+0.12)*(ancho+0.12) / pl285_m2_galon', 0, 'refuerzo_rh == 1', NULL, NULL),
  ('mesa', 'insumos', 14, 'Vertedero (lámina)', 'lamina_vertedero', '(diametro_vertedero*pi*prof_vertedero + (0.2*0.2*pi)*2) * vertedero', 0, 'vertedero > 0', NULL, NULL),
  ('mesa', 'insumos', 15, 'Tubo vertedero', 'tubo_vertedero', '0.25*vertedero', 0, 'vertedero > 0', NULL, NULL),
  ('mesa', 'insumos', 16, 'Argón', 'argon', 'largo + largo*entrepanos + patas/4 + pozuelos_rect + pozuelo_redondo + vertedero*4', 0, NULL, NULL, NULL),
  ('mesa', 'insumos', 17, 'Disco corte', 'disco_corte', '(largo + largo*entrepanos + patas/4 + pozuelos_rect + pozuelo_redondo + vertedero*4) / 3', 0, NULL, NULL, NULL),
  ('mesa', 'insumos', 18, 'Disco flap', 'disco_flap', '(largo + largo*entrepanos + patas/4 + pozuelos_rect + pozuelo_redondo + vertedero*4) / 8', 0, NULL, NULL, NULL),
  ('mesa', 'insumos', 19, 'Paño Scotch Brite', 'pano', '(largo + largo*entrepanos + patas/4 + pozuelos_rect + pozuelo_redondo + vertedero*4) / 3', 0, NULL, NULL, NULL),
  ('mesa', 'insumos', 20, 'Lija', 'lija', '(largo + largo*entrepanos + patas/4 + pozuelos_rect + pozuelo_redondo + vertedero*4) / 4', 0, NULL, NULL, NULL),
  ('mesa', 'insumos', 21, 'Grata alambre', 'grata', '(largo + largo*entrepanos + patas/4 + pozuelos_rect + pozuelo_redondo + vertedero*4) / 30', 0, NULL, NULL, NULL),
  ('mesa', 'insumos', 22, 'Empaque', 'empaque', 'largo', 0, NULL, NULL, NULL),
  ('mesa', 'insumos', 23, 'Platina ruedas', 'platina_ruedas', 'patas', 0, 'ruedas == 1', NULL, NULL),
  ('mesa', 'insumos', 24, 'Ruedas 3"', 'ruedas_3', 'num_ruedas', 0, 'ruedas == 1', NULL, NULL),
  ('mesa', 'insumos', 25, 'Ángulos escabiladero', 'angulo_escab', 'cant_bandejeros*2*ancho + 0.5', 0, 'escabiladero == 1', NULL, NULL);

-- tarifas_mo_producto (6)
INSERT INTO tarifas_mo_producto (producto_id, codigo, descripcion, precio, unidad) VALUES
  ('mesa', 'MO_ACERO', 'MO Acero (soldadura TIG)', 30000, 'ml'),
  ('mesa', 'MO_PULIDO', 'MO Pulido', 23000, 'ml'),
  ('mesa', 'MO_PATAS', 'MO Postura y pulida de patas', 10000, 'und'),
  ('mesa', 'MO_POZ_PROF', 'MO Pozuelos profundos', 20160, 'und'),
  ('mesa', 'MO_VERTEDERO', 'MO Vertedero', 60000, 'und'),
  ('mesa', 'MO_INSTALACION', 'MO Instalación', 22200, 'ml');


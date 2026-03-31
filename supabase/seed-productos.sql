-- ============================================================
-- SEED: Productos verificados del motor genérico
-- ============================================================
-- Productos canónicos con datos verificados contra APU real.
-- Precios esperados (con margen 38%, sin instalación, sin póliza):
--   Mesa base 2.00x0.70x0.90:        ~$2,074,000
--   Cárcamo 1.00x0.25x0.095:         ~$587,000
--   Estantería 2.00x0.65x1.80 5ent:  ~$4,068,000
--
-- IMPORTANTE: Ejecutar DESPUÉS de schema-motor-generico.sql
-- ============================================================

-- ════════════════════════════════════════════════════════════
-- MESA (producto canónico — datos del test de paridad)
-- ════════════════════════════════════════════════════════════

INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, activo, orden)
VALUES ('mesa', 'Mesa', 'Mesas', 0.38, true, 1)
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, grupo = EXCLUDED.grupo, margen_default = EXCLUDED.margen_default, activo = EXCLUDED.activo, orden = EXCLUDED.orden;

-- Variables
DELETE FROM producto_variables WHERE producto_id = 'mesa';
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones) VALUES
  ('mesa', 'largo',             'Largo (m)',              'numero',    '2',     0.6, 4,    'm',   'Dimensiones principales', 10, NULL),
  ('mesa', 'ancho',             'Ancho (m)',              'numero',    '0.7',   0.4, 1.2,  'm',   'Dimensiones principales', 11, NULL),
  ('mesa', 'alto',              'Alto (m)',               'numero',    '0.9',   0.7, 1.1,  'm',   'Dimensiones principales', 12, NULL),
  ('mesa', 'tipo_acero',        'Tipo de acero',          'seleccion', '304',   NULL, NULL, NULL,  'Material', 20, '["304","430"]'),
  ('mesa', 'acabado',           'Acabado',                'seleccion', 'mate',  NULL, NULL, NULL,  'Material', 21, '["mate","satinado","brillante"]'),
  ('mesa', 'calibre',           'Calibre',                'seleccion', '18',    NULL, NULL, NULL,  'Material', 22, '["14","16","18","20"]'),
  ('mesa', 'desarrollo_omegas', 'Desarrollo omegas (m)',  'numero',    '0.15',  0.1, 0.25, 'm',   '_Refuerzo', 30, NULL),
  ('mesa', 'salp_longitudinal', 'Salpicaderos longitudinales', 'numero', '0', 0, 2, 'und', 'Salpicaderos', 40, NULL),
  ('mesa', 'salp_costado',      'Salpicaderos laterales', 'numero',    '0',     0, 2,    'und', 'Salpicaderos', 41, NULL),
  ('mesa', 'alto_salpicadero',  'Alto salpicadero (m)',   'numero',    '0.10',  0.05, 0.25, 'm', 'Salpicaderos', 42, NULL),
  ('mesa', 'babero',            'Babero',                 'toggle',    '0',     NULL, NULL, NULL,  'Babero', 50, NULL),
  ('mesa', 'alto_babero',       'Alto babero (m)',        'numero',    '0.25',  0.1, 0.4,  'm',   'Babero', 51, NULL),
  ('mesa', 'babero_costados',   'Baberos costados',       'numero',    '0',     0, 2,    'und', 'Babero', 52, NULL),
  ('mesa', 'refuerzo_rh',       'Refuerzo RH (vs omegas)','toggle',   '0',     NULL, NULL, NULL,  '_Refuerzo', 31, NULL),
  ('mesa', 'entrepanos',        'Entrepaños',             'numero',    '1',     0, 3,    'und', 'Estructura', 60, NULL),
  ('mesa', 'patas',             'Patas',                  'calculado', '4',     4, 8,    'und', 'Estructura', 61, NULL),
  ('mesa', 'ruedas',            'Lleva ruedas',           'toggle',    '0',     NULL, NULL, NULL,  'Estructura', 62, NULL),
  ('mesa', 'num_ruedas',        'Cantidad ruedas',        'numero',    '4',     4, 8,    'und', 'Estructura', 63, NULL),
  ('mesa', 'pozuelos_rect',     'Pozuelos rectangulares', 'numero',    '0',     0, 3,    'und', 'Pozuelos', 70, NULL),
  ('mesa', 'poz_largo',         'Largo pozuelo (m)',      'numero',    '0.54',  0.3, 0.8,  'm',   'Pozuelos', 71, NULL),
  ('mesa', 'poz_ancho',         'Ancho pozuelo (m)',      'numero',    '0.39',  0.25, 0.6, 'm',   'Pozuelos', 72, NULL),
  ('mesa', 'poz_alto',          'Prof. pozuelo (m)',      'numero',    '0.18',  0.1, 0.3,  'm',   'Pozuelos', 73, NULL),
  ('mesa', 'pozuelo_redondo',   'Pozuelos redondos 370mm','numero',   '0',     0, 2,    'und', 'Pozuelos', 74, NULL),
  ('mesa', 'escabiladero',      'Escabiladero',           'toggle',    '0',     NULL, NULL, NULL,  'Accesorios', 80, NULL),
  ('mesa', 'cant_bandejeros',   'Bandejeros',             'numero',    '3',     2, 6,    'und', 'Accesorios', 81, NULL),
  ('mesa', 'vertedero',         'Vertederos',             'numero',    '0',     0, 2,    'und', 'Accesorios', 82, NULL),
  ('mesa', 'diametro_vertedero','Diámetro vertedero (m)', 'numero',    '0.45',  0.3, 0.6,  'm',   'Accesorios', 83, NULL),
  ('mesa', 'prof_vertedero',    'Prof. vertedero (m)',    'numero',    '0.50',  0.3, 0.7,  'm',   'Accesorios', 84, NULL),
  ('mesa', 'push_pedal',        'Push Pedal',             'toggle',    '0',     NULL, NULL, NULL,  'Accesorios', 85, NULL),
  ('mesa', 'poliza',            'Incluir póliza',         'toggle',    '0',     NULL, NULL, NULL,  'Extras', 90, NULL),
  ('mesa', 'instalado',         'Incluir instalación',    'toggle',    '1',     NULL, NULL, NULL,  'Extras', 91, NULL);

-- Materiales
DELETE FROM producto_materiales WHERE producto_id = 'mesa';
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, codigo) VALUES
  ('mesa', 'lamina_mesa',      'LAMINA LISA ACERO INOXIDABLE {tipo_acero} {acabado} CAL {calibre}', false, NULL, 'AILA0101{calibre}'),
  ('mesa', 'lamina_babero',    'LAMINA LISA ACERO INOXIDABLE {tipo_acero} SATINADO CAL 20',         false, NULL, 'AILA010220'),
  ('mesa', 'lamina_pozuelo',   'LAMINA LISA ACERO INOXIDABLE {tipo_acero} {acabado} CAL {calibre}', false, NULL, 'AILA0101{calibre}'),
  ('mesa', 'lamina_vertedero', 'LAMINA LISA ACERO INOXIDABLE {tipo_acero} {acabado} CAL 16',        false, NULL, 'AILA010116'),
  ('mesa', 'tubo_patas',       'TUBO ACERO INOXIDABLE CUADRADO 1 1/2 CAL 16',                      false, NULL, 'AITC180016'),
  ('mesa', 'niveladores',      'NIVELADOR NACIONAL INOX CUADRADO 1 1/2',                           false, NULL, 'FENI010118'),
  ('mesa', 'pozuelo_redondo',  'POZUELO INOX REDONDO 37',                                          false, NULL, 'FEPO010137'),
  ('mesa', 'rh_15mm',          'MADERA RH AGLOMERADO 15 MM',                                       false, NULL, 'FEOM090015'),
  ('mesa', 'tornillos',        'TORNILLO INOX AVELLANADO 12 X 2',                                  false, NULL, NULL),
  ('mesa', 'cinta_3m',         'CINTA 3M ACERO',                                                   false, NULL, NULL),
  ('mesa', 'pl285',            'PEGA PL 285',                                                      false, NULL, 'FEOM120100'),
  ('mesa', 'tubo_vertedero',   'TUBO ACERO INOXIDABLE CUADRADO 3 CAL 16',                          false, NULL, NULL),
  ('mesa', 'disco_corte',      'DISCOS CORTE 4 1/2',                                               false, NULL, 'ABDI100124'),
  ('mesa', 'disco_flap',       'DISCOS FLAP INOX 4 1/2 GRANO 60',                                 false, NULL, 'ABDI802060'),
  ('mesa', 'pano',             'PAÑO SCOTCH BRITE 3M',                                             false, NULL, 'ABPA020001'),
  ('mesa', 'lija',             'LIJA ZC INOX GRANO 80',                                            false, NULL, 'ABLI202080'),
  ('mesa', 'grata',            'GRATA ALAMBRE INOX 2',                                             false, NULL, 'ABGR200019'),
  ('mesa', 'angulo_escab',     'ANGULO ACERO INOXIDABLE 1 1/2 x 1/8',                              false, NULL, 'AIAG03002'),
  ('mesa', 'ruedas_3',         'RUEDAS INOX CON FRENO 3',                                          false, NULL, 'FERU010121'),
  ('mesa', 'argon',            'ARGÓN',                  true, 4000,  NULL),
  ('mesa', 'empaque',          'EMPAQUE',                true, 3500,  NULL),
  ('mesa', 'platina_ruedas',   'PLATINA RUEDAS',         true, 12270, NULL),
  ('mesa', 'laser',            'CORTE LÁSER',            true, 6500,  NULL),
  ('mesa', 'tte_elementos',    'TRANSPORTE ELEMENTOS',   true, 15000, NULL),
  ('mesa', 'tte_regreso',      'TRANSPORTE REGRESO',     true, 5000,  NULL),
  ('mesa', 'push_pedal_item',  'PUSH PEDAL',             true, 348000, NULL),
  ('mesa', 'grifo',            'GRIFO',                  true, 74000, NULL),
  ('mesa', 'canastilla',       'CANASTILLA',             true, 24000, NULL);

-- Líneas APU
DELETE FROM producto_lineas_apu WHERE producto_id = 'mesa';
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion) VALUES
  -- Insumos
  ('mesa', 'insumos', 1,  'Acero mesa',        'lamina_mesa',    '(largo+0.12)*(ancho+0.12)+((alto_salpicadero+0.04)*salp_longitudinal*largo+(alto_salpicadero+0.04)*salp_costado*ancho)', 0, NULL),
  ('mesa', 'insumos', 2,  'Omegas mesa',       'lamina_mesa',    '(1 - refuerzo_rh) * (desarrollo_omegas*largo*ceil(ancho/0.6) + desarrollo_omegas*ancho*(ceil(largo/2) + 2*(pozuelos_rect+pozuelo_redondo)) + 0.078*(salp_longitudinal*largo+salp_costado*ancho))', 0, NULL),
  ('mesa', 'insumos', 3,  'Entrepaño',         'lamina_mesa',    '(largo+0.12)*(ancho+0.12)*entrepanos', 0, 'entrepanos > 0'),
  ('mesa', 'insumos', 4,  'Babero',            'lamina_babero',  '(alto_babero+0.06)*(largo+0.06)*babero + (ancho+0.06)*(alto_babero+0.06)*babero_costados', 0, 'babero == 1'),
  ('mesa', 'insumos', 5,  'Pozuelo rect',      'lamina_pozuelo', '((poz_largo+poz_alto*2)*poz_ancho + poz_largo*poz_alto*2) * pozuelos_rect', 0.10, 'pozuelos_rect > 0'),
  ('mesa', 'insumos', 6,  'Pozuelo redondo',   'pozuelo_redondo','pozuelo_redondo', 0, 'pozuelo_redondo > 0'),
  ('mesa', 'insumos', 7,  'Omegas entrepaño',  'lamina_mesa',    '(desarrollo_omegas*largo*ceil(ancho/0.6) + desarrollo_omegas*ancho*ceil(largo/2)) * entrepanos', 0, 'entrepanos > 0'),
  ('mesa', 'insumos', 8,  'Patas',             'tubo_patas',     'patas*alto + (1 - min(entrepanos, 1))*(largo + ancho*patas/2)', 0.10, NULL),
  ('mesa', 'insumos', 9,  'Niveladores',       'niveladores',    'patas', 0, 'ruedas == 0'),
  ('mesa', 'insumos', 10, 'Cinta 3M',          'cinta_3m',       'ceil(((largo*ceil(ancho/0.6) + ancho*(ceil(largo/2) + 2*(pozuelos_rect+pozuelo_redondo))) + (largo*ceil(ancho/0.6) + ancho*ceil(largo/2))*entrepanos) * 2 / metros_rollo_cinta)', 0, 'refuerzo_rh == 0'),
  ('mesa', 'insumos', 11, 'Argón',             'argon',          'largo + largo*entrepanos + patas/4 + pozuelos_rect + pozuelo_redondo + vertedero*4', 0, NULL),
  ('mesa', 'insumos', 12, 'Disco corte',       'disco_corte',    '(largo + largo*entrepanos + patas/4 + pozuelos_rect + pozuelo_redondo + vertedero*4) / 3', 0, NULL),
  ('mesa', 'insumos', 13, 'Disco flap',        'disco_flap',     '(largo + largo*entrepanos + patas/4 + pozuelos_rect + pozuelo_redondo + vertedero*4) / 8', 0, NULL),
  ('mesa', 'insumos', 14, 'Paño',              'pano',           '(largo + largo*entrepanos + patas/4 + pozuelos_rect + pozuelo_redondo + vertedero*4) / 3', 0, NULL),
  ('mesa', 'insumos', 15, 'Lija',              'lija',           '(largo + largo*entrepanos + patas/4 + pozuelos_rect + pozuelo_redondo + vertedero*4) / 4', 0, NULL),
  ('mesa', 'insumos', 16, 'Grata',             'grata',          '(largo + largo*entrepanos + patas/4 + pozuelos_rect + pozuelo_redondo + vertedero*4) / 30', 0, NULL),
  ('mesa', 'insumos', 17, 'Empaque',           'empaque',        'largo', 0, NULL),
  -- Mano de obra
  ('mesa', 'mo', 1, 'MO Acero',        'MO_ACERO',        'largo + pozuelos_rect + pozuelo_redondo + entrepanos*largo + (escabiladero)*(ancho*2)', 0, NULL),
  ('mesa', 'mo', 2, 'MO Pulido',       'MO_PULIDO',       'largo + pozuelos_rect + pozuelo_redondo + entrepanos*largo + (escabiladero)*(ancho*2)', 0, NULL),
  ('mesa', 'mo', 3, 'MO Patas',        'MO_PATAS',        'patas', 0, NULL),
  ('mesa', 'mo', 4, 'MO Instalación',  'MO_INSTALACION',  'largo', 0, 'instalado == 1'),
  -- Transporte
  ('mesa', 'transporte', 1, 'TTE Elementos',  'tte_elementos', 'max(largo, 1)', 0, NULL),
  ('mesa', 'transporte', 2, 'TTE Regreso',    'tte_regreso',   'max(largo, 1)', 0, NULL),
  -- Laser
  ('mesa', 'laser', 1, 'Corte láser', 'laser', 'ceil(largo + pozuelos_rect + pozuelo_redondo + vertedero + largo*entrepanos)', 0, NULL);

-- Tarifas MO
DELETE FROM tarifas_mo_producto WHERE producto_id = 'mesa';
INSERT INTO tarifas_mo_producto (producto_id, codigo, descripcion, precio, unidad) VALUES
  ('mesa', 'MO_ACERO',       'Mano de obra acero',       30000, 'ml'),
  ('mesa', 'MO_PULIDO',      'Mano de obra pulido',      23000, 'ml'),
  ('mesa', 'MO_PATAS',       'Mano de obra patas',       10000, 'und'),
  ('mesa', 'MO_INSTALACION', 'Mano de obra instalación', 22200, 'ml');


-- ════════════════════════════════════════════════════════════
-- CÁRCAMO (verificado: ~$587,000)
-- ════════════════════════════════════════════════════════════

INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, activo, orden)
VALUES ('carcamo', 'Cárcamo', 'Cárcamos', 0.38, true, 3)
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, grupo = EXCLUDED.grupo, margen_default = EXCLUDED.margen_default, activo = EXCLUDED.activo, orden = EXCLUDED.orden;

-- Variables
DELETE FROM producto_variables WHERE producto_id = 'carcamo';
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones) VALUES
  ('carcamo', 'largo',          'Largo (m)',              'numero',    '1',     0.3, 3,   'm',   'Dimensiones principales', 10, NULL),
  ('carcamo', 'ancho',          'Ancho (m)',              'numero',    '0.25',  0.15, 1,  'm',   'Dimensiones principales', 11, NULL),
  ('carcamo', 'alto',           'Alto (m)',               'numero',    '0.095', 0.05, 0.5,'m',   'Dimensiones principales', 12, NULL),
  ('carcamo', 'calibre_cuerpo', 'Calibre cuerpo',         'seleccion', '18',   NULL, NULL, NULL, 'Material', 20, '["18","16"]'),
  ('carcamo', 'calibre_tapa',   'Calibre tapa',            'seleccion', '12',   NULL, NULL, NULL, 'Material', 21, '["12","14"]'),
  ('carcamo', 'largo_desague',  'Largo desagüe (m)',       'numero',    '0.2',  0.1, 1,   'm',   'Desagüe', 30, NULL),
  ('carcamo', 'instalacion',    'Incluir instalación',     'toggle',    '0',    NULL, NULL, NULL,  'Extras', 90, NULL),
  ('carcamo', 'poliza',         'Incluir póliza',          'toggle',    '0',    NULL, NULL, NULL,  'Extras', 91, NULL);

-- Materiales
DELETE FROM producto_materiales WHERE producto_id = 'carcamo';
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, codigo) VALUES
  ('carcamo', 'lamina_cuerpo',   'LAMINA ACERO CAL {calibre_cuerpo}',  false, NULL, 'AILA0101{calibre_cuerpo}'),
  ('carcamo', 'lamina_tapa',     'LAMINA ACERO CAL {calibre_tapa}',    false, NULL, 'AILA0101{calibre_tapa}'),
  ('carcamo', 'tubo_desague',    'TUBO 2" DESAGÜE',                   false, NULL, 'AITO020016'),
  ('carcamo', 'granada_lam',     'GRANADA LÁMINA CAL 20',             false, NULL, 'AILA010120'),
  ('carcamo', 'disco_corte',     'DISCOS CORTE 4 1/2',                false, NULL, 'ABDI100124'),
  ('carcamo', 'disco_flap',      'DISCOS FLAP INOX',                  false, NULL, 'ABDI802060'),
  ('carcamo', 'pano',            'PAÑO SCOTCH BRITE',                 false, NULL, 'ABPA020001'),
  ('carcamo', 'lija',            'LIJA ZC',                           false, NULL, 'ABLI202080'),
  ('carcamo', 'grata',           'GRATA',                             false, NULL, 'ABGR200019'),
  ('carcamo', 'argon_carc',      'ARGÓN CÁRCAMO',          true, 8000,  NULL),
  ('carcamo', 'empaque_carc',    'EMPAQUE CÁRCAMO',        true, 1500,  NULL),
  ('carcamo', 'tornillo_carc',   'TORNILLOS CÁRCAMO',      true, 850,   NULL),
  ('carcamo', 'mo_sold_carc',    'MO SOLDADURA',           true, 62000, NULL),
  ('carcamo', 'mo_pulido_carc',  'MO PULIDO',              true, 25000, NULL),
  ('carcamo', 'mo_instal_carc',  'MO INSTALACIÓN',         true, 11500, NULL),
  ('carcamo', 'mo_punz_carc',    'MO PUNZONADO',           true, 97900, NULL),
  ('carcamo', 'mo_dobles_carc',  'MO DOBLES',              true, 1800,  NULL),
  ('carcamo', 'tte_elem_carc',   'TTE ELEMENTOS',          true, 30000, NULL),
  ('carcamo', 'tte_pers_ida',    'TTE PERSONAL IDA',       true, 15000, NULL),
  ('carcamo', 'tte_pers_reg',    'TTE PERSONAL REGRESO',   true, 15000, NULL),
  ('carcamo', 'laser_carc',      'PROCESO LÁSER',          true, 6500,  NULL);

-- Líneas APU
DELETE FROM producto_lineas_apu WHERE producto_id = 'carcamo';
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion) VALUES
  ('carcamo', 'insumos',     1,  'Acero Cuerpo',       'lamina_cuerpo',  '(largo*alto*2)+(ancho*alto*2)+(largo*ancho)', 0, NULL),
  ('carcamo', 'insumos',     2,  'Acero Tapa',         'lamina_tapa',    '(largo+0.04)*(ancho+0.04)', 0, NULL),
  ('carcamo', 'insumos',     3,  'Tubo 2" Desagüe',    'tubo_desague',   'largo_desague', 0, NULL),
  ('carcamo', 'insumos',     4,  'Granada lámina cal 20','granada_lam',  '2*3.1416*0.038*0.1', 0, NULL),
  ('carcamo', 'insumos',     5,  'Argón',              'argon_carc',     'largo', 0, NULL),
  ('carcamo', 'insumos',     6,  'Disco de corte',     'disco_corte',    'largo/3', 0, NULL),
  ('carcamo', 'insumos',     7,  'Disco flap',         'disco_flap',     'largo/6', 0, NULL),
  ('carcamo', 'insumos',     8,  'Paño Scotch Brite',  'pano',           'largo/3', 0, NULL),
  ('carcamo', 'insumos',     9,  'Lija zirconio',      'lija',           'largo/4', 0, NULL),
  ('carcamo', 'insumos',     10, 'Grata',              'grata',          'largo/25', 0, NULL),
  ('carcamo', 'insumos',     11, 'Empaque',            'empaque_carc',   'largo', 0, NULL),
  ('carcamo', 'insumos',     12, 'Tornillos',          'tornillo_carc',  'largo*4', 0, NULL),
  ('carcamo', 'mo',          13, 'MO Soldadura',       'mo_sold_carc',   'largo', 0, NULL),
  ('carcamo', 'mo',          14, 'MO Pulido',          'mo_pulido_carc', 'largo', 0, NULL),
  ('carcamo', 'mo',          15, 'MO Instalación',     'mo_instal_carc', 'instalacion * largo', 0, 'instalacion == 1'),
  ('carcamo', 'mo',          16, 'MO Punzonado',       'mo_punz_carc',   'largo*ancho', 0, NULL),
  ('carcamo', 'mo',          17, 'MO Dobles',          'mo_dobles_carc', '8', 0, NULL),
  ('carcamo', 'transporte',  18, 'TTE Elementos',      'tte_elem_carc',  'largo', 0, NULL),
  ('carcamo', 'transporte',  19, 'TTE Personal Ida',   'tte_pers_ida',   'largo', 0, NULL),
  ('carcamo', 'transporte',  20, 'TTE Personal Regreso','tte_pers_reg',  'largo', 0, NULL),
  ('carcamo', 'laser',       21, 'Proceso láser',      'laser_carc',     'largo*6', 0, NULL);


-- ════════════════════════════════════════════════════════════
-- ESTANTERÍA GRADUABLE (verificado: ~$4,068,000)
-- ════════════════════════════════════════════════════════════

INSERT INTO productos_catalogo (id, nombre, grupo, margen_default, activo, orden)
VALUES ('estanteria_graduable', 'Estantería Graduable', 'Estanterías', 0.38, true, 4)
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, grupo = EXCLUDED.grupo, margen_default = EXCLUDED.margen_default, activo = EXCLUDED.activo, orden = EXCLUDED.orden;

-- Variables
DELETE FROM producto_variables WHERE producto_id = 'estanteria_graduable';
INSERT INTO producto_variables (producto_id, nombre, label, tipo, default_valor, min_val, max_val, unidad, grupo_ui, orden, opciones) VALUES
  ('estanteria_graduable', 'largo',             'Largo (m)',              'numero',    '2',    0.5, 3,   'm',   'Dimensiones principales', 10, NULL),
  ('estanteria_graduable', 'ancho',             'Ancho (m)',              'numero',    '0.65', 0.3, 1,   'm',   'Dimensiones principales', 11, NULL),
  ('estanteria_graduable', 'alto',              'Alto (m)',               'numero',    '1.8',  1,   2.5, 'm',   'Dimensiones principales', 12, NULL),
  ('estanteria_graduable', 'num_entrepanos',    'Número de entrepaños',   'numero',    '5',    2, 8,    'und', 'Configuración', 20, NULL),
  ('estanteria_graduable', 'num_patas',         'Número de patas',        'numero',    '4',    4, 6,    'und', 'Configuración', 21, NULL),
  ('estanteria_graduable', 'calibre_entrepano', 'Calibre entrepaño',      'seleccion', '18',   NULL, NULL, NULL, 'Material', 30, '["18","16"]'),
  ('estanteria_graduable', 'calibre_patas',     'Calibre patas',          'seleccion', '12',   NULL, NULL, NULL, 'Material', 31, '["12","14"]'),
  ('estanteria_graduable', 'instalacion',       'Incluir instalación',    'toggle',    '0',    NULL, NULL, NULL,  'Extras', 90, NULL),
  ('estanteria_graduable', 'poliza',            'Incluir póliza',         'toggle',    '0',    NULL, NULL, NULL,  'Extras', 91, NULL);

-- Materiales
DELETE FROM producto_materiales WHERE producto_id = 'estanteria_graduable';
INSERT INTO producto_materiales (producto_id, alias, template_nombre, es_fijo, precio_fijo, codigo) VALUES
  ('estanteria_graduable', 'lamina_entrep',    'LÁMINA ENTREPAÑO CAL {calibre_entrepano}', false, NULL, 'AILA0101{calibre_entrepano}'),
  ('estanteria_graduable', 'lamina_patas',     'LÁMINA PATAS CAL {calibre_patas}',         false, NULL, 'AILA0101{calibre_patas}'),
  ('estanteria_graduable', 'lamina_omegas',    'LÁMINA OMEGAS CAL 18',                     false, NULL, 'AILA010118'),
  ('estanteria_graduable', 'niveladores_est',  'NIVELADORES',                              false, NULL, 'FENI010118'),
  ('estanteria_graduable', 'disco_corte_est',  'DISCOS CORTE',                             false, NULL, 'ABDI100124'),
  ('estanteria_graduable', 'disco_flap_est',   'DISCOS FLAP',                              false, NULL, 'ABDI802060'),
  ('estanteria_graduable', 'pano_est',         'PAÑO SCOTCH BRITE',                        false, NULL, 'ABPA020001'),
  ('estanteria_graduable', 'lija_est',         'LIJA ZC',                                  false, NULL, 'ABLI202080'),
  ('estanteria_graduable', 'grata_est',        'GRATA',                                    false, NULL, 'ABGR200019'),
  ('estanteria_graduable', 'tornillo_est',     'TORNILLOS EST',      true, 800,   NULL),
  ('estanteria_graduable', 'cinta_est',        'CINTA EST',          true, 11500, NULL),
  ('estanteria_graduable', 'argon_est',        'ARGÓN EST',          true, 4500,  NULL),
  ('estanteria_graduable', 'empaque_est',      'EMPAQUE EST',        true, 8000,  NULL),
  ('estanteria_graduable', 'mo_acero_est',     'MO ACERO',           true, 31080, NULL),
  ('estanteria_graduable', 'mo_pulido_est',    'MO PULIDO',          true, 12765, NULL),
  ('estanteria_graduable', 'mo_parales_est',   'MO PULIDA PARALES',  true, 24420, NULL),
  ('estanteria_graduable', 'mo_ensamble_est',  'MO ENSAMBLE',        true, 29970, NULL),
  ('estanteria_graduable', 'mo_instal_est',    'MO INSTALACIÓN',     true, 16650, NULL),
  ('estanteria_graduable', 'tte_elem_est',     'TTE ELEMENTOS',      true, 35000, NULL),
  ('estanteria_graduable', 'tte_reg_est',      'TTE REGRESO',        true, 10000, NULL),
  ('estanteria_graduable', 'laser_est',        'LÁSER PARALES',      true, 6500,  NULL);

-- Líneas APU
DELETE FROM producto_lineas_apu WHERE producto_id = 'estanteria_graduable';
INSERT INTO producto_lineas_apu (producto_id, seccion, orden, descripcion, material_alias, formula_cantidad, desperdicio, condicion) VALUES
  ('estanteria_graduable', 'insumos',    1,  'Acero Entrepaño',   'lamina_entrep',     '(largo+0.13)*(ancho+0.13)*num_entrepanos', 0, NULL),
  ('estanteria_graduable', 'insumos',    2,  'Acero Patas',       'lamina_patas',      'alto*num_patas*0.13', 0, NULL),
  ('estanteria_graduable', 'insumos',    3,  'Omegas',            'lamina_omegas',     '0.2*largo*num_entrepanos + 0.15*ancho*2*num_entrepanos', 0, NULL),
  ('estanteria_graduable', 'insumos',    4,  'Niveladores',       'niveladores_est',   'num_patas', 0, NULL),
  ('estanteria_graduable', 'insumos',    5,  'Tornillos',         'tornillo_est',      '8*num_entrepanos', 0, NULL),
  ('estanteria_graduable', 'insumos',    6,  'Cinta',             'cinta_est',         'largo*num_entrepanos + ancho*num_entrepanos', 0, NULL),
  ('estanteria_graduable', 'insumos',    7,  'Argón',             'argon_est',         'largo*num_entrepanos', 0, NULL),
  ('estanteria_graduable', 'insumos',    8,  'Disco de corte',    'disco_corte_est',   'largo*num_entrepanos/4', 0, NULL),
  ('estanteria_graduable', 'insumos',    9,  'Disco flap',        'disco_flap_est',    'largo*num_entrepanos/4', 0, NULL),
  ('estanteria_graduable', 'insumos',    10, 'Paño',              'pano_est',          'largo*num_entrepanos/3', 0, NULL),
  ('estanteria_graduable', 'insumos',    11, 'Lija zirconio',     'lija_est',          'largo*num_entrepanos/3', 0, NULL),
  ('estanteria_graduable', 'insumos',    12, 'Grata',             'grata_est',         'largo*num_entrepanos/10', 0, NULL),
  ('estanteria_graduable', 'insumos',    13, 'Empaque',           'empaque_est',       'largo/1.5', 0, NULL),
  ('estanteria_graduable', 'mo',         14, 'MO Acero',          'mo_acero_est',      'largo*num_entrepanos', 0, NULL),
  ('estanteria_graduable', 'mo',         15, 'MO Pulido',         'mo_pulido_est',     'largo*num_entrepanos', 0, NULL),
  ('estanteria_graduable', 'mo',         16, 'MO Pulida parales', 'mo_parales_est',    'num_patas', 0, NULL),
  ('estanteria_graduable', 'mo',         17, 'MO Ensamble',       'mo_ensamble_est',   '1', 0, NULL),
  ('estanteria_graduable', 'mo',         18, 'MO Instalación',    'mo_instal_est',     'instalacion * largo', 0, 'instalacion == 1'),
  ('estanteria_graduable', 'transporte', 19, 'TTE Elementos',     'tte_elem_est',      'largo', 0, NULL),
  ('estanteria_graduable', 'transporte', 20, 'TTE Regreso',       'tte_reg_est',       'largo', 0, NULL),
  ('estanteria_graduable', 'laser',      21, 'Láser parales',     'laser_est',         'num_patas*alto*2 + num_entrepanos', 0, NULL);

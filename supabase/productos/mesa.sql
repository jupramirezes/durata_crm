-- Auto-contenido e idempotente. Requiere: supabase/schema-motor-generico.sql

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

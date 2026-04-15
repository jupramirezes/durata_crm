-- ============================================================
-- PRODUCTO: Repisa
-- Fuente: REPISA.xlsx (versión con calibres por elemento)
-- Precio Excel referencia: $652,400 (largo=1.8, ancho=0.3, 38%)
-- Verificado manualmente línea por línea
-- ============================================================

-- Limpiar datos previos
DELETE FROM producto_lineas_apu WHERE producto_id = 'repisa';
DELETE FROM producto_materiales WHERE producto_id = 'repisa';
DELETE FROM producto_variables WHERE producto_id = 'repisa';
DELETE FROM productos_catalogo WHERE id = 'repisa';

-- ============================================================
-- CATÁLOGO
-- ============================================================
INSERT INTO productos_catalogo (id, nombre, descripcion, activo)
VALUES ('repisa', 'Repisa', 'Repisa de pared en acero inoxidable para cocinas industriales, restaurantes y áreas de preparación', true)
ON CONFLICT (id) DO UPDATE SET nombre=EXCLUDED.nombre, descripcion=EXCLUDED.descripcion, activo=EXCLUDED.activo;

-- ============================================================
-- VARIABLES (14)
-- Calibre separado por elemento: repisa, omegas, pieamigos
-- Acabado (2B/SAT) se agrega como variable en siguiente iteración
-- ============================================================
INSERT INTO producto_variables (producto_id, nombre, label, tipo, min, max, default_value, opciones, seccion_ui, orden) VALUES
-- Dimensiones
('repisa', 'largo',               'Largo (m)',               'numero',    0.3,  5,    '1.8',  NULL,              'Dimensiones', 1),
('repisa', 'ancho',               'Ancho (m)',               'numero',    0.1,  1,    '0.3',  NULL,              'Dimensiones', 2),
-- Material (calibre por elemento)
('repisa', 'acero_repisa',        'Calibre repisa',          'seleccion', NULL, NULL, '18',   '12,14,16,18,20',  'Material', 3),
('repisa', 'acero_omegas',        'Calibre omegas',          'seleccion', NULL, NULL, '18',   '12,14,16,18,20',  'Material', 4),
('repisa', 'acero_pieamigos',     'Calibre pieamigos',       'seleccion', NULL, NULL, '14',   '12,14,16,18,20',  'Material', 5),
-- Configuración
('repisa', 'pieamigos_extras',    '# Pieamigos extras',      'numero',    0,    6,    '2',    NULL,              'Configuración', 6),
('repisa', 'pieamigos_integrado', '# Pieamigos integrado',   'numero',    0,    6,    '0',    NULL,              'Configuración', 7),
('repisa', 'tiene_omega',         'Tiene omega',             'toggle',    NULL, NULL, '1',    NULL,              'Configuración', 8),
('repisa', 'ancho_omega',         'Ancho omega (m)',         'numero',    0.1,  0.4,  '0.2',  NULL,              'Configuración', 9),
-- Accesorios
('repisa', 'salpicadero_long',    '# Salpicadero longitudinal', 'numero', 0,   4,    '0',    NULL,              'Accesorios', 10),
('repisa', 'salpicadero_costado', '# Salpicadero costado',   'numero',    0,    4,    '0',    NULL,              'Accesorios', 11),
('repisa', 'alto_salpicadero',    'Alto salpicadero (m)',    'numero',    0,    0.3,  '0',    NULL,              'Accesorios', 12),
-- Extras
('repisa', 'instalado',           'Incluye instalación',     'toggle',    NULL, NULL, '0',    NULL,              'Extras', 13),
('repisa', 'poliza_pct',          'Póliza (%)',              'numero',    0,    0.1,  '0.02', NULL,              'Extras', 14)
ON CONFLICT (producto_id, nombre) DO UPDATE SET 
  label=EXCLUDED.label, tipo=EXCLUDED.tipo, min=EXCLUDED.min, max=EXCLUDED.max,
  default_value=EXCLUDED.default_value, opciones=EXCLUDED.opciones, 
  seccion_ui=EXCLUDED.seccion_ui, orden=EXCLUDED.orden;

-- ============================================================
-- MATERIALES
-- Cada lámina usa su propia variable de calibre en el template
-- AILA0102{XX} = 304 SATINADO + calibre XX
-- Después se agrega variable acabado para cambiar 0102<->0101
-- ============================================================
INSERT INTO producto_materiales (producto_id, alias, nombre, codigo, template_nombre, es_fijo, precio_fijo) VALUES
-- Láminas (precio de precios_maestro, código con template de calibre)
('repisa', 'lamina_repisa',    'Acero repisa',       'AILA0102{acero_repisa}',     NULL, false, NULL),
('repisa', 'lamina_omegas',    'Acero omegas',       'AILA0102{acero_omegas}',     NULL, false, NULL),
('repisa', 'lamina_pieamigo',  'Acero pieamigo',     'AILA0102{acero_pieamigos}',  NULL, false, NULL),
-- Consumibles (precio de precios_maestro, código fijo)
('repisa', 'disco_corte',     'Disco de corte',     'ABDI100124', NULL, false, NULL),
('repisa', 'disco_flap',      'Disco flap',         'ABDI802060', NULL, false, NULL),
('repisa', 'pano',            'Paño Scotch Brite',  'ABPA020001', NULL, false, NULL),
('repisa', 'lija',            'Lija zirconio',      'ABLI202080', NULL, false, NULL),
('repisa', 'grata',           'Grata',              'ABGR200019', NULL, false, NULL),
-- Precios fijos (no buscan en precios_maestro)
('repisa', 'tornillos',       'Tornillos',          NULL, NULL, true, 800),
('repisa', 'argon',           'Argón',              NULL, NULL, true, 1500),
('repisa', 'empaque',         'Empaque y embalaje', NULL, NULL, true, 3500),
('repisa', 'cinta',           'Cinta',              NULL, NULL, true, 11500),
('repisa', 'mo_acero',        'MO Acero',           NULL, NULL, true, 30000),
('repisa', 'mo_pulido',       'MO Pulido',          NULL, NULL, true, 20000),
('repisa', 'mo_pieamigos',    'MO Pieamigos',       NULL, NULL, true, 8880),
('repisa', 'mo_instalacion',  'MO Instalación',     NULL, NULL, true, 24420),
('repisa', 'tte_elementos',   'TTE Elementos',      NULL, NULL, true, 40000),
('repisa', 'laser',           'Corte láser',        NULL, NULL, true, 6500)
ON CONFLICT (producto_id, alias) DO UPDATE SET 
  nombre=EXCLUDED.nombre, codigo=EXCLUDED.codigo, 
  es_fijo=EXCLUDED.es_fijo, precio_fijo=EXCLUDED.precio_fijo;

-- ============================================================
-- LÍNEAS APU (20)
-- Nombres genéricos (sin calibre hardcodeado)
-- Cada lámina apunta a su propio material con su calibre
-- ============================================================
INSERT INTO producto_lineas_apu (producto_id, nombre, seccion, formula_cantidad, material_alias, condicion, desperdicio, orden) VALUES

-- INSUMOS (12 líneas)
('repisa', 'Acero repisa',         'insumos',
 '((largo+IF(pieamigos_integrado>0,pieamigos_integrado*0.3,0.12))*(ancho+0.12)+((alto_salpicadero+0.04)*salpicadero_long*largo+(alto_salpicadero+0.04)*salpicadero_costado*ancho))+0.08*largo*2',
 'lamina_repisa', NULL, 0, 1),

('repisa', 'Omega',                'insumos',
 'IF(tiene_omega==1,ROUNDUP(ancho/0.4,0)*largo*ancho_omega,0)',
 'lamina_omegas', 'tiene_omega==1', 0, 2),

('repisa', 'Pieamigo',             'insumos',
 '((ancho+0.06)*(0.3+0.06)/2)*pieamigos_extras',
 'lamina_pieamigo', NULL, 0, 3),

('repisa', 'Tornillos',            'insumos',
 '3*(pieamigos_extras+pieamigos_integrado)',
 'tornillos', NULL, 0, 4),

('repisa', 'Argón',                'insumos',
 'largo+ancho',
 'argon', NULL, 0, 5),

('repisa', 'Disco de corte',       'insumos',
 '(largo+ancho)/3',
 'disco_corte', NULL, 0, 6),

('repisa', 'Disco flap',           'insumos',
 '(largo+ancho)/8',
 'disco_flap', NULL, 0, 7),

('repisa', 'Paño Scotch Brite',    'insumos',
 '(largo+ancho)/3',
 'pano', NULL, 0, 8),

('repisa', 'Lijas de zirconio',    'insumos',
 '(largo+ancho)/4',
 'lija', NULL, 0, 9),

('repisa', 'Grata',                'insumos',
 '(largo+ancho)/30',
 'grata', NULL, 0, 10),

('repisa', 'Empaque y embalaje',   'insumos',
 'largo',
 'empaque', NULL, 0, 11),

('repisa', 'Cinta',                'insumos',
 'largo*ROUNDUP(ancho/0.4,0)',
 'cinta', NULL, 0, 12),

-- MANO DE OBRA (4 líneas)
('repisa', 'MO Acero',             'mo',
 'largo',
 'mo_acero', NULL, 0, 13),

('repisa', 'MO Pulido',            'mo',
 'largo',
 'mo_pulido', NULL, 0, 14),

('repisa', 'MO Pieamigos',         'mo',
 'pieamigos_extras',
 'mo_pieamigos', NULL, 0, 15),

('repisa', 'MO Instalación',       'mo',
 'IF(instalado==1,largo,0)',
 'mo_instalacion', NULL, 0, 16),

-- TRANSPORTE (3 líneas)
('repisa', 'TTE Elementos',        'transporte',
 'largo',
 'tte_elementos', NULL, 0, 17),

('repisa', 'TTE Personal Ida',     'transporte',
 'largo',
 NULL, NULL, 0, 18),

('repisa', 'TTE Personal Regreso', 'transporte',
 'largo',
 NULL, NULL, 0, 19),

-- CORTE LÁSER (1 línea)
('repisa', 'Corte láser',          'laser',
 'ROUNDUP(largo,0)',
 'laser', NULL, 0, 20)

ON CONFLICT (producto_id, nombre) DO UPDATE SET
  seccion=EXCLUDED.seccion, formula_cantidad=EXCLUDED.formula_cantidad,
  material_alias=EXCLUDED.material_alias, condicion=EXCLUDED.condicion,
  desperdicio=EXCLUDED.desperdicio, orden=EXCLUDED.orden;

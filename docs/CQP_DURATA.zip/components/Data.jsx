/* Data.jsx — Shared mock data for the prototype */

// Top 1,550 materials (sample of 40 representative rows)
const MATERIALES = [
  // Acero inox — láminas
  { cod: 'AILAL00102', grupo: 'AI', linea: 'LAM', nombre: 'Lámina acero inox lisa mate cal. 1/8"', und: 'UND', precio: 485000, fecha: '2026-04-02', prov: 'IMPORINOX', stock: 'ok', stockQty: 42, freshness: 'ok' },
  { cod: 'AILAL00103', grupo: 'AI', linea: 'LAM', nombre: 'Lámina acero inox lisa mate cal. 3/16"', und: 'UND', precio: 612000, fecha: '2026-03-24', prov: 'IMPORINOX', stock: 'ok', stockQty: 18, freshness: 'ok' },
  { cod: 'AILAL00104', grupo: 'AI', linea: 'LAM', nombre: 'Lámina acero inox lisa mate cal. 1/4"', und: 'UND', precio: 789000, fecha: '2026-02-18', prov: 'WESCO', stock: 'low', stockQty: 3, freshness: 'mid' },
  { cod: 'AILAL00201', grupo: 'AI', linea: 'LAM', nombre: 'Lámina acero inox lisa brillante cal. 1/8"', und: 'UND', precio: 520000, fecha: '2026-04-10', prov: 'IMPORINOX', stock: 'ok', stockQty: 27, freshness: 'ok' },
  { cod: 'AILAT00102', grupo: 'AI', linea: 'LAT', nombre: 'Lámina acero inox antideslizante cal. 1/8"', und: 'UND', precio: 598000, fecha: '2026-01-12', prov: 'WESCO', stock: 'ok', stockQty: 12, freshness: 'old' },
  // Tubos
  { cod: 'AITCR01201', grupo: 'AI', linea: 'TUB', nombre: 'Tubo redondo acero inox 1" cal. 16', und: 'ML', precio: 38500, fecha: '2026-04-08', prov: 'INVERSINOX', stock: 'ok', stockQty: 180, freshness: 'ok' },
  { cod: 'AITCR01202', grupo: 'AI', linea: 'TUB', nombre: 'Tubo redondo acero inox 1 1/2" cal. 16', und: 'ML', precio: 54200, fecha: '2026-03-30', prov: 'INVERSINOX', stock: 'ok', stockQty: 95, freshness: 'ok' },
  { cod: 'AITCR01401', grupo: 'AI', linea: 'TUB', nombre: 'Tubo redondo acero inox 2" cal. 14', und: 'ML', precio: 89400, fecha: '2026-02-02', prov: 'STECKERL', stock: 'low', stockQty: 8, freshness: 'mid' },
  { cod: 'AITCC01201', grupo: 'AI', linea: 'TUB', nombre: 'Tubo cuadrado acero inox 1" x 1" cal. 16', und: 'ML', precio: 45800, fecha: '2026-04-11', prov: 'INVERSINOX', stock: 'ok', stockQty: 64, freshness: 'ok' },
  // Perfiles / ángulos
  { cod: 'ACPEL01201', grupo: 'AC', linea: 'PER', nombre: 'Ángulo acero al carbono 1" x 1" cal. 16', und: 'ML', precio: 12800, fecha: '2026-04-12', prov: 'HIERROS HB', stock: 'ok', stockQty: 320, freshness: 'ok' },
  { cod: 'ACPEL01401', grupo: 'AC', linea: 'PER', nombre: 'Ángulo acero al carbono 1 1/2" x 1 1/2" cal. 14', und: 'ML', precio: 18500, fecha: '2026-04-09', prov: 'HIERROS HB', stock: 'ok', stockQty: 210, freshness: 'ok' },
  { cod: 'ACPLC01401', grupo: 'AC', linea: 'PLA', nombre: 'Platina acero al carbono 1" x 1/8"', und: 'ML', precio: 8400, fecha: '2025-12-20', prov: 'CORTEACEROS', stock: 'out', stockQty: 0, freshness: 'old' },
  // Tornillería
  { cod: 'TOTAR00614', grupo: 'TO', linea: 'TAR', nombre: 'Tornillo autorroscante cab. plana 6 x 1/2"', und: 'UND', precio: 180, fecha: '2026-04-14', prov: 'MUNDIAL DE TORNILLOS', stock: 'ok', stockQty: 4200, freshness: 'ok' },
  { cod: 'TOTMH00814', grupo: 'TO', linea: 'TMH', nombre: 'Tornillo métrica M8 x 25mm acero inox', und: 'UND', precio: 420, fecha: '2026-04-14', prov: 'MUNDIAL DE TORNILLOS', stock: 'ok', stockQty: 850, freshness: 'ok' },
  { cod: 'TOTMH01014', grupo: 'TO', linea: 'TMH', nombre: 'Tornillo métrica M10 x 40mm acero inox', und: 'UND', precio: 680, fecha: '2026-04-14', prov: 'MUNDIAL DE TORNILLOS', stock: 'low', stockQty: 95, freshness: 'ok' },
  // Grifería / plomería
  { cod: 'GRLAV00101', grupo: 'GR', linea: 'LAV', nombre: 'Grifo cuello ganso monomando cocina', und: 'UND', precio: 245000, fecha: '2026-03-05', prov: 'DISTRIVALVULAS', stock: 'ok', stockQty: 14, freshness: 'mid' },
  { cod: 'GRLAV00201', grupo: 'GR', linea: 'LAV', nombre: 'Grifo pedal industrial inox', und: 'UND', precio: 380000, fecha: '2026-02-28', prov: 'DISTRIVALVULAS', stock: 'ok', stockQty: 6, freshness: 'mid' },
  { cod: 'GRVAL00301', grupo: 'GR', linea: 'VAL', nombre: 'Válvula de bola 1/2" acero inox 316', und: 'UND', precio: 68000, fecha: '2026-04-01', prov: 'TECNIFLUIDOS', stock: 'ok', stockQty: 48, freshness: 'ok' },
  // Electricidad
  { cod: 'ELCAB00302', grupo: 'EL', linea: 'CAB', nombre: 'Cable encauchetado 3x14 AWG', und: 'ML', precio: 8900, fecha: '2026-04-05', prov: 'VITELCO', stock: 'ok', stockQty: 420, freshness: 'ok' },
  { cod: 'ELTER00101', grupo: 'EL', linea: 'TER', nombre: 'Termostato digital 220V industrial', und: 'UND', precio: 145000, fecha: '2025-11-18', prov: '—', stock: 'na', stockQty: 0, freshness: 'none' },
  // Pomos / tiradores
  { cod: 'ACTIR00501', grupo: 'AC', linea: 'TIR', nombre: 'Tirador inox tipo barra 256mm', und: 'UND', precio: 28500, fecha: '2026-04-06', prov: 'ACINOX', stock: 'ok', stockQty: 180, freshness: 'ok' },
  { cod: 'ACTIR00601', grupo: 'AC', linea: 'TIR', nombre: 'Tirador inox tipo U 128mm', und: 'UND', precio: 18400, fecha: '2026-03-22', prov: 'ACINOX', stock: 'ok', stockQty: 240, freshness: 'ok' },
  { cod: 'ACBIS00301', grupo: 'AC', linea: 'BIS', nombre: 'Bisagra cierre suave cazoleta 35mm', und: 'UND', precio: 4800, fecha: '2026-04-13', prov: 'ACINOX', stock: 'ok', stockQty: 620, freshness: 'ok' },
];

const PROVEEDORES = {
  'HIERROS HB':            { nombre: 'Hierros HB S.A.', city: 'Medellín',    nit: '890.901.234-5', scores: [3,2,3], rating: 'preferido' },
  'WESCO':                 { nombre: 'Wesco Colombia',   city: 'Bogotá',      nit: '860.002.776-1', scores: [2,2,3], rating: '' },
  'IMPORINOX':             { nombre: 'Importadora Inox', city: 'Medellín',    nit: '900.123.456-7', scores: [3,3,2], rating: 'preferido' },
  'CORTEACEROS':           { nombre: 'Corteaceros SAS',  city: 'Itagüí',      nit: '901.456.789-3', scores: [2,3,2], rating: '' },
  'INVERSINOX':            { nombre: 'Inversinox Ltda.', city: 'Medellín',    nit: '900.555.012-8', scores: [3,3,3], rating: 'preferido' },
  'DISTRIVALVULAS':        { nombre: 'Distrivalvulas',   city: 'Bogotá',      nit: '800.234.567-9', scores: [2,2,2], rating: '' },
  'ACINOX':                { nombre: 'Acinox Colombia',  city: 'Cali',        nit: '900.678.901-2', scores: [2,3,3], rating: '' },
  'STECKERL':              { nombre: 'Steckerl Aceros',  city: 'Barranquilla',nit: '890.112.245-0', scores: [3,1,3], rating: '' },
  'TECNIFLUIDOS':          { nombre: 'Tecnifluidos SAS', city: 'Bogotá',      nit: '901.345.678-4', scores: [2,3,2], rating: '' },
  'VITELCO':               { nombre: 'Vitelco S.A.',     city: 'Medellín',    nit: '890.903.115-5', scores: [3,2,2], rating: '' },
  'MUNDIAL DE TORNILLOS':  { nombre: 'Mundial Tornillos',city: 'Medellín',    nit: '900.111.222-3', scores: [3,3,3], rating: 'preferido' },
};

// Historical price spark for AILAL00102
const PRICE_HIST = [
  { fecha: '2025-10', precio: 445000, prov: 'IMPORINOX' },
  { fecha: '2025-12', precio: 460000, prov: 'IMPORINOX' },
  { fecha: '2026-01', precio: 458000, prov: 'WESCO'     },
  { fecha: '2026-02', precio: 472000, prov: 'IMPORINOX' },
  { fecha: '2026-03', precio: 478000, prov: 'IMPORINOX' },
  { fecha: '2026-04', precio: 485000, prov: 'IMPORINOX' },
];

// Solicitudes de material (bandeja compras)
const SOLICITUDES = [
  { id: 'SM-0412', estado: 'por_cotizar', cod: 'AILAL00104', nombre: 'Lámina inox lisa mate cal. 1/4"', qty: 8, und: 'UND', residente: 'M. Ruiz',    proyecto: 'Hospital San Vicente — Cocina central', urgencia: 'alta', fecha: '2026-04-16', hasPrice: true },
  { id: 'SM-0413', estado: 'por_cotizar', cod: 'AITCR01401', nombre: 'Tubo redondo inox 2" cal. 14',    qty: 36,und: 'ML',  residente: 'J. Castro',  proyecto: 'Megamercados La 65',                   urgencia: 'media',fecha: '2026-04-16', hasPrice: true },
  { id: 'SM-0414', estado: 'por_cotizar', cod: '—',          nombre: 'Perfil L bronce 1" (no catálogo)',qty: 4, und: 'ML',  residente: 'M. Ruiz',    proyecto: 'Hospital San Vicente — Cocina central', urgencia: 'baja', fecha: '2026-04-15', hasPrice: false },
  { id: 'SM-0411', estado: 'cotizando',   cod: 'GRLAV00201', nombre: 'Grifo pedal industrial inox',    qty: 6, und: 'UND', residente: 'J. Castro',  proyecto: 'Clínica Las Vegas',                     urgencia: 'media',fecha: '2026-04-15', hasPrice: true },
  { id: 'SM-0410', estado: 'cotizando',   cod: 'ACPLC01401', nombre: 'Platina acero carbono 1" x 1/8"',qty: 45,und: 'ML',  residente: 'A. Tamayo',  proyecto: 'Restaurante Carmen',                    urgencia: 'alta', fecha: '2026-04-14', hasPrice: false },
  { id: 'SM-0409', estado: 'oc_emitida',  cod: 'AILAL00102', nombre: 'Lámina inox lisa mate cal. 1/8"',qty: 12,und: 'UND', residente: 'M. Ruiz',    proyecto: 'Hospital San Vicente — Cocina central', urgencia: 'alta', fecha: '2026-04-12', hasPrice: true, oc: 'OC-2026-0341' },
  { id: 'SM-0408', estado: 'oc_emitida',  cod: 'AITCR01201', nombre: 'Tubo redondo inox 1" cal. 16',   qty: 80,und: 'ML',  residente: 'J. Castro',  proyecto: 'Megamercados La 65',                   urgencia: 'media',fecha: '2026-04-11', hasPrice: true, oc: 'OC-2026-0340' },
  { id: 'SM-0407', estado: 'recibido',    cod: 'TOTMH00814', nombre: 'Tornillo M8 x 25mm inox',        qty: 500,und:'UND', residente: 'Almacén',    proyecto: 'Stock general',                         urgencia: 'baja', fecha: '2026-04-08', hasPrice: true, oc: 'OC-2026-0338' },
  { id: 'SM-0406', estado: 'recibido',    cod: 'ACBIS00301', nombre: 'Bisagra cierre suave 35mm',      qty: 120,und:'UND', residente: 'Almacén',    proyecto: 'Stock general',                         urgencia: 'baja', fecha: '2026-04-07', hasPrice: true, oc: 'OC-2026-0337' },
];

// Cotización de cliente (ejemplo)
const COTIZACION = {
  id: 'COT-2026-0482',
  empresa: 'Hospital San Vicente Fundación',
  contacto: 'Dr. Martín Arango · Jefe de Infraestructura',
  proyecto: 'Cocina central — Torre Quirúrgica',
  estado: 'borrador',
  version: 'B',
  versiones: [
    { v: 'A', fecha: '2026-04-08', total: 78420000, delta: '—',          nota: 'Propuesta inicial, 9 productos' },
    { v: 'B', fecha: '2026-04-14', total: 82150000, delta: '+3.73 M',    nota: 'Añadido lavavasos doble seno' },
    { v: 'C', fecha: '—',          total: null,     delta: '',           nota: 'En preparación' },
  ],
  cotizador: 'CM', cotizadorNombre: 'Catalina Múnera',
  fechaCreada: '2026-04-08',
  validez: '30 días',
  tiempoEntrega: '35 días hábiles',
  transporte: 'Incluido hasta planta Medellín',
  productos: [
    {
      id: 'P1', nombre: 'Mesa de trabajo doble seno 2.4m',
      spec: 'Acero inox 304 · sobre cal. 1/8" · 2 entrepaños · patas tubo 1.5"',
      qty: 2, precio: 8450000, subtotal: 16900000,
      apu: [
        { cod: 'AILAL00102', desc: 'Lámina inox lisa mate cal. 1/8"',    qty: 1.25, und: 'UND', punit: 485000,  fecha: '2026-04-02', prov: 'IMPORINOX', subtotal: 606250,  status: 'default', freshness: 'ok' },
        { cod: 'AITCR01202', desc: 'Tubo redondo inox 1 1/2" cal. 16',   qty: 6.80, und: 'ML',  punit: 54200,   fecha: '2026-03-30', prov: 'INVERSINOX', subtotal: 368560, status: 'default', freshness: 'ok' },
        { cod: 'TOTAR00614', desc: 'Tornillo autorroscante 6 x 1/2"',    qty: 48,   und: 'UND', punit: 180,     fecha: '2026-04-14', prov: 'MUNDIAL',    subtotal: 8640,   status: 'default', freshness: 'ok' },
        { cod: 'ACTIR00501', desc: 'Tirador inox tipo barra 256mm',      qty: 4,    und: 'UND', punit: 28500,   fecha: '2026-04-06', prov: 'ACINOX',     subtotal: 114000, status: 'override',override: 26800, freshness: 'ok' },
        { cod: 'ACPLC01401', desc: 'Platina acero carbono 1" x 1/8"',    qty: 3.20, und: 'ML',  punit: 8400,    fecha: '2025-12-20', prov: 'CORTEACEROS',subtotal: 26880,  status: 'alert',   freshness: 'old' },
      ],
    },
    {
      id: 'P2', nombre: 'Campana extracción 3.0m × 1.1m',
      spec: 'Acero inox 430 · filtros metálicos · ducto 14" · luminaria LED',
      qty: 1, precio: 12800000, subtotal: 12800000,
      apu: [
        { cod: 'AILAL00102', desc: 'Lámina inox lisa mate cal. 1/8"',    qty: 2.10, und: 'UND', punit: 485000, fecha: '2026-04-02', prov: 'IMPORINOX', subtotal: 1018500, status: 'default', freshness: 'ok' },
        { cod: 'AILAL00201', desc: 'Lámina inox brillante cal. 1/8"',    qty: 0.80, und: 'UND', punit: 520000, fecha: '2026-04-10', prov: 'IMPORINOX', subtotal: 416000,  status: 'default', freshness: 'ok' },
        { cod: 'ELCAB00302', desc: 'Cable encauchetado 3x14 AWG',        qty: 12,   und: 'ML',  punit: 8900,   fecha: '2026-04-05', prov: 'VITELCO',   subtotal: 106800,  status: 'default', freshness: 'ok' },
        { cod: 'ELTER00101', desc: 'Termostato digital 220V industrial', qty: 1,    und: 'UND', punit: 0,      fecha: '—',          prov: '—',         subtotal: 0,       status: 'missing', freshness: 'none' },
      ],
    },
    {
      id: 'P3', nombre: 'Lavavasos doble seno automático',
      spec: 'Doble cuba 600×500×350 · grifo pedal · desagüe 2"',
      qty: 3, precio: 6850000, subtotal: 20550000,
      apu: [
        { cod: 'AILAL00104', desc: 'Lámina inox lisa mate cal. 1/4"',    qty: 1.80, und: 'UND', punit: 789000, fecha: '2026-02-18', prov: 'WESCO',         subtotal: 1420200, status: 'default', freshness: 'mid' },
        { cod: 'GRLAV00201', desc: 'Grifo pedal industrial inox',        qty: 2,    und: 'UND', punit: 380000, fecha: '2026-02-28', prov: 'DISTRIVALVULAS',subtotal: 760000,  status: 'default', freshness: 'mid' },
        { cod: 'GRVAL00301', desc: 'Válvula de bola 1/2" inox 316',      qty: 4,    und: 'UND', punit: 68000,  fecha: '2026-04-01', prov: 'TECNIFLUIDOS',  subtotal: 272000,  status: 'default', freshness: 'ok' },
      ],
    },
  ],
};

// Group/linea taxonomy
const GRUPOS = [
  { c: 'AI', n: 'Acero inox',         count: 324 },
  { c: 'AC', n: 'Acero al carbono',   count: 218 },
  { c: 'AL', n: 'Aluminio',           count: 96  },
  { c: 'TO', n: 'Tornillería',        count: 186 },
  { c: 'GR', n: 'Grifería / plomería',count: 143 },
  { c: 'EL', n: 'Eléctrico',          count: 128 },
  { c: 'MA', n: 'Madera / tableros',  count: 89  },
  { c: 'VI', n: 'Vidrios',            count: 42  },
  { c: 'OT', n: 'Otros',              count: 324 },
];

const fmt = (n) => n == null ? '—' : '$' + Math.round(n).toLocaleString('es-CO');
const fmtShort = (n) => {
  if (n == null) return '—';
  if (n >= 1e6) return '$' + (n/1e6).toFixed(1) + 'M';
  if (n >= 1e3) return '$' + (n/1e3).toFixed(0) + 'k';
  return '$' + Math.round(n);
};
const daysAgo = (iso) => {
  if (!iso || iso === '—') return null;
  const d = new Date(iso); const now = new Date('2026-04-18');
  return Math.round((now - d) / (1000*60*60*24));
};

Object.assign(window, { MATERIALES, PROVEEDORES, PRICE_HIST, SOLICITUDES, COTIZACION, GRUPOS, fmt, fmtShort, daysAgo });

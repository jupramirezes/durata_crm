// Seed data mirroring the real domain (empresas, cotizaciones visible in screenshots)

const STAGES = [
  { key: 'nuevo_lead',         label: 'Nuevo Lead',             short: 'Lead',        dot: 'dot-lead',    color: 'var(--s-lead)'    },
  { key: 'en_cotizacion',      label: 'En Cotización',          short: 'Cotizando',   dot: 'dot-cotiz',   color: 'var(--s-cotiz)'   },
  { key: 'cotizacion_enviada', label: 'Cotización Enviada',     short: 'Enviada',     dot: 'dot-enviada', color: 'var(--s-enviada)' },
  { key: 'en_seguimiento',     label: 'En Seguimiento',         short: 'Seguimiento', dot: 'dot-seg',     color: 'var(--s-seg)'     },
  { key: 'en_negociacion',     label: 'En Negociación',         short: 'Negoc.',      dot: 'dot-neg',     color: 'var(--s-neg)'     },
  { key: 'adjudicada',         label: 'Adjudicada',             short: 'Adj.',        dot: 'dot-adj',     color: 'var(--s-adj)'     },
  { key: 'recotizada',         label: 'Recotizada/Consolidada', short: 'Recotiz.',    dot: 'dot-recot',   color: 'var(--s-recot)'   },
  { key: 'perdida',            label: 'Perdida',                short: 'Perdida',     dot: 'dot-perd',    color: 'var(--s-perd)'    },
];

const COTIZADORES = [
  { id: 'OC',  ini: 'OC', name: 'Omar Cossio' },
  { id: 'SA',  ini: 'SA', name: 'Sebastián Aguirre' },
  { id: 'JR',  ini: 'JR', name: 'Juan Pablo Ramírez' },
  { id: 'CA',  ini: 'CA', name: 'Camilo Araque' },
  { id: 'DG',  ini: 'DG', name: 'Daniela Galindo' },
];

// Deterministic RNG so layout stays stable between renders
function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

const rng = mulberry32(42);
const pick = (arr) => arr[Math.floor(rng() * arr.length)];

const COMPANIES = [
  'ENTORNO AZUL','IDEAS ATIR','CONINSA','CONCONCRETO','SENA','MENSULA','SERVISAFE',
  'CONSTRUCCIONES Y SERVICIOS','INDECO CONSTRUCTORA','DINPRO','ECOVIVIR','CONSORCIO JARDÍN MH',
  'CITEC','LE BRUNCH','UJAM','LABMASTER','NEUTRA','ANGEL Y ANGEL ARQUITECTURA',
  'CONVEL','CONSORCIO SAN FELIPE','PROYECTOS CONSTRUSAR','HOSPITAL PABLO TOBÓN URIBE',
  'COCOROLLO','3 CORDILLERAS','AIA','CLIENTE SEBAS','CARCAMO','ORVANN','LA MIGUERIA',
  'FERRETERÍA SAN DIEGO','CLÍNICA SOMA','GRUPO ÉXITO','KRIKET','DOÑA ARTURA','PARRILLA CAMPO',
];

const CONTACTS = [
  'Felipe Ospina','Gregory Alexander Perez Galicia','José Camilo Gonzáles Jaramillo',
  'Ing. Juan Diego Mejía','Carlos Martínez','Luz Ochoa','Luis Carlos Velasco Alzate',
  'Natalia Ramírez','Rita Tovar','Ana María Vallejo Roman','Ing. Fredy Restrepo',
  'Gregory Alexander Perez Galicia','Daniela Pazmiño','Sofia Bedoya','Natalia Cuartas',
  'Ing. Paul Becerra R','Tania Ospina','Giovanni Restrepo','Fr. Izabeth Arango',
  'Felipe Méndez','Pablo Restrepo','Sergio Arbeláez',
];

const SECTORES = ['Restaurantes','Clínicas/Hospitales','Hoteles','Industrial','Residencial','Institucional','Comercial'];

function formatCOP(n, { short = false } = {}) {
  if (short) {
    if (n >= 1e9) return '$' + (n / 1e9).toFixed(2).replace(/\.?0+$/, '') + 'B';
    if (n >= 1e6) return '$' + (n / 1e6).toFixed(1).replace(/\.?0+$/, '') + 'M';
    if (n >= 1e3) return '$' + (n / 1e3).toFixed(0) + 'k';
    return '$' + n;
  }
  return '$' + Math.round(n).toLocaleString('es-CO');
}

// Realistic fake opportunities
function makeOpp(i, stageKey) {
  const stage = STAGES.find(s => s.key === stageKey);
  const company = pick(COMPANIES);
  const contact = pick(CONTACTS);
  const cot = pick(COTIZADORES);
  const value = Math.round((20 + rng() * 780) * 1e6);
  const age = Math.floor(rng() * 90) + 1;
  const num = `2026-${String(140 + i).padStart(3, '0')}`;
  const sector = pick(SECTORES);
  return {
    id: 'opp-' + i,
    company, contact, cot,
    stage: stageKey, stageLabel: stage.label, stageDot: stage.dot, stageColor: stage.color,
    value, age, num, sector,
    noResponse: (stageKey === 'cotizacion_enviada' || stageKey === 'en_seguimiento') && age > 7,
  };
}

// Distribution roughly matching the dashboard screenshot
const PIPELINE_COUNTS = {
  nuevo_lead: 9,
  en_cotizacion: 0,
  cotizacion_enviada: 197,
  en_seguimiento: 8,
  en_negociacion: 25,
  adjudicada: 1361,
  recotizada: 0,
  perdida: 3587,
};

// For kanban we'll render a reasonable subset per column
const KANBAN_SAMPLE = {
  nuevo_lead: 7,
  en_cotizacion: 6,
  cotizacion_enviada: 12,
  en_seguimiento: 8,
  en_negociacion: 9,
  adjudicada: 10,
  recotizada: 4,
  perdida: 12,
};

const OPPS = [];
let idx = 0;
for (const stage of STAGES) {
  const n = KANBAN_SAMPLE[stage.key];
  for (let i = 0; i < n; i++) { OPPS.push(makeOpp(idx++, stage.key)); }
}

// Sort each column by value desc so highest values surface
const OPPS_BY_STAGE = Object.fromEntries(
  STAGES.map(s => [s.key, OPPS.filter(o => o.stage === s.key).sort((a,b) => b.value - a.value)])
);

const TOTAL_BY_STAGE = Object.fromEntries(
  STAGES.map(s => [
    s.key,
    OPPS_BY_STAGE[s.key].reduce((acc, o) => acc + o.value, 0),
  ])
);

// Featured opportunity for the detail page
const FEATURED = {
  id: 'opp-entorno-azul-341',
  num: '2026-341',
  project: 'ECO SQUARE CR X 50UND',
  company: 'ENTORNO AZUL',
  contact: 'Felipe Ospina',
  stage: 'cotizacion_enviada',
  stageLabel: 'Cotización Enviada',
  cotizador: { id: 'SA', ini: 'SA', name: 'Sebastián Aguirre' },
  value: 76_800_000,
  estValue: 80_000_000,
  cost: 54_000_000,
  margin: 0.297,
  ingreso: '02/03/2026',
  envio: '02/03/2026',
  pipelineDays: 45,
  fuente: 'Histórico Excel',
  ubicacion: 'ECO SQUARE CR X 50UND',
  sector: 'Persona Natural',
  nit: '—',
  historicoCotizado: 1_769_515_000,
  products: [
    {
      name: 'Cárcamo industrial acero inox.',
      sku: 'CARC-01',
      spec: '1.00 × 0.25 × 0.10 m · cal.18 · tapa cal.12',
      desc: 'Suministro de cárcamo industrial en acero inoxidable AISI 304 calibre 18, con tapa en lámina cal.12 antideslizante, tubo de desagüe 2 pulg cal.18, pendiente interna para drenaje, bordes redondeados sanitarios, soldaduras TIG con gas argón, acabado pulido sanitario.',
      qty: 50,
      unit: 587_000,
    },
    {
      name: 'Mesa de trabajo con entrepaño',
      sku: 'MES-02',
      spec: '2.00 × 0.70 × 0.90 m · cal.16 · 1 entrepaño',
      desc: 'Mesa de trabajo en acero inoxidable AISI 304 cal.16, patas tubulares 38×38mm, entrepaño inferior cal.18, refuerzos tipo omega, niveladores inox ajustables. Acabado mate sanitario.',
      qty: 4,
      unit: 2_180_000,
    },
  ],
  quotes: [
    { num: '2026-341', date: '01/03/2026', state: 'enviada', total: 76_800_000,
      files: [
        { ext: 'xlsx', name: '2026-341.xlsx', size: '48 KB' },
        { ext: 'pdf', name: 'COTIZACIÓN 2026-341 ECO SQUARE — ENTORNO AZUL — FELIPE OSPINA.pdf', size: '312 KB' },
      ]
    },
  ],
  attachments: [
    { ext: 'pdf', name: 'RFQ_ECO_SQUARE_v2.pdf', size: '824 KB' },
    { ext: 'jpg', name: 'plano_locacion.jpg', size: '1.2 MB' },
    { ext: 'xlsx', name: 'especificaciones-cliente.xlsx', size: '64 KB' },
  ],
  timeline: [
    { k: 'sent',    title: 'Cotización 2026-341 enviada', detail: 'PDF enviado a felipe@entornoazul.co · 76.800.000', time: '01/03/2026 · 3:42 PM', accent: true },
    { k: 'quote',   title: 'Cotización 2026-341 generada', detail: '2 productos · margen 29.7% · costo $54.000.000', time: '01/03/2026 · 3:18 PM' },
    { k: 'product', title: 'Producto configurado: Cárcamo × 50',        detail: 'S.A — Sebastián Aguirre', time: '01/03/2026 · 2:55 PM' },
    { k: 'product', title: 'Producto configurado: Mesa trabajo × 4',    detail: 'S.A — Sebastián Aguirre', time: '01/03/2026 · 2:30 PM' },
    { k: 'stage',   title: 'Etapa: Nuevo Lead → En Cotización',          detail: '', time: '01/03/2026 · 2:12 PM' },
    { k: 'create',  title: 'Oportunidad creada desde Histórico Excel',    detail: 'Asignada a S.A — Sebastián Aguirre', time: '02/03/2026 · 8:00 AM' },
  ],
};

// Dashboard KPIs
const KPI = {
  active: 239,
  pipelineValue: 5_043_390_383,
  monthQuotes: 39,
  monthQuotesValue: 781_177_397,
  closeRateCount: 0.28,
  closeRateValue: 0.09,
  alertsOverdue: 185,
};

// Monthly comparison (Jan-Apr 2026 vs 2025)
const COMPARATIVO = [
  { k: 'Cotizaciones',    a: 393,            b: 399,           unit: '' },
  { k: 'Valor cotizado',  a: 11_335_433_941, b: 9_735_844_154, unit: '$' },
  { k: 'Adjudicaciones',  a: 115,            b: 111,           unit: '' },
  { k: 'Valor adjudicado', a: 573_192_059,   b: 1_074_406_899, unit: '$' },
  { k: '% Adjudicación',  a: 5.1,            b: 11.0,          unit: '%' },
  { k: 'Días promedio',   a: 2.1,            b: 3.0,           unit: 'd' },
];

// Monthly metrics (last 6 months)
const MONTHLY = [
  { m: 'Nov 2025', cotiz: 68, cotizVal: 1_420_000_000, adj: 18, adjVal: 412_000_000, rate: 0.265 },
  { m: 'Dic 2025', cotiz: 52, cotizVal: 1_180_000_000, adj: 14, adjVal: 298_000_000, rate: 0.269 },
  { m: 'Ene 2026', cotiz: 91, cotizVal: 2_040_000_000, adj: 28, adjVal: 488_000_000, rate: 0.308 },
  { m: 'Feb 2026', cotiz: 104,cotizVal: 2_420_000_000, adj: 32, adjVal: 520_000_000, rate: 0.308 },
  { m: 'Mar 2026', cotiz: 165,cotizVal: 3_060_000_000, adj: 42, adjVal: 774_000_000, rate: 0.254 },
  { m: 'Abr 2026', cotiz: 39, cotizVal: 781_177_397,   adj: 11, adjVal: 218_400_000, rate: 0.282 },
];

// Today's alerts (top offenders — cotizaciones sin respuesta)
const STALE_OPPS = [
  { num: '2026-341', company: 'ENTORNO AZUL', contact: 'Felipe Ospina', value: 76_800_000,  days: 45, cot: 'SA' },
  { num: '2026-250', company: 'CONCONCRETO',  contact: 'José Camilo Gonzáles J.', value: 404_834_413, days: 67, cot: 'SA' },
  { num: '2026-314', company: 'IDEAS ATIR',   contact: 'Gregory A. Pérez',  value: 94_127_441,  days: 82, cot: 'SA' },
  { num: '2026-350', company: 'ENTORNO AZUL', contact: 'Felipe Ospina', value: 102_400_000, days: 45, cot: 'SA' },
  { num: '2026-296', company: 'ECOVIVIR',     contact: 'Natalia Ramírez',  value: 34_038_000,  days: 60, cot: 'JR' },
  { num: '2026-444', company: 'CONSORCIO JARDÍN MH', contact: 'Daniela Pazmiño', value: 420_020_733, days: 4,  cot: 'CA' },
];

// Empresas list (derived) with extra metadata
const EMPRESAS_LIST = [
  { id: 1, name: 'ENTORNO AZUL',              sector: 'Institucional',     nit: '901.234.567-1', contact: 'Felipe Ospina',           contacts: 3, opps: 12, adj: 4,  total: 1_769_515_000, city: 'Bogotá',    last: '45d' },
  { id: 2, name: 'CONCONCRETO',               sector: 'Industrial',        nit: '890.901.826-5', contact: 'José Camilo Gonzáles',    contacts: 5, opps: 8,  adj: 3,  total: 2_401_032_000, city: 'Medellín',  last: '67d' },
  { id: 3, name: 'IDEAS ATIR',                sector: 'Comercial',         nit: '901.488.210-2', contact: 'Gregory A. Pérez',        contacts: 2, opps: 14, adj: 6,  total: 894_340_000,   city: 'Bogotá',    last: '4d'  },
  { id: 4, name: 'CONSORCIO JARDÍN MH',       sector: 'Residencial',       nit: '901.772.103-9', contact: 'Daniela Pazmiño',         contacts: 4, opps: 3,  adj: 1,  total: 420_020_733,   city: 'Medellín',  last: '4d'  },
  { id: 5, name: 'HOSPITAL PABLO TOBÓN URIBE',sector: 'Clínicas/Hospitales', nit: '890.901.826-9', contact: 'Ana María Vallejo',     contacts: 6, opps: 11, adj: 5,  total: 1_120_580_000, city: 'Medellín',  last: '2d'  },
  { id: 6, name: 'SENA',                      sector: 'Institucional',     nit: '899.999.034-1', contact: 'Ing. Juan Diego Mejía',   contacts: 3, opps: 6,  adj: 2,  total: 670_090_000,   city: 'Bogotá',    last: '12d' },
  { id: 7, name: 'MENSULA',                   sector: 'Industrial',        nit: '900.412.890-5', contact: 'Carlos Martínez',         contacts: 2, opps: 5,  adj: 2,  total: 540_120_000,   city: 'Medellín',  last: '82d' },
  { id: 8, name: 'INDECO CONSTRUCTORA',       sector: 'Residencial',       nit: '901.330.221-7', contact: 'Luis Carlos Velasco',     contacts: 3, opps: 9,  adj: 4,  total: 1_220_450_000, city: 'Bogotá',    last: '3d'  },
  { id: 9, name: 'SERVISAFE',                 sector: 'Industrial',        nit: '900.822.103-0', contact: 'Pablo Restrepo',          contacts: 2, opps: 4,  adj: 1,  total: 196_584_500,   city: 'Cali',      last: '18d' },
  { id: 10,name: 'CITEC',                     sector: 'Restaurantes',      nit: '900.115.900-1', contact: 'Sergio Arbeláez',         contacts: 1, opps: 3,  adj: 0,  total: 85_900_000,    city: 'Medellín',  last: '91d' },
  { id: 11,name: 'ECOVIVIR',                  sector: 'Residencial',       nit: '901.404.001-8', contact: 'Natalia Ramírez',         contacts: 2, opps: 7,  adj: 3,  total: 412_080_000,   city: 'Bogotá',    last: '61d' },
  { id: 12,name: 'LE BRUNCH',                 sector: 'Restaurantes',      nit: '900.780.220-4', contact: 'Felipe Méndez',           contacts: 2, opps: 4,  adj: 2,  total: 68_620_000,    city: 'Medellín',  last: '6d'  },
];

// Cotizaciones list (derived)
const COTS_LIST = [
  { num: '2026-341', date: '01/03/2026', company: 'ENTORNO AZUL',    contact: 'Felipe Ospina', cot: 'SA', state: 'enviada',    total: 76_800_000,  items: 2, attach: 2 },
  { num: '2026-444', date: '04/04/2026', company: 'CONSORCIO JARDÍN',contact: 'Daniela Pazmiño',cot: 'CA', state: 'aprobada',    total: 420_020_733, items: 8, attach: 4 },
  { num: '2026-350', date: '02/03/2026', company: 'ENTORNO AZUL',    contact: 'Felipe Ospina', cot: 'SA', state: 'enviada',    total: 102_400_000, items: 3, attach: 1 },
  { num: '2026-482', date: '15/04/2026', company: 'CLIENTE SEBAS',   contact: 'Sofía Bedoya',  cot: 'SA', state: 'borrador',   total: 0,           items: 0, attach: 0 },
  { num: '2026-250', date: '11/02/2026', company: 'CONCONCRETO',     contact: 'José Camilo G.',cot: 'SA', state: 'enviada',    total: 404_834_413, items: 12, attach: 3 },
  { num: '2026-314', date: '17/02/2026', company: 'IDEAS ATIR',      contact: 'Gregory Pérez', cot: 'SA', state: 'rechazada',  total: 94_127_441,  items: 5, attach: 2 },
  { num: '2026-411', date: '22/03/2026', company: 'ENTORNO AZUL',    contact: 'Felipe Ospina', cot: 'SA', state: 'enviada',    total: 62_650_000,  items: 2, attach: 2 },
  { num: '2026-478', date: '13/04/2026', company: 'AIA',             contact: 'Sofía Bedoya',  cot: 'JR', state: 'borrador',   total: 0,           items: 0, attach: 0 },
  { num: '2026-430', date: '28/03/2026', company: 'INDECO',          contact: 'Luis Velasco',  cot: 'OC', state: 'aprobada',   total: 127_691_030, items: 6, attach: 3 },
  { num: '2026-296', date: '08/02/2026', company: 'ECOVIVIR',        contact: 'Natalia Ramírez',cot: 'JR', state: 'enviada',    total: 34_038_000,  items: 1, attach: 1 },
  { num: '2026-298', date: '09/02/2026', company: 'DINPRO',          contact: 'Luz Ochoa',     cot: 'JR', state: 'enviada',    total: 106_247_067, items: 4, attach: 2 },
  { num: '2026-172', date: '20/01/2026', company: 'CONVEL',          contact: 'Tania Ospina',  cot: 'OC', state: 'descartada', total: 19_917_800,  items: 1, attach: 0 },
];

// Precios maestros (materiales)
const PRECIOS = [
  { grupo: 'Aceros',   sub: 'Lámina',  codigo: 'AC-304-CAL18-1220x2440', nombre: 'Acero inox AISI 304 cal.18 · lámina',   unidad: 'm²', precio: 98_964,  prov: 'Aceros La Perla',    updated: '14/04/2026' },
  { grupo: 'Aceros',   sub: 'Lámina',  codigo: 'AC-304-CAL16-1220x2440', nombre: 'Acero inox AISI 304 cal.16 · lámina',   unidad: 'm²', precio: 122_150, prov: 'Aceros La Perla',    updated: '14/04/2026' },
  { grupo: 'Aceros',   sub: 'Lámina',  codigo: 'AC-304-CAL12-1220x2440', nombre: 'Acero inox AISI 304 cal.12 · lámina',   unidad: 'm²', precio: 213_247, prov: 'Aceros La Perla',    updated: '14/04/2026' },
  { grupo: 'Aceros',   sub: 'Tubo',    codigo: 'TU-304-38x38-CAL18',     nombre: 'Tubo inox 38×38mm cal.18',              unidad: 'm',  precio: 28_400,  prov: 'Tubería Andina',     updated: '10/04/2026' },
  { grupo: 'Aceros',   sub: 'Tubo',    codigo: 'TU-304-2PULG-CAL18',     nombre: 'Tubo inox 2" cal.18 · desagüe',         unidad: 'm',  precio: 23_693,  prov: 'Tubería Andina',     updated: '10/04/2026' },
  { grupo: 'Consumibles',sub:'Soldadura',codigo:'CON-ARGON-BOTELLA',     nombre: 'Argón botella 6m³',                     unidad: 'un', precio: 8_000,   prov: 'Gases Industriales', updated: '03/04/2026' },
  { grupo: 'Abrasivos',sub:'Disco',     codigo:'AB-CORTE-115',           nombre: 'Disco corte 115mm',                     unidad: 'un', precio: 1_483,   prov: 'Sena Ferretería',    updated: '05/04/2026' },
  { grupo: 'Abrasivos',sub:'Disco',     codigo:'AB-FLAP-115',            nombre: 'Disco flap 115mm',                      unidad: 'un', precio: 21_073,  prov: 'Sena Ferretería',    updated: '05/04/2026' },
  { grupo: 'Acabados', sub:'Paño',      codigo:'AC-SCOTCHBRITE',         nombre: 'Paño Scotch-Brite',                     unidad: 'un', precio: 5_644,   prov: 'Sena Ferretería',    updated: '05/04/2026' },
  { grupo: 'Accesorios',sub:'Rueda',    codigo:'ACC-RU-INOX-3-FRENO',    nombre: 'Rueda inox 3" con freno',               unidad: 'un', precio: 62_300,  prov: 'Ruedas CO',          updated: '28/03/2026' },
  { grupo: 'Accesorios',sub:'Nivelador',codigo:'ACC-NIV-INOX-CUADRADO',  nombre: 'Nivelador inox cuadrado',               unidad: 'un', precio: 18_900,  prov: 'Ruedas CO',          updated: '28/03/2026' },
  { grupo: 'Servicios',sub:'Corte',     codigo:'SRV-CORTE-LASER',        nombre: 'Corte láser (por metro lineal)',        unidad: 'm',  precio: 12_500,  prov: 'Láser Medellín',     updated: '01/04/2026' },
];

// Product catalog for configurator
const PRODUCTS_CATALOG = [
  { id: 'mesa',     name: 'Mesa de trabajo',       cat: 'Mesas',    base: 2_180_000, desc: 'Mesa industrial en acero inox. con entrepaño' },
  { id: 'carcamo',  name: 'Cárcamo industrial',    cat: 'Drenaje',  base: 587_000,   desc: 'Cárcamo con tapa antideslizante y desagüe' },
  { id: 'poyo',     name: 'Poyo con pozuelo',      cat: 'Mesas',    base: 3_450_000, desc: 'Poyo de lavado con pozuelo integrado' },
  { id: 'estante',  name: 'Estantería abierta',    cat: 'Almacen.', base: 1_620_000, desc: 'Estantería modular de 4 entrepaños' },
  { id: 'campana',  name: 'Campana extractora',    cat: 'Cocina',   base: 4_280_000, desc: 'Campana tipo isla en acero 304' },
  { id: 'vertedero',name: 'Vertedero sanitario',   cat: 'Drenaje',  base: 1_240_000, desc: 'Vertedero con push pedal' },
  { id: 'babero',   name: 'Babero salpicadero',    cat: 'Mesas',    base: 580_000,   desc: 'Babero lateral y posterior' },
  { id: 'gabinete', name: 'Gabinete colgante',     cat: 'Almacen.', base: 2_040_000, desc: 'Gabinete superior con puertas abatibles' },
];

Object.assign(window, { STAGES, COTIZADORES, OPPS, OPPS_BY_STAGE, TOTAL_BY_STAGE, PIPELINE_COUNTS, FEATURED, KPI, COMPARATIVO, MONTHLY, STALE_OPPS, formatCOP, EMPRESAS_LIST, COTS_LIST, PRECIOS, PRODUCTS_CATALOG });

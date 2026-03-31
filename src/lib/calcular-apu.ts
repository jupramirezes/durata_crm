// DEPRECATED: Reemplazado por motor-generico.ts + evaluar-formula.ts
// El motor genérico lee fórmulas desde Supabase en vez de tenerlas hardcoded.
// Mantener como referencia hasta verificar todos los productos. No importar.

import { ConfigMesa, ApuResultado, ApuLinea, PrecioMaestro } from '../types'

// ============================================================
// MATERIAL CODE MAPPINGS (from MESAS.xlsm APU sheet)
// ============================================================

// Lámina codes: tipo_acero + acabado + calibre → código Supabase
const LAMINA_CODES: Record<string, string> = {
  // 304 Mate
  '304_mate_cal_12': 'AILA010112',
  '304_mate_cal_14': 'AILA010114',
  '304_mate_cal_16': 'AILA010116',
  '304_mate_cal_18': 'AILA010118',
  '304_mate_cal_20': 'AILA010120',
  '304_mate_cal_22': 'AILA010122',
  '304_mate_cal_24': 'AILA010124',
  '304_mate_1/8': 'AILA010102',
  '304_mate_3/16': 'AILA010103',
  '304_mate_1/4': 'AILA010104',
  '304_mate_3/8': 'AILA010106',
  // 304 Satinado
  '304_satinado_cal_12': 'AILA010212',
  '304_satinado_cal_14': 'AILA010214',
  '304_satinado_cal_16': 'AILA010216',
  '304_satinado_cal_18': 'AILA010218',
  '304_satinado_cal_20': 'AILA010220',
  '304_satinado_cal_22': 'AILA010222',
  '304_satinado_1/8': 'AILA010203',
  // 430 Mate (2B) — cal_14/16/18 use satinado codes as price proxy (no separate 2B exists)
  '430_mate_cal_14': 'AILA020214',
  '430_mate_cal_16': 'AILA020216',
  '430_mate_cal_18': 'AILA020218',
  '430_mate_cal_20': 'AILA020120',
  // 430 Satinado
  '430_satinado_cal_14': 'AILA020214',
  '430_satinado_cal_16': 'AILA020216',
  '430_satinado_cal_18': 'AILA020218',
  '430_satinado_cal_20': 'AILA020220',
  // 430 Brillante
  '430_brillante_cal_14': 'AILA020314',
  '430_brillante_cal_16': 'AILA020316',
  '430_brillante_cal_18': 'AILA020318',
  '430_brillante_cal_20': 'AILA020320',
  '430_brillante_1/8': 'AILAL00402',
}

// Rueda codes
const RUEDA_CODES: Record<string, string> = {
  'inox_2_freno': 'FERU010111',
  'inox_2_sin': 'FERU010211',
  'inox_3_freno': 'FERU010121',
  'inox_3_sin': 'FERU010221',
  'inox_4_freno': 'FERU010131',
  'inox_4_sin': 'FERU010231',
  'medicaster_3': 'FERU010121',
}

// ============================================================
// PRICE LOOKUP — dual strategy: code first, then name fallback
// ============================================================

function buscarPrecio(precios: PrecioMaestro[], buscar: string, codigo?: string): number {
  // 1. Exact code lookup (fastest, most reliable)
  if (codigo) {
    const porCodigo = precios.find(p => p.codigo === codigo)
    if (porCodigo && porCodigo.precio > 0) return porCodigo.precio
  }
  // 2. Case-insensitive name includes (fallback)
  const upper = buscar.toUpperCase()
  const porNombre = precios.find(p => p.nombre.toUpperCase().includes(upper) && p.precio > 0)
  return porNombre?.precio || 0
}

function resolverCodigoLamina(cfg: ConfigMesa): string {
  const tipo = cfg.tipo_acero  // '304' | '430'
  const acabado = cfg.acabado  // 'mate' | 'satinado' | 'brillante'
  const calibre = cfg.calibre  // 'cal_18', '1/8', etc.
  const key = `${tipo}_${acabado}_${calibre}`
  return LAMINA_CODES[key] || LAMINA_CODES['304_mate_cal_18'] || ''
}

function resolverNombreLamina(cfg: ConfigMesa): string {
  const tipo = cfg.tipo_acero === '304' ? '304' : '430'
  const acabado = cfg.acabado === 'mate' ? 'MATE' : cfg.acabado === 'satinado' ? 'SATINADO' : 'BRILLANTE'
  const calMap: Record<string, string> = {
    'cal_12': 'CAL 12', 'cal_14': 'CAL 14', 'cal_16': 'CAL 16',
    'cal_18': 'CAL 18', 'cal_20': 'CAL 20', 'cal_22': 'CAL 22', 'cal_24': 'CAL 24',
    '1/8': '1/8', '3/16': '3/16', '1/4': '1/4', '3/8': '3/8',
  }
  const cal = calMap[cfg.calibre] || 'CAL 18'
  return `${tipo} ${acabado} ${cal}`
}

export function calcularApuMesa(cfg: ConfigMesa, precios: PrecioMaestro[]): ApuResultado {
  // --- RESOLVE ALL PRICES WITH CODE + NAME DUAL LOOKUP ---
  const lamCodigo = resolverCodigoLamina(cfg)
  const lamNombre = resolverNombreLamina(cfg)
  const precioLam = buscarPrecio(precios, lamNombre, lamCodigo)
  const precioLamSat20 = buscarPrecio(precios, '304 SATINADO CAL 20', 'AILA010220')
  const precioTubo = buscarPrecio(precios, 'TUBO ACERO INOXIDABLE CUADRADO 1 1/2 CAL 16', 'AITC180016')
  const precioNivelador = buscarPrecio(precios,
    cfg.tipo_nivelador === 'inox_cuadrado' ? 'NIVELADOR NACIONAL INOX CUADRADO' : 'NIVELADOR NACIONAL PLASTICO CUADRADO',
    cfg.tipo_nivelador === 'inox_cuadrado' ? 'FENI010118' : 'FENI010119',
  )
  const ruedaCodigo = RUEDA_CODES[cfg.tipo_rueda] || 'FERU010121'
  const precioRueda = buscarPrecio(precios, 'RUEDAS INOX CON FRENO 3', ruedaCodigo)
  const precioAngulo = buscarPrecio(precios, 'ANGULO ACERO INOXIDABLE 1 1/2', 'AIAG03002')
  const precioRedondo370 = buscarPrecio(precios, 'POZUELO INOX REDONDO 37', 'FEPO010137')
  const precioRH = buscarPrecio(precios, 'MADERA RH AGLOMERADO 15', 'FEOM090015')
  const precioDiscoCorte = buscarPrecio(precios, 'DISCOS CORTE 4 1/2', 'ABDI100124')
  const precioFlap = buscarPrecio(precios, 'DISCOS FLAP INOX 4 1/2 GRANO 60', 'ABDI802060')
  const precioPano = buscarPrecio(precios, 'SCOTCH BRITE 3M', 'ABPA020001')
  const precioLija = buscarPrecio(precios, 'LIJA ZC INOX GRANO 80', 'ABLI202080')
  const precioGrata = buscarPrecio(precios, 'GRATA ALAMBRE INOX', 'ABGR200019')
  const precioLamCal16 = buscarPrecio(precios, '304 MATE CAL 16', 'AILA010116')
  const precioTubo3 = buscarPrecio(precios, 'TUBO ACERO INOXIDABLE CUADRADO 3 CAL 16', 'AITC210016')
  const precioTornillo = buscarPrecio(precios, 'TORNILLO INOX AVELLANADO', 'TRTI011219')
  const precioPL285 = buscarPrecio(precios, 'PL 285', 'FEOM120100')

  const L = cfg.largo, W = cfg.ancho, H = cfg.alto
  const lineas: ApuLinea[] = []

  // ============================================================
  // INSUMOS — formulas from MESAS.xlsm APU sheet R12-R41
  // ============================================================

  // R12: Acero Mesa — (L+0.12)*(W+0.12) + salpicaderos
  const areaMeson = (L + 0.12) * (W + 0.12) + (cfg.alto_salp + 0.04) * cfg.salp_long * L + (cfg.alto_salp + 0.04) * cfg.salp_lat * W
  lineas.push({ descripcion: `Acero Mesa ${cfg.calibre.toUpperCase().replace('CAL_', 'CAL ')} 2B`, material: lamNombre, cantidad: areaMeson, unidad: 'm²', precio_unitario: precioLam, desperdicio: 0, total: areaMeson * precioLam })

  // R13: Omegas mesa — Excel: ancho_om*L*ROUNDUP(W/0.6,0) + ancho_om*W*(patas/2 + 2*(poz_rect+poz_red)) + 0.078*L*IF(salp_long=0,2,1)
  if (cfg.refuerzo === 'omegas') {
    const areaOmegas = cfg.ancho_omegas * L * Math.ceil(W / 0.6) + cfg.ancho_omegas * W * (cfg.patas / 2 + 2 * (cfg.pozuelos_rect + cfg.pozuelos_redondos)) + 0.078 * L * (cfg.salp_long === 0 ? 2 : 1)
    lineas.push({ descripcion: 'Acero Omegas mesa', material: lamNombre, cantidad: areaOmegas, unidad: 'm²', precio_unitario: precioLam, desperdicio: 0, total: areaOmegas * precioLam })
  }

  // R14: Entrepaño lámina — (L+0.12)*(W+0.12)*entrepaños
  if (cfg.entrepaños > 0) {
    const areaEnt = (L + 0.12) * (W + 0.12) * cfg.entrepaños
    lineas.push({ descripcion: 'Acero Entrepaño - Lámina', material: lamNombre, cantidad: areaEnt, unidad: 'm²', precio_unitario: precioLam, desperdicio: 0, total: areaEnt * precioLam })
  }

  // R15: Babero satinado cal 20 — (alto_bab+0.06)*(L+0.06) + (W+0.06)*(alto_bab+0.06)*babero_costados
  if (cfg.babero) {
    const areaBab = (cfg.alto_babero + 0.06) * (L + 0.06) + (W + 0.06) * (cfg.alto_babero + 0.06) * cfg.babero_costados
    lineas.push({ descripcion: 'Acero Babero satinado cal 20', material: '304 SATINADO CAL 20', cantidad: areaBab, unidad: 'm²', precio_unitario: precioLamSat20, desperdicio: 0, total: areaBab * precioLamSat20 })
  }

  // R16: Pozuelo rectangular — IF(poz_rect<1,0, (largo+alto*2)*ancho + (largo*alto*2) * poz_rect)   desp=10%
  if (cfg.pozuelos_rect > 0 && cfg.pozuelo_dims.length > 0) {
    let areaPoz = 0
    cfg.pozuelo_dims.forEach(d => { areaPoz += (d.largo + d.alto * 2) * d.ancho + (d.largo * d.alto * 2) })
    lineas.push({ descripcion: 'Acero Pozuelo(s) rectangular', material: lamNombre, cantidad: areaPoz, unidad: 'm²', precio_unitario: precioLam, desperdicio: 0.1, total: areaPoz * precioLam * 1.1 })
  }

  // R17: Pozuelo REDONDO 370mm — qty = pozuelos_redondos
  if (cfg.pozuelos_redondos > 0) {
    lineas.push({ descripcion: 'Pozuelo REDONDO 370mm', material: 'POZUELO INOX REDONDO 37', cantidad: cfg.pozuelos_redondos, unidad: 'und', precio_unitario: precioRedondo370, desperdicio: 0, total: cfg.pozuelos_redondos * precioRedondo370 })
  }

  // R18: Omegas Entrepaño — (ancho_om*L*ceil(W/0.6) + ancho_om*W*((patas/2)-2) + 0.068*L*2)*entrepaños
  if (cfg.entrepaños > 0 && cfg.refuerzo === 'omegas') {
    const omEnt = (cfg.ancho_omegas * L * Math.ceil(W / 0.6) + cfg.ancho_omegas * W * ((cfg.patas / 2) - 2) + 0.068 * L * 2) * cfg.entrepaños
    lineas.push({ descripcion: 'Acero Omegas Entrepaño', material: lamNombre, cantidad: omEnt, unidad: 'm²', precio_unitario: precioLam, desperdicio: 0, total: omEnt * precioLam })
  }

  // R19: Patas Tubo 1-1/2" cal 16 — patas*H + IF(entrepaños<1, L+W*patas/2, 0)   desp=10%
  const mlPatas = cfg.patas * H + (cfg.entrepaños < 1 ? L + W * cfg.patas / 2 : 0)
  lineas.push({ descripcion: 'Patas - Tubo cuadrado 1-1/2 cal 16', material: 'TUBO INOX 1 1/2 CAL 16', cantidad: mlPatas, unidad: 'ml', precio_unitario: precioTubo, desperdicio: 0.1, total: mlPatas * precioTubo * 1.1 })

  // R20: Niveladores — IF(ruedas=NO, patas, 0)
  if (!cfg.ruedas) {
    lineas.push({ descripcion: 'Niveladores', material: 'NIVELADOR', cantidad: cfg.patas, unidad: 'und', precio_unitario: precioNivelador, desperdicio: 0, total: cfg.patas * precioNivelador })
  }

  // R22-R23: RH si aplica
  if (cfg.refuerzo === 'rh_15mm') {
    const areaRH = L * W
    lineas.push({ descripcion: 'RH 15mm', material: 'MADERA RH AGLOMERADO 15 MM', cantidad: areaRH, unidad: 'm²', precio_unitario: precioRH, desperdicio: 0, total: areaRH * precioRH })
    const tornillos = L * 4  // M57=4 tornillos por m
    if (tornillos > 0) lineas.push({ descripcion: 'Tornillos', material: 'TORNILLO INOX', cantidad: tornillos, unidad: 'und', precio_unitario: precioTornillo, desperdicio: 0, total: tornillos * precioTornillo })
    const pegaGalones = areaRH / 4  // M58=4 m2 por galón
    if (pegaGalones > 0) lineas.push({ descripcion: 'PL-285 (galón)', material: 'PEGA PL 285', cantidad: pegaGalones, unidad: 'gal', precio_unitario: precioPL285, desperdicio: 0, total: pegaGalones * precioPL285 })
  }

  // R24: Cinta 3M — IF(refuerzo=RH,0, (L*ceil(W/0.6) + W*(poz_rect*2+poz_red*2+patas/2)) + L*entrepaños)
  const cinta3m = cfg.refuerzo === 'omegas' ? (L * Math.ceil(W / 0.6) + W * (cfg.pozuelos_rect * 2 + cfg.pozuelos_redondos * 2 + cfg.patas / 2)) + L * cfg.entrepaños : 0
  if (cinta3m > 0) lineas.push({ descripcion: 'Cinta 3M', material: '', cantidad: cinta3m, unidad: 'tramo', precio_unitario: 11500, desperdicio: 0, total: cinta3m * 11500 })

  // R26-R29: Vertedero
  if (cfg.vertederos > 0) {
    const areaVert = (cfg.diam_vertedero * Math.PI * cfg.prof_vertedero + (0.2 * 0.2 * Math.PI) * 2) * cfg.vertederos
    lineas.push({ descripcion: 'Acero VERTEDERO cal 16', material: '304 MATE CAL 16', cantidad: areaVert, unidad: 'm²', precio_unitario: precioLamCal16, desperdicio: 0, total: areaVert * precioLamCal16 })
    const mlTuboVert = cfg.prof_vertedero * cfg.vertederos
    lineas.push({ descripcion: 'Tubo 3" INOX vertedero', material: 'TUBO INOX 3 CAL 16', cantidad: mlTuboVert, unidad: 'ml', precio_unitario: precioTubo3, desperdicio: 0, total: mlTuboVert * precioTubo3 })
    lineas.push({ descripcion: 'Argón Vertedero', material: '', cantidad: cfg.vertederos, unidad: 'und', precio_unitario: 15000, desperdicio: 0, total: cfg.vertederos * 15000 })
    lineas.push({ descripcion: 'Abrasivos Vertedero', material: '', cantidad: cfg.vertederos, unidad: 'und', precio_unitario: 12000, desperdicio: 0, total: cfg.vertederos * 12000 })
  }

  // R30-R36: Consumibles (basados en metros lineales de soldadura)
  // Excel B30: L + L*entrepaños + patas/4 + poz_rect + poz_red + vertederos*4
  const mlSoldadura = L + L * cfg.entrepaños + cfg.patas / 4 + cfg.pozuelos_rect + cfg.pozuelos_redondos + cfg.vertederos * 4
  lineas.push({ descripcion: 'Argón', material: '', cantidad: mlSoldadura, unidad: 'tramo', precio_unitario: 4000, desperdicio: 0, total: mlSoldadura * 4000 })
  lineas.push({ descripcion: 'Disco de corte', material: 'DISCOS CORTE 4 1/2', cantidad: mlSoldadura / 3, unidad: 'und', precio_unitario: precioDiscoCorte, desperdicio: 0, total: (mlSoldadura / 3) * precioDiscoCorte })
  lineas.push({ descripcion: 'Disco flap', material: 'DISCOS FLAP INOX', cantidad: mlSoldadura / 8, unidad: 'und', precio_unitario: precioFlap, desperdicio: 0, total: (mlSoldadura / 8) * precioFlap })
  lineas.push({ descripcion: 'Paño Scotch Brite', material: 'PAÑO SCOTCH BRITE 3M', cantidad: mlSoldadura / 3, unidad: 'und', precio_unitario: precioPano, desperdicio: 0, total: (mlSoldadura / 3) * precioPano })
  lineas.push({ descripcion: 'Lijas de zirconio', material: 'LIJA ZC INOX GRANO 80', cantidad: mlSoldadura / 4, unidad: 'und', precio_unitario: precioLija, desperdicio: 0, total: (mlSoldadura / 4) * precioLija })
  lineas.push({ descripcion: 'Grata', material: 'GRATA ALAMBRE INOX 2', cantidad: mlSoldadura / 30, unidad: 'und', precio_unitario: precioGrata, desperdicio: 0, total: (mlSoldadura / 30) * precioGrata })
  lineas.push({ descripcion: 'Empaque y embalaje', material: '', cantidad: L, unidad: 'ml', precio_unitario: 3500, desperdicio: 0, total: L * 3500 })

  // R38-R39: Ruedas (si aplica)
  if (cfg.ruedas) {
    const platinaPrecio = 0.1 * 0.1 * (1 / 4 * 0.0254) * 7890 * 19500 + 2500
    lineas.push({ descripcion: 'PLATINA + TORNILLO - SOPORTE RUEDAS', material: '', cantidad: cfg.patas, unidad: 'und', precio_unitario: platinaPrecio, desperdicio: 0, total: cfg.patas * platinaPrecio })
    lineas.push({ descripcion: `RUEDAS ${cfg.tipo_rueda.replace(/_/g, ' ').toUpperCase()}`, material: 'RUEDA INOX', cantidad: cfg.cant_ruedas, unidad: 'und', precio_unitario: precioRueda, desperdicio: 0, total: cfg.cant_ruedas * precioRueda })
  }

  // R41: Escabiladero — IF(escab=SI, bandejeros*2*W + 0.5, 0)
  if (cfg.escabiladero) {
    const mlAngulo = cfg.bandejeros * 2 * W + 0.5
    lineas.push({ descripcion: 'ÁNGULOS 1-1/2 × 1/8 - ESCABILADERO', material: 'ÁNGULO INOX', cantidad: mlAngulo, unidad: 'ml', precio_unitario: precioAngulo, desperdicio: 0, total: mlAngulo * precioAngulo })
  }

  const costoInsumos = lineas.reduce((s, l) => s + l.total, 0)

  // ============================================================
  // MANO DE OBRA — Excel R46-R51
  // B46 = L + poz_rect + poz_red + entrepaños*L + IF(escab, W*2, 0)
  // ============================================================
  const mlMO = L + cfg.pozuelos_rect + cfg.pozuelos_redondos + cfg.entrepaños * L + (cfg.escabiladero ? W * 2 : 0)
  const moAcero = mlMO * 30000
  const moPulido = mlMO * 23000
  const moPatas = cfg.patas * 10000
  // R49: MO Pozuelos profundos — IF(alto>0.24, poz_rect, 0) * alto*100000*1.12
  const moPozProf = cfg.pozuelo_dims.filter(d => d.alto > 0.24).length > 0
    ? cfg.pozuelo_dims.filter(d => d.alto > 0.24).length * (cfg.pozuelo_dims[0]?.alto || 0) * 100000 * 1.12
    : 0
  const moVertedero = cfg.vertederos * 60000
  const moInstalacion = cfg.instalado ? L * 22200 : 0
  const costoMO = moAcero + moPulido + moPatas + moPozProf + moVertedero + moInstalacion

  // ============================================================
  // TRANSPORTE — Excel R54-R56
  // B54 = IF(L<1, 1, L)  →  TTE Elementos = B54 * 15000
  // B56 = B54  →  TTE Personal regreso = B54 * 5000
  // ============================================================
  const tteUnidades = L < 1 ? 1 : L
  const costoTransporte = tteUnidades * 15000 + tteUnidades * 5000

  // ============================================================
  // LASER — Excel R58: ROUNDUP(L + poz_rect + poz_red + vertederos + L*entrepaños, 0) * 6500
  // ============================================================
  const minLaser = Math.ceil(L + cfg.pozuelos_rect + cfg.pozuelos_redondos + cfg.vertederos + L * cfg.entrepaños)
  const costoLaser = minLaser * 6500

  // ============================================================
  // PÓLIZA — 2% of subtotal
  // ============================================================
  const subtotalParcial = costoInsumos + costoMO + costoTransporte + costoLaser
  const costoPoliza = cfg.poliza ? subtotalParcial * 0.02 : 0

  const costoTotal = subtotalParcial + costoPoliza
  // Excel I9: CEILING(I70/(1-I72), 100)
  const precioVenta = Math.ceil(costoTotal / (1 - cfg.margen) / 100) * 100
  // Excel I10: ROUNDUP(I9, -3) + IF(push=SI, I8, 0)
  const extrasPush = cfg.push_pedal ? (348000 + 74000 + 24000) / (1 - 0.20) : 0
  const precioComercial = Math.ceil(precioVenta / 1000) * 1000 + extrasPush

  // Descripción comercial autogenerada
  let desc = `${cfg.instalado ? 'Suministro e instalación de' : 'Suministro de'} Mesa en acero inoxidable AISI ${cfg.tipo_acero}, mesón en lámina cal ${cfg.calibre.replace('cal_', '')} de ${L.toFixed(2)} m de largo x ${W.toFixed(2)} m de ancho, altura total ${H.toFixed(2)} m`
  if (cfg.salp_long > 0) desc += `, salpicadero longitudinal de ${cfg.alto_salp.toFixed(2)} m de alto`
  if (cfg.salp_lat > 0) desc += ` y ${cfg.salp_lat} salpicadero${cfg.salp_lat > 1 ? 's' : ''} lateral${cfg.salp_lat > 1 ? 'es' : ''}`
  if (cfg.babero) desc += `. Babero longitudinal de ${cfg.alto_babero.toFixed(2)} m en lámina satinada cal 20`
  if (cfg.ruedas) desc += `. ${cfg.cant_ruedas} ruedas inox de ${cfg.tipo_rueda.includes('3') ? '3' : cfg.tipo_rueda.includes('2') ? '2' : '4'} pulg con freno`
  else desc += `. ${cfg.patas} patas en tubo cuadrado 1-1/2 pulg cal 16 con niveladores`
  if (cfg.entrepaños > 0) desc += `, ${cfg.entrepaños} entrepaño${cfg.entrepaños > 1 ? 's' : ''} en lámina cal ${cfg.calibre.replace('cal_', '')}`
  if (cfg.pozuelos_rect > 0) desc += `, ${cfg.pozuelos_rect} pozuelo${cfg.pozuelos_rect > 1 ? 's' : ''}`
  if (cfg.pozuelos_redondos > 0) desc += `, ${cfg.pozuelos_redondos} pozuelo${cfg.pozuelos_redondos > 1 ? 's' : ''} redondo${cfg.pozuelos_redondos > 1 ? 's' : ''}`
  if (cfg.escabiladero) desc += `, escabiladero con ${cfg.bandejeros} bandejeros`
  desc += `. Refuerzo en ${cfg.refuerzo === 'omegas' ? 'omegas cal 18' : 'RH 15mm'}. Soldadura TIG con argón, acabado pulido satinado`
  if (cfg.push_pedal) desc += '. Incluye Push Pedal + grifo + canastilla'
  desc += '.'

  return {
    lineas,
    costo_insumos: costoInsumos,
    costo_mo: costoMO,
    costo_transporte: costoTransporte,
    costo_laser: costoLaser,
    costo_poliza: costoPoliza,
    costo_total: costoTotal,
    precio_venta: precioVenta,
    precio_comercial: precioComercial,
    margen: cfg.margen,
    descripcion_comercial: desc,
  }
}

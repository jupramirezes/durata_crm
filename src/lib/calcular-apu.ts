import { ConfigMesa, ApuResultado, ApuLinea, PrecioMaestro } from '../types'

// Buscar precio por nombre parcial
function buscarPrecio(precios: PrecioMaestro[], buscar: string): number {
  const found = precios.find(p => p.nombre.includes(buscar))
  return found?.precio || 0
}

// Resolver nombre de lámina según tipo_acero + acabado + calibre
function resolverLamina(cfg: ConfigMesa): string {
  const tipo = cfg.tipo_acero === '304' ? '304' : '430'
  const acabado = cfg.acabado === 'mate' ? 'MATE' : cfg.acabado === 'satinado' ? 'SATINADO' : 'BRILLANTE'
  const calMap: Record<string, string> = {
    'cal_12': 'CAL 12', 'cal_14': 'CAL 14', 'cal_16': 'CAL 16',
    'cal_18': 'CAL 18', 'cal_20': 'CAL 20',
    '1/8': '1/8"', '3/16': '3/16"', '1/4': '1/4"', '3/8': '3/8"',
  }
  const cal = calMap[cfg.calibre] || 'CAL 18'
  return `${tipo} ${acabado} ${cal}`
}

function resolverPrecioRueda(precios: PrecioMaestro[], tipo: string): number {
  const map: Record<string, string> = {
    'inox_2_freno': 'INOX CON FRENO 2"', 'inox_2_sin': 'INOX SIN FRENO 2"',
    'inox_3_freno': 'INOX CON FRENO 3"', 'inox_3_sin': 'INOX SIN FRENO 3"',
    'inox_4_freno': 'INOX CON FRENO 4"', 'inox_4_sin': 'INOX SIN FRENO 4"',
    'medicaster_3': 'INOX CON FRENO 3"',
  }
  return buscarPrecio(precios, map[tipo] || 'INOX CON FRENO 3"')
}

export function calcularApuMesa(cfg: ConfigMesa, precios: PrecioMaestro[]): ApuResultado {
  const lamNombre = resolverLamina(cfg)
  const precioLam = buscarPrecio(precios, lamNombre) || buscarPrecio(precios, '304 MATE CAL 18')
  const precioLamSat20 = buscarPrecio(precios, '304 SATINADO CAL 20')
  const precioTubo = buscarPrecio(precios, 'TUBO ACERO INOXIDABLE CUADRADO 1 1/2" CAL 16')
  const precioNivelador = buscarPrecio(precios, cfg.tipo_nivelador === 'inox_cuadrado' ? 'NIVELADOR NACIONAL INOX CUADRADO' : 'NIVELADOR NACIONAL PLASTICO')
  const precioRueda = resolverPrecioRueda(precios, cfg.tipo_rueda)
  const precioAngulo = buscarPrecio(precios, 'ANGULO ACERO INOXIDABLE 1 1/2" x 1/8"')
  const precioRedondo = buscarPrecio(precios, 'POZUELO INOX REDONDO')
  const precioRH = buscarPrecio(precios, 'MADERA RH AGLOMERADO')
  const precioDiscoCorte = buscarPrecio(precios, 'DISCOS CORTE 4 1/2"')
  const precioFlap = buscarPrecio(precios, 'DISCOS FLAP INOX 4 1/2"')
  const precioPano = buscarPrecio(precios, 'PAÑO SCOTCH BRITE')
  const precioLija = buscarPrecio(precios, 'LIJA ZC INOX GRANO 80')
  const precioGrata = buscarPrecio(precios, 'GRATA ALAMBRE INOX  2"') || buscarPrecio(precios, 'GRATA ALAMBRE INOX 2"')
  const precioLamCal16 = buscarPrecio(precios, '304 MATE CAL 16')

  const L = cfg.largo, W = cfg.ancho, H = cfg.alto
  const lineas: ApuLinea[] = []

  // --- INSUMOS ---

  // Acero Mesa
  const areaMeson = (L + 0.12) * (W + 0.12) + (cfg.alto_salp + 0.04) * cfg.salp_long * L + (cfg.alto_salp + 0.04) * cfg.salp_lat * W
  lineas.push({ descripcion: `Acero Mesa ${cfg.calibre.toUpperCase().replace('CAL_', 'CAL ')} 2B`, material: lamNombre, cantidad: areaMeson, unidad: 'm²', precio_unitario: precioLam, desperdicio: 0, total: areaMeson * precioLam })

  // Omegas mesa
  if (cfg.refuerzo === 'omegas') {
    const areaOmegas = cfg.ancho_omegas * L * Math.ceil(W / 0.6) + cfg.ancho_omegas * W * (cfg.patas / 2 + 2 * (cfg.pozuelos_rect + cfg.pozuelos_redondos)) + 0.078 * L * (cfg.salp_long === 0 ? 2 : 1)
    lineas.push({ descripcion: 'Acero Omegas mesa', material: lamNombre, cantidad: areaOmegas, unidad: 'm²', precio_unitario: precioLam, desperdicio: 0, total: areaOmegas * precioLam })
  }

  // Entrepaños
  if (cfg.entrepaños > 0) {
    const areaEnt = (L + 0.12) * (W + 0.12) * cfg.entrepaños
    lineas.push({ descripcion: 'Acero Entrepaño - Lámina', material: lamNombre, cantidad: areaEnt, unidad: 'm²', precio_unitario: precioLam, desperdicio: 0, total: areaEnt * precioLam })
    // Omegas entrepaño
    if (cfg.refuerzo === 'omegas') {
      const omEnt = (cfg.ancho_omegas * L * Math.ceil(W / 0.6) + cfg.ancho_omegas * W * ((cfg.patas / 2) - 2) + 0.068 * L * 2) * cfg.entrepaños
      lineas.push({ descripcion: 'Acero Omegas Entrepaño', material: lamNombre, cantidad: omEnt, unidad: 'm²', precio_unitario: precioLam, desperdicio: 0, total: omEnt * precioLam })
    }
  }

  // Babero
  if (cfg.babero) {
    const areaBab = (cfg.alto_babero + 0.06) * (L + 0.06) + (W + 0.06) * (cfg.alto_babero + 0.06) * cfg.babero_costados
    lineas.push({ descripcion: 'Acero Babero satinado cal 20', material: '304 SATINADO CAL 20', cantidad: areaBab, unidad: 'm²', precio_unitario: precioLamSat20, desperdicio: 0, total: areaBab * precioLamSat20 })
  }

  // Pozuelos rectangulares
  if (cfg.pozuelos_rect > 0 && cfg.pozuelo_dims.length > 0) {
    let areaPoz = 0
    cfg.pozuelo_dims.forEach(d => { areaPoz += (d.largo + d.alto * 2) * d.ancho + (d.largo * d.alto * 2) })
    lineas.push({ descripcion: `Acero Pozuelo(s) rectangular`, material: lamNombre, cantidad: areaPoz, unidad: 'm²', precio_unitario: precioLam, desperdicio: 0.1, total: areaPoz * precioLam * 1.1 })
  }

  // Pozuelos redondos
  if (cfg.pozuelos_redondos > 0) {
    lineas.push({ descripcion: 'Pozuelo REDONDO 370mm', material: 'POZUELO INOX REDONDO', cantidad: cfg.pozuelos_redondos, unidad: 'und', precio_unitario: precioRedondo, desperdicio: 0, total: cfg.pozuelos_redondos * precioRedondo })
  }

  // Patas - Tubo
  const mlPatas = cfg.patas * H + (cfg.entrepaños < 1 ? L + W * cfg.patas / 2 : 0)
  lineas.push({ descripcion: 'Patas - Tubo cuadrado 1-1/2 cal 16', material: 'TUBO INOX 1 1/2"', cantidad: mlPatas, unidad: 'ml', precio_unitario: precioTubo, desperdicio: 0.1, total: mlPatas * precioTubo * 1.1 })

  // Niveladores o Ruedas
  if (cfg.ruedas) {
    // Platina soporte
    const platinaPrecio = 0.1 * 0.1 * (1 / 4 * 0.0254) * 7890 * 19500 + 2500
    lineas.push({ descripcion: 'PLATINA + TORNILLO - SOPORTE RUEDAS', material: '', cantidad: cfg.patas, unidad: 'und', precio_unitario: platinaPrecio, desperdicio: 0, total: cfg.patas * platinaPrecio })
    lineas.push({ descripcion: `RUEDAS ${cfg.tipo_rueda.replace(/_/g, ' ').toUpperCase()}`, material: 'RUEDA', cantidad: cfg.cant_ruedas, unidad: 'und', precio_unitario: precioRueda, desperdicio: 0, total: cfg.cant_ruedas * precioRueda })
  } else {
    lineas.push({ descripcion: 'Niveladores', material: 'NIVELADOR', cantidad: cfg.patas, unidad: 'und', precio_unitario: precioNivelador, desperdicio: 0, total: cfg.patas * precioNivelador })
  }

  // RH si aplica
  if (cfg.refuerzo === 'rh_15mm') {
    const areaRH = L * W
    lineas.push({ descripcion: 'RH 15mm', material: 'MADERA RH', cantidad: areaRH, unidad: 'm²', precio_unitario: precioRH, desperdicio: 0, total: areaRH * precioRH })
  }

  // Escabiladero
  if (cfg.escabiladero) {
    const mlAngulo = cfg.bandejeros * 2 * W + 0.5
    lineas.push({ descripcion: 'ÁNGULOS 1-1/2" × 1/8" - ESCABILADERO', material: 'ÁNGULO INOX', cantidad: mlAngulo, unidad: 'ml', precio_unitario: precioAngulo, desperdicio: 0, total: mlAngulo * precioAngulo })
  }

  // Vertedero
  if (cfg.vertederos > 0) {
    const areaVert = (cfg.diam_vertedero * Math.PI * cfg.prof_vertedero + (0.2 * 0.2 * Math.PI) * 2) * cfg.vertederos
    lineas.push({ descripcion: 'Acero VERTEDERO cal 16', material: '304 MATE CAL 16', cantidad: areaVert, unidad: 'm²', precio_unitario: precioLamCal16, desperdicio: 0, total: areaVert * precioLamCal16 })
  }

  // Cinta 3M
  const cinta3m = cfg.refuerzo === 'omegas' ? (L * Math.ceil(W / 0.6) + W * (cfg.pozuelos_rect * 2 + cfg.pozuelos_redondos * 2 + cfg.patas / 2)) + L * cfg.entrepaños : 0
  if (cinta3m > 0) lineas.push({ descripcion: 'Cinta 3M', material: '', cantidad: cinta3m, unidad: 'tramo', precio_unitario: 11500, desperdicio: 0, total: cinta3m * 11500 })

  // Consumibles (basados en metros lineales de soldadura)
  const mlSoldadura = L + L * cfg.entrepaños + cfg.patas / 4 + cfg.pozuelos_rect + cfg.pozuelos_redondos + cfg.vertederos * 4
  lineas.push({ descripcion: 'Argón', material: '', cantidad: mlSoldadura, unidad: 'tramo', precio_unitario: 4000, desperdicio: 0, total: mlSoldadura * 4000 })
  lineas.push({ descripcion: 'Disco de corte', material: '', cantidad: mlSoldadura / 3, unidad: 'und', precio_unitario: precioDiscoCorte, desperdicio: 0, total: (mlSoldadura / 3) * precioDiscoCorte })
  lineas.push({ descripcion: 'Disco flap', material: '', cantidad: mlSoldadura / 8, unidad: 'und', precio_unitario: precioFlap, desperdicio: 0, total: (mlSoldadura / 8) * precioFlap })
  lineas.push({ descripcion: 'Paño', material: '', cantidad: mlSoldadura / 3, unidad: 'und', precio_unitario: precioPano, desperdicio: 0, total: (mlSoldadura / 3) * precioPano })
  lineas.push({ descripcion: 'Lijas de zirconio', material: '', cantidad: mlSoldadura / 4, unidad: 'und', precio_unitario: precioLija, desperdicio: 0, total: (mlSoldadura / 4) * precioLija })
  lineas.push({ descripcion: 'Grata', material: '', cantidad: mlSoldadura / 30, unidad: 'und', precio_unitario: precioGrata, desperdicio: 0, total: (mlSoldadura / 30) * precioGrata })
  lineas.push({ descripcion: 'Empaque y embalaje', material: '', cantidad: L, unidad: 'ml', precio_unitario: 3500, desperdicio: 0, total: L * 3500 })

  const costoInsumos = lineas.reduce((s, l) => s + l.total, 0)

  // --- MANO DE OBRA ---
  const mlMO = L + cfg.pozuelos_rect + cfg.pozuelos_redondos + cfg.entrepaños * L + (cfg.escabiladero ? W * 2 : 0)
  const moAcero = mlMO * 30000
  const moPulido = mlMO * 23000
  const moPatas = cfg.patas * 10000
  const moPozProf = cfg.pozuelo_dims.filter(d => d.alto > 0.24).length * cfg.pozuelo_dims[0]?.alto * 100000 * 1.12 || 0
  const moVertedero = cfg.vertederos * 60000
  const moInstalacion = cfg.instalado ? L * 22200 : 0
  const costoMO = moAcero + moPulido + moPatas + moPozProf + moVertedero + moInstalacion

  // --- TRANSPORTE ---
  const costoTransporte = 15000 + 0 + 5000

  // --- LASER ---
  const minLaser = Math.ceil(L + cfg.pozuelos_rect + cfg.pozuelos_redondos + cfg.vertederos + L * cfg.entrepaños)
  const costoLaser = minLaser * 6500

  // --- PÓLIZA ---
  const subtotalParcial = costoInsumos + costoMO + costoTransporte + costoLaser
  const costoPoliza = cfg.poliza ? subtotalParcial * 0.02 : 0

  const costoTotal = subtotalParcial + costoPoliza
  const precioVenta = Math.ceil(costoTotal / (1 - cfg.margen) / 100) * 100
  const extrasPush = cfg.push_pedal ? (348000 + 74000 + 24000) / (1 - 0.20) : 0
  const precioComercial = Math.ceil(precioVenta / 1000) * 1000 + extrasPush

  // Descripción comercial autogenerada
  let desc = `${cfg.instalado ? 'Suministro e instalación de' : 'Suministro de'} Mesa en acero inoxidable AISI ${cfg.tipo_acero}, mesón en lámina cal ${cfg.calibre.replace('cal_', '')} de ${L.toFixed(2)} m de largo x ${W.toFixed(2)} m de ancho, altura total ${H.toFixed(2)} m`
  if (cfg.salp_long > 0) desc += `, salpicadero longitudinal de ${cfg.alto_salp.toFixed(2)} m de alto`
  if (cfg.salp_lat > 0) desc += ` y ${cfg.salp_lat} salpicadero${cfg.salp_lat > 1 ? 's' : ''} lateral${cfg.salp_lat > 1 ? 'es' : ''}`
  if (cfg.babero) desc += `. Babero longitudinal de ${cfg.alto_babero.toFixed(2)} m en lámina satinada cal 20`
  if (cfg.ruedas) desc += `. ${cfg.cant_ruedas} ruedas inox de ${cfg.tipo_rueda.includes('3') ? '3' : cfg.tipo_rueda.includes('2') ? '2' : '4'} pulg con freno`
  else desc += `. ${cfg.patas} patas en tubo cuadrado 1-1/2 pulg cal 16 con niveladores`
  if (cfg.entrepaños > 0) desc += `, ${cfg.entrepaños} entrepaño${cfg.entrepaños > 1 ? 's' : ''} en lámina cal 18`
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

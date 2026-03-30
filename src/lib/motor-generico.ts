/**
 * motor-generico.ts — Bridge between ConfigMesa variables and the
 * data-driven formula evaluator (evaluar-formula.ts).
 *
 * Reads APU definitions from Supabase tables (cached after first load),
 * evaluates formulas with user variables, and returns the same ApuResultado
 * shape that calcularApuMesa() returns.
 */

import { supabase, isSupabaseReady } from './supabase'
import { calcularAPUGenerico, evalFormula } from './evaluar-formula'
import type { Variables, MaterialTemplate, LineaAPU } from './evaluar-formula'
import type { ConfigMesa, ApuResultado, ApuLinea, PrecioMaestro } from '../types'

/* ── Cache for Supabase data (fetched once per session) ── */
let _cachedLineas: LineaAPU[] | null = null
let _cachedMateriales: MaterialTemplate[] | null = null
let _cachedTarifasMO: Record<string, number> | null = null
let _cacheProductoId: string | null = null

export async function preloadProductData(productoId: string): Promise<boolean> {
  if (_cacheProductoId === productoId && _cachedLineas) return true
  if (!isSupabaseReady) return false

  try {
    const [matsRes, linRes, moRes] = await Promise.all([
      supabase.from('producto_materiales').select('*').eq('producto_id', productoId),
      supabase.from('producto_lineas_apu').select('*').eq('producto_id', productoId).order('orden'),
      supabase.from('tarifas_mo_producto').select('*').eq('producto_id', productoId),
    ])

    if (linRes.error || !linRes.data?.length) return false

    _cachedMateriales = (matsRes.data || []).map((m: any) => ({
      alias: m.alias,
      template_nombre: m.template_nombre,
      es_fijo: m.es_fijo,
      precio_fijo: m.precio_fijo,
      codigo: m.codigo,
    }))

    _cachedLineas = (linRes.data || []).map((l: any) => ({
      seccion: l.seccion,
      orden: l.orden,
      descripcion: l.descripcion,
      material_alias: l.material_alias || '',
      formula_cantidad: l.formula_cantidad,
      desperdicio: l.desperdicio || 0,
      condicion: l.condicion,
      margen_override: l.margen_override,
      nota: l.nota,
    }))

    _cachedTarifasMO = {}
    for (const t of (moRes.data || [])) {
      _cachedTarifasMO[t.codigo] = t.precio
    }

    _cacheProductoId = productoId
    return true
  } catch {
    return false
  }
}

/** Returns true if data for this product is cached and ready */
export function isMotorGenericoReady(productoId: string): boolean {
  return _cacheProductoId === productoId && !!_cachedLineas?.length
}

/* ── Map ConfigMesa fields to formula variable names ── */

function configToVariables(cfg: ConfigMesa): Variables {
  // Extract numeric calibre from string like "cal_18" or "18"
  const calStr = cfg.calibre.replace(/[^0-9]/g, '')

  return {
    largo: cfg.largo,
    ancho: cfg.ancho,
    alto: cfg.alto,
    desarrollo_omegas: cfg.ancho_omegas,
    tipo_acero: cfg.tipo_acero,            // "304" or "430"
    acabado: cfg.acabado.toUpperCase(),     // "MATE", "SATINADO", "BRILLANTE"
    calibre: calStr,                        // "18", "16", etc.
    salp_longitudinal: cfg.salp_long,
    salp_costado: cfg.salp_lat,
    alto_salpicadero: cfg.alto_salp,
    babero: cfg.babero ? 1 : 0,
    alto_babero: cfg.alto_babero,
    babero_costados: cfg.babero_costados,
    refuerzo_rh: cfg.refuerzo === 'rh_15mm' ? 1 : 0,
    entrepanos: cfg.entrepaños,
    patas: cfg.patas,
    ruedas: cfg.ruedas ? 1 : 0,
    num_ruedas: cfg.cant_ruedas,
    pozuelos_rect: cfg.pozuelos_rect,
    poz_largo: cfg.pozuelo_dims[0]?.largo || 0.54,
    poz_ancho: cfg.pozuelo_dims[0]?.ancho || 0.39,
    poz_alto: cfg.pozuelo_dims[0]?.alto || 0.18,
    pozuelo_redondo: cfg.pozuelos_redondos,
    escabiladero: cfg.escabiladero ? 1 : 0,
    cant_bandejeros: cfg.bandejeros,
    vertedero: cfg.vertederos,
    diametro_vertedero: cfg.diam_vertedero,
    prof_vertedero: cfg.prof_vertedero,
    poliza: cfg.poliza ? 1 : 0,
    instalado: cfg.instalado ? 1 : 0,
    push_pedal: cfg.push_pedal ? 1 : 0,
    // Constants
    tornillos_por_m: 4,
    pl285_m2_galon: 4,
    metros_rollo_cinta: 32,
  }
}

/* ── Main function: calculates APU using generic engine ── */

export function calcularApuGenerico(
  cfg: ConfigMesa,
  precios: PrecioMaestro[],
): ApuResultado | null {
  if (!_cachedLineas || !_cachedMateriales || !_cachedTarifasMO) return null

  const vars = configToVariables(cfg)

  // Evaluate calculated variables (like patas)
  vars.patas = evalFormula('4+2*max(0,ceil((largo-2)/2))', vars)

  // Build price lookups
  const precioByName: Record<string, number> = {}
  const precioByCodigo: Record<string, number> = {}
  for (const p of precios) {
    if (p.nombre) precioByName[p.nombre] = p.precio
    if (p.codigo) precioByCodigo[p.codigo] = p.precio
  }

  // Run the generic engine
  const result = calcularAPUGenerico(
    _cachedLineas,
    vars,
    _cachedMateriales,
    precioByName,
    _cachedTarifasMO,
    precioByCodigo,
  )

  // Convert ResultadoAPU → ApuResultado (match the legacy shape)
  const lineas: ApuLinea[] = result.lineas
    .filter(l => l.condicion_activa && l.total > 0)
    .map(l => ({
      descripcion: l.descripcion,
      material: l.material_nombre || '',
      cantidad: l.cantidad,
      unidad: l.seccion === 'mo' ? 'ml' : l.seccion === 'insumos' ? 'm²' : 'und',
      precio_unitario: l.precio_unitario,
      desperdicio: l.desperdicio,
      total: l.total,
    }))

  const costoTotal = result.costoTotal
  const precioVenta = Math.round(costoTotal / (1 - cfg.margen))
  const precioComercial = Math.ceil(precioVenta / 1000) * 1000

  // Add push pedal addon at different margin
  let pushPedalTotal = 0
  if (cfg.push_pedal) {
    pushPedalTotal = result.totalAddons
    // Addons use 20% margin, already included in costoTotal
  }

  const descripcion = `Suministro e instalación de Mesa en acero inoxidable AISI ${cfg.tipo_acero}, ` +
    `mesón en lámina cal ${vars.calibre} acabado ${cfg.acabado} de ${cfg.largo.toFixed(2)}m de largo × ${cfg.ancho.toFixed(2)}m de ancho, ` +
    `altura total ${cfg.alto.toFixed(2)}m` +
    (cfg.entrepaños > 0 ? `, con ${cfg.entrepaños} entrepaño(s)` : '') +
    (cfg.babero ? ', babero satinado' : '') +
    (cfg.pozuelos_rect > 0 ? `, ${cfg.pozuelos_rect} pozuelo(s) rectangular(es)` : '') +
    (cfg.pozuelos_redondos > 0 ? `, ${cfg.pozuelos_redondos} pozuelo(s) redondo(s)` : '') +
    (cfg.escabiladero ? `, escabiladero con ${cfg.bandejeros} bandejeros` : '') +
    (cfg.vertederos > 0 ? `, ${cfg.vertederos} vertedero(s)` : '') +
    (cfg.push_pedal ? ', push pedal con grifo y canastilla' : '') +
    '.'

  return {
    lineas,
    costo_insumos: result.totalInsumos,
    costo_mo: result.totalMO,
    costo_transporte: result.totalTransporte,
    costo_laser: result.totalLaser,
    costo_poliza: result.totalPoliza,
    costo_total: costoTotal,
    precio_venta: precioVenta,
    precio_comercial: precioComercial + (cfg.push_pedal ? Math.ceil(pushPedalTotal / (1 - 0.20) / 1000) * 1000 : 0),
    margen: cfg.margen,
    descripcion_comercial: descripcion,
  }
}

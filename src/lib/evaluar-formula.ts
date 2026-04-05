/**
 * Motor genérico de cálculo APU — Evaluador de fórmulas
 *
 * Evalúa fórmulas tipo Excel (con variables, funciones IF/ROUNDUP/CEILING/PI)
 * usando mathjs como backend. Esto reemplaza el cálculo hardcoded en calcular-apu.ts
 * con un motor data-driven que lee fórmulas desde Supabase.
 */

import { create, all } from 'mathjs'

const math = create(all)

// Funciones helper disponibles en las fórmulas (estilo Excel)
math.import({
  ROUNDUP: (val: number, digits: number) => {
    const factor = Math.pow(10, digits)
    return Math.ceil(val * factor) / factor
  },
  CEILING: (val: number, step: number) => Math.ceil(val / step) * step,
  IF: (cond: any, trueVal: any, falseVal: any) => cond ? trueVal : falseVal,
  INT: (val: number) => Math.floor(val),
  // mathjs already has max, min, pi, ceil, floor, abs, round — available by default
}, { override: true })

/* ── Types ─────────────────────────────────────────── */

export interface Variables { [key: string]: number | string | boolean }

export interface MaterialTemplate {
  alias: string
  template_nombre: string
  es_fijo: boolean
  precio_fijo?: number | null
  codigo?: string | null  // exact code for lookup in precios_maestro
}

export interface LineaAPU {
  seccion: string
  orden: number
  descripcion: string
  material_alias: string
  formula_cantidad: string
  desperdicio: number
  condicion?: string | null
  margen_override?: number | null
  nota?: string | null
}

export interface TarifaMO {
  codigo: string
  descripcion: string
  precio: number
  unidad: string
}

export interface ResultadoLinea {
  descripcion: string
  cantidad: number
  precio_unitario: number
  desperdicio: number
  total: number
  seccion: string
  material_nombre: string
  condicion_activa: boolean
  nota?: string | null
  unidad?: string
}

export interface ResultadoAPU {
  lineas: ResultadoLinea[]
  totalInsumos: number
  totalMO: number
  totalTransporte: number
  totalLaser: number
  totalPoliza: number
  totalAddons: number
  costoTotal: number
}

/* ── Formula evaluation ────────────────────────────── */

/**
 * Evaluates a formula string, substituting variable names with their numeric values.
 * Supports mathjs functions + custom ROUNDUP, CEILING.
 */
export function evalFormula(formula: string, vars: Variables): number {
  try {
    let expr = formula

    // Sort keys by length descending to avoid partial replacement (e.g. "largo" before "lar")
    const sortedKeys = Object.keys(vars).sort((a, b) => b.length - a.length)

    for (const key of sortedKeys) {
      const val = vars[key]
      let numVal: number
      if (val === true || val === 'SI' || val === 1) numVal = 1
      else if (val === false || val === 'NO' || val === 0) numVal = 0
      else if (typeof val === 'string') numVal = parseFloat(val) || 0
      else numVal = val as number

      // Word-boundary replace to avoid partial matches
      const regex = new RegExp('\\b' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g')
      expr = expr.replace(regex, String(numVal))
    }

    // mathjs evaluate
    const result = math.evaluate(expr)
    return typeof result === 'number' ? result : Number(result) || 0
  } catch (e) {
    console.error(`[evalFormula] Error evaluating: "${formula}"`, e)
    return 0
  }
}

/* ── Material name resolution ──────────────────────── */

/**
 * Resolves a material template name by replacing {variable} placeholders.
 * E.g. "LAMINA {tipo_acero} {acabado} CAL {calibre}" → "LAMINA 304 MATE CAL 18"
 */
export function resolverMaterial(template: string, vars: Variables): string {
  let nombre = template
  for (const [key, val] of Object.entries(vars)) {
    nombre = nombre.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val))
  }
  return nombre
}

/* ── Main APU calculation ──────────────────────────── */

/**
 * Calculates a full APU from data-driven line definitions.
 *
 * @param lineas      - APU line definitions with formulas (from producto_lineas_apu)
 * @param variables   - Current variable values (user inputs + calculated)
 * @param materiales  - Material templates (from producto_materiales)
 * @param precios     - Price lookup: normalized material name → price
 * @param tarifasMO   - MO tariffs: codigo → price
 */
/** Normalize a material name for fuzzy matching: lowercase, strip quotes/extra spaces */
function normalizeName(s: string): string {
  return s.replace(/["'"]/g, '').replace(/\s+/g, ' ').trim().toUpperCase()
}

export function calcularAPUGenerico(
  lineas: LineaAPU[],
  variables: Variables,
  materiales: MaterialTemplate[],
  precios: { [nombre: string]: number },
  tarifasMO: { [codigo: string]: number },
  preciosPorCodigo?: { [codigo: string]: number },
): ResultadoAPU {
  const resultados: ResultadoLinea[] = []

  for (const linea of lineas) {
    // Evaluate condition (if present)
    let activa = true
    if (linea.condicion) {
      try {
        activa = !!evalFormula(linea.condicion, variables)
      } catch {
        activa = false
      }
    }

    if (!activa) {
      resultados.push({
        descripcion: linea.descripcion,
        cantidad: 0,
        precio_unitario: 0,
        desperdicio: linea.desperdicio,
        total: 0,
        seccion: linea.seccion,
        material_nombre: '',
        condicion_activa: false,
        nota: linea.nota,
      })
      continue
    }

    // Evaluate quantity
    const cantidad = evalFormula(linea.formula_cantidad, variables)

    // Resolve price
    let precio = 0
    let materialNombre = ''

    if (linea.material_alias) {
      // 1. Check MO tariffs (tarifas_mo_producto)
      if (tarifasMO[linea.material_alias] != null) {
        precio = tarifasMO[linea.material_alias]
        materialNombre = linea.material_alias
      }

      // 2. If no tariff found, look up in material templates (producto_materiales)
      //    This handles: es_fijo materials, code-based lookups, name-based lookups
      if (!precio) {
        const mat = materiales.find(m => m.alias === linea.material_alias)
        if (mat) {
          if (mat.es_fijo && mat.precio_fijo != null) {
            precio = mat.precio_fijo
            materialNombre = mat.template_nombre
          } else {
            // Resolve template name with current variables
            materialNombre = resolverMaterial(mat.template_nombre, variables)

            // a. Try resolved name in precios_maestro
            precio = precios[materialNombre] || 0

            // b. Try by code (even if template has variables — the code is the reliable fallback)
            if (!precio && mat.codigo && preciosPorCodigo) {
              const resolvedCodigo = resolverMaterial(mat.codigo, variables)
              precio = preciosPorCodigo[resolvedCodigo] || preciosPorCodigo[mat.codigo] || 0
            }

            // c. Normalized fuzzy match (strip quotes, extra spaces)
            if (!precio) {
              const norm = normalizeName(materialNombre)
              for (const [name, p] of Object.entries(precios)) {
                if (normalizeName(name) === norm) { precio = p; break }
              }
            }
            // d. Includes-based fallback
            if (!precio) {
              const norm = normalizeName(materialNombre)
              for (const [name, p] of Object.entries(precios)) {
                if (normalizeName(name).includes(norm) || norm.includes(normalizeName(name))) {
                  precio = p; break
                }
              }
            }
          }
        }
      }
    }

    const total = cantidad * precio * (1 + (linea.desperdicio || 0))

    resultados.push({
      descripcion: linea.descripcion,
      cantidad,
      precio_unitario: precio,
      desperdicio: linea.desperdicio,
      total,
      seccion: linea.seccion,
      material_nombre: materialNombre,
      condicion_activa: true,
      nota: linea.nota,
    })
  }

  const sum = (sec: string) => resultados
    .filter(r => r.seccion === sec && r.condicion_activa)
    .reduce((s, r) => s + r.total, 0)

  const subtotalBeforePoliza = sum('insumos') + sum('mo') + sum('transporte') + sum('laser') + sum('addon') + sum('otros')

  // Poliza is 2% of everything before it
  const polizaLinea = resultados.find(r => r.seccion === 'poliza' && r.condicion_activa)
  if (polizaLinea) {
    polizaLinea.precio_unitario = subtotalBeforePoliza * 0.02
    polizaLinea.total = polizaLinea.cantidad * polizaLinea.precio_unitario
  }

  return {
    lineas: resultados,
    totalInsumos: sum('insumos'),
    totalMO: sum('mo'),
    totalTransporte: sum('transporte'),
    totalLaser: sum('laser'),
    totalPoliza: polizaLinea?.total || 0,
    totalAddons: sum('addon'),
    costoTotal: subtotalBeforePoliza + (polizaLinea?.total || 0),
  }
}

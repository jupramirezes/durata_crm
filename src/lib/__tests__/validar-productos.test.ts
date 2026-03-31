/**
 * validar-productos.test.ts — Validation tests for the generic APU engine
 *
 * For each product fixture, runs calcularAPUGenerico with the fixture's
 * variables, materials, and lines, then compares against expected values.
 *
 * These tests use DEMO_PRECIOS (25 mock materials) for price lookups.
 * Products with es_fijo materials (Cárcamo, Estantería) are fully testable
 * since they don't depend on precios_maestro lookups.
 *
 * Mesa test has wider tolerance because DEMO_PRECIOS lacks some materials.
 * With production Supabase precios (1408+ items), tolerance would be <1%.
 */

import { describe, it, expect } from 'vitest'
import { calcularAPUGenerico } from '../evaluar-formula'
import { DEMO_PRECIOS } from '../demo-data'
import { FIXTURES_PRODUCTOS } from './fixtures-productos'
import { formatCOP } from '../utils'

// Build price lookup maps from DEMO_PRECIOS
const precioByName: Record<string, number> = {}
const precioByCodigo: Record<string, number> = {}
for (const p of DEMO_PRECIOS) {
  if (p.nombre) precioByName[p.nombre] = p.precio
  if (p.codigo) precioByCodigo[p.codigo] = p.precio
}

describe('Validación de productos — motor genérico', () => {
  for (const fixture of FIXTURES_PRODUCTOS) {
    describe(fixture.nombre, () => {
      // Run the engine
      const result = calcularAPUGenerico(
        fixture.lineas,
        { ...fixture.variables },
        fixture.materiales,
        precioByName,
        fixture.tarifasMO,
        precioByCodigo,
      )

      const costoTotal = result.costoTotal
      const precioVenta = Math.round(costoTotal / (1 - fixture.margen))

      it(`precioVenta within tolerance of ${formatCOP(fixture.esperado.precioVenta)}`, () => {
        const diff = Math.abs(precioVenta - fixture.esperado.precioVenta)
        const status = diff <= fixture.tolerancia ? 'OK' : 'FAIL'

        // Always log for visibility
        console.log(
          `  ${fixture.producto_id}: esperado ${formatCOP(fixture.esperado.precioVenta)}, ` +
          `obtuvo ${formatCOP(precioVenta)}, diff ${formatCOP(diff)} ` +
          `(tolerancia ${formatCOP(fixture.tolerancia)}) → ${status}`
        )

        if (diff > fixture.tolerancia) {
          // Detailed breakdown on failure
          console.log(`    costoTotal: ${formatCOP(costoTotal)}`)
          console.log(`    insumos: ${formatCOP(result.totalInsumos)}`)
          console.log(`    MO: ${formatCOP(result.totalMO)}`)
          console.log(`    transporte: ${formatCOP(result.totalTransporte)}`)
          console.log(`    laser: ${formatCOP(result.totalLaser)}`)
          console.log(`    Lines with $0 price:`)
          for (const l of result.lineas.filter(l => l.condicion_activa && l.cantidad > 0 && l.precio_unitario === 0)) {
            console.log(`      ${l.descripcion}: material="${l.material_nombre}" qty=${l.cantidad.toFixed(3)}`)
          }
        }

        expect(diff).toBeLessThanOrEqual(fixture.tolerancia)
      })

      // Optional sub-total checks (if specified in fixture)
      if (fixture.esperado.totalMO != null) {
        it(`totalMO matches expected ${formatCOP(fixture.esperado.totalMO)}`, () => {
          expect(result.totalMO).toBe(fixture.esperado.totalMO)
        })
      }

      if (fixture.esperado.totalTransporte != null) {
        it(`totalTransporte matches expected ${formatCOP(fixture.esperado.totalTransporte)}`, () => {
          expect(result.totalTransporte).toBe(fixture.esperado.totalTransporte)
        })
      }

      if (fixture.esperado.totalLaser != null) {
        it(`totalLaser matches expected ${formatCOP(fixture.esperado.totalLaser)}`, () => {
          expect(result.totalLaser).toBe(fixture.esperado.totalLaser)
        })
      }

      it('all active lines have non-negative totals', () => {
        for (const l of result.lineas.filter(l => l.condicion_activa)) {
          expect(l.total).toBeGreaterThanOrEqual(0)
        }
      })

      it('costoTotal is sum of sections', () => {
        const sum = result.totalInsumos + result.totalMO + result.totalTransporte +
          result.totalLaser + result.totalPoliza + result.totalAddons
        expect(Math.abs(result.costoTotal - sum)).toBeLessThan(1)
      })
    })
  }
})

import { describe, it, expect } from 'vitest'
import { DEMO_PRECIOS } from '../lib/demo-data'
import type { PrecioMaestro } from '../types'

/**
 * buscarPrecio is internal to calcular-apu.ts.
 * We replicate the logic here to test it directly.
 */
function buscarPrecio(precios: PrecioMaestro[], buscar: string, codigo?: string): number {
  // 1. Exact code lookup
  if (codigo) {
    const porCodigo = precios.find(p => p.codigo === codigo)
    if (porCodigo && porCodigo.precio > 0) return porCodigo.precio
  }
  // 2. Case-insensitive name includes
  const upper = buscar.toUpperCase()
  const porNombre = precios.find(p => p.nombre.toUpperCase().includes(upper) && p.precio > 0)
  return porNombre?.precio || 0
}

describe('buscarPrecio — Búsqueda de precios por código y nombre', () => {
  it('buscar por código exacto "AILA010118" encuentra precio > 0', () => {
    const precio = buscarPrecio(DEMO_PRECIOS, '', 'AILA010118')
    expect(precio).toBeGreaterThan(0)
  })

  it('buscar por código inexistente con nombre inexistente retorna 0', () => {
    const precio = buscarPrecio(DEMO_PRECIOS, 'MATERIAL_INEXISTENTE_XYZ', 'CODIGO_INEXISTENTE_XYZ')
    expect(precio).toBe(0)
  })

  it('buscar por nombre cuando no hay código encuentra por includes', () => {
    // Search for a material by partial name
    const precio = buscarPrecio(DEMO_PRECIOS, 'NIVELADOR')
    expect(precio).toBeGreaterThan(0)
  })

  it('material con precio $0 en DB no se retorna, busca siguiente match', () => {
    const testPrecios: PrecioMaestro[] = [
      { id: '1', nombre: 'LAMINA TEST', codigo: 'TEST001', precio: 0, grupo: 'test', subgrupo: '', unidad: 'und', updated_at: '', proveedor: '' },
      { id: '2', nombre: 'LAMINA TEST BUENA', codigo: 'TEST002', precio: 50000, grupo: 'test', subgrupo: '', unidad: 'und', updated_at: '', proveedor: '' },
    ]
    // By code with $0 price, falls through to name search
    const precio = buscarPrecio(testPrecios, 'LAMINA TEST', 'TEST001')
    // Should find TEST002 by name since TEST001 has price 0
    expect(precio).toBe(50000)
  })

  it('código exacto tiene prioridad sobre nombre', () => {
    const testPrecios: PrecioMaestro[] = [
      { id: '1', nombre: 'LAMINA ACERO', codigo: 'COD-A', precio: 10000, grupo: 'test', subgrupo: '', unidad: 'und', updated_at: '', proveedor: '' },
      { id: '2', nombre: 'LAMINA ACERO PREMIUM', codigo: 'COD-B', precio: 90000, grupo: 'test', subgrupo: '', unidad: 'und', updated_at: '', proveedor: '' },
    ]
    const precio = buscarPrecio(testPrecios, 'LAMINA ACERO', 'COD-B')
    expect(precio).toBe(90000) // Found by code, not by name (which would match COD-A first)
  })

  it('búsqueda por nombre es case-insensitive', () => {
    const testPrecios: PrecioMaestro[] = [
      { id: '1', nombre: 'Disco Corte 4 1/2"', codigo: '', precio: 1500, grupo: 'test', subgrupo: '', unidad: 'und', updated_at: '', proveedor: '' },
    ]
    const precio = buscarPrecio(testPrecios, 'disco corte')
    expect(precio).toBe(1500)
  })

  it('sin match por código ni nombre retorna 0', () => {
    const precio = buscarPrecio(DEMO_PRECIOS, 'MATERIAL_QUE_NO_EXISTE_EN_NINGUNA_PARTE')
    expect(precio).toBe(0)
  })
})

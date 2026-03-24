import { describe, it, expect } from 'vitest'
import { calcularApuMesa } from '../lib/calcular-apu'
import { CONFIG_MESA_DEFAULT, ConfigMesa } from '../types'
import { DEMO_PRECIOS } from '../lib/demo-data'

describe('calcularApuMesa — Configuraciones extendidas', () => {
  it('mesa básica sin accesorios: sin salpicadero, babero, pozuelo', () => {
    const cfg: ConfigMesa = {
      ...CONFIG_MESA_DEFAULT,
      salp_long: 0,
      salp_lat: 0,
      babero: false,
      pozuelos_rect: 0,
      pozuelos_redondos: 0,
      escabiladero: false,
      push_pedal: false,
      poliza: false,
      ruedas: false,
    }
    const res = calcularApuMesa(cfg, DEMO_PRECIOS)
    expect(res.precio_comercial).toBeGreaterThan(0)
    // No salpicadero/babero/pozuelo lines should have quantity 0
    const salpLines = res.lineas.filter(l => l.descripcion.toLowerCase().includes('salpicadero'))
    const babLines = res.lineas.filter(l => l.descripcion.toLowerCase().includes('babero'))
    const pozLines = res.lineas.filter(l => l.descripcion.toLowerCase().includes('pozuelo'))
    for (const line of [...salpLines, ...babLines, ...pozLines]) {
      expect(line.cantidad).toBe(0)
    }
  })

  it('mesa con TODOS los accesorios es más cara que mesa básica', () => {
    const basica: ConfigMesa = {
      ...CONFIG_MESA_DEFAULT,
      salp_long: 0, salp_lat: 0, babero: false,
      pozuelos_rect: 0, pozuelos_redondos: 0,
      escabiladero: false, push_pedal: false, poliza: false, ruedas: false,
    }
    const completa: ConfigMesa = {
      ...CONFIG_MESA_DEFAULT,
      salp_long: 2, salp_lat: 1, alto_salp: 0.15,
      babero: true, alto_babero: 0.25, babero_costados: 2,
      entrepaños: 2, pozuelos_rect: 1, pozuelo_dims: [{ largo: 0.50, ancho: 0.40, alto: 0.18 }],
      pozuelos_redondos: 1, escabiladero: true, bandejeros: 3,
      ruedas: true, tipo_rueda: 'inox_3_freno', cant_ruedas: 4,
      push_pedal: true, poliza: true,
    }
    const resBasica = calcularApuMesa(basica, DEMO_PRECIOS)
    const resCompleta = calcularApuMesa(completa, DEMO_PRECIOS)
    expect(resCompleta.precio_comercial).toBeGreaterThan(resBasica.precio_comercial)
  })

  it('calibre 16 es más caro que calibre 18', () => {
    const cfg18: ConfigMesa = { ...CONFIG_MESA_DEFAULT, calibre: 'cal_18' }
    const cfg16: ConfigMesa = { ...CONFIG_MESA_DEFAULT, calibre: 'cal_16' }
    const res18 = calcularApuMesa(cfg18, DEMO_PRECIOS)
    const res16 = calcularApuMesa(cfg16, DEMO_PRECIOS)
    expect(res16.precio_comercial).toBeGreaterThan(res18.precio_comercial)
  })

  it('calibre 20 es más barato que calibre 18', () => {
    const cfg18: ConfigMesa = { ...CONFIG_MESA_DEFAULT, calibre: 'cal_18' }
    const cfg20: ConfigMesa = { ...CONFIG_MESA_DEFAULT, calibre: 'cal_20' }
    const res18 = calcularApuMesa(cfg18, DEMO_PRECIOS)
    const res20 = calcularApuMesa(cfg20, DEMO_PRECIOS)
    expect(res20.precio_comercial).toBeLessThan(res18.precio_comercial)
  })

  it('material 430 es más barato que 304', () => {
    const cfg304: ConfigMesa = { ...CONFIG_MESA_DEFAULT, tipo_acero: '304' }
    const cfg430: ConfigMesa = { ...CONFIG_MESA_DEFAULT, tipo_acero: '430' }
    const res304 = calcularApuMesa(cfg304, DEMO_PRECIOS)
    const res430 = calcularApuMesa(cfg430, DEMO_PRECIOS)
    expect(res430.precio_comercial).toBeLessThan(res304.precio_comercial)
  })

  it('margen 0% → precio venta ≈ costo total', () => {
    const cfg: ConfigMesa = { ...CONFIG_MESA_DEFAULT, margen: 0 }
    const res = calcularApuMesa(cfg, DEMO_PRECIOS)
    // With 0% margin, precio_venta = costo / (1-0) = costo, rounded to 1000s
    expect(res.precio_venta).toBeGreaterThanOrEqual(res.costo_total - 1000)
    expect(res.precio_venta).toBeLessThanOrEqual(res.costo_total + 1000)
  })

  it('margen 50% → precio venta = costo / 0.5 (±1000)', () => {
    const cfg: ConfigMesa = { ...CONFIG_MESA_DEFAULT, margen: 0.5 }
    const res = calcularApuMesa(cfg, DEMO_PRECIOS)
    const expected = res.costo_total / 0.5
    expect(res.precio_venta).toBeGreaterThanOrEqual(expected - 1000)
    expect(res.precio_venta).toBeLessThanOrEqual(expected + 1000)
  })

  it('dimensiones mínimas (0.3x0.3x0.5) no crashea', () => {
    const cfg: ConfigMesa = { ...CONFIG_MESA_DEFAULT, largo: 0.3, ancho: 0.3, alto: 0.5 }
    const res = calcularApuMesa(cfg, DEMO_PRECIOS)
    expect(res.precio_comercial).toBeGreaterThan(0)
    expect(res.lineas.length).toBeGreaterThan(0)
  })

  it('dimensiones máximas (5x2x1.5) no crashea', () => {
    const cfg: ConfigMesa = { ...CONFIG_MESA_DEFAULT, largo: 5, ancho: 2, alto: 1.5 }
    const res = calcularApuMesa(cfg, DEMO_PRECIOS)
    expect(res.precio_comercial).toBeGreaterThan(0)
    expect(res.lineas.length).toBeGreaterThan(0)
  })

  it('TODOS los items del desglose tienen precio > 0 (ningún material $0)', () => {
    const cfg: ConfigMesa = {
      ...CONFIG_MESA_DEFAULT,
      salp_long: 1, salp_lat: 1, alto_salp: 0.10,
      babero: true, alto_babero: 0.25,
      entrepaños: 1, pozuelos_rect: 1, pozuelo_dims: [{ largo: 0.54, ancho: 0.39, alto: 0.18 }],
      pozuelos_redondos: 1,
    }
    const res = calcularApuMesa(cfg, DEMO_PRECIOS)
    const lineasConCantidad = res.lineas.filter(l => l.cantidad > 0)
    for (const l of lineasConCantidad) {
      expect(l.precio_unitario, `Material "${l.descripcion}" tiene precio $0`).toBeGreaterThan(0)
    }
  })
})

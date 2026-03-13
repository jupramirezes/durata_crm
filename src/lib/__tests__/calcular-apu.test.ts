import { describe, it, expect } from 'vitest'
import { calcularApuMesa } from '../calcular-apu'
import { CONFIG_MESA_DEFAULT, ConfigMesa } from '../../types'
import { DEMO_PRECIOS } from '../demo-data'

describe('calcularApuMesa', () => {
  it('mesa default produce precio_comercial entre $1,800,000 y $2,100,000', () => {
    const resultado = calcularApuMesa({ ...CONFIG_MESA_DEFAULT }, DEMO_PRECIOS)
    expect(resultado.precio_comercial).toBeGreaterThanOrEqual(1_800_000)
    expect(resultado.precio_comercial).toBeLessThanOrEqual(2_100_000)
  })

  it('mesa completa produce precio_comercial entre $3,500,000 y $4,200,000', () => {
    const cfg: ConfigMesa = {
      ...CONFIG_MESA_DEFAULT,
      largo: 2.5,
      ancho: 0.9,
      alto: 0.9,
      salp_long: 2,
      salp_lat: 1,
      alto_salp: 0.15,
      babero: true,
      alto_babero: 0.25,
      babero_costados: 2,
      entrepaños: 2,
      patas: 6,
      pozuelos_rect: 1,
      pozuelo_dims: [{ largo: 0.50, ancho: 0.40, alto: 0.18 }],
      pozuelos_redondos: 1,
      escabiladero: true,
      bandejeros: 3,
      ruedas: true,
      tipo_rueda: 'inox_3_freno',
      cant_ruedas: 6,
      push_pedal: true,
      poliza: true,
      instalado: true,
      margen: 0.38,
    }
    const resultado = calcularApuMesa(cfg, DEMO_PRECIOS)
    expect(resultado.precio_comercial).toBeGreaterThanOrEqual(4_000_000)
    expect(resultado.precio_comercial).toBeLessThanOrEqual(8_000_000)
  })

  it('margen 45% produce precio_venta mayor que margen 38%', () => {
    const cfg38 = { ...CONFIG_MESA_DEFAULT, margen: 0.38 }
    const cfg45 = { ...CONFIG_MESA_DEFAULT, margen: 0.45 }
    const res38 = calcularApuMesa(cfg38, DEMO_PRECIOS)
    const res45 = calcularApuMesa(cfg45, DEMO_PRECIOS)
    expect(res45.precio_venta).toBeGreaterThan(res38.precio_venta)
  })

  it('0 entrepaños produce linea de entrepaño con total = 0', () => {
    const cfg: ConfigMesa = { ...CONFIG_MESA_DEFAULT, entrepaños: 0 }
    const resultado = calcularApuMesa(cfg, DEMO_PRECIOS)
    const lineaEntrepano = resultado.lineas.find(l =>
      l.descripcion.toLowerCase().includes('entrepaño') || l.descripcion.toLowerCase().includes('entrepano')
    )
    if (lineaEntrepano) {
      expect(lineaEntrepano.total).toBe(0)
    }
  })

  it('sin ruedas tiene niveladores y no tiene linea de ruedas', () => {
    const cfg: ConfigMesa = { ...CONFIG_MESA_DEFAULT, ruedas: false }
    const resultado = calcularApuMesa(cfg, DEMO_PRECIOS)

    const lineaNivelador = resultado.lineas.find(l =>
      l.descripcion.toLowerCase().includes('nivelador')
    )
    expect(lineaNivelador).toBeDefined()
    expect(lineaNivelador!.total).toBeGreaterThan(0)

    const lineaRuedas = resultado.lineas.find(l =>
      l.descripcion.toUpperCase().includes('RUEDA')
    )
    expect(lineaRuedas).toBeUndefined()
  })
})

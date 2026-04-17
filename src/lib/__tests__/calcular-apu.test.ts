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

  it('mesa completa produce precio_comercial entre $4,000,000 y $8,000,000', () => {
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

  it('0 entrepaños no genera linea de entrepaño', () => {
    const cfg: ConfigMesa = { ...CONFIG_MESA_DEFAULT, entrepaños: 0 }
    const resultado = calcularApuMesa(cfg, DEMO_PRECIOS)
    const lineaEntrepano = resultado.lineas.find(l =>
      l.descripcion.toLowerCase().includes('entrepaño') || l.descripcion.toLowerCase().includes('entrepano')
    )
    // With 0 entrepaños, there should be no entrepaño line at all
    expect(lineaEntrepano).toBeUndefined()
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

  it('push_pedal agrega costo extra al precio_comercial', () => {
    const cfgSin = { ...CONFIG_MESA_DEFAULT, push_pedal: false }
    const cfgCon = { ...CONFIG_MESA_DEFAULT, push_pedal: true }
    const resSin = calcularApuMesa(cfgSin, DEMO_PRECIOS)
    const resCon = calcularApuMesa(cfgCon, DEMO_PRECIOS)
    // Push pedal adds (348000 + 74000 + 24000) / 0.8 = ~557,500
    expect(resCon.precio_comercial).toBeGreaterThan(resSin.precio_comercial + 500_000)
  })

  it('descripcion comercial contiene dimensiones', () => {
    const cfg: ConfigMesa = { ...CONFIG_MESA_DEFAULT, largo: 2.0, ancho: 0.7, alto: 0.9 }
    const resultado = calcularApuMesa(cfg, DEMO_PRECIOS)
    expect(resultado.descripcion_comercial).toContain('2.00')
    expect(resultado.descripcion_comercial).toContain('0.70')
    expect(resultado.descripcion_comercial).toContain('0.90')
  })

  it('costo_total es suma de insumos + mo + transporte + laser + poliza', () => {
    const resultado = calcularApuMesa({ ...CONFIG_MESA_DEFAULT, poliza: true }, DEMO_PRECIOS)
    const expected = resultado.costo_insumos + resultado.costo_mo + resultado.costo_transporte + resultado.costo_laser + resultado.costo_poliza
    expect(Math.abs(resultado.costo_total - expected)).toBeLessThan(1)
  })

  it('mesa con ruedas incluye platina y ruedas en lineas', () => {
    const cfg: ConfigMesa = { ...CONFIG_MESA_DEFAULT, ruedas: true, tipo_rueda: 'inox_3_freno', cant_ruedas: 4 }
    const resultado = calcularApuMesa(cfg, DEMO_PRECIOS)
    const lineaRuedas = resultado.lineas.find(l => l.descripcion.toUpperCase().includes('RUEDA'))
    const lineaPlatina = resultado.lineas.find(l => l.descripcion.toUpperCase().includes('PLATINA'))
    expect(lineaRuedas).toBeDefined()
    expect(lineaPlatina).toBeDefined()
    expect(lineaRuedas!.cantidad).toBe(4)
  })

  it('acero 430 usa precio diferente al 304', () => {
    const cfg304 = { ...CONFIG_MESA_DEFAULT, tipo_acero: '304' as const }
    const cfg430 = { ...CONFIG_MESA_DEFAULT, tipo_acero: '430' as const, acabado: 'satinado' as const }
    const res304 = calcularApuMesa(cfg304, DEMO_PRECIOS)
    const res430 = calcularApuMesa(cfg430, DEMO_PRECIOS)
    // 430 is cheaper than 304
    expect(res430.costo_insumos).toBeLessThan(res304.costo_insumos)
  })
})

describe('types consistency', () => {
  it('SECTORES includes expected values', async () => {
    const { SECTORES } = await import('../../types')
    expect(SECTORES).toContain('Restaurantes')
    expect(SECTORES).toContain('Cl\u00ednicas/Hospitales')
    expect(SECTORES).toContain('Industrial')
    expect(SECTORES).toContain('Comercial')
    expect(SECTORES).toContain('Otro')
  })

  it('COTIZADORES C.A es Camilo Araque', async () => {
    const { COTIZADORES } = await import('../../types')
    const ca = COTIZADORES.find(c => c.id === 'CA')
    expect(ca).toBeDefined()
    expect(ca!.nombre).toBe('Camilo Araque')
  })

  it('ETAPAS tiene 8 etapas (incluye recotizada)', async () => {
    const { ETAPAS } = await import('../../types')
    expect(ETAPAS).toHaveLength(8)
    expect(ETAPAS.map(e => e.key)).toContain('nuevo_lead')
    expect(ETAPAS.map(e => e.key)).toContain('recotizada')
    expect(ETAPAS.map(e => e.key)).toContain('adjudicada')
    expect(ETAPAS.map(e => e.key)).toContain('perdida')
  })
})

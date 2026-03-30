import { describe, it, expect } from 'vitest'
import { evalFormula, resolverMaterial, calcularAPUGenerico } from '../evaluar-formula'
import type { LineaAPU, MaterialTemplate } from '../evaluar-formula'

/* ── evalFormula unit tests ──────────────────────── */

describe('evalFormula', () => {
  it('evaluates simple arithmetic', () => {
    expect(evalFormula('2 + 3', {})).toBe(5)
  })

  it('substitutes variables', () => {
    expect(evalFormula('largo * ancho', { largo: 2, ancho: 0.7 })).toBeCloseTo(1.4)
  })

  it('handles toggle variables (true/false)', () => {
    expect(evalFormula('babero * 10', { babero: true })).toBe(10)
    expect(evalFormula('babero * 10', { babero: false })).toBe(0)
  })

  it('handles string SI/NO toggles', () => {
    expect(evalFormula('poliza * 100', { poliza: 'SI' })).toBe(100)
    expect(evalFormula('poliza * 100', { poliza: 'NO' })).toBe(0)
  })

  it('handles ceil, max, min', () => {
    expect(evalFormula('ceil(2.1)', {})).toBe(3)
    expect(evalFormula('max(3, 7)', {})).toBe(7)
    expect(evalFormula('min(3, 7)', {})).toBe(3)
  })

  it('handles pi', () => {
    expect(evalFormula('pi', {})).toBeCloseTo(Math.PI)
  })

  it('handles comparison operators', () => {
    expect(evalFormula('3 > 2', {})).toBeTruthy()
    expect(evalFormula('1 == 0', {})).toBeFalsy()
  })

  it('does not partially replace variable names', () => {
    // "largo" should not replace the "largo" inside "largo_pozuelo"
    expect(evalFormula('largo + largo_extra', { largo: 2, largo_extra: 3 })).toBe(5)
  })

  it('returns 0 for invalid formulas', () => {
    expect(evalFormula('???invalid', {})).toBe(0)
  })
})

/* ── resolverMaterial tests ──────────────────────── */

describe('resolverMaterial', () => {
  it('replaces placeholders with variable values', () => {
    const result = resolverMaterial(
      'LAMINA LISA ACERO INOXIDABLE {tipo_acero} {acabado} CAL {calibre}',
      { tipo_acero: '304', acabado: 'MATE', calibre: '18' },
    )
    expect(result).toBe('LAMINA LISA ACERO INOXIDABLE 304 MATE CAL 18')
  })

  it('handles missing variables gracefully', () => {
    const result = resolverMaterial('MATERIAL {tipo}', {})
    expect(result).toBe('MATERIAL {tipo}')
  })
})

/* ── Full APU calculation ────────────────────────── */

describe('calcularAPUGenerico — Mesa estándar', () => {
  // Default variables for standard mesa: 2x0.70x0.90, 304 Mate Cal 18
  const vars = {
    largo: 2, ancho: 0.7, alto: 0.9,
    desarrollo_omegas: 0.15,
    tipo_acero: 304, acabado: 'MATE', calibre: 18,
    salp_longitudinal: 1, salp_costado: 1, alto_salpicadero: 0.10,
    babero: 1, alto_babero: 0.25, babero_costados: 0,
    refuerzo_rh: 0,
    entrepanos: 1, patas: 4, ruedas: 0, num_ruedas: 4,
    pozuelos_rect: 1, poz_largo: 0.54, poz_ancho: 0.39, poz_alto: 0.18, pozuelo_redondo: 1,
    escabiladero: 0, cant_bandejeros: 3,
    vertedero: 0, diametro_vertedero: 0.45, prof_vertedero: 0.50,
    poliza: 0, instalado: 1, push_pedal: 0,
    tornillos_por_m: 4, pl285_m2_galon: 4, metros_rollo_cinta: 32,
  }

  // Mock prices (approximate real values from precios_maestro)
  const precios: Record<string, number> = {
    'LAMINA LISA ACERO INOXIDABLE 304 MATE CAL 18': 200488,
    'LAMINA LISA ACERO INOXIDABLE 304 SATINADO CAL 20': 174667,
    'TUBO ACERO INOXIDABLE CUADRADO 1 1/2" CAL 16': 19775,
    'NIVELADOR NACIONAL INOX CUADRADO 1 1/2"': 2900,
    'POZUELO INOX REDONDO 37': 127500,
    'CINTA 3M ACERO': 50000,
    'DISCOS CORTE 4 1/2"': 1483,
    'DISCOS FLAP INOX 4 1/2" GRANO 60': 21073,
    'PAÑO SCOTCH BRITE 3M': 5500,
    'LIJA ZC INOX GRANO 80': 3200,
    'GRATA ALAMBRE INOX  2"': 5443,
  }

  const materiales: MaterialTemplate[] = [
    { alias: 'lamina_mesa', template_nombre: 'LAMINA LISA ACERO INOXIDABLE {tipo_acero} {acabado} CAL {calibre}', es_fijo: false },
    { alias: 'lamina_babero', template_nombre: 'LAMINA LISA ACERO INOXIDABLE {tipo_acero} SATINADO CAL 20', es_fijo: false },
    { alias: 'lamina_pozuelo', template_nombre: 'LAMINA LISA ACERO INOXIDABLE {tipo_acero} {acabado} CAL {calibre}', es_fijo: false },
    { alias: 'tubo_patas', template_nombre: 'TUBO ACERO INOXIDABLE CUADRADO 1 1/2" CAL 16', es_fijo: false },
    { alias: 'niveladores', template_nombre: 'NIVELADOR NACIONAL INOX CUADRADO 1 1/2"', es_fijo: false },
    { alias: 'pozuelo_redondo', template_nombre: 'POZUELO INOX REDONDO 37', es_fijo: false },
    { alias: 'cinta_3m', template_nombre: 'CINTA 3M ACERO', es_fijo: false },
    { alias: 'disco_corte', template_nombre: 'DISCOS CORTE 4 1/2"', es_fijo: false },
    { alias: 'disco_flap', template_nombre: 'DISCOS FLAP INOX 4 1/2" GRANO 60', es_fijo: false },
    { alias: 'pano', template_nombre: 'PAÑO SCOTCH BRITE 3M', es_fijo: false },
    { alias: 'lija', template_nombre: 'LIJA ZC INOX GRANO 80', es_fijo: false },
    { alias: 'grata', template_nombre: 'GRATA ALAMBRE INOX  2"', es_fijo: false },
    { alias: 'argon', template_nombre: 'ARGÓN', es_fijo: true, precio_fijo: 4000 },
    { alias: 'empaque', template_nombre: 'EMPAQUE', es_fijo: true, precio_fijo: 3500 },
    { alias: 'laser', template_nombre: 'CORTE LÁSER', es_fijo: true, precio_fijo: 6500 },
    { alias: 'tte_elementos', template_nombre: 'TRANSPORTE ELEMENTOS', es_fijo: true, precio_fijo: 15000 },
    { alias: 'tte_regreso', template_nombre: 'TRANSPORTE REGRESO', es_fijo: true, precio_fijo: 5000 },
  ]

  const tarifasMO: Record<string, number> = {
    MO_ACERO: 30000,
    MO_PULIDO: 23000,
    MO_PATAS: 10000,
    MO_INSTALACION: 22200,
  }

  // Subset of líneas for a meaningful test (insumos + mo + transporte + laser)
  const lineas: LineaAPU[] = [
    // Key insumos
    { seccion: 'insumos', orden: 1, descripcion: 'Acero mesa', material_alias: 'lamina_mesa', formula_cantidad: '(largo+0.12)*(ancho+0.12)+((alto_salpicadero+0.04)*salp_longitudinal*largo+(alto_salpicadero+0.04)*salp_costado*ancho)', desperdicio: 0 },
    { seccion: 'insumos', orden: 2, descripcion: 'Omegas mesa', material_alias: 'lamina_mesa', formula_cantidad: '(1 - refuerzo_rh) * (desarrollo_omegas*largo*ceil(ancho/0.6) + desarrollo_omegas*ancho*(ceil(largo/2) + 2*(pozuelos_rect+pozuelo_redondo)) + 0.078*(salp_longitudinal*largo+salp_costado*ancho))', desperdicio: 0 },
    { seccion: 'insumos', orden: 3, descripcion: 'Entrepaño', material_alias: 'lamina_mesa', formula_cantidad: '(largo+0.12)*(ancho+0.12)*entrepanos', desperdicio: 0, condicion: 'entrepanos > 0' },
    { seccion: 'insumos', orden: 4, descripcion: 'Babero', material_alias: 'lamina_babero', formula_cantidad: '(alto_babero+0.06)*(largo+0.06)*babero + (ancho+0.06)*(alto_babero+0.06)*babero_costados', desperdicio: 0, condicion: 'babero == 1' },
    { seccion: 'insumos', orden: 5, descripcion: 'Pozuelo rect', material_alias: 'lamina_pozuelo', formula_cantidad: '((poz_largo+poz_alto*2)*poz_ancho + poz_largo*poz_alto*2) * pozuelos_rect', desperdicio: 0.10, condicion: 'pozuelos_rect > 0' },
    { seccion: 'insumos', orden: 6, descripcion: 'Pozuelo redondo', material_alias: 'pozuelo_redondo', formula_cantidad: 'pozuelo_redondo', desperdicio: 0, condicion: 'pozuelo_redondo > 0' },
    { seccion: 'insumos', orden: 7, descripcion: 'Omegas entrepaño', material_alias: 'lamina_mesa', formula_cantidad: '(desarrollo_omegas*largo*ceil(ancho/0.6) + desarrollo_omegas*ancho*ceil(largo/2)) * entrepanos', desperdicio: 0, condicion: 'entrepanos > 0' },
    { seccion: 'insumos', orden: 8, descripcion: 'Patas', material_alias: 'tubo_patas', formula_cantidad: 'patas*alto + (1 - min(entrepanos, 1))*(largo + ancho*patas/2)', desperdicio: 0.10 },
    { seccion: 'insumos', orden: 9, descripcion: 'Niveladores', material_alias: 'niveladores', formula_cantidad: 'patas', desperdicio: 0, condicion: 'ruedas == 0' },
    { seccion: 'insumos', orden: 10, descripcion: 'Cinta 3M', material_alias: 'cinta_3m', formula_cantidad: 'ceil(((largo*ceil(ancho/0.6) + ancho*(ceil(largo/2) + 2*(pozuelos_rect+pozuelo_redondo))) + (largo*ceil(ancho/0.6) + ancho*ceil(largo/2))*entrepanos) * 2 / metros_rollo_cinta)', desperdicio: 0, condicion: 'refuerzo_rh == 0' },
    { seccion: 'insumos', orden: 11, descripcion: 'Argón', material_alias: 'argon', formula_cantidad: 'largo + largo*entrepanos + patas/4 + pozuelos_rect + pozuelo_redondo + vertedero*4', desperdicio: 0 },
    { seccion: 'insumos', orden: 12, descripcion: 'Disco corte', material_alias: 'disco_corte', formula_cantidad: '(largo + largo*entrepanos + patas/4 + pozuelos_rect + pozuelo_redondo + vertedero*4) / 3', desperdicio: 0 },
    { seccion: 'insumos', orden: 13, descripcion: 'Disco flap', material_alias: 'disco_flap', formula_cantidad: '(largo + largo*entrepanos + patas/4 + pozuelos_rect + pozuelo_redondo + vertedero*4) / 8', desperdicio: 0 },
    { seccion: 'insumos', orden: 14, descripcion: 'Paño', material_alias: 'pano', formula_cantidad: '(largo + largo*entrepanos + patas/4 + pozuelos_rect + pozuelo_redondo + vertedero*4) / 3', desperdicio: 0 },
    { seccion: 'insumos', orden: 15, descripcion: 'Lija', material_alias: 'lija', formula_cantidad: '(largo + largo*entrepanos + patas/4 + pozuelos_rect + pozuelo_redondo + vertedero*4) / 4', desperdicio: 0 },
    { seccion: 'insumos', orden: 16, descripcion: 'Grata', material_alias: 'grata', formula_cantidad: '(largo + largo*entrepanos + patas/4 + pozuelos_rect + pozuelo_redondo + vertedero*4) / 30', desperdicio: 0 },
    { seccion: 'insumos', orden: 17, descripcion: 'Empaque', material_alias: 'empaque', formula_cantidad: 'largo', desperdicio: 0 },
    // MO
    { seccion: 'mo', orden: 1, descripcion: 'MO Acero', material_alias: 'MO_ACERO', formula_cantidad: 'largo + pozuelos_rect + pozuelo_redondo + entrepanos*largo', desperdicio: 0 },
    { seccion: 'mo', orden: 2, descripcion: 'MO Pulido', material_alias: 'MO_PULIDO', formula_cantidad: 'largo + pozuelos_rect + pozuelo_redondo + entrepanos*largo', desperdicio: 0 },
    { seccion: 'mo', orden: 3, descripcion: 'MO Patas', material_alias: 'MO_PATAS', formula_cantidad: 'patas', desperdicio: 0 },
    { seccion: 'mo', orden: 4, descripcion: 'MO Instalación', material_alias: 'MO_INSTALACION', formula_cantidad: 'largo', desperdicio: 0, condicion: 'instalado == 1' },
    // Transporte
    { seccion: 'transporte', orden: 1, descripcion: 'TTE Elementos', material_alias: 'tte_elementos', formula_cantidad: 'max(largo, 1)', desperdicio: 0 },
    { seccion: 'transporte', orden: 2, descripcion: 'TTE Regreso', material_alias: 'tte_regreso', formula_cantidad: 'max(largo, 1)', desperdicio: 0 },
    // Laser
    { seccion: 'laser', orden: 1, descripcion: 'Corte láser', material_alias: 'laser', formula_cantidad: 'ceil(largo + pozuelos_rect + pozuelo_redondo + vertedero + largo*entrepanos)', desperdicio: 0 },
  ]

  it('calculates MO correctly: 6ml×$30k + 6ml×$23k + 4und×$10k + 2ml×$22.2k = $402,400', () => {
    const result = calcularAPUGenerico(lineas, vars, materiales, precios, tarifasMO)
    // MO Acero: (2+1+1+1*2)=6 × 30000 = 180000
    // MO Pulido: 6 × 23000 = 138000
    // MO Patas: 4 × 10000 = 40000
    // MO Instalación: 2 × 22200 = 44400
    expect(result.totalMO).toBeCloseTo(402400, -2)
  })

  it('calculates transporte correctly: 2×$15k + 2×$5k = $40,000', () => {
    const result = calcularAPUGenerico(lineas, vars, materiales, precios, tarifasMO)
    expect(result.totalTransporte).toBe(40000)
  })

  it('calculates laser correctly: ceil(2+1+1+0+2)=6 × $6,500 = $39,000', () => {
    const result = calcularAPUGenerico(lineas, vars, materiales, precios, tarifasMO)
    expect(result.totalLaser).toBe(39000)
  })

  it('all active lines have precio > 0 (no missing materials)', () => {
    const result = calcularAPUGenerico(lineas, vars, materiales, precios, tarifasMO)
    for (const l of result.lineas) {
      if (l.condicion_activa && l.cantidad > 0) {
        expect(l.precio_unitario).toBeGreaterThan(0)
      }
    }
  })

  it('conditional lines are inactive when condition is false', () => {
    const noEntrepano = { ...vars, entrepanos: 0 }
    const result = calcularAPUGenerico(lineas, noEntrepano, materiales, precios, tarifasMO)
    const entrepaño = result.lineas.find(l => l.descripcion === 'Entrepaño')
    expect(entrepaño?.condicion_activa).toBe(false)
  })

  it('disabling babero removes babero cost', () => {
    const noBabero = { ...vars, babero: 0 }
    const result = calcularAPUGenerico(lineas, noBabero, materiales, precios, tarifasMO)
    const babero = result.lineas.find(l => l.descripcion === 'Babero')
    expect(babero?.condicion_activa).toBe(false)
  })

  it('poliza calculates as 2% of everything else', () => {
    const lineasWithPoliza: LineaAPU[] = [
      ...lineas,
      { seccion: 'poliza', orden: 1, descripcion: 'Póliza', material_alias: '', formula_cantidad: '1', desperdicio: 0, condicion: 'poliza == 1' },
    ]
    const withPoliza = { ...vars, poliza: 1 }
    const result = calcularAPUGenerico(lineasWithPoliza, withPoliza, materiales, precios, tarifasMO)
    const subtotal = result.totalInsumos + result.totalMO + result.totalTransporte + result.totalLaser
    expect(result.totalPoliza).toBeCloseTo(subtotal * 0.02, -1)
  })

  it('niveladores appear when ruedas=0, disappear when ruedas=1', () => {
    const withWheels = { ...vars, ruedas: 1 }
    const result = calcularAPUGenerico(lineas, withWheels, materiales, precios, tarifasMO)
    const niv = result.lineas.find(l => l.descripcion === 'Niveladores')
    expect(niv?.condicion_activa).toBe(false)
  })
})

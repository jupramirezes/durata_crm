import { describe, it, expect } from 'vitest'
import { reducer, getActiveCotizacionValor } from '../lib/store'
import type { Cotizacion } from '../types'

// Minimal state factory
function makeState(overrides: Partial<ReturnType<typeof reducer>> = {}) {
  return {
    empresas: [],
    contactos: [],
    oportunidades: [
      { id: 'opp1', empresa_id: 'e1', contacto_id: 'c1', etapa: 'cotizacion_enviada' as const, valor_cotizado: 100000, valor_adjudicado: 0, cotizador_asignado: 'OC', fecha_ingreso: '2026-01-01', fecha_envio: '2026-01-02', fuente_lead: 'Otro' as const, motivo_perdida: '', notas: '', ubicacion: '', sector_cliente: '', fecha_adjudicacion: undefined, fecha_ultimo_contacto: '', valor_estimado: 0, created_at: '2026-01-01' },
    ],
    historial: [],
    productos: [],
    cotizaciones: [
      { id: 'cot570', oportunidad_id: 'opp1', numero: '2026-570', fecha: '2026-01-15', estado: 'enviada' as const, total: 100000000 },
    ] as Cotizacion[],
    precios: [],
    isHydrated: false,
    ...overrides,
  }
}

describe('Recotización', () => {
  it('RECOTIZAR descarta la cotización original y crea nueva versión', () => {
    const state = makeState()
    const result = reducer(state, {
      type: 'RECOTIZAR',
      payload: { cotizacionId: 'cot570', nuevoNumero: '2026-570A' },
    })
    const original = result.cotizaciones.find(c => c.id === 'cot570')
    expect(original?.estado).toBe('descartada')
    const nueva = result.cotizaciones.find(c => c.numero === '2026-570A')
    expect(nueva).toBeDefined()
    expect(nueva?.estado).toBe('borrador')
    expect(nueva?.oportunidad_id).toBe('opp1')
    // D-11: la oportunidad debe pasar a 'recotizada'
    const opp = result.oportunidades.find(o => o.id === 'opp1')
    expect(opp?.etapa).toBe('recotizada')
  })

  it('RECOTIZAR actualiza valor_cotizado a la última versión activa', () => {
    const state = makeState({
      cotizaciones: [
        { id: 'cot570', oportunidad_id: 'opp1', numero: '2026-570', fecha: '2026-01-15', estado: 'enviada' as const, total: 100000000 },
      ] as Cotizacion[],
    })
    const result = reducer(state, {
      type: 'RECOTIZAR',
      payload: { cotizacionId: 'cot570', nuevoNumero: '2026-570A' },
    })
    // nueva cotización starts with total=0 (snapshot cleared, recalculated at PDF gen)
    // original was descartada so valor_cotizado = sum of non-descartada/rechazada = new version's total
    const opp = result.oportunidades.find(o => o.id === 'opp1')
    expect(opp?.valor_cotizado).toBe(0)
    // D-11: la oportunidad debe quedar en 'recotizada' (no cuenta al pipeline de valor)
    expect(opp?.etapa).toBe('recotizada')
  })

  it('Al adjudicar, aprueba la última activa y descarta las demás', () => {
    const state = makeState({
      cotizaciones: [
        { id: 'cot570', oportunidad_id: 'opp1', numero: '2026-570', fecha: '2026-01-15', estado: 'descartada' as const, total: 100000000 },
        { id: 'cot570A', oportunidad_id: 'opp1', numero: '2026-570A', fecha: '2026-01-20', estado: 'enviada' as const, total: 95000000 },
      ] as Cotizacion[],
    })
    const result = reducer(state, {
      type: 'MOVE_ETAPA',
      payload: { oportunidadId: 'opp1', nuevaEtapa: 'adjudicada', valor_adjudicado: 95000000 },
    })
    const approved = result.cotizaciones.find(c => c.id === 'cot570A')
    expect(approved?.estado).toBe('aprobada')
    const discarded = result.cotizaciones.find(c => c.id === 'cot570')
    expect(discarded?.estado).toBe('descartada')
    const opp = result.oportunidades.find(o => o.id === 'opp1')
    expect(opp?.etapa).toBe('adjudicada')
    expect(opp?.valor_adjudicado).toBe(95000000)
  })

  it('getActiveCotizacionValor retorna solo la última versión activa', () => {
    const cots: Cotizacion[] = [
      { id: '1', oportunidad_id: 'opp1', numero: '2026-570', fecha: '2026-01-15', estado: 'descartada', total: 100000000 },
      { id: '2', oportunidad_id: 'opp1', numero: '2026-570A', fecha: '2026-01-20', estado: 'descartada', total: 95000000 },
      { id: '3', oportunidad_id: 'opp1', numero: '2026-570B', fecha: '2026-01-25', estado: 'enviada', total: 90000000 },
    ]
    expect(getActiveCotizacionValor(cots, 'opp1')).toBe(90000000)
  })

  it('getActiveCotizacionValor ignora cotizaciones descartadas', () => {
    const cots: Cotizacion[] = [
      { id: '1', oportunidad_id: 'opp1', numero: '2026-570', fecha: '2026-01-15', estado: 'descartada', total: 100000000 },
      { id: '2', oportunidad_id: 'opp1', numero: '2026-570A', fecha: '2026-01-20', estado: 'descartada', total: 95000000 },
    ]
    // All discarded → returns 0
    expect(getActiveCotizacionValor(cots, 'opp1')).toBe(0)
  })
})

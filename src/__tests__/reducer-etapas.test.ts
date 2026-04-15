import { describe, it, expect } from 'vitest'
import { reducer } from '../lib/store'
import type { Oportunidad, Empresa, Contacto, HistorialEtapa, ProductoCliente, Cotizacion, PrecioMaestro } from '../types'

function makeState(overrides: Record<string, unknown> = {}) {
  return {
    empresas: [] as Empresa[],
    contactos: [] as Contacto[],
    oportunidades: [] as Oportunidad[],
    historial: [] as HistorialEtapa[],
    productos: [] as ProductoCliente[],
    cotizaciones: [] as Cotizacion[],
    precios: [] as PrecioMaestro[],
    isHydrated: false,
    ...overrides,
  }
}

function makeOpp(id: string, etapa: string, extras: Record<string, unknown> = {}): Oportunidad {
  return {
    id,
    empresa_id: 'emp-1',
    contacto_id: 'con-1',
    descripcion: 'Test',
    etapa,
    valor_estimado: 0,
    valor_cotizado: 1000000,
    valor_adjudicado: 0,
    cotizador_asignado: 'OC',
    fuente_lead: 'Referido',
    motivo_perdida: '',
    ubicacion: '',
    fecha_ingreso: '2026-01-01',
    fecha_ultimo_contacto: '2026-01-01',
    notas: '',
    created_at: '2026-01-01',
    ...extras,
  } as unknown as Oportunidad
}

describe('Reducer — Movimiento de etapas', () => {
  it('mueve de nuevo_lead a en_cotizacion', () => {
    const state = makeState({ oportunidades: [makeOpp('op-1', 'nuevo_lead')] })
    const next = reducer(state, {
      type: 'MOVE_ETAPA',
      payload: { oportunidadId: 'op-1', nuevaEtapa: 'en_cotizacion' },
    })
    expect(next.oportunidades[0].etapa).toBe('en_cotizacion')
  })

  it('mueve a adjudicada con valor_adjudicado', () => {
    const state = makeState({ oportunidades: [makeOpp('op-1', 'cotizacion_enviada')] })
    const next = reducer(state, {
      type: 'MOVE_ETAPA',
      payload: { oportunidadId: 'op-1', nuevaEtapa: 'adjudicada', valor_adjudicado: 5000000 },
    })
    expect(next.oportunidades[0].etapa).toBe('adjudicada')
    expect(next.oportunidades[0].valor_adjudicado).toBe(5000000)
  })

  it('mueve a perdida con motivo_perdida', () => {
    const state = makeState({ oportunidades: [makeOpp('op-1', 'en_seguimiento')] })
    const next = reducer(state, {
      type: 'MOVE_ETAPA',
      payload: { oportunidadId: 'op-1', nuevaEtapa: 'perdida', motivo_perdida: 'Precio alto' },
    })
    expect(next.oportunidades[0].etapa).toBe('perdida')
    expect(next.oportunidades[0].motivo_perdida).toBe('Precio alto')
  })

  it('reasigna de adjudicada a otra etapa', () => {
    const state = makeState({ oportunidades: [makeOpp('op-1', 'adjudicada', { valor_adjudicado: 3000000 })] })
    const next = reducer(state, {
      type: 'MOVE_ETAPA',
      payload: { oportunidadId: 'op-1', nuevaEtapa: 'en_negociacion' },
    })
    expect(next.oportunidades[0].etapa).toBe('en_negociacion')
  })

  it('no mueve si la etapa es la misma', () => {
    const state = makeState({ oportunidades: [makeOpp('op-1', 'en_seguimiento')] })
    const next = reducer(state, {
      type: 'MOVE_ETAPA',
      payload: { oportunidadId: 'op-1', nuevaEtapa: 'en_seguimiento' },
    })
    // State should be unchanged (same reference)
    expect(next).toBe(state)
  })

  it('actualiza historial de etapas al mover', () => {
    const state = makeState({ oportunidades: [makeOpp('op-1', 'nuevo_lead')] })
    const next = reducer(state, {
      type: 'MOVE_ETAPA',
      payload: { oportunidadId: 'op-1', nuevaEtapa: 'en_cotizacion' },
    })
    expect(next.historial).toHaveLength(1)
    expect(next.historial[0].etapa_anterior).toBe('nuevo_lead')
    expect(next.historial[0].etapa_nueva).toBe('en_cotizacion')
    expect(next.historial[0].oportunidad_id).toBe('op-1')
  })

  it('acumula historial con múltiples movimientos', () => {
    let state = makeState({ oportunidades: [makeOpp('op-1', 'nuevo_lead')] })
    state = reducer(state, { type: 'MOVE_ETAPA', payload: { oportunidadId: 'op-1', nuevaEtapa: 'en_cotizacion' } })
    state = reducer(state, { type: 'MOVE_ETAPA', payload: { oportunidadId: 'op-1', nuevaEtapa: 'cotizacion_enviada' } })
    state = reducer(state, { type: 'MOVE_ETAPA', payload: { oportunidadId: 'op-1', nuevaEtapa: 'adjudicada', valor_adjudicado: 2000000 } })
    expect(state.historial).toHaveLength(3)
    expect(state.oportunidades[0].etapa).toBe('adjudicada')
  })
})

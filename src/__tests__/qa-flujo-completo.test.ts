/**
 * QA runner E2E — Simula el flujo completo del CRM con dispatch.
 *
 * Objetivo: verificar que CADA transición del pipeline + acciones secundarias
 * (recotizar, adjudicar, perder, duplicar para otro cliente, etc.) resultan
 * en el estado esperado. Ejecuta SOLO el reducer (no BD), así que testea la
 * lógica de negocio pura.
 *
 * Flujos cubiertos:
 *   F1: nuevo_lead → en_cotizacion → cotizacion_enviada → adjudicada
 *   F2: nuevo_lead → en_cotizacion → cotizacion_enviada → perdida
 *   F3: cotizacion_enviada → recotizar (descarta original) → adjudicar la nueva
 *   F4: 2 cotizaciones activas → adjudicar una → la otra queda rechazada
 *   F5: adjudicar con valor distinto al cotizado (cliente negocia abajo)
 *   F6: rollup valor_cotizado en INSERT/UPDATE/DELETE de cotizaciones
 *   F7: recotizar 2 veces → versión activa es la última
 */
import { describe, it, expect } from 'vitest'
import { reducer, getActiveCotizacionValor } from '../lib/store'
import type { Oportunidad, Cotizacion, HistorialEtapa, ProductoCliente, PrecioMaestro, Empresa, Contacto } from '../types'

// ── Fixtures ───────────────────────────────────────────────────────
function baseState() {
  return {
    empresas: [
      { id: 'emp-1', nombre: 'Cliente Demo SAS', sector: 'Construcción', nit: '', direccion: '', notas: '', created_at: '2026-01-01' },
    ] as unknown as Empresa[],
    contactos: [
      { id: 'con-1', empresa_id: 'emp-1', nombre: 'Juan Pérez', cargo: '', correo: '', whatsapp: '', notas: '', created_at: '2026-01-01' },
    ] as Contacto[],
    oportunidades: [] as Oportunidad[],
    historial: [] as HistorialEtapa[],
    productos: [] as ProductoCliente[],
    cotizaciones: [] as Cotizacion[],
    precios: [] as PrecioMaestro[],
  }
}

function makeOpp(overrides: Partial<Oportunidad> = {}): Oportunidad {
  return {
    id: 'opp-1',
    empresa_id: 'emp-1',
    contacto_id: 'con-1',
    etapa: 'nuevo_lead',
    valor_estimado: 0,
    valor_cotizado: 0,
    valor_adjudicado: 0,
    cotizador_asignado: 'OC',
    fuente_lead: 'Referido',
    motivo_perdida: '',
    ubicacion: '',
    fecha_ingreso: '2026-04-15',
    fecha_envio: null,
    fecha_adjudicacion: undefined,
    fecha_ultimo_contacto: '',
    notas: 'COT: 2026-TEST',
    created_at: '2026-04-15',
    ...overrides,
  } as unknown as Oportunidad
}

function makeCot(overrides: Partial<Cotizacion> = {}): Cotizacion {
  return {
    id: 'cot-1',
    oportunidad_id: 'opp-1',
    numero: '2026-TEST',
    fecha: '2026-04-15',
    estado: 'borrador',
    total: 1000000,
    ...overrides,
  } as Cotizacion
}

// ── F1: Flujo completo feliz (adjudicada) ──────────────────────────
describe('F1 — Flujo completo feliz: nuevo_lead → adjudicada', () => {
  it('avanza por las 4 etapas y persiste valores correctamente', () => {
    let state = {
      ...baseState(),
      oportunidades: [makeOpp({ etapa: 'nuevo_lead' })],
      cotizaciones: [makeCot({ estado: 'borrador', total: 5000000 })],
    }

    // Paso 1: nuevo_lead → en_cotizacion
    state = reducer(state, { type: 'MOVE_ETAPA', payload: { oportunidadId: 'opp-1', nuevaEtapa: 'en_cotizacion' } })
    expect(state.oportunidades[0].etapa).toBe('en_cotizacion')

    // Paso 2: en_cotizacion → cotizacion_enviada
    state = reducer(state, {
      type: 'UPDATE_COTIZACION',
      payload: { id: 'cot-1', estado: 'enviada', fecha_envio: '2026-04-16' },
    })
    state = reducer(state, { type: 'MOVE_ETAPA', payload: { oportunidadId: 'opp-1', nuevaEtapa: 'cotizacion_enviada' } })
    expect(state.oportunidades[0].etapa).toBe('cotizacion_enviada')
    expect(state.cotizaciones[0].estado).toBe('enviada')

    // Paso 3: cotizacion_enviada → adjudicada
    state = reducer(state, {
      type: 'MOVE_ETAPA',
      payload: {
        oportunidadId: 'opp-1',
        nuevaEtapa: 'adjudicada',
        valor_adjudicado: 4900000,
        fecha_adjudicacion: '2026-04-20',
      },
    })
    const op = state.oportunidades[0]
    expect(op.etapa).toBe('adjudicada')
    expect(op.valor_adjudicado).toBe(4900000)
    expect(op.fecha_adjudicacion).toBe('2026-04-20')
    expect(state.cotizaciones[0].estado).toBe('aprobada')
  })
})

// ── F2: Flujo perdida ──────────────────────────────────────────────
describe('F2 — Flujo perdida: con motivo', () => {
  it('marca cotización activa como rechazada y guarda motivo', () => {
    let state = {
      ...baseState(),
      oportunidades: [makeOpp({ etapa: 'cotizacion_enviada' })],
      cotizaciones: [makeCot({ estado: 'enviada', total: 10000000 })],
    }
    state = reducer(state, {
      type: 'MOVE_ETAPA',
      payload: { oportunidadId: 'opp-1', nuevaEtapa: 'perdida', motivo_perdida: 'Precio' },
    })
    expect(state.oportunidades[0].etapa).toBe('perdida')
    expect(state.oportunidades[0].motivo_perdida).toBe('Precio')
    expect(state.cotizaciones[0].estado).toBe('rechazada')
  })
})

// ── F3: Recotizar + adjudicar la nueva ─────────────────────────────
describe('F3 — Recotizar antes de adjudicar', () => {
  it('al recotizar, el original queda descartada y la nueva es la ganadora', () => {
    let state = {
      ...baseState(),
      oportunidades: [makeOpp({ etapa: 'cotizacion_enviada' })],
      cotizaciones: [makeCot({ id: 'cot-1', numero: '2026-TEST', estado: 'enviada', total: 5000000 })],
    }
    state = reducer(state, {
      type: 'RECOTIZAR',
      payload: { cotizacionId: 'cot-1', nuevoNumero: '2026-TESTA', newCotId: 'cot-2' },
    })
    expect(state.cotizaciones.find(c => c.id === 'cot-1')?.estado).toBe('descartada')
    expect(state.cotizaciones.find(c => c.id === 'cot-2')?.estado).toBe('borrador')

    // Actualizar total de la nueva + enviarla
    state = reducer(state, { type: 'UPDATE_COTIZACION', payload: { id: 'cot-2', total: 5300000, estado: 'enviada' } })

    // Adjudicar
    state = reducer(state, {
      type: 'MOVE_ETAPA',
      payload: { oportunidadId: 'opp-1', nuevaEtapa: 'adjudicada', valor_adjudicado: 5300000 },
    })

    const cot1 = state.cotizaciones.find(c => c.id === 'cot-1')!
    const cot2 = state.cotizaciones.find(c => c.id === 'cot-2')!
    expect(cot1.estado).toBe('descartada') // se mantiene descartada (no rechazada)
    expect(cot2.estado).toBe('aprobada')
    expect(state.oportunidades[0].valor_adjudicado).toBe(5300000)
  })
})

// ── F4: 2 cotizaciones activas → adjudicar una ─────────────────────
describe('F4 — Múltiples cotizaciones activas', () => {
  it('adjudicar marca una como aprobada y el resto como rechazada', () => {
    let state = {
      ...baseState(),
      oportunidades: [makeOpp({ etapa: 'cotizacion_enviada' })],
      cotizaciones: [
        makeCot({ id: 'cot-a', numero: '2026-100', estado: 'enviada', total: 3000000 }),
        makeCot({ id: 'cot-b', numero: '2026-101', estado: 'enviada', total: 3500000 }),
      ],
    }
    // Simular que el usuario selecciona cot-b como ganadora y el reducer lo marca
    state = reducer(state, { type: 'UPDATE_COTIZACION', payload: { id: 'cot-b', estado: 'aprobada' } })
    state = reducer(state, {
      type: 'MOVE_ETAPA',
      payload: { oportunidadId: 'opp-1', nuevaEtapa: 'adjudicada', valor_adjudicado: 3500000 },
    })
    const cotA = state.cotizaciones.find(c => c.id === 'cot-a')!
    const cotB = state.cotizaciones.find(c => c.id === 'cot-b')!
    expect(cotB.estado).toBe('aprobada')
    expect(cotA.estado).toBe('rechazada')
  })
})

// ── F5: Adjudicar con valor negociado ──────────────────────────────
describe('F5 — Adjudicar con valor distinto al cotizado', () => {
  it('preserva valor_cotizado y setea valor_adjudicado independiente', () => {
    let state = {
      ...baseState(),
      oportunidades: [makeOpp({ etapa: 'cotizacion_enviada', valor_cotizado: 10000000 })],
      cotizaciones: [makeCot({ estado: 'enviada', total: 10000000 })],
    }
    state = reducer(state, {
      type: 'MOVE_ETAPA',
      payload: { oportunidadId: 'opp-1', nuevaEtapa: 'adjudicada', valor_adjudicado: 9500000 },
    })
    expect(state.oportunidades[0].valor_cotizado).toBe(10000000)
    expect(state.oportunidades[0].valor_adjudicado).toBe(9500000)
  })
})

// ── F6: Rollup valor_cotizado (C-01) ───────────────────────────────
describe('F6 — Rollup valor_cotizado en INSERT/UPDATE/DELETE', () => {
  it('INSERT cotización actualiza valor_cotizado de la oportunidad', () => {
    let state = {
      ...baseState(),
      oportunidades: [makeOpp({ etapa: 'nuevo_lead', valor_cotizado: 0 })],
      cotizaciones: [] as Cotizacion[],
    }
    state = reducer(state, {
      type: 'ADD_COTIZACION',
      payload: makeCot({ estado: 'enviada', total: 7777000 }),
    })
    expect(state.oportunidades[0].valor_cotizado).toBe(7777000)
  })

  it('UPDATE total de cotización actualiza rollup', () => {
    let state = {
      ...baseState(),
      oportunidades: [makeOpp({ etapa: 'cotizacion_enviada', valor_cotizado: 1000000 })],
      cotizaciones: [makeCot({ estado: 'enviada', total: 1000000 })],
    }
    state = reducer(state, {
      type: 'UPDATE_COTIZACION',
      payload: { id: 'cot-1', total: 2500000 },
    })
    expect(state.oportunidades[0].valor_cotizado).toBe(2500000)
  })

  it('DELETE cotización activa rebaja valor_cotizado', () => {
    let state = {
      ...baseState(),
      oportunidades: [makeOpp({ etapa: 'cotizacion_enviada', valor_cotizado: 3000000 })],
      cotizaciones: [makeCot({ estado: 'enviada', total: 3000000 })],
    }
    state = reducer(state, { type: 'DELETE_COTIZACION', payload: { id: 'cot-1' } })
    expect(state.oportunidades[0].valor_cotizado).toBe(0)
  })

  it('getActiveCotizacionValor ignora descartadas', () => {
    const cots: Cotizacion[] = [
      makeCot({ id: 'c1', estado: 'descartada', total: 999999 }),
      makeCot({ id: 'c2', estado: 'enviada', total: 1234 }),
    ]
    expect(getActiveCotizacionValor(cots, 'opp-1')).toBe(1234)
  })
})

// ── F8: Reversión de adjudicada/perdida (JP-E6) ─────────────────────
describe('F8 — Reversión de etapa final limpia estado cotización', () => {
  it('Adjudicada → cotizacion_enviada: cotización vuelve a enviada + valor_adjudicado reset', () => {
    let state = {
      ...baseState(),
      oportunidades: [makeOpp({ etapa: 'cotizacion_enviada' })],
      cotizaciones: [makeCot({ estado: 'enviada', total: 5000000 })],
    }
    // Adjudicar
    state = reducer(state, {
      type: 'MOVE_ETAPA',
      payload: { oportunidadId: 'opp-1', nuevaEtapa: 'adjudicada', valor_adjudicado: 5000000, fecha_adjudicacion: '2026-04-20' },
    })
    expect(state.oportunidades[0].etapa).toBe('adjudicada')
    expect(state.cotizaciones[0].estado).toBe('aprobada')
    expect(state.oportunidades[0].valor_adjudicado).toBe(5000000)

    // Revertir: usuario se equivocó, vuelve a cotizacion_enviada
    state = reducer(state, {
      type: 'MOVE_ETAPA',
      payload: { oportunidadId: 'opp-1', nuevaEtapa: 'cotizacion_enviada' },
    })
    expect(state.oportunidades[0].etapa).toBe('cotizacion_enviada')
    expect(state.cotizaciones[0].estado).toBe('enviada')  // ← reverted
    expect(state.oportunidades[0].valor_adjudicado).toBe(0)  // ← reset
    expect(state.oportunidades[0].fecha_adjudicacion).toBeFalsy()  // ← cleared
  })

  it('Perdida → cotizacion_enviada: cotización rechazada vuelve a enviada + motivo_perdida limpio', () => {
    let state = {
      ...baseState(),
      oportunidades: [makeOpp({ etapa: 'cotizacion_enviada' })],
      cotizaciones: [makeCot({ estado: 'enviada', total: 3000000 })],
    }
    state = reducer(state, {
      type: 'MOVE_ETAPA',
      payload: { oportunidadId: 'opp-1', nuevaEtapa: 'perdida', motivo_perdida: 'Precio' },
    })
    expect(state.cotizaciones[0].estado).toBe('rechazada')
    expect(state.oportunidades[0].motivo_perdida).toBe('Precio')

    state = reducer(state, {
      type: 'MOVE_ETAPA',
      payload: { oportunidadId: 'opp-1', nuevaEtapa: 'cotizacion_enviada' },
    })
    expect(state.cotizaciones[0].estado).toBe('enviada')  // ← reverted
    expect(state.oportunidades[0].motivo_perdida).toBe('')  // ← cleared
  })

  it('Descartadas se mantienen descartadas al revertir (no se regeneran)', () => {
    let state = {
      ...baseState(),
      oportunidades: [makeOpp({ etapa: 'cotizacion_enviada' })],
      cotizaciones: [
        makeCot({ id: 'cot-old', estado: 'descartada', total: 1000000 }),
        makeCot({ id: 'cot-new', estado: 'enviada', total: 2000000 }),
      ],
    }
    state = reducer(state, {
      type: 'MOVE_ETAPA',
      payload: { oportunidadId: 'opp-1', nuevaEtapa: 'adjudicada', valor_adjudicado: 2000000 },
    })
    state = reducer(state, {
      type: 'MOVE_ETAPA',
      payload: { oportunidadId: 'opp-1', nuevaEtapa: 'en_negociacion' },
    })
    const descartada = state.cotizaciones.find(c => c.id === 'cot-old')!
    const winner = state.cotizaciones.find(c => c.id === 'cot-new')!
    expect(descartada.estado).toBe('descartada')  // stays
    expect(winner.estado).toBe('enviada')  // reverted
  })
})

// ── F7: Recotizar múltiple ─────────────────────────────────────────
describe('F7 — Múltiples recotizaciones', () => {
  it('sólo la última versión queda activa; las previas en descartada', () => {
    let state = {
      ...baseState(),
      oportunidades: [makeOpp({ etapa: 'cotizacion_enviada' })],
      cotizaciones: [makeCot({ id: 'cot-1', numero: '2026-TEST', estado: 'enviada', total: 1000000 })],
    }
    // Recot 1: A
    state = reducer(state, {
      type: 'RECOTIZAR',
      payload: { cotizacionId: 'cot-1', nuevoNumero: '2026-TESTA', newCotId: 'cot-2' },
    })
    // Recot 2: B
    state = reducer(state, {
      type: 'RECOTIZAR',
      payload: { cotizacionId: 'cot-2', nuevoNumero: '2026-TESTB', newCotId: 'cot-3' },
    })

    const activas = state.cotizaciones.filter(c => c.estado !== 'descartada')
    expect(activas).toHaveLength(1)
    expect(activas[0].id).toBe('cot-3')
    expect(activas[0].numero).toBe('2026-TESTB')

    const descartadas = state.cotizaciones.filter(c => c.estado === 'descartada')
    expect(descartadas).toHaveLength(2)
  })
})

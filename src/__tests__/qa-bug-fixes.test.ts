/**
 * Bug-fix regression tests — QA Dispatch session 2026-04-15
 *
 * Covers:
 *   B-01 — _ROLLBACK_ADD reverts optimistic ADD_OPORTUNIDAD / ADD_COTIZACION
 *   C-02 — MOVE_ETAPA adjudicada respects pre-existing 'aprobada' cotización
 *   A-05 — isHydrated flag set by _HYDRATE; missing cot shows spinner (reducer logic)
 *   N-03 — getActiveCotizacionValor excludes rechazada; MOVE_ETAPA recalculates valor_cotizado
 *   A-02 — E2E: nuevo_lead → en_cotizacion via ADD_PRODUCTO and ADD_COTIZACION
 */
import { describe, it, expect } from 'vitest'
import { reducer, getActiveCotizacionValor } from '../lib/store'
import type { Empresa, Contacto, Oportunidad, Cotizacion, HistorialEtapa, ProductoCliente, PrecioMaestro } from '../types'
import { CONFIG_MESA_DEFAULT } from '../types'

// ── Fixtures ───────────────────────────────────────────────────────────────────

function emptyState() {
  return {
    empresas: [] as Empresa[],
    contactos: [] as Contacto[],
    oportunidades: [] as Oportunidad[],
    historial: [] as HistorialEtapa[],
    productos: [] as ProductoCliente[],
    cotizaciones: [] as Cotizacion[],
    precios: [] as PrecioMaestro[],
    isHydrated: false,
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
    fecha_ultimo_contacto: '',
    notas: '',
    created_at: '2026-04-15',
    ...overrides,
  } as unknown as Oportunidad
}

function makeCot(overrides: Partial<Cotizacion> = {}): Cotizacion {
  return {
    id: 'cot-1',
    oportunidad_id: 'opp-1',
    numero: '2026-001',
    fecha: '2026-04-15',
    estado: 'borrador',
    total: 1000000,
    ...overrides,
  } as Cotizacion
}

// ── B-01 — _ROLLBACK_ADD ───────────────────────────────────────────────────────

describe('B-01 — _ROLLBACK_ADD reverts optimistic updates', () => {
  it('rollback oportunidad removes it from state', () => {
    let state = emptyState()

    // Optimistic add
    state = reducer(state, {
      type: 'ADD_OPORTUNIDAD',
      payload: {
        id: 'opp-rollback',
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
        fecha_ultimo_contacto: '2026-04-15',
        notas: '',
      } as any,
    })
    expect(state.oportunidades).toHaveLength(1)

    // Supabase INSERT fails → rollback
    state = reducer(state, { type: '_ROLLBACK_ADD', payload: { entity: 'oportunidad', id: 'opp-rollback' } })
    expect(state.oportunidades).toHaveLength(0)
  })

  it('rollback cotizacion removes it and recalculates valor_cotizado', () => {
    let state = {
      ...emptyState(),
      oportunidades: [makeOpp({ valor_cotizado: 0 })],
    }

    // Optimistic add cotizacion
    state = reducer(state, {
      type: 'ADD_COTIZACION',
      payload: makeCot({ id: 'cot-rollback', estado: 'borrador', total: 5000000 }),
    })
    expect(state.oportunidades[0].valor_cotizado).toBe(5000000)
    expect(state.cotizaciones).toHaveLength(1)

    // Supabase INSERT fails → rollback
    state = reducer(state, { type: '_ROLLBACK_ADD', payload: { entity: 'cotizacion', id: 'cot-rollback' } })
    expect(state.cotizaciones).toHaveLength(0)
    expect(state.oportunidades[0].valor_cotizado).toBe(0)
  })

  it('rollback with unknown id is a no-op', () => {
    const state = { ...emptyState(), oportunidades: [makeOpp()] }
    const next = reducer(state, { type: '_ROLLBACK_ADD', payload: { entity: 'oportunidad', id: 'does-not-exist' } })
    expect(next.oportunidades).toHaveLength(1)
  })

  it('rollback does not affect other entities', () => {
    let state = {
      ...emptyState(),
      oportunidades: [makeOpp({ id: 'opp-1' }), makeOpp({ id: 'opp-2' })],
    }
    state = reducer(state, { type: '_ROLLBACK_ADD', payload: { entity: 'oportunidad', id: 'opp-1' } })
    expect(state.oportunidades).toHaveLength(1)
    expect(state.oportunidades[0].id).toBe('opp-2')
  })
})

// ── C-02 — MOVE_ETAPA adjudicada con yaAprobada ────────────────────────────────

describe('C-02 — MOVE_ETAPA adjudicada respects pre-existing aprobada cotización', () => {
  it('QA-C02-01: if cot is already aprobada, MOVE_ETAPA keeps it and marks others rechazada', () => {
    let state = {
      ...emptyState(),
      oportunidades: [makeOpp({ etapa: 'cotizacion_enviada', valor_cotizado: 3000000 })],
      cotizaciones: [
        makeCot({ id: 'cot-winner', estado: 'aprobada', total: 3000000, fecha: '2026-04-10' }),
        makeCot({ id: 'cot-other', estado: 'enviada', total: 2500000, fecha: '2026-04-12' }),
      ],
    }

    state = reducer(state, {
      type: 'MOVE_ETAPA',
      payload: { oportunidadId: 'opp-1', nuevaEtapa: 'adjudicada', valor_adjudicado: 3000000 },
    })

    const winner = state.cotizaciones.find(c => c.id === 'cot-winner')!
    const other = state.cotizaciones.find(c => c.id === 'cot-other')!
    // Pre-existing aprobada must stay aprobada
    expect(winner.estado).toBe('aprobada')
    // Other active cot must become rechazada
    expect(other.estado).toBe('rechazada')
  })

  it('without pre-existing aprobada, picks latest enviada/borrador as winner', () => {
    let state = {
      ...emptyState(),
      oportunidades: [makeOpp({ etapa: 'cotizacion_enviada' })],
      cotizaciones: [
        makeCot({ id: 'cot-old', estado: 'enviada', total: 1000000, fecha: '2026-03-01' }),
        makeCot({ id: 'cot-new', estado: 'enviada', total: 2000000, fecha: '2026-04-01' }),
      ],
    }

    state = reducer(state, {
      type: 'MOVE_ETAPA',
      payload: { oportunidadId: 'opp-1', nuevaEtapa: 'adjudicada', valor_adjudicado: 2000000 },
    })

    const cotNew = state.cotizaciones.find(c => c.id === 'cot-new')!
    const cotOld = state.cotizaciones.find(c => c.id === 'cot-old')!
    expect(cotNew.estado).toBe('aprobada')
    expect(cotOld.estado).toBe('rechazada')
  })

  it('adjudicada with only descartada cots leaves them descartada (no aprobada created)', () => {
    let state = {
      ...emptyState(),
      oportunidades: [makeOpp({ etapa: 'cotizacion_enviada' })],
      cotizaciones: [
        makeCot({ id: 'cot-old', estado: 'descartada', total: 1000000 }),
      ],
    }

    state = reducer(state, {
      type: 'MOVE_ETAPA',
      payload: { oportunidadId: 'opp-1', nuevaEtapa: 'adjudicada', valor_adjudicado: 0 },
    })

    expect(state.cotizaciones[0].estado).toBe('descartada')
    expect(state.oportunidades[0].etapa).toBe('adjudicada')
  })
})

// ── A-05 — isHydrated flag ─────────────────────────────────────────────────────

describe('A-05 — isHydrated flag behaviour', () => {
  it('initial state has isHydrated = false', () => {
    const state = emptyState()
    expect(state.isHydrated).toBe(false)
  })

  it('_HYDRATE with isHydrated: true marks store as hydrated', () => {
    const state = emptyState()
    const next = reducer(state, { type: '_HYDRATE', payload: { isHydrated: true } })
    expect(next.isHydrated).toBe(true)
  })

  it('_HYDRATE with data also sets isHydrated', () => {
    const state = emptyState()
    const next = reducer(state, {
      type: '_HYDRATE',
      payload: {
        isHydrated: true,
        cotizaciones: [makeCot()],
      },
    })
    expect(next.isHydrated).toBe(true)
    expect(next.cotizaciones).toHaveLength(1)
  })

  it('_HYDRATE without isHydrated does not change it', () => {
    const state = { ...emptyState(), isHydrated: false }
    const next = reducer(state, { type: '_HYDRATE', payload: { cotizaciones: [] } })
    expect(next.isHydrated).toBe(false)
  })

  it('isHydrated stays true across subsequent dispatches', () => {
    let state = reducer(emptyState(), { type: '_HYDRATE', payload: { isHydrated: true } })
    state = reducer(state, { type: 'ADD_OPORTUNIDAD', payload: makeOpp() as any })
    expect(state.isHydrated).toBe(true)
  })
})

// ── N-03 — getActiveCotizacionValor + MOVE_ETAPA valor_cotizado recalc ─────────

describe('N-03 — valor_cotizado SUM excludes rechazada; MOVE_ETAPA recalculates', () => {
  it('getActiveCotizacionValor excludes rechazada cots', () => {
    const cots: Cotizacion[] = [
      makeCot({ id: 'c1', estado: 'aprobada', total: 3000000 }),
      makeCot({ id: 'c2', estado: 'rechazada', total: 9999999 }),
      makeCot({ id: 'c3', estado: 'descartada', total: 1111111 }),
    ]
    expect(getActiveCotizacionValor(cots, 'opp-1')).toBe(3000000)
  })

  it('getActiveCotizacionValor returns SUM of multiple active cots', () => {
    const cots: Cotizacion[] = [
      makeCot({ id: 'c1', estado: 'enviada', total: 1000000 }),
      makeCot({ id: 'c2', estado: 'borrador', total: 500000 }),
      makeCot({ id: 'c3', estado: 'rechazada', total: 9999999 }),
    ]
    expect(getActiveCotizacionValor(cots, 'opp-1')).toBe(1500000)
  })

  it('getActiveCotizacionValor returns 0 when all cots are rechazada/descartada', () => {
    const cots: Cotizacion[] = [
      makeCot({ id: 'c1', estado: 'rechazada', total: 5000000 }),
      makeCot({ id: 'c2', estado: 'descartada', total: 3000000 }),
    ]
    expect(getActiveCotizacionValor(cots, 'opp-1')).toBe(0)
  })

  it('MOVE_ETAPA adjudicada updates valor_cotizado to winner total only', () => {
    let state = {
      ...emptyState(),
      oportunidades: [makeOpp({ etapa: 'cotizacion_enviada', valor_cotizado: 9999 })],
      cotizaciones: [
        makeCot({ id: 'cot-1', estado: 'enviada', total: 5000000, fecha: '2026-04-01' }),
        makeCot({ id: 'cot-2', estado: 'enviada', total: 3000000, fecha: '2026-03-01' }),
      ],
    }

    state = reducer(state, {
      type: 'MOVE_ETAPA',
      payload: { oportunidadId: 'opp-1', nuevaEtapa: 'adjudicada', valor_adjudicado: 5000000 },
    })

    // cot-1 (latest) becomes aprobada (5M), cot-2 becomes rechazada (0 contribution)
    expect(state.oportunidades[0].valor_cotizado).toBe(5000000)
  })

  it('MOVE_ETAPA perdida sets valor_cotizado to 0 (all cots rechazada)', () => {
    let state = {
      ...emptyState(),
      oportunidades: [makeOpp({ etapa: 'cotizacion_enviada', valor_cotizado: 8000000 })],
      cotizaciones: [
        makeCot({ id: 'cot-1', estado: 'enviada', total: 8000000 }),
      ],
    }

    state = reducer(state, {
      type: 'MOVE_ETAPA',
      payload: { oportunidadId: 'opp-1', nuevaEtapa: 'perdida', motivo_perdida: 'Precio' },
    })

    expect(state.oportunidades[0].valor_cotizado).toBe(0)
  })

  it('MOVE_ETAPA reversal (adjudicada → en_cotizacion) restores valor_cotizado from enviada cots', () => {
    let state = {
      ...emptyState(),
      oportunidades: [makeOpp({ etapa: 'cotizacion_enviada', valor_cotizado: 0 })],
      cotizaciones: [makeCot({ id: 'cot-1', estado: 'enviada', total: 5000000 })],
    }

    // Adjudicar
    state = reducer(state, {
      type: 'MOVE_ETAPA',
      payload: { oportunidadId: 'opp-1', nuevaEtapa: 'adjudicada', valor_adjudicado: 5000000 },
    })
    expect(state.oportunidades[0].valor_cotizado).toBe(5000000)

    // Revertir
    state = reducer(state, {
      type: 'MOVE_ETAPA',
      payload: { oportunidadId: 'opp-1', nuevaEtapa: 'cotizacion_enviada' },
    })
    // Cot reverts to 'enviada' → it's active again → valor_cotizado = 5000000
    expect(state.oportunidades[0].valor_cotizado).toBe(5000000)
    expect(state.oportunidades[0].valor_adjudicado).toBe(0)
  })
})

// ── A-02 — E2E: nuevo_lead → en_cotizacion transitions ────────────────────────

describe('A-02 — E2E: nuevo_lead → en_cotizacion via ADD_PRODUCTO and ADD_COTIZACION', () => {
  const baseState = () => ({
    ...emptyState(),
    empresas: [{ id: 'emp-1', nombre: 'ACME', sector: 'Industrial', nit: '', created_at: '' }] as unknown as Empresa[],
    contactos: [{ id: 'con-1', empresa_id: 'emp-1', nombre: 'Juan', created_at: '' }] as unknown as Contacto[],
    oportunidades: [makeOpp({ etapa: 'nuevo_lead', valor_cotizado: 0 })],
  })

  it('ADD_PRODUCTO on nuevo_lead opp moves it to en_cotizacion', () => {
    let state = baseState()

    state = reducer(state, {
      type: 'ADD_PRODUCTO',
      payload: {
        id: 'prod-1',
        oportunidad_id: 'opp-1',
        categoria: 'Mesas',
        subtipo: 'Mesa inox',
        configuracion: CONFIG_MESA_DEFAULT,
        precio_calculado: 2000000,
        descripcion_comercial: 'Mesa inoxidable 1.80x0.70',
        cantidad: 1,
      } as any,
    })

    expect(state.oportunidades[0].etapa).toBe('en_cotizacion')
    expect(state.historial).toHaveLength(1)
    expect(state.historial[0].etapa_anterior).toBe('nuevo_lead')
    expect(state.historial[0].etapa_nueva).toBe('en_cotizacion')
  })

  it('ADD_PRODUCTO on non-nuevo_lead opp does NOT move it', () => {
    let state = {
      ...baseState(),
      oportunidades: [makeOpp({ etapa: 'en_cotizacion', valor_cotizado: 0 })],
    }

    state = reducer(state, {
      type: 'ADD_PRODUCTO',
      payload: {
        id: 'prod-1',
        oportunidad_id: 'opp-1',
        categoria: 'Mesas',
        subtipo: 'Mesa inox',
        configuracion: CONFIG_MESA_DEFAULT,
        precio_calculado: 1000000,
        descripcion_comercial: 'Mesa inox',
        cantidad: 1,
      } as any,
    })

    expect(state.oportunidades[0].etapa).toBe('en_cotizacion')
    expect(state.historial).toHaveLength(0) // no auto-move happened
  })

  it('ADD_COTIZACION updates valor_cotizado on opp', () => {
    let state = baseState()

    state = reducer(state, {
      type: 'ADD_COTIZACION',
      payload: makeCot({ id: 'cot-new', estado: 'borrador', total: 7500000 }),
    })

    expect(state.oportunidades[0].valor_cotizado).toBe(7500000)
    expect(state.cotizaciones).toHaveLength(1)
  })

  it('full flow: ADD_PRODUCTO → MOVE_ETAPA → ADD_COTIZACION → MOVE_ETAPA adjudicada', () => {
    let state = baseState()

    // 1) Add producto (auto-moves to en_cotizacion)
    state = reducer(state, {
      type: 'ADD_PRODUCTO',
      payload: {
        id: 'prod-1',
        oportunidad_id: 'opp-1',
        categoria: 'Mesas',
        subtipo: 'Mesa',
        configuracion: CONFIG_MESA_DEFAULT,
        precio_calculado: 3000000,
        descripcion_comercial: 'Mesa inoxidable',
        cantidad: 1,
      } as any,
    })
    expect(state.oportunidades[0].etapa).toBe('en_cotizacion')

    // 2) Add cotización (from CotizacionEditor/OportunidadDetalle)
    state = reducer(state, {
      type: 'ADD_COTIZACION',
      payload: makeCot({ id: 'cot-1', estado: 'borrador', total: 3570000 }), // subtotal * 1.19
    })
    expect(state.oportunidades[0].valor_cotizado).toBe(3570000)

    // 3) Send cotización → auto-moves to cotizacion_enviada
    state = reducer(state, {
      type: 'UPDATE_COTIZACION_ESTADO',
      payload: { id: 'cot-1', estado: 'enviada' },
    })
    expect(state.oportunidades[0].etapa).toBe('cotizacion_enviada')
    expect(state.cotizaciones[0].estado).toBe('enviada')

    // 4) Adjudicar
    state = reducer(state, {
      type: 'MOVE_ETAPA',
      payload: { oportunidadId: 'opp-1', nuevaEtapa: 'adjudicada', valor_adjudicado: 3400000, fecha_adjudicacion: '2026-04-20' },
    })
    expect(state.oportunidades[0].etapa).toBe('adjudicada')
    expect(state.oportunidades[0].valor_adjudicado).toBe(3400000)
    expect(state.cotizaciones[0].estado).toBe('aprobada')
    expect(state.oportunidades[0].valor_cotizado).toBe(3570000) // winner total
    expect(state.historial.length).toBeGreaterThan(0)
  })
})

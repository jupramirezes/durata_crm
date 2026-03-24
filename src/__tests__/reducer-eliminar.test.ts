import { describe, it, expect } from 'vitest'
import { reducer } from '../lib/store'
import type { Empresa, Contacto, Oportunidad, ProductoCliente, Cotizacion, HistorialEtapa } from '../types'
import { CONFIG_MESA_DEFAULT } from '../types'

function makeState() {
  const emp: Empresa = { id: 'emp-1', nombre: 'Test Corp', nit: '900000000', sector: 'Industrial', created_at: '2026-01-01' } as Empresa
  const con: Contacto = { id: 'con-1', empresa_id: 'emp-1', nombre: 'Juan', correo: 'j@test.co', created_at: '2026-01-01' } as Contacto
  const oppBase = { valor_estimado: 0, fuente_lead: 'Referido', motivo_perdida: '', ubicacion: '', fecha_ultimo_contacto: '2026-01-01', notas: '' }
  const opp = { id: 'opp-1', empresa_id: 'emp-1', contacto_id: 'con-1', descripcion: 'Mesa', etapa: 'cotizacion_enviada', valor_cotizado: 1000000, valor_adjudicado: 0, cotizador_asignado: 'OC', fecha_ingreso: '2026-01-01', created_at: '2026-01-01', ...oppBase } as unknown as Oportunidad
  const opp2 = { id: 'opp-2', empresa_id: 'emp-2', contacto_id: 'con-2', descripcion: 'Pozuelo', etapa: 'nuevo_lead', valor_cotizado: 500000, valor_adjudicado: 0, cotizador_asignado: 'SA', fecha_ingreso: '2026-02-01', created_at: '2026-02-01', ...oppBase } as unknown as Oportunidad
  const prod: ProductoCliente = { id: 'prod-1', oportunidad_id: 'opp-1', categoria: 'Mesas', subtipo: 'Mesa', configuracion: CONFIG_MESA_DEFAULT, precio_calculado: 2000000, cantidad: 1 }
  const prod2: ProductoCliente = { id: 'prod-2', oportunidad_id: 'opp-2', categoria: 'Pozuelos', subtipo: 'Pozuelo', configuracion: CONFIG_MESA_DEFAULT, precio_calculado: 500000, cantidad: 1 }
  const cot: Cotizacion = { id: 'cot-1', oportunidad_id: 'opp-1', numero: '2026-001', fecha: '2026-01-15', total: 2000000, estado: 'enviada' } as Cotizacion
  const hist: HistorialEtapa = { id: 'h-1', oportunidad_id: 'opp-1', etapa_anterior: 'nuevo_lead', etapa_nueva: 'cotizacion_enviada', created_at: '2026-01-10' }

  return {
    empresas: [emp, { ...emp, id: 'emp-2', nombre: 'Other Corp' } as Empresa],
    contactos: [con, { ...con, id: 'con-2', empresa_id: 'emp-2', nombre: 'Maria' } as Contacto],
    oportunidades: [opp, opp2],
    historial: [hist],
    productos: [prod, prod2],
    cotizaciones: [cot],
    precios: [],
  }
}

describe('Reducer — Eliminación en cascada', () => {
  it('eliminar empresa cascada: oportunidades, cotizaciones, productos, contactos, historial', () => {
    const state = makeState()
    const next = reducer(state, { type: 'DELETE_EMPRESA', payload: { id: 'emp-1' } })

    expect(next.empresas.find(e => e.id === 'emp-1')).toBeUndefined()
    expect(next.contactos.find(c => c.empresa_id === 'emp-1')).toBeUndefined()
    expect(next.oportunidades.find(o => o.empresa_id === 'emp-1')).toBeUndefined()
    expect(next.productos.find(p => p.oportunidad_id === 'opp-1')).toBeUndefined()
    expect(next.cotizaciones.find(c => c.oportunidad_id === 'opp-1')).toBeUndefined()
    expect(next.historial.find(h => h.oportunidad_id === 'opp-1')).toBeUndefined()
  })

  it('eliminar empresa NO afecta otras empresas', () => {
    const state = makeState()
    const next = reducer(state, { type: 'DELETE_EMPRESA', payload: { id: 'emp-1' } })

    expect(next.empresas).toHaveLength(1)
    expect(next.empresas[0].id).toBe('emp-2')
    expect(next.oportunidades).toHaveLength(1)
    expect(next.oportunidades[0].id).toBe('opp-2')
    expect(next.productos).toHaveLength(1)
    expect(next.productos[0].id).toBe('prod-2')
  })

  it('eliminar oportunidad cascada: cotizaciones, productos, historial', () => {
    const state = makeState()
    const next = reducer(state, { type: 'DELETE_OPORTUNIDAD', payload: { id: 'opp-1' } })

    expect(next.oportunidades.find(o => o.id === 'opp-1')).toBeUndefined()
    expect(next.productos.find(p => p.oportunidad_id === 'opp-1')).toBeUndefined()
    expect(next.cotizaciones.find(c => c.oportunidad_id === 'opp-1')).toBeUndefined()
    expect(next.historial.find(h => h.oportunidad_id === 'opp-1')).toBeUndefined()
  })

  it('eliminar oportunidad NO afecta la empresa', () => {
    const state = makeState()
    const next = reducer(state, { type: 'DELETE_OPORTUNIDAD', payload: { id: 'opp-1' } })

    expect(next.empresas).toHaveLength(2)
    expect(next.contactos).toHaveLength(2)
  })

  it('eliminar producto NO afecta oportunidad ni cotización', () => {
    const state = makeState()
    const next = reducer(state, { type: 'DELETE_PRODUCTO', payload: { id: 'prod-1' } })

    expect(next.productos.find(p => p.id === 'prod-1')).toBeUndefined()
    expect(next.oportunidades).toHaveLength(2)
    expect(next.cotizaciones).toHaveLength(1)
    expect(next.historial).toHaveLength(1)
  })
})

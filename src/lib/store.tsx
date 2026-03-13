import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { Empresa, Contacto, Oportunidad, Etapa, HistorialEtapa, ProductoCliente, Cotizacion, PrecioMaestro } from '../types'
import { DEMO_EMPRESAS, DEMO_CONTACTOS, DEMO_OPORTUNIDADES, DEMO_PRECIOS, nextEmpresaId, nextContactoId, nextOportunidadId } from './demo-data'

interface State {
  empresas: Empresa[]
  contactos: Contacto[]
  oportunidades: Oportunidad[]
  historial: HistorialEtapa[]
  productos: ProductoCliente[]
  cotizaciones: Cotizacion[]
  precios: PrecioMaestro[]
}

type Action =
  | { type: 'ADD_EMPRESA'; payload: Omit<Empresa, 'id' | 'created_at'> & { id?: string } }
  | { type: 'UPDATE_EMPRESA'; payload: Empresa }
  | { type: 'ADD_CONTACTO'; payload: Omit<Contacto, 'id' | 'created_at'> & { id?: string } }
  | { type: 'UPDATE_CONTACTO'; payload: Contacto }
  | { type: 'ADD_OPORTUNIDAD'; payload: Omit<Oportunidad, 'id' | 'created_at'> & { id?: string } }
  | { type: 'UPDATE_OPORTUNIDAD'; payload: Partial<Oportunidad> & { id: string } }
  | { type: 'UPDATE_PRODUCTO'; payload: Partial<ProductoCliente> & { id: string } }
  | { type: 'MOVE_ETAPA'; payload: { oportunidadId: string; nuevaEtapa: Etapa; valor_adjudicado?: number; motivo_perdida?: string } }
  | { type: 'ADD_PRODUCTO'; payload: Omit<ProductoCliente, 'id'> }
  | { type: 'DELETE_PRODUCTO'; payload: { id: string } }
  | { type: 'UPDATE_PRECIO'; payload: { id: string; precio: number } }
  | { type: 'UPDATE_PRECIO_PROVEEDOR'; payload: { id: string; proveedor: string } }
  | { type: 'ADD_COTIZACION'; payload: Omit<Cotizacion, 'id'> }
  | { type: 'UPDATE_COTIZACION_ESTADO'; payload: { id: string; estado: Cotizacion['estado'] } }
  | { type: 'DELETE_COTIZACION'; payload: { id: string } }
  | { type: 'DUPLICATE_COTIZACION'; payload: { originalId: string; nuevoNumero: string } }
  | { type: 'UPDATE_COTIZACION'; payload: Partial<Cotizacion> & { id: string } }

const STORAGE_KEY = 'durata_crm_state'

const defaultState: State = {
  empresas: DEMO_EMPRESAS,
  contactos: DEMO_CONTACTOS,
  oportunidades: DEMO_OPORTUNIDADES,
  historial: [],
  productos: [],
  cotizaciones: [],
  precios: DEMO_PRECIOS,
}

function loadState(): State {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // Migration: if old format has 'clientes', return defaults to force new model
      if (parsed.clientes && !parsed.empresas) {
        return defaultState
      }
      return parsed
    }
  } catch {
    // corrupted data \u2013 fall back to defaults
  }
  return defaultState
}

const initialState: State = loadState()

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_EMPRESA': {
      const { id: explicitId, ...rest } = action.payload
      const nuevo: Empresa = { ...rest, id: explicitId || nextEmpresaId(), created_at: new Date().toISOString() } as Empresa
      return { ...state, empresas: [...state.empresas, nuevo] }
    }
    case 'UPDATE_EMPRESA':
      return { ...state, empresas: state.empresas.map(e => e.id === action.payload.id ? action.payload : e) }
    case 'ADD_CONTACTO': {
      const { id: explicitId, ...rest } = action.payload
      const nuevo: Contacto = { ...rest, id: explicitId || nextContactoId(), created_at: new Date().toISOString() } as Contacto
      return { ...state, contactos: [...state.contactos, nuevo] }
    }
    case 'UPDATE_CONTACTO':
      return { ...state, contactos: state.contactos.map(c => c.id === action.payload.id ? action.payload : c) }
    case 'ADD_OPORTUNIDAD': {
      const { id: explicitId, ...rest } = action.payload
      const nuevo: Oportunidad = { ...rest, id: explicitId || nextOportunidadId(), created_at: new Date().toISOString() } as Oportunidad
      return { ...state, oportunidades: [...state.oportunidades, nuevo] }
    }
    case 'UPDATE_OPORTUNIDAD':
      return { ...state, oportunidades: state.oportunidades.map(o => o.id === action.payload.id ? { ...o, ...action.payload } : o) }
    case 'MOVE_ETAPA': {
      const { oportunidadId, nuevaEtapa, valor_adjudicado, motivo_perdida } = action.payload
      const oportunidad = state.oportunidades.find(o => o.id === oportunidadId)
      if (!oportunidad || oportunidad.etapa === nuevaEtapa) return state
      const entry: HistorialEtapa = { id: String(Date.now()), oportunidad_id: oportunidadId, etapa_anterior: oportunidad.etapa, etapa_nueva: nuevaEtapa, created_at: new Date().toISOString() }
      const updates: Partial<Oportunidad> = { etapa: nuevaEtapa, fecha_ultimo_contacto: new Date().toISOString().split('T')[0] }
      if (nuevaEtapa === 'adjudicada' && valor_adjudicado !== undefined) {
        updates.valor_adjudicado = valor_adjudicado
      }
      if (nuevaEtapa === 'perdida' && motivo_perdida) {
        updates.motivo_perdida = motivo_perdida
      }
      return {
        ...state,
        oportunidades: state.oportunidades.map(o => o.id === oportunidadId ? { ...o, ...updates } : o),
        historial: [...state.historial, entry],
      }
    }
    case 'ADD_PRODUCTO':
      return { ...state, productos: [...state.productos, { ...action.payload, id: String(Date.now()) }] }
    case 'DELETE_PRODUCTO':
      return { ...state, productos: state.productos.filter(p => p.id !== action.payload.id) }
    case 'UPDATE_PRODUCTO':
      return { ...state, productos: state.productos.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p) }
    case 'UPDATE_PRECIO':
      return { ...state, precios: state.precios.map(p => p.id === action.payload.id ? { ...p, precio: action.payload.precio, updated_at: new Date().toISOString().split('T')[0] } : p) }
    case 'UPDATE_PRECIO_PROVEEDOR':
      return { ...state, precios: state.precios.map(p => p.id === action.payload.id ? { ...p, proveedor: action.payload.proveedor, updated_at: new Date().toISOString().split('T')[0] } : p) }
    case 'ADD_COTIZACION':
      return { ...state, cotizaciones: [...state.cotizaciones, { ...action.payload, id: String(Date.now()) }] }
    case 'UPDATE_COTIZACION_ESTADO':
      return { ...state, cotizaciones: state.cotizaciones.map(c => c.id === action.payload.id ? { ...c, estado: action.payload.estado } : c) }
    case 'DELETE_COTIZACION':
      return { ...state, cotizaciones: state.cotizaciones.filter(c => c.id !== action.payload.id) }
    case 'DUPLICATE_COTIZACION': {
      const original = state.cotizaciones.find(c => c.id === action.payload.originalId)
      if (!original) return state
      const duplicated: Cotizacion = { ...original, id: String(Date.now()), numero: action.payload.nuevoNumero, estado: 'borrador', fecha: new Date().toISOString().split('T')[0] }
      return { ...state, cotizaciones: [...state.cotizaciones, duplicated] }
    }
    case 'UPDATE_COTIZACION':
      return { ...state, cotizaciones: state.cotizaciones.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) }
    default: return state
  }
}

const StoreContext = createContext<{ state: State; dispatch: React.Dispatch<Action>; resetState: () => void } | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  function resetState() {
    localStorage.removeItem(STORAGE_KEY)
    window.location.reload()
  }

  return <StoreContext.Provider value={{ state, dispatch, resetState }}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be inside StoreProvider')
  return ctx
}

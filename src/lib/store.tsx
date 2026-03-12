import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { Cliente, Etapa, HistorialEtapa, ProductoCliente, Cotizacion, PrecioMaestro } from '../types'
import { DEMO_CLIENTES, DEMO_PRECIOS, nextClienteId } from './demo-data'

interface State {
  clientes: Cliente[]
  historial: HistorialEtapa[]
  productos: ProductoCliente[]
  cotizaciones: Cotizacion[]
  precios: PrecioMaestro[]
}

type Action =
  | { type: 'ADD_CLIENTE'; payload: Omit<Cliente, 'id' | 'created_at'> }
  | { type: 'UPDATE_CLIENTE'; payload: Cliente }
  | { type: 'MOVE_ETAPA'; payload: { clienteId: string; nuevaEtapa: Etapa } }
  | { type: 'ADD_PRODUCTO'; payload: Omit<ProductoCliente, 'id'> }
  | { type: 'DELETE_PRODUCTO'; payload: { id: string } }
  | { type: 'UPDATE_PRECIO'; payload: { id: string; precio: number } }
  | { type: 'UPDATE_PRECIO_PROVEEDOR'; payload: { id: string; proveedor: string } }
  | { type: 'ADD_COTIZACION'; payload: Omit<Cotizacion, 'id'> }
  | { type: 'UPDATE_COTIZACION_ESTADO'; payload: { id: string; estado: Cotizacion['estado'] } }
  | { type: 'DELETE_COTIZACION'; payload: { id: string } }
  | { type: 'DUPLICATE_COTIZACION'; payload: { originalId: string; nuevoNumero: string } }

const STORAGE_KEY = 'durata_crm_state'

const defaultState: State = {
  clientes: DEMO_CLIENTES,
  historial: [],
  productos: [],
  cotizaciones: [],
  precios: DEMO_PRECIOS,
}

function loadState(): State {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    // corrupted data – fall back to defaults
  }
  return defaultState
}

const initialState: State = loadState()

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_CLIENTE': {
      const nuevo: Cliente = { ...action.payload, id: nextClienteId(), created_at: new Date().toISOString() }
      return { ...state, clientes: [...state.clientes, nuevo] }
    }
    case 'UPDATE_CLIENTE':
      return { ...state, clientes: state.clientes.map(c => c.id === action.payload.id ? action.payload : c) }
    case 'MOVE_ETAPA': {
      const { clienteId, nuevaEtapa } = action.payload
      const cliente = state.clientes.find(c => c.id === clienteId)
      if (!cliente || cliente.etapa === nuevaEtapa) return state
      const entry: HistorialEtapa = { id: String(Date.now()), cliente_id: clienteId, etapa_anterior: cliente.etapa, etapa_nueva: nuevaEtapa, created_at: new Date().toISOString() }
      return {
        ...state,
        clientes: state.clientes.map(c => c.id === clienteId ? { ...c, etapa: nuevaEtapa } : c),
        historial: [...state.historial, entry],
      }
    }
    case 'ADD_PRODUCTO':
      return { ...state, productos: [...state.productos, { ...action.payload, id: String(Date.now()) }] }
    case 'DELETE_PRODUCTO':
      return { ...state, productos: state.productos.filter(p => p.id !== action.payload.id) }
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

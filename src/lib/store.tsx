import { createContext, useContext, useReducer, useEffect, useRef, useState, useCallback, ReactNode } from 'react'
import { Empresa, Contacto, Oportunidad, Etapa, HistorialEtapa, ProductoCliente, Cotizacion, PrecioMaestro } from '../types'
import { DEMO_EMPRESAS, DEMO_CONTACTOS, DEMO_OPORTUNIDADES, DEMO_PRECIOS } from './demo-data'
import { isSupabaseReady } from './supabase'
import { showToast } from '../components/Toast'

// ── Supabase service imports (fire-and-forget sync) ──
import * as svcEmpresas from '../hooks/useEmpresas'
import * as svcOportunidades from '../hooks/useOportunidades'
import * as svcCotizaciones from '../hooks/useCotizaciones'
import * as svcPrecios from '../hooks/usePrecios'

/* ══════════════════════════════════════════════════════════
   STATE & ACTION TYPES
   ══════════════════════════════════════════════════════════ */

interface State {
  empresas: Empresa[]
  contactos: Contacto[]
  oportunidades: Oportunidad[]
  historial: HistorialEtapa[]
  productos: ProductoCliente[]
  cotizaciones: Cotizacion[]
  precios: PrecioMaestro[]
  /** A-05: true once Supabase hydration has completed (or Supabase is not configured). */
  isHydrated: boolean
}

export type Action =
  | { type: 'ADD_EMPRESA'; payload: Omit<Empresa, 'id' | 'created_at'> & { id?: string } }
  | { type: 'UPDATE_EMPRESA'; payload: Empresa }
  | { type: 'DELETE_EMPRESA'; payload: { id: string } }
  | { type: 'ADD_CONTACTO'; payload: Omit<Contacto, 'id' | 'created_at'> & { id?: string } }
  | { type: 'UPDATE_CONTACTO'; payload: Contacto }
  | { type: 'ADD_OPORTUNIDAD'; payload: Omit<Oportunidad, 'id' | 'created_at'> & { id?: string } }
  | { type: 'UPDATE_OPORTUNIDAD'; payload: Partial<Oportunidad> & { id: string } }
  | { type: 'DELETE_OPORTUNIDAD'; payload: { id: string } }
  | { type: 'UPDATE_PRODUCTO'; payload: Partial<ProductoCliente> & { id: string } }
  | { type: 'MOVE_ETAPA'; payload: { oportunidadId: string; nuevaEtapa: Etapa; valor_adjudicado?: number; motivo_perdida?: string; fecha_adjudicacion?: string } }
  | { type: 'ADD_PRODUCTO'; payload: Omit<ProductoCliente, 'id'> }
  | { type: 'DELETE_PRODUCTO'; payload: { id: string } }
  | { type: 'UPDATE_PRECIO'; payload: { id: string; precio: number } }
  | { type: 'UPDATE_PRECIO_PROVEEDOR'; payload: { id: string; proveedor: string } }
  | { type: 'ADD_COTIZACION'; payload: Omit<Cotizacion, 'id'> & { id?: string } }
  | { type: 'UPDATE_COTIZACION_ESTADO'; payload: { id: string; estado: Cotizacion['estado'] } }
  | { type: 'DELETE_COTIZACION'; payload: { id: string } }
  | { type: 'DUPLICATE_COTIZACION'; payload: { originalId: string; nuevoNumero: string; newId?: string } }
  | { type: 'UPDATE_COTIZACION'; payload: Partial<Cotizacion> & { id: string } }
  | { type: 'RECOTIZAR'; payload: { cotizacionId: string; nuevoNumero: string; newCotId?: string } }
  | { type: 'REACTIVAR_COTIZACION'; payload: { cotizacionDescartadaId: string } }
  | { type: 'BULK_UPSERT_PRECIOS'; payload: PrecioMaestro[] }
  | { type: '_HYDRATE'; payload: Partial<State> }
  /** B-01: internal rollback when an ADD sync to Supabase fails — does NOT re-sync to DB. */
  | { type: '_ROLLBACK_ADD'; payload: { entity: 'oportunidad' | 'cotizacion'; id: string } }

/* ══════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════ */

function newId(): string {
  return crypto.randomUUID()
}

/**
 * Today in YYYY-MM-DD using the user's LOCAL timezone.
 * `new Date().toISOString()` converts to UTC first — in Colombia (UTC-5),
 * after 19:00 local it would give the NEXT day. Use this helper instead
 * for all user-facing dates (fecha_envio, fecha_ultimo_contacto, etc.).
 */
export function todayLocalISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * N-03: valor_cotizado = SUM of active cotizaciones (not descartada, not rechazada).
 * Excludes rechazada so that after adjudicación/pérdida the dashboard doesn't inflate.
 */
export function getActiveCotizacionValor(cotizaciones: Cotizacion[], oportunidadId: string): number {
  return cotizaciones
    .filter(c => c.oportunidad_id === oportunidadId && c.estado !== 'descartada' && c.estado !== 'rechazada')
    .reduce((sum, c) => sum + (c.total || 0), 0)
}

const STORAGE_KEY = 'durata_crm_state'
const STATE_VERSION = 2 // bump to invalidate old bloated caches

const defaultState: State = {
  empresas: DEMO_EMPRESAS,
  contactos: DEMO_CONTACTOS,
  oportunidades: DEMO_OPORTUNIDADES,
  historial: [],
  productos: [],
  cotizaciones: [],
  precios: DEMO_PRECIOS,
  isHydrated: false,
}

function loadState(): State {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // Invalidate old versions or legacy shapes
      if (parsed._v !== STATE_VERSION || (parsed.clientes && !parsed.empresas)) {
        localStorage.removeItem(STORAGE_KEY)
        return defaultState
      }
      // A-05: isHydrated is runtime state, never persisted — always start as false
      return { ...parsed, isHydrated: false }
    }
  } catch { /* corrupted – fall back */ }
  return defaultState
}

/** Persist state to localStorage safely (quota-aware). */
function saveState(state: State) {
  try {
    if (isSupabaseReady) {
      // Supabase is the source of truth — only cache lightweight UI state
      // Skip large arrays that will be hydrated from Supabase on next load
      const lightweight = {
        _v: STATE_VERSION,
        empresas: [] as Empresa[],
        contactos: [] as Contacto[],
        oportunidades: [] as Oportunidad[],
        historial: [] as HistorialEtapa[],
        productos: [] as ProductoCliente[],
        cotizaciones: [] as Cotizacion[],
        precios: [] as PrecioMaestro[],
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweight))
    } else {
      // No Supabase — localStorage is the only persistence
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, _v: STATE_VERSION }))
    }
  } catch (err) {
    // QuotaExceededError — silently fail, Supabase has the data
    console.warn('[localStorage] Could not save state:', (err as Error).message)
  }
}

/* ══════════════════════════════════════════════════════════
   REDUCER
   ══════════════════════════════════════════════════════════ */

/** @internal exported for testing */
export function reducer(state: State, action: Action): State {
  switch (action.type) {
    // ── Hydrate from Supabase ────────────────────────
    case '_HYDRATE': {
      return { ...state, ...action.payload }
    }

    // ── Empresas ─────────────────────────────────────
    case 'ADD_EMPRESA': {
      const { id: explicitId, ...rest } = action.payload
      const nuevo: Empresa = { ...rest, id: explicitId || newId(), created_at: new Date().toISOString() } as Empresa
      return { ...state, empresas: [...state.empresas, nuevo] }
    }
    case 'UPDATE_EMPRESA':
      return { ...state, empresas: state.empresas.map(e => e.id === action.payload.id ? action.payload : e) }
    case 'DELETE_EMPRESA': {
      const empId = action.payload.id
      const relOps = state.oportunidades.filter(o => o.empresa_id === empId)
      const relOpIds = new Set(relOps.map(o => o.id))
      return {
        ...state,
        empresas: state.empresas.filter(e => e.id !== empId),
        contactos: state.contactos.filter(c => c.empresa_id !== empId),
        oportunidades: state.oportunidades.filter(o => o.empresa_id !== empId),
        historial: state.historial.filter(h => !relOpIds.has(h.oportunidad_id)),
        productos: state.productos.filter(p => !relOpIds.has(p.oportunidad_id)),
        cotizaciones: state.cotizaciones.filter(c => !relOpIds.has(c.oportunidad_id)),
      }
    }

    // ── Contactos ────────────────────────────────────
    case 'ADD_CONTACTO': {
      const { id: explicitId, ...rest } = action.payload
      const nuevo: Contacto = { ...rest, id: explicitId || newId(), created_at: new Date().toISOString() } as Contacto
      return { ...state, contactos: [...state.contactos, nuevo] }
    }
    case 'UPDATE_CONTACTO':
      return { ...state, contactos: state.contactos.map(c => c.id === action.payload.id ? action.payload : c) }

    // ── Oportunidades ────────────────────────────────
    case 'ADD_OPORTUNIDAD': {
      const { id: explicitId, ...rest } = action.payload
      const nuevo: Oportunidad = { ...rest, id: explicitId || newId(), created_at: new Date().toISOString() } as Oportunidad
      return { ...state, oportunidades: [...state.oportunidades, nuevo] }
    }
    case 'UPDATE_OPORTUNIDAD':
      return { ...state, oportunidades: state.oportunidades.map(o => o.id === action.payload.id ? { ...o, ...action.payload } : o) }
    case 'DELETE_OPORTUNIDAD': {
      const oppId = action.payload.id
      return {
        ...state,
        oportunidades: state.oportunidades.filter(o => o.id !== oppId),
        productos: state.productos.filter(p => p.oportunidad_id !== oppId),
        cotizaciones: state.cotizaciones.filter(c => c.oportunidad_id !== oppId),
        historial: state.historial.filter(h => h.oportunidad_id !== oppId),
      }
    }
    case 'MOVE_ETAPA': {
      const { oportunidadId, nuevaEtapa, valor_adjudicado, motivo_perdida, fecha_adjudicacion } = action.payload
      const oportunidad = state.oportunidades.find(o => o.id === oportunidadId)
      if (!oportunidad || oportunidad.etapa === nuevaEtapa) return state
      const etapaAnterior = oportunidad.etapa
      const entry: HistorialEtapa = { id: newId(), oportunidad_id: oportunidadId, etapa_anterior: etapaAnterior, etapa_nueva: nuevaEtapa, created_at: new Date().toISOString() }
      const updates: Partial<Oportunidad> = { etapa: nuevaEtapa, fecha_ultimo_contacto: todayLocalISO() }
      if (nuevaEtapa === 'adjudicada' && valor_adjudicado !== undefined) updates.valor_adjudicado = valor_adjudicado
      if (nuevaEtapa === 'adjudicada') updates.fecha_adjudicacion = fecha_adjudicacion || todayLocalISO()
      if (nuevaEtapa === 'perdida' && motivo_perdida) updates.motivo_perdida = motivo_perdida

      // Reversal: if leaving a final state (adjudicada/perdida) to any non-final state,
      // reset the final-state-specific fields and revert cotizaciones from aprobada/rechazada → enviada.
      // Descartadas stay descartada (they were superseded pre-adjudicación).
      const finalStates = ['adjudicada', 'perdida']
      const isLeavingFinal = finalStates.includes(etapaAnterior) && !finalStates.includes(nuevaEtapa)
      let updCots = state.cotizaciones
      if (isLeavingFinal) {
        if (etapaAnterior === 'adjudicada') {
          updates.valor_adjudicado = 0
          updates.fecha_adjudicacion = null as unknown as string
        }
        if (etapaAnterior === 'perdida') {
          updates.motivo_perdida = ''
        }
        updCots = state.cotizaciones.map(c => {
          if (c.oportunidad_id !== oportunidadId) return c
          if (c.estado === 'descartada') return c
          if (c.estado === 'aprobada' || c.estado === 'rechazada') return { ...c, estado: 'enviada' as const }
          return c
        })
      }
      // On adjudicación: approve latest-fecha active (enviada/borrador), mark the rest as 'rechazada'.
      // On perdida: mark all active (not descartada/aprobada) as 'rechazada'.
      // In both cases, already-descartada cotizaciones stay descartada (they were superseded earlier).
      if (nuevaEtapa === 'adjudicada') {
        const oppCots = state.cotizaciones.filter(c => c.oportunidad_id === oportunidadId)
        // If the user pre-selected a winner by marking one as 'aprobada', respect that choice.
        // Otherwise pick the latest-fecha active (enviada/borrador) as winner.
        const yaAprobada = oppCots.some(c => c.estado === 'aprobada')
        const activeCot = yaAprobada ? undefined : oppCots
          .filter(c => c.estado === 'enviada' || c.estado === 'borrador')
          .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))[0]
        updCots = state.cotizaciones.map(c => {
          if (c.oportunidad_id !== oportunidadId) return c
          if (activeCot && c.id === activeCot.id) return { ...c, estado: 'aprobada' as const }
          if (c.estado === 'descartada' || c.estado === 'aprobada') return c
          return { ...c, estado: 'rechazada' as const }
        })
      } else if (nuevaEtapa === 'perdida') {
        updCots = state.cotizaciones.map(c => {
          if (c.oportunidad_id !== oportunidadId) return c
          if (c.estado === 'descartada' || c.estado === 'aprobada') return c
          return { ...c, estado: 'rechazada' as const }
        })
      }
      // N-03: keep valor_cotizado in sync with cotizacion states after any etapa move
      updates.valor_cotizado = getActiveCotizacionValor(updCots, oportunidadId)
      return {
        ...state,
        cotizaciones: updCots,
        oportunidades: state.oportunidades.map(o => o.id === oportunidadId ? { ...o, ...updates } : o),
        historial: [...state.historial, entry],
      }
    }

    // ── Productos ────────────────────────────────────
    case 'ADD_PRODUCTO': {
      const newProducto = { ...action.payload, id: (action.payload as any).id || newId() }
      let newOportunidades = state.oportunidades
      let newHistorial = state.historial
      const opp = state.oportunidades.find(o => o.id === newProducto.oportunidad_id)
      if (opp && opp.etapa === 'nuevo_lead') {
        newOportunidades = state.oportunidades.map(o =>
          o.id === opp.id ? { ...o, etapa: 'en_cotizacion' as const, fecha_ultimo_contacto: todayLocalISO() } : o
        )
        newHistorial = [...state.historial, { id: newId(), oportunidad_id: opp.id, etapa_anterior: 'nuevo_lead', etapa_nueva: 'en_cotizacion', created_at: new Date().toISOString() }]
      }
      return { ...state, productos: [...state.productos, newProducto], oportunidades: newOportunidades, historial: newHistorial }
    }
    case 'DELETE_PRODUCTO':
      return { ...state, productos: state.productos.filter(p => p.id !== action.payload.id) }
    case 'UPDATE_PRODUCTO':
      return { ...state, productos: state.productos.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p) }

    // ── Precios ──────────────────────────────────────
    case 'UPDATE_PRECIO':
      return { ...state, precios: state.precios.map(p => p.id === action.payload.id ? { ...p, precio: action.payload.precio, updated_at: todayLocalISO() } : p) }
    case 'UPDATE_PRECIO_PROVEEDOR':
      return { ...state, precios: state.precios.map(p => p.id === action.payload.id ? { ...p, proveedor: action.payload.proveedor, updated_at: todayLocalISO() } : p) }
    case 'BULK_UPSERT_PRECIOS': {
      const incoming = action.payload
      const byCode = new Map(state.precios.filter(p => p.codigo).map(p => [p.codigo, p]))
      const byName = new Map(state.precios.map(p => [p.nombre.toLowerCase().trim(), p]))
      const merged = [...state.precios]
      for (const row of incoming) {
        // Match by codigo first, then by nombre
        const existing = (row.codigo && byCode.get(row.codigo)) || byName.get(row.nombre.toLowerCase().trim())
        if (existing) {
          const idx = merged.findIndex(p => p.id === existing.id)
          if (idx >= 0) merged[idx] = { ...existing, ...row, id: existing.id }
        } else {
          merged.push({ ...row, id: row.id || newId() })
        }
      }
      return { ...state, precios: merged }
    }

    // ── Cotizaciones ─────────────────────────────────
    // NOTE: the nuevo_lead → en_cotizacion transition is NOT done here on purpose.
    // Callers must dispatch MOVE_ETAPA explicitly so there is one single source of
    // truth for stage transitions (history entry + sync). See handleCrearCotizacion
    // and handleDupToOtherClient in OportunidadDetalle.
    case 'ADD_COTIZACION': {
      const newCot = { ...action.payload, id: action.payload.id || newId() }
      const newCotizaciones = [...state.cotizaciones, newCot]
      const valorCot = getActiveCotizacionValor(newCotizaciones, newCot.oportunidad_id)
      return {
        ...state,
        cotizaciones: newCotizaciones,
        oportunidades: state.oportunidades.map(o =>
          o.id === newCot.oportunidad_id ? { ...o, valor_cotizado: valorCot } : o,
        ),
      }
    }
    case 'UPDATE_COTIZACION_ESTADO': {
      const { id: cotId, estado: nuevoEstado } = action.payload
      const cot = state.cotizaciones.find(c => c.id === cotId)
      if (!cot) return state
      const updatedCot = { ...cot, estado: nuevoEstado } as typeof cot
      if (cot.estado === 'borrador' && nuevoEstado === 'enviada') {
        updatedCot.fecha_envio = todayLocalISO()
      }
      let updOportunidades = state.oportunidades
      let updHistorial = state.historial
      if (cot.estado === 'borrador' && nuevoEstado === 'enviada') {
        const oppCot = state.oportunidades.find(o => o.id === cot.oportunidad_id)
        if (oppCot && (oppCot.etapa === 'nuevo_lead' || oppCot.etapa === 'en_cotizacion')) {
          updOportunidades = state.oportunidades.map(o =>
            o.id === oppCot.id ? { ...o, etapa: 'cotizacion_enviada' as const, fecha_ultimo_contacto: todayLocalISO() } : o
          )
          updHistorial = [...state.historial, { id: newId(), oportunidad_id: oppCot.id, etapa_anterior: oppCot.etapa, etapa_nueva: 'cotizacion_enviada', created_at: new Date().toISOString() }]
        }
      }
      return {
        ...state,
        cotizaciones: state.cotizaciones.map(c => c.id === cotId ? updatedCot : c),
        oportunidades: updOportunidades,
        historial: updHistorial,
      }
    }
    case 'DELETE_COTIZACION': {
      const delCot = state.cotizaciones.find(c => c.id === action.payload.id)
      const filteredCots = state.cotizaciones.filter(c => c.id !== action.payload.id)
      if (!delCot) return { ...state, cotizaciones: filteredCots }
      const valorCotDel = getActiveCotizacionValor(filteredCots, delCot.oportunidad_id)
      return {
        ...state,
        cotizaciones: filteredCots,
        oportunidades: state.oportunidades.map(o => o.id === delCot.oportunidad_id ? { ...o, valor_cotizado: valorCotDel } : o),
      }
    }
    case 'DUPLICATE_COTIZACION': {
      const original = state.cotizaciones.find(c => c.id === action.payload.originalId)
      if (!original) return state
      const duplicated: Cotizacion = { ...original, id: action.payload.newId || newId(), numero: action.payload.nuevoNumero, estado: 'borrador', fecha: todayLocalISO() }
      return { ...state, cotizaciones: [...state.cotizaciones, duplicated] }
    }
    case 'UPDATE_COTIZACION': {
      const updCots = state.cotizaciones.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c)
      const updCot = updCots.find(c => c.id === action.payload.id)
      if (!updCot) return { ...state, cotizaciones: updCots }
      const valorCotUpd = getActiveCotizacionValor(updCots, updCot.oportunidad_id)
      return {
        ...state,
        cotizaciones: updCots,
        oportunidades: state.oportunidades.map(o => o.id === updCot.oportunidad_id ? { ...o, valor_cotizado: valorCotUpd } : o),
      }
    }
    case 'RECOTIZAR': {
      const { cotizacionId, nuevoNumero, newCotId } = action.payload
      const original = state.cotizaciones.find(c => c.id === cotizacionId)
      if (!original) return state
      // Discard the original
      const updatedCots = state.cotizaciones.map(c => c.id === cotizacionId ? { ...c, estado: 'descartada' as const } : c)
      // Create new version copying conditions but clearing stale snapshot/files
      // D-02 fix: clear productos_snapshot so the editor reads fresh from
      // productos_oportunidad (which includes any products added after the
      // original cotización was generated).
      const newCot: Cotizacion = {
        ...original,
        id: newCotId || newId(),
        numero: nuevoNumero,
        estado: 'borrador',
        fecha: todayLocalISO(),
        total: 0,
        productos_snapshot: undefined,
        fecha_envio: undefined,
        archivo_pdf_url: null,
        archivo_pdf_nombre: null,
        archivo_apu_url: null,
        archivo_apu_nombre: null,
      }
      const allCots = [...updatedCots, newCot]
      const valor = getActiveCotizacionValor(allCots, original.oportunidad_id)
      // D-11: move the oportunidad to 'recotizada' so the pipeline refleja visualmente
      // que tiene cotizaciones descartadas pero sigue activa. No se registra en historial
      // si la etapa anterior ya era 'recotizada' (re-recotización sobre la misma).
      const opp = state.oportunidades.find(o => o.id === original.oportunidad_id)
      const etapaAnterior = opp?.etapa
      // Only move if not in a final stage (adjudicada/perdida) — no downgrade
      const finalStates: Etapa[] = ['adjudicada', 'perdida']
      const shouldMoveEtapa = opp && etapaAnterior !== 'recotizada' && !finalStates.includes(etapaAnterior as Etapa)
      const newHistorial = shouldMoveEtapa
        ? [...state.historial, { id: newId(), oportunidad_id: original.oportunidad_id, etapa_anterior: etapaAnterior || '', etapa_nueva: 'recotizada', created_at: new Date().toISOString() }]
        : state.historial
      return {
        ...state,
        cotizaciones: allCots,
        oportunidades: state.oportunidades.map(o => o.id === original.oportunidad_id
          ? { ...o, valor_cotizado: valor, ...(shouldMoveEtapa ? { etapa: 'recotizada' as const, fecha_ultimo_contacto: todayLocalISO() } : {}) }
          : o),
        historial: newHistorial,
      }
    }
    // D-12: Reactivar — swap a descartada cotización back to active, discard the current active one
    case 'REACTIVAR_COTIZACION': {
      const { cotizacionDescartadaId } = action.payload
      const descartada = state.cotizaciones.find(c => c.id === cotizacionDescartadaId)
      if (!descartada || descartada.estado !== 'descartada') return state
      // Find the currently active cotización for this oportunidad (borrador or enviada, latest)
      const currentActive = state.cotizaciones
        .filter(c => c.oportunidad_id === descartada.oportunidad_id && (c.estado === 'borrador' || c.estado === 'enviada'))
        .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))[0]
      // Reactivate the descartada: restore to 'enviada' (it was sent before being superseded)
      // If it never had fecha_envio, restore as 'borrador'
      const restoredEstado: Cotizacion['estado'] = descartada.fecha_envio ? 'enviada' : 'borrador'
      const updCots = state.cotizaciones.map(c => {
        if (c.id === cotizacionDescartadaId) return { ...c, estado: restoredEstado }
        if (currentActive && c.id === currentActive.id) return { ...c, estado: 'descartada' as const }
        return c
      })
      const valor = getActiveCotizacionValor(updCots, descartada.oportunidad_id)
      // D-12: si la oportunidad estaba en 'recotizada' y ahora queda una sola cotización
      // activa tras el swap, moverla a 'cotizacion_enviada' (si la restaurada tiene fecha_envio)
      // o a 'en_cotizacion' (si quedó como borrador). Registra entrada en historial.
      const opp = state.oportunidades.find(o => o.id === descartada.oportunidad_id)
      let newHistorial = state.historial
      let etapaUpdate: Partial<Oportunidad> = {}
      if (opp && opp.etapa === 'recotizada') {
        const nuevaEtapa: Etapa = restoredEstado === 'enviada' ? 'cotizacion_enviada' : 'en_cotizacion'
        etapaUpdate = { etapa: nuevaEtapa, fecha_ultimo_contacto: todayLocalISO() }
        newHistorial = [...state.historial, {
          id: newId(),
          oportunidad_id: descartada.oportunidad_id,
          etapa_anterior: 'recotizada',
          etapa_nueva: nuevaEtapa,
          created_at: new Date().toISOString(),
        }]
      }
      return {
        ...state,
        cotizaciones: updCots,
        oportunidades: state.oportunidades.map(o =>
          o.id === descartada.oportunidad_id ? { ...o, valor_cotizado: valor, ...etapaUpdate } : o
        ),
        historial: newHistorial,
      }
    }
    // B-01: local rollback when Supabase INSERT fails — never synced back to DB
    case '_ROLLBACK_ADD': {
      const { entity, id } = action.payload
      if (entity === 'oportunidad') {
        return { ...state, oportunidades: state.oportunidades.filter(o => o.id !== id) }
      }
      if (entity === 'cotizacion') {
        const cot = state.cotizaciones.find(c => c.id === id)
        const filteredCots = state.cotizaciones.filter(c => c.id !== id)
        if (!cot) return { ...state, cotizaciones: filteredCots }
        const valorCot = getActiveCotizacionValor(filteredCots, cot.oportunidad_id)
        return {
          ...state,
          cotizaciones: filteredCots,
          oportunidades: state.oportunidades.map(o => o.id === cot.oportunidad_id ? { ...o, valor_cotizado: valorCot } : o),
        }
      }
      return state
    }
    default: return state
  }
}

/* ══════════════════════════════════════════════════════════
   SUPABASE SYNC (fire-and-forget)
   ══════════════════════════════════════════════════════════ */

/**
 * B-01: rawDispatch is passed so that on INSERT failure we can dispatch a local-only
 * _ROLLBACK_ADD action that removes the optimistic entry without re-syncing to DB.
 */
function syncToSupabase(action: Action, stateBefore: State, rawDispatch: React.Dispatch<Action>) {
  if (!isSupabaseReady) return

  const log = (label: string, result: { error?: string | null }) => {
    if (result.error) {
      console.error(`[Supabase] ${label}:`, result.error)
      showToast('error', `Error al guardar (${label}). Los cambios se perderán al recargar.`)
    }
  }

  switch (action.type) {
    case 'ADD_EMPRESA':
      svcEmpresas.createEmpresa(action.payload).then(r => log('ADD_EMPRESA', r))
      break
    case 'UPDATE_EMPRESA':
      svcEmpresas.updateEmpresa(action.payload).then(r => log('UPDATE_EMPRESA', r))
      break
    case 'DELETE_EMPRESA':
      svcEmpresas.deleteEmpresa(action.payload.id).then(r => log('DELETE_EMPRESA', r))
      break
    case 'ADD_CONTACTO':
      svcOportunidades.createContacto(action.payload).then(r => log('ADD_CONTACTO', r))
      break
    case 'UPDATE_CONTACTO':
      svcOportunidades.updateContacto(action.payload).then(r => log('UPDATE_CONTACTO', r))
      break
    case 'ADD_OPORTUNIDAD': {
      // B-01: capture id before async (payload always has explicit id from callers)
      const oppId = (action.payload as { id?: string }).id
      svcOportunidades.createOportunidad(action.payload).then(r => {
        log('ADD_OPORTUNIDAD', r)
        if (r.error && oppId) rawDispatch({ type: '_ROLLBACK_ADD', payload: { entity: 'oportunidad', id: oppId } })
      })
      break
    }
    case 'UPDATE_OPORTUNIDAD':
      svcOportunidades.updateOportunidad(action.payload).then(r => log('UPDATE_OPORTUNIDAD', r))
      break
    case 'DELETE_OPORTUNIDAD':
      svcOportunidades.removeOportunidad(action.payload.id).then(r => log('DELETE_OPORTUNIDAD', r))
      break
    case 'MOVE_ETAPA': {
      const { oportunidadId, nuevaEtapa, valor_adjudicado, motivo_perdida, fecha_adjudicacion } = action.payload
      const opp = stateBefore.oportunidades.find(o => o.id === oportunidadId)
      if (!opp || opp.etapa === nuevaEtapa) break
      const etapaAnt = opp.etapa
      const updates: Partial<Oportunidad> & { id: string } = { id: oportunidadId, etapa: nuevaEtapa, fecha_ultimo_contacto: todayLocalISO() }
      if (nuevaEtapa === 'adjudicada' && valor_adjudicado !== undefined) updates.valor_adjudicado = valor_adjudicado
      if (nuevaEtapa === 'adjudicada') updates.fecha_adjudicacion = fecha_adjudicacion || todayLocalISO()
      if (nuevaEtapa === 'perdida' && motivo_perdida) updates.motivo_perdida = motivo_perdida

      // Reversal: leaving adjudicada/perdida resets specific fields
      const finalStates = ['adjudicada', 'perdida']
      const isLeavingFinal = finalStates.includes(etapaAnt) && !finalStates.includes(nuevaEtapa)
      if (isLeavingFinal) {
        if (etapaAnt === 'adjudicada') {
          updates.valor_adjudicado = 0
          updates.fecha_adjudicacion = null as unknown as string
        }
        if (etapaAnt === 'perdida') {
          updates.motivo_perdida = ''
        }
      }
      // N-03: compute new valor_cotizado by simulating the post-action cotizacion states
      {
        const oppCotsAll = stateBefore.cotizaciones.filter(c => c.oportunidad_id === oportunidadId)
        // Mirror reducer: yaAprobada prevents picking a new winner (C-02 fix)
        const yaAprobada = oppCotsAll.some(c => c.estado === 'aprobada')
        const winner = (nuevaEtapa === 'adjudicada' && !yaAprobada)
          ? oppCotsAll.filter(c => c.estado === 'enviada' || c.estado === 'borrador')
                      .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))[0]
          : null
        const simulatedCots = stateBefore.cotizaciones.map(c => {
          if (c.oportunidad_id !== oportunidadId) return c
          if (isLeavingFinal) {
            if (c.estado === 'descartada') return c
            if (c.estado === 'aprobada' || c.estado === 'rechazada') return { ...c, estado: 'enviada' as const }
          } else if (nuevaEtapa === 'adjudicada') {
            if (winner && c.id === winner.id) return { ...c, estado: 'aprobada' as const }
            if (c.estado === 'descartada' || c.estado === 'aprobada') return c
            return { ...c, estado: 'rechazada' as const }
          } else if (nuevaEtapa === 'perdida') {
            if (c.estado === 'descartada' || c.estado === 'aprobada') return c
            return { ...c, estado: 'rechazada' as const }
          }
          return c
        })
        updates.valor_cotizado = getActiveCotizacionValor(simulatedCots, oportunidadId)
      }

      svcOportunidades.updateOportunidad(updates).then(r => log('MOVE_ETAPA', r))
      svcOportunidades.createHistorial({ oportunidad_id: oportunidadId, etapa_anterior: etapaAnt, etapa_nueva: nuevaEtapa, created_at: new Date().toISOString() }).then(r => log('MOVE_ETAPA historial', r))

      // Persist cotización state transitions
      if (isLeavingFinal) {
        // Revert aprobada/rechazada → enviada (descartada stays)
        const oppCots = stateBefore.cotizaciones.filter(c => c.oportunidad_id === oportunidadId)
        for (const c of oppCots) {
          if (c.estado === 'aprobada' || c.estado === 'rechazada') {
            svcCotizaciones.updateCotizacion({ id: c.id, estado: 'enviada' })
              .then(r => log('MOVE_ETAPA revert cot->enviada', r))
          }
        }
      } else if (nuevaEtapa === 'adjudicada' || nuevaEtapa === 'perdida') {
        const oppCots = stateBefore.cotizaciones.filter(c => c.oportunidad_id === oportunidadId)
        // C-02: mirror reducer — if a cot is already aprobada, don't pick another winner
        const yaAprobadaSync = oppCots.some(c => c.estado === 'aprobada')
        const winner = (nuevaEtapa === 'adjudicada' && !yaAprobadaSync)
          ? oppCots.filter(c => c.estado === 'enviada' || c.estado === 'borrador')
                   .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))[0]
          : null
        for (const c of oppCots) {
          if (c.estado === 'descartada' || c.estado === 'aprobada') continue
          const nuevoEstado: Cotizacion['estado'] = winner && c.id === winner.id ? 'aprobada' : 'rechazada'
          if (c.estado === nuevoEstado) continue
          svcCotizaciones.updateCotizacion({ id: c.id, estado: nuevoEstado })
            .then(r => log(`MOVE_ETAPA cot->${nuevoEstado}`, r))
        }
      }
      break
    }
    case 'ADD_PRODUCTO': {
      svcOportunidades.createProducto(action.payload).then(r => log('ADD_PRODUCTO', r))
      // Reducer auto-moves nuevo_lead → en_cotizacion; persist that same transition
      const oppPr = stateBefore.oportunidades.find(o => o.id === action.payload.oportunidad_id)
      if (oppPr && oppPr.etapa === 'nuevo_lead') {
        svcOportunidades.updateOportunidad({
          id: oppPr.id,
          etapa: 'en_cotizacion',
          fecha_ultimo_contacto: todayLocalISO(),
        }).then(r => log('ADD_PRODUCTO etapa', r))
        svcOportunidades.createHistorial({
          oportunidad_id: oppPr.id,
          etapa_anterior: 'nuevo_lead',
          etapa_nueva: 'en_cotizacion',
          created_at: new Date().toISOString(),
        }).then(r => log('ADD_PRODUCTO historial', r))
      }
      break
    }
    case 'DELETE_PRODUCTO':
      svcOportunidades.removeProducto(action.payload.id).then(r => log('DELETE_PRODUCTO', r))
      break
    case 'UPDATE_PRODUCTO':
      svcOportunidades.updateProducto(action.payload).then(r => log('UPDATE_PRODUCTO', r))
      break
    case 'UPDATE_PRECIO':
      svcPrecios.updatePrecio(action.payload.id, action.payload.precio).then(r => log('UPDATE_PRECIO', r))
      break
    case 'UPDATE_PRECIO_PROVEEDOR':
      svcPrecios.updatePrecioProveedor(action.payload.id, action.payload.proveedor).then(r => log('UPDATE_PRECIO_PROVEEDOR', r))
      break
    case 'ADD_COTIZACION': {
      // B-01: use the id already in payload (callers always pre-generate with crypto.randomUUID())
      // so reducer and DB always share the same UUID — no double-newId() race
      const newCot = { ...action.payload, id: action.payload.id || newId() } as Cotizacion
      const cotId = newCot.id
      svcCotizaciones.createCotizacion(newCot).then(r => {
        log('ADD_COTIZACION', r)
        if (r.error) rawDispatch({ type: '_ROLLBACK_ADD', payload: { entity: 'cotizacion', id: cotId } })
      })
      // Persist oportunidad.valor_cotizado (reducer recomputes it from active cotizaciones).
      // The etapa transition is handled by an explicit MOVE_ETAPA dispatch in the caller.
      const allCots = [...stateBefore.cotizaciones, newCot]
      const valor = getActiveCotizacionValor(allCots, newCot.oportunidad_id)
      svcOportunidades.updateOportunidad({ id: newCot.oportunidad_id, valor_cotizado: valor })
        .then(r => log('ADD_COTIZACION opp', r))
      break
    }
    case 'UPDATE_COTIZACION_ESTADO': {
      const cot = stateBefore.cotizaciones.find(c => c.id === action.payload.id)
      const upd: Partial<Cotizacion> & { id: string } = { id: action.payload.id, estado: action.payload.estado }
      if (cot?.estado === 'borrador' && action.payload.estado === 'enviada') {
        upd.fecha_envio = todayLocalISO()
      }
      svcCotizaciones.updateCotizacion(upd).then(r => log('UPDATE_COTIZACION_ESTADO', r))
      // Auto-move oportunidad is handled in the reducer (single source of truth)
      // Persist the reducer's etapa change to Supabase
      if (cot?.estado === 'borrador' && action.payload.estado === 'enviada') {
        const oppCot = stateBefore.oportunidades.find(o => o.id === cot.oportunidad_id)
        if (oppCot && (oppCot.etapa === 'nuevo_lead' || oppCot.etapa === 'en_cotizacion')) {
          svcOportunidades.updateOportunidad({ id: oppCot.id, etapa: 'cotizacion_enviada', fecha_ultimo_contacto: todayLocalISO() }).then(r => log('UPDATE_COTIZACION_ESTADO sync', r))
          svcOportunidades.createHistorial({ oportunidad_id: oppCot.id, etapa_anterior: oppCot.etapa, etapa_nueva: 'cotizacion_enviada', created_at: new Date().toISOString() }).then(r => log('UPDATE_COTIZACION_ESTADO historial', r))
        }
      }
      break
    }
    case 'DELETE_COTIZACION': {
      const delCot = stateBefore.cotizaciones.find(c => c.id === action.payload.id)
      svcCotizaciones.removeCotizacion(action.payload.id).then(r => log('DELETE_COTIZACION', r))
      // Persist oportunidad.valor_cotizado after delete (reducer recomputes)
      if (delCot) {
        const remaining = stateBefore.cotizaciones.filter(c => c.id !== action.payload.id)
        const valor = getActiveCotizacionValor(remaining, delCot.oportunidad_id)
        svcOportunidades.updateOportunidad({ id: delCot.oportunidad_id, valor_cotizado: valor })
          .then(r => log('DELETE_COTIZACION opp', r))
      }
      break
    }
    case 'DUPLICATE_COTIZACION': {
      const original = stateBefore.cotizaciones.find(c => c.id === action.payload.originalId)
      if (original) {
        const dupId = action.payload.newId || newId()
        svcCotizaciones.duplicateCotizacion(original, action.payload.nuevoNumero, dupId)
          .then(r => log('DUPLICATE_COTIZACION', r))
      }
      break
    }
    case 'UPDATE_COTIZACION': {
      svcCotizaciones.updateCotizacion(action.payload).then(r => log('UPDATE_COTIZACION', r))
      // Persist oportunidad.valor_cotizado if total/estado/fecha changed (reducer recomputes)
      const updCots = stateBefore.cotizaciones.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c)
      const updCot = updCots.find(c => c.id === action.payload.id)
      if (updCot) {
        const valor = getActiveCotizacionValor(updCots, updCot.oportunidad_id)
        svcOportunidades.updateOportunidad({ id: updCot.oportunidad_id, valor_cotizado: valor })
          .then(r => log('UPDATE_COTIZACION opp', r))
      }
      break
    }
    case 'RECOTIZAR': {
      const origCot = stateBefore.cotizaciones.find(c => c.id === action.payload.cotizacionId)
      if (origCot) {
        // Use the SAME id the reducer used — guarantees reducer/URL/DB all agree
        const newCotId = action.payload.newCotId || newId()
        // Discard original in DB
        svcCotizaciones.updateCotizacion({ id: origCot.id, estado: 'descartada' }).then(r => log('RECOTIZAR discard', r))
        // D-02 fix: create new version WITHOUT stale productos_snapshot / files
        // so the editor reads fresh from productos_oportunidad.
        svcCotizaciones.createCotizacion({
          id: newCotId,
          oportunidad_id: origCot.oportunidad_id,
          numero: action.payload.nuevoNumero,
          estado: 'borrador',
          fecha: todayLocalISO(),
          total: 0,
          // Carry over editing conditions from original
          tiempoEntrega: origCot.tiempoEntrega,
          incluyeTransporte: origCot.incluyeTransporte,
          condicionesItems: origCot.condicionesItems,
          noIncluyeItems: origCot.noIncluyeItems,
          // productos_snapshot intentionally omitted — editor will load from productos_oportunidad
        }).then(r => log('RECOTIZAR new', r))
        // Persist oportunidad.valor_cotizado — new version starts at 0 until PDF is generated
        const simulatedCots = stateBefore.cotizaciones
          .map(c => c.id === origCot.id ? { ...c, estado: 'descartada' as const } : c)
          .concat([{ ...origCot, id: newCotId, numero: action.payload.nuevoNumero, estado: 'borrador' as const, fecha: todayLocalISO(), total: 0 }])
        const valor = getActiveCotizacionValor(simulatedCots, origCot.oportunidad_id)
        // D-11: mirror reducer — mover la oportunidad a 'recotizada' si no está en etapa final ni ya en recotizada
        const opp = stateBefore.oportunidades.find(o => o.id === origCot.oportunidad_id)
        const finalStates: Etapa[] = ['adjudicada', 'perdida']
        const shouldMoveEtapa = opp && opp.etapa !== 'recotizada' && !finalStates.includes(opp.etapa)
        if (shouldMoveEtapa && opp) {
          svcOportunidades.updateOportunidad({
            id: origCot.oportunidad_id,
            valor_cotizado: valor,
            etapa: 'recotizada',
            fecha_ultimo_contacto: todayLocalISO(),
          } as Partial<Oportunidad> & { id: string }).then(r => log('RECOTIZAR opp', r))
          svcOportunidades.createHistorial({
            oportunidad_id: origCot.oportunidad_id,
            etapa_anterior: opp.etapa,
            etapa_nueva: 'recotizada',
            created_at: new Date().toISOString(),
          }).then(r => log('RECOTIZAR historial', r))
        } else {
          svcOportunidades.updateOportunidad({ id: origCot.oportunidad_id, valor_cotizado: valor })
            .then(r => log('RECOTIZAR opp', r))
        }
      }
      break
    }
    // D-12: Reactivar — swap descartada ↔ active in Supabase
    case 'REACTIVAR_COTIZACION': {
      const descartada = stateBefore.cotizaciones.find(c => c.id === action.payload.cotizacionDescartadaId)
      if (!descartada || descartada.estado !== 'descartada') break
      const currentActive = stateBefore.cotizaciones
        .filter(c => c.oportunidad_id === descartada.oportunidad_id && (c.estado === 'borrador' || c.estado === 'enviada'))
        .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))[0]
      const restoredEstado: Cotizacion['estado'] = descartada.fecha_envio ? 'enviada' : 'borrador'
      // Update the descartada → restored
      svcCotizaciones.updateCotizacion({ id: descartada.id, estado: restoredEstado })
        .then(r => log('REACTIVAR restore', r))
      // Discard the currently active one
      if (currentActive) {
        svcCotizaciones.updateCotizacion({ id: currentActive.id, estado: 'descartada' })
          .then(r => log('REACTIVAR discard-active', r))
      }
      // Persist oportunidad.valor_cotizado
      const simulatedCots = stateBefore.cotizaciones.map(c => {
        if (c.id === descartada.id) return { ...c, estado: restoredEstado }
        if (currentActive && c.id === currentActive.id) return { ...c, estado: 'descartada' as const }
        return c
      })
      const valorReact = getActiveCotizacionValor(simulatedCots, descartada.oportunidad_id)
      // D-12: mirror reducer — si la opp estaba en 'recotizada', regresa a cotizacion_enviada/en_cotizacion
      const oppReact = stateBefore.oportunidades.find(o => o.id === descartada.oportunidad_id)
      if (oppReact && oppReact.etapa === 'recotizada') {
        const nuevaEtapa: Etapa = restoredEstado === 'enviada' ? 'cotizacion_enviada' : 'en_cotizacion'
        svcOportunidades.updateOportunidad({
          id: descartada.oportunidad_id,
          valor_cotizado: valorReact,
          etapa: nuevaEtapa,
          fecha_ultimo_contacto: todayLocalISO(),
        } as Partial<Oportunidad> & { id: string }).then(r => log('REACTIVAR opp', r))
        svcOportunidades.createHistorial({
          oportunidad_id: descartada.oportunidad_id,
          etapa_anterior: 'recotizada',
          etapa_nueva: nuevaEtapa,
          created_at: new Date().toISOString(),
        }).then(r => log('REACTIVAR historial', r))
      } else {
        svcOportunidades.updateOportunidad({ id: descartada.oportunidad_id, valor_cotizado: valorReact })
          .then(r => log('REACTIVAR opp', r))
      }
      break
    }
    case 'BULK_UPSERT_PRECIOS':
    case '_HYDRATE':
    case '_ROLLBACK_ADD': // local-only — never sync to DB
      break
  }
}

/* ══════════════════════════════════════════════════════════
   CONTEXT & PROVIDER
   ══════════════════════════════════════════════════════════ */

const StoreContext = createContext<{ state: State; dispatch: React.Dispatch<Action>; resetState: () => void; loading: boolean } | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, undefined, loadState)
  const [loading, setLoading] = useState(isSupabaseReady)

  // Keep a ref to always have latest state for sync (fixes closure bug)
  const stateRef = useRef(state)
  useEffect(() => { stateRef.current = state }, [state])

  // Wrapped dispatch: reduce locally + sync to Supabase.
  // rawDispatch is passed to syncToSupabase so it can issue local-only _ROLLBACK_ADD
  // without triggering another sync cycle (B-01).
  const dispatch = useCallback((action: Action) => {
    syncToSupabase(action, stateRef.current, rawDispatch)
    rawDispatch(action)
  }, [rawDispatch]) // rawDispatch is stable; stateRef.current always fresh

  // Persist to localStorage (cache/fallback, quota-safe)
  useEffect(() => {
    saveState(state)
  }, [state])

  // Hydrate from Supabase on mount
  useEffect(() => {
    if (!isSupabaseReady) {
      // A-05: no Supabase — localStorage is the source of truth, mark hydrated immediately
      rawDispatch({ type: '_HYDRATE', payload: { isHydrated: true } })
      return
    }

    async function hydrate() {
      try {
        const [emp, con, opp, hist, prod, cot, prec] = await Promise.all([
          svcEmpresas.fetchEmpresas(),
          svcOportunidades.fetchContactos(),
          svcOportunidades.fetchOportunidades(),
          svcOportunidades.fetchHistorial(),
          svcOportunidades.fetchProductos(),
          svcCotizaciones.fetchCotizaciones(),
          svcPrecios.fetchPrecios(),
        ])

        // Only hydrate collections that returned data (non-empty = Supabase has data)
        const patch: Partial<State> = {}
        if (!emp.error && emp.data.length > 0) patch.empresas = emp.data
        if (!con.error && con.data.length > 0) patch.contactos = con.data
        if (!opp.error && opp.data.length > 0) patch.oportunidades = opp.data
        if (!hist.error) patch.historial = hist.data
        if (!prod.error) patch.productos = prod.data
        if (!cot.error) patch.cotizaciones = cot.data
        if (!prec.error && prec.data.length > 0) patch.precios = prec.data

        // A-05: always set isHydrated after fetch (even if patch is empty)
        patch.isHydrated = true
        rawDispatch({ type: '_HYDRATE', payload: patch })

        // Fix 15: One-time normalization of legacy cotizador values with trailing spaces.
        // Guard contra null — fix-cotizador-cero.sql convirtió '0' a NULL, y null.trim() crashea.
        if (opp.data.length > 0) {
          const toFix = opp.data.filter(o => {
            const v = o.cotizador_asignado
            if (v == null) return false
            return v !== v.trim() || v === '0'
          })
          for (const o of toFix) {
            const trimmed = (o.cotizador_asignado || '').trim()
            if (trimmed && trimmed !== '0') {
              svcOportunidades.updateOportunidad({ id: o.id, cotizador_asignado: trimmed } as any)
            }
          }
          if (toFix.length > 0) console.log(`[Normalize] Fixed ${toFix.length} legacy cotizador values`)
        }

        // Fix: Move oportunidades with borrador cotizaciones from cotizacion_enviada → en_cotizacion
        if (opp.data.length > 0 && cot.data.length > 0) {
          const borradorOpIds = new Set(
            cot.data.filter((c: Cotizacion) => c.estado === 'borrador').map((c: Cotizacion) => c.oportunidad_id)
          )
          const toMove = opp.data.filter(
            (o: Oportunidad) => o.etapa === 'cotizacion_enviada' && borradorOpIds.has(o.id) &&
            // Only if ALL cotizaciones are borrador (not just some)
            !cot.data.some((c: Cotizacion) => c.oportunidad_id === o.id && c.estado !== 'borrador')
          )
          for (const o of toMove) {
            svcOportunidades.updateOportunidad({ id: o.id, etapa: 'en_cotizacion' } as any)
          }
          if (toMove.length > 0) {
            console.log(`[Fix] Moved ${toMove.length} oportunidades from cotizacion_enviada → en_cotizacion (all cotizaciones are borrador)`)
            // Also update the local patch
            if (patch.oportunidades) {
              patch.oportunidades = patch.oportunidades.map(o =>
                toMove.some((m: Oportunidad) => m.id === o.id) ? { ...o, etapa: 'en_cotizacion' as const } : o
              )
              rawDispatch({ type: '_HYDRATE', payload: { oportunidades: patch.oportunidades } })
            }
          }
        }
      } catch (err) {
        console.error('[Supabase hydrate]', err)
        showToast('error', 'Error al cargar datos de Supabase')
        // A-05: still mark hydrated so UI shows "not found" instead of spinner on error
        rawDispatch({ type: '_HYDRATE', payload: { isHydrated: true } })
      } finally {
        setLoading(false)
      }
    }

    hydrate()
  }, [])

  function resetState() {
    localStorage.removeItem(STORAGE_KEY)
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--color-text-muted)]">Conectando con base de datos...</p>
        </div>
      </div>
    )
  }

  return <StoreContext.Provider value={{ state, dispatch, resetState, loading }}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be inside StoreProvider')
  return ctx
}

import { supabase, isSupabaseReady, fetchAllRows } from './useSupabase'
import type { Oportunidad, HistorialEtapa, ProductoCliente, Contacto } from '../types'

// ── Oportunidades ──────────────────────────────────────

export async function fetchOportunidades(): Promise<{ data: Oportunidad[]; error: string | null }> {
  if (!isSupabaseReady) return { data: [], error: 'supabase_not_ready' }
  return fetchAllRows<Oportunidad>(supabase.from('oportunidades').select('*').order('created_at', { ascending: true }))
}

export async function createOportunidad(op: Omit<Oportunidad, 'id' | 'created_at'> & { id?: string }): Promise<{ data: Oportunidad | null; error: string | null }> {
  if (!isSupabaseReady) return { data: null, error: 'supabase_not_ready' }
  const { id, ...rest } = op
  const row: Record<string, unknown> = { ...rest }
  if (id) row.id = id
  const { data, error } = await supabase.from('oportunidades').insert(row).select().single()
  if (error) return { data: null, error: error.message }
  return { data: data as Oportunidad, error: null }
}

export async function updateOportunidad(updates: Partial<Oportunidad> & { id: string }): Promise<{ error: string | null }> {
  if (!isSupabaseReady) return { error: 'supabase_not_ready' }
  const { id, ...rest } = updates
  const { error } = await supabase.from('oportunidades').update(rest).eq('id', id)
  return { error: error?.message ?? null }
}

export async function removeOportunidad(id: string): Promise<{ error: string | null }> {
  if (!isSupabaseReady) return { error: 'supabase_not_ready' }
  const { error } = await supabase.from('oportunidades').delete().eq('id', id)
  return { error: error?.message ?? null }
}

// ── Historial ──────────────────────────────────────────

export async function fetchHistorial(): Promise<{ data: HistorialEtapa[]; error: string | null }> {
  if (!isSupabaseReady) return { data: [], error: 'supabase_not_ready' }
  return fetchAllRows<HistorialEtapa>(supabase.from('historial_etapas').select('*').order('created_at', { ascending: true }))
}

export async function createHistorial(entry: Omit<HistorialEtapa, 'id'> & { id?: string }): Promise<{ error: string | null }> {
  if (!isSupabaseReady) return { error: 'supabase_not_ready' }
  const { id, ...rest } = entry
  const row: Record<string, unknown> = { ...rest }
  if (id) row.id = id
  const { error } = await supabase.from('historial_etapas').insert(row)
  return { error: error?.message ?? null }
}

// ── Contactos ──────────────────────────────────────────

export async function fetchContactos(): Promise<{ data: Contacto[]; error: string | null }> {
  if (!isSupabaseReady) return { data: [], error: 'supabase_not_ready' }
  return fetchAllRows<Contacto>(supabase.from('contactos').select('*').order('created_at', { ascending: true }))
}

export async function createContacto(c: Omit<Contacto, 'id' | 'created_at'> & { id?: string }): Promise<{ data: Contacto | null; error: string | null }> {
  if (!isSupabaseReady) return { data: null, error: 'supabase_not_ready' }
  const { id, ...rest } = c
  const row: Record<string, unknown> = { ...rest }
  if (id) row.id = id
  const { data, error } = await supabase.from('contactos').insert(row).select().single()
  if (error) return { data: null, error: error.message }
  return { data: data as Contacto, error: null }
}

export async function updateContacto(c: Contacto): Promise<{ error: string | null }> {
  if (!isSupabaseReady) return { error: 'supabase_not_ready' }
  const { id, ...rest } = c
  const { error } = await supabase.from('contactos').update(rest).eq('id', id)
  return { error: error?.message ?? null }
}

// ── Productos ──────────────────────────────────────────

export async function fetchProductos(): Promise<{ data: ProductoCliente[]; error: string | null }> {
  if (!isSupabaseReady) return { data: [], error: 'supabase_not_ready' }
  return fetchAllRows<ProductoCliente>(supabase.from('productos_oportunidad').select('*').order('created_at', { ascending: true }))
}

/** Strip fields that may not exist as columns yet to prevent INSERT failures */
function sanitizeProducto(p: Record<string, unknown>): Record<string, unknown> {
  const KNOWN_COLUMNS = ['id', 'oportunidad_id', 'categoria', 'subtipo', 'configuracion', 'apu_resultado', 'precio_calculado', 'descripcion_comercial', 'cantidad', 'imagen_render', 'archivo_apu_url', 'archivo_apu_nombre', 'archivo_pdf_url', 'archivo_pdf_nombre']
  const row: Record<string, unknown> = {}
  for (const key of KNOWN_COLUMNS) {
    if (key in p && p[key] !== undefined) row[key] = p[key]
  }
  return row
}

export async function createProducto(p: Omit<ProductoCliente, 'id'> & { id?: string }): Promise<{ error: string | null }> {
  if (!isSupabaseReady) return { error: 'supabase_not_ready' }
  const row = sanitizeProducto(p as Record<string, unknown>)
  const { error } = await supabase.from('productos_oportunidad').insert(row)
  if (error) console.error('[createProducto] INSERT failed:', error.message, 'Row keys:', Object.keys(row))
  return { error: error?.message ?? null }
}

export async function updateProducto(updates: Partial<ProductoCliente> & { id: string }): Promise<{ error: string | null }> {
  if (!isSupabaseReady) return { error: 'supabase_not_ready' }
  const { id, ...rest } = updates
  const row = sanitizeProducto(rest as Record<string, unknown>)
  delete row.id // id is in the WHERE clause, not in the UPDATE
  const { error } = await supabase.from('productos_oportunidad').update(row).eq('id', id)
  if (error) console.error('[updateProducto] UPDATE failed:', error.message)
  return { error: error?.message ?? null }
}

export async function removeProducto(id: string): Promise<{ error: string | null }> {
  if (!isSupabaseReady) return { error: 'supabase_not_ready' }
  const { error } = await supabase.from('productos_oportunidad').delete().eq('id', id)
  return { error: error?.message ?? null }
}

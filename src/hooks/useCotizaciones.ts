import { supabase, isSupabaseReady, fetchAllRows } from './useSupabase'
import type { Cotizacion } from '../types'

export async function fetchCotizaciones(): Promise<{ data: Cotizacion[]; error: string | null }> {
  if (!isSupabaseReady) return { data: [], error: 'supabase_not_ready' }
  return fetchAllRows<Cotizacion>(supabase.from('cotizaciones').select('*').order('created_at', { ascending: true }))
}

export async function createCotizacion(cot: Omit<Cotizacion, 'id'> & { id?: string }): Promise<{ error: string | null }> {
  if (!isSupabaseReady) return { error: 'supabase_not_ready' }
  const { id, ...rest } = cot
  const row: Record<string, unknown> = { ...rest }
  if (id) row.id = id
  const { error } = await supabase.from('cotizaciones').insert(row)
  return { error: error?.message ?? null }
}

export async function updateCotizacion(updates: Partial<Cotizacion> & { id: string }): Promise<{ error: string | null }> {
  if (!isSupabaseReady) return { error: 'supabase_not_ready' }
  const { id, ...rest } = updates
  const { error } = await supabase.from('cotizaciones').update(rest).eq('id', id)
  return { error: error?.message ?? null }
}

export async function removeCotizacion(id: string): Promise<{ error: string | null }> {
  if (!isSupabaseReady) return { error: 'supabase_not_ready' }
  const { error } = await supabase.from('cotizaciones').delete().eq('id', id)
  return { error: error?.message ?? null }
}

export async function duplicateCotizacion(original: Cotizacion, nuevoNumero: string): Promise<{ error: string | null }> {
  if (!isSupabaseReady) return { error: 'supabase_not_ready' }
  const { id: _id, ...rest } = original
  const row = { ...rest, numero: nuevoNumero, estado: 'borrador', fecha: new Date().toISOString().split('T')[0] }
  const { error } = await supabase.from('cotizaciones').insert(row)
  return { error: error?.message ?? null }
}

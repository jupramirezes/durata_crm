import { supabase, isSupabaseReady, fetchAllRows } from './useSupabase'
import type { Cotizacion } from '../types'

/** Map Cotizacion (camelCase) → DB row (snake_case) */
function toDbRow(cot: Partial<Cotizacion> & { id?: string }): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if (cot.id !== undefined) row.id = cot.id
  if (cot.oportunidad_id !== undefined) row.oportunidad_id = cot.oportunidad_id
  if (cot.numero !== undefined) row.numero = cot.numero
  if (cot.fecha !== undefined) row.fecha = cot.fecha
  if (cot.fecha_envio !== undefined) row.fecha_envio = cot.fecha_envio
  if (cot.estado !== undefined) row.estado = cot.estado
  if (cot.total !== undefined) row.total = cot.total
  if (cot.productos_snapshot !== undefined) row.productos_snapshot = cot.productos_snapshot
  if (cot.tiempoEntrega !== undefined) row.tiempo_entrega = cot.tiempoEntrega
  if (cot.incluyeTransporte !== undefined) row.incluye_transporte = cot.incluyeTransporte
  if (cot.condicionesItems !== undefined) row.condiciones_items = cot.condicionesItems
  if (cot.noIncluyeItems !== undefined) row.no_incluye_items = cot.noIncluyeItems
  return row
}

/** Map DB row (snake_case) → Cotizacion (camelCase) */
function fromDbRow(row: Record<string, unknown>): Cotizacion {
  return {
    id: row.id as string,
    oportunidad_id: row.oportunidad_id as string,
    numero: row.numero as string,
    fecha: row.fecha as string,
    fecha_envio: row.fecha_envio as string | undefined,
    estado: row.estado as Cotizacion['estado'],
    total: Number(row.total) || 0,
    productos_snapshot: row.productos_snapshot as Cotizacion['productos_snapshot'],
    tiempoEntrega: row.tiempo_entrega as string | undefined,
    incluyeTransporte: row.incluye_transporte as boolean | undefined,
    condicionesItems: row.condiciones_items as string[] | undefined,
    noIncluyeItems: row.no_incluye_items as string[] | undefined,
  }
}

export async function fetchCotizaciones(): Promise<{ data: Cotizacion[]; error: string | null }> {
  if (!isSupabaseReady) return { data: [], error: 'supabase_not_ready' }
  const result = await fetchAllRows<Record<string, unknown>>(supabase.from('cotizaciones').select('*').order('created_at', { ascending: true }))
  return { data: result.data.map(fromDbRow), error: result.error }
}

export async function createCotizacion(cot: Omit<Cotizacion, 'id'> & { id?: string }): Promise<{ error: string | null }> {
  if (!isSupabaseReady) return { error: 'supabase_not_ready' }
  const row = toDbRow(cot)
  const { error } = await supabase.from('cotizaciones').insert(row)
  return { error: error?.message ?? null }
}

export async function updateCotizacion(updates: Partial<Cotizacion> & { id: string }): Promise<{ error: string | null }> {
  if (!isSupabaseReady) return { error: 'supabase_not_ready' }
  const { id } = updates
  const row = toDbRow(updates)
  delete row.id
  const { error } = await supabase.from('cotizaciones').update(row).eq('id', id)
  return { error: error?.message ?? null }
}

export async function removeCotizacion(id: string): Promise<{ error: string | null }> {
  if (!isSupabaseReady) return { error: 'supabase_not_ready' }
  const { error } = await supabase.from('cotizaciones').delete().eq('id', id)
  return { error: error?.message ?? null }
}

export async function duplicateCotizacion(original: Cotizacion, nuevoNumero: string): Promise<{ error: string | null }> {
  if (!isSupabaseReady) return { error: 'supabase_not_ready' }
  const dup = { ...original, numero: nuevoNumero, estado: 'borrador' as const, fecha: new Date().toISOString().split('T')[0] }
  const row = toDbRow(dup)
  delete row.id // let DB generate new id
  const { error } = await supabase.from('cotizaciones').insert(row)
  return { error: error?.message ?? null }
}

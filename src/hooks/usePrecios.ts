import { supabase, isSupabaseReady } from './useSupabase'
import type { PrecioMaestro } from '../types'

export async function fetchPrecios(): Promise<{ data: PrecioMaestro[]; error: string | null }> {
  if (!isSupabaseReady) return { data: [], error: 'supabase_not_ready' }
  const { data, error } = await supabase.from('precios_maestro').select('*').order('grupo').order('nombre')
  if (error) return { data: [], error: error.message }
  return { data: data as PrecioMaestro[], error: null }
}

export async function updatePrecio(id: string, precio: number): Promise<{ error: string | null }> {
  if (!isSupabaseReady) return { error: 'supabase_not_ready' }
  const { error } = await supabase.from('precios_maestro').update({ precio, updated_at: new Date().toISOString() }).eq('id', id)
  return { error: error?.message ?? null }
}

export async function updatePrecioProveedor(id: string, proveedor: string): Promise<{ error: string | null }> {
  if (!isSupabaseReady) return { error: 'supabase_not_ready' }
  const { error } = await supabase.from('precios_maestro').update({ proveedor, updated_at: new Date().toISOString() }).eq('id', id)
  return { error: error?.message ?? null }
}

/**
 * Upsert batch de precios por código.
 * Si el código ya existe, actualiza precio/nombre/grupo/unidad/proveedor.
 */
export async function upsertPrecios(rows: Omit<PrecioMaestro, 'id'>[]): Promise<{ inserted: number; updated: number; errors: string[] }> {
  if (!isSupabaseReady) return { inserted: 0, updated: 0, errors: ['supabase_not_ready'] }

  const result = { inserted: 0, updated: 0, errors: [] as string[] }

  // Fetch existing codes to know which are inserts vs updates
  const { data: existing } = await supabase.from('precios_maestro').select('codigo')
  const existingCodes = new Set((existing || []).map(e => e.codigo))

  const toUpsert = rows.map(r => ({
    grupo: r.grupo,
    nombre: r.nombre,
    codigo: r.codigo,
    unidad: r.unidad,
    precio: r.precio,
    proveedor: r.proveedor,
    updated_at: new Date().toISOString(),
  }))

  // Upsert in batches of 50
  for (let i = 0; i < toUpsert.length; i += 50) {
    const batch = toUpsert.slice(i, i + 50)
    const { error } = await supabase.from('precios_maestro').upsert(batch, { onConflict: 'codigo' })
    if (error) {
      result.errors.push(`Batch ${i}: ${error.message}`)
    } else {
      batch.forEach(r => {
        if (existingCodes.has(r.codigo)) result.updated++
        else result.inserted++
      })
    }
  }

  return result
}

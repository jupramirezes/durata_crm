import { supabase, isSupabaseReady, fetchAllRows } from './useSupabase'
import type { PrecioMaestro } from '../types'

export async function fetchPrecios(): Promise<{ data: PrecioMaestro[]; error: string | null }> {
  if (!isSupabaseReady) return { data: [], error: 'supabase_not_ready' }
  return fetchAllRows<PrecioMaestro>(supabase.from('precios_maestro').select('*').order('grupo').order('nombre'))
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
 * Import precios handling two cases:
 * - WITH codigo: upsert with ON CONFLICT (codigo)
 * - WITHOUT codigo: match by nombre — update if exists, insert if not
 */
export async function upsertPrecios(rows: Omit<PrecioMaestro, 'id'>[]): Promise<{ inserted: number; updated: number; errors: string[] }> {
  if (!isSupabaseReady) return { inserted: 0, updated: 0, errors: ['supabase_not_ready'] }

  const result = { inserted: 0, updated: 0, errors: [] as string[] }
  const now = new Date().toISOString()

  // Split rows by whether they have a codigo
  const withCodigo = rows.filter(r => r.codigo && r.codigo.trim())
  const withoutCodigo = rows.filter(r => !r.codigo || !r.codigo.trim())

  // ── 1. Rows WITH codigo: upsert by codigo ──
  if (withCodigo.length > 0) {
    const { data: existing } = await fetchAllRows<{ codigo: string }>(
      supabase.from('precios_maestro').select('codigo').order('id'),
    )
    const existingCodes = new Set((existing || []).map(e => e.codigo).filter(Boolean))

    const toUpsert = withCodigo.map(r => ({
      grupo: r.grupo, subgrupo: r.subgrupo || '', nombre: r.nombre, codigo: r.codigo,
      unidad: r.unidad, precio: r.precio, proveedor: r.proveedor, updated_at: now,
    }))

    for (let i = 0; i < toUpsert.length; i += 50) {
      const batch = toUpsert.slice(i, i + 50)
      const { error } = await supabase.from('precios_maestro').upsert(batch, { onConflict: 'codigo' })
      if (error) {
        result.errors.push(`Batch codigo ${i}: ${error.message}`)
      } else {
        batch.forEach(r => {
          if (existingCodes.has(r.codigo)) result.updated++
          else result.inserted++
        })
      }
    }
  }

  // ── 2. Rows WITHOUT codigo: match by nombre ──
  if (withoutCodigo.length > 0) {
    const { data: allExisting } = await fetchAllRows<{ id: string; nombre: string }>(
      supabase.from('precios_maestro').select('id, nombre').order('id'),
    )
    const allNameMap = new Map((allExisting || []).map(e => [e.nombre.toLowerCase().trim(), e.id]))

    for (const row of withoutCodigo) {
      const key = row.nombre.toLowerCase().trim()
      const existingId = allNameMap.get(key)

      if (existingId) {
        const { error } = await supabase.from('precios_maestro')
          .update({ grupo: row.grupo, subgrupo: row.subgrupo || '', precio: row.precio, unidad: row.unidad, proveedor: row.proveedor, updated_at: now })
          .eq('id', existingId)
        if (error) result.errors.push(`Update "${row.nombre}": ${error.message}`)
        else result.updated++
      } else {
        const { error } = await supabase.from('precios_maestro')
          .insert({ grupo: row.grupo, subgrupo: row.subgrupo || '', nombre: row.nombre, codigo: null, unidad: row.unidad, precio: row.precio, proveedor: row.proveedor, updated_at: now })
        if (error) result.errors.push(`Insert "${row.nombre}": ${error.message}`)
        else result.inserted++
      }
    }
  }

  return result
}

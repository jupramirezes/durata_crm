import { supabase, isSupabaseReady } from './useSupabase'
import type { Empresa } from '../types'

export async function fetchEmpresas(): Promise<{ data: Empresa[]; error: string | null }> {
  if (!isSupabaseReady) return { data: [], error: 'supabase_not_ready' }
  const { data, error } = await supabase.from('empresas').select('*').order('created_at', { ascending: true })
  if (error) return { data: [], error: error.message }
  return { data: data as Empresa[], error: null }
}

export async function createEmpresa(emp: Omit<Empresa, 'id' | 'created_at'> & { id?: string }): Promise<{ data: Empresa | null; error: string | null }> {
  if (!isSupabaseReady) return { data: null, error: 'supabase_not_ready' }
  const row: Record<string, unknown> = { nombre: emp.nombre, nit: emp.nit, sector: emp.sector, direccion: emp.direccion, notas: emp.notas }
  if (emp.id) row.id = emp.id
  const { data, error } = await supabase.from('empresas').insert(row).select().single()
  if (error) return { data: null, error: error.message }
  return { data: data as Empresa, error: null }
}

export async function updateEmpresa(emp: Empresa): Promise<{ error: string | null }> {
  if (!isSupabaseReady) return { error: 'supabase_not_ready' }
  const { error } = await supabase.from('empresas').update({
    nombre: emp.nombre, nit: emp.nit, sector: emp.sector, direccion: emp.direccion, notas: emp.notas,
  }).eq('id', emp.id)
  return { error: error?.message ?? null }
}

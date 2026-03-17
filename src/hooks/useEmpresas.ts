import { supabase, isSupabaseReady, fetchAllRows } from './useSupabase'
import type { Empresa } from '../types'

export async function fetchEmpresas(): Promise<{ data: Empresa[]; error: string | null }> {
  if (!isSupabaseReady) return { data: [], error: 'supabase_not_ready' }
  return fetchAllRows<Empresa>(supabase.from('empresas').select('*').order('created_at', { ascending: true }))
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

export async function deleteEmpresa(id: string): Promise<{ error: string | null }> {
  if (!isSupabaseReady) return { error: 'supabase_not_ready' }
  // Cascade: delete cotizaciones, productos, historial, oportunidades, contactos tied to this empresa
  // Get related oportunidad IDs first
  const { data: ops } = await supabase.from('oportunidades').select('id').eq('empresa_id', id)
  const opIds = (ops || []).map((o: { id: string }) => o.id)
  if (opIds.length > 0) {
    await supabase.from('cotizaciones').delete().in('oportunidad_id', opIds)
    await supabase.from('productos_cliente').delete().in('oportunidad_id', opIds)
    await supabase.from('historial_etapas').delete().in('oportunidad_id', opIds)
    await supabase.from('oportunidades').delete().eq('empresa_id', id)
  }
  await supabase.from('contactos').delete().eq('empresa_id', id)
  const { error } = await supabase.from('empresas').delete().eq('id', id)
  return { error: error?.message ?? null }
}

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Supabase está configurado si la URL termina en .supabase.co y la key no es placeholder
export const isSupabaseReady =
  SUPABASE_URL.includes('.supabase.co') &&
  SUPABASE_ANON_KEY.length > 20 &&
  !SUPABASE_ANON_KEY.includes('TU-ANON-KEY')

/**
 * Paginated fetch that bypasses Supabase's 1000-row default limit.
 * Pass a query builder (before .range()) and get all rows back.
 *
 * Usage:
 *   const data = await fetchAllRows(supabase.from('table').select('*').order('id'))
 */
export async function fetchAllRows<T = Record<string, unknown>>(
  query: { range: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }> },
): Promise<{ data: T[]; error: string | null }> {
  const PAGE = 1000
  const all: T[] = []
  let from = 0

  while (true) {
    const { data, error } = await query.range(from, from + PAGE - 1)
    if (error) return { data: all, error: error.message }
    if (data) all.push(...data)
    if (!data || data.length < PAGE) break
    from += PAGE
  }

  return { data: all, error: null }
}

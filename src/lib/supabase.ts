import { createClient } from '@supabase/supabase-js'

// ⚠️ CONFIGURACIÓN: Reemplaza estos valores con los de tu proyecto Supabase
// Los encuentras en: supabase.com → Tu proyecto → Settings → API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://TU-PROYECTO.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'TU-ANON-KEY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Flag para saber si Supabase está configurado
export const isSupabaseConfigured = !SUPABASE_URL.includes('TU-PROYECTO')

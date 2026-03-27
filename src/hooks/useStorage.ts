/**
 * Supabase Storage helpers for file uploads/downloads.
 *
 * BUCKET: "archivos-oportunidades"
 * Structure: {oportunidad_id}/{producto_id}/{filename}
 *
 * ── SQL to run in Supabase Dashboard ──────────────────────────
 *
 * 1. Create bucket (if it doesn't exist):
 *    INSERT INTO storage.buckets (id, name, public)
 *    VALUES ('archivos-oportunidades', 'archivos-oportunidades', false);
 *
 * 2. RLS policies for authenticated users:
 *    CREATE POLICY "Auth users can upload"
 *      ON storage.objects FOR INSERT TO authenticated
 *      WITH CHECK (bucket_id = 'archivos-oportunidades');
 *
 *    CREATE POLICY "Auth users can read"
 *      ON storage.objects FOR SELECT TO authenticated
 *      USING (bucket_id = 'archivos-oportunidades');
 *
 *    CREATE POLICY "Auth users can delete"
 *      ON storage.objects FOR DELETE TO authenticated
 *      USING (bucket_id = 'archivos-oportunidades');
 *
 * 3. Add columns to productos_oportunidad:
 *    ALTER TABLE productos_oportunidad
 *      ADD COLUMN IF NOT EXISTS archivo_apu_url text,
 *      ADD COLUMN IF NOT EXISTS archivo_apu_nombre text,
 *      ADD COLUMN IF NOT EXISTS archivo_pdf_url text,
 *      ADD COLUMN IF NOT EXISTS archivo_pdf_nombre text;
 * ──────────────────────────────────────────────────────────────
 */

import { supabase, isSupabaseReady } from './useSupabase'

const BUCKET = 'archivos-oportunidades'
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

const APU_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel.sheet.macroEnabled.12', // .xlsm
  'application/vnd.ms-excel', // .xls
]
const PDF_TYPES = ['application/pdf']

export type FileKind = 'apu' | 'pdf'

function allowedTypes(kind: FileKind): string[] {
  return kind === 'apu' ? APU_TYPES : PDF_TYPES
}

function acceptString(kind: FileKind): string {
  return kind === 'apu' ? '.xlsx,.xlsm,.xls' : '.pdf'
}

export { acceptString }

export async function uploadProductFile(
  oportunidadId: string,
  productoId: string,
  file: File,
  kind: FileKind,
): Promise<{ url: string; nombre: string } | { error: string }> {
  if (!isSupabaseReady) return { error: 'Supabase no disponible' }

  if (file.size > MAX_SIZE) return { error: 'Archivo excede 10MB' }

  const allowed = allowedTypes(kind)
  if (!allowed.includes(file.type)) {
    // Fallback: check extension
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    const validExts = kind === 'apu' ? ['xlsx', 'xlsm', 'xls'] : ['pdf']
    if (!validExts.includes(ext)) {
      return { error: `Tipo de archivo no permitido. Usar ${kind === 'apu' ? '.xlsx/.xlsm/.xls' : '.pdf'}` }
    }
  }

  const path = `${oportunidadId}/${productoId}/${kind}_${file.name}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || 'application/octet-stream',
  })

  if (error) return { error: error.message }

  return { url: path, nombre: file.name }
}

export async function getSignedUrl(path: string): Promise<string | null> {
  if (!isSupabaseReady || !path) return null
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 3600) // 1 hour
  if (error) {
    console.warn('[Storage] Signed URL error:', error.message)
    return null
  }
  return data.signedUrl
}

/** Upload a general file to an oportunidad folder (any type allowed) */
export async function uploadOppFile(
  oportunidadId: string,
  file: File,
): Promise<{ url: string; nombre: string; size: number } | { error: string }> {
  if (!isSupabaseReady) return { error: 'Supabase no disponible' }
  if (file.size > MAX_SIZE) return { error: 'Archivo excede 10MB' }
  const ts = Date.now()
  const path = `${oportunidadId}/archivos/${ts}_${file.name}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || 'application/octet-stream',
  })
  if (error) return { error: error.message }
  return { url: path, nombre: file.name, size: file.size }
}

/** List files in an oportunidad's archivos folder */
export async function listOppFiles(oportunidadId: string): Promise<{ name: string; path: string; size: number; created: string }[]> {
  if (!isSupabaseReady) return []
  const { data, error } = await supabase.storage.from(BUCKET).list(`${oportunidadId}/archivos`, { limit: 100 })
  if (error || !data) return []
  return data.map(f => ({
    name: f.name.replace(/^\d+_/, ''), // strip timestamp prefix
    path: `${oportunidadId}/archivos/${f.name}`,
    size: (f.metadata as any)?.size || 0,
    created: f.created_at || '',
  }))
}

export async function deleteProductFile(path: string): Promise<{ error: string | null }> {
  if (!isSupabaseReady) return { error: 'Supabase no disponible' }
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  return { error: error?.message ?? null }
}

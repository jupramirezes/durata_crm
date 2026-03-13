import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { isSupabaseReady } from '../lib/supabase'
import { upsertPrecios } from '../hooks/usePrecios'
import type { PrecioMaestro } from '../types'
import { Upload, ArrowLeft, Check, AlertTriangle, FileSpreadsheet } from 'lucide-react'

type ColMap = { grupo: number; nombre: number; codigo: number; unidad: number; precio: number; proveedor: number }

const COL_LABELS: Record<keyof ColMap, string> = {
  grupo: 'Grupo', nombre: 'Nombre', codigo: 'Código', unidad: 'Unidad', precio: 'Precio', proveedor: 'Proveedor',
}

function detectSeparator(line: string): string {
  const semicolons = (line.match(/;/g) || []).length
  const commas = (line.match(/,/g) || []).length
  const tabs = (line.match(/\t/g) || []).length
  if (tabs >= commas && tabs >= semicolons) return '\t'
  return semicolons > commas ? ';' : ','
}

function parseCsvLine(line: string, sep: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes; continue }
    if (ch === sep && !inQuotes) { result.push(current.trim()); current = ''; continue }
    current += ch
  }
  result.push(current.trim())
  return result
}

export default function PreciosImportar() {
  const navigate = useNavigate()
  const { dispatch, state } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const [rawRows, setRawRows] = useState<string[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [colMap, setColMap] = useState<ColMap>({ grupo: -1, nombre: -1, codigo: -1, unidad: -1, precio: -1, proveedor: -1 })
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ inserted: number; updated: number; errors: string[] } | null>(null)
  const [fileName, setFileName] = useState('')

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setResult(null)

    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      const lines = text.split(/\r?\n/).filter(l => l.trim())
      if (lines.length === 0) return

      const sep = detectSeparator(lines[0])
      const parsed = lines.map(l => parseCsvLine(l, sep))
      const hdrs = parsed[0]
      setHeaders(hdrs)
      setRawRows(parsed.slice(1))

      // Auto-detect column mapping
      const autoMap: ColMap = { grupo: -1, nombre: -1, codigo: -1, unidad: -1, precio: -1, proveedor: -1 }
      hdrs.forEach((h, i) => {
        const hl = h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        if (hl.includes('grupo') || hl.includes('group')) autoMap.grupo = i
        else if (hl.includes('nombre') || hl.includes('name') || hl.includes('descripcion') || hl.includes('material')) autoMap.nombre = i
        else if (hl.includes('codigo') || hl.includes('code') || hl.includes('ref')) autoMap.codigo = i
        else if (hl.includes('unidad') || hl.includes('unit') || hl.includes('und')) autoMap.unidad = i
        else if (hl.includes('precio') || hl.includes('price') || hl.includes('valor')) autoMap.precio = i
        else if (hl.includes('proveedor') || hl.includes('supplier')) autoMap.proveedor = i
      })
      setColMap(autoMap)
    }
    reader.readAsText(file)
  }

  function buildRows(): Omit<PrecioMaestro, 'id'>[] {
    return rawRows
      .map(row => {
        const codigo = colMap.codigo >= 0 ? row[colMap.codigo] : ''
        const nombre = colMap.nombre >= 0 ? row[colMap.nombre] : ''
        if (!codigo && !nombre) return null
        const precioStr = colMap.precio >= 0 ? row[colMap.precio].replace(/[^0-9.,]/g, '').replace(',', '.') : '0'
        return {
          grupo: colMap.grupo >= 0 ? row[colMap.grupo] : 'OTROS',
          nombre: nombre || codigo,
          codigo: codigo || nombre.replace(/\s+/g, '_').toUpperCase().slice(0, 20),
          unidad: colMap.unidad >= 0 ? row[colMap.unidad] : 'und',
          precio: parseFloat(precioStr) || 0,
          proveedor: colMap.proveedor >= 0 ? row[colMap.proveedor] : '',
          updated_at: new Date().toISOString().split('T')[0],
        }
      })
      .filter(Boolean) as Omit<PrecioMaestro, 'id'>[]
  }

  async function handleImport() {
    setImporting(true)
    setResult(null)
    const rows = buildRows()

    if (isSupabaseReady) {
      // Supabase upsert
      const res = await upsertPrecios(rows)
      setResult(res)
      // Also sync to local store
      const withIds: PrecioMaestro[] = rows.map(r => ({
        ...r,
        id: state.precios.find(p => p.codigo === r.codigo)?.id || crypto.randomUUID(),
      }))
      dispatch({ type: 'BULK_UPSERT_PRECIOS', payload: withIds })
    } else {
      // Local-only
      let inserted = 0, updated = 0
      const withIds: PrecioMaestro[] = rows.map(r => {
        const existing = state.precios.find(p => p.codigo === r.codigo)
        if (existing) { updated++; return { ...r, id: existing.id } }
        inserted++
        return { ...r, id: crypto.randomUUID() }
      })
      dispatch({ type: 'BULK_UPSERT_PRECIOS', payload: withIds })
      setResult({ inserted, updated, errors: [] })
    }
    setImporting(false)
  }

  const previewRows = rawRows.slice(0, 10)
  const readyToImport = colMap.nombre >= 0 && (colMap.codigo >= 0 || colMap.nombre >= 0) && rawRows.length > 0

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/precios')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-surface)] transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text)]">Importar precios desde CSV</h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Sube un archivo CSV con tus precios. Si el código ya existe, se actualizará el precio.
            {isSupabaseReady && <span className="ml-1 text-green-600 font-medium">● Supabase conectado</span>}
          </p>
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl p-6">
        <div
          className="border-2 border-dashed border-[var(--color-border-light)] rounded-lg p-8 text-center cursor-pointer hover:border-[var(--color-primary)]/40 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" onChange={handleFile} className="hidden" />
          <FileSpreadsheet size={36} className="mx-auto text-[var(--color-text-muted)] mb-3" />
          {fileName ? (
            <p className="text-sm font-medium text-[var(--color-text)]">{fileName} — {rawRows.length} filas detectadas</p>
          ) : (
            <>
              <p className="text-sm font-medium text-[var(--color-text)]">Haz clic para seleccionar archivo CSV</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Soporta CSV, TSV, separados por coma, punto y coma o tabulador</p>
            </>
          )}
        </div>
      </div>

      {/* Column Mapping */}
      {headers.length > 0 && (
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-6">
          <h3 className="font-semibold text-sm text-[var(--color-text)] mb-4">Mapeo de columnas</h3>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(COL_LABELS) as (keyof ColMap)[]).map(key => (
              <div key={key}>
                <label className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-1 block">
                  {COL_LABELS[key]} {key === 'nombre' || key === 'codigo' ? '*' : ''}
                </label>
                <select
                  value={colMap[key]}
                  onChange={e => setColMap(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                  className="w-full px-2 py-1.5 text-xs border border-[var(--color-border)] rounded-lg bg-white"
                >
                  <option value={-1}>— No mapear —</option>
                  {headers.map((h, i) => (
                    <option key={i} value={i}>{h}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview */}
      {previewRows.length > 0 && (
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-5">
          <h3 className="font-semibold text-sm text-[var(--color-text)] mb-3">
            Preview (primeras {previewRows.length} de {rawRows.length} filas)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  {headers.map((h, i) => {
                    const mapped = Object.entries(colMap).find(([, v]) => v === i)
                    return (
                      <th key={i} className={`pb-2 px-2 text-left font-semibold ${mapped ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                        {h} {mapped ? `(${COL_LABELS[mapped[0] as keyof ColMap]})` : ''}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, ri) => (
                  <tr key={ri} className="border-b border-[var(--color-border)] last:border-0">
                    {row.map((cell, ci) => (
                      <td key={ci} className="py-1.5 px-2 truncate max-w-40">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import Button */}
      {rawRows.length > 0 && (
        <div className="flex items-center gap-4">
          <button
            onClick={handleImport}
            disabled={!readyToImport || importing}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-medium text-sm hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Upload size={16} />
                Importar {rawRows.length} precios
              </>
            )}
          </button>
          {!readyToImport && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <AlertTriangle size={14} />
              Mapea al menos la columna "Nombre" o "Código"
            </p>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`border rounded-xl p-5 ${result.errors.length > 0 ? 'border-amber-300 bg-amber-50' : 'border-green-300 bg-green-50'}`}>
          <div className="flex items-start gap-3">
            {result.errors.length > 0 ? (
              <AlertTriangle size={20} className="text-amber-600 mt-0.5" />
            ) : (
              <Check size={20} className="text-green-600 mt-0.5" />
            )}
            <div>
              <p className="font-semibold text-sm text-[var(--color-text)]">
                Importación completada
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                {result.inserted > 0 && <span className="text-green-700 font-medium">{result.inserted} nuevos </span>}
                {result.updated > 0 && <span className="text-blue-700 font-medium">{result.updated} actualizados </span>}
                {result.errors.length > 0 && <span className="text-red-600 font-medium">{result.errors.length} errores</span>}
              </p>
              {result.errors.length > 0 && (
                <ul className="mt-2 text-xs text-red-600 space-y-0.5">
                  {result.errors.map((err, i) => <li key={i}>• {err}</li>)}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

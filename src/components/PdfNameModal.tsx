import { useState, useEffect, useRef } from 'react'
import { FileText, X } from 'lucide-react'

interface Props {
  defaultNumero: string
  defaultNombreProducto?: string
  empresaNombre?: string
  contactoNombre?: string
  onConfirm: (nombreProducto: string) => void
  onClose: () => void
}

/** Sanitize filename: remove special characters */
function cleanFilename(s: string): string {
  return (s || '').replace(/[\/\\:*?"<>|#%&{}$!'@+`=]/g, '').replace(/\s+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').substring(0, 60)
}

export default function PdfNameModal({ defaultNumero, defaultNombreProducto, empresaNombre, contactoNombre, onConfirm, onClose }: Props) {
  const [nombreProducto, setNombreProducto] = useState(defaultNombreProducto || 'Mesa Inoxidable')
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  function handleConfirm() {
    if (!nombreProducto.trim()) return
    onConfirm(nombreProducto.trim())
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleConfirm()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
    // Stop all key events from propagating
    e.stopPropagation()
  }

  // Build preview filename
  const previewName = `Cotizacion_${defaultNumero}_${cleanFilename(nombreProducto) || '...'}`
    + (empresaNombre ? `_${cleanFilename(empresaNombre)}` : '')
    + (contactoNombre ? `_${cleanFilename(contactoNombre)}` : '')
    + '.pdf'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-overlay animate-fade-in"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white modal-card w-full max-w-2xl mx-4"
        onMouseDown={e => e.stopPropagation()}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <FileText size={20} className="text-[var(--color-accent-green)]" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Generar PDF</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Cotización {defaultNumero}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">
              Nombre del producto (aparece en el PDF y en el nombre del archivo)
            </label>
            <input
              ref={inputRef}
              type="text"
              value={nombreProducto}
              onChange={e => setNombreProducto(e.target.value)}
              onKeyDown={handleKeyDown}
              onMouseDown={e => e.stopPropagation()}
              onClick={e => e.stopPropagation()}
              className="w-full px-4 py-3 rounded-xl text-sm border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
              placeholder="Ej: Mesa Inoxidable, Campana Extractora..."
            />
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] break-all leading-relaxed">
            Archivo: <span className="font-mono text-[var(--color-text)]">{previewName}</span>
          </p>
        </div>

        <div className="px-6 py-4 border-t border-[var(--color-border)] flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-all duration-200">
            Cancelar
          </button>
          <button onClick={handleConfirm} className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200">
            <FileText size={14} /> Generar PDF
          </button>
        </div>
      </div>
    </div>
  )
}

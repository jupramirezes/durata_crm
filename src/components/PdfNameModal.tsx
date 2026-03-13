import { useState } from 'react'
import { FileText, X } from 'lucide-react'

interface Props {
  defaultNumero: string
  onConfirm: (nombreProducto: string) => void
  onClose: () => void
}

export default function PdfNameModal({ defaultNumero, onConfirm, onClose }: Props) {
  const [nombreProducto, setNombreProducto] = useState('Mesa Inoxidable')

  function handleConfirm() {
    if (!nombreProducto.trim()) return
    onConfirm(nombreProducto.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <FileText size={20} className="text-[var(--color-accent-green)]" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Generar PDF</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Cotizacion {defaultNumero}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Nombre del producto (aparece en el PDF y en el nombre del archivo)</label>
            <input
              type="text"
              value={nombreProducto}
              onChange={e => setNombreProducto(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
              placeholder="Ej: Mesa Inoxidable, Campana Extractora..."
              autoFocus
            />
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">
            Archivo: <span className="font-mono text-[var(--color-text)]">Cotizacion_{defaultNumero}_{nombreProducto || '...'}.pdf</span>
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

import { useState } from 'react'
import { FileText, X } from 'lucide-react'

const NO_INCLUYE_OPTIONS = [
  'Suministro ni instalacion de canastilla, superboard, desagues, sellado a muro, griferia, pruebas de soldadura, Chapas y /o pasadores en puertas, ningun elemento que no este especificado en la presente cotizacion.',
  'Obra civil, demolicion y cuarto para herramienta y personal, ni uniformes fuera de los institucionales de durata.',
  'Andamios, estos seran suministrados por la obra incluido su respectivo transporte vertical y horizontal hasta el punto de trabajo.',
  'Personal SISO permanente, en caso de requerirlo tiene un valor de 180.000$ por dia. +TTE',
  'El elemento cotizado corresponde a una valoracion numerica de la propuesta del cliente, los disenos, los calculos de dicho sistema y su cumplimiento con la NSR son responsabilidad directa del cliente y exonera a Durata\u00ae SAS de cualquier compromiso con estabilidad del elemento. Durata\u00ae SAS podria certificar el cumplimiento de dichos productos y/o proponer modificaciones de ser necesarias si es requerido y dicho proceso tendria un valor adicional al presentado. De requerirse memorias de calculo, pruebas de carga destructivas o no, se deberan dejar claras cuantas y en que momento, para que Durata\u00ae SAS pueda ofertar un valor por dicha actividad, en caso de ser destructiva, el cliente debe asumir valor de reposicion del dano, con valor acordado entre las partes.',
]

const SHORT_LABELS = [
  'Canastilla, superboard, desagues, griferia...',
  'Obra civil, demolicion...',
  'Andamios...',
  'Personal SISO permanente...',
  'Responsabilidad NSR / memorias de calculo...',
]

interface Props {
  defaultNumero: string
  onConfirm: (numero: string, tiempoEntrega: string, noIncluyeItems: string[]) => void
  onClose: () => void
}

export default function CotizacionModal({ defaultNumero, onConfirm, onClose }: Props) {
  const [numero, setNumero] = useState(defaultNumero)
  const [tiempoEntrega, setTiempoEntrega] = useState('25 dias habiles o a convenir')
  const [selectedNoIncluye, setSelectedNoIncluye] = useState<boolean[]>(NO_INCLUYE_OPTIONS.map(() => true))

  function toggleNoIncluye(i: number) {
    setSelectedNoIncluye(prev => {
      const copy = [...prev]
      copy[i] = !copy[i]
      return copy
    })
  }

  function handleConfirm() {
    if (!numero.trim()) return
    const items = NO_INCLUYE_OPTIONS.filter((_, i) => selectedNoIncluye[i])
    onConfirm(numero.trim(), tiempoEntrega.trim(), items)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-2xl w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <FileText size={20} className="text-[var(--color-accent-green)]" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Generar Cotizacion</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Configura los datos del PDF</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Numero cotizacion */}
          <div>
            <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Numero de cotizacion</label>
            <input type="text" value={numero} onChange={e => setNumero(e.target.value)} className="w-full px-4 py-2.5 rounded-xl text-sm font-mono" placeholder="COT-2026-001" />
          </div>

          {/* Tiempo entrega */}
          <div>
            <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Tiempo de entrega</label>
            <input type="text" value={tiempoEntrega} onChange={e => setTiempoEntrega(e.target.value)} className="w-full px-4 py-2.5 rounded-xl text-sm" placeholder="25 dias habiles o a convenir" />
          </div>

          {/* No incluye checkboxes */}
          <div>
            <label className="text-xs font-medium text-[var(--color-text-muted)] mb-2.5 block">Secciones "No incluye" que aplican</label>
            <div className="space-y-2">
              {SHORT_LABELS.map((label, i) => (
                <label key={i} className="flex items-start gap-2.5 text-sm cursor-pointer rounded-xl p-3 transition-colors hover:bg-[var(--color-surface-hover)] border border-transparent hover:border-[var(--color-border)]">
                  <input type="checkbox" checked={selectedNoIncluye[i]} onChange={() => toggleNoIncluye(i)} className="rounded mt-0.5 shrink-0" />
                  <span className="leading-snug">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--color-border)] flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-surface-hover)] transition-all duration-200">
            Cancelar
          </button>
          <button onClick={handleConfirm} className="flex items-center gap-2 bg-gradient-to-r from-[#059669] to-[#34d399] hover:opacity-90 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg shadow-emerald-500/20">
            <FileText size={14} /> Generar PDF
          </button>
        </div>
      </div>
    </div>
  )
}

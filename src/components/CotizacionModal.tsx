import { useState } from 'react'
import { FileText, X, Plus, Trash2 } from 'lucide-react'

const CONDICIONES_OPTIONS = [
  { text: 'Tiempo de entrega: __TIEMPO__, este tiempo corre a partir de la orden de compra, pago del anticipo, la firma de los planos definitivos, la validaci\u00f3n de los dise\u00f1os y los acabados solicitados.', label: 'Tiempo de entrega', hasTime: true },
  { text: 'IVA: Se cobrar\u00e1 de acuerdo a la tarifa vigente en el momento del despacho. No incluye impuestos adicionales gubernamentales, en caso de existir ser\u00e1n asumidos por el cliente y adicionados a la factura final.', label: 'IVA' },
  { text: 'Cantidades: El presupuesto puede variar de acuerdo a lo realmente Suministrado, el cual ser\u00e1 el valor final de la factura.', label: 'Cantidades' },
  { text: 'Da\u00f1os: Los da\u00f1os causados en los acabados de los elementos de Durata\u00ae por cuenta de la obra ser\u00e1n asumidos por el cliente, la recepci\u00f3n de los elementos implica responsabilidad en el cuidado de los mismos.', label: 'Da\u00f1os' },
  { text: 'Garant\u00eda: DURATA ofrece garant\u00eda de 1 A\u00d1O MATERIALES Y CORRECTO FUNCIONAMIENTO, SIEMPRE Y CUANDO SEA INSTALADO POR DURATA.', label: 'Garant\u00eda' },
]

const NO_INCLUYE_OPTIONS = [
  { text: 'Suministro ni instalaci\u00f3n de canastilla, superboard, desag\u00fces, sellado a muro, grifer\u00eda, pruebas de soldadura, Chapas y/o pasadores en puertas, ning\u00fan elemento que no est\u00e9 especificado en la presente cotizaci\u00f3n.', label: 'Canastilla, superboard, desag\u00fces...' },
  { text: 'Obra civil, demolici\u00f3n y cuarto para herramienta y personal, ni uniformes fuera de los institucionales de durata.', label: 'Obra civil, demolici\u00f3n...' },
  { text: 'Andamios, estos ser\u00e1n suministrados por la obra incluido su respectivo transporte vertical y horizontal hasta el punto de trabajo.', label: 'Andamios...' },
  { text: 'Personal SISO permanente, en caso de requerirlo tiene un valor de 180.000$ por d\u00eda. +TTE', label: 'Personal SISO permanente...' },
  { text: 'El elemento cotizado corresponde a una valoraci\u00f3n num\u00e9rica de la propuesta del cliente, los dise\u00f1os, los c\u00e1lculos de dicho sistema y su cumplimiento con la NSR son responsabilidad directa del cliente y exonera a Durata\u00ae SAS de cualquier compromiso con estabilidad del elemento. Durata\u00ae SAS podr\u00eda certificar el cumplimiento de dichos productos y/o proponer modificaciones de ser necesarias si es requerido y dicho proceso tendr\u00eda un valor adicional al presentado. De requerirse memorias de c\u00e1lculo, pruebas de carga destructivas o no, se deber\u00e1n dejar claras cuantas y en qu\u00e9 momento, para que Durata\u00ae SAS pueda ofertar un valor por dicha actividad, en caso de ser destructiva, el cliente debe asumir valor de reposici\u00f3n del da\u00f1o, con valor acordado entre las partes.', label: 'Responsabilidad NSR / memorias de c\u00e1lculo...' },
]

interface Props {
  defaultNumero: string
  onConfirm: (data: {
    numero: string
    tiempoEntrega: string
    incluyeTransporte: boolean
    condicionesItems: string[]
    noIncluyeItems: string[]
  }) => void
  onClose: () => void
}

export default function CotizacionModal({ defaultNumero, onConfirm, onClose }: Props) {
  const [numero, setNumero] = useState(defaultNumero)
  const [tiempoEntrega, setTiempoEntrega] = useState('25 d\u00edas h\u00e1biles o a convenir')
  const [incluyeTransporte, setIncluyeTransporte] = useState(true)
  const [selCondiciones, setSelCondiciones] = useState<boolean[]>(CONDICIONES_OPTIONS.map(() => true))
  const [selNoIncluye, setSelNoIncluye] = useState<boolean[]>(NO_INCLUYE_OPTIONS.map(() => true))
  const [customCondiciones, setCustomCondiciones] = useState<string[]>([])
  const [customNoIncluye, setCustomNoIncluye] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'general' | 'condiciones' | 'noincluye'>('general')

  function toggle(arr: boolean[], i: number, setter: (a: boolean[]) => void) {
    const copy = [...arr]
    copy[i] = !copy[i]
    setter(copy)
  }

  function addCustom(arr: string[], setter: (a: string[]) => void) {
    setter([...arr, ''])
  }

  function updateCustom(arr: string[], i: number, val: string, setter: (a: string[]) => void) {
    const copy = [...arr]
    copy[i] = val
    setter(copy)
  }

  function removeCustom(arr: string[], i: number, setter: (a: string[]) => void) {
    setter(arr.filter((_, idx) => idx !== i))
  }

  function handleConfirm() {
    if (!numero.trim()) return

    const condItems: string[] = []
    CONDICIONES_OPTIONS.forEach((opt, i) => {
      if (selCondiciones[i]) {
        condItems.push(opt.hasTime ? opt.text.replace('__TIEMPO__', tiempoEntrega.trim()) : opt.text)
      }
    })
    customCondiciones.forEach(c => { if (c.trim()) condItems.push(c.trim()) })

    const noIncItems: string[] = []
    NO_INCLUYE_OPTIONS.forEach((opt, i) => {
      if (selNoIncluye[i]) noIncItems.push(opt.text)
    })
    customNoIncluye.forEach(c => { if (c.trim()) noIncItems.push(c.trim()) })

    onConfirm({
      numero: numero.trim(),
      tiempoEntrega: tiempoEntrega.trim(),
      incluyeTransporte,
      condicionesItems: condItems,
      noIncluyeItems: noIncItems,
    })
  }

  const tabClass = (t: string) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === t ? 'bg-blue-500/15 text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-2xl w-full max-w-4xl mx-4" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <FileText size={20} className="text-[var(--color-accent-green)]" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Generar Cotizaci&oacute;n PDF</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Configura los datos antes de generar</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4">
          <button className={tabClass('general')} onClick={() => setActiveTab('general')}>General</button>
          <button className={tabClass('condiciones')} onClick={() => setActiveTab('condiciones')}>Condiciones</button>
          <button className={tabClass('noincluye')} onClick={() => setActiveTab('noincluye')}>No incluye</button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {activeTab === 'general' && (
            <>
              <div>
                <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">N&uacute;mero de cotizaci&oacute;n</label>
                <input type="text" value={numero} onChange={e => setNumero(e.target.value)} className="w-full px-4 py-3 rounded-xl text-base font-mono" placeholder="COT-2026-001" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">Tiempo de entrega</label>
                <input type="text" value={tiempoEntrega} onChange={e => setTiempoEntrega(e.target.value)} className="w-full px-4 py-3 rounded-xl text-base" />
              </div>
              <label className="flex items-center gap-2.5 text-sm cursor-pointer rounded-xl p-3 bg-[var(--color-bg)] border border-[var(--color-border)]">
                <input type="checkbox" checked={incluyeTransporte} onChange={e => setIncluyeTransporte(e.target.checked)} className="rounded shrink-0" />
                <span>El presupuesto incluye transporte</span>
              </label>
            </>
          )}

          {activeTab === 'condiciones' && (
            <>
              <p className="text-xs text-[var(--color-text-muted)]">Selecciona las condiciones comerciales que aplican:</p>
              <div className="space-y-1.5">
                {CONDICIONES_OPTIONS.map((opt, i) => (
                  <label key={i} className="flex items-start gap-2.5 text-sm cursor-pointer rounded-xl p-3 transition-colors hover:bg-[var(--color-surface-hover)] border border-transparent hover:border-[var(--color-border)]">
                    <input type="checkbox" checked={selCondiciones[i]} onChange={() => toggle(selCondiciones, i, setSelCondiciones)} className="rounded mt-0.5 shrink-0" />
                    <span className="leading-snug text-xs">{opt.label}</span>
                  </label>
                ))}
              </div>
              {customCondiciones.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={c} onChange={e => updateCustom(customCondiciones, i, e.target.value, setCustomCondiciones)} className="flex-1 px-4 py-2.5 rounded-xl text-sm" placeholder="Condici\u00f3n adicional..." />
                  <button onClick={() => removeCustom(customCondiciones, i, setCustomCondiciones)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={14} /></button>
                </div>
              ))}
              <button onClick={() => addCustom(customCondiciones, setCustomCondiciones)} className="flex items-center gap-1.5 text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium">
                <Plus size={14} /> Agregar condici&oacute;n personalizada
              </button>
            </>
          )}

          {activeTab === 'noincluye' && (
            <>
              <p className="text-xs text-[var(--color-text-muted)]">Selecciona las cl&aacute;usulas &quot;No incluye&quot; que aplican:</p>
              <div className="space-y-1.5">
                {NO_INCLUYE_OPTIONS.map((opt, i) => (
                  <label key={i} className="flex items-start gap-2.5 text-sm cursor-pointer rounded-xl p-3 transition-colors hover:bg-[var(--color-surface-hover)] border border-transparent hover:border-[var(--color-border)]">
                    <input type="checkbox" checked={selNoIncluye[i]} onChange={() => toggle(selNoIncluye, i, setSelNoIncluye)} className="rounded mt-0.5 shrink-0" />
                    <span className="leading-snug text-xs">{opt.label}</span>
                  </label>
                ))}
              </div>
              {customNoIncluye.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={c} onChange={e => updateCustom(customNoIncluye, i, e.target.value, setCustomNoIncluye)} className="flex-1 px-4 py-2.5 rounded-xl text-sm" placeholder="Cl\u00e1usula adicional..." />
                  <button onClick={() => removeCustom(customNoIncluye, i, setCustomNoIncluye)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={14} /></button>
                </div>
              ))}
              <button onClick={() => addCustom(customNoIncluye, setCustomNoIncluye)} className="flex items-center gap-1.5 text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium">
                <Plus size={14} /> Agregar cl&aacute;usula personalizada
              </button>
            </>
          )}
        </div>

        {/* Footer */}
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

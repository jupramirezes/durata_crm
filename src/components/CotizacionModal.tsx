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
  { text: 'Suministro ni instalaci\u00f3n de canastilla, superboard, desag\u00fces, sellado a muro, grifer\u00eda, pruebas de soldadura, Chapas y/o pasadores en puertas, ning\u00fan elemento que no est\u00e9 especificado en la presente cotizaci\u00f3n.', label: 'Canastilla, superboard, desag\u00fces' },
  { text: 'Obra civil, demolici\u00f3n y cuarto para herramienta y personal, ni uniformes fuera de los institucionales de durata.', label: 'Obra civil, demolici\u00f3n' },
  { text: 'Andamios, estos ser\u00e1n suministrados por la obra incluido su respectivo transporte vertical y horizontal hasta el punto de trabajo.', label: 'Andamios' },
  { text: 'Personal SISO permanente, en caso de requerirlo tiene un valor de 180.000$ por d\u00eda. +TTE', label: 'Personal SISO permanente' },
  { text: 'El elemento cotizado corresponde a una valoraci\u00f3n num\u00e9rica de la propuesta del cliente, los dise\u00f1os, los c\u00e1lculos de dicho sistema y su cumplimiento con la NSR son responsabilidad directa del cliente y exonera a Durata\u00ae SAS de cualquier compromiso con estabilidad del elemento.', label: 'Responsabilidad NSR / memorias de c\u00e1lculo' },
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
    const copy = [...arr]; copy[i] = !copy[i]; setter(copy)
  }
  function addCustom(arr: string[], setter: (a: string[]) => void) { setter([...arr, '']) }
  function updateCustom(arr: string[], i: number, val: string, setter: (a: string[]) => void) {
    const copy = [...arr]; copy[i] = val; setter(copy)
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center animate-fade-in"
      style={{ paddingTop: '6vh', paddingBottom: '4vh', background: 'rgba(20,24,28,0.36)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(680px, 92vw)',
          maxHeight: '90vh',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-pop)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>Generar cotización</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--color-text-label)', marginTop: 2 }}>
              {numero} · Configura datos antes de generar
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <button
            onClick={onClose}
            className="btn-d ghost icon sm"
            style={{ color: 'var(--color-text-label)' }}
          ><X size={14} /></button>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ paddingLeft: 20, paddingRight: 20, marginBottom: 0 }}>
          <button className={`tab ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>General</button>
          <button className={`tab ${activeTab === 'condiciones' ? 'active' : ''}`} onClick={() => setActiveTab('condiciones')}>
            Condiciones<span className="n">{selCondiciones.filter(Boolean).length + customCondiciones.filter(c => c.trim()).length}</span>
          </button>
          <button className={`tab ${activeTab === 'noincluye' ? 'active' : ''}`} onClick={() => setActiveTab('noincluye')}>
            No incluye<span className="n">{selNoIncluye.filter(Boolean).length + customNoIncluye.filter(c => c.trim()).length}</span>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          {activeTab === 'general' && (
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label className="mono" style={{ fontSize: 10, color: 'var(--color-text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>
                  Número de cotización
                </label>
                <input
                  type="text"
                  value={numero}
                  onChange={e => setNumero(e.target.value)}
                  className="mono"
                  style={{ width: '100%', padding: '7px 10px', fontSize: 13 }}
                  placeholder="2026-001"
                />
              </div>
              <div>
                <label className="mono" style={{ fontSize: 10, color: 'var(--color-text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>
                  Tiempo de entrega
                </label>
                <input
                  type="text"
                  value={tiempoEntrega}
                  onChange={e => setTiempoEntrega(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', fontSize: 13 }}
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: incluyeTransporte ? 'var(--color-primary-weak)' : 'var(--color-surface)', cursor: 'pointer', fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={incluyeTransporte}
                  onChange={e => setIncluyeTransporte(e.target.checked)}
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <span style={{ fontWeight: 500 }}>El presupuesto incluye transporte</span>
              </label>
            </div>
          )}

          {activeTab === 'condiciones' && (
            <div>
              <p style={{ fontSize: 12, color: 'var(--color-text-label)', marginBottom: 12 }}>
                Selecciona las condiciones comerciales que aplican:
              </p>
              <div style={{ display: 'grid', gap: 6 }}>
                {CONDICIONES_OPTIONS.map((opt, i) => (
                  <label
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '10px 12px',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      background: selCondiciones[i] ? 'var(--color-primary-weak)' : 'var(--color-surface)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selCondiciones[i]}
                      onChange={() => toggle(selCondiciones, i, setSelCondiciones)}
                      style={{ accentColor: 'var(--color-primary)', marginTop: 2 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--color-text)' }}>{opt.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-label)', marginTop: 2, lineHeight: 1.4 }}>
                        {opt.hasTime ? opt.text.replace('__TIEMPO__', tiempoEntrega) : opt.text}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {customCondiciones.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--color-text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    Personalizadas
                  </div>
                  {customCondiciones.map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                      <input
                        type="text"
                        value={c}
                        onChange={e => updateCustom(customCondiciones, i, e.target.value, setCustomCondiciones)}
                        style={{ flex: 1, padding: '6px 10px', fontSize: 12.5 }}
                        placeholder="Condición adicional…"
                      />
                      <button
                        onClick={() => removeCustom(customCondiciones, i, setCustomCondiciones)}
                        className="btn-d ghost icon sm"
                        style={{ color: 'var(--color-accent-red)' }}
                      ><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => addCustom(customCondiciones, setCustomCondiciones)}
                className="btn-d sm"
                style={{ marginTop: 12 }}
              >
                <Plus size={12} /> Agregar condición personalizada
              </button>
            </div>
          )}

          {activeTab === 'noincluye' && (
            <div>
              <p style={{ fontSize: 12, color: 'var(--color-text-label)', marginBottom: 12 }}>
                Selecciona las cláusulas "No incluye" que aplican:
              </p>
              <div style={{ display: 'grid', gap: 6 }}>
                {NO_INCLUYE_OPTIONS.map((opt, i) => (
                  <label
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '10px 12px',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      background: selNoIncluye[i] ? 'var(--color-primary-weak)' : 'var(--color-surface)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selNoIncluye[i]}
                      onChange={() => toggle(selNoIncluye, i, setSelNoIncluye)}
                      style={{ accentColor: 'var(--color-primary)', marginTop: 2 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--color-text)' }}>{opt.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-label)', marginTop: 2, lineHeight: 1.4 }}>{opt.text}</div>
                    </div>
                  </label>
                ))}
              </div>
              {customNoIncluye.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--color-text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    Personalizadas
                  </div>
                  {customNoIncluye.map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                      <input
                        type="text"
                        value={c}
                        onChange={e => updateCustom(customNoIncluye, i, e.target.value, setCustomNoIncluye)}
                        style={{ flex: 1, padding: '6px 10px', fontSize: 12.5 }}
                        placeholder="Cláusula adicional…"
                      />
                      <button
                        onClick={() => removeCustom(customNoIncluye, i, setCustomNoIncluye)}
                        className="btn-d ghost icon sm"
                        style={{ color: 'var(--color-accent-red)' }}
                      ><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => addCustom(customNoIncluye, setCustomNoIncluye)}
                className="btn-d sm"
                style={{ marginTop: 12 }}
              >
                <Plus size={12} /> Agregar cláusula personalizada
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--color-text-label)' }}>
            {selCondiciones.filter(Boolean).length + customCondiciones.filter(c => c.trim()).length} condiciones · {selNoIncluye.filter(Boolean).length + customNoIncluye.filter(c => c.trim()).length} no incluye
          </div>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} className="btn-d sm">Cancelar</button>
          <button onClick={handleConfirm} className="btn-d accent sm" disabled={!numero.trim()}>
            <FileText size={12} /> Generar PDF
          </button>
        </div>
      </div>
    </div>
  )
}

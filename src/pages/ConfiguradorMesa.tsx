import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { CONFIG_MESA_DEFAULT, ConfigMesa, ApuResultado } from '../types'
import { calcularApuMesa } from '../lib/calcular-apu'
import { formatCOP } from '../lib/utils'
import {
  ArrowLeft, Calculator, ShoppingCart, ChevronDown, ChevronRight, Check,
  Ruler, Layers, Shield, Package, Circle, Droplets, SlidersHorizontal, Settings, Minus, LayoutGrid
} from 'lucide-react'

const sectionIcons: Record<string, any> = {
  'Dimensiones principales': Ruler,
  'Material': Layers,
  'Refuerzos': Shield,
  'Salpicaderos': Minus,
  'Babero': Minus,
  'Entrepaños y soporte': LayoutGrid,
  'Pozuelos': Circle,
  'Escabiladero': Package,
  'Vertedero': Droplets,
  'Extras y parámetros comerciales': SlidersHorizontal,
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const Icon = sectionIcons[title] || Settings
  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden transition-all duration-200">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[var(--color-surface-hover)] text-sm font-semibold transition-colors duration-200">
        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-[var(--color-primary)]" />
        </div>
        <span className="flex-1 text-left">{title}</span>
        {open ? <ChevronDown size={16} className="text-[var(--color-text-muted)]" /> : <ChevronRight size={16} className="text-[var(--color-text-muted)]" />}
      </button>
      {open && <div className="px-5 pb-5 pt-2 space-y-3 border-t border-[var(--color-border)]">{children}</div>}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 block">{label}</label>{children}</div>
}

function NumInput({ value, onChange, step = 0.01, min = 0, suffix }: { value: number; onChange: (v: number) => void; step?: number; min?: number; suffix?: string }) {
  return (
    <div className="flex items-center gap-2">
      <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} step={step} min={min} className="w-full px-3 py-2.5 rounded-xl text-sm" />
      {suffix && <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap font-medium">{suffix}</span>}
    </div>
  )
}

function CostBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-[var(--color-text-muted)]">{label}</span>
        <span className="font-medium">{formatCOP(value)} <span className="text-[var(--color-text-muted)]">({pct.toFixed(0)}%)</span></span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export default function ConfiguradorMesa() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useStore()
  const cliente = state.clientes.find(c => c.id === id)
  const [cfg, setCfg] = useState<ConfigMesa>({ ...CONFIG_MESA_DEFAULT })
  const [resultado, setResultado] = useState<ApuResultado | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const [showApu, setShowApu] = useState(false)
  const [added, setAdded] = useState(false)

  const upd = (key: keyof ConfigMesa, value: any) => setCfg(c => ({ ...c, [key]: value }))

  function calcular() {
    // Ensure pozuelo_dims matches pozuelos_rect count
    const dims = [...cfg.pozuelo_dims]
    while (dims.length < cfg.pozuelos_rect) dims.push({ largo: 0.50, ancho: 0.40, alto: 0.18 })
    const cfgFinal = { ...cfg, pozuelo_dims: dims.slice(0, cfg.pozuelos_rect) }
    setCfg(cfgFinal)
    const res = calcularApuMesa(cfgFinal, state.precios)
    setResultado(res)
  }

  function agregarAlPedido() {
    if (!resultado || !id) return
    setAdded(true)
    dispatch({
      type: 'ADD_PRODUCTO',
      payload: {
        cliente_id: id,
        categoria: 'Mesas',
        subtipo: 'Mesa lisa con entrepaño',
        configuracion: cfg,
        apu_resultado: resultado,
        precio_calculado: resultado.precio_comercial,
        descripcion_comercial: resultado.descripcion_comercial,
        cantidad,
      },
    })
    setTimeout(() => navigate(`/clientes/${id}`), 1200)
  }

  function updPozDim(i: number, key: string, val: number) {
    const dims = [...cfg.pozuelo_dims]
    while (dims.length <= i) dims.push({ largo: 0.50, ancho: 0.40, alto: 0.18 })
    dims[i] = { ...dims[i], [key]: val }
    upd('pozuelo_dims', dims)
  }

  return (
    <div className="p-8 max-w-6xl animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-white mb-5 transition-colors duration-200">
        <ArrowLeft size={16} /> Volver a {cliente?.nombre || 'cliente'}
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0">
          <Settings size={24} className="text-[var(--color-accent-purple)]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Configurar: Mesa lisa con entrepano</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Cliente: {cliente?.nombre} {'\u2014'} {cliente?.empresa}</p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_400px] gap-6">
        {/* Formulario */}
        <div className="space-y-3">
          <Section title="Dimensiones principales">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Largo"><NumInput value={cfg.largo} onChange={v => upd('largo', v)} suffix="m" /></Field>
              <Field label="Ancho"><NumInput value={cfg.ancho} onChange={v => upd('ancho', v)} suffix="m" /></Field>
              <Field label="Alto"><NumInput value={cfg.alto} onChange={v => upd('alto', v)} suffix="m" /></Field>
            </div>
          </Section>

          <Section title="Material">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Tipo de acero">
                <select value={cfg.tipo_acero} onChange={e => upd('tipo_acero', e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm">
                  <option value="304">Acero 304</option>
                  <option value="430">Acero 430</option>
                </select>
              </Field>
              <Field label="Acabado">
                <select value={cfg.acabado} onChange={e => upd('acabado', e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm">
                  <option value="mate">Mate (2B)</option>
                  <option value="satinado">Satinado</option>
                  {cfg.tipo_acero === '430' && <option value="brillante">Brillante</option>}
                </select>
              </Field>
              <Field label="Calibre">
                <select value={cfg.calibre} onChange={e => upd('calibre', e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm">
                  {['cal_20','cal_18','cal_16','cal_14','cal_12','1/8','3/16','1/4','3/8'].map(c => <option key={c} value={c}>{c.replace('cal_', 'Cal ')}</option>)}
                </select>
              </Field>
            </div>
          </Section>

          <Section title="Refuerzos">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tipo de refuerzo">
                <select value={cfg.refuerzo} onChange={e => upd('refuerzo', e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm">
                  <option value="omegas">Omegas inox cal 18</option>
                  <option value="rh_15mm">RH Aglomerado 15mm</option>
                </select>
              </Field>
              {cfg.refuerzo === 'omegas' && <Field label="Ancho omegas"><NumInput value={cfg.ancho_omegas} onChange={v => upd('ancho_omegas', v)} suffix="m" /></Field>}
            </div>
          </Section>

          <Section title="Salpicaderos" defaultOpen={false}>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Longitudinales"><NumInput value={cfg.salp_long} onChange={v => upd('salp_long', v)} step={1} min={0} /></Field>
              <Field label="Laterales"><NumInput value={cfg.salp_lat} onChange={v => upd('salp_lat', v)} step={1} min={0} /></Field>
              {(cfg.salp_long > 0 || cfg.salp_lat > 0) && <Field label="Alto salpicadero"><NumInput value={cfg.alto_salp} onChange={v => upd('alto_salp', v)} suffix="m" /></Field>}
            </div>
          </Section>

          <Section title="Babero" defaultOpen={false}>
            <label className="flex items-center gap-2.5 text-sm cursor-pointer">
              <input type="checkbox" checked={cfg.babero} onChange={e => upd('babero', e.target.checked)} className="rounded" /> {'\u00BF'}Tiene babero?
            </label>
            {cfg.babero && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Field label="Alto babero"><NumInput value={cfg.alto_babero} onChange={v => upd('alto_babero', v)} suffix="m" /></Field>
                <Field label="Baberos en costados"><NumInput value={cfg.babero_costados} onChange={v => upd('babero_costados', v)} step={1} min={0} /></Field>
              </div>
            )}
          </Section>

          <Section title="Entrepaños y soporte">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Entrepanos"><NumInput value={cfg.entrepaños} onChange={v => upd('entrepaños', v)} step={1} min={0} /></Field>
              <Field label="Patas"><NumInput value={cfg.patas} onChange={v => upd('patas', v)} step={2} min={2} /></Field>
            </div>
            <label className="flex items-center gap-2.5 text-sm cursor-pointer mt-2">
              <input type="checkbox" checked={cfg.ruedas} onChange={e => { upd('ruedas', e.target.checked); if (e.target.checked) upd('cant_ruedas', cfg.patas) }} className="rounded" /> {'\u00BF'}Lleva ruedas?
            </label>
            {cfg.ruedas ? (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Field label="Tipo de rueda">
                  <select value={cfg.tipo_rueda} onChange={e => upd('tipo_rueda', e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm">
                    <option value="inox_2_freno">Inox 2" con freno</option><option value="inox_2_sin">Inox 2" sin freno</option>
                    <option value="inox_3_freno">Inox 3" con freno</option><option value="inox_3_sin">Inox 3" sin freno</option>
                    <option value="inox_4_freno">Inox 4" con freno</option><option value="inox_4_sin">Inox 4" sin freno</option>
                  </select>
                </Field>
                <Field label="Cantidad ruedas"><NumInput value={cfg.cant_ruedas} onChange={v => upd('cant_ruedas', v)} step={1} min={2} /></Field>
              </div>
            ) : (
              <div className="mt-2">
                <Field label="Tipo nivelador">
                  <select value={cfg.tipo_nivelador} onChange={e => upd('tipo_nivelador', e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm">
                    <option value="inox_cuadrado">Inox cuadrado 1 1/2"</option><option value="plastico_cuadrado">Plastico cuadrado 1 1/2"</option>
                  </select>
                </Field>
              </div>
            )}
          </Section>

          <Section title="Pozuelos" defaultOpen={false}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pozuelos rectangulares"><NumInput value={cfg.pozuelos_rect} onChange={v => upd('pozuelos_rect', v)} step={1} min={0} /></Field>
              <Field label="Pozuelos redondos (370mm)"><NumInput value={cfg.pozuelos_redondos} onChange={v => upd('pozuelos_redondos', v)} step={1} min={0} /></Field>
            </div>
            {cfg.pozuelos_rect > 0 && Array.from({ length: cfg.pozuelos_rect }).map((_, i) => (
              <div key={i} className="grid grid-cols-3 gap-3 mt-2">
                <Field label={`Pozuelo ${i + 1} - Largo`}><NumInput value={cfg.pozuelo_dims[i]?.largo ?? 0.50} onChange={v => updPozDim(i, 'largo', v)} suffix="m" /></Field>
                <Field label="Ancho"><NumInput value={cfg.pozuelo_dims[i]?.ancho ?? 0.40} onChange={v => updPozDim(i, 'ancho', v)} suffix="m" /></Field>
                <Field label="Alto"><NumInput value={cfg.pozuelo_dims[i]?.alto ?? 0.18} onChange={v => updPozDim(i, 'alto', v)} suffix="m" /></Field>
              </div>
            ))}
          </Section>

          <Section title="Escabiladero" defaultOpen={false}>
            <label className="flex items-center gap-2.5 text-sm cursor-pointer">
              <input type="checkbox" checked={cfg.escabiladero} onChange={e => upd('escabiladero', e.target.checked)} className="rounded" /> {'\u00BF'}Tiene escabiladero?
            </label>
            {cfg.escabiladero && <div className="mt-2"><Field label="Bandejeros"><NumInput value={cfg.bandejeros} onChange={v => upd('bandejeros', v)} step={1} min={1} /></Field></div>}
          </Section>

          <Section title="Vertedero" defaultOpen={false}>
            <Field label="Cantidad vertederos"><NumInput value={cfg.vertederos} onChange={v => upd('vertederos', v)} step={1} min={0} /></Field>
            {cfg.vertederos > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Field label="Diametro"><NumInput value={cfg.diam_vertedero} onChange={v => upd('diam_vertedero', v)} suffix="m" /></Field>
                <Field label="Profundidad"><NumInput value={cfg.prof_vertedero} onChange={v => upd('prof_vertedero', v)} suffix="m" /></Field>
              </div>
            )}
          </Section>

          <Section title="Extras y parámetros comerciales">
            <div className="space-y-2.5">
              <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                <input type="checkbox" checked={cfg.push_pedal} onChange={e => upd('push_pedal', e.target.checked)} className="rounded" /> Push Pedal + Grifo + Canastilla
              </label>
              <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                <input type="checkbox" checked={cfg.poliza} onChange={e => upd('poliza', e.target.checked)} className="rounded" /> Requiere poliza
              </label>
              <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                <input type="checkbox" checked={cfg.instalado} onChange={e => upd('instalado', e.target.checked)} className="rounded" /> Incluye instalacion
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Field label="Margen de utilidad"><NumInput value={cfg.margen * 100} onChange={v => upd('margen', v / 100)} step={1} suffix="%" /></Field>
              <Field label="Cantidad de mesas"><NumInput value={cantidad} onChange={setCantidad} step={1} min={1} /></Field>
            </div>
          </Section>
        </div>

        {/* Panel de resultado */}
        <div className="space-y-4 sticky top-4 self-start">
          <button onClick={calcular} className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#4f8cff] to-[#3b7aed] hover:opacity-90 text-white px-5 py-4 rounded-2xl text-base font-bold transition-all duration-200 shadow-lg shadow-blue-500/20">
            <Calculator size={20} /> CALCULAR PRECIO
          </button>

          {resultado && (
            <>
              {/* Price hero */}
              <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30" style={{ background: 'linear-gradient(135deg, #059669 0%, #34d399 100%)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-8 translate-x-8" />
                <div className="p-6 text-center relative">
                  <div className="text-xs text-white/70 uppercase tracking-widest font-semibold mb-1">Precio comercial</div>
                  <div className="text-4xl font-black text-white mb-1">{formatCOP(resultado.precio_comercial)}</div>
                  <div className="text-sm text-white/70">{'\u00D7'} {cantidad} = <span className="font-bold text-white">{formatCOP(resultado.precio_comercial * cantidad)}</span></div>
                </div>
              </div>

              {/* Cost breakdown with bars */}
              <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 space-y-3">
                <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Desglose de costos</h4>
                <CostBar label="Insumos" value={resultado.costo_insumos} total={resultado.costo_total} color="#4f8cff" />
                <CostBar label="Mano de obra" value={resultado.costo_mo} total={resultado.costo_total} color="#a78bfa" />
                <CostBar label="Transporte" value={resultado.costo_transporte} total={resultado.costo_total} color="#fb923c" />
                <CostBar label="Corte laser" value={resultado.costo_laser} total={resultado.costo_total} color="#f87171" />
                {resultado.costo_poliza > 0 && <CostBar label="Poliza" value={resultado.costo_poliza} total={resultado.costo_total} color="#fbbf24" />}

                <div className="border-t border-[var(--color-border)] pt-3 mt-3 space-y-2 text-sm">
                  <div className="flex justify-between font-medium"><span>Costo total</span><span>{formatCOP(resultado.costo_total)}</span></div>
                  <div className="flex justify-between text-[var(--color-text-muted)]"><span>Margen {(resultado.margen * 100).toFixed(0)}%</span><span>{formatCOP(resultado.precio_venta - resultado.costo_total)}</span></div>
                  <div className="flex justify-between font-bold text-base"><span>Precio venta</span><span className="text-[var(--color-accent-green)]">{formatCOP(resultado.precio_venta)}</span></div>
                </div>
              </div>

              {/* APU toggle */}
              <button onClick={() => setShowApu(!showApu)} className="w-full text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium text-center py-2 rounded-xl hover:bg-blue-500/5 transition-all duration-200">
                {showApu ? 'Ocultar' : 'Ver'} APU detallado ({resultado.lineas.length} lineas)
              </button>

              {showApu && (
                <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-4 max-h-96 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-[var(--color-text-muted)] text-left">
                        <th className="px-2 py-2 font-medium">Cant</th><th className="px-2 py-2 font-medium">Descripcion</th><th className="px-2 py-2 text-right font-medium">P.Unit</th><th className="px-2 py-2 text-right font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultado.lineas.map((l, i) => (
                        <tr key={i} className={`border-t border-[var(--color-border)] ${i % 2 === 1 ? 'bg-[var(--color-bg)]/50' : ''}`}>
                          <td className="px-2 py-2 font-mono">{l.cantidad.toFixed(2)}</td>
                          <td className="px-2 py-2 truncate max-w-40">{l.descripcion}</td>
                          <td className="px-2 py-2 text-right font-mono">{formatCOP(l.precio_unitario)}</td>
                          <td className="px-2 py-2 text-right font-mono font-medium">{formatCOP(l.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Commercial description */}
              <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 rounded-full bg-[var(--color-primary)]" />
                  <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Descripcion comercial</span>
                </div>
                <p className="text-sm leading-relaxed">{resultado.descripcion_comercial}</p>
              </div>

              {/* Add to order button with success animation */}
              <button
                onClick={agregarAlPedido}
                disabled={added}
                className={`w-full flex items-center justify-center gap-2.5 px-5 py-4 rounded-2xl text-base font-bold transition-all duration-300 shadow-lg ${
                  added
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20 scale-95'
                    : 'bg-gradient-to-r from-[#059669] to-[#34d399] hover:opacity-90 text-white shadow-emerald-500/20'
                }`}
              >
                {added ? (
                  <>
                    <div className="animate-check-pop"><Check size={22} strokeWidth={3} /></div>
                    Agregado al pedido
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} /> AGREGAR AL PEDIDO
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

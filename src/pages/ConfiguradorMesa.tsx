import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { CONFIG_MESA_DEFAULT, ConfigMesa, ApuResultado } from '../types'
import { calcularApuMesa } from '../lib/calcular-apu'
import { formatCOP } from '../lib/utils'
import { ArrowLeft, Calculator, ShoppingCart, ChevronDown, ChevronRight } from 'lucide-react'

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] text-sm font-semibold transition-colors">
        {title}
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {open && <div className="p-4 space-y-3">{children}</div>}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs text-[var(--color-text-muted)] mb-1 block">{label}</label>{children}</div>
}

function NumInput({ value, onChange, step = 0.01, min = 0, suffix }: { value: number; onChange: (v: number) => void; step?: number; min?: number; suffix?: string }) {
  return (
    <div className="flex items-center gap-2">
      <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} step={step} min={min} className="w-full px-3 py-2 rounded-lg text-sm" />
      {suffix && <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">{suffix}</span>}
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
    navigate(`/clientes/${id}`)
  }

  function updPozDim(i: number, key: string, val: number) {
    const dims = [...cfg.pozuelo_dims]
    while (dims.length <= i) dims.push({ largo: 0.50, ancho: 0.40, alto: 0.18 })
    dims[i] = { ...dims[i], [key]: val }
    upd('pozuelo_dims', dims)
  }

  return (
    <div className="p-8 max-w-6xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-white mb-4">
        <ArrowLeft size={16} /> Volver a {cliente?.nombre || 'cliente'}
      </button>
      <h2 className="text-2xl font-bold mb-1">Configurar: Mesa lisa con entrepaño</h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">Cliente: {cliente?.nombre} — {cliente?.empresa}</p>

      <div className="grid grid-cols-[1fr_380px] gap-6">
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
                <select value={cfg.tipo_acero} onChange={e => upd('tipo_acero', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm">
                  <option value="304">Acero 304</option>
                  <option value="430">Acero 430</option>
                </select>
              </Field>
              <Field label="Acabado">
                <select value={cfg.acabado} onChange={e => upd('acabado', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm">
                  <option value="mate">Mate (2B)</option>
                  <option value="satinado">Satinado</option>
                  {cfg.tipo_acero === '430' && <option value="brillante">Brillante</option>}
                </select>
              </Field>
              <Field label="Calibre">
                <select value={cfg.calibre} onChange={e => upd('calibre', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm">
                  {['cal_20','cal_18','cal_16','cal_14','cal_12','1/8','3/16','1/4','3/8'].map(c => <option key={c} value={c}>{c.replace('cal_', 'Cal ')}</option>)}
                </select>
              </Field>
            </div>
          </Section>

          <Section title="Refuerzos">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tipo de refuerzo">
                <select value={cfg.refuerzo} onChange={e => upd('refuerzo', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm">
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
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={cfg.babero} onChange={e => upd('babero', e.target.checked)} className="rounded" /> ¿Tiene babero?
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
              <Field label="Entrepaños"><NumInput value={cfg.entrepaños} onChange={v => upd('entrepaños', v)} step={1} min={0} /></Field>
              <Field label="Patas"><NumInput value={cfg.patas} onChange={v => upd('patas', v)} step={2} min={2} /></Field>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer mt-2">
              <input type="checkbox" checked={cfg.ruedas} onChange={e => { upd('ruedas', e.target.checked); if (e.target.checked) upd('cant_ruedas', cfg.patas) }} className="rounded" /> ¿Lleva ruedas?
            </label>
            {cfg.ruedas ? (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Field label="Tipo de rueda">
                  <select value={cfg.tipo_rueda} onChange={e => upd('tipo_rueda', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm">
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
                  <select value={cfg.tipo_nivelador} onChange={e => upd('tipo_nivelador', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm">
                    <option value="inox_cuadrado">Inox cuadrado 1 1/2"</option><option value="plastico_cuadrado">Plástico cuadrado 1 1/2"</option>
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
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={cfg.escabiladero} onChange={e => upd('escabiladero', e.target.checked)} className="rounded" /> ¿Tiene escabiladero?
            </label>
            {cfg.escabiladero && <div className="mt-2"><Field label="Bandejeros"><NumInput value={cfg.bandejeros} onChange={v => upd('bandejeros', v)} step={1} min={1} /></Field></div>}
          </Section>

          <Section title="Vertedero" defaultOpen={false}>
            <Field label="Cantidad vertederos"><NumInput value={cfg.vertederos} onChange={v => upd('vertederos', v)} step={1} min={0} /></Field>
            {cfg.vertederos > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Field label="Diámetro"><NumInput value={cfg.diam_vertedero} onChange={v => upd('diam_vertedero', v)} suffix="m" /></Field>
                <Field label="Profundidad"><NumInput value={cfg.prof_vertedero} onChange={v => upd('prof_vertedero', v)} suffix="m" /></Field>
              </div>
            )}
          </Section>

          <Section title="Extras y parámetros comerciales">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={cfg.push_pedal} onChange={e => upd('push_pedal', e.target.checked)} className="rounded" /> Push Pedal + Grifo + Canastilla
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={cfg.poliza} onChange={e => upd('poliza', e.target.checked)} className="rounded" /> Requiere póliza
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={cfg.instalado} onChange={e => upd('instalado', e.target.checked)} className="rounded" /> Incluye instalación
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
          <button onClick={calcular} className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors">
            <Calculator size={18} /> CALCULAR PRECIO
          </button>

          {resultado && (
            <>
              <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5 space-y-4">
                <div className="text-center">
                  <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide">Precio comercial</div>
                  <div className="text-3xl font-bold text-[var(--color-accent-green)]">{formatCOP(resultado.precio_comercial)}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">× {cantidad} = {formatCOP(resultado.precio_comercial * cantidad)}</div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Insumos</span><span>{formatCOP(resultado.costo_insumos)}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Mano de obra</span><span>{formatCOP(resultado.costo_mo)}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Transporte</span><span>{formatCOP(resultado.costo_transporte)}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Corte láser</span><span>{formatCOP(resultado.costo_laser)}</span></div>
                  {resultado.costo_poliza > 0 && <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Póliza</span><span>{formatCOP(resultado.costo_poliza)}</span></div>}
                  <div className="border-t border-[var(--color-border)] pt-2 flex justify-between font-medium"><span>Costo total</span><span>{formatCOP(resultado.costo_total)}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Margen {(resultado.margen * 100).toFixed(0)}%</span><span>{formatCOP(resultado.precio_venta - resultado.costo_total)}</span></div>
                  <div className="flex justify-between font-bold text-base"><span>Precio venta</span><span>{formatCOP(resultado.precio_venta)}</span></div>
                </div>
              </div>

              <button onClick={() => setShowApu(!showApu)} className="w-full text-sm text-[var(--color-primary)] hover:underline text-center">
                {showApu ? 'Ocultar' : 'Ver'} APU detallado ({resultado.lineas.length} líneas)
              </button>

              {showApu && (
                <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-3 max-h-96 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-[var(--color-text-muted)] text-left">
                        <th className="p-1">Cant</th><th className="p-1">Descripción</th><th className="p-1 text-right">P.Unit</th><th className="p-1 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultado.lineas.map((l, i) => (
                        <tr key={i} className="border-t border-[var(--color-border)]">
                          <td className="p-1">{l.cantidad.toFixed(2)}</td>
                          <td className="p-1 truncate max-w-40">{l.descripcion}</td>
                          <td className="p-1 text-right">{formatCOP(l.precio_unitario)}</td>
                          <td className="p-1 text-right font-medium">{formatCOP(l.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
                <div className="text-xs text-[var(--color-text-muted)] mb-2">Descripción comercial</div>
                <p className="text-xs leading-relaxed">{resultado.descripcion_comercial}</p>
              </div>

              <button onClick={agregarAlPedido} className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent-green)] hover:opacity-90 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors">
                <ShoppingCart size={18} /> AGREGAR AL PEDIDO
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

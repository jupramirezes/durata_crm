import { useState, useEffect, useRef, Suspense, lazy } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import { CONFIG_MESA_DEFAULT, ConfigMesa, ApuResultado, ApuLinea } from '../types'
import { calcularApuMesa } from '../lib/calcular-apu'
import { calcularApuGenerico, preloadProductData, isMotorGenericoReady } from '../lib/motor-generico'

/** Feature flag: set to true to use data-driven formula engine instead of hardcoded calcularApuMesa */
const USE_MOTOR_GENERICO = false
import { formatCOP } from '../lib/utils'
import { exportApuExcel as exportApuExcelFn } from '../lib/exportar-apu'
import type { Mesa3DViewerRef } from '../components/Mesa3DViewer'
import {
  ArrowLeft, ShoppingCart, ChevronDown, ChevronRight, Check,
  Ruler, Layers, Shield, Package, Circle, Droplets, SlidersHorizontal, Settings, Minus, LayoutGrid,
  Wrench, Truck, AlertCircle, Edit3, Download
} from 'lucide-react'

const Mesa3DViewer = lazy(() => import('../components/Mesa3DViewer'))

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
  'Extras y parametros comerciales': SlidersHorizontal,
  'Mano de obra': Wrench,
  'Transporte': Truck,
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const Icon = sectionIcons[title] || Settings
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden transition-all duration-200">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[var(--color-surface)] text-sm font-semibold transition-colors duration-200">
        <div className="w-8 h-8 rounded-xl bg-cyan-50 flex items-center justify-center shrink-0">
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

function NumInput({ value, onChange, step = 0.01, min = 0, max, suffix, error }: { value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number; suffix?: string; error?: string }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} step={step} min={min} max={max} className={`w-full px-3 py-2.5 rounded-xl text-sm ${error ? 'border-red-400 ring-1 ring-red-200' : ''}`} />
        {suffix && <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap font-medium">{suffix}</span>}
      </div>
      {error && <p className="text-[10px] text-red-500 mt-0.5">{error}</p>}
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

function MOField({ label, suggested, value, onChange }: { label: string; suggested: number; value: number | null; onChange: (v: number | null) => void }) {
  const actual = value ?? suggested
  const isOverridden = value !== null
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-xs text-[var(--color-text)] flex-1">{label}</span>
      <span className="text-[10px] text-[var(--color-text-muted)] italic whitespace-nowrap">Sug: {formatCOP(suggested)}</span>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          value={actual}
          onChange={e => onChange(Number(e.target.value))}
          className={`w-28 px-2 py-1.5 rounded-lg text-xs text-right border ${isOverridden ? 'border-amber-300 bg-amber-50' : 'border-[var(--color-border)] bg-white'}`}
        />
        {isOverridden && (
          <button onClick={() => onChange(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-0.5" title="Restaurar sugerido">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
        )}
      </div>
    </div>
  )
}

// Editable APU line row
function fmtCant(n: number, unidad: string): string {
  const u = (unidad || '').toLowerCase()
  if (u === 'und' || u === 'un') return Math.round(n).toString()
  return n.toFixed(2)
}

function ApuLineRow({ linea, onChange }: { linea: ApuLinea; onChange: (updated: ApuLinea) => void }) {
  return (
    <tr className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface)]">
      <td className="px-2 py-1.5">
        <input type="number" value={fmtCant(linea.cantidad, linea.unidad)} onChange={e => onChange({ ...linea, cantidad: Number(e.target.value), total: Number(e.target.value) * linea.precio_unitario * (1 + linea.desperdicio) })} step="0.01" className="w-16 px-1 py-1 rounded text-xs text-right border border-[var(--color-border)] focus:ring-1 focus:ring-[var(--color-primary)]/30" />
      </td>
      <td className="px-2 py-1.5 text-xs min-w-[200px] whitespace-normal break-words" title={linea.descripcion}>
        {linea.descripcion}
        {linea.unidad && <span className="text-[9px] text-[var(--color-text-muted)] ml-1">{linea.unidad}</span>}
      </td>
      <td className="px-2 py-1.5">
        <input type="number" value={Math.round(linea.precio_unitario)} onChange={e => onChange({ ...linea, precio_unitario: Number(e.target.value), total: linea.cantidad * Number(e.target.value) * (1 + linea.desperdicio) })} step="100" className="w-24 px-1 py-1 rounded text-xs text-right border border-[var(--color-border)] focus:ring-1 focus:ring-[var(--color-primary)]/30" />
      </td>
      <td className="px-2 py-1.5 text-right font-mono text-xs font-medium">{formatCOP(Math.round(linea.total))}</td>
    </tr>
  )
}

// Editable extra cost line (MO, transporte, laser, push pedal, poliza)
function ExtraCostRow({ label, cantidad, precioUnit, onCantidadChange, onPrecioChange }: {
  label: string; cantidad: number; precioUnit: number; onCantidadChange: (v: number) => void; onPrecioChange: (v: number) => void
}) {
  return (
    <tr className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface)]">
      <td className="px-2 py-1.5">
        <input type="number" value={cantidad} onChange={e => onCantidadChange(Number(e.target.value))} step="0.01" className="w-16 px-1 py-1 rounded text-xs text-right border border-[var(--color-border)] focus:ring-1 focus:ring-[var(--color-primary)]/30" />
      </td>
      <td className="px-2 py-1.5 text-xs truncate max-w-36" title={label}>{label}</td>
      <td className="px-2 py-1.5">
        <input type="number" value={precioUnit} onChange={e => onPrecioChange(Number(e.target.value))} step="100" className="w-24 px-1 py-1 rounded text-xs text-right border border-[var(--color-border)] focus:ring-1 focus:ring-[var(--color-primary)]/30" />
      </td>
      <td className="px-2 py-1.5 text-right font-mono text-xs font-medium">{formatCOP(cantidad * precioUnit)}</td>
    </tr>
  )
}

interface MOLineOverride {
  cantidad: number | null
  precio: number | null
}

interface MOOverrides {
  acero: number | null
  pulido: number | null
  patas: number | null
  instalacion: number | null
}

interface MOOverridesV2 {
  acero: MOLineOverride
  pulido: MOLineOverride
  patas: MOLineOverride
  instalacion: MOLineOverride
}

interface TransporteOverridesV2 {
  elementos: MOLineOverride
  personal: MOLineOverride
  descripcion: string
}

interface TransporteOverrides {
  elementos: number | null
  personal: number | null
  descripcion: string
}

interface ExtraCostOverride {
  cantidad: number | null
  precio: number | null
}

export default function ConfiguradorMesa() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const editProductoId = searchParams.get('editar')
  const navigate = useNavigate()
  const { state, dispatch } = useStore()
  const oportunidad = state.oportunidades.find(o => o.id === id)
  const empresa = oportunidad ? state.empresas.find(e => e.id === oportunidad.empresa_id) : null

  // If editing, load existing product config
  const productoExistente = editProductoId ? state.productos.find(p => p.id === editProductoId) : null

  const viewer3DRef = useRef<Mesa3DViewerRef>(null)
  const [cfg, setCfg] = useState<ConfigMesa>(productoExistente?.configuracion ? { ...productoExistente.configuracion } : { ...CONFIG_MESA_DEFAULT })
  const [resultado, setResultado] = useState<ApuResultado | null>(null)
  const [cantidad, setCantidad] = useState(productoExistente?.cantidad || 1)
  const [showApu, setShowApu] = useState(true)
  const [added, setAdded] = useState(false)
  const [toast, setToast] = useState(false)

  // Preload motor genérico data (fire once)
  const [motorReady, setMotorReady] = useState(false)
  useEffect(() => {
    if (USE_MOTOR_GENERICO) {
      preloadProductData('mesa').then(ok => setMotorReady(ok))
    }
  }, [])
  const [descripcionEdit, setDescripcionEdit] = useState(productoExistente?.descripcion_comercial || '')
  const [descOverridden, setDescOverridden] = useState(!!productoExistente?.descripcion_comercial)

  // APU line overrides
  const [lineaOverrides, setLineaOverrides] = useState<Record<number, Partial<ApuLinea>>>({})
  // Custom extra lines added by user
  const [customLineas, setCustomLineas] = useState<ApuLinea[]>([])

  // MO overrides (v2: separate qty and price)
  const [moOverrides, setMoOverrides] = useState<MOOverrides>({ acero: null, pulido: null, patas: null, instalacion: null })
  const [moV2, setMoV2] = useState<MOOverridesV2>({
    acero: { cantidad: null, precio: null },
    pulido: { cantidad: null, precio: null },
    patas: { cantidad: null, precio: null },
    instalacion: { cantidad: null, precio: null },
  })
  // Transporte overrides (v2: separate qty and price)
  const [transporteOverrides, setTransporteOverrides] = useState<TransporteOverrides>({ elementos: null, personal: null, descripcion: '' })
  const [transV2, setTransV2] = useState<TransporteOverridesV2>({
    elementos: { cantidad: null, precio: null },
    personal: { cantidad: null, precio: null },
    descripcion: '',
  })
  // Extra cost overrides (laser, push pedal, poliza)
  const [laserOverride, setLaserOverride] = useState<ExtraCostOverride>({ cantidad: null, precio: null })
  const [pushPedalOverride, setPushPedalOverride] = useState<ExtraCostOverride>({ cantidad: null, precio: null })
  const [polizaOverride, setPolizaOverride] = useState<ExtraCostOverride>({ cantidad: null, precio: null })

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const upd = (key: keyof ConfigMesa, value: any) => setCfg(c => ({ ...c, [key]: value }))

  // Suggested MO values — must match Excel APU formula B46
  // B46 = L + poz_rect + poz_red + entrepaños*L + IF(escab, W*2, 0)
  const mlMO = cfg.largo + cfg.pozuelos_rect + cfg.pozuelos_redondos + cfg.entrepaños * cfg.largo + (cfg.escabiladero ? cfg.ancho * 2 : 0)
  const sugMoAcero = Math.round(mlMO * 30000)
  const sugMoPulido = Math.round(mlMO * 23000)
  const sugMoPatas = cfg.patas * 10000
  const sugMoInstalacion = cfg.instalado ? Math.round(cfg.largo * 22200) : 0

  // MO qty × price (v2)
  const moQtyAcero = moV2.acero.cantidad ?? parseFloat(mlMO.toFixed(2))
  const moPriceAcero = moV2.acero.precio ?? 30000
  const moQtyPulido = moV2.pulido.cantidad ?? parseFloat(mlMO.toFixed(2))
  const moPricePulido = moV2.pulido.precio ?? 23000
  const moQtyPatas = moV2.patas.cantidad ?? cfg.patas
  const moPricePatas = moV2.patas.precio ?? 10000
  const moQtyInstalacion = moV2.instalacion.cantidad ?? parseFloat(cfg.largo.toFixed(2))
  const moPriceInstalacion = moV2.instalacion.precio ?? 22200

  // Suggested transporte values — Excel: IF(L<1,1,L) * price
  const tteUnidades = cfg.largo < 1 ? 1 : cfg.largo
  const sugTransElementos = Math.round(tteUnidades * 15000)
  const sugTransPersonal = Math.round(tteUnidades * 5000)

  // Transport qty × price (v2)
  const transQtyElementos = transV2.elementos.cantidad ?? parseFloat(tteUnidades.toFixed(2))
  const transPriceElementos = transV2.elementos.precio ?? 15000
  const transQtyPersonal = transV2.personal.cantidad ?? parseFloat(tteUnidades.toFixed(2))
  const transPricePersonal = transV2.personal.precio ?? 5000

  // Actual MO and transport values (override or suggested)
  const actualMoAcero = moOverrides.acero ?? Math.round(moQtyAcero * moPriceAcero)
  const actualMoPulido = moOverrides.pulido ?? Math.round(moQtyPulido * moPricePulido)
  const actualMoPatas = moOverrides.patas ?? Math.round(moQtyPatas * moPricePatas)
  const actualMoInstalacion = moOverrides.instalacion ?? (cfg.instalado ? Math.round(moQtyInstalacion * moPriceInstalacion) : 0)
  const totalMoOverride = actualMoAcero + actualMoPulido + actualMoPatas + actualMoInstalacion

  const actualTransElementos = transporteOverrides.elementos ?? Math.round(transQtyElementos * transPriceElementos)
  const actualTransPersonal = transporteOverrides.personal ?? Math.round(transQtyPersonal * transPricePersonal)
  const totalTransOverride = actualTransElementos + actualTransPersonal

  // Laser: suggested from APU result, override from state
  const sugLaserMinutos = resultado ? Math.round(resultado.costo_laser / 6500) : 0
  const sugLaserPrecio = 6500
  const actualLaserCant = laserOverride.cantidad ?? sugLaserMinutos
  const actualLaserPrecio = laserOverride.precio ?? sugLaserPrecio
  const totalLaserOverride = actualLaserCant * actualLaserPrecio

  // Push pedal
  const sugPushPedalPrecio = Math.round((348000 + 74000 + 24000) / (1 - 0.20))
  const actualPushCant = pushPedalOverride.cantidad ?? 1
  const actualPushPrecio = pushPedalOverride.precio ?? sugPushPedalPrecio
  const totalPushOverride = cfg.push_pedal ? actualPushCant * actualPushPrecio : 0

  // Poliza
  const sugPolizaPrecio = resultado ? Math.round(resultado.costo_poliza) : 0
  const actualPolizaCant = polizaOverride.cantidad ?? 1
  const actualPolizaPrecio = polizaOverride.precio ?? sugPolizaPrecio
  const totalPolizaOverride = cfg.poliza ? actualPolizaCant * actualPolizaPrecio : 0

  // Auto-calculate APU with 500ms debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (cfg.largo <= 0 || cfg.ancho <= 0 || cfg.alto <= 0) {
        setResultado(null)
        return
      }
      const dims = [...cfg.pozuelo_dims]
      while (dims.length < cfg.pozuelos_rect) dims.push({ largo: 0.50, ancho: 0.40, alto: 0.18 })
      const cfgFinal = { ...cfg, pozuelo_dims: dims.slice(0, cfg.pozuelos_rect) }
      // Feature flag: use generic engine or legacy
      let res: ApuResultado | null
      if (USE_MOTOR_GENERICO && motorReady && isMotorGenericoReady('mesa')) {
        res = calcularApuGenerico(cfgFinal, state.precios)
        if (!res) res = calcularApuMesa(cfgFinal, state.precios) // fallback
      } else {
        res = calcularApuMesa(cfgFinal, state.precios)
      }
      setResultado(res)
      setLineaOverrides({})
      if (!descOverridden) {
        setDescripcionEdit(res.descripcion_comercial)
      }
    }, 500)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [cfg, state.precios, motorReady])

  // Compute adjusted resultado with overrides
  const adjustedResultado = resultado ? (() => {
    // Apply line overrides
    const adjustedLineas = resultado.lineas.map((l, i) => {
      if (lineaOverrides[i]) {
        const o = lineaOverrides[i]
        const cant = o.cantidad ?? l.cantidad
        const pu = o.precio_unitario ?? l.precio_unitario
        return { ...l, cantidad: cant, precio_unitario: pu, total: cant * pu * (1 + l.desperdicio) }
      }
      return l
    })
    const costoInsumosAdj = adjustedLineas.reduce((s, l) => s + l.total, 0) + customLineas.reduce((s, l) => s + l.total, 0)

    const moOriginal = resultado.costo_mo
    const transOriginal = resultado.costo_transporte
    const laserOriginal = resultado.costo_laser
    const polizaOriginal = resultado.costo_poliza
    const moDiff = totalMoOverride - moOriginal
    const transDiff = totalTransOverride - transOriginal
    const laserDiff = totalLaserOverride - laserOriginal
    const polizaDiff = totalPolizaOverride - polizaOriginal
    const insDiff = costoInsumosAdj - resultado.costo_insumos
    const newCostoTotal = resultado.costo_total + moDiff + transDiff + laserDiff + polizaDiff + insDiff
    const newPrecioVenta = Math.round(newCostoTotal / (1 - resultado.margen))
    const newPrecioComercial = Math.ceil(newPrecioVenta / 1000) * 1000 + totalPushOverride
    return {
      ...resultado,
      lineas: adjustedLineas,
      costo_insumos: costoInsumosAdj,
      costo_mo: totalMoOverride,
      costo_transporte: totalTransOverride,
      costo_laser: totalLaserOverride,
      costo_poliza: totalPolizaOverride,
      costo_total: newCostoTotal,
      precio_venta: newPrecioVenta,
      precio_comercial: newPrecioComercial,
    }
  })() : null

  function handleLineaChange(index: number, updated: ApuLinea) {
    setLineaOverrides(prev => ({
      ...prev,
      [index]: { cantidad: updated.cantidad, precio_unitario: updated.precio_unitario },
    }))
  }

  function agregarAlPedido() {
    if (!adjustedResultado || !id) return
    setAdded(true)
    setToast(true)

    // Capture 3D render as PNG
    const imagenRender = viewer3DRef.current?.capturarPNG() || null

    if (editProductoId && productoExistente) {
      // Update existing product
      dispatch({
        type: 'UPDATE_PRODUCTO',
        payload: {
          id: editProductoId,
          configuracion: cfg,
          apu_resultado: adjustedResultado,
          precio_calculado: adjustedResultado.precio_comercial,
          descripcion_comercial: descripcionEdit || adjustedResultado.descripcion_comercial,
          cantidad,
          imagen_render: imagenRender,
        },
      })
    } else {
      // Add new product
      dispatch({
        type: 'ADD_PRODUCTO',
        payload: {
          oportunidad_id: id,
          categoria: 'Mesas',
          subtipo: 'Mesa',
          configuracion: cfg,
          apu_resultado: adjustedResultado,
          precio_calculado: adjustedResultado.precio_comercial,
          descripcion_comercial: descripcionEdit || adjustedResultado.descripcion_comercial,
          cantidad,
          imagen_render: imagenRender,
        },
      })
    }
    setTimeout(() => setToast(false), 3000)
    setTimeout(() => navigate(`/oportunidades/${id}`), 1500)
  }

  function updPozDim(i: number, key: string, val: number) {
    const dims = [...cfg.pozuelo_dims]
    while (dims.length <= i) dims.push({ largo: 0.50, ancho: 0.40, alto: 0.18 })
    dims[i] = { ...dims[i], [key]: val }
    upd('pozuelo_dims', dims)
  }

  const needsDimensions = cfg.largo <= 0 || cfg.ancho <= 0 || cfg.alto <= 0

  // Validations
  const dimErrors = {
    largo: cfg.largo < 0.3 ? 'Mín: 0.3m' : cfg.largo > 5 ? 'Máx: 5m' : '',
    ancho: cfg.ancho < 0.3 ? 'Mín: 0.3m' : cfg.ancho > 2 ? 'Máx: 2m' : '',
    alto: cfg.alto < 0.5 ? 'Mín: 0.5m' : cfg.alto > 1.5 ? 'Máx: 1.5m' : '',
  }
  const hasValidationErrors = Object.values(dimErrors).some(e => e !== '')

  function handlePreviewApuExcel() {
    if (!adjustedResultado) return
    exportApuExcelFn({ resultado: adjustedResultado, config: cfg, preview: true })
  }

  return (
    <div className="p-8 max-w-6xl animate-fade-in relative">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in">
          <Check size={18} strokeWidth={3} />
          <span className="text-sm font-semibold">{editProductoId ? 'Producto actualizado' : 'Producto agregado al pedido'}</span>
        </div>
      )}

      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] mb-5 transition-colors duration-200">
        <ArrowLeft size={16} /> Volver a {empresa?.nombre || 'oportunidad'}
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0">
          {editProductoId ? <Edit3 size={24} className="text-amber-600" /> : <Settings size={24} className="text-[var(--color-accent-purple)]" />}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{editProductoId ? 'Editar: Mesa' : 'Configurar: Mesa'}</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Empresa: {empresa?.nombre}</p>
        </div>
      </div>

      {/* ── 3D Viewer ── */}
      <div className="mb-6 rounded-xl overflow-hidden border border-[var(--color-border)]" style={{ height: 420 }}>
        <Suspense fallback={<div className="flex items-center justify-center h-full bg-[#0f1520] text-[#64748b] text-sm">Cargando visualización 3D...</div>}>
          <Mesa3DViewer ref={viewer3DRef} config={cfg} />
        </Suspense>
      </div>

      <div className="grid grid-cols-[1fr_400px] gap-6">
        {/* Formulario */}
        <div className="space-y-3">
          <Section title="Dimensiones principales">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Largo (0.3–5m)"><NumInput value={cfg.largo} onChange={v => upd('largo', v)} min={0} max={5} suffix="m" error={dimErrors.largo} /></Field>
              <Field label="Ancho (0.3–2m)"><NumInput value={cfg.ancho} onChange={v => upd('ancho', v)} min={0} max={2} suffix="m" error={dimErrors.ancho} /></Field>
              <Field label="Alto (0.5–1.5m)"><NumInput value={cfg.alto} onChange={v => upd('alto', v)} min={0} max={1.5} suffix="m" error={dimErrors.alto} /></Field>
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
              <input type="checkbox" checked={cfg.babero} onChange={e => upd('babero', e.target.checked)} className="rounded" /> Tiene babero?
            </label>
            {cfg.babero && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Field label="Alto babero"><NumInput value={cfg.alto_babero} onChange={v => upd('alto_babero', v)} suffix="m" /></Field>
                <Field label="Baberos en costados"><NumInput value={cfg.babero_costados} onChange={v => upd('babero_costados', v)} step={1} min={0} /></Field>
              </div>
            )}
          </Section>

          <Section title={"Entrepaños y soporte"}>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Entrepaños"><NumInput value={cfg.entrepaños} onChange={v => upd('entrepaños', v)} step={1} min={0} /></Field>
              <Field label="Patas"><NumInput value={cfg.patas} onChange={v => upd('patas', v)} step={2} min={2} /></Field>
            </div>
            <label className="flex items-center gap-2.5 text-sm cursor-pointer mt-2">
              <input type="checkbox" checked={cfg.ruedas} onChange={e => { upd('ruedas', e.target.checked); if (e.target.checked) upd('cant_ruedas', cfg.patas) }} className="rounded" /> Lleva ruedas?
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
              <input type="checkbox" checked={cfg.escabiladero} onChange={e => upd('escabiladero', e.target.checked)} className="rounded" /> Tiene escabiladero?
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

          <Section title={"Extras y parametros comerciales"}>
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

          {/* MO Section */}
          <Section title="Mano de obra" defaultOpen={false}>
            <p className="text-[10px] text-[var(--color-text-muted)] mb-2">Valores sugeridos basados en la configuracion. Edita para ajustar.</p>
            <div className="divide-y divide-[var(--color-border)]">
              <MOField label="MO Acero (metros lineales)" suggested={sugMoAcero} value={moOverrides.acero} onChange={v => setMoOverrides(p => ({ ...p, acero: v }))} />
              <MOField label="MO Pulido (metros lineales)" suggested={sugMoPulido} value={moOverrides.pulido} onChange={v => setMoOverrides(p => ({ ...p, pulido: v }))} />
              <MOField label="MO Patas" suggested={sugMoPatas} value={moOverrides.patas} onChange={v => setMoOverrides(p => ({ ...p, patas: v }))} />
              {cfg.instalado && <MOField label="MO Instalacion" suggested={sugMoInstalacion} value={moOverrides.instalacion} onChange={v => setMoOverrides(p => ({ ...p, instalacion: v }))} />}
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-[var(--color-border)]">
              <span className="text-xs font-semibold text-[var(--color-text)]">Total MO</span>
              <span className="text-sm font-bold text-[var(--color-text)]">{formatCOP(totalMoOverride)}</span>
            </div>
          </Section>

          {/* Transporte Section */}
          <Section title="Transporte" defaultOpen={false}>
            <p className="text-[10px] text-[var(--color-text-muted)] mb-2">Costos de transporte. Edita para ajustar.</p>
            <div className="divide-y divide-[var(--color-border)]">
              <MOField label="Transporte elementos" suggested={sugTransElementos} value={transporteOverrides.elementos} onChange={v => setTransporteOverrides(p => ({ ...p, elementos: v }))} />
              <MOField label="Transporte personal" suggested={sugTransPersonal} value={transporteOverrides.personal} onChange={v => setTransporteOverrides(p => ({ ...p, personal: v }))} />
            </div>
            <div className="mt-3">
              <Field label="Descripcion transporte">
                <input
                  type="text"
                  value={transporteOverrides.descripcion}
                  onChange={e => setTransporteOverrides(p => ({ ...p, descripcion: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-xs"
                  placeholder="Ej: Transporte Medellin - Bogota..."
                />
              </Field>
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-[var(--color-border)]">
              <span className="text-xs font-semibold text-[var(--color-text)]">Total Transporte</span>
              <span className="text-sm font-bold text-[var(--color-text)]">{formatCOP(totalTransOverride)}</span>
            </div>
          </Section>
        </div>

        {/* Panel de resultado */}
        <div className="space-y-4 sticky top-4 self-start">
          {needsDimensions ? (
            <div className="bg-white rounded-2xl border border-[var(--color-border)] p-8 text-center">
              <AlertCircle size={32} className="text-[var(--color-border)] mx-auto mb-3" />
              <p className="text-sm text-[var(--color-text-muted)] font-medium">Completa las dimensiones</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Ingresa largo, ancho y alto para ver el precio en tiempo real.</p>
            </div>
          ) : !adjustedResultado ? (
            <div className="bg-white rounded-2xl border border-[var(--color-border)] p-8 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm text-[var(--color-text-muted)]">Calculando...</p>
            </div>
          ) : (
            <>
              {/* Price hero */}
              <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30" style={{ background: 'linear-gradient(135deg, #059669 0%, #34d399 100%)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-8 translate-x-8" />
                <div className="p-6 text-center relative">
                  <div className="text-xs text-white/70 uppercase tracking-widest font-semibold mb-1">Precio comercial</div>
                  <div className="text-4xl font-black text-white mb-1">{formatCOP(adjustedResultado.precio_comercial)}</div>
                  <div className="text-sm text-white/70">{'\u00D7'} {cantidad} = <span className="font-bold text-white">{formatCOP(adjustedResultado.precio_comercial * cantidad)}</span></div>
                </div>
              </div>

              {/* Margin control - prominent card */}
              <div className="bg-emerald-50 rounded-2xl border-2 border-emerald-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Margen comercial</h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={15} max={60} step={1}
                      value={Math.round(cfg.margen * 100)}
                      onChange={e => {
                        const v = Math.max(15, Math.min(60, Number(e.target.value) || 15))
                        upd('margen', v / 100)
                      }}
                      className="w-[60px] text-center text-lg font-extrabold text-emerald-700 bg-white border border-emerald-300 rounded-lg px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                    />
                    <span className="text-2xl font-extrabold text-emerald-700">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={15} max={60} step={1}
                  value={cfg.margen * 100}
                  onChange={e => upd('margen', Number(e.target.value) / 100)}
                  className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between mt-3 text-xs">
                  <span className="text-emerald-600">Costo: <strong className="font-mono">{formatCOP(adjustedResultado.costo_total)}</strong></span>
                  <span className="text-emerald-800 font-semibold">Precio venta: <strong className="font-mono text-sm">{formatCOP(adjustedResultado.precio_comercial)}</strong></span>
                </div>
              </div>

              {/* Cost breakdown with bars */}
              <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 space-y-3">
                <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Desglose de costos</h4>
                <CostBar label="Insumos" value={adjustedResultado.costo_insumos} total={adjustedResultado.costo_total} color="#4f8cff" />
                <CostBar label="Mano de obra" value={adjustedResultado.costo_mo} total={adjustedResultado.costo_total} color="#a78bfa" />
                <CostBar label="Transporte" value={adjustedResultado.costo_transporte} total={adjustedResultado.costo_total} color="#fb923c" />
                <CostBar label="Corte laser" value={adjustedResultado.costo_laser} total={adjustedResultado.costo_total} color="#f87171" />
                {adjustedResultado.costo_poliza > 0 && <CostBar label="Poliza" value={adjustedResultado.costo_poliza} total={adjustedResultado.costo_total} color="#fbbf24" />}

                <div className="border-t border-[var(--color-border)] pt-3 mt-3 space-y-2 text-sm">
                  <div className="flex justify-between font-medium"><span>Costo total</span><span>{formatCOP(adjustedResultado.costo_total)}</span></div>
                  <div className="flex justify-between text-[var(--color-text-muted)]"><span>Margen {(adjustedResultado.margen * 100).toFixed(0)}%</span><span>{formatCOP(adjustedResultado.precio_venta - adjustedResultado.costo_total)}</span></div>
                  {cfg.push_pedal && <div className="flex justify-between text-[var(--color-text-muted)]"><span>Push Pedal + Grifo + Canastilla</span><span>{formatCOP(totalPushOverride)}</span></div>}
                  <div className="flex justify-between font-bold text-base"><span>Precio venta</span><span className="text-[var(--color-accent-green)]">{formatCOP(adjustedResultado.precio_comercial)}</span></div>
                </div>
              </div>

              {/* APU detallado - always visible, with all sections */}
              <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden">
                <button onClick={() => setShowApu(!showApu)} className="w-full text-sm text-[var(--color-primary)] font-medium text-left px-5 py-3 hover:bg-blue-500/5 transition-all duration-200 flex items-center justify-between">
                  <span>{showApu ? 'Ocultar' : 'Ver'} APU detallado</span>
                  <span className="text-xs text-[var(--color-text-muted)]">{adjustedResultado.lineas.length} lineas</span>
                </button>

                {showApu && (
                  <div className="border-t border-[var(--color-border)]">
                    {/* Insumos */}
                    <div className="px-4 py-2 bg-blue-50/50">
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">Insumos</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-[var(--color-text-muted)] text-left border-b border-[var(--color-border)]">
                            <th className="px-2 py-1.5 font-medium w-16">Cant</th>
                            <th className="px-2 py-1.5 font-medium">Descripcion</th>
                            <th className="px-2 py-1.5 font-medium w-24 text-right">P.Unit</th>
                            <th className="px-2 py-1.5 font-medium w-24 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adjustedResultado.lineas.map((l, i) => (
                            <ApuLineRow key={i} linea={l} onChange={(updated) => handleLineaChange(i, updated)} />
                          ))}
                          {customLineas.map((cl, ci) => (
                            <tr key={`custom-${ci}`} className="border-t border-amber-200 bg-amber-50/30 hover:bg-amber-50/60">
                              <td className="px-2 py-1.5">
                                <input type="number" value={cl.cantidad} onChange={e => { const v = Number(e.target.value); setCustomLineas(prev => prev.map((c, j) => j === ci ? { ...c, cantidad: v, total: v * c.precio_unitario } : c)) }} step="1" className="w-16 px-1 py-1 rounded text-xs text-right border border-amber-300" />
                              </td>
                              <td className="px-2 py-1.5">
                                <input type="text" value={cl.descripcion} onChange={e => setCustomLineas(prev => prev.map((c, j) => j === ci ? { ...c, descripcion: e.target.value } : c))} className="w-full px-1 py-1 rounded text-xs border border-amber-300" placeholder="Descripción..." />
                              </td>
                              <td className="px-2 py-1.5">
                                <input type="number" value={cl.precio_unitario} onChange={e => { const v = Number(e.target.value); setCustomLineas(prev => prev.map((c, j) => j === ci ? { ...c, precio_unitario: v, total: c.cantidad * v } : c)) }} step="100" className="w-24 px-1 py-1 rounded text-xs text-right border border-amber-300" />
                              </td>
                              <td className="px-2 py-1.5 text-right font-mono text-xs font-medium">{formatCOP(Math.round(cl.total))}
                                <button onClick={() => setCustomLineas(prev => prev.filter((_, j) => j !== ci))} className="ml-1 text-red-400 hover:text-red-600 text-[10px]" title="Eliminar">✕</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-dashed border-[var(--color-border)]">
                            <td colSpan={4} className="px-2 py-1.5">
                              <button onClick={() => setCustomLineas(prev => [...prev, { descripcion: '', material: '', cantidad: 1, unidad: 'und', precio_unitario: 0, desperdicio: 0, total: 0 }])} className="text-[10px] text-[var(--color-primary)] hover:underline font-medium">+ Agregar línea</button>
                            </td>
                          </tr>
                          <tr className="border-t-2 border-[var(--color-border)] bg-blue-50/30">
                            <td colSpan={3} className="px-2 py-2 text-xs font-semibold">Total Insumos</td>
                            <td className="px-2 py-2 text-right font-bold text-xs">{formatCOP(Math.round(adjustedResultado.costo_insumos))}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Mano de obra */}
                    <div className="px-4 py-2 bg-purple-50/50 border-t border-[var(--color-border)]">
                      <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wide">Mano de obra</span>
                    </div>
                    <table className="w-full text-xs">
                      <tbody>
                        <ExtraCostRow label="MO Acero (ml)" cantidad={moQtyAcero} precioUnit={moPriceAcero} onCantidadChange={v => { setMoV2(p => ({ ...p, acero: { ...p.acero, cantidad: v } })); setMoOverrides(p => ({ ...p, acero: null })) }} onPrecioChange={v => { setMoV2(p => ({ ...p, acero: { ...p.acero, precio: v } })); setMoOverrides(p => ({ ...p, acero: null })) }} />
                        <ExtraCostRow label="MO Pulido (ml)" cantidad={moQtyPulido} precioUnit={moPricePulido} onCantidadChange={v => { setMoV2(p => ({ ...p, pulido: { ...p.pulido, cantidad: v } })); setMoOverrides(p => ({ ...p, pulido: null })) }} onPrecioChange={v => { setMoV2(p => ({ ...p, pulido: { ...p.pulido, precio: v } })); setMoOverrides(p => ({ ...p, pulido: null })) }} />
                        <ExtraCostRow label="MO Patas (und)" cantidad={moQtyPatas} precioUnit={moPricePatas} onCantidadChange={v => { setMoV2(p => ({ ...p, patas: { ...p.patas, cantidad: v } })); setMoOverrides(p => ({ ...p, patas: null })) }} onPrecioChange={v => { setMoV2(p => ({ ...p, patas: { ...p.patas, precio: v } })); setMoOverrides(p => ({ ...p, patas: null })) }} />
                        {cfg.instalado && <ExtraCostRow label="MO Instalacion (ml)" cantidad={moQtyInstalacion} precioUnit={moPriceInstalacion} onCantidadChange={v => { setMoV2(p => ({ ...p, instalacion: { ...p.instalacion, cantidad: v } })); setMoOverrides(p => ({ ...p, instalacion: null })) }} onPrecioChange={v => { setMoV2(p => ({ ...p, instalacion: { ...p.instalacion, precio: v } })); setMoOverrides(p => ({ ...p, instalacion: null })) }} />}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-[var(--color-border)] bg-purple-50/30">
                          <td colSpan={3} className="px-2 py-2 text-xs font-semibold">Total MO</td>
                          <td className="px-2 py-2 text-right font-bold text-xs">{formatCOP(adjustedResultado.costo_mo)}</td>
                        </tr>
                      </tfoot>
                    </table>

                    {/* Transporte */}
                    <div className="px-4 py-2 bg-orange-50/50 border-t border-[var(--color-border)]">
                      <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wide">Transporte</span>
                    </div>
                    <table className="w-full text-xs">
                      <tbody>
                        <ExtraCostRow label="Transporte elementos" cantidad={transQtyElementos} precioUnit={transPriceElementos} onCantidadChange={v => { setTransV2(p => ({ ...p, elementos: { ...p.elementos, cantidad: v } })); setTransporteOverrides(p => ({ ...p, elementos: null })) }} onPrecioChange={v => { setTransV2(p => ({ ...p, elementos: { ...p.elementos, precio: v } })); setTransporteOverrides(p => ({ ...p, elementos: null })) }} />
                        <ExtraCostRow label="Transporte personal" cantidad={transQtyPersonal} precioUnit={transPricePersonal} onCantidadChange={v => { setTransV2(p => ({ ...p, personal: { ...p.personal, cantidad: v } })); setTransporteOverrides(p => ({ ...p, personal: null })) }} onPrecioChange={v => { setTransV2(p => ({ ...p, personal: { ...p.personal, precio: v } })); setTransporteOverrides(p => ({ ...p, personal: null })) }} />
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-[var(--color-border)] bg-orange-50/30">
                          <td colSpan={3} className="px-2 py-2 text-xs font-semibold">Total Transporte</td>
                          <td className="px-2 py-2 text-right font-bold text-xs">{formatCOP(adjustedResultado.costo_transporte)}</td>
                        </tr>
                      </tfoot>
                    </table>

                    {/* Corte laser + extras */}
                    <div className="px-4 py-2 bg-red-50/50 border-t border-[var(--color-border)]">
                      <span className="text-[10px] font-bold text-red-700 uppercase tracking-wide">Otros costos</span>
                    </div>
                    <table className="w-full text-xs border-b border-[var(--color-border)]">
                      <tbody>
                        {adjustedResultado.costo_laser > 0 && (
                          <ExtraCostRow label="Corte laser (min)" cantidad={actualLaserCant} precioUnit={actualLaserPrecio} onCantidadChange={v => setLaserOverride(p => ({ ...p, cantidad: v }))} onPrecioChange={v => setLaserOverride(p => ({ ...p, precio: v }))} />
                        )}
                        {cfg.push_pedal && (
                          <ExtraCostRow label="Push Pedal + Grifo + Canastilla" cantidad={actualPushCant} precioUnit={actualPushPrecio} onCantidadChange={v => setPushPedalOverride(p => ({ ...p, cantidad: v }))} onPrecioChange={v => setPushPedalOverride(p => ({ ...p, precio: v }))} />
                        )}
                        {cfg.poliza && (
                          <ExtraCostRow label="Poliza cumplimiento (2%)" cantidad={actualPolizaCant} precioUnit={actualPolizaPrecio} onCantidadChange={v => setPolizaOverride(p => ({ ...p, cantidad: v }))} onPrecioChange={v => setPolizaOverride(p => ({ ...p, precio: v }))} />
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Editable commercial description */}
              <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 rounded-full bg-[var(--color-primary)]" />
                  <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Descripcion comercial</span>
                  {descOverridden && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-medium border border-amber-200">Editado</span>}
                </div>
                <textarea
                  value={descripcionEdit}
                  onChange={e => { setDescripcionEdit(e.target.value); setDescOverridden(true) }}
                  rows={4}
                  className="w-full text-sm leading-relaxed px-3 py-2 rounded-xl border border-[var(--color-border)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                />
                {descOverridden && (
                  <button onClick={() => { if (adjustedResultado) { setDescripcionEdit(adjustedResultado.descripcion_comercial); setDescOverridden(false) } }} className="text-[10px] text-[var(--color-primary)] hover:underline mt-1">
                    Restaurar descripcion original
                  </button>
                )}
              </div>

              {/* Export APU Excel + Add to order buttons */}
              <button
                onClick={handlePreviewApuExcel}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-all mb-2"
              >
                <Download size={16} /> Preview APU Excel
              </button>
              {hasValidationErrors && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-2">
                  <p className="text-xs text-red-600 font-medium">Corrige los errores de dimensiones antes de continuar.</p>
                </div>
              )}
              <button
                onClick={agregarAlPedido}
                disabled={added || hasValidationErrors}
                className={`w-full flex items-center justify-center gap-2.5 px-5 py-4 rounded-2xl text-base font-bold transition-all duration-300 ${
                  added
                    ? 'bg-emerald-500 text-white scale-95'
                    : hasValidationErrors
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[var(--color-accent-green)] hover:opacity-90 text-white'
                }`}
              >
                {added ? (
                  <>
                    <div className="animate-check-pop"><Check size={22} strokeWidth={3} /></div>
                    {editProductoId ? 'Actualizado' : 'Agregado al pedido'}
                  </>
                ) : (
                  <>
                    {editProductoId ? <Edit3 size={20} /> : <ShoppingCart size={20} />}
                    {editProductoId ? 'ACTUALIZAR PRODUCTO' : 'AGREGAR AL PEDIDO'}
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

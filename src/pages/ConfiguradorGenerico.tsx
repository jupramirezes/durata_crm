/**
 * ConfiguradorGenerico v2 — Professional data-driven product configurator
 * Matches ConfiguradorMesa quality: full APU, editable lines, sticky price panel.
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { calcularApuRaw, preloadProductData, isMotorGenericoReady } from '../lib/motor-generico'
import { evalFormula } from '../lib/evaluar-formula'
import type { Variables } from '../lib/evaluar-formula'
import { formatCOP } from '../lib/utils'
import { showToast } from '../components/Toast'
import { supabase } from '../lib/supabase'
import {
  ArrowLeft, ChevronDown, ChevronRight, Package, Plus, X,
  Ruler, Atom, Layers, Grid3X3, Settings, Box, Circle, Wrench,
} from 'lucide-react'

/* ── Types ─────────────────────────────────────────── */
interface ProdVar {
  nombre: string; label: string; tipo: 'numero' | 'toggle' | 'seleccion' | 'calculado'
  default_valor: string; min_val: number | null; max_val: number | null
  unidad: string | null; grupo_ui: string; orden: number; opciones: string[] | null
}
interface CustomLine { desc: string; cant: number; pu: number }

/* ── Section styling ────────────────────────────────── */
const SEC = {
  insumos:    { label: 'INSUMOS',       bg: 'bg-blue-50',   color: 'text-blue-700',   border: 'border-blue-200',  dot: 'bg-blue-500' },
  mo:         { label: 'MANO DE OBRA',  bg: 'bg-amber-50',  color: 'text-amber-700',  border: 'border-amber-200', dot: 'bg-amber-500' },
  transporte: { label: 'TRANSPORTE',    bg: 'bg-emerald-50',color: 'text-emerald-700', border: 'border-emerald-200',dot: 'bg-emerald-500' },
  laser:      { label: 'CORTE LÁSER',   bg: 'bg-red-50',    color: 'text-red-700',     border: 'border-red-200',   dot: 'bg-red-500' },
  poliza:     { label: 'PÓLIZA',        bg: 'bg-gray-50',   color: 'text-gray-600',    border: 'border-gray-200',  dot: 'bg-gray-400' },
  addon:      { label: 'EXTRAS',        bg: 'bg-purple-50', color: 'text-purple-700',  border: 'border-purple-200',dot: 'bg-purple-500' },
} as const
const SEC_ORDER = ['insumos', 'mo', 'transporte', 'laser', 'poliza', 'addon'] as const

const ICONS: Record<string, typeof Ruler> = {
  'Dimensiones principales': Ruler, Material: Atom, Salpicaderos: Layers,
  Babero: Layers, 'Entrepaños y soporte': Grid3X3, Refuerzo: Wrench,
  Pozuelos: Circle, Escabiladero: Grid3X3, Vertedero: Box,
  'Extras y parámetros': Settings, Configuración: Grid3X3, Extras: Settings,
  Desagüe: Box,
}

/* ── Description templates ──────────────────────────── */
function buildDescription(pid: string, v: Variables): string {
  const inst = !!v.instalacion
  const pol = !!v.poliza
  const pre = inst ? 'Suministro e instalación de' : 'Suministro de'

  if (pid === 'carcamo') {
    let d = `${pre} cárcamo en acero inoxidable calibre ${v.calibre_cuerpo || 18} (cuerpo) y calibre ${v.calibre_tapa || 12} (tapa), de ${Number(v.largo || 1).toFixed(2)} m de largo x ${Number(v.ancho || 0.25).toFixed(2)} m de ancho x ${Number(v.alto || 0.095).toFixed(2)} m de alto`
    if (Number(v.largo_desague) > 0) d += `, con desagüe en tubo de 2 pulg de ${Number(v.largo_desague).toFixed(2)} m`
    d += `, soldadura TIG con gas argón, acabado pulido satinado. ${pol ? 'Con' : 'Sin'} póliza.`
    return d
  }
  if (pid === 'estanteria_graduable') {
    return `${pre} estantería graduable en acero inoxidable, entrepaños en lámina cal ${v.calibre_entrepano || 18} y parales en lámina cal ${v.calibre_patas || 12}, de ${Number(v.largo || 2).toFixed(2)} m de largo x ${Number(v.ancho || 0.65).toFixed(2)} m de ancho x ${Number(v.alto || 1.8).toFixed(2)} m de alto, con ${v.num_entrepanos || 5} entrepaños y ${v.num_patas || 4} patas con niveladores, refuerzos tipo omega en cal 18, soldadura TIG con argón, acabado pulido satinado. ${pol ? 'Con' : 'Sin'} póliza.`
  }
  // Generic fallback
  return `${pre} producto en acero inoxidable, de ${Number(v.largo || 1).toFixed(2)} m × ${Number(v.ancho || 0.5).toFixed(2)} m × ${Number(v.alto || 0.5).toFixed(2)} m. Soldadura TIG con argón, acabado pulido satinado. ${pol ? 'Con' : 'Sin'} póliza.`
}

/* ── Component ─────────────────────────────────────── */
export default function ConfiguradorGenerico() {
  const { id, productoId: paramPid } = useParams<{ id: string; productoId: string }>()
  const navigate = useNavigate()
  const { state, dispatch } = useStore()
  const empresa = state.empresas.find(e => state.oportunidades.find(o => o.id === id)?.empresa_id === e.id)
  const productoId = paramPid || 'mesa'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [variables, setVariables] = useState<ProdVar[]>([])
  const [productoNombre, setProductoNombre] = useState('')
  const [valores, setValores] = useState<Variables>({})
  const [margen, setMargen] = useState(0.38)
  const [cantidad, setCantidad] = useState(1)
  const [descripcionEdit, setDescripcionEdit] = useState('')
  const [descManual, setDescManual] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [showAPU, setShowAPU] = useState(true)
  const [customLines, setCustomLines] = useState<CustomLine[]>([])
  const [motorReady, setMotorReady] = useState(false)
  // Line overrides: key = line descripcion (stable across recalcs), value = { cant?, pu? }
  const [lineOverrides, setLineOverrides] = useState<Record<string, { cant?: number; pu?: number }>>({})
  // Track previous line quantities to detect which changed
  const [prevLineQtys, setPrevLineQtys] = useState<Record<string, number>>({})

  // Load product
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const { data: cat, error: e } = await supabase.from('productos_catalogo').select('*').eq('id', productoId).single()
        if (e) throw new Error(e.message)
        setProductoNombre(cat.nombre)
        setMargen(cat.margen_default || 0.38)
        const { data: vd } = await supabase.from('producto_variables').select('*').eq('producto_id', productoId).order('orden')
        const vars = (vd || []).map((v: any) => ({ ...v, opciones: typeof v.opciones === 'string' ? JSON.parse(v.opciones) : v.opciones })) as ProdVar[]
        setVariables(vars)
        const defs: Variables = {}
        for (const v of vars) {
          if (v.tipo === 'toggle') defs[v.nombre] = v.default_valor === '1' ? 1 : 0
          else if (v.tipo === 'seleccion') defs[v.nombre] = v.default_valor || ''
          else if (v.tipo === 'calculado') defs[v.nombre] = 0
          else defs[v.nombre] = parseFloat(v.default_valor || '0') || 0
        }
        setValores(defs)
        const grps = [...new Set(vars.map(v => v.grupo_ui).filter(g => !g.startsWith('_')))]
        setExpandedGroups(new Set(grps.slice(0, 4)))
        const ok = await preloadProductData(productoId)
        setMotorReady(ok)
      } catch (e: any) { setError(e.message) }
      setLoading(false)
    }
    load()
  }, [productoId])

  // Compute
  const computedVars = useMemo(() => {
    const cv = { ...valores }
    for (const v of variables) {
      if (v.tipo === 'calculado' && v.default_valor) {
        try { cv[v.nombre] = evalFormula(v.default_valor, cv) } catch { }
      }
    }
    return cv
  }, [valores, variables])

  const calcResult = useMemo(() => {
    if (!motorReady || !isMotorGenericoReady(productoId)) return null
    const v: Variables = { ...computedVars }
    // Ensure instalacion/poliza from UI state
    if (!('instalacion' in v)) v.instalacion = 0
    if (!('poliza' in v)) v.poliza = 0
    return calcularApuRaw(productoNombre, v, state.precios, margen)
  }, [computedVars, motorReady, productoId, state.precios, margen, productoNombre])

  const resultado = calcResult?.resultado || null
  const full = calcResult?.full || null

  // Smart override reset: only clear overrides for lines whose quantity changed
  useEffect(() => {
    if (!full || Object.keys(lineOverrides).length === 0) {
      // Just track current quantities
      const qtys: Record<string, number> = {}
      for (const l of (full?.allLineas || [])) if (l.activa) qtys[l.descripcion] = l.cantidad
      setPrevLineQtys(qtys)
      return
    }
    const newQtys: Record<string, number> = {}
    for (const l of full.allLineas) if (l.activa) newQtys[l.descripcion] = l.cantidad
    const toReset: string[] = []
    for (const key of Object.keys(lineOverrides)) {
      if (key in newQtys && key in prevLineQtys && Math.abs(newQtys[key] - prevLineQtys[key]) > 0.001) {
        toReset.push(key)
      }
    }
    if (toReset.length > 0) {
      setLineOverrides(prev => { const next = { ...prev }; for (const k of toReset) delete next[k]; return next })
      showToast('warning', `${toReset.length} override(s) reseteados por cambio de cantidad`)
    }
    setPrevLineQtys(newQtys)
  }, [full])

  // Compute override-adjusted totals
  const overrideDelta = useMemo(() => {
    if (!full) return 0
    let delta = 0
    for (const [key, ov] of Object.entries(lineOverrides)) {
      const line = full.allLineas.find(l => l.descripcion === key && l.activa)
      if (!line) continue
      const newCant = ov.cant ?? line.cantidad
      const newPu = ov.pu ?? line.precio_unitario
      const newTotal = newCant * newPu * (1 + (line.desperdicio || 0))
      delta += newTotal - line.total
    }
    return delta
  }, [full, lineOverrides])

  const customTotal = customLines.reduce((s, l) => s + l.cant * l.pu, 0)
  const adjustedCostoTotal = resultado ? resultado.costo_total + overrideDelta + customTotal : 0
  const precioFinal = resultado ? Math.ceil(Math.round(adjustedCostoTotal / (1 - margen)) / 1000) * 1000 : 0

  // Auto-description
  useEffect(() => {
    if (!descManual && computedVars.largo != null) setDescripcionEdit(buildDescription(productoId, computedVars))
  }, [computedVars, productoId, descManual])

  const updateVar = useCallback((n: string, v: number | string) => setValores(p => ({ ...p, [n]: v })), [])
  const toggleGroup = (g: string) => setExpandedGroups(p => { const n = new Set(p); n.has(g) ? n.delete(g) : n.add(g); return n })

  const groups = useMemo(() => {
    const order: string[] = []; const map = new Map<string, ProdVar[]>()
    for (const v of variables) { if (v.grupo_ui.startsWith('_')) continue; if (!map.has(v.grupo_ui)) { map.set(v.grupo_ui, []); order.push(v.grupo_ui) }; map.get(v.grupo_ui)!.push(v) }
    return order.map(g => [g, map.get(g)!] as [string, ProdVar[]])
  }, [variables])

  const handleAdd = () => {
    if (!resultado) return
    dispatch({ type: 'ADD_PRODUCTO', payload: { oportunidad_id: id!, categoria: productoNombre, subtipo: productoNombre, configuracion: computedVars as any, apu_resultado: resultado, precio_calculado: precioFinal, descripcion_comercial: descripcionEdit || resultado.descripcion_comercial, cantidad } })
    showToast('success', `${productoNombre} agregado al pedido`)
    setTimeout(() => navigate(`/oportunidades/${id}`), 500)
  }

  if (loading) return <div className="flex items-center justify-center h-[60vh] text-slate-500">Cargando configurador...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(`/oportunidades/${id}`)} className="flex items-center gap-1.5 text-sm text-[var(--color-primary)] hover:underline"><ArrowLeft size={16} /> Volver</button>
        <div className="flex-1" />
        <div className="text-right">
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Configurar: {productoNombre}</h2>
          <p className="text-sm text-slate-500">Empresa: {empresa?.nombre}</p>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* LEFT: Controls */}
        <div className="flex-1 space-y-3 min-w-0">
          {groups.map(([gn, gv]) => {
            const Ic = ICONS[gn] || Settings; const isDimOrMat = gn === 'Dimensiones principales' || gn === 'Material'
            return (
              <div key={gn} className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
                <button onClick={() => toggleGroup(gn)} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50/80 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0"><Ic size={16} className="text-blue-600" /></div>
                  <span className="text-sm font-semibold text-slate-800 flex-1 text-left">{gn}</span>
                  {!expandedGroups.has(gn) && <span className="text-xs text-slate-400 mr-2">{gv.filter(v => v.tipo !== 'calculado').slice(0, 3).map(v => { const val = computedVars[v.nombre]; return v.tipo === 'toggle' ? (val ? '✓' : '—') : `${val}${v.unidad || ''}` }).join(' · ')}</span>}
                  {expandedGroups.has(gn) ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                </button>
                {expandedGroups.has(gn) && (
                  <div className="px-5 pb-4 pt-1 border-t border-slate-100">
                    {isDimOrMat ? (
                      <div className="grid grid-cols-3 gap-3">
                        {gv.map(v => (
                          <div key={v.nombre}>
                            <label className="text-xs font-medium text-slate-500 mb-1.5 block">{v.label}</label>
                            {v.tipo === 'numero' && <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-2 bg-white hover:border-slate-300"><input type="number" value={Number(computedVars[v.nombre]) || 0} onChange={e => updateVar(v.nombre, parseFloat(e.target.value) || 0)} step={v.unidad === 'm' ? 0.01 : 1} min={v.min_val ?? undefined} max={v.max_val ?? undefined} className="w-full text-sm font-medium text-right bg-transparent outline-none tabular-nums" />{v.unidad && <span className="text-xs text-slate-400 shrink-0">{v.unidad}</span>}</div>}
                            {v.tipo === 'seleccion' && <select value={String(computedVars[v.nombre])} onChange={e => updateVar(v.nombre, e.target.value)} className="w-full px-3 py-2 text-sm font-medium border border-slate-200 rounded-lg bg-white hover:border-slate-300">{(v.opciones || []).map(o => <option key={o} value={o}>{o}</option>)}</select>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {gv.map(v => (
                          <div key={v.nombre}>
                            {v.tipo === 'numero' && <div className="flex items-center gap-3"><span className="text-sm text-slate-600 w-[160px] shrink-0">{v.label}</span><input type="range" min={v.min_val ?? 0} max={v.max_val ?? 10} step={v.unidad === 'm' ? 0.01 : 1} value={Number(computedVars[v.nombre]) || 0} onChange={e => updateVar(v.nombre, parseFloat(e.target.value))} className="flex-1 h-1.5 accent-blue-600" /><div className="flex items-center gap-1 border border-slate-200 rounded-lg px-2 py-1.5 bg-white w-[90px]"><input type="number" value={Number(computedVars[v.nombre]) || 0} onChange={e => updateVar(v.nombre, parseFloat(e.target.value) || 0)} step={v.unidad === 'm' ? 0.01 : 1} className="w-full text-sm text-right bg-transparent outline-none tabular-nums" />{v.unidad && <span className="text-[10px] text-slate-400">{v.unidad}</span>}</div></div>}
                            {v.tipo === 'toggle' && <label className="flex items-center gap-3 cursor-pointer py-0.5"><input type="checkbox" checked={!!computedVars[v.nombre]} onChange={e => updateVar(v.nombre, e.target.checked ? 1 : 0)} className="w-4.5 h-4.5 accent-blue-600 rounded" /><span className="text-sm text-slate-600">{v.label}</span></label>}
                            {v.tipo === 'seleccion' && <div className="flex items-center gap-3"><span className="text-sm text-slate-600 w-[160px] shrink-0">{v.label}</span><select value={String(computedVars[v.nombre])} onChange={e => updateVar(v.nombre, e.target.value)} className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white">{(v.opciones || []).map(o => <option key={o} value={o}>{o}</option>)}</select></div>}
                            {v.tipo === 'calculado' && <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg"><span className="text-sm text-slate-500 flex-1">{v.label}</span><span className="text-sm font-bold text-slate-800 tabular-nums">{Math.round(Number(computedVars[v.nombre]) || 0)}</span></div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Description */}
          <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Descripción comercial</label>
            <textarea value={descripcionEdit} onChange={e => { setDescripcionEdit(e.target.value); setDescManual(true) }} rows={3}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none focus:border-blue-400 focus:outline-none leading-relaxed" />
          </div>
        </div>

        {/* RIGHT: Price + APU (sticky) */}
        <div className="w-[380px] shrink-0 space-y-3" style={{ position: 'sticky', top: 80 }}>
          {/* Price card */}
          <div className="rounded-2xl p-6 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Precio comercial</p>
            <p className="text-4xl font-extrabold tabular-nums leading-none">{formatCOP(precioFinal)}</p>
            {cantidad > 1 && <p className="text-sm opacity-80 mt-1">× {cantidad} = {formatCOP(precioFinal * cantidad)}</p>}
            <div className="mt-4 pt-3 border-t border-white/20">
              <div className="flex items-center gap-3">
                <span className="text-xs opacity-70">Margen</span>
                <input type="range" min={5} max={60} value={Math.round(margen * 100)} onChange={e => setMargen(parseInt(e.target.value) / 100)} className="flex-1 h-1.5 accent-white" />
                <input type="number" value={Math.round(margen * 100)} min={5} max={60} onChange={e => setMargen(Math.max(0.05, Math.min(0.60, (parseInt(e.target.value) || 38) / 100)))} className="w-12 px-1.5 py-0.5 text-sm text-right bg-white/20 border border-white/30 rounded font-bold text-white" /><span className="text-xs font-bold">%</span>
              </div>
              <div className="flex justify-between mt-2 text-xs opacity-70">
                <span>Costo: {formatCOP(Math.round(adjustedCostoTotal))}</span>
                <span>Cant: <input type="number" value={cantidad} min={1} max={99} onChange={e => setCantidad(Math.max(1, parseInt(e.target.value) || 1))} className="w-8 bg-white/20 border border-white/30 rounded text-center text-white font-bold" /></span>
              </div>
            </div>
          </div>

          {/* Full APU desglose */}
          {full && (
            <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
              <button onClick={() => setShowAPU(!showAPU)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Desglose APU</span>
                <span className="text-xs text-slate-400">{full.allLineas.filter(l => l.activa).length} líneas {showAPU ? '▾' : '▸'}</span>
              </button>
              {showAPU && (
                <div className="max-h-[500px] overflow-y-auto">
                  {SEC_ORDER.map(sec => {
                    const s = SEC[sec]
                    // Show ALL active lines, including $0 ones
                    const lines = full.allLineas.filter(l => l.seccion === sec && l.activa)
                    if (!lines.length) return null
                    const subtotal = lines.reduce((a, l) => {
                      const ov = lineOverrides[l.descripcion]
                      if (ov) { const c = ov.cant ?? l.cantidad; const p = ov.pu ?? l.precio_unitario; return a + c * p * (1 + (l.desperdicio || 0)) }
                      return a + l.total
                    }, 0)
                    return (
                      <div key={sec}>
                        <div className={`${s.bg} px-4 py-1.5 flex items-center justify-between ${s.border} border-y`}>
                          <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${s.dot}`} /><span className={`text-[10px] font-bold uppercase tracking-wider ${s.color}`}>{s.label}</span></div>
                          <span className={`text-[10px] font-bold tabular-nums ${s.color}`}>{formatCOP(Math.round(subtotal))}</span>
                        </div>
                        <table className="w-full text-[11px]"><tbody>
                          {lines.map((l, li) => {
                            const oKey = l.descripcion
                            const ov = lineOverrides[oKey]
                            const isOverridden = !!ov
                            const dispCant = ov?.cant ?? l.cantidad
                            const dispPu = ov?.pu ?? l.precio_unitario
                            const dispTotal = dispCant * dispPu * (1 + (l.desperdicio || 0))
                            const isMissing = l.precio_unitario === 0 && l.cantidad > 0 && !ov?.pu
                            return (
                              <tr key={`${sec}-${li}`} className={`border-b border-slate-50 ${isOverridden ? 'bg-amber-50/40' : 'hover:bg-slate-50/50'}`}>
                                <td className="py-1 pl-4 text-slate-600 max-w-[100px] truncate text-[10px]">
                                  {l.descripcion}
                                  {isMissing && <span className="text-red-500 ml-1" title="Precio no encontrado en precios_maestro">⚠</span>}
                                </td>
                                <td className="py-1 w-14 pr-1">
                                  <input type="number" value={Number(dispCant.toFixed(4))} step={0.01}
                                    onChange={e => setLineOverrides(p => ({ ...p, [oKey]: { ...p[oKey], cant: parseFloat(e.target.value) || 0 } }))}
                                    className={`w-full text-right text-[10px] tabular-nums bg-transparent outline-none ${isOverridden ? 'text-amber-700 font-semibold' : 'text-slate-500'} hover:bg-white hover:border hover:border-slate-200 hover:rounded px-1`} />
                                </td>
                                <td className="py-1 w-16 pr-1">
                                  <input type="number" value={Math.round(dispPu)} step={100}
                                    onChange={e => setLineOverrides(p => ({ ...p, [oKey]: { ...p[oKey], pu: parseFloat(e.target.value) || 0 } }))}
                                    className={`w-full text-right text-[10px] tabular-nums bg-transparent outline-none ${isMissing ? 'text-red-500' : isOverridden ? 'text-amber-700 font-semibold' : 'text-slate-400'} hover:bg-white hover:border hover:border-slate-200 hover:rounded px-1`} />
                                </td>
                                <td className={`py-1 text-right tabular-nums text-[10px] font-medium pr-3 ${isMissing ? 'text-red-400' : ''}`}>{formatCOP(Math.round(dispTotal))}</td>
                              </tr>
                            )
                          })}
                        </tbody></table>
                      </div>
                    )
                  })}
                  {/* Custom lines */}
                  {customLines.length > 0 && (
                    <div>
                      <div className="bg-amber-50 px-4 py-1.5 border-y border-amber-200"><span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">LÍNEAS ADICIONALES</span></div>
                      {customLines.map((cl, i) => (
                        <div key={i} className="flex items-center gap-1 px-4 py-1 text-[11px] border-b border-slate-50">
                          <input value={cl.desc} onChange={e => setCustomLines(p => p.map((c, j) => j === i ? { ...c, desc: e.target.value } : c))} className="flex-1 px-1 py-0.5 border border-amber-200 rounded" placeholder="Descripción" />
                          <input type="number" value={cl.cant} onChange={e => setCustomLines(p => p.map((c, j) => j === i ? { ...c, cant: Number(e.target.value) } : c))} className="w-10 px-1 py-0.5 border border-amber-200 rounded text-right" />
                          <input type="number" value={cl.pu} onChange={e => setCustomLines(p => p.map((c, j) => j === i ? { ...c, pu: Number(e.target.value) } : c))} className="w-16 px-1 py-0.5 border border-amber-200 rounded text-right" />
                          <span className="w-16 text-right font-medium tabular-nums">{formatCOP(Math.round(cl.cant * cl.pu))}</span>
                          <button onClick={() => setCustomLines(p => p.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><X size={12} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="px-4 py-2">
                    <button onClick={() => setCustomLines(p => [...p, { desc: '', cant: 1, pu: 0 }])} className="text-[11px] text-blue-600 font-medium flex items-center gap-1 hover:underline"><Plus size={12} /> Agregar línea</button>
                  </div>
                  {/* Totals */}
                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Insumos</span><span className="font-semibold tabular-nums">{formatCOP(Math.round(full.totalInsumos))}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Mano de obra</span><span className="font-semibold tabular-nums">{formatCOP(Math.round(full.totalMO))}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Transporte</span><span className="font-semibold tabular-nums">{formatCOP(Math.round(full.totalTransporte))}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Corte láser</span><span className="font-semibold tabular-nums">{formatCOP(Math.round(full.totalLaser))}</span></div>
                    {full.totalPoliza > 0 && <div className="flex justify-between"><span className="text-slate-500">Póliza</span><span className="font-semibold tabular-nums">{formatCOP(Math.round(full.totalPoliza))}</span></div>}
                    {overrideDelta !== 0 && <div className="flex justify-between text-amber-600"><span>Ajustes manuales</span><span className="font-semibold tabular-nums">{overrideDelta > 0 ? '+' : ''}{formatCOP(Math.round(overrideDelta))}</span></div>}
                    {customTotal > 0 && <div className="flex justify-between"><span className="text-slate-500">Adicionales</span><span className="font-semibold tabular-nums">{formatCOP(Math.round(customTotal))}</span></div>}
                    <div className="flex justify-between pt-1.5 border-t border-slate-300"><span className="font-bold text-slate-800">Costo total</span><span className="font-bold tabular-nums">{formatCOP(Math.round(adjustedCostoTotal))}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={!resultado} className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-40"><Package size={16} /> AGREGAR AL PEDIDO</button>
            <button onClick={() => navigate(`/oportunidades/${id}`)} className="px-5 h-12 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

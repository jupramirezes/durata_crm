/**
 * ConfiguradorGenerico — Data-driven product configurator
 *
 * Reads product definition (variables, materials, APU lines) from Supabase
 * and renders dynamic controls. Works for ANY product in productos_catalogo.
 * Mesas use ConfiguradorMesa.tsx (has 3D viewer). This is for everything else.
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { calcularApuRaw, preloadProductData, isMotorGenericoReady } from '../lib/motor-generico'
import { evalFormula } from '../lib/evaluar-formula'
import type { Variables } from '../lib/evaluar-formula'
import type { ApuResultado } from '../types'
import { formatCOP } from '../lib/utils'
import { showToast } from '../components/Toast'
import { supabase } from '../lib/supabase'
import {
  ArrowLeft, ChevronDown, ChevronRight, Package, Plus, X,
  Ruler, Atom, Layers, Grid3X3, Settings, Box, Circle, Wrench,
} from 'lucide-react'

/* ── Types ─────────────────────────────────────────── */

interface ProductoVariable {
  nombre: string
  label: string
  tipo: 'numero' | 'toggle' | 'seleccion' | 'calculado'
  default_valor: string
  min_val: number | null
  max_val: number | null
  unidad: string | null
  grupo_ui: string
  orden: number
  opciones: string[] | null
}

interface CustomLinea { descripcion: string; cantidad: number; precio_unitario: number }

const GROUP_ICONS: Record<string, typeof Ruler> = {
  'Dimensiones principales': Ruler, 'Material': Atom, 'Salpicaderos': Layers,
  'Babero': Layers, 'Entrepaños y soporte': Grid3X3, 'Refuerzo': Wrench,
  'Pozuelos': Circle, 'Escabiladero': Grid3X3, 'Vertedero': Box,
  'Extras y parámetros': Settings, 'Configuración': Settings,
}

/* ── Component ─────────────────────────────────────── */

export default function ConfiguradorGenerico() {
  const { id, productoId: paramProductoId } = useParams<{ id: string; productoId: string }>()
  const navigate = useNavigate()
  const { state, dispatch } = useStore()
  const { precios: preciosMaestro } = state
  const empresa = state.empresas.find(e => state.oportunidades.find(o => o.id === id)?.empresa_id === e.id)

  const productoId = paramProductoId || 'mesa'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [variables, setVariables] = useState<ProductoVariable[]>([])
  const [productoNombre, setProductoNombre] = useState('')

  const [valores, setValores] = useState<Variables>({})
  const [margen, setMargen] = useState(0.38)
  const [cantidad, setCantidad] = useState(1)
  const [instalado, setInstalado] = useState(true)
  const [poliza, setPoliza] = useState(false)
  const [descripcionEdit, setDescripcionEdit] = useState('')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [showAPU, setShowAPU] = useState(false)
  const [customLineas, setCustomLineas] = useState<CustomLinea[]>([])
  const [motorReady, setMotorReady] = useState(false)

  // Load product definition from Supabase
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const { data: cat, error: catErr } = await supabase
          .from('productos_catalogo').select('*').eq('id', productoId).single()
        if (catErr) throw new Error(catErr.message)

        setProductoNombre(cat.nombre)
        setMargen(cat.margen_default || 0.38)

        const { data: varsData } = await supabase
          .from('producto_variables').select('*').eq('producto_id', productoId).order('orden')

        const vars = (varsData || []).map((v: any) => ({
          ...v,
          opciones: typeof v.opciones === 'string' ? JSON.parse(v.opciones) : v.opciones,
        })) as ProductoVariable[]
        setVariables(vars)

        // Initialize values from defaults
        const defaults: Variables = {}
        for (const v of vars) {
          if (v.tipo === 'toggle') defaults[v.nombre] = v.default_valor === '1' || v.default_valor === 'true' ? 1 : 0
          else if (v.tipo === 'seleccion') defaults[v.nombre] = v.default_valor || ''
          else if (v.tipo === 'calculado') defaults[v.nombre] = 0
          else defaults[v.nombre] = parseFloat(v.default_valor || '0') || 0
        }
        setValores(defaults)

        // Expand first 3 groups
        const grps = [...new Set(vars.map(v => v.grupo_ui).filter(g => !g.startsWith('_')))]
        setExpandedGroups(new Set(grps.slice(0, 3)))

        // Preload motor data
        const ok = await preloadProductData(productoId)
        setMotorReady(ok)
      } catch (e: any) {
        setError(e.message)
      }
      setLoading(false)
    }
    load()
  }, [productoId])

  // Calculate APU using raw variables (generic, works for any product)
  const resultado: ApuResultado | null = useMemo(() => {
    if (!motorReady || !isMotorGenericoReady(productoId)) return null

    // Merge user values with common parameters
    const vars: Variables = { ...valores, instalacion: instalado ? 1 : 0, poliza: poliza ? 1 : 0 }

    // Evaluate calculated variables
    for (const v of variables) {
      if (v.tipo === 'calculado' && v.default_valor) {
        try { vars[v.nombre] = evalFormula(v.default_valor, vars) } catch { /* keep default */ }
      }
    }

    return calcularApuRaw(productoNombre, vars, preciosMaestro, margen)
  }, [valores, motorReady, productoId, preciosMaestro, margen, poliza, instalado, productoNombre, variables])

  const customTotal = customLineas.reduce((s, l) => s + l.cantidad * l.precio_unitario, 0)
  const precioFinal = resultado ? resultado.precio_comercial + Math.ceil(customTotal / (1 - margen) / 1000) * 1000 : 0

  // Auto-generate description
  useEffect(() => {
    if (!resultado || descripcionEdit) return
    setDescripcionEdit(resultado.descripcion_comercial)
  }, [resultado])

  const updateVar = useCallback((name: string, value: number | string) => {
    setValores(prev => ({ ...prev, [name]: value }))
  }, [])

  const toggleGroup = (g: string) => setExpandedGroups(prev => {
    const next = new Set(prev); if (next.has(g)) next.delete(g); else next.add(g); return next
  })

  // Groups sorted by order of first variable
  const groups = useMemo(() => {
    const groupOrder: string[] = []
    const map = new Map<string, ProductoVariable[]>()
    for (const v of variables) {
      if (v.grupo_ui.startsWith('_')) continue
      if (!map.has(v.grupo_ui)) { map.set(v.grupo_ui, []); groupOrder.push(v.grupo_ui) }
      map.get(v.grupo_ui)!.push(v)
    }
    return groupOrder.map(g => [g, map.get(g)!] as [string, ProductoVariable[]])
  }, [variables])

  // Computed vars (calculated variables evaluated synchronously)
  const computedVars = useMemo(() => {
    const cv = { ...valores }
    for (const v of variables) {
      if (v.tipo === 'calculado' && v.default_valor) {
        try { cv[v.nombre] = evalFormula(v.default_valor, cv) } catch { /* ignore */ }
      }
    }
    return cv
  }, [valores, variables])

  const handleAdd = () => {
    if (!resultado) return
    dispatch({
      type: 'ADD_PRODUCTO',
      payload: {
        oportunidad_id: id!,
        categoria: productoNombre,
        subtipo: productoNombre,
        configuracion: computedVars as any,
        apu_resultado: resultado,
        precio_calculado: precioFinal,
        descripcion_comercial: descripcionEdit || resultado.descripcion_comercial,
        cantidad,
      },
    })
    showToast('success', `${productoNombre} agregado al pedido`)
    setTimeout(() => navigate(`/oportunidades/${id}`), 500)
  }

  if (loading) return <div className="flex items-center justify-center h-full text-slate-500 text-sm">Cargando configurador...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(`/oportunidades/${id}`)} className="flex items-center gap-1.5 text-sm text-[var(--color-primary)] hover:underline">
          <ArrowLeft size={16} /> Volver a {empresa?.nombre || 'oportunidad'}
        </button>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
          <Package size={24} className="text-[var(--color-primary)]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Configurar: {productoNombre}</h2>
          <p className="text-sm text-slate-500">Empresa: {empresa?.nombre}</p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_380px] gap-6">
        {/* LEFT: Controls */}
        <div className="space-y-2">
          {groups.map(([groupName, groupVars]) => {
            const Icon = GROUP_ICONS[groupName] || Settings
            const isDimensionRow = groupName === 'Dimensiones principales' || groupName === 'Material'
            return (
              <div key={groupName} className="border border-[var(--color-border)] rounded-xl overflow-hidden bg-white">
                <button onClick={() => toggleGroup(groupName)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 transition-colors">
                  <Icon size={15} className="text-slate-400" />
                  <span className="text-[13px] font-semibold text-slate-700 flex-1 text-left">{groupName}</span>
                  {!expandedGroups.has(groupName) && (
                    <span className="text-[10px] text-slate-400 mr-2">
                      {groupVars.filter(v => v.tipo !== 'calculado').slice(0, 3).map(v => {
                        const val = computedVars[v.nombre]
                        return v.tipo === 'toggle' ? (val ? '✓' : '—') : `${val}${v.unidad || ''}`
                      }).join(' · ')}
                    </span>
                  )}
                  {expandedGroups.has(groupName) ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                </button>
                {expandedGroups.has(groupName) && (
                  <div className="px-4 pb-3 pt-1">
                    {isDimensionRow ? (
                      <div className="grid grid-cols-3 gap-2">
                        {groupVars.map(v => (
                          <div key={v.nombre}>
                            <label className="text-[11px] font-medium text-slate-500 mb-1 block">{v.label}</label>
                            {v.tipo === 'numero' && (
                              <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white">
                                <input type="number" value={Number(computedVars[v.nombre]) || 0}
                                  onChange={e => updateVar(v.nombre, parseFloat(e.target.value) || 0)}
                                  step={v.unidad === 'm' ? 0.01 : 1} min={v.min_val ?? undefined} max={v.max_val ?? undefined}
                                  className="w-full text-sm font-medium text-right bg-transparent outline-none tabular-nums" />
                                {v.unidad && <span className="text-[10px] text-slate-400">{v.unidad}</span>}
                              </div>
                            )}
                            {v.tipo === 'seleccion' && (
                              <select value={String(computedVars[v.nombre])} onChange={e => updateVar(v.nombre, e.target.value)}
                                className="w-full px-2.5 py-1.5 text-sm font-medium border border-slate-200 rounded-lg bg-white">
                                {(v.opciones || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {groupVars.map(v => (
                          <div key={v.nombre}>
                            {v.tipo === 'numero' && (
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-500 w-[140px] shrink-0">{v.label}</span>
                                <input type="range" min={v.min_val ?? 0} max={v.max_val ?? 10}
                                  step={v.unidad === 'm' ? 0.01 : 1} value={Number(computedVars[v.nombre]) || 0}
                                  onChange={e => updateVar(v.nombre, parseFloat(e.target.value))}
                                  className="flex-1 h-1 accent-[var(--color-primary)]" />
                                <div className="flex items-center gap-1 border border-slate-200 rounded-md px-2 py-1 bg-white w-[80px]">
                                  <input type="number" value={Number(computedVars[v.nombre]) || 0}
                                    onChange={e => updateVar(v.nombre, parseFloat(e.target.value) || 0)}
                                    step={v.unidad === 'm' ? 0.01 : 1}
                                    className="w-full text-sm text-right bg-transparent outline-none tabular-nums" />
                                  {v.unidad && <span className="text-[10px] text-slate-400">{v.unidad}</span>}
                                </div>
                              </div>
                            )}
                            {v.tipo === 'toggle' && (
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={!!computedVars[v.nombre]}
                                  onChange={e => updateVar(v.nombre, e.target.checked ? 1 : 0)}
                                  className="w-4 h-4 accent-[var(--color-primary)] rounded" />
                                <span className="text-[12px] text-slate-600">{v.label}</span>
                              </label>
                            )}
                            {v.tipo === 'seleccion' && (
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-500 w-[140px] shrink-0">{v.label}</span>
                                <select value={String(computedVars[v.nombre])} onChange={e => updateVar(v.nombre, e.target.value)}
                                  className="flex-1 px-2 py-1 text-sm border border-slate-200 rounded-lg bg-white">
                                  {(v.opciones || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                              </div>
                            )}
                            {v.tipo === 'calculado' && (
                              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg">
                                <span className="text-[11px] text-slate-500 flex-1">{v.label}</span>
                                <span className="text-sm font-bold text-slate-700 tabular-nums">{Math.round(Number(computedVars[v.nombre]) || 0)}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Common parameters */}
          <div className="border border-[var(--color-border)] rounded-xl overflow-hidden bg-white">
            <div className="px-4 py-2.5 flex items-center gap-2.5">
              <Settings size={15} className="text-slate-400" />
              <span className="text-[13px] font-semibold text-slate-700">Parámetros comerciales</span>
            </div>
            <div className="px-4 pb-3 space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={instalado} onChange={e => setInstalado(e.target.checked)}
                  className="w-4 h-4 accent-[var(--color-primary)] rounded" />
                <span className="text-[12px] text-slate-600">Incluye instalación</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={poliza} onChange={e => setPoliza(e.target.checked)}
                  className="w-4 h-4 accent-[var(--color-primary)] rounded" />
                <span className="text-[12px] text-slate-600">Requiere póliza</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 w-[140px]">Cantidad</span>
                <input type="number" value={cantidad} min={1} max={99}
                  onChange={e => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 px-2 py-1 text-sm text-center border border-slate-200 rounded-md" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="border border-[var(--color-border)] rounded-xl p-4 bg-white">
            <label className="text-[11px] font-medium text-slate-500 mb-1.5 block">Descripción comercial</label>
            <textarea value={descripcionEdit} onChange={e => setDescripcionEdit(e.target.value)} rows={3}
              className="w-full px-3 py-2 text-[12px] border border-slate-200 rounded-lg resize-none focus:border-[var(--color-primary)] focus:outline-none leading-relaxed" />
          </div>
        </div>

        {/* RIGHT: Price + APU */}
        <div className="space-y-3">
          {/* Price card */}
          <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Precio comercial</p>
            <p className="text-[36px] font-extrabold tabular-nums leading-none">{formatCOP(precioFinal)}</p>
            {cantidad > 1 && <p className="text-sm opacity-80 mt-1">× {cantidad} = {formatCOP(precioFinal * cantidad)}</p>}
            <div className="mt-4 pt-3 border-t border-white/20">
              <div className="flex items-center gap-3">
                <span className="text-xs opacity-70">Margen</span>
                <input type="range" min={5} max={60} value={Math.round(margen * 100)}
                  onChange={e => setMargen(parseInt(e.target.value) / 100)}
                  className="flex-1 h-1 accent-white" />
                <input type="number" value={Math.round(margen * 100)} min={5} max={60}
                  onChange={e => setMargen(Math.max(0.05, Math.min(0.60, (parseInt(e.target.value) || 38) / 100)))}
                  className="w-12 px-1.5 py-0.5 text-sm text-right bg-white/20 border border-white/30 rounded font-bold text-white" />
                <span className="text-xs font-bold">%</span>
              </div>
              <p className="text-xs opacity-70 mt-2">Costo: {resultado ? formatCOP(Math.round(resultado.costo_total)) : '—'}</p>
            </div>
          </div>

          {/* Cost breakdown */}
          {resultado && (
            <div className="rounded-xl border border-[var(--color-border)] p-4 bg-white space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Insumos</span><span className="font-semibold tabular-nums">{formatCOP(Math.round(resultado.costo_insumos))}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Mano de obra</span><span className="font-semibold tabular-nums">{formatCOP(Math.round(resultado.costo_mo))}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Transporte</span><span className="font-semibold tabular-nums">{formatCOP(Math.round(resultado.costo_transporte))}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Corte láser</span><span className="font-semibold tabular-nums">{formatCOP(Math.round(resultado.costo_laser))}</span></div>
              {resultado.costo_poliza > 0 && <div className="flex justify-between"><span className="text-slate-500">Póliza</span><span className="font-semibold tabular-nums">{formatCOP(Math.round(resultado.costo_poliza))}</span></div>}
              {customTotal > 0 && <div className="flex justify-between"><span className="text-slate-500">Líneas custom</span><span className="font-semibold tabular-nums">{formatCOP(Math.round(customTotal))}</span></div>}
              <div className="flex justify-between pt-1.5 border-t border-slate-200">
                <span className="font-bold text-slate-700">Costo total</span>
                <span className="font-bold tabular-nums">{formatCOP(Math.round(resultado.costo_total + customTotal))}</span>
              </div>
            </div>
          )}

          {/* APU detail */}
          {resultado && (
            <>
              <button onClick={() => setShowAPU(!showAPU)} className="w-full text-left text-xs text-[var(--color-primary)] font-medium flex items-center gap-1 px-1">
                {showAPU ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                {showAPU ? 'Ocultar' : 'Ver'} APU detallado ({resultado.lineas.length} líneas)
              </button>
              {showAPU && (
                <div className="rounded-xl border border-[var(--color-border)] p-3 max-h-[400px] overflow-y-auto bg-white text-[10px]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-1 font-medium text-slate-500">Descripción</th>
                        <th className="text-right py-1 font-medium text-slate-500 w-12">Cant</th>
                        <th className="text-right py-1 font-medium text-slate-500 w-16">P.Unit</th>
                        <th className="text-right py-1 font-medium text-slate-500 w-16">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultado.lineas.map((l, i) => (
                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="py-1 text-slate-600 truncate max-w-[140px]">{l.descripcion}</td>
                          <td className="py-1 text-right tabular-nums">{l.cantidad < 10 ? l.cantidad.toFixed(2) : Math.round(l.cantidad)}</td>
                          <td className="py-1 text-right tabular-nums text-slate-400">{formatCOP(Math.round(l.precio_unitario))}</td>
                          <td className="py-1 text-right tabular-nums font-medium pr-1">{formatCOP(Math.round(l.total))}</td>
                        </tr>
                      ))}
                      {/* Custom lines */}
                      {customLineas.map((cl, i) => (
                        <tr key={`c${i}`} className="border-b border-amber-100 bg-amber-50/30">
                          <td className="py-1"><input value={cl.descripcion} onChange={e => setCustomLineas(p => p.map((c, j) => j === i ? { ...c, descripcion: e.target.value } : c))} className="w-full px-1 py-0.5 border border-amber-200 rounded" placeholder="Descripción" /></td>
                          <td className="py-1"><input type="number" value={cl.cantidad} onChange={e => setCustomLineas(p => p.map((c, j) => j === i ? { ...c, cantidad: Number(e.target.value) } : c))} className="w-full px-1 py-0.5 border border-amber-200 rounded text-right" /></td>
                          <td className="py-1"><input type="number" value={cl.precio_unitario} onChange={e => setCustomLineas(p => p.map((c, j) => j === i ? { ...c, precio_unitario: Number(e.target.value) } : c))} className="w-full px-1 py-0.5 border border-amber-200 rounded text-right" /></td>
                          <td className="py-1 text-right font-medium tabular-nums">{formatCOP(Math.round(cl.cantidad * cl.precio_unitario))}
                            <button onClick={() => setCustomLineas(p => p.filter((_, j) => j !== i))} className="ml-1 text-red-400"><X size={10} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button onClick={() => setCustomLineas(p => [...p, { descripcion: '', cantidad: 1, precio_unitario: 0 }])}
                    className="text-[var(--color-primary)] font-medium flex items-center gap-1 mt-1 hover:underline">
                    <Plus size={10} /> Agregar línea
                  </button>
                </div>
              )}
            </>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button onClick={handleAdd} disabled={!resultado}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
              <Package size={15} /> AGREGAR AL PEDIDO
            </button>
            <button onClick={() => navigate(`/oportunidades/${id}`)} className="px-5 h-11 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

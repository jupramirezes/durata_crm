/**
 * ConfiguradorGenerico v2 — Professional data-driven product configurator
 * Matches ConfiguradorMesa quality: full APU, editable lines, sticky price panel.
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import { calcularApuRaw, preloadProductData, isMotorGenericoReady } from '../lib/motor-generico'
import { evalFormula } from '../lib/evaluar-formula'
import type { Variables } from '../lib/evaluar-formula'
import { formatCOP } from '../lib/utils'
import { showToast } from '../components/Toast'
import { supabase } from '../lib/supabase'
import {
  ArrowLeft, ChevronDown, ChevronRight, Package, Plus, X,
  Ruler, Layers, Grid3X3, Settings, Box, Circle,
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
  poliza:     { label: 'PÓLIZA',        bg: 'bg-[var(--color-surface-2)]',   color: 'text-[var(--color-text-muted)]',    border: 'border-[var(--color-border)]',  dot: 'bg-[var(--color-text-faint)]' },
  addon:      { label: 'EXTRAS',        bg: 'bg-purple-50', color: 'text-purple-700',  border: 'border-purple-200',dot: 'bg-purple-500' },
} as const
const SEC_ORDER = ['insumos', 'mo', 'transporte', 'laser', 'poliza', 'addon'] as const

const GROUP_STYLE: Record<string, { icon: typeof Ruler; bg: string; text: string }> = {
  Dimensiones:              { icon: Ruler,   bg: 'bg-blue-50',    text: 'text-blue-600' },
  'Dimensiones principales':{ icon: Ruler,   bg: 'bg-blue-50',    text: 'text-blue-600' },
  Material:                 { icon: Layers,  bg: 'bg-emerald-50', text: 'text-emerald-600' },
  Configuracion:            { icon: Grid3X3, bg: 'bg-purple-50',  text: 'text-purple-600' },
  Accesorios:               { icon: Circle,  bg: 'bg-orange-50',  text: 'text-orange-600' },
  Extras:                   { icon: Settings,bg: 'bg-[var(--color-surface-2)]',  text: 'text-[var(--color-text-label)]' },
  General:                  { icon: Box,     bg: 'bg-[var(--color-surface-2)]',   text: 'text-[var(--color-text-label)]' },
  Salpicaderos:             { icon: Layers,  bg: 'bg-orange-50',  text: 'text-orange-600' },
  Babero:                   { icon: Layers,  bg: 'bg-orange-50',  text: 'text-orange-600' },
  Pozuelos:                 { icon: Circle,  bg: 'bg-orange-50',  text: 'text-orange-600' },
  Vertedero:                { icon: Box,     bg: 'bg-orange-50',  text: 'text-orange-600' },
  'Desague':                { icon: Box,     bg: 'bg-orange-50',  text: 'text-orange-600' },
}
const DEFAULT_GROUP_STYLE = { icon: Settings, bg: 'bg-[var(--color-surface-2)]', text: 'text-[var(--color-text-label)]' }

/* ── Description templates ──────────────────────────── */

/**
 * Replace {variable} placeholders and [variable:text_if_true|text_if_false] conditionals.
 * Examples:
 *   {largo} → "2.00"
 *   [instalacion:e instalación|] → "e instalación" if instalacion==1, "" if 0
 *   [poliza:Con póliza.|Sin póliza.] → "Con póliza." or "Sin póliza."
 */
function applyDescTemplate(template: string, v: Variables): string {
  // Step 1: Resolve conditionals [variable:true_text|false_text]
  let result = template.replace(/\[(\w+):([^|]*)\|([^\]]*)\]/g, (_, key, trueText, falseText) => {
    const val = v[key]
    const isTruthy = val === 1 || val === true || val === 'SI' || val === '1' || (typeof val === 'number' && val > 0)
    return isTruthy ? trueText : falseText
  })

  // Step 2: Resolve simple conditionals [variable:text_if_true] (no false branch)
  result = result.replace(/\[(\w+):([^\]]+)\]/g, (_, key, trueText) => {
    const val = v[key]
    const isTruthy = val === 1 || val === true || val === 'SI' || val === '1' || (typeof val === 'number' && val > 0)
    return isTruthy ? trueText : ''
  })

  // Step 3: Resolve {variable} placeholders
  result = result.replace(/\{(\w+)\}/g, (_, key) => {
    const val = v[key]
    if (val == null) return `{${key}}`
    if (typeof val === 'number') return val % 1 === 0 ? String(val) : val.toFixed(2)
    return String(val)
  })

  // Clean up double spaces from removed conditionals
  return result.replace(/\s{2,}/g, ' ').trim()
}

function buildDescription(pid: string, v: Variables, descTemplate?: string): string {
  // If there's a template from productos_catalogo, use it
  if (descTemplate) return applyDescTemplate(descTemplate, v)

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
  const [searchParams] = useSearchParams()
  const editProductoId = searchParams.get('editar')
  const navigate = useNavigate()
  const { state, dispatch } = useStore()
  const oportunidad = state.oportunidades.find(o => o.id === id)
  const empresa = state.empresas.find(e => oportunidad?.empresa_id === e.id)
  const productoId = paramPid || 'mesa'

  // If editing, load existing product
  const productoExistente = editProductoId ? state.productos.find(p => p.id === editProductoId) : null

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [variables, setVariables] = useState<ProdVar[]>([])
  const [productoNombre, setProductoNombre] = useState('')
  const [valores, setValores] = useState<Variables>({})
  const [margen, setMargen] = useState(0.38)
  const [cantidad, setCantidad] = useState(1)
  const [descripcionEdit, setDescripcionEdit] = useState('')
  const [descManual, setDescManual] = useState(false)
  const [descTemplate, setDescTemplate] = useState<string | undefined>()
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
        // Normalize margen: handle both 0.38 and 38 formats
        const rawMargen = cat.margen_default || 0.38
        setMargen(rawMargen >= 1 ? rawMargen / 100 : rawMargen)
        if (cat.desc_template) setDescTemplate(cat.desc_template)
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
        // If editing, restore saved variable values over defaults
        if (productoExistente?.configuracion?.variables) {
          const saved = productoExistente.configuracion.variables as Variables
          for (const key of Object.keys(saved)) {
            if (key in defs) defs[key] = saved[key]
          }
        }
        setValores(defs)
        // Restore editing state
        if (productoExistente) {
          if (productoExistente.cantidad) setCantidad(productoExistente.cantidad)
          if (productoExistente.configuracion?.totales?.margen != null) {
            const m = productoExistente.configuracion.totales.margen
            setMargen(m >= 1 ? m / 100 : m)
          }
          if (productoExistente.descripcion_comercial) {
            setDescripcionEdit(productoExistente.descripcion_comercial)
            setDescManual(true)
          }
        }
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
    if (!descManual && computedVars.largo != null) setDescripcionEdit(buildDescription(productoId, computedVars, descTemplate))
  }, [computedVars, productoId, descManual, descTemplate])

  const updateVar = useCallback((n: string, v: number | string) => setValores(p => ({ ...p, [n]: v })), [])
  const toggleGroup = (g: string) => setExpandedGroups(p => { const n = new Set(p); n.has(g) ? n.delete(g) : n.add(g); return n })

  const groups = useMemo(() => {
    const order: string[] = []; const map = new Map<string, ProdVar[]>()
    for (const v of variables) { if (v.grupo_ui.startsWith('_')) continue; if (!map.has(v.grupo_ui)) { map.set(v.grupo_ui, []); order.push(v.grupo_ui) }; map.get(v.grupo_ui)!.push(v) }
    return order.map(g => [g, map.get(g)!] as [string, ProdVar[]])
  }, [variables])

  const handleAdd = () => {
    if (!resultado || !full) return
    const desc = descripcionEdit || resultado.descripcion_comercial

    // 1. Build all lines: motor lines + custom lines, with overrides applied
    const motorLines = full.allLineas.filter(l => l.activa).map(l => {
      const ov = lineOverrides[l.descripcion]
      const cant = ov?.cant ?? l.cantidad
      const pu = ov?.pu ?? l.precio_unitario
      return {
        nombre: l.descripcion,
        seccion: l.seccion,
        cantidad: cant,
        cantidad_override: ov?.cant,
        precio_unitario: pu,
        precio_override: ov?.pu,
        total: cant * pu * (1 + (l.desperdicio || 0)),
        material_codigo: l.material || undefined,
        es_custom: false,
      }
    })
    const customLinesSnap = customLines.map(cl => ({
      nombre: cl.desc,
      seccion: 'insumos' as const,
      cantidad: cl.cant,
      precio_unitario: cl.pu,
      total: cl.cant * cl.pu,
      material_codigo: undefined as string | undefined,
      es_custom: true,
    }))
    const todasLasLineas = [...motorLines, ...customLinesSnap]

    // 2. Recalculate totals from adjusted lines
    const sumSec = (sec: string) => todasLasLineas.filter(l => l.seccion === sec).reduce((s, l) => s + l.total, 0)
    const totalesAjustados = {
      insumos: sumSec('insumos'),
      mo: sumSec('mo'),
      transporte: sumSec('transporte'),
      laser: sumSec('laser'),
      poliza: sumSec('poliza'),
    }
    const costoAjustado = Object.values(totalesAjustados).reduce((a, b) => a + b, 0)
    const precioVentaAjustado = Math.ceil(Math.round(costoAjustado / (1 - margen)) / 1000) * 1000

    // 3. Build snapshot
    const snapshot = {
      producto_id: productoId,
      variables: { ...computedVars },
      lineas_apu: todasLasLineas,
      totales: {
        ...totalesAjustados,
        costo_total: costoAjustado,
        margen,
        precio_venta: precioVentaAjustado,
      },
      descripcion_comercial: desc,
      version_fecha: new Date().toISOString().split('T')[0],
    }

    // 4. Build adjusted ApuResultado (not the base motor result)
    const apuAjustado = {
      lineas: todasLasLineas.filter(l => l.seccion === 'insumos').map(l => ({
        descripcion: l.nombre,
        material: l.material_codigo || '',
        cantidad: l.cantidad,
        unidad: 'm²',
        precio_unitario: l.precio_unitario,
        desperdicio: 0,
        total: l.total,
      })),
      costo_insumos: totalesAjustados.insumos,
      costo_mo: totalesAjustados.mo,
      costo_transporte: totalesAjustados.transporte,
      costo_laser: totalesAjustados.laser,
      costo_poliza: totalesAjustados.poliza,
      costo_total: costoAjustado,
      precio_venta: precioVentaAjustado,
      precio_comercial: precioVentaAjustado,
      margen,
      descripcion_comercial: desc,
    }

    if (editProductoId && productoExistente) {
      dispatch({ type: 'UPDATE_PRODUCTO', payload: { id: editProductoId, configuracion: snapshot, apu_resultado: apuAjustado, precio_calculado: precioVentaAjustado, descripcion_comercial: desc, cantidad } })
      showToast('success', `${productoNombre} actualizado`)
    } else {
      dispatch({ type: 'ADD_PRODUCTO', payload: { oportunidad_id: id!, categoria: productoNombre, subtipo: productoNombre, configuracion: snapshot, apu_resultado: apuAjustado, precio_calculado: precioVentaAjustado, descripcion_comercial: desc, cantidad } })
      showToast('success', `${productoNombre} agregado al pedido`)
    }
    setTimeout(() => navigate(`/oportunidades/${id}`), 500)
  }

  if (loading) return <div className="flex items-center justify-center h-[60vh] text-[var(--color-text-label)]">Cargando configurador...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="page">
      {/* Header (handoff: crumb + title + back en linea) */}
      <button
        onClick={() => navigate(`/oportunidades/${id}`)}
        className="btn-d ghost sm"
        style={{ marginBottom: 14, padding: '0 8px' }}
      >
        <ArrowLeft size={13} /> Volver a oportunidad
      </button>

      <div className="opp-header">
        <div className="body">
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--color-text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
            {editProductoId ? 'Editar producto' : 'Configurar producto'}
          </div>
          <div className="opp-title">{productoNombre}</div>
          <div className="opp-company-line">
            <strong>{empresa?.nombre || '—'}</strong>
            {oportunidad && (() => {
              // Mostrar # cot activa más reciente (en lugar del UUID de la opp)
              const latest = state.cotizaciones
                .filter(c => c.oportunidad_id === oportunidad.id && !['descartada','rechazada'].includes(c.estado))
                .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))[0]
              return latest ? (<><span className="sep">·</span><span className="mono">COT {latest.numero}</span></>) : null
            })()}
          </div>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* LEFT: Controls */}
        <div className="flex-1 space-y-3 min-w-0">
          {groups.map(([gn, gv]) => {
            const gs = GROUP_STYLE[gn] || DEFAULT_GROUP_STYLE
            const Ic = gs.icon; const isDimOrMat = gn === 'Dimensiones principales' || gn === 'Dimensiones' || gn === 'Material'
            return (
              <div key={gn} className="bg-white rounded-xl border border-[var(--color-border)] shadow-card overflow-hidden">
                <button onClick={() => toggleGroup(gn)} className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--color-surface-hover)]/80 transition-colors">
                  <div className={`w-8 h-8 rounded-lg ${gs.bg} flex items-center justify-center shrink-0`}><Ic size={16} className={gs.text} /></div>
                  <span className="text-sm font-semibold text-[var(--color-text)] flex-1 text-left">{gn}</span>
                  {!expandedGroups.has(gn) && <span className="text-xs text-[var(--color-text-faint)] mr-2">{gv.filter(v => v.tipo !== 'calculado').slice(0, 3).map(v => { const val = computedVars[v.nombre]; return v.tipo === 'toggle' ? (val ? '✓' : '—') : `${val}${v.unidad || ''}` }).join(' · ')}</span>}
                  {expandedGroups.has(gn) ? <ChevronDown size={16} className="text-[var(--color-text-faint)]" /> : <ChevronRight size={16} className="text-[var(--color-text-faint)]" />}
                </button>
                {expandedGroups.has(gn) && (
                  <div className="px-5 pb-4 pt-1 border-t border-[var(--color-border-light)]">
                    {isDimOrMat ? (
                      <div className="grid grid-cols-3 gap-3">
                        {gv.map(v => (
                          <div key={v.nombre}>
                            <label className="text-xs font-medium text-[var(--color-text-label)] mb-1.5 block">{v.label}</label>
                            {v.tipo === 'numero' && <div className="flex items-center gap-1.5 border border-[var(--color-border)] rounded-lg px-3 py-2 bg-white hover:border-[var(--color-primary)]"><input type="number" value={Number(computedVars[v.nombre]) || 0} onChange={e => updateVar(v.nombre, parseFloat(e.target.value) || 0)} step={v.unidad === 'm' ? 0.01 : 1} min={v.min_val ?? undefined} max={v.max_val ?? undefined} className="w-full text-sm font-medium text-right bg-transparent outline-none tabular-nums" />{v.unidad && <span className="text-xs text-[var(--color-text-faint)] shrink-0">{v.unidad}</span>}</div>}
                            {v.tipo === 'seleccion' && <select value={String(computedVars[v.nombre])} onChange={e => updateVar(v.nombre, e.target.value)} className="w-full px-3 py-2 text-sm font-medium border border-[var(--color-border)] rounded-lg bg-white hover:border-[var(--color-primary)]">{(v.opciones || []).map(o => <option key={o} value={o}>{o}</option>)}</select>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {gv.map(v => (
                          <div key={v.nombre}>
                            {v.tipo === 'numero' && (
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-[var(--color-text-muted)] w-[180px] shrink-0">{v.label}</span>
                                <div className="flex items-center gap-1.5 border border-[var(--color-border)] rounded-lg px-3 py-2 bg-white hover:border-[var(--color-primary)] w-[110px]">
                                  <input type="number" value={Number(computedVars[v.nombre]) || 0} onChange={e => updateVar(v.nombre, parseFloat(e.target.value) || 0)} step={v.unidad === 'm' ? 0.01 : 1} min={v.min_val ?? undefined} max={v.max_val ?? undefined} className="w-full text-sm font-medium text-right bg-transparent outline-none tabular-nums" />
                                  {v.unidad && <span className="text-xs text-[var(--color-text-faint)] shrink-0">{v.unidad}</span>}
                                </div>
                              </div>
                            )}
                            {v.tipo === 'toggle' && <label className="flex items-center gap-3 cursor-pointer py-0.5"><input type="checkbox" checked={!!computedVars[v.nombre]} onChange={e => updateVar(v.nombre, e.target.checked ? 1 : 0)} className="w-4.5 h-4.5 accent-blue-600 rounded" /><span className="text-sm text-[var(--color-text-muted)]">{v.label}</span></label>}
                            {v.tipo === 'seleccion' && <div className="flex items-center gap-3"><span className="text-sm text-[var(--color-text-muted)] w-[180px] shrink-0">{v.label}</span><select value={String(computedVars[v.nombre])} onChange={e => updateVar(v.nombre, e.target.value)} className="px-3 py-2 text-sm font-medium border border-[var(--color-border)] rounded-lg bg-white hover:border-[var(--color-primary)]">{(v.opciones || []).map(o => <option key={o} value={o}>{o}</option>)}</select></div>}
                            {v.tipo === 'calculado' && <div className="flex items-center gap-3 bg-[var(--color-surface-2)] px-4 py-2 rounded-lg"><span className="text-sm text-[var(--color-text-label)] flex-1">{v.label}</span><span className="text-sm font-bold text-[var(--color-text)] tabular-nums">{Math.round(Number(computedVars[v.nombre]) || 0)}</span></div>}
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
          <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-card p-5">
            <label className="text-xs font-semibold text-[var(--color-text-label)] uppercase tracking-wider mb-2 block">Descripción comercial</label>
            <textarea value={descripcionEdit} onChange={e => { setDescripcionEdit(e.target.value); setDescManual(true) }} rows={3}
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg resize-none focus:border-blue-400 focus:outline-none leading-relaxed" />
          </div>
        </div>

        {/* RIGHT: Price + APU (sticky) */}
        <div className="w-[380px] shrink-0 space-y-3" style={{ position: 'sticky', top: 80 }}>
          {/* Price card */}
          <div className="rounded-[var(--radius-xl)] p-6 text-white" style={{ background: 'linear-gradient(135deg, var(--color-accent-green) 0%, oklch(0.50 0.10 155) 100%)', boxShadow: 'var(--shadow-md)' }}>
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
            <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-card overflow-hidden">
              <button onClick={() => setShowAPU(!showAPU)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--color-surface-hover)] transition-colors">
                <span className="text-xs font-semibold text-[var(--color-text-label)] uppercase tracking-wider">Desglose APU</span>
                <span className="text-xs text-[var(--color-text-faint)]">{full.allLineas.filter(l => l.activa).length} líneas {showAPU ? '▾' : '▸'}</span>
              </button>
              {showAPU && (
                <div className="max-h-[500px] overflow-y-auto">
                  {/* Column headers */}
                  <div className="sticky top-0 z-10 bg-white border-b border-[var(--color-border)]">
                    <table className="w-full text-[10px]"><thead><tr className="text-[var(--color-text-faint)] uppercase tracking-wider">
                      <th className="py-1.5 pl-4 text-left font-semibold">Descripcion</th>
                      <th className="py-1.5 w-14 pr-1 text-right font-semibold">Cant</th>
                      <th className="py-1.5 w-16 pr-1 text-right font-semibold">P.Unit</th>
                      <th className="py-1.5 pr-3 text-right font-semibold">Total</th>
                    </tr></thead></table>
                  </div>
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
                              <tr key={`${sec}-${li}`} className={`border-b border-[var(--color-border-light)] ${isOverridden ? 'bg-amber-50/40' : 'hover:bg-[var(--color-surface-hover)]/50'}`}>
                                <td className="py-1 pl-4 text-[var(--color-text-muted)] max-w-[100px] truncate text-[10px]">
                                  {l.descripcion}
                                  {isMissing && <span className="text-red-500 ml-1" title="Precio no encontrado en precios_maestro">⚠</span>}
                                </td>
                                <td className="py-1 w-14 pr-1">
                                  <input type="number" value={Number(dispCant.toFixed(4))} step={0.01}
                                    onChange={e => setLineOverrides(p => ({ ...p, [oKey]: { ...p[oKey], cant: parseFloat(e.target.value) || 0 } }))}
                                    className={`w-full text-right text-[10px] tabular-nums bg-transparent outline-none ${isOverridden ? 'text-amber-700 font-semibold' : 'text-[var(--color-text-label)]'} hover:bg-white hover:border hover:border-[var(--color-border)] hover:rounded px-1`} />
                                </td>
                                <td className="py-1 w-16 pr-1">
                                  <input type="number" value={Math.round(dispPu)} step={100}
                                    onChange={e => setLineOverrides(p => ({ ...p, [oKey]: { ...p[oKey], pu: parseFloat(e.target.value) || 0 } }))}
                                    className={`w-full text-right text-[10px] tabular-nums bg-transparent outline-none ${isMissing ? 'text-red-500' : isOverridden ? 'text-amber-700 font-semibold' : 'text-[var(--color-text-faint)]'} hover:bg-white hover:border hover:border-[var(--color-border)] hover:rounded px-1`} />
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
                        <div key={i} className="flex items-center gap-1 px-4 py-1 text-[11px] border-b border-[var(--color-border-light)]">
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
                  <div className="px-4 py-3 bg-[var(--color-surface-2)] border-t border-[var(--color-border)] space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-[var(--color-text-label)]">Insumos</span><span className="font-semibold tabular-nums">{formatCOP(Math.round(full.totalInsumos))}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--color-text-label)]">Mano de obra</span><span className="font-semibold tabular-nums">{formatCOP(Math.round(full.totalMO))}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--color-text-label)]">Transporte</span><span className="font-semibold tabular-nums">{formatCOP(Math.round(full.totalTransporte))}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--color-text-label)]">Corte láser</span><span className="font-semibold tabular-nums">{formatCOP(Math.round(full.totalLaser))}</span></div>
                    {full.totalPoliza > 0 && <div className="flex justify-between"><span className="text-[var(--color-text-label)]">Póliza</span><span className="font-semibold tabular-nums">{formatCOP(Math.round(full.totalPoliza))}</span></div>}
                    {overrideDelta !== 0 && <div className="flex justify-between text-amber-600"><span>Ajustes manuales</span><span className="font-semibold tabular-nums">{overrideDelta > 0 ? '+' : ''}{formatCOP(Math.round(overrideDelta))}</span></div>}
                    {customTotal > 0 && <div className="flex justify-between"><span className="text-[var(--color-text-label)]">Adicionales</span><span className="font-semibold tabular-nums">{formatCOP(Math.round(customTotal))}</span></div>}
                    <div className="flex justify-between pt-1.5 border-t border-[var(--color-border-strong)]"><span className="font-bold text-[var(--color-text)]">Costo total</span><span className="font-bold tabular-nums">{formatCOP(Math.round(adjustedCostoTotal))}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={!resultado} className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-card disabled:opacity-40"><Package size={16} /> {editProductoId ? 'ACTUALIZAR PRODUCTO' : 'AGREGAR AL PEDIDO'}</button>
            <button onClick={() => navigate(`/oportunidades/${id}`)} className="px-5 h-12 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-colors">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

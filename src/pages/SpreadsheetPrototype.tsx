/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * SpreadsheetPrototype.tsx — EXPERIMENTAL prototype for spreadsheet-based quoting.
 *
 * This is a PROTOTYPE that coexists with the current ConfiguradorGenerico flow.
 * It demonstrates an embedded editable spreadsheet (Univer.js) pre-loaded with
 * real APU lines from producto_lineas_apu, with live formulas and section subtotals.
 *
 * Route: /oportunidades/:id/spreadsheet/:productoId
 * Supported products: mesa, carcamo
 *
 * NOT wired to persistence. "Simular guardar" just console.logs the JSON.
 *
 * Many `any` types are used deliberately because Univer's API surface is
 * dynamic and the typed facade is not fully exported from @univerjs/presets.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { ArrowLeft, Download, Save, FlaskConical } from 'lucide-react'
import { useStore } from '../lib/store'
import { calcularApuRaw, preloadProductData, isMotorGenericoReady } from '../lib/motor-generico'
import type { Variables } from '../lib/evaluar-formula'
import { supabase } from '../lib/supabase'
import { formatCOP } from '../lib/utils'
import { showToast } from '../components/Toast'

/* ── Univer imports ────────────────────────────────────────────────── */
import { createUniver, LocaleType } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import UniverPresetSheetsCoreEsES from '@univerjs/preset-sheets-core/locales/es-ES'
import '@univerjs/preset-sheets-core/lib/index.css'

/* ── Default variables per product ─────────────────────────────────── */
const DEFAULT_VARS: Record<string, Variables> = {
  mesa: {
    largo: 2.0, ancho: 0.7, alto: 0.9,
    tipo_acero: '304', acabado: 'MATE', calibre: '18',
    desarrollo_omegas: 0.15,
    salp_longitudinal: 0, salp_costado: 0, alto_salpicadero: 0.1,
    babero: 0, alto_babero: 0.25, babero_costados: 0,
    refuerzo_rh: 0, entrepanos: 1, patas: 4,
    ruedas: 0, num_ruedas: 0,
    pozuelos_rect: 0, poz_largo: 0.54, poz_ancho: 0.39, poz_alto: 0.18,
    pozuelo_redondo: 0, escabiladero: 0, cant_bandejeros: 0,
    vertedero: 0, diametro_vertedero: 0.45, prof_vertedero: 0.5,
    poliza: 0, instalado: 1, push_pedal: 0, instalacion: 1,
    tornillos_por_m: 4, pl285_m2_galon: 4, metros_rollo_cinta: 32,
  },
  carcamo: {
    largo: 2.0, ancho: 0.25, alto: 0.095,
    calibre_cuerpo: 18, calibre_tapa: 12,
    largo_desague: 0.5,
    poliza: 0, instalacion: 1, instalado: 1,
  },
}

/* ── Product-specific grid rows schema ─────────────────────────────── */
interface GridRow {
  seccion: string
  descripcion: string
  material: string
  cantidad: number
  unidad: string
  precio_unitario: number
  desperdicio: number // 0..1
}

const SECTION_LABEL: Record<string, string> = {
  insumos: 'INSUMOS',
  mo: 'MANO DE OBRA',
  transporte: 'TRANSPORTE',
  laser: 'CORTE LÁSER',
  poliza: 'PÓLIZA',
  addon: 'EXTRAS',
}

const SUPPORTED_PRODUCTS = ['mesa', 'carcamo'] as const

const SECTION_COLOR: Record<string, { bg: number; fg: number }> = {
  insumos: { bg: 0xDBEAFE, fg: 0x1E40AF },   // blue
  mo: { bg: 0xFEF3C7, fg: 0x92400E },         // amber
  transporte: { bg: 0xD1FAE5, fg: 0x065F46 }, // emerald
  laser: { bg: 0xFEE2E2, fg: 0x991B1B },      // red
  poliza: { bg: 0xF3F4F6, fg: 0x374151 },     // gray
  addon: { bg: 0xE9D5FF, fg: 0x5B21B6 },      // purple
}

export default function SpreadsheetPrototype() {
  const { id, productoId } = useParams<{ id: string; productoId: string }>()
  const navigate = useNavigate()
  const { state } = useStore()

  const containerRef = useRef<HTMLDivElement | null>(null)
  const univerRef = useRef<any>(null)
  const univerAPIRef = useRef<any>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [productoNombre, setProductoNombre] = useState('')
  const [rows, setRows] = useState<GridRow[]>([])
  const [margen, setMargen] = useState(0.38)
  const [sheetTotals, setSheetTotals] = useState<{ sections: Record<string, number>; grand: number; final: number }>(
    { sections: {}, grand: 0, final: 0 }
  )

  const pid = productoId || 'mesa'
  const isSupported = (SUPPORTED_PRODUCTS as readonly string[]).includes(pid)

  const empresaNombre = useMemo(() => {
    const opp = state.oportunidades.find(o => o.id === id)
    if (!opp) return ''
    return state.empresas.find(e => e.id === opp.empresa_id)?.nombre || ''
  }, [state.empresas, state.oportunidades, id])

  /* ── Load APU data via motor-generico and build initial rows ────── */
  useEffect(() => {
    if (!isSupported) {
      setError(`Producto "${pid}" no soportado en el prototipo. Solo: ${SUPPORTED_PRODUCTS.join(', ')}`)
      setLoading(false)
      return
    }
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        // Product name
        const { data: cat } = await supabase
          .from('productos_catalogo')
          .select('nombre, margen_default')
          .eq('id', pid)
          .single()
        if (!cancelled) {
          setProductoNombre(cat?.nombre || pid)
          const m = cat?.margen_default || 0.38
          setMargen(m >= 1 ? m / 100 : m)
        }

        // Load APU via motor
        const ok = await preloadProductData(pid)
        if (!ok || !isMotorGenericoReady(pid)) {
          throw new Error('No se pudo cargar el producto desde Supabase')
        }
        const calc = calcularApuRaw(cat?.nombre || pid, DEFAULT_VARS[pid], state.precios, 0.38)
        if (!calc || !calc.full) throw new Error('calcularApuRaw devolvio null')

        const initial: GridRow[] = calc.full.allLineas
          .filter(l => l.activa)
          .map(l => ({
            seccion: l.seccion,
            descripcion: l.descripcion,
            material: l.material || '',
            cantidad: Number(l.cantidad.toFixed(4)),
            unidad: 'm²',
            precio_unitario: Math.round(l.precio_unitario),
            desperdicio: l.desperdicio || 0,
          }))

        if (!cancelled) setRows(initial)
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Error cargando producto')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [pid, state.precios, isSupported])

  /* ── Init Univer once rows + container ready ─────────────────────── */
  useEffect(() => {
    if (loading || error || !containerRef.current || rows.length === 0) return
    if (univerRef.current) return // already initialized

    try {
      const { univer, univerAPI } = createUniver({
        locale: LocaleType.ES_ES,
        locales: {
          [LocaleType.ES_ES]: UniverPresetSheetsCoreEsES,
        },
        presets: [
          UniverSheetsCorePreset({
            container: containerRef.current,
          }),
        ],
      })

      univerRef.current = univer
      univerAPIRef.current = univerAPI

      // Build workbook data
      const SECTION_ORDER = ['insumos', 'mo', 'transporte', 'laser', 'poliza', 'addon']
      const sortedRows = [...rows].sort((a, b) => {
        const da = SECTION_ORDER.indexOf(a.seccion)
        const db = SECTION_ORDER.indexOf(b.seccion)
        return da - db
      })

      // Build cellData — header + section bands + rows + subtotal rows + grand total
      const cellData: Record<number, Record<number, any>> = {}

      // Row 0 — Header row
      const headers = ['Sección', 'Descripción', 'Material', 'Cantidad', 'Unidad', 'P. Unit', 'Desp%', 'Total']
      cellData[0] = {}
      headers.forEach((h, c) => {
        cellData[0][c] = {
          v: h,
          s: {
            bg: { rgb: '#1e293b' },
            cl: { rgb: '#ffffff' },
            bl: 1,
            ht: 2, // horizontal align center
          },
        }
      })

      // Data rows (by section with subtotal rows between)
      let curRow = 1
      const sectionSubtotalRows: Record<string, number> = {}
      let prevSection = ''
      const dataStartRowBySection: Record<string, number> = {}
      const dataEndRowBySection: Record<string, number> = {}

      for (const r of sortedRows) {
        if (r.seccion !== prevSection) {
          if (prevSection && dataStartRowBySection[prevSection] !== undefined) {
            // Emit subtotal row for prev section
            dataEndRowBySection[prevSection] = curRow - 1
            const startR = dataStartRowBySection[prevSection] + 1 // +1 for 1-based A1 notation
            const endR = dataEndRowBySection[prevSection] + 1
            cellData[curRow] = {
              0: { v: '', s: { bg: { rgb: '#f1f5f9' } } },
              1: { v: `Subtotal ${SECTION_LABEL[prevSection] || prevSection}`, s: { bg: { rgb: '#f1f5f9' }, bl: 1 } },
              2: { v: '', s: { bg: { rgb: '#f1f5f9' } } },
              3: { v: '', s: { bg: { rgb: '#f1f5f9' } } },
              4: { v: '', s: { bg: { rgb: '#f1f5f9' } } },
              5: { v: '', s: { bg: { rgb: '#f1f5f9' } } },
              6: { v: '', s: { bg: { rgb: '#f1f5f9' } } },
              7: { f: `=SUM(H${startR}:H${endR})`, s: { bg: { rgb: '#f1f5f9' }, bl: 1 } },
            }
            sectionSubtotalRows[prevSection] = curRow
            curRow += 1
          }
          dataStartRowBySection[r.seccion] = curRow
        }

        const secColor = SECTION_COLOR[r.seccion] || SECTION_COLOR.insumos
        const bgHex = '#' + secColor.bg.toString(16).padStart(6, '0')
        const fgHex = '#' + secColor.fg.toString(16).padStart(6, '0')

        cellData[curRow] = {
          0: { v: (SECTION_LABEL[r.seccion] || r.seccion), s: { bg: { rgb: bgHex }, cl: { rgb: fgHex }, bl: 1 } },
          1: { v: r.descripcion },
          2: { v: r.material },
          3: { v: r.cantidad },
          4: { v: r.unidad },
          5: { v: r.precio_unitario },
          6: { v: Math.round(r.desperdicio * 100) },
          // Live formula: Total = cantidad * precio_unit * (1 + desperdicio/100)
          7: { f: `=D${curRow + 1}*F${curRow + 1}*(1+G${curRow + 1}/100)` },
        }
        prevSection = r.seccion
        curRow += 1
      }

      // Last section subtotal
      if (prevSection && dataStartRowBySection[prevSection] !== undefined) {
        dataEndRowBySection[prevSection] = curRow - 1
        const startR = dataStartRowBySection[prevSection] + 1
        const endR = dataEndRowBySection[prevSection] + 1
        cellData[curRow] = {
          0: { v: '', s: { bg: { rgb: '#f1f5f9' } } },
          1: { v: `Subtotal ${SECTION_LABEL[prevSection] || prevSection}`, s: { bg: { rgb: '#f1f5f9' }, bl: 1 } },
          2: { v: '', s: { bg: { rgb: '#f1f5f9' } } },
          3: { v: '', s: { bg: { rgb: '#f1f5f9' } } },
          4: { v: '', s: { bg: { rgb: '#f1f5f9' } } },
          5: { v: '', s: { bg: { rgb: '#f1f5f9' } } },
          6: { v: '', s: { bg: { rgb: '#f1f5f9' } } },
          7: { f: `=SUM(H${startR}:H${endR})`, s: { bg: { rgb: '#f1f5f9' }, bl: 1 } },
        }
        sectionSubtotalRows[prevSection] = curRow
        curRow += 1
      }

      // Blank row
      curRow += 1

      // Grand total (sum of all subtotal rows)
      const subtotalRefs = Object.values(sectionSubtotalRows).map(r => `H${r + 1}`).join(',')
      cellData[curRow] = {
        1: { v: 'COSTO TOTAL', s: { bl: 1, bg: { rgb: '#fef3c7' } } },
        7: { f: subtotalRefs ? `=SUM(${subtotalRefs})` : '=0', s: { bl: 1, bg: { rgb: '#fef3c7' } } },
      }
      const costoTotalRow = curRow
      curRow += 1

      // Margin row (editable)
      cellData[curRow] = {
        1: { v: 'Margen (0..1)', s: { bg: { rgb: '#f9fafb' } } },
        7: { v: margen, s: { bg: { rgb: '#f9fafb' } } },
      }
      const margenRow = curRow
      curRow += 1

      // Precio venta row
      cellData[curRow] = {
        1: { v: 'Precio de venta (bruto)', s: { bl: 1 } },
        7: { f: `=H${costoTotalRow + 1}/(1-H${margenRow + 1})`, s: { bl: 1 } },
      }
      const precioVentaRow = curRow
      curRow += 1

      // Precio comercial row (ceil to 1000)
      cellData[curRow] = {
        1: { v: 'Precio comercial (redondeado)', s: { bl: 1, bg: { rgb: '#059669' }, cl: { rgb: '#ffffff' } } },
        7: { f: `=CEILING(H${precioVentaRow + 1},1000)`, s: { bl: 1, bg: { rgb: '#059669' }, cl: { rgb: '#ffffff' } } },
      }

      const totalRows = curRow + 10
      const totalCols = 8

      const workbookData = {
        id: 'cotizador-proto',
        name: `Cotizador ${productoNombre}`,
        appVersion: '0.1',
        sheets: {
          'sheet-1': {
            id: 'sheet-1',
            name: 'Cotización',
            cellData,
            rowCount: totalRows,
            columnCount: totalCols,
            columnData: {
              0: { w: 110 }, // Sección
              1: { w: 320 }, // Descripción
              2: { w: 120 }, // Material
              3: { w: 90 },  // Cantidad
              4: { w: 70 },  // Unidad
              5: { w: 110 }, // P.Unit
              6: { w: 70 },  // Desp%
              7: { w: 130 }, // Total
            },
          },
        },
        sheetOrder: ['sheet-1'],
      }

      univerAPI.createWorkbook(workbookData)

      // Hook into changes to recompute totals panel
      const recomputeTotals = () => {
        try {
          const wb = univerAPI.getActiveWorkbook()
          if (!wb) return
          const sheet = wb.getActiveSheet()
          if (!sheet) return
          // Read column H (index 7) values we care about
          const sectionTotals: Record<string, number> = {}
          // Section subtotal values live in sectionSubtotalRows
          for (const sec of Object.keys(sectionSubtotalRows)) {
            const row = sectionSubtotalRows[sec]
            const cell = sheet.getRange(row, 7, 1, 1)
            const v = cell.getValue()
            const num = typeof v === 'number' ? v : parseFloat(String(v)) || 0
            sectionTotals[sec] = num
          }
          const grand = Object.values(sectionTotals).reduce((a, b) => a + b, 0)
          const marginCell = sheet.getRange(margenRow, 7, 1, 1).getValue()
          const m = typeof marginCell === 'number' ? marginCell : parseFloat(String(marginCell)) || margen
          const final = Math.ceil(grand / (1 - m) / 1000) * 1000
          setSheetTotals({ sections: sectionTotals, grand, final })
        } catch {
          // ignore read errors while formulas recompute
        }
      }

      // Initial total and subscribe to changes
      setTimeout(recomputeTotals, 500)
      const api: any = univerAPI
      const disposer: any = typeof api.addEvent === 'function'
        ? api.addEvent(api.Event?.SheetValueChanged || 'SheetValueChanged', recomputeTotals)
        : null

      return () => {
        try {
          if (typeof disposer === 'function') disposer()
          else if (disposer && typeof disposer.dispose === 'function') disposer.dispose()
          ;(univer as any).dispose?.()
        } catch {
          // ignore
        }
        univerRef.current = null
        univerAPIRef.current = null
      }
    } catch (e: any) {
      console.error('[Univer init] Error:', e)
      setError(`Error iniciando spreadsheet: ${e.message}`)
    }
  }, [loading, error, rows, productoNombre, margen])

  /* ── Actions ───────────────────────────────────────────────────────── */
  const handleExportXlsx = () => {
    try {
      const api = univerAPIRef.current
      if (!api) { showToast('error', 'Spreadsheet no disponible'); return }
      const wb = api.getActiveWorkbook()
      const sheet = wb.getActiveSheet()

      // Dump cells as array of arrays via getRange over the used range
      const rowCount = sheet.getRowCount?.() || 200
      const colCount = 8
      const data: any[][] = []
      for (let r = 0; r < rowCount; r++) {
        const rowArr: any[] = []
        let nonEmpty = false
        for (let c = 0; c < colCount; c++) {
          const val = sheet.getRange(r, c, 1, 1).getValue()
          if (val !== null && val !== undefined && val !== '') nonEmpty = true
          rowArr.push(val ?? '')
        }
        data.push(rowArr)
        // break once we hit 3 consecutive empty rows
        if (!nonEmpty && data.length > 5) {
          const prev1 = data[data.length - 2]?.every(v => v === '' || v == null)
          const prev2 = data[data.length - 3]?.every(v => v === '' || v == null)
          if (prev1 && prev2) { data.pop(); data.pop(); data.pop(); break }
        }
      }

      const xwb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(data)
      XLSX.utils.book_append_sheet(xwb, ws, 'Cotización')
      const fname = `prototipo_${pid}_${new Date().toISOString().slice(0, 10)}.xlsx`
      XLSX.writeFile(xwb, fname)
      showToast('success', `Exportado: ${fname}`)
    } catch (e: any) {
      console.error('[Export xlsx] Error:', e)
      showToast('error', `Error exportando: ${e.message}`)
    }
  }

  const handleSimulateSave = () => {
    try {
      const api = univerAPIRef.current
      if (!api) { showToast('error', 'Spreadsheet no disponible'); return }
      const wb = api.getActiveWorkbook()
      const snapshot = wb.getSnapshot?.() || wb.save?.() || { note: 'No snapshot API' }
      console.log('[SpreadsheetPrototype] Simular guardar — snapshot:')
      console.log(JSON.stringify(snapshot, null, 2))
      console.log('[SpreadsheetPrototype] Totales calculados:', sheetTotals)
      showToast('success', 'JSON impreso en la consola (F12)')
    } catch (e: any) {
      console.error('[Simular guardar] Error:', e)
      showToast('error', `Error: ${e.message}`)
    }
  }

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Experimental banner */}
      <div className="mb-4 flex items-start gap-3 px-4 py-3 rounded-lg border border-amber-300 bg-amber-50">
        <FlaskConical className="text-amber-600 shrink-0 mt-0.5" size={20} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-900">Prototipo experimental — Cotizador tipo Excel</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Esta pantalla es un experimento paralelo al configurador actual. No guarda cambios
            en el CRM. Los números editables muestran fórmulas vivas como en Excel/Google Sheets.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate(`/oportunidades/${id}`)}
          className="flex items-center gap-1.5 text-sm text-[var(--color-primary)] hover:underline"
        >
          <ArrowLeft size={16} /> Volver
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-[var(--color-text)]">
            Spreadsheet: {productoNombre || pid}
          </h2>
          {empresaNombre && <p className="text-xs text-slate-500">Empresa: {empresaNombre}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportXlsx}
            disabled={loading || !!error}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-40"
          >
            <Download size={14} /> Exportar a Excel
          </button>
          <button
            onClick={handleSimulateSave}
            disabled={loading || !!error}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-40"
          >
            <Save size={14} /> Simular guardar
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-[60vh] text-slate-500">
          Cargando APU del producto...
        </div>
      )}

      {error && (
        <div className="p-6 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Univer container — needs explicit height */}
          <div
            ref={containerRef}
            className="rounded-lg border border-slate-200 bg-white overflow-hidden"
            style={{ height: '70vh', minHeight: 520 }}
          />

          {/* Totals panel (read from sheet) */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(sheetTotals.sections).map(([sec, val]) => (
              <div key={sec} className="p-3 rounded-lg border border-slate-200 bg-white">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {SECTION_LABEL[sec] || sec}
                </p>
                <p className="text-sm font-bold tabular-nums mt-1">{formatCOP(Math.round(val))}</p>
              </div>
            ))}
            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50">
              <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">Costo total</p>
              <p className="text-sm font-bold tabular-nums mt-1 text-amber-900">{formatCOP(Math.round(sheetTotals.grand))}</p>
            </div>
            <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50">
              <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
                Precio comercial
              </p>
              <p className="text-sm font-bold tabular-nums mt-1 text-emerald-800">
                {formatCOP(Math.round(sheetTotals.final))}
              </p>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-slate-500">
            Tip: edita Cantidad / P.Unit / Desp% directamente en el grid. La columna <strong>Total</strong>,
            los <strong>Subtotales</strong>, el <strong>Costo total</strong> y el <strong>Precio comercial</strong>
            recalculan automáticamente (fórmulas vivas).
            Puedes agregar/eliminar filas con clic derecho como en Excel.
          </p>
        </>
      )}
    </div>
  )
}

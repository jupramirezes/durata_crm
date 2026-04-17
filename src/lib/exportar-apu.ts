/**
 * Professional APU Excel exporter for DURATA S.A.S
 * Generates a formatted .xlsx with header, insumos, MO, transport, laser, and summary
 */
import * as XLSX from 'xlsx'
import type { ApuResultado, ConfigMesa } from '../types'
import { isProductoSnapshot } from '../types'


interface ApuExportParams {
  resultado: ApuResultado
  config: Record<string, any>  // ConfigMesa (legacy) or ProductoSnapshot (new)
  /** Cotización number, e.g. "2026-410" */
  cotizacionNumero?: string
  empresaNombre?: string
  contactoNombre?: string
  fecha?: string
  /** If true, export as preview (no cot number, simpler filename) */
  preview?: boolean
}

function extractConfigInfo(config: Record<string, any>): { materialLabel: string; dims: string } {
  if (isProductoSnapshot(config)) {
    const v = config.variables
    const largo = Number(v.largo) || 0
    const ancho = Number(v.ancho) || 0
    const alto = Number(v.alto) || 0
    const mat = String(v.tipo_acero || v.calibre_cuerpo || '')
    const acabado = String(v.acabado || '')
    const cal = String(v.calibre || v.calibre_cuerpo || '')
    return {
      materialLabel: mat ? `Acero ${mat} ${acabado} Cal ${cal}` : `Cal ${cal}`,
      dims: `${largo.toFixed(2)}m × ${ancho.toFixed(2)}m × ${alto.toFixed(2)}m`,
    }
  }
  // Legacy ConfigMesa
  const cfg = config as ConfigMesa
  return {
    materialLabel: `Acero ${cfg.tipo_acero} ${cfg.acabado?.charAt(0).toUpperCase()}${cfg.acabado?.slice(1)} Cal ${String(cfg.calibre).replace('cal_', '')}`,
    dims: `${cfg.largo.toFixed(2)}m × ${cfg.ancho.toFixed(2)}m × ${cfg.alto.toFixed(2)}m`,
  }
}

/** Build a single APU worksheet (reusable for both single and consolidated exports) */
function buildApuSheet(
  r: ApuResultado,
  config: Record<string, any>,
  cotNum: string,
  empresaNombre: string,
  contactoNombre: string,
  fechaStr: string,
): XLSX.WorkSheet {
  const { materialLabel, dims } = extractConfigInfo(config)

  // ── Build rows ──
  const rows: (string | number | null)[][] = []
  let r_idx = 0 // current row index (0-based)

  // Row 0: Header
  rows.push(['DURATA S.A.S — ANÁLISIS DE PRECIOS UNITARIOS', null, null, null, null, null, null])
  r_idx++
  // Row 1: Company info
  rows.push(['NIT 890.939.027-6 | Calle 51 #41-129, Itagüí | www.durata.co', null, null, null, null, null, null])
  r_idx++
  // Row 2: blank
  rows.push([])
  r_idx++
  // Row 3: Cot + Fecha
  rows.push(['Cotización:', cotNum, null, 'Fecha:', fechaStr, null, null])
  r_idx++
  // Row 4: Empresa + Contacto
  rows.push(['Empresa:', empresaNombre || '—', null, 'Contacto:', contactoNombre || '—', null, null])
  r_idx++
  // Row 5: Producto
  const descShort = r.descripcion_comercial.length > 80 ? r.descripcion_comercial.substring(0, 80) : r.descripcion_comercial
  rows.push(['Producto:', descShort, null, null, null, null, null])
  r_idx++
  // Row 6: blank
  rows.push([])
  r_idx++
  // Row 7: Dimensiones + Material
  rows.push(['DIMENSIONES', dims, null, 'Material:', materialLabel, null, null])
  r_idx++
  // Row 8: blank
  rows.push([])
  r_idx++

  // Row 9: Insumos header
  const headerRow = r_idx
  rows.push(['Cant', 'Und', 'Código', 'Descripción', 'P.Unit', 'Desp%', 'Total'])
  r_idx++

  // Insumo lines
  for (const l of r.lineas) {
    const cant = l.unidad?.toLowerCase() === 'und' ? Math.round(l.cantidad) : parseFloat(l.cantidad.toFixed(2))
    rows.push([cant, l.unidad || '', l.material || '', l.descripcion, Math.round(l.precio_unitario), parseFloat((l.desperdicio * 100).toFixed(1)), Math.round(l.total)])
    r_idx++
  }

  // Total insumos
  rows.push(['', '', '', 'TOTAL INSUMOS', '', '', Math.round(r.costo_insumos)])
  const totalInsumosRow = r_idx
  r_idx++

  // blank
  rows.push([])
  r_idx++

  // MO section
  const moHeaderRow = r_idx
  rows.push(['MANO DE OBRA', null, null, null, null, null, null])
  r_idx++
  // MO detail lines — we don't have individual MO breakdown from stored apu_resultado
  // so show total as single line
  rows.push([1, 'glb', '', 'Mano de obra fabricación', Math.round(r.costo_mo), 0, Math.round(r.costo_mo)])
  r_idx++
  rows.push(['', '', '', 'TOTAL MANO DE OBRA', '', '', Math.round(r.costo_mo)])
  const totalMoRow = r_idx
  r_idx++

  // blank
  rows.push([])
  r_idx++

  // Transport section
  const transportHeaderRow = r_idx
  rows.push(['TRANSPORTE', null, null, null, null, null, null])
  r_idx++
  rows.push([1, 'glb', '', 'Transporte elementos y personal', Math.round(r.costo_transporte), 0, Math.round(r.costo_transporte)])
  r_idx++
  rows.push(['', '', '', 'TOTAL TRANSPORTE', '', '', Math.round(r.costo_transporte)])
  const totalTransRow = r_idx
  r_idx++

  // Laser section (if applicable)
  let laserHeaderRow = -1
  if (r.costo_laser > 0) {
    rows.push([])
    r_idx++
    laserHeaderRow = r_idx
    rows.push(['CORTE LÁSER', null, null, null, null, null, null])
    r_idx++
    rows.push([1, 'glb', '', 'Corte láser CNC', Math.round(r.costo_laser), 0, Math.round(r.costo_laser)])
    r_idx++
    rows.push(['', '', '', 'TOTAL CORTE LÁSER', '', '', Math.round(r.costo_laser)])
    r_idx++
  }

  // Poliza (if applicable)
  if (r.costo_poliza > 0) {
    rows.push([])
    r_idx++
    rows.push(['PÓLIZA', null, null, null, null, null, null])
    r_idx++
    rows.push([1, 'glb', '', 'Póliza de cumplimiento', Math.round(r.costo_poliza), 0, Math.round(r.costo_poliza)])
    r_idx++
  }

  // Summary
  rows.push([])
  r_idx++
  rows.push([])
  r_idx++

  const costoTotalRow = r_idx
  rows.push(['', '', '', 'COSTO TOTAL', '', '', Math.round(r.costo_total)])
  r_idx++
  const margenRow = r_idx
  rows.push(['', '', '', `Margen ${(r.margen * 100).toFixed(0)}%`, '', '', Math.round(r.precio_venta - r.costo_total)])
  r_idx++
  const pvRow = r_idx
  rows.push(['', '', '', 'PRECIO VENTA', '', '', Math.round(r.precio_venta)])
  r_idx++
  const pcRow = r_idx
  rows.push(['', '', '', 'PRECIO COMERCIAL', '', '', Math.round(r.precio_comercial)])
  r_idx++

  // Description
  rows.push([])
  r_idx++
  rows.push(['DESCRIPCIÓN COMERCIAL', null, null, null, null, null, null])
  const descRow = r_idx
  r_idx++
  rows.push([r.descripcion_comercial, null, null, null, null, null, null])
  r_idx++

  // ── Create worksheet ──
  const ws = XLSX.utils.aoa_to_sheet(rows)

  // Column widths
  ws['!cols'] = [
    { wch: 8 },  // A: Cant
    { wch: 6 },  // B: Und
    { wch: 14 }, // C: Código
    { wch: 45 }, // D: Descripción
    { wch: 12 }, // E: P.Unit
    { wch: 8 },  // F: Desp%
    { wch: 14 }, // G: Total
  ]

  // Merge cells
  const merges: XLSX.Range[] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },  // Header title
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },  // Company info
    { s: { r: moHeaderRow, c: 0 }, e: { r: moHeaderRow, c: 6 } }, // MO header
    { s: { r: transportHeaderRow, c: 0 }, e: { r: transportHeaderRow, c: 6 } }, // Transport header
  ]
  // Merge cost total labels (A:F)
  for (const row of [totalInsumosRow, totalMoRow, totalTransRow, costoTotalRow, margenRow, pvRow, pcRow]) {
    merges.push({ s: { r: row, c: 0 }, e: { r: row, c: 5 } })
  }
  if (laserHeaderRow >= 0) {
    merges.push({ s: { r: laserHeaderRow, c: 0 }, e: { r: laserHeaderRow, c: 6 } })
  }
  // Description row merge
  merges.push({ s: { r: descRow, c: 0 }, e: { r: descRow, c: 6 } })
  merges.push({ s: { r: descRow + 1, c: 0 }, e: { r: descRow + 1, c: 6 } })
  ws['!merges'] = merges

  // Number format for price columns (E and G) — COP
  for (let rowIdx = headerRow; rowIdx < r_idx; rowIdx++) {
    const cellE = XLSX.utils.encode_cell({ r: rowIdx, c: 4 })
    const cellG = XLSX.utils.encode_cell({ r: rowIdx, c: 6 })
    if (ws[cellE] && typeof ws[cellE].v === 'number') {
      ws[cellE].z = '$#,##0'
    }
    if (ws[cellG] && typeof ws[cellG].v === 'number') {
      ws[cellG].z = '$#,##0'
    }
  }

  // Print settings
  ws['!printHeader'] = [headerRow + 1, headerRow + 1]

  return ws
}

export function exportApuExcel(params: ApuExportParams) {
  const { resultado: r, config, cotizacionNumero, empresaNombre, contactoNombre, fecha, preview } = params

  const { dims } = extractConfigInfo(config)
  const fechaStr = fecha || new Date().toLocaleDateString('es-CO')
  const cotNum = cotizacionNumero || 'SIN_NUMERO'

  const ws = buildApuSheet(r, config, cotNum, empresaNombre || '', contactoNombre || '', fechaStr)

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'APU')

  // ── Filename ──
  const dimParts = dims.replace(/m/g, '').split('×').map(s => s.trim())
  const dimStr = dimParts.slice(0, 2).join('x')
  let filename: string
  if (preview) {
    filename = `APU_PREVIEW_${dimStr}.xlsx`
  } else {
    filename = `APU_${cotNum}.xlsx`
  }

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

  return { blob, filename }
}

// ── Consolidated multi-product APU export ──

interface ApuConsolidadoProduct {
  resultado: ApuResultado
  config: Record<string, any>
  productoNombre: string
}

interface ApuConsolidadoParams {
  products: ApuConsolidadoProduct[]
  cotizacionNumero: string
  empresaNombre?: string
  contactoNombre?: string
  fecha?: string
}

/** Sanitize and truncate sheet name (Excel max 31 chars, no special chars) */
function cleanSheetName(name: string): string {
  return (name || 'Producto')
    .replace(/[\/\\*?\[\]:]/g, '')
    .trim()
    .substring(0, 31) || 'Producto'
}

export function exportApuConsolidado(params: ApuConsolidadoParams) {
  const { products, cotizacionNumero, empresaNombre, contactoNombre, fecha } = params
  const fechaStr = fecha || new Date().toLocaleDateString('es-CO')
  const cotNum = cotizacionNumero || 'SIN_NUMERO'

  const wb = XLSX.utils.book_new()

  // Track used sheet names to avoid duplicates
  const usedNames = new Set<string>()

  for (const p of products) {
    let sheetName = cleanSheetName(p.productoNombre)

    // Deduplicate sheet names (e.g. two "Mesa" products)
    if (usedNames.has(sheetName)) {
      let suffix = 2
      while (usedNames.has(`${sheetName.substring(0, 28)}_${suffix}`)) suffix++
      sheetName = `${sheetName.substring(0, 28)}_${suffix}`
    }
    usedNames.add(sheetName)

    const ws = buildApuSheet(
      p.resultado,
      p.config,
      cotNum,
      empresaNombre || '',
      contactoNombre || '',
      fechaStr,
    )
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
  }

  const filename = `APU_${cotNum}.xlsx`
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

  return { blob, filename }
}

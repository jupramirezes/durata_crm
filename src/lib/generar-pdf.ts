import jsPDF from 'jspdf'
import { ProductoCliente, findCotizador } from '../types'
import { formatCOP } from './utils'
import { LOGO_DURATA_B64 } from './logo-b64'

export interface PdfClienteData {
  empresa: string
  nombre: string
  whatsapp: string
  correo: string
  nit: string
  ubicacion: string
}

export interface PdfCotizacionData {
  numero: string
  fecha: string
  nombreProducto: string
  cliente: PdfClienteData
  productos: (ProductoCliente & { unidad?: string })[]
  tiempoEntrega: string
  incluyeTransporte: boolean
  condicionesItems: string[]
  noIncluyeItems: string[]
  cotizadorAsignado?: string
  /** Optional overrides from configuracion_sistema */
  config?: {
    textoInstitucional?: string
    cuentaBancaria?: string
    validezPropuesta?: string
    formaPago?: string
  }
}

// Cotizador info for PDF signature
const COTIZADOR_PDF_INFO: Record<string, { nombre: string; cargo: string; telefono: string }> = {
  OC: { nombre: 'OMAR COSSIO', cargo: 'Comercial', telefono: '444 43 70 ext 108' },
  SA: { nombre: 'SEBASTIAN AGUIRRE', cargo: 'Director Comercial', telefono: '317 666 8023' },
  JPR: { nombre: 'JUAN PABLO RAMIREZ', cargo: 'Comercial', telefono: '444 43 70' },
  CA: { nombre: 'CAMILO ARAQUE', cargo: 'Comercial', telefono: '444 43 70' },
  DG: { nombre: 'DANIELA GALINDO', cargo: 'Comercial', telefono: '444 43 70' },
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function fechaLarga(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00')
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`
}

function fmtQty(n: number): string {
  if (Number.isInteger(n)) return String(n)
  return n.toFixed(2).replace(/\.?0+$/, '')
}

export function generarPdfCotizacion(data: PdfCotizacionData) {
  const { numero, fecha, nombreProducto, cliente, productos, incluyeTransporte, condicionesItems, noIncluyeItems } = data
  const doc = new jsPDF({ unit: 'mm', format: 'letter' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const mL = 18
  const mR = 18
  const cW = pageW - mL - mR
  let y = 0

  const BLACK: [number, number, number] = [30, 30, 30]

  function drawPageBorder() {
    doc.setDrawColor(30, 30, 30)
    doc.setLineWidth(0.5)
    doc.rect(10, 10, pageW - 20, pageH - 20)
  }

  function checkPage(needed: number) {
    if (y + needed > pageH - 22) {
      doc.addPage()
      drawPageBorder()
      y = 18
    }
  }

  function textBlock(text: string, x: number, maxW: number, lineH: number, fontSize: number, font: string, style: string, color: [number, number, number]) {
    doc.setFont(font, style)
    doc.setFontSize(fontSize)
    doc.setTextColor(color[0], color[1], color[2])
    const lines: string[] = doc.splitTextToSize(text, maxW)
    for (const line of lines) {
      checkPage(lineH + 2)
      doc.text(line, x, y)
      y += lineH
    }
  }

  // Page border
  drawPageBorder()

  // Header - logo smaller, no blue background
  y = 18

  try {
    doc.addImage(LOGO_DURATA_B64, 'PNG', mL, y - 4, 36, 15)
  } catch {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(...BLACK)
    doc.text('DURATA S.A.S.', mL, y + 6)
  }

  y += 20

  // Datos cotizacion
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(60, 60, 60)
  doc.text(`Itagui, ${fechaLarga(fecha)}`, mL, y)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...BLACK)
  doc.text(`Cotizacion: ${numero}`, pageW - mR, y, { align: 'right' })
  y += 6

  // Separator
  doc.setDrawColor(180, 180, 180)
  doc.setLineWidth(0.3)
  doc.line(mL, y, mL + cW, y)
  y += 6

  // Client info
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(60, 60, 60)
  doc.text('Senor(a)(es)', mL, y)
  y += 5

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(30, 30, 30)
  doc.text((cliente.empresa || '').toUpperCase(), mL, y)
  y += 5

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(60, 60, 60)
  doc.text(cliente.nombre, mL, y)

  doc.text(`Tel: ${cliente.whatsapp || '-'}`, pageW - mR, y - 5, { align: 'right' })
  doc.text(`Email: ${cliente.correo || '-'}`, pageW - mR, y, { align: 'right' })
  y += 5

  // Product name as title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(30, 30, 30)
  doc.text(`PRODUCTO: ${nombreProducto}`, mL, y)
  y += 8

  // Institutional paragraph
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(80, 80, 80)
  const parrafoInst = data.config?.textoInstitucional || 'DURATA S.A.S es una empresa antioquena fundada desde 1985, dedicada a la fabricacion de articulos en Acero Inoxidable y estructura metalica. Nos destacamos en el mercado por nuestra eficiencia y calidad.'
  const instLines: string[] = doc.splitTextToSize(parrafoInst, cW)
  for (const line of instLines) {
    doc.text(line, mL, y)
    y += 3.5
  }
  y += 2
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(60, 60, 60)
  doc.text('A continuacion presentamos la propuesta comercial de acuerdo a su solicitud.', mL, y)
  y += 8

  // Products table
  // D-07: detect whether ANY product has an image. If so, render a dedicated IMAGEN column.
  // If none do, layout stays identical to the previous (no-image) version.
  const anyHasImage = productos.some((p) => !!(p as any).imagen_render || !!(p as any).imagen_url)

  // Thumbnail cell size (mm). Column is a bit wider than the image to leave padding.
  const IMG_CELL_W = 24 // column width
  const IMG_W = 20      // rendered image width
  const IMG_H = 15      // rendered image height

  const colCant = mL
  const colUnd = mL + 14
  const colImg = anyHasImage ? mL + 28 : 0 // only used when anyHasImage
  const colDesc = anyHasImage ? mL + 28 + IMG_CELL_W : mL + 28
  // Feedback JP 2026-04-19 v2: layout cuadrado — columnas precio tienen ancho fijo
  // y gap generoso antes de DESCRIPCION. Precios alineados al CENTRO vertical de la
  // fila (no al top) para que no se monten sobre la primera línea de descripción.
  const PRICE_COL_W = 32   // ancho de cada columna de precio
  const PRICE_GAP = 2      // separación entre VR UNIT y VR TOTAL
  const DESC_PRICE_GAP = 6 // padding entre fin de descripción y columna de precios
  const colVUnit = pageW - mR - (PRICE_COL_W * 2 + PRICE_GAP)
  const colVTotal = pageW - mR
  const descW = colVUnit - colDesc - DESC_PRICE_GAP

  // Table header
  const thH = 7
  doc.setFillColor(30, 30, 30)
  doc.rect(mL, y, cW, thH, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(255, 255, 255)
  const thY = y + 5
  doc.text('CANT', colCant + 2, thY)
  doc.text('UND', colUnd + 2, thY)
  if (anyHasImage) {
    doc.text('IMAGEN ALUSIVA', colImg + 2, thY)
  }
  doc.text('DESCRIPCION', colDesc + 2, thY)
  doc.text('VR. UNIT', colVUnit, thY, { align: 'right' })
  doc.text('VR. TOTAL', colVTotal - 2, thY, { align: 'right' })
  y += thH

  let subtotal = 0

  for (let idx = 0; idx < productos.length; idx++) {
    const p = productos[idx]
    const precioUnit = p.precio_calculado || 0
    const totalLinea = precioUnit * p.cantidad
    subtotal += totalLinea

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    const descText = p.descripcion_comercial || p.subtipo
    // D-07: if the table has an IMAGEN column, the image for this product (if any)
    // is rendered in that dedicated cell. Description width is independent of the image.
    const hasImage = !!(p as any).imagen_render || !!(p as any).imagen_url
    const descLines: string[] = doc.splitTextToSize(descText, descW)
    const descHeight = descLines.length * 3.5
    // Row must be tall enough to fit the description text AND (if this product has an image
    // or the table reserves an image column) the thumbnail plus a small padding.
    const imageRowMin = anyHasImage ? IMG_H + 4 : 0
    const rowH = Math.max(descHeight + 6, imageRowMin, 10)

    checkPage(rowH + 2)

    if (idx % 2 === 0) {
      doc.setFillColor(245, 247, 250)
      doc.rect(mL, y, cW, rowH, 'F')
    }

    doc.setDrawColor(210, 215, 225)
    doc.setLineWidth(0.2)
    doc.line(mL, y + rowH, mL + cW, y + rowH)

    // Quantity and unit at top
    const topY = y + 5
    doc.setFontSize(7.5)
    doc.setTextColor(40, 40, 40)
    doc.text(fmtQty(p.cantidad), colCant + 2, topY)
    doc.text((p as any).unidad || 'UND', colUnd + 2, topY)

    // D-07: render image inside the dedicated IMAGEN column (centered within the cell).
    // Supports data URLs (base64 from file picker / canvas capture) and http(s) URLs.
    // jsPDF auto-detects format from data URL prefix when format arg is 'PNG' or 'JPEG'.
    if (anyHasImage && hasImage) {
      try {
        const imgSrc = (p as any).imagen_url || (p as any).imagen_render
        const fmt = typeof imgSrc === 'string' && imgSrc.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG'
        const imgX = colImg + (IMG_CELL_W - IMG_W) / 2
        const imgY = y + (rowH - IMG_H) / 2
        doc.addImage(imgSrc, fmt, imgX, imgY, IMG_W, IMG_H)
      } catch (_) { /* skip if image fails — description still renders */ }
    }

    // Description
    doc.setFontSize(7)
    for (let li = 0; li < descLines.length; li++) {
      doc.text(descLines[li], colDesc + 2, topY + li * 3.5)
    }

    // Prices centered vertically within the row — avoids pricing stacking on top of
    // the first line of the description. Falls back to topY for single-line rows.
    const priceY = descLines.length > 1 || anyHasImage ? y + rowH / 2 + 1 : topY
    doc.setFontSize(7.5)
    doc.setTextColor(40, 40, 40)
    doc.setFont('helvetica', 'normal')
    doc.text(formatCOP(precioUnit), colVUnit, priceY, { align: 'right' })
    doc.setFont('helvetica', 'bold')
    doc.text(formatCOP(totalLinea), colVTotal - 2, priceY, { align: 'right' })

    y += rowH
  }

  y += 4

  // Totals
  const iva = subtotal * 0.19
  const totalFinal = subtotal + iva
  const totX = pageW - mR - 80

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)
  doc.text('SUBTOTAL', totX, y)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 30, 30)
  doc.text(formatCOP(subtotal), pageW - mR - 2, y, { align: 'right' })
  y += 5

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)
  doc.text('IVA (19%)', totX, y)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 30, 30)
  doc.text(formatCOP(iva), pageW - mR - 2, y, { align: 'right' })
  y += 6

  doc.setFillColor(30, 30, 30)
  doc.roundedRect(totX - 3, y - 4, pageW - mR - totX + 5, 10, 1.5, 1.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(255, 255, 255)
  doc.text('TOTAL', totX, y + 2.5)
  doc.text(formatCOP(totalFinal), pageW - mR - 2, y + 2.5, { align: 'right' })
  y += 16

  // Note
  checkPage(10)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...BLACK)
  doc.text('EN CASO DE ACEPTAR LA PROPUESTA, FAVOR DILIGENCIAR EL FORMATO Y ENVIAR POR CORREO PARA PODER INICIAR EL PROCESO.', mL, y)
  y += 8

  // Commercial conditions
  checkPage(15)
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(mL, y, mL + cW, y)
  y += 5

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...BLACK)
  doc.text('CONDICIONES COMERCIALES', mL, y)
  y += 5

  for (const cond of condicionesItems) {
    checkPage(14)
    textBlock(`\u2022 ${cond}`, mL + 2, cW - 4, 3.2, 7, 'helvetica', 'normal', [60, 60, 60])
    y += 1.5
  }

  if (incluyeTransporte) {
    checkPage(10)
    textBlock('\u2022 Transporte: Transporte de la totalidad de los elementos van incluidos en el valor del item.', mL + 2, cW - 4, 3.2, 7, 'helvetica', 'normal', [60, 60, 60])
    y += 1.5
  }

  if (noIncluyeItems.length > 0) {
    y += 2
    checkPage(12)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...BLACK)
    doc.text('NO INCLUYE:', mL, y)
    y += 4

    for (const item of noIncluyeItems) {
      checkPage(14)
      textBlock(`\u2022 ${item}`, mL + 2, cW - 4, 3.2, 7, 'helvetica', 'normal', [60, 60, 60])
      y += 1.5
    }
  }

  y += 2
  checkPage(18)
  textBlock(`\u2022 Forma de Pago: ${data.config?.formaPago || '50% ANTICIPO Y 50% contra entrega.'}`, mL + 2, cW - 4, 3.2, 7, 'helvetica', 'normal', [60, 60, 60])
  y += 1
  textBlock(`\u2022 Cuentas Bancarias: ${data.config?.cuentaBancaria || 'Bancolombia Corriente 27250080764.'}`, mL + 2, cW - 4, 3.2, 7, 'helvetica', 'normal', [60, 60, 60])
  y += 1
  textBlock(`\u2022 Validez de la propuesta: ${data.config?.validezPropuesta || '10 dias calendario.'}`, mL + 2, cW - 4, 3.2, 7, 'helvetica', 'normal', [60, 60, 60])

  // Signature — resolve cotizador from oportunidad
  const cotizador = data.cotizadorAsignado ? findCotizador(data.cotizadorAsignado) : null
  const cotInfo = cotizador ? COTIZADOR_PDF_INFO[cotizador.id] : null

  // Left: always Sebastián Aguirre (Director Comercial)
  // Right: the assigned cotizador (or fallback)
  const firmaIzq = COTIZADOR_PDF_INFO['SA']
  const firmaDer = cotInfo && cotInfo.nombre !== firmaIzq.nombre
    ? cotInfo
    : { nombre: 'DURATA S.A.S', cargo: 'Equipo Comercial', telefono: '444 43 70' }

  y += 10
  checkPage(20)
  doc.setDrawColor(...BLACK)
  doc.setLineWidth(0.4)
  doc.line(mL, y, mL + cW, y)
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...BLACK)
  doc.text(firmaIzq.nombre, mL, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(80, 80, 80)
  doc.text(firmaIzq.cargo, mL, y + 4)
  doc.text(`CEL ${firmaIzq.telefono}`, mL, y + 8)

  const colR = mL + cW / 2 + 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...BLACK)
  doc.text(firmaDer.nombre, colR, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(80, 80, 80)
  doc.text(firmaDer.cargo, colR, y + 4)
  doc.text(firmaDer.telefono, colR, y + 8)

  // Filename: Cotizacion_[NumeroCot]_[Nombre producto]_[Empresa]_[Contacto].pdf
  const clean = (s: string) => (s || '').replace(/[\/\\:*?"<>|#%&{}$!'@+`=]/g, '').replace(/[^a-zA-Z0-9\u00e0-\u00fc _-]/gi, '').replace(/\s+/g, '_').trim().substring(0, 40)
  const nombreClean = clean(nombreProducto)
  const empresaClean = clean(cliente.empresa)
  const contactoClean = clean(cliente.nombre)
  const filename = `Cotizacion_${numero}_${nombreClean}_${empresaClean}_${contactoClean}.pdf`
  const blob = doc.output('blob')

  return { blob, filename, totalFinal }
}

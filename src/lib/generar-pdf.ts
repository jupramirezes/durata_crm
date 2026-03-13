import jsPDF from 'jspdf'
import { ProductoCliente } from '../types'
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
  const parrafoInst = 'DURATA S.A.S es una empresa antioquena fundada desde 1985, dedicada a la fabricacion de articulos en Acero Inoxidable y estructura metalica. Nos destacamos en el mercado por nuestra eficiencia y calidad.'
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
  const colCant = mL
  const colUnd = mL + 14
  const colDesc = mL + 28
  const colVUnit = pageW - mR - 52
  const colVTotal = pageW - mR
  const descW = colVUnit - colDesc - 8

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
    const descLines: string[] = doc.splitTextToSize(descText, descW)
    const descHeight = descLines.length * 3.5
    const rowH = Math.max(descHeight + 6, 10)

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

    // Description starting at top
    doc.setFontSize(7)
    for (let li = 0; li < descLines.length; li++) {
      doc.text(descLines[li], colDesc + 2, topY + li * 3.5)
    }

    // Prices at top, right-aligned with clear separation from description
    doc.setFontSize(7.5)
    doc.setTextColor(40, 40, 40)
    doc.setFont('helvetica', 'normal')
    doc.text(formatCOP(precioUnit), colVUnit, topY, { align: 'right' })
    doc.setFont('helvetica', 'bold')
    doc.text(formatCOP(totalLinea), colVTotal - 2, topY, { align: 'right' })

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
  textBlock('\u2022 Forma de Pago: 50% ANTICIPO Y 50% contra entrega.', mL + 2, cW - 4, 3.2, 7, 'helvetica', 'normal', [60, 60, 60])
  y += 1
  textBlock('\u2022 Cuentas Bancarias: Bancolombia Corriente 27250080764.', mL + 2, cW - 4, 3.2, 7, 'helvetica', 'normal', [60, 60, 60])
  y += 1
  textBlock('\u2022 Validez de la propuesta: 10 dias calendario.', mL + 2, cW - 4, 3.2, 7, 'helvetica', 'normal', [60, 60, 60])

  // Signature
  y += 10
  checkPage(20)
  doc.setDrawColor(...BLACK)
  doc.setLineWidth(0.4)
  doc.line(mL, y, mL + cW, y)
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...BLACK)
  doc.text('SEBASTIAN AGUIRRE', mL, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(80, 80, 80)
  doc.text('Director comercial', mL, y + 4)
  doc.text('CEL 317 666 8023', mL, y + 8)

  const colR = mL + cW / 2 + 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...BLACK)
  doc.text('OMAR COSSIO', colR, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(80, 80, 80)
  doc.text('Comercial', colR, y + 4)
  doc.text('444 43 70 ext 108', colR, y + 8)

  // Filename: Cotizacion_[NumeroCot]_[Nombre producto]_[Empresa].pdf
  const clean = (s: string) => (s || '').replace(/[^a-zA-Z0-9\u00e0-\u00fc ]/gi, '').replace(/\s+/g, ' ').trim().substring(0, 40)
  const nombreClean = clean(nombreProducto).replace(/ /g, '_')
  const empresaClean = clean(cliente.empresa).replace(/ /g, '')
  doc.save(`Cotizacion_${numero}_${nombreClean}_${empresaClean}.pdf`)

  return totalFinal
}

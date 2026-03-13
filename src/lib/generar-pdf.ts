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
  cliente: PdfClienteData
  productos: ProductoCliente[]
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

export function generarPdfCotizacion(data: PdfCotizacionData) {
  const { numero, fecha, cliente, productos, incluyeTransporte, condicionesItems, noIncluyeItems } = data
  const doc = new jsPDF({ unit: 'mm', format: 'letter' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const mL = 18
  const mR = 18
  const cW = pageW - mL - mR
  let y = 0

  const BLUE = { r: 26, g: 35, b: 50 } // #1a2332

  function checkPage(needed: number) {
    if (y + needed > pageH - 22) {
      doc.addPage()
      y = 15
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

  // ================================================================
  // ENCABEZADO - Fondo azul oscuro con logo
  // ================================================================
  const headerH = 40
  doc.setFillColor(BLUE.r, BLUE.g, BLUE.b)
  doc.rect(0, 0, pageW, headerH, 'F')

  // Logo (proporcional, dentro del header)
  try {
    doc.addImage(LOGO_DURATA_B64, 'PNG', mL, 8, 55, 24)
  } catch {
    // Fallback text si no carga
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    doc.setTextColor(255, 255, 255)
    doc.text('DURATA\u00ae S.A.S.', mL, 25)
  }

  y = headerH + 8

  // ================================================================
  // DATOS DE COTIZACION
  // ================================================================
  // Izquierda: lugar y fecha
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(60, 60, 60)
  doc.text(`Itag\u00fc\u00ed, ${fechaLarga(fecha)}`, mL, y)

  // Derecha: numero cotizacion
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(BLUE.r, BLUE.g, BLUE.b)
  doc.text(`Cotizaci\u00f3n: ${numero}`, pageW - mR, y, { align: 'right' })
  y += 8

  // Senor(a)(es)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(60, 60, 60)
  doc.text('Se\u00f1or(a)(es)', mL, y)
  y += 5

  // Empresa en MAYUSCULAS bold
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(30, 30, 30)
  doc.text((cliente.empresa || '').toUpperCase(), mL, y)
  y += 5

  // Nombre contacto
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(60, 60, 60)
  doc.text(cliente.nombre, mL, y)

  // Derecha: tel y email
  doc.text(`Tel: ${cliente.whatsapp || '-'}`, pageW - mR, y - 5, { align: 'right' })
  doc.text(`Email: ${cliente.correo || '-'}`, pageW - mR, y, { align: 'right' })
  y += 5

  // PRODUCTO
  const subtipos = [...new Set(productos.map(p => p.subtipo))].join(', ')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(30, 30, 30)
  doc.text(`PRODUCTO: ${subtipos}`, mL, y)
  y += 8

  // ================================================================
  // PARRAFO INSTITUCIONAL
  // ================================================================
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(80, 80, 80)
  const parrafoInst = 'DURATA\u00ae S.A.S es una empresa antioque\u00f1a fundada desde 1985, dedicada a la fabricaci\u00f3n de art\u00edculos en Acero Inoxidable y estructura met\u00e1lica. Nos destacamos en el mercado por nuestra eficiencia y calidad. Nuestro personal est\u00e1 debidamente capacitado y cuenta con la experiencia para desarrollar proyectos a la medida de nuestros clientes.'
  const instLines: string[] = doc.splitTextToSize(parrafoInst, cW)
  for (const line of instLines) {
    doc.text(line, mL, y)
    y += 3.5
  }
  y += 2
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(60, 60, 60)
  doc.text('A continuaci\u00f3n presentamos la propuesta comercial de acuerdo a su solicitud.', mL, y)
  y += 8

  // ================================================================
  // TABLA DE PRODUCTOS
  // ================================================================
  const colCant = mL
  const colUnd = mL + 14
  const colDesc = mL + 28
  const colVUnit = pageW - mR - 45
  const colVTotal = pageW - mR
  const descW = colVUnit - colDesc - 4

  // Header
  const thH = 7
  doc.setFillColor(BLUE.r, BLUE.g, BLUE.b)
  doc.rect(mL, y, cW, thH, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(255, 255, 255)
  const thY = y + 5
  doc.text('CANT', colCant + 2, thY)
  doc.text('UND', colUnd + 2, thY)
  doc.text('DESCRIPCI\u00d3N', colDesc + 2, thY)
  doc.text('VALOR UNIT', colVUnit - 2, thY, { align: 'right' })
  doc.text('VALOR TOTAL', colVTotal - 2, thY, { align: 'right' })
  y += thH

  let subtotal = 0

  for (let idx = 0; idx < productos.length; idx++) {
    const p = productos[idx]
    const precioUnit = p.precio_calculado || 0
    const totalLinea = precioUnit * p.cantidad
    subtotal += totalLinea

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    const descLines: string[] = doc.splitTextToSize(p.descripcion_comercial || p.subtipo, descW)
    const rowH = Math.max(descLines.length * 3.5 + 3, 7)

    checkPage(rowH + 2)

    // Alternating row background
    if (idx % 2 === 0) {
      doc.setFillColor(245, 247, 250)
      doc.rect(mL, y, cW, rowH, 'F')
    }

    // Row border bottom
    doc.setDrawColor(210, 215, 225)
    doc.setLineWidth(0.2)
    doc.line(mL, y + rowH, mL + cW, y + rowH)

    const cellY = y + 4.5
    doc.setTextColor(40, 40, 40)
    doc.text(String(p.cantidad), colCant + 2, cellY)
    doc.text('UND', colUnd + 2, cellY)

    // Description multi-line
    doc.setFontSize(7)
    for (let li = 0; li < descLines.length; li++) {
      doc.text(descLines[li], colDesc + 2, cellY + li * 3.5)
    }

    // Prices
    doc.setFontSize(7.5)
    doc.text(formatCOP(precioUnit), colVUnit - 2, cellY, { align: 'right' })
    doc.setFont('helvetica', 'bold')
    doc.text(formatCOP(totalLinea), colVTotal - 2, cellY, { align: 'right' })

    y += rowH
  }

  y += 4

  // ================================================================
  // TOTALES
  // ================================================================
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

  // TOTAL grande con fondo
  doc.setFillColor(BLUE.r, BLUE.g, BLUE.b)
  doc.roundedRect(totX - 3, y - 4, pageW - mR - totX + 5, 10, 1.5, 1.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(255, 255, 255)
  doc.text('TOTAL', totX, y + 2.5)
  doc.text(formatCOP(totalFinal), pageW - mR - 2, y + 2.5, { align: 'right' })
  y += 16

  // ================================================================
  // NOTA
  // ================================================================
  checkPage(10)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(BLUE.r, BLUE.g, BLUE.b)
  doc.text('EN CASO DE ACEPTAR LA PROPUESTA, FAVOR DILIGENCIAR EL FORMATO Y ENVIAR POR CORREO PARA PODER INICIAR EL PROCESO.', mL, y)
  y += 8

  // ================================================================
  // CONDICIONES COMERCIALES
  // ================================================================
  checkPage(15)
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(mL, y, mL + cW, y)
  y += 5

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(BLUE.r, BLUE.g, BLUE.b)
  doc.text('CONDICIONES COMERCIALES', mL, y)
  y += 5

  for (const cond of condicionesItems) {
    checkPage(14)
    textBlock(`\u2022 ${cond}`, mL + 2, cW - 4, 3.2, 7, 'helvetica', 'normal', [60, 60, 60])
    y += 1.5
  }

  // Transporte
  if (incluyeTransporte) {
    checkPage(10)
    textBlock('\u2022 Transporte: Transporte de la totalidad de los elementos van incluidos en el valor del \u00edtem. Si var\u00eda la orden de compra, a menor cantidad los precios pueden variar.', mL + 2, cW - 4, 3.2, 7, 'helvetica', 'normal', [60, 60, 60])
    y += 1.5
  }

  // ================================================================
  // NO INCLUYE
  // ================================================================
  if (noIncluyeItems.length > 0) {
    y += 2
    checkPage(12)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(BLUE.r, BLUE.g, BLUE.b)
    doc.text('NO INCLUYE:', mL, y)
    y += 4

    for (const item of noIncluyeItems) {
      checkPage(14)
      textBlock(`\u2022 ${item}`, mL + 2, cW - 4, 3.2, 7, 'helvetica', 'normal', [60, 60, 60])
      y += 1.5
    }
  }

  // Forma de pago, cuentas, validez (siempre)
  y += 2
  checkPage(18)
  textBlock('\u2022 Forma de Pago: 50% ANTICIPO Y 50% contra entrega.', mL + 2, cW - 4, 3.2, 7, 'helvetica', 'normal', [60, 60, 60])
  y += 1
  textBlock('\u2022 Cuentas Bancarias: Bancolombia Corriente 27250080764.', mL + 2, cW - 4, 3.2, 7, 'helvetica', 'normal', [60, 60, 60])
  y += 1
  textBlock('\u2022 Validez de la propuesta: 10 d\u00edas calendario.', mL + 2, cW - 4, 3.2, 7, 'helvetica', 'normal', [60, 60, 60])

  // ================================================================
  // PIE DE FIRMA
  // ================================================================
  y += 10
  checkPage(20)
  doc.setDrawColor(BLUE.r, BLUE.g, BLUE.b)
  doc.setLineWidth(0.4)
  doc.line(mL, y, mL + cW, y)
  y += 6

  // Columna izquierda
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(BLUE.r, BLUE.g, BLUE.b)
  doc.text('SEBASTI\u00c1N AGUIRRE', mL, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(80, 80, 80)
  doc.text('Director comercial', mL, y + 4)
  doc.text('CEL 317 666 8023', mL, y + 8)

  // Columna derecha
  const colR = mL + cW / 2 + 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(BLUE.r, BLUE.g, BLUE.b)
  doc.text('OMAR COSSIO', colR, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(80, 80, 80)
  doc.text('Comercial', colR, y + 4)
  doc.text('444 43 70 ext 108', colR, y + 8)

  // ================================================================
  // GUARDAR
  // ================================================================
  const empresaClean = (cliente.empresa || 'cliente').replace(/[^a-zA-Z0-9]/g, '_')
  const subtipoClean = subtipos.replace(/[^a-zA-Z0-9]/g, '_')
  doc.save(`Cotizacion_${numero}_${subtipoClean}_${empresaClean}.pdf`)

  return totalFinal
}

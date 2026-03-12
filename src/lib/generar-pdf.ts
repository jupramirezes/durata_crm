import jsPDF from 'jspdf'
import { Cliente, ProductoCliente } from '../types'
import { formatCOP } from './utils'

export interface PdfCotizacionData {
  numero: string
  fecha: string
  cliente: Cliente
  productos: ProductoCliente[]
  tiempoEntrega: string
  noIncluyeItems: string[]
}

export function generarPdfCotizacion(data: PdfCotizacionData) {
  const { numero, fecha, cliente, productos, tiempoEntrega, noIncluyeItems } = data
  const doc = new jsPDF({ unit: 'mm', format: 'letter' })
  const pageW = doc.internal.pageSize.getWidth()
  const marginL = 20
  const marginR = 20
  const contentW = pageW - marginL - marginR
  let y = 20

  function checkPage(needed: number) {
    if (y + needed > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage()
      y = 20
    }
  }

  function drawLine() {
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3)
    doc.line(marginL, y, pageW - marginR, y)
    y += 3
  }

  // ===== HEADER =====
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(30, 30, 30)
  doc.text('DURATA\u00ae S.A.S.', marginL, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text('NIT 890.939.027-6', marginL, y)
  y += 4
  doc.text('Itagui, Antioquia | Tel: 444 43 70', marginL, y)
  y += 8

  // Cotizacion number + date block (right-aligned box)
  doc.setFillColor(245, 245, 245)
  doc.roundedRect(pageW - marginR - 75, y - 16, 75, 20, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(30, 30, 30)
  doc.text(numero, pageW - marginR - 5, y - 10, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text(`Fecha: ${fecha} | Validez: 10 dias calendario`, pageW - marginR - 5, y - 4, { align: 'right' })

  drawLine()
  y += 2

  // ===== DATOS CLIENTE =====
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(30, 30, 30)
  doc.text('DATOS DEL CLIENTE', marginL, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(60, 60, 60)

  const clienteFields = [
    ['Nombre', cliente.nombre],
    ['Empresa', cliente.empresa],
    ['NIT', cliente.nit],
    ['Ubicacion', cliente.ubicacion],
    ['Telefono', cliente.whatsapp],
    ['Email', cliente.correo],
  ]

  for (const [label, value] of clienteFields) {
    doc.setFont('helvetica', 'bold')
    doc.text(`${label}:`, marginL, y)
    doc.setFont('helvetica', 'normal')
    doc.text(value || '-', marginL + 25, y)
    y += 5
  }
  y += 3
  drawLine()
  y += 2

  // ===== TABLA DE PRODUCTOS =====
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(30, 30, 30)
  doc.text('PRODUCTOS', marginL, y)
  y += 6

  // Table header
  const colX = {
    cant: marginL,
    und: marginL + 15,
    desc: marginL + 30,
    vUnit: pageW - marginR - 50,
    vTotal: pageW - marginR - 2,
  }
  const descMaxW = colX.vUnit - colX.desc - 3

  doc.setFillColor(40, 40, 50)
  doc.rect(marginL, y - 4, contentW, 7, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  doc.text('CANT', colX.cant + 1, y)
  doc.text('UND', colX.und + 1, y)
  doc.text('DESCRIPCION', colX.desc + 1, y)
  doc.text('VALOR UNIT', colX.vUnit, y, { align: 'right' })
  doc.text('VALOR TOTAL', colX.vTotal, y, { align: 'right' })
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(40, 40, 40)

  let subtotal = 0

  for (let idx = 0; idx < productos.length; idx++) {
    const p = productos[idx]
    const precioUnit = p.precio_calculado || 0
    const totalLinea = precioUnit * p.cantidad
    subtotal += totalLinea

    // Wrap description text
    const descLines = doc.splitTextToSize(p.descripcion_comercial || p.subtipo, descMaxW)
    const rowH = Math.max(descLines.length * 3.8, 5)

    checkPage(rowH + 4)

    // Alternating row bg
    if (idx % 2 === 0) {
      doc.setFillColor(248, 248, 250)
      doc.rect(marginL, y - 3.5, contentW, rowH + 2, 'F')
    }

    doc.setTextColor(40, 40, 40)
    doc.text(String(p.cantidad), colX.cant + 1, y)
    doc.text('und', colX.und + 1, y)

    // Description (multi-line)
    doc.setFontSize(7.5)
    for (let li = 0; li < descLines.length; li++) {
      doc.text(descLines[li], colX.desc + 1, y + li * 3.8)
    }
    doc.setFontSize(8)

    doc.text(formatCOP(precioUnit), colX.vUnit, y, { align: 'right' })
    doc.setFont('helvetica', 'bold')
    doc.text(formatCOP(totalLinea), colX.vTotal, y, { align: 'right' })
    doc.setFont('helvetica', 'normal')

    y += rowH + 2
  }

  y += 2
  // Divider
  doc.setDrawColor(40, 40, 50)
  doc.setLineWidth(0.5)
  doc.line(pageW - marginR - 70, y, pageW - marginR, y)
  y += 5

  // ===== TOTALES =====
  const iva = subtotal * 0.19
  const totalFinal = subtotal + iva

  const totalesData = [
    ['Subtotal', formatCOP(subtotal)],
    ['IVA (19%)', formatCOP(iva)],
  ]

  doc.setFontSize(9)
  for (const [label, val] of totalesData) {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    doc.text(label, pageW - marginR - 70, y)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(40, 40, 40)
    doc.text(val, pageW - marginR - 2, y, { align: 'right' })
    y += 5
  }

  // TOTAL big
  doc.setFillColor(40, 40, 50)
  doc.roundedRect(pageW - marginR - 72, y - 3.5, 72, 9, 1.5, 1.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(255, 255, 255)
  doc.text('TOTAL', pageW - marginR - 68, y + 2)
  doc.text(formatCOP(totalFinal), pageW - marginR - 4, y + 2, { align: 'right' })
  y += 16

  // ===== CONDICIONES =====
  checkPage(80)
  drawLine()
  y += 2

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(30, 30, 30)
  doc.text('CONDICIONES COMERCIALES', marginL, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(60, 60, 60)

  const condiciones = [
    `Tiempo de entrega: ${tiempoEntrega}, este tiempo corre a partir de la orden de compra, pago del anticipo, la firma de los planos definitivos, la validacion de los disenos y los acabados solicitados.`,
    'IVA: Se cobrara de acuerdo a la tarifa vigente en el momento del despacho. No incluye impuestos adicionales gubernamentales, en caso de existir seran asumidos por el cliente y adicionados a la factura final.',
    'Cantidades: El presupuesto puede variar de acuerdo a lo realmente Suministrado, el cual sera el valor final de la factura.',
    'Danos: Los danos causados en los acabados de los elementos de Durata\u00ae por cuenta de la obra seran asumidos por el cliente, la recepcion de los elementos implica responsabilidad en el cuidado de los mismos.',
    'Requerimiento: Energia 220v y 110v a maximo 30ml del espacio de trabajo, cuarto para guardar herramienta y material.',
    'Forma de Pago: 50% anticipo y 50% contra entrega.',
    'Validez de la propuesta: 10 dias calendario.',
    'Cuentas Bancarias: Bancolombia Corriente 27250080764.',
    'Garantia: DURATA ofrece garantia de 1 ANO MATERIALES Y CORRECTO FUNCIONAMIENTO, SIEMPRE Y CUANDO SEA INSTALADO POR DURATA.',
  ]

  for (const cond of condiciones) {
    checkPage(12)
    const lines = doc.splitTextToSize(`\u2022 ${cond}`, contentW)
    for (const line of lines) {
      doc.text(line, marginL, y)
      y += 3.5
    }
    y += 1.5
  }

  // ===== NO INCLUYE =====
  if (noIncluyeItems.length > 0) {
    y += 2
    checkPage(20)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(30, 30, 30)
    doc.text('NO INCLUYE:', marginL, y)
    y += 5

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(60, 60, 60)

    for (const item of noIncluyeItems) {
      checkPage(12)
      const lines = doc.splitTextToSize(`\u2022 ${item}`, contentW)
      for (const line of lines) {
        doc.text(line, marginL, y)
        y += 3.5
      }
      y += 1.5
    }
  }

  // ===== PIE =====
  y += 5
  checkPage(20)
  drawLine()
  y += 3

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(30, 30, 30)
  doc.text('SEBASTIAN AGUIRRE', marginL, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(80, 80, 80)
  doc.text('Director comercial - 317 666 8023', marginL, y + 4)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(30, 30, 30)
  doc.text('OMAR COSSIO', marginL + 80, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(80, 80, 80)
  doc.text('Comercial - 444 43 70 ext 108', marginL + 80, y + 4)

  // Save
  doc.save(`${numero}.pdf`)

  return totalFinal
}

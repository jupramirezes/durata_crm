/**
 * Exporta el listado actual de cotizaciones a un .xlsx compatible con el
 * REGISTRO_COTIZACIONES_DURATA de JP (columnas canónicas).
 *
 * Formatos generados:
 *   - Hoja "Cotizaciones": numero, fecha, empresa, contacto, cotizador,
 *     estado, total, etapa_oportunidad, valor_adjudicado, fecha_adjudicacion,
 *     fecha_envio, ubicacion, notas
 */
import * as XLSX from 'xlsx'
import type { Cotizacion, Oportunidad, Empresa, Contacto } from '../types'
import { findCotizador } from '../types'

export interface ExportCotizacionesInput {
  cotizaciones: Cotizacion[]
  oportunidades: Oportunidad[]
  empresas: Empresa[]
  contactos: Contacto[]
}

export function exportCotizacionesExcel(input: ExportCotizacionesInput, filename = '') {
  const { cotizaciones, oportunidades, empresas, contactos } = input
  const opMap = new Map(oportunidades.map(o => [o.id, o]))
  const empMap = new Map(empresas.map(e => [e.id, e]))
  const ctMap = new Map(contactos.map(c => [c.id, c]))

  const rows: (string | number | null)[][] = [
    [
      'Número', 'Fecha', 'Fecha envío', 'Empresa', 'NIT', 'Contacto', 'Cotizador',
      'Estado cotización', 'Etapa oportunidad', 'Valor cotizado', 'Valor adjudicado',
      'Fecha adjudicación', 'Motivo pérdida', 'Ubicación/Proyecto', 'Notas'
    ],
  ]

  for (const c of cotizaciones) {
    const op = opMap.get(c.oportunidad_id)
    const emp = op ? empMap.get(op.empresa_id) : null
    const ct = op?.contacto_id ? ctMap.get(op.contacto_id) : null
    const cotizador = op ? findCotizador(op.cotizador_asignado) : null
    rows.push([
      c.numero || '',
      c.fecha || '',
      c.fecha_envio || '',
      emp?.nombre || '',
      emp?.nit || '',
      ct?.nombre || '',
      cotizador?.nombre || op?.cotizador_asignado || '',
      c.estado || '',
      op?.etapa || '',
      c.total ?? 0,
      op?.valor_adjudicado ?? 0,
      op?.fecha_adjudicacion || '',
      op?.motivo_perdida || '',
      op?.ubicacion || '',
      op?.notas || '',
    ])
  }

  const ws = XLSX.utils.aoa_to_sheet(rows)

  // Column widths (approximate character counts)
  ws['!cols'] = [
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 32 }, { wch: 14 },
    { wch: 22 }, { wch: 18 }, { wch: 14 }, { wch: 18 }, { wch: 14 },
    { wch: 14 }, { wch: 14 }, { wch: 22 }, { wch: 30 }, { wch: 40 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Cotizaciones')

  const fname = filename || `Cotizaciones_${new Date().toISOString().slice(0, 10)}.xlsx`
  XLSX.writeFile(wb, fname)
}

import { describe, it, expect } from 'vitest'

/**
 * Tests for the cotización numbering logic.
 * The logic is inline in OportunidadDetalle.tsx (getDefaultNumero).
 * We replicate the pure logic here to test it without rendering React.
 */
function getDefaultNumero(cotizaciones: { numero: string }[], baseNumero?: string): string {
  // If editing (versioning), suggest next letter version
  if (baseNumero) {
    const letterMatch = baseNumero.match(/^(.+?)([A-Z])$/)
    if (letterMatch) {
      const nextLetter = String.fromCharCode(letterMatch[2].charCodeAt(0) + 1)
      return `${letterMatch[1]}${nextLetter}`
    }
    return `${baseNumero}A`
  }
  // New cotización: find max number for current year
  const year = new Date().getFullYear()
  const prefix = `${year}-`
  let maxNum = 0
  for (const c of cotizaciones) {
    if (c.numero.startsWith(prefix)) {
      const rest = c.numero.slice(prefix.length).replace(/[A-Z]+$/, '')
      const n = parseInt(rest, 10)
      if (n > maxNum) maxNum = n
    }
  }
  return `${year}-${maxNum + 1}`
}

const YEAR = new Date().getFullYear()

describe('Número consecutivo de cotización', () => {
  it('sin cotizaciones previas → sugiere YYYY-1', () => {
    expect(getDefaultNumero([])).toBe(`${YEAR}-1`)
  })

  it('última es "2026-425" → sugiere "2026-426"', () => {
    const cots = [{ numero: '2026-425' }, { numero: '2026-100' }]
    // Only matches current year
    const result = getDefaultNumero(cots)
    if (YEAR === 2026) {
      expect(result).toBe('2026-426')
    } else {
      // If running in a different year, it won't match 2026- prefix
      expect(result).toBe(`${YEAR}-1`)
    }
  })

  it('versionar "2026-425" → sugiere "2026-425A"', () => {
    expect(getDefaultNumero([], '2026-425')).toBe('2026-425A')
  })

  it('ya existe "2026-425A" → sugiere "2026-425B"', () => {
    expect(getDefaultNumero([], '2026-425A')).toBe('2026-425B')
  })

  it('ya existe "2026-425B" → sugiere "2026-425C"', () => {
    expect(getDefaultNumero([], '2026-425B')).toBe('2026-425C')
  })

  it('formato siempre es YYYY-NNN', () => {
    const cots = [{ numero: `${YEAR}-50` }, { numero: `${YEAR}-100` }]
    const result = getDefaultNumero(cots)
    expect(result).toMatch(/^\d{4}-\d+$/)
    expect(result).toBe(`${YEAR}-101`)
  })

  it('ignora cotizaciones de otros años', () => {
    const cots = [{ numero: '2025-999' }, { numero: `${YEAR}-10` }]
    const result = getDefaultNumero(cots)
    expect(result).toBe(`${YEAR}-11`)
  })

  it('ignora letras de versión al calcular máximo', () => {
    const cots = [{ numero: `${YEAR}-200A` }, { numero: `${YEAR}-200B` }, { numero: `${YEAR}-200` }]
    const result = getDefaultNumero(cots)
    expect(result).toBe(`${YEAR}-201`)
  })
})

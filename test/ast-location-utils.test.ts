import { describe, it, expect } from 'vitest'
import { extractLocation } from '../src/ast/location-utils.js'

// ─── extractLocation ──────────────────────────────────
describe('extractLocation', () => {
  it('returns default for null input', () => {
    const loc = extractLocation(null)
    expect(loc).toEqual({
      end: { column: 1, line: 1 },
      start: { column: 0, line: 1 },
    })
  })

  it('returns default for undefined input', () => {
    const loc = extractLocation(undefined)
    expect(loc).toEqual({
      end: { column: 1, line: 1 },
      start: { column: 0, line: 1 },
    })
  })

  it('returns default for primitive input', () => {
    expect(extractLocation(42)).toEqual({
      end: { column: 1, line: 1 },
      start: { column: 0, line: 1 },
    })
  })

  it('returns default for object without loc', () => {
    expect(extractLocation({ type: 'Literal' })).toEqual({
      end: { column: 1, line: 1 },
      start: { column: 0, line: 1 },
    })
  })

  it('extracts location from node with loc', () => {
    const node = {
      loc: {
        end: { column: 10, line: 5 },
        start: { column: 0, line: 1 },
      },
      type: 'Identifier',
    }
    const loc = extractLocation(node)
    expect(loc.start).toEqual({ column: 0, line: 1 })
    expect(loc.end).toEqual({ column: 10, line: 5 })
  })

  it('uses custom default line', () => {
    const loc = extractLocation(null, 10)
    expect(loc.start.line).toBe(10)
    expect(loc.end.line).toBe(10)
  })

  it('handles partial loc with missing start', () => {
    const node = { loc: { end: { column: 5, line: 3 } } }
    const loc = extractLocation(node)
    expect(loc.start.column).toBe(0)
    expect(loc.start.line).toBe(1)
    expect(loc.end.column).toBe(5)
    expect(loc.end.line).toBe(3)
  })

  it('handles partial loc with missing end', () => {
    const node = { loc: { start: { column: 2, line: 4 } } }
    const loc = extractLocation(node)
    expect(loc.start.column).toBe(2)
    expect(loc.start.line).toBe(4)
    expect(loc.end.column).toBe(0)
    expect(loc.end.line).toBe(1)
  })

  it('handles loc with non-numeric values', () => {
    const node = { loc: { start: { column: 'a', line: 'b' }, end: {} } }
    const loc = extractLocation(node)
    expect(loc.start.column).toBe(0)
    expect(loc.start.line).toBe(1)
  })

  it('handles null loc', () => {
    const node = { loc: null }
    const loc = extractLocation(node)
    expect(loc.start.line).toBe(1)
  })

  it('returns copy of default each time', () => {
    const loc1 = extractLocation(null)
    const loc2 = extractLocation(null)
    loc1.start.line = 99
    expect(loc2.start.line).toBe(1)
  })
})

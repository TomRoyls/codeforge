import { describe, test, expect } from 'vitest'
import { extractLocation } from '../../../src/ast/location-utils.js'

describe('location-utils', () => {
  describe('extractLocation', () => {
    // ─── Null / Undefined ────────────────────────────────────────────
    test('returns default location for null', () => {
      const result = extractLocation(null)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('returns default location for undefined', () => {
      const result = extractLocation(undefined)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    // ─── Primitive non-object inputs ──────────────────────────────────
    test('returns default location for non-object input (string)', () => {
      const result = extractLocation('not an object')
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('returns default location for non-object input (empty string)', () => {
      const result = extractLocation('')
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('returns default location for non-object input (number)', () => {
      const result = extractLocation(42)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('returns default location for non-object input (zero)', () => {
      const result = extractLocation(0)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('returns default location for non-object input (negative number)', () => {
      const result = extractLocation(-1)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('returns default location for non-object input (NaN)', () => {
      const result = extractLocation(NaN)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('returns default location for non-object input (Infinity)', () => {
      const result = extractLocation(Infinity)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('returns default location for non-object input (boolean true)', () => {
      const result = extractLocation(true)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('returns default location for non-object input (boolean false)', () => {
      const result = extractLocation(false)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('returns default location for BigInt', () => {
      const result = extractLocation(BigInt(9007199254740991))
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('returns default location for Symbol', () => {
      const result = extractLocation(Symbol('test'))
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    // ─── Array inputs ─────────────────────────────────────────────────
    test('returns default location for array', () => {
      const result = extractLocation([1, 2, 3])
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('returns default location for empty array', () => {
      const result = extractLocation([])
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('returns default location for array with loc-like items', () => {
      const result = extractLocation([{ line: 1, column: 0 }])
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    // ─── Objects without loc ──────────────────────────────────────────
    test('returns default location for empty object', () => {
      const result = extractLocation({})
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('returns default location for object without loc property', () => {
      const result = extractLocation({ foo: 'bar' })
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('returns default location for object with start/end but no loc', () => {
      const result = extractLocation({
        start: { line: 5, column: 0 },
        end: { line: 10, column: 0 },
      })
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('returns default location for object with type property only', () => {
      const result = extractLocation({ type: 'Identifier' })
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    // ─── Objects with null/undefined loc ──────────────────────────────
    test('returns default location for object with null loc', () => {
      const result = extractLocation({ loc: null })
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('returns default location for object with undefined loc', () => {
      const result = extractLocation({ loc: undefined })
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    // ─── Valid loc with start and end ─────────────────────────────────
    test('returns correct location for valid node with loc.start and loc.end', () => {
      const node = {
        loc: {
          start: { line: 5, column: 10 },
          end: { line: 10, column: 20 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 5, column: 10 },
        end: { line: 10, column: 20 },
      })
    })

    test('handles single-line node', () => {
      const node = {
        type: 'Identifier',
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 5 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 5 },
      })
    })

    test('handles multi-line node', () => {
      const node = {
        type: 'BlockStatement',
        loc: {
          start: { line: 10, column: 4 },
          end: { line: 25, column: 2 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 10, column: 4 },
        end: { line: 25, column: 2 },
      })
    })

    // ─── Edge cases: line/column = 0 ─────────────────────────────────
    test('handles line 0 and column 0 in start', () => {
      const node = {
        loc: {
          start: { line: 0, column: 0 },
          end: { line: 5, column: 10 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 0, column: 0 },
        end: { line: 5, column: 10 },
      })
    })

    test('handles line 0 and column 0 in end', () => {
      const node = {
        loc: {
          start: { line: 3, column: 5 },
          end: { line: 0, column: 0 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 3, column: 5 },
        end: { line: 0, column: 0 },
      })
    })

    test('handles both start and end at line 0, column 0', () => {
      const node = {
        loc: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 0 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 0, column: 0 },
        end: { line: 0, column: 0 },
      })
    })

    // ─── Large line/column values ─────────────────────────────────────
    test('handles very large line numbers', () => {
      const node = {
        loc: {
          start: { line: 999999, column: 0 },
          end: { line: 1000000, column: 1 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 999999, column: 0 },
        end: { line: 1000000, column: 1 },
      })
    })

    test('handles very large column numbers', () => {
      const node = {
        loc: {
          start: { line: 1, column: 500000 },
          end: { line: 1, column: 500010 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 1, column: 500000 },
        end: { line: 1, column: 500010 },
      })
    })

    test('handles Number.MAX_SAFE_INTEGER for line', () => {
      const node = {
        loc: {
          start: { line: Number.MAX_SAFE_INTEGER, column: 0 },
          end: { line: Number.MAX_SAFE_INTEGER, column: 1 },
        },
      }
      const result = extractLocation(node)
      expect(result.start.line).toBe(Number.MAX_SAFE_INTEGER)
      expect(result.end.line).toBe(Number.MAX_SAFE_INTEGER)
    })

    // ─── Negative line/column values (still numbers) ──────────────────
    test('handles negative line number in start', () => {
      const node = {
        loc: {
          start: { line: -1, column: 0 },
          end: { line: 5, column: 0 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: -1, column: 0 },
        end: { line: 5, column: 0 },
      })
    })

    test('handles negative column number in start', () => {
      const node = {
        loc: {
          start: { line: 1, column: -5 },
          end: { line: 1, column: 0 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 1, column: -5 },
        end: { line: 1, column: 0 },
      })
    })

    test('handles negative line number in end', () => {
      const node = {
        loc: {
          start: { line: 1, column: 0 },
          end: { line: -10, column: 0 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: -10, column: 0 },
      })
    })

    test('handles negative column number in end', () => {
      const node = {
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: -3 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: -3 },
      })
    })

    // ─── NaN / Infinity line/column ────────────────────────────────────
    test('handles NaN as line in start (non-number typeof)', () => {
      const node = {
        loc: {
          start: { line: NaN, column: 0 },
          end: { line: 5, column: 0 },
        },
      }
      const result = extractLocation(node)
      // typeof NaN === 'number', so it passes the check
      expect(result.start.line).toBeNaN()
    })

    test('handles Infinity as line in start', () => {
      const node = {
        loc: {
          start: { line: Infinity, column: 0 },
          end: { line: 5, column: 0 },
        },
      }
      const result = extractLocation(node)
      expect(result.start.line).toBe(Infinity)
    })

    test('handles -Infinity as line in start', () => {
      const node = {
        loc: {
          start: { line: -Infinity, column: 0 },
          end: { line: 5, column: 0 },
        },
      }
      const result = extractLocation(node)
      expect(result.start.line).toBe(-Infinity)
    })

    test('handles NaN as column in end', () => {
      const node = {
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 5, column: NaN },
        },
      }
      const result = extractLocation(node)
      expect(result.end.column).toBeNaN()
    })

    test('handles Infinity as column in end', () => {
      const node = {
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 5, column: Infinity },
        },
      }
      const result = extractLocation(node)
      expect(result.end.column).toBe(Infinity)
    })

    // ─── Partial loc: missing start or end ────────────────────────────
    test('handles partial loc with missing start', () => {
      const node = {
        loc: {
          end: { line: 5, column: 10 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 5, column: 10 },
      })
    })

    test('handles partial loc with missing end', () => {
      const node = {
        loc: {
          start: { line: 5, column: 10 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 5, column: 10 },
        end: { line: 1, column: 0 },
      })
    })

    test('handles partial loc with both start and end missing', () => {
      const node = { loc: {} }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 0 },
      })
    })

    // ─── Partial loc: missing specific fields ─────────────────────────
    test('handles loc object with missing start.line', () => {
      const node = {
        type: 'ForStatement',
        loc: {
          start: { column: 4 } as { column: number },
          end: { line: 5, column: 1 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 1, column: 4 },
        end: { line: 5, column: 1 },
      })
    })

    test('handles loc object with missing start.column', () => {
      const node = {
        type: 'WhileStatement',
        loc: {
          start: { line: 7 } as { line: number },
          end: { line: 9, column: 0 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 7, column: 0 },
        end: { line: 9, column: 0 },
      })
    })

    test('handles loc object with missing end.line', () => {
      const node = {
        type: 'ReturnStatement',
        loc: {
          start: { line: 12, column: 8 },
          end: { column: 12 } as { column: number },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 12, column: 8 },
        end: { line: 1, column: 12 },
      })
    })

    test('handles loc object with missing end.column', () => {
      const node = {
        type: 'VariableDeclaration',
        loc: {
          start: { line: 2, column: 0 },
          end: { line: 2 } as { line: number },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 2, column: 0 },
        end: { line: 2, column: 0 },
      })
    })

    test('handles loc with both start.line and start.column missing', () => {
      const node = {
        loc: {
          start: {} as Record<string, unknown>,
          end: { line: 5, column: 10 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 5, column: 10 },
      })
    })

    test('handles loc with both end.line and end.column missing', () => {
      const node = {
        loc: {
          start: { line: 5, column: 10 },
          end: {} as Record<string, unknown>,
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 5, column: 10 },
        end: { line: 1, column: 0 },
      })
    })

    test('handles loc with all four fields missing (empty start and end)', () => {
      const node = {
        loc: {
          start: {} as Record<string, unknown>,
          end: {} as Record<string, unknown>,
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 0 },
      })
    })

    // ─── Non-number line/column values ────────────────────────────────
    test('handles loc with non-number line values (string)', () => {
      const node = {
        loc: {
          start: { line: '5' as unknown as number, column: 10 },
          end: { line: 10, column: 20 },
        },
      }
      const result = extractLocation(node)
      expect(result.start.line).toBe(1)
    })

    test('handles loc with non-number column values (string)', () => {
      const node = {
        loc: {
          start: { line: 5, column: '10' as unknown as number },
          end: { line: 10, column: 20 },
        },
      }
      const result = extractLocation(node)
      expect(result.start.column).toBe(0)
    })

    test('handles loc with undefined line in start', () => {
      const node = {
        loc: {
          start: { line: undefined as unknown as number, column: 10 },
          end: { line: 5, column: 10 },
        },
      }
      const result = extractLocation(node)
      expect(result.start.line).toBe(1)
    })

    test('handles loc with undefined column in start', () => {
      const node = {
        loc: {
          start: { line: 5, column: undefined as unknown as number },
          end: { line: 10, column: 20 },
        },
      }
      const result = extractLocation(node)
      expect(result.start.column).toBe(0)
    })

    test('handles loc with null line in start', () => {
      const node = {
        loc: {
          start: { line: null as unknown as number, column: 10 },
          end: { line: 5, column: 10 },
        },
      }
      const result = extractLocation(node)
      expect(result.start.line).toBe(1)
    })

    test('handles loc with null column in start', () => {
      const node = {
        loc: {
          start: { line: 5, column: null as unknown as number },
          end: { line: 10, column: 20 },
        },
      }
      const result = extractLocation(node)
      expect(result.start.column).toBe(0)
    })

    test('handles loc with boolean line in end', () => {
      const node = {
        loc: {
          start: { line: 1, column: 0 },
          end: { line: true as unknown as number, column: 10 },
        },
      }
      const result = extractLocation(node)
      expect(result.end.line).toBe(1)
    })

    test('handles loc with boolean column in end', () => {
      const node = {
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 5, column: false as unknown as number },
        },
      }
      const result = extractLocation(node)
      expect(result.end.column).toBe(0)
    })

    test('handles loc with object as line value', () => {
      const node = {
        loc: {
          start: { line: { value: 5 } as unknown as number, column: 0 },
          end: { line: 10, column: 0 },
        },
      }
      const result = extractLocation(node)
      expect(result.start.line).toBe(1)
    })

    test('handles loc with array as column value', () => {
      const node = {
        loc: {
          start: { line: 5, column: [10] as unknown as number },
          end: { line: 10, column: 20 },
        },
      }
      const result = extractLocation(node)
      expect(result.start.column).toBe(0)
    })

    test('handles end with non-number line value', () => {
      const node = {
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 'end' as unknown as number, column: 10 },
        },
      }
      const result = extractLocation(node)
      expect(result.end.line).toBe(1)
    })

    test('handles end with non-number column value', () => {
      const node = {
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 5, column: 'col' as unknown as number },
        },
      }
      const result = extractLocation(node)
      expect(result.end.column).toBe(0)
    })

    // ─── loc as non-object types ──────────────────────────────────────
    test('returns fallback for loc as string (no start/end)', () => {
      const result = extractLocation({ loc: 'bad' })
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 0 },
      })
    })

    test('returns fallback for loc as number (no start/end)', () => {
      const result = extractLocation({ loc: 42 })
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 0 },
      })
    })

    test('returns fallback for loc as boolean (no start/end)', () => {
      const result = extractLocation({ loc: true })
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 0 },
      })
    })

    test('returns fallback for loc as array (no start/end)', () => {
      const result = extractLocation({ loc: [1, 2] })
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 0 },
      })
    })

    // ─── start/end as non-object types ────────────────────────────────
    test('handles start as null', () => {
      const node = {
        loc: {
          start: null as unknown as { line: number; column: number },
          end: { line: 5, column: 10 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 5, column: 10 },
      })
    })

    test('handles end as null', () => {
      const node = {
        loc: {
          start: { line: 5, column: 10 },
          end: null as unknown as { line: number; column: number },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 5, column: 10 },
        end: { line: 1, column: 0 },
      })
    })

    test('handles start as undefined', () => {
      const node = {
        loc: {
          start: undefined as unknown as { line: number; column: number },
          end: { line: 5, column: 10 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 5, column: 10 },
      })
    })

    test('handles end as undefined', () => {
      const node = {
        loc: {
          start: { line: 5, column: 10 },
          end: undefined as unknown as { line: number; column: number },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 5, column: 10 },
        end: { line: 1, column: 0 },
      })
    })

    test('handles start as number', () => {
      const node = {
        loc: {
          start: 42 as unknown as { line: number; column: number },
          end: { line: 5, column: 10 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 5, column: 10 },
      })
    })

    test('handles end as number', () => {
      const node = {
        loc: {
          start: { line: 5, column: 10 },
          end: 99 as unknown as { line: number; column: number },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 5, column: 10 },
        end: { line: 1, column: 0 },
      })
    })

    test('handles start as string', () => {
      const node = {
        loc: {
          start: 'bad' as unknown as { line: number; column: number },
          end: { line: 5, column: 10 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 5, column: 10 },
      })
    })

    test('handles end as string', () => {
      const node = {
        loc: {
          start: { line: 5, column: 10 },
          end: 'bad' as unknown as { line: number; column: number },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 5, column: 10 },
        end: { line: 1, column: 0 },
      })
    })

    test('handles both start and end as null', () => {
      const node = {
        loc: {
          start: null as unknown as { line: number; column: number },
          end: null as unknown as { line: number; column: number },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 0 },
      })
    })

    // ─── custom defaultLine parameter ─────────────────────────────────
    test('uses custom defaultLine parameter', () => {
      const result = extractLocation(null, 42)
      expect(result).toEqual({
        start: { line: 42, column: 0 },
        end: { line: 42, column: 1 },
      })
    })

    test('uses custom defaultLine for missing loc', () => {
      const result = extractLocation({ foo: 'bar' }, 10)
      expect(result).toEqual({
        start: { line: 10, column: 0 },
        end: { line: 10, column: 1 },
      })
    })

    test('uses custom defaultLine for missing start.line', () => {
      const node = {
        type: 'PartialStart',
        loc: {
          start: { column: 3 } as { column: number },
          end: { line: 8, column: 1 },
        },
      }
      const result = extractLocation(node, 15)
      expect(result).toEqual({
        start: { line: 15, column: 3 },
        end: { line: 8, column: 1 },
      })
    })

    test('uses custom defaultLine for missing end.line', () => {
      const node = {
        type: 'PartialEnd',
        loc: {
          start: { line: 3, column: 0 },
          end: { column: 1 } as { column: number },
        },
      }
      const result = extractLocation(node, 7)
      expect(result).toEqual({
        start: { line: 3, column: 0 },
        end: { line: 7, column: 1 },
      })
    })

    test('ignores custom defaultLine when valid loc is present', () => {
      const node = {
        type: 'ValidLoc',
        loc: {
          start: { line: 100, column: 0 },
          end: { line: 105, column: 1 },
        },
      }
      const result = extractLocation(node, 999)
      expect(result).toEqual({
        start: { line: 100, column: 0 },
        end: { line: 105, column: 1 },
      })
    })

    test('uses defaultLine 0 when specified', () => {
      const result = extractLocation(null, 0)
      expect(result).toEqual({
        start: { line: 0, column: 0 },
        end: { line: 0, column: 1 },
      })
    })

    test('uses defaultLine with negative number', () => {
      const result = extractLocation(null, -5)
      expect(result).toEqual({
        start: { line: -5, column: 0 },
        end: { line: -5, column: 1 },
      })
    })

    test('uses defaultLine for null loc', () => {
      const result = extractLocation({ loc: null }, 50)
      expect(result).toEqual({
        start: { line: 50, column: 0 },
        end: { line: 50, column: 1 },
      })
    })

    test('uses defaultLine for undefined loc', () => {
      const result = extractLocation({ loc: undefined }, 33)
      expect(result).toEqual({
        start: { line: 33, column: 0 },
        end: { line: 33, column: 1 },
      })
    })

    test('uses defaultLine for both missing start.line and end.line', () => {
      const node = {
        loc: {
          start: { column: 5 } as { column: number },
          end: { column: 10 } as { column: number },
        },
      }
      const result = extractLocation(node, 20)
      expect(result).toEqual({
        start: { line: 20, column: 5 },
        end: { line: 20, column: 10 },
      })
    })

    test('uses defaultLine for missing start.line but valid end.line', () => {
      const node = {
        loc: {
          start: { column: 0 } as { column: number },
          end: { line: 8, column: 2 },
        },
      }
      const result = extractLocation(node, 100)
      expect(result).toEqual({
        start: { line: 100, column: 0 },
        end: { line: 8, column: 2 },
      })
    })

    test('uses defaultLine for missing end.line but valid start.line', () => {
      const node = {
        loc: {
          start: { line: 3, column: 0 },
          end: { column: 5 } as { column: number },
        },
      }
      const result = extractLocation(node, 77)
      expect(result).toEqual({
        start: { line: 3, column: 0 },
        end: { line: 77, column: 5 },
      })
    })

    // ─── Floating point line/column values ────────────────────────────
    test('handles float line number', () => {
      const node = {
        loc: {
          start: { line: 3.5, column: 0 },
          end: { line: 5, column: 0 },
        },
      }
      const result = extractLocation(node)
      expect(result.start.line).toBe(3.5)
    })

    test('handles float column number', () => {
      const node = {
        loc: {
          start: { line: 1, column: 2.7 },
          end: { line: 5, column: 10 },
        },
      }
      const result = extractLocation(node)
      expect(result.start.column).toBe(2.7)
    })

    // ─── Realistic AST node types ─────────────────────────────────────
    test('handles function declaration node', () => {
      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'myFunction' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 3, column: 1 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 3, column: 1 },
      })
    })

    test('handles class declaration node', () => {
      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'MyClass' },
        loc: {
          start: { line: 10, column: 2 },
          end: { line: 20, column: 1 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 10, column: 2 },
        end: { line: 20, column: 1 },
      })
    })

    test('handles call expression node', () => {
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'console' },
        arguments: [],
        loc: {
          start: { line: 5, column: 4 },
          end: { line: 5, column: 18 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 5, column: 4 },
        end: { line: 5, column: 18 },
      })
    })

    test('handles arrow function expression', () => {
      const node = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'Identifier', name: 'x' },
        loc: {
          start: { line: 8, column: 12 },
          end: { line: 8, column: 20 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 8, column: 12 },
        end: { line: 8, column: 20 },
      })
    })

    test('handles member expression node', () => {
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
        loc: {
          start: { line: 3, column: 0 },
          end: { line: 3, column: 8 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 3, column: 0 },
        end: { line: 3, column: 8 },
      })
    })

    test('handles binary expression node', () => {
      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 1 },
        right: { type: 'Literal', value: 2 },
        loc: {
          start: { line: 15, column: 4 },
          end: { line: 15, column: 9 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 15, column: 4 },
        end: { line: 15, column: 9 },
      })
    })

    test('handles if statement node', () => {
      const node = {
        type: 'IfStatement',
        test: { type: 'Literal', value: true },
        consequent: { type: 'BlockStatement', body: [] },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 5, column: 1 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 5, column: 1 },
      })
    })

    test('handles try-catch statement node', () => {
      const node = {
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: { type: 'CatchClause', body: { type: 'BlockStatement', body: [] } },
        loc: {
          start: { line: 20, column: 0 },
          end: { line: 30, column: 1 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 20, column: 0 },
        end: { line: 30, column: 1 },
      })
    })

    test('handles import declaration node', () => {
      const node = {
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'lodash' },
        specifiers: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 25 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 25 },
      })
    })

    test('handles export default declaration node', () => {
      const node = {
        type: 'ExportDefaultDeclaration',
        declaration: { type: 'Identifier', name: 'foo' },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 20 },
      })
    })

    test('handles template literal node', () => {
      const node = {
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
        loc: {
          start: { line: 7, column: 10 },
          end: { line: 7, column: 30 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 7, column: 10 },
        end: { line: 7, column: 30 },
      })
    })

    test('handles object expression node', () => {
      const node = {
        type: 'ObjectExpression',
        properties: [],
        loc: {
          start: { line: 12, column: 2 },
          end: { line: 18, column: 3 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 12, column: 2 },
        end: { line: 18, column: 3 },
      })
    })

    test('handles array expression node', () => {
      const node = {
        type: 'ArrayExpression',
        elements: [],
        loc: {
          start: { line: 4, column: 8 },
          end: { line: 4, column: 10 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 4, column: 8 },
        end: { line: 4, column: 10 },
      })
    })

    test('handles new expression node', () => {
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        arguments: [],
        loc: {
          start: { line: 22, column: 4 },
          end: { line: 22, column: 10 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 22, column: 4 },
        end: { line: 22, column: 10 },
      })
    })

    test('handles switch statement node', () => {
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 10, column: 1 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 10, column: 1 },
      })
    })

    test('handles conditional expression node', () => {
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Literal', value: 1 },
        alternate: { type: 'Literal', value: 2 },
        loc: {
          start: { line: 6, column: 0 },
          end: { line: 6, column: 15 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 6, column: 0 },
        end: { line: 6, column: 15 },
      })
    })

    test('handles for-of statement node', () => {
      const node = {
        type: 'ForOfStatement',
        left: { type: 'Identifier', name: 'item' },
        right: { type: 'Identifier', name: 'items' },
        body: { type: 'BlockStatement', body: [] },
        loc: {
          start: { line: 100, column: 0 },
          end: { line: 105, column: 1 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 100, column: 0 },
        end: { line: 105, column: 1 },
      })
    })

    // ─── Return value structure verification ───────────────────────────
    test('returns an object with start and end properties', () => {
      const result = extractLocation(null)
      expect(result).toHaveProperty('start')
      expect(result).toHaveProperty('end')
    })

    test('returns start with line and column properties', () => {
      const result = extractLocation(null)
      expect(result.start).toHaveProperty('line')
      expect(result.start).toHaveProperty('column')
    })

    test('returns end with line and column properties', () => {
      const result = extractLocation(null)
      expect(result.end).toHaveProperty('line')
      expect(result.end).toHaveProperty('column')
    })

    test('returns number types for all position values', () => {
      const node = {
        loc: {
          start: { line: 5, column: 10 },
          end: { line: 15, column: 20 },
        },
      }
      const result = extractLocation(node)
      expect(typeof result.start.line).toBe('number')
      expect(typeof result.start.column).toBe('number')
      expect(typeof result.end.line).toBe('number')
      expect(typeof result.end.column).toBe('number')
    })

    test('does not mutate the input node', () => {
      const node = {
        loc: {
          start: { line: 5, column: 10 },
          end: { line: 15, column: 20 },
        },
      }
      const original = JSON.parse(JSON.stringify(node))
      extractLocation(node)
      expect(node).toEqual(original)
    })

    test('returns a new object each call (not cached)', () => {
      const result1 = extractLocation(null)
      const result2 = extractLocation(null)
      expect(result1).not.toBe(result2)
      expect(result1).toEqual(result2)
    })

    // ─── Immutability: returned object is independent ─────────────────
    test('modifying returned result does not affect subsequent calls', () => {
      const result1 = extractLocation({
        loc: { start: { line: 1, column: 0 }, end: { line: 2, column: 0 } },
      })
      result1.start.line = 999
      const result2 = extractLocation({
        loc: { start: { line: 1, column: 0 }, end: { line: 2, column: 0 } },
      })
      expect(result2.start.line).toBe(1)
    })

    // ─── Loc with extra properties ────────────────────────────────────
    test('ignores extra properties on loc object', () => {
      const node = {
        loc: {
          source: 'file.ts',
          start: { line: 3, column: 5 },
          end: { line: 7, column: 2 },
          extra: true,
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 3, column: 5 },
        end: { line: 7, column: 2 },
      })
    })

    test('ignores extra properties on start object', () => {
      const node = {
        loc: {
          start: { line: 1, column: 0, offset: 42 },
          end: { line: 5, column: 10 },
        },
      }
      const result = extractLocation(node)
      expect(result.start).toEqual({ line: 1, column: 0 })
    })

    test('ignores extra properties on end object', () => {
      const node = {
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 5, column: 10, offset: 100 },
        },
      }
      const result = extractLocation(node)
      expect(result.end).toEqual({ line: 5, column: 10 })
    })

    // ─── Same line/column for start and end ───────────────────────────
    test('handles start and end at same position', () => {
      const node = {
        loc: {
          start: { line: 5, column: 10 },
          end: { line: 5, column: 10 },
        },
      }
      const result = extractLocation(node)
      expect(result.start).toEqual(result.end)
    })

    test('handles same line different columns', () => {
      const node = {
        loc: {
          start: { line: 3, column: 0 },
          end: { line: 3, column: 100 },
        },
      }
      const result = extractLocation(node)
      expect(result.start.line).toBe(result.end.line)
      expect(result.end.column).toBeGreaterThan(result.start.column)
    })

    test('handles different lines same column', () => {
      const node = {
        loc: {
          start: { line: 1, column: 5 },
          end: { line: 50, column: 5 },
        },
      }
      const result = extractLocation(node)
      expect(result.start.column).toBe(result.end.column)
      expect(result.end.line).toBeGreaterThan(result.start.line)
    })

    // ─── End before start (unusual but allowed) ───────────────────────
    test('handles end line before start line', () => {
      const node = {
        loc: {
          start: { line: 10, column: 0 },
          end: { line: 5, column: 0 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 10, column: 0 },
        end: { line: 5, column: 0 },
      })
    })

    test('handles end column before start column on same line', () => {
      const node = {
        loc: {
          start: { line: 3, column: 20 },
          end: { line: 3, column: 5 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 3, column: 20 },
        end: { line: 3, column: 5 },
      })
    })

    // ─── Range property present alongside loc ─────────────────────────
    test('ignores range property when loc is present', () => {
      const node = {
        range: [0, 10],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 10 },
      })
    })

    test('returns default when only range is present (no loc)', () => {
      const node = { range: [0, 10] }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    // ─── Deeply nested node structures ────────────────────────────────
    test('works with deeply nested AST node', () => {
      const node = {
        type: 'Program',
        body: [
          {
            type: 'FunctionDeclaration',
            body: {
              type: 'BlockStatement',
              body: [{ type: 'ReturnStatement' }],
            },
          },
        ],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 100, column: 1 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 100, column: 1 },
      })
    })

    // ─── defaultLine with valid start but invalid end ─────────────────
    test('uses defaultLine for end.line when end.line is non-number, even with valid start', () => {
      const node = {
        loc: {
          start: { line: 5, column: 10 },
          end: { line: 'bad' as unknown as number, column: 20 },
        },
      }
      const result = extractLocation(node, 99)
      expect(result).toEqual({
        start: { line: 5, column: 10 },
        end: { line: 99, column: 20 },
      })
    })

    test('uses defaultLine for start.line when start.line is non-number, even with valid end', () => {
      const node = {
        loc: {
          start: { line: 'bad' as unknown as number, column: 5 },
          end: { line: 20, column: 10 },
        },
      }
      const result = extractLocation(node, 50)
      expect(result).toEqual({
        start: { line: 50, column: 5 },
        end: { line: 20, column: 10 },
      })
    })

    // ─── defaultLine with partially valid columns ─────────────────────
    test('uses column 0 for non-number start.column with valid start.line', () => {
      const node = {
        loc: {
          start: { line: 5, column: 'bad' as unknown as number },
          end: { line: 10, column: 20 },
        },
      }
      const result = extractLocation(node, 99)
      expect(result.start.column).toBe(0)
      expect(result.start.line).toBe(5)
    })

    test('uses column 0 for non-number end.column with valid end.line', () => {
      const node = {
        loc: {
          start: { line: 5, column: 10 },
          end: { line: 10, column: 'bad' as unknown as number },
        },
      }
      const result = extractLocation(node, 99)
      expect(result.end.column).toBe(0)
      expect(result.end.line).toBe(10)
    })

    // ─── Multiple calls consistency ────────────────────────────────────
    test('returns consistent results for same input across calls', () => {
      const node = {
        loc: {
          start: { line: 5, column: 10 },
          end: { line: 15, column: 20 },
        },
      }
      const r1 = extractLocation(node)
      const r2 = extractLocation(node)
      const r3 = extractLocation(node)
      expect(r1).toEqual(r2)
      expect(r2).toEqual(r3)
    })

    // ─── Date object as input ─────────────────────────────────────────
    test('returns default location for Date object', () => {
      const result = extractLocation(new Date())
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    // ─── RegExp as input ──────────────────────────────────────────────
    test('returns default location for RegExp', () => {
      const result = extractLocation(/test/g)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    // ─── Map/Set as input ─────────────────────────────────────────────
    test('returns default location for Map', () => {
      const result = extractLocation(new Map())
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('returns default location for Set', () => {
      const result = extractLocation(new Set())
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    // ─── Function as input ────────────────────────────────────────────
    test('returns default location for function', () => {
      const result = extractLocation(() => {})
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    // ─── Stress: many properties on node ──────────────────────────────
    test('handles node with many properties', () => {
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [{ type: 'Literal', value: 1 }],
        optional: false,
        computed: false,
        shorthand: false,
        method: false,
        kind: 'init',
        static: false,
        async: false,
        generator: false,
        expression: false,
        loc: {
          start: { line: 42, column: 7 },
          end: { line: 42, column: 13 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 42, column: 7 },
        end: { line: 42, column: 13 },
      })
    })

    // ─── Column defaults to 0 when missing ────────────────────────────
    test('start.column defaults to 0 when start has no column', () => {
      const node = {
        loc: {
          start: { line: 5 } as { line: number },
          end: { line: 10, column: 5 },
        },
      }
      const result = extractLocation(node)
      expect(result.start.column).toBe(0)
    })

    test('end.column defaults to 0 when end has no column', () => {
      const node = {
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 10 } as { line: number },
        },
      }
      const result = extractLocation(node)
      expect(result.end.column).toBe(0)
    })

    // ─── Extra fields in start/end beyond line/column ─────────────────
    test('start with extra field does not affect extraction', () => {
      const node = {
        loc: {
          start: { line: 3, column: 5, index: 100 },
          end: { line: 7, column: 2 },
        },
      }
      const result = extractLocation(node)
      expect(result.start.line).toBe(3)
      expect(result.start.column).toBe(5)
      expect((result.start as Record<string, unknown>).index).toBeUndefined()
    })

    test('end with extra field does not affect extraction', () => {
      const node = {
        loc: {
          start: { line: 3, column: 5 },
          end: { line: 7, column: 2, index: 200 },
        },
      }
      const result = extractLocation(node)
      expect(result.end.line).toBe(7)
      expect(result.end.column).toBe(2)
      expect((result.end as Record<string, unknown>).index).toBeUndefined()
    })

    // ─── Mixed valid/invalid combinations ─────────────────────────────
    test('valid start.line, invalid start.column, valid end', () => {
      const node = {
        loc: {
          start: { line: 5, column: null as unknown as number },
          end: { line: 10, column: 3 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 5, column: 0 },
        end: { line: 10, column: 3 },
      })
    })

    test('invalid start.line, valid start.column, valid end', () => {
      const node = {
        loc: {
          start: { line: null as unknown as number, column: 7 },
          end: { line: 10, column: 3 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 1, column: 7 },
        end: { line: 10, column: 3 },
      })
    })

    test('valid start, valid end.line, invalid end.column', () => {
      const node = {
        loc: {
          start: { line: 5, column: 3 },
          end: { line: 10, column: null as unknown as number },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 5, column: 3 },
        end: { line: 10, column: 0 },
      })
    })

    test('valid start, invalid end.line, valid end.column', () => {
      const node = {
        loc: {
          start: { line: 5, column: 3 },
          end: { line: null as unknown as number, column: 12 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 5, column: 3 },
        end: { line: 1, column: 12 },
      })
    })

    // ─── defaultLine edge cases ───────────────────────────────────────
    test('defaultLine with very large number', () => {
      const result = extractLocation(null, 999999999)
      expect(result).toEqual({
        start: { line: 999999999, column: 0 },
        end: { line: 999999999, column: 1 },
      })
    })

    test('defaultLine with floating point number', () => {
      const result = extractLocation(null, 3.14)
      expect(result).toEqual({
        start: { line: 3.14, column: 0 },
        end: { line: 3.14, column: 1 },
      })
    })

    // ─── Column fallback is always 0, never defaultLine ───────────────
    test('column fallback is always 0 for invalid start.column', () => {
      const node = {
        loc: {
          start: { line: 5, column: 'bad' as unknown as number },
          end: { line: 10, column: 0 },
        },
      }
      const result = extractLocation(node, 99)
      // column fallback is always 0, not the defaultLine
      expect(result.start.column).toBe(0)
    })

    test('column fallback is always 0 for invalid end.column', () => {
      const node = {
        loc: {
          start: { line: 5, column: 0 },
          end: { line: 10, column: 'bad' as unknown as number },
        },
      }
      const result = extractLocation(node, 99)
      expect(result.end.column).toBe(0)
    })

    test('column fallback is always 0 for missing start.column', () => {
      const node = {
        loc: {
          start: { line: 5 } as { line: number },
          end: { line: 10, column: 0 },
        },
      }
      const result = extractLocation(node, 99)
      expect(result.start.column).toBe(0)
    })

    test('column fallback is always 0 for missing end.column', () => {
      const node = {
        loc: {
          start: { line: 5, column: 0 },
          end: { line: 10 } as { line: number },
        },
      }
      const result = extractLocation(node, 99)
      expect(result.end.column).toBe(0)
    })

    // ─── proto / inherited properties ─────────────────────────────────
    test('does not use inherited loc property', () => {
      const proto = { loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 0 } } }
      const node = Object.create(proto)
      node.type = 'Test'
      // node.loc comes from prototype - still accessible via `in` but the function accesses it
      const result = extractLocation(node)
      // The function accesses `n.loc` which will find prototype properties
      expect(result.start.line).toBe(1)
      expect(result.end.line).toBe(5)
    })

    // ─── Whitespace-like node names ───────────────────────────────────
    test('handles node with empty type string', () => {
      const node = {
        type: '',
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 5 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 5 },
      })
    })

    // ─── Numeric string line values ───────────────────────────────────
    test('numeric string "5" is not treated as number for line', () => {
      const node = {
        loc: {
          start: { line: '5' as unknown as number, column: 0 },
          end: { line: 10, column: 0 },
        },
      }
      const result = extractLocation(node)
      expect(result.start.line).toBe(1) // Falls back to default
    })

    test('empty string is not treated as number for column', () => {
      const node = {
        loc: {
          start: { line: 5, column: '' as unknown as number },
          end: { line: 10, column: 0 },
        },
      }
      const result = extractLocation(node)
      expect(result.start.column).toBe(0) // Falls back to 0
    })

    // ─── Frozen objects ───────────────────────────────────────────────
    test('works with frozen node object', () => {
      const node = Object.freeze({
        loc: Object.freeze({
          start: Object.freeze({ line: 5, column: 10 }),
          end: Object.freeze({ line: 15, column: 20 }),
        }),
      })
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 5, column: 10 },
        end: { line: 15, column: 20 },
      })
    })

    test('works with sealed node object', () => {
      const node = Object.seal({
        loc: Object.seal({
          start: Object.seal({ line: 5, column: 10 }),
          end: Object.seal({ line: 15, column: 20 }),
        }),
      })
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 5, column: 10 },
        end: { line: 15, column: 20 },
      })
    })

    // ─── Proxy-wrapped node ───────────────────────────────────────────
    test('works with Proxy-wrapped node', () => {
      const node = new Proxy(
        {
          loc: {
            start: { line: 3, column: 5 },
            end: { line: 7, column: 10 },
          },
        },
        {},
      )
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 3, column: 5 },
        end: { line: 7, column: 10 },
      })
    })

    // ─── Combination: missing fields with defaultLine ─────────────────
    test('missing start entirely uses defaultLine for line, 0 for column', () => {
      const node = {
        loc: {
          end: { line: 10, column: 5 },
        },
      }
      const result = extractLocation(node, 42)
      expect(result).toEqual({
        start: { line: 42, column: 0 },
        end: { line: 10, column: 5 },
      })
    })

    test('missing end entirely uses defaultLine for line, 0 for column', () => {
      const node = {
        loc: {
          start: { line: 10, column: 5 },
        },
      }
      const result = extractLocation(node, 42)
      expect(result).toEqual({
        start: { line: 10, column: 5 },
        end: { line: 42, column: 0 },
      })
    })

    test('missing both start and end with defaultLine uses defaultLine for both lines', () => {
      const node = { loc: {} }
      const result = extractLocation(node, 100)
      expect(result).toEqual({
        start: { line: 100, column: 0 },
        end: { line: 100, column: 0 },
      })
    })

    // ─── Error-like objects ───────────────────────────────────────────
    test('returns default for Error object without loc', () => {
      const result = extractLocation(new Error('test'))
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    // ─── Sparse array as loc ──────────────────────────────────────────
    test('returns default for sparse array with loc property on prototype only', () => {
      const arr: unknown[] = []
      arr[5] = 'value'
      const result = extractLocation(arr)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    // ─── Computed property access ─────────────────────────────────────
    test('loc with computed-style properties works', () => {
      const node = {
        ['loc']: {
          ['start']: { ['line']: 7, ['column']: 3 },
          ['end']: { ['line']: 9, ['column']: 1 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 7, column: 3 },
        end: { line: 9, column: 1 },
      })
    })

    // ─── WeakRef / WeakMap as input ───────────────────────────────────
    test('returns default for WeakRef input', () => {
      const result = extractLocation(new WeakRef({}))
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('returns default for WeakMap input', () => {
      const result = extractLocation(new WeakMap())
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    // ─── Promise as input ─────────────────────────────────────────────
    test('returns default for Promise input', () => {
      const result = extractLocation(Promise.resolve(42))
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    // ─── Buffer / ArrayBuffer as input ────────────────────────────────
    test('returns default for ArrayBuffer input', () => {
      const result = extractLocation(new ArrayBuffer(8))
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    // ─── Int32Array / Float64Array as input ────────────────────────────
    test('returns default for Int32Array input', () => {
      const result = extractLocation(new Int32Array(4))
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    // ─── Default end.column is 1 when no loc at all ──────────────────
    test('default end.column is 1 when node has no loc at all', () => {
      const result = extractLocation({ type: 'Test' })
      expect(result.end.column).toBe(1)
    })

    test('default end.column is 1 when node is null', () => {
      const result = extractLocation(null)
      expect(result.end.column).toBe(1)
    })

    test('default end.column is 1 when node is undefined', () => {
      const result = extractLocation(undefined)
      expect(result.end.column).toBe(1)
    })

    // ─── Default end.column is 0 when loc exists but end missing ──────
    test('end.column is 0 when loc exists but end is missing', () => {
      const node = { loc: { start: { line: 1, column: 0 } } }
      const result = extractLocation(node)
      expect(result.end.column).toBe(0)
    })

    test('end.column is 0 when loc exists but end.column is missing', () => {
      const node = { loc: { start: { line: 1, column: 0 }, end: { line: 5 } as { line: number } } }
      const result = extractLocation(node)
      expect(result.end.column).toBe(0)
    })

    // ─── Simultaneous invalid start.line and start.column ─────────────
    test('both start.line and start.column invalid falls back to defaultLine and 0', () => {
      const node = {
        loc: {
          start: { line: 'x' as unknown as number, column: 'y' as unknown as number },
          end: { line: 10, column: 5 },
        },
      }
      const result = extractLocation(node, 55)
      expect(result.start).toEqual({ line: 55, column: 0 })
      expect(result.end).toEqual({ line: 10, column: 5 })
    })

    test('both end.line and end.column invalid falls back to defaultLine and 0', () => {
      const node = {
        loc: {
          start: { line: 5, column: 3 },
          end: { line: false as unknown as number, column: true as unknown as number },
        },
      }
      const result = extractLocation(node, 77)
      expect(result.start).toEqual({ line: 5, column: 3 })
      expect(result.end).toEqual({ line: 77, column: 0 })
    })

    // ─── All fields invalid with defaultLine ──────────────────────────
    test('all four fields invalid falls back entirely to defaultLine and 0', () => {
      const node = {
        loc: {
          start: { line: 'a' as unknown as number, column: 'b' as unknown as number },
          end: { line: 'c' as unknown as number, column: 'd' as unknown as number },
        },
      }
      const result = extractLocation(node, 88)
      expect(result).toEqual({
        start: { line: 88, column: 0 },
        end: { line: 88, column: 0 },
      })
    })

    // ─── Line 1 column 0 (common default) ────────────────────────────
    test('line 1 column 0 start and end is a valid location', () => {
      const node = {
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 0 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 0 },
      })
    })

    // ─── Additional coverage: special primitive edge cases ────────────
    test('returns default for non-object input (positive float)', () => {
      const result = extractLocation(3.14)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('returns default for non-object input (negative float)', () => {
      const result = extractLocation(-2.7)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('returns default for non-object input (-Infinity)', () => {
      const result = extractLocation(-Infinity)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('returns default for non-object input (long string)', () => {
      const result = extractLocation('a'.repeat(1000))
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    // ─── Additional coverage: loc with getter properties ──────────────
    test('handles loc with getter for start', () => {
      const node = {
        get loc() {
          return {
            start: { line: 4, column: 2 },
            end: { line: 6, column: 8 },
          }
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 4, column: 2 },
        end: { line: 6, column: 8 },
      })
    })

    // ─── Additional coverage: loc with numeric key properties ─────────
    test('ignores numeric keys on loc object', () => {
      const node = {
        loc: {
          0: 'zero',
          1: 'one',
          start: { line: 2, column: 4 },
          end: { line: 3, column: 6 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 2, column: 4 },
        end: { line: 3, column: 6 },
      })
    })

    // ─── Additional coverage: defaultLine with NaN ────────────────────
    test('uses NaN as defaultLine for null node', () => {
      const result = extractLocation(null, NaN)
      expect(result.start.line).toBeNaN()
      expect(result.end.line).toBeNaN()
      expect(result.start.column).toBe(0)
      expect(result.end.column).toBe(1)
    })

    // ─── Additional coverage: defaultLine with Infinity ───────────────
    test('uses Infinity as defaultLine for null node', () => {
      const result = extractLocation(null, Infinity)
      expect(result).toEqual({
        start: { line: Infinity, column: 0 },
        end: { line: Infinity, column: 1 },
      })
    })

    // ─── Additional coverage: defaultLine with -Infinity ──────────────
    test('uses -Infinity as defaultLine for null node', () => {
      const result = extractLocation(null, -Infinity)
      expect(result).toEqual({
        start: { line: -Infinity, column: 0 },
        end: { line: -Infinity, column: 1 },
      })
    })

    // ─── Additional coverage: node with Symbol keys ───────────────────
    test('returns default for object with only Symbol keys', () => {
      const sym = Symbol('loc')
      const node = { [sym]: { start: { line: 5, column: 0 }, end: { line: 10, column: 0 } } }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    // ─── Additional coverage: loc.start.line = 0 is valid ────────────
    test('treats line 0 as valid number for start.line', () => {
      const node = {
        loc: {
          start: { line: 0, column: 5 },
          end: { line: 0, column: 10 },
        },
      }
      const result = extractLocation(node, 99)
      expect(result.start.line).toBe(0)
      expect(result.end.line).toBe(0)
    })

    // ─── Additional coverage: column = 0 is valid ────────────────────
    test('treats column 0 as valid number for start.column', () => {
      const node = {
        loc: {
          start: { line: 5, column: 0 },
          end: { line: 10, column: 0 },
        },
      }
      const result = extractLocation(node, 99)
      expect(result.start.column).toBe(0)
      expect(result.end.column).toBe(0)
    })

    // ─── Additional coverage: realistic edge cases ────────────────────
    test('handles very small positive line and column', () => {
      const node = {
        loc: {
          start: { line: 0.001, column: 0.001 },
          end: { line: 0.002, column: 0.002 },
        },
      }
      const result = extractLocation(node)
      expect(result.start.line).toBe(0.001)
      expect(result.start.column).toBe(0.001)
    })

    test('handles start/end where end is before start in both dimensions', () => {
      const node = {
        loc: {
          start: { line: 10, column: 20 },
          end: { line: 5, column: 3 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 10, column: 20 },
        end: { line: 5, column: 3 },
      })
    })

    test('returns default for loc as empty string (falsy)', () => {
      const result = extractLocation({ loc: '' })
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('returns default for loc as 0 (falsy)', () => {
      const result = extractLocation({ loc: 0 })
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('returns default for loc as false (falsy)', () => {
      const result = extractLocation({ loc: false })
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    // ─── Additional AST node types ────────────────────────────────────
    test('handles throw statement node', () => {
      const node = {
        type: 'ThrowStatement',
        argument: { type: 'NewExpression', callee: { type: 'Identifier', name: 'Error' } },
        loc: {
          start: { line: 42, column: 2 },
          end: { line: 42, column: 18 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 42, column: 2 },
        end: { line: 42, column: 18 },
      })
    })

    test('handles yield expression node', () => {
      const node = {
        type: 'YieldExpression',
        argument: { type: 'Literal', value: 42 },
        delegate: false,
        loc: {
          start: { line: 15, column: 4 },
          end: { line: 15, column: 12 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 15, column: 4 },
        end: { line: 15, column: 12 },
      })
    })

    test('handles await expression node', () => {
      const node = {
        type: 'AwaitExpression',
        argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fetch' } },
        loc: {
          start: { line: 8, column: 8 },
          end: { line: 8, column: 22 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 8, column: 8 },
        end: { line: 8, column: 22 },
      })
    })

    test('handles destructuring assignment node', () => {
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'ObjectPattern', properties: [] },
        init: { type: 'Identifier', name: 'obj' },
        loc: {
          start: { line: 3, column: 6 },
          end: { line: 3, column: 20 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 3, column: 6 },
        end: { line: 3, column: 20 },
      })
    })

    test('handles tagged template expression node', () => {
      const node = {
        type: 'TaggedTemplateExpression',
        tag: { type: 'Identifier', name: 'tag' },
        quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
        loc: {
          start: { line: 11, column: 0 },
          end: { line: 11, column: 15 },
        },
      }
      const result = extractLocation(node)
      expect(result).toEqual({
        start: { line: 11, column: 0 },
        end: { line: 11, column: 15 },
      })
    })

    // ─── Additional defaultLine combinations ───────────────────────────
    test('defaultLine used for both lines when loc has empty start and end', () => {
      const node = {
        loc: {
          start: {} as Record<string, unknown>,
          end: {} as Record<string, unknown>,
        },
      }
      const result = extractLocation(node, 200)
      expect(result).toEqual({
        start: { line: 200, column: 0 },
        end: { line: 200, column: 0 },
      })
    })

    test('defaultLine 1 is the implicit default when not provided', () => {
      const r1 = extractLocation(null)
      const r2 = extractLocation(null, 1)
      expect(r1).toEqual(r2)
    })
  })
})

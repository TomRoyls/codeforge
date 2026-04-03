import { describe, test, expect } from 'vitest'
import { extractLocation } from '../../../src/ast/location-utils.js'

describe('location-utils', () => {
  describe('extractLocation', () => {
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

    test('returns default location for non-object input (string)', () => {
      const result = extractLocation('not an object')
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

    test('returns default location for non-object input (boolean)', () => {
      const result = extractLocation(true)
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('returns default location for array', () => {
      const result = extractLocation([1, 2, 3])
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

    test('returns default location for object with null loc', () => {
      const result = extractLocation({ loc: null })
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

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

    test('handles loc with non-number line values', () => {
      const node = {
        loc: {
          start: { line: '5' as unknown as number, column: 10 },
          end: { line: 10, column: 20 },
        },
      }
      const result = extractLocation(node)
      expect(result.start.line).toBe(1)
    })

    test('handles loc with non-number column values', () => {
      const node = {
        loc: {
          start: { line: 5, column: '10' as unknown as number },
          end: { line: 10, column: 20 },
        },
      }
      const result = extractLocation(node)
      expect(result.start.column).toBe(0)
    })

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

    test('returns default location for non-object input (string)', () => {
      const result = extractLocation('not an object')
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

    test('returns default location for object without loc property', () => {
      const result = extractLocation({ foo: 'bar' })
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('returns default location for object with null loc', () => {
      const result = extractLocation({ loc: null })
      expect(result).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

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

    test('handles loc with non-number line values', () => {
      const node = {
        loc: {
          start: { line: '5' as unknown as number, column: 10 },
          end: { line: 10, column: 20 },
        },
      }
      const result = extractLocation(node)
      expect(result.start.line).toBe(1) // Falls back to default
    })

    test('handles loc with non-number column values', () => {
      const node = {
        loc: {
          start: { line: 5, column: '10' as unknown as number },
          end: { line: 10, column: 20 },
        },
      }
      const result = extractLocation(node)
      expect(result.start.column).toBe(0) // Falls back to default
    })

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
  })
})

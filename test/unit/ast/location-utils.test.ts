import { describe, test, expect } from 'vitest'
import { extractLocation, getASTBody } from '../../../src/ast/location-utils.js'

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

  describe('getASTBody', () => {
    test('returns empty array for null', () => {
      const result = getASTBody(null)
      expect(result).toEqual([])
    })

    test('returns empty array for undefined', () => {
      const result = getASTBody(undefined)
      expect(result).toEqual([])
    })

    test('returns empty array for non-object (string)', () => {
      const result = getASTBody('not an object')
      expect(result).toEqual([])
    })

    test('returns empty array for non-object (number)', () => {
      const result = getASTBody(42)
      expect(result).toEqual([])
    })

    test('returns empty array for non-object (boolean)', () => {
      const result = getASTBody(false)
      expect(result).toEqual([])
    })

    test('returns empty array for array', () => {
      const result = getASTBody([1, 2, 3])
      expect(result).toEqual([])
    })

    test('returns empty array for object without body', () => {
      const result = getASTBody({ foo: 'bar' })
      expect(result).toEqual([])
    })

    test('returns body array when present', () => {
      const ast = {
        body: ['statement1', 'statement2'],
      }
      const result = getASTBody(ast)
      expect(result).toEqual(['statement1', 'statement2'])
    })

    test('returns empty body array when body is empty', () => {
      const ast = {
        body: [],
      }
      const result = getASTBody(ast)
      expect(result).toEqual([])
    })

    test('returns body array with complex AST nodes', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'VariableDeclaration',
            declarations: [
              {
                type: 'VariableDeclarator',
                id: { type: 'Identifier', name: 'x' },
                init: { type: 'Literal', value: 42 },
              },
            ],
          },
          {
            type: 'FunctionDeclaration',
            id: { type: 'Identifier', name: 'foo' },
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
      }
      const result = getASTBody(ast)
      expect(result).toHaveLength(2)
      expect((result[0] as { type: string }).type).toBe('VariableDeclaration')
      expect((result[1] as { type: string }).type).toBe('FunctionDeclaration')
    })

    test('returns program.body when body not present but program.body is', () => {
      const ast = {
        program: {
          body: ['programStatement1', 'programStatement2'],
        },
      }
      const result = getASTBody(ast)
      expect(result).toEqual(['programStatement1', 'programStatement2'])
    })

    test('prefers body over program.body when both exist', () => {
      const ast = {
        body: ['bodyStatement'],
        program: {
          body: ['programStatement'],
        },
      }
      const result = getASTBody(ast)
      expect(result).toEqual(['bodyStatement'])
    })

    test('returns empty array when neither body nor program.body exists', () => {
      const ast = {
        type: 'File',
        program: {
          type: 'Program',
        },
      }
      const result = getASTBody(ast)
      expect(result).toEqual([])
    })

    test('returns empty array when body is not an array', () => {
      const ast = {
        body: 'not an array',
      }
      const result = getASTBody(ast)
      expect(result).toEqual([])
    })

    test('returns empty array when program.body is not an array', () => {
      const ast = {
        program: {
          body: 'not an array',
        },
      }
      const result = getASTBody(ast)
      expect(result).toEqual([])
    })

    test('returns empty array when program is null', () => {
      const ast = {
        program: null,
      }
      const result = getASTBody(ast)
      expect(result).toEqual([])
    })

    test('handles empty program.body array', () => {
      const ast = {
        program: {
          body: [],
        },
      }
      const result = getASTBody(ast)
      expect(result).toEqual([])
    })

    test('handles standard ESTree Program structure', () => {
      const ast = {
        type: 'Program',
        sourceType: 'module',
        body: [
          {
            type: 'ImportDeclaration',
            specifiers: [],
            source: { type: 'Literal', value: 'fs' },
          },
          {
            type: 'VariableDeclaration',
            kind: 'const',
            declarations: [
              {
                type: 'VariableDeclarator',
                id: { type: 'Identifier', name: 'x' },
                init: { type: 'Literal', value: 10 },
              },
            ],
          },
        ],
      }
      const result = getASTBody(ast)
      expect(result).toHaveLength(2)
    })

    test('handles Babel File wrapper structure', () => {
      const ast = {
        type: 'File',
        program: {
          type: 'Program',
          sourceType: 'module',
          body: [{ type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } }],
        },
      }
      const result = getASTBody(ast)
      expect(result).toHaveLength(1)
    })

    test('handles empty program', () => {
      const ast = {
        type: 'Program',
        body: [],
      }
      const result = getASTBody(ast)
      expect(result).toEqual([])
    })

    test('handles program with single statement', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'ExpressionStatement',
            expression: { type: 'CallExpression' },
          },
        ],
      }
      const result = getASTBody(ast)
      expect(result).toHaveLength(1)
    })

    test('handles program with multiple statement types', () => {
      const ast = {
        type: 'Program',
        body: [
          { type: 'ImportDeclaration' },
          { type: 'FunctionDeclaration' },
          { type: 'ClassDeclaration' },
          { type: 'VariableDeclaration' },
          { type: 'ExportDefaultDeclaration' },
        ],
      }
      const result = getASTBody(ast)
      expect(result).toHaveLength(5)
      expect(result).toContainEqual({ type: 'ImportDeclaration' })
      expect(result).toContainEqual({ type: 'FunctionDeclaration' })
      expect(result).toContainEqual({ type: 'ClassDeclaration' })
      expect(result).toContainEqual({ type: 'VariableDeclaration' })
      expect(result).toContainEqual({ type: 'ExportDefaultDeclaration' })
    })

    test('does not modify original AST', () => {
      const ast = {
        type: 'Program',
        body: [{ type: 'Identifier' }],
      }
      const originalBody = ast.body
      getASTBody(ast)
      expect(ast.body).toBe(originalBody)
      expect(ast.body).toHaveLength(1)
    })

    test('returns same array reference when body exists', () => {
      const ast = {
        type: 'Program',
        body: [{ type: 'Identifier' }],
      }
      const result = getASTBody(ast)
      expect(result).toBe(ast.body)
    })

    test('returns same array reference when program.body exists', () => {
      const ast = {
        type: 'File',
        program: {
          type: 'Program',
          body: [{ type: 'Identifier' }],
        },
      }
      const result = getASTBody(ast)
      expect(result).toBe(ast.program.body)
    })
  })
})

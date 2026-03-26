import { describe, test, expect, vi } from 'vitest'
import { sortKeysRule } from '../../../../src/rules/patterns/sort-keys.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const obj = { b: 1, a: 2 };',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
      })
    },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => source,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    workspaceRoot: '/src',
  } as unknown as RuleContext

  return { context, reports }
}

function createObjectExpression(
  properties: Array<{ key: string; value: unknown; line?: number; column?: number }>,
): unknown {
  return {
    type: 'ObjectExpression',
    properties: properties.map((prop, index) => ({
      type: 'Property',
      key: { type: 'Identifier', name: prop.key },
      value: prop.value,
      loc: {
        start: { line: prop.line ?? 1, column: prop.column ?? index * 10 },
        end: { line: prop.line ?? 1, column: (prop.column ?? index * 10) + 5 },
      },
    })),
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 100 },
    },
  }
}

function createObjectExpressionWithLiterals(
  keys: Array<{ key: string; isLiteral?: boolean }>,
): unknown {
  return {
    type: 'ObjectExpression',
    properties: keys.map((k, index) => ({
      type: 'Property',
      key: k.isLiteral ? { type: 'Literal', value: k.key } : { type: 'Identifier', name: k.key },
      value: { type: 'Literal', value: index },
      loc: {
        start: { line: 1, column: index * 10 },
        end: { line: 1, column: index * 10 + 5 },
      },
    })),
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 100 },
    },
  }
}

describe('sort-keys rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(sortKeysRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(sortKeysRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(sortKeysRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(sortKeysRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(sortKeysRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(sortKeysRule.meta.fixable).toBeUndefined()
    })

    test('should mention sorting in description', () => {
      expect(sortKeysRule.meta.docs?.description.toLowerCase()).toContain('sort')
    })

    test('should have natural option in schema', () => {
      const schema = sortKeysRule.meta.schema as Array<{
        properties: { natural?: { type: string } }
      }>
      expect(schema[0]?.properties?.natural?.type).toBe('boolean')
    })

    test('should have minKeys option in schema', () => {
      const schema = sortKeysRule.meta.schema as Array<{
        properties: { minKeys?: { type: string; minimum: number } }
      }>
      expect(schema[0]?.properties?.minKeys?.type).toBe('number')
      expect(schema[0]?.properties?.minKeys?.minimum).toBe(2)
    })
  })

  describe('create', () => {
    test('should return visitor object with ObjectExpression method', () => {
      const { context } = createMockContext()
      const visitor = sortKeysRule.create(context)

      expect(visitor).toHaveProperty('ObjectExpression')
    })
  })

  describe('detecting unsorted keys', () => {
    test('should report when keys are not in alphabetical order', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)

      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should include expected order in message', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)

      const node = createObjectExpression([
        { key: 'c', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
        { key: 'b', value: { type: 'Literal', value: 3 } },
      ])

      visitor.ObjectExpression(node)

      expect(reports[0].message).toContain('a, b, c')
    })

    test('should report on first unsorted key', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)

      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 }, column: 0 },
        { key: 'a', value: { type: 'Literal', value: 2 }, column: 10 },
      ])

      visitor.ObjectExpression(node)

      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('allowing sorted keys', () => {
    test('should not report when keys are in alphabetical order', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)

      const node = createObjectExpression([
        { key: 'a', value: { type: 'Literal', value: 1 } },
        { key: 'b', value: { type: 'Literal', value: 2 } },
        { key: 'c', value: { type: 'Literal', value: 3 } },
      ])

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report single key object', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)

      const node = createObjectExpression([{ key: 'a', value: { type: 'Literal', value: 1 } }])

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      }

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('natural option', () => {
    test('should use natural sort by default', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)

      const node = createObjectExpression([
        { key: 'a1', value: { type: 'Literal', value: 1 } },
        { key: 'a10', value: { type: 'Literal', value: 2 } },
        { key: 'a2', value: { type: 'Literal', value: 3 } },
      ])

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should mention natural sorting in message when natural is true', () => {
      const { context, reports } = createMockContext({ natural: true })
      const visitor = sortKeysRule.create(context)

      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])

      visitor.ObjectExpression(node)

      expect(reports[0].message).toContain('natural')
    })

    test('should not mention natural sorting when natural is false', () => {
      const { context, reports } = createMockContext({ natural: false })
      const visitor = sortKeysRule.create(context)

      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])

      visitor.ObjectExpression(node)

      expect(reports[0].message).not.toContain('natural')
    })
  })

  describe('minKeys option', () => {
    test('should not report when object has fewer keys than minKeys', () => {
      const { context, reports } = createMockContext({ minKeys: 3 })
      const visitor = sortKeysRule.create(context)

      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report when object has exactly minKeys', () => {
      const { context, reports } = createMockContext({ minKeys: 2 })
      const visitor = sortKeysRule.create(context)

      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should use default minKeys of 2', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)

      const node2 = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node2)
      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = sortKeysRule.create(context)

      expect(() => visitor.ObjectExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = sortKeysRule.create(context)

      expect(() => visitor.ObjectExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = sortKeysRule.create(context)

      expect(() => visitor.ObjectExpression('string')).not.toThrow()
      expect(() => visitor.ObjectExpression(123)).not.toThrow()
    })

    test('should handle node without type', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)

      const node = { properties: [] }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)

      const node = {
        type: 'CallExpression',
        properties: [],
      }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle properties that are not Property type', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'other' } },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
    })

    test('should handle properties without key', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            value: { type: 'Literal', value: 1 },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle property with null key', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: null,
            value: { type: 'Literal', value: 1 },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Literal keys', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)

      const node = createObjectExpressionWithLiterals([{ key: 'b' }, { key: 'a', isLiteral: true }])

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
    })

    test('should handle empty options array', () => {
      const { context, reports } = createMockContext({})
      const visitor = sortKeysRule.create(context)

      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])

      visitor.ObjectExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({
            message: descriptor.message,
            loc: descriptor.loc,
          })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const obj = { b: 1, a: 2 };',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = sortKeysRule.create(context)

      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'b' },
            value: { type: 'Literal', value: 1 },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 2 },
          },
        ],
      }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle properties that are null', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [null, undefined],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
    })

    test('should handle non-array properties', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: 'not-an-array',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
    })
  })

  describe('multiple objects', () => {
    test('should report multiple unsorted objects', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)

      const node1 = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])

      const node2 = createObjectExpression([
        { key: 'd', value: { type: 'Literal', value: 1 } },
        { key: 'c', value: { type: 'Literal', value: 2 } },
      ])

      visitor.ObjectExpression(node1)
      visitor.ObjectExpression(node2)

      expect(reports.length).toBe(2)
    })

    test('should report unsorted but not sorted objects', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)

      const unsortedNode = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])

      const sortedNode = createObjectExpression([
        { key: 'a', value: { type: 'Literal', value: 1 } },
        { key: 'b', value: { type: 'Literal', value: 2 } },
      ])

      visitor.ObjectExpression(unsortedNode)
      visitor.ObjectExpression(sortedNode)

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention sorting in message', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)

      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])

      visitor.ObjectExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('sort')
    })

    test('should mention alphabetical in message', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)

      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])

      visitor.ObjectExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('alphabetical')
    })

    test('should include expected order in message', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)

      const node = createObjectExpression([
        { key: 'z', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])

      visitor.ObjectExpression(node)

      expect(reports[0].message).toContain('Expected order')
    })
  })

  describe('special key types', () => {
    test('should handle numeric literal keys', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: 2 },
            value: { type: 'Literal', value: 'two' },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: 1 },
            value: { type: 'Literal', value: 'one' },
            loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 15 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
    })

    test('should handle mixed identifier and literal keys', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)

      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'z' },
            value: { type: 'Literal', value: 1 },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: 'a' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 15 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
    })
  })
})

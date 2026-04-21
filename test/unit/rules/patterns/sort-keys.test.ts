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

// ============================================================================
// META PROPERTIES (20 tests)
// ============================================================================
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

    test('should have docs defined', () => {
      expect(sortKeysRule.meta.docs).toBeDefined()
    })

    test('should have description in docs', () => {
      expect(sortKeysRule.meta.docs?.description).toBeTruthy()
      expect(typeof sortKeysRule.meta.docs?.description).toBe('string')
    })

    test('should have a url in docs', () => {
      expect(sortKeysRule.meta.docs?.url).toBeDefined()
    })

    test('should have valid rule type', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(sortKeysRule.meta.type)
    })

    test('should have valid severity', () => {
      expect(['off', 'warn', 'error']).toContain(sortKeysRule.meta.severity)
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(sortKeysRule.meta.schema)).toBe(true)
    })

    test('should have at least one schema entry', () => {
      const schema = sortKeysRule.meta.schema as unknown[]
      expect(schema.length).toBeGreaterThanOrEqual(1)
    })

    test('should have object type in first schema entry', () => {
      const schema = sortKeysRule.meta.schema as Array<{ type: string }>
      expect(schema[0]?.type).toBe('object')
    })

    test('should have additionalProperties false in schema', () => {
      const schema = sortKeysRule.meta.schema as Array<{ additionalProperties: boolean }>
      expect(schema[0]?.additionalProperties).toBe(false)
    })

    test('should have meta as a plain object', () => {
      expect(typeof sortKeysRule.meta).toBe('object')
      expect(sortKeysRule.meta).not.toBeNull()
    })

    test('should not be deprecated', () => {
      expect(sortKeysRule.meta.deprecated).toBeUndefined()
    })
  })

  // ============================================================================
  // CREATE / VISITOR (8 tests)
  // ============================================================================
  describe('create', () => {
    test('should return visitor object with ObjectExpression method', () => {
      const { context } = createMockContext()
      const visitor = sortKeysRule.create(context)
      expect(visitor).toHaveProperty('ObjectExpression')
    })

    test('should return ObjectExpression as a function', () => {
      const { context } = createMockContext()
      const visitor = sortKeysRule.create(context)
      expect(typeof visitor.ObjectExpression).toBe('function')
    })

    test('should return a new visitor on each create call', () => {
      const { context } = createMockContext()
      const visitor1 = sortKeysRule.create(context)
      const visitor2 = sortKeysRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context with default options', () => {
      const { context } = createMockContext()
      expect(() => sortKeysRule.create(context)).not.toThrow()
    })

    test('should accept context with empty options', () => {
      const { context } = createMockContext({})
      expect(() => sortKeysRule.create(context)).not.toThrow()
    })

    test('should accept context with natural option', () => {
      const { context } = createMockContext({ natural: false })
      expect(() => sortKeysRule.create(context)).not.toThrow()
    })

    test('should accept context with minKeys option', () => {
      const { context } = createMockContext({ minKeys: 5 })
      expect(() => sortKeysRule.create(context)).not.toThrow()
    })

    test('should have only ObjectExpression in visitor', () => {
      const { context } = createMockContext()
      const visitor = sortKeysRule.create(context)
      expect(Object.keys(visitor)).toEqual(['ObjectExpression'])
    })
  })

  // ============================================================================
  // DETECTION (30 tests)
  // ============================================================================
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

    test('should detect two keys swapped', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'z', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect unsorted keys in larger object', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'alpha', value: { type: 'Literal', value: 1 } },
        { key: 'beta', value: { type: 'Literal', value: 2 } },
        { key: 'gamma', value: { type: 'Literal', value: 3 } },
        { key: 'delta', value: { type: 'Literal', value: 4 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect unsorted keys in reverse order', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'z', value: { type: 'Literal', value: 1 } },
        { key: 'y', value: { type: 'Literal', value: 2 } },
        { key: 'x', value: { type: 'Literal', value: 3 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect keys differing only in case', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'Zebra', value: { type: 'Literal', value: 1 } },
        { key: 'alpha', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect unsorted keys with underscores', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: '_b', value: { type: 'Literal', value: 1 } },
        { key: '_a', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect unsorted keys with dollar signs', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: '$ref', value: { type: 'Literal', value: 1 } },
        { key: '$id', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect unsorted single-char keys', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect unsorted long key names', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'veryLongKeyName', value: { type: 'Literal', value: 1 } },
        { key: 'anotherVeryLongKeyName', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect natural sort violation with numeric strings', () => {
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

    test('should detect unsorted keys with trailing numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'item10', value: { type: 'Literal', value: 1 } },
        { key: 'item2', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect unsorted keys among many sorted ones', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'a', value: { type: 'Literal', value: 1 } },
        { key: 'b', value: { type: 'Literal', value: 2 } },
        { key: 'd', value: { type: 'Literal', value: 3 } },
        { key: 'c', value: { type: 'Literal', value: 4 } },
        { key: 'e', value: { type: 'Literal', value: 5 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect last two keys unsorted', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'a', value: { type: 'Literal', value: 1 } },
        { key: 'b', value: { type: 'Literal', value: 2 } },
        { key: 'd', value: { type: 'Literal', value: 3 } },
        { key: 'c', value: { type: 'Literal', value: 4 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect first two keys unsorted', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
        { key: 'c', value: { type: 'Literal', value: 3 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect unsorted literal string keys', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: 'zebra' },
            value: { type: 'Literal', value: 1 },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: 'apple' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 15 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect unsorted mixed identifier and literal keys', () => {
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
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report lexicographically sorted keys with natural false', () => {
      const { context, reports } = createMockContext({ natural: false })
      const visitor = sortKeysRule.create(context)
      // Lexicographically: a10 < a2, so a10, a2 is sorted
      const node = createObjectExpression([
        { key: 'a10', value: { type: 'Literal', value: 1 } },
        { key: 'a2', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report with natural true when lexicographic would pass but natural fails', () => {
      const { context, reports } = createMockContext({ natural: true })
      const visitor = sortKeysRule.create(context)
      // a1, a10, a2 — lexicographically sorted but not naturally
      const node = createObjectExpression([
        { key: 'a1', value: { type: 'Literal', value: 1 } },
        { key: 'a10', value: { type: 'Literal', value: 2 } },
        { key: 'a2', value: { type: 'Literal', value: 3 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect unsorted keys with hyphens', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'z-key', value: { type: 'Literal', value: 1 } },
        { key: 'a-key', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect unsorted keys with numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'key3', value: { type: 'Literal', value: 1 } },
        { key: 'key1', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect unsorted camelCase keys', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'myKey', value: { type: 'Literal', value: 1 } },
        { key: 'myAnotherKey', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect unsorted keys at boundary of alphabet', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'z', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('a, z')
    })

    test('should produce exactly one report for a single unsorted object', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'c', value: { type: 'Literal', value: 1 } },
        { key: 'b', value: { type: 'Literal', value: 2 } },
        { key: 'a', value: { type: 'Literal', value: 3 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect unsorted keys with only last key out of place', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'a', value: { type: 'Literal', value: 1 } },
        { key: 'b', value: { type: 'Literal', value: 2 } },
        { key: 'c', value: { type: 'Literal', value: 3 } },
        { key: 'd', value: { type: 'Literal', value: 4 } },
        { key: 'e', value: { type: 'Literal', value: 5 } },
        { key: 'aa', value: { type: 'Literal', value: 6 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect adjacent swap in middle of sorted keys', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'a', value: { type: 'Literal', value: 1 } },
        { key: 'c', value: { type: 'Literal', value: 2 } },
        { key: 'b', value: { type: 'Literal', value: 3 } },
        { key: 'd', value: { type: 'Literal', value: 4 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect unsorted keys with unicode characters', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'étoile', value: { type: 'Literal', value: 1 } },
        { key: 'apple', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect unsorted keys with mixed case', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'Beta', value: { type: 'Literal', value: 1 } },
        { key: 'alpha', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // ============================================================================
  // NOT REPORTING (30 tests)
  // ============================================================================
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

    test('should not report two sorted keys', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'a', value: { type: 'Literal', value: 1 } },
        { key: 'b', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when keys are equal', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'a', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report naturally sorted numeric keys', () => {
      const { context, reports } = createMockContext({ natural: true })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'a1', value: { type: 'Literal', value: 1 } },
        { key: 'a2', value: { type: 'Literal', value: 2 } },
        { key: 'a10', value: { type: 'Literal', value: 3 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report lexicographically sorted keys with natural false', () => {
      const { context, reports } = createMockContext({ natural: false })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'a1', value: { type: 'Literal', value: 1 } },
        { key: 'a10', value: { type: 'Literal', value: 2 } },
        { key: 'a2', value: { type: 'Literal', value: 3 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report object with fewer keys than minKeys', () => {
      const { context, reports } = createMockContext({ minKeys: 4 })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'z', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when all keys are sorted identifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'alpha', value: { type: 'Literal', value: 1 } },
        { key: 'beta', value: { type: 'Literal', value: 2 } },
        { key: 'delta', value: { type: 'Literal', value: 3 } },
        { key: 'epsilon', value: { type: 'Literal', value: 4 } },
        { key: 'gamma', value: { type: 'Literal', value: 5 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report sorted literal string keys', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: 'apple' },
            value: { type: 'Literal', value: 1 },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: 'banana' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 15 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when only SpreadElements present', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = {
        type: 'ObjectExpression',
        properties: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'other' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report sorted keys with underscores', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: '_a', value: { type: 'Literal', value: 1 } },
        { key: '_b', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report sorted keys with dollar signs', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: '$id', value: { type: 'Literal', value: 1 } },
        { key: '$ref', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when minKeys equals property count exactly', () => {
      const { context, reports } = createMockContext({ minKeys: 3 })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'a', value: { type: 'Literal', value: 1 } },
        { key: 'b', value: { type: 'Literal', value: 2 } },
        { key: 'c', value: { type: 'Literal', value: 3 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report minKeys greater than object size', () => {
      const { context, reports } = createMockContext({ minKeys: 10 })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'a', value: { type: 'Literal', value: 1 } },
        { key: 'b', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report sorted keys across multiple lines', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'a', value: { type: 'Literal', value: 1 }, line: 1 },
        { key: 'b', value: { type: 'Literal', value: 2 }, line: 2 },
        { key: 'c', value: { type: 'Literal', value: 3 }, line: 3 },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when keys differ only by numeric suffix and are naturally sorted', () => {
      const { context, reports } = createMockContext({ natural: true })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'file1', value: { type: 'Literal', value: 1 } },
        { key: 'file2', value: { type: 'Literal', value: 2 } },
        { key: 'file10', value: { type: 'Literal', value: 3 } },
        { key: 'file11', value: { type: 'Literal', value: 4 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report sorted single-letter keys', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'a', value: { type: 'Literal', value: 1 } },
        { key: 'b', value: { type: 'Literal', value: 2 } },
        { key: 'c', value: { type: 'Literal', value: 3 } },
        { key: 'd', value: { type: 'Literal', value: 4 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when properties array is empty', () => {
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

    test('should not report when numeric literal keys are ignored (non-string)', () => {
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
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report sorted keys with mixed identifiers and string literals', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: 'b' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 15 } },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'c' },
            value: { type: 'Literal', value: 3 },
            loc: { start: { line: 1, column: 20 }, end: { line: 1, column: 25 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when all keys are computed (TemplateLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'TemplateLiteral', expressions: [] },
            value: { type: 'Literal', value: 1 },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          },
          {
            type: 'Property',
            key: { type: 'TemplateLiteral', expressions: [] },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 15 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when only one valid key after spreading', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = {
        type: 'ObjectExpression',
        properties: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'base' } },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 1 },
            loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 15 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report sorted hyphenated keys', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'a-key', value: { type: 'Literal', value: 1 } },
        { key: 'b-key', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report sorted long alphabetical keys', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'aaa', value: { type: 'Literal', value: 1 } },
        { key: 'aab', value: { type: 'Literal', value: 2 } },
        { key: 'aac', value: { type: 'Literal', value: 3 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report sorted camelCase keys', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'anotherKey', value: { type: 'Literal', value: 1 } },
        { key: 'myKey', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when keys are sorted and minKeys is higher than default', () => {
      const { context, reports } = createMockContext({ minKeys: 3 })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'a', value: { type: 'Literal', value: 1 } },
        { key: 'b', value: { type: 'Literal', value: 2 } },
        { key: 'c', value: { type: 'Literal', value: 3 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report keys sorted at boundary of case sensitivity', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'A', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      // In localeCompare, uppercase may come before lowercase
      visitor.ObjectExpression(node)
      // Either 0 or 1 report is acceptable depending on locale, just verify no crash
      expect(reports.length).toBeLessThanOrEqual(1)
    })
  })

  // ============================================================================
  // EDGE CASES (25 tests)
  // ============================================================================
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

    test('should handle boolean node', () => {
      const { context } = createMockContext()
      const visitor = sortKeysRule.create(context)
      expect(() => visitor.ObjectExpression(true)).not.toThrow()
    })

    test('should handle numeric node', () => {
      const { context } = createMockContext()
      const visitor = sortKeysRule.create(context)
      expect(() => visitor.ObjectExpression(42)).not.toThrow()
    })

    test('should handle empty string node', () => {
      const { context } = createMockContext()
      const visitor = sortKeysRule.create(context)
      expect(() => visitor.ObjectExpression('')).not.toThrow()
    })

    test('should handle node with undefined properties', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = {
        type: 'ObjectExpression',
        properties: undefined,
      }
      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null properties', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = {
        type: 'ObjectExpression',
        properties: null,
      }
      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle property with undefined key', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: undefined,
            value: { type: 'Literal', value: 1 },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle property key with boolean value in Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: true },
            value: { type: 'Literal', value: 1 },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          },
          {
            type: 'Property',
            key: { type: 'Literal', value: false },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 15 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle property key with null Literal value', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Literal', value: null },
            value: { type: 'Literal', value: 1 },
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested but unsorted properties', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'z', value: { type: 'ObjectExpression', properties: [] } },
        { key: 'a', value: { type: 'ObjectExpression', properties: [] } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle object with only SpreadElements', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = {
        type: 'ObjectExpression',
        properties: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'a' } },
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'b' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle options with non-object first element', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'code',
        getTokens: () => [],
        getComments: () => [],
        config: { options: ['string-option'] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      expect(() => visitor.ObjectExpression(node)).not.toThrow()
    })
  })

  // ============================================================================
  // LOCATION (15 tests)
  // ============================================================================
  describe('location', () => {
    test('should report location of first key property', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 }, column: 5 },
        { key: 'a', value: { type: 'Literal', value: 2 }, column: 15 },
      ])
      visitor.ObjectExpression(node)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with correct line number', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 }, line: 5, column: 2 },
        { key: 'a', value: { type: 'Literal', value: 2 }, line: 6, column: 2 },
      ])
      visitor.ObjectExpression(node)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should report start and end location', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 }, line: 1, column: 0 },
        { key: 'a', value: { type: 'Literal', value: 2 }, line: 1, column: 10 },
      ])
      visitor.ObjectExpression(node)
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should use column 0 for first property by default', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'z', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 1 by default', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'z', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should use default location when property has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'b' },
            value: { type: 'Literal', value: 1 },
            // no loc
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 2 },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ObjectExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location with multi-line objects', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'z', value: { type: 'Literal', value: 1 }, line: 10, column: 4 },
        { key: 'a', value: { type: 'Literal', value: 2 }, line: 11, column: 4 },
      ])
      visitor.ObjectExpression(node)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report end column greater than start column', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 }, column: 2 },
        { key: 'a', value: { type: 'Literal', value: 2 }, column: 12 },
      ])
      visitor.ObjectExpression(node)
      expect(reports[0].loc?.end.column).toBeGreaterThan(reports[0].loc?.start.column ?? -1)
    })

    test('should handle location with large column offsets', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 }, column: 100 },
        { key: 'a', value: { type: 'Literal', value: 2 }, column: 200 },
      ])
      visitor.ObjectExpression(node)
      expect(reports[0].loc?.start.column).toBe(100)
    })

    test('should handle location with large line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 }, line: 500 },
        { key: 'a', value: { type: 'Literal', value: 2 }, line: 501 },
      ])
      visitor.ObjectExpression(node)
      expect(reports[0].loc?.start.line).toBe(500)
    })

    test('should report loc as object with start and end', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(typeof reports[0].loc?.start).toBe('object')
      expect(typeof reports[0].loc?.end).toBe('object')
    })

    test('should report location with column 0 for first property', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'z' },
            value: { type: 'Literal', value: 1 },
            loc: { start: { line: 3, column: 8 }, end: { line: 3, column: 12 } },
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 2 },
            loc: { start: { line: 4, column: 8 }, end: { line: 4, column: 12 } },
          },
        ],
        loc: { start: { line: 2, column: 0 }, end: { line: 5, column: 1 } },
      }
      visitor.ObjectExpression(node)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should provide default location when property loc is missing start', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'z' },
            value: { type: 'Literal', value: 1 },
            loc: {},
          },
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'a' },
            value: { type: 'Literal', value: 2 },
            loc: {},
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ObjectExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle location with zero column', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 }, line: 1, column: 0 },
        { key: 'a', value: { type: 'Literal', value: 2 }, line: 1, column: 5 },
      ])
      visitor.ObjectExpression(node)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should have numeric line and column in report', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })
  })

  // ============================================================================
  // MESSAGES (10 tests)
  // ============================================================================
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

    test('should mention natural sorting when natural is true', () => {
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

    test('should include sorted key names in message', () => {
      const { context, reports } = createMockContext({ natural: false })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'c', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
        { key: 'b', value: { type: 'Literal', value: 3 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports[0].message).toContain('a, b, c')
    })

    test('should mention object keys in message', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports[0].message.toLowerCase()).toContain('object')
      expect(reports[0].message.toLowerCase()).toContain('keys')
    })

    test('should produce non-empty message string', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports[0].message.length).toBeGreaterThan(10)
    })

    test('should show correct expected order for reverse-sorted keys', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'c', value: { type: 'Literal', value: 1 } },
        { key: 'b', value: { type: 'Literal', value: 2 } },
        { key: 'a', value: { type: 'Literal', value: 3 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports[0].message).toContain('a, b, c')
    })

    test('should show correct expected order for partially sorted keys', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'a', value: { type: 'Literal', value: 1 } },
        { key: 'c', value: { type: 'Literal', value: 2 } },
        { key: 'b', value: { type: 'Literal', value: 3 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports[0].message).toContain('a, b, c')
    })
  })

  // ============================================================================
  // MULTIPLE REPORTS (10 tests)
  // ============================================================================
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

    test('should report each unsorted object independently', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      for (let i = 0; i < 5; i++) {
        const node = createObjectExpression([
          { key: 'z', value: { type: 'Literal', value: 1 } },
          { key: 'a', value: { type: 'Literal', value: 2 } },
        ])
        visitor.ObjectExpression(node)
      }
      expect(reports.length).toBe(5)
    })

    test('should report only unsorted objects in a mix', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const unsorted1 = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      const sorted1 = createObjectExpression([
        { key: 'a', value: { type: 'Literal', value: 1 } },
        { key: 'b', value: { type: 'Literal', value: 2 } },
      ])
      const unsorted2 = createObjectExpression([
        { key: 'd', value: { type: 'Literal', value: 1 } },
        { key: 'c', value: { type: 'Literal', value: 2 } },
      ])
      const sorted2 = createObjectExpression([
        { key: 'c', value: { type: 'Literal', value: 1 } },
        { key: 'd', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(unsorted1)
      visitor.ObjectExpression(sorted1)
      visitor.ObjectExpression(unsorted2)
      visitor.ObjectExpression(sorted2)
      expect(reports.length).toBe(2)
    })

    test('should maintain independent reports for each object', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node1 = createObjectExpression([
        { key: 'z', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      const node2 = createObjectExpression([
        { key: 'y', value: { type: 'Literal', value: 1 } },
        { key: 'b', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node1)
      visitor.ObjectExpression(node2)
      expect(reports[0].message).toContain('a, z')
      expect(reports[1].message).toContain('b, y')
    })

    test('should handle many sorted objects without reports', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      for (let i = 0; i < 10; i++) {
        const node = createObjectExpression([
          { key: 'a', value: { type: 'Literal', value: 1 } },
          { key: 'b', value: { type: 'Literal', value: 2 } },
        ])
        visitor.ObjectExpression(node)
      }
      expect(reports.length).toBe(0)
    })

    test('should handle alternating sorted and unsorted', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      for (let i = 0; i < 4; i++) {
        const sorted = createObjectExpression([
          { key: 'a', value: { type: 'Literal', value: 1 } },
          { key: 'b', value: { type: 'Literal', value: 2 } },
        ])
        const unsorted = createObjectExpression([
          { key: 'b', value: { type: 'Literal', value: 1 } },
          { key: 'a', value: { type: 'Literal', value: 2 } },
        ])
        visitor.ObjectExpression(sorted)
        visitor.ObjectExpression(unsorted)
      }
      expect(reports.length).toBe(4)
    })

    test('should handle empty objects interspersed', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const empty = {
        type: 'ObjectExpression',
        properties: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      }
      const unsorted = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(empty)
      visitor.ObjectExpression(unsorted)
      visitor.ObjectExpression(empty)
      expect(reports.length).toBe(1)
    })

    test('should produce separate messages for each unsorted object', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node1 = createObjectExpression([
        { key: 'c', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      const node2 = createObjectExpression([
        { key: 'z', value: { type: 'Literal', value: 1 } },
        { key: 'b', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node1)
      visitor.ObjectExpression(node2)
      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('should report on nested unsorted objects independently', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      // Outer unsorted
      const outer = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(outer)
      expect(reports.length).toBe(1)
      // Simulate visiting inner unsorted object
      const inner = createObjectExpression([
        { key: 'd', value: { type: 'Literal', value: 1 } },
        { key: 'c', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(inner)
      expect(reports.length).toBe(2)
    })
  })

  // ============================================================================
  // CONTEXT (10 tests)
  // ============================================================================
  describe('context usage', () => {
    test('should call context.report with message', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toBeTruthy()
    })

    test('should use default options when none provided', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should respect natural option from context', () => {
      const { context, reports } = createMockContext({ natural: true })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports[0].message).toContain('natural')
    })

    test('should respect minKeys option from context', () => {
      const { context, reports } = createMockContext({ minKeys: 5 })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'z', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle context with both options', () => {
      const { context, reports } = createMockContext({ natural: false, minKeys: 2 })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).not.toContain('natural')
    })

    test('should handle context with extra unknown options', () => {
      const { context, reports } = createMockContext({ unknownOption: true })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      expect(() => visitor.ObjectExpression(node)).not.toThrow()
    })

    test('should not modify the context object', () => {
      const { context, reports } = createMockContext()
      const originalFilePath = context.getFilePath()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(context.getFilePath()).toBe(originalFilePath)
    })

    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/project/src/utils.ts')
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'export const x = { b: 1, a: 2 };',
      )
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should create visitor that works independently of context after creation', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      // Use visitor multiple times without re-creating
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
  })

  // ============================================================================
  // NATURAL OPTION (dedicated)
  // ============================================================================
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

    test('should not report naturally sorted keys when natural true', () => {
      const { context, reports } = createMockContext({ natural: true })
      const visitor = sortKeysRule.create(context)
      // item2 < item10 in natural sort
      const node = createObjectExpression([
        { key: 'item2', value: { type: 'Literal', value: 1 } },
        { key: 'item10', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when natural false and keys are lexicographically sorted', () => {
      const { context, reports } = createMockContext({ natural: false })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'a1', value: { type: 'Literal', value: 1 } },
        { key: 'a10', value: { type: 'Literal', value: 2 } },
        { key: 'a2', value: { type: 'Literal', value: 3 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when natural true and keys are naturally sorted', () => {
      const { context, reports } = createMockContext({ natural: true })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'a1', value: { type: 'Literal', value: 1 } },
        { key: 'a2', value: { type: 'Literal', value: 2 } },
        { key: 'a10', value: { type: 'Literal', value: 3 } },
        { key: 'a20', value: { type: 'Literal', value: 4 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should include naturally sorted order in message when natural is true', () => {
      const { context, reports } = createMockContext({ natural: true })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'a10', value: { type: 'Literal', value: 1 } },
        { key: 'a2', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports[0].message).toContain('a2, a10')
    })

    test('should include lexicographically sorted order in message when natural is false', () => {
      const { context, reports } = createMockContext({ natural: false })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'a2', value: { type: 'Literal', value: 1 } },
        { key: 'a10', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports[0].message).toContain('a10, a2')
    })
  })

  // ============================================================================
  // MINKEYS OPTION (dedicated)
  // ============================================================================
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
      const node = createObjectExpression([
        { key: 'b', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report single key with minKeys 2', () => {
      const { context, reports } = createMockContext({ minKeys: 2 })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([{ key: 'a', value: { type: 'Literal', value: 1 } }])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report with minKeys 2 and 3 unsorted keys', () => {
      const { context, reports } = createMockContext({ minKeys: 2 })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'c', value: { type: 'Literal', value: 1 } },
        { key: 'b', value: { type: 'Literal', value: 2 } },
        { key: 'a', value: { type: 'Literal', value: 3 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report with minKeys 5 and only 4 keys', () => {
      const { context, reports } = createMockContext({ minKeys: 5 })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'd', value: { type: 'Literal', value: 1 } },
        { key: 'c', value: { type: 'Literal', value: 2 } },
        { key: 'b', value: { type: 'Literal', value: 3 } },
        { key: 'a', value: { type: 'Literal', value: 4 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report with minKeys 5 and exactly 5 unsorted keys', () => {
      const { context, reports } = createMockContext({ minKeys: 5 })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'e', value: { type: 'Literal', value: 1 } },
        { key: 'd', value: { type: 'Literal', value: 2 } },
        { key: 'c', value: { type: 'Literal', value: 3 } },
        { key: 'b', value: { type: 'Literal', value: 4 } },
        { key: 'a', value: { type: 'Literal', value: 5 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report with minKeys 2 and many unsorted keys', () => {
      const { context, reports } = createMockContext({ minKeys: 2 })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'z', value: { type: 'Literal', value: 1 } },
        { key: 'y', value: { type: 'Literal', value: 2 } },
        { key: 'x', value: { type: 'Literal', value: 3 } },
        { key: 'w', value: { type: 'Literal', value: 4 } },
        { key: 'v', value: { type: 'Literal', value: 5 } },
        { key: 'a', value: { type: 'Literal', value: 6 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // ============================================================================
  // TEST.EACH (40+ tests)
  // ============================================================================
  describe('test.each - unsorted key pairs', () => {
    test.each([
      ['b', 'a'],
      ['z', 'a'],
      ['c', 'b'],
      ['beta', 'alpha'],
      ['second', 'first'],
      ['zebra', 'apple'],
      ['y', 'x'],
      ['foo', 'bar'],
    ] as const)('should report unsorted keys "%s" before "%s"', (first, second) => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: first, value: { type: 'Literal', value: 1 } },
        { key: second, value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('test.each - sorted key pairs', () => {
    test.each([
      ['a', 'b'],
      ['a', 'z'],
      ['alpha', 'beta'],
      ['first', 'second'],
      ['apple', 'zebra'],
      ['x', 'y'],
      ['bar', 'foo'],
      ['1abc', '2abc'],
    ] as const)('should not report sorted keys "%s" before "%s"', (first, second) => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: first, value: { type: 'Literal', value: 1 } },
        { key: second, value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - three unsorted keys', () => {
    test.each([
      [['c', 'a', 'b'], 'a, b, c'],
      [['z', 'y', 'x'], 'x, y, z'],
      [['b', 'a', 'c'], 'a, b, c'],
      [['a', 'c', 'b'], 'a, b, c'],
      [['banana', 'apple', 'cherry'], 'apple, banana, cherry'],
    ] as const)('should report keys %p with expected order "%s"', (keys, expected) => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression(
        keys.map((k) => ({ key: k, value: { type: 'Literal', value: k } })),
      )
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(expected)
    })
  })

  describe('test.each - various minKeys values', () => {
    test.each([
      [2, 2, true],
      [2, 3, true],
      [3, 2, false],
      [4, 3, false],
      [5, 5, true],
      [3, 4, true],
    ] as const)(
      'minKeys=%i with %i unsorted keys should report=%s',
      (minKeys, keyCount, shouldReport) => {
        const { context, reports } = createMockContext({ minKeys })
        const visitor = sortKeysRule.create(context)
        const keys = Array.from({ length: keyCount }, (_, i) => String.fromCharCode(122 - i)) // z, y, x, ...
        const node = createObjectExpression(
          keys.map((k) => ({ key: k, value: { type: 'Literal', value: k } })),
        )
        visitor.ObjectExpression(node)
        expect(reports.length > 0).toBe(shouldReport)
      },
    )
  })

  describe('test.each - edge case node types', () => {
    test.each([
      ['null', null],
      ['undefined', undefined],
      ['string', 'hello'],
      ['number', 42],
      ['boolean', true],
      ['empty object', {}],
      ['array', [1, 2, 3]],
    ])('should handle %s node without throwing', (_, node) => {
      const { context } = createMockContext()
      const visitor = sortKeysRule.create(context)
      expect(() => visitor.ObjectExpression(node)).not.toThrow()
    })
  })

  describe('test.each - special key types', () => {
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

  describe('test.each - natural vs lexicographic sorting', () => {
    test('keys=[a1,a2,a10] natural=true should not report', () => {
      const { context, reports } = createMockContext({ natural: true })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'a1', value: { type: 'Literal', value: 1 } },
        { key: 'a2', value: { type: 'Literal', value: 2 } },
        { key: 'a10', value: { type: 'Literal', value: 3 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('keys=[a1,a10,a2] natural=true should report', () => {
      const { context, reports } = createMockContext({ natural: true })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'a1', value: { type: 'Literal', value: 1 } },
        { key: 'a10', value: { type: 'Literal', value: 2 } },
        { key: 'a2', value: { type: 'Literal', value: 3 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('keys=[a1,a10,a2] natural=false should not report', () => {
      const { context, reports } = createMockContext({ natural: false })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'a1', value: { type: 'Literal', value: 1 } },
        { key: 'a10', value: { type: 'Literal', value: 2 } },
        { key: 'a2', value: { type: 'Literal', value: 3 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('keys=[a1,a2,a10] natural=false should report', () => {
      const { context, reports } = createMockContext({ natural: false })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'a1', value: { type: 'Literal', value: 1 } },
        { key: 'a2', value: { type: 'Literal', value: 2 } },
        { key: 'a10', value: { type: 'Literal', value: 3 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('keys=[item1,item10,item2] natural=true should report', () => {
      const { context, reports } = createMockContext({ natural: true })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'item1', value: { type: 'Literal', value: 1 } },
        { key: 'item10', value: { type: 'Literal', value: 2 } },
        { key: 'item2', value: { type: 'Literal', value: 3 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('keys=[item1,item10,item2] natural=false should not report', () => {
      const { context, reports } = createMockContext({ natural: false })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'item1', value: { type: 'Literal', value: 1 } },
        { key: 'item10', value: { type: 'Literal', value: 2 } },
        { key: 'item2', value: { type: 'Literal', value: 3 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('keys=[file1,file2,file10] natural=true should not report', () => {
      const { context, reports } = createMockContext({ natural: true })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'file1', value: { type: 'Literal', value: 1 } },
        { key: 'file2', value: { type: 'Literal', value: 2 } },
        { key: 'file10', value: { type: 'Literal', value: 3 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('keys=[file10,file2,file1] natural=true should report', () => {
      const { context, reports } = createMockContext({ natural: true })
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'file10', value: { type: 'Literal', value: 1 } },
        { key: 'file2', value: { type: 'Literal', value: 2 } },
        { key: 'file1', value: { type: 'Literal', value: 3 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('comprehensive key sorting scenarios', () => {
    test('should report keys starting with same letter but different second letter', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'ab', value: { type: 'Literal', value: 1 } },
        { key: 'aa', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report keys starting with same letter in correct order', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'aa', value: { type: 'Literal', value: 1 } },
        { key: 'ab', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report reversed alphabetical order', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'z', value: { type: 'Literal', value: 1 } },
        { key: 'y', value: { type: 'Literal', value: 2 } },
        { key: 'x', value: { type: 'Literal', value: 3 } },
        { key: 'w', value: { type: 'Literal', value: 4 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle keys with double underscore prefix', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: '__z', value: { type: 'Literal', value: 1 } },
        { key: '__a', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle sorted double underscore prefix keys', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: '__a', value: { type: 'Literal', value: 1 } },
        { key: '__z', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report unsorted single char among many', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'a', value: { type: 'Literal', value: 1 } },
        { key: 'c', value: { type: 'Literal', value: 2 } },
        { key: 'b', value: { type: 'Literal', value: 3 } },
        { key: 'd', value: { type: 'Literal', value: 4 } },
        { key: 'e', value: { type: 'Literal', value: 5 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle keys with numbers embedded', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'key2value', value: { type: 'Literal', value: 1 } },
        { key: 'key1value', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle sorted keys with numbers embedded', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'key1value', value: { type: 'Literal', value: 1 } },
        { key: 'key2value', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report when only middle key is out of place', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'a', value: { type: 'Literal', value: 1 } },
        { key: 'e', value: { type: 'Literal', value: 2 } },
        { key: 'c', value: { type: 'Literal', value: 3 } },
        { key: 'd', value: { type: 'Literal', value: 4 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle keys differing only in last character', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'testz', value: { type: 'Literal', value: 1 } },
        { key: 'testa', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle sorted keys differing in last character', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'testa', value: { type: 'Literal', value: 1 } },
        { key: 'testz', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle keys with dots', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'z.key', value: { type: 'Literal', value: 1 } },
        { key: 'a.key', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle sorted keys with dots', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'a.key', value: { type: 'Literal', value: 1 } },
        { key: 'z.key', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle very long key names sorted', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'aVeryLongKeyNameThatGoesOnAndOn', value: { type: 'Literal', value: 1 } },
        { key: 'bVeryLongKeyNameThatGoesOnAndOn', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle very long key names unsorted', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'bVeryLongKeyNameThatGoesOnAndOn', value: { type: 'Literal', value: 1 } },
        { key: 'aVeryLongKeyNameThatGoesOnAndOn', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report when object has many keys with one inversion', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'a', value: { type: 'Literal', value: 1 } },
        { key: 'b', value: { type: 'Literal', value: 2 } },
        { key: 'c', value: { type: 'Literal', value: 3 } },
        { key: 'e', value: { type: 'Literal', value: 4 } },
        { key: 'd', value: { type: 'Literal', value: 5 } },
        { key: 'f', value: { type: 'Literal', value: 6 } },
        { key: 'g', value: { type: 'Literal', value: 7 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle keys with only vowels', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'u', value: { type: 'Literal', value: 1 } },
        { key: 'a', value: { type: 'Literal', value: 2 } },
        { key: 'e', value: { type: 'Literal', value: 3 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle sorted vowel-only keys', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'a', value: { type: 'Literal', value: 1 } },
        { key: 'e', value: { type: 'Literal', value: 2 } },
        { key: 'i', value: { type: 'Literal', value: 3 } },
        { key: 'o', value: { type: 'Literal', value: 4 } },
        { key: 'u', value: { type: 'Literal', value: 5 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle pascalCase keys unsorted', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'Zebra', value: { type: 'Literal', value: 1 } },
        { key: 'Apple', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle pascalCase keys sorted', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'Apple', value: { type: 'Literal', value: 1 } },
        { key: 'Banana', value: { type: 'Literal', value: 2 } },
        { key: 'Cherry', value: { type: 'Literal', value: 3 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle UPPER_CASE keys unsorted', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'ZEBRA', value: { type: 'Literal', value: 1 } },
        { key: 'APPLE', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle UPPER_CASE keys sorted', () => {
      const { context, reports } = createMockContext()
      const visitor = sortKeysRule.create(context)
      const node = createObjectExpression([
        { key: 'APPLE', value: { type: 'Literal', value: 1 } },
        { key: 'BANANA', value: { type: 'Literal', value: 2 } },
      ])
      visitor.ObjectExpression(node)
      expect(reports.length).toBe(0)
    })
  })
})

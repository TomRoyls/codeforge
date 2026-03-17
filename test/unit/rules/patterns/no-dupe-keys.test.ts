import { describe, test, expect, vi } from 'vitest'
import { noDupeKeysRule } from '../../../../src/rules/patterns/no-dupe-keys.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
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
    getSource: () => 'const x = { a: 1, a: 2 }',
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

  return { context, reports }
}

function createObjectWithDupeKeys(line = 1, column = 0): unknown {
  return {
    type: 'ObjectExpression',
    properties: [
      {
        type: 'Property',
        key: { type: 'Identifier', name: 'a' },
        value: { type: 'Literal', value: 1 },
      },
      {
        type: 'Property',
        key: { type: 'Identifier', name: 'a' },
        value: { type: 'Literal', value: 2 },
        loc: { start: { line, column }, end: { line, column: column + 5 } },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createObjectWithUniqueKeys(line = 1, column = 0): unknown {
  return {
    type: 'ObjectExpression',
    properties: [
      {
        type: 'Property',
        key: { type: 'Identifier', name: 'a' },
        value: { type: 'Literal', value: 1 },
      },
      {
        type: 'Property',
        key: { type: 'Identifier', name: 'b' },
        value: { type: 'Literal', value: 2 },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createObjectWithLiteralDupeKeys(line = 1, column = 0): unknown {
  return {
    type: 'ObjectExpression',
    properties: [
      {
        type: 'Property',
        key: { type: 'Literal', value: 'foo' },
        value: { type: 'Literal', value: 1 },
      },
      {
        type: 'Property',
        key: { type: 'Literal', value: 'foo' },
        value: { type: 'Literal', value: 2 },
        loc: { start: { line, column }, end: { line, column: column + 5 } },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createEmptyObject(line = 1, column = 0): unknown {
  return {
    type: 'ObjectExpression',
    properties: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 2 },
    },
  }
}

function createNonObjectExpression(): unknown {
  return {
    type: 'ArrayExpression',
    elements: [],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 2 },
    },
  }
}

describe('no-dupe-keys rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noDupeKeysRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noDupeKeysRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noDupeKeysRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noDupeKeysRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention duplicate in description', () => {
      expect(noDupeKeysRule.meta.docs?.description.toLowerCase()).toContain('duplicate')
    })
  })

  describe('create', () => {
    test('should return visitor with ObjectExpression method', () => {
      const { context } = createMockContext()
      const visitor = noDupeKeysRule.create(context)

      expect(visitor).toHaveProperty('ObjectExpression')
    })
  })

  describe('detecting duplicate keys', () => {
    test('should report object with duplicate identifier keys', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createObjectWithDupeKeys())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Duplicate key')
      expect(reports[0].message).toContain("'a'")
    })

    test('should not report object with unique keys', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createObjectWithUniqueKeys())

      expect(reports.length).toBe(0)
    })

    test('should report object with duplicate literal keys', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createObjectWithLiteralDupeKeys())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('foo')
    })

    test('should not report empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createEmptyObject())

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeKeysRule.create(context)

      visitor.ObjectExpression(createObjectWithDupeKeys(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noDupeKeysRule.create(context)

      expect(() => visitor.ObjectExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noDupeKeysRule.create(context)

      expect(() => visitor.ObjectExpression(undefined)).not.toThrow()
    })

    test('should handle non-ObjectExpression gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeKeysRule.create(context)

      expect(() => visitor.ObjectExpression(createNonObjectExpression())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeKeysRule.create(context)

      const node = { type: 'ObjectExpression' }

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noDupeKeysRule.create(context)

      const node = createObjectWithDupeKeys() as Record<string, unknown>
      delete node.loc
      const props = node.properties as unknown[]
      delete (props[1] as Record<string, unknown>).loc

      expect(() => visitor.ObjectExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })
})

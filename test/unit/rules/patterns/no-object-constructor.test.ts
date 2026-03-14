import { describe, test, expect, vi } from 'vitest'
import { noObjectConstructorRule } from '../../../../src/rules/patterns/no-object-constructor.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'new Object();',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        fix: descriptor.fix,
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

function createNewExpression(callee: unknown, args: unknown[] = [], line = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee,
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

describe('no-object-constructor rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noObjectConstructorRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noObjectConstructorRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noObjectConstructorRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noObjectConstructorRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noObjectConstructorRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noObjectConstructorRule.meta.fixable).toBe('code')
    })

    test('should mention Object in description', () => {
      expect(noObjectConstructorRule.meta.docs?.description).toContain('Object')
    })

    test('should mention object literal in description', () => {
      expect(noObjectConstructorRule.meta.docs?.description).toContain('{}')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      expect(visitor).toHaveProperty('NewExpression')
    })
  })

  describe('detecting new Object() calls', () => {
    test('should report new Object()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Object'))

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('{}')
    })

    test('should report new Object({})', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Object'), [
        { type: 'ObjectExpression', properties: [] },
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting valid code', () => {
    test('should not report new Array()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Array'))

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Map()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Map'))

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Set()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Set'))

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Date()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Date'))

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new MyClass()', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('MyClass'))

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report {} literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = { type: 'ObjectExpression', properties: [] }

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      expect(() => visitor.NewExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      expect(() => visitor.NewExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      expect(() => visitor.NewExpression('string')).not.toThrow()
      expect(() => visitor.NewExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression(createIdentifier('Object'), [], 42, 10)

      visitor.NewExpression(node)

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))

      expect(reports.length).toBe(1)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        arguments: [],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle member expression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      const node = createNewExpression({
        type: 'MemberExpression',
        object: createIdentifier('ns'),
        property: createIdentifier('Object'),
      })

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention {} in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))

      expect(reports[0].message).toContain('{}')
    })

    test('should mention new Object in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noObjectConstructorRule.create(context)

      visitor.NewExpression(createNewExpression(createIdentifier('Object')))

      expect(reports[0].message).toContain('new Object')
    })
  })

  describe('auto-fix', () => {
    test('should provide fix for new Object()', () => {
      const source = 'new Object()'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [],
        range: [0, 12] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('{}')
      expect(reports[0].fix?.range).toEqual([0, 12])
    })

    test('should NOT provide fix for new Object(value) with argument', () => {
      const source = 'new Object(x)'
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noObjectConstructorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Object'),
        arguments: [{ type: 'Identifier', name: 'x', range: [11, 12] }],
        range: [0, 13] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 13 } },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })
  })
})

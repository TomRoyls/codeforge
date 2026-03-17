import { describe, test, expect, vi } from 'vitest'
import { constructorSuperRule } from '../../../../src/rules/patterns/constructor-super.js'
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
    getSource: () => 'class A extends B { constructor() { super(); } }',
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

function createConstructorMethod(body: unknown[] = [], hasSuper = false, line = 1): unknown {
  const methodBody = hasSuper
    ? [
        {
          type: 'ExpressionStatement',
          expression: { type: 'CallExpression', callee: { type: 'Super' }, arguments: [] },
        },
        ...body,
      ]
    : body

  return {
    type: 'MethodDefinition',
    kind: 'constructor',
    value: {
      type: 'FunctionExpression',
      body: {
        type: 'BlockStatement',
        body: methodBody,
      },
    },
    loc: {
      start: { line, column: 0 },
      end: { line, column: 30 },
    },
  }
}

function createRegularMethod(line = 1): unknown {
  return {
    type: 'MethodDefinition',
    kind: 'method',
    value: {
      type: 'FunctionExpression',
      body: {
        type: 'BlockStatement',
        body: [],
      },
    },
    loc: {
      start: { line, column: 0 },
      end: { line, column: 20 },
    },
  }
}

function createNonMethodDefinition(): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'Literal',
      value: 42,
    },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 2 },
    },
  }
}

describe('constructor-super rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(constructorSuperRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(constructorSuperRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(constructorSuperRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(constructorSuperRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention super in description', () => {
      expect(constructorSuperRule.meta.docs?.description.toLowerCase()).toContain('super')
    })
  })

  describe('create', () => {
    test('should return visitor with MethodDefinition method', () => {
      const { context } = createMockContext()
      const visitor = constructorSuperRule.create(context)

      expect(visitor).toHaveProperty('MethodDefinition')
    })
  })

  describe('detecting missing super() calls', () => {
    test('should report constructor without super() call', () => {
      const { context, reports } = createMockContext()
      const visitor = constructorSuperRule.create(context)

      visitor.MethodDefinition(createConstructorMethod([], false))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('super')
    })

    test('should not report constructor with super() call', () => {
      const { context, reports } = createMockContext()
      const visitor = constructorSuperRule.create(context)

      visitor.MethodDefinition(createConstructorMethod([], true))

      expect(reports.length).toBe(0)
    })

    test('should not report regular method', () => {
      const { context, reports } = createMockContext()
      const visitor = constructorSuperRule.create(context)

      visitor.MethodDefinition(createRegularMethod())

      expect(reports.length).toBe(0)
    })

    test('should not report non-MethodDefinition node', () => {
      const { context, reports } = createMockContext()
      const visitor = constructorSuperRule.create(context)

      visitor.MethodDefinition(createNonMethodDefinition())

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = constructorSuperRule.create(context)

      expect(() => visitor.MethodDefinition(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = constructorSuperRule.create(context)

      expect(() => visitor.MethodDefinition(undefined)).not.toThrow()
    })

    test('should handle node without value', () => {
      const { context, reports } = createMockContext()
      const visitor = constructorSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without body', () => {
      const { context, reports } = createMockContext()
      const visitor = constructorSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty body array', () => {
      const { context, reports } = createMockContext()
      const visitor = constructorSuperRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [],
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.MethodDefinition(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })
})

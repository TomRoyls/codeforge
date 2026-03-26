import { describe, test, expect, vi } from 'vitest'
import { noReturnOrAwaitRule } from '../../../../src/rules/patterns/no-return-or-await.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x = 1;',
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

function createFunctionDeclaration(
  type: 'FunctionDeclaration' | 'FunctionExpression' | 'ArrowFunctionExpression',
  async: boolean,
  body: unknown,
  lineNumber = 1,
  column = 0,
): unknown {
  return {
    type: type,
    async: async,
    body: body,
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: column + 20 },
    },
  }
}

function createBlockStatement(body: unknown[] = []): unknown {
  return {
    type: 'BlockStatement',
    body: body,
  }
}

describe('no-return-or-await rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noReturnOrAwaitRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noReturnOrAwaitRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noReturnOrAwaitRule.meta.docs?.recommended).toBe(true)
    })

    test('should have performance category', () => {
      expect(noReturnOrAwaitRule.meta.docs?.category).toBe('performance')
    })

    test('should have schema defined', () => {
      expect(noReturnOrAwaitRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noReturnOrAwaitRule.meta.fixable).toBeUndefined()
    })

    test('should mention async in description', () => {
      expect(noReturnOrAwaitRule.meta.docs?.description.toLowerCase()).toContain('async')
    })

    test('should mention await or return in description', () => {
      const desc = noReturnOrAwaitRule.meta.docs?.description.toLowerCase()
      expect(desc).toMatch(/await|return/)
    })

    test('should have empty schema array', () => {
      expect(noReturnOrAwaitRule.meta.schema).toEqual([])
    })
  })

  describe('create', () => {
    test('should return visitor object with FunctionDeclaration method', () => {
      const { context } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      expect(visitor).toHaveProperty('FunctionDeclaration')
    })

    test('should return visitor object with FunctionExpression method', () => {
      const { context } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      expect(visitor).toHaveProperty('FunctionExpression')
    })

    test('should return visitor object with ArrowFunctionExpression method', () => {
      const { context } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      expect(visitor).toHaveProperty('ArrowFunctionExpression')
    })
  })

  describe('detecting async functions', () => {
    test('should not report non-async function declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', false, body))

      expect(reports.length).toBe(0)
    })

    test('should not report non-async function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionExpression(createFunctionDeclaration('FunctionExpression', false, body))

      expect(reports.length).toBe(0)
    })

    test('should not report non-async arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([])
      visitor.ArrowFunctionExpression(
        createFunctionDeclaration('ArrowFunctionExpression', false, body),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report async function with BlockStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(0)
    })

    test('should report async function without BlockStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const body = {
        type: 'ExpressionStatement',
        expression: {
          type: 'Literal',
          value: 'test',
        },
      }
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(0)
    })

    test('should report async function with null body', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Async function has no await or return.')
    })

    test('should report multiple violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node1 = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
      }
      const node2 = {
        type: 'FunctionExpression',
        async: true,
        body: null,
      }
      const node3 = {
        type: 'ArrowFunctionExpression',
        async: true,
        body: null,
      }
      visitor.FunctionDeclaration(node1)
      visitor.FunctionExpression(node2)
      visitor.ArrowFunctionExpression(node3)

      expect(reports.length).toBe(3)
    })
  })

  describe('edge cases', () => {
    test('should handle null node in FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      expect(() => visitor.FunctionDeclaration(undefined)).toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node in FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      expect(() => visitor.FunctionDeclaration('string')).not.toThrow()
      expect(() => visitor.FunctionDeclaration(123)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle node without async property', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        body: createBlockStatement([]),
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without body property', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: createBlockStatement([]),
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noReturnOrAwaitRule.create(context)

      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(0)
    })

    test('should handle undefined options array', () => {
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
        getSource: () => 'async function foo() {}',
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

      const visitor = noReturnOrAwaitRule.create(context)
      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration('FunctionDeclaration', true, body))

      expect(reports.length).toBe(0)
    })

    test('should handle null body', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention async in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].message.toLowerCase()).toContain('async')
    })

    test('should mention await in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].message).toContain('await')
    })

    test('should mention return in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].message).toContain('return')
    })

    test('should have consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node1 = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
      }
      const node2 = {
        type: 'FunctionExpression',
        async: true,
        body: null,
      }
      visitor.FunctionDeclaration(node1)
      visitor.FunctionExpression(node2)

      expect(reports[0].message).toBe('Async function has no await or return.')
      expect(reports[1].message).toBe('Async function has no await or return.')
    })
  })

  describe('location reporting', () => {
    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
        loc: {
          start: { line: 10, column: 5 },
          end: { line: 10, column: 25 },
        },
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnOrAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        body: null,
        loc: {
          start: { line: 5, column: 10 },
          end: { line: 5, column: 30 },
        },
      }
      visitor.FunctionDeclaration(node)

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })
  })
})

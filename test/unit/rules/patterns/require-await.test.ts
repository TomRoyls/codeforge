import { describe, test, expect, vi } from 'vitest'
import { requireAwaitRule } from '../../../../src/rules/patterns/require-await.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'async function foo() { return 1; }',
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
  async: boolean,
  body: unknown,
  params: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'FunctionDeclaration',
    async,
    generator: false,
    params,
    body,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createFunctionExpression(
  async: boolean,
  body: unknown,
  params: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'FunctionExpression',
    async,
    generator: false,
    params,
    body,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createArrowFunction(
  async: boolean,
  body: unknown,
  params: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'ArrowFunctionExpression',
    async,
    params,
    body,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createBlockStatement(statements: unknown[]): unknown {
  return {
    type: 'BlockStatement',
    body: statements,
  }
}

function createAwaitExpression(argument: unknown): unknown {
  return {
    type: 'AwaitExpression',
    argument,
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createReturnStatement(argument: unknown): unknown {
  return {
    type: 'ReturnStatement',
    argument,
  }
}

function createRestParameter(name: string): unknown {
  return {
    type: 'RestElement',
    argument: createIdentifier(name),
  }
}

describe('require-await rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(requireAwaitRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(requireAwaitRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(requireAwaitRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(requireAwaitRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(requireAwaitRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(requireAwaitRule.meta.fixable).toBe('code')
    })

    test('should mention await in description', () => {
      expect(requireAwaitRule.meta.docs?.description.toLowerCase()).toContain('await')
    })

    test('should mention async in description', () => {
      expect(requireAwaitRule.meta.docs?.description.toLowerCase()).toContain('async')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = requireAwaitRule.create(context)

      expect(visitor).toHaveProperty('FunctionDeclaration')
      expect(visitor).toHaveProperty('FunctionExpression')
      expect(visitor).toHaveProperty('ArrowFunctionExpression')
    })
  })

  describe('detecting async functions without await', () => {
    test('should report async function declaration without await', () => {
      const { context, reports } = createMockContext()
      const visitor = requireAwaitRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node = createFunctionDeclaration(true, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('await')
    })

    test('should report async function expression without await', () => {
      const { context, reports } = createMockContext()
      const visitor = requireAwaitRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node = createFunctionExpression(true, body)

      visitor.FunctionExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report async arrow function without await', () => {
      const { context, reports } = createMockContext()
      const visitor = requireAwaitRule.create(context)

      const node = createArrowFunction(true, createIdentifier('x'))

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report async arrow function with block body but no await', () => {
      const { context, reports } = createMockContext()
      const visitor = requireAwaitRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node = createArrowFunction(true, body)

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report async function with only synchronous operations', () => {
      const { context, reports } = createMockContext()
      const visitor = requireAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'VariableDeclaration',
          declarations: [
            {
              type: 'VariableDeclarator',
              id: createIdentifier('x'),
              init: { type: 'Literal', value: 1 },
            },
          ],
        },
      ])
      const node = createFunctionDeclaration(true, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting valid async functions', () => {
    test('should not report sync function', () => {
      const { context, reports } = createMockContext()
      const visitor = requireAwaitRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node = createFunctionDeclaration(false, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report sync arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = requireAwaitRule.create(context)

      const node = createArrowFunction(false, createIdentifier('x'))

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report async function with await', () => {
      const { context, reports } = createMockContext()
      const visitor = requireAwaitRule.create(context)

      const body = createBlockStatement([
        createReturnStatement(createAwaitExpression(createIdentifier('promise'))),
      ])
      const node = createFunctionDeclaration(true, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report async function with nested await', () => {
      const { context, reports } = createMockContext()
      const visitor = requireAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: createIdentifier('fn'),
            arguments: [createAwaitExpression(createIdentifier('promise'))],
          },
        },
      ])
      const node = createFunctionDeclaration(true, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report async arrow function with await', () => {
      const { context, reports } = createMockContext()
      const visitor = requireAwaitRule.create(context)

      const node = createArrowFunction(true, createAwaitExpression(createIdentifier('promise')))

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report async generator function', () => {
      const { context, reports } = createMockContext()
      const visitor = requireAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: true,
        params: [],
        body: createBlockStatement([]),
      }

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report async function with rest parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = requireAwaitRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('args'))])
      const node = createFunctionDeclaration(true, body, [createRestParameter('args')])

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = requireAwaitRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = requireAwaitRule.create(context)

      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = requireAwaitRule.create(context)

      expect(() => visitor.FunctionDeclaration('string')).not.toThrow()
      expect(() => visitor.FunctionDeclaration(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = requireAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        params: [],
        body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = requireAwaitRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node = createFunctionDeclaration(true, body, [], 42, 10)

      visitor.FunctionDeclaration(node)

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = requireAwaitRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should handle node without body', () => {
      const { context, reports } = createMockContext()
      const visitor = requireAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        params: [],
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
    })

    test('should handle node without params', () => {
      const { context, reports } = createMockContext()
      const visitor = requireAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention async in message', () => {
      const { context, reports } = createMockContext()
      const visitor = requireAwaitRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports[0].message.toLowerCase()).toContain('async')
    })

    test('should mention await in message', () => {
      const { context, reports } = createMockContext()
      const visitor = requireAwaitRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports[0].message.toLowerCase()).toContain('await')
    })
  })
})

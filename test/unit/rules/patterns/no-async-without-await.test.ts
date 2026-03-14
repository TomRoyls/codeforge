import { describe, test, expect, vi } from 'vitest'
import { noAsyncWithoutAwaitRule } from '../../../../src/rules/patterns/no-async-without-await.js'
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
  generator = false,
  body: unknown,
  params: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'FunctionDeclaration',
    async,
    generator,
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
  generator = false,
  body: unknown,
  params: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'FunctionExpression',
    async,
    generator,
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

function createForAwaitStatement(variable: unknown, right: unknown): unknown {
  return {
    type: 'ForOfStatement',
    await: true,
    left: variable,
    right,
    body: createBlockStatement([]),
  }
}

function createForOfStatement(variable: unknown, right: unknown): unknown {
  return {
    type: 'ForOfStatement',
    await: false,
    left: variable,
    right,
    body: createBlockStatement([]),
  }
}

describe('no-async-without-await rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noAsyncWithoutAwaitRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noAsyncWithoutAwaitRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noAsyncWithoutAwaitRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noAsyncWithoutAwaitRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noAsyncWithoutAwaitRule.meta.schema).toEqual([])
    })

    test('should be fixable', () => {
      expect(noAsyncWithoutAwaitRule.meta.fixable).toBe('code')
    })

    test('should mention async in description', () => {
      expect(noAsyncWithoutAwaitRule.meta.docs?.description.toLowerCase()).toContain('async')
    })

    test('should mention await in description', () => {
      expect(noAsyncWithoutAwaitRule.meta.docs?.description.toLowerCase()).toContain('await')
    })

    test('should have documentation URL', () => {
      expect(noAsyncWithoutAwaitRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-async-without-await',
      )
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      expect(visitor).toHaveProperty('FunctionDeclaration')
      expect(visitor).toHaveProperty('FunctionExpression')
      expect(visitor).toHaveProperty('ArrowFunctionExpression')
    })

    test('should create visitor that returns functions', () => {
      const { context } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      expect(typeof visitor.FunctionDeclaration).toBe('function')
      expect(typeof visitor.FunctionExpression).toBe('function')
      expect(typeof visitor.ArrowFunctionExpression).toBe('function')
    })
  })

  describe('detecting async functions without await', () => {
    test('should report async function declaration without await', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node = createFunctionDeclaration(true, false, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Async function has no await expression.')
    })

    test('should report async function expression without await', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node = createFunctionExpression(true, false, body)

      visitor.FunctionExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Async function has no await expression.')
    })

    test('should report async arrow function without await', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      const node = createArrowFunction(true, createIdentifier('x'))

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Async function has no await expression.')
    })

    test('should report async arrow function with block body but no await', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node = createArrowFunction(true, body)

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report async function with only synchronous operations', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

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
      const node = createFunctionDeclaration(true, false, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })

    test('should report async function with only regular for-of loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      const body = createBlockStatement([
        createForOfStatement(createIdentifier('item'), createIdentifier('array')),
      ])
      const node = createFunctionDeclaration(true, false, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting valid async functions', () => {
    test('should not report sync function', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node = createFunctionDeclaration(false, false, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report sync arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      const node = createArrowFunction(false, createIdentifier('x'))

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report async function with await', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      const body = createBlockStatement([
        createReturnStatement(createAwaitExpression(createIdentifier('promise'))),
      ])
      const node = createFunctionDeclaration(true, false, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report async function with nested await', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

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
      const node = createFunctionDeclaration(true, false, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report async arrow function with await', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      const node = createArrowFunction(true, createAwaitExpression(createIdentifier('promise')))

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report async generator function', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

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

    test('should not report async function with for-await-of', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      const body = createBlockStatement([
        createForAwaitStatement(createIdentifier('item'), createIdentifier('asyncIterable')),
      ])
      const node = createFunctionDeclaration(true, false, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report sync function with for-await-of', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      const body = createBlockStatement([
        createForAwaitStatement(createIdentifier('item'), createIdentifier('asyncIterable')),
      ])
      const node = createFunctionDeclaration(false, false, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('nested function handling', () => {
    test('should not count await in nested async function', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      const nestedBody = createBlockStatement([
        createReturnStatement(createAwaitExpression(createIdentifier('innerPromise'))),
      ])
      const nestedNode = createFunctionDeclaration(true, false, nestedBody)

      const outerBody = createBlockStatement([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: nestedNode,
            arguments: [],
          },
        },
      ])
      const outerNode = createFunctionDeclaration(true, false, outerBody)

      visitor.FunctionDeclaration(outerNode)

      expect(reports.length).toBe(1)
    })

    test('should handle arrow function nested in async function', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      const nestedNode = createArrowFunction(true, createIdentifier('x'))

      const outerBody = createBlockStatement([
        {
          type: 'VariableDeclaration',
          declarations: [
            {
              type: 'VariableDeclarator',
              id: createIdentifier('fn'),
              init: nestedNode,
            },
          ],
        },
      ])
      const outerNode = createFunctionDeclaration(true, false, outerBody)

      visitor.FunctionDeclaration(outerNode)

      expect(reports.length).toBe(1)
    })

    test('should handle function expression nested in async function', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      const nestedBody = createBlockStatement([
        createReturnStatement(createAwaitExpression(createIdentifier('inner'))),
      ])
      const nestedNode = createFunctionExpression(true, false, nestedBody)

      const outerBody = createBlockStatement([
        {
          type: 'VariableDeclaration',
          declarations: [
            {
              type: 'VariableDeclarator',
              id: createIdentifier('fn'),
              init: nestedNode,
            },
          ],
        },
      ])
      const outerNode = createFunctionDeclaration(true, false, outerBody)

      visitor.FunctionDeclaration(outerNode)

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      expect(() => visitor.FunctionDeclaration('string')).not.toThrow()
      expect(() => visitor.FunctionDeclaration(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

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
      const visitor = noAsyncWithoutAwaitRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node = createFunctionDeclaration(true, false, body, [], 42, 10)

      visitor.FunctionDeclaration(node)

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noAsyncWithoutAwaitRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))

      expect(reports.length).toBe(1)
    })

    test('should handle node without body', () => {
      const { context } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

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
      const visitor = noAsyncWithoutAwaitRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty block statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      const body = createBlockStatement([])
      const node = createFunctionDeclaration(true, false, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should have clear and descriptive message', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))

      expect(reports[0].message).toBe('Async function has no await expression.')
    })

    test('should use same message for all function types', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])

      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      visitor.FunctionExpression(createFunctionExpression(true, false, body))
      visitor.ArrowFunctionExpression(createArrowFunction(true, createIdentifier('x')))

      expect(reports).toHaveLength(3)
      expect(reports.every((r) => r.message === 'Async function has no await expression.')).toBe(
        true,
      )
    })
  })

  describe('generator functions', () => {
    test('should skip async generator with await', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      const body = createBlockStatement([
        createReturnStatement(createAwaitExpression(createIdentifier('promise'))),
      ])
      const node = createFunctionDeclaration(true, true, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should skip async generator without await', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node = createFunctionDeclaration(true, true, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should skip async generator expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node = createFunctionExpression(true, true, body)

      visitor.FunctionExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('for-await-of detection', () => {
    test('should detect for-await-of at top level', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      const body = createBlockStatement([
        createForAwaitStatement(createIdentifier('item'), createIdentifier('asyncIterable')),
      ])
      const node = createFunctionDeclaration(true, false, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should detect nested for-await-of', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      const body = createBlockStatement([
        {
          type: 'IfStatement',
          test: createIdentifier('condition'),
          consequent: createBlockStatement([
            createForAwaitStatement(createIdentifier('item'), createIdentifier('asyncIterable')),
          ]),
        },
      ])
      const node = createFunctionDeclaration(true, false, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not detect regular for-of as for-await-of', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      const body = createBlockStatement([
        createForOfStatement(createIdentifier('item'), createIdentifier('array')),
      ])
      const node = createFunctionDeclaration(true, false, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
    })
  })
})

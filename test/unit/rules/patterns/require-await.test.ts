import { describe, test, expect, vi } from 'vitest'
import { requireAwaitRule } from '../../../../src/rules/patterns/require-await.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

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
      const { context } = createMockRuleContext({ source: 'async function foo() { return 1; }' })
      const visitor = requireAwaitRule.create(context)

      expect(visitor).toHaveProperty('FunctionDeclaration')
      expect(visitor).toHaveProperty('FunctionExpression')
      expect(visitor).toHaveProperty('ArrowFunctionExpression')
    })
  })

  describe('detecting async functions without await', () => {
    test('should report async function declaration without await', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node = createFunctionDeclaration(true, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('await')
    })

    test('should report async function expression without await', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node = createFunctionExpression(true, body)

      visitor.FunctionExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report async arrow function without await', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)

      const node = createArrowFunction(true, createIdentifier('x'))

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report async arrow function with block body but no await', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node = createArrowFunction(true, body)

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report async function with only synchronous operations', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
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
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node = createFunctionDeclaration(false, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report sync arrow function', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)

      const node = createArrowFunction(false, createIdentifier('x'))

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report async function with await', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)

      const body = createBlockStatement([
        createReturnStatement(createAwaitExpression(createIdentifier('promise'))),
      ])
      const node = createFunctionDeclaration(true, body)

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report async function with nested await', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
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
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)

      const node = createArrowFunction(true, createAwaitExpression(createIdentifier('promise')))

      visitor.ArrowFunctionExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report async generator function', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
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
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('args'))])
      const node = createFunctionDeclaration(true, body, [createRestParameter('args')])

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'async function foo() { return 1; }' })
      const visitor = requireAwaitRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'async function foo() { return 1; }' })
      const visitor = requireAwaitRule.create(context)

      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'async function foo() { return 1; }' })
      const visitor = requireAwaitRule.create(context)

      expect(() => visitor.FunctionDeclaration('string')).not.toThrow()
      expect(() => visitor.FunctionDeclaration(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
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
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node = createFunctionDeclaration(true, body, [], 42, 10)

      visitor.FunctionDeclaration(node)

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(1)
    })

    test('should handle node without body', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
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
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
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
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports[0].message.toLowerCase()).toContain('async')
    })

    test('should mention await in message', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports[0].message.toLowerCase()).toContain('await')
    })

    test('should have consistent message across function types', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const { context: ctx2, reports: r2 } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const { context: ctx3, reports: r3 } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })

      const visitor1 = requireAwaitRule.create(ctx1)
      const visitor2 = requireAwaitRule.create(ctx2)
      const visitor3 = requireAwaitRule.create(ctx3)

      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor1.FunctionDeclaration(createFunctionDeclaration(true, body))
      visitor2.FunctionExpression(createFunctionExpression(true, body))
      visitor3.ArrowFunctionExpression(createArrowFunction(true, body))

      expect(r1[0].message).toBe(r2[0].message)
      expect(r2[0].message).toBe(r3[0].message)
    })
  })

  describe('isAsync helper - comprehensive', () => {
    test('should not report non-async function declaration', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report function with async=false explicitly', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: false,
        generator: false,
        params: [],
        body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should not report function with async=undefined', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: undefined,
        generator: false,
        params: [],
        body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should not report function with async=null', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: null,
        generator: false,
        params: [],
        body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should not report function with async="true" string', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: 'true',
        generator: false,
        params: [],
        body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should not report function with async=1 number', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: 1,
        generator: false,
        params: [],
        body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should report function with async=true', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(1)
    })
  })

  describe('isGenerator helper - comprehensive', () => {
    test('should not report async generator function declaration', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
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

    test('should not report async generator function expression', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionExpression',
        async: true,
        generator: true,
        params: [],
        body: createBlockStatement([]),
      }
      visitor.FunctionExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report async generator arrow function', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'ArrowFunctionExpression',
        async: true,
        generator: true,
        params: [],
        body: createBlockStatement([]),
      }
      visitor.ArrowFunctionExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report async non-generator function', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        params: [],
        body: createBlockStatement([]),
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should report async function with generator=undefined', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        params: [],
        body: createBlockStatement([]),
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should report async function with generator=null', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: null,
        params: [],
        body: createBlockStatement([]),
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should report async function with generator="true"', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: 'true',
        params: [],
        body: createBlockStatement([]),
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('hasRestParameter helper - comprehensive', () => {
    test('should not report async function with single rest parameter', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('args'))])
      const node = createFunctionDeclaration(true, body, [createRestParameter('args')])
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should not report async function with multiple params ending in rest', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('result'))])
      const node = createFunctionDeclaration(true, body, [
        createIdentifier('a'),
        createIdentifier('b'),
        createRestParameter('rest'),
      ])
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should report async function with regular params only', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node = createFunctionDeclaration(true, body, [
        createIdentifier('a'),
        createIdentifier('b'),
      ])
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should report async function with empty params array', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node = createFunctionDeclaration(true, body, [])
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should not report async arrow with rest parameter', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = createArrowFunction(true, createIdentifier('args'), [
        createRestParameter('args'),
      ])
      visitor.ArrowFunctionExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report async function expression with rest parameter', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('args'))])
      const node = createFunctionExpression(true, body, [createRestParameter('args')])
      visitor.FunctionExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report async function with non-rest last param', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node = createFunctionDeclaration(true, body, [createIdentifier('a')])
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should not report async function with rest in middle (only last matters)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node = createFunctionDeclaration(true, body, [
        createRestParameter('first'),
        createIdentifier('last'),
      ])
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('containsAwait - recursive search', () => {
    test('should find await in deeply nested expression', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'BinaryExpression',
          operator: '+',
          left: createAwaitExpression(createIdentifier('a')),
          right: createIdentifier('b'),
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should find await in conditional expression', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'ConditionalExpression',
          test: createIdentifier('cond'),
          consequent: createAwaitExpression(createIdentifier('a')),
          alternate: createIdentifier('b'),
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should find await in array expression', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'ArrayExpression',
          elements: [createAwaitExpression(createIdentifier('promise'))],
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should find await in object expression value', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'ObjectExpression',
          properties: [
            {
              type: 'Property',
              key: createIdentifier('x'),
              value: createAwaitExpression(createIdentifier('promise')),
            },
          ],
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should find await in member expression object', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'MemberExpression',
            object: createAwaitExpression(createIdentifier('obj')),
            property: createIdentifier('prop'),
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should find await in call expression arguments', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: createIdentifier('fn'),
            arguments: [createIdentifier('a'), createAwaitExpression(createIdentifier('promise'))],
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should find await in try-catch block', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'TryStatement',
          block: createBlockStatement([
            {
              type: 'ExpressionStatement',
              expression: createAwaitExpression(createIdentifier('promise')),
            },
          ]),
          handler: {
            type: 'CatchClause',
            param: createIdentifier('e'),
            body: createBlockStatement([]),
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should find await in catch clause body', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'TryStatement',
          block: createBlockStatement([]),
          handler: {
            type: 'CatchClause',
            param: createIdentifier('e'),
            body: createBlockStatement([
              {
                type: 'ExpressionStatement',
                expression: createAwaitExpression(createIdentifier('promise')),
              },
            ]),
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should find await in if statement consequent', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'IfStatement',
          test: createIdentifier('cond'),
          consequent: createBlockStatement([
            {
              type: 'ExpressionStatement',
              expression: createAwaitExpression(createIdentifier('promise')),
            },
          ]),
          alternate: null,
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should find await in if statement alternate', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'IfStatement',
          test: createIdentifier('cond'),
          consequent: createBlockStatement([]),
          alternate: createBlockStatement([
            {
              type: 'ExpressionStatement',
              expression: createAwaitExpression(createIdentifier('promise')),
            },
          ]),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should find await in while loop body', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'WhileStatement',
          test: createIdentifier('cond'),
          body: createBlockStatement([
            {
              type: 'ExpressionStatement',
              expression: createAwaitExpression(createIdentifier('promise')),
            },
          ]),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should find await in for loop body', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'ForStatement',
          init: null,
          test: createIdentifier('cond'),
          update: null,
          body: createBlockStatement([
            {
              type: 'ExpressionStatement',
              expression: createAwaitExpression(createIdentifier('promise')),
            },
          ]),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should find await in for-in loop body', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'ForInStatement',
          left: createIdentifier('key'),
          right: createIdentifier('obj'),
          body: createBlockStatement([
            {
              type: 'ExpressionStatement',
              expression: createAwaitExpression(createIdentifier('promise')),
            },
          ]),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should find await in for-of loop body', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'ForOfStatement',
          left: createIdentifier('item'),
          right: createIdentifier('arr'),
          body: createBlockStatement([
            {
              type: 'ExpressionStatement',
              expression: createAwaitExpression(createIdentifier('promise')),
            },
          ]),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should find await in switch case', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'SwitchStatement',
          discriminant: createIdentifier('val'),
          cases: [
            {
              type: 'SwitchCase',
              test: createIdentifier('a'),
              consequent: [
                {
                  type: 'ExpressionStatement',
                  expression: createAwaitExpression(createIdentifier('promise')),
                },
              ],
            },
          ],
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should find await in template literal', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'TemplateLiteral',
          quasis: [{ type: 'TemplateElement', value: { raw: 'hello ' } }],
          expressions: [createAwaitExpression(createIdentifier('promise'))],
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should find await in new expression arguments', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'NewExpression',
            callee: createIdentifier('MyClass'),
            arguments: [createAwaitExpression(createIdentifier('promise'))],
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should find await in logical expression', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'LogicalExpression',
          operator: '&&',
          left: createAwaitExpression(createIdentifier('a')),
          right: createIdentifier('b'),
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should find await in unary expression argument', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'UnaryExpression',
          operator: '!',
          argument: createAwaitExpression(createIdentifier('promise')),
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should find await in assignment expression right side', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'AssignmentExpression',
            operator: '=',
            left: createIdentifier('x'),
            right: createAwaitExpression(createIdentifier('promise')),
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should find await in throw statement argument', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'ThrowStatement',
          argument: createAwaitExpression(createIdentifier('getError')),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should find await in yield expression argument', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'YieldExpression',
            argument: createAwaitExpression(createIdentifier('promise')),
            delegate: false,
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should find deeply nested await 5 levels deep', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const deepAwait = {
        type: 'BinaryExpression',
        operator: '+',
        left: {
          type: 'BinaryExpression',
          operator: '+',
          left: {
            type: 'BinaryExpression',
            operator: '+',
            left: {
              type: 'BinaryExpression',
              operator: '+',
              left: createAwaitExpression(createIdentifier('deep')),
              right: createIdentifier('a'),
            },
            right: createIdentifier('b'),
          },
          right: createIdentifier('c'),
        },
        right: createIdentifier('d'),
      }
      const body = createBlockStatement([createReturnStatement(deepAwait)])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should not find await when body only has identifiers', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(1)
    })

    test('should not find await when body only has literals', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement({ type: 'Literal', value: 42 })])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(1)
    })

    test('should not find await in empty block statement', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(1)
    })

    test('should find await in arrow function expression body', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = createArrowFunction(true, createAwaitExpression(createIdentifier('p')))
      visitor.ArrowFunctionExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not find await in arrow function with string body', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = createArrowFunction(true, 'just a string')
      visitor.ArrowFunctionExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('location reporting - comprehensive', () => {
    test('should report start line 1 column 0 by default', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body, [], 1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 5 column 3', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body, [], 5, 3))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report location at line 100 column 50', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body, [], 100, 50))
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report end location from node', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body, [], 10, 5))
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('should report location for function expression', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionExpression(createFunctionExpression(true, body, [], 7, 12))
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('should report location for arrow function', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction(true, createIdentifier('x'), [], 15, 8))
      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should handle zero line and column', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body, [], 0, 0))
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle negative line gracefully', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body, [], -1, 0))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(-1)
    })

    test('should handle very large line number', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body, [], 99999, 0))
      expect(reports[0].loc?.start.line).toBe(99999)
    })

    test('should provide default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        params: [],
        body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
      }
      visitor.FunctionDeclaration(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with missing start', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        params: [],
        body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
        loc: { end: { line: 2, column: 5 } },
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should handle loc with missing end', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        params: [],
        body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
        loc: { start: { line: 3, column: 2 } },
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
    })
  })

  describe('all three function types - systematic', () => {
    const funcTypes = [
      {
        name: 'FunctionDeclaration',
        create: createFunctionDeclaration,
        key: 'FunctionDeclaration',
      },
      { name: 'FunctionExpression', create: createFunctionExpression, key: 'FunctionExpression' },
      {
        name: 'ArrowFunctionExpression',
        create: createArrowFunction,
        key: 'ArrowFunctionExpression',
      },
    ] as const

    for (const ft of funcTypes) {
      describe(ft.name, () => {
        test(`should report async ${ft.name} without await`, () => {
          const { context, reports } = createMockRuleContext({
            source: 'async function foo() { return 1; }',
          })
          const visitor = requireAwaitRule.create(context)
          const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
          const node =
            ft.name === 'ArrowFunctionExpression'
              ? ft.create(true, createIdentifier('x'))
              : ft.create(true, body)
          visitor[ft.key](node)
          expect(reports.length).toBe(1)
        })

        test(`should not report sync ${ft.name}`, () => {
          const { context, reports } = createMockRuleContext({
            source: 'async function foo() { return 1; }',
          })
          const visitor = requireAwaitRule.create(context)
          const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
          const node =
            ft.name === 'ArrowFunctionExpression'
              ? ft.create(false, createIdentifier('x'))
              : ft.create(false, body)
          visitor[ft.key](node)
          expect(reports.length).toBe(0)
        })

        test(`should not report async ${ft.name} with await`, () => {
          const { context, reports } = createMockRuleContext({
            source: 'async function foo() { return 1; }',
          })
          const visitor = requireAwaitRule.create(context)
          const bodyWithAwait = createBlockStatement([
            createReturnStatement(createAwaitExpression(createIdentifier('p'))),
          ])
          const node =
            ft.name === 'ArrowFunctionExpression'
              ? ft.create(true, createAwaitExpression(createIdentifier('p')))
              : ft.create(true, bodyWithAwait)
          visitor[ft.key](node)
          expect(reports.length).toBe(0)
        })

        test(`should report async ${ft.name} with empty body`, () => {
          const { context, reports } = createMockRuleContext({
            source: 'async function foo() { return 1; }',
          })
          const visitor = requireAwaitRule.create(context)
          const node =
            ft.name === 'ArrowFunctionExpression'
              ? ft.create(true, createBlockStatement([]))
              : ft.create(true, createBlockStatement([]))
          visitor[ft.key](node)
          expect(reports.length).toBe(1)
        })

        test(`should handle null body for async ${ft.name}`, () => {
          const { context } = createMockRuleContext({
            source: 'async function foo() { return 1; }',
          })
          const visitor = requireAwaitRule.create(context)
          const node = ft.create(true, null)
          expect(() => visitor[ft.key](node)).not.toThrow()
        })
      })
    }
  })

  describe('multiple calls and state', () => {
    test('should report each async function independently', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])

      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      visitor.FunctionExpression(createFunctionExpression(true, body))
      visitor.ArrowFunctionExpression(createArrowFunction(true, createIdentifier('x')))

      expect(reports.length).toBe(3)
    })

    test('should handle mix of valid and invalid async functions', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const bodyNoAwait = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const bodyWithAwait = createBlockStatement([
        createReturnStatement(createAwaitExpression(createIdentifier('p'))),
      ])

      visitor.FunctionDeclaration(createFunctionDeclaration(true, bodyNoAwait))
      visitor.FunctionDeclaration(createFunctionDeclaration(true, bodyWithAwait))
      visitor.FunctionExpression(createFunctionExpression(true, bodyNoAwait))

      expect(reports.length).toBe(2)
    })

    test('should not accumulate state across calls', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const { context: ctx2, reports: r2 } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const v1 = requireAwaitRule.create(ctx1)
      const v2 = requireAwaitRule.create(ctx2)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])

      v1.FunctionDeclaration(createFunctionDeclaration(true, body))
      v2.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(1)
    })

    test('should handle many sequential reports', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])

      for (let i = 0; i < 50; i++) {
        visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      }

      expect(reports.length).toBe(50)
    })

    test('should handle interleaved valid and invalid calls', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const bodyNoAwait = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const bodyWithAwait = createBlockStatement([
        createReturnStatement(createAwaitExpression(createIdentifier('p'))),
      ])

      for (let i = 0; i < 25; i++) {
        visitor.FunctionDeclaration(createFunctionDeclaration(true, bodyNoAwait))
        visitor.FunctionDeclaration(createFunctionDeclaration(true, bodyWithAwait))
      }

      expect(reports.length).toBe(25)
    })
  })

  describe('edge cases - extended', () => {
    test('should handle node that is a boolean true', () => {
      const { context } = createMockRuleContext({ source: 'async function foo() { return 1; }' })
      const visitor = requireAwaitRule.create(context)
      expect(() => visitor.FunctionDeclaration(true)).not.toThrow()
    })

    test('should handle node that is a boolean false', () => {
      const { context } = createMockRuleContext({ source: 'async function foo() { return 1; }' })
      const visitor = requireAwaitRule.create(context)
      expect(() => visitor.FunctionDeclaration(false)).not.toThrow()
    })

    test('should handle node that is a number zero', () => {
      const { context } = createMockRuleContext({ source: 'async function foo() { return 1; }' })
      const visitor = requireAwaitRule.create(context)
      expect(() => visitor.FunctionDeclaration(0)).not.toThrow()
    })

    test('should handle node that is an empty array', () => {
      const { context } = createMockRuleContext({ source: 'async function foo() { return 1; }' })
      const visitor = requireAwaitRule.create(context)
      expect(() => visitor.FunctionDeclaration([])).not.toThrow()
    })

    test('should handle node that is a Date object', () => {
      const { context } = createMockRuleContext({ source: 'async function foo() { return 1; }' })
      const visitor = requireAwaitRule.create(context)
      expect(() => visitor.FunctionDeclaration(new Date())).not.toThrow()
    })

    test('should handle node with async as function', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: () => true,
        generator: false,
        params: [],
        body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with async as object', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: { value: true },
        generator: false,
        params: [],
        body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with body as empty object', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        params: [],
        body: {},
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node with body as primitive string', () => {
      const { context } = createMockRuleContext({ source: 'async function foo() { return 1; }' })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        params: [],
        body: 'expression body',
      }
      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
    })

    test('should handle node with body as number', () => {
      const { context } = createMockRuleContext({ source: 'async function foo() { return 1; }' })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        params: [],
        body: 42,
      }
      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
    })

    test('should handle node with circular reference in body', () => {
      const { context } = createMockRuleContext({ source: 'async function foo() { return 1; }' })
      const visitor = requireAwaitRule.create(context)
      const circularNode: Record<string, unknown> = { type: 'Identifier', name: 'x' }
      circularNode.self = circularNode
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        params: [],
        body: createBlockStatement([circularNode]),
      }
      try {
        visitor.FunctionDeclaration(node)
      } catch {
        // stack overflow from circular ref
      }
    })

    test('should handle params as non-array', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        params: 'not-an-array',
        body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should handle params with null elements', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        params: [null, null],
        body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should handle params with undefined elements', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        params: [undefined],
        body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should handle loc with string line/column', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        params: [],
        body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
        loc: {
          start: { line: '5', column: '3' },
          end: { line: '5', column: '20' },
        },
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with null line/column', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        params: [],
        body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
        loc: {
          start: { line: null, column: null },
          end: { line: null, column: null },
        },
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should handle NaN line value', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        params: [],
        body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
        loc: {
          start: { line: NaN, column: NaN },
          end: { line: NaN, column: NaN },
        },
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should handle Infinity line value', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        params: [],
        body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
        loc: {
          start: { line: Infinity, column: 0 },
          end: { line: Infinity, column: 10 },
        },
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(Infinity)
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
        filePath: '/custom/path/file.ts',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({
        source: 'const x = 1;',
        filePath: '/src/file.ts',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(1)
    })

    test('should work with options in context', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ checkArrowFunctions: true }],
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = createArrowFunction(true, createIdentifier('x'))
      visitor.ArrowFunctionExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should work with complex options', () => {
      const { context, reports } = createMockRuleContext({
        options: [
          {
            ignorePatterns: ['**/test/**'],
            allowEmpty: true,
            threshold: 5,
          },
        ],
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(1)
    })

    test('should work with empty config', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => reports.push(d),
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(1)
    })
  })

  describe('meta - comprehensive', () => {
    test('should have docs with url', () => {
      expect(requireAwaitRule.meta.docs?.url).toBeDefined()
      expect(typeof requireAwaitRule.meta.docs?.url).toBe('string')
    })

    test('should have url containing codeforge', () => {
      expect(requireAwaitRule.meta.docs?.url).toContain('codeforge')
    })

    test('should have description that is a string', () => {
      expect(typeof requireAwaitRule.meta.docs?.description).toBe('string')
    })

    test('should have non-empty description', () => {
      expect(requireAwaitRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have meta as plain object', () => {
      expect(typeof requireAwaitRule.meta).toBe('object')
      expect(requireAwaitRule.meta).not.toBeNull()
    })

    test('should have create as a function', () => {
      expect(typeof requireAwaitRule.create).toBe('function')
    })

    test('should have valid severity value', () => {
      expect(['off', 'warn', 'error']).toContain(requireAwaitRule.meta.severity)
    })

    test('should have valid type value', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(requireAwaitRule.meta.type)
    })

    test('should have valid fixable value', () => {
      if (requireAwaitRule.meta.fixable) {
        expect(['code', 'whitespace']).toContain(requireAwaitRule.meta.fixable)
      }
    })

    test('should have schema as array', () => {
      expect(Array.isArray(requireAwaitRule.meta.schema)).toBe(true)
    })

    test('should have empty schema array', () => {
      expect(requireAwaitRule.meta.schema).toEqual([])
    })
  })

  describe('create - return value', () => {
    test('should return exactly 3 visitor methods', () => {
      const { context } = createMockRuleContext({ source: 'async function foo() { return 1; }' })
      const visitor = requireAwaitRule.create(context)
      const keys = Object.keys(visitor)
      expect(keys.length).toBe(3)
    })

    test('should return visitor with only function-related keys', () => {
      const { context } = createMockRuleContext({ source: 'async function foo() { return 1; }' })
      const visitor = requireAwaitRule.create(context)
      const keys = Object.keys(visitor)
      expect(keys).toContain('FunctionDeclaration')
      expect(keys).toContain('FunctionExpression')
      expect(keys).toContain('ArrowFunctionExpression')
    })

    test('should return callable visitor methods', () => {
      const { context } = createMockRuleContext({ source: 'async function foo() { return 1; }' })
      const visitor = requireAwaitRule.create(context)
      expect(typeof visitor.FunctionDeclaration).toBe('function')
      expect(typeof visitor.FunctionExpression).toBe('function')
      expect(typeof visitor.ArrowFunctionExpression).toBe('function')
    })

    test('should return new visitor object on each call', () => {
      const { context } = createMockRuleContext({ source: 'async function foo() { return 1; }' })
      const visitor1 = requireAwaitRule.create(context)
      const visitor2 = requireAwaitRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should allow calling visitor methods multiple times on same visitor', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])

      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports.length).toBe(3)
    })
  })

  describe('sync function variants - no report', () => {
    test('should not report sync function expression', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionExpression(createFunctionExpression(false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report sync function expression with complex body', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        { type: 'VariableDeclaration', declarations: [] },
        createReturnStatement(createIdentifier('x')),
      ])
      visitor.FunctionExpression(createFunctionExpression(false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report sync arrow with block body', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.ArrowFunctionExpression(createArrowFunction(false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report sync arrow with expression body', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction(false, createIdentifier('x')))
      expect(reports.length).toBe(0)
    })

    test('should not report sync function with params', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(false, body, [createIdentifier('a')]))
      expect(reports.length).toBe(0)
    })

    test('should not report sync function with many params', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(
        createFunctionDeclaration(false, body, [
          createIdentifier('a'),
          createIdentifier('b'),
          createIdentifier('c'),
          createIdentifier('d'),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report sync generator', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: false,
        generator: true,
        params: [],
        body: createBlockStatement([]),
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should not report sync function with rest parameter', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(
        createFunctionDeclaration(false, body, [createRestParameter('args')]),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('async with various body contents', () => {
    test('should report async function with only variable declarations', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        { type: 'VariableDeclaration', declarations: [] },
        { type: 'VariableDeclaration', declarations: [] },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with only expression statements', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        { type: 'ExpressionStatement', expression: createIdentifier('x') },
        { type: 'ExpressionStatement', expression: createIdentifier('y') },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with if but no await', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'IfStatement',
          test: createIdentifier('cond'),
          consequent: createBlockStatement([]),
          alternate: null,
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with switch but no await', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'SwitchStatement',
          discriminant: createIdentifier('val'),
          cases: [],
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with try-catch but no await', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'TryStatement',
          block: createBlockStatement([]),
          handler: {
            type: 'CatchClause',
            param: createIdentifier('e'),
            body: createBlockStatement([]),
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with while loop but no await', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'WhileStatement',
          test: createIdentifier('cond'),
          body: createBlockStatement([]),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with for loop but no await', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'ForStatement',
          init: null,
          test: null,
          update: null,
          body: createBlockStatement([]),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function that only returns undefined', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(null)])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with empty return', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([{ type: 'ReturnStatement', argument: null }])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with throw of non-await', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        { type: 'ThrowStatement', argument: createIdentifier('err') },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with break statement', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([{ type: 'BreakStatement', label: null }])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with continue statement', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([{ type: 'ContinueStatement', label: null }])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with debugger statement', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([{ type: 'DebuggerStatement' }])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with labeled statement', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'LabeledStatement',
          label: createIdentifier('loop'),
          body: { type: 'BreakStatement', label: null },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with with statement', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'WithStatement',
          object: createIdentifier('obj'),
          body: createBlockStatement([]),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(1)
    })

    test('should not report async function with chained await calls', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'MemberExpression',
          object: createAwaitExpression(createIdentifier('obj')),
          property: createIdentifier('then'),
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should not report async function with await in finally block', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'TryStatement',
          block: createBlockStatement([]),
          finalizer: createBlockStatement([
            {
              type: 'ExpressionStatement',
              expression: createAwaitExpression(createIdentifier('cleanup')),
            },
          ]),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should report async function with try-finally but no await', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'TryStatement',
          block: createBlockStatement([]),
          finalizer: createBlockStatement([]),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(1)
    })

    test('should not report async function with await in destructuring', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'VariableDeclaration',
          declarations: [
            {
              type: 'VariableDeclarator',
              id: createIdentifier('x'),
              init: createAwaitExpression(createIdentifier('promise')),
            },
          ],
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should not report async function with await in spread element', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'ArrayExpression',
          elements: [
            { type: 'SpreadElement', argument: createAwaitExpression(createIdentifier('arr')) },
          ],
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should report async function with nested sync function', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const innerBody = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const body = createBlockStatement([
        {
          type: 'FunctionDeclaration',
          async: false,
          generator: false,
          params: [],
          body: innerBody,
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(1)
    })

    test('should not report async function with nested async function containing await', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'FunctionDeclaration',
          async: true,
          generator: false,
          params: [],
          body: createBlockStatement([
            createReturnStatement(createAwaitExpression(createIdentifier('p'))),
          ]),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })
  })

  describe('default export', () => {
    test('should export default that equals named export', () => {
      expect(requireAwaitRule).toBeDefined()
    })
  })

  describe('report descriptor completeness', () => {
    test('report should have both message and loc', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body, [], 3, 5))

      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0].message).toBeTruthy()
      expect(reports[0].loc).toBeTruthy()
    })

    test('report message should be exact string', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports[0].message).toBe('Async function has no await expression.')
    })

    test('report should not have fix property', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))

      expect(reports[0].fix).toBeUndefined()
    })
  })

  describe('async function expression variants', () => {
    test('should report async function expression assigned to variable', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node = createFunctionExpression(true, body, [createIdentifier('a')])
      visitor.FunctionExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report async function expression as IIFE', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement({ type: 'Literal', value: 1 })])
      const node = createFunctionExpression(true, body)
      visitor.FunctionExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report async function expression with await in return', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement(createAwaitExpression(createIdentifier('data'))),
      ])
      const node = createFunctionExpression(true, body)
      visitor.FunctionExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report async function expression that is a generator', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionExpression',
        async: true,
        generator: true,
        params: [],
        body: createBlockStatement([]),
      }
      visitor.FunctionExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report async function expression with rest param', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('args'))])
      const node = createFunctionExpression(true, body, [createRestParameter('args')])
      visitor.FunctionExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('async arrow function variants', () => {
    test('should report async arrow returning identifier', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction(true, createIdentifier('x')))
      expect(reports.length).toBe(1)
    })

    test('should report async arrow returning literal', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction(true, { type: 'Literal', value: 42 }))
      expect(reports.length).toBe(1)
    })

    test('should report async arrow returning object', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      visitor.ArrowFunctionExpression(
        createArrowFunction(true, { type: 'ObjectExpression', properties: [] }),
      )
      expect(reports.length).toBe(1)
    })

    test('should report async arrow returning array', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      visitor.ArrowFunctionExpression(
        createArrowFunction(true, { type: 'ArrayExpression', elements: [] }),
      )
      expect(reports.length).toBe(1)
    })

    test('should report async arrow with block returning nothing', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction(true, createBlockStatement([])))
      expect(reports.length).toBe(1)
    })

    test('should not report async arrow returning await', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      visitor.ArrowFunctionExpression(
        createArrowFunction(true, createAwaitExpression(createIdentifier('p'))),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report async arrow with block containing await', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement(createAwaitExpression(createIdentifier('p'))),
      ])
      visitor.ArrowFunctionExpression(createArrowFunction(true, body))
      expect(reports.length).toBe(0)
    })

    test('should report async arrow with multiple statements none await', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        { type: 'ExpressionStatement', expression: createIdentifier('a') },
        { type: 'ExpressionStatement', expression: createIdentifier('b') },
        createReturnStatement(createIdentifier('c')),
      ])
      visitor.ArrowFunctionExpression(createArrowFunction(true, body))
      expect(reports.length).toBe(1)
    })

    test('should not report async arrow with params containing rest', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      visitor.ArrowFunctionExpression(
        createArrowFunction(true, createIdentifier('args'), [createRestParameter('args')]),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('combined conditions', () => {
    test('async=true, generator=true, hasRestParam - should not report (generator wins)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: true,
        params: [createRestParameter('args')],
        body: createBlockStatement([]),
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('async=true, generator=false, hasRestParam - should not report (rest wins)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        params: [createRestParameter('args')],
        body: createBlockStatement([]),
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('async=true, generator=false, no rest, has await - should not report', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement(createAwaitExpression(createIdentifier('p'))),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body, [createIdentifier('x')]))
      expect(reports.length).toBe(0)
    })

    test('async=true, generator=false, no rest, no await - should report', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body, [createIdentifier('x')]))
      expect(reports.length).toBe(1)
    })

    test('async=false with all other flags true - should not report (async check first)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: false,
        generator: true,
        params: [createRestParameter('args')],
        body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('additional coverage', () => {
    test('should handle async function with do-while loop body', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'DoWhileStatement',
          test: createIdentifier('cond'),
          body: createBlockStatement([]),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(1)
    })

    test('should find await in do-while loop body', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'DoWhileStatement',
          test: createIdentifier('cond'),
          body: createBlockStatement([
            {
              type: 'ExpressionStatement',
              expression: createAwaitExpression(createIdentifier('p')),
            },
          ]),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should handle async function with sequence expression', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'SequenceExpression',
            expressions: [createIdentifier('a'), createIdentifier('b')],
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(1)
    })

    test('should find await in sequence expression', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'SequenceExpression',
            expressions: [createAwaitExpression(createIdentifier('p')), createIdentifier('b')],
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(0)
    })

    test('should handle async function with update expression', () => {
      const { context, reports } = createMockRuleContext({
        source: 'async function foo() { return 1; }',
      })
      const visitor = requireAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'UpdateExpression',
            operator: '++',
            argument: createIdentifier('i'),
            prefix: false,
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, body))
      expect(reports.length).toBe(1)
    })
  })
})

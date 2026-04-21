import { describe, test, expect } from 'vitest'
import { noAsyncWithoutAwaitRule } from '../../../../src/rules/patterns/no-async-without-await.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

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
  describe('meta properties', () => {
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

    test('should have schema defined as empty array', () => {
      expect(noAsyncWithoutAwaitRule.meta.schema).toEqual([])
    })

    test('should be fixable as code', () => {
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

    test('should have docs property', () => {
      expect(noAsyncWithoutAwaitRule.meta.docs).toBeDefined()
    })

    test('should have a non-empty description', () => {
      expect(noAsyncWithoutAwaitRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have type property as string', () => {
      expect(typeof noAsyncWithoutAwaitRule.meta.type).toBe('string')
    })

    test('should have severity property as string', () => {
      expect(typeof noAsyncWithoutAwaitRule.meta.severity).toBe('string')
    })

    test('should have fixable property as string', () => {
      expect(typeof noAsyncWithoutAwaitRule.meta.fixable).toBe('string')
    })

    test('should have category in docs', () => {
      expect(typeof noAsyncWithoutAwaitRule.meta.docs?.category).toBe('string')
    })

    test('should have url in docs', () => {
      expect(typeof noAsyncWithoutAwaitRule.meta.docs?.url).toBe('string')
    })

    test('should have recommended as boolean false', () => {
      expect(noAsyncWithoutAwaitRule.meta.docs?.recommended).toBeTypeOf('boolean')
    })

    test('should not be deprecated', () => {
      expect(noAsyncWithoutAwaitRule.meta.deprecated).toBeFalsy()
    })

    test('should not require type checking', () => {
      expect(noAsyncWithoutAwaitRule.meta.requiresTypeChecking).toBeFalsy()
    })

    test('should have valid RuleDefinition shape with meta and create', () => {
      expect(noAsyncWithoutAwaitRule.meta).toBeDefined()
      expect(noAsyncWithoutAwaitRule.create).toBeDefined()
      expect(typeof noAsyncWithoutAwaitRule.create).toBe('function')
    })
  })

  describe('create / visitor', () => {
    test('should return visitor object with FunctionDeclaration', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      expect(visitor).toHaveProperty('FunctionDeclaration')
    })

    test('should return visitor object with FunctionExpression', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      expect(visitor).toHaveProperty('FunctionExpression')
    })

    test('should return visitor object with ArrowFunctionExpression', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      expect(visitor).toHaveProperty('ArrowFunctionExpression')
    })

    test('should create visitor where FunctionDeclaration is a function', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      expect(typeof visitor.FunctionDeclaration).toBe('function')
    })

    test('should create visitor where FunctionExpression is a function', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      expect(typeof visitor.FunctionExpression).toBe('function')
    })

    test('should create visitor where ArrowFunctionExpression is a function', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      expect(typeof visitor.ArrowFunctionExpression).toBe('function')
    })

    test('should return exactly three visitor keys', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      expect(Object.keys(visitor)).toHaveLength(3)
    })

    test('should return a new visitor instance per create call', () => {
      const { context } = createMockRuleContext()
      const visitor1 = noAsyncWithoutAwaitRule.create(context)
      const visitor2 = noAsyncWithoutAwaitRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('detecting async functions without await', () => {
    test('should report async function declaration without await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Async function has no await expression.')
    })

    test('should report async function expression without await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionExpression(createFunctionExpression(true, false, body))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Async function has no await expression.')
    })

    test('should report async arrow function without await (expression body)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction(true, createIdentifier('x')))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Async function has no await expression.')
    })

    test('should report async arrow function with block body but no await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.ArrowFunctionExpression(createArrowFunction(true, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with only synchronous operations', () => {
      const { context, reports } = createMockRuleContext()
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
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with only regular for-of loop', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createForOfStatement(createIdentifier('item'), createIdentifier('array')),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function expression with empty body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionExpression(createFunctionExpression(true, false, createBlockStatement([])))
      expect(reports.length).toBe(1)
    })

    test('should report async arrow function with literal body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction(true, { type: 'Literal', value: 42 }))
      expect(reports.length).toBe(1)
    })

    test('should report async function with only a throw statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'ThrowStatement',
          argument: { type: 'NewExpression', callee: createIdentifier('Error'), arguments: [] },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with try-catch but no await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'TryStatement',
          block: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
          handler: {
            type: 'CatchClause',
            param: createIdentifier('e'),
            body: createBlockStatement([]),
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with if-else but no await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'IfStatement',
          test: createIdentifier('cond'),
          consequent: createBlockStatement([createReturnStatement(createIdentifier('a'))]),
          alternate: createBlockStatement([createReturnStatement(createIdentifier('b'))]),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with while loop but no await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'WhileStatement',
          test: createIdentifier('cond'),
          body: createBlockStatement([]),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with switch but no await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'SwitchStatement',
          discriminant: createIdentifier('x'),
          cases: [{ type: 'SwitchCase', test: { type: 'Literal', value: 1 }, consequent: [] }],
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with for loop but no await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'ForStatement',
          init: null,
          test: createIdentifier('cond'),
          update: null,
          body: createBlockStatement([]),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with multiple synchronous statements', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'ExpressionStatement',
          expression: { type: 'CallExpression', callee: createIdentifier('a'), arguments: [] },
        },
        {
          type: 'ExpressionStatement',
          expression: { type: 'CallExpression', callee: createIdentifier('b'), arguments: [] },
        },
        createReturnStatement(createIdentifier('c')),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with assignment expression but no await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'AssignmentExpression',
            operator: '=',
            left: createIdentifier('x'),
            right: { type: 'Literal', value: 10 },
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with ternary expression but no await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'ConditionalExpression',
          test: createIdentifier('cond'),
          consequent: createIdentifier('a'),
          alternate: createIdentifier('b'),
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with do-while but no await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'DoWhileStatement',
          test: createIdentifier('cond'),
          body: createBlockStatement([]),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with template literal return but no await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'TemplateLiteral',
          quasis: [{ type: 'TemplateElement', value: { raw: 'hello ', cooked: 'hello ' } }],
          expressions: [createIdentifier('name')],
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async arrow returning object literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.ArrowFunctionExpression(
        createArrowFunction(true, {
          type: 'ObjectExpression',
          properties: [
            {
              type: 'Property',
              key: createIdentifier('a'),
              value: { type: 'Literal', value: 1 },
              kind: 'init',
            },
          ],
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('should report async function with labeled statement but no await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'LabeledStatement',
          label: createIdentifier('loop'),
          body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with sequence expression but no await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'SequenceExpression',
          expressions: [createIdentifier('a'), createIdentifier('b')],
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with logical expression but no await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'LogicalExpression',
          operator: '&&',
          left: createIdentifier('a'),
          right: createIdentifier('b'),
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with binary expression but no await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'BinaryExpression',
          operator: '+',
          left: createIdentifier('a'),
          right: createIdentifier('b'),
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with unary expression but no await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'UnaryExpression',
          operator: '!',
          argument: createIdentifier('x'),
          prefix: true,
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with update expression but no await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'UpdateExpression',
            operator: '++',
            argument: createIdentifier('x'),
            prefix: false,
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with new expression but no await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'NewExpression',
          callee: createIdentifier('MyClass'),
          arguments: [],
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with member expression but no await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'MemberExpression',
          object: createIdentifier('obj'),
          property: createIdentifier('prop'),
          computed: false,
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with spread element but no await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'ArrayExpression',
          elements: [{ type: 'SpreadElement', argument: createIdentifier('arr') }],
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with typeof expression but no await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: createIdentifier('x'),
          prefix: true,
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with delete expression but no await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'UnaryExpression',
            operator: 'delete',
            argument: {
              type: 'MemberExpression',
              object: createIdentifier('obj'),
              property: createIdentifier('prop'),
              computed: false,
            },
            prefix: true,
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with void expression but no await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'UnaryExpression',
          operator: 'void',
          argument: { type: 'Literal', value: 0 },
          prefix: true,
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting valid async functions', () => {
    test('should not report sync function declaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(false, false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report sync arrow function', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction(false, createIdentifier('x')))
      expect(reports.length).toBe(0)
    })

    test('should not report sync function expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionExpression(createFunctionExpression(false, false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report async function with await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement(createAwaitExpression(createIdentifier('promise'))),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report async function with nested await in call expression', () => {
      const { context, reports } = createMockRuleContext()
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
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report async arrow function with await expression body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.ArrowFunctionExpression(
        createArrowFunction(true, createAwaitExpression(createIdentifier('promise'))),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report async generator function declaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration(true, true, createBlockStatement([])))
      expect(reports.length).toBe(0)
    })

    test('should not report async generator function expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionExpression(createFunctionExpression(true, true, createBlockStatement([])))
      expect(reports.length).toBe(0)
    })

    test('should not report async generator with await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement(createAwaitExpression(createIdentifier('promise'))),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, true, body))
      expect(reports.length).toBe(0)
    })

    test('should not report async function with for-await-of at top level', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createForAwaitStatement(createIdentifier('item'), createIdentifier('asyncIterable')),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report async function with nested for-await-of', () => {
      const { context, reports } = createMockRuleContext()
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
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report sync function with for-await-of', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createForAwaitStatement(createIdentifier('item'), createIdentifier('asyncIterable')),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(false, false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report async function with await in array expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'ArrayExpression',
          elements: [
            createAwaitExpression(createIdentifier('p1')),
            createAwaitExpression(createIdentifier('p2')),
          ],
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report async function with await in object property value', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'ObjectExpression',
          properties: [
            {
              type: 'Property',
              key: createIdentifier('result'),
              value: createAwaitExpression(createIdentifier('p')),
              kind: 'init',
            },
          ],
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report async function with await in conditional expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'ConditionalExpression',
          test: createIdentifier('cond'),
          consequent: createAwaitExpression(createIdentifier('a')),
          alternate: createIdentifier('b'),
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report async function with await in logical expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'LogicalExpression',
          operator: '||',
          left: createAwaitExpression(createIdentifier('a')),
          right: createIdentifier('b'),
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report async function with await in try block', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'TryStatement',
          block: createBlockStatement([
            {
              type: 'ExpressionStatement',
              expression: createAwaitExpression(createIdentifier('p')),
            },
          ]),
          handler: {
            type: 'CatchClause',
            param: createIdentifier('e'),
            body: createBlockStatement([]),
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report async function with await in catch block', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'TryStatement',
          block: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
          handler: {
            type: 'CatchClause',
            param: createIdentifier('e'),
            body: createBlockStatement([
              {
                type: 'ExpressionStatement',
                expression: createAwaitExpression(createIdentifier('retry')),
              },
            ]),
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report async function with await in if consequent', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'IfStatement',
          test: createIdentifier('cond'),
          consequent: createBlockStatement([
            {
              type: 'ExpressionStatement',
              expression: createAwaitExpression(createIdentifier('p')),
            },
          ]),
          alternate: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report async function with await in while loop', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'WhileStatement',
          test: createIdentifier('cond'),
          body: createBlockStatement([
            {
              type: 'ExpressionStatement',
              expression: createAwaitExpression(createIdentifier('p')),
            },
          ]),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report async function with await in switch case', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'SwitchStatement',
          discriminant: createIdentifier('x'),
          cases: [
            {
              type: 'SwitchCase',
              test: { type: 'Literal', value: 1 },
              consequent: [
                {
                  type: 'ExpressionStatement',
                  expression: createAwaitExpression(createIdentifier('p')),
                },
              ],
            },
          ],
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report async function expression with await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement(createAwaitExpression(createIdentifier('p'))),
      ])
      visitor.FunctionExpression(createFunctionExpression(true, false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report async arrow with block and await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement(createAwaitExpression(createIdentifier('p'))),
      ])
      visitor.ArrowFunctionExpression(createArrowFunction(true, body))
      expect(reports.length).toBe(0)
    })

    test('should not report async function with for-await-of inside for loop body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'ForStatement',
          init: null,
          test: createIdentifier('cond'),
          update: null,
          body: createBlockStatement([
            createForAwaitStatement(createIdentifier('item'), createIdentifier('iter')),
          ]),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report async function with await in nested member expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'MemberExpression',
            object: createAwaitExpression(createIdentifier('p')),
            property: createIdentifier('data'),
            computed: false,
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report async function with await in spread element', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'ArrayExpression',
          elements: [
            { type: 'SpreadElement', argument: createAwaitExpression(createIdentifier('p')) },
          ],
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report async function with await in template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'TemplateLiteral',
          quasis: [{ type: 'TemplateElement', value: { raw: 'hello ', cooked: 'hello ' } }],
          expressions: [createAwaitExpression(createIdentifier('namePromise'))],
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report async function with await in assignment right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'AssignmentExpression',
            operator: '=',
            left: createIdentifier('x'),
            right: createAwaitExpression(createIdentifier('p')),
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report async function with await in do-while body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
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
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report async function with await in labeled statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'LabeledStatement',
          label: createIdentifier('label'),
          body: createBlockStatement([
            {
              type: 'ExpressionStatement',
              expression: createAwaitExpression(createIdentifier('p')),
            },
          ]),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report async function with chained member call including await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: createAwaitExpression(createIdentifier('p')),
              property: createIdentifier('then'),
              computed: false,
            },
            arguments: [createIdentifier('cb')],
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report async function with for-await-of in nested if', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'IfStatement',
          test: createIdentifier('cond'),
          consequent: createBlockStatement([
            createForAwaitStatement(createIdentifier('x'), createIdentifier('iter')),
          ]),
          alternate: null,
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
    })

    test('should handle string node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      expect(() => visitor.FunctionDeclaration('string')).not.toThrow()
    })

    test('should handle number node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      expect(() => visitor.FunctionDeclaration(123)).not.toThrow()
    })

    test('should handle boolean node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      expect(() => visitor.FunctionDeclaration(true)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext()
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

    test('should handle node without body', () => {
      const { context } = createMockRuleContext()
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
      const { context, reports } = createMockRuleContext()
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

    test('should handle empty block statement body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, createBlockStatement([])))
      expect(reports.length).toBe(1)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionDeclaration(
        createFunctionDeclaration(
          true,
          false,
          createBlockStatement([createReturnStatement(createIdentifier('x'))]),
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle node with null async property', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: null,
        generator: false,
        params: [],
        body: createBlockStatement([]),
      }
      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
    })

    test('should handle node with async as string "true"', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: 'true',
        generator: false,
        params: [],
        body: createBlockStatement([]),
      }
      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
    })

    test('should handle node with async as number 1', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: 1,
        generator: false,
        params: [],
        body: createBlockStatement([]),
      }
      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
    })

    test('should handle node with generator as string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: 'true',
        params: [],
        body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc (only start)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        params: [],
        body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
        loc: {
          start: { line: 5, column: 2 },
        },
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node with empty object body', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        params: [],
        body: {},
      }
      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
    })

    test('should handle node with body as null', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        params: [],
        body: null,
      }
      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
    })

    test('should handle FunctionExpression with null node', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      expect(() => visitor.FunctionExpression(null)).not.toThrow()
    })

    test('should handle ArrowFunctionExpression with null node', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      expect(() => visitor.ArrowFunctionExpression(null)).not.toThrow()
    })

    test('should handle deeply nested synchronous operations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'IfStatement',
          test: {
            type: 'BinaryExpression',
            operator: '>',
            left: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: createIdentifier('arr'),
                property: createIdentifier('length'),
                computed: false,
              },
              arguments: [],
            },
            right: { type: 'Literal', value: 0 },
          },
          consequent: createBlockStatement([
            createReturnStatement({
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: createIdentifier('fn'),
                arguments: [createIdentifier('x')],
              },
              property: createIdentifier('value'),
              computed: false,
            }),
          ]),
          alternate: null,
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should handle node where body contains circular-like reference (same identifiers)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const id = createIdentifier('ref')
      const body = createBlockStatement([
        createReturnStatement(id),
        { type: 'ExpressionStatement', expression: id },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should handle arrow function with params but no body', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const node = {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [createIdentifier('x')],
      }
      expect(() => visitor.ArrowFunctionExpression(node)).not.toThrow()
    })

    test('should handle node with extra unknown properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        params: [],
        body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        id: createIdentifier('myFunc'),
        extraProp: 'ignored',
        anotherExtra: 42,
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should handle FunctionExpression with undefined node', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      expect(() => visitor.FunctionExpression(undefined)).not.toThrow()
    })

    test('should handle ArrowFunctionExpression with undefined node', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      expect(() => visitor.ArrowFunctionExpression(undefined)).not.toThrow()
    })
  })

  describe('location reporting', () => {
    test('should report correct start line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body, [], 42, 10))
      expect(reports[0].loc?.start.line).toBe(42)
    })

    test('should report correct start column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body, [], 1, 5))
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct end line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body, [], 7, 3))
      expect(reports[0].loc?.end.line).toBe(7)
    })

    test('should report correct end column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body, [], 1, 8))
      expect(reports[0].loc?.end.column).toBe(28)
    })

    test('should report default location for node without loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
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

    test('should report location for FunctionExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionExpression(createFunctionExpression(true, false, body, [], 15, 20))
      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report location for ArrowFunctionExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction(true, createIdentifier('x'), [], 30, 5))
      expect(reports[0].loc?.start.line).toBe(30)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location at line 0 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body, [], 0, 0))
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location with large line numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body, [], 9999, 50))
      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should provide both start and end in loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body, [], 3, 10))
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should preserve loc with params', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const params = [createIdentifier('a'), createIdentifier('b')]
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body, params, 10, 0))
      expect(reports[0].loc?.start.line).toBe(10)
    })

    test('should handle node with loc containing non-numeric values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        params: [],
        body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
        loc: {
          start: { line: 'abc', column: 'def' },
          end: { line: 'ghi', column: 'jkl' },
        },
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle node with loc containing undefined values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        params: [],
        body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
        loc: {
          start: { line: undefined, column: undefined },
          end: { line: undefined, column: undefined },
        },
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node with loc.start as null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        params: [],
        body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
        loc: { start: null, end: null },
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should report correct location for multiple separate nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])

      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body, [], 5, 0))
      visitor.FunctionExpression(createFunctionExpression(true, false, body, [], 10, 4))
      visitor.ArrowFunctionExpression(createArrowFunction(true, createIdentifier('x'), [], 20, 8))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.line).toBe(10)
      expect(reports[2].loc?.start.line).toBe(20)
    })
  })

  describe('message quality', () => {
    test('should have exact message text', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionDeclaration(
        createFunctionDeclaration(
          true,
          false,
          createBlockStatement([createReturnStatement(createIdentifier('x'))]),
        ),
      )
      expect(reports[0].message).toBe('Async function has no await expression.')
    })

    test('should use same message for FunctionDeclaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, createBlockStatement([])))
      expect(reports[0].message).toBe('Async function has no await expression.')
    })

    test('should use same message for FunctionExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionExpression(createFunctionExpression(true, false, createBlockStatement([])))
      expect(reports[0].message).toBe('Async function has no await expression.')
    })

    test('should use same message for ArrowFunctionExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction(true, createIdentifier('x')))
      expect(reports[0].message).toBe('Async function has no await expression.')
    })

    test('should have consistent messages across all function types', () => {
      const { context, reports } = createMockRuleContext()
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

    test('message should end with a period', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, createBlockStatement([])))
      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('message should mention async', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, createBlockStatement([])))
      expect(reports[0].message.toLowerCase()).toContain('async')
    })

    test('message should mention await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, createBlockStatement([])))
      expect(reports[0].message.toLowerCase()).toContain('await')
    })

    test('message should not be empty', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, createBlockStatement([])))
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('message should be a string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, createBlockStatement([])))
      expect(typeof reports[0].message).toBe('string')
    })
  })

  describe('multiple reports', () => {
    test('should report once per async function declaration without await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report separately for multiple async functions without await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body, [], 5, 0))
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body, [], 10, 0))
      expect(reports.length).toBe(3)
    })

    test('should report separately for mixed function types without await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      visitor.FunctionExpression(createFunctionExpression(true, false, body))
      visitor.ArrowFunctionExpression(createArrowFunction(true, createIdentifier('x')))
      expect(reports.length).toBe(3)
    })

    test('should not report for sync functions mixed with async', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(false, false, body))
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report correct number when mixing valid and invalid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const noAwaitBody = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const awaitBody = createBlockStatement([
        createReturnStatement(createAwaitExpression(createIdentifier('p'))),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, noAwaitBody))
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, awaitBody))
      visitor.FunctionExpression(createFunctionExpression(true, false, noAwaitBody))
      visitor.ArrowFunctionExpression(
        createArrowFunction(true, createAwaitExpression(createIdentifier('p'))),
      )
      expect(reports.length).toBe(2)
    })

    test('should report for each async arrow function individually', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction(true, createIdentifier('a')))
      visitor.ArrowFunctionExpression(createArrowFunction(true, createIdentifier('b')))
      visitor.ArrowFunctionExpression(createArrowFunction(true, createIdentifier('c')))
      expect(reports.length).toBe(3)
    })

    test('should handle same visitor called multiple times with same node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const node = createFunctionDeclaration(
        true,
        false,
        createBlockStatement([createReturnStatement(createIdentifier('x'))]),
      )
      visitor.FunctionDeclaration(node)
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(2)
    })

    test('should report multiple async function expressions without await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionExpression(createFunctionExpression(true, false, body))
      visitor.FunctionExpression(createFunctionExpression(true, false, body))
      expect(reports.length).toBe(2)
    })

    test('should correctly count with generators mixed in', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      visitor.FunctionDeclaration(createFunctionDeclaration(true, true, body))
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(2)
    })

    test('should handle sequential visitor calls with alternating valid/invalid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const noAwait = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const withAwait = createBlockStatement([
        createReturnStatement(createAwaitExpression(createIdentifier('p'))),
      ])
      for (let i = 0; i < 5; i++) {
        visitor.FunctionDeclaration(createFunctionDeclaration(true, false, noAwait))
        visitor.FunctionDeclaration(createFunctionDeclaration(true, false, withAwait))
      }
      expect(reports.length).toBe(5)
    })
  })

  describe('context and options handling', () => {
    test('should work with empty options object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionDeclaration(
        createFunctionDeclaration(
          true,
          false,
          createBlockStatement([createReturnStatement(createIdentifier('x'))]),
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('should work with options containing unknown properties', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ checkArrowFunctions: true }],
      })
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionDeclaration(
        createFunctionDeclaration(
          true,
          false,
          createBlockStatement([createReturnStatement(createIdentifier('x'))]),
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ filePath: '/custom/path.ts' })
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionDeclaration(
        createFunctionDeclaration(
          true,
          false,
          createBlockStatement([createReturnStatement(createIdentifier('x'))]),
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('should work with different source content', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = async () => 1' })
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction(true, createIdentifier('x')))
      expect(reports.length).toBe(1)
    })

    test('should use fresh reports array for each context', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()
      const visitor1 = noAsyncWithoutAwaitRule.create(ctx1)
      const visitor2 = noAsyncWithoutAwaitRule.create(ctx2)
      visitor1.FunctionDeclaration(createFunctionDeclaration(true, false, createBlockStatement([])))
      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
      visitor2.FunctionDeclaration(createFunctionDeclaration(true, false, createBlockStatement([])))
      expect(r2.length).toBe(1)
    })

    test('should handle context with workspace root', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, createBlockStatement([])))
      expect(reports.length).toBe(1)
    })

    test('should handle multiple create calls with same context', () => {
      const { context, reports } = createMockRuleContext()
      const visitor1 = noAsyncWithoutAwaitRule.create(context)
      const visitor2 = noAsyncWithoutAwaitRule.create(context)
      visitor1.FunctionDeclaration(createFunctionDeclaration(true, false, createBlockStatement([])))
      visitor2.FunctionDeclaration(createFunctionDeclaration(true, false, createBlockStatement([])))
      expect(reports.length).toBe(2)
    })

    test('should not be affected by extra config options', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ someExtra: 'value', another: 42 }],
      })
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, createBlockStatement([])))
      expect(reports.length).toBe(1)
    })

    test('should work with empty source string', () => {
      const { context, reports } = createMockRuleContext({ source: '' })
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, createBlockStatement([])))
      expect(reports.length).toBe(1)
    })

    test('should work regardless of logger implementation', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionDeclaration(
        createFunctionDeclaration(
          true,
          false,
          createBlockStatement([createReturnStatement(createIdentifier('x'))]),
        ),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('nested function handling', () => {
    test('should not count await in nested async FunctionDeclaration', () => {
      const { context, reports } = createMockRuleContext()
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
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, outerBody))
      expect(reports.length).toBe(1)
    })

    test('should not count await in nested async arrow function', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const nestedNode = createArrowFunction(true, createAwaitExpression(createIdentifier('p')))
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
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, outerBody))
      expect(reports.length).toBe(1)
    })

    test('should not count await in nested async FunctionExpression', () => {
      const { context, reports } = createMockRuleContext()
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
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, outerBody))
      expect(reports.length).toBe(1)
    })

    test('should report outer async function when nested sync function has no await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const nestedNode = createArrowFunction(false, createIdentifier('x'))
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
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, outerBody))
      expect(reports.length).toBe(1)
    })

    test('should report when nested function is async but outer is also async without own await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const nestedBody = createBlockStatement([
        createReturnStatement(createAwaitExpression(createIdentifier('p'))),
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
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, outerBody))
      expect(reports.length).toBe(1)
    })

    test('should not report outer async function when it has own await', () => {
      const { context, reports } = createMockRuleContext()
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
        createReturnStatement(createAwaitExpression(createIdentifier('outerP'))),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, outerBody))
      expect(reports.length).toBe(0)
    })

    test('should not count for-await-of in nested function', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const nestedBody = createBlockStatement([
        createForAwaitStatement(createIdentifier('x'), createIdentifier('iter')),
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
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, outerBody))
      expect(reports.length).toBe(1)
    })

    test('should handle deeply nested functions', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const innerNode = createArrowFunction(true, createAwaitExpression(createIdentifier('p')))
      const middleBody = createBlockStatement([
        {
          type: 'VariableDeclaration',
          declarations: [
            {
              type: 'VariableDeclarator',
              id: createIdentifier('inner'),
              init: innerNode,
            },
          ],
        },
      ])
      const middleNode = createFunctionExpression(true, false, middleBody)
      const outerBody = createBlockStatement([
        {
          type: 'VariableDeclaration',
          declarations: [
            {
              type: 'VariableDeclarator',
              id: createIdentifier('mid'),
              init: middleNode,
            },
          ],
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, outerBody))
      expect(reports.length).toBe(1)
    })
  })

  describe('generator functions', () => {
    test('should skip async generator declaration without await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionDeclaration(
        createFunctionDeclaration(
          true,
          true,
          createBlockStatement([createReturnStatement(createIdentifier('x'))]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should skip async generator expression without await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionExpression(
        createFunctionExpression(
          true,
          true,
          createBlockStatement([createReturnStatement(createIdentifier('x'))]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should skip async generator declaration with await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionDeclaration(
        createFunctionDeclaration(
          true,
          true,
          createBlockStatement([
            createReturnStatement(createAwaitExpression(createIdentifier('p'))),
          ]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should report async non-generator with generator: false', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionDeclaration(
        createFunctionDeclaration(
          true,
          false,
          createBlockStatement([createReturnStatement(createIdentifier('x'))]),
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('should not report sync generator function', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionDeclaration(createFunctionDeclaration(false, true, createBlockStatement([])))
      expect(reports.length).toBe(0)
    })
  })

  describe('for-await-of detection', () => {
    test('should detect for-await-of at top level', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionDeclaration(
        createFunctionDeclaration(
          true,
          false,
          createBlockStatement([
            createForAwaitStatement(createIdentifier('item'), createIdentifier('iter')),
          ]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should detect for-await-of nested in if statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionDeclaration(
        createFunctionDeclaration(
          true,
          false,
          createBlockStatement([
            {
              type: 'IfStatement',
              test: createIdentifier('cond'),
              consequent: createBlockStatement([
                createForAwaitStatement(createIdentifier('item'), createIdentifier('iter')),
              ]),
            },
          ]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not detect regular for-of as for-await-of', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionDeclaration(
        createFunctionDeclaration(
          true,
          false,
          createBlockStatement([
            createForOfStatement(createIdentifier('item'), createIdentifier('array')),
          ]),
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect for-await-of in arrow function', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.ArrowFunctionExpression(
        createArrowFunction(
          true,
          createBlockStatement([
            createForAwaitStatement(createIdentifier('item'), createIdentifier('iter')),
          ]),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should detect for-await-of in function expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionExpression(
        createFunctionExpression(
          true,
          false,
          createBlockStatement([
            createForAwaitStatement(createIdentifier('item'), createIdentifier('iter')),
          ]),
        ),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('parameterized: async flag combinations', () => {
    test.each([
      { async: true, generator: false, expected: 1, name: 'async=true generator=false reports' },
      { async: true, generator: true, expected: 0, name: 'async=true generator=true skips' },
      { async: false, generator: false, expected: 0, name: 'async=false generator=false skips' },
      { async: false, generator: true, expected: 0, name: 'async=false generator=true skips' },
    ])('FunctionDeclaration $name', ({ async, generator, expected }) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionDeclaration(
        createFunctionDeclaration(
          async,
          generator,
          createBlockStatement([createReturnStatement(createIdentifier('x'))]),
        ),
      )
      expect(reports.length).toBe(expected)
    })

    test.each([
      { async: true, generator: false, expected: 1, name: 'async=true generator=false reports' },
      { async: true, generator: true, expected: 0, name: 'async=true generator=true skips' },
      { async: false, generator: false, expected: 0, name: 'async=false generator=false skips' },
      { async: false, generator: true, expected: 0, name: 'async=false generator=true skips' },
    ])('FunctionExpression $name', ({ async, generator, expected }) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.FunctionExpression(
        createFunctionExpression(
          async,
          generator,
          createBlockStatement([createReturnStatement(createIdentifier('x'))]),
        ),
      )
      expect(reports.length).toBe(expected)
    })

    test.each([
      { async: true, expected: 1, name: 'async arrow without await reports' },
      { async: false, expected: 0, name: 'sync arrow does not report' },
    ])('ArrowFunctionExpression $name', ({ async, expected }) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction(async, createIdentifier('x')))
      expect(reports.length).toBe(expected)
    })
  })

  describe('parameterized: body types for async functions', () => {
    test.each([
      { bodyDesc: 'empty block', body: createBlockStatement([]), expected: 1 },
      {
        bodyDesc: 'block with return identifier',
        body: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
        expected: 1,
      },
      {
        bodyDesc: 'block with literal return',
        body: createBlockStatement([createReturnStatement({ type: 'Literal', value: 42 })]),
        expected: 1,
      },
      {
        bodyDesc: 'block with await',
        body: createBlockStatement([
          createReturnStatement(createAwaitExpression(createIdentifier('p'))),
        ]),
        expected: 0,
      },
      {
        bodyDesc: 'block with for-await-of',
        body: createBlockStatement([
          createForAwaitStatement(createIdentifier('x'), createIdentifier('iter')),
        ]),
        expected: 0,
      },
      { bodyDesc: 'identifier expression (arrow)', body: createIdentifier('x'), expected: 1 },
      {
        bodyDesc: 'await expression (arrow)',
        body: createAwaitExpression(createIdentifier('p')),
        expected: 0,
      },
      { bodyDesc: 'literal expression (arrow)', body: { type: 'Literal', value: 1 }, expected: 1 },
    ])('should report=$expected for $bodyDesc', ({ body, expected }) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.ArrowFunctionExpression(createArrowFunction(true, body))
      expect(reports.length).toBe(expected)
    })
  })

  describe('parameterized: various node types without await', () => {
    test.each([
      {
        type: 'WhileStatement',
        extra: { test: createIdentifier('c'), body: createBlockStatement([]) },
        expected: 1,
      },
      {
        type: 'ForStatement',
        extra: {
          init: null,
          test: createIdentifier('c'),
          update: null,
          body: createBlockStatement([]),
        },
        expected: 1,
      },
      {
        type: 'DoWhileStatement',
        extra: { test: createIdentifier('c'), body: createBlockStatement([]) },
        expected: 1,
      },
      {
        type: 'ForOfStatement',
        extra: {
          await: false,
          left: createIdentifier('x'),
          right: createIdentifier('arr'),
          body: createBlockStatement([]),
        },
        expected: 1,
      },
      {
        type: 'ForInStatement',
        extra: {
          left: createIdentifier('x'),
          right: createIdentifier('obj'),
          body: createBlockStatement([]),
        },
        expected: 1,
      },
      {
        type: 'SwitchStatement',
        extra: { discriminant: createIdentifier('x'), cases: [] },
        expected: 1,
      },
      {
        type: 'IfStatement',
        extra: {
          test: createIdentifier('c'),
          consequent: createBlockStatement([]),
          alternate: null,
        },
        expected: 1,
      },
      {
        type: 'TryStatement',
        extra: { block: createBlockStatement([]), handler: null, finalizer: null },
        expected: 1,
      },
    ])('should report for body containing $type', ({ type, extra, expected }) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([{ type, ...extra }])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(expected)
    })
  })

  describe('parameterized: await detection depth', () => {
    test.each([
      { depth: 1, expected: 0, name: 'await at depth 1 detected' },
      { depth: 2, expected: 0, name: 'await at depth 2 detected' },
      { depth: 3, expected: 0, name: 'await at depth 3 detected' },
    ])('$name', ({ depth, expected }) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)

      let node: unknown = createAwaitExpression(createIdentifier('p'))
      for (let i = 1; i < depth; i++) {
        node = {
          type: 'CallExpression',
          callee: createIdentifier('fn'),
          arguments: [node],
        }
      }

      const body = createBlockStatement([{ type: 'ExpressionStatement', expression: node }])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(expected)
    })
  })

  describe('parameterized: graceful handling of invalid node types', () => {
    test.each([
      { value: null, name: 'null' },
      { value: undefined, name: 'undefined' },
      { value: 'string', name: 'string' },
      { value: 42, name: 'number' },
      { value: true, name: 'boolean' },
      { value: [], name: 'empty array' },
    ])('should not throw for $name node', ({ value }) => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      expect(() => visitor.FunctionDeclaration(value)).not.toThrow()
    })

    test.each([
      { value: null, name: 'null' },
      { value: undefined, name: 'undefined' },
      { value: 'string', name: 'string' },
      { value: 42, name: 'number' },
    ])('should not throw for ArrowFunctionExpression with $name node', ({ value }) => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      expect(() => visitor.ArrowFunctionExpression(value)).not.toThrow()
    })
  })

  describe('parameterized: location line/column combos', () => {
    test.each([
      { line: 1, column: 0 },
      { line: 1, column: 100 },
      { line: 100, column: 0 },
      { line: 50, column: 50 },
    ])('should report correct location at line=$line column=$column', ({ line, column }) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body, [], line, column))
      expect(reports[0].loc?.start.line).toBe(line)
      expect(reports[0].loc?.start.column).toBe(column)
    })
  })

  describe('parameterized: message consistency', () => {
    test.each([
      { visitorKey: 'FunctionDeclaration', name: 'FunctionDeclaration' },
      { visitorKey: 'FunctionExpression', name: 'FunctionExpression' },
      { visitorKey: 'ArrowFunctionExpression', name: 'ArrowFunctionExpression' },
    ])('should have consistent message for $name', ({ visitorKey }) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const node =
        visitorKey === 'ArrowFunctionExpression'
          ? createArrowFunction(true, createIdentifier('x'))
          : visitorKey === 'FunctionExpression'
            ? createFunctionExpression(true, false, body)
            : createFunctionDeclaration(true, false, body)
      visitor[visitorKey](node)
      expect(reports[0].message).toBe('Async function has no await expression.')
    })
  })

  describe('parameterized: visitor returns function for each key', () => {
    test.each([
      { key: 'FunctionDeclaration' },
      { key: 'FunctionExpression' },
      { key: 'ArrowFunctionExpression' },
    ])('visitor.$key should be a function', ({ key }) => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      expect(typeof visitor[key]).toBe('function')
    })
  })

  describe('parameterized: for-await-of vs for-of detection', () => {
    test.each([
      { awaitFlag: true, expected: 0, name: 'for-await-of should not report' },
      { awaitFlag: false, expected: 1, name: 'for-of (no await) should report' },
    ])('$name', ({ awaitFlag, expected }) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const forNode = {
        type: 'ForOfStatement',
        await: awaitFlag,
        left: createIdentifier('x'),
        right: createIdentifier('iter'),
        body: createBlockStatement([]),
      }
      const body = createBlockStatement([forNode])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(expected)
    })
  })

  describe('parameterized: mixed visitor calls with for-await', () => {
    test.each([
      { funcType: 'FunctionDeclaration', expected: 0 },
      { funcType: 'FunctionExpression', expected: 0 },
      { funcType: 'ArrowFunctionExpression', expected: 0 },
    ])('should not report $funcType with for-await-of', ({ funcType, expected }) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createForAwaitStatement(createIdentifier('x'), createIdentifier('iter')),
      ])
      if (funcType === 'FunctionDeclaration') {
        visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      } else if (funcType === 'FunctionExpression') {
        visitor.FunctionExpression(createFunctionExpression(true, false, body))
      } else {
        visitor.ArrowFunctionExpression(createArrowFunction(true, body))
      }
      expect(reports.length).toBe(expected)
    })
  })

  describe('parameterized: generator flag combinations', () => {
    test.each([
      { async: true, generator: true, expected: 0, desc: 'async generator skips' },
      { async: true, generator: false, expected: 1, desc: 'async non-generator reports' },
      { async: false, generator: true, expected: 0, desc: 'sync generator skips' },
      { async: false, generator: false, expected: 0, desc: 'sync non-generator skips' },
    ])('$desc', ({ async, generator, expected }) => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(async, generator, body))
      expect(reports.length).toBe(expected)
    })
  })

  describe('additional coverage', () => {
    test('should report async function with bitwise expression but no await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'BinaryExpression',
          operator: '|',
          left: createIdentifier('a'),
          right: createIdentifier('b'),
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should not report async function with await in binary left operand', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'BinaryExpression',
          operator: '+',
          left: createAwaitExpression(createIdentifier('a')),
          right: createIdentifier('b'),
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report async function with await in binary right operand', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'BinaryExpression',
          operator: '+',
          left: createIdentifier('a'),
          right: createAwaitExpression(createIdentifier('b')),
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(0)
    })

    test('should report async arrow function returning a call expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.ArrowFunctionExpression(
        createArrowFunction(true, {
          type: 'CallExpression',
          callee: createIdentifier('fn'),
          arguments: [createIdentifier('x')],
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('should not report async arrow function returning await call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      visitor.ArrowFunctionExpression(
        createArrowFunction(
          true,
          createAwaitExpression({
            type: 'CallExpression',
            callee: createIdentifier('fn'),
            arguments: [],
          }),
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should report async function with return statement having no argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([{ type: 'ReturnStatement', argument: null }])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with debugger statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([{ type: 'DebuggerStatement' }])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with only a break statement in switch', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'SwitchStatement',
          discriminant: createIdentifier('x'),
          cases: [
            {
              type: 'SwitchCase',
              test: null,
              consequent: [{ type: 'BreakStatement', label: null }],
            },
          ],
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with continue statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'WhileStatement',
          test: createIdentifier('cond'),
          body: createBlockStatement([{ type: 'ContinueStatement', label: null }]),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with empty for-in loop', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'ForInStatement',
          left: createIdentifier('key'),
          right: createIdentifier('obj'),
          body: createBlockStatement([]),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should not report when await is inside a try-finally block', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'TryStatement',
          block: createBlockStatement([
            {
              type: 'ExpressionStatement',
              expression: createAwaitExpression(createIdentifier('p')),
            },
          ]),
          handler: null,
          finalizer: createBlockStatement([]),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(0)
    })

    test('should not report when await is in finally block', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'TryStatement',
          block: createBlockStatement([createReturnStatement(createIdentifier('x'))]),
          handler: null,
          finalizer: createBlockStatement([
            {
              type: 'ExpressionStatement',
              expression: createAwaitExpression(createIdentifier('cleanup')),
            },
          ]),
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(0)
    })

    test('should report async method-like function expression without await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'MemberExpression',
          object: createIdentifier('this'),
          property: createIdentifier('value'),
          computed: false,
        }),
      ])
      visitor.FunctionExpression(createFunctionExpression(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with only expression statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: createIdentifier('console'),
            arguments: [{ type: 'Literal', value: 'log' }],
          },
        },
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report async function with class expression body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'ClassExpression',
          id: null,
          superClass: null,
          body: { type: 'ClassBody', body: [] },
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should handle async function with params containing default values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const params = [
        {
          type: 'AssignmentPattern',
          left: createIdentifier('x'),
          right: { type: 'Literal', value: 10 },
        },
      ]
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body, params))
      expect(reports.length).toBe(1)
    })

    test('should handle async function with rest parameters', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const params = [{ type: 'RestElement', argument: createIdentifier('args') }]
      const body = createBlockStatement([createReturnStatement(createIdentifier('args'))])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body, params))
      expect(reports.length).toBe(1)
    })

    test('should handle async arrow function with destructured parameter', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const params = [
        {
          type: 'ObjectPattern',
          properties: [{ type: 'RestElement', argument: createIdentifier('rest') }],
        },
      ]
      visitor.ArrowFunctionExpression(createArrowFunction(true, createIdentifier('rest'), params))
      expect(reports.length).toBe(1)
    })

    test('should report when body is undefined for async node', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        params: [],
        body: undefined,
      }
      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
    })

    test('should handle node with body as string value', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        params: [],
        body: 'not a valid body',
      }
      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
    })

    test('should handle node with body as number value', () => {
      const { context } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        generator: false,
        params: [],
        body: 42,
      }
      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
    })

    test('should report correct location with column offset', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      visitor.FunctionExpression(createFunctionExpression(true, false, body, [], 3, 12))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(12)
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(32)
    })

    test('should handle async function with yield expression (non-generator)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'YieldExpression',
          argument: createIdentifier('x'),
          delegate: false,
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should report when async function returns a tagged template without await', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const body = createBlockStatement([
        createReturnStatement({
          type: 'TaggedTemplateExpression',
          tag: createIdentifier('tag'),
          quasi: {
            type: 'TemplateLiteral',
            quasis: [{ type: 'TemplateElement', value: { raw: 'text', cooked: 'text' } }],
            expressions: [],
          },
        }),
      ])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should handle async function body with nested block statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const innerBlock = createBlockStatement([createReturnStatement(createIdentifier('x'))])
      const body = createBlockStatement([innerBlock])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(1)
    })

    test('should not report when await is in nested block', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noAsyncWithoutAwaitRule.create(context)
      const innerBlock = createBlockStatement([
        { type: 'ExpressionStatement', expression: createAwaitExpression(createIdentifier('p')) },
      ])
      const body = createBlockStatement([innerBlock])
      visitor.FunctionDeclaration(createFunctionDeclaration(true, false, body))
      expect(reports.length).toBe(0)
    })
  })
})

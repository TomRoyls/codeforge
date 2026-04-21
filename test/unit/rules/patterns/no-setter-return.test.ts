import { describe, test, expect, vi } from 'vitest'
import { noSetterReturnRule } from '../../../../src/rules/patterns/no-setter-return.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createMethodDefinition(
  kind: 'get' | 'set' | 'method',
  body: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'MethodDefinition',
    kind,
    key: { type: 'Identifier', name: 'x' },
    value: {
      type: 'FunctionExpression',
      body,
      params: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: 20 },
    },
  }
}

function createEmptyBlockStatement(): unknown {
  return {
    type: 'BlockStatement',
    body: [],
  }
}

function createBlockStatementWithReturn(value: unknown | null | undefined): unknown {
  return {
    type: 'BlockStatement',
    body: [
      {
        type: 'ReturnStatement',
        value,
      },
    ],
  }
}

function createBlockStatementWithIfReturn(hasValue: boolean): unknown {
  return {
    type: 'BlockStatement',
    body: [
      {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'condition' },
        consequent: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              value: hasValue ? { type: 'Literal', value: 5 } : null,
            },
          ],
        },
        alternate: null,
      },
    ],
  }
}

function createBlockStatementWithNestedFunction(hasReturnValue: boolean): unknown {
  return {
    type: 'BlockStatement',
    body: [
      {
        type: 'VariableDeclaration',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'fn' },
            init: {
              type: 'FunctionExpression',
              body: {
                type: 'BlockStatement',
                body: [
                  {
                    type: 'ReturnStatement',
                    value: hasReturnValue ? { type: 'Literal', value: 10 } : null,
                  },
                ],
              },
            },
          },
        ],
      },
    ],
  }
}

describe('no-setter-return rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noSetterReturnRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noSetterReturnRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noSetterReturnRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noSetterReturnRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention setter in description', () => {
      expect(noSetterReturnRule.meta.docs?.description.toLowerCase()).toContain('setter')
    })

    test('should have meta property defined', () => {
      expect(noSetterReturnRule.meta).toBeDefined()
    })

    test('should have meta.type as a string', () => {
      expect(typeof noSetterReturnRule.meta.type).toBe('string')
    })

    test('should have meta.severity as a string', () => {
      expect(typeof noSetterReturnRule.meta.severity).toBe('string')
    })

    test('should have meta.docs defined', () => {
      expect(noSetterReturnRule.meta.docs).toBeDefined()
    })

    test('should have meta.docs.description as a string', () => {
      expect(typeof noSetterReturnRule.meta.docs?.description).toBe('string')
    })

    test('should have meta.docs.category as a string', () => {
      expect(typeof noSetterReturnRule.meta.docs?.category).toBe('string')
    })

    test('should have meta.docs.recommended as a boolean', () => {
      expect(typeof noSetterReturnRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should mention return in description', () => {
      expect(noSetterReturnRule.meta.docs?.description.toLowerCase()).toContain('return')
    })

    test('should have description that is non-empty', () => {
      expect(noSetterReturnRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have schema defined as an array', () => {
      expect(Array.isArray(noSetterReturnRule.meta.schema)).toBe(true)
    })

    test('should have empty schema', () => {
      expect(noSetterReturnRule.meta.schema).toEqual([])
    })

    test('should have fixable as undefined', () => {
      expect(noSetterReturnRule.meta.fixable).toBeUndefined()
    })

    test('should have severity equal to error', () => {
      expect(noSetterReturnRule.meta.severity).toEqual('error')
    })

    test('should have type equal to problem', () => {
      expect(noSetterReturnRule.meta.type).toEqual('problem')
    })

    test('should have category equal to patterns', () => {
      expect(noSetterReturnRule.meta.docs?.category).toEqual('patterns')
    })

    test('should have recommended set to true strictly', () => {
      expect(noSetterReturnRule.meta.docs?.recommended).toBe(true)
      expect(noSetterReturnRule.meta.docs?.recommended).not.toBe(false)
    })

    test('should not have type as suggestion', () => {
      expect(noSetterReturnRule.meta.type).not.toBe('suggestion')
    })

    test('should not have type as layout', () => {
      expect(noSetterReturnRule.meta.type).not.toBe('layout')
    })

    test('should not have severity as warning', () => {
      expect(noSetterReturnRule.meta.severity).not.toBe('warning')
    })

    test('should not have severity as info', () => {
      expect(noSetterReturnRule.meta.severity).not.toBe('info')
    })

    test('should not have severity as off', () => {
      expect(noSetterReturnRule.meta.severity).not.toBe('off')
    })

    test('should not have category as complexity', () => {
      expect(noSetterReturnRule.meta.docs?.category).not.toBe('complexity')
    })

    test('should not have category as security', () => {
      expect(noSetterReturnRule.meta.docs?.category).not.toBe('security')
    })

    test('should not have category as performance', () => {
      expect(noSetterReturnRule.meta.docs?.category).not.toBe('performance')
    })

    test('should not have category as dependencies', () => {
      expect(noSetterReturnRule.meta.docs?.category).not.toBe('dependencies')
    })
  })

  describe('create', () => {
    test('should return visitor with MethodDefinition method', () => {
      const { context } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      expect(visitor).toHaveProperty('MethodDefinition')
    })

    test('MethodDefinition should be a function', () => {
      const { context } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      expect(typeof visitor.MethodDefinition).toBe('function')
    })

    test('should return an object from create', () => {
      const { context } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      expect(visitor).not.toBeNull()
    })

    test('should have exactly one property in visitor', () => {
      const { context } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      expect(Object.keys(visitor)).toEqual(['MethodDefinition'])
    })

    test('should return consistent visitors for same context', () => {
      const { context } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor1 = noSetterReturnRule.create(context)
      const visitor2 = noSetterReturnRule.create(context)

      expect(typeof visitor1.MethodDefinition).toBe(typeof visitor2.MethodDefinition)
    })

    test('should return a new visitor object each time', () => {
      const { context } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor1 = noSetterReturnRule.create(context)
      const visitor2 = noSetterReturnRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should return a function for MethodDefinition each time', () => {
      const { context } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      expect(visitor.MethodDefinition).toBeInstanceOf(Function)
    })

    test('should not have other visitor keys', () => {
      const { context } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      expect(visitor).not.toHaveProperty('FunctionDeclaration')
      expect(visitor).not.toHaveProperty('ClassDeclaration')
      expect(visitor).not.toHaveProperty('VariableDeclaration')
    })

    test('create should be a function', () => {
      expect(typeof noSetterReturnRule.create).toBe('function')
    })

    test('should not throw when creating visitor', () => {
      const { context } = createMockRuleContext({ source: 'set x(value) {}' })

      expect(() => noSetterReturnRule.create(context)).not.toThrow()
    })
  })

  describe('valid cases', () => {
    test('should not report setter with no return statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', createEmptyBlockStatement())
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setter with return undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', createBlockStatementWithReturn(undefined))
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setter with return null', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', createBlockStatementWithReturn(null))
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report getter with return value', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'get',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regular method with return value', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'method',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setter with return in nested function', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', createBlockStatementWithNestedFunction(true))
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setter with return in if block (not checked)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', createBlockStatementWithIfReturn(false))
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setter with only early return without value', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', createBlockStatementWithReturn(null))
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setter with multiple returns without values', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', {
        type: 'BlockStatement',
        body: [
          { type: 'ReturnStatement', value: null },
          { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
          { type: 'ReturnStatement', value: undefined },
        ],
      })
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report getter with return string', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'get',
        createBlockStatementWithReturn({ type: 'Literal', value: 'hello' }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report getter with return identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'get',
        createBlockStatementWithReturn({ type: 'Identifier', name: 'result' }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report getter with return object', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'get',
        createBlockStatementWithReturn({
          type: 'ObjectExpression',
          properties: [],
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report getter with return boolean', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'get',
        createBlockStatementWithReturn({ type: 'Literal', value: true }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report method with return expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'method',
        createBlockStatementWithReturn({
          type: 'BinaryExpression',
          left: { type: 'Identifier', name: 'a' },
          operator: '+',
          right: { type: 'Literal', value: 1 },
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report method with return object', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'method',
        createBlockStatementWithReturn({
          type: 'ObjectExpression',
          properties: [],
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report method with return array', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'method',
        createBlockStatementWithReturn({
          type: 'ArrayExpression',
          elements: [],
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setter with only expression statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', {
        type: 'BlockStatement',
        body: [
          { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
          { type: 'ExpressionStatement', expression: { type: 'Literal', value: 2 } },
        ],
      })
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setter with only variable declarations', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', {
        type: 'BlockStatement',
        body: [
          {
            type: 'VariableDeclaration',
            declarations: [
              {
                type: 'VariableDeclarator',
                id: { type: 'Identifier', name: 'x' },
                init: { type: 'Literal', value: 5 },
              },
            ],
            kind: 'let',
          },
        ],
      })
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setter with throw statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', {
        type: 'BlockStatement',
        body: [
          {
            type: 'ThrowStatement',
            argument: {
              type: 'NewExpression',
              callee: { type: 'Identifier', name: 'Error' },
              arguments: [],
            },
          },
        ],
      })
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setter with if statement and no return', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', {
        type: 'BlockStatement',
        body: [
          {
            type: 'IfStatement',
            test: { type: 'Identifier', name: 'x' },
            consequent: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: { type: 'Literal', value: 1 },
                },
              ],
            },
            alternate: null,
          },
        ],
      })
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setter with while loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', {
        type: 'BlockStatement',
        body: [
          {
            type: 'WhileStatement',
            test: { type: 'Literal', value: true },
            body: {
              type: 'BlockStatement',
              body: [],
            },
          },
        ],
      })
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setter with for loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', {
        type: 'BlockStatement',
        body: [
          {
            type: 'ForStatement',
            init: null,
            test: null,
            update: null,
            body: {
              type: 'BlockStatement',
              body: [],
            },
          },
        ],
      })
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setter with switch statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', {
        type: 'BlockStatement',
        body: [
          {
            type: 'SwitchStatement',
            discriminant: { type: 'Identifier', name: 'x' },
            cases: [],
          },
        ],
      })
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setter with empty body array', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', {
        type: 'BlockStatement',
        body: [],
      })
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setter with nested function without return value', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', createBlockStatementWithNestedFunction(false))
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setter with arrow function in variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', {
        type: 'BlockStatement',
        body: [
          {
            type: 'VariableDeclaration',
            declarations: [
              {
                type: 'VariableDeclarator',
                id: { type: 'Identifier', name: 'fn' },
                init: {
                  type: 'ArrowFunctionExpression',
                  body: {
                    type: 'BlockStatement',
                    body: [
                      {
                        type: 'ReturnStatement',
                        value: { type: 'Literal', value: 42 },
                      },
                    ],
                  },
                  params: [],
                },
              },
            ],
            kind: 'const',
          },
        ],
      })
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report getter with no return', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('get', createEmptyBlockStatement())
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report method with no return', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('method', createEmptyBlockStatement())
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid cases', () => {
    test('should report setter with return statement and value', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should report setter with return of literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 'test' }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should report setter with return of variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Identifier', name: 'x' }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should report setter with return of expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({
          type: 'BinaryExpression',
          left: { type: 'Identifier', name: 'a' },
          operator: '+',
          right: { type: 'Literal', value: 1 },
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should not report setter with return in if block (not supported)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', createBlockStatementWithIfReturn(true))
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setter with return in nested if blocks (not supported)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', {
        type: 'BlockStatement',
        body: [
          {
            type: 'IfStatement',
            test: { type: 'Identifier', name: 'condition' },
            consequent: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'IfStatement',
                  test: { type: 'Identifier', name: 'inner' },
                  consequent: {
                    type: 'BlockStatement',
                    body: [
                      {
                        type: 'ReturnStatement',
                        value: { type: 'Literal', value: 10 },
                      },
                    ],
                  },
                  alternate: null,
                },
              ],
            },
            alternate: null,
          },
        ],
      })
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report setter with return in try-catch block (not supported)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', {
        type: 'BlockStatement',
        body: [
          {
            type: 'TryStatement',
            block: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ReturnStatement',
                  value: { type: 'Literal', value: 5 },
                },
              ],
            },
            handler: null,
            finalizer: null,
          },
        ],
      })
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should report setter with return of boolean', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: true }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should report setter with correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
        5,
        10,
      )
      visitor.MethodDefinition(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report each setter that returns a value', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'set',
          createBlockStatementWithReturn({ type: 'Literal', value: 1 }),
        ),
      )
      visitor.MethodDefinition(
        createMethodDefinition(
          'set',
          createBlockStatementWithReturn({ type: 'Literal', value: 2 }),
        ),
      )
      visitor.MethodDefinition(
        createMethodDefinition(
          'set',
          createBlockStatementWithReturn({ type: 'Literal', value: 3 }),
        ),
      )

      expect(reports.length).toBe(3)
    })

    test('should report setter with return of number literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 42 }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should report setter with return of string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 'hello world' }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should report setter with return of false', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: false }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should report setter with return of object expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({
          type: 'ObjectExpression',
          properties: [
            {
              type: 'Property',
              key: { type: 'Identifier', name: 'a' },
              value: { type: 'Literal', value: 1 },
              kind: 'init',
            },
          ],
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should report setter with return of array expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({
          type: 'ArrayExpression',
          elements: [
            { type: 'Literal', value: 1 },
            { type: 'Literal', value: 2 },
          ],
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should report setter with return of call expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should report setter with return of member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should report setter with return of new expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'MyClass' },
          arguments: [],
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should report setter with return of conditional expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'x' },
          consequent: { type: 'Literal', value: 1 },
          alternate: { type: 'Literal', value: 2 },
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should report setter with return of template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({
          type: 'TemplateLiteral',
          quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' } }],
          expressions: [],
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should report setter with return of logical expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({
          type: 'LogicalExpression',
          left: { type: 'Identifier', name: 'a' },
          operator: '&&',
          right: { type: 'Identifier', name: 'b' },
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should report setter with return of unary expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({
          type: 'UnaryExpression',
          operator: '!',
          argument: { type: 'Identifier', name: 'x' },
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should report setter with return of update expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'x' },
          prefix: false,
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should report setter with return of assignment expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 5 },
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should report setter with return of sequence expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({
          type: 'SequenceExpression',
          expressions: [
            { type: 'Literal', value: 1 },
            { type: 'Literal', value: 2 },
          ],
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should report setter with return of this expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'ThisExpression' }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should report setter with return of arrow function', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({
          type: 'ArrowFunctionExpression',
          body: { type: 'Literal', value: 1 },
          params: [],
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should report setter with return of function expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({
          type: 'FunctionExpression',
          body: { type: 'BlockStatement', body: [] },
          params: [],
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should report setter with return of null literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: null, raw: 'null' }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should report setter with return of regex literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({
          type: 'Literal',
          value: '/test/',
          regex: { pattern: 'test', flags: '' },
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should report setter with return of spread element', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({
          type: 'SpreadElement',
          argument: { type: 'Identifier', name: 'arr' },
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should report setter with return of yield expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({
          type: 'YieldExpression',
          argument: { type: 'Literal', value: 1 },
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should report setter with return of await expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({
          type: 'AwaitExpression',
          argument: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fetch' },
            arguments: [],
          },
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should report setter with return of tagged template expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({
          type: 'TaggedTemplateExpression',
          tag: { type: 'Identifier', name: 'tag' },
          quasi: {
            type: 'TemplateLiteral',
            quasis: [{ type: 'TemplateElement', value: { raw: '', cooked: '' } }],
            expressions: [],
          },
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should report setter with return of class expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({
          type: 'ClassExpression',
          body: { type: 'ClassBody', body: [] },
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('message content verification', () => {
    test('should have exact message "Setter should not return a value."', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      visitor.MethodDefinition(node)

      expect(reports[0].message).toBe('Setter should not return a value.')
    })

    test('should have consistent message for different return types', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'set',
          createBlockStatementWithReturn({ type: 'Literal', value: 1 }),
        ),
      )
      visitor.MethodDefinition(
        createMethodDefinition(
          'set',
          createBlockStatementWithReturn({ type: 'Identifier', name: 'x' }),
        ),
      )

      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should have message containing "setter" (case insensitive)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      visitor.MethodDefinition(node)

      expect(reports[0].message.toLowerCase()).toContain('setter')
    })

    test('should have message containing "return"', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      visitor.MethodDefinition(node)

      expect(reports[0].message.toLowerCase()).toContain('return')
    })

    test('should have message that is a string', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      visitor.MethodDefinition(node)

      expect(typeof reports[0].message).toBe('string')
    })

    test('should have message with non-zero length', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      visitor.MethodDefinition(node)

      expect(reports[0].message.length).toBeGreaterThan(0)
    })
  })

  describe('location reporting', () => {
    test('should report location with line 1 column 0 by default', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      visitor.MethodDefinition(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 10', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
        10,
        5,
      )
      visitor.MethodDefinition(node)

      expect(reports[0].loc?.start.line).toBe(10)
    })

    test('should report location at column 20', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
        1,
        20,
      )
      visitor.MethodDefinition(node)

      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
        5,
        10,
      )
      visitor.MethodDefinition(node)

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('should report location at line 100 column 50', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
        100,
        50,
      )
      visitor.MethodDefinition(node)

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location at line 0 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
        0,
        0,
      )
      visitor.MethodDefinition(node)

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      delete (node as Record<string, unknown>).loc

      visitor.MethodDefinition(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location with loc having only start', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
        7,
        3,
      )
      const n = node as Record<string, unknown>
      n.loc = { start: { line: 7, column: 3 } }

      visitor.MethodDefinition(node)

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })
  })

  describe('report descriptor structure', () => {
    test('should include message in report descriptor', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      visitor.MethodDefinition(node)

      expect(reports[0]).toHaveProperty('message')
    })

    test('should include loc in report descriptor', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      visitor.MethodDefinition(node)

      expect(reports[0]).toHaveProperty('loc')
    })

    test('should have loc with start property', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      visitor.MethodDefinition(node)

      expect(reports[0].loc).toHaveProperty('start')
    })

    test('should have loc with end property', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      visitor.MethodDefinition(node)

      expect(reports[0].loc).toHaveProperty('end')
    })

    test('should have start with line and column', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      visitor.MethodDefinition(node)

      expect(reports[0].loc?.start).toHaveProperty('line')
      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('should have end with line and column', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      visitor.MethodDefinition(node)

      expect(reports[0].loc?.end).toHaveProperty('line')
      expect(reports[0].loc?.end).toHaveProperty('column')
    })

    test('should have line as a number in start', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      visitor.MethodDefinition(node)

      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('should have column as a number in start', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      visitor.MethodDefinition(node)

      expect(typeof reports[0].loc?.start.column).toBe('number')
    })
  })

  describe('multiple reports', () => {
    test('should report two setters with return values', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'set',
          createBlockStatementWithReturn({ type: 'Literal', value: 1 }),
        ),
      )
      visitor.MethodDefinition(
        createMethodDefinition(
          'set',
          createBlockStatementWithReturn({ type: 'Literal', value: 2 }),
        ),
      )

      expect(reports.length).toBe(2)
    })

    test('should report four setters with return values', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      for (let i = 0; i < 4; i++) {
        visitor.MethodDefinition(
          createMethodDefinition(
            'set',
            createBlockStatementWithReturn({ type: 'Literal', value: i }),
          ),
        )
      }

      expect(reports.length).toBe(4)
    })

    test('should report five setters with return values', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.MethodDefinition(
          createMethodDefinition(
            'set',
            createBlockStatementWithReturn({ type: 'Literal', value: i }),
          ),
        )
      }

      expect(reports.length).toBe(5)
    })

    test('should report only setters, not getters or methods', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'get',
          createBlockStatementWithReturn({ type: 'Literal', value: 1 }),
        ),
      )
      visitor.MethodDefinition(
        createMethodDefinition(
          'set',
          createBlockStatementWithReturn({ type: 'Literal', value: 2 }),
        ),
      )
      visitor.MethodDefinition(
        createMethodDefinition(
          'method',
          createBlockStatementWithReturn({ type: 'Literal', value: 3 }),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should handle alternating valid and invalid nodes', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('set', createEmptyBlockStatement()))
      visitor.MethodDefinition(
        createMethodDefinition(
          'set',
          createBlockStatementWithReturn({ type: 'Literal', value: 1 }),
        ),
      )
      visitor.MethodDefinition(createMethodDefinition('set', createEmptyBlockStatement()))
      visitor.MethodDefinition(
        createMethodDefinition(
          'set',
          createBlockStatementWithReturn({ type: 'Literal', value: 2 }),
        ),
      )

      expect(reports.length).toBe(2)
    })

    test('should report ten setters in a loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.MethodDefinition(
          createMethodDefinition(
            'set',
            createBlockStatementWithReturn({ type: 'Literal', value: i }),
          ),
        )
      }

      expect(reports.length).toBe(10)
    })

    test('should report each setter with unique location', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      for (let i = 1; i <= 3; i++) {
        visitor.MethodDefinition(
          createMethodDefinition(
            'set',
            createBlockStatementWithReturn({ type: 'Literal', value: i }),
            i * 10,
            i * 5,
          ),
        )
      }

      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[1].loc?.start.line).toBe(20)
      expect(reports[2].loc?.start.line).toBe(30)
    })

    test('should handle mixed getter and setter with same visitor', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'get',
          createBlockStatementWithReturn({ type: 'Literal', value: 1 }),
        ),
      )
      visitor.MethodDefinition(createMethodDefinition('set', createEmptyBlockStatement()))
      visitor.MethodDefinition(
        createMethodDefinition(
          'set',
          createBlockStatementWithReturn({ type: 'Literal', value: 2 }),
        ),
      )
      visitor.MethodDefinition(
        createMethodDefinition(
          'method',
          createBlockStatementWithReturn({ type: 'Literal', value: 3 }),
        ),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      expect(() => visitor.MethodDefinition(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      expect(() => visitor.MethodDefinition(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without kind property', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'x' },
        value: {
          type: 'FunctionExpression',
          body: createEmptyBlockStatement(),
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without value property', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'set',
        key: { type: 'Identifier', name: 'x' },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without body in value', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'set',
        key: { type: 'Identifier', name: 'x' },
        value: {
          type: 'FunctionExpression',
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property (provides default location)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      delete (node as Record<string, unknown>).loc

      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle non-MethodDefinition node', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = {
        type: 'Identifier',
        name: 'x',
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      expect(() => visitor.MethodDefinition({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with string instead of object type', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      expect(() => visitor.MethodDefinition('MethodDefinition')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with number type', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      expect(() => visitor.MethodDefinition(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with boolean type', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      expect(() => visitor.MethodDefinition(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with array type', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      expect(() => visitor.MethodDefinition([1, 2, 3])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with kind as non-set string', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        key: { type: 'Identifier', name: 'x' },
        value: {
          type: 'FunctionExpression',
          body: createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with kind as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 42,
        key: { type: 'Identifier', name: 'x' },
        value: {
          type: 'FunctionExpression',
          body: createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with value as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'set',
        key: { type: 'Identifier', name: 'x' },
        value: null,
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with value as undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'set',
        key: { type: 'Identifier', name: 'x' },
        value: undefined,
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with value as string', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'set',
        key: { type: 'Identifier', name: 'x' },
        value: 'not a function',
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with value as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'set',
        key: { type: 'Identifier', name: 'x' },
        value: 123,
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with value as non-FunctionExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'set',
        key: { type: 'Identifier', name: 'x' },
        value: {
          type: 'ArrowFunctionExpression',
          body: createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with body as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'set',
        key: { type: 'Identifier', name: 'x' },
        value: {
          type: 'FunctionExpression',
          body: null,
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with body as undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'set',
        key: { type: 'Identifier', name: 'x' },
        value: {
          type: 'FunctionExpression',
          body: undefined,
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with body as non-BlockStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'set',
        key: { type: 'Identifier', name: 'x' },
        value: {
          type: 'FunctionExpression',
          body: { type: 'Expression', value: 5 },
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with body as empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'set',
        key: { type: 'Identifier', name: 'x' },
        value: {
          type: 'FunctionExpression',
          body: {},
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with body array containing non-return statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'set',
        key: { type: 'Identifier', name: 'x' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
              { type: 'BreakStatement', label: null },
              { type: 'ContinueStatement', label: null },
            ],
          },
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with body containing only empty return', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', createBlockStatementWithReturn(null))
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with loc but missing start', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      const n = node as Record<string, unknown>
      n.loc = { end: { line: 1, column: 20 } }

      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with loc.start.line as string', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      const n = node as Record<string, unknown>
      n.loc = {
        start: { line: '5', column: 0 },
        end: { line: '5', column: 20 },
      }

      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle node with loc.start.column as string', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      const n = node as Record<string, unknown>
      n.loc = {
        start: { line: 5, column: '10' },
        end: { line: 5, column: 20 },
      }

      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/different/path.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/different',
      } as unknown as RuleContext

      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should work with empty source', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should work with null AST', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      expect(context.getAST()).toBeNull()

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should work with config options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{ someOption: true }] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should not call logger during normal operation', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(context.logger.debug).not.toHaveBeenCalled()
      expect(context.logger.info).not.toHaveBeenCalled()
      expect(context.logger.warn).not.toHaveBeenCalled()
      expect(context.logger.error).not.toHaveBeenCalled()
    })

    test('should work with multiple context instances', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'set x(value) {}' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'set x(value) {}' })

      const visitor1 = noSetterReturnRule.create(ctx1)
      const visitor2 = noSetterReturnRule.create(ctx2)

      visitor1.MethodDefinition(
        createMethodDefinition(
          'set',
          createBlockStatementWithReturn({ type: 'Literal', value: 1 }),
        ),
      )
      visitor2.MethodDefinition(
        createMethodDefinition(
          'set',
          createBlockStatementWithReturn({ type: 'Literal', value: 2 }),
        ),
      )

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(1)
      expect(r1[0].message).toBe(r2[0].message)
    })
  })

  describe('export verification', () => {
    test('should export noSetterReturnRule', () => {
      expect(noSetterReturnRule).toBeDefined()
    })

    test('should be an object', () => {
      expect(typeof noSetterReturnRule).toBe('object')
    })

    test('should have meta property', () => {
      expect(noSetterReturnRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(noSetterReturnRule).toHaveProperty('create')
    })

    test('should have exactly meta and create properties', () => {
      const keys = Object.keys(noSetterReturnRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })

    test('should have create as a function', () => {
      expect(typeof noSetterReturnRule.create).toBe('function')
    })

    test('should have meta as an object', () => {
      expect(typeof noSetterReturnRule.meta).toBe('object')
    })

    test('should not have additional top-level properties beyond meta and create', () => {
      const keys = Object.keys(noSetterReturnRule)
      expect(keys.length).toBeGreaterThanOrEqual(2)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })
  })

  describe('visitor isolation', () => {
    test('should not share reports between different visitors', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'set x(value) {}' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'set x(value) {}' })

      const visitor1 = noSetterReturnRule.create(ctx1)
      const visitor2 = noSetterReturnRule.create(ctx2)

      visitor1.MethodDefinition(
        createMethodDefinition(
          'set',
          createBlockStatementWithReturn({ type: 'Literal', value: 1 }),
        ),
      )

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('should handle visitor being called with valid then invalid nodes', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('set', createEmptyBlockStatement()))
      visitor.MethodDefinition(
        createMethodDefinition(
          'set',
          createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle visitor being called with invalid then valid nodes', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      visitor.MethodDefinition(
        createMethodDefinition(
          'set',
          createBlockStatementWithReturn({ type: 'Literal', value: 5 }),
        ),
      )
      visitor.MethodDefinition(createMethodDefinition('set', createEmptyBlockStatement()))

      expect(reports.length).toBe(1)
    })

    test('should handle visitor called many times without issues', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.MethodDefinition(createMethodDefinition('set', createEmptyBlockStatement()))
      }

      expect(reports.length).toBe(0)
    })

    test('should handle visitor called many times with all invalid', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.MethodDefinition(
          createMethodDefinition(
            'set',
            createBlockStatementWithReturn({ type: 'Literal', value: i }),
          ),
        )
      }

      expect(reports.length).toBe(20)
    })
  })

  describe('hasReturnValue recursion', () => {
    test('should detect return value in deeply nested BlockStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', {
        type: 'BlockStatement',
        body: [
          {
            type: 'BlockStatement',
            body: [
              {
                type: 'ReturnStatement',
                value: { type: 'Literal', value: 42 },
              },
            ],
          },
        ],
      })
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should not report deeply nested return without value', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', {
        type: 'BlockStatement',
        body: [
          {
            type: 'BlockStatement',
            body: [
              {
                type: 'ReturnStatement',
                value: null,
              },
            ],
          },
        ],
      })
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should detect return value in triple-nested BlockStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', {
        type: 'BlockStatement',
        body: [
          {
            type: 'BlockStatement',
            body: [
              {
                type: 'BlockStatement',
                body: [
                  {
                    type: 'ReturnStatement',
                    value: { type: 'Literal', value: 99 },
                  },
                ],
              },
            ],
          },
        ],
      })
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should handle body as non-array', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', {
        type: 'BlockStatement',
        body: 'not an array',
      })
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle body with null elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', {
        type: 'BlockStatement',
        body: [null, null],
      })
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle body with undefined elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', {
        type: 'BlockStatement',
        body: [undefined, undefined],
      })
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should detect first return with value among multiple statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', {
        type: 'BlockStatement',
        body: [
          { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
          { type: 'ReturnStatement', value: { type: 'Literal', value: 5 } },
          { type: 'ExpressionStatement', expression: { type: 'Literal', value: 2 } },
        ],
      })
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect return value after empty return', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', {
        type: 'BlockStatement',
        body: [
          { type: 'ReturnStatement', value: null },
          { type: 'ReturnStatement', value: { type: 'Literal', value: 5 } },
        ],
      })
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should handle ReturnStatement with empty string value', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: '' }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should handle ReturnStatement with value 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: 0 }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should handle ReturnStatement with value false (truthy check)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Literal', value: false }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect return with NaN value', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({ type: 'Identifier', name: 'NaN' }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect return with void expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({
          type: 'UnaryExpression',
          operator: 'void',
          argument: { type: 'Literal', value: 0 },
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect return with typeof expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: { type: 'Identifier', name: 'x' },
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect return with delete expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({
          type: 'UnaryExpression',
          operator: 'delete',
          argument: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'prop' },
          },
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect return with parenthesized expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition(
        'set',
        createBlockStatementWithReturn({
          type: 'BinaryExpression',
          left: { type: 'Literal', value: 1 },
          operator: '+',
          right: { type: 'Literal', value: 2 },
        }),
      )
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Setter should not return')
    })

    test('should detect return with ternary in nested block', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', {
        type: 'BlockStatement',
        body: [
          {
            type: 'BlockStatement',
            body: [
              {
                type: 'BlockStatement',
                body: [
                  {
                    type: 'BlockStatement',
                    body: [
                      {
                        type: 'ReturnStatement',
                        value: {
                          type: 'ConditionalExpression',
                          test: { type: 'Identifier', name: 'x' },
                          consequent: { type: 'Literal', value: 1 },
                          alternate: { type: 'Literal', value: 0 },
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      })
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should not crash with circular reference-like nested structures', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', {
        type: 'BlockStatement',
        body: [
          {
            type: 'BlockStatement',
            body: [
              {
                type: 'BlockStatement',
                body: [
                  {
                    type: 'BlockStatement',
                    body: [],
                  },
                ],
              },
            ],
          },
        ],
      })
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle body as an empty array after multiple nesting levels', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', {
        type: 'BlockStatement',
        body: [
          { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } },
          {
            type: 'BlockStatement',
            body: [],
          },
        ],
      })
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested valid setter without crashing', () => {
      const { context, reports } = createMockRuleContext({ source: 'set x(value) {}' })
      const visitor = noSetterReturnRule.create(context)

      const node = createMethodDefinition('set', {
        type: 'BlockStatement',
        body: Array.from({ length: 50 }, () => ({
          type: 'ExpressionStatement',
          expression: { type: 'Literal', value: 1 },
        })),
      })
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })
  })
})

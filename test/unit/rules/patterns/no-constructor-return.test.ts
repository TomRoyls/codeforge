import { describe, test, expect, vi } from 'vitest'
import { noConstructorReturnRule } from '../../../../src/rules/patterns/no-constructor-return.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createMethodDefinition(
  kind: 'constructor' | 'method' | 'get' | 'set',
  hasReturn = false,
  lineNumber = 1,
  column = 0,
): unknown {
  const body = hasReturn
    ? {
        type: 'BlockStatement',
        body: [
          {
            type: 'ReturnStatement',
            argument: { type: 'Literal', value: 42 },
          },
        ],
      }
    : {
        type: 'BlockStatement',
        body: [
          {
            type: 'ExpressionStatement',
            expression: { type: 'Identifier', name: 'x' },
          },
        ],
      }

  return {
    type: 'MethodDefinition',
    kind: kind,
    body: body,
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber + 5, column },
    },
  }
}

describe('no-constructor-return rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noConstructorReturnRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noConstructorReturnRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noConstructorReturnRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noConstructorReturnRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noConstructorReturnRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noConstructorReturnRule.meta.fixable).toBeUndefined()
    })

    test('should mention constructor in description', () => {
      expect(noConstructorReturnRule.meta.docs?.description.toLowerCase()).toContain('constructor')
    })

    test('should mention return in description', () => {
      expect(noConstructorReturnRule.meta.docs?.description.toLowerCase()).toContain('return')
    })

    test('should have empty schema array', () => {
      expect(noConstructorReturnRule.meta.schema).toEqual([])
    })
  })

  describe('meta - type checks', () => {
    test('meta.type should be a string', () => {
      expect(typeof noConstructorReturnRule.meta.type).toBe('string')
    })

    test('meta.severity should be a string', () => {
      expect(typeof noConstructorReturnRule.meta.severity).toBe('string')
    })

    test('meta.docs should be an object', () => {
      expect(typeof noConstructorReturnRule.meta.docs).toBe('object')
    })

    test('meta.docs should not be null', () => {
      expect(noConstructorReturnRule.meta.docs).not.toBeNull()
    })

    test('meta.docs.description should be a string', () => {
      expect(typeof noConstructorReturnRule.meta.docs?.description).toBe('string')
    })

    test('meta.docs.description should be non-empty', () => {
      expect(noConstructorReturnRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('meta.docs.category should be a string', () => {
      expect(typeof noConstructorReturnRule.meta.docs?.category).toBe('string')
    })

    test('meta.docs.recommended should be a boolean', () => {
      expect(typeof noConstructorReturnRule.meta.docs?.recommended).toBe('boolean')
    })

    test('meta.docs should have url property', () => {
      expect(noConstructorReturnRule.meta.docs?.url).toBeDefined()
    })

    test('meta.docs.url should be a string', () => {
      expect(typeof noConstructorReturnRule.meta.docs?.url).toBe('string')
    })

    test('meta.schema should be an array', () => {
      expect(Array.isArray(noConstructorReturnRule.meta.schema)).toBe(true)
    })

    test('meta should have all required properties', () => {
      expect(noConstructorReturnRule.meta).toHaveProperty('type')
      expect(noConstructorReturnRule.meta).toHaveProperty('severity')
      expect(noConstructorReturnRule.meta).toHaveProperty('docs')
      expect(noConstructorReturnRule.meta).toHaveProperty('schema')
    })

    test('meta.type should equal problem exactly', () => {
      expect(noConstructorReturnRule.meta.type).toBe('problem')
      expect(noConstructorReturnRule.meta.type).not.toBe('suggestion')
      expect(noConstructorReturnRule.meta.type).not.toBe('layout')
    })

    test('meta.severity should equal error exactly', () => {
      expect(noConstructorReturnRule.meta.severity).toBe('error')
      expect(noConstructorReturnRule.meta.severity).not.toBe('warn')
      expect(noConstructorReturnRule.meta.severity).not.toBe('info')
    })

    test('meta.docs.recommended should be true', () => {
      expect(noConstructorReturnRule.meta.docs?.recommended).toBe(true)
      expect(noConstructorReturnRule.meta.docs?.recommended).not.toBe(false)
    })

    test('meta.docs.category should equal patterns exactly', () => {
      expect(noConstructorReturnRule.meta.docs?.category).toBe('patterns')
      expect(noConstructorReturnRule.meta.docs?.category).not.toBe('security')
      expect(noConstructorReturnRule.meta.docs?.category).not.toBe('complexity')
    })

    test('meta.fixable should be undefined', () => {
      expect(noConstructorReturnRule.meta.fixable).toBeUndefined()
    })

    test('meta.schema should have length 0', () => {
      expect(noConstructorReturnRule.meta.schema).toHaveLength(0)
    })

    test('meta.docs.description should mention disallow', () => {
      expect(noConstructorReturnRule.meta.docs?.description.toLowerCase()).toContain('disallow')
    })

    test('meta.docs.description should mention values', () => {
      expect(noConstructorReturnRule.meta.docs?.description.toLowerCase()).toContain('values')
    })

    test('meta.docs.description should mention initializing', () => {
      expect(noConstructorReturnRule.meta.docs?.description.toLowerCase()).toContain('initializ')
    })

    test('meta.docs.url should start with https', () => {
      expect(noConstructorReturnRule.meta.docs?.url).toMatch(/^https:/)
    })
  })

  describe('create', () => {
    test('should return visitor object with MethodDefinition method', () => {
      const { context } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      expect(visitor).toHaveProperty('MethodDefinition')
    })

    test('should return an object from create', () => {
      const { context } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('MethodDefinition visitor should be a function', () => {
      const { context } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      expect(typeof visitor.MethodDefinition).toBe('function')
    })

    test('create should not return null', () => {
      const { context } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      expect(visitor).not.toBeNull()
    })

    test('create should not return undefined', () => {
      const { context } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      expect(visitor).toBeDefined()
    })

    test('visitor should only have MethodDefinition key', () => {
      const { context } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      expect(Object.keys(visitor)).toEqual(['MethodDefinition'])
    })

    test('calling create multiple times should return independent visitors', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'class Foo {}' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor1 = noConstructorReturnRule.create(ctx1)
      const visitor2 = noConstructorReturnRule.create(ctx2)

      visitor1.MethodDefinition(createMethodDefinition('constructor', true))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('create should not throw with valid context', () => {
      const { context } = createMockRuleContext({ source: 'class Foo {}' })

      expect(() => noConstructorReturnRule.create(context)).not.toThrow()
    })

    test('MethodDefinition should accept one argument', () => {
      const { context } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      expect(visitor.MethodDefinition.length).toBe(1)
    })
  })

  describe('detecting return statements in constructors', () => {
    test('should report constructor with return statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports.length).toBe(1)
    })

    test('should not report constructor without return statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', false))

      expect(reports.length).toBe(0)
    })

    test('should not report method with return statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('method', true))

      expect(reports.length).toBe(0)
    })

    test('should not report getter with return statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('get', true))

      expect(reports.length).toBe(0)
    })

    test('should not report setter with return statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('set', true))

      expect(reports.length).toBe(0)
    })

    test('should report correct message for constructor with return', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports[0].message).toBe('Unexpected return in constructor.')
    })

    test('should report multiple constructors with returns', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true, 1, 0))
      visitor.MethodDefinition(createMethodDefinition('constructor', true, 2, 0))
      visitor.MethodDefinition(createMethodDefinition('constructor', true, 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report only constructors with returns among other methods', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('method', true))
      visitor.MethodDefinition(createMethodDefinition('constructor', true))
      visitor.MethodDefinition(createMethodDefinition('get', true))
      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports.length).toBe(2)
    })
  })

  describe('detection - return value types', () => {
    test('should detect constructor returning a number literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect constructor returning a string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 'hello' } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect constructor returning an identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Identifier', name: 'value' } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect constructor returning a call expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' } },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect constructor returning an object expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: { type: 'ObjectExpression', properties: [] },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect constructor returning an array expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: { type: 'ArrayExpression', elements: [] },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect constructor returning a binary expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: {
                type: 'BinaryExpression',
                operator: '+',
                left: { type: 'Literal', value: 1 },
                right: { type: 'Literal', value: 2 },
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect constructor returning a member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: {
                type: 'MemberExpression',
                object: { type: 'ThisExpression' },
                property: { type: 'Identifier', name: 'value' },
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect constructor returning a new expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: {
                type: 'NewExpression',
                callee: { type: 'Identifier', name: 'Map' },
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect constructor returning a conditional expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: {
                type: 'ConditionalExpression',
                test: { type: 'Identifier', name: 'x' },
                consequent: { type: 'Literal', value: 1 },
                alternate: { type: 'Literal', value: 2 },
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect constructor returning a template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: { type: 'TemplateLiteral', quasis: [], expressions: [] },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect constructor returning an arrow function expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: {
                type: 'ArrowFunctionExpression',
                params: [],
                body: { type: 'BlockStatement', body: [] },
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect constructor returning a logical expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: {
                type: 'LogicalExpression',
                operator: '&&',
                left: { type: 'Identifier', name: 'a' },
                right: { type: 'Identifier', name: 'b' },
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect constructor returning a unary expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: {
                type: 'UnaryExpression',
                operator: '!',
                argument: { type: 'Identifier', name: 'x' },
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect constructor returning an update expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: {
                type: 'UpdateExpression',
                operator: '++',
                argument: { type: 'Identifier', name: 'x' },
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect constructor returning an assignment expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: {
                type: 'AssignmentExpression',
                operator: '=',
                left: { type: 'Identifier', name: 'x' },
                right: { type: 'Literal', value: 1 },
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect constructor returning this expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'ThisExpression' } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect constructor returning null', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: null } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect constructor returning undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Identifier', name: 'undefined' } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect constructor returning a boolean literal true', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: true } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect constructor returning a boolean literal false', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: false } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect constructor returning a yield expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: { type: 'YieldExpression', argument: null },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect constructor returning a sequence expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ReturnStatement',
              argument: {
                type: 'SequenceExpression',
                expressions: [
                  { type: 'Literal', value: 1 },
                  { type: 'Literal', value: 2 },
                ],
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect constructor with return statement with no argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: null }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect constructor with multiple return statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            { type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } },
            { type: 'ReturnStatement', argument: { type: 'Literal', value: 2 } },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should detect constructor with return among other statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            { type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'x' } },
            { type: 'VariableDeclaration', kind: 'const', declarations: [] },
            { type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } },
            { type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'y' } },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detection - PropertyDefinition type', () => {
    test('should detect PropertyDefinition with kind constructor and return', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'PropertyDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should not report PropertyDefinition with kind constructor and no return', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'PropertyDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'x' } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('detection - negative cases (should not report)', () => {
    test('should not report constructor with only expression statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            { type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'x' } },
            { type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'y' } },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with only variable declarations', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            { type: 'VariableDeclaration', kind: 'let', declarations: [] },
            { type: 'VariableDeclaration', kind: 'const', declarations: [] },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with only if statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'IfStatement',
              test: { type: 'Literal', value: true },
              consequent: { type: 'BlockStatement', body: [] },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with only while loops', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'WhileStatement',
              test: { type: 'Literal', value: true },
              body: { type: 'BlockStatement', body: [] },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with only for loops', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ForStatement',
              init: null,
              test: null,
              update: null,
              body: { type: 'BlockStatement', body: [] },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with only try-catch blocks', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'TryStatement',
              block: { type: 'BlockStatement', body: [] },
              handler: {
                type: 'CatchClause',
                param: { type: 'Identifier', name: 'e' },
                body: { type: 'BlockStatement', body: [] },
              },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with switch statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'SwitchStatement',
              discriminant: { type: 'Identifier', name: 'x' },
              cases: [],
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with throw statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ThrowStatement',
              argument: { type: 'NewExpression', callee: { type: 'Identifier', name: 'Error' } },
            },
          ],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regular method kind', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'method',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report get kind', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'get',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report set kind', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'set',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node in MethodDefinition', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      expect(() => visitor.MethodDefinition(null)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in MethodDefinition', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      expect(() => visitor.MethodDefinition(undefined)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node in MethodDefinition', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      expect(() => visitor.MethodDefinition('string')).not.toThrow()
      expect(() => visitor.MethodDefinition(123)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        kind: 'constructor',
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without kind property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without body property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement' }],
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle constructor with empty body', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports.length).toBe(1)
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
        getSource: () => 'class Foo { constructor() { return 1; } }',
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

      const visitor = noConstructorReturnRule.create(context)
      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases - primitive nodes', () => {
    test('should handle boolean true as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      expect(() => visitor.MethodDefinition(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean false as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      expect(() => visitor.MethodDefinition(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number 0 as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      expect(() => visitor.MethodDefinition(0)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle negative number as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      expect(() => visitor.MethodDefinition(-1)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty string as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      expect(() => visitor.MethodDefinition('')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      expect(() => visitor.MethodDefinition([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle function as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      expect(() => visitor.MethodDefinition(() => {})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Date object as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      expect(() => visitor.MethodDefinition(new Date())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle RegExp as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      expect(() => visitor.MethodDefinition(/test/)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases - malformed nodes', () => {
    test('should handle node with body as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: null,
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with body as string', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: 'some string',
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with body as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: 42,
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with body.body as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: { type: 'BlockStatement', body: null },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with body.body as string', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: { type: 'BlockStatement', body: 'not-array' },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with body.body as number', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: { type: 'BlockStatement', body: 123 },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with body.body containing null elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: { type: 'BlockStatement', body: [null, null] },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with body.body containing undefined elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: { type: 'BlockStatement', body: [undefined, undefined] },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with body.body containing string elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: { type: 'BlockStatement', body: ['not-a-statement'] },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with body.body containing number elements', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: { type: 'BlockStatement', body: [42, 100] },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with body.type not BlockStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: { type: 'Expression', body: [{ type: 'ReturnStatement' }] },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with kind as empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: '',
        body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement' }] },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with kind as Constructor (capital C)', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'Constructor',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with kind as CONSTRUCTOR (all caps)', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'CONSTRUCTOR',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with type as FunctionDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with type as ArrowFunctionExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'ArrowFunctionExpression',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with type as Property (not MethodDefinition)', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'Property',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with type as FunctionExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'FunctionExpression',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined type', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: undefined,
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined kind', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: undefined,
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined body', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: undefined,
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention constructor in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports[0].message).toContain('constructor')
    })

    test('should mention return in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports[0].message).toContain('return')
    })

    test('should have consistent message format', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))
      visitor.MethodDefinition(createMethodDefinition('constructor', true, 2, 0))

      expect(reports[0].message).toBe('Unexpected return in constructor.')
      expect(reports[1].message).toBe('Unexpected return in constructor.')
    })

    test('message should be a non-empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('message should start with uppercase letter', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports[0].message[0]).toBe(reports[0].message[0].toUpperCase())
    })

    test('message should end with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('message should be exactly "Unexpected return in constructor."', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports[0].message).toBe('Unexpected return in constructor.')
    })

    test('message should not have extra leading whitespace', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports[0].message).toBe(reports[0].message.trimStart())
    })

    test('message should not have extra trailing whitespace', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports[0].message).toBe(reports[0].message.trimEnd())
    })

    test('message should contain the word Unexpected', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports[0].message).toContain('Unexpected')
    })

    test('message should be the same across multiple invocations', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.MethodDefinition(createMethodDefinition('constructor', true, i + 1, 0))
      }

      const firstMessage = reports[0].message
      for (const report of reports) {
        expect(report.message).toBe(firstMessage)
      }
    })
  })

  describe('location reporting', () => {
    test('should report correct location for constructor with return', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true, 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true, 5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report location at line 1, column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true, 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true, 500, 20))

      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report location at high column number', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true, 10, 100))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(100)
    })

    test('should report end position with correct line offset', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true, 5, 0))

      expect(reports[0].loc?.end.line).toBe(10)
    })

    test('should report correct locations for multiple violations', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true, 1, 0))
      visitor.MethodDefinition(createMethodDefinition('constructor', true, 5, 4))
      visitor.MethodDefinition(createMethodDefinition('constructor', true, 20, 8))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.column).toBe(4)
      expect(reports[2].loc?.start.line).toBe(20)
      expect(reports[2].loc?.start.column).toBe(8)
    })

    test('should include loc in report descriptor', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports[0].loc).toBeDefined()
      expect(typeof reports[0].loc?.start).toBe('object')
      expect(typeof reports[0].loc?.end).toBe('object')
    })

    test('should have numeric line and column in start', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true, 3, 7))

      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should have numeric line and column in end', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true, 3, 7))

      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })
  })

  describe('report descriptor structure', () => {
    test('report should have message property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports[0]).toHaveProperty('message')
    })

    test('report should have loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports[0]).toHaveProperty('loc')
    })

    test('report should have exactly 2 properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
    })

    test('report loc should have start property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports[0].loc).toHaveProperty('start')
    })

    test('report loc should have end property', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports[0].loc).toHaveProperty('end')
    })

    test('report loc start should have line and column', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports[0].loc?.start).toHaveProperty('line')
      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('report loc end should have line and column', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports[0].loc?.end).toHaveProperty('line')
      expect(reports[0].loc?.end).toHaveProperty('column')
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({
        source: 'class Foo {}',
        filePath: '/project/src/foo.ts',
      })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({
        source: 'class Bar { constructor() { return 1; } }',
        filePath: '/src/file.ts',
      })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace roots', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/custom/file.ts',
        getAST: () => null,
        getSource: () => 'class A {}',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/custom',
      } as unknown as RuleContext

      const visitor = noConstructorReturnRule.create(context)
      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports.length).toBe(1)
    })

    test('should work with extra options that are ignored', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ strict: true, level: 'max' }],
        source: 'class Foo {}',
      })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports.length).toBe(1)
    })

    test('should work when called multiple times with same visitor', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true, 1, 0))
      visitor.MethodDefinition(createMethodDefinition('constructor', true, 2, 0))
      visitor.MethodDefinition(createMethodDefinition('constructor', true, 3, 0))
      visitor.MethodDefinition(createMethodDefinition('constructor', true, 4, 0))
      visitor.MethodDefinition(createMethodDefinition('constructor', true, 5, 0))

      expect(reports.length).toBe(5)
    })

    test('should work with mix of reporting and non-reporting calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true, 1, 0))
      visitor.MethodDefinition(createMethodDefinition('method', true, 2, 0))
      visitor.MethodDefinition(createMethodDefinition('constructor', false, 3, 0))
      visitor.MethodDefinition(createMethodDefinition('constructor', true, 4, 0))
      visitor.MethodDefinition(createMethodDefinition('get', true, 5, 0))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(4)
    })

    test('should work with context that has no options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'class Foo {}',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noConstructorReturnRule.create(context)
      visitor.MethodDefinition(createMethodDefinition('constructor', true))

      expect(reports.length).toBe(1)
    })
  })

  describe('export verification', () => {
    test('should have default export', async () => {
      const module = await import('../../../../src/rules/patterns/no-constructor-return.js')
      expect(module.default).toBeDefined()
    })

    test('named export should be an object', () => {
      expect(typeof noConstructorReturnRule).toBe('object')
      expect(noConstructorReturnRule).not.toBeNull()
    })

    test('should have create method', () => {
      expect(typeof noConstructorReturnRule.create).toBe('function')
    })

    test('should have meta property', () => {
      expect(noConstructorReturnRule).toHaveProperty('meta')
    })

    test('create should be a function', () => {
      expect(typeof noConstructorReturnRule.create).toBe('function')
    })

    test('meta should be an object', () => {
      expect(typeof noConstructorReturnRule.meta).toBe('object')
    })
  })

  describe('multiple reports', () => {
    test('should track each report separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true, 1, 0))
      visitor.MethodDefinition(createMethodDefinition('constructor', true, 2, 0))

      expect(reports).toHaveLength(2)
      expect(reports[0]).not.toBe(reports[1])
    })

    test('should track messages for each report', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true, 1, 0))
      visitor.MethodDefinition(createMethodDefinition('constructor', true, 2, 0))

      expect(reports[0].message).toBe('Unexpected return in constructor.')
      expect(reports[1].message).toBe('Unexpected return in constructor.')
    })

    test('should track locations for each report separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      visitor.MethodDefinition(createMethodDefinition('constructor', true, 1, 0))
      visitor.MethodDefinition(createMethodDefinition('constructor', true, 10, 5))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.line).toBe(10)
      expect(reports[1].loc?.start.column).toBe(5)
    })

    test('should accumulate reports across many calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.MethodDefinition(createMethodDefinition('constructor', true, i + 1, 0))
      }

      expect(reports).toHaveLength(50)
    })

    test('should not accumulate reports for non-violations', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      for (let i = 0; i < 100; i++) {
        visitor.MethodDefinition(createMethodDefinition('method', true, i + 1, 0))
      }

      expect(reports).toHaveLength(0)
    })

    test('should correctly count mixed violations and non-violations', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.MethodDefinition(
          createMethodDefinition(i % 2 === 0 ? 'constructor' : 'method', true, i + 1, 0),
        )
      }

      expect(reports).toHaveLength(5)
    })
  })

  describe('visitor isolation', () => {
    test('two visitors from same context should share reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor1 = noConstructorReturnRule.create(context)
      const visitor2 = noConstructorReturnRule.create(context)

      visitor1.MethodDefinition(createMethodDefinition('constructor', true, 1, 0))
      visitor2.MethodDefinition(createMethodDefinition('constructor', true, 2, 0))

      expect(reports).toHaveLength(2)
    })

    test('visitors from different contexts should have separate reports', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'class Foo {}' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'class Foo {}' })

      const visitor1 = noConstructorReturnRule.create(ctx1)
      const visitor2 = noConstructorReturnRule.create(ctx2)

      visitor1.MethodDefinition(createMethodDefinition('constructor', true))
      visitor2.MethodDefinition(createMethodDefinition('constructor', true))
      visitor2.MethodDefinition(createMethodDefinition('constructor', true))

      expect(r1).toHaveLength(1)
      expect(r2).toHaveLength(2)
    })

    test('reusing same visitor should accumulate correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      expect(reports).toHaveLength(0)
      visitor.MethodDefinition(createMethodDefinition('constructor', true))
      expect(reports).toHaveLength(1)
      visitor.MethodDefinition(createMethodDefinition('constructor', true))
      expect(reports).toHaveLength(2)
    })
  })

  describe('body statements with non-ReturnStatement types', () => {
    test('should not report for BlockStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'BlockStatement', body: [] }],
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for BreakStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'BreakStatement', label: null }],
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for ContinueStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ContinueStatement', label: null }],
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for DebuggerStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [{ type: 'DebuggerStatement' }],
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for WithStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'WithStatement',
              object: { type: 'Identifier', name: 'obj' },
              body: { type: 'BlockStatement', body: [] },
            },
          ],
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for LabeledStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'LabeledStatement',
              label: { type: 'Identifier', name: 'loop' },
              body: { type: 'BlockStatement', body: [] },
            },
          ],
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should detect ReturnStatement among other statement types', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            { type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'x' } },
            { type: 'DebuggerStatement' },
            { type: 'ReturnStatement', argument: null },
            { type: 'BreakStatement', label: null },
          ],
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('additional meta checks', () => {
    test('meta.docs.description should be longer than 10 characters', () => {
      expect(noConstructorReturnRule.meta.docs?.description.length).toBeGreaterThan(10)
    })

    test('meta.docs.description should not contain double spaces', () => {
      expect(noConstructorReturnRule.meta.docs?.description).not.toContain('  ')
    })

    test('meta.docs.url should contain codeforge', () => {
      expect(noConstructorReturnRule.meta.docs?.url).toContain('codeforge')
    })

    test('rule should be frozen or have stable structure', () => {
      const meta1 = noConstructorReturnRule.meta
      const meta2 = noConstructorReturnRule.meta
      expect(meta1).toBe(meta2)
    })

    test('create should return new visitor object each call', () => {
      const { context } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor1 = noConstructorReturnRule.create(context)
      const visitor2 = noConstructorReturnRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('additional edge cases', () => {
    test('should handle node with body as empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {},
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested body.body with ReturnStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'IfStatement',
              test: { type: 'Literal', value: true },
              consequent: {
                type: 'BlockStatement',
                body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } }],
              },
            },
            { type: 'ReturnStatement', argument: { type: 'Literal', value: 2 } },
          ],
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        static: false,
        computed: false,
        key: { type: 'Identifier', name: 'constructor' },
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(1)
    })

    test('should handle NaN as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      expect(() => visitor.MethodDefinition(Number.NaN)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle BigInt as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      expect(() => visitor.MethodDefinition(BigInt(123))).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Symbol as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      expect(() => visitor.MethodDefinition(Symbol('test'))).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Map as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      expect(() => visitor.MethodDefinition(new Map())).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('constructor without return - various bodies', () => {
    test('should not report constructor with only assignment expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'AssignmentExpression',
                operator: '=',
                left: {
                  type: 'MemberExpression',
                  object: { type: 'ThisExpression' },
                  property: { type: 'Identifier', name: 'x' },
                },
                right: { type: 'Literal', value: 1 },
              },
            },
          ],
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with for-in loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ForInStatement',
              left: { type: 'Identifier', name: 'key' },
              right: { type: 'Identifier', name: 'obj' },
              body: { type: 'BlockStatement', body: [] },
            },
          ],
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with for-of loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ForOfStatement',
              left: { type: 'Identifier', name: 'item' },
              right: { type: 'Identifier', name: 'arr' },
              body: { type: 'BlockStatement', body: [] },
            },
          ],
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })

    test('should not report constructor with do-while loop', () => {
      const { context, reports } = createMockRuleContext({ source: 'class Foo {}' })
      const visitor = noConstructorReturnRule.create(context)

      const node = {
        type: 'MethodDefinition',
        kind: 'constructor',
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'DoWhileStatement',
              test: { type: 'Literal', value: false },
              body: { type: 'BlockStatement', body: [] },
            },
          ],
        },
      }
      visitor.MethodDefinition(node)

      expect(reports.length).toBe(0)
    })
  })
})

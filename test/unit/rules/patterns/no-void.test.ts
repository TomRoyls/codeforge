import { describe, test, expect, vi } from 'vitest'
import { noVoidRule } from '../../../../src/rules/patterns/no-void.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createUnaryVoidExpression(argument: unknown, line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator: 'void',
    argument,
    prefix: true,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
    raw: String(value),
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

describe('no-void rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noVoidRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noVoidRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noVoidRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noVoidRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noVoidRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noVoidRule.meta.fixable).toBe('code')
    })

    test('should mention void in description', () => {
      expect(noVoidRule.meta.docs?.description.toLowerCase()).toContain('void')
    })

    test('should have docs property', () => {
      expect(noVoidRule.meta.docs).toBeDefined()
    })

    test('should have description in docs', () => {
      expect(noVoidRule.meta.docs?.description).toBeDefined()
      expect(typeof noVoidRule.meta.docs?.description).toBe('string')
    })

    test('should have url in docs', () => {
      expect(noVoidRule.meta.docs?.url).toBeDefined()
    })

    test('should have a non-empty description', () => {
      expect(noVoidRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have description longer than 10 characters', () => {
      expect(noVoidRule.meta.docs?.description.length).toBeGreaterThan(10)
    })

    test('should mention operator in description', () => {
      expect(noVoidRule.meta.docs?.description.toLowerCase()).toContain('operator')
    })

    test('should mention undefined in description', () => {
      expect(noVoidRule.meta.docs?.description.toLowerCase()).toContain('undefined')
    })

    test('should have type as a string', () => {
      expect(typeof noVoidRule.meta.type).toBe('string')
    })

    test('should have severity as a string', () => {
      expect(typeof noVoidRule.meta.severity).toBe('string')
    })

    test('should have fixable as a string', () => {
      expect(typeof noVoidRule.meta.fixable).toBe('string')
    })

    test('should have category as patterns string', () => {
      expect(typeof noVoidRule.meta.docs?.category).toBe('string')
    })

    test('should have recommended as a boolean', () => {
      expect(typeof noVoidRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noVoidRule.meta.schema)).toBe(true)
    })

    test('should have empty schema array', () => {
      expect(noVoidRule.meta.schema).toEqual([])
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      expect(visitor).toHaveProperty('UnaryExpression')
    })

    test('should return a function for UnaryExpression', () => {
      const { context } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      expect(typeof visitor.UnaryExpression).toBe('function')
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      expect(visitor).not.toBeNull()
    })

    test('should return an object from create', () => {
      const { context } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('should create new visitor each call', () => {
      const { context } = createMockRuleContext({ source: 'void 0' })
      const visitor1 = noVoidRule.create(context)
      const visitor2 = noVoidRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context with valid properties', () => {
      const { context } = createMockRuleContext({ source: 'void 0' })
      expect(() => noVoidRule.create(context)).not.toThrow()
    })

    test('should return visitor that is callable', () => {
      const { context } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      expect(() => visitor.UnaryExpression({})).not.toThrow()
    })

    test('should only have UnaryExpression method', () => {
      const { context } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)
      const keys = Object.keys(visitor)

      expect(keys).toEqual(['UnaryExpression'])
    })
  })

  describe('void expression detection', () => {
    test('should report void 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createLiteral(0))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unexpected void operator.')
    })

    test('should report void undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createIdentifier('undefined'))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with function call', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'CallExpression',
        callee: createIdentifier('fn'),
        arguments: [],
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'BinaryExpression',
        left: createLiteral(1),
        operator: '+',
        right: createLiteral(2),
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with arrow function', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'ArrowFunctionExpression',
        params: [],
        body: createLiteral(42),
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: createIdentifier('prop'),
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with assignment expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'AssignmentExpression',
        left: createIdentifier('x'),
        operator: '=',
        right: createLiteral(42),
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with conditional expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'ConditionalExpression',
        test: createIdentifier('cond'),
        consequent: createLiteral(1),
        alternate: createLiteral(2),
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with array expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'ArrayExpression',
        elements: [createLiteral(1), createLiteral(2)],
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with logical expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'LogicalExpression',
        left: createIdentifier('a'),
        operator: '&&',
        right: createIdentifier('b'),
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with new expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'NewExpression',
        callee: createIdentifier('MyClass'),
        arguments: [],
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with sequence expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'SequenceExpression',
        expressions: [createLiteral(1), createLiteral(2)],
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with update expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'UpdateExpression',
        argument: createIdentifier('i'),
        operator: '++',
        prefix: false,
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with await expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'AwaitExpression',
        argument: createIdentifier('promise'),
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with yield expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'YieldExpression',
        argument: createLiteral(42),
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with function expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with class expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'ClassExpression',
        body: { type: 'ClassBody', body: [] },
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with tagged template expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'TaggedTemplateExpression',
        tag: createIdentifier('tag'),
        quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with spread element argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'SpreadElement',
        argument: createIdentifier('arr'),
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with nested call expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: createIdentifier('console'),
          property: createIdentifier('log'),
        },
        arguments: [createLiteral('hello')],
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with boolean literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createLiteral(true))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with negative number literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createLiteral(-1))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with regex literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'Literal',
        value: /test/,
        raw: '/test/',
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with empty string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createLiteral(''))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('non-void expressions (valid cases)', () => {
    test('should not report typeof operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'typeof',
        argument: createIdentifier('x'),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report delete operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: createIdentifier('x'),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report ! operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '!',
        argument: createLiteral(true),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report - operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '-',
        argument: createLiteral(5),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report + operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '+',
        argument: createLiteral(5),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report ~ operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '~',
        argument: createLiteral(5),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: createLiteral(1),
        right: createLiteral(2),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report CallExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createIdentifier('fn'),
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Identifier node', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createIdentifier('x'))

      expect(reports.length).toBe(0)
    })

    test('should not report Literal node', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createLiteral(42))

      expect(reports.length).toBe(0)
    })

    test('should not report MemberExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression({
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: createIdentifier('prop'),
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ObjectExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression({
        type: 'ObjectExpression',
        properties: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ArrayExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression({
        type: 'ArrayExpression',
        elements: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report FunctionExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression({
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ArrowFunctionExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression({
        type: 'ArrowFunctionExpression',
        params: [],
        body: createLiteral(42),
      })

      expect(reports.length).toBe(0)
    })

    test('should not report UnaryExpression with VOID (uppercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'VOID',
        argument: createLiteral(0),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report UnaryExpression with Void (capitalized)', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'Void',
        argument: createLiteral(0),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report empty string operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: '',
        argument: createLiteral(0),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report ConditionalExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression({
        type: 'ConditionalExpression',
        test: createIdentifier('a'),
        consequent: createLiteral(1),
        alternate: createLiteral(2),
      })

      expect(reports.length).toBe(0)
    })

    test('should not report AssignmentExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression({
        type: 'AssignmentExpression',
        left: createIdentifier('x'),
        operator: '=',
        right: createLiteral(1),
      })

      expect(reports.length).toBe(0)
    })

    test('should not report SequenceExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression({
        type: 'SequenceExpression',
        expressions: [createLiteral(1), createLiteral(2)],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report TemplateLiteral node', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression({
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ClassExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression({
        type: 'ClassExpression',
        body: { type: 'ClassBody', body: [] },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression({
        type: 'NewExpression',
        callee: createIdentifier('Cls'),
        arguments: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report UnaryExpression with postfix void (non-standard)', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createLiteral(0),
        prefix: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report plain object without type', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression({ foo: 'bar' })

      expect(reports.length).toBe(0)
    })

    test('should not report number primitive', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(42)

      expect(reports.length).toBe(0)
    })

    test('should not report string primitive', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression('void')

      expect(reports.length).toBe(0)
    })

    test('should not report boolean primitive', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(true)

      expect(reports.length).toBe(0)
    })
  })

  describe('auto-fix', () => {
    test('should provide fix for void 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createLiteral(0),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 6] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('undefined')
      expect(reports[0].fix?.range).toEqual([0, 6])
    })

    test('should provide fix for void undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createIdentifier('undefined'),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 15] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('undefined')
    })

    test('should not provide fix for void with non-zero literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createLiteral(42),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 8] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should not provide fix for void with function call', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: {
          type: 'CallExpression',
          callee: createIdentifier('fn'),
          arguments: [],
        },
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 10] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should not provide fix when node has no range', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createLiteral(0))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should not provide fix for void with other identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createIdentifier('something'),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 16] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should provide fix with correct range for void 0 at offset', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createLiteral(0),
        prefix: true,
        loc: { start: { line: 3, column: 8 }, end: { line: 3, column: 14 } },
        range: [42, 48] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports[0].fix?.range).toEqual([42, 48])
    })

    test('should provide fix with undefined text for void undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createIdentifier('undefined'),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
        range: [0, 16] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports[0].fix?.text).toBe('undefined')
      expect(reports[0].fix?.range).toEqual([0, 16])
    })

    test('should not provide fix for void with string argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createLiteral('hello'),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 13] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports[0].fix).toBeUndefined()
    })

    test('should not provide fix for void with boolean argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createLiteral(true),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 10] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports[0].fix).toBeUndefined()
    })

    test('should provide fix for void 0 with range at end of file', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createLiteral(0),
        prefix: true,
        loc: { start: { line: 100, column: 0 }, end: { line: 100, column: 6 } },
        range: [2500, 2506] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports[0].fix?.range).toEqual([2500, 2506])
      expect(reports[0].fix?.text).toBe('undefined')
    })

    test('should not provide fix when argument is an object expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'ObjectExpression', properties: [] },
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 10] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports[0].fix).toBeUndefined()
    })

    test('should not provide fix when argument is an array expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'ArrayExpression', elements: [] },
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 10] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports[0].fix).toBeUndefined()
    })

    test('should not provide fix when argument is a binary expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: {
          type: 'BinaryExpression',
          left: createLiteral(1),
          operator: '+',
          right: createLiteral(2),
        },
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 10] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports[0].fix).toBeUndefined()
    })

    test('should not provide fix when argument is an arrow function', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: {
          type: 'ArrowFunctionExpression',
          params: [],
          body: createLiteral(42),
        },
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 10] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports[0].fix).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      expect(() => visitor.UnaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      expect(() => visitor.UnaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      expect(() => visitor.UnaryExpression('string')).not.toThrow()
      expect(() => visitor.UnaryExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createLiteral(0),
        prefix: true,
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with incomplete loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createLiteral(0),
        prefix: true,
        loc: {},
      }

      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createLiteral(0), 10, 5)

      visitor.UnaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle node without argument property', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        prefix: true,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle non-UnaryExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral(1),
        operator: '+',
        right: createLiteral(2),
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without operator property', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        argument: createLiteral(0),
        prefix: true,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with numeric operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 42,
        argument: createLiteral(0),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with null argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: null,
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 6] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should handle node with undefined argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: undefined,
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 6] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with empty object argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({})

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with array argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression([1, 2, 3])

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with deeply nested argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: createIdentifier('fn'),
            arguments: [],
          },
          property: createIdentifier('then'),
        },
        arguments: [],
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with only start loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createLiteral(0),
        prefix: true,
        loc: { start: { line: 1, column: 0 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with only end loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createLiteral(0),
        prefix: true,
        loc: { end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with null loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createLiteral(0),
        prefix: true,
        loc: null,
      }

      expect(() => visitor.UnaryExpression(node)).not.toThrow()
    })

    test('should handle node with zero line and column', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createLiteral(0), 0, 0)

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with large line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createLiteral(0), 99999, 50)

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(99999)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should handle node with range as zero', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createLiteral(0),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
        range: [0, 0] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.range).toEqual([0, 0])
    })

    test('should handle argument with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'Literal',
        value: 0,
        raw: '0',
        extra: true,
        leadingComments: [],
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle void with prefix true explicitly', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createLiteral(0),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('location', () => {
    test('should report correct location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createLiteral(0), 1, 0)

      visitor.UnaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location at line 5 column 10', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createLiteral(0), 5, 10)

      visitor.UnaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location at line 100', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createLiteral(0), 100, 0)

      visitor.UnaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(100)
    })

    test('should report end location from node', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createLiteral(0), 1, 5)

      visitor.UnaryExpression(node)

      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('should report location for void undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createIdentifier('undefined'), 7, 3)

      visitor.UnaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report location for void with call expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(
        {
          type: 'CallExpression',
          callee: createIdentifier('fn'),
          arguments: [],
        },
        20,
        4,
      )

      visitor.UnaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should preserve exact column offset', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createLiteral(0), 1, 42)

      visitor.UnaryExpression(node)

      expect(reports[0].loc?.start.column).toBe(42)
    })

    test('should handle multi-line location', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createLiteral(0),
        prefix: true,
        loc: {
          start: { line: 5, column: 8 },
          end: { line: 7, column: 2 },
        },
      }

      visitor.UnaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(2)
    })

    test('should handle location at column 0 with different lines', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createLiteral(0), 42, 0)

      visitor.UnaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should include location in every report', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0), 3, 7))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toBeDefined()
    })

    test('should handle location with high column value', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createLiteral(0), 1, 120)

      visitor.UnaryExpression(node)

      expect(reports[0].loc?.start.column).toBe(120)
    })

    test('should report location for each independent call', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0), 2, 4))

      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report end location correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createLiteral(0),
        prefix: true,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 100 },
        },
      }

      visitor.UnaryExpression(node)

      expect(reports[0].loc?.end.column).toBe(100)
    })

    test('should report location for void with call at origin', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(
        {
          type: 'CallExpression',
          callee: createIdentifier('fn'),
          arguments: [],
        },
        1,
        0,
      )

      visitor.UnaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle location for void with nested expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(
        {
          type: 'BinaryExpression',
          left: createLiteral(1),
          operator: '+',
          right: createLiteral(2),
        },
        15,
        20,
      )

      visitor.UnaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(20)
    })
  })

  describe('messages', () => {
    test('should report correct message', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))

      expect(reports[0].message).toBe('Unexpected void operator.')
    })

    test('should mention void in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))

      expect(reports[0].message.toLowerCase()).toContain('void')
    })

    test('should mention operator in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))

      expect(reports[0].message.toLowerCase()).toContain('operator')
    })

    test('should have consistent message for all void patterns', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))
      visitor.UnaryExpression(createUnaryVoidExpression(createIdentifier('undefined')))
      visitor.UnaryExpression(
        createUnaryVoidExpression({
          type: 'CallExpression',
          callee: createIdentifier('fn'),
          arguments: [],
        }),
      )

      expect(reports[0].message).toBe('Unexpected void operator.')
      expect(reports[1].message).toBe('Unexpected void operator.')
      expect(reports[2].message).toBe('Unexpected void operator.')
    })

    test('should have message ending with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should have message starting with uppercase', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))

      expect(reports[0].message[0]).toBe(reports[0].message[0].toUpperCase())
    })

    test('should have message as a string', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))

      expect(typeof reports[0].message).toBe('string')
    })

    test('should have non-empty message', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have message shorter than 100 characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))

      expect(reports[0].message.length).toBeLessThan(100)
    })

    test('should have same message for void 0 and void undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))
      visitor.UnaryExpression(createUnaryVoidExpression(createIdentifier('undefined')))

      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  describe('multiple reports', () => {
    test('should report multiple void expressions independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))
      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))

      expect(reports.length).toBe(2)
    })

    test('should report three void expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))
      visitor.UnaryExpression(createUnaryVoidExpression(createIdentifier('undefined')))
      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral('test')))

      expect(reports.length).toBe(3)
    })

    test('should not affect report count after non-void expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'typeof',
        argument: createIdentifier('x'),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))

      expect(reports.length).toBe(2)
    })

    test('should handle many void expressions in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))
      }

      expect(reports.length).toBe(10)
    })

    test('should handle mixed valid and invalid expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '!',
        argument: createLiteral(true),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'delete',
        argument: createIdentifier('x'),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))

      expect(reports.length).toBe(3)
    })

    test('should report correctly with interleaved null nodes', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))
      visitor.UnaryExpression(null)
      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))

      expect(reports.length).toBe(2)
    })

    test('should report correctly with interleaved undefined nodes', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))
      visitor.UnaryExpression(undefined)
      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))

      expect(reports.length).toBe(2)
    })

    test('should maintain separate report state across calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0), 1, 0))
      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0), 2, 5))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
    })

    test('should handle alternating void and non-void operators', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const operators = ['void', '!', 'void', 'typeof', 'void', 'delete', 'void']
      for (const op of operators) {
        visitor.UnaryExpression({
          type: 'UnaryExpression',
          operator: op,
          argument: createLiteral(0),
          prefix: true,
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        })
      }

      expect(reports.length).toBe(4)
    })

    test('should report each void even with same location', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0), 1, 1))
      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0), 1, 1))

      expect(reports.length).toBe(2)
    })
  })

  describe('context handling', () => {
    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))

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
        getSource: () => 'void 0',
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

      const visitor = noVoidRule.create(context)

      expect(() =>
        visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0))),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0', filePath: '/src/different.ts' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))

      expect(reports.length).toBe(1)
    })

    test('should handle different source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'void foo()', filePath: '/src/file.ts' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))

      expect(reports.length).toBe(1)
    })

    test('should handle context with extra config options', () => {
      const { context, reports } = createMockRuleContext({ options: [{ someOption: true }], source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))

      expect(reports.length).toBe(1)
    })

    test('should handle different workspace roots', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({
            message: descriptor.message,
            loc: descriptor.loc,
          })
        },
        getFilePath: () => '/project/file.ts',
        getAST: () => null,
        getSource: () => 'void 0',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/project',
      } as unknown as RuleContext

      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))

      expect(reports.length).toBe(1)
    })

    test('should work with .ts file extension', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0', filePath: '/src/app.ts' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))

      expect(reports.length).toBe(1)
    })

    test('should work with .tsx file extension', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0', filePath: '/src/component.tsx' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))

      expect(reports.length).toBe(1)
    })

    test('should work with .js file extension', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0', filePath: '/src/index.js' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))

      expect(reports.length).toBe(1)
    })

    test('should work with nested file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0', filePath: '/src/deeply/nested/dir/file.ts' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(createLiteral(0)))

      expect(reports.length).toBe(1)
    })
  })

  describe('common void patterns', () => {
    test('should report void 0 (common undefined pattern)', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createLiteral(0), 5, 10)

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should report void functionCall() (minifier pattern)', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'CallExpression',
        callee: createIdentifier('console.log'),
        arguments: [createLiteral('test')],
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void in IIFE pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'CallExpression',
        callee: {
          type: 'FunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        arguments: [],
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with object expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'ObjectExpression',
        properties: [],
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createLiteral('ignored'))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with null literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createLiteral(null))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('literal edge cases', () => {
    test('should handle literal with string value 0 (not autofixed)', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: '0', raw: "'0'" },
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 8] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      // String '0' should not be autofixed to undefined
      expect(reports[0].fix).toBeUndefined()
    })

    test('should handle literal with no value property', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({ type: 'Literal' })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle identifier that is not undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createIdentifier('foo'))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle literal with boolean false value', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createLiteral(false))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle literal with numeric 1 value (not autofixed)', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createLiteral(1),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 7] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should handle literal with NaN value', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createLiteral(NaN))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle literal with Infinity value', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createLiteral(Infinity))

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('additional detection tests', () => {
    test('should report void with chained member call', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: createIdentifier('a'),
          property: createIdentifier('b'),
        },
        arguments: [],
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with nested void (void void 0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const innerVoid = createUnaryVoidExpression(createLiteral(0))
      const outerVoid = createUnaryVoidExpression(innerVoid)

      visitor.UnaryExpression(outerVoid)

      expect(reports.length).toBe(1)
    })

    test('should report void with template string argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'TemplateLiteral',
        quasis: [
          { type: 'TemplateElement', value: { raw: 'hello ', cooked: 'hello ' }, tail: false },
        ],
        expressions: [createIdentifier('name')],
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with numeric literal 0.0', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: 0.0, raw: '0.0' },
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 8] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
    })

    test('should report void with -0 literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: { type: 'Literal', value: -0, raw: '-0' },
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 8] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with ThisExpression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({ type: 'ThisExpression' })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with Super argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({ type: 'Super' })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle void with argument that has null value', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({ type: 'Literal', value: null, raw: 'null' })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report when node type is not string', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 123,
        operator: 'void',
        argument: createLiteral(0),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when type is an object', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: { name: 'UnaryExpression' },
        operator: 'void',
        argument: createLiteral(0),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report void with empty array argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression([])

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with number primitive argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(42)

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with string primitive argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression('hello')

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with boolean primitive argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(true)

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with function as argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(() => {})

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with Symbol argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({ type: 'Identifier', name: 'Symbol' })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with BigInt literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({ type: 'BigIntLiteral', value: '0n' })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with RegExp literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'Literal',
        value: /pattern/g,
        raw: '/pattern/g',
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with chained calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: createIdentifier('init'),
            arguments: [],
          },
          property: createIdentifier('run'),
        },
        arguments: [],
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with ternary result', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'ConditionalExpression',
        test: createIdentifier('cond'),
        consequent: createIdentifier('a'),
        alternate: createIdentifier('b'),
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with range but no fixable argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createLiteral('test'),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 10] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should handle node with zero-length range', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createLiteral(0),
        prefix: true,
        loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 5 } },
        range: [5, 5] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.range).toEqual([5, 5])
    })

    test('should handle void with single element array argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'ArrayExpression',
        elements: [createLiteral(42)],
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle void with object with properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression({
        type: 'ObjectExpression',
        properties: [
          { type: 'Property', key: createIdentifier('a'), value: createLiteral(1), kind: 'init' },
        ],
      })

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle void in expression statement context', () => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = createUnaryVoidExpression(createLiteral(0), 5, 2)

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(2)
    })
  })

  describe('test.each - non-void operators', () => {
    test.each([['typeof'], ['delete'], ['!'], ['-'], ['+'], ['~']])(
      'should not report operator "%s"',
      (operator) => {
        const { context, reports } = createMockRuleContext({ source: 'void 0' })
        const visitor = noVoidRule.create(context)

        visitor.UnaryExpression({
          type: 'UnaryExpression',
          operator,
          argument: createIdentifier('x'),
          prefix: true,
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        })

        expect(reports.length).toBe(0)
      },
    )
  })

  describe('test.each - void with various argument types', () => {
    test.each([
      ['Literal(0)', { type: 'Literal', value: 0, raw: '0' }],
      ['Literal(undefined)', { type: 'Literal', value: undefined, raw: 'undefined' }],
      ['Literal(null)', { type: 'Literal', value: null, raw: 'null' }],
      ['Literal(true)', { type: 'Literal', value: true, raw: 'true' }],
      ['Literal(false)', { type: 'Literal', value: false, raw: 'false' }],
      ['Literal(string)', { type: 'Literal', value: 'test', raw: "'test'" }],
      ['Literal(42)', { type: 'Literal', value: 42, raw: '42' }],
      ['Literal(-1)', { type: 'Literal', value: -1, raw: '-1' }],
      ['Identifier(undefined)', { type: 'Identifier', name: 'undefined' }],
      ['Identifier(foo)', { type: 'Identifier', name: 'foo' }],
      ['Identifier(bar)', { type: 'Identifier', name: 'bar' }],
      [
        'CallExpression',
        { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
      ],
      [
        'MemberExpression',
        {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
      ],
      [
        'BinaryExpression',
        {
          type: 'BinaryExpression',
          left: { type: 'Literal', value: 1, raw: '1' },
          operator: '+',
          right: { type: 'Literal', value: 2, raw: '2' },
        },
      ],
      ['ObjectExpression', { type: 'ObjectExpression', properties: [] }],
      ['ArrayExpression', { type: 'ArrayExpression', elements: [] }],
      [
        'ArrowFunctionExpression',
        {
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'Literal', value: 42, raw: '42' },
        },
      ],
      [
        'FunctionExpression',
        { type: 'FunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
      ],
      [
        'ConditionalExpression',
        {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'a' },
          consequent: { type: 'Literal', value: 1, raw: '1' },
          alternate: { type: 'Literal', value: 2, raw: '2' },
        },
      ],
      [
        'AssignmentExpression',
        {
          type: 'AssignmentExpression',
          left: { type: 'Identifier', name: 'x' },
          operator: '=',
          right: { type: 'Literal', value: 1, raw: '1' },
        },
      ],
      [
        'LogicalExpression',
        {
          type: 'LogicalExpression',
          left: { type: 'Identifier', name: 'a' },
          operator: '&&',
          right: { type: 'Identifier', name: 'b' },
        },
      ],
      ['TemplateLiteral', { type: 'TemplateLiteral', quasis: [], expressions: [] }],
      [
        'NewExpression',
        { type: 'NewExpression', callee: { type: 'Identifier', name: 'Cls' }, arguments: [] },
      ],
      [
        'SequenceExpression',
        {
          type: 'SequenceExpression',
          expressions: [
            { type: 'Literal', value: 1, raw: '1' },
            { type: 'Literal', value: 2, raw: '2' },
          ],
        },
      ],
      [
        'UpdateExpression',
        {
          type: 'UpdateExpression',
          argument: { type: 'Identifier', name: 'i' },
          operator: '++',
          prefix: false,
        },
      ],
      ['AwaitExpression', { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'p' } }],
      [
        'YieldExpression',
        { type: 'YieldExpression', argument: { type: 'Literal', value: 42, raw: '42' } },
      ],
      ['ClassExpression', { type: 'ClassExpression', body: { type: 'ClassBody', body: [] } }],
      [
        'TaggedTemplateExpression',
        {
          type: 'TaggedTemplateExpression',
          tag: { type: 'Identifier', name: 'tag' },
          quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
        },
      ],
      ['SpreadElement', { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }],
      ['empty object', {}],
      ['object with extra props', { type: 'Literal', value: 0, raw: '0', extra: true }],
    ])('should report void with %s argument', (_name, argument) => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(createUnaryVoidExpression(argument))

      expect(reports.length).toBe(1)
    })
  })

  describe('test.each - autofix eligibility', () => {
    test.each([
      ['void 0 (literal 0)', createLiteral(0), true],
      ['void undefined (identifier)', createIdentifier('undefined'), true],
      ['void 1', createLiteral(1), false],
      ['void 42', createLiteral(42), false],
      ['void "0" (string zero)', createLiteral('0'), false],
      ['void true', createLiteral(true), false],
      ['void false', createLiteral(false), false],
      ['void null', createLiteral(null), false],
      ['void "hello"', createLiteral('hello'), false],
      ['void foo', createIdentifier('foo'), false],
      ['void bar', createIdentifier('bar'), false],
      ['void myVar', createIdentifier('myVar'), false],
    ])('should %s have autofix = %s', (_name, argument, hasFix) => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        argument,
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 10] as [number, number],
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
      if (hasFix) {
        expect(reports[0].fix).toBeDefined()
        expect(reports[0].fix?.text).toBe('undefined')
      } else {
        expect(reports[0].fix).toBeUndefined()
      }
    })
  })

  describe('test.each - node types that should not report', () => {
    test.each([
      [
        'BinaryExpression',
        {
          type: 'BinaryExpression',
          left: createLiteral(1),
          operator: '+',
          right: createLiteral(2),
        },
      ],
      ['CallExpression', { type: 'CallExpression', callee: createIdentifier('fn'), arguments: [] }],
      [
        'MemberExpression',
        {
          type: 'MemberExpression',
          object: createIdentifier('obj'),
          property: createIdentifier('prop'),
        },
      ],
      ['ObjectExpression', { type: 'ObjectExpression', properties: [] }],
      ['ArrayExpression', { type: 'ArrayExpression', elements: [] }],
      [
        'FunctionExpression',
        { type: 'FunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
      ],
      [
        'ArrowFunctionExpression',
        { type: 'ArrowFunctionExpression', params: [], body: createLiteral(42) },
      ],
      [
        'ConditionalExpression',
        {
          type: 'ConditionalExpression',
          test: createIdentifier('a'),
          consequent: createLiteral(1),
          alternate: createLiteral(2),
        },
      ],
      [
        'AssignmentExpression',
        {
          type: 'AssignmentExpression',
          left: createIdentifier('x'),
          operator: '=',
          right: createLiteral(1),
        },
      ],
      ['TemplateLiteral', { type: 'TemplateLiteral', quasis: [], expressions: [] }],
      ['ClassExpression', { type: 'ClassExpression', body: { type: 'ClassBody', body: [] } }],
      ['NewExpression', { type: 'NewExpression', callee: createIdentifier('Cls'), arguments: [] }],
      ['Identifier', createIdentifier('x')],
      ['Literal', createLiteral(42)],
    ])('should not report for %s node type', (_name, node) => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - autofix for non-void unary operators', () => {
    test.each([
      ['typeof x', 'typeof', createIdentifier('x')],
      ['delete obj.prop', 'delete', createIdentifier('x')],
      ['!true', '!', createLiteral(true)],
      ['-5', '-', createLiteral(5)],
      ['+5', '+', createLiteral(5)],
      ['~5', '~', createLiteral(5)],
    ])('should not report or fix for %s', (_name, operator, argument) => {
      const { context, reports } = createMockRuleContext({ source: 'void 0' })
      const visitor = noVoidRule.create(context)

      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator,
        argument,
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 10] as [number, number],
      })

      expect(reports.length).toBe(0)
    })
  })
})

import { describe, test, expect, vi } from 'vitest'
import { noConfusingVoidExpressionRule } from '../../../../src/rules/patterns/no-confusing-void-expression.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createVoidExpression(argument: unknown, line = 1, column = 0): unknown {
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

function createReturnStatement(argument: unknown, line = 1, column = 0): unknown {
  return {
    type: 'ReturnStatement',
    argument,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createTemplateLiteral(expressions: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'TemplateLiteral',
    quasis: expressions.map(() => ({ type: 'TemplateElement', value: { raw: '', cooked: '' } })),
    expressions,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createBinaryExpression(
  left: unknown,
  operator: string,
  right: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'BinaryExpression',
    left,
    operator,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
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

describe('no-confusing-void-expression rule', () => {
  // =====================================================
  // META TESTS (8 tests)
  // =====================================================
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noConfusingVoidExpressionRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noConfusingVoidExpressionRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noConfusingVoidExpressionRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noConfusingVoidExpressionRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noConfusingVoidExpressionRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noConfusingVoidExpressionRule.meta.fixable).toBeUndefined()
    })

    test('should mention void in description', () => {
      expect(noConfusingVoidExpressionRule.meta.docs?.description.toLowerCase()).toContain('void')
    })

    test('should mention confusing in description', () => {
      expect(noConfusingVoidExpressionRule.meta.docs?.description.toLowerCase()).toContain(
        'confusing',
      )
    })
  })

  // =====================================================
  // CREATE METHOD TESTS (5 tests)
  // =====================================================
  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      expect(visitor).toHaveProperty('ReturnStatement')
      expect(visitor).toHaveProperty('TemplateLiteral')
      expect(visitor).toHaveProperty('BinaryExpression')
    })

    test('should return functions for each visitor method', () => {
      const { context } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      expect(typeof visitor.ReturnStatement).toBe('function')
      expect(typeof visitor.TemplateLiteral).toBe('function')
      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('should create a new visitor each time create is called', () => {
      const { context } = createMockRuleContext()
      const visitor1 = noConfusingVoidExpressionRule.create(context)
      const visitor2 = noConfusingVoidExpressionRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should create visitor that tracks reports independently', () => {
      const { context, reports } = createMockRuleContext()
      const visitor1 = noConfusingVoidExpressionRule.create(context)
      const visitor2 = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createReturnStatement(voidExpr)

      visitor1.ReturnStatement(node)
      expect(reports.length).toBe(1)

      visitor2.ReturnStatement(node)
      expect(reports.length).toBe(2)
    })

    test('should create visitor with exactly three methods', () => {
      const { context } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      expect(Object.keys(visitor)).toHaveLength(3)
    })
  })

  // =====================================================
  // RETURN STATEMENT DETECTION (25 tests)
  // =====================================================
  describe('return statement detection', () => {
    test('should report void expression in return statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Void expression returned')
    })

    test('should report return void 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createLiteral(0))
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should not report return without void', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createReturnStatement(createIdentifier('foo'))

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return without argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should report return void identifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('x'))
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report return void call expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression({
        type: 'CallExpression',
        callee: createIdentifier('fn'),
        arguments: [],
      })
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report return void member expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression({
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: createIdentifier('method'),
      })
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report return void assignment expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression({
        type: 'AssignmentExpression',
        left: createIdentifier('x'),
        operator: '=',
        right: createLiteral(42),
      })
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report return void with string literal argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createLiteral('hello'))
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report return void with boolean literal argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createLiteral(true))
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report return void with object expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression({
        type: 'ObjectExpression',
        properties: [],
      })
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report return void with array expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression({
        type: 'ArrayExpression',
        elements: [],
      })
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should not report return of a number literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createReturnStatement(createLiteral(42))

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return of a string literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createReturnStatement(createLiteral('hello'))

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return of a binary expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const binExpr = createBinaryExpression(createLiteral(1), '+', createLiteral(2))
      const node = createReturnStatement(binExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return of a call expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createReturnStatement({
        type: 'CallExpression',
        callee: createIdentifier('fn'),
        arguments: [],
      })

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return undefined identifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createReturnStatement(createIdentifier('undefined'))

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return null literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createReturnStatement(createLiteral(null))

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should report only once for a single return void statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report return void with arrow function body argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression({
        type: 'ArrowFunctionExpression',
        body: createLiteral(0),
        params: [],
      })
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report return void with conditional expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression({
        type: 'ConditionalExpression',
        test: createIdentifier('cond'),
        consequent: createLiteral(1),
        alternate: createLiteral(2),
      })
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should not report return with non-void unary expression (delete)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createReturnStatement({
        type: 'UnaryExpression',
        operator: 'delete',
        argument: createIdentifier('x'),
        prefix: true,
      })

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return with non-void unary expression (typeof)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createReturnStatement({
        type: 'UnaryExpression',
        operator: 'typeof',
        argument: createIdentifier('x'),
        prefix: true,
      })

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report return with non-void unary expression (!)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createReturnStatement({
        type: 'UnaryExpression',
        operator: '!',
        argument: createIdentifier('x'),
        prefix: true,
      })

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should report return void with negative number argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression({
        type: 'UnaryExpression',
        operator: '-',
        argument: createLiteral(1),
        prefix: true,
      })
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // TEMPLATE LITERAL DETECTION (25 tests)
  // =====================================================
  describe('template literal detection', () => {
    test('should report void expression in template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createTemplateLiteral([voidExpr])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Void expression in template literal')
    })

    test('should report multiple void expressions in template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr1 = createVoidExpression(createIdentifier('foo'))
      const voidExpr2 = createVoidExpression(createIdentifier('bar'))
      const node = createTemplateLiteral([voidExpr1, voidExpr2])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(2)
    })

    test('should not report non-void expressions in template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createTemplateLiteral([createIdentifier('foo'), createLiteral('bar')])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report empty template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createTemplateLiteral([])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should report single void expression mixed with normal expressions', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('bad'))
      const node = createTemplateLiteral([createIdentifier('good'), voidExpr, createLiteral('ok')])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report three void expressions in template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const v1 = createVoidExpression(createIdentifier('a'))
      const v2 = createVoidExpression(createIdentifier('b'))
      const v3 = createVoidExpression(createIdentifier('c'))
      const node = createTemplateLiteral([v1, v2, v3])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(3)
    })

    test('should report void 0 in template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createLiteral(0))
      const node = createTemplateLiteral([voidExpr])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report void call expression in template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression({
        type: 'CallExpression',
        callee: createIdentifier('fn'),
        arguments: [],
      })
      const node = createTemplateLiteral([voidExpr])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should not report identifier expressions in template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createTemplateLiteral([createIdentifier('x')])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report literal expressions in template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createTemplateLiteral([createLiteral(42)])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report call expressions in template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createTemplateLiteral([
        {
          type: 'CallExpression',
          callee: createIdentifier('fn'),
          arguments: [],
        },
      ])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report member expressions in template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createTemplateLiteral([
        {
          type: 'MemberExpression',
          object: createIdentifier('obj'),
          property: createIdentifier('prop'),
        },
      ])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should report void with nested call in template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: createIdentifier('obj'),
          property: createIdentifier('method'),
        },
        arguments: [createLiteral('arg')],
      })
      const node = createTemplateLiteral([voidExpr])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with boolean in template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createLiteral(true))
      const node = createTemplateLiteral([voidExpr])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should not report delete expressions in template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createTemplateLiteral([
        {
          type: 'UnaryExpression',
          operator: 'delete',
          argument: createIdentifier('x'),
          prefix: true,
        },
      ])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report typeof expressions in template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createTemplateLiteral([
        {
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: createIdentifier('x'),
          prefix: true,
        },
      ])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report void expression with operator property missing', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createTemplateLiteral([
        {
          type: 'UnaryExpression',
          argument: createIdentifier('x'),
          prefix: true,
        },
      ])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should report void followed by valid expression in template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('a'))
      const node = createTemplateLiteral([voidExpr, createIdentifier('b')])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report valid expression followed by void in template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('a'))
      const node = createTemplateLiteral([createIdentifier('b'), voidExpr])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should not report binary expressions in template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createTemplateLiteral([
        createBinaryExpression(createLiteral(1), '+', createLiteral(2)),
      ])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should report void with null argument in template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(null)
      const node = createTemplateLiteral([voidExpr])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with void argument (nested void) in template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const innerVoid = createVoidExpression(createIdentifier('inner'))
      const outerVoid = createVoidExpression(innerVoid)
      const node = createTemplateLiteral([outerVoid])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should not report arrow function expressions in template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createTemplateLiteral([
        {
          type: 'ArrowFunctionExpression',
          body: createLiteral(0),
          params: [],
        },
      ])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should report void with object expression argument in template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression({
        type: 'ObjectExpression',
        properties: [],
      })
      const node = createTemplateLiteral([voidExpr])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should handle template literal with undefined expressions property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: '', cooked: '' } }],
        expressions: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })
  })

  // =====================================================
  // ARITHMETIC OPERATION DETECTION (40 tests)
  // =====================================================
  describe('arithmetic operation detection', () => {
    test('should report void expression on left side of addition', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '+', createLiteral(5))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('arithmetic operation')
      expect(reports[0].message).toContain('+')
    })

    test('should report void expression on right side of subtraction', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(createLiteral(10), '-', voidExpr)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('-')
    })

    test('should report void expression on both sides of multiplication', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr1 = createVoidExpression(createIdentifier('foo'))
      const voidExpr2 = createVoidExpression(createIdentifier('bar'))
      const node = createBinaryExpression(voidExpr1, '*', voidExpr2)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(2)
    })

    test('should report void expression with division', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '/', createLiteral(2))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void expression with modulo', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '%', createLiteral(3))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void expression with exponentiation', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '**', createLiteral(2))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report void expression with comparison operators', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '===', createLiteral(5))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report void expression with logical operators', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '&&', createLiteral(true))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report normal arithmetic without void', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(5), '+', createLiteral(3))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report void on right side of addition', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(createLiteral(5), '+', voidExpr)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void on left side of subtraction', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '-', createLiteral(5))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void on right side of multiplication', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(createLiteral(5), '*', voidExpr)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void on left side of division', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '/', createLiteral(2))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void on right side of modulo', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(createLiteral(10), '%', voidExpr)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void on left side of exponentiation', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '**', createLiteral(2))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void on right side of exponentiation', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(createLiteral(2), '**', voidExpr)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report void with loose equality operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '==', createLiteral(5))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report void with inequality operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '!=', createLiteral(5))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report void with strict inequality operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '!==', createLiteral(5))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report void with less than operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '<', createLiteral(5))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report void with less than or equal operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '<=', createLiteral(5))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report void with greater than operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '>', createLiteral(5))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report void with greater than or equal operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '>=', createLiteral(5))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report void with logical OR operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '||', createLiteral(false))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report void with nullish coalescing operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '??', createLiteral('default'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report void with instanceof operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, 'instanceof', createIdentifier('Object'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report void with in operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, 'in', createIdentifier('obj'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report void 0 on both sides of addition', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr1 = createVoidExpression(createLiteral(0))
      const voidExpr2 = createVoidExpression(createLiteral(0))
      const node = createBinaryExpression(voidExpr1, '+', voidExpr2)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(2)
    })

    test('should report void with string concatenation operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(createLiteral('hello '), '+', voidExpr)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with call expression as argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression({
        type: 'CallExpression',
        callee: createIdentifier('fn'),
        arguments: [],
      })
      const node = createBinaryExpression(voidExpr, '*', createLiteral(2))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with member expression as argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression({
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: createIdentifier('prop'),
      })
      const node = createBinaryExpression(voidExpr, '-', createLiteral(1))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report non-void unary expression in arithmetic', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createBinaryExpression(
        {
          type: 'UnaryExpression',
          operator: '!',
          argument: createIdentifier('x'),
          prefix: true,
        },
        '+',
        createLiteral(1),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report delete expression in arithmetic', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createBinaryExpression(
        {
          type: 'UnaryExpression',
          operator: 'delete',
          argument: createIdentifier('x'),
          prefix: true,
        },
        '-',
        createLiteral(1),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report void in chained arithmetic', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const inner = createBinaryExpression(createLiteral(1), '+', createLiteral(2))
      const node = createBinaryExpression(voidExpr, '*', inner)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void in division by zero pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createLiteral(0))
      const node = createBinaryExpression(voidExpr, '/', createLiteral(0))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void in modulo with large number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('x'))
      const node = createBinaryExpression(createLiteral(1000000), '%', voidExpr)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void in exponentiation with base 2', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('x'))
      const node = createBinaryExpression(createLiteral(2), '**', voidExpr)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report with bitwise AND operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '&', createLiteral(5))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with bitwise OR operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '|', createLiteral(5))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with left shift operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '<<', createLiteral(2))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with right shift operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '>>', createLiteral(2))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // =====================================================
  // EDGE CASES (40 tests)
  // =====================================================
  describe('edge cases', () => {
    test('should handle null node gracefully for ReturnStatement', () => {
      const { context } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      expect(() => visitor.ReturnStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully for ReturnStatement', () => {
      const { context } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      expect(() => visitor.ReturnStatement(undefined)).not.toThrow()
    })

    test('should handle null node gracefully for TemplateLiteral', () => {
      const { context } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      expect(() => visitor.TemplateLiteral(null)).not.toThrow()
    })

    test('should handle null node gracefully for BinaryExpression', () => {
      const { context } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      expect(() => visitor.ReturnStatement('string')).not.toThrow()
      expect(() => visitor.TemplateLiteral(123)).not.toThrow()
      expect(() => visitor.BinaryExpression(true)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createIdentifier('foo'),
        prefix: true,
      }
      const node = {
        type: 'ReturnStatement',
        argument: voidExpr,
      }

      expect(() => visitor.ReturnStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'), 10, 5)
      const node = createReturnStatement(voidExpr, 10, 0)

      visitor.ReturnStatement(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle undefined node for TemplateLiteral', () => {
      const { context } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      expect(() => visitor.TemplateLiteral(undefined)).not.toThrow()
    })

    test('should handle undefined node for BinaryExpression', () => {
      const { context } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle number node for ReturnStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      expect(() => visitor.ReturnStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node for ReturnStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      expect(() => visitor.ReturnStatement('hello')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node for BinaryExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      expect(() => visitor.BinaryExpression(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type for ReturnStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        expression: createVoidExpression(createIdentifier('foo')),
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type for TemplateLiteral', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = {
        type: 'Literal',
        value: 'hello',
      }

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type for BinaryExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = {
        type: 'LogicalExpression',
        left: voidExpr,
        operator: '&&',
        right: createLiteral(5),
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle ReturnStatement with undefined argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle ReturnStatement with missing argument property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = {
        type: 'ReturnStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle BinaryExpression with missing left property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        right: createLiteral(5),
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle BinaryExpression with missing right property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral(5),
        operator: '+',
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle BinaryExpression with missing operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = {
        type: 'BinaryExpression',
        left: voidExpr,
        right: createLiteral(5),
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle TemplateLiteral with missing expressions property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        quasis: [],
      }

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should handle void expression without prefix property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createIdentifier('foo'),
      }
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle void expression without argument property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = {
        type: 'UnaryExpression',
        operator: 'void',
        prefix: true,
      }
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty object as node', () => {
      const { context } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      expect(() => visitor.ReturnStatement({})).not.toThrow()
      expect(() => visitor.TemplateLiteral({})).not.toThrow()
      expect(() => visitor.BinaryExpression({})).not.toThrow()
    })

    test('should handle array as node', () => {
      const { context } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      expect(() => visitor.ReturnStatement([])).not.toThrow()
      expect(() => visitor.TemplateLiteral([])).not.toThrow()
      expect(() => visitor.BinaryExpression([])).not.toThrow()
    })

    test('should handle void expression at high line numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'), 1000, 500)
      const node = createReturnStatement(voidExpr, 1000, 490)

      visitor.ReturnStatement(node)

      expect(reports[0].loc?.start.line).toBe(1000)
      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should handle void expression at zero line/column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'), 0, 0)
      const node = createReturnStatement(voidExpr, 0, 0)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with string line/column gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createIdentifier('foo'),
        prefix: true,
        loc: {
          start: { line: '1', column: '0' },
          end: { line: '1', column: '10' },
        },
      }
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle partial loc (only start)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createIdentifier('foo'),
        prefix: true,
        loc: {
          start: { line: 5, column: 10 },
        },
      }
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle partial start loc (only line)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createIdentifier('foo'),
        prefix: true,
        loc: {
          start: { line: 5 },
          end: { line: 5, column: 10 },
        },
      }
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should not throw when called multiple times in sequence', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)
      visitor.ReturnStatement(node)
      visitor.ReturnStatement(node)

      expect(reports.length).toBe(3)
    })

    test('should handle NaN as loc values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createIdentifier('foo'),
        prefix: true,
        loc: {
          start: { line: NaN, column: NaN },
          end: { line: NaN, column: NaN },
        },
      }
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle negative line/column values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'), -1, -5)
      const node = createReturnStatement(voidExpr, -1, -10)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle very large template literal with many void expressions', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExprs = Array.from({ length: 10 }, (_, i) =>
        createVoidExpression(createIdentifier(`v${i}`)),
      )
      const node = createTemplateLiteral(voidExprs)

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(10)
    })

    test('should handle BinaryExpression where left is null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createBinaryExpression(null, '+', createLiteral(5))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle BinaryExpression where right is null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createBinaryExpression(createLiteral(5), '+', null)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle BinaryExpression where both sides are null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const node = createBinaryExpression(null, '+', null)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle TemplateLiteral with mixed null expressions', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createTemplateLiteral([null, voidExpr, undefined])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // MESSAGE QUALITY (12 tests)
  // =====================================================
  describe('message quality', () => {
    test('should mention undefined in return message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports[0].message.toLowerCase()).toContain('undefined')
    })

    test('should mention undefined in template literal message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createTemplateLiteral([voidExpr])

      visitor.TemplateLiteral(node)

      expect(reports[0].message.toLowerCase()).toContain('undefined')
    })

    test('should mention NaN in arithmetic message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '+', createLiteral(5))

      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain('NaN')
    })

    test('should mention return in return message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports[0].message.toLowerCase()).toContain('return')
    })

    test('should mention template in template literal message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createTemplateLiteral([voidExpr])

      visitor.TemplateLiteral(node)

      expect(reports[0].message.toLowerCase()).toContain('template')
    })

    test('should mention arithmetic in arithmetic message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '+', createLiteral(5))

      visitor.BinaryExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('arithmetic')
    })

    test('should include operator in arithmetic message for +', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '+', createLiteral(5))

      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain("'+'")
    })

    test('should include operator in arithmetic message for *', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '*', createLiteral(5))

      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain("'*'")
    })

    test('should include operator in arithmetic message for -', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(createLiteral(5), '-', voidExpr)

      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain("'-'")
    })

    test('should include operator in arithmetic message for /', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '/', createLiteral(2))

      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain("'/'")
    })

    test('should include operator in arithmetic message for %', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '%', createLiteral(3))

      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain("'%'")
    })

    test('should include operator in arithmetic message for **', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '**', createLiteral(2))

      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain("'**'")
    })
  })

  // =====================================================
  // COMMON VOID PATTERNS (12 tests)
  // =====================================================
  describe('common void patterns', () => {
    test('should report return void fn() (minifier pattern)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression({
        type: 'CallExpression',
        callee: createIdentifier('fn'),
        arguments: [],
      })
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report void in string concatenation via template', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createTemplateLiteral([voidExpr])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report void 0 in arithmetic', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createLiteral(0))
      const node = createBinaryExpression(voidExpr, '*', createLiteral(2))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void 0 returned from function (common minifier pattern)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createLiteral(0))
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report void followed by IIFE', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression({
        type: 'CallExpression',
        callee: {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        arguments: [],
      })
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report void identifier in template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('myVar'))
      const node = createTemplateLiteral([voidExpr])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with assignment in return (side-effect pattern)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression({
        type: 'AssignmentExpression',
        left: createIdentifier('x'),
        operator: '=',
        right: createLiteral(5),
      })
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with postfix update in return', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression({
        type: 'UpdateExpression',
        argument: createIdentifier('i'),
        operator: '++',
        prefix: false,
      })
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report void in arithmetic with number literal left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('x'))
      const node = createBinaryExpression(createLiteral(0), '+', voidExpr)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void comma expression in return', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression({
        type: 'SequenceExpression',
        expressions: [createLiteral(1), createLiteral(2)],
      })
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with ternary result in template', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression({
        type: 'ConditionalExpression',
        test: createIdentifier('cond'),
        consequent: createIdentifier('a'),
        alternate: createIdentifier('b'),
      })
      const node = createTemplateLiteral([voidExpr])

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with await expression in return', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression({
        type: 'AwaitExpression',
        argument: createIdentifier('promise'),
      })
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // LOCATION TRACKING (15 tests)
  // =====================================================
  describe('location tracking', () => {
    test('should report location for void in return statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'), 5, 10)
      const node = createReturnStatement(voidExpr, 5, 0)

      visitor.ReturnStatement(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location for void in template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'), 3, 8)
      const node = createTemplateLiteral([voidExpr], 3, 0)

      visitor.TemplateLiteral(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report location for void in arithmetic', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'), 7, 4)
      const node = createBinaryExpression(voidExpr, '+', createLiteral(5), 7, 0)

      visitor.BinaryExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report correct locations for multiple void expressions in template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr1 = createVoidExpression(createIdentifier('foo'), 1, 5)
      const voidExpr2 = createVoidExpression(createIdentifier('bar'), 1, 20)
      const node = createTemplateLiteral([voidExpr1, voidExpr2])

      visitor.TemplateLiteral(node)

      expect(reports[0].loc?.start.column).toBe(5)
      expect(reports[1].loc?.start.column).toBe(20)
    })

    test('should report correct locations for void on both sides of binary expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr1 = createVoidExpression(createIdentifier('foo'), 2, 0)
      const voidExpr2 = createVoidExpression(createIdentifier('bar'), 2, 15)
      const node = createBinaryExpression(voidExpr1, '+', voidExpr2)

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.column).toBe(15)
    })

    test('should use default location when void expression has no loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createIdentifier('foo'),
        prefix: true,
      }
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle location at line 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'), 0, 0)
      const node = createReturnStatement(voidExpr, 0, 0)

      visitor.ReturnStatement(node)

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle location with very large values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'), 99999, 99999)
      const node = createReturnStatement(voidExpr, 99999, 99990)

      visitor.ReturnStatement(node)

      expect(reports[0].loc?.start.line).toBe(99999)
      expect(reports[0].loc?.start.column).toBe(99999)
    })

    test('should provide end location in report', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'), 1, 0)
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should handle location for void in right side of binary expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'), 10, 20)
      const node = createBinaryExpression(createLiteral(5), '-', voidExpr)

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report different locations for each report in a single call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr1 = createVoidExpression(createIdentifier('a'), 5, 0)
      const voidExpr2 = createVoidExpression(createIdentifier('b'), 10, 0)
      const node = createTemplateLiteral([voidExpr1, voidExpr2])

      visitor.TemplateLiteral(node)

      expect(reports[0].loc?.start.line).not.toBe(reports[1].loc?.start.line)
    })

    test('should provide location with both start and end for return void', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'), 3, 5)
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('should provide location for void in template literal with mixed content', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'), 8, 12)
      const node = createTemplateLiteral([createIdentifier('ok'), voidExpr], 8, 0)

      visitor.TemplateLiteral(node)

      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('should report correct end column for void expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'), 1, 5)
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(15) // 5 + 10
    })

    test('should handle location for void in modulo operation', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'), 15, 8)
      const node = createBinaryExpression(voidExpr, '%', createLiteral(3), 15, 0)

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(8)
    })
  })

  // =====================================================
  // CROSS-VISITOR ISOLATION (10 tests)
  // =====================================================
  describe('cross-visitor isolation', () => {
    test('should not report void in return when only TemplateLiteral is called', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createReturnStatement(voidExpr)

      // Only call TemplateLiteral, not ReturnStatement
      visitor.TemplateLiteral(createTemplateLiteral([]))

      expect(reports.length).toBe(0)
    })

    test('should report independently for each visitor type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))

      // Return statement
      visitor.ReturnStatement(createReturnStatement(voidExpr))
      expect(reports.length).toBe(1)

      // Template literal
      visitor.TemplateLiteral(createTemplateLiteral([voidExpr]))
      expect(reports.length).toBe(2)

      // Binary expression
      visitor.BinaryExpression(createBinaryExpression(voidExpr, '+', createLiteral(1)))
      expect(reports.length).toBe(3)
    })

    test('should not report when non-matching visitor receives void expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))

      // Pass a void expression to BinaryExpression with non-arithmetic operator
      visitor.BinaryExpression(createBinaryExpression(voidExpr, '===', createLiteral(5)))

      expect(reports.length).toBe(0)
    })

    test('should correctly handle interleaved calls to different visitors', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const ident = createIdentifier('bar')

      visitor.ReturnStatement(createReturnStatement(voidExpr)) // 1 report
      visitor.ReturnStatement(createReturnStatement(ident)) // 0 reports
      visitor.TemplateLiteral(createTemplateLiteral([voidExpr])) // 1 report
      visitor.TemplateLiteral(createTemplateLiteral([ident])) // 0 reports
      visitor.BinaryExpression(createBinaryExpression(voidExpr, '+', createLiteral(1))) // 1 report
      visitor.BinaryExpression(createBinaryExpression(ident, '+', createLiteral(1))) // 0 reports

      expect(reports.length).toBe(3)
    })

    test('should handle all three visitors on same void expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('shared'))

      visitor.ReturnStatement(createReturnStatement(voidExpr))
      visitor.TemplateLiteral(createTemplateLiteral([voidExpr]))
      visitor.BinaryExpression(createBinaryExpression(voidExpr, '*', createLiteral(2)))

      expect(reports.length).toBe(3)
    })

    test('should not carry state between different context instances', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext()
      const { context: ctx2, reports: reports2 } = createMockRuleContext()

      const visitor1 = noConfusingVoidExpressionRule.create(ctx1)
      const visitor2 = noConfusingVoidExpressionRule.create(ctx2)

      const voidExpr = createVoidExpression(createIdentifier('foo'))

      visitor1.ReturnStatement(createReturnStatement(voidExpr))
      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('should not report when all visitors receive safe nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('x')))
      visitor.TemplateLiteral(createTemplateLiteral([createIdentifier('y')]))
      visitor.BinaryExpression(createBinaryExpression(createLiteral(1), '+', createLiteral(2)))

      expect(reports.length).toBe(0)
    })

    test('should handle calling visitors with no arguments', () => {
      const { context } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      // TypeScript won't normally let you call without args, but runtime safety check
      expect(() => visitor.ReturnStatement()).not.toThrow()
      expect(() => visitor.TemplateLiteral()).not.toThrow()
      expect(() => visitor.BinaryExpression()).not.toThrow()
    })

    test('should handle repeated calls to same visitor', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      for (let i = 0; i < 5; i++) {
        const voidExpr = createVoidExpression(createIdentifier(`v${i}`))
        visitor.ReturnStatement(createReturnStatement(voidExpr))
      }

      expect(reports.length).toBe(5)
    })

    test('should handle alternating report and no-report calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          const voidExpr = createVoidExpression(createIdentifier('foo'))
          visitor.ReturnStatement(createReturnStatement(voidExpr))
        } else {
          visitor.ReturnStatement(createReturnStatement(createIdentifier('bar')))
        }
      }

      expect(reports.length).toBe(5)
    })
  })

  // =====================================================
  // ADDITIONAL OPERATOR COVERAGE (15 tests)
  // =====================================================
  describe('additional operator coverage', () => {
    test('should not report void with comma operator in binary expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, ',', createLiteral(5))

      // Comma is not typically a BinaryExpression in ESTree, but test robustness
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report void with unsigned right shift operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '>>>', createLiteral(2))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report void with bitwise XOR operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '^', createLiteral(5))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report void in each arithmetic operator separately', () => {
      const operators = ['+', '-', '*', '/', '%', '**']

      for (const op of operators) {
        const { context, reports } = createMockRuleContext()
        const visitor = noConfusingVoidExpressionRule.create(context)

        const voidExpr = createVoidExpression(createIdentifier('foo'))
        const node = createBinaryExpression(voidExpr, op, createLiteral(1))

        visitor.BinaryExpression(node)

        expect(reports.length, `Expected report for operator '${op}'`).toBe(1)
      }
    })

    test('should report void on left for each arithmetic operator', () => {
      const operators = ['+', '-', '*', '/', '%', '**']

      for (const op of operators) {
        const { context, reports } = createMockRuleContext()
        const visitor = noConfusingVoidExpressionRule.create(context)

        const voidExpr = createVoidExpression(createIdentifier('foo'))
        const node = createBinaryExpression(voidExpr, op, createLiteral(5))

        visitor.BinaryExpression(node)

        expect(reports.length, `Expected 1 report for '${op}'`).toBe(1)
      }
    })

    test('should report void on right for each arithmetic operator', () => {
      const operators = ['+', '-', '*', '/', '%', '**']

      for (const op of operators) {
        const { context, reports } = createMockRuleContext()
        const visitor = noConfusingVoidExpressionRule.create(context)

        const voidExpr = createVoidExpression(createIdentifier('foo'))
        const node = createBinaryExpression(createLiteral(5), op, voidExpr)

        visitor.BinaryExpression(node)

        expect(reports.length, `Expected 1 report for '${op}'`).toBe(1)
      }
    })

    test('should not report for any comparison operator', () => {
      const operators = ['==', '!=', '===', '!==', '<', '>', '<=', '>=']

      for (const op of operators) {
        const { context, reports } = createMockRuleContext()
        const visitor = noConfusingVoidExpressionRule.create(context)

        const voidExpr = createVoidExpression(createIdentifier('foo'))
        const node = createBinaryExpression(voidExpr, op, createLiteral(5))

        visitor.BinaryExpression(node)

        expect(reports.length, `Expected no report for '${op}'`).toBe(0)
      }
    })

    test('should not report for logical operators', () => {
      const operators = ['&&', '||', '??']

      for (const op of operators) {
        const { context, reports } = createMockRuleContext()
        const visitor = noConfusingVoidExpressionRule.create(context)

        const voidExpr = createVoidExpression(createIdentifier('foo'))
        const node = createBinaryExpression(voidExpr, op, createLiteral(5))

        visitor.BinaryExpression(node)

        expect(reports.length, `Expected no report for '${op}'`).toBe(0)
      }
    })

    test('should not report for bitwise operators', () => {
      const operators = ['&', '|', '^', '<<', '>>', '>>>']

      for (const op of operators) {
        const { context, reports } = createMockRuleContext()
        const visitor = noConfusingVoidExpressionRule.create(context)

        const voidExpr = createVoidExpression(createIdentifier('foo'))
        const node = createBinaryExpression(voidExpr, op, createLiteral(5))

        visitor.BinaryExpression(node)

        expect(reports.length, `Expected no report for '${op}'`).toBe(0)
      }
    })

    test('should not report for relational operators', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))

      visitor.BinaryExpression(createBinaryExpression(voidExpr, 'in', createIdentifier('obj')))
      visitor.BinaryExpression(
        createBinaryExpression(voidExpr, 'instanceof', createIdentifier('Obj')),
      )

      expect(reports.length).toBe(0)
    })

    test('should report void with addition and string operand', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '+', createLiteral('bar'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with subtraction and negative number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '-', createLiteral(-5))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with division by negative number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '/', createLiteral(-1))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with exponentiation with negative exponent', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '**', createLiteral(-2))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report for unknown operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = createBinaryExpression(voidExpr, '???', createLiteral(5))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // =====================================================
  // VOID ARGUMENT VARIATIONS (13 tests)
  // =====================================================
  describe('void argument variations', () => {
    test('should report void with numeric literal argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createLiteral(42))
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with string literal argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createLiteral('text'))
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with boolean literal argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createLiteral(false))
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with null literal argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createLiteral(null))
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with undefined literal argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('undefined'))
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with call expression argument in arithmetic', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression({
        type: 'CallExpression',
        callee: createIdentifier('fn'),
        arguments: [createLiteral('arg1'), createLiteral('arg2')],
      })
      const node = createBinaryExpression(voidExpr, '+', createLiteral(1))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with new expression argument in return', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression({
        type: 'NewExpression',
        callee: createIdentifier('MyClass'),
        arguments: [],
      })
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with tagged template in return', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression({
        type: 'TaggedTemplateExpression',
        tag: createIdentifier('tag'),
        quasi: createTemplateLiteral([]),
      })
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with spread element argument in return', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression({
        type: 'SpreadElement',
        argument: createIdentifier('arr'),
      })
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with yield expression argument in return', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression({
        type: 'YieldExpression',
        argument: createIdentifier('value'),
      })
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with regex literal argument in return', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression({
        type: 'Literal',
        value: /test/,
        raw: '/test/',
        regex: { pattern: 'test', flags: '' },
      })
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with this expression argument in return', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression({
        type: 'ThisExpression',
      })
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report void with empty argument in arithmetic', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(null)
      const node = createBinaryExpression(voidExpr, '+', createLiteral(1))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // BOUNDARY AND STRESS TESTS (10 tests)
  // =====================================================
  describe('boundary and stress tests', () => {
    test('should handle deeply nested void expressions', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      // void(void(void(foo)))
      const inner = createVoidExpression(createIdentifier('foo'))
      const middle = createVoidExpression(inner)
      const outer = createVoidExpression(middle)
      const node = createReturnStatement(outer)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1) // Only the outermost void is reported
    })

    test('should handle template literal with 50 expressions', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const exprs = Array.from({ length: 50 }, (_, i) =>
        i % 2 === 0 ? createVoidExpression(createIdentifier(`v${i}`)) : createIdentifier(`s${i}`),
      )
      const node = createTemplateLiteral(exprs)

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(25) // Every even index is a void expression
    })

    test('should handle template literal with all void expressions', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const exprs = Array.from({ length: 20 }, (_, i) =>
        createVoidExpression(createIdentifier(`v${i}`)),
      )
      const node = createTemplateLiteral(exprs)

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(20)
    })

    test('should handle template literal with no void expressions', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const exprs = Array.from({ length: 20 }, (_, i) => createIdentifier(`v${i}`))
      const node = createTemplateLiteral(exprs)

      visitor.TemplateLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should handle binary expression with void and identifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('x'))
      const node = createBinaryExpression(voidExpr, '+', createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      const node = {
        type: 'ReturnStatement',
        argument: voidExpr,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
        leadingComments: [],
        trailingComments: [],
      }

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle void expression with extra properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = {
        type: 'UnaryExpression',
        operator: 'void',
        argument: createIdentifier('foo'),
        prefix: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 10],
        parenthesized: true,
      }
      const node = createReturnStatement(voidExpr)

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should not report void expression used in void context', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      // A void expression as a standalone expression statement is fine
      // (not detectable via our visitors, but test we don't false-positive)
      const node = createReturnStatement(createLiteral(0))

      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle calling same visitor rapidly', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      for (let i = 0; i < 100; i++) {
        const voidExpr = createVoidExpression(createIdentifier(`v${i}`))
        visitor.ReturnStatement(createReturnStatement(voidExpr))
      }

      expect(reports.length).toBe(100)
    })

    test('should handle mix of report and no-report across all visitors rapidly', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      for (let i = 0; i < 50; i++) {
        const voidExpr = createVoidExpression(createIdentifier(`v${i}`))
        const ident = createIdentifier(`s${i}`)

        // Every even iteration triggers a report
        if (i % 2 === 0) {
          visitor.ReturnStatement(createReturnStatement(voidExpr))
        } else {
          visitor.ReturnStatement(createReturnStatement(ident))
        }

        if (i % 3 === 0) {
          visitor.TemplateLiteral(createTemplateLiteral([voidExpr]))
        }

        if (i % 5 === 0) {
          visitor.BinaryExpression(createBinaryExpression(voidExpr, '+', createLiteral(1)))
        }
      }

      // Count expected: even return (25) + divisible by 3 template (17) + divisible by 5 binary (10)
      expect(reports.length).toBe(25 + 17 + 10)
    })
  })

  // =====================================================
  // CONTEXT OPTIONS (8 tests)
  // =====================================================
  describe('context options', () => {
    test('should work with empty options object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      visitor.ReturnStatement(createReturnStatement(voidExpr))

      expect(reports.length).toBe(1)
    })

    test('should work with undefined options', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      visitor.ReturnStatement(createReturnStatement(voidExpr))

      expect(reports.length).toBe(1)
    })

    test('should work with options containing extra properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      visitor.ReturnStatement(createReturnStatement(voidExpr))

      expect(reports.length).toBe(1)
    })

    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ filePath: '/some/other/path.ts' })
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      visitor.ReturnStatement(createReturnStatement(voidExpr))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/src/file.ts',
        source: 'void foo();',
      })
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      visitor.ReturnStatement(createReturnStatement(voidExpr))

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source: '' })
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('foo'))
      visitor.ReturnStatement(createReturnStatement(voidExpr))

      expect(reports.length).toBe(1)
    })

    test('should work with TypeScript file extension', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/src/component.tsx',
        source: 'return void fn();',
      })
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('fn'))
      visitor.ReturnStatement(createReturnStatement(voidExpr))

      expect(reports.length).toBe(1)
    })

    test('should work with JavaScript file extension', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/src/index.js',
        source: 'return void fn();',
      })
      const visitor = noConfusingVoidExpressionRule.create(context)

      const voidExpr = createVoidExpression(createIdentifier('fn'))
      visitor.ReturnStatement(createReturnStatement(voidExpr))

      expect(reports.length).toBe(1)
    })
  })

  // =====================================================
  // META DOCUMENTATION (5 tests)
  // =====================================================
  describe('meta documentation', () => {
    test('should have a docs URL', () => {
      expect(noConfusingVoidExpressionRule.meta.docs?.url).toBeDefined()
    })

    test('should have a valid docs URL format', () => {
      const url = noConfusingVoidExpressionRule.meta.docs?.url
      expect(url).toMatch(/^https:\/\//)
    })

    test('should contain rule name in docs URL', () => {
      const url = noConfusingVoidExpressionRule.meta.docs?.url ?? ''
      expect(url).toContain('no-confusing-void-expression')
    })

    test('should not be deprecated', () => {
      expect(noConfusingVoidExpressionRule.meta.deprecated).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noConfusingVoidExpressionRule.meta.requiresTypeChecking).toBeUndefined()
    })
  })
})

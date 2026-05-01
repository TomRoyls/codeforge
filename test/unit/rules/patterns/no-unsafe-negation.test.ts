import { describe, expect, test, vi } from 'vitest'
import { noUnsafeNegationRule } from '../../../../src/rules/patterns/no-unsafe-negation.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function makeIdentifier(name: string, line = 1, column = 0): unknown {
  return { type: 'Identifier', name, loc: { start: { line, column }, end: { line, column: column + name.length } } }
}

function makeBinaryExpr(operator: string, left: unknown, right: unknown, line = 1, column = 0): unknown {
  return { type: 'BinaryExpression', operator, left, right, loc: { start: { line, column }, end: { line, column: column + 10 } } }
}

function makeUnaryExpr(operator: string, argument: unknown, line = 1, column = 0): unknown {
  return { type: 'UnaryExpression', operator, prefix: true, argument, loc: { start: { line, column }, end: { line, column: column + 10 } } }
}

// ===== META TESTS (8) =====

describe('no-unsafe-negation rule', () => {
  describe('meta', () => {
    test('should have correct type "problem"', () => {
      expect(noUnsafeNegationRule.meta.type).toBe('problem')
    })

    test('should have severity "error"', () => {
      expect(noUnsafeNegationRule.meta.severity).toBe('error')
    })

    test('should have correct category "correctness"', () => {
      expect(noUnsafeNegationRule.meta.docs?.category).toBe('correctness')
    })

    test('should be recommended', () => {
      expect(noUnsafeNegationRule.meta.docs?.recommended).toBe(true)
    })

    test('should have a description', () => {
      expect(noUnsafeNegationRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning relational operators', () => {
      const desc = noUnsafeNegationRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/relational/)
    })

    test('should have fixable undefined', () => {
      expect(noUnsafeNegationRule.meta.fixable).toBeUndefined()
    })

    test('should have empty schema', () => {
      expect(noUnsafeNegationRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with UnaryExpression', () => {
      const { context } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      expect(visitor).toHaveProperty('UnaryExpression')
      expect(typeof visitor.UnaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnsafeNegationRule).toBeDefined()
      expect(noUnsafeNegationRule.meta).toBeDefined()
      expect(noUnsafeNegationRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNSAFE NEGATION WITH "in" (20) =====

  describe('positive cases — reports unsafe negation with "in"', () => {
    test('reports !a in b pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', makeIdentifier('a'), makeIdentifier('b'))))
      expect(reports.length).toBe(1)
    })

    test('report message mentions negating', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', makeIdentifier('a'), makeIdentifier('b'))))
      expect(reports[0].message.toLowerCase()).toContain('negating')
    })

    test('report message contains "in" operator', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', makeIdentifier('a'), makeIdentifier('b'))))
      expect(reports[0].message).toContain("'in'")
    })

    test('report has loc property', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', makeIdentifier('a'), makeIdentifier('b'))))
      expect(reports[0].loc).toBeDefined()
    })

    test('report loc has start and end', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', makeIdentifier('a'), makeIdentifier('b'))))
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('report loc reflects the unary node location', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', makeIdentifier('a'), makeIdentifier('b')), 3, 5))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('report message is exactly as defined in the rule source for "in"', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', makeIdentifier('a'), makeIdentifier('b'))))
      expect(reports[0].message).toBe("Unexpected negating the left operand of 'in' operator.")
    })

    test('reports with complex left operand: !obj.prop in arr', () => {
      const { context, reports } = createMockRuleContext({ source: '!(obj.prop in arr)' })
      const visitor = noUnsafeNegationRule.create(context)
      const prop = { type: 'MemberExpression', object: makeIdentifier('obj'), property: makeIdentifier('prop'), loc: { start: { line: 1, column: 1 }, end: { line: 1, column: 8 } } }
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', prop, makeIdentifier('arr'))))
      expect(reports.length).toBe(1)
    })

    test('reports with longer identifier names', () => {
      const { context, reports } = createMockRuleContext({ source: '!(namespace in module)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', makeIdentifier('namespace'), makeIdentifier('module'))))
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', makeIdentifier('a'), makeIdentifier('b'))))
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', makeIdentifier('x'), makeIdentifier('y'))))
      expect(reports.length).toBe(2)
    })

    test('all reports for "in" have the same message', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', makeIdentifier('a'), makeIdentifier('b'))))
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', makeIdentifier('x'), makeIdentifier('y'))))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports with CallExpression as right operand', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in fn())' })
      const visitor = noUnsafeNegationRule.create(context)
      const right = { type: 'CallExpression', callee: makeIdentifier('fn'), arguments: [], loc: { start: { line: 1, column: 7 }, end: { line: 1, column: 11 } } }
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', makeIdentifier('a'), right)))
      expect(reports.length).toBe(1)
    })

    test('reports with CallExpression as left operand', () => {
      const { context, reports } = createMockRuleContext({ source: '!(fn() in arr)' })
      const visitor = noUnsafeNegationRule.create(context)
      const left = { type: 'CallExpression', callee: makeIdentifier('fn'), arguments: [], loc: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } } }
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', left, makeIdentifier('arr'))))
      expect(reports.length).toBe(1)
    })

    test('reports with numeric literal as left operand', () => {
      const { context, reports } = createMockRuleContext({ source: '!(1 in arr)' })
      const visitor = noUnsafeNegationRule.create(context)
      const left = { type: 'Literal', value: 1, loc: { start: { line: 1, column: 1 }, end: { line: 1, column: 2 } } }
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', left, makeIdentifier('arr'))))
      expect(reports.length).toBe(1)
    })

    test('reports with string literal as right operand', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in "prop")' })
      const visitor = noUnsafeNegationRule.create(context)
      const right = { type: 'Literal', value: 'prop', loc: { start: { line: 1, column: 7 }, end: { line: 1, column: 13 } } }
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', makeIdentifier('a'), right)))
      expect(reports.length).toBe(1)
    })

    test('reports with ThisExpression as right operand', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in this)' })
      const visitor = noUnsafeNegationRule.create(context)
      const right = { type: 'ThisExpression', loc: { start: { line: 1, column: 7 }, end: { line: 1, column: 11 } } }
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', makeIdentifier('a'), right)))
      expect(reports.length).toBe(1)
    })

    test('reports with ArrayExpression as right operand', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in [])' })
      const visitor = noUnsafeNegationRule.create(context)
      const right = { type: 'ArrayExpression', elements: [], loc: { start: { line: 1, column: 7 }, end: { line: 1, column: 9 } } }
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', makeIdentifier('a'), right)))
      expect(reports.length).toBe(1)
    })

    test('reports with computed member as right operand', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in obj[key])' })
      const visitor = noUnsafeNegationRule.create(context)
      const right = { type: 'MemberExpression', object: makeIdentifier('obj'), property: makeIdentifier('key'), computed: true, loc: { start: { line: 1, column: 7 }, end: { line: 1, column: 16 } } }
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', makeIdentifier('a'), right)))
      expect(reports.length).toBe(1)
    })

    test('reports with single-letter identifiers', () => {
      const { context, reports } = createMockRuleContext({ source: '!(x in y)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', makeIdentifier('x'), makeIdentifier('y'))))
      expect(reports.length).toBe(1)
    })

    test('reports regardless of prefix field value', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      const node = { type: 'UnaryExpression', operator: '!', argument: makeBinaryExpr('in', makeIdentifier('a'), makeIdentifier('b')), prefix: false, loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } } }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // ===== POSITIVE CASES — REPORTS UNSAFE NEGATION WITH "instanceof" (10) =====

  describe('positive cases — reports unsafe negation with "instanceof"', () => {
    test('reports !a instanceof B pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a instanceof B)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('instanceof', makeIdentifier('a'), makeIdentifier('B'))))
      expect(reports.length).toBe(1)
    })

    test('report message contains "instanceof" operator', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a instanceof B)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('instanceof', makeIdentifier('a'), makeIdentifier('B'))))
      expect(reports[0].message).toContain("'instanceof'")
    })

    test('report message is exactly as defined for "instanceof"', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a instanceof B)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('instanceof', makeIdentifier('a'), makeIdentifier('B'))))
      expect(reports[0].message).toBe("Unexpected negating the left operand of 'instanceof' operator.")
    })

    test('reports with complex left operand: !obj.method() instanceof Klass', () => {
      const { context, reports } = createMockRuleContext({ source: '!(obj.method() instanceof Klass)' })
      const visitor = noUnsafeNegationRule.create(context)
      const callExpr = { type: 'CallExpression', callee: { type: 'MemberExpression', object: makeIdentifier('obj'), property: makeIdentifier('method') }, arguments: [], loc: { start: { line: 1, column: 1 }, end: { line: 1, column: 13 } } }
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('instanceof', callExpr, makeIdentifier('Klass'))))
      expect(reports.length).toBe(1)
    })

    test('reports with ThisExpression as left operand', () => {
      const { context, reports } = createMockRuleContext({ source: '!(this instanceof MyClass)' })
      const visitor = noUnsafeNegationRule.create(context)
      const left = { type: 'ThisExpression', loc: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } } }
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('instanceof', left, makeIdentifier('MyClass'))))
      expect(reports.length).toBe(1)
    })

    test('reports with longer identifier names for instanceof', () => {
      const { context, reports } = createMockRuleContext({ source: '!(controller instanceof BaseController)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('instanceof', makeIdentifier('controller'), makeIdentifier('BaseController'))))
      expect(reports.length).toBe(1)
    })

    test('accumulates reports for multiple "instanceof" violations', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a instanceof B)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('instanceof', makeIdentifier('a'), makeIdentifier('B'))))
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('instanceof', makeIdentifier('x'), makeIdentifier('Y'))))
      expect(reports.length).toBe(2)
    })

    test('report loc reflects unary node location for instanceof', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a instanceof B)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('instanceof', makeIdentifier('a'), makeIdentifier('B')), 5, 2))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('reports with NewExpression as left operand', () => {
      const { context, reports } = createMockRuleContext({ source: '!(new Obj() instanceof Base)' })
      const visitor = noUnsafeNegationRule.create(context)
      const left = { type: 'NewExpression', callee: makeIdentifier('Obj'), arguments: [], loc: { start: { line: 1, column: 1 }, end: { line: 1, column: 8 } } }
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('instanceof', left, makeIdentifier('Base'))))
      expect(reports.length).toBe(1)
    })

    test('reports with member expression as right operand', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a instanceof ns.MyType)' })
      const visitor = noUnsafeNegationRule.create(context)
      const right = { type: 'MemberExpression', object: makeIdentifier('ns'), property: makeIdentifier('MyType'), loc: { start: { line: 1, column: 15 }, end: { line: 1, column: 25 } } }
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('instanceof', makeIdentifier('a'), right)))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (30) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for double negation !!a in b', () => {
      const { context, reports } = createMockRuleContext({ source: '!!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      const innerBinary = makeBinaryExpr('in', makeIdentifier('a'), makeIdentifier('b'))
      const innerUnary = makeUnaryExpr('!', innerBinary)
      const outerUnary = makeUnaryExpr('!', innerUnary)
      visitor.UnaryExpression(outerUnary)
      expect(reports.length).toBe(0)
    })

    test('does not report for negation of non-relational binary: !(a + b)', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a + b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('+', makeIdentifier('a'), makeIdentifier('b'))))
      expect(reports.length).toBe(0)
    })

    test('does not report for negation of === operator', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a === b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('===', makeIdentifier('a'), makeIdentifier('b'))))
      expect(reports.length).toBe(0)
    })

    test('does not report for negation of !== operator', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a !== b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('!==', makeIdentifier('a'), makeIdentifier('b'))))
      expect(reports.length).toBe(0)
    })

    test('does not report for negation of < operator', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a < b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('<', makeIdentifier('a'), makeIdentifier('b'))))
      expect(reports.length).toBe(0)
    })

    test('does not report for negation of > operator', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a > b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('>', makeIdentifier('a'), makeIdentifier('b'))))
      expect(reports.length).toBe(0)
    })

    test('does not report for negation of <= operator', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a <= b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('<=', makeIdentifier('a'), makeIdentifier('b'))))
      expect(reports.length).toBe(0)
    })

    test('does not report for negation of >= operator', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a >= b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('>=', makeIdentifier('a'), makeIdentifier('b'))))
      expect(reports.length).toBe(0)
    })

    test('does not report for negation of * operator', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a * b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('*', makeIdentifier('a'), makeIdentifier('b'))))
      expect(reports.length).toBe(0)
    })

    test('does not report for negation of - operator', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a - b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('-', makeIdentifier('a'), makeIdentifier('b'))))
      expect(reports.length).toBe(0)
    })

    test('does not report for negation of / operator', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a / b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('/', makeIdentifier('a'), makeIdentifier('b'))))
      expect(reports.length).toBe(0)
    })

    test('does not report for negation of % operator', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a % b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('%', makeIdentifier('a'), makeIdentifier('b'))))
      expect(reports.length).toBe(0)
    })

    test('does not report for negation of ** operator', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a ** b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('**', makeIdentifier('a'), makeIdentifier('b'))))
      expect(reports.length).toBe(0)
    })

    test('does not report for negation of & operator', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a & b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('&', makeIdentifier('a'), makeIdentifier('b'))))
      expect(reports.length).toBe(0)
    })

    test('does not report for negation of && operator (LogicalExpression)', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a && b)' })
      const visitor = noUnsafeNegationRule.create(context)
      const logical = { type: 'LogicalExpression', operator: '&&', left: makeIdentifier('a'), right: makeIdentifier('b'), loc: { start: { line: 1, column: 1 }, end: { line: 1, column: 6 } } }
      visitor.UnaryExpression(makeUnaryExpr('!', logical))
      expect(reports.length).toBe(0)
    })

    test('does not report for negation of || operator (LogicalExpression)', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a || b)' })
      const visitor = noUnsafeNegationRule.create(context)
      const logical = { type: 'LogicalExpression', operator: '||', left: makeIdentifier('a'), right: makeIdentifier('b'), loc: { start: { line: 1, column: 1 }, end: { line: 1, column: 6 } } }
      visitor.UnaryExpression(makeUnaryExpr('!', logical))
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression with typeof operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'typeof a' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('typeof', makeIdentifier('a')))
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression with void operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'void a' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('void', makeIdentifier('a')))
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression with delete operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete a' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('delete', makeIdentifier('a')))
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression with ~ operator', () => {
      const { context, reports } = createMockRuleContext({ source: '~a' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('~', makeIdentifier('a')))
      expect(reports.length).toBe(0)
    })

    test('does not report for !identifier (simple negation)', () => {
      const { context, reports } = createMockRuleContext({ source: '!a' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeIdentifier('a')))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockRuleContext({ source: '!a' })
      const visitor = noUnsafeNegationRule.create(context)
      expect(() => visitor.UnaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockRuleContext({ source: '!a' })
      const visitor = noUnsafeNegationRule.create(context)
      expect(() => visitor.UnaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: '!a' })
      const visitor = noUnsafeNegationRule.create(context)
      expect(() => visitor.UnaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for non-object node (string)', () => {
      const { context, reports } = createMockRuleContext({ source: '!a' })
      const visitor = noUnsafeNegationRule.create(context)
      expect(() => visitor.UnaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for non-object node (number)', () => {
      const { context, reports } = createMockRuleContext({ source: '!a' })
      const visitor = noUnsafeNegationRule.create(context)
      expect(() => visitor.UnaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for node with wrong type (Identifier)', () => {
      const { context, reports } = createMockRuleContext({ source: '!a' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeIdentifier('foo'))
      expect(reports.length).toBe(0)
    })

    test('does not report for node with wrong type (Literal)', () => {
      const { context, reports } = createMockRuleContext({ source: '!a' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression({ type: 'Literal', value: 42, loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } } })
      expect(reports.length).toBe(0)
    })

    test('does not report for node with wrong type (CallExpression)', () => {
      const { context, reports } = createMockRuleContext({ source: '!a' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression({ type: 'CallExpression', callee: makeIdentifier('fn'), arguments: [], loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } } })
      expect(reports.length).toBe(0)
    })

    test('does not report for !a == b (equality check)', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a == b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('==', makeIdentifier('a'), makeIdentifier('b'))))
      expect(reports.length).toBe(0)
    })


  })

  // ===== EDGE CASES (25) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockRuleContext({ source: '!(a in b)' })
      const { context: ctx2, reports: rep2 } = createMockRuleContext({ source: '!(a in b)' })
      const visitor1 = noUnsafeNegationRule.create(ctx1)
      const visitor2 = noUnsafeNegationRule.create(ctx2)
      visitor1.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', makeIdentifier('a'), makeIdentifier('b'))))
      visitor2.UnaryExpression(makeIdentifier('x'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', makeIdentifier('a'), makeIdentifier('b'))))
      visitor.UnaryExpression(makeIdentifier('foo'))
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('instanceof', makeIdentifier('x'), makeIdentifier('Y'))))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      const binary = { type: 'BinaryExpression', operator: 'in', left: makeIdentifier('a'), right: makeIdentifier('b') }
      const unary = { type: 'UnaryExpression', operator: '!', prefix: true, argument: binary }
      visitor.UnaryExpression(unary)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      const binary = { type: 'BinaryExpression', operator: 'in', left: makeIdentifier('a'), right: makeIdentifier('b') }
      const unary = { type: 'UnaryExpression', operator: '!', prefix: true, argument: binary }
      visitor.UnaryExpression(unary)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', makeIdentifier('a'), makeIdentifier('b'))))
      visitor.UnaryExpression(makeUnaryExpr('!', makeIdentifier('x')))
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('instanceof', makeIdentifier('c'), makeIdentifier('D'))))
      visitor.UnaryExpression(makeUnaryExpr('typeof', makeIdentifier('a')))
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', makeIdentifier('e'), makeIdentifier('f'))))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockRuleContext({ source: '!(a in b)' })
      const visitor1 = noUnsafeNegationRule.create(context)
      const visitor2 = noUnsafeNegationRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnsafeNegationRule.meta
      const meta2 = noUnsafeNegationRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has message property', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', makeIdentifier('a'), makeIdentifier('b'))))
      expect(reports[0]).toHaveProperty('message')
    })

    test('report descriptor has loc property', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', makeIdentifier('a'), makeIdentifier('b'))))
      expect(reports[0]).toHaveProperty('loc')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      const binary = { type: 'BinaryExpression', operator: 'in', left: makeIdentifier('a'), right: makeIdentifier('b'), loc: { start: { line: 1, column: 1 }, end: { line: 1, column: 6 } }, range: [0, 6], extra: true }
      const unary = { type: 'UnaryExpression', operator: '!', prefix: true, argument: binary, loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } }, range: [0, 6], extra: true }
      visitor.UnaryExpression(unary)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      const binary = { type: 'BinaryExpression', operator: 'in', left: makeIdentifier('a'), right: makeIdentifier('b'), loc: {} }
      const unary = { type: 'UnaryExpression', operator: '!', prefix: true, argument: binary, loc: {} }
      visitor.UnaryExpression(unary)
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      const binary = { type: 'BinaryExpression', operator: 'in', left: makeIdentifier('a'), right: makeIdentifier('b'), loc: { start: { line: 3, column: 5 } } }
      const unary = { type: 'UnaryExpression', operator: '!', prefix: true, argument: binary, loc: { start: { line: 3, column: 5 } } }
      visitor.UnaryExpression(unary)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      const unary = makeUnaryExpr('!', makeBinaryExpr('in', makeIdentifier('a'), makeIdentifier('b')))
      visitor.UnaryExpression(unary)
      visitor.UnaryExpression(unary)
      visitor.UnaryExpression(unary)
      expect(reports.length).toBe(3)
    })

    test('rule name is exported correctly', () => {
      expect(noUnsafeNegationRule).toBeDefined()
      expect(typeof noUnsafeNegationRule.create).toBe('function')
      expect(typeof noUnsafeNegationRule.meta).toBe('object')
    })

    test('reports only once per node for same unsafe negation', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', makeIdentifier('a'), makeIdentifier('b'))))
      expect(reports.length).toBe(1)
    })

    test('handles array node', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      expect(() => visitor.UnaryExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('location with specific line/column values preserved', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', makeIdentifier('a'), makeIdentifier('b')), 10, 4))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      const binary = makeBinaryExpr('in', makeIdentifier('a'), makeIdentifier('b'))
      const unary = { type: 'UnaryExpression', operator: '!', prefix: true, argument: binary, loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } }, _parent: {} }
      visitor.UnaryExpression(unary)
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('in', makeIdentifier('a'), makeIdentifier('b'))))
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('instanceof', makeIdentifier('x'), makeIdentifier('Y'))))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('in')
      expect(reports[1].message).toContain('instanceof')
    })

    test('does not report when argument is missing', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      const unary = { type: 'UnaryExpression', operator: '!', prefix: true, loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } } }
      visitor.UnaryExpression(unary)
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      const unary = { type: 'UnaryExpression', operator: '!', prefix: true, argument: null, loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } } }
      visitor.UnaryExpression(unary)
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression with operator undefined', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a in b)' })
      const visitor = noUnsafeNegationRule.create(context)
      const binary = { type: 'BinaryExpression', left: makeIdentifier('a'), right: makeIdentifier('b'), loc: { start: { line: 1, column: 1 }, end: { line: 1, column: 6 } } }
      visitor.UnaryExpression(makeUnaryExpr('!', binary))
      expect(reports.length).toBe(0)
    })

    test('does not report for !a | b (bitwise OR)', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a | b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('|', makeIdentifier('a'), makeIdentifier('b'))))
      expect(reports.length).toBe(0)
    })

    test('does not report for !a ^ b (bitwise XOR)', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a ^ b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('^', makeIdentifier('a'), makeIdentifier('b'))))
      expect(reports.length).toBe(0)
    })

    test('does not report for !a << b (left shift)', () => {
      const { context, reports } = createMockRuleContext({ source: '!(a << b)' })
      const visitor = noUnsafeNegationRule.create(context)
      visitor.UnaryExpression(makeUnaryExpr('!', makeBinaryExpr('<<', makeIdentifier('a'), makeIdentifier('b'))))
      expect(reports.length).toBe(0)
    })
  })
})

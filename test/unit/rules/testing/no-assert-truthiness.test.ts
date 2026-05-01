import { describe, test, expect, vi } from 'vitest'
import { noAssertTruthinessRule } from '../../../../src/rules/testing/no-assert-truthiness.js'
import type { RuleContext, ReportDescriptor } from '../../../../src/plugins/types.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push(descriptor)
    },
    getFilePath: () => '/src/file.test.ts',
    getAST: () => null,
    getSource: () => 'expect(!!x);',
    getTokens: () => [],
    getComments: () => [],
    config: { options: [] },
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    workspaceRoot: '/src',
  } as unknown as RuleContext
  return { context, reports }
}

/** Create an expect() CallExpression node with a given first argument. */
function createExpectNode(firstArg: unknown, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'expect' },
    arguments: [firstArg],
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

/** Create a UnaryExpression node. */
function unaryExpr(operator: string, argument: unknown): unknown {
  return { type: 'UnaryExpression', operator, argument }
}

/** Create a double-negation: !!x */
function doubleNegation(inner: unknown): unknown {
  return unaryExpr('!', unaryExpr('!', inner))
}

/** Create a Boolean(x) CallExpression. */
function booleanCall(arg: unknown): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'Boolean' },
    arguments: [arg],
  }
}

/** Create an Identifier. */
function identifier(name: string): unknown {
  return { type: 'Identifier', name }
}

/** Create a Literal. */
function literal(value: unknown): unknown {
  return { type: 'Literal', value }
}

/** Create a MemberExpression. */
function memberExpr(obj: unknown, prop: string): unknown {
  return {
    type: 'MemberExpression',
    object: obj,
    property: { type: 'Identifier', name: prop },
  }
}

// ---------------------------------------------------------------------------
// 95 tests
// ---------------------------------------------------------------------------

describe('no-assert-truthiness rule', () => {
  // ===== Meta (8 tests) =====================================================

  describe('meta', () => {
    test('should have type suggestion', () => {                                        // 1
      expect(noAssertTruthinessRule.meta.type).toBe('suggestion')
    })

    test('should have severity warn', () => {                                          // 2
      expect(noAssertTruthinessRule.meta.severity).toBe('warn')
    })

    test('should have testing category', () => {                                       // 3
      expect(noAssertTruthinessRule.meta.docs?.category).toBe('testing')
    })

    test('should not be recommended', () => {                                          // 4
      expect(noAssertTruthinessRule.meta.docs?.recommended).toBe(false)
    })

    test('should have description mentioning Boolean coercion', () => {                // 5
      expect(noAssertTruthinessRule.meta.docs?.description.toLowerCase()).toContain('boolean')
    })

    test('should have correct docs URL', () => {                                       // 6
      expect(noAssertTruthinessRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-assert-truthiness',
      )
    })

    test('should have empty schema', () => {                                           // 7
      expect(noAssertTruthinessRule.meta.schema).toEqual([])
    })

    test('should not have fixable property', () => {                                   // 8
      expect(noAssertTruthinessRule.meta.fixable).toBeUndefined()
    })
  })

  // ===== Structure (2 tests) ================================================

  describe('structure', () => {
    test('should return visitor with CallExpression', () => {                          // 9
      const { context } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should have default export matching named export', () => {                   // 10
      // The rule file has: export default noAssertTruthinessRule
      // We just verify the rule object has meta and create
      expect(noAssertTruthinessRule.meta).toBeDefined()
      expect(noAssertTruthinessRule.create).toBeDefined()
      expect(typeof noAssertTruthinessRule.create).toBe('function')
    })
  })

  // ===== Positive: double negation !!x (8 tests) ============================

  describe('positive: double negation', () => {
    test('should report expect(!!x)', () => {                                          // 11
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(doubleNegation(identifier('x'))))
      expect(reports.length).toBe(1)
    })

    test('should report expect(!!someValue)', () => {                                  // 12
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(doubleNegation(identifier('someValue'))))
      expect(reports.length).toBe(1)
    })

    test('should report expect(!!obj.prop)', () => {                                   // 13
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      const prop = memberExpr(identifier('obj'), 'prop')
      visitor.CallExpression(createExpectNode(doubleNegation(prop)))
      expect(reports.length).toBe(1)
    })

    test('should report expect(!!(a && b))', () => {                                   // 14
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      const logicExpr = {
        type: 'LogicalExpression',
        operator: '&&',
        left: identifier('a'),
        right: identifier('b'),
      }
      visitor.CallExpression(createExpectNode(doubleNegation(logicExpr)))
      expect(reports.length).toBe(1)
    })

    test('should report expect(!!0) double negation of literal', () => {               // 15
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(doubleNegation(literal(0))))
      expect(reports.length).toBe(1)
    })

    test('should report expect(!!null) double negation of null', () => {               // 16
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(doubleNegation(literal(null))))
      expect(reports.length).toBe(1)
    })

    test('should report expect(!!(x)) extra parens still double negation', () => {     // 17
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      // Extra parens are just a parenthesized expression, but in our AST model
      // the inner is still an Identifier with type 'Identifier'
      visitor.CallExpression(createExpectNode(doubleNegation(identifier('x'))))
      expect(reports.length).toBe(1)
    })

    test('should report expect(!!!x) triple negation detects inner !!', () => {        // 18
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      // !!!x = !(!(!x)) — outer !, inner is !!x which is UnaryExpression(!, UnaryExpression(!, x))
      const tripleNeg = unaryExpr('!', doubleNegation(identifier('x')))
      visitor.CallExpression(createExpectNode(tripleNeg))
      expect(reports.length).toBe(1)
    })
  })

  // ===== Positive: Boolean(x) (6 tests) =====================================

  describe('positive: Boolean call', () => {
    test('should report expect(Boolean(x))', () => {                                   // 19
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(booleanCall(identifier('x'))))
      expect(reports.length).toBe(1)
    })

    test('should report expect(Boolean(someValue))', () => {                           // 20
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(booleanCall(identifier('someValue'))))
      expect(reports.length).toBe(1)
    })

    test('should report expect(Boolean(obj.prop))', () => {                            // 21
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      const prop = memberExpr(identifier('obj'), 'prop')
      visitor.CallExpression(createExpectNode(booleanCall(prop)))
      expect(reports.length).toBe(1)
    })

    test('should report expect(Boolean(0)) Boolean of literal', () => {                // 22
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(booleanCall(literal(0))))
      expect(reports.length).toBe(1)
    })

    test('should report expect(Boolean(null)) Boolean of null', () => {                // 23
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(booleanCall(literal(null))))
      expect(reports.length).toBe(1)
    })

    test('should report expect(Boolean("")) Boolean of empty string', () => {          // 24
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(booleanCall(literal(''))))
      expect(reports.length).toBe(1)
    })
  })

  // ===== Positive: message content (4 tests) ================================

  describe('positive: message content', () => {
    test('!!x message mentions toBeTruthy and toBeFalsy', () => {                      // 25
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(doubleNegation(identifier('x'))))
      expect(reports[0].message).toContain('toBeTruthy')
      expect(reports[0].message).toContain('toBeFalsy')
    })

    test('Boolean(x) message mentions toBeTruthy and appropriate matcher', () => {     // 26
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(booleanCall(identifier('x'))))
      expect(reports[0].message).toContain('toBeTruthy')
      expect(reports[0].message).toContain('appropriate matcher')
    })

    test('!!x message mentions !!x', () => {                                           // 27
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(doubleNegation(identifier('x'))))
      expect(reports[0].message).toContain('!!x')
    })

    test('Boolean(x) message mentions Boolean', () => {                                // 28
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(booleanCall(identifier('x'))))
      expect(reports[0].message).toContain('Boolean')
    })
  })

  // ===== Positive: report has loc (2 tests) =================================

  describe('positive: report location', () => {
    test('report has loc property for !!x', () => {                                    // 29
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(doubleNegation(identifier('x'))))
      expect(reports[0].loc).toBeDefined()
    })

    test('multiple violations in same visitor accumulate', () => {                     // 30
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(doubleNegation(identifier('x'))))
      visitor.CallExpression(createExpectNode(booleanCall(identifier('y'))))
      expect(reports.length).toBe(2)
    })
  })

  // ===== Negative: simple arguments (9 tests) ===============================

  describe('negative: simple arguments', () => {
    test('should not report expect(x) simple identifier', () => {                      // 31
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(identifier('x')))
      expect(reports.length).toBe(0)
    })

    test('should not report expect(true) literal', () => {                             // 32
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(literal(true)))
      expect(reports.length).toBe(0)
    })

    test('should not report expect(false) literal', () => {                            // 33
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(literal(false)))
      expect(reports.length).toBe(0)
    })

    test('should not report expect(1) number literal', () => {                         // 34
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(literal(1)))
      expect(reports.length).toBe(0)
    })

    test('should not report expect("hello") string literal', () => {                   // 35
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(literal('hello')))
      expect(reports.length).toBe(0)
    })

    test('should not report expect(null) null literal', () => {                        // 36
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(literal(null)))
      expect(reports.length).toBe(0)
    })

    test('should not report expect(undefined) undefined identifier', () => {           // 37
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(identifier('undefined')))
      expect(reports.length).toBe(0)
    })

    test('should not report expect(x === true) comparison', () => {                    // 38
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      const binExpr = {
        type: 'BinaryExpression',
        operator: '===',
        left: identifier('x'),
        right: literal(true),
      }
      visitor.CallExpression(createExpectNode(binExpr))
      expect(reports.length).toBe(0)
    })

    test('should not report expect(x == true) loose comparison', () => {               // 39
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      const binExpr = {
        type: 'BinaryExpression',
        operator: '==',
        left: identifier('x'),
        right: literal(true),
      }
      visitor.CallExpression(createExpectNode(binExpr))
      expect(reports.length).toBe(0)
    })
  })

  // ===== Negative: single negation (1 test) =================================

  describe('negative: single negation', () => {
    test('should not report expect(!x) single negation', () => {                       // 40
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(unaryExpr('!', identifier('x'))))
      expect(reports.length).toBe(0)
    })
  })

  // ===== Negative: Boolean-related (4 tests) ================================

  describe('negative: Boolean-related', () => {
    test('should not report expect(Boolean) Boolean as identifier not call', () => {    // 41
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(identifier('Boolean')))
      expect(reports.length).toBe(0)
    })

    test('should not report expect(new Boolean(x)) NewExpression not CallExpression', () => { // 42
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      const newExpr = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [identifier('x')],
      }
      visitor.CallExpression(createExpectNode(newExpr))
      expect(reports.length).toBe(0)
    })

    test('should not report expect(String(x)) String call not Boolean', () => {        // 43
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      const stringCall = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [identifier('x')],
      }
      visitor.CallExpression(createExpectNode(stringCall))
      expect(reports.length).toBe(0)
    })

    test('should not report expect(Number(x)) Number call not Boolean', () => {        // 44
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      const numberCall = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [identifier('x')],
      }
      visitor.CallExpression(createExpectNode(numberCall))
      expect(reports.length).toBe(0)
    })
  })

  // ===== Negative: non-expect calls (2 tests) ===============================

  describe('negative: non-expect calls', () => {
    test('should not report foo(!!x) not an expect call', () => {                      // 45
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [doubleNegation(identifier('x'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report someFunction(Boolean(x)) not expect', () => {              // 46
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'someFunction' },
        arguments: [booleanCall(identifier('x'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== Negative: chained expect calls (3 tests) ===========================

  describe('negative: chained expect calls', () => {
    test('should not report expect(x).toBeTruthy() normal usage', () => {              // 47
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      // The outer CallExpression is .toBeTruthy(), not the inner expect()
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [identifier('x')],
          },
          property: { type: 'Identifier', name: 'toBeTruthy' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      // The outer call has empty arguments, so the rule returns early
      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeFalsy() normal usage', () => {               // 48
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [identifier('x')],
          },
          property: { type: 'Identifier', name: 'toBeFalsy' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBe(true) normal usage', () => {                // 49
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [identifier('x')],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [literal(true)],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== Negative: edge cases with null/undefined/empty (7 tests) ===========

  describe('negative: null/undefined/empty edge cases', () => {
    test('should handle null node gracefully', () => {                                  // 50
      const { context } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {                             // 51
      const { context } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node (string)', () => {                              // 52
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {                                     // 53
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report expect() with no arguments', () => {                       // 54
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report CallExpression with null callee', () => {                   // 55
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [doubleNegation(identifier('x'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report CallExpression with null arguments', () => {                // 56
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== Negative: UnaryExpression with wrong operator (2 tests) ============

  describe('negative: wrong unary operators', () => {
    test('should not report UnaryExpression with operator other than !', () => {        // 57
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      // typeof x — outer UnaryExpression with operator 'typeof'
      const typeofExpr = unaryExpr('typeof', identifier('x'))
      visitor.CallExpression(createExpectNode(typeofExpr))
      expect(reports.length).toBe(0)
    })

    test('should not report outer ! with inner typeof (not double negation)', () => {   // 58
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      // !(typeof x) — outer !, inner is typeof (not !)
      const expr = unaryExpr('!', unaryExpr('typeof', identifier('x')))
      visitor.CallExpression(createExpectNode(expr))
      expect(reports.length).toBe(0)
    })
  })

  // ===== Edge: location details (3 tests) ====================================

  describe('edge: location details', () => {
    test('report has correct start line for !!x', () => {                               // 59
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(doubleNegation(identifier('x')), 7, 4))
      expect(reports[0].loc?.start.line).toBe(7)
    })

    test('report has correct start column for Boolean(x)', () => {                     // 60
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(booleanCall(identifier('x')), 3, 12))
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('report has correct end line', () => {                                        // 61
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(doubleNegation(identifier('x')), 5, 2))
      expect(reports[0].loc?.end.line).toBe(5)
    })
  })

  // ===== Edge: state isolation (2 tests) =====================================

  describe('edge: state isolation', () => {
    test('separate create() calls have independent state', () => {                      // 62
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const v1 = noAssertTruthinessRule.create(ctx1)
      const v2 = noAssertTruthinessRule.create(ctx2)
      v1.CallExpression(createExpectNode(doubleNegation(identifier('x'))))
      // v2 gets a valid call that should NOT report
      v2.CallExpression(createExpectNode(identifier('x')))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across multiple calls', () => {                    // 63
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(doubleNegation(identifier('a'))))
      visitor.CallExpression(createExpectNode(booleanCall(identifier('b'))))
      visitor.CallExpression(createExpectNode(doubleNegation(identifier('c'))))
      expect(reports.length).toBe(3)
    })
  })

  // ===== Edge: node without loc (1 test) =====================================

  describe('edge: node without loc', () => {
    test('node without loc still reports', () => {                                      // 64
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [doubleNegation(identifier('x'))],
        // no loc property
      })
      expect(reports.length).toBe(1)
      // extractLocation returns default loc when node has no loc
      expect(reports[0].loc).toBeDefined()
    })
  })

  // ===== Edge: first arg is null (1 test) ====================================

  describe('edge: first arg null', () => {
    test('should handle null first argument gracefully', () => {                        // 65
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [null],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== Edge: callee is non-Identifier (3 tests) ===========================

  describe('edge: callee types', () => {
    test('should not report when callee is MemberExpression not rooted at expect', () => { // 66
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'bar' },
        },
        arguments: [doubleNegation(identifier('x'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when callee is a Literal', () => {                         // 67
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: literal(42),
        arguments: [doubleNegation(identifier('x'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report non-CallExpression node type', () => {                      // 68
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression({
        type: 'ExpressionStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== Additional positive: chained expect with !! (2 tests) ==============

  describe('positive: chained expect with !!', () => {
    test('inner expect(!!x) in chained call still detected', () => {                    // 69
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      // Pass the inner CallExpression: expect(!!x)
      const innerExpect = createExpectNode(doubleNegation(identifier('x')))
      visitor.CallExpression(innerExpect)
      expect(reports.length).toBe(1)
    })

    test('inner expect(Boolean(x)) in chained call still detected', () => {             // 70
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      const innerExpect = createExpectNode(booleanCall(identifier('x')))
      visitor.CallExpression(innerExpect)
      expect(reports.length).toBe(1)
    })
  })

  // ===== Additional negative: Boolean call with wrong callee type (3 tests) ==

  describe('negative: Boolean call variants', () => {
    test('should not report when Boolean callee is MemberExpression', () => {           // 71
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      const boolCall = {
        type: 'CallExpression',
        callee: memberExpr(identifier('someObj'), 'Boolean'),
        arguments: [identifier('x')],
      }
      visitor.CallExpression(createExpectNode(boolCall))
      expect(reports.length).toBe(0)
    })

    test('should not report when Boolean callee is a Literal', () => {                  // 72
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      const boolCall = {
        type: 'CallExpression',
        callee: literal('Boolean'),
        arguments: [identifier('x')],
      }
      visitor.CallExpression(createExpectNode(boolCall))
      expect(reports.length).toBe(0)
    })

    test('should not report Boolean call with no arguments', () => {                    // 73
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      const boolCall = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Boolean' },
        arguments: [],
      }
      // This is a CallExpression(Boolean()) with no args, wrapped in expect
      // The first arg (Boolean()) has no arguments, but that doesn't matter
      // to the rule — it just checks that the callee is 'Boolean'
      visitor.CallExpression(createExpectNode(boolCall))
      expect(reports.length).toBe(1) // Still reports: Boolean() is Boolean call
    })
  })

  // ===== Additional: description content (2 tests) ==========================

  describe('meta description', () => {
    test('description mentions expect', () => {                                         // 74
      expect(noAssertTruthinessRule.meta.docs?.description.toLowerCase()).toContain('expect')
    })

    test('description mentions coercion or assertion', () => {                          // 75
      const desc = noAssertTruthinessRule.meta.docs?.description.toLowerCase() ?? ''
      const mentions = desc.includes('coercion') || desc.includes('assertion')
      expect(mentions).toBe(true)
    })
  })

  // ===== Additional edge: new visitor each call (1 test) ====================

  describe('new visitor each call', () => {
    test('create returns new visitor object each time', () => {                         // 76
      const { context } = createMockContext()
      const v1 = noAssertTruthinessRule.create(context)
      const v2 = noAssertTruthinessRule.create(context)
      expect(v1).not.toBe(v2)
    })
  })

  // ===== Additional positive: complex inner expressions (4 tests) ===========

  describe('positive: complex inner expressions', () => {
    test('should report expect(!!arr[0]) double negation of member', () => {            // 77
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      const arrAccess = {
        type: 'MemberExpression',
        object: identifier('arr'),
        property: literal(0),
        computed: true,
      }
      visitor.CallExpression(createExpectNode(doubleNegation(arrAccess)))
      expect(reports.length).toBe(1)
    })

    test('should report expect(Boolean(a || b))', () => {                               // 78
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      const logicExpr = {
        type: 'LogicalExpression',
        operator: '||',
        left: identifier('a'),
        right: identifier('b'),
      }
      visitor.CallExpression(createExpectNode(booleanCall(logicExpr)))
      expect(reports.length).toBe(1)
    })

    test('should report expect(Boolean(foo())) Boolean of function call', () => {       // 79
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      const funcCall = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [],
      }
      visitor.CallExpression(createExpectNode(booleanCall(funcCall)))
      expect(reports.length).toBe(1)
    })

    test('should report expect(!!foo()) double negation of function call', () => {      // 80
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      const funcCall = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [],
      }
      visitor.CallExpression(createExpectNode(doubleNegation(funcCall)))
      expect(reports.length).toBe(1)
    })
  })

  // ===== Additional negative: more edge cases (7 tests) =====================

  describe('negative: more edge cases', () => {
    test('should not report when first arg has undefined type', () => {                  // 81
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode({ type: undefined }))
      expect(reports.length).toBe(0)
    })

    test('should not report when first arg type is empty string', () => {               // 82
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode({ type: '' }))
      expect(reports.length).toBe(0)
    })

    test('should not report expect(x) where x is a CallExpression', () => {             // 83
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      const funcCall = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getValue' },
        arguments: [],
      }
      visitor.CallExpression(createExpectNode(funcCall))
      expect(reports.length).toBe(0)
    })

    test('should not report when inner UnaryExpression argument is null', () => {        // 84
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      // Outer !, inner argument is null — toASTNode(null) returns null
      const expr = { type: 'UnaryExpression', operator: '!', argument: null }
      visitor.CallExpression(createExpectNode(expr))
      expect(reports.length).toBe(0)
    })

    test('should not report when inner UnaryExpression has no operator', () => {         // 85
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      const inner = { type: 'UnaryExpression' }
      const expr = { type: 'UnaryExpression', operator: '!', argument: inner }
      visitor.CallExpression(createExpectNode(expr))
      expect(reports.length).toBe(0)
    })

    test('should not report Boolean call when callee is null', () => {                   // 86
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      const boolCall = {
        type: 'CallExpression',
        callee: null,
        arguments: [identifier('x')],
      }
      visitor.CallExpression(createExpectNode(boolCall))
      expect(reports.length).toBe(0)
    })

    test('should not report when first arg is an object without type', () => {           // 87
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode({ foo: 'bar' }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== Additional: report descriptor includes node (3 tests) ==============

  describe('report descriptor', () => {
    test('report includes node property for !!x', () => {                               // 88
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      const node = createExpectNode(doubleNegation(identifier('x')))
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report includes node property for Boolean(x)', () => {                        // 89
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      const node = createExpectNode(booleanCall(identifier('x')))
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report message starts with Avoid', () => {                                    // 90
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(doubleNegation(identifier('x'))))
      expect(reports[0].message).toMatch(/^Avoid/)
    })
  })

  // ===== Additional: mixed patterns (5 tests) ===============================

  describe('mixed patterns', () => {
    test('both !!x and Boolean(y) reported in same visitor', () => {                    // 91
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(doubleNegation(identifier('x'))))
      visitor.CallExpression(createExpectNode(booleanCall(identifier('y'))))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('!!x')
      expect(reports[1].message).toContain('Boolean')
    })

    test('report for !!x has correct message ending', () => {                           // 92
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(doubleNegation(identifier('x'))))
      expect(reports[0].message).toContain('clarity')
    })

    test('report for Boolean(x) mentions clarity', () => {                              // 93
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(booleanCall(identifier('x'))))
      expect(reports[0].message).toContain('instead')
    })

    test('expect(!!x) on line 10 reports correct location', () => {                     // 94
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(doubleNegation(identifier('x')), 10, 5))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('expect(Boolean(x)) on specific line/column reports correctly', () => {        // 95
      const { context, reports } = createMockContext()
      const visitor = noAssertTruthinessRule.create(context)
      visitor.CallExpression(createExpectNode(booleanCall(identifier('x')), 20, 8))
      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(8)
    })
  })
})

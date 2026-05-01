import { describe, test, expect, vi } from 'vitest'
import { noRedundantExpectRule } from '../../../../src/rules/testing/no-redundant-expect.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({ message: descriptor.message, loc: descriptor.loc })
    },
    getFilePath: () => '/src/file.test.ts',
    getAST: () => null,
    getSource: () => 'expect(true).toBe(true);',
    getTokens: () => [],
    getComments: () => [],
    config: { options: [] },
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    workspaceRoot: '/src',
  } as unknown as RuleContext
  return { context, reports }
}

/**
 * Create a node for `expect(expectArg).matcherName(matcherArg)`.
 * The outer CallExpression has `arguments: [matcherArg]`.
 */
function createChainNode(
  matcherName: string,
  expectArg: unknown,
  matcherArg: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [expectArg],
      },
      property: { type: 'Identifier', name: matcherName },
    },
    arguments: [matcherArg],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

/**
 * Create a node for matchers like toBeTruthy/toBeFalsy/toBeNull that take no real args.
 * The `arg` is placed in the outer arguments so the rule can inspect it.
 */
function createUnaryNode(
  matcherName: string,
  arg: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [arg],
      },
      property: { type: 'Identifier', name: matcherName },
    },
    arguments: [arg],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function literal(value: null | number | string | boolean): { type: 'Literal'; value: null | number | string | boolean } {
  return { type: 'Literal', value }
}

function identifier(name: string): { type: 'Identifier'; name: string } {
  return { type: 'Identifier', name }
}

// ---------------------------------------------------------------------------
// 95 tests
// ---------------------------------------------------------------------------

describe('no-redundant-expect rule', () => {
  // ===== Meta (8 tests) =====================================================

  describe('meta', () => {
    test('should have type suggestion', () => {                                    // 1
      expect(noRedundantExpectRule.meta.type).toBe('suggestion')
    })

    test('should have severity warn', () => {                                      // 2
      expect(noRedundantExpectRule.meta.severity).toBe('warn')
    })

    test('should have testing category', () => {                                   // 3
      expect(noRedundantExpectRule.meta.docs?.category).toBe('testing')
    })

    test('should not be recommended', () => {                                      // 4
      expect(noRedundantExpectRule.meta.docs?.recommended).toBe(false)
    })

    test('should have description mentioning redundant', () => {                   // 5
      expect(noRedundantExpectRule.meta.docs?.description.toLowerCase()).toContain('redundant')
    })

    test('should have description mentioning always pass', () => {                 // 6
      expect(noRedundantExpectRule.meta.docs?.description.toLowerCase()).toContain('always pass')
    })

    test('should have correct docs URL', () => {                                   // 7
      expect(noRedundantExpectRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-redundant-expect',
      )
    })

    test('should have empty schema', () => {                                       // 8
      expect(noRedundantExpectRule.meta.schema).toEqual([])
    })
  })

  // ===== Structure (3 tests) ================================================

  describe('structure', () => {
    test('should return visitor with CallExpression', () => {                      // 9
      const { context } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return new visitor each call', () => {                            // 10
      const { context } = createMockContext()
      const v1 = noRedundantExpectRule.create(context)
      const v2 = noRedundantExpectRule.create(context)
      expect(v1).not.toBe(v2)
    })

    test('should have meta and create properties', () => {                         // 11
      expect(noRedundantExpectRule.meta).toBeDefined()
      expect(noRedundantExpectRule.create).toBeDefined()
      expect(typeof noRedundantExpectRule.create).toBe('function')
    })
  })

  // ===== Positive: toBe/toEqual/toStrictEqual truthy (6 tests) ==============

  describe('toBe/toEqual/toStrictEqual truthy literals', () => {
    test('should report expect(true).toBe(true)', () => {                          // 12
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toBe', literal(true), literal(true)))
      expect(reports.length).toBe(1)
    })

    test('should report expect(true).toEqual(true)', () => {                       // 13
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toEqual', literal(true), literal(true)))
      expect(reports.length).toBe(1)
    })

    test('should report expect(true).toStrictEqual(true)', () => {                 // 14
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toStrictEqual', literal(true), literal(true)))
      expect(reports.length).toBe(1)
    })

    test('should report expect(1).toBe(1)', () => {                                // 15
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toBe', literal(1), literal(1)))
      expect(reports.length).toBe(1)
    })

    test('should report expect("true").toBe("true")', () => {                     // 16
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toBe', literal('true'), literal('true')))
      expect(reports.length).toBe(1)
    })

    test('should report expect("1").toBe("1")', () => {                           // 17
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toBe', literal('1'), literal('1')))
      expect(reports.length).toBe(1)
    })
  })

  // ===== Positive: toBe/toEqual/toStrictEqual falsy (8 tests) ===============

  describe('toBe/toEqual/toStrictEqual falsy literals', () => {
    test('should report expect(false).toBe(false)', () => {                        // 18
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toBe', literal(false), literal(false)))
      expect(reports.length).toBe(1)
    })

    test('should report expect(false).toEqual(false)', () => {                     // 19
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toEqual', literal(false), literal(false)))
      expect(reports.length).toBe(1)
    })

    test('should report expect(false).toStrictEqual(false)', () => {               // 20
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toStrictEqual', literal(false), literal(false)))
      expect(reports.length).toBe(1)
    })

    test('should report expect(0).toBe(0)', () => {                                // 21
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toBe', literal(0), literal(0)))
      expect(reports.length).toBe(1)
    })

    test('should report expect("").toBe("")', () => {                              // 22
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toBe', literal(''), literal('')))
      expect(reports.length).toBe(1)
    })

    test('should report expect(null).toBe(null)', () => {                          // 23
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toBe', literal(null), literal(null)))
      expect(reports.length).toBe(1)
    })

    test('should report expect("false").toBe("false")', () => {                   // 24
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toBe', literal('false'), literal('false')))
      expect(reports.length).toBe(1)
    })

    test('should report expect("0").toBe("0")', () => {                           // 25
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toBe', literal('0'), literal('0')))
      expect(reports.length).toBe(1)
    })
  })

  // ===== Positive: self-comparison (3 tests) ================================

  describe('self-comparison identifiers', () => {
    test('should report expect(x).toBe(x) same identifier', () => {               // 26
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      const x = identifier('x')
      visitor.CallExpression(createChainNode('toBe', x, x))
      expect(reports.length).toBe(1)
    })

    test('should report expect(x).toEqual(x) same identifier', () => {            // 27
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      const x = identifier('x')
      visitor.CallExpression(createChainNode('toEqual', x, x))
      expect(reports.length).toBe(1)
    })

    test('should report expect(x).toStrictEqual(x) same identifier', () => {      // 28
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      const x = identifier('x')
      visitor.CallExpression(createChainNode('toStrictEqual', x, x))
      expect(reports.length).toBe(1)
    })
  })

  // ===== Positive: toBeTruthy (4 tests) =====================================

  describe('toBeTruthy truthy literals', () => {
    test('should report expect(true).toBeTruthy()', () => {                        // 29
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeTruthy', literal(true)))
      expect(reports.length).toBe(1)
    })

    test('should report expect(1).toBeTruthy()', () => {                           // 30
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeTruthy', literal(1)))
      expect(reports.length).toBe(1)
    })

    test('should report expect("true").toBeTruthy()', () => {                      // 31
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeTruthy', literal('true')))
      expect(reports.length).toBe(1)
    })

    test('should report expect("1").toBeTruthy()', () => {                         // 32
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeTruthy', literal('1')))
      expect(reports.length).toBe(1)
    })
  })

  // ===== Positive: toBeFalsy (6 tests) ======================================

  describe('toBeFalsy falsy literals', () => {
    test('should report expect(false).toBeFalsy()', () => {                        // 33
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeFalsy', literal(false)))
      expect(reports.length).toBe(1)
    })

    test('should report expect(0).toBeFalsy()', () => {                            // 34
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeFalsy', literal(0)))
      expect(reports.length).toBe(1)
    })

    test('should report expect("").toBeFalsy()', () => {                            // 35
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeFalsy', literal('')))
      expect(reports.length).toBe(1)
    })

    test('should report expect(null).toBeFalsy()', () => {                          // 36
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeFalsy', literal(null)))
      expect(reports.length).toBe(1)
    })

    test('should report expect("false").toBeFalsy()', () => {                       // 37
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeFalsy', literal('false')))
      expect(reports.length).toBe(1)
    })

    test('should report expect("0").toBeFalsy()', () => {                           // 38
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeFalsy', literal('0')))
      expect(reports.length).toBe(1)
    })
  })

  // ===== Positive: toBeNull / toBeUndefined / toBeDefined (3 tests) ========

  describe('toBeNull / toBeUndefined / toBeDefined', () => {
    test('should report expect(null).toBeNull()', () => {                           // 39
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeNull', literal(null)))
      expect(reports.length).toBe(1)
    })

    test('should report expect(undefined).toBeUndefined()', () => {                 // 40
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeUndefined', identifier('undefined')))
      expect(reports.length).toBe(1)
    })

    test('should report expect("literal").toBeDefined()', () => {                   // 41
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeDefined', literal('literal')))
      expect(reports.length).toBe(1)
    })
  })

  // ===== Negative: toBeTruthy non-truthy (2 tests) ==========================

  describe('toBeTruthy negative', () => {
    test('should not report expect(false).toBeTruthy()', () => {                    // 42
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeTruthy', literal(false)))
      expect(reports.length).toBe(0)
    })

    test('should not report expect(0).toBeTruthy()', () => {                        // 43
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeTruthy', literal(0)))
      expect(reports.length).toBe(0)
    })
  })

  // ===== Negative: toBeFalsy non-falsy (2 tests) ============================

  describe('toBeFalsy negative', () => {
    test('should not report expect(true).toBeFalsy()', () => {                      // 44
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeFalsy', literal(true)))
      expect(reports.length).toBe(0)
    })

    test('should not report expect(1).toBeFalsy()', () => {                         // 45
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeFalsy', literal(1)))
      expect(reports.length).toBe(0)
    })
  })

  // ===== Negative: toBeNull non-null (2 tests) ==============================

  describe('toBeNull negative', () => {
    test('should not report expect(false).toBeNull()', () => {                      // 46
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeNull', literal(false)))
      expect(reports.length).toBe(0)
    })

    test('should not report expect(0).toBeNull()', () => {                          // 47
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeNull', literal(0)))
      expect(reports.length).toBe(0)
    })
  })

  // ===== Negative: toBeUndefined wrong type (2 tests) ========================

  describe('toBeUndefined negative', () => {
    test('should not report expect(value).toBeUndefined() wrong name', () => {      // 48
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeUndefined', identifier('value')))
      expect(reports.length).toBe(0)
    })

    test('should not report expect(null).toBeUndefined() literal not identifier', () => { // 49
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeUndefined', literal(null)))
      expect(reports.length).toBe(0)
    })
  })

  // ===== Negative: toBeDefined non-literal (1 test) ==========================

  describe('toBeDefined negative', () => {
    test('should not report expect(myVar).toBeDefined() identifier not literal', () => { // 50
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeDefined', identifier('myVar')))
      expect(reports.length).toBe(0)
    })
  })

  // ===== Negative: non-expect calls (2 tests) ================================

  describe('non-expect calls', () => {
    test('should not report regular function calls', () => {                         // 51
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'console' },
        arguments: [{ type: 'Literal', value: 'log' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report non-expect member expression calls', () => {            // 52
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'bar' },
        },
        arguments: [{ type: 'Literal', value: true }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== Negative: unchecked matchers (3 tests) =============================

  describe('unchecked matchers', () => {
    test('should not report expect(x).toBeLessThan(5)', () => {                      // 53
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(
        createChainNode('toBeLessThan', identifier('x'), literal(5)),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).nothing()', () => {                            // 54
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [identifier('x')],
          },
          property: { type: 'Identifier', name: 'nothing' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report expect(x).toBeGreaterThan(0)', () => {                   // 55
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(
        createChainNode('toBeGreaterThan', identifier('x'), literal(0)),
      )
      expect(reports.length).toBe(0)
    })
  })

  // ===== Negative: edge cases (6 tests) =====================================

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {                               // 56
      const { context } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {                          // 57
      const { context } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node (string)', () => {                           // 58
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {                                  // 59
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {                                // 60
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [literal(true)],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report expect() with empty arguments', () => {                  // 61
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== Message text (8 tests) =============================================

  describe('message text', () => {
    test('toBe truthy message contains JSON values and matcher', () => {             // 62
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toBe', literal(true), literal(true)))
      expect(reports[0].message).toContain('true')
      expect(reports[0].message).toContain('toBe')
      expect(reports[0].message).toContain('always passes')
    })

    test('toBe falsy message contains JSON values', () => {                          // 63
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toBe', literal(false), literal(false)))
      expect(reports[0].message).toContain('false')
      expect(reports[0].message).toContain('toBe')
    })

    test('self-compare message mentions comparing to itself', () => {                // 64
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      const x = identifier('x')
      visitor.CallExpression(createChainNode('toBe', x, x))
      expect(reports[0].message).toContain('comparing a value to itself')
    })

    test('toBeTruthy message mentions always passes', () => {                        // 65
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeTruthy', literal(true)))
      expect(reports[0].message).toContain('always passes')
    })

    test('toBeFalsy message mentions always passes', () => {                         // 66
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeFalsy', literal(false)))
      expect(reports[0].message).toContain('always passes')
    })

    test('toBeNull message contains expect(null).toBeNull()', () => {                // 67
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeNull', literal(null)))
      expect(reports[0].message).toContain('expect(null).toBeNull()')
    })

    test('toBeUndefined message contains expect(undefined).toBeUndefined()', () => { // 68
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeUndefined', identifier('undefined')))
      expect(reports[0].message).toContain('expect(undefined).toBeUndefined()')
    })

    test('toBeDefined message mentions literal', () => {                             // 69
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeDefined', literal('hello')))
      expect(reports[0].message).toContain('literal')
    })
  })

  // ===== Location (3 tests) =================================================

  describe('location', () => {
    test('report has loc property', () => {                                          // 70
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toBe', literal(true), literal(true)))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has correct start line', () => {                                    // 71
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toBe', literal(true), literal(true), 7, 4))
      expect(reports[0].loc?.start.line).toBe(7)
    })

    test('report has correct start column', () => {                                  // 72
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toBe', literal(true), literal(true), 3, 12))
      expect(reports[0].loc?.start.column).toBe(12)
    })
  })

  // ===== Cross-value truthy/falsy (2 tests) =================================

  describe('cross-value same-set literals', () => {
    test('should report expect(true).toBe(1) both truthy', () => {                   // 73
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toBe', literal(true), literal(1)))
      expect(reports.length).toBe(1)
    })

    test('should report expect(false).toBe(0) both falsy', () => {                   // 74
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toBe', literal(false), literal(0)))
      expect(reports.length).toBe(1)
    })
  })

  // ===== Self-compare via any literal (3 tests) =============================

  describe('self-compare any literal', () => {
    test('should report expect(42).toBe(42) via self-compare', () => {               // 75
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toBe', literal(42), literal(42)))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('comparing a value to itself')
    })

    test('should report expect("abc").toBe("abc") via self-compare', () => {         // 76
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toBe', literal('abc'), literal('abc')))
      expect(reports.length).toBe(1)
    })

    test('should report expect(42).toEqual(42) via self-compare', () => {            // 77
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toEqual', literal(42), literal(42)))
      expect(reports.length).toBe(1)
    })
  })

  // ===== State isolation (2 tests) ==========================================

  describe('state isolation', () => {
    test('separate visitors have separate state', () => {                             // 78
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const v1 = noRedundantExpectRule.create(ctx1)
      const v2 = noRedundantExpectRule.create(ctx2)
      v1.CallExpression(createChainNode('toBe', literal(true), literal(true)))
      v2.CallExpression(createChainNode('toBeLessThan', identifier('x'), literal(5)))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across calls', () => {                          // 79
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toBe', literal(true), literal(true)))
      visitor.CallExpression(createChainNode('toBe', literal(false), literal(false)))
      expect(reports.length).toBe(2)
    })
  })

  // ===== Additional message content (3 tests) ===============================

  describe('message content details', () => {
    test('toBeTruthy message contains JSON value for 1', () => {                     // 80
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeTruthy', literal(1)))
      expect(reports[0].message).toContain('1')
      expect(reports[0].message).toContain('toBeTruthy')
    })

    test('toBeFalsy message contains JSON value for null', () => {                   // 81
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeFalsy', literal(null)))
      expect(reports[0].message).toContain('null')
    })

    test('toBeFalsy message contains JSON value for empty string', () => {           // 82
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeFalsy', literal('')))
      expect(reports[0].message).toContain('""')
    })
  })

  // ===== Additional positive: cross-set falsy (3 tests) =====================

  describe('cross-value falsy literals', () => {
    test('should report expect(false).toBe("") both falsy', () => {                  // 83
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toBe', literal(false), literal('')))
      expect(reports.length).toBe(1)
    })

    test('should report expect(null).toBe(false) both falsy', () => {                // 84
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toBe', literal(null), literal(false)))
      expect(reports.length).toBe(1)
    })

    test('should report expect(0).toStrictEqual(0)', () => {                          // 85
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toStrictEqual', literal(0), literal(0)))
      expect(reports.length).toBe(1)
    })
  })

  // ===== Additional message format (3 tests) ================================

  describe('message format', () => {
    test('toBeTruthy message starts with Redundant assertion', () => {                // 86
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeTruthy', literal(true)))
      expect(reports[0].message).toMatch(/^Redundant assertion/)
    })

    test('toBeFalsy message starts with Redundant assertion', () => {                 // 87
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeFalsy', literal(false)))
      expect(reports[0].message).toMatch(/^Redundant assertion/)
    })

    test('toBeNull message starts with Redundant assertion', () => {                  // 88
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeNull', literal(null)))
      expect(reports[0].message).toMatch(/^Redundant assertion/)
    })
  })

  // ===== Additional edge cases (3 tests) ====================================

  describe('additional edge cases', () => {
    test('should handle node without arguments property', () => {                     // 89
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [literal(true)],
          },
          property: { type: 'Identifier', name: 'toBe' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle callee with non-Identifier property', () => {                 // 90
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [literal(true)],
          },
          property: { type: 'Literal', value: 'toBe' },
        },
        arguments: [literal(true)],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node with numeric callee', () => {                            // 91
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: 42,
        arguments: [literal(true)],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== More message end checks (3 tests) ==================================

  describe('message endings', () => {
    test('toBe truthy message ends with period', () => {                              // 92
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createChainNode('toBe', literal(true), literal(true)))
      expect(reports[0].message).toMatch(/\.$/)
    })

    test('self-compare message ends with period', () => {                             // 93
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      const x = identifier('x')
      visitor.CallExpression(createChainNode('toBe', x, x))
      expect(reports[0].message).toMatch(/\.$/)
    })

    test('toBeDefined message ends with period', () => {                              // 94
      const { context, reports } = createMockContext()
      const visitor = noRedundantExpectRule.create(context)
      visitor.CallExpression(createUnaryNode('toBeDefined', literal('hello')))
      expect(reports[0].message).toMatch(/\.$/)
    })
  })

  // ===== Meta: no fixable (1 test) ==========================================

  describe('meta fixable', () => {
    test('should not have fixable property', () => {                                  // 95
      expect(noRedundantExpectRule.meta.fixable).toBeUndefined()
    })
  })
})

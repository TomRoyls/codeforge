import { describe, test, expect, vi } from 'vitest'
import { noUnnecessarySymbolKeyForSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-symbol-key-for-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function makeSymbolKeyForCall(spreadArg: unknown, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'Symbol',
      },
      property: {
        type: 'Identifier',
        name: 'keyFor',
      },
      computed: false,
    },
    arguments: [spreadArg],
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
    range: [column, column + 30],
  }
}

function makeSpreadElement(argument: unknown): unknown {
  return {
    type: 'SpreadElement',
    argument,
  }
}

function makeIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

describe('no-unnecessary-symbol-key-for-spread rule', () => {
  // ============================================================
  // META TESTS (8)
  // ============================================================
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessarySymbolKeyForSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessarySymbolKeyForSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessarySymbolKeyForSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessarySymbolKeyForSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined as empty array', () => {
      expect(noUnnecessarySymbolKeyForSpreadRule.meta.schema).toBeDefined()
      expect(noUnnecessarySymbolKeyForSpreadRule.meta.schema).toEqual([])
    })

    test('should mention Symbol.keyFor in description', () => {
      expect(noUnnecessarySymbolKeyForSpreadRule.meta.docs?.description).toContain('Symbol.keyFor')
    })

    test('should have documentation URL', () => {
      expect(noUnnecessarySymbolKeyForSpreadRule.meta.docs?.url).toContain(
        'no-unnecessary-symbol-key-for-spread',
      )
    })

    test('should not be deprecated', () => {
      expect(noUnnecessarySymbolKeyForSpreadRule.meta.deprecated).toBeUndefined()
    })
  })

  // ============================================================
  // STRUCTURE TESTS (2)
  // ============================================================
  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'Symbol.keyFor(...items)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should create independent visitors for different contexts', () => {
      const { context: ctx1 } = createMockRuleContext({ source: 'Symbol.keyFor(...items)' })
      const { context: ctx2 } = createMockRuleContext({ source: 'Symbol.keyFor(...items)' })
      const visitor1 = noUnnecessarySymbolKeyForSpreadRule.create(ctx1)
      const visitor2 = noUnnecessarySymbolKeyForSpreadRule.create(ctx2)

      expect(visitor1).not.toBe(visitor2)
    })
  })

  // ============================================================
  // POSITIVE TESTS (28)
  // ============================================================
  describe('detecting Symbol.keyFor with spread', () => {
    test('should report Symbol.keyFor(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...items)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      visitor.CallExpression(makeSymbolKeyForCall(makeSpreadElement(makeIdentifier('items'))))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe(
        'Symbol.keyFor(...items) with a single spread is unusual. Consider passing the symbol directly.',
      )
    })

    test('should report Symbol.keyFor(...syms)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...syms)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      visitor.CallExpression(makeSymbolKeyForCall(makeSpreadElement(makeIdentifier('syms'))))

      expect(reports.length).toBe(1)
    })

    test('should report Symbol.keyFor(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...arr)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      visitor.CallExpression(makeSymbolKeyForCall(makeSpreadElement(makeIdentifier('arr'))))

      expect(reports.length).toBe(1)
    })

    test('should report Symbol.keyFor(...symbols)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...symbols)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      visitor.CallExpression(makeSymbolKeyForCall(makeSpreadElement(makeIdentifier('symbols'))))

      expect(reports.length).toBe(1)
    })

    test('should report Symbol.keyFor(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...list)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      visitor.CallExpression(makeSymbolKeyForCall(makeSpreadElement(makeIdentifier('list'))))

      expect(reports.length).toBe(1)
    })

    test('should report Symbol.keyFor(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...args)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      visitor.CallExpression(makeSymbolKeyForCall(makeSpreadElement(makeIdentifier('args'))))

      expect(reports.length).toBe(1)
    })

    test('should report Symbol.keyFor(...result)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...result)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      visitor.CallExpression(makeSymbolKeyForCall(makeSpreadElement(makeIdentifier('result'))))

      expect(reports.length).toBe(1)
    })

    test('should report Symbol.keyFor(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...values)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      visitor.CallExpression(makeSymbolKeyForCall(makeSpreadElement(makeIdentifier('values'))))

      expect(reports.length).toBe(1)
    })

    test('should report Symbol.keyFor(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...data)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      visitor.CallExpression(makeSymbolKeyForCall(makeSpreadElement(makeIdentifier('data'))))

      expect(reports.length).toBe(1)
    })

    test('should report Symbol.keyFor(...obj.items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...obj.items)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const memberExpr = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'items' },
        computed: false,
      }

      visitor.CallExpression(makeSymbolKeyForCall(makeSpreadElement(memberExpr)))

      expect(reports.length).toBe(1)
    })

    test('should report Symbol.keyFor(...getSymbols())', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Symbol.keyFor(...getSymbols())',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const callExpr = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getSymbols' },
        arguments: [],
      }

      visitor.CallExpression(makeSymbolKeyForCall(makeSpreadElement(callExpr)))

      expect(reports.length).toBe(1)
    })

    test('should report Symbol.keyFor(...[sym])', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...[sym])' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const arrayExpr = {
        type: 'ArrayExpression',
        elements: [{ type: 'Identifier', name: 'sym' }],
      }

      visitor.CallExpression(makeSymbolKeyForCall(makeSpreadElement(arrayExpr)))

      expect(reports.length).toBe(1)
    })

    test('should report Symbol.keyFor(...(items))', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...(items))' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const parenExpr = {
        type: 'Identifier',
        name: 'items',
      }

      visitor.CallExpression(makeSymbolKeyForCall(makeSpreadElement(parenExpr)))

      expect(reports.length).toBe(1)
    })

    test('should report Symbol.keyFor(...mySymbol)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...mySymbol)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      visitor.CallExpression(makeSymbolKeyForCall(makeSpreadElement(makeIdentifier('mySymbol'))))

      expect(reports.length).toBe(1)
    })

    test('should report Symbol.keyFor(...globalSym)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...globalSym)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      visitor.CallExpression(makeSymbolKeyForCall(makeSpreadElement(makeIdentifier('globalSym'))))

      expect(reports.length).toBe(1)
    })

    test('should report Symbol.keyFor(...localSym)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...localSym)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      visitor.CallExpression(makeSymbolKeyForCall(makeSpreadElement(makeIdentifier('localSym'))))

      expect(reports.length).toBe(1)
    })

    test('should report Symbol.keyFor(...sharedSym)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...sharedSym)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      visitor.CallExpression(makeSymbolKeyForCall(makeSpreadElement(makeIdentifier('sharedSym'))))

      expect(reports.length).toBe(1)
    })

    test('should report Symbol.keyFor(...registered)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Symbol.keyFor(...registered)',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      visitor.CallExpression(
        makeSymbolKeyForCall(makeSpreadElement(makeIdentifier('registered'))),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Symbol.keyFor(...namespace.sym)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Symbol.keyFor(...namespace.sym)',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const memberExpr = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'namespace' },
        property: { type: 'Identifier', name: 'sym' },
        computed: false,
      }

      visitor.CallExpression(makeSymbolKeyForCall(makeSpreadElement(memberExpr)))

      expect(reports.length).toBe(1)
    })

    test('should report Symbol.keyFor(...cache.get(key))', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Symbol.keyFor(...cache.get(key))',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const callExpr = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'cache' },
          property: { type: 'Identifier', name: 'get' },
          computed: false,
        },
        arguments: [{ type: 'Identifier', name: 'key' }],
      }

      visitor.CallExpression(makeSymbolKeyForCall(makeSpreadElement(callExpr)))

      expect(reports.length).toBe(1)
    })

    test('should report Symbol.keyFor(...symArr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...symArr)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      visitor.CallExpression(makeSymbolKeyForCall(makeSpreadElement(makeIdentifier('symArr'))))

      expect(reports.length).toBe(1)
    })

    test('should report Symbol.keyFor(...pool)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...pool)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      visitor.CallExpression(makeSymbolKeyForCall(makeSpreadElement(makeIdentifier('pool'))))

      expect(reports.length).toBe(1)
    })

    test('should report Symbol.keyFor(...registry.sym)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Symbol.keyFor(...registry.sym)',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const memberExpr = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'registry' },
        property: { type: 'Identifier', name: 'sym' },
        computed: false,
      }

      visitor.CallExpression(makeSymbolKeyForCall(makeSpreadElement(memberExpr)))

      expect(reports.length).toBe(1)
    })

    test('should report Symbol.keyFor(...store)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...store)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      visitor.CallExpression(makeSymbolKeyForCall(makeSpreadElement(makeIdentifier('store'))))

      expect(reports.length).toBe(1)
    })

    test('should report Symbol.keyFor(...ref.current)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Symbol.keyFor(...ref.current)',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const memberExpr = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'ref' },
        property: { type: 'Identifier', name: 'current' },
        computed: false,
      }

      visitor.CallExpression(makeSymbolKeyForCall(makeSpreadElement(memberExpr)))

      expect(reports.length).toBe(1)
    })

    test('should report Symbol.keyFor(...collection)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Symbol.keyFor(...collection)',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      visitor.CallExpression(
        makeSymbolKeyForCall(makeSpreadElement(makeIdentifier('collection'))),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Symbol.keyFor(...entries)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...entries)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      visitor.CallExpression(makeSymbolKeyForCall(makeSpreadElement(makeIdentifier('entries'))))

      expect(reports.length).toBe(1)
    })

    test('should report with correct message text', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...items)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      visitor.CallExpression(makeSymbolKeyForCall(makeSpreadElement(makeIdentifier('items'))))

      expect(reports[0].message).toBe(
        'Symbol.keyFor(...items) with a single spread is unusual. Consider passing the symbol directly.',
      )
    })
  })

  // ============================================================
  // NEGATIVE TESTS (40)
  // ============================================================
  describe('not reporting valid Symbol.keyFor usage', () => {
    test('should not report Symbol.keyFor(mySymbol)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Symbol.keyFor(mySymbol)',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      visitor.CallExpression(makeSymbolKeyForCall(makeIdentifier('mySymbol')))

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.keyFor(sym)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(sym)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      visitor.CallExpression(makeSymbolKeyForCall(makeIdentifier('sym')))

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.keyFor(globalSym)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(globalSym)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      visitor.CallExpression(makeSymbolKeyForCall(makeIdentifier('globalSym')))

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.keyFor(register)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(register)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      visitor.CallExpression(makeSymbolKeyForCall(makeIdentifier('register')))

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.keyFor(Symbol("x"))', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(Symbol("x"))' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const innerCall = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Symbol' },
        arguments: [{ type: 'Literal', value: 'x' }],
      }

      visitor.CallExpression(makeSymbolKeyForCall(innerCall))

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.keyFor(obj.sym)', () => {

  describe('not reporting non-Symbol.keyFor calls', () => {
    test('should not report Symbol.iterator', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.iterator' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Symbol' },
          property: { type: 'Identifier', name: 'iterator' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.for', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.for("key")' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Symbol' },
          property: { type: 'Identifier', name: 'for' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.asyncIterator', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.asyncIterator' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Symbol' },
          property: { type: 'Identifier', name: 'asyncIterator' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.hasInstance', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.hasInstance' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Symbol' },
          property: { type: 'Identifier', name: 'hasInstance' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.toPrimitive', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.toPrimitive' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Symbol' },
          property: { type: 'Identifier', name: 'toPrimitive' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report MySymbol.keyFor(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'SYM.keyFor(...items)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'SYM' },
          property: { type: 'Identifier', name: 'keyFor' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol["keyFor"](...items) with computed access', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Symbol["keyFor"](...items)',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Symbol' },
          property: { type: 'Literal', value: 'keyFor' },
          computed: true,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report keyFor(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'keyFor(...items)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'keyFor' },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.keyFor(sym, extra) with two args', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor("key")' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Symbol' },
          property: { type: 'Identifier', name: 'keyFor' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 'key' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report foo(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'foo(...items)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.toString(...items)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Symbol.toString(...items)',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Symbol' },
          property: { type: 'Identifier', name: 'toString' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.valueOf(...items)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Symbol.valueOf(...items)',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Symbol' },
          property: { type: 'Identifier', name: 'valueOf' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.keyFor(...items)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.keyFor(...items)',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Reflect' },
          property: { type: 'Identifier', name: 'keyFor' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Object.keyFor(...items)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Object.keyFor(...items)',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'keyFor' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.keyFor with three args', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Symbol.keyFor(a, b, c)',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Symbol' },
          property: { type: 'Identifier', name: 'keyFor' },
          computed: false,
        },
        arguments: [
          makeIdentifier('a'),
          makeIdentifier('b'),
          makeIdentifier('c'),
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.keyFor with conditional expression arg', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Symbol.keyFor(a ? b : c)',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const conditional = {
        type: 'ConditionalExpression',
        test: makeIdentifier('a'),
        consequent: makeIdentifier('b'),
        alternate: makeIdentifier('c'),
      }

      visitor.CallExpression(makeSymbolKeyForCall(conditional))

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.keyFor with arrow function arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(null)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const nullLit = {
        type: 'Literal',
        value: null,
        raw: 'null',
      }

      visitor.CallExpression(makeSymbolKeyForCall(nullLit))

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.keyFor with number arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(42)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const numLit = {
        type: 'Literal',
        value: 42,
        raw: '42',
      }

      visitor.CallExpression(makeSymbolKeyForCall(numLit))

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.keyFor with object expression arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor({})' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const objExpr = {
        type: 'ObjectExpression',
        properties: [],
      }

      visitor.CallExpression(makeSymbolKeyForCall(objExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.keyFor with boolean arg', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Symbol.keyFor(true)',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const boolLit = {
        type: 'Literal',
        value: true,
        raw: 'true',
      }

      visitor.CallExpression(makeSymbolKeyForCall(boolLit))

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.keyFor with array expression arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor([])' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const arrExpr = {
        type: 'ArrayExpression',
        elements: [],
      }

      visitor.CallExpression(makeSymbolKeyForCall(arrExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.keyFor with template literal arg', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Symbol.keyFor(`sym`)',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const templateLit = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'sym', cooked: 'sym' } }],
        expressions: [],
      }

      visitor.CallExpression(makeSymbolKeyForCall(templateLit))

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.keyFor with binary expression arg', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Symbol.keyFor(a + b)',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const binExpr = {
        type: 'BinaryExpression',
        operator: '+',
        left: makeIdentifier('a'),
        right: makeIdentifier('b'),
      }

      visitor.CallExpression(makeSymbolKeyForCall(binExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.keyFor with logical expression arg', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Symbol.keyFor(a || b)',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const logExpr = {
        type: 'LogicalExpression',
        operator: '||',
        left: makeIdentifier('a'),
        right: makeIdentifier('b'),
      }

      visitor.CallExpression(makeSymbolKeyForCall(logExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.keyFor with unary expression arg', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Symbol.keyFor(!a)',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const unaryExpr = {
        type: 'UnaryExpression',
        operator: '!',
        argument: makeIdentifier('a'),
        prefix: true,
      }

      visitor.CallExpression(makeSymbolKeyForCall(unaryExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.keyFor with await expression arg', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Symbol.keyFor(await sym)',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const awaitExpr = {
        type: 'AwaitExpression',
        argument: makeIdentifier('sym'),
      }

      visitor.CallExpression(makeSymbolKeyForCall(awaitExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.keyFor with yield expression arg', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Symbol.keyFor(yield sym)',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const yieldExpr = {
        type: 'YieldExpression',
        argument: makeIdentifier('sym'),
        delegate: false,
      }

      visitor.CallExpression(makeSymbolKeyForCall(yieldExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.keyFor with new expression arg', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Symbol.keyFor(new Sym())',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const newExpr = {
        type: 'NewExpression',
        callee: makeIdentifier('Sym'),
        arguments: [],
      }

      visitor.CallExpression(makeSymbolKeyForCall(newExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.keyFor with spread + extra arg', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Symbol.keyFor(...items, extra)',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Symbol' },
          property: { type: 'Identifier', name: 'keyFor' },
          computed: false,
        },
        arguments: [
          makeSpreadElement(makeIdentifier('items')),
          makeIdentifier('extra'),
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting on non-keyFor Symbol methods with spread', () => {
    test('should not report Symbol.species with spread', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Symbol.species(...items)',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Symbol' },
          property: { type: 'Identifier', name: 'species' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.match with spread', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Symbol.match(...items)',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Symbol' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.replace with spread', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Symbol.replace(...items)',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Symbol' },
          property: { type: 'Identifier', name: 'replace' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.search with spread', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Symbol.search(...items)',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Symbol' },
          property: { type: 'Identifier', name: 'search' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Symbol.split with spread', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Symbol.split(...items)',
      })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Symbol' },
          property: { type: 'Identifier', name: 'split' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EDGE CASE TESTS (17)
  // ============================================================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'Symbol.keyFor(...items)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'Symbol.keyFor(...items)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'Symbol.keyFor(...items)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...items)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'keyFor' },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...items)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Symbol' },
          property: { type: 'Identifier', name: 'keyFor' },
          computed: false,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee with non-Identifier object', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...items)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'Symbol' },
          property: { type: 'Identifier', name: 'keyFor' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee with non-Identifier property', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...items)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Symbol' },
          property: { type: 'Literal', value: 'keyFor' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...items)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Symbol' },
          property: { type: 'Identifier', name: 'keyFor' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        range: [0, 20],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without range', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...items)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Symbol' },
          property: { type: 'Identifier', name: 'keyFor' },
          computed: false,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...items)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type string', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...items)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      expect(() => visitor.CallExpression({ type: 'ExpressionStatement' })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node input', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...items)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array as node input', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...items)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee with null object', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...items)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'keyFor' },
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee with undefined object', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...items)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: undefined,
          property: { type: 'Identifier', name: 'keyFor' },
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Symbol.keyFor with null callee property', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...items)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Symbol' },
          property: null,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report correct location from node', () => {
      const { context, reports } = createMockRuleContext({ source: 'Symbol.keyFor(...items)' })
      const visitor = noUnnecessarySymbolKeyForSpreadRule.create(context)

      visitor.CallExpression(
        makeSymbolKeyForCall(makeSpreadElement(makeIdentifier('items')), 10, 5),
      )

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })
})

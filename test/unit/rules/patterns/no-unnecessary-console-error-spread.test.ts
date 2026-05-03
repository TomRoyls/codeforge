import { describe, test, expect } from 'vitest'
import {
  noUnnecessaryConsoleErrorSpreadRule,
  default as defaultExport,
} from '../../../../src/rules/patterns/no-unnecessary-console-error-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createConsoleErrorSpread(spreadArg: unknown, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: { type: 'Identifier', name: 'console' },
      property: { type: 'Identifier', name: 'error' },
    },
    arguments: [
      {
        type: 'SpreadElement',
        argument: spreadArg,
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

describe('noUnnecessaryConsoleErrorSpreadRule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryConsoleErrorSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryConsoleErrorSpreadRule.meta.severity).toBe('warn')
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryConsoleErrorSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryConsoleErrorSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a truthy description', () => {
      expect(noUnnecessaryConsoleErrorSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should mention console.error in description', () => {
      expect(noUnnecessaryConsoleErrorSpreadRule.meta.docs?.description).toContain('console.error')
    })

    test('should have docs URL', () => {
      expect(noUnnecessaryConsoleErrorSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-console-error-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryConsoleErrorSpreadRule.meta.schema).toEqual([])
    })
  })

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(defaultExport).toBe(noUnnecessaryConsoleErrorSpreadRule)
    })
  })

  describe('positive cases - reports console.error with single spread', () => {
    test('reports console.error(...arr)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'arr' }))
      expect(reports.length).toBe(1)
    })

    test('reports console.error(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'items' }))
      expect(reports.length).toBe(1)
    })

    test('reports console.error(...errors)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'errors' }))
      expect(reports.length).toBe(1)
    })

    test('reports console.error(...args)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'args' }))
      expect(reports.length).toBe(1)
    })

    test('reports console.error(...data)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'data' }))
      expect(reports.length).toBe(1)
    })

    test('reports console.error(...result)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'result' }))
      expect(reports.length).toBe(1)
    })

    test('reports console.error(...list)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'list' }))
      expect(reports.length).toBe(1)
    })

    test('reports console.error(...values)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'values' }))
      expect(reports.length).toBe(1)
    })

    test('reports console.error(...obj)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'obj' }))
      expect(reports.length).toBe(1)
    })

    test('reports console.error(...response)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'response' }))
      expect(reports.length).toBe(1)
    })

    test('reports console.error(...config)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'config' }))
      expect(reports.length).toBe(1)
    })

    test('reports console.error(...options)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'options' }))
      expect(reports.length).toBe(1)
    })

    test('reports console.error(...params)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'params' }))
      expect(reports.length).toBe(1)
    })

    test('reports console.error(...parts)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'parts' }))
      expect(reports.length).toBe(1)
    })

    test('reports console.error(...chunks)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'chunks' }))
      expect(reports.length).toBe(1)
    })

    test('reports with spread of member expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(
        createConsoleErrorSpread({
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'err' },
          property: { type: 'Identifier', name: 'data' },
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with spread of call expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(
        createConsoleErrorSpread({
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getErrorArgs' },
          arguments: [],
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with correct message text', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'arr' }))
      expect(reports[0].message).toBe(
        'console.error(...items) with a single spread is unusual. Consider passing arguments directly.',
      )
    })

    test('reports with correct location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'arr' }, 5, 10))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('reports with correct end location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'arr' }, 3, 2))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(32)
    })

    test('reports console.error(...a) at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'a' }, 1, 0))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports console.error(...a) at large line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'a' }, 500, 80))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(500)
    })

    test('reports console.error(...a) at line 0 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'a' }, 0, 0))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
    })

    test('reports console.error(...[]) with array literal spread', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(
        createConsoleErrorSpread({
          type: 'ArrayExpression',
          elements: [],
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports multiple invocations independently', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'b' }))
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'c' }))
      expect(reports.length).toBe(3)
    })

    test('reports console.error(...foo) where spread argument is a single-letter identifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'e' }))
      expect(reports.length).toBe(1)
    })

    test('reports with spread of conditional expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(
        createConsoleErrorSpread({
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'flag' },
          consequent: { type: 'Identifier', name: 'a' },
          alternate: { type: 'Identifier', name: 'b' },
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with spread of array with elements', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(
        createConsoleErrorSpread({
          type: 'ArrayExpression',
          elements: [{ type: 'Literal', value: 'err' }],
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with spread of template literal result', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(
        createConsoleErrorSpread({
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'String' },
          arguments: [{ type: 'Literal', value: 'test' }],
        }),
      )
      expect(reports.length).toBe(1)
    })

    test('message mentions spread', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'x' }))
      expect(reports[0].message).toContain('spread')
    })
  })

  describe('negative cases - does NOT report', () => {
    test('does not report console.log(...arr)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report console.warn(...arr)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'warn' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report console.info(...arr)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'info' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report console.debug(...arr)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'debug' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report logger.error(...arr)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'logger' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report console.error() with no arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report console.error(msg) with non-spread argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [{ type: 'Literal', value: 'error message' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report console.error(...arr, extra) with two arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
          { type: 'Literal', value: 'extra' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report console.error(msg, ...arr) with two arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [
          { type: 'Literal', value: 'msg' },
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report plain error() call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'error' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report console["error"](...arr) with computed property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Literal', value: 'error' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report window.console.error(...arr) with nested member', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'window' },
            property: { type: 'Identifier', name: 'console' },
          },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report non-object console (Literal)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Literal', value: 'console' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report non-Identifier property (Literal)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Literal', value: 'error' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report non-CallExpression type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'ExpressionStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report null node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report undefined node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report empty object node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report string node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      expect(() => visitor.CallExpression('console.error(...arr)')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report numeric node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report console.error with Identifier argument (non-spread)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [{ type: 'Identifier', name: 'err' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report console.error with two non-spread arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [
          { type: 'Literal', value: 'msg' },
          { type: 'Identifier', name: 'err' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report console.error with three non-spread arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [
          { type: 'Literal', value: 'a' },
          { type: 'Literal', value: 'b' },
          { type: 'Literal', value: 'c' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report consolelike.error(...arr) (similar name)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'consolelike' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report myconsole.error(...arr) (prefixed)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'myconsole' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report console.err(...arr) (wrong method name)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'err' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report console.errors(...arr) (wrong method name)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'errors' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report console.error with null callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node without arguments property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'error' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with null callee object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: null,
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node with null callee property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: null,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report console.error with TemplateLiteral argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [{ type: 'TemplateLiteral', quasis: [], expressions: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report console.error with ObjectExpression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [{ type: 'ObjectExpression', properties: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report process.stderr.write(...arr)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'process' },
            property: { type: 'Identifier', name: 'stderr' },
          },
          property: { type: 'Identifier', name: 'write' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report console.error with CallExpression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [
          { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report console.error with ArrowFunction argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [{ type: 'ArrowFunctionExpression', params: [], body: null }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('visitors from separate create() calls maintain independent state', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()
      const visitor1 = noUnnecessaryConsoleErrorSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryConsoleErrorSpreadRule.create(ctx2)
      visitor1.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'a' }))
      visitor2.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('reports accumulate across multiple calls on same visitor', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'b' }))
      expect(reports.length).toBe(2)
    })

    test('handles node without loc property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }],
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (only start)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }],
        loc: { start: { line: 1, column: 0 } },
      })
      expect(reports.length).toBe(1)
    })

    test('create() can be called multiple times without error', () => {
      const { context } = createMockRuleContext()
      const visitor1 = noUnnecessaryConsoleErrorSpreadRule.create(context)
      const visitor2 = noUnnecessaryConsoleErrorSpreadRule.create(context)
      expect(visitor1).toBeDefined()
      expect(visitor2).toBeDefined()
    })

    test('handles boolean node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles array node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      expect(() => visitor.CallExpression([1, 2, 3])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles node with undefined callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: undefined,
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('handles node without type property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('handles node with NaN line/column values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }],
        loc: {
          start: { line: Number.NaN, column: Number.NaN },
          end: { line: Number.NaN, column: Number.NaN },
        },
      })
      expect(reports.length).toBe(1)
    })

    test('handles multi-line loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }],
        loc: { start: { line: 5, column: 0 }, end: { line: 8, column: 1 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.end.line).toBe(8)
    })

    test('create does not throw with empty context', () => {
      const { context } = createMockRuleContext()
      expect(() => noUnnecessaryConsoleErrorSpreadRule.create(context)).not.toThrow()
    })

    test('loc is reported as object with start and end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'arr' }))
      expect(reports[0].loc).toBeDefined()
      expect(typeof reports[0].loc?.start).toBe('object')
      expect(typeof reports[0].loc?.end).toBe('object')
    })

    test('handles function node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      expect(() => visitor.CallExpression(() => {})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles Symbol node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      expect(() => visitor.CallExpression(Symbol('test'))).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('create returns same visitor shape for different contexts', () => {
      const { context: ctx1 } = createMockRuleContext()
      const { context: ctx2 } = createMockRuleContext({ source: 'different source' })
      const visitor1 = noUnnecessaryConsoleErrorSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryConsoleErrorSpreadRule.create(ctx2)
      expect(Object.keys(visitor1)).toEqual(Object.keys(visitor2))
    })

    test('message mentions console.error', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'x' }))
      expect(reports[0].message).toContain('console.error')
    })

    test('message mentions consider passing arguments directly', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'x' }))
      expect(reports[0].message).toContain('Consider passing arguments directly')
    })

    test('handles zero values in loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleErrorSpreadRule.create(context)
      visitor.CallExpression(createConsoleErrorSpread({ type: 'Identifier', name: 'arr' }, 0, 0))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })
})

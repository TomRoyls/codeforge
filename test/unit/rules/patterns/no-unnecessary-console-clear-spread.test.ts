import { describe, test, expect, vi } from 'vitest'
import { noUnnecessaryConsoleClearSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-console-clear-spread.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function makeConsoleClearCall(
  args: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: {
        type: 'Identifier',
        name: 'console',
      },
      property: {
        type: 'Identifier',
        name: 'clear',
      },
    },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function makeSpreadArg(argName = 'items'): unknown {
  return {
    type: 'SpreadElement',
    argument: {
      type: 'Identifier',
      name: argName,
    },
  }
}

describe('no-unnecessary-console-clear-spread rule', () => {
  // ─── META (8 tests) ───────────────────────────────────────────────
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryConsoleClearSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryConsoleClearSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryConsoleClearSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryConsoleClearSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined as empty array', () => {
      expect(noUnnecessaryConsoleClearSpreadRule.meta.schema).toEqual([])
    })

    test('should mention console.clear in description', () => {
      expect(noUnnecessaryConsoleClearSpreadRule.meta.docs?.description).toContain('console.clear')
    })

    test('should mention spread in description', () => {
      expect(noUnnecessaryConsoleClearSpreadRule.meta.docs?.description.toLowerCase()).toContain('spread')
    })

    test('should have docs url containing rule name', () => {
      expect(noUnnecessaryConsoleClearSpreadRule.meta.docs?.url).toContain('no-unnecessary-console-clear-spread')
    })
  })

  // ─── STRUCTURE (2 tests) ──────────────────────────────────────────
  describe('structure', () => {
    test('should return visitor with CallExpression method', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should produce independent visitors for separate contexts', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()
      const v1 = noUnnecessaryConsoleClearSpreadRule.create(ctx1)
      const v2 = noUnnecessaryConsoleClearSpreadRule.create(ctx2)

      v1.CallExpression(makeConsoleClearCall([makeSpreadArg()]))
      v2.CallExpression(makeConsoleClearCall([]))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })
  })

  // ─── POSITIVE CASES (28 tests) ────────────────────────────────────
  describe('positive cases - should report', () => {
    test('should report console.clear(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      visitor.CallExpression(makeConsoleClearCall([makeSpreadArg('items')]))
      expect(reports.length).toBe(1)
    })

    test('should report with spread of a single variable', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      visitor.CallExpression(makeConsoleClearCall([makeSpreadArg('data')]))
      expect(reports.length).toBe(1)
    })

    test('should report with spread of arr', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      visitor.CallExpression(makeConsoleClearCall([makeSpreadArg('arr')]))
      expect(reports.length).toBe(1)
    })

    test('should include spread keyword in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      visitor.CallExpression(makeConsoleClearCall([makeSpreadArg()]))
      expect(reports[0].message).toContain('spread')
    })

    test('should mention clear() takes no arguments in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      visitor.CallExpression(makeConsoleClearCall([makeSpreadArg()]))
      expect(reports[0].message).toContain('clear() takes no arguments')
    })

    test('should mention console.clear in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      visitor.CallExpression(makeConsoleClearCall([makeSpreadArg()]))
      expect(reports[0].message).toContain('console.clear')
    })

    test('should include unusual in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      visitor.CallExpression(makeConsoleClearCall([makeSpreadArg()]))
      expect(reports[0].message).toContain('unusual')
    })

    test('should report spread of an array literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const spreadOfArray: unknown = {
        type: 'SpreadElement',
        argument: {
          type: 'ArrayExpression',
          elements: [],
        },
      }
      visitor.CallExpression(makeConsoleClearCall([spreadOfArray]))
      expect(reports.length).toBe(1)
    })

    test('should report spread of a call expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const spreadOfCall: unknown = {
        type: 'SpreadElement',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getItems' },
          arguments: [],
        },
      }
      visitor.CallExpression(makeConsoleClearCall([spreadOfCall]))
      expect(reports.length).toBe(1)
    })

    test('should report spread of a member expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const spreadOfMember: unknown = {
        type: 'SpreadElement',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'items' },
        },
      }
      visitor.CallExpression(makeConsoleClearCall([spreadOfMember]))
      expect(reports.length).toBe(1)
    })

    test('should report at correct location line 1', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      visitor.CallExpression(makeConsoleClearCall([makeSpreadArg()], 1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report at correct location line 10 column 5', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      visitor.CallExpression(makeConsoleClearCall([makeSpreadArg()], 10, 5))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report at correct location line 100 column 20', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      visitor.CallExpression(makeConsoleClearCall([makeSpreadArg()], 100, 20))
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report end location from node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      visitor.CallExpression(makeConsoleClearCall([makeSpreadArg()], 5, 3))
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(33)
    })

    test('should report with spread of args named rest', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      visitor.CallExpression(makeConsoleClearCall([makeSpreadArg('rest')]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('spread')
    })

    test('should report with spread of args named params', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      visitor.CallExpression(makeConsoleClearCall([makeSpreadArg('params')]))
      expect(reports.length).toBe(1)
    })

    test('should report with spread of args named values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      visitor.CallExpression(makeConsoleClearCall([makeSpreadArg('values')]))
      expect(reports.length).toBe(1)
    })

    test('should report with spread of args named options', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      visitor.CallExpression(makeConsoleClearCall([makeSpreadArg('options')]))
      expect(reports.length).toBe(1)
    })

    test('should report with spread of args named config', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      visitor.CallExpression(makeConsoleClearCall([makeSpreadArg('config')]))
      expect(reports.length).toBe(1)
    })

    test('should report with spread of a conditional expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const spreadOfConditional: unknown = {
        type: 'SpreadElement',
        argument: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'flag' },
          consequent: { type: 'Identifier', name: 'a' },
          alternate: { type: 'Identifier', name: 'b' },
        },
      }
      visitor.CallExpression(makeConsoleClearCall([spreadOfConditional]))
      expect(reports.length).toBe(1)
    })

    test('should report with spread of a binary expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const spreadOfBinary: unknown = {
        type: 'SpreadElement',
        argument: {
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
      }
      visitor.CallExpression(makeConsoleClearCall([spreadOfBinary]))
      expect(reports.length).toBe(1)
    })

    test('should report multiple calls independently', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      visitor.CallExpression(makeConsoleClearCall([makeSpreadArg('a')]))
      visitor.CallExpression(makeConsoleClearCall([makeSpreadArg('b')]))
      expect(reports.length).toBe(2)
    })

    test('should report with spread at zero location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      visitor.CallExpression(makeConsoleClearCall([makeSpreadArg()], 0, 0))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report with large line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      visitor.CallExpression(makeConsoleClearCall([makeSpreadArg()], 9999, 50))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should report with spread of identifier named _', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      visitor.CallExpression(makeConsoleClearCall([makeSpreadArg('_')]))
      expect(reports.length).toBe(1)
    })

    test('should report with spread of identifier named x', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      visitor.CallExpression(makeConsoleClearCall([makeSpreadArg('x')]))
      expect(reports.length).toBe(1)
    })

    test('should report with spread of identifier named myItems', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      visitor.CallExpression(makeConsoleClearCall([makeSpreadArg('myItems')]))
      expect(reports.length).toBe(1)
    })

    test('message should be a non-empty string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      visitor.CallExpression(makeConsoleClearCall([makeSpreadArg()]))
      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })
  })

  // ─── NEGATIVE CASES (40 tests) ────────────────────────────────────
  describe('negative cases - should not report', () => {
    test('should not report console.clear() with no arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      visitor.CallExpression(makeConsoleClearCall([]))
      expect(reports.length).toBe(0)
    })

    test('should not report console.clear() with a literal argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const literalArg: unknown = { type: 'Literal', value: 'hello' }
      visitor.CallExpression(makeConsoleClearCall([literalArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report console.clear() with identifier argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const identArg: unknown = { type: 'Identifier', name: 'x' }
      visitor.CallExpression(makeConsoleClearCall([identArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report console.clear() with two arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const arg1: unknown = { type: 'SpreadElement', argument: { type: 'Identifier', name: 'a' } }
      const arg2: unknown = { type: 'SpreadElement', argument: { type: 'Identifier', name: 'b' } }
      visitor.CallExpression(makeConsoleClearCall([arg1, arg2]))
      expect(reports.length).toBe(0)
    })

    test('should not report console.log(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console.warn(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'warn' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console.error(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console.info(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'info' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report logger.clear(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'logger' },
          property: { type: 'Identifier', name: 'clear' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report myObj.clear(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'myObj' },
          property: { type: 'Identifier', name: 'clear' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report clear(...items) direct call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'clear' },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console["clear"](...items) computed access', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Literal', value: 'clear' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report window.console.clear(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'window' },
            property: { type: 'Identifier', name: 'console' },
          },
          property: { type: 'Identifier', name: 'clear' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console.clear with object argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const objArg: unknown = {
        type: 'ObjectExpression',
        properties: [],
      }
      visitor.CallExpression(makeConsoleClearCall([objArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report console.clear with array argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const arrArg: unknown = {
        type: 'ArrayExpression',
        elements: [],
      }
      visitor.CallExpression(makeConsoleClearCall([arrArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report console.clear with function call argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const fnArg: unknown = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getItems' },
        arguments: [],
      }
      visitor.CallExpression(makeConsoleClearCall([fnArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report console.clear with null argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const nullArg: unknown = { type: 'Literal', value: null }
      visitor.CallExpression(makeConsoleClearCall([nullArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report console.clear with numeric literal argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const numArg: unknown = { type: 'Literal', value: 42 }
      visitor.CallExpression(makeConsoleClearCall([numArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report console.clear with boolean argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const boolArg: unknown = { type: 'Literal', value: true }
      visitor.CallExpression(makeConsoleClearCall([boolArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report console.clear with template literal argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const tmplArg: unknown = {
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      }
      visitor.CallExpression(makeConsoleClearCall([tmplArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report console.clear with new expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const newArg: unknown = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        arguments: [],
      }
      visitor.CallExpression(makeConsoleClearCall([newArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report console.clear with arrow function argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const arrowArg: unknown = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.CallExpression(makeConsoleClearCall([arrowArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report console.debug(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'debug' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console.table(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'table' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console.dir(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'dir' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console.trace(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'trace' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console.assert(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'assert' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console.count(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'count' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console.group(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'group' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console.clear with three regular arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const a1: unknown = { type: 'Literal', value: 1 }
      const a2: unknown = { type: 'Literal', value: 2 }
      const a3: unknown = { type: 'Literal', value: 3 }
      visitor.CallExpression(makeConsoleClearCall([a1, a2, a3]))
      expect(reports.length).toBe(0)
    })

    test('should not report console.clear with no callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report non-CallExpression nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console.clear with member expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const memberArg: unknown = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
      }
      visitor.CallExpression(makeConsoleClearCall([memberArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report console.clear with unary expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const unaryArg: unknown = {
        type: 'UnaryExpression',
        operator: '!',
        argument: { type: 'Identifier', name: 'flag' },
      }
      visitor.CallExpression(makeConsoleClearCall([unaryArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report console.clear with assignment expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const assignArg: unknown = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
      }
      visitor.CallExpression(makeConsoleClearCall([assignArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report console.clear with spread and extra arg (2 args)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const spread: unknown = makeSpreadArg()
      const extra: unknown = { type: 'Literal', value: 1 }
      visitor.CallExpression(makeConsoleClearCall([spread, extra]))
      expect(reports.length).toBe(0)
    })

    test('should not report console.clear with conditional expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const condArg: unknown = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'flag' },
        consequent: { type: 'Literal', value: 1 },
        alternate: { type: 'Literal', value: 2 },
      }
      visitor.CallExpression(makeConsoleClearCall([condArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report consolelike.clear(...items) (different identifier)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'consolelike' },
          property: { type: 'Identifier', name: 'clear' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report myconsole.clear(...items) (prefixed)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'myconsole' },
          property: { type: 'Identifier', name: 'clear' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console.clear with binary expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const binArg: unknown = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }
      visitor.CallExpression(makeConsoleClearCall([binArg]))
      expect(reports.length).toBe(0)
    })

  })

  // ─── EDGE CASES (17 tests) ────────────────────────────────────────
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle string node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle numeric node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null arguments array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'clear' },
        },
        arguments: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined arguments array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'clear' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with callee object null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: null,
          property: { type: 'Identifier', name: 'clear' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with callee property null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: null,
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'clear' },
        },
        arguments: [makeSpreadArg()],
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with callee object as non-Identifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Literal', value: 'console' },
          property: { type: 'Identifier', name: 'clear' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with callee property as non-Identifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Literal', value: 'clear' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with NaN loc values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'clear' },
        },
        arguments: [makeSpreadArg()],
        loc: {
          start: { line: Number.NaN, column: Number.NaN },
          end: { line: Number.NaN, column: Number.NaN },
        },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle array node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      expect(() => visitor.CallExpression([1, 2, 3])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle function node', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleClearSpreadRule.create(context)
      expect(() => visitor.CallExpression(() => {})).not.toThrow()
    })
  })
})

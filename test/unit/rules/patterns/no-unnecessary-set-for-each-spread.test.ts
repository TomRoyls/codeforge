import { describe, test, expect, vi } from 'vitest'
import { noUnnecessarySetForEachSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-set-for-each-spread.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function makeSetForEachCall(
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
        name: 'set',
      },
      property: {
        type: 'Identifier',
        name: 'forEach',
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

describe('no-unnecessary-set-for-each-spread rule', () => {
  // ─── META (8 tests) ───────────────────────────────────────────────
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessarySetForEachSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessarySetForEachSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessarySetForEachSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessarySetForEachSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined as empty array', () => {
      expect(noUnnecessarySetForEachSpreadRule.meta.schema).toEqual([])
    })

    test('should mention set.forEach in description', () => {
      expect(noUnnecessarySetForEachSpreadRule.meta.docs?.description).toContain('set.forEach')
    })

    test('should mention spread in description', () => {
      expect(noUnnecessarySetForEachSpreadRule.meta.docs?.description.toLowerCase()).toContain('spread')
    })

    test('should have docs url containing rule name', () => {
      expect(noUnnecessarySetForEachSpreadRule.meta.docs?.url).toContain('no-unnecessary-set-for-each-spread')
    })
  })

  // ─── STRUCTURE (2 tests) ──────────────────────────────────────────
  describe('structure', () => {
    test('should return visitor with CallExpression method', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should produce independent visitors for separate contexts', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()
      const v1 = noUnnecessarySetForEachSpreadRule.create(ctx1)
      const v2 = noUnnecessarySetForEachSpreadRule.create(ctx2)

      v1.CallExpression(makeSetForEachCall([makeSpreadArg()]))
      v2.CallExpression(makeSetForEachCall([]))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })
  })

  // ─── POSITIVE CASES (28 tests) ────────────────────────────────────
  describe('positive cases - should report', () => {
    test('should report set.forEach(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      visitor.CallExpression(makeSetForEachCall([makeSpreadArg('items')]))
      expect(reports.length).toBe(1)
    })

    test('should report with spread of a single variable', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      visitor.CallExpression(makeSetForEachCall([makeSpreadArg('data')]))
      expect(reports.length).toBe(1)
    })

    test('should report with spread of arr', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      visitor.CallExpression(makeSetForEachCall([makeSpreadArg('arr')]))
      expect(reports.length).toBe(1)
    })

    test('should include spread keyword in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      visitor.CallExpression(makeSetForEachCall([makeSpreadArg()]))
      expect(reports[0].message).toContain('spread')
    })

    test('should mention set.forEach in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      visitor.CallExpression(makeSetForEachCall([makeSpreadArg()]))
      expect(reports[0].message).toContain('set.forEach')
    })

    test('should include unusual in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      visitor.CallExpression(makeSetForEachCall([makeSpreadArg()]))
      expect(reports[0].message).toContain('unusual')
    })

    test('should mention Consider passing arguments in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      visitor.CallExpression(makeSetForEachCall([makeSpreadArg()]))
      expect(reports[0].message).toContain('Consider passing arguments directly')
    })

    test('should report spread of an array literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const spreadOfArray: unknown = {
        type: 'SpreadElement',
        argument: {
          type: 'ArrayExpression',
          elements: [],
        },
      }
      visitor.CallExpression(makeSetForEachCall([spreadOfArray]))
      expect(reports.length).toBe(1)
    })

    test('should report spread of a call expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const spreadOfCall: unknown = {
        type: 'SpreadElement',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getItems' },
          arguments: [],
        },
      }
      visitor.CallExpression(makeSetForEachCall([spreadOfCall]))
      expect(reports.length).toBe(1)
    })

    test('should report spread of a member expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const spreadOfMember: unknown = {
        type: 'SpreadElement',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'items' },
        },
      }
      visitor.CallExpression(makeSetForEachCall([spreadOfMember]))
      expect(reports.length).toBe(1)
    })

    test('should report at correct location line 1', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      visitor.CallExpression(makeSetForEachCall([makeSpreadArg()], 1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report at correct location line 10 column 5', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      visitor.CallExpression(makeSetForEachCall([makeSpreadArg()], 10, 5))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report at correct location line 100 column 20', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      visitor.CallExpression(makeSetForEachCall([makeSpreadArg()], 100, 20))
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report end location from node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      visitor.CallExpression(makeSetForEachCall([makeSpreadArg()], 5, 3))
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(33)
    })

    test('should report with spread of args named rest', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      visitor.CallExpression(makeSetForEachCall([makeSpreadArg('rest')]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('spread')
    })

    test('should report with spread of args named params', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      visitor.CallExpression(makeSetForEachCall([makeSpreadArg('params')]))
      expect(reports.length).toBe(1)
    })

    test('should report with spread of args named values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      visitor.CallExpression(makeSetForEachCall([makeSpreadArg('values')]))
      expect(reports.length).toBe(1)
    })

    test('should report with spread of args named options', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      visitor.CallExpression(makeSetForEachCall([makeSpreadArg('options')]))
      expect(reports.length).toBe(1)
    })

    test('should report with spread of args named config', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      visitor.CallExpression(makeSetForEachCall([makeSpreadArg('config')]))
      expect(reports.length).toBe(1)
    })

    test('should report with spread of a conditional expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const spreadOfConditional: unknown = {
        type: 'SpreadElement',
        argument: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'flag' },
          consequent: { type: 'Identifier', name: 'a' },
          alternate: { type: 'Identifier', name: 'b' },
        },
      }
      visitor.CallExpression(makeSetForEachCall([spreadOfConditional]))
      expect(reports.length).toBe(1)
    })

    test('should report with spread of a binary expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const spreadOfBinary: unknown = {
        type: 'SpreadElement',
        argument: {
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
      }
      visitor.CallExpression(makeSetForEachCall([spreadOfBinary]))
      expect(reports.length).toBe(1)
    })

    test('should report multiple calls independently', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      visitor.CallExpression(makeSetForEachCall([makeSpreadArg('a')]))
      visitor.CallExpression(makeSetForEachCall([makeSpreadArg('b')]))
      expect(reports.length).toBe(2)
    })

    test('should report with spread at zero location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      visitor.CallExpression(makeSetForEachCall([makeSpreadArg()], 0, 0))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report with large line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      visitor.CallExpression(makeSetForEachCall([makeSpreadArg()], 9999, 50))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should report with spread of identifier named _', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      visitor.CallExpression(makeSetForEachCall([makeSpreadArg('_')]))
      expect(reports.length).toBe(1)
    })

    test('should report with spread of identifier named x', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      visitor.CallExpression(makeSetForEachCall([makeSpreadArg('x')]))
      expect(reports.length).toBe(1)
    })

    test('should report with spread of identifier named myItems', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      visitor.CallExpression(makeSetForEachCall([makeSpreadArg('myItems')]))
      expect(reports.length).toBe(1)
    })

    test('message should be a non-empty string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      visitor.CallExpression(makeSetForEachCall([makeSpreadArg()]))
      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })
  })

  // ─── NEGATIVE CASES (40 tests) ────────────────────────────────────
  describe('negative cases - should not report', () => {
    test('should not report set.forEach() with no arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      visitor.CallExpression(makeSetForEachCall([]))
      expect(reports.length).toBe(0)
    })

    test('should not report set.forEach() with a literal argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const literalArg: unknown = { type: 'Literal', value: 'hello' }
      visitor.CallExpression(makeSetForEachCall([literalArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report set.forEach() with identifier argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const identArg: unknown = { type: 'Identifier', name: 'x' }
      visitor.CallExpression(makeSetForEachCall([identArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report set.forEach() with two arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const arg1: unknown = { type: 'SpreadElement', argument: { type: 'Identifier', name: 'a' } }
      const arg2: unknown = { type: 'SpreadElement', argument: { type: 'Identifier', name: 'b' } }
      visitor.CallExpression(makeSetForEachCall([arg1, arg2]))
      expect(reports.length).toBe(0)
    })

    test('should not report set.map(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'set' },
          property: { type: 'Identifier', name: 'map' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report set.filter(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'set' },
          property: { type: 'Identifier', name: 'filter' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report set.add(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'set' },
          property: { type: 'Identifier', name: 'add' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report set.has(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'set' },
          property: { type: 'Identifier', name: 'has' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report mySet.forEach(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'mySet' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report arr.forEach(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report forEach(...items) direct call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'forEach' },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report set["forEach"](...items) computed access', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'set' },
          property: { type: 'Literal', value: 'forEach' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report window.set.forEach(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'window' },
            property: { type: 'Identifier', name: 'set' },
          },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report set.forEach with object argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const objArg: unknown = {
        type: 'ObjectExpression',
        properties: [],
      }
      visitor.CallExpression(makeSetForEachCall([objArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report set.forEach with array argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const arrArg: unknown = {
        type: 'ArrayExpression',
        elements: [],
      }
      visitor.CallExpression(makeSetForEachCall([arrArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report set.forEach with function call argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const fnArg: unknown = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getItems' },
        arguments: [],
      }
      visitor.CallExpression(makeSetForEachCall([fnArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report set.forEach with null argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const nullArg: unknown = { type: 'Literal', value: null }
      visitor.CallExpression(makeSetForEachCall([nullArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report set.forEach with numeric literal argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const numArg: unknown = { type: 'Literal', value: 42 }
      visitor.CallExpression(makeSetForEachCall([numArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report set.forEach with boolean argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const boolArg: unknown = { type: 'Literal', value: true }
      visitor.CallExpression(makeSetForEachCall([boolArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report set.forEach with template literal argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const tmplArg: unknown = {
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      }
      visitor.CallExpression(makeSetForEachCall([tmplArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report set.forEach with new expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const newArg: unknown = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        arguments: [],
      }
      visitor.CallExpression(makeSetForEachCall([newArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report set.forEach with arrow function argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const arrowArg: unknown = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.CallExpression(makeSetForEachCall([arrowArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report set.delete(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'set' },
          property: { type: 'Identifier', name: 'delete' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report set.entries(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'set' },
          property: { type: 'Identifier', name: 'entries' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report set.values(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'set' },
          property: { type: 'Identifier', name: 'values' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report set.keys(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'set' },
          property: { type: 'Identifier', name: 'keys' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report set.clear(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'set' },
          property: { type: 'Identifier', name: 'clear' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report set.size(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'set' },
          property: { type: 'Identifier', name: 'size' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report set.forEach with three regular arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const a1: unknown = { type: 'Literal', value: 1 }
      const a2: unknown = { type: 'Literal', value: 2 }
      const a3: unknown = { type: 'Literal', value: 3 }
      visitor.CallExpression(makeSetForEachCall([a1, a2, a3]))
      expect(reports.length).toBe(0)
    })

    test('should not report set.forEach with no callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
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
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report set.forEach with member expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const memberArg: unknown = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
      }
      visitor.CallExpression(makeSetForEachCall([memberArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report set.forEach with unary expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const unaryArg: unknown = {
        type: 'UnaryExpression',
        operator: '!',
        argument: { type: 'Identifier', name: 'flag' },
      }
      visitor.CallExpression(makeSetForEachCall([unaryArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report set.forEach with assignment expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const assignArg: unknown = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
      }
      visitor.CallExpression(makeSetForEachCall([assignArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report set.forEach with spread and extra arg (2 args)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const spread: unknown = makeSpreadArg()
      const extra: unknown = { type: 'Literal', value: 1 }
      visitor.CallExpression(makeSetForEachCall([spread, extra]))
      expect(reports.length).toBe(0)
    })

    test('should not report set.forEach with conditional expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const condArg: unknown = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'flag' },
        consequent: { type: 'Literal', value: 1 },
        alternate: { type: 'Literal', value: 2 },
      }
      visitor.CallExpression(makeSetForEachCall([condArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report setlike.forEach(...items) (different identifier)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'setlike' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report myset.forEach(...items) (prefixed)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'myset' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report set.forEach with binary expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const binArg: unknown = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }
      visitor.CallExpression(makeSetForEachCall([binArg]))
      expect(reports.length).toBe(0)
    })

    test('should not report set.forEach with function expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const fnArg: unknown = {
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.CallExpression(makeSetForEachCall([fnArg]))
      expect(reports.length).toBe(0)
    })

  })

  // ─── EDGE CASES (17 tests) ────────────────────────────────────────
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle string node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle numeric node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null arguments array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'set' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined arguments array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'set' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
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
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: null,
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with callee property null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'set' },
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
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'set' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [makeSpreadArg()],
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with callee object as non-Identifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Literal', value: 'set' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with callee property as non-Identifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'set' },
          property: { type: 'Literal', value: 'forEach' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with NaN loc values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'set' },
          property: { type: 'Identifier', name: 'forEach' },
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
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      expect(() => visitor.CallExpression([1, 2, 3])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle function node', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessarySetForEachSpreadRule.create(context)
      expect(() => visitor.CallExpression(() => {})).not.toThrow()
    })
  })
})

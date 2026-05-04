import { describe, test, expect, vi } from 'vitest'
import { noUnnecessaryConsoleGroupCollapsedSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-console-group-collapsed-spread.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function makeConsoleGroupCollapsedCall(args: unknown[] = [], line = 1, column = 0): unknown {
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
        name: 'groupCollapsed',
      },
    },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

describe('no-unnecessary-console-group-collapsed-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryConsoleGroupCollapsedSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryConsoleGroupCollapsedSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryConsoleGroupCollapsedSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryConsoleGroupCollapsedSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined as empty array', () => {
      expect(noUnnecessaryConsoleGroupCollapsedSpreadRule.meta.schema).toEqual([])
    })

    test('should have docs with description', () => {
      expect(noUnnecessaryConsoleGroupCollapsedSpreadRule.meta.docs?.description).toBeDefined()
      expect(typeof noUnnecessaryConsoleGroupCollapsedSpreadRule.meta.docs?.description).toBe('string')
      expect(noUnnecessaryConsoleGroupCollapsedSpreadRule.meta.docs!.description.length).toBeGreaterThan(0)
    })

    test('should have docs url containing rule name', () => {
      expect(noUnnecessaryConsoleGroupCollapsedSpreadRule.meta.docs?.url).toContain('no-unnecessary-console-group-collapsed-spread')
    })

    test('should have meta type as a string', () => {
      expect(typeof noUnnecessaryConsoleGroupCollapsedSpreadRule.meta.type).toBe('string')
    })
  })

  describe('structure', () => {
    test('create should return visitor with CallExpression method', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('create should return a non-null object visitor', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      expect(visitor).not.toBeNull()
      expect(typeof visitor).toBe('object')
    })
  })

  describe('positive cases - reports console.groupCollapsed with single spread', () => {
    test('reports console.groupCollapsed(...arr)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
      ]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.groupCollapsed')
      expect(reports[0].message).toContain('spread')
    })

    test('reports console.groupCollapsed(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
      ]))

      expect(reports.length).toBe(1)
    })

    test('reports console.groupCollapsed(...args)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } },
      ]))

      expect(reports.length).toBe(1)
    })

    test('reports console.groupCollapsed(...data)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'data' } },
      ]))

      expect(reports.length).toBe(1)
    })

    test('reports console.groupCollapsed(...values)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'values' } },
      ]))

      expect(reports.length).toBe(1)
    })

    test('reports console.groupCollapsed(...list)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'list' } },
      ]))

      expect(reports.length).toBe(1)
    })

    test('reports console.groupCollapsed(...result)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'result' } },
      ]))

      expect(reports.length).toBe(1)
    })

    test('reports console.groupCollapsed(...options)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'options' } },
      ]))

      expect(reports.length).toBe(1)
    })

    test('reports console.groupCollapsed with spread of member expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        {
          type: 'SpreadElement',
          argument: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'items' },
          },
        },
      ]))

      expect(reports.length).toBe(1)
    })

    test('reports console.groupCollapsed with spread of call expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        {
          type: 'SpreadElement',
          argument: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'getItems' },
            arguments: [],
          },
        },
      ]))

      expect(reports.length).toBe(1)
    })

    test('reports console.groupCollapsed with spread of array literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        {
          type: 'SpreadElement',
          argument: {
            type: 'ArrayExpression',
            elements: [
              { type: 'Literal', value: 'a' },
              { type: 'Literal', value: 'b' },
            ],
          },
        },
      ]))

      expect(reports.length).toBe(1)
    })

    test('reports console.groupCollapsed with spread of conditional expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        {
          type: 'SpreadElement',
          argument: {
            type: 'ConditionalExpression',
            test: { type: 'Identifier', name: 'cond' },
            consequent: { type: 'Identifier', name: 'a' },
            alternate: { type: 'Identifier', name: 'b' },
          },
        },
      ]))

      expect(reports.length).toBe(1)
    })

    test('reports with correct location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } },
      ], 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports with correct location at line 10 column 5', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } },
      ], 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('reports with correct end location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } },
      ], 3, 2))

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(32)
    })

    test('message mentions console.groupCollapsed', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } },
      ]))

      expect(reports[0].message).toContain('console.groupCollapsed')
    })

    test('message mentions single spread', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } },
      ]))

      expect(reports[0].message).toContain('single spread')
    })

    test('message suggests passing arguments directly', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } },
      ]))

      expect(reports[0].message).toContain('Consider passing arguments directly')
    })

    test('message is a non-empty string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } },
      ]))

      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('reports console.groupCollapsed with spread of computed member', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        {
          type: 'SpreadElement',
          argument: {
            type: 'MemberExpression',
            computed: true,
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Literal', value: 'key' },
          },
        },
      ]))

      expect(reports.length).toBe(1)
    })

    test('reports console.groupCollapsed with spread of template literal result', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        {
          type: 'SpreadElement',
          argument: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [{ type: 'Literal', value: 'arg' }],
          },
        },
      ]))

      expect(reports.length).toBe(1)
    })

    test('reports multiple invocations each separately', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'a' } },
      ]))
      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'b' } },
      ]))

      expect(reports.length).toBe(2)
    })

    test('reports console.groupCollapsed with spread of logical expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        {
          type: 'SpreadElement',
          argument: {
            type: 'LogicalExpression',
            operator: '||',
            left: { type: 'Identifier', name: 'a' },
            right: { type: 'Identifier', name: 'b' },
          },
        },
      ]))

      expect(reports.length).toBe(1)
    })

    test('reports console.groupCollapsed with spread of parenthesized expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        {
          type: 'SpreadElement',
          argument: {
            type: 'BinaryExpression',
            operator: '+',
            left: { type: 'Identifier', name: 'a' },
            right: { type: 'Identifier', name: 'b' },
          },
        },
      ]))

      expect(reports.length).toBe(1)
    })

    test('reports console.groupCollapsed with spread at different source locations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } },
      ], 42, 10))

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('reports console.groupCollapsed with spread of await expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        {
          type: 'SpreadElement',
          argument: {
            type: 'AwaitExpression',
            argument: { type: 'Identifier', name: 'promise' },
          },
        },
      ]))

      expect(reports.length).toBe(1)
    })

    test('reports console.groupCollapsed with spread of yield expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        {
          type: 'SpreadElement',
          argument: {
            type: 'YieldExpression',
            argument: { type: 'Identifier', name: 'value' },
          },
        },
      ]))

      expect(reports.length).toBe(1)
    })

    test('reports console.groupCollapsed with spread of chained member', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        {
          type: 'SpreadElement',
          argument: {
            type: 'MemberExpression',
            object: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'a' },
              property: { type: 'Identifier', name: 'b' },
            },
            property: { type: 'Identifier', name: 'c' },
          },
        },
      ]))

      expect(reports.length).toBe(1)
    })


  })

  describe('negative cases - does not report', () => {
    test('does not report console.groupCollapsed() with no arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([]))

      expect(reports.length).toBe(0)
    })

    test('does not report console.groupCollapsed("label") with string literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'Literal', value: 'label' },
      ]))

      expect(reports.length).toBe(0)
    })

    test('does not report console.groupCollapsed("a", "b") with multiple regular args', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'Literal', value: 'a' },
        { type: 'Literal', value: 'b' },
      ]))

      expect(reports.length).toBe(0)
    })

    test('does not report console.groupCollapsed(...arr, "extra") with spread and extra arg', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        { type: 'Literal', value: 'extra' },
      ]))

      expect(reports.length).toBe(0)
    })

    test('does not report console.groupCollapsed("prefix", ...arr) with arg then spread', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'Literal', value: 'prefix' },
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
      ]))

      expect(reports.length).toBe(0)
    })

    test('does not report console.groupCollapsed(...arr, ...arr2) with two spreads', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr2' } },
      ]))

      expect(reports.length).toBe(0)
    })

    test('does not report console.groupCollapsed(identifier)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'Identifier', name: 'label' },
      ]))

      expect(reports.length).toBe(0)
    })

    test('does not report console.log(...arr)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('does not report console.warn(...arr)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'warn' },
        },
        arguments: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('does not report console.error(...arr)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

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
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('does not report console.group(...arr)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'group' },
        },
        arguments: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('does not report console.info(...arr)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'info' },
        },
        arguments: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('does not report console.debug(...arr)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'debug' },
        },
        arguments: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('does not report console.table(...arr)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'table' },
        },
        arguments: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('does not report console.dir(...arr)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'dir' },
        },
        arguments: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('does not report myObj.groupCollapsed(...arr) with different object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'myObj' },
          property: { type: 'Identifier', name: 'groupCollapsed' },
        },
        arguments: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('does not report logger.groupCollapsed(...arr) with different object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'logger' },
          property: { type: 'Identifier', name: 'groupCollapsed' },
        },
        arguments: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('does not report myconsole.groupCollapsed(...arr) with prefixed object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'myconsole' },
          property: { type: 'Identifier', name: 'groupCollapsed' },
        },
        arguments: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('does not report consolelike.groupCollapsed(...arr) with similar name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'consolelike' },
          property: { type: 'Identifier', name: 'groupCollapsed' },
        },
        arguments: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('does not report groupCollapsed(...arr) as direct function call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'groupCollapsed' },
        arguments: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('does not report window.console.groupCollapsed(...arr) with nested member', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

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
          property: { type: 'Identifier', name: 'groupCollapsed' },
        },
        arguments: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('does not report console["groupCollapsed"](...arr) with computed access', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Literal', value: 'groupCollapsed' },
        },
        arguments: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('does not report console.groupCollapsed(template)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'TemplateLiteral', quasis: [], expressions: [] },
      ]))

      expect(reports.length).toBe(0)
    })

    test('does not report console.groupCollapsed(obj)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'ObjectExpression', properties: [] },
      ]))

      expect(reports.length).toBe(0)
    })

    test('does not report console.groupCollapsed(42)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'Literal', value: 42 },
      ]))

      expect(reports.length).toBe(0)
    })

    test('does not report console.groupCollapsed(true)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'Literal', value: true },
      ]))

      expect(reports.length).toBe(0)
    })

    test('does not report console.groupCollapsed(null)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'Literal', value: null },
      ]))

      expect(reports.length).toBe(0)
    })

    test('does not report console.groupCollapsed(fn())', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
      ]))

      expect(reports.length).toBe(0)
    })

    test('does not report console.groupCollapsed(arr[0])', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 0 },
        },
      ]))

      expect(reports.length).toBe(0)
    })

    test('does not report console.groupCollapsed(...arr, ...arr2, "c") with three args', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr2' } },
        { type: 'Literal', value: 'c' },
      ]))

      expect(reports.length).toBe(0)
    })

    test('does not report console.groupCollapsed with three regular args', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'Literal', value: 'a' },
        { type: 'Literal', value: 'b' },
        { type: 'Literal', value: 'c' },
      ]))

      expect(reports.length).toBe(0)
    })

    test('does not report console.groupCollapsed with spread among multiple args', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'Literal', value: 'label' },
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'rest' } },
        { type: 'Literal', value: 'trailing' },
      ]))

      expect(reports.length).toBe(0)
    })

    test('does not report ExpressionStatement node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression({
        type: 'ExpressionStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('does not report a non-console MemberExpression call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'bar' },
        },
        arguments: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('does not report console.groupCollapsed(...arr, obj)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        { type: 'ObjectExpression', properties: [] },
      ]))

      expect(reports.length).toBe(0)
    })

    test('does not report console.groupCollapsed(new Set())', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Set' },
          arguments: [],
        },
      ]))

      expect(reports.length).toBe(0)
    })

    test('does not report console.groupCollapsed(undefined)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'Identifier', name: 'undefined' },
      ]))

      expect(reports.length).toBe(0)
    })

    test('does not report console.groupCollapsed(x + y)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        {
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Identifier', name: 'y' },
        },
      ]))

      expect(reports.length).toBe(0)
    })

    test('does not report console.groupCollapsed(cond ? a : b)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression(makeConsoleGroupCollapsedCall([
        {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'cond' },
          consequent: { type: 'Identifier', name: 'a' },
          alternate: { type: 'Identifier', name: 'b' },
        },
      ]))

      expect(reports.length).toBe(0)
    })

    test('does not report console.groupEnd(...arr)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'groupEnd' },
        },
        arguments: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('handles null node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('handles undefined node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('handles non-object node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles node without callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      expect(() => visitor.CallExpression({
        type: 'CallExpression',
        arguments: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles node with null callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      expect(() => visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles node with non-MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      expect(() => visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'groupCollapsed' },
        arguments: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles node with non-Identifier object in callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      expect(() => visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Literal', value: 'console' },
          property: { type: 'Identifier', name: 'groupCollapsed' },
        },
        arguments: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles node with non-Identifier property in callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      expect(() => visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Literal', value: 'groupCollapsed' },
        },
        arguments: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles node with null arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      expect(() => visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'groupCollapsed' },
        },
        arguments: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles node with missing loc gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'groupCollapsed' },
        },
        arguments: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        ],
      })

      expect(reports.length).toBe(1)
    })

    test('handles node without type property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      expect(() => visitor.CallExpression({
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'groupCollapsed' },
        },
        arguments: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles node with wrong type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      expect(() => visitor.CallExpression({
        type: 'ExpressionStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles boolean node', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(() => visitor.CallExpression(false)).not.toThrow()
    })

    test('handles array node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      expect(() => visitor.CallExpression([1, 2, 3])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles numeric node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(() => visitor.CallExpression(0)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('create produces independent visitors for different contexts', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()

      const visitor1 = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryConsoleGroupCollapsedSpreadRule.create(ctx2)

      visitor1.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'a' } },
      ]))
      visitor2.CallExpression(makeConsoleGroupCollapsedCall([
        { type: 'Literal', value: 'label' },
      ]))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })
  })
})

import { describe, test, expect, vi } from 'vitest'
import { noUnnecessaryConsoleTimeEndSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-console-time-end-spread.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function makeConsoleTimeEndCall(
  args: unknown[],
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
        name: 'timeEnd',
      },
    },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function makeSpreadArg(name: string): unknown {
  return {
    type: 'SpreadElement',
    argument: { type: 'Identifier', name },
  }
}

function makeLiteralArg(value: string): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function makeIdentifierArg(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

describe('no-unnecessary-console-time-end-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryConsoleTimeEndSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryConsoleTimeEndSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryConsoleTimeEndSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryConsoleTimeEndSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryConsoleTimeEndSpreadRule.meta.schema).toEqual([])
    })

    test('should have description mentioning timeEnd', () => {
      expect(noUnnecessaryConsoleTimeEndSpreadRule.meta.docs?.description.toLowerCase()).toContain('timeend')
    })

    test('should have docs url containing rule name', () => {
      expect(noUnnecessaryConsoleTimeEndSpreadRule.meta.docs?.url).toContain('no-unnecessary-console-time-end-spread')
    })

    test('should have description mentioning spread', () => {
      expect(noUnnecessaryConsoleTimeEndSpreadRule.meta.docs?.description.toLowerCase()).toContain('spread')
    })
  })

  describe('structure', () => {
    test('create should return visitor with CallExpression', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('create should be callable without throwing', () => {
      const { context } = createMockRuleContext()
      expect(() => noUnnecessaryConsoleTimeEndSpreadRule.create(context)).not.toThrow()
    })
  })

  describe('positive', () => {
    test('should report console.timeEnd(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(makeConsoleTimeEndCall([makeSpreadArg('items')]))
      expect(reports.length).toBe(1)
    })

    test('should report console.timeEnd(...labels)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(makeConsoleTimeEndCall([makeSpreadArg('labels')]))
      expect(reports.length).toBe(1)
    })

    test('should report console.timeEnd(...args)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(makeConsoleTimeEndCall([makeSpreadArg('args')]))
      expect(reports.length).toBe(1)
    })

    test('should report console.timeEnd(...arr)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(makeConsoleTimeEndCall([makeSpreadArg('arr')]))
      expect(reports.length).toBe(1)
    })

    test('should report console.timeEnd(...data)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(makeConsoleTimeEndCall([makeSpreadArg('data')]))
      expect(reports.length).toBe(1)
    })

    test('should report console.timeEnd(...list)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(makeConsoleTimeEndCall([makeSpreadArg('list')]))
      expect(reports.length).toBe(1)
    })

    test('should include correct message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(makeConsoleTimeEndCall([makeSpreadArg('items')]))
      expect(reports[0].message).toBe(
        'console.timeEnd(...items) with spread is unusual. timeEnd() expects an optional label string.',
      )
    })

    test('should include location in report', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(makeConsoleTimeEndCall([makeSpreadArg('items')], 5, 10))
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report spread with member expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeEndCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'obj' },
              property: { type: 'Identifier', name: 'labels' },
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report spread with call expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeEndCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'getLabels' },
              arguments: [],
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report spread with array expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeEndCall([
          {
            type: 'SpreadElement',
            argument: { type: 'ArrayExpression', elements: [] },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(makeConsoleTimeEndCall([makeSpreadArg('x')], 1, 0))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report at large line numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(makeConsoleTimeEndCall([makeSpreadArg('x')], 9999, 50))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should report spread with conditional expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeEndCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'ConditionalExpression',
              test: { type: 'Identifier', name: 'flag' },
              consequent: { type: 'Identifier', name: 'a' },
              alternate: { type: 'Identifier', name: 'b' },
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report spread with template literal argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeEndCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'TemplateLiteral',
              quasis: [{ type: 'TemplateElement', value: { raw: 'label', cooked: 'label' } }],
              expressions: [],
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report without loc on node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'timeEnd' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      })
      expect(reports.length).toBe(1)
    })

    test('should report multiple spread calls independently', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(makeConsoleTimeEndCall([makeSpreadArg('a')]))
      visitor.CallExpression(makeConsoleTimeEndCall([makeSpreadArg('b')]))
      expect(reports.length).toBe(2)
    })

    test('should report spread with binary expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeEndCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'BinaryExpression',
              operator: '+',
              left: { type: 'Identifier', name: 'a' },
              right: { type: 'Identifier', name: 'b' },
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report spread with unary expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeEndCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'UnaryExpression',
              operator: '!',
              argument: { type: 'Identifier', name: 'flag' },
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report spread with arrow function argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeEndCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'ArrowFunctionExpression',
              params: [],
              body: { type: 'BlockStatement', body: [] },
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report spread with object expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeEndCall([
          {
            type: 'SpreadElement',
            argument: { type: 'ObjectExpression', properties: [] },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report spread with logical expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeEndCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'LogicalExpression',
              operator: '||',
              left: { type: 'Identifier', name: 'a' },
              right: { type: 'Identifier', name: 'b' },
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report spread with parenthesized expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeEndCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'ParenthesizedExpression',
              expression: { type: 'Identifier', name: 'val' },
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report spread with sequence expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeEndCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'SequenceExpression',
              expressions: [
                { type: 'Identifier', name: 'a' },
                { type: 'Identifier', name: 'b' },
              ],
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report spread with await expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeEndCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'AwaitExpression',
              argument: { type: 'Identifier', name: 'promise' },
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report spread with yield expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeEndCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'YieldExpression',
              argument: { type: 'Identifier', name: 'value' },
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report spread with new expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeEndCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'NewExpression',
              callee: { type: 'Identifier', name: 'Set' },
              arguments: [],
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report spread with tagged template expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeEndCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'TaggedTemplateExpression',
              tag: { type: 'Identifier', name: 'tag' },
              quasi: {
                type: 'TemplateLiteral',
                quasis: [],
                expressions: [],
              },
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('negative', () => {
    test('should not report console.timeEnd with string literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(makeConsoleTimeEndCall([makeLiteralArg('label')]))
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeEnd with identifier argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(makeConsoleTimeEndCall([makeIdentifierArg('label')]))
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeEnd with no arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(makeConsoleTimeEndCall([]))
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeEnd with two arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(makeConsoleTimeEndCall([makeSpreadArg('a'), makeSpreadArg('b')]))
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeEnd with three arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(makeConsoleTimeEndCall([makeLiteralArg('a'), makeLiteralArg('b'), makeLiteralArg('c')]))
      expect(reports.length).toBe(0)
    })

    test('should not report console.log(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.warn(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'warn' },
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.error(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.time(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'time' },
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report foo.timeEnd(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'timeEnd' },
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report logger.timeEnd(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'logger' },
          property: { type: 'Identifier', name: 'timeEnd' },
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report plain timeEnd(...items) call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'timeEnd' },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report window.console.timeEnd(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
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
          property: { type: 'Identifier', name: 'timeEnd' },
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report computed console["timeEnd"](...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Literal', value: 'timeEnd' },
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeEnd with numeric literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeEndCall([{ type: 'Literal', value: 42 }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeEnd with boolean literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeEndCall([{ type: 'Literal', value: true }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeEnd with null literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeEndCall([{ type: 'Literal', value: null }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeEnd with object expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeEndCall([{ type: 'ObjectExpression', properties: [] }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeEnd with array expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeEndCall([{ type: 'ArrayExpression', elements: [] }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeEnd with template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeEndCall([{
          type: 'TemplateLiteral',
          quasis: [{ type: 'TemplateElement', value: { raw: 'label', cooked: 'label' } }],
          expressions: [],
        }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report consoleLike.timeEnd(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'consoleLike' },
          property: { type: 'Identifier', name: 'timeEnd' },
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report myconsole.timeEnd(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'myconsole' },
          property: { type: 'Identifier', name: 'timeEnd' },
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeEnd with member expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeEndCall([{
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'label' },
        }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeEnd with call expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeEndCall([{
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getLabel' },
          arguments: [],
        }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeEnd with conditional expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeEndCall([{
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'flag' },
          consequent: { type: 'Literal', value: 'a' },
          alternate: { type: 'Literal', value: 'b' },
        }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeEnd with binary expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeEndCall([{
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Literal', value: 'lab' },
          right: { type: 'Literal', value: 'el' },
        }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report ExpressionStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'ExpressionStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeEnd with undefined argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeEndCall([{ type: 'Identifier', name: 'undefined' }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report globalThis.console.timeEnd(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'globalThis' },
            property: { type: 'Identifier', name: 'console' },
          },
          property: { type: 'Identifier', name: 'timeEnd' },
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.info(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'info' },
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.debug(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'debug' },
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.table(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'table' },
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.dir(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'dir' },
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.count(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'count' },
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.clear(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'clear' },
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.group(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'group' },
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.trace(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'trace' },
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.assert(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'assert' },
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.profile(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'profile' },
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeEnd with tagged template argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeEndCall([{
          type: 'TaggedTemplateExpression',
          tag: { type: 'Identifier', name: 'tag' },
          quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
        }]),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('edge', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle string node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      expect(() => visitor.CallExpression('console.timeEnd(...items)')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle numeric node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node with null arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'timeEnd' },
        },
        arguments: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'timeEnd' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: null,
          property: { type: 'Identifier', name: 'timeEnd' },
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: null,
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong callee type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Literal', value: 'console' },
          property: { type: 'Identifier', name: 'timeEnd' },
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong property type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Literal', value: 'timeEnd' },
        },
        arguments: [makeSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(() => visitor.CallExpression(false)).not.toThrow()
    })

    test('should handle array node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      expect(() => visitor.CallExpression([1, 2, 3])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle function node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      expect(() => visitor.CallExpression(() => {})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with NaN loc values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'timeEnd' },
        },
        arguments: [makeSpreadArg('items')],
        loc: {
          start: { line: Number.NaN, column: Number.NaN },
          end: { line: Number.NaN, column: Number.NaN },
        },
      })
      expect(reports.length).toBe(1)
    })
  })
})

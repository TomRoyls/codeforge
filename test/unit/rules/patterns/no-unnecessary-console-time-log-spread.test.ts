import { describe, test, expect } from 'vitest'
import { noUnnecessaryConsoleTimeLogSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-console-time-log-spread.js'
import { createMockRuleContext } from '../../../helpers/ast-helpers.js'

function makeConsoleTimeLogCall(
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
        name: 'timeLog',
      },
    },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

describe('no-unnecessary-console-time-log-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryConsoleTimeLogSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryConsoleTimeLogSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryConsoleTimeLogSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryConsoleTimeLogSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have an empty schema', () => {
      expect(noUnnecessaryConsoleTimeLogSpreadRule.meta.schema).toEqual([])
    })

    test('should have a docs description', () => {
      expect(noUnnecessaryConsoleTimeLogSpreadRule.meta.docs?.description).toBeDefined()
      expect(typeof noUnnecessaryConsoleTimeLogSpreadRule.meta.docs?.description).toBe('string')
    })

    test('should mention timeLog in docs description', () => {
      expect(noUnnecessaryConsoleTimeLogSpreadRule.meta.docs?.description).toContain('timeLog')
    })

    test('should have a docs url', () => {
      expect(noUnnecessaryConsoleTimeLogSpreadRule.meta.docs?.url).toBeDefined()
      expect(typeof noUnnecessaryConsoleTimeLogSpreadRule.meta.docs?.url).toBe('string')
    })
  })

  describe('create', () => {
    test('should return a visitor with CallExpression method', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return a non-null visitor object', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      expect(visitor).not.toBeNull()
      expect(typeof visitor).toBe('object')
    })
  })

  describe('positive cases', () => {
    test('should report console.timeLog(...items) with single spread of identifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.timeLog(...items)')
    })

    test('should report console.timeLog(...arr)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report console.timeLog(...data)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'data' } }]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report console.timeLog(...args)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report console.timeLog(...values)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'values' } }]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report console.timeLog with spread of member expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'obj' },
              property: { type: 'Identifier', name: 'items' },
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report console.timeLog with spread of call expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'getItems' },
              arguments: [],
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report console.timeLog with spread of array expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'ArrayExpression',
              elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }],
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report at correct location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }], 5, 10),
      )
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }], 1, 0),
      )
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should include suggestion in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]),
      )
      expect(reports[0].message).toContain('Consider passing arguments directly')
    })

    test('should include spread mention in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]),
      )
      expect(reports[0].message).toContain('spread')
    })

    test('should include unusual mention in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]),
      )
      expect(reports[0].message).toContain('unusual')
    })

    test('should report console.timeLog with spread of conditional expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([
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

    test('should report console.timeLog with spread of binary expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'BinaryExpression',
              left: { type: 'Identifier', name: 'a' },
              operator: '+',
              right: { type: 'Identifier', name: 'b' },
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report console.timeLog with spread of template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'TemplateLiteral',
              quasis: [{ type: 'TemplateElement', value: { raw: 'hello' } }],
              expressions: [],
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with large line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }], 9999, 50),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should report at location 0,0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }], 0, 0),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report with spread of parenthesized expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([
          {
            type: 'SpreadElement',
            argument: { type: 'Identifier', name: 'result', parenthesized: true },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with spread of yield expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([
          {
            type: 'SpreadElement',
            argument: { type: 'YieldExpression', argument: null },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with spread of await expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([
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

    test('should report with spread of new expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([
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

    test('should report with spread of logical expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'LogicalExpression',
              left: { type: 'Identifier', name: 'a' },
              operator: '||',
              right: { type: 'Identifier', name: 'b' },
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with spread of unary expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([
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

    test('should report with spread of object expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'ObjectExpression',
              properties: [],
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with spread of sequence expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([
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

    test('should report with spread of tagged template', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'TaggedTemplateExpression',
              tag: { type: 'Identifier', name: 'tag' },
              quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report with multi-line location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'timeLog' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }],
        loc: { start: { line: 5, column: 0 }, end: { line: 8, column: 1 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.end.line).toBe(8)
    })
  })

  describe('negative cases', () => {
    test('should not report console.timeLog with no arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(makeConsoleTimeLogCall([]))
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeLog with a string argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([{ type: 'Literal', value: 'timer' }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeLog with identifier argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([{ type: 'Identifier', name: 'label' }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeLog with two arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([
          { type: 'Literal', value: 'timer' },
          { type: 'Identifier', name: 'data' },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeLog with three arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([
          { type: 'Literal', value: 'a' },
          { type: 'Literal', value: 'b' },
          { type: 'Literal', value: 'c' },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.log with spread', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.warn with spread', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'warn' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.error with spread', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.info with spread', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'info' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.debug with spread', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'debug' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.time with spread', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'time' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeEnd with spread', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'timeEnd' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report myObj.timeLog(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'myObj' },
          property: { type: 'Identifier', name: 'timeLog' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report logger.timeLog(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'logger' },
          property: { type: 'Identifier', name: 'timeLog' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report direct timeLog function call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'timeLog' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console["timeLog"](...items) computed access', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Literal', value: 'timeLog' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report window.console.timeLog(...items) nested member', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
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
          property: { type: 'Identifier', name: 'timeLog' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeLog() with numeric argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([{ type: 'Literal', value: 42 }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeLog() with object argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([{ type: 'ObjectExpression', properties: [] }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeLog() with array argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([{ type: 'ArrayExpression', elements: [] }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeLog() with function expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([{ type: 'FunctionExpression', params: [], body: null }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeLog() with arrow function argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([{ type: 'ArrowFunctionExpression', params: [], body: null }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeLog() with null argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([{ type: 'Literal', value: null }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeLog() with boolean argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([{ type: 'Literal', value: true }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report consolelike.timeLog(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'consolelike' },
          property: { type: 'Identifier', name: 'timeLog' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report myconsole.timeLog(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'myconsole' },
          property: { type: 'Identifier', name: 'timeLog' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeLog with spread and another arg (2 args)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([
          { type: 'Literal', value: 'label' },
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeLog with spread and two other args', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([
          { type: 'Literal', value: 'a' },
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
          { type: 'Literal', value: 'b' },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.table with spread', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'table' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.dir with spread', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'dir' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.assert with spread', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'assert' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.group with spread', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'group' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.count with spread', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'count' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.clear with spread', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'clear' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.profile with spread', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'profile' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report process.stdout.timeLog(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'process' },
            property: { type: 'Identifier', name: 'stdout' },
          },
          property: { type: 'Identifier', name: 'timeLog' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeLog with template literal argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([
          { type: 'TemplateLiteral', quasis: [{ type: 'TemplateElement', value: { raw: 'label' } }], expressions: [] },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'timeLog' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.trace with spread', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'trace' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeLog with member expression argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleTimeLogCall([
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'label' },
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle numeric node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'ExpressionStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'timeLog' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node with null arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'timeLog' },
        },
        arguments: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier object in callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Literal', value: 'console' },
          property: { type: 'Identifier', name: 'timeLog' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier property in callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Literal', value: 'timeLog' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: null,
          property: { type: 'Identifier', name: 'timeLog' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: null,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'timeLog' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(() => visitor.CallExpression(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleTimeLogSpreadRule.create(context)
      expect(() => visitor.CallExpression([1, 2, 3])).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })
})

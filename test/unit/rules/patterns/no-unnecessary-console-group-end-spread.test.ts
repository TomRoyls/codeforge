import { describe, test, expect, vi } from 'vitest'
import { noUnnecessaryConsoleGroupEndSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-console-group-end-spread.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function makeConsoleGroupEndCall(args: unknown[], line = 1, column = 0): unknown {
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
        name: 'groupEnd',
      },
    },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

describe('no-unnecessary-console-group-end-spread rule', () => {
  // META (8 tests)
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryConsoleGroupEndSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryConsoleGroupEndSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryConsoleGroupEndSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryConsoleGroupEndSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have correct docs url', () => {
      expect(noUnnecessaryConsoleGroupEndSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-console-group-end-spread.ts',
      )
    })

    test('should have an empty schema', () => {
      expect(noUnnecessaryConsoleGroupEndSpreadRule.meta.schema).toEqual([])
    })

    test('should mention console.groupEnd in description', () => {
      expect(noUnnecessaryConsoleGroupEndSpreadRule.meta.docs?.description).toContain(
        'console.groupEnd',
      )
    })

    test('should mention spread in description', () => {
      expect(noUnnecessaryConsoleGroupEndSpreadRule.meta.docs?.description).toContain('spread')
    })
  })

  // STRUCTURE (2 tests)
  describe('structure', () => {
    test('should export create as a function', () => {
      const { context } = createMockRuleContext()
      expect(typeof noUnnecessaryConsoleGroupEndSpreadRule.create).toBe('function')
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return a visitor with CallExpression method', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  // POSITIVE (28 tests)
  describe('positive cases', () => {
    test('should report console.groupEnd(...items) with identifier spread', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.groupEnd')
      expect(reports[0].message).toContain('spread')
    })

    test('should report with correct message text', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }]),
      )
      expect(reports[0].message).toBe(
        'console.groupEnd(...items) with spread is unusual. groupEnd() takes no arguments.',
      )
    })

    test('should report spread of array literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
          { type: 'SpreadElement', argument: { type: 'ArrayExpression', elements: [] } },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report spread of member expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
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

    test('should report spread of call expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
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

    test('should report spread at different line numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }], 42, 10),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report spread at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }], 1, 0),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report multiple invocations separately', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'a' } }]),
      )
      visitor.CallExpression(
        makeConsoleGroupEndCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'b' } }]),
      )
      expect(reports.length).toBe(2)
    })

    test('should report spread of conditional expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'ConditionalExpression',
              test: { type: 'Identifier', name: 'x' },
              consequent: { type: 'Identifier', name: 'a' },
              alternate: { type: 'Identifier', name: 'b' },
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report spread of template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'TemplateLiteral',
              quasis: [{ type: 'TemplateElement', value: { raw: '', cooked: '' } }],
              expressions: [],
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report spread of binary expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
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

    test('should report spread of logical expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
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

    test('should report spread of new expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'NewExpression',
              callee: { type: 'Identifier', name: 'Array' },
              arguments: [],
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report spread of object expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
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

    test('should report spread of parenthesized expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'ParenthesizedExpression',
              expression: { type: 'Identifier', name: 'items' },
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report spread of unary expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'UnaryExpression',
              operator: '!',
              argument: { type: 'Identifier', name: 'x' },
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report spread of yield expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'YieldExpression',
              argument: null,
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report spread of await expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
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

    test('should report spread of assignment expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'AssignmentExpression',
              left: { type: 'Identifier', name: 'x' },
              operator: '=',
              right: { type: 'Identifier', name: 'y' },
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report spread of sequence expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
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

    test('should report spread of tagged template expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'TaggedTemplateExpression',
              tag: { type: 'Identifier', name: 'fn' },
              quasi: {
                type: 'TemplateLiteral',
                quasis: [{ type: 'TemplateElement', value: { raw: '', cooked: '' } }],
                expressions: [],
              },
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report spread of update expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'UpdateExpression',
              operator: '++',
              argument: { type: 'Identifier', name: 'x' },
              prefix: false,
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report spread of arrow function expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
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

    test('should report spread of function expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'FunctionExpression',
              id: null,
              params: [],
              body: { type: 'BlockStatement', body: [] },
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report spread of literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
          {
            type: 'SpreadElement',
            argument: { type: 'Literal', value: 42 },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report spread of this expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
          {
            type: 'SpreadElement',
            argument: { type: 'ThisExpression' },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report spread of array pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
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

    test('should report spread of type cast expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
          {
            type: 'SpreadElement',
            argument: {
              type: 'TypeCastExpression',
              expression: { type: 'Identifier', name: 'x' },
              typeAnnotation: { type: 'TypeAnnotation' },
            },
          },
        ]),
      )
      expect(reports.length).toBe(1)
    })
  })

  // NEGATIVE (40 tests)
  describe('negative cases', () => {
    test('should not report console.groupEnd() with no arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(makeConsoleGroupEndCall([]))
      expect(reports.length).toBe(0)
    })

    test('should not report console.groupEnd("label") with string argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([{ type: 'Literal', value: 'label' }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.groupEnd(x) with identifier argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([{ type: 'Identifier', name: 'x' }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.groupEnd(1, 2) with two arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } },
          { type: 'Literal', value: 2 },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.log(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.warn(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'warn' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.error(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.info(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'info' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.debug(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'debug' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.table(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'table' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.dir(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'dir' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report myObj.groupEnd(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'myObj' },
          property: { type: 'Identifier', name: 'groupEnd' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report logger.groupEnd(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'logger' },
          property: { type: 'Identifier', name: 'groupEnd' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report groupEnd(...items) direct call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'groupEnd' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report window.console.groupEnd(...items) nested member', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
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
          property: { type: 'Identifier', name: 'groupEnd' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console["groupEnd"](...items) computed access', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Literal', value: 'groupEnd' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.groupEnd(null)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([{ type: 'Literal', value: null }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.groupEnd(undefined)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([{ type: 'Identifier', name: 'undefined' }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.groupEnd(42)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([{ type: 'Literal', value: 42 }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.groupEnd(true)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([{ type: 'Literal', value: true }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.groupEnd(obj)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([{ type: 'Identifier', name: 'obj' }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.groupEnd(fn())', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
          {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [],
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.groupEnd(...a, ...b) multiple spread args', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'a' } },
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'b' } },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.group(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'group' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.groupCollapsed(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'groupCollapsed' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.groupEnd(template) with template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
          {
            type: 'TemplateLiteral',
            quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' } }],
            expressions: [],
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.groupEnd({a: 1}) with object arg', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([{ type: 'ObjectExpression', properties: [] }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.groupEnd([1,2]) with array arg', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([{ type: 'ArrayExpression', elements: [] }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.groupEnd(function(){}) with function arg', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
          {
            type: 'FunctionExpression',
            id: null,
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report consolelike.groupEnd(...items) with similar name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'consolelike' },
          property: { type: 'Identifier', name: 'groupEnd' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report myconsole.groupEnd(...items) with prefixed name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'myconsole' },
          property: { type: 'Identifier', name: 'groupEnd' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report Console.groupEnd(...items) with capitalized name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Console' },
          property: { type: 'Identifier', name: 'groupEnd' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report process.stdout.groupEnd(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
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
          property: { type: 'Identifier', name: 'groupEnd' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.groupEnd(a + b) with binary expression arg', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
          {
            type: 'BinaryExpression',
            left: { type: 'Identifier', name: 'a' },
            operator: '+',
            right: { type: 'Identifier', name: 'b' },
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.groupEnd(new Array()) with new expression arg', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
          {
            type: 'NewExpression',
            callee: { type: 'Identifier', name: 'Array' },
            arguments: [],
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.groupEnd(a ? b : c) with conditional arg', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
          {
            type: 'ConditionalExpression',
            test: { type: 'Identifier', name: 'a' },
            consequent: { type: 'Identifier', name: 'b' },
            alternate: { type: 'Identifier', name: 'c' },
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.groupEnd("a", "b") with two literal args', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([
          { type: 'Literal', value: 'a' },
          { type: 'Literal', value: 'b' },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.count(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'count' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.time(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'time' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.clear(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'clear' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })
  })

  // EDGE (17 tests)
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle numeric node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'ExpressionStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: undefined,
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'groupEnd' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }]),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle node with null object in callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: null,
          property: { type: 'Identifier', name: 'groupEnd' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node with null property in callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
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

    test('should handle boolean node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(() => visitor.CallExpression(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      expect(() => visitor.CallExpression([1, 2, 3])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should create independent visitors for different contexts', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()
      const visitor1 = noUnnecessaryConsoleGroupEndSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryConsoleGroupEndSpreadRule.create(ctx2)
      visitor1.CallExpression(
        makeConsoleGroupEndCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'a' } }]),
      )
      visitor2.CallExpression(
        makeConsoleGroupEndCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'b' } }]),
      )
      expect(r1.length).toBe(1)
      expect(r2.length).toBe(1)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleGroupEndCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }], 3, 5),
      )
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(35)
    })

    test('should handle node with partial loc (missing end)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleGroupEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'groupEnd' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }],
        loc: {
          start: { line: 1, column: 0 },
        },
      })
      expect(reports.length).toBe(1)
    })
  })
})

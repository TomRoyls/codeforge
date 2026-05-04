import { describe, test, expect, vi } from 'vitest'
import { noUnnecessaryConsoleProfileEndSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-console-profile-end-spread.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function makeConsoleProfileEndCall(args: unknown[], line = 1, column = 0): unknown {
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
        name: 'profileEnd',
      },
    },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

describe('no-unnecessary-console-profile-end-spread rule', () => {
  // META (8 tests)
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryConsoleProfileEndSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryConsoleProfileEndSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryConsoleProfileEndSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryConsoleProfileEndSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have correct docs url', () => {
      expect(noUnnecessaryConsoleProfileEndSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-console-profile-end-spread.ts',
      )
    })

    test('should have an empty schema', () => {
      expect(noUnnecessaryConsoleProfileEndSpreadRule.meta.schema).toEqual([])
    })

    test('should mention console.profileEnd in description', () => {
      expect(noUnnecessaryConsoleProfileEndSpreadRule.meta.docs?.description).toContain(
        'console.profileEnd',
      )
    })

    test('should mention spread in description', () => {
      expect(noUnnecessaryConsoleProfileEndSpreadRule.meta.docs?.description).toContain('spread')
    })
  })

  // STRUCTURE (2 tests)
  describe('structure', () => {
    test('should export create as a function', () => {
      const { context } = createMockRuleContext()
      expect(typeof noUnnecessaryConsoleProfileEndSpreadRule.create).toBe('function')
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return a visitor with CallExpression method', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  // POSITIVE (28 tests)
  describe('positive cases', () => {
    test('should report console.profileEnd(...items) with identifier spread', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.profileEnd')
      expect(reports[0].message).toContain('spread')
    })

    test('should report with correct message text', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }]),
      )
      expect(reports[0].message).toBe(
        'console.profileEnd(...items) with spread is unusual. profileEnd() takes no arguments.',
      )
    })

    test('should report spread of array literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
          { type: 'SpreadElement', argument: { type: 'ArrayExpression', elements: [] } },
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report spread of member expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }], 42, 10),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report spread at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }], 1, 0),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report multiple invocations separately', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'a' } }]),
      )
      visitor.CallExpression(
        makeConsoleProfileEndCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'b' } }]),
      )
      expect(reports.length).toBe(2)
    })

    test('should report spread of conditional expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
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
    test('should not report console.profileEnd() with no arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(makeConsoleProfileEndCall([]))
      expect(reports.length).toBe(0)
    })

    test('should not report console.profileEnd("label") with string argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([{ type: 'Literal', value: 'label' }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.profileEnd(x) with identifier argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([{ type: 'Identifier', name: 'x' }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.profileEnd(1, 2) with two arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } },
          { type: 'Literal', value: 2 },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.log(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
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

    test('should not report myObj.profileEnd(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'myObj' },
          property: { type: 'Identifier', name: 'profileEnd' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report logger.profileEnd(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'logger' },
          property: { type: 'Identifier', name: 'profileEnd' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report profileEnd(...items) direct call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'profileEnd' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report window.console.profileEnd(...items) nested member', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
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
          property: { type: 'Identifier', name: 'profileEnd' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console["profileEnd"](...items) computed access', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Literal', value: 'profileEnd' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.profileEnd(null)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([{ type: 'Literal', value: null }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.profileEnd(undefined)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([{ type: 'Identifier', name: 'undefined' }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.profileEnd(42)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([{ type: 'Literal', value: 42 }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.profileEnd(true)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([{ type: 'Literal', value: true }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.profileEnd(obj)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([{ type: 'Identifier', name: 'obj' }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.profileEnd(fn())', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
          {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [],
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.profileEnd(...a, ...b) multiple spread args', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'a' } },
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'b' } },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.group(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
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

    test('should not report console.profileEnd(template) with template literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
          {
            type: 'TemplateLiteral',
            quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' } }],
            expressions: [],
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.profileEnd({a: 1}) with object arg', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([{ type: 'ObjectExpression', properties: [] }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.profileEnd([1,2]) with array arg', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([{ type: 'ArrayExpression', elements: [] }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.profileEnd(function(){}) with function arg', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
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

    test('should not report consolelike.profileEnd(...items) with similar name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'consolelike' },
          property: { type: 'Identifier', name: 'profileEnd' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report myconsole.profileEnd(...items) with prefixed name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'myconsole' },
          property: { type: 'Identifier', name: 'profileEnd' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report Console.profileEnd(...items) with capitalized name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Console' },
          property: { type: 'Identifier', name: 'profileEnd' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report process.stdout.profileEnd(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
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
          property: { type: 'Identifier', name: 'profileEnd' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report console.profileEnd(a + b) with binary expression arg', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
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

    test('should not report console.profileEnd(new Array()) with new expression arg', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
          {
            type: 'NewExpression',
            callee: { type: 'Identifier', name: 'Array' },
            arguments: [],
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.profileEnd(a ? b : c) with conditional arg', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
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

    test('should not report console.profileEnd("a", "b") with two literal args', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([
          { type: 'Literal', value: 'a' },
          { type: 'Literal', value: 'b' },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report console.count(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle numeric node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'ExpressionStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'profileEnd' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }]),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle node with null object in callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: null,
          property: { type: 'Identifier', name: 'profileEnd' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node with null property in callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
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
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(() => visitor.CallExpression(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      expect(() => visitor.CallExpression([1, 2, 3])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should create independent visitors for different contexts', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()
      const visitor1 = noUnnecessaryConsoleProfileEndSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryConsoleProfileEndSpreadRule.create(ctx2)
      visitor1.CallExpression(
        makeConsoleProfileEndCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'a' } }]),
      )
      visitor2.CallExpression(
        makeConsoleProfileEndCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'b' } }]),
      )
      expect(r1.length).toBe(1)
      expect(r2.length).toBe(1)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression(
        makeConsoleProfileEndCall([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }], 3, 5),
      )
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(35)
    })

    test('should handle node with partial loc (missing end)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryConsoleProfileEndSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'profileEnd' },
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

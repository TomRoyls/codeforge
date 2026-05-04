
import { noUnnecessaryDateValueOfSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-value-of-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

interface MockASTNode {
  type: string
  [key: string]: unknown
}

function makeDateValueOfCall(overrides: Record<string, unknown> = {}): MockASTNode {
  const spreadArg = overrides.spreadArg ?? {
    argument: { name: 'items', type: 'Identifier' },
    type: 'SpreadElement',
  }

  const node: MockASTNode = {
    arguments: [spreadArg],
    callee: {
      computed: false,
      object: {
        name: overrides.objectName ?? 'date',
        type: 'Identifier',
      },
      property: {
        name: overrides.propertyName ?? 'valueOf',
        type: 'Identifier',
      },
      type: 'MemberExpression',
    },
    loc: {
      end: { column: 30, line: 1 },
      start: { column: 0, line: 1 },
    },
    range: [0, 30],
    type: 'CallExpression',
  }

  if (overrides.arguments !== undefined) {
    node.arguments = overrides.arguments as unknown[]
  }
  if (overrides.callee !== undefined) {
    node.callee = overrides.callee
  }
  if (overrides.type !== undefined) {
    node.type = overrides.type as string
  }

  return node
}

describe('no-unnecessary-date-value-of-spread rule', () => {
  describe('meta', () => {
    test('exports the rule object', () => {
      expect(noUnnecessaryDateValueOfSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryDateValueOfSpreadRule).toBe('object')
    })

    test('has a meta property', () => {
      expect(noUnnecessaryDateValueOfSpreadRule).toHaveProperty('meta')
    })

    test('has a create property that is a function', () => {
      expect(noUnnecessaryDateValueOfSpreadRule).toHaveProperty('create')
      expect(typeof noUnnecessaryDateValueOfSpreadRule.create).toBe('function')
    })

    test('meta.type is suggestion', () => {
      expect(noUnnecessaryDateValueOfSpreadRule.meta.type).toBe('suggestion')
    })

    test('meta.severity is warn', () => {
      expect(noUnnecessaryDateValueOfSpreadRule.meta.severity).toBe('warn')
    })

    test('meta.docs.category is patterns', () => {
      expect(noUnnecessaryDateValueOfSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('meta.docs has a description containing valueOf', () => {
      expect(
        noUnnecessaryDateValueOfSpreadRule.meta.docs?.description.toLowerCase(),
      ).toContain('valueof')
    })

    test('meta.docs has a url defined', () => {
      expect(noUnnecessaryDateValueOfSpreadRule.meta.docs?.url).toBeDefined()
      expect(
        noUnnecessaryDateValueOfSpreadRule.meta.docs?.url.length,
      ).toBeGreaterThan(0)
    })
  })

  describe('helper function', () => {
    test('makeDateValueOfCall produces a CallExpression node', () => {
      const node = makeDateValueOfCall()
      expect(node.type).toBe('CallExpression')
      expect(node.callee).toBeDefined()
      expect(node.arguments).toBeDefined()
    })

    test('makeDateValueOfCall produces correct default callee', () => {
      const node = makeDateValueOfCall()
      const callee = node.callee as MockASTNode
      expect(callee.type).toBe('MemberExpression')
      const obj = callee.object as MockASTNode
      expect(obj.name).toBe('date')
      const prop = callee.property as MockASTNode
      expect(prop.name).toBe('valueOf')
    })
  })

  describe('positive cases - should trigger the rule', () => {
    test('reports date.valueOf(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(makeDateValueOfCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('date.valueOf(...items)')
    })

    test('reports date.valueOf(...arr)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          spreadArg: {
            argument: { name: 'arr', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.valueOf(...args)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          spreadArg: {
            argument: { name: 'args', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.valueOf(...data)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          spreadArg: {
            argument: { name: 'data', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.valueOf(...params)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          spreadArg: {
            argument: { name: 'params', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.valueOf(...options)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          spreadArg: {
            argument: { name: 'options', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.valueOf(...rest)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          spreadArg: {
            argument: { name: 'rest', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.valueOf(...values)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          spreadArg: {
            argument: { name: 'values', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.valueOf(...list)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          spreadArg: {
            argument: { name: 'list', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.valueOf(...collection)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          spreadArg: {
            argument: { name: 'collection', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.valueOf(...elements)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          spreadArg: {
            argument: { name: 'elements', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.valueOf(...result)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          spreadArg: {
            argument: { name: 'result', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.valueOf(...buffer)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          spreadArg: {
            argument: { name: 'buffer', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.valueOf(...chunks)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          spreadArg: {
            argument: { name: 'chunks', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.valueOf(...entries)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          spreadArg: {
            argument: { name: 'entries', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.valueOf(...rows)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          spreadArg: {
            argument: { name: 'rows', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.valueOf(...payload)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          spreadArg: {
            argument: { name: 'payload', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.valueOf(...input)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          spreadArg: {
            argument: { name: 'input', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.valueOf(...output)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          spreadArg: {
            argument: { name: 'output', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.valueOf(...nums)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          spreadArg: {
            argument: { name: 'nums', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.valueOf(...stuff)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          spreadArg: {
            argument: { name: 'stuff', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.valueOf() with SpreadElement containing member expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          spreadArg: {
            argument: {
              object: { name: 'obj', type: 'Identifier' },
              property: { name: 'items', type: 'Identifier' },
              type: 'MemberExpression',
            },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.valueOf() with SpreadElement containing array expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          spreadArg: {
            argument: { elements: [], type: 'ArrayExpression' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.valueOf() with SpreadElement containing call expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          spreadArg: {
            argument: {
              arguments: [],
              callee: { name: 'getItems', type: 'Identifier' },
              type: 'CallExpression',
            },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.valueOf() with SpreadElement at different source locations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      const node = makeDateValueOfCall()
      node.loc = {
        end: { column: 30, line: 42 },
        start: { column: 5, line: 42 },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('reports date.valueOf() with SpreadElement without loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      const node = makeDateValueOfCall()
      delete node.loc

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('reports date.valueOf() with SpreadElement without range', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      const node = makeDateValueOfCall()
      delete node.range

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('report message mentions direct call suggestion', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(makeDateValueOfCall())

      expect(reports[0].message).toContain(
        'Consider calling date.valueOf() directly',
      )
    })
  })

  describe('negative cases - should not trigger the rule', () => {
    test('does not report time.valueOf(...items) - wrong object name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(makeDateValueOfCall({ objectName: 'time' }))

      expect(reports.length).toBe(0)
    })

    test('does not report d.valueOf(...items) - wrong object name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(makeDateValueOfCall({ objectName: 'd' }))

      expect(reports.length).toBe(0)
    })

    test('does not report myDate.valueOf(...items) - wrong object name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(makeDateValueOfCall({ objectName: 'myDate' }))

      expect(reports.length).toBe(0)
    })

    test('does not report date.toLocaleString(...items) - wrong property name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({ propertyName: 'toLocaleString' }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.toString(...items) - wrong property name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({ propertyName: 'toString' }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.getTime(...items) - wrong property name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({ propertyName: 'getTime' }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.toISOString(...items) - wrong property name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({ propertyName: 'toISOString' }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.toDateString(...items) - wrong property name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({ propertyName: 'toDateString' }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.parse(...items) - wrong property name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({ propertyName: 'parse' }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.valueOf() - no arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({ arguments: [] }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.valueOf(arg) - non-spread argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          arguments: [{ name: 'arg', type: 'Identifier' }],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.valueOf("en") - literal argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          arguments: [{ type: 'Literal', value: 'en' }],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.valueOf(...items, extra) - multiple arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          arguments: [
            {
              argument: { name: 'items', type: 'Identifier' },
              type: 'SpreadElement',
            },
            { name: 'extra', type: 'Identifier' },
          ],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.valueOf(extra, ...items) - multiple arguments reversed', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          arguments: [
            { name: 'extra', type: 'Identifier' },
            {
              argument: { name: 'items', type: 'Identifier' },
              type: 'SpreadElement',
            },
          ],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.valueOf() - zero arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({ arguments: [] }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report valueOf(...items) - direct call, no member expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [
          {
            argument: { name: 'items', type: 'Identifier' },
            type: 'SpreadElement',
          },
        ],
        callee: { name: 'valueOf', type: 'Identifier' },
        loc: {
          end: { column: 20, line: 1 },
          start: { column: 0, line: 1 },
        },
        range: [0, 20],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('does not report date["valueOf"](...items) - computed member expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [
          {
            argument: { name: 'items', type: 'Identifier' },
            type: 'SpreadElement',
          },
        ],
        callee: {
          computed: true,
          object: { name: 'date', type: 'Identifier' },
          property: { type: 'Literal', value: 'valueOf' },
          type: 'MemberExpression',
        },
        loc: {
          end: { column: 30, line: 1 },
          start: { column: 0, line: 1 },
        },
        range: [0, 30],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('does not report obj.date.valueOf(...items) - object is not Identifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [
          {
            argument: { name: 'items', type: 'Identifier' },
            type: 'SpreadElement',
          },
        ],
        callee: {
          computed: false,
          object: {
            computed: false,
            object: { name: 'obj', type: 'Identifier' },
            property: { name: 'date', type: 'Identifier' },
            type: 'MemberExpression',
          },
          property: { name: 'valueOf', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: {
          end: { column: 40, line: 1 },
          start: { column: 0, line: 1 },
        },
        range: [0, 40],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('does not report date.valueOf(null) - null argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          arguments: [{ type: 'Literal', value: null }],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.valueOf(42) - numeric argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          arguments: [{ type: 'Literal', value: 42 }],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.valueOf(true) - boolean argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          arguments: [{ type: 'Literal', value: true }],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report a plain object expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression({
        type: 'ObjectExpression',
        properties: [],
      })

      expect(reports.length).toBe(0)
    })

    test('does not report an array expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression({
        elements: [],
        type: 'ArrayExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('does not report date.valueOf() with three spread arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          arguments: [
            {
              argument: { name: 'a', type: 'Identifier' },
              type: 'SpreadElement',
            },
            {
              argument: { name: 'b', type: 'Identifier' },
              type: 'SpreadElement',
            },
            {
              argument: { name: 'c', type: 'Identifier' },
              type: 'SpreadElement',
            },
          ],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.setFullYear(...args) - different method', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({ propertyName: 'setFullYear' }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report Date.valueOf(...items) - uppercase Date', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(makeDateValueOfCall({ objectName: 'Date' }))

      expect(reports.length).toBe(0)
    })

    test('does not report date.now(...items) - different method name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({ propertyName: 'now' }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.toUTCString(...items) - similar but different method', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({ propertyName: 'toUTCString' }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.toTimeString(...items) - similar but different method', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({ propertyName: 'toTimeString' }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.valueOf(...items) with computed property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [
          {
            argument: { name: 'items', type: 'Identifier' },
            type: 'SpreadElement',
          },
        ],
        callee: {
          computed: true,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'valueOf', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: {
          end: { column: 30, line: 1 },
          start: { column: 0, line: 1 },
        },
        range: [0, 30],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('does not report date.valueOf() with non-Identifier property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [
          {
            argument: { name: 'items', type: 'Identifier' },
            type: 'SpreadElement',
          },
        ],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { type: 'Literal', value: 'valueOf' },
          type: 'MemberExpression',
        },
        loc: {
          end: { column: 30, line: 1 },
          start: { column: 0, line: 1 },
        },
        range: [0, 30],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('does not report date.valueOf() with non-Identifier object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [
          {
            argument: { name: 'items', type: 'Identifier' },
            type: 'SpreadElement',
          },
        ],
        callee: {
          computed: false,
          object: { type: 'ThisExpression' },
          property: { name: 'valueOf', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: {
          end: { column: 30, line: 1 },
          start: { column: 0, line: 1 },
        },
        range: [0, 30],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('does not report other.valueOf(...items) - wrong object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(makeDateValueOfCall({ objectName: 'other' }))

      expect(reports.length).toBe(0)
    })

    test('does not report obj.valueOf(...items) - wrong object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(makeDateValueOfCall({ objectName: 'obj' }))

      expect(reports.length).toBe(0)
    })

    test('does not report arr.valueOf(...items) - wrong object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(makeDateValueOfCall({ objectName: 'arr' }))

      expect(reports.length).toBe(0)
    })

    test('does not report str.valueOf(...items) - wrong object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(makeDateValueOfCall({ objectName: 'str' }))

      expect(reports.length).toBe(0)
    })

    test('does not report number.valueOf(...items) - wrong object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({ objectName: 'number' }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report fn.valueOf(...items) - wrong object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(makeDateValueOfCall({ objectName: 'fn' }))

      expect(reports.length).toBe(0)
    })

    test('does not report date.valueOf(undefined) - non-spread argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          arguments: [{ type: 'Identifier', name: 'undefined' }],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.valueOf(...items) with two spread args', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          arguments: [
            {
              argument: { name: 'a', type: 'Identifier' },
              type: 'SpreadElement',
            },
            {
              argument: { name: 'b', type: 'Identifier' },
              type: 'SpreadElement',
            },
          ],
        }),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('handles null node without throwing', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('handles undefined node without throwing', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('handles string node without throwing', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      expect(() => visitor.CallExpression('not a node')).not.toThrow()
    })

    test('handles number node without throwing', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('handles boolean node without throwing', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('handles empty object without reporting', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression({})

      expect(reports.length).toBe(0)
    })

    test('handles node without callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('handles node without arguments property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression({
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'valueOf', type: 'Identifier' },
          type: 'MemberExpression',
        },
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('handles node with empty arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({ arguments: [] }),
      )

      expect(reports.length).toBe(0)
    })

    test('handles Symbol SpreadElement-like argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          arguments: [
            {
              argument: { type: 'Symbol', description: 'items' },
              type: 'SpreadElement',
            },
          ],
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('handles nested call expressions as spread argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          spreadArg: {
            argument: {
              arguments: [
                {
                  argument: { name: 'deep', type: 'Identifier' },
                  type: 'SpreadElement',
                },
              ],
              callee: { name: 'getNested', type: 'Identifier' },
              type: 'CallExpression',
            },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('handles date.valueOf(...items) called multiple times', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(makeDateValueOfCall())
      visitor.CallExpression(makeDateValueOfCall())
      visitor.CallExpression(makeDateValueOfCall())

      expect(reports.length).toBe(3)
    })

    test('handles mixed valid and invalid calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(makeDateValueOfCall())
      visitor.CallExpression(makeDateValueOfCall({ objectName: 'time' }))
      visitor.CallExpression(makeDateValueOfCall({ propertyName: 'toString' }))
      visitor.CallExpression(makeDateValueOfCall({ arguments: [] }))
      visitor.CallExpression(makeDateValueOfCall())

      expect(reports.length).toBe(2)
    })

    test('handles node with null arguments array element', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({ arguments: [null] }),
      )

      expect(reports.length).toBe(0)
    })

    test('handles SpreadElement with null argument property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      visitor.CallExpression(
        makeDateValueOfCall({
          arguments: [
            {
              argument: null,
              type: 'SpreadElement',
            },
          ],
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('create returns a new visitor each time', () => {
      const { context } = createMockRuleContext()
      const v1 = noUnnecessaryDateValueOfSpreadRule.create(context)
      const v2 = noUnnecessaryDateValueOfSpreadRule.create(context)

      expect(v1).not.toBe(v2)
    })

    test('visitor has CallExpression method', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryDateValueOfSpreadRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })
})

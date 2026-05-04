
import { noUnnecessaryDateToStringSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-to-string-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

interface MockASTNode {
  type: string
  [key: string]: unknown
}

function makeDateToStringCall(overrides: Record<string, unknown> = {}): MockASTNode {
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
        name: overrides.propertyName ?? 'toString',
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

describe('no-unnecessary-date-to-string-spread rule', () => {
  describe('meta', () => {
    test('exports the rule object', () => {
      expect(noUnnecessaryDateToStringSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryDateToStringSpreadRule).toBe('object')
    })

    test('has a meta property', () => {
      expect(noUnnecessaryDateToStringSpreadRule).toHaveProperty('meta')
    })

    test('has a create property that is a function', () => {
      expect(noUnnecessaryDateToStringSpreadRule).toHaveProperty('create')
      expect(typeof noUnnecessaryDateToStringSpreadRule.create).toBe('function')
    })

    test('meta.type is suggestion', () => {
      expect(noUnnecessaryDateToStringSpreadRule.meta.type).toBe('suggestion')
    })

    test('meta.severity is warn', () => {
      expect(noUnnecessaryDateToStringSpreadRule.meta.severity).toBe('warn')
    })

    test('meta.docs.category is patterns', () => {
      expect(noUnnecessaryDateToStringSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('meta.docs has a description containing toString', () => {
      expect(
        noUnnecessaryDateToStringSpreadRule.meta.docs?.description.toLowerCase(),
      ).toContain('tostring')
    })

    test('meta.docs has a url defined', () => {
      expect(noUnnecessaryDateToStringSpreadRule.meta.docs?.url).toBeDefined()
      expect(
        noUnnecessaryDateToStringSpreadRule.meta.docs?.url.length,
      ).toBeGreaterThan(0)
    })
  })

  describe('helper function', () => {
    test('makeDateToStringCall produces a CallExpression node', () => {
      const node = makeDateToStringCall()
      expect(node.type).toBe('CallExpression')
      expect(node.callee).toBeDefined()
      expect(node.arguments).toBeDefined()
    })

    test('makeDateToStringCall produces correct default callee', () => {
      const node = makeDateToStringCall()
      const callee = node.callee as MockASTNode
      expect(callee.type).toBe('MemberExpression')
      const obj = callee.object as MockASTNode
      expect(obj.name).toBe('date')
      const prop = callee.property as MockASTNode
      expect(prop.name).toBe('toString')
    })
  })

  describe('positive cases - should trigger the rule', () => {
    test('reports date.toString(...items)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToStringCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('date.toString(...items)')
    })

    test('reports date.toString(...arr)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
          spreadArg: {
            argument: { name: 'arr', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.toString(...args)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
          spreadArg: {
            argument: { name: 'args', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.toString(...data)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
          spreadArg: {
            argument: { name: 'data', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.toString(...params)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
          spreadArg: {
            argument: { name: 'params', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.toString(...options)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
          spreadArg: {
            argument: { name: 'options', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.toString(...rest)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
          spreadArg: {
            argument: { name: 'rest', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.toString(...values)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
          spreadArg: {
            argument: { name: 'values', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.toString(...list)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
          spreadArg: {
            argument: { name: 'list', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.toString(...collection)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
          spreadArg: {
            argument: { name: 'collection', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.toString(...elements)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
          spreadArg: {
            argument: { name: 'elements', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.toString(...result)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
          spreadArg: {
            argument: { name: 'result', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.toString(...buffer)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
          spreadArg: {
            argument: { name: 'buffer', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.toString(...chunks)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
          spreadArg: {
            argument: { name: 'chunks', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.toString(...entries)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
          spreadArg: {
            argument: { name: 'entries', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.toString(...rows)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
          spreadArg: {
            argument: { name: 'rows', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.toString(...payload)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
          spreadArg: {
            argument: { name: 'payload', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.toString(...input)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
          spreadArg: {
            argument: { name: 'input', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.toString(...output)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
          spreadArg: {
            argument: { name: 'output', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.toString(...nums)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
          spreadArg: {
            argument: { name: 'nums', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.toString(...stuff)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
          spreadArg: {
            argument: { name: 'stuff', type: 'Identifier' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.toString() with SpreadElement containing member expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
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

    test('reports date.toString() with SpreadElement containing array expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
          spreadArg: {
            argument: { elements: [], type: 'ArrayExpression' },
            type: 'SpreadElement',
          },
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('reports date.toString() with SpreadElement containing call expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
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

    test('reports date.toString() with SpreadElement at different source locations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      const node = makeDateToStringCall()
      node.loc = {
        end: { column: 30, line: 42 },
        start: { column: 5, line: 42 },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('reports date.toString() with SpreadElement without loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      const node = makeDateToStringCall()
      delete node.loc

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('reports date.toString() with SpreadElement without range', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      const node = makeDateToStringCall()
      delete node.range

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('reports date.toString() with SpreadElement with range but no loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      const node = makeDateToStringCall()
      node.range = [10, 40]
      delete node.loc

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('report message mentions direct call suggestion', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToStringCall())

      expect(reports[0].message).toContain(
        'Consider calling date.toString() directly',
      )
    })
  })

  describe('negative cases - should not trigger the rule', () => {
    test('does not report time.toString(...items) - wrong object name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToStringCall({ objectName: 'time' }))

      expect(reports.length).toBe(0)
    })

    test('does not report d.toString(...items) - wrong object name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToStringCall({ objectName: 'd' }))

      expect(reports.length).toBe(0)
    })

    test('does not report myDate.toString(...items) - wrong object name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToStringCall({ objectName: 'myDate' }))

      expect(reports.length).toBe(0)
    })

    test('does not report date.toLocaleString(...items) - wrong property name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({ propertyName: 'toLocaleString' }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.valueOf(...items) - wrong property name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({ propertyName: 'valueOf' }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.getTime(...items) - wrong property name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({ propertyName: 'getTime' }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.toISOString(...items) - wrong property name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({ propertyName: 'toISOString' }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.toDateString(...items) - wrong property name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({ propertyName: 'toDateString' }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.parse(...items) - wrong property name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({ propertyName: 'parse' }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.toString() - no arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({ arguments: [] }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.toString(arg) - non-spread argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
          arguments: [{ name: 'arg', type: 'Identifier' }],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.toString("en") - literal argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
          arguments: [{ type: 'Literal', value: 'en' }],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.toString(...items, extra) - multiple arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
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

    test('does not report date.toString(extra, ...items) - multiple arguments reversed', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
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

    test('does not report date.toString() - zero arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({ arguments: [] }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report toString(...items) - direct call, no member expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [
          {
            argument: { name: 'items', type: 'Identifier' },
            type: 'SpreadElement',
          },
        ],
        callee: { name: 'toString', type: 'Identifier' },
        loc: {
          end: { column: 20, line: 1 },
          start: { column: 0, line: 1 },
        },
        range: [0, 20],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('does not report date["toString"](...items) - computed member expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

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
          property: { type: 'Literal', value: 'toString' },
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

    test('does not report obj.date.toString(...items) - object is not Identifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

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
          property: { name: 'toString', type: 'Identifier' },
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

    test('does not report date.toString(null) - null argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
          arguments: [{ type: 'Literal', value: null }],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.toString(42) - numeric argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
          arguments: [{ type: 'Literal', value: 42 }],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.toString(true) - boolean argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
          arguments: [{ type: 'Literal', value: true }],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report a plain object expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression({
        type: 'ObjectExpression',
        properties: [],
      })

      expect(reports.length).toBe(0)
    })

    test('does not report an array expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression({
        elements: [],
        type: 'ArrayExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('does not report date.toString() with three spread arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
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
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({ propertyName: 'setFullYear' }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report Date.toString(...items) - uppercase Date', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToStringCall({ objectName: 'Date' }))

      expect(reports.length).toBe(0)
    })

    test('does not report date.now(...items) - different method name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({ propertyName: 'now' }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.toUTCString(...items) - similar but different method', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({ propertyName: 'toUTCString' }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.toTimeString(...items) - similar but different method', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({ propertyName: 'toTimeString' }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.toString(...items) with computed property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

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
          property: { name: 'toString', type: 'Identifier' },
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

    test('does not report date.toString() with non-Identifier property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

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
          property: { type: 'Literal', value: 'toString' },
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

    test('does not report date.toString() with non-Identifier object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

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
          property: { name: 'toString', type: 'Identifier' },
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

    test('does not report other.toString(...items) - wrong object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToStringCall({ objectName: 'other' }))

      expect(reports.length).toBe(0)
    })

    test('does not report obj.toString(...items) - wrong object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToStringCall({ objectName: 'obj' }))

      expect(reports.length).toBe(0)
    })

    test('does not report arr.toString(...items) - wrong object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToStringCall({ objectName: 'arr' }))

      expect(reports.length).toBe(0)
    })

    test('does not report str.toString(...items) - wrong object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToStringCall({ objectName: 'str' }))

      expect(reports.length).toBe(0)
    })

    test('does not report number.toString(...items) - wrong object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({ objectName: 'number' }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report fn.toString(...items) - wrong object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToStringCall({ objectName: 'fn' }))

      expect(reports.length).toBe(0)
    })

    test('does not report date.toString(undefined) - non-spread argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
          arguments: [{ type: 'Identifier', name: 'undefined' }],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('does not report date.toString(...items) with two spread args', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
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
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('handles undefined node without throwing', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('handles string node without throwing', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      expect(() => visitor.CallExpression('not a node')).not.toThrow()
    })

    test('handles number node without throwing', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('handles boolean node without throwing', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('handles empty object without reporting', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression({})

      expect(reports.length).toBe(0)
    })

    test('handles node without callee', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('handles node without arguments property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression({
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'toString', type: 'Identifier' },
          type: 'MemberExpression',
        },
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('handles node with empty arguments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({ arguments: [] }),
      )

      expect(reports.length).toBe(0)
    })

    test('handles Symbol SpreadElement-like argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
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
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
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

    test('handles date.toString(...items) called multiple times', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToStringCall())
      visitor.CallExpression(makeDateToStringCall())
      visitor.CallExpression(makeDateToStringCall())

      expect(reports.length).toBe(3)
    })

    test('handles mixed valid and invalid calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToStringCall())
      visitor.CallExpression(makeDateToStringCall({ objectName: 'time' }))
      visitor.CallExpression(makeDateToStringCall({ propertyName: 'valueOf' }))
      visitor.CallExpression(makeDateToStringCall({ arguments: [] }))
      visitor.CallExpression(makeDateToStringCall())

      expect(reports.length).toBe(2)
    })

    test('handles node with null arguments array element', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({ arguments: [null] }),
      )

      expect(reports.length).toBe(0)
    })

    test('handles SpreadElement with null argument property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToStringCall({
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
      const v1 = noUnnecessaryDateToStringSpreadRule.create(context)
      const v2 = noUnnecessaryDateToStringSpreadRule.create(context)

      expect(v1).not.toBe(v2)
    })

    test('visitor has CallExpression method', () => {
      const { context } = createMockRuleContext()
      const visitor = noUnnecessaryDateToStringSpreadRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })
})

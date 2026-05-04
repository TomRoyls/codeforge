
import { noUnnecessaryDateGetMillisecondsSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-get-milliseconds-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function makeDateGetMillisecondsCall(args: unknown[], line = 1, column = 0): unknown {
  const objectEnd = column + 'date'.length
  const callEnd = objectEnd + '.getMilliseconds'.length + 2 + args.length * 3

  return {
    arguments: args,
    callee: {
      computed: false,
      object: {
        name: 'date',
        range: [column, objectEnd],
        type: 'Identifier',
      },
      property: {
        name: 'getMilliseconds',
        type: 'Identifier',
      },
      range: [column, objectEnd + '.getMilliseconds'.length],
      type: 'MemberExpression',
    },
    loc: {
      end: { column: callEnd, line },
      start: { column, line },
    },
    range: [column, callEnd],
    type: 'CallExpression',
  }
}

function createSpreadElement(argumentName = 'items'): unknown {
  return {
    argument: {
      name: argumentName,
      type: 'Identifier',
    },
    type: 'SpreadElement',
  }
}

function createIdentifier(name: string): unknown {
  return {
    name,
    type: 'Identifier',
  }
}

function createLiteral(value: unknown): unknown {
  return {
    raw: String(value),
    type: 'Literal',
    value,
  }
}

describe('no-unnecessary-date-get-milliseconds-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryDateGetMillisecondsSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryDateGetMillisecondsSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryDateGetMillisecondsSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryDateGetMillisecondsSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryDateGetMillisecondsSpreadRule.meta.schema).toEqual([])
    })

    test('should have meta property', () => {
      expect(noUnnecessaryDateGetMillisecondsSpreadRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(noUnnecessaryDateGetMillisecondsSpreadRule).toHaveProperty('create')
    })

    test('should have docs with url', () => {
      expect(noUnnecessaryDateGetMillisecondsSpreadRule.meta.docs?.url).toBeDefined()
      expect(typeof noUnnecessaryDateGetMillisecondsSpreadRule.meta.docs?.url).toBe('string')
    })
  })

  describe('structure', () => {
    test('should return visitor with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'date.getMilliseconds()' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'date.getMilliseconds()' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detecting date.getMilliseconds with spread element', () => {
    test('should report date.getMilliseconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('items')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('date.getMilliseconds')
      expect(reports[0].message).toContain('spread')
    })

    test('should report date.getMilliseconds(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...args)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('args')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMilliseconds(...params)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...params)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('params')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMilliseconds(...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...rest)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('rest')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMilliseconds(...options)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...options)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('options')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMilliseconds(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...data)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('data')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMilliseconds(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...values)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('values')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMilliseconds(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...arr)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('arr')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMilliseconds(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...list)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('list')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMilliseconds(...extras)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...extras)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('extras')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMilliseconds(...input)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...input)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('input')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMilliseconds(...parts)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...parts)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('parts')]))

      expect(reports.length).toBe(1)
    })

    test('should report with spread of array literal member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const spreadWithMemberArg = {
        argument: {
          object: { name: 'config', type: 'Identifier' },
          property: { name: 'items', type: 'Identifier' },
          type: 'MemberExpression',
        },
        type: 'SpreadElement',
      }
      visitor.CallExpression(makeDateGetMillisecondsCall([spreadWithMemberArg]))

      expect(reports.length).toBe(1)
    })

    test('should report with spread of call expression result', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const spreadWithCallArg = {
        argument: {
          arguments: [],
          callee: { name: 'getArgs', type: 'Identifier' },
          type: 'CallExpression',
        },
        type: 'SpreadElement',
      }
      visitor.CallExpression(makeDateGetMillisecondsCall([spreadWithCallArg]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMilliseconds(...items) with correct message content', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('items')]))

      expect(reports[0].message).toBe(
        'date.getMilliseconds(...items) with a single spread is unusual. Consider calling date.getMilliseconds() directly.',
      )
    })

    test('should report date.getMilliseconds(...items) and include location', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('items')], 5, 10))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start?.line).toBe(5)
      expect(reports[0].loc?.start?.column).toBe(10)
    })

    test('should report at default location', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('items')]))

      expect(reports[0].loc?.start?.line).toBe(1)
      expect(reports[0].loc?.start?.column).toBe(0)
    })

    test('should report at different line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('x')], 42, 0))

      expect(reports[0].loc?.start?.line).toBe(42)
    })

    test('should report at different column offsets', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('x')], 1, 20))

      expect(reports[0].loc?.start?.column).toBe(20)
    })

    test('should report date.getMilliseconds(...items) message mentions unusual', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('items')]))

      expect(reports[0].message).toMatch(/unusual/i)
    })

    test('should report message mentions directly', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('items')]))

      expect(reports[0].message).toContain('directly')
    })

    test('should report message mentions getMilliseconds', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('items')]))

      expect(reports[0].message).toContain('getMilliseconds')
    })

    test('should report message mentions spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('items')]))

      expect(reports[0].message).toContain('spread')
    })

    test('should report and produce non-empty message', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('items')]))

      expect(reports[0].message.length).toBeGreaterThan(10)
    })

    test('should report date.getMilliseconds(...empty)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...empty)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('empty')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMilliseconds(...payload)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...payload)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('payload')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMilliseconds(...stuff)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...stuff)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('stuff')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMilliseconds(...collection)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...collection)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('collection')]))

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting valid calls', () => {
    test('should not report date.getMilliseconds() with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds()' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMilliseconds(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(0)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createLiteral(0)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMilliseconds(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(x)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createIdentifier('x')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMilliseconds(1, 2)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(1, 2)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createLiteral(1), createLiteral(2)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMilliseconds(...items, extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...items, extra)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('items'), createIdentifier('extra')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMilliseconds(extra, ...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(extra, ...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createIdentifier('extra'), createSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report time.getMilliseconds(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'time.getMilliseconds(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'time', type: 'Identifier' },
          property: { name: 'getMilliseconds', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report d.getMilliseconds(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'd.getMilliseconds(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'd', type: 'Identifier' },
          property: { name: 'getMilliseconds', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report now.getMilliseconds(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'now.getMilliseconds(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'now', type: 'Identifier' },
          property: { name: 'getMilliseconds', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report moment.getMilliseconds(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'moment.getMilliseconds(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'moment', type: 'Identifier' },
          property: { name: 'getMilliseconds', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getSeconds(...items) with different method', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getSeconds(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getSeconds', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMinutes(...items) with different method', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getMinutes', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getHours(...items) with different method', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getHours', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTime(...items) with different method', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTime(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getTime', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDate(...items) with different method', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getDate', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDay(...items) with different method', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getDay', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth(...items) with different method', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getMonth', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getFullYear(...items) with different method', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getFullYear', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.setMilliseconds(...items) with different method', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.setMilliseconds(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'setMilliseconds', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.toString(...items) with different method', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toString(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'toString', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.toISOString(...items) with different method', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toISOString(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'toISOString', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.valueOf(...items) with different method', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.valueOf(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'valueOf', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.toJSON(...items) with different method', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'toJSON', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleString(...items) with different method', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleString(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'toLocaleString', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date["getMilliseconds"](...items) with computed access', () => {
      const { context, reports } = createMockRuleContext({ source: 'date["getMilliseconds"](...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: true,
          object: { name: 'date', type: 'Identifier' },
          property: { type: 'Literal', value: 'getMilliseconds' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report plain function call getMilliseconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'getMilliseconds(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: { name: 'getMilliseconds', type: 'Identifier' },
        loc: { end: { column: 30, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 30],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMilliseconds() with empty args', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds()' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMilliseconds(null)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(null)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createLiteral(null)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMilliseconds(42)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(42)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createLiteral(42)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMilliseconds("hello")', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds("hello")' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createLiteral('hello')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMilliseconds(true)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(true)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createLiteral(true)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMilliseconds({})', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds({})' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([{ type: 'ObjectExpression', properties: [] }]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMilliseconds([])', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds([])' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([{ type: 'ArrayExpression', elements: [] }]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMilliseconds(() => {})', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(() => {})' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([{ type: 'ArrowFunctionExpression', body: { type: 'BlockStatement' }, params: [] }]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMilliseconds(...items, ...more)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...items, ...more)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('items'), createSpreadElement('more')]))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.date.getMilliseconds(...items) with nested object', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.date.getMilliseconds(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: {
            object: { name: 'obj', type: 'Identifier' },
            property: { name: 'date', type: 'Identifier' },
            type: 'MemberExpression',
          },
          property: { name: 'getMilliseconds', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 50, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 50],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new date.getMilliseconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'new date.getMilliseconds(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getMilliseconds', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 50, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 50],
        type: 'NewExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Date.getMilliseconds(...items) with capitalized object', () => {
      const { context, reports } = createMockRuleContext({ source: 'Date.getMilliseconds(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'Date', type: 'Identifier' },
          property: { name: 'getMilliseconds', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report THIS.getMilliseconds(...items) with this expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'this.getMilliseconds(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { type: 'ThisExpression' },
          property: { name: 'getMilliseconds', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTimezoneOffset(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...items)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getTimezoneOffset', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getMilliseconds()' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getMilliseconds()' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      expect(() => visitor.CallExpression()).not.toThrow()
    })

    test('should handle string node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getMilliseconds()' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
    })

    test('should handle number node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getMilliseconds()' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle boolean node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getMilliseconds()' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle empty object node without reporting', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds()' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds()' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        loc: { end: { column: 30, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds()' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getMilliseconds', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 30, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds()' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getMilliseconds', type: 'Identifier' },
          type: 'MemberExpression',
        },
        range: [0, 30],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without object on callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds()' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          property: { name: 'getMilliseconds', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 30, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without property on callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds()' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          object: { name: 'date', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 30, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-identifier object on callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds()' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { type: 'CallExpression' },
          property: { name: 'getMilliseconds', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 30, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-identifier property on callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds()' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { type: 'Literal', value: 'getMilliseconds' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 30, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle multiple calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds()' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('items')]))
      visitor.CallExpression(makeDateGetMillisecondsCall([]))
      visitor.CallExpression(makeDateGetMillisecondsCall([createSpreadElement('more')]))

      expect(reports.length).toBe(2)
    })

    test('should handle node with non-SpreadElement single arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(0)' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMillisecondsCall([createLiteral(0)]))

      expect(reports.length).toBe(0)
    })

    test('should handle node where arguments is null', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds()' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: null,
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getMilliseconds', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 30, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node where callee is null', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds()' })
      const visitor = noUnnecessaryDateGetMillisecondsSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: null,
        loc: { end: { column: 30, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })
})

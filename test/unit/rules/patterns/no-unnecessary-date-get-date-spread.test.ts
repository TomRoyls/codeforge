

import { noUnnecessaryDateGetDateSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-get-date-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function makeDateGetDateCall(spreadArgName = 'items', line = 1, column = 0): unknown {
  const objectEnd = column + 'date'.length
  const callEnd = objectEnd + '.getDate'.length + `(...${spreadArgName})`.length

  return {
    arguments: [
      {
        argument: {
          name: spreadArgName,
          type: 'Identifier',
        },
        type: 'SpreadElement',
      },
    ],
    callee: {
      computed: false,
      object: {
        name: 'date',
        range: [column, objectEnd],
        type: 'Identifier',
      },
      property: {
        name: 'getDate',
        type: 'Identifier',
      },
      range: [column, objectEnd + '.getDate'.length],
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

function makeMemberCall(objectName: string, propertyName: string, args: unknown[]): unknown {
  return {
    arguments: args,
    callee: {
      computed: false,
      object: {
        name: objectName,
        type: 'Identifier',
      },
      property: {
        name: propertyName,
        type: 'Identifier',
      },
      type: 'MemberExpression',
    },
    loc: {
      end: { column: 20, line: 1 },
      start: { column: 0, line: 1 },
    },
    range: [0, 20],
    type: 'CallExpression',
  }
}

function makeSpreadArg(argName: string): unknown {
  return {
    argument: {
      name: argName,
      type: 'Identifier',
    },
    type: 'SpreadElement',
  }
}

function makeIdentifier(name: string): unknown {
  return { name, type: 'Identifier' }
}

function makeLiteral(value: unknown): unknown {
  return { type: 'Literal', value }
}

describe('no-unnecessary-date-get-date-spread rule', () => {
  // 8 meta tests
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryDateGetDateSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryDateGetDateSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryDateGetDateSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryDateGetDateSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryDateGetDateSpreadRule.meta.schema).toEqual([])
    })

    test('should mention getDate in description', () => {
      expect(noUnnecessaryDateGetDateSpreadRule.meta.docs?.description).toContain('getDate')
    })

    test('should mention spread in description', () => {
      expect(noUnnecessaryDateGetDateSpreadRule.meta.docs?.description.toLowerCase()).toContain('spread')
    })

    test('should have docs url', () => {
      expect(noUnnecessaryDateGetDateSpreadRule.meta.docs?.url).toBeDefined()
    })
  })

  // 2 structure tests
  describe('create', () => {
    test('should return visitor with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return new visitor on each create call', () => {
      const { context } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor1 = noUnnecessaryDateGetDateSpreadRule.create(context)
      const visitor2 = noUnnecessaryDateGetDateSpreadRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })
  })

  // 28 positive tests — date.getDate(...spread) should be reported
  describe('detecting date.getDate with single spread argument', () => {
    test('should report date.getDate(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('items'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('date.getDate(...items)')
      expect(reports[0].message).toContain('unusual')
      expect(reports[0].message).toContain('Consider calling date.getDate() directly')
    })

    test('should report date.getDate(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...args);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('args'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDate(...params)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...params);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('params'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDate(...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...rest);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('rest'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDate(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...values);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('values'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDate(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...data);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('data'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDate(...options)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...options);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('options'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDate(...extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...extra);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('extra'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDate(...parts)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...parts);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('parts'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDate(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...list);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('list'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDate(...payload)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...payload);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('payload'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDate(...input)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...input);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('input'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDate(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...arr);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('arr'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDate(...spread)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...spread);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('spread'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDate(...xs)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...xs);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('xs'))

      expect(reports.length).toBe(1)
    })

    test('should report with correct message content', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('items'))

      expect(reports[0].message).toBe(
        'date.getDate(...items) with a single spread is unusual. Consider calling date.getDate() directly.',
      )
    })

    test('should report on different line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('items', 5, 10))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report on line 1 by default', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('items'))

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should report date.getDate(...collection)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...collection);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('collection'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDate(...theArgs)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...theArgs);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('theArgs'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDate(...moreArgs)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...moreArgs);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('moreArgs'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDate(...restArgs)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...restArgs);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('restArgs'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDate(...stuff)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...stuff);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('stuff'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDate(...things)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...things);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('things'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDate(...remaining)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...remaining);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('remaining'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDate(...elements)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...elements);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('elements'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDate(...entries)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...entries);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('entries'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getDate(...all)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...all);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('all'))

      expect(reports.length).toBe(1)
    })
  })

  // 40 negative tests — should NOT report
  describe('not reporting non-matching calls', () => {
    test('should not report date.getDate() with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate();' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'getDate', []))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDate(1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(1);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'getDate', [makeLiteral(1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDate(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(x);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'getDate', [makeIdentifier('x')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDate(x, y)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(x, y);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'getDate', [makeIdentifier('x'), makeIdentifier('y')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'getMonth', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getFullYear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'getFullYear', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTime(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTime(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'getTime', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.setDate(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.setDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'setDate', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report d.getDate(...items) with non-date object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'd.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('d', 'getDate', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report myDate.getDate(...items) with non-date object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'myDate.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('myDate', 'getDate', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.getDate(...items) with non-date object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('obj', 'getDate', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report today.getDate(...items) with non-date object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'today.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('today', 'getDate', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report dt.getDate(...items) with non-date object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'dt.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('dt', 'getDate', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDay(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'getDay', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'getHours', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'getMinutes', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getSeconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getSeconds(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'getSeconds', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMilliseconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'getMilliseconds', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toString(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'toString', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toISOString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toISOString(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'toISOString', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toJSON(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'toJSON', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.valueOf(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.valueOf(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'valueOf', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleDateString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'toLocaleDateString', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report getDate(...items) without member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadArg('items')],
        callee: {
          name: 'getDate',
          type: 'Identifier',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 20],
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDate(...items, ...more) with two spread args', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...items, ...more);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'getDate', [makeSpreadArg('items'), makeSpreadArg('more')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDate(...items, x) with spread and regular arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...items, x);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'getDate', [makeSpreadArg('items'), makeIdentifier('x')]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.getDate(...items) with wrong object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('arr', 'getDate', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.foo(...items) with wrong method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.foo(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'foo', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDate(null)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(null);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'getDate', [makeLiteral(null)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDate(undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(undefined);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'getDate', [makeLiteral(undefined)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDate("items") with string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate("items");' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'getDate', [makeLiteral('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.setDate(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.setDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'setDate', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.setMonth(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.setMonth(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'setMonth', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.setFullYear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.setFullYear(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('date', 'setFullYear', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report result.getDate(...items) with non-date object', () => {
      const { context, reports } = createMockRuleContext({ source: 'result.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('result', 'getDate', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report data.getDate(...items) with non-date object', () => {
      const { context, reports } = createMockRuleContext({ source: 'data.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('data', 'getDate', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report timestamp.getDate(...items) with non-date object', () => {
      const { context, reports } = createMockRuleContext({ source: 'timestamp.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('timestamp', 'getDate', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report current.getDate(...items) with non-date object', () => {
      const { context, reports } = createMockRuleContext({ source: 'current.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('current', 'getDate', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report value.getDate(...items) with non-date object', () => {
      const { context, reports } = createMockRuleContext({ source: 'value.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('value', 'getDate', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report item.getDate(...items) with non-date object', () => {
      const { context, reports } = createMockRuleContext({ source: 'item.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeMemberCall('item', 'getDate', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })
  })

  // 17 edge case tests
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      expect(() => visitor.CallExpression()).not.toThrow()
    })

    test('should handle string node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [makeSpreadArg('items')],
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression({
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getDate', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should handle computed member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'date["getDate"](...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [makeSpreadArg('items')],
        callee: {
          computed: true,
          object: { name: 'date', type: 'Identifier' },
          property: { type: 'Literal', value: 'getDate' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should handle non-identifier object in callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [makeSpreadArg('items')],
        callee: {
          computed: false,
          object: { type: 'ThisExpression' },
          property: { name: 'getDate', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should handle non-identifier property in callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date[fn](...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [makeSpreadArg('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { type: 'Literal', value: 'getDate' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [makeSpreadArg('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getDate', type: 'Identifier' },
          type: 'MemberExpression',
        },
        range: [0, 20],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(1)
    })

    test('should handle node without range', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [makeSpreadArg('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getDate', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      })

      expect(reports.length).toBe(1)
    })

    test('should handle boolean node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle multiple calls in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('items'))
      visitor.CallExpression(makeDateGetDateCall('args'))
      visitor.CallExpression(makeDateGetDateCall('rest'))

      expect(reports.length).toBe(3)
    })

    test('should handle mixed positive and negative calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression(makeDateGetDateCall('items'))
      visitor.CallExpression(makeMemberCall('date', 'getDate', []))
      visitor.CallExpression(makeMemberCall('date', 'getMonth', [makeSpreadArg('items')]))
      visitor.CallExpression(makeDateGetDateCall('rest'))

      expect(reports.length).toBe(2)
    })

    test('should handle node with callee but without property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [makeSpreadArg('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with callee but without object', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateGetDateSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [makeSpreadArg('items')],
        callee: {
          computed: false,
          property: { name: 'getDate', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })
  })
})

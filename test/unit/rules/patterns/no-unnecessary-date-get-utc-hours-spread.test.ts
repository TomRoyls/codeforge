

import { noUnnecessaryDateGetUTCHoursSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-get-utc-hours-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function makeDateGetUTCHoursCall(spreadArgName = 'items', line = 1, column = 0): unknown {
  const objectEnd = column + 'date'.length
  const propertyEnd = objectEnd + '.getUTCHours'.length
  const callEnd = propertyEnd + 5 + spreadArgName.length + 3

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
        name: 'getUTCHours',
        type: 'Identifier',
      },
      range: [column, propertyEnd],
      type: 'MemberExpression',
    },
    loc: {
      end: { callEnd, line },
      start: { column, line },
    },
    range: [column, callEnd],
    type: 'CallExpression',
  }
}

function makeCallWithArgs(objectName: string, propertyName: string, args: unknown[]): unknown {
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
      end: { column: 30, line: 1 },
      start: { column: 0, line: 1 },
    },
    range: [0, 30],
    type: 'CallExpression',
  }
}

function makeSpreadElement(argName: string): unknown {
  return {
    argument: {
      name: argName,
      type: 'Identifier',
    },
    type: 'SpreadElement',
  }
}

function makeIdentifier(name: string): unknown {
  return {
    name,
    type: 'Identifier',
  }
}

function makeLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

describe('no-unnecessary-date-get-utc-hours-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryDateGetUTCHoursSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryDateGetUTCHoursSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryDateGetUTCHoursSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryDateGetUTCHoursSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryDateGetUTCHoursSpreadRule.meta.schema).toEqual([])
    })

    test('should have meta property', () => {
      expect(noUnnecessaryDateGetUTCHoursSpreadRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(noUnnecessaryDateGetUTCHoursSpreadRule).toHaveProperty('create')
    })

    test('should have docs with url', () => {
      expect(noUnnecessaryDateGetUTCHoursSpreadRule.meta.docs?.url).toBeDefined()
    })
  })

  describe('create', () => {
    test('should return visitor with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detecting date.getUTCHours(...items) with single spread', () => {
    test('should report date.getUTCHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('items'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toMatch(/date\.getUTCHours/)
    })

    test('should report date.getUTCHours(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...args);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('args'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCHours(...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...rest);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('rest'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCHours(...params)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...params);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('params'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCHours(...spread)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...spread);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('spread'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCHours(...vals)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...vals);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('vals'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCHours(...opts)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...opts);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('opts'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCHours(...extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...extra);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('extra'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCHours(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...data);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('data'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCHours(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...list);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('list'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCHours(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...arr);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('arr'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCHours(...parts)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...parts);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('parts'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCHours(...fields)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...fields);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('fields'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCHours(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...values);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('values'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCHours(...more)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...more);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('more'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCHours(...theArgs)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...theArgs);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('theArgs'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCHours(...remaining)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...remaining);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('remaining'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCHours(...input)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...input);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('input'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCHours(...x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...x);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('x'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCHours(...restArgs)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...restArgs);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('restArgs'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCHours(...collect)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...collect);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('collect'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCHours(...others)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...others);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('others'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCHours(...restParams)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...restParams);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('restParams'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCHours(...gather)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...gather);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('gather'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCHours(...payload)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...payload);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('payload'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCHours(...overflow)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...overflow);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('overflow'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCHours(...theRest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...theRest);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('theRest'))

      expect(reports.length).toBe(1)
    })

    test('should include correct message text', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('items'))

      expect(reports[0].message).toBe(
        'date.getUTCHours(...items) with a single spread is unusual. Consider calling date.getUTCHours() directly.',
      )
    })
  })

  describe('not reporting non-matching calls', () => {
    test('should not report date.getUTCHours() with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours();' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCHours', []))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCHours(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(0);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCHours', [makeLiteral(0)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCHours(1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(1);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCHours', [makeLiteral(1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCHours(n)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(n);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCHours', [makeIdentifier('n')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCHours(x, y)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(x, y);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCHours', [makeIdentifier('x'), makeIdentifier('y')]))

      expect(reports.length).toBe(0)
    })

    test('should not report time.getUTCHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'time.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('time', 'getUTCHours', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report d.getUTCHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'd.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('d', 'getUTCHours', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report now.getUTCHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'now.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('now', 'getUTCHours', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report dt.getUTCHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'dt.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('dt', 'getUTCHours', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCMinutes', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCSeconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCSeconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCSeconds', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMilliseconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCMilliseconds', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTime(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTime(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getTime', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCFullYear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCFullYear', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMonth(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCMonth', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCDate(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCDate', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCDay(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCDay', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.setUTCHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.setUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'setUTCHours', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toString(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toISOString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toISOString(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toISOString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCHours(...items, extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...items, extra);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getUTCHours', [makeSpreadElement('items'), makeIdentifier('extra')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCHours(extra, ...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(extra, ...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getUTCHours', [makeIdentifier('extra'), makeSpreadElement('items')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('arr', 'slice', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.method(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.method(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('obj', 'method', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report myDate.getUTCHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'myDate.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('myDate', 'getUTCHours', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report current.getUTCHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'current.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('current', 'getUTCHours', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report today.getUTCHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'today.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('today', 'getUTCHours', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCHours(undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(undefined);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCHours', [makeLiteral(undefined)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCHours(null)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(null);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCHours', [makeLiteral(null)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCHours(...items, ...more)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...items, ...more);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getUTCHours', [makeSpreadElement('items'), makeSpreadElement('more')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCHours("string")', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours("string");' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCHours', [makeLiteral('string')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.valueOf(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.valueOf(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'valueOf', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleTimeString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleTimeString(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toLocaleTimeString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toUTCString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toUTCString(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toUTCString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCHours(() => {})', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(() => {});' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getUTCHours', [
          { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCHours({})', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours({});' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getUTCHours', [{ type: 'ObjectExpression', properties: [] }]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report getUTCHours(...items) direct call', () => {
      const { context, reports } = createMockRuleContext({ source: 'getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [makeSpreadElement('items')],
        callee: {
          name: 'getUTCHours',
          type: 'Identifier',
        },
        loc: {
          end: { column: 20, line: 1 },
          start: { column: 0, line: 1 },
        },
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTimezoneOffset(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getTimezoneOffset', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCHours([])', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours([]);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getUTCHours', [{ type: 'ArrayExpression', elements: [] }]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report timestamp.getUTCHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'timestamp.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('timestamp', 'getUTCHours', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      expect(() => visitor.CallExpression()).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      const node = {
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getUTCHours', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with computed callee property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        callee: {
          computed: true,
          object: { name: 'date', type: 'Identifier' },
          property: { type: 'Literal', value: 'getUTCHours' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier callee object', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        callee: {
          computed: false,
          object: { type: 'MemberExpression', object: { name: 'foo', type: 'Identifier' }, property: { name: 'bar', type: 'Identifier' } },
          property: { name: 'getUTCHours', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { type: 'Literal', value: 'getUTCHours' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle number node', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('items', 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle multiple calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCHoursCall('items'))
      visitor.CallExpression(makeDateGetUTCHoursCall('args'))
      visitor.CallExpression(makeCallWithArgs('time', 'getUTCHours', [makeSpreadElement('items')]))

      expect(reports.length).toBe(2)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getUTCHours', type: 'Identifier' },
          type: 'MemberExpression',
        },
        range: [0, 20],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle node without callee property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty arguments array', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours();' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      const node = {
        arguments: [],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getUTCHours', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report for date.getUTCHours with two spread args', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...a, ...b);' })
      const visitor = noUnnecessaryDateGetUTCHoursSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getUTCHours', [makeSpreadElement('a'), makeSpreadElement('b')]),
      )

      expect(reports.length).toBe(0)
    })
  })
})



import { noUnnecessaryDateGetUTCMinutesSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-get-utc-minutes-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function makeDateGetUTCMinutesCall(spreadArgName = 'items', line = 1, column = 0): unknown {
  const objectEnd = column + 'date'.length
  const propertyEnd = objectEnd + '.getUTCMinutes'.length
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
        name: 'getUTCMinutes',
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

describe('no-unnecessary-date-get-utc-minutes-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryDateGetUTCMinutesSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryDateGetUTCMinutesSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryDateGetUTCMinutesSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryDateGetUTCMinutesSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryDateGetUTCMinutesSpreadRule.meta.schema).toEqual([])
    })

    test('should have meta property', () => {
      expect(noUnnecessaryDateGetUTCMinutesSpreadRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(noUnnecessaryDateGetUTCMinutesSpreadRule).toHaveProperty('create')
    })

    test('should have docs with url', () => {
      expect(noUnnecessaryDateGetUTCMinutesSpreadRule.meta.docs?.url).toBeDefined()
    })
  })

  describe('create', () => {
    test('should return visitor with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detecting date.getUTCMinutes(...items) with single spread', () => {
    test('should report date.getUTCMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('items'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toMatch(/date\.getUTCMinutes/)
    })

    test('should report date.getUTCMinutes(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...args);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('args'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMinutes(...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...rest);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('rest'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMinutes(...params)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...params);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('params'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMinutes(...spread)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...spread);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('spread'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMinutes(...vals)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...vals);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('vals'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMinutes(...opts)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...opts);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('opts'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMinutes(...extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...extra);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('extra'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMinutes(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...data);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('data'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMinutes(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...list);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('list'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMinutes(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...arr);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('arr'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMinutes(...parts)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...parts);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('parts'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMinutes(...fields)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...fields);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('fields'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMinutes(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...values);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('values'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMinutes(...more)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...more);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('more'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMinutes(...theArgs)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...theArgs);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('theArgs'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMinutes(...remaining)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...remaining);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('remaining'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMinutes(...input)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...input);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('input'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMinutes(...x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...x);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('x'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMinutes(...restArgs)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...restArgs);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('restArgs'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMinutes(...collect)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...collect);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('collect'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMinutes(...others)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...others);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('others'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMinutes(...restParams)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...restParams);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('restParams'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMinutes(...gather)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...gather);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('gather'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMinutes(...payload)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...payload);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('payload'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMinutes(...overflow)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...overflow);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('overflow'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMinutes(...theRest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...theRest);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('theRest'))

      expect(reports.length).toBe(1)
    })

    test('should include correct message text', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('items'))

      expect(reports[0].message).toBe(
        'date.getUTCMinutes(...items) with a single spread is unusual. Consider calling date.getUTCMinutes() directly.',
      )
    })
  })

  describe('not reporting non-matching calls', () => {
    test('should not report date.getUTCMinutes() with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes();' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCMinutes', []))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMinutes(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(0);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCMinutes', [makeLiteral(0)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMinutes(1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(1);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCMinutes', [makeLiteral(1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMinutes(n)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(n);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCMinutes', [makeIdentifier('n')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMinutes(x, y)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(x, y);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCMinutes', [makeIdentifier('x'), makeIdentifier('y')]))

      expect(reports.length).toBe(0)
    })

    test('should not report time.getUTCMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'time.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('time', 'getUTCMinutes', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report d.getUTCMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'd.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('d', 'getUTCMinutes', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report now.getUTCMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'now.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('now', 'getUTCMinutes', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report dt.getUTCMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'dt.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('dt', 'getUTCMinutes', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCHours', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCSeconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCSeconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCSeconds', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMilliseconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCMilliseconds', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTime(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTime(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getTime', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCFullYear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCFullYear', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMonth(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCMonth', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCDate(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCDate', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCDay(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCDay', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.setUTCMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.setUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'setUTCMinutes', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toString(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toISOString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toISOString(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toISOString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMinutes(...items, extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...items, extra);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getUTCMinutes', [makeSpreadElement('items'), makeIdentifier('extra')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMinutes(extra, ...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(extra, ...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getUTCMinutes', [makeIdentifier('extra'), makeSpreadElement('items')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('arr', 'slice', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.method(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.method(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('obj', 'method', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report myDate.getUTCMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'myDate.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('myDate', 'getUTCMinutes', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report current.getUTCMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'current.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('current', 'getUTCMinutes', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report today.getUTCMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'today.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('today', 'getUTCMinutes', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMinutes(undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(undefined);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCMinutes', [makeLiteral(undefined)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMinutes(null)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(null);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCMinutes', [makeLiteral(null)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMinutes(...items, ...more)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...items, ...more);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getUTCMinutes', [makeSpreadElement('items'), makeSpreadElement('more')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMinutes("string")', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes("string");' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getUTCMinutes', [makeLiteral('string')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.valueOf(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.valueOf(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'valueOf', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleTimeString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleTimeString(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toLocaleTimeString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toUTCString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toUTCString(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toUTCString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMinutes(() => {})', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(() => {});' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getUTCMinutes', [
          { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMinutes({})', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes({});' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getUTCMinutes', [{ type: 'ObjectExpression', properties: [] }]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report getUTCMinutes(...items) direct call', () => {
      const { context, reports } = createMockRuleContext({ source: 'getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [makeSpreadElement('items')],
        callee: {
          name: 'getUTCMinutes',
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
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getTimezoneOffset', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMinutes([])', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes([]);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getUTCMinutes', [{ type: 'ArrayExpression', elements: [] }]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report timestamp.getUTCMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'timestamp.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('timestamp', 'getUTCMinutes', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      expect(() => visitor.CallExpression()).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      const node = {
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getUTCMinutes', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with computed callee property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        callee: {
          computed: true,
          object: { name: 'date', type: 'Identifier' },
          property: { type: 'Literal', value: 'getUTCMinutes' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier callee object', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        callee: {
          computed: false,
          object: { type: 'MemberExpression', object: { name: 'foo', type: 'Identifier' }, property: { name: 'bar', type: 'Identifier' } },
          property: { name: 'getUTCMinutes', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { type: 'Literal', value: 'getUTCMinutes' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle number node', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('items', 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle multiple calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetUTCMinutesCall('items'))
      visitor.CallExpression(makeDateGetUTCMinutesCall('args'))
      visitor.CallExpression(makeCallWithArgs('time', 'getUTCMinutes', [makeSpreadElement('items')]))

      expect(reports.length).toBe(2)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getUTCMinutes', type: 'Identifier' },
          type: 'MemberExpression',
        },
        range: [0, 20],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle node without callee property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty arguments array', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes();' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      const node = {
        arguments: [],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getUTCMinutes', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report for date.getUTCMinutes with two spread args', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...a, ...b);' })
      const visitor = noUnnecessaryDateGetUTCMinutesSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getUTCMinutes', [makeSpreadElement('a'), makeSpreadElement('b')]),
      )

      expect(reports.length).toBe(0)
    })
  })
})

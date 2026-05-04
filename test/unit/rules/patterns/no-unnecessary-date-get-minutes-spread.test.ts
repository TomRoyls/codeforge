

import { noUnnecessaryDateGetMinutesSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-get-minutes-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function makeDateGetMinutesCall(spreadArgName = 'items', line = 1, column = 0): unknown {
  const objectEnd = column + 'date'.length
  const propertyEnd = objectEnd + '.getMinutes'.length
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
        name: 'getMinutes',
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

describe('no-unnecessary-date-get-minutes-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryDateGetMinutesSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryDateGetMinutesSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryDateGetMinutesSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryDateGetMinutesSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryDateGetMinutesSpreadRule.meta.schema).toEqual([])
    })

    test('should have meta property', () => {
      expect(noUnnecessaryDateGetMinutesSpreadRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(noUnnecessaryDateGetMinutesSpreadRule).toHaveProperty('create')
    })

    test('should have docs with url', () => {
      expect(noUnnecessaryDateGetMinutesSpreadRule.meta.docs?.url).toBeDefined()
    })

  })

  describe('create', () => {
    test('should return visitor with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'date.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'date.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detecting date.getMinutes(...items) with single spread', () => {
    test('should report date.getMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('items'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toMatch(/date\.getMinutes/)
    })

    test('should report date.getMinutes(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...args);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('args'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMinutes(...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...rest);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('rest'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMinutes(...params)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...params);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('params'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMinutes(...spread)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...spread);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('spread'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMinutes(...vals)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...vals);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('vals'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMinutes(...opts)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...opts);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('opts'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMinutes(...extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...extra);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('extra'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMinutes(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...data);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('data'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMinutes(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...list);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('list'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMinutes(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...arr);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('arr'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMinutes(...parts)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...parts);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('parts'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMinutes(...fields)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...fields);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('fields'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMinutes(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...values);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('values'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMinutes(...more)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...more);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('more'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMinutes(...theArgs)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...theArgs);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('theArgs'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMinutes(...remaining)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...remaining);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('remaining'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMinutes(...input)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...input);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('input'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMinutes(...x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...x);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('x'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMinutes(...restArgs)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...restArgs);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('restArgs'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMinutes(...collect)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...collect);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('collect'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMinutes(...others)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...others);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('others'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMinutes(...restParams)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...restParams);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('restParams'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMinutes(...gather)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...gather);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('gather'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMinutes(...payload)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...payload);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('payload'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMinutes(...overflow)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...overflow);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('overflow'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getMinutes(...theRest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...theRest);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('theRest'))

      expect(reports.length).toBe(1)
    })

    test('should include correct message text', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('items'))

      expect(reports[0].message).toBe(
        'date.getMinutes(...items) with a single spread is unusual. Consider calling date.getMinutes() directly.',
      )
    })
  })

  describe('not reporting non-matching calls', () => {
    test('should not report date.getMinutes() with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes();' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getMinutes', []))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMinutes(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(0);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getMinutes', [makeLiteral(0)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMinutes(1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(1);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getMinutes', [makeLiteral(1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMinutes(n)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(n);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getMinutes', [makeIdentifier('n')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMinutes(x, y)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(x, y);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getMinutes', [makeIdentifier('x'), makeIdentifier('y')]))

      expect(reports.length).toBe(0)
    })

    test('should not report time.getMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'time.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('time', 'getMinutes', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report d.getMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'd.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('d', 'getMinutes', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report now.getMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'now.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('now', 'getMinutes', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report dt.getMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'dt.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('dt', 'getMinutes', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getHours', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getSeconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getSeconds(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getSeconds', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMilliseconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getMilliseconds', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTime(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTime(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getTime', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getFullYear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getFullYear', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getMonth', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDate(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getDate', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDay(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getDay', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.setMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.setMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'setMinutes', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toString(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toISOString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toISOString(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toISOString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMinutes(...items, extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...items, extra);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getMinutes', [makeSpreadElement('items'), makeIdentifier('extra')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMinutes(extra, ...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(extra, ...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getMinutes', [makeIdentifier('extra'), makeSpreadElement('items')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('arr', 'slice', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.method(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.method(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('obj', 'method', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report myDate.getMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'myDate.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('myDate', 'getMinutes', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report current.getMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'current.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('current', 'getMinutes', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report today.getMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'today.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('today', 'getMinutes', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMinutes(undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(undefined);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getMinutes', [makeLiteral(undefined)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMinutes(null)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(null);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getMinutes', [makeLiteral(null)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMinutes(...items, ...more)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...items, ...more);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getMinutes', [makeSpreadElement('items'), makeSpreadElement('more')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMinutes("string")', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes("string");' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getMinutes', [makeLiteral('string')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.valueOf(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.valueOf(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'valueOf', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleTimeString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleTimeString(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toLocaleTimeString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toUTCString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toUTCString(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toUTCString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMinutes(() => {})', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(() => {});' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getMinutes', [
          { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMinutes({})', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes({});' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getMinutes', [{ type: 'ObjectExpression', properties: [] }]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report getMinutes(...items) direct call', () => {
      const { context, reports } = createMockRuleContext({ source: 'getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [makeSpreadElement('items')],
        callee: {
          name: 'getMinutes',
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
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getTimezoneOffset', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMinutes([])', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes([]);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getMinutes', [{ type: 'ArrayExpression', elements: [] }]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report timestamp.getMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'timestamp.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('timestamp', 'getMinutes', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      expect(() => visitor.CallExpression()).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      const node = {
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getMinutes', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with computed callee property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        callee: {
          computed: true,
          object: { name: 'date', type: 'Identifier' },
          property: { type: 'Literal', value: 'getMinutes' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier callee object', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        callee: {
          computed: false,
          object: { type: 'MemberExpression', object: { name: 'foo', type: 'Identifier' }, property: { name: 'bar', type: 'Identifier' } },
          property: { name: 'getMinutes', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { type: 'Literal', value: 'getMinutes' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext({ source: 'date.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle number node', () => {
      const { context } = createMockRuleContext({ source: 'date.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('items', 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle multiple calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(makeDateGetMinutesCall('items'))
      visitor.CallExpression(makeDateGetMinutesCall('args'))
      visitor.CallExpression(makeCallWithArgs('time', 'getMinutes', [makeSpreadElement('items')]))

      expect(reports.length).toBe(2)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getMinutes', type: 'Identifier' },
          type: 'MemberExpression',
        },
        range: [0, 20],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle node without callee property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty arguments array', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes();' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      const node = {
        arguments: [],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getMinutes', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report for date.getMinutes with two spread args', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...a, ...b);' })
      const visitor = noUnnecessaryDateGetMinutesSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getMinutes', [makeSpreadElement('a'), makeSpreadElement('b')]),
      )

      expect(reports.length).toBe(0)
    })
  })
})

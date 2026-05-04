

import { noUnnecessaryDateGetHoursSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-get-hours-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function makeDateGetHoursCall(spreadArgName = 'items', line = 1, column = 0): unknown {
  const objectEnd = column + 'date'.length
  const propertyEnd = objectEnd + '.getHours'.length
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
        name: 'getHours',
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

describe('no-unnecessary-date-get-hours-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryDateGetHoursSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryDateGetHoursSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryDateGetHoursSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryDateGetHoursSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryDateGetHoursSpreadRule.meta.schema).toEqual([])
    })

    test('should have meta property', () => {
      expect(noUnnecessaryDateGetHoursSpreadRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(noUnnecessaryDateGetHoursSpreadRule).toHaveProperty('create')
    })

    test('should have docs with url', () => {
      expect(noUnnecessaryDateGetHoursSpreadRule.meta.docs?.url).toBeDefined()
    })
  })

  describe('create', () => {
    test('should return visitor with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'date.getHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'date.getHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detecting date.getHours(...items) with single spread', () => {
    test('should report date.getHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('items'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toMatch(/date\.getHours/)
    })

    test('should report date.getHours(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...args);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('args'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getHours(...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...rest);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('rest'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getHours(...params)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...params);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('params'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getHours(...spread)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...spread);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('spread'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getHours(...vals)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...vals);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('vals'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getHours(...opts)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...opts);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('opts'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getHours(...extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...extra);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('extra'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getHours(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...data);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('data'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getHours(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...list);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('list'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getHours(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...arr);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('arr'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getHours(...parts)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...parts);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('parts'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getHours(...fields)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...fields);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('fields'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getHours(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...values);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('values'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getHours(...more)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...more);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('more'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getHours(...theArgs)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...theArgs);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('theArgs'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getHours(...remaining)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...remaining);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('remaining'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getHours(...input)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...input);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('input'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getHours(...x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...x);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('x'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getHours(...restArgs)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...restArgs);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('restArgs'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getHours(...collect)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...collect);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('collect'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getHours(...others)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...others);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('others'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getHours(...restParams)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...restParams);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('restParams'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getHours(...gather)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...gather);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('gather'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getHours(...payload)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...payload);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('payload'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getHours(...overflow)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...overflow);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('overflow'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getHours(...theRest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...theRest);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('theRest'))

      expect(reports.length).toBe(1)
    })

    test('should include correct message text', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('items'))

      expect(reports[0].message).toBe(
        'date.getHours(...items) with a single spread is unusual. Consider calling date.getHours() directly.',
      )
    })
  })

  describe('not reporting non-matching calls', () => {
    test('should not report date.getHours() with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours();' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getHours', []))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getHours(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(0);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getHours', [makeLiteral(0)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getHours(1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(1);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getHours', [makeLiteral(1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getHours(n)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(n);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getHours', [makeIdentifier('n')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getHours(x, y)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(x, y);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getHours', [makeIdentifier('x'), makeIdentifier('y')]))

      expect(reports.length).toBe(0)
    })

    test('should not report time.getHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'time.getHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('time', 'getHours', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report d.getHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'd.getHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('d', 'getHours', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report now.getHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'now.getHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('now', 'getHours', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report dt.getHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'dt.getHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('dt', 'getHours', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getMinutes', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getSeconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getSeconds(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getSeconds', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMilliseconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getMilliseconds', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTime(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTime(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getTime', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getFullYear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getFullYear', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getMonth', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDate(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getDate', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDay(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getDay', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.setHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.setHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'setHours', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toString(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toISOString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toISOString(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toISOString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getHours(...items, extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...items, extra);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getHours', [makeSpreadElement('items'), makeIdentifier('extra')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.getHours(extra, ...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(extra, ...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getHours', [makeIdentifier('extra'), makeSpreadElement('items')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('arr', 'slice', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.method(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.method(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('obj', 'method', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report myDate.getHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'myDate.getHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('myDate', 'getHours', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report current.getHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'current.getHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('current', 'getHours', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report today.getHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'today.getHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('today', 'getHours', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getHours(undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(undefined);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getHours', [makeLiteral(undefined)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getHours(null)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(null);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getHours', [makeLiteral(null)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getHours(...items, ...more)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...items, ...more);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getHours', [makeSpreadElement('items'), makeSpreadElement('more')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.getHours("string")', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours("string");' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getHours', [makeLiteral('string')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.valueOf(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.valueOf(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'valueOf', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleTimeString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleTimeString(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toLocaleTimeString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toUTCString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toUTCString(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toUTCString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getHours(() => {})', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(() => {});' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getHours', [
          { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.getHours({})', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours({});' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getHours', [{ type: 'ObjectExpression', properties: [] }]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report getHours(...items) direct call', () => {
      const { context, reports } = createMockRuleContext({ source: 'getHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [makeSpreadElement('items')],
        callee: {
          name: 'getHours',
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
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getTimezoneOffset', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getHours([])', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours([]);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getHours', [{ type: 'ArrayExpression', elements: [] }]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report timestamp.getHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'timestamp.getHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('timestamp', 'getHours', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      expect(() => visitor.CallExpression()).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      const node = {
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getHours', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with computed callee property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        callee: {
          computed: true,
          object: { name: 'date', type: 'Identifier' },
          property: { type: 'Literal', value: 'getHours' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier callee object', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        callee: {
          computed: false,
          object: { type: 'MemberExpression', object: { name: 'foo', type: 'Identifier' }, property: { name: 'bar', type: 'Identifier' } },
          property: { name: 'getHours', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { type: 'Literal', value: 'getHours' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext({ source: 'date.getHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle number node', () => {
      const { context } = createMockRuleContext({ source: 'date.getHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('items', 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle multiple calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(makeDateGetHoursCall('items'))
      visitor.CallExpression(makeDateGetHoursCall('args'))
      visitor.CallExpression(makeCallWithArgs('time', 'getHours', [makeSpreadElement('items')]))

      expect(reports.length).toBe(2)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getHours', type: 'Identifier' },
          type: 'MemberExpression',
        },
        range: [0, 20],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle node without callee property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...items);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty arguments array', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours();' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      const node = {
        arguments: [],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getHours', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report for date.getHours with two spread args', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...a, ...b);' })
      const visitor = noUnnecessaryDateGetHoursSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getHours', [makeSpreadElement('a'), makeSpreadElement('b')]),
      )

      expect(reports.length).toBe(0)
    })
  })
})



import { noUnnecessaryDateGetTimezoneOffsetSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-get-timezone-offset-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function makeDateGetTimezoneOffsetCall(spreadArgName = 'items', line = 1, column = 0): unknown {
  const objectEnd = column + 'date'.length
  const propertyEnd = objectEnd + '.getTimezoneOffset'.length
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
        name: 'getTimezoneOffset',
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

describe('no-unnecessary-date-get-timezone-offset-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryDateGetTimezoneOffsetSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryDateGetTimezoneOffsetSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryDateGetTimezoneOffsetSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryDateGetTimezoneOffsetSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryDateGetTimezoneOffsetSpreadRule.meta.schema).toEqual([])
    })

    test('should have meta property', () => {
      expect(noUnnecessaryDateGetTimezoneOffsetSpreadRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(noUnnecessaryDateGetTimezoneOffsetSpreadRule).toHaveProperty('create')
    })

    test('should have docs with url', () => {
      expect(noUnnecessaryDateGetTimezoneOffsetSpreadRule.meta.docs?.url).toBeDefined()
    })
  })

  describe('create', () => {
    test('should return visitor with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'date.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'date.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detecting date.getTimezoneOffset(...items) with single spread', () => {
    test('should report date.getTimezoneOffset(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('items'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toMatch(/date\.getTimezoneOffset/)
    })

    test('should report date.getTimezoneOffset(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...args);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('args'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getTimezoneOffset(...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...rest);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('rest'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getTimezoneOffset(...params)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...params);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('params'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getTimezoneOffset(...spread)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...spread);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('spread'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getTimezoneOffset(...vals)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...vals);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('vals'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getTimezoneOffset(...opts)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...opts);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('opts'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getTimezoneOffset(...extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...extra);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('extra'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getTimezoneOffset(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...data);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('data'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getTimezoneOffset(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...list);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('list'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getTimezoneOffset(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...arr);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('arr'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getTimezoneOffset(...parts)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...parts);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('parts'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getTimezoneOffset(...fields)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...fields);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('fields'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getTimezoneOffset(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...values);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('values'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getTimezoneOffset(...more)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...more);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('more'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getTimezoneOffset(...theArgs)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...theArgs);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('theArgs'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getTimezoneOffset(...remaining)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...remaining);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('remaining'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getTimezoneOffset(...input)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...input);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('input'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getTimezoneOffset(...x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...x);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('x'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getTimezoneOffset(...restArgs)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...restArgs);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('restArgs'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getTimezoneOffset(...collect)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...collect);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('collect'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getTimezoneOffset(...others)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...others);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('others'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getTimezoneOffset(...restParams)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...restParams);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('restParams'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getTimezoneOffset(...gather)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...gather);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('gather'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getTimezoneOffset(...payload)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...payload);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('payload'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getTimezoneOffset(...overflow)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...overflow);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('overflow'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getTimezoneOffset(...theRest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...theRest);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('theRest'))

      expect(reports.length).toBe(1)
    })

    test('should include correct message text', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('items'))

      expect(reports[0].message).toBe(
        'date.getTimezoneOffset(...items) with a single spread is unusual. Consider calling date.getTimezoneOffset() directly.',
      )
    })
  })

  describe('not reporting non-matching calls', () => {
    test('should not report date.getTimezoneOffset() with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset();' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getTimezoneOffset', []))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTimezoneOffset(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(0);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getTimezoneOffset', [makeLiteral(0)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTimezoneOffset(1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(1);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getTimezoneOffset', [makeLiteral(1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTimezoneOffset(n)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(n);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getTimezoneOffset', [makeIdentifier('n')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTimezoneOffset(x, y)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(x, y);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getTimezoneOffset', [makeIdentifier('x'), makeIdentifier('y')]))

      expect(reports.length).toBe(0)
    })

    test('should not report time.getTimezoneOffset(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'time.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('time', 'getTimezoneOffset', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report d.getTimezoneOffset(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'd.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('d', 'getTimezoneOffset', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report now.getTimezoneOffset(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'now.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('now', 'getTimezoneOffset', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report dt.getTimezoneOffset(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'dt.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('dt', 'getTimezoneOffset', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getHours', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getSeconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getSeconds(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getSeconds', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMilliseconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getMilliseconds', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTime(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTime(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getTime', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getFullYear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getFullYear', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getMonth', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDate(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getDate', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDay(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getDay', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getMinutes', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toString(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toISOString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toISOString(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toISOString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTimezoneOffset(...items, extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...items, extra);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getTimezoneOffset', [makeSpreadElement('items'), makeIdentifier('extra')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTimezoneOffset(extra, ...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(extra, ...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getTimezoneOffset', [makeIdentifier('extra'), makeSpreadElement('items')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report arr.slice(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.slice(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('arr', 'slice', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.method(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.method(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('obj', 'method', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report myDate.getTimezoneOffset(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'myDate.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('myDate', 'getTimezoneOffset', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report current.getTimezoneOffset(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'current.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('current', 'getTimezoneOffset', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report today.getTimezoneOffset(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'today.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('today', 'getTimezoneOffset', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTimezoneOffset(undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(undefined);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getTimezoneOffset', [makeLiteral(undefined)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTimezoneOffset(null)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(null);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getTimezoneOffset', [makeLiteral(null)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTimezoneOffset(...items, ...more)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...items, ...more);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getTimezoneOffset', [makeSpreadElement('items'), makeSpreadElement('more')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTimezoneOffset("string")', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset("string");' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getTimezoneOffset', [makeLiteral('string')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.valueOf(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.valueOf(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'valueOf', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleTimeString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleTimeString(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toLocaleTimeString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toUTCString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toUTCString(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toUTCString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTimezoneOffset(() => {})', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(() => {});' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getTimezoneOffset', [
          { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTimezoneOffset({})', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset({});' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getTimezoneOffset', [{ type: 'ObjectExpression', properties: [] }]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report getTimezoneOffset(...items) direct call', () => {
      const { context, reports } = createMockRuleContext({ source: 'getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [makeSpreadElement('items')],
        callee: {
          name: 'getTimezoneOffset',
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

    test('should not report date.getMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getMinutes', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTimezoneOffset([])', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset([]);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getTimezoneOffset', [{ type: 'ArrayExpression', elements: [] }]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report timestamp.getTimezoneOffset(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'timestamp.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('timestamp', 'getTimezoneOffset', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      expect(() => visitor.CallExpression()).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      const node = {
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getTimezoneOffset', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with computed callee property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        callee: {
          computed: true,
          object: { name: 'date', type: 'Identifier' },
          property: { type: 'Literal', value: 'getTimezoneOffset' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier callee object', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        callee: {
          computed: false,
          object: { type: 'MemberExpression', object: { name: 'foo', type: 'Identifier' }, property: { name: 'bar', type: 'Identifier' } },
          property: { name: 'getTimezoneOffset', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { type: 'Literal', value: 'getTimezoneOffset' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext({ source: 'date.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle number node', () => {
      const { context } = createMockRuleContext({ source: 'date.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('items', 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle multiple calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(makeDateGetTimezoneOffsetCall('items'))
      visitor.CallExpression(makeDateGetTimezoneOffsetCall('args'))
      visitor.CallExpression(makeCallWithArgs('time', 'getTimezoneOffset', [makeSpreadElement('items')]))

      expect(reports.length).toBe(2)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getTimezoneOffset', type: 'Identifier' },
          type: 'MemberExpression',
        },
        range: [0, 20],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle node without callee property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty arguments array', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset();' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      const node = {
        arguments: [],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getTimezoneOffset', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report for date.getTimezoneOffset with two spread args', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...a, ...b);' })
      const visitor = noUnnecessaryDateGetTimezoneOffsetSpreadRule.create(context)

      visitor.CallExpression(
        makeCallWithArgs('date', 'getTimezoneOffset', [makeSpreadElement('a'), makeSpreadElement('b')]),
      )

      expect(reports.length).toBe(0)
    })
  })
})

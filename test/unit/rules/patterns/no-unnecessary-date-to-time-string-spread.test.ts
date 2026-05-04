
import { noUnnecessaryDateToTimeStringSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-to-time-string-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function makeDateToTimeStringCall(
  spreadArgName = 'items',
  line = 1,
  column = 0,
): unknown {
  const callEnd = column + 'date.toTimeString('.length + `...${spreadArgName}`.length + ')'.length
  return {
    arguments: [
      {
        argument: { name: spreadArgName, type: 'Identifier' },
        type: 'SpreadElement',
      },
    ],
    callee: {
      computed: false,
      object: { name: 'date', type: 'Identifier' },
      property: { name: 'toTimeString', type: 'Identifier' },
      type: 'MemberExpression',
    },
    loc: {
      end: { column: callEnd, line },
      start: { column, line },
    },
    type: 'CallExpression',
  }
}

function makeCallWithArgs(objectName: string, propertyName: string, args: unknown[], line = 1, column = 0): unknown {
  return {
    arguments: args,
    callee: {
      computed: false,
      object: { name: objectName, type: 'Identifier' },
      property: { name: propertyName, type: 'Identifier' },
      type: 'MemberExpression',
    },
    loc: {
      end: { column: column + 20, line },
      start: { column, line },
    },
    type: 'CallExpression',
  }
}

function makeSpreadElement(argName: string): unknown {
  return {
    argument: { name: argName, type: 'Identifier' },
    type: 'SpreadElement',
  }
}

function makeIdentifier(name: string): unknown {
  return { name, type: 'Identifier' }
}

function makeLiteral(value: unknown): unknown {
  return { type: 'Literal', value }
}

describe('no-unnecessary-date-to-time-string-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryDateToTimeStringSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryDateToTimeStringSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryDateToTimeStringSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryDateToTimeStringSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryDateToTimeStringSpreadRule.meta.schema).toBeDefined()
    })

    test('should mention toTimeString in description', () => {
      expect(noUnnecessaryDateToTimeStringSpreadRule.meta.docs?.description.toLowerCase()).toContain('totimestring')
    })

    test('should mention spread in description', () => {
      expect(noUnnecessaryDateToTimeStringSpreadRule.meta.docs?.description.toLowerCase()).toContain('spread')
    })

    test('should have meta property', () => {
      expect(noUnnecessaryDateToTimeStringSpreadRule).toHaveProperty('meta')
    })
  })

  describe('structure', () => {
    test('should return visitor with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detecting date.toTimeString(...spread)', () => {
    test('should report date.toTimeString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('items'))

      expect(reports.length).toBe(1)
    })

    test('should report date.toTimeString(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...args);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('args'))

      expect(reports.length).toBe(1)
    })

    test('should report date.toTimeString(...params)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...params);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('params'))

      expect(reports.length).toBe(1)
    })

    test('should report date.toTimeString(...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...rest);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('rest'))

      expect(reports.length).toBe(1)
    })

    test('should report date.toTimeString(...spread)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...spread);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('spread'))

      expect(reports.length).toBe(1)
    })

    test('should report date.toTimeString(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...arr);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('arr'))

      expect(reports.length).toBe(1)
    })

    test('should report date.toTimeString(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...data);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('data'))

      expect(reports.length).toBe(1)
    })

    test('should report date.toTimeString(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...list);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('list'))

      expect(reports.length).toBe(1)
    })

    test('should report date.toTimeString(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...values);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('values'))

      expect(reports.length).toBe(1)
    })

    test('should report date.toTimeString(...collection)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...collection);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('collection'))

      expect(reports.length).toBe(1)
    })

    test('should report date.toTimeString(...result)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...result);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('result'))

      expect(reports.length).toBe(1)
    })

    test('should report date.toTimeString(...elements)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...elements);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('elements'))

      expect(reports.length).toBe(1)
    })

    test('should report date.toTimeString(...entries)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...entries);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('entries'))

      expect(reports.length).toBe(1)
    })

    test('should report date.toTimeString(...nums)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...nums);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('nums'))

      expect(reports.length).toBe(1)
    })

    test('should report date.toTimeString(...chunks)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...chunks);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('chunks'))

      expect(reports.length).toBe(1)
    })

    test('should report with correct message', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('items'))

      expect(reports[0].message).toBe(
        'date.toTimeString(...items) with a single spread is unusual. Consider calling date.toTimeString() directly.',
      )
    })

    test('should report with location on line 1', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('items', 1))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should report with location on line 5', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('items', 5))

      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should report with location on line 10', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('items', 10))

      expect(reports[0].loc?.start.line).toBe(10)
    })

    test('should report at column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('items', 1, 0))

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report at column 4', () => {
      const { context, reports } = createMockRuleContext({ source: '  date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('items', 1, 4))

      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report at column 8', () => {
      const { context, reports } = createMockRuleContext({ source: '      date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('items', 1, 8))

      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report at column 20', () => {
      const { context, reports } = createMockRuleContext({ source: '                    date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('items', 1, 20))

      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should produce exactly one report per call', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('items'))

      expect(reports.length).toBe(1)
    })

    test('should include toTimeString in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('items'))

      expect(reports[0].message).toContain('toTimeString')
    })

    test('should include spread in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('items'))

      expect(reports[0].message).toContain('spread')
    })

    test('should include direct suggestion in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('items'))

      expect(reports[0].message).toContain('directly')
    })

    test('should report date.toTimeString(...options)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...options);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('options'))

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting non-matching calls', () => {
    test('should not report d.toTimeString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'd.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('d', 'toTimeString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report myDate.toTimeString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'myDate.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('myDate', 'toTimeString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report dt.toTimeString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'dt.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('dt', 'toTimeString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report time.toTimeString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'time.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('time', 'toTimeString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report now.toTimeString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'now.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('now', 'toTimeString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report today.toTimeString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'today.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('today', 'toTimeString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toDateString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toDateString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toISOString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toISOString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toISOString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toLocaleString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toUTCString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toUTCString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toUTCString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleDateString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toLocaleDateString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleTimeString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toLocaleTimeString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTime(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTime(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getTime', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.valueOf(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.valueOf(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'valueOf', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toTimeString() with no args', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString();' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toTimeString', []))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toTimeString(items) with identifier arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toTimeString', [makeIdentifier('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toTimeString(arg) with identifier arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(arg);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toTimeString', [makeIdentifier('arg')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toTimeString(null)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(null);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toTimeString', [makeLiteral(null)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toTimeString(undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(undefined);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toTimeString', [makeIdentifier('undefined')]))

      expect(reports.length).toBe(0)
    })

    test('should not report with two arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...items, extra);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toTimeString', [makeSpreadElement('items'), makeIdentifier('extra')]))

      expect(reports.length).toBe(0)
    })

    test('should not report with extra arg before spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(extra, ...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toTimeString', [makeIdentifier('extra'), makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report computed member date["toTimeString"](...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date["toTimeString"](...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        callee: {
          computed: true,
          object: { name: 'date', type: 'Identifier' },
          property: { type: 'Literal', value: 'toTimeString' },
          type: 'MemberExpression',
        },
        loc: {
          end: { column: 30, line: 1 },
          start: { column: 0, line: 1 },
        },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report direct toTimeString(...items) call', () => {
      const { context, reports } = createMockRuleContext({ source: 'toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadElement('items')],
        callee: { name: 'toTimeString', type: 'Identifier' },
        loc: {
          end: { column: 20, line: 1 },
          start: { column: 0, line: 1 },
        },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.toTimeString(1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(1);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toTimeString', [makeLiteral(1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toTimeString("abc")', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString("abc");' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toTimeString', [makeLiteral('abc')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toTimeString(true)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(true);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toTimeString', [makeLiteral(true)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toTimeString({})', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString({});' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toTimeString', [{ type: 'ObjectExpression', properties: [] }]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.map(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.map(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('arr', 'map', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.filter(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.filter(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('arr', 'filter', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.method(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.method(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('obj', 'method', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.reduce(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.reduce(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('arr', 'reduce', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report console.log(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'console.log(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('console', 'log', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report with two spread arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...a, ...b);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toTimeString', [makeSpreadElement('a'), makeSpreadElement('b')]))

      expect(reports.length).toBe(0)
    })

    test('should not report with zero arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString();' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toTimeString', []))

      expect(reports.length).toBe(0)
    })

    test('should not report with literal argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(42);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toTimeString', [makeLiteral(42)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocalTimeString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocalTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toLocalTimeString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDate(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getDate', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDay(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getDay', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getSeconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getSeconds(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getSeconds', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'getMinutes', [makeSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle string node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
    })

    test('should handle number node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [makeSpreadElement('items')],
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression({
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'toTimeString', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      expect(() => visitor.CallExpression(makeCallWithArgs('date', 'toTimeString', [makeSpreadElement('items')]))).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle node with non-Identifier callee object', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [makeSpreadElement('items')],
        callee: {
          computed: false,
          object: { type: 'CallExpression' },
          property: { name: 'toTimeString', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier callee property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [makeSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { type: 'Literal', value: 'toTimeString' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should handle computed member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'date["toTimeString"](...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [makeSpreadElement('items')],
        callee: {
          computed: true,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'toTimeString', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 30, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should handle multiple calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeDateToTimeStringCall('items'))
      visitor.CallExpression(makeCallWithArgs('date', 'toTimeString', []))
      visitor.CallExpression(makeCallWithArgs('arr', 'toTimeString', [makeSpreadElement('items')]))

      expect(reports.length).toBe(1)
    })

    test('should handle node without callee object', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [makeSpreadElement('items')],
        callee: {
          computed: false,
          property: { name: 'toTimeString', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node without callee property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [makeSpreadElement('items')],
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

    test('should handle node with non-SpreadElement argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(items);' })
      const visitor = noUnnecessaryDateToTimeStringSpreadRule.create(context)

      visitor.CallExpression(makeCallWithArgs('date', 'toTimeString', [makeIdentifier('items')]))

      expect(reports.length).toBe(0)
    })
  })
})

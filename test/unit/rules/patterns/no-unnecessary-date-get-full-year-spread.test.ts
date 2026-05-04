

import { noUnnecessaryDateGetFullYearSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-get-full-year-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function makeDateGetFullYearCall(args: unknown[], line = 1, column = 0): unknown {
  const objectEnd = column + 'date'.length
  const callEnd = objectEnd + '.getFullYear'.length + args.length * 2 + 2

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
        name: 'getFullYear',
        type: 'Identifier',
      },
      range: [column, objectEnd + '.getFullYear'.length],
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

function createSpreadElement(argName = 'items'): unknown {
  return {
    argument: {
      name: argName,
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

function createLiteral(value: unknown, raw?: string): unknown {
  return {
    raw: raw ?? String(value),
    type: 'Literal',
    value,
  }
}

function createNonMatchingCall(objectName: string, methodName: string, args: unknown[] = []): unknown {
  return {
    arguments: args,
    callee: {
      computed: false,
      object: {
        name: objectName,
        type: 'Identifier',
      },
      property: {
        name: methodName,
        type: 'Identifier',
      },
      type: 'MemberExpression',
    },
    loc: {
      end: { column: 20, line: 1 },
      start: { column: 0, line: 1 },
    },
    type: 'CallExpression',
  }
}

function createComputedCalleeCall(): unknown {
  return {
    arguments: [createSpreadElement('items')],
    callee: {
      computed: true,
      object: {
        name: 'date',
        type: 'Identifier',
      },
      property: {
        name: 'getFullYear',
        type: 'Identifier',
      },
      type: 'MemberExpression',
    },
    loc: {
      end: { column: 30, line: 1 },
      start: { column: 0, line: 1 },
    },
    type: 'CallExpression',
  }
}

describe('no-unnecessary-date-get-full-year-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryDateGetFullYearSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryDateGetFullYearSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryDateGetFullYearSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryDateGetFullYearSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryDateGetFullYearSpreadRule.meta.schema).toBeDefined()
    })

    test('should have empty schema array', () => {
      expect(noUnnecessaryDateGetFullYearSpreadRule.meta.schema).toEqual([])
    })

    test('should mention getFullYear in description', () => {
      expect(noUnnecessaryDateGetFullYearSpreadRule.meta.docs?.description.toLowerCase()).toContain('getfullyear')
    })

    test('should have meta property', () => {
      expect(noUnnecessaryDateGetFullYearSpreadRule).toHaveProperty('meta')
    })
  })

  describe('structure', () => {
    test('should have create property', () => {
      expect(noUnnecessaryDateGetFullYearSpreadRule).toHaveProperty('create')
    })

    test('should return visitor with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detecting date.getFullYear(...items) with spread', () => {
    test('should report date.getFullYear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('items')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('date.getFullYear(...items)')
      expect(reports[0].message).toContain('spread is unusual')
    })

    test('should report date.getFullYear(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...args);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('args')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getFullYear(...params)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...params);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('params')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getFullYear(...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...rest);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('rest')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getFullYear(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...data);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('data')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getFullYear(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...values);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('values')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getFullYear(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...arr);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('arr')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getFullYear(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...list);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('list')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getFullYear(...options)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...options);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('options')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getFullYear(...spread)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...spread);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('spread')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getFullYear(...extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...extra);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('extra')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getFullYear(...parts)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...parts);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('parts')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getFullYear(...elements)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...elements);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('elements')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getFullYear(...entries)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...entries);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('entries')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getFullYear(...payload)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...payload);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('payload')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getFullYear(...input)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...input);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('input')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getFullYear(...collection)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...collection);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('collection')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getFullYear(...result)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...result);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('result')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getFullYear(...stuff)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...stuff);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('stuff')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getFullYear(...nums)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...nums);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('nums')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getFullYear(...chunks)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...chunks);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('chunks')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getFullYear(...buffer)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...buffer);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('buffer')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getFullYear(...rows)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...rows);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('rows')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getFullYear(...fields)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...fields);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('fields')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getFullYear(...vars)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...vars);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('vars')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getFullYear(...more)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...more);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('more')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getFullYear(...x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...x);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('x')]))

      expect(reports.length).toBe(1)
    })

    test('should report with correct message containing suggestion', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('items')]))

      expect(reports[0].message).toBe(
        'date.getFullYear(...items) with a single spread is unusual. Consider calling date.getFullYear() directly.',
      )
    })
  })

  describe('not reporting non-matching calls', () => {
    test('should not report date.getFullYear() with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear();' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getFullYear(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(0);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createLiteral(0)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getFullYear(1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(1);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createLiteral(1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getFullYear(undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(undefined);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createLiteral(undefined, 'undefined')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getFullYear(null)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(null);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createLiteral(null, 'null')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getFullYear(x, y) with two spread args', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...a, ...b);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('a'), createSpreadElement('b')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getFullYear(x, y) with two args', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(x, y);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createIdentifier('x'), createIdentifier('y')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(createNonMatchingCall('date', 'getMonth', [createSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDate(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(createNonMatchingCall('date', 'getDate', [createSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth()', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth();' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(createNonMatchingCall('date', 'getMonth', []))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTime(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTime(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(createNonMatchingCall('date', 'getTime', [createSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.getFullYear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(createNonMatchingCall('obj', 'getFullYear', [createSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report d.getFullYear(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'd.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(createNonMatchingCall('d', 'getFullYear', [createSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report myDate.getFullYear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'myDate.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(createNonMatchingCall('myDate', 'getFullYear', [createSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report now.getFullYear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'now.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(createNonMatchingCall('now', 'getFullYear', [createSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report today.getFullYear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'today.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(createNonMatchingCall('today', 'getFullYear', [createSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report dt.getFullYear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'dt.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(createNonMatchingCall('dt', 'getFullYear', [createSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.setFullYear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.setFullYear(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(createNonMatchingCall('date', 'setFullYear', [createSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toISOString()', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toISOString();' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(createNonMatchingCall('date', 'toISOString', []))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toString()', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toString();' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(createNonMatchingCall('date', 'toString', []))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toDateString()', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString();' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(createNonMatchingCall('date', 'toDateString', []))

      expect(reports.length).toBe(0)
    })

    test('should not report date.valueOf()', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.valueOf();' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(createNonMatchingCall('date', 'valueOf', []))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDay()', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay();' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(createNonMatchingCall('date', 'getDay', []))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getHours()', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours();' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(createNonMatchingCall('date', 'getHours', []))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMinutes()', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes();' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(createNonMatchingCall('date', 'getMinutes', []))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getSeconds()', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getSeconds();' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(createNonMatchingCall('date', 'getSeconds', []))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMilliseconds()', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds();' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(createNonMatchingCall('date', 'getMilliseconds', []))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTimezoneOffset()', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset();' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(createNonMatchingCall('date', 'getTimezoneOffset', []))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCHours()', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours();' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(createNonMatchingCall('date', 'getUTCHours', []))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCFullYear()', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear();' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(createNonMatchingCall('date', 'getUTCFullYear', []))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toISOString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toISOString(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(createNonMatchingCall('date', 'toISOString', [createSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report getFullYear() direct call', () => {
      const { context, reports } = createMockRuleContext({ source: 'getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement('items')],
        callee: {
          name: 'getFullYear',
          type: 'Identifier',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report date[getFullYear](...items) computed access', () => {
      const { context, reports } = createMockRuleContext({ source: 'date[getFullYear](...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(createComputedCalleeCall())

      expect(reports.length).toBe(0)
    })

    test('should not report date.getFullYear(42)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(42);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createLiteral(42)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getFullYear("arg")', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear("arg");' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createLiteral('arg', '"arg"')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getFullYear(n)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(n);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createIdentifier('n')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getFullYear(foo)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(foo);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createIdentifier('foo')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getFullYear(bar)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(bar);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createIdentifier('bar')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getFullYear(0, 1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(0, 1);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createLiteral(0), createLiteral(1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getFullYear(a, b)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(a, b);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createIdentifier('a'), createIdentifier('b')]))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        loc: { end: { column: 30, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      const node = {
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getFullYear', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 30, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle node without object on callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          property: { name: 'getFullYear', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 30, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-identifier object on callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { type: 'ThisExpression' },
          property: { name: 'getFullYear', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 30, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without property on callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 30, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-identifier property on callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { type: 'Literal', value: 'getFullYear' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 30, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-SpreadElement argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(x);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      const node = {
        arguments: [{ name: 'x', type: 'Identifier' }],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getFullYear', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 30, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('items')], 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle multiple sequential calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('a')]))
      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('b')]))
      visitor.CallExpression(makeDateGetFullYearCall([createSpreadElement('c')]))

      expect(reports.length).toBe(3)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getFullYear', type: 'Identifier' },
          type: 'MemberExpression',
        },
        range: [0, 30],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without type', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetFullYearSpreadRule.create(context)

      expect(() => visitor.CallExpression({ callee: {}, arguments: [] })).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })
})

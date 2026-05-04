import { noUnnecessaryDateGetUTCDaySpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-get-utc-day-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createDateGetUTCDayCall(args: unknown[], line = 1, column = 0): unknown {
  const callEnd = column + 'date.getUTCDay'.length + 5
  return {
    type: 'CallExpression',
    arguments: args,
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: {
        type: 'Identifier',
        name: 'date',
        range: [column, column + 4],
      },
      property: {
        type: 'Identifier',
        name: 'getUTCDay',
        range: [column + 5, column + 14],
      },
      range: [column, column + 14],
    },
    loc: {
      start: { line, column },
      end: { line, column: callEnd },
    },
    range: [column, callEnd],
  }
}

function createSpreadElement(argument: unknown): unknown {
  return {
    type: 'SpreadElement',
    argument,
  }
}

function createIdentifier(name: string): unknown {
  return { type: 'Identifier', name }
}

function createLiteral(value: unknown): unknown {
  return { type: 'Literal', value, raw: String(value) }
}

function createNonDateCall(objectName: string, propertyName: string, args: unknown[] = []): unknown {
  return {
    type: 'CallExpression',
    arguments: args,
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: {
        type: 'Identifier',
        name: objectName,
      },
      property: {
        type: 'Identifier',
        name: propertyName,
      },
    },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 20 },
    },
  }
}

describe('no-unnecessary-date-get-utc-day-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryDateGetUTCDaySpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryDateGetUTCDaySpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryDateGetUTCDaySpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryDateGetUTCDaySpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryDateGetUTCDaySpreadRule.meta.schema).toBeDefined()
    })

    test('should mention spread in description', () => {
      expect(noUnnecessaryDateGetUTCDaySpreadRule.meta.docs?.description.toLowerCase()).toContain('spread')
    })

    test('should mention getUTCDay in description', () => {
      expect(noUnnecessaryDateGetUTCDaySpreadRule.meta.docs?.description).toContain('getUTCDay')
    })

    test('should have docs url defined', () => {
      expect(noUnnecessaryDateGetUTCDaySpreadRule.meta.docs?.url).toBeDefined()
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor1 = noUnnecessaryDateGetUTCDaySpreadRule.create(context)
      const visitor2 = noUnnecessaryDateGetUTCDaySpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('detecting date.getUTCDay(...spread) calls', () => {
    test('should report date.getUTCDay(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toMatch(/unusual/i)
      expect(reports[0].message).toContain('spread')
    })

    test('should report date.getUTCDay(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...args);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('args'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDay(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...arr);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('arr'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDay(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...data);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('data'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDay(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...list);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('list'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDay(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...values);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('values'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDay(...params)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...params);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('params'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDay(...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...rest);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('rest'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDay(...elems)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...elems);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('elems'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDay(...obj)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...obj);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('obj'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDay(...[1, 2, 3])', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...[1, 2, 3]);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      const arrayExpr = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), createLiteral(2), createLiteral(3)],
      }
      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(arrayExpr)]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDay(...(fn()))', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...(fn()));' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      const callExpr = {
        type: 'CallExpression',
        callee: createIdentifier('fn'),
        arguments: [],
      }
      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(callExpr)]))

      expect(reports.length).toBe(1)
    })

    test('should report with message mentioning getUTCDay', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('items'))]))

      expect(reports[0].message).toContain('getUTCDay')
    })

    test('should report with message suggesting direct call', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('items'))]))

      expect(reports[0].message).toContain('directly')
    })

    test('should report with message containing date.getUTCDay()', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('items'))]))

      expect(reports[0].message).toContain('date.getUTCDay()')
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('items'))], 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report date.getUTCDay(...nums)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...nums);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('nums'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDay(...result)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...result);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('result'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDay(...collection)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...collection);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('collection'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDay(...elements)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...elements);' })
      const visitor = noUnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('elements'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDay(...chunks)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...chunks);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('chunks'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDay(...buffer)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...buffer);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('buffer'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDay(...entries)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...entries);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('entries'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDay(...rows)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...rows);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('rows'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDay(...tuple)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...tuple);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('tuple'))]))

      expect(reports.length).toBe(1)
    })

    test('should produce non-empty message', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('items'))]))

      expect(reports[0].message.length).toBeGreaterThan(10)
    })

    test('should produce string message', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('items'))]))

      expect(typeof reports[0].message).toBe('string')
    })
  })

  describe('not reporting valid or non-matching calls', () => {
    test('should not report date.getUTCDay() with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay();' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCDay(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(0);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createLiteral(0)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCDay(...items, extra) with 2 arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...items, extra);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([
        createSpreadElement(createIdentifier('items')),
        createIdentifier('extra'),
      ]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDay(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getDay', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCDate(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getUTCDate', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getUTCHours', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTime(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTime(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getTime', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report d.getUTCDay(...items) with non-date object', () => {
      const { context, reports } = createMockRuleContext({ source: 'd.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('d', 'getUTCDay', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report myDate.getUTCDay(...items) with non-date object', () => {
      const { context, reports } = createMockRuleContext({ source: 'myDate.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('myDate', 'getUTCDay', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report Date.getUTCDay(...items) with capital Date', () => {
      const { context, reports } = createMockRuleContext({ source: 'Date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('Date', 'getUTCDay', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.map(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.map(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('arr', 'map', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getFullYear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getFullYear', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getMonth', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.setDate(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.setDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'setDate', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toISOString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toISOString(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'toISOString', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleDateString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'toLocaleDateString', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.valueOf(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.valueOf(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'valueOf', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toString(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'toString', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toUTCString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toUTCString(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'toUTCString', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toDateString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'toDateString', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getHours', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getMinutes', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getSeconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getSeconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getSeconds', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMilliseconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getMilliseconds', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTimezoneOffset(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getTimezoneOffset', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDate(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getDate', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCFullYear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...items);' })
      const visitor = noUnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getUTCFullYear', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMonth(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getUTCMonth', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.getUTCDay(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('obj', 'getUTCDay', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report fn.getUTCDay(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'fn.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('fn', 'getUTCDay', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report ctx.getUTCDay(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'ctx.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('ctx', 'getUTCDay', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCDay(x) with non-spread argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(x);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createIdentifier('x')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCDay(42) with literal argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(42);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createLiteral(42)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCDay("test") with string argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay("test");' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createLiteral('test')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCDay(null) with null argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(null);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createLiteral(null)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCDay(undefined) with undefined argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(undefined);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createLiteral(undefined, 'undefined')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date["getUTCDay"](...items) with computed access', () => {
      const { context, reports } = createMockRuleContext({ source: 'date["getUTCDay"](...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Literal', value: 'getUTCDay' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Math.max(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.max(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('Math', 'max', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report console.log(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'console.log(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('console', 'log', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report a direct getUTCDay(...items) call', () => {
      const { context, reports } = createMockRuleContext({ source: 'getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'Identifier',
          name: 'getUTCDay',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: { type: 'Identifier', name: 'date' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getUTCDay' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getUTCDay' },
        },
        range: [0, 25],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle number node', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should handle node without property on callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without object on callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          property: { type: 'Identifier', name: 'getUTCDay' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Literal', value: 'getUTCDay' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier object', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'CallExpression', callee: createIdentifier('getDate'), arguments: [] },
          property: { type: 'Identifier', name: 'getUTCDay' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle multiple calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('items'))]))
      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('args'))]))
      visitor.CallExpression(createDateGetUTCDayCall([]))

      expect(reports.length).toBe(2)
    })

    test('should report correct location for matched node', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('items'))], 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle node with non-SpreadElement argument type', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [{ type: 'Literal', value: 42 }],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getUTCDay' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should preserve end location in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDaySpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDayCall([createSpreadElement(createIdentifier('items'))], 3, 7))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(3)
    })
  })
})

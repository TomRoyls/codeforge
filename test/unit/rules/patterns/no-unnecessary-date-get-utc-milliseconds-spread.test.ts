import { noUnnecessaryDateGetUTCMillisecondsSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-get-utc-milliseconds-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createDateGetUTCMillisecondsCall(args: unknown[], line = 1, column = 0): unknown {
  const callEnd = column + 'date.getUTCMilliseconds'.length + 5
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
        name: 'getUTCMilliseconds',
        range: [column + 5, column + 24],
      },
      range: [column, column + 24],
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

function createLiteral(value: unknown, raw?: string): unknown {
  return { type: 'Literal', value, raw: raw ?? String(value) }
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

describe('no-unnecessary-date-get-utc-milliseconds-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryDateGetUTCMillisecondsSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryDateGetUTCMillisecondsSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryDateGetUTCMillisecondsSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryDateGetUTCMillisecondsSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryDateGetUTCMillisecondsSpreadRule.meta.schema).toBeDefined()
    })

    test('should mention spread in description', () => {
      expect(noUnnecessaryDateGetUTCMillisecondsSpreadRule.meta.docs?.description.toLowerCase()).toContain('spread')
    })

    test('should mention getUTCMilliseconds in description', () => {
      expect(noUnnecessaryDateGetUTCMillisecondsSpreadRule.meta.docs?.description).toContain('getUTCMilliseconds')
    })

    test('should have docs url defined', () => {
      expect(noUnnecessaryDateGetUTCMillisecondsSpreadRule.meta.docs?.url).toBeDefined()
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor1 = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)
      const visitor2 = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('detecting date.getUTCMilliseconds(...spread) calls', () => {
    test('should report date.getUTCMilliseconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toMatch(/unusual/i)
      expect(reports[0].message).toContain('spread')
    })

    test('should report date.getUTCMilliseconds(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...args);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('args'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMilliseconds(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...arr);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('arr'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMilliseconds(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...data);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('data'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMilliseconds(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...list);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('list'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMilliseconds(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...values);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('values'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMilliseconds(...params)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...params);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('params'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMilliseconds(...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...rest);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('rest'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMilliseconds(...elems)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...elems);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('elems'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMilliseconds(...obj)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...obj);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('obj'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMilliseconds(...[1, 2, 3])', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...[1, 2, 3]);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      const arrayExpr = {
        type: 'ArrayExpression',
        elements: [createLiteral(1), createLiteral(2), createLiteral(3)],
      }
      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(arrayExpr)]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMilliseconds(...(fn()))', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...(fn()));' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      const callExpr = {
        type: 'CallExpression',
        callee: createIdentifier('fn'),
        arguments: [],
      }
      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(callExpr)]))

      expect(reports.length).toBe(1)
    })

    test('should report with message mentioning getUTCMilliseconds', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('items'))]))

      expect(reports[0].message).toContain('getUTCMilliseconds')
    })

    test('should report with message suggesting direct call', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('items'))]))

      expect(reports[0].message).toContain('directly')
    })

    test('should report with message containing date.getUTCMilliseconds()', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('items'))]))

      expect(reports[0].message).toContain('date.getUTCMilliseconds()')
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('items'))], 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report date.getUTCMilliseconds(...nums)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...nums);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('nums'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMilliseconds(...result)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...result);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('result'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMilliseconds(...collection)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...collection);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('collection'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMilliseconds(...elements)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...elements);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('elements'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMilliseconds(...chunks)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...chunks);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('chunks'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMilliseconds(...buffer)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...buffer);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('buffer'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMilliseconds(...entries)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...entries);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('entries'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMilliseconds(...rows)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...rows);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('rows'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMilliseconds(...tuple)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...tuple);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('tuple'))]))

      expect(reports.length).toBe(1)
    })

    test('should produce non-empty message', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('items'))]))

      expect(reports[0].message.length).toBeGreaterThan(10)
    })

    test('should produce string message', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('items'))]))

      expect(typeof reports[0].message).toBe('string')
    })

    test('should report date.getUTCMilliseconds(...options)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...options);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('options'))]))

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting valid or non-matching calls', () => {
    test('should not report date.getUTCMilliseconds() with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds();' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMilliseconds(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(0);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createLiteral(0)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMilliseconds(...items, extra) with 2 arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items, extra);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([
        createSpreadElement(createIdentifier('items')),
        createIdentifier('extra'),
      ]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMilliseconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getMilliseconds', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCSeconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCSeconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getUTCSeconds', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTime(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTime(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getTime', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report d.getUTCMilliseconds(...items) with non-date object', () => {
      const { context, reports } = createMockRuleContext({ source: 'd.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('d', 'getUTCMilliseconds', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report myDate.getUTCMilliseconds(...items) with non-date object', () => {
      const { context, reports } = createMockRuleContext({ source: 'myDate.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('myDate', 'getUTCMilliseconds', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report Date.getUTCMilliseconds(...items) with capital Date', () => {
      const { context, reports } = createMockRuleContext({ source: 'Date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('Date', 'getUTCMilliseconds', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.map(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.map(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('arr', 'map', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getFullYear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getFullYear', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getMonth', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.setDate(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.setDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'setDate', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toISOString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toISOString(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'toISOString', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleDateString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'toLocaleDateString', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.valueOf(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.valueOf(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'valueOf', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toString(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'toString', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toUTCString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toUTCString(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'toUTCString', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toDateString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'toDateString', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getHours', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getMinutes', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getSeconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getSeconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getSeconds', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getUTCHours', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTimezoneOffset(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getTimezoneOffset', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDate(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getDate', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCFullYear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getUTCFullYear', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMonth(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getUTCMonth', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCDay(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getUTCDay', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCDate(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('date', 'getUTCDate', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.getUTCMilliseconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('obj', 'getUTCMilliseconds', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report fn.getUTCMilliseconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'fn.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('fn', 'getUTCMilliseconds', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report ctx.getUTCMilliseconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'ctx.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('ctx', 'getUTCMilliseconds', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMilliseconds(x) with non-spread argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(x);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createIdentifier('x')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMilliseconds(42) with literal argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(42);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createLiteral(42)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMilliseconds("test") with string argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds("test");' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createLiteral('test')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMilliseconds(null) with null argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(null);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createLiteral(null)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMilliseconds(undefined) with undefined argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(undefined);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createLiteral(undefined, 'undefined')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date["getUTCMilliseconds"](...items) with computed access', () => {
      const { context, reports } = createMockRuleContext({ source: 'date["getUTCMilliseconds"](...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Literal', value: 'getUTCMilliseconds' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Math.max(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.max(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('Math', 'max', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report console.log(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'console.log(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createNonDateCall('console', 'log', [createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

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
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getUTCMilliseconds' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getUTCMilliseconds' },
        },
        range: [0, 35],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle number node', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should handle node without property on callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

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
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          property: { type: 'Identifier', name: 'getUTCMilliseconds' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Literal', value: 'getUTCMilliseconds' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier object', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'CallExpression', callee: createIdentifier('getDate'), arguments: [] },
          property: { type: 'Identifier', name: 'getUTCMilliseconds' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle multiple calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('items'))]))
      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('args'))]))
      visitor.CallExpression(createDateGetUTCMillisecondsCall([]))

      expect(reports.length).toBe(2)
    })

    test('should report correct location for matched node', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('items'))], 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle node with non-SpreadElement argument type', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [{ type: 'Literal', value: 42 }],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getUTCMilliseconds' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should preserve end location in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMillisecondsSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCMillisecondsCall([createSpreadElement(createIdentifier('items'))], 3, 7))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(3)
    })
  })
})

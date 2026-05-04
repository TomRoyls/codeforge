

import { noUnnecessaryDateGetUTCMonthSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-get-utc-month-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createSpreadElement(argumentName: string): unknown {
  return {
    type: 'SpreadElement',
    argument: {
      type: 'Identifier',
      name: argumentName,
    },
  }
}

function createSpreadWithMember(objectName: string, propertyName: string): unknown {
  return {
    type: 'SpreadElement',
    argument: {
      type: 'MemberExpression',
      computed: false,
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: propertyName },
    },
  }
}

function createGetUTCMonthCall(arg: unknown, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: { type: 'Identifier', name: 'date' },
      property: { type: 'Identifier', name: 'getUTCMonth' },
    },
    arguments: [arg],
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
    range: [column, column + 30],
  }
}

function createCallWithObject(objectName: string, arg: unknown): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: 'getUTCMonth' },
    },
    arguments: [arg],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 30 },
    },
    range: [0, 30],
  }
}

function createCallWithMethod(methodName: string, arg: unknown): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: { type: 'Identifier', name: 'date' },
      property: { type: 'Identifier', name: methodName },
    },
    arguments: [arg],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 30 },
    },
    range: [0, 30],
  }
}

describe('no-unnecessary-date-get-utc-month-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryDateGetUTCMonthSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryDateGetUTCMonthSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryDateGetUTCMonthSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryDateGetUTCMonthSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryDateGetUTCMonthSpreadRule.meta.schema).toBeDefined()
    })

    test('should have meta property', () => {
      expect(noUnnecessaryDateGetUTCMonthSpreadRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(noUnnecessaryDateGetUTCMonthSpreadRule).toHaveProperty('create')
    })

    test('should have non-empty description', () => {
      expect(noUnnecessaryDateGetUTCMonthSpreadRule.meta.docs?.description.length).toBeGreaterThan(0)
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detecting date.getUTCMonth(...items) with spread', () => {
    test('should report date.getUTCMonth(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('items')))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toMatch(/unusual/i)
    })

    test('should report date.getUTCMonth(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...args);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('args')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMonth(...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...rest);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('rest')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMonth(...params)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...params);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('params')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMonth(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...data);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('data')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMonth(...options)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...options);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('options')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMonth(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...arr);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('arr')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMonth(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...values);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('values')))

      expect(reports.length).toBe(1)
    })

    test('should report with spread of member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...obj.items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadWithMember('obj', 'items')))

      expect(reports.length).toBe(1)
    })

    test('should report with spread of config.data', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...config.data);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadWithMember('config', 'data')))

      expect(reports.length).toBe(1)
    })

    test('should report with spread of this.items', () => {
      const spread = {
        type: 'SpreadElement',
        argument: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'items' },
        },
      }
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...this.items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(spread))

      expect(reports.length).toBe(1)
    })

    test('should report with spread of nested member obj.nested.items', () => {
      const spread = {
        type: 'SpreadElement',
        argument: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'MemberExpression',
            computed: false,
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'nested' },
          },
          property: { type: 'Identifier', name: 'items' },
        },
      }
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...obj.nested.items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(spread))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMonth(...x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...x);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('x')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMonth(...months)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...months);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('months')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMonth(...spread)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...spread);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('spread')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMonth(...elements)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...elements);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('elements')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMonth(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...list);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('list')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMonth(...payload)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...payload);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('payload')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMonth(...extras)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...extras);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('extras')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMonth(...more)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...more);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('more')))

      expect(reports.length).toBe(1)
    })

    test('should report at correct location line 1', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('items'), 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report at correct location line 5 column 10', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('items'), 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report date.getUTCMonth(...input)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...input);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('input')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMonth(...collection)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...collection);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('collection')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMonth(...chunks)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...chunks);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('chunks')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMonth(...entries)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...entries);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('entries')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMonth(...result)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...result);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('result')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMonth(...buffer)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...buffer);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('buffer')))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCMonth(...nums)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...nums);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('nums')))

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting valid or non-matching calls', () => {
    test('should not report date.getUTCMonth() with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth();' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getUTCMonth' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMonth(0) with literal argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(0);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall({ type: 'Literal', value: 0, raw: '0' }))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMonth(x) with identifier argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(x);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall({ type: 'Identifier', name: 'x' }))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMonth(...items, ...more) with two spreads', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...items, ...more);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getUTCMonth' },
        },
        arguments: [createSpreadElement('items'), createSpreadElement('more')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMonth(...items, 0) with two arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...items, 0);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getUTCMonth' },
        },
        arguments: [createSpreadElement('items'), { type: 'Literal', value: 0, raw: '0' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report other.getUTCMonth(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'other.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createCallWithObject('other', createSpreadElement('items')))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth(...items) with different method', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('getMonth', createSpreadElement('items')))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCFullYear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('getUTCFullYear', createSpreadElement('items')))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCDate(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('getUTCDate', createSpreadElement('items')))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCDay(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('getUTCDay', createSpreadElement('items')))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('getUTCHours', createSpreadElement('items')))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('getUTCMinutes', createSpreadElement('items')))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCSeconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCSeconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('getUTCSeconds', createSpreadElement('items')))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMilliseconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('getUTCMilliseconds', createSpreadElement('items')))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTime(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTime(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('getTime', createSpreadElement('items')))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toString(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('toString', createSpreadElement('items')))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toISOString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toISOString(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('toISOString', createSpreadElement('items')))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleDateString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('toLocaleDateString', createSpreadElement('items')))

      expect(reports.length).toBe(0)
    })

    test('should not report date.setDate(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.setDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('setDate', createSpreadElement('items')))

      expect(reports.length).toBe(0)
    })

    test('should not report date.setMonth(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.setMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('setMonth', createSpreadElement('items')))

      expect(reports.length).toBe(0)
    })

    test('should not report getUTCMonth(...items) direct function call', () => {
      const { context, reports } = createMockRuleContext({ source: 'getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getUTCMonth' },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report date["getUTCMonth"](...items) with computed access', () => {
      const { context, reports } = createMockRuleContext({ source: 'date["getUTCMonth"](...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Literal', value: 'getUTCMonth', raw: '"getUTCMonth"' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report obj.getUTCMonth(...items) with object name obj', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createCallWithObject('obj', createSpreadElement('items')))

      expect(reports.length).toBe(0)
    })

    test('should not report d.getUTCMonth(...items) with object name d', () => {
      const { context, reports } = createMockRuleContext({ source: 'd.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createCallWithObject('d', createSpreadElement('items')))

      expect(reports.length).toBe(0)
    })

    test('should not report myDate.getUTCMonth(...items) with object name myDate', () => {
      const { context, reports } = createMockRuleContext({ source: 'myDate.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createCallWithObject('myDate', createSpreadElement('items')))

      expect(reports.length).toBe(0)
    })

    test('should not report date.valueOf(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.valueOf(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('valueOf', createSpreadElement('items')))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toDateString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('toDateString', createSpreadElement('items')))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toTimeString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('toTimeString', createSpreadElement('items')))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toUTCString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toUTCString(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('toUTCString', createSpreadElement('items')))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toJSON(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('toJSON', createSpreadElement('items')))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTimezoneOffset(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTimezoneOffset(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('getTimezoneOffset', createSpreadElement('items')))

      expect(reports.length).toBe(0)
    })

    test('should not report when object is MemberExpression instead of Identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'foo.bar.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'MemberExpression',
            computed: false,
            object: { type: 'Identifier', name: 'foo' },
            property: { type: 'Identifier', name: 'bar' },
          },
          property: { type: 'Identifier', name: 'getUTCMonth' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMonth(x, y) with two non-spread args', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(x, y);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getUTCMonth' },
        },
        arguments: [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when callee is not MemberExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getUTCMonth' },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when property is not Identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'date["getUTCMonth"](...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Literal', value: 'getUTCMonth' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMonth(num) with single number argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(5);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall({ type: 'Literal', value: 5, raw: '5' }))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMonth("string") with single string argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth("str");' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall({ type: 'Literal', value: 'str', raw: '"str"' }))

      expect(reports.length).toBe(0)
    })

    test('should not report for NewExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new date.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression({
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getUTCMonth' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases and message quality', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      expect(() => visitor.CallExpression()).not.toThrow()
    })

    test('should handle non-object node (string)', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
    })

    test('should handle non-object node (number)', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getUTCMonth' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'getUTCMonth' },
        },
        arguments: [createSpreadElement('items')],
        range: [0, 25],
      })

      expect(reports.length).toBe(1)
    })

    test('should handle multiple calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('items')))
      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('args')))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(2)
    })

    test('should mention spread in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('items')))

      expect(reports[0].message).toMatch(/spread/i)
    })

    test('should mention getUTCMonth in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('items')))

      expect(reports[0].message).toContain('getUTCMonth')
    })

    test('should mention date in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('items')))

      expect(reports[0].message).toContain('date')
    })

    test('should mention unusual in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('items')))

      expect(reports[0].message).toMatch(/unusual/i)
    })

    test('should mention directly in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('items')))

      expect(reports[0].message).toMatch(/directly/i)
    })

    test('should produce non-empty message', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCMonthSpreadRule.create(context)

      visitor.CallExpression(createGetUTCMonthCall(createSpreadElement('items')))

      expect(reports[0].message.length).toBeGreaterThan(10)
    })
  })
})

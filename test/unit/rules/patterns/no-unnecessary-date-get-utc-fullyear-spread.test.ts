

import { noUnnecessaryDateGetUTCFullyearSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-get-utc-fullyear-spread.js'
import { createMockRuleContext } from '../../../helpers/ast-helpers.js'

function createDateGetUTCFullYearSpreadCall(spreadArgName = 'items', line = 1, column = 0): unknown {
  const objectEnd = column + 'date'.length
  const propEnd = objectEnd + '.getUTCFullYear'.length
  const callEnd = propEnd + 4 + spreadArgName.length + 2

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
        name: 'getUTCFullYear',
        type: 'Identifier',
      },
      range: [column, propEnd],
      type: 'MemberExpression',
    },
    loc: {
      end: { column: callEnd, line },
      start: { column, line },
    },
    range: [column, callEnd],
    type: 'CallExpression',
  }
}

function createCallWithMethod(methodName: string, objectName = 'date', args: unknown[] = []): unknown {
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

function createSpreadCallWithObject(objectName: string, spreadArgName = 'items'): unknown {
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
        name: objectName,
        type: 'Identifier',
      },
      property: {
        name: 'getUTCFullYear',
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

function createCallWithArgs(args: unknown[]): unknown {
  return {
    arguments: args,
    callee: {
      computed: false,
      object: {
        name: 'date',
        type: 'Identifier',
      },
      property: {
        name: 'getUTCFullYear',
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

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createIdentifier(name: string): unknown {
  return {
    name,
    type: 'Identifier',
  }
}

describe('no-unnecessary-date-get-utc-fullyear-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryDateGetUTCFullyearSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryDateGetUTCFullyearSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryDateGetUTCFullyearSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryDateGetUTCFullyearSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryDateGetUTCFullyearSpreadRule.meta.schema).toBeDefined()
    })

    test('should have empty schema array', () => {
      expect(noUnnecessaryDateGetUTCFullyearSpreadRule.meta.schema).toEqual([])
    })

    test('should mention getUTCFullYear in description', () => {
      expect(noUnnecessaryDateGetUTCFullyearSpreadRule.meta.docs?.description).toContain('getUTCFullYear')
    })

    test('should have meta property', () => {
      expect(noUnnecessaryDateGetUTCFullyearSpreadRule).toHaveProperty('meta')
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detecting date.getUTCFullYear(...items) with spread', () => {
    test('should report date.getUTCFullYear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('items'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('date.getUTCFullYear(...items)')
      expect(reports[0].message).toContain('single spread')
    })

    test('should report date.getUTCFullYear(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...args);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('args'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCFullYear(...params)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...params);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('params'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCFullYear(...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...rest);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('rest'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCFullYear(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...data);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('data'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCFullYear(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...values);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('values'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCFullYear(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...arr);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('arr'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCFullYear(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...list);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('list'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCFullYear(...opts)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...opts);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('opts'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCFullYear(...options)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...options);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('options'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCFullYear(...input)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...input);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('input'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCFullYear(...extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...extra);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('extra'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCFullYear(...spread)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...spread);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('spread'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCFullYear(...cols)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...cols);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('cols'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCFullYear(...payload)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...payload);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('payload'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCFullYear(...parts)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...parts);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('parts'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCFullYear(...fields)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...fields);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('fields'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCFullYear(...x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...x);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('x'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCFullYear(...elements)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...elements);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('elements'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCFullYear(...chunks)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...chunks);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('chunks'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCFullYear(...pieces)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...pieces);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('pieces'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCFullYear(...segments)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...segments);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('segments'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCFullYear(...theArgs)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...theArgs);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('theArgs'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCFullYear(...more)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...more);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('more'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCFullYear(...remaining)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...remaining);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('remaining'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCFullYear(...all)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...all);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('all'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCFullYear(...restArgs)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...restArgs);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('restArgs'))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCFullYear(...stuff)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...stuff);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('stuff'))

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting valid date.getUTCFullYear() calls', () => {
    test('should not report date.getUTCFullYear()', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear();' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createCallWithArgs([]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCFullYear() with no arguments property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear();' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      const node = {
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getUTCFullYear', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report obj.getUTCFullYear(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createSpreadCallWithObject('obj', 'items'))

      expect(reports.length).toBe(0)
    })

    test('should not report d.getUTCFullYear(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'd.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createSpreadCallWithObject('d', 'items'))

      expect(reports.length).toBe(0)
    })

    test('should not report dt.getUTCFullYear(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'dt.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createSpreadCallWithObject('dt', 'items'))

      expect(reports.length).toBe(0)
    })

    test('should not report time.getUTCFullYear(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'time.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createSpreadCallWithObject('time', 'items'))

      expect(reports.length).toBe(0)
    })

    test('should not report moment.getUTCFullYear(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'moment.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createSpreadCallWithObject('moment', 'items'))

      expect(reports.length).toBe(0)
    })

    test('should not report now.getUTCFullYear(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'now.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createSpreadCallWithObject('now', 'items'))

      expect(reports.length).toBe(0)
    })

    test('should not report timestamp.getUTCFullYear(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'timestamp.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createSpreadCallWithObject('timestamp', 'items'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCFullYear(...items) with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear();' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createCallWithArgs([]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCFullYear(42)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(42);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createCallWithArgs([createLiteral(42)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCFullYear(...items, extra) with multiple args', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...items, extra);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(
        createCallWithArgs([
          { argument: { name: 'items', type: 'Identifier' }, type: 'SpreadElement' },
          createIdentifier('extra'),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCFullYear(first, ...items) with multiple args', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(first, ...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(
        createCallWithArgs([
          createIdentifier('first'),
          { argument: { name: 'items', type: 'Identifier' }, type: 'SpreadElement' },
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('getMonth'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getFullYear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('getFullYear'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTime(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTime(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('getTime'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.setDate(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.setDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('setDate'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.setFullYear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.setFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('setFullYear'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toISOString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toISOString(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('toISOString'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toDateString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('toDateString'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toString(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('toString'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMonth(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('getUTCMonth'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCDate(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('getUTCDate'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('getUTCHours'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('getUTCMinutes'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCSeconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCSeconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('getUTCSeconds'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDay(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('getDay'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getHours(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('getHours'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMinutes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('getMinutes'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getSeconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getSeconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('getSeconds'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMilliseconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('getMilliseconds'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.valueOf(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.valueOf(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('valueOf'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleDateString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('toLocaleDateString'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toUTCString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toUTCString(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('toUTCString'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toJSON(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('toJSON'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMilliseconds(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createCallWithMethod('getUTCMilliseconds'))

      expect(reports.length).toBe(0)
    })

    test('should not report a direct getUTCFullYear() call', () => {
      const { context, reports } = createMockRuleContext({ source: 'getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      const node = {
        arguments: [
          { argument: { name: 'items', type: 'Identifier' }, type: 'SpreadElement' },
        ],
        callee: {
          name: 'getUTCFullYear',
          type: 'Identifier',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee object is a MemberExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'foo.bar.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      const node = {
        arguments: [
          { argument: { name: 'items', type: 'Identifier' }, type: 'SpreadElement' },
        ],
        callee: {
          computed: false,
          object: {
            name: 'foo',
            type: 'Identifier',
          },
          property: {
            name: 'bar',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 30, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting calls with non-identifier object', () => {
    test('should not report when callee object is a CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Date().getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      const node = {
        arguments: [
          { argument: { name: 'items', type: 'Identifier' }, type: 'SpreadElement' },
        ],
        callee: {
          computed: false,
          object: {
            type: 'NewExpression',
          },
          property: {
            name: 'getUTCFullYear',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 30, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting with computed member access', () => {
    test('should not report date["getUTCFullYear"](...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date["getUTCFullYear"](...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      const node = {
        arguments: [
          { argument: { name: 'items', type: 'Identifier' }, type: 'SpreadElement' },
        ],
        callee: {
          computed: true,
          object: {
            name: 'date',
            type: 'Identifier',
          },
          property: {
            type: 'Literal',
            value: 'getUTCFullYear',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 30, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle string node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
    })

    test('should handle number node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should handle boolean node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle empty object node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      const node = {
        arguments: [
          { argument: { name: 'items', type: 'Identifier' }, type: 'SpreadElement' },
        ],
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear();' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      const node = {
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getUTCFullYear', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('items', 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle multiple calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('items'))
      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('args'))
      visitor.CallExpression(createCallWithArgs([]))
      visitor.CallExpression(createCallWithMethod('getFullYear'))

      expect(reports.length).toBe(2)
    })

    test('should handle node with null type', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      const node = {
        type: null,
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      const node = {
        type: 'ArrayExpression',
        elements: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCFullYear(...items);' })
      const visitor1 = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)
      const visitor2 = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should handle callee without object', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      const node = {
        arguments: [
          { argument: { name: 'items', type: 'Identifier' }, type: 'SpreadElement' },
        ],
        callee: {
          property: { name: 'getUTCFullYear', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee without property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      const node = {
        arguments: [
          { argument: { name: 'items', type: 'Identifier' }, type: 'SpreadElement' },
        ],
        callee: {
          object: { name: 'date', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-identifier property in callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      const node = {
        arguments: [
          { argument: { name: 'items', type: 'Identifier' }, type: 'SpreadElement' },
        ],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { type: 'Literal', value: 'getUTCFullYear' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report message mentioning unusual and directly', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCFullyearSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCFullYearSpreadCall('items'))

      expect(reports[0].message).toContain('unusual')
      expect(reports[0].message).toContain('directly')
      expect(reports[0].message).toContain('date.getUTCFullYear')
    })
  })
})

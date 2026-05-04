

import { noUnnecessaryDateToDateStringSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-to-date-string-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function makeDateToDateStringCall(
  objectName: string,
  propertyName: string,
  args: unknown[],
  computed = false,
  line = 1,
  column = 0,
): unknown {
  const objectEnd = column + objectName.length
  const callEnd = objectEnd + '.'.length + propertyName.length + args.length * 3 + 2

  return {
    arguments: args,
    callee: {
      computed,
      object: {
        name: objectName,
        range: [column, objectEnd],
        type: 'Identifier',
      },
      property: {
        name: propertyName,
        type: 'Identifier',
      },
      range: [column, objectEnd + '.'.length + propertyName.length],
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

function createSpreadElement(argument: unknown): unknown {
  return {
    argument,
    type: 'SpreadElement',
  }
}

function createIdentifier(name: string): unknown {
  return {
    name,
    type: 'Identifier',
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

describe('no-unnecessary-date-to-date-string-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryDateToDateStringSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryDateToDateStringSpreadRule.meta.severity).toBe('warn')
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryDateToDateStringSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryDateToDateStringSpreadRule.meta.schema).toBeDefined()
    })

    test('should have meta property', () => {
      expect(noUnnecessaryDateToDateStringSpreadRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(noUnnecessaryDateToDateStringSpreadRule).toHaveProperty('create')
    })

    test('should have docs with url', () => {
      expect(noUnnecessaryDateToDateStringSpreadRule.meta.docs?.url).toBeDefined()
    })

    test('should have non-empty description', () => {
      expect(noUnnecessaryDateToDateStringSpreadRule.meta.docs?.description.length).toBeGreaterThan(0)
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detecting date.toDateString with single spread argument', () => {
    test('should report date.toDateString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(createIdentifier('items'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with correct message mentioning toDateString', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(createIdentifier('items'))]),
      )

      expect(reports[0].message).toContain('toDateString')
    })

    test('should report with correct message mentioning spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(createIdentifier('items'))]),
      )

      expect(reports[0].message).toContain('spread')
    })

    test('should report with correct message suggesting direct call', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(createIdentifier('items'))]),
      )

      expect(reports[0].message).toContain('Consider calling date.toDateString() directly')
    })

    test('should report with loc information', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(createIdentifier('items'))], false, 5, 10),
      )

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start?.line).toBe(5)
      expect(reports[0].loc?.start?.column).toBe(10)
    })

    test('should report date.toDateString(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...arr);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(createIdentifier('arr'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report date.toDateString(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...args);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(createIdentifier('args'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report date.toDateString(...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...rest);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(createIdentifier('rest'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report date.toDateString(...params)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...params);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(createIdentifier('params'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report date.toDateString(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...list);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(createIdentifier('list'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report date.toDateString(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...values);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(createIdentifier('values'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report date.toDateString(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...data);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(createIdentifier('data'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report date.toDateString(...collection)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...collection);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(createIdentifier('collection'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report date.toDateString(...elements)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...elements);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(createIdentifier('elements'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report date.toDateString(...chunks)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...chunks);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(createIdentifier('chunks'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report date.toDateString(...options)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...options);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(createIdentifier('options'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report date.toDateString(...spread)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...spread);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(createIdentifier('spread'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with SpreadElement containing member expression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...obj.items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      const memberExpr = {
        object: { name: 'obj', type: 'Identifier' },
        property: { name: 'items', type: 'Identifier' },
        type: 'MemberExpression',
      }

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(memberExpr)]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with SpreadElement containing call expression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...getItems());' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      const callExpr = {
        arguments: [],
        callee: { name: 'getItems', type: 'Identifier' },
        type: 'CallExpression',
      }

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(callExpr)]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with SpreadElement containing array expression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...[1,2]);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      const arrayExpr = {
        elements: [createLiteral(1), createLiteral(2)],
        type: 'ArrayExpression',
      }

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(arrayExpr)]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with SpreadElement containing object expression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...obj);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      const objectExpr = {
        properties: [],
        type: 'ObjectExpression',
      }

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(objectExpr)]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report at correct line', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(createIdentifier('items'))], false, 8, 4),
      )

      expect(reports[0].loc?.start?.line).toBe(8)
    })

    test('should report at correct column', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(createIdentifier('items'))], false, 1, 15),
      )

      expect(reports[0].loc?.start?.column).toBe(15)
    })

    test('should produce exactly one report per call', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(createIdentifier('items'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report message contains date.toDateString', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(createIdentifier('items'))]),
      )

      expect(reports[0].message).toContain('date.toDateString(...items)')
    })

    test('should report message mentions unusual', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(createIdentifier('items'))]),
      )

      expect(reports[0].message).toMatch(/unusual/i)
    })

    test('should report with SpreadElement containing conditional expression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      const condExpr = {
        alternate: createIdentifier('b'),
        consequent: createIdentifier('a'),
        test: createIdentifier('x'),
        type: 'ConditionalExpression',
      }

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(condExpr)]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with SpreadElement containing binary expression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      const binExpr = {
        left: createIdentifier('a'),
        operator: '+',
        right: createIdentifier('b'),
        type: 'BinaryExpression',
      }

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(binExpr)]),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting valid calls', () => {
    test('should not report with wrong object name myDate', () => {
      const { context, reports } = createMockRuleContext({ source: 'myDate.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('myDate', 'toDateString', [createSpreadElement(createIdentifier('items'))]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with wrong object name d', () => {
      const { context, reports } = createMockRuleContext({ source: 'd.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('d', 'toDateString', [createSpreadElement(createIdentifier('items'))]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with wrong object name Date', () => {
      const { context, reports } = createMockRuleContext({ source: 'Date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('Date', 'toDateString', [createSpreadElement(createIdentifier('items'))]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with wrong object name datetime', () => {
      const { context, reports } = createMockRuleContext({ source: 'datetime.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('datetime', 'toDateString', [createSpreadElement(createIdentifier('items'))]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with wrong property name toString', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toString', [createSpreadElement(createIdentifier('items'))]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with wrong property name toLocaleDateString', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toLocaleDateString', [createSpreadElement(createIdentifier('items'))]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with wrong property name toISOString', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toISOString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toISOString', [createSpreadElement(createIdentifier('items'))]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with wrong property name toUTCString', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toUTCString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toUTCString', [createSpreadElement(createIdentifier('items'))]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with wrong property name toTimeString', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toTimeString', [createSpreadElement(createIdentifier('items'))]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with wrong property name toLocaleTimeString', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleTimeString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toLocaleTimeString', [createSpreadElement(createIdentifier('items'))]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with wrong property name getTime', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTime(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'getTime', [createSpreadElement(createIdentifier('items'))]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString();' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', []),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with regular identifier argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createIdentifier('items')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with literal argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(42);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createLiteral(42)]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with multiple arguments (spread + identifier)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items, extra);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [
          createSpreadElement(createIdentifier('items')),
          createIdentifier('extra'),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with two spread arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...a, ...b);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [
          createSpreadElement(createIdentifier('a')),
          createSpreadElement(createIdentifier('b')),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with three arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(a, b, c);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [
          createIdentifier('a'),
          createIdentifier('b'),
          createIdentifier('c'),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with computed member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'date["toDateString"](...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(createIdentifier('items'))], true),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with non-MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          name: 'toDateString',
          type: 'Identifier',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with non-Identifier object', () => {
      const { context, reports } = createMockRuleContext({ source: 'getDate().toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            arguments: [],
            callee: { name: 'getDate', type: 'Identifier' },
            type: 'CallExpression',
          },
          property: { name: 'toDateString', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with non-Identifier property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date["toDateString"](...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { type: 'Literal', value: 'toDateString' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report arr.toDateString with wrong object', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('arr', 'toDateString', [createSpreadElement(createIdentifier('items'))]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.toISOString with wrong method', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toISOString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toISOString', [createSpreadElement(createIdentifier('items'))]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.toDateString() with no args', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString();' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', []),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.toDateString(arg) with non-spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(arg);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createIdentifier('arg')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.toDateString(arg1, arg2) with multiple', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(a, b);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createIdentifier('a'), createIdentifier('b')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with NewExpression type', () => {
      const { context, reports } = createMockRuleContext({ source: 'new Date();' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'toDateString', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'NewExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with empty arguments array', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString();' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', []),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with non-SpreadElement argument type', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [{ name: 'items', type: 'Identifier' }]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with call expression as callee object', () => {
      const { context, reports } = createMockRuleContext({ source: 'getDate().toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            arguments: [],
            callee: { name: 'getDate', type: 'Identifier' },
            type: 'CallExpression',
          },
          property: { name: 'toDateString', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 25, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.valueOf with wrong method', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.valueOf(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'valueOf', [createSpreadElement(createIdentifier('items'))]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.getFullYear with wrong method', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'getFullYear', [createSpreadElement(createIdentifier('items'))]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth with wrong method', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'getMonth', [createSpreadElement(createIdentifier('items'))]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDate with wrong method', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'getDate', [createSpreadElement(createIdentifier('items'))]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report myDate.toDateString with wrong object', () => {
      const { context, reports } = createMockRuleContext({ source: 'myDate.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('myDate', 'toDateString', [createSpreadElement(createIdentifier('items'))]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with two arguments where first is spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items, extra);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [
          createSpreadElement(createIdentifier('items')),
          createIdentifier('extra'),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report with two arguments where second is spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(first, ...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [
          createIdentifier('first'),
          createSpreadElement(createIdentifier('items')),
        ]),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle string node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      const node = {
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'toDateString', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle node without type', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'toDateString', type: 'Identifier' },
          type: 'MemberExpression',
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee without object', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          property: { name: 'toDateString', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee without property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
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

    test('should handle node with null arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      const node = {
        arguments: null,
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'toDateString', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle multiple calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(createIdentifier('items'))]),
      )
      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toDateString', []),
      )
      visitor.CallExpression(
        makeDateToDateStringCall('myDate', 'toDateString', [createSpreadElement(createIdentifier('items'))]),
      )
      visitor.CallExpression(
        makeDateToDateStringCall('date', 'toISOString', [createSpreadElement(createIdentifier('items'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle nested call expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      const innerCall = makeDateToDateStringCall('date', 'toDateString', [createSpreadElement(createIdentifier('items'))])
      const outerCall = {
        arguments: [innerCall],
        callee: { name: 'console.log', type: 'Identifier' },
        loc: { end: { column: 50, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      visitor.CallExpression(outerCall)
      visitor.CallExpression(innerCall)

      expect(reports.length).toBe(1)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'date', range: [0, 4], type: 'Identifier' },
          property: { name: 'toDateString', type: 'Identifier' },
          type: 'MemberExpression',
        },
        extra: true,
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 20],
        trailingComments: [],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without loc gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'toDateString', type: 'Identifier' },
          type: 'MemberExpression',
        },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })
})

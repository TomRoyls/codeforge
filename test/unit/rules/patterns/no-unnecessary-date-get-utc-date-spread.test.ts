

import { noUnnecessaryDateGetUTCDateSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-get-utc-date-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createDateGetUTCDateCall(args: unknown[], line = 1, column = 0): unknown {
  const objectEnd = column + 'date'.length
  const callEnd = objectEnd + '.getUTCDate'.length + args.length * 3 + 2

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
        name: 'getUTCDate',
        type: 'Identifier',
      },
      range: [column, objectEnd + '.getUTCDate'.length],
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
    raw: String(value),
    type: 'Literal',
    value,
  }
}

function createCallWithWrongObject(objectName: string): unknown {
  return {
    arguments: [createSpreadElement(createIdentifier('items'))],
    callee: {
      computed: false,
      object: {
        name: objectName,
        type: 'Identifier',
      },
      property: {
        name: 'getUTCDate',
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

function createCallWithWrongProperty(propertyName: string): unknown {
  return {
    arguments: [createSpreadElement(createIdentifier('items'))],
    callee: {
      computed: false,
      object: {
        name: 'date',
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
    type: 'CallExpression',
  }
}

describe('no-unnecessary-date-get-utc-date-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryDateGetUTCDateSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryDateGetUTCDateSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryDateGetUTCDateSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryDateGetUTCDateSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryDateGetUTCDateSpreadRule.meta.schema).toBeDefined()
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryDateGetUTCDateSpreadRule.meta.schema).toEqual([])
    })

    test('should mention getUTCDate in description', () => {
      expect(noUnnecessaryDateGetUTCDateSpreadRule.meta.docs?.description).toContain('getUTCDate')
    })

    test('should mention spread in description', () => {
      expect(noUnnecessaryDateGetUTCDateSpreadRule.meta.docs?.description.toLowerCase()).toContain('spread')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'date.getUTCDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detecting date.getUTCDate with spread argument', () => {
    test('should report date.getUTCDate(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toMatch(/spread/i)
      expect(reports[0].message).toContain('getUTCDate')
    })

    test('should report date.getUTCDate(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...arr);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('arr'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDate(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...args);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('args'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDate(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...data);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('data'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDate(...params)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...params);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('params'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDate(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...values);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('values'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDate(...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...rest);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('rest'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDate(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...list);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('list'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDate(...[1, 2, 3])', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...[1, 2, 3]);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      const arrayExpr = {
        elements: [createLiteral(1), createLiteral(2), createLiteral(3)],
        type: 'ArrayExpression',
      }
      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(arrayExpr)]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDate(...obj)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...obj);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('obj'))]))

      expect(reports.length).toBe(1)
    })

    test('should report message about unusual spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('items'))]))

      expect(reports[0].message).toMatch(/unusual/i)
    })

    test('should report message suggesting direct call', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('items'))]))

      expect(reports[0].message).toMatch(/directly/i)
    })

    test('should report with correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('items'))], 5, 10))

      expect(reports[0].loc).toBeDefined()
    })

    test('should report date.getUTCDate(...nums)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...nums);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('nums'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDate(...extras)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...extras);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('extras'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDate(...options)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...options);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('options'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDate(...parts)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...parts);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('parts'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDate(...stuff)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...stuff);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('stuff'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDate(...more)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...more);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('more'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDate(...result)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...result);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('result'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDate(...elements)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...elements);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('elements'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDate(...buffer)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...buffer);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('buffer'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDate(...chunks)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...chunks);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('chunks'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDate(...output)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...output);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('output'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDate(...input)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...input);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('input'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDate(...payload)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...payload);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('payload'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDate(...config)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...config);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('config'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDate(...source)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...source);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('source'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDate(...target)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...target);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('target'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.getUTCDate(...inputData)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...inputData);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('inputData'))]))

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting for non-matching patterns', () => {
    test('should not report date.getUTCDate() with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate();' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCDate(1) with regular argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(1);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createLiteral(1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.getUTCDate(...items) with wrong object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.getUTCDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createCallWithWrongObject('arr'))

      expect(reports.length).toBe(0)
    })

    test('should not report myDate.getUTCDate(...items) with wrong object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'myDate.getUTCDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createCallWithWrongObject('myDate'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getMonth(...items) with wrong property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createCallWithWrongProperty('getMonth'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCFullYear(...items) with wrong property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCFullYear(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createCallWithWrongProperty('getUTCFullYear'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMonth(...items) with wrong property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMonth(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createCallWithWrongProperty('getUTCMonth'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTime(...items) with wrong property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTime(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createCallWithWrongProperty('getTime'))

      expect(reports.length).toBe(0)
    })

    test('should not report for non-CallExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression({ type: 'Identifier', name: 'foo' })

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCDate(x, y) with multiple non-spread arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(x, y);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createIdentifier('x'), createIdentifier('y')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCDate(...items, ...more) with multiple spread arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...items, ...more);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([
        createSpreadElement(createIdentifier('items')),
        createSpreadElement(createIdentifier('more')),
      ]))

      expect(reports.length).toBe(0)
    })

    test('should not report for computed member expression date["getUTCDate"](...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date["getUTCDate"](...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: true,
          object: {
            name: 'date',
            type: 'Identifier',
          },
          property: {
            type: 'Literal',
            value: 'getUTCDate',
          },
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

    test('should not report for non-Identifier object', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.date.getUTCDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            type: 'MemberExpression',
            object: { name: 'obj', type: 'Identifier' },
            property: { name: 'date', type: 'Identifier' },
          },
          property: {
            name: 'getUTCDate',
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

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for non-Identifier property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date[fn](...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: true,
          object: {
            name: 'date',
            type: 'Identifier',
          },
          property: {
            type: 'Identifier',
            name: 'fn',
          },
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

    test('should not report time.getUTCDate(...items) with wrong object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'time.getUTCDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createCallWithWrongObject('time'))

      expect(reports.length).toBe(0)
    })

    test('should not report d.getUTCDate(...items) with wrong object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'd.getUTCDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createCallWithWrongObject('d'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.setDate(...items) with wrong property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.setDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createCallWithWrongProperty('setDate'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toISOString(...items) with wrong property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toISOString(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createCallWithWrongProperty('toISOString'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toString(...items) with wrong property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toString(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createCallWithWrongProperty('toString'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.valueOf(...items) with wrong property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.valueOf(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createCallWithWrongProperty('valueOf'))

      expect(reports.length).toBe(0)
    })

    test('should not report for null node', () => {
      const { context, reports } = createMockRuleContext({ source: 'null' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(null)

      expect(reports.length).toBe(0)
    })

    test('should not report for undefined node', () => {
      const { context, reports } = createMockRuleContext({ source: 'undefined' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCDate(items) without spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createIdentifier('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCDate(42) with literal argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(42);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createLiteral(42)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCDate("test") with string literal argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate("test");' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createLiteral('test')]))

      expect(reports.length).toBe(0)
    })

    test('should not report now.getUTCDate(...items) with wrong object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'now.getUTCDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createCallWithWrongObject('now'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getDate(...items) with wrong property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createCallWithWrongProperty('getDate'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCDay(...items) with wrong property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDay(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createCallWithWrongProperty('getUTCDay'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCHours(...items) with wrong property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCHours(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createCallWithWrongProperty('getUTCHours'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.foo(...items) with wrong property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.foo(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createCallWithWrongProperty('foo'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMinutes(...items) with wrong property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMinutes(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createCallWithWrongProperty('getUTCMinutes'))

      expect(reports.length).toBe(0)
    })

    test('should not report timestamp.getUTCDate(...items) with wrong object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'timestamp.getUTCDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createCallWithWrongObject('timestamp'))

      expect(reports.length).toBe(0)
    })

    test('should not report moment.getUTCDate(...items) with wrong object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'moment.getUTCDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createCallWithWrongObject('moment'))

      expect(reports.length).toBe(0)
    })

    test('should not report today.getUTCDate(...items) with wrong object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'today.getUTCDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createCallWithWrongObject('today'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCSeconds(...items) with wrong property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCSeconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createCallWithWrongProperty('getUTCSeconds'))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getUTCMilliseconds(...items) with wrong property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCMilliseconds(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createCallWithWrongProperty('getUTCMilliseconds'))

      expect(reports.length).toBe(0)
    })

    test('should not report for node with missing callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report for node with missing arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression({
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getUTCDate', type: 'Identifier' },
          type: 'MemberExpression',
        },
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle node without type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression({})

      expect(reports.length).toBe(0)
    })

    test('should handle spread of a function call', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...getItems());' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      const fnCall = {
        arguments: [],
        callee: { name: 'getItems', type: 'Identifier' },
        type: 'CallExpression',
      }
      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(fnCall)]))

      expect(reports.length).toBe(1)
    })

    test('should handle spread of a member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...obj.items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      const memberExpr = {
        computed: false,
        object: { name: 'obj', type: 'Identifier' },
        property: { name: 'items', type: 'Identifier' },
        type: 'MemberExpression',
      }
      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(memberExpr)]))

      expect(reports.length).toBe(1)
    })

    test('should report only once per call', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(1)
    })

    test('should handle multiple sequential calls independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('items'))]))
      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('more'))]))

      expect(reports.length).toBe(2)
    })

    test('should handle spread of conditional expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...(x ? a : b));' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      const condExpr = {
        alternate: createIdentifier('b'),
        consequent: createIdentifier('a'),
        test: createIdentifier('x'),
        type: 'ConditionalExpression',
      }
      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(condExpr)]))

      expect(reports.length).toBe(1)
    })

    test('should handle spread of an arrow function body', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...(() => items));' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      const arrowFn = {
        body: createIdentifier('items'),
        params: [],
        type: 'ArrowFunctionExpression',
      }
      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(arrowFn)]))

      expect(reports.length).toBe(1)
    })

    test('should handle spread of a template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...`items`);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      const templateLit = {
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: { cooked: 'items', raw: 'items' } }],
        type: 'TemplateLiteral',
      }
      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(templateLit)]))

      expect(reports.length).toBe(1)
    })

    test('should handle call on different lines', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...items);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(createIdentifier('items'))], 10, 5))

      expect(reports.length).toBe(1)
    })

    test('should handle spread of a logical expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...(a && b));' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      const logicalExpr = {
        left: createIdentifier('a'),
        operator: '&&',
        right: createIdentifier('b'),
        type: 'LogicalExpression',
      }
      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(logicalExpr)]))

      expect(reports.length).toBe(1)
    })

    test('should handle spread of a binary expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...(a + b));' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      const binaryExpr = {
        left: createIdentifier('a'),
        operator: '+',
        right: createIdentifier('b'),
        type: 'BinaryExpression',
      }
      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(binaryExpr)]))

      expect(reports.length).toBe(1)
    })

    test('should handle spread of a new expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...(new Items()));' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      const newExpr = {
        arguments: [],
        callee: { name: 'Items', type: 'Identifier' },
        type: 'NewExpression',
      }
      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(newExpr)]))

      expect(reports.length).toBe(1)
    })

    test('should handle spread of a parenthesized expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...(items));' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      const parenExpr = {
        expression: createIdentifier('items'),
        type: 'ParenthesizedExpression',
      }
      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(parenExpr)]))

      expect(reports.length).toBe(1)
    })

    test('should handle spread of await expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...(await items));' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      const awaitExpr = {
        argument: createIdentifier('items'),
        type: 'AwaitExpression',
      }
      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(awaitExpr)]))

      expect(reports.length).toBe(1)
    })

    test('should handle spread of yield expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...(yield items));' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      const yieldExpr = {
        argument: createIdentifier('items'),
        type: 'YieldExpression',
      }
      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(yieldExpr)]))

      expect(reports.length).toBe(1)
    })

    test('should handle spread of a tagged template expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...tag`items`);' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      const taggedTpl = {
        quasi: {
          expressions: [],
          quasis: [{ type: 'TemplateElement', value: { cooked: 'items', raw: 'items' } }],
          type: 'TemplateLiteral',
        },
        tag: createIdentifier('tag'),
        type: 'TaggedTemplateExpression',
      }
      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(taggedTpl)]))

      expect(reports.length).toBe(1)
    })

    test('should handle spread of a sequence expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getUTCDate(...(a, b));' })
      const visitor = noUnnecessaryDateGetUTCDateSpreadRule.create(context)

      const seqExpr = {
        expressions: [createIdentifier('a'), createIdentifier('b')],
        type: 'SequenceExpression',
      }
      visitor.CallExpression(createDateGetUTCDateCall([createSpreadElement(seqExpr)]))

      expect(reports.length).toBe(1)
    })
  })
})



import { noUnnecessaryDateToLocaleDateStringSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-to-locale-date-string-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createSpreadElement(argument: unknown): unknown {
  return {
    type: 'SpreadElement',
    argument,
  }
}

function createDateToLocaleDateStringCall(args: unknown[], line = 1, column = 0): unknown {
  const callEnd = column + 'date.toLocaleDateString'.length + args.length * 3 + 2
  return {
    arguments: args,
    callee: {
      computed: false,
      object: {
        name: 'date',
        range: [column, column + 'date'.length],
        type: 'Identifier',
      },
      property: {
        name: 'toLocaleDateString',
        type: 'Identifier',
      },
      range: [column, column + 'date.toLocaleDateString'.length],
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

function createIdentifierArg(name: string): unknown {
  return { name, type: 'Identifier' }
}

function createLiteralArg(value: unknown): unknown {
  return { type: 'Literal', value }
}

describe('no-unnecessary-date-to-locale-date-string-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryDateToLocaleDateStringSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryDateToLocaleDateStringSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryDateToLocaleDateStringSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryDateToLocaleDateStringSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryDateToLocaleDateStringSpreadRule.meta.schema).toBeDefined()
    })

    test('should mention toLocaleDateString in description', () => {
      expect(noUnnecessaryDateToLocaleDateStringSpreadRule.meta.docs?.description).toContain('toLocaleDateString')
    })

    test('should mention spread in description', () => {
      expect(noUnnecessaryDateToLocaleDateStringSpreadRule.meta.docs?.description.toLowerCase()).toContain('spread')
    })

    test('should have meta property', () => {
      expect(noUnnecessaryDateToLocaleDateStringSpreadRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(noUnnecessaryDateToLocaleDateStringSpreadRule).toHaveProperty('create')
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detecting date.toLocaleDateString(...items) with single spread', () => {
    test('should report date.toLocaleDateString(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('items'))]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toMatch(/unusual spread/i)
    })

    test('should report date.toLocaleDateString(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...args);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('args'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleDateString(...options)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...options);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('options'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleDateString(...params)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...params);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('params'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleDateString(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...arr);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('arr'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleDateString(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...data);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('data'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleDateString(...config)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...config);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('config'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleDateString(...localeArgs)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...localeArgs);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('localeArgs'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleDateString(...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...rest);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('rest'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleDateString(...localeOptions)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...localeOptions);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('localeOptions'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleDateString(...parts)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...parts);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('parts'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleDateString(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...values);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('values'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleDateString(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...list);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('list'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleDateString(...input)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...input);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('input'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleDateString(...payload)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...payload);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('payload'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleDateString(...cfg)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...cfg);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('cfg'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleDateString(...all)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...all);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('all'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleDateString(...theArgs)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...theArgs);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('theArgs'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleDateString(...locales)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...locales);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('locales'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleDateString(...extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...extra);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('extra'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleDateString(...x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...x);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('x'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleDateString(...a)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...a);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('a'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleDateString(...result)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...result);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('result'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleDateString(...obj)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...obj);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('obj'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleDateString(...opts)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...opts);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('opts'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleDateString(...tuple)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...tuple);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('tuple'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleDateString(...stuff)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...stuff);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('stuff'))]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toLocaleDateString(...more)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...more);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('more'))]))

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting valid or non-matching calls', () => {
    test('should not report date.toLocaleDateString() with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString();' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleDateString("en-US") with string argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString("en-US");' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createLiteralArg('en-US')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleDateString(locale) with identifier argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(locale);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createIdentifierArg('locale')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleDateString("en-US", options) with two arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString("en-US", options);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createLiteralArg('en-US'), createIdentifierArg('options')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleDateString(...items, extra) with two arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...items, extra);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('items')), createIdentifierArg('extra')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleDateString(locale, ...opts) with two arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(locale, ...opts);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createIdentifierArg('locale'), createSpreadElement(createIdentifierArg('opts'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleDateString(undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(undefined);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createLiteralArg(undefined)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleDateString(null)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(null);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createLiteralArg(null)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleDateString("de-DE", { timeZone: "UTC" }) with object options', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString("de-DE", { timeZone: "UTC" });' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      const optionsObj = { type: 'ObjectExpression', properties: [] }
      visitor.CallExpression(createDateToLocaleDateStringCall([createLiteralArg('de-DE'), optionsObj]))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.toLocaleDateString(...items) with wrong object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifierArg('items'))],
        callee: {
          computed: false,
          object: { name: 'obj', type: 'Identifier' },
          property: { name: 'toLocaleDateString', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report d.toLocaleDateString(...items) with wrong object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'd.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifierArg('items'))],
        callee: {
          computed: false,
          object: { name: 'd', type: 'Identifier' },
          property: { name: 'toLocaleDateString', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.toString(...items) with wrong method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifierArg('items'))],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'toString', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 30, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.toISOString(...items) with wrong method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toISOString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifierArg('items'))],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'toISOString', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 35, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleTimeString(...items) with wrong method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleTimeString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifierArg('items'))],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'toLocaleTimeString', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 45, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date["toLocaleDateString"](...items) with computed property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date["toLocaleDateString"](...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifierArg('items'))],
        callee: {
          computed: true,
          object: { name: 'date', type: 'Identifier' },
          property: { type: 'Literal', value: 'toLocaleDateString' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 50, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleDateString(...items, ...more) with two spread arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...items, ...more);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('items')), createSpreadElement(createIdentifierArg('more'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleDateString(...items, "en-US") with two arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...items, "en-US");' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('items')), createLiteralArg('en-US')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleDateString(0) with numeric argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(0);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createLiteralArg(0)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleDateString(true) with boolean argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(true);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createLiteralArg(true)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTime() with different method', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTime();' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      const node = {
        arguments: [],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getTime', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 15, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.getFullYear() with different method', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear();' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      const node = {
        arguments: [],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'getFullYear', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.setDate(...items) with different method', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.setDate(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifierArg('items'))],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'setDate', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 30, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report myDate.toLocaleDateString(...items) with wrong object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'myDate.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifierArg('items'))],
        callee: {
          computed: false,
          object: { name: 'myDate', type: 'Identifier' },
          property: { name: 'toLocaleDateString', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 50, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report timestamp.toLocaleDateString(...items) with wrong object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'timestamp.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifierArg('items'))],
        callee: {
          computed: false,
          object: { name: 'timestamp', type: 'Identifier' },
          property: { name: 'toLocaleDateString', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 55, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report a direct toLocaleDateString(...items) call without object', () => {
      const { context, reports } = createMockRuleContext({ source: 'toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifierArg('items'))],
        callee: {
          name: 'toLocaleDateString',
          type: 'Identifier',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleDateString(localeArg) with plain identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(localeArg);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createIdentifierArg('localeArg')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleDateString(opt) with plain identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(opt);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createIdentifierArg('opt')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleDateString("fr") with string', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString("fr");' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createLiteralArg('fr')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleDateString("ja-JP") with string', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString("ja-JP");' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createLiteralArg('ja-JP')]))

      expect(reports.length).toBe(0)
    })

    test('should not report newDate.toLocaleDateString(...items) with wrong object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'newDate.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifierArg('items'))],
        callee: {
          computed: false,
          object: { name: 'newDate', type: 'Identifier' },
          property: { name: 'toLocaleDateString', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 50, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Date.toLocaleDateString(...items) with wrong object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'Date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifierArg('items'))],
        callee: {
          computed: false,
          object: { name: 'Date', type: 'Identifier' },
          property: { name: 'toLocaleDateString', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 50, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      expect(() => visitor.CallExpression()).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifierArg('items'))],
        loc: { end: { column: 50, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifierArg('items'))],
        callee: {
          name: 'toLocaleDateString',
          type: 'Identifier',
        },
        loc: { end: { column: 50, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without property on callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifierArg('items'))],
        callee: {
          object: { name: 'date', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 50, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-identifier property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifierArg('items'))],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { type: 'Literal', value: 'toLocaleDateString' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 50, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments array', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      const node = {
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'toLocaleDateString', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 50, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle number node', () => {
      const { context } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should handle node without object on callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifierArg('items'))],
        callee: {
          property: { name: 'toLocaleDateString', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 50, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-identifier object on callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifierArg('items'))],
        callee: {
          computed: false,
          object: { type: 'CallExpression', callee: { name: 'getDate', type: 'Identifier' }, arguments: [] },
          property: { name: 'toLocaleDateString', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 50, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-SpreadElement argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(locale);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createIdentifierArg('locale')]))

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('items'))], 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle multiple calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('items'))]))
      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('args'))]))
      visitor.CallExpression(createDateToLocaleDateStringCall([createIdentifierArg('locale')]))
      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('opts'))]))

      expect(reports.length).toBe(3)
    })
  })

  describe('message quality', () => {
    test('should mention unusual spread in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('items'))]))

      expect(reports[0].message).toMatch(/unusual spread/i)
    })

    test('should mention toLocaleDateString in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('items'))]))

      expect(reports[0].message).toContain('toLocaleDateString')
    })

    test('should suggest passing arguments directly', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('items'))]))

      expect(reports[0].message).toMatch(/directly/i)
    })

    test('should produce non-empty messages', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('items'))]))

      expect(reports[0].message.length).toBeGreaterThan(10)
    })

    test('should have consistent message across different spread arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('items'))]))
      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('args'))]))
      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('opts'))]))

      expect(reports[0].message).toBe(reports[1].message)
      expect(reports[1].message).toBe(reports[2].message)
    })

    test('should mention date in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      visitor.CallExpression(createDateToLocaleDateStringCall([createSpreadElement(createIdentifierArg('items'))]))

      expect(reports[0].message).toContain('date')
    })

    test('should have docs url defined', () => {
      expect(noUnnecessaryDateToLocaleDateStringSpreadRule.meta.docs?.url).toBeDefined()
    })

    test('should have non-empty description', () => {
      expect(noUnnecessaryDateToLocaleDateStringSpreadRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have empty schema array', () => {
      expect(noUnnecessaryDateToLocaleDateStringSpreadRule.meta.schema).toEqual([])
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockRuleContext({ source: 'date.toLocaleDateString(...items);' })
      const visitor1 = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)
      const visitor2 = noUnnecessaryDateToLocaleDateStringSpreadRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })
  })
})

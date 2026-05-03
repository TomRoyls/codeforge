
import { noUnnecessaryReflectDefinePropertiesSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-reflect-define-properties-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createReflectDefinePropertiesCall(args: unknown[], line = 1, column = 0): unknown {
  return {
    arguments: args,
    callee: {
      computed: false,
      object: {
        name: 'Reflect',
        type: 'Identifier',
      },
      property: {
        name: 'defineProperties',
        type: 'Identifier',
      },
      type: 'MemberExpression',
    },
    loc: {
      end: { column: column + 40, line },
      start: { column, line },
    },
    range: [column, column + 40],
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

describe('no-unnecessary-reflect-define-properties-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryReflectDefinePropertiesSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryReflectDefinePropertiesSpreadRule.meta.severity).toBe('warn')
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryReflectDefinePropertiesSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryReflectDefinePropertiesSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have truthy description', () => {
      expect(noUnnecessaryReflectDefinePropertiesSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should mention Reflect.defineProperties in description', () => {
      expect(
        noUnnecessaryReflectDefinePropertiesSpreadRule.meta.docs?.description,
      ).toContain('Reflect.defineProperties')
    })

    test('should have docs url', () => {
      expect(noUnnecessaryReflectDefinePropertiesSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-reflect-define-properties-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryReflectDefinePropertiesSpreadRule.meta.schema).toEqual([])
    })
  })

  describe('structure', () => {
    test('should return visitor with CallExpression from create()', () => {
      const { context } = createMockRuleContext({ source: 'Reflect.defineProperties(...items);' })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should have default export matching named export', () => {
      const defaultExport = noUnnecessaryReflectDefinePropertiesSpreadRule
      expect(defaultExport).toBe(noUnnecessaryReflectDefinePropertiesSpreadRule)
    })
  })

  describe('positive cases - reports Reflect.defineProperties with spread', () => {
    test('should report Reflect.defineProperties(...items)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('items'))]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Reflect.defineProperties')
      expect(reports[0].message).toContain('spread')
    })

    test('should report Reflect.defineProperties(...arr)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...arr);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('arr'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Reflect.defineProperties(...data)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...data);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('data'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Reflect.defineProperties(...obj)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...obj);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('obj'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Reflect.defineProperties(...props)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...props);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('props'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Reflect.defineProperties(...args)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...args);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('args'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Reflect.defineProperties(...result)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...result);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('result'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Reflect.defineProperties(...list)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...list);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('list'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Reflect.defineProperties(...values)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...values);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('values'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Reflect.defineProperties(...entries)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...entries);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('entries'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Reflect.defineProperties(...config)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...config);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('config'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Reflect.defineProperties(...descriptor)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...descriptor);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('descriptor'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Reflect.defineProperties(...descriptors)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...descriptors);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('descriptors'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Reflect.defineProperties(...target)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...target);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('target'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Reflect.defineProperties(...source)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...source);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('source'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Reflect.defineProperties(...map)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...map);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('map'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Reflect.defineProperties(...defs)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...defs);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('defs'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Reflect.defineProperties(...properties)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...properties);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('properties'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Reflect.defineProperties(...pairs)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...pairs);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('pairs'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Reflect.defineProperties(...input)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...input);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('input'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Reflect.defineProperties(...payload)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...payload);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('payload'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Reflect.defineProperties(...output)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...output);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('output'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Reflect.defineProperties(...options)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...options);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('options'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Reflect.defineProperties(...attrs)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...attrs);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('attrs'))]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with spread of member expression argument', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...foo.bar);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([
          createSpreadElement({
            object: { name: 'foo', type: 'Identifier' },
            property: { name: 'bar', type: 'Identifier' },
            type: 'MemberExpression',
          }),
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with spread of call expression argument', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...getProps());',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([
          createSpreadElement({
            arguments: [],
            callee: { name: 'getProps', type: 'Identifier' },
            type: 'CallExpression',
          }),
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with spread of array expression argument', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...[a, b]);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([
          createSpreadElement({ elements: [], type: 'ArrayExpression' }),
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report with spread of conditional expression argument', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...(cond ? a : b));',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([
          createSpreadElement({
            alternate: { type: 'Identifier', name: 'b' },
            consequent: { type: 'Identifier', name: 'a' },
            test: { type: 'Identifier', name: 'cond' },
            type: 'ConditionalExpression',
          }),
        ]),
      )

      expect(reports.length).toBe(1)
    })

  })

  describe('negative cases - does not report', () => {
    test('should not report Reflect.defineProperty(...items) (different method)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperty(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'Reflect', type: 'Identifier' },
          property: { name: 'defineProperty', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.apply(...items) (different method)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.apply(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'Reflect', type: 'Identifier' },
          property: { name: 'apply', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 30, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 30],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report Object.defineProperties(...items) (wrong object)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Object.defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'Object', type: 'Identifier' },
          property: { name: 'defineProperties', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.defineProperties(target, props) (two args, no spread)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(target, props);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([
          createIdentifier('target'),
          createIdentifier('props'),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.defineProperties() (no args)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties();',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(createReflectDefinePropertiesCall([]))

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.defineProperties(target) (one non-spread arg)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(target);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createIdentifier('target')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.defineProperties(target, ...props) (spread in second arg)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(target, ...props);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([
          createIdentifier('target'),
          createSpreadElement(createIdentifier('props')),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.defineProperties(...items, extra) (two args)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...items, extra);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([
          createSpreadElement(createIdentifier('items')),
          createIdentifier('extra'),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report computed member expression Reflect["defineProperties"](...items)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect["defineProperties"](...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: true,
          object: { name: 'Reflect', type: 'Identifier' },
          property: { type: 'Literal', value: 'defineProperties' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 45, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 45],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when object is not an Identifier', () => {
      const { context, reports } = createMockRuleContext({
        source: 'getReflect().defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            arguments: [],
            callee: { name: 'getReflect', type: 'Identifier' },
            type: 'CallExpression',
          },
          property: { name: 'defineProperties', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 50, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 50],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when property is not an Identifier', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect[variable](...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: true,
          object: { name: 'Reflect', type: 'Identifier' },
          property: { name: 'variable', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 35, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 35],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report non-MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext({
        source: 'defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: { name: 'defineProperties', type: 'Identifier' },
        loc: { end: { column: 30, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 30],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.get(...items) (wrong method)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.get(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'Reflect', type: 'Identifier' },
          property: { name: 'get', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 25, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 25],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.set(...items) (wrong method)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.set(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'Reflect', type: 'Identifier' },
          property: { name: 'set', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 25, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 25],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.has(...items) (wrong method)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.has(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'Reflect', type: 'Identifier' },
          property: { name: 'has', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 25, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 25],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.deleteProperty(...items) (wrong method)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.deleteProperty(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'Reflect', type: 'Identifier' },
          property: { name: 'deleteProperty', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.construct(...items) (wrong method)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.construct(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'Reflect', type: 'Identifier' },
          property: { name: 'construct', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 38, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 38],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.getPrototypeOf(...items) (wrong method)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getPrototypeOf(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'Reflect', type: 'Identifier' },
          property: { name: 'getPrototypeOf', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 45, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 45],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.ownKeys(...items) (wrong method)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.ownKeys(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'Reflect', type: 'Identifier' },
          property: { name: 'ownKeys', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 32, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 32],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.getOwnPropertyDescriptor(...items) (wrong method)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.getOwnPropertyDescriptor(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'Reflect', type: 'Identifier' },
          property: { name: 'getOwnPropertyDescriptor', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 55, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 55],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report console.defineProperties(...items) (wrong object)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'console.defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'console', type: 'Identifier' },
          property: { name: 'defineProperties', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 42, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 42],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report foo.defineProperties(...items) (wrong object)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'foo.defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'foo', type: 'Identifier' },
          property: { name: 'defineProperties', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 36, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 36],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.defineProperties({}) (object literal arg, no spread)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties({});',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([{ properties: [], type: 'ObjectExpression' }]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.defineProperties(null) (null arg)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(null);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([{ raw: 'null', type: 'Literal', value: null }]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.defineProperties(obj) (identifier arg)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(obj);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createIdentifier('obj')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.defineProperties(target, {}, extra) (three args)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(target, {}, extra);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([
          createIdentifier('target'),
          { properties: [], type: 'ObjectExpression' },
          createIdentifier('extra'),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report non-CallExpression node type', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'Reflect', type: 'Identifier' },
          property: { name: 'defineProperties', type: 'Identifier' },
          type: 'MemberExpression',
        },
        type: 'ExpressionStatement',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.preventExtensions(...items) (wrong method)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.preventExtensions(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'Reflect', type: 'Identifier' },
          property: { name: 'preventExtensions', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 45, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 45],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.isExtensible(...items) (wrong method)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.isExtensible(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'Reflect', type: 'Identifier' },
          property: { name: 'isExtensible', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 37, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 37],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report Math.defineProperties(...items) (wrong object)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Math.defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'Math', type: 'Identifier' },
          property: { name: 'defineProperties', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 38, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 38],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.defineProperties with undefined arg (not spread)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(undefined);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([
          { name: 'undefined', type: 'Identifier' },
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.defineProperties(...items, ...more) (two spread args)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...items, ...more);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([
          createSpreadElement(createIdentifier('items')),
          createSpreadElement(createIdentifier('more')),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.defineProperties(...items) with wrong object name Reflected', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflected.defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'Reflected', type: 'Identifier' },
          property: { name: 'defineProperties', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 42, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 42],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report Array.defineProperties(...items) (wrong object)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Array.defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'Array', type: 'Identifier' },
          property: { name: 'defineProperties', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report Promise.defineProperties(...items) (wrong object)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Promise.defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'Promise', type: 'Identifier' },
          property: { name: 'defineProperties', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 42, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 42],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.defineProperties(this, props) (correct usage)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(this, props);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([
          { type: 'ThisExpression' },
          createIdentifier('props'),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.defineProperties(obj, descriptors) (correct usage)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(obj, descriptors);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([
          createIdentifier('obj'),
          createIdentifier('descriptors'),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report JSON.defineProperties(...items) (wrong object)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'JSON.defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'JSON', type: 'Identifier' },
          property: { name: 'defineProperties', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 38, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 38],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report Proxy.defineProperties(...items) (wrong object)', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Proxy.defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'Proxy', type: 'Identifier' },
          property: { name: 'defineProperties', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report Reflect.defineProperty with spread and extra arg', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperty(...items, extra);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [
          createSpreadElement(createIdentifier('items')),
          createIdentifier('extra'),
        ],
        callee: {
          computed: false,
          object: { name: 'Reflect', type: 'Identifier' },
          property: { name: 'defineProperty', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 45, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 45],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({
        source: 'Reflect.defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({
        source: 'Reflect.defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not accumulate state between calls', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('items'))]),
      )
      expect(reports.length).toBe(1)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createIdentifier('target')]),
      )
      expect(reports.length).toBe(1)
    })

    test('should accumulate reports for multiple matching calls', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('items'))]),
      )
      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('props'))]),
      )
      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('data'))]),
      )

      expect(reports.length).toBe(3)
    })

    test('should report correct location from node loc', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall(
          [createSpreadElement(createIdentifier('items'))],
          5,
          10,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle node without arguments array', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        callee: {
          computed: false,
          object: { name: 'Reflect', type: 'Identifier' },
          property: { name: 'defineProperties', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc gracefully', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'Reflect', type: 'Identifier' },
          property: { name: 'defineProperties', type: 'Identifier' },
          type: 'MemberExpression',
        },
        range: [0, 40],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without object on callee', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          property: { name: 'defineProperties', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node without property on callee', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          object: { name: 'Reflect', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockRuleContext({
        source: 'Reflect.defineProperties(...items);',
      })
      const visitor1 = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)
      const visitor2 = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should produce correct message in report', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('items'))]),
      )

      expect(reports[0].message).toBe(
        'Reflect.defineProperties(...items) with spread is unusual. defineProperties() expects a target object and a properties descriptor.',
      )
    })

    test('should handle mixed matching and non-matching calls in sequence', () => {
      const { context, reports } = createMockRuleContext({
        source: 'Reflect.defineProperties(...items);',
      })
      const visitor = noUnnecessaryReflectDefinePropertiesSpreadRule.create(context)

      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('items'))]),
      )
      visitor.CallExpression(
        createReflectDefinePropertiesCall([createIdentifier('target')]),
      )
      visitor.CallExpression(
        createReflectDefinePropertiesCall([createSpreadElement(createIdentifier('props'))]),
      )
      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'Object', type: 'Identifier' },
          property: { name: 'defineProperties', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 40, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 40],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(2)
    })
  })
})

import { noUnnecessaryMapForEachSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-map-for-each-spread.js'
import { createMockRuleContext } from '../../../helpers/ast-helpers.js'

function makeMapForEachCall(args: unknown[] = [], line = 1, column = 0): unknown {
  const callEnd = column + 'map.forEach'.length + 5 + (args.length > 0 ? 8 : 0)
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: {
        type: 'Identifier',
        name: 'map',
      },
      property: {
        type: 'Identifier',
        name: 'forEach',
      },
    },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: callEnd },
    },
    range: [column, callEnd],
  }
}

function createSpreadElement(argumentName: string): unknown {
  return {
    type: 'SpreadElement',
    argument: {
      type: 'Identifier',
      name: argumentName,
    },
  }
}

function createIdentifier(name: string): unknown {
  return { type: 'Identifier', name }
}

function createLiteral(value: unknown): unknown {
  return { type: 'Literal', value, raw: String(value) }
}

describe('no-unnecessary-map-for-each-spread rule', () => {
  // ============================================================
  // META TESTS (8)
  // ============================================================
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryMapForEachSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryMapForEachSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryMapForEachSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryMapForEachSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryMapForEachSpreadRule.meta.schema).toBeDefined()
    })

    test('should have schema as empty array', () => {
      expect(noUnnecessaryMapForEachSpreadRule.meta.schema).toEqual([])
    })

    test('should mention forEach in description', () => {
      expect(noUnnecessaryMapForEachSpreadRule.meta.docs?.description.toLowerCase()).toContain('foreach')
    })

    test('should mention spread in description', () => {
      expect(noUnnecessaryMapForEachSpreadRule.meta.docs?.description.toLowerCase()).toContain('spread')
    })
  })

  // ============================================================
  // STRUCTURE / CREATE TESTS (2)
  // ============================================================
  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'map.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockRuleContext({ source: 'map.forEach(...items);' })
      const visitor1 = noUnnecessaryMapForEachSpreadRule.create(context)
      const visitor2 = noUnnecessaryMapForEachSpreadRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })
  })

  // ============================================================
  // POSITIVE TESTS (28) - cases that SHOULD report
  // ============================================================
  describe('detecting map.forEach with single spread', () => {
    test('should report map.forEach(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('items')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('map.forEach')
      expect(reports[0].message).toContain('spread')
    })

    test('should report map.forEach(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...args);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('args')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.forEach(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...data);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('data')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.forEach(...entries)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...entries);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('entries')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.forEach(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...values);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('values')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.forEach(...keys)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...keys);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('keys')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.forEach(...result)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...result);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('result')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.forEach(...params)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...params);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('params')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.forEach(...opts)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...opts);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('opts')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.forEach(...config)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...config);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('config')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.forEach(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...list);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('list')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.forEach(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...arr);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('arr')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.forEach(...array)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...array);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('array')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.forEach(...props)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...props);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('props')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.forEach(...elements)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...elements);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('elements')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.forEach(...collection)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...collection);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('collection')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.forEach(...chunks)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...chunks);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('chunks')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.forEach(...rows)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...rows);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('rows')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.forEach(...buffer)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...buffer);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('buffer')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.forEach(...payload)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...payload);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('payload')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.forEach(...input)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...input);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('input')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.forEach(...output)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...output);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('output')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.forEach(...record)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...record);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('record')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.forEach(...fields)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...fields);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('fields')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.forEach(...records)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...records);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('records')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.forEach(...x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...x);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('x')]))

      expect(reports.length).toBe(1)
    })

    test('should report with correct message text', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('items')]))

      expect(reports[0].message).toBe(
        'map.forEach(...items) with a single spread is unusual. Consider passing arguments directly.',
      )
    })

    test('should report with location information', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('items')], 5, 10))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })


  })

  // ============================================================
  // NEGATIVE TESTS (40) - cases that should NOT report
  // ============================================================
  describe('not reporting valid forEach usage', () => {
    test('should not report map.forEach(callback)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(cb);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createIdentifier('callback')]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.forEach(fn)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(fn);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createIdentifier('fn')]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.forEach(cb, thisArg)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(cb, thisArg);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createIdentifier('cb'), createIdentifier('thisArg')]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.forEach() with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach();' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.forEach(() => {})', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(() => {});' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const arrowFn = { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }
      visitor.CallExpression(makeMapForEachCall([arrowFn]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.forEach(function() {})', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(function() {});' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const fnExpr = { type: 'FunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }
      visitor.CallExpression(makeMapForEachCall([fnExpr]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.forEach with three arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(a, b, c);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createIdentifier('a'), createIdentifier('b'), createIdentifier('c')]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.forEach with literal argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(42);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createLiteral(42)]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.forEach with string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach("cb");' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createLiteral('cb')]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.forEach with two spreads', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...a, ...b);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('a'), createSpreadElement('b')]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.forEach with spread and identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...items, cb);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('items'), createIdentifier('cb')]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.forEach with identifier and spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(cb, ...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createIdentifier('cb'), createSpreadElement('items')]))

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting non-map.forEach calls', () => {
    test('should not report arr.forEach(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report data.forEach(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'data.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'data' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report items.forEach(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'items.forEach(...args);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'items' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [createSpreadElement('args')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report map.map(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.map(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: 'map' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report map.filter(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.filter(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: 'filter' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report map.reduce(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.reduce(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: 'reduce' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report map.set(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: 'set' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report map.get(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: 'get' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report map.has(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: 'has' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report map.delete(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: 'delete' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report map.clear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.clear(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: 'clear' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report map.entries(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.entries(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: 'entries' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report map.keys(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.keys(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: 'keys' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report map.values(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.values(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: 'values' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report myMap.forEach(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'myMap.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'myMap' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.forEach(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'weakMap' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report set.forEach(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'set' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report list.forEach(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'list.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'list' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report collection.forEach(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'collection.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'collection' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report arr.map(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.map(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'map' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report obj.forEach(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report result.forEach(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'result.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'result' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report callback.forEach(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'callback.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'callback' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report someMap.forEach(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'someMap.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'someMap' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report array.forEach(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'array.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'array' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report table.forEach(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'table.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'table' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report config.forEach(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'config.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'config' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report graph.forEach(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'graph.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'graph' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EDGE CASE TESTS (17)
  // ============================================================
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'map.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'map.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'map.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node input', () => {
      const { context } = createMockRuleContext({ source: 'map.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'forEach' },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle computed member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'map["forEach"](...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Literal', value: 'forEach' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
        range: [0, 20],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee object', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-Identifier callee object', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee property', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-Identifier callee property', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Literal', value: 'forEach' },
        },
        arguments: [createSpreadElement('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach();' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [createSpreadElement('items')],
        range: [0, 20],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      expect(() => visitor.CallExpression({ type: 'ExpressionStatement' })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle multiple calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      visitor.CallExpression(makeMapForEachCall([createSpreadElement('items')]))
      visitor.CallExpression(makeMapForEachCall([createSpreadElement('args')]))
      visitor.CallExpression(makeMapForEachCall([createIdentifier('cb')]))

      expect(reports.length).toBe(2)
    })

    test('should handle array as node input', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...items);' })
      const visitor = noUnnecessaryMapForEachSpreadRule.create(context)

      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })
})

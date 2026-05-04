
import { noUnnecessaryMapSetSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-map-set-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function makeMapSetCall(args: unknown[], line = 1, column = 0): unknown {
  const objectEnd = column + 3 // 'map'.length
  const callEnd = objectEnd + 4 + 10 // '.set' + '(...)'
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
        name: 'set',
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

function createSpreadElement(argument: unknown): unknown {
  return {
    type: 'SpreadElement',
    argument,
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
    raw: String(value),
  }
}

describe('no-unnecessary-map-set-spread rule', () => {
  // --- META (8) ---
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryMapSetSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryMapSetSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryMapSetSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryMapSetSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryMapSetSpreadRule.meta.schema).toEqual([])
    })

    test('should have docs with url', () => {
      expect(noUnnecessaryMapSetSpreadRule.meta.docs?.url).toBeDefined()
    })

    test('should have non-empty description', () => {
      expect(noUnnecessaryMapSetSpreadRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should mention map.set in description', () => {
      const desc = noUnnecessaryMapSetSpreadRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('map')
    })
  })

  // --- STRUCTURE (2) ---
  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'map.set(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'map.set(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  // --- POSITIVE (28): should report ---
  describe('detecting map.set with single spread argument', () => {
    test('should report map.set(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createSpreadElement(createIdentifier('items'))]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('map.set(...items)')
    })

    test('should report map.set(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...args);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createSpreadElement(createIdentifier('args'))]))
      expect(reports.length).toBe(1)
    })

    test('should report map.set(...pair)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...pair);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createSpreadElement(createIdentifier('pair'))]))
      expect(reports.length).toBe(1)
    })

    test('should report map.set(...entry)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...entry);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createSpreadElement(createIdentifier('entry'))]))
      expect(reports.length).toBe(1)
    })

    test('should report map.set(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...data);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createSpreadElement(createIdentifier('data'))]))
      expect(reports.length).toBe(1)
    })

    test('should report map.set(...tuple)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...tuple);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createSpreadElement(createIdentifier('tuple'))]))
      expect(reports.length).toBe(1)
    })

    test('should report map.set(...kv)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...kv);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createSpreadElement(createIdentifier('kv'))]))
      expect(reports.length).toBe(1)
    })

    test('should report map.set(...value)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...value);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createSpreadElement(createIdentifier('value'))]))
      expect(reports.length).toBe(1)
    })

    test('should report map.set(...result)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...result);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createSpreadElement(createIdentifier('result'))]))
      expect(reports.length).toBe(1)
    })

    test('should report map.set(...config)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...config);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createSpreadElement(createIdentifier('config'))]))
      expect(reports.length).toBe(1)
    })

    test('should report map.set(...obj)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...obj);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createSpreadElement(createIdentifier('obj'))]))
      expect(reports.length).toBe(1)
    })

    test('should report map.set(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...arr);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createSpreadElement(createIdentifier('arr'))]))
      expect(reports.length).toBe(1)
    })

    test('should report map.set with spread of array literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...[1, 2]);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const arrayExpr = { type: 'ArrayExpression', elements: [createLiteral(1), createLiteral(2)] }
      visitor.CallExpression(makeMapSetCall([createSpreadElement(arrayExpr)]))
      expect(reports.length).toBe(1)
    })

    test('should report map.set with spread of member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...obj.pair);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const memberExpr = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: createIdentifier('pair'),
        computed: false,
      }
      visitor.CallExpression(makeMapSetCall([createSpreadElement(memberExpr)]))
      expect(reports.length).toBe(1)
    })

    test('should report map.set with spread of call expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...getPair());' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const callExpr = {
        type: 'CallExpression',
        callee: createIdentifier('getPair'),
        arguments: [],
      }
      visitor.CallExpression(makeMapSetCall([createSpreadElement(callExpr)]))
      expect(reports.length).toBe(1)
    })

    test('should report map.set with spread of conditional expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...(a ? b : c));' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const condExpr = {
        type: 'ConditionalExpression',
        test: createIdentifier('a'),
        consequent: createIdentifier('b'),
        alternate: createIdentifier('c'),
      }
      visitor.CallExpression(makeMapSetCall([createSpreadElement(condExpr)]))
      expect(reports.length).toBe(1)
    })

    test('should report map.set with spread of logical expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...(x || y));' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const logExpr = {
        type: 'LogicalExpression',
        left: createIdentifier('x'),
        operator: '||',
        right: createIdentifier('y'),
      }
      visitor.CallExpression(makeMapSetCall([createSpreadElement(logExpr)]))
      expect(reports.length).toBe(1)
    })

    test('should report map.set with spread of binary expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...(x + y));' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const binExpr = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        operator: '+',
        right: createIdentifier('y'),
      }
      visitor.CallExpression(makeMapSetCall([createSpreadElement(binExpr)]))
      expect(reports.length).toBe(1)
    })

    test('should report map.set with spread of parenthesized expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...(ref));' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createSpreadElement(createIdentifier('ref'))]))
      expect(reports.length).toBe(1)
    })

    test('should report map.set with spread at different line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createSpreadElement(createIdentifier('items'))], 10, 5))
      expect(reports.length).toBe(1)
    })

    test('should report map.set with spread at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createSpreadElement(createIdentifier('items'))], 1, 0))
      expect(reports.length).toBe(1)
    })

    test('should include correct message about spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createSpreadElement(createIdentifier('items'))]))
      expect(reports[0].message).toBe('map.set(...items) with a single spread is unusual. Consider passing arguments directly.')
    })

    test('should report map.set with spread of template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...`key`);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const tplLiteral = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'key', cooked: 'key' } }],
        expressions: [],
      }
      visitor.CallExpression(makeMapSetCall([createSpreadElement(tplLiteral)]))
      expect(reports.length).toBe(1)
    })

    test('should report map.set with spread of unary expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...!flag);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const unaryExpr = {
        type: 'UnaryExpression',
        operator: '!',
        argument: createIdentifier('flag'),
        prefix: true,
      }
      visitor.CallExpression(makeMapSetCall([createSpreadElement(unaryExpr)]))
      expect(reports.length).toBe(1)
    })

    test('should report map.set with spread of arrow function result', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...(() => x));' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const arrowCall = {
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          params: [],
          body: createIdentifier('x'),
        },
        arguments: [],
      }
      visitor.CallExpression(makeMapSetCall([createSpreadElement(arrowCall)]))
      expect(reports.length).toBe(1)
    })

    test('should report map.set with spread of new expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...new Pair());' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const newExpr = {
        type: 'NewExpression',
        callee: createIdentifier('Pair'),
        arguments: [],
      }
      visitor.CallExpression(makeMapSetCall([createSpreadElement(newExpr)]))
      expect(reports.length).toBe(1)
    })

    test('should report map.set with spread of sequence expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...(a, b));' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const seqExpr = {
        type: 'SequenceExpression',
        expressions: [createIdentifier('a'), createIdentifier('b')],
      }
      visitor.CallExpression(makeMapSetCall([createSpreadElement(seqExpr)]))
      expect(reports.length).toBe(1)
    })

    test('should report map.set with spread of await expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...await promise);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const awaitExpr = {
        type: 'AwaitExpression',
        argument: createIdentifier('promise'),
      }
      visitor.CallExpression(makeMapSetCall([createSpreadElement(awaitExpr)]))
      expect(reports.length).toBe(1)
    })
  })

  // --- NEGATIVE (40): should NOT report ---
  describe('cases that should not report', () => {
    test('should not report map.set(key, value) with two regular args', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(key, value);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createIdentifier('key'), createIdentifier('value')]))
      expect(reports.length).toBe(0)
    })

    test('should not report map.set(key, value, extra) with three args', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(key, value, extra);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createIdentifier('key'), createIdentifier('value'), createIdentifier('extra')]))
      expect(reports.length).toBe(0)
    })

    test('should not report map.set() with no args', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set();' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([]))
      expect(reports.length).toBe(0)
    })

    test('should not report map.set(key) with one regular arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(key);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createIdentifier('key')]))
      expect(reports.length).toBe(0)
    })

    test('should not report obj.set(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.set(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'set' },
        },
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report map.get(...items) with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: 'get' },
        },
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report map.delete(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: 'delete' },
        },
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report map.has(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: 'has' },
        },
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report map.forEach(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report map.clear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.clear(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: 'clear' },
        },
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report myMap.set(...items) with myMap object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'myMap.set(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'myMap' },
          property: { type: 'Identifier', name: 'set' },
        },
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.set(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.set(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'weakMap' },
          property: { type: 'Identifier', name: 'set' },
        },
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report Map.set(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Map.set(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Map' },
          property: { type: 'Identifier', name: 'set' },
        },
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report map["set"](...items) with computed property', () => {
      const { context, reports } = createMockRuleContext({ source: 'map["set"](...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Literal', value: 'set' },
        },
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report standalone set(...items) function call', () => {
      const { context, reports } = createMockRuleContext({ source: 'set(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'set' },
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report arr.push(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.push(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'push' },
        },
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report map.set(key, ...rest) with spread as second arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(key, ...rest);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createIdentifier('key'), createSpreadElement(createIdentifier('rest'))]))
      expect(reports.length).toBe(0)
    })

    test('should not report map.set(...items, extra) with spread and extra arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...items, extra);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createSpreadElement(createIdentifier('items')), createIdentifier('extra')]))
      expect(reports.length).toBe(0)
    })

    test('should not report map.set(...a, ...b) with two spreads', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...a, ...b);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createSpreadElement(createIdentifier('a')), createSpreadElement(createIdentifier('b'))]))
      expect(reports.length).toBe(0)
    })

    test('should not report non-CallExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'x' })
      expect(reports.length).toBe(0)
    })

    test('should not report null node', () => {
      const { context, reports } = createMockRuleContext({ source: 'null;' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(null)
      expect(reports.length).toBe(0)
    })

    test('should not report undefined node', () => {
      const { context, reports } = createMockRuleContext({ source: 'undefined;' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(undefined)
      expect(reports.length).toBe(0)
    })

    test('should not report node with no callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set();' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when callee object is not an Identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'getMap().set(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'CallExpression',
            callee: createIdentifier('getMap'),
            arguments: [],
          },
          property: { type: 'Identifier', name: 'set' },
        },
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when callee property is not an Identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'map[0](...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Literal', value: 0 },
        },
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report map.set(1) with literal arg', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(1);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createLiteral(1)]))
      expect(reports.length).toBe(0)
    })

    test('should not report map.set("key") with string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set("key");' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createLiteral('key')]))
      expect(reports.length).toBe(0)
    })

    test('should not report map.set(true) with boolean literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(true);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createLiteral(true)]))
      expect(reports.length).toBe(0)
    })

    test('should not report map.set(null) with null literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(null);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createLiteral(null)]))
      expect(reports.length).toBe(0)
    })

    test('should not report set.set(...items) with object named set', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.set(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'set' },
          property: { type: 'Identifier', name: 'set' },
        },
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report MAP.set(...items) with uppercase MAP', () => {
      const { context, reports } = createMockRuleContext({ source: 'MAP.set(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'MAP' },
          property: { type: 'Identifier', name: 'set' },
        },
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report Map.prototype.set(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Map.prototype.set(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Map' },
            property: { type: 'Identifier', name: 'prototype' },
            computed: false,
          },
          property: { type: 'Identifier', name: 'set' },
        },
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report map.Set(...items) with capitalized Set', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.Set(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: 'Set' },
        },
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report map.entries(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.entries(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: 'entries' },
        },
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report map.keys(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.keys(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: 'keys' },
        },
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report map.values(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.values(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: 'values' },
        },
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report map.size(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.size(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: 'size' },
        },
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report data.set(...items) with data object', () => {
      const { context, reports } = createMockRuleContext({ source: 'data.set(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'data' },
          property: { type: 'Identifier', name: 'set' },
        },
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report map.set(...items, ...more) with two spreads and extra', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...items, ...more, x);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([
        createSpreadElement(createIdentifier('items')),
        createSpreadElement(createIdentifier('more')),
        createIdentifier('x'),
      ]))
      expect(reports.length).toBe(0)
    })
  })

  // --- EDGE (17) ---
  describe('edge cases', () => {
    test('should report when arguments array has exactly one SpreadElement', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...x);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createSpreadElement(createIdentifier('x'))]))
      expect(reports.length).toBe(1)
    })

    test('should not report when argument is SpreadElement but different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'cache.set(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'cache' },
          property: { type: 'Identifier', name: 'set' },
        },
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for empty object name', () => {
      const { context, reports } = createMockRuleContext({ source: '.set(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: '' },
          property: { type: 'Identifier', name: 'set' },
        },
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for empty property name', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: '' },
        },
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with missing arguments property', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set();' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: 'set' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node with null arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set();' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: 'set' },
        },
        arguments: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty type string', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set();' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression({ type: '', arguments: [createSpreadElement(createIdentifier('x'))] })
      expect(reports.length).toBe(0)
    })

    test('should handle multiple sequential calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...a); map.set(...b);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createSpreadElement(createIdentifier('a'))]))
      visitor.CallExpression(makeMapSetCall([createSpreadElement(createIdentifier('b'))]))
      expect(reports.length).toBe(2)
    })

    test('should create a new visitor each time create is called', () => {
      const { context } = createMockRuleContext({ source: 'map.set();' })
      const visitor1 = noUnnecessaryMapSetSpreadRule.create(context)
      const visitor2 = noUnnecessaryMapSetSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should not report when object type is ThisExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'this.set(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'set' },
        },
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when object type is Super', () => {
      const { context, reports } = createMockRuleContext({ source: 'super.set(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Super' },
          property: { type: 'Identifier', name: 'set' },
        },
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report even with deeply nested spread argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...a.b.c);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      const deepMember = {
        type: 'MemberExpression',
        computed: false,
        object: {
          type: 'MemberExpression',
          computed: false,
          object: createIdentifier('a'),
          property: createIdentifier('b'),
        },
        property: createIdentifier('c'),
      }
      visitor.CallExpression(makeMapSetCall([createSpreadElement(deepMember)]))
      expect(reports.length).toBe(1)
    })

    test('should handle report descriptor with loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...items);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([createSpreadElement(createIdentifier('items'))], 5, 10))
      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should not report when arg is regular expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(/regex/);' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([{ type: 'Literal', value: /regex/, raw: '/regex/' }]))
      expect(reports.length).toBe(0)
    })

    test('should not report when arg is object expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set({ key: 1 });' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([{
        type: 'ObjectExpression',
        properties: [{ type: 'Property', key: createIdentifier('key'), value: createLiteral(1) }],
      }]))
      expect(reports.length).toBe(0)
    })

    test('should not report when arg is function expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(function() {});' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([{
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }]))
      expect(reports.length).toBe(0)
    })

    test('should not report when arg is arrow function expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(() => {});' })
      const visitor = noUnnecessaryMapSetSpreadRule.create(context)
      visitor.CallExpression(makeMapSetCall([{
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        expression: false,
      }]))
      expect(reports.length).toBe(0)
    })
  })
})



import { noUnnecessaryMapHasSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-map-has-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function makeMapHasCall(args: unknown[], line = 1, column = 0): unknown {
  const objectEnd = column + 'map'.length
  const propertyEnd = objectEnd + '.has'.length
  const callEnd = propertyEnd + '(...)'.length

  return {
    arguments: args,
    callee: {
      computed: false,
      object: {
        name: 'map',
        range: [column, objectEnd],
        type: 'Identifier',
      },
      property: {
        name: 'has',
        type: 'Identifier',
      },
      range: [column, propertyEnd],
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

describe('no-unnecessary-map-has-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryMapHasSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryMapHasSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryMapHasSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryMapHasSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryMapHasSpreadRule.meta.schema).toBeDefined()
    })

    test('should have empty schema array', () => {
      expect(noUnnecessaryMapHasSpreadRule.meta.schema).toEqual([])
    })

    test('should mention map.has in description', () => {
      expect(noUnnecessaryMapHasSpreadRule.meta.docs?.description.toLowerCase()).toContain('map.has')
    })

    test('should mention spread in description', () => {
      expect(noUnnecessaryMapHasSpreadRule.meta.docs?.description.toLowerCase()).toContain('spread')
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'map.has(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'map.has(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detecting map.has with single spread argument', () => {
    test('should report map.has(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('map.has(...items)')
      expect(reports[0].message).toContain('Consider passing the key directly')
    })

    test('should report map.has(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...arr);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('arr'))]))

      expect(reports.length).toBe(1)
    })

    test('should report map.has(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...data);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('data'))]))

      expect(reports.length).toBe(1)
    })

    test('should report map.has(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...values);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('values'))]))

      expect(reports.length).toBe(1)
    })

    test('should report map.has(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...list);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('list'))]))

      expect(reports.length).toBe(1)
    })

    test('should report map.has(...elements)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...elements);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('elements'))]))

      expect(reports.length).toBe(1)
    })

    test('should report map.has(...nums)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...nums);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('nums'))]))

      expect(reports.length).toBe(1)
    })

    test('should report map.has(...result)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...result);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('result'))]))

      expect(reports.length).toBe(1)
    })

    test('should report map.has(...collection)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...collection);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('collection'))]))

      expect(reports.length).toBe(1)
    })

    test('should report map.has(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...args);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('args'))]))

      expect(reports.length).toBe(1)
    })

    test('should report map.has(...entries)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...entries);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('entries'))]))

      expect(reports.length).toBe(1)
    })

    test('should report map.has(...chunks)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...chunks);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('chunks'))]))

      expect(reports.length).toBe(1)
    })

    test('should report map.has(...buffer)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...buffer);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('buffer'))]))

      expect(reports.length).toBe(1)
    })

    test('should report map.has(...rows)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...rows);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('rows'))]))

      expect(reports.length).toBe(1)
    })

    test('should report map.has(...options)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...options);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('options'))]))

      expect(reports.length).toBe(1)
    })

    test('should report map.has(...output)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...output);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('output'))]))

      expect(reports.length).toBe(1)
    })

    test('should report map.has(...array)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...array);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('array'))]))

      expect(reports.length).toBe(1)
    })

    test('should report map.has(...tuple)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...tuple);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('tuple'))]))

      expect(reports.length).toBe(1)
    })

    test('should report map.has(...filtered)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...filtered);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('filtered'))]))

      expect(reports.length).toBe(1)
    })

    test('should report map.has(...mapped)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...mapped);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('mapped'))]))

      expect(reports.length).toBe(1)
    })

    test('should report map.has(...nested)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...nested);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('nested'))]))

      expect(reports.length).toBe(1)
    })

    test('should report map.has(...flat)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...flat);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('flat'))]))

      expect(reports.length).toBe(1)
    })

    test('should report map.has(...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...rest);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('rest'))]))

      expect(reports.length).toBe(1)
    })

    test('should report map.has(...extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...extra);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('extra'))]))

      expect(reports.length).toBe(1)
    })

    test('should report map.has(...unique)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...unique);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('unique'))]))

      expect(reports.length).toBe(1)
    })

    test('should report map.has(...source)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...source);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('source'))]))

      expect(reports.length).toBe(1)
    })

    test('should report map.has(...input)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...input);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('input'))]))

      expect(reports.length).toBe(1)
    })

    test('should report map.has(...combined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...combined);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('combined'))]))

      expect(reports.length).toBe(1)
    })

  })

  describe('not reporting non-matching calls', () => {
    test('should not report map.has(1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(1);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createLiteral(1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.has("hello")', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has("hello");' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createLiteral('hello')]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.has(item)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(item);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createIdentifier('item')]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.has(1, 2)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(1, 2);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createLiteral(1), createLiteral(2)]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.has(a, b)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(a, b);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createIdentifier('a'), createIdentifier('b')]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.has(1, 2, 3)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(1, 2, 3);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createLiteral(1), createLiteral(2), createLiteral(3)]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.has(...items, extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...items, extra);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('items')), createIdentifier('extra')]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.has(first, ...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(first, ...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createIdentifier('first'), createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.has()', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has();' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([]))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.has(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.has(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'obj',
            type: 'Identifier',
          },
          property: {
            name: 'has',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 20],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report myMap.has(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'myMap.has(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'myMap',
            type: 'Identifier',
          },
          property: {
            name: 'has',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 22, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 22],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report map.push(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.push(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'map',
            type: 'Identifier',
          },
          property: {
            name: 'push',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 22, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 22],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report map.set(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'map',
            type: 'Identifier',
          },
          property: {
            name: 'set',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 21, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 21],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report map.delete(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'map',
            type: 'Identifier',
          },
          property: {
            name: 'delete',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 24, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 24],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report map.clear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.clear(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'map',
            type: 'Identifier',
          },
          property: {
            name: 'clear',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 23, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 23],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report map.forEach(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'map',
            type: 'Identifier',
          },
          property: {
            name: 'forEach',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 25, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 25],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report map.entries(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.entries(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'map',
            type: 'Identifier',
          },
          property: {
            name: 'entries',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 25, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 25],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report map.values(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.values(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'map',
            type: 'Identifier',
          },
          property: {
            name: 'values',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 24, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 24],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report map.keys(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.keys(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'map',
            type: 'Identifier',
          },
          property: {
            name: 'keys',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 22, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 22],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report map.size(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.size(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'map',
            type: 'Identifier',
          },
          property: {
            name: 'size',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 22, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 22],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report arr.map(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.map(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'arr',
            type: 'Identifier',
          },
          property: {
            name: 'map',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 21, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 21],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report arr.filter(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.filter(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'arr',
            type: 'Identifier',
          },
          property: {
            name: 'filter',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 24, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 24],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report arr.reduce(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.reduce(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'arr',
            type: 'Identifier',
          },
          property: {
            name: 'reduce',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 24, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 24],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report direct has(...items) call', () => {
      const { context, reports } = createMockRuleContext({ source: 'has(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          name: 'has',
          type: 'Identifier',
        },
        loc: { end: { column: 16, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 16],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report map.has(true)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(true);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createLiteral(true)]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.has(null)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(null);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createLiteral(null)]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.has(42)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(42);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createLiteral(42)]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.has(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(0);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createLiteral(0)]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.has(-1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(-1);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createLiteral(-1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.has(value)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(value);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createIdentifier('value')]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.has(x, y)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(x, y);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createIdentifier('x'), createIdentifier('y')]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.has(foo, bar, baz)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(foo, bar, baz);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createIdentifier('foo'), createIdentifier('bar'), createIdentifier('baz')]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.has(item, ...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(item, ...rest);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createIdentifier('item'), createSpreadElement(createIdentifier('rest'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report map["has"](...items) with computed property', () => {
      const { context, reports } = createMockRuleContext({ source: 'map["has"](...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: true,
          object: {
            name: 'map',
            type: 'Identifier',
          },
          property: {
            type: 'Literal',
            value: 'has',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 23, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 23],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report set.has(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'set',
            type: 'Identifier',
          },
          property: {
            name: 'has',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 21, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 21],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.has(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'weakMap',
            type: 'Identifier',
          },
          property: {
            name: 'has',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 25, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 25],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report collection.has(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'collection.has(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'collection',
            type: 'Identifier',
          },
          property: {
            name: 'has',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 27, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 27],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report arr.includes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.includes(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'arr',
            type: 'Identifier',
          },
          property: {
            name: 'includes',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 25, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 25],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report map.indexOf(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.indexOf(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'map',
            type: 'Identifier',
          },
          property: {
            name: 'indexOf',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 25, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 25],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report arr.concat(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.concat(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'arr',
            type: 'Identifier',
          },
          property: {
            name: 'concat',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 23, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 23],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'map.has(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'map.has(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      expect(() => visitor.CallExpression()).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'map.has(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle boolean node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'map.has(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle empty object node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          name: 'has',
          type: 'Identifier',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      const node = {
        callee: {
          computed: false,
          object: {
            name: 'map',
            type: 'Identifier',
          },
          property: {
            name: 'has',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 10],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without property on callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          object: {
            name: 'map',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without object on callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          property: {
            name: 'has',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-identifier object in callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            type: 'CallExpression',
          },
          property: {
            name: 'has',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-identifier property in callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'map',
            type: 'Identifier',
          },
          property: {
            type: 'Literal',
            value: 'has',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('items'))], 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle multiple calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('items'))]))
      visitor.CallExpression(makeMapHasCall([createSpreadElement(createIdentifier('arr'))]))
      visitor.CallExpression(makeMapHasCall([createIdentifier('value')]))

      expect(reports.length).toBe(2)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'map',
            type: 'Identifier',
          },
          property: {
            name: 'has',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        range: [0, 18],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle number node', () => {
      const { context } = createMockRuleContext({ source: 'map.has(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should handle spread of literal value', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...items);' })
      const visitor = noUnnecessaryMapHasSpreadRule.create(context)

      visitor.CallExpression(makeMapHasCall([createSpreadElement(createLiteral(42))]))

      expect(reports.length).toBe(1)
    })
  })
})

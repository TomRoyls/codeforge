
import { noUnnecessaryWeakMapDeleteSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-weakmap-delete-spread.js'
import { createMockRuleContext } from '../../../helpers/ast-helpers.js'

function makeWeakMapDeleteCall(args: unknown[], line = 1, column = 0): unknown {
  const objectEnd = column + 'weakMap'.length
  const propertyEnd = objectEnd + '.delete'.length
  const callEnd = propertyEnd + '(...)'.length

  return {
    arguments: args,
    callee: {
      computed: false,
      object: {
        name: 'weakMap',
        range: [column, objectEnd],
        type: 'Identifier',
      },
      property: {
        name: 'delete',
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

describe('no-unnecessary-weakmap-delete-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryWeakMapDeleteSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryWeakMapDeleteSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryWeakMapDeleteSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryWeakMapDeleteSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryWeakMapDeleteSpreadRule.meta.schema).toBeDefined()
    })

    test('should have empty schema array', () => {
      expect(noUnnecessaryWeakMapDeleteSpreadRule.meta.schema).toEqual([])
    })

    test('should mention weakMap.delete in description', () => {
      expect(noUnnecessaryWeakMapDeleteSpreadRule.meta.docs?.description.toLowerCase()).toContain('weakMap.delete'.toLowerCase())
    })

    test('should mention spread in description', () => {
      expect(noUnnecessaryWeakMapDeleteSpreadRule.meta.docs?.description.toLowerCase()).toContain('spread')
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'weakMap.delete(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'weakMap.delete(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detecting weakMap.delete with single spread argument', () => {
    test('should report weakMap.delete(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('weakMap.delete(...items)')
      expect(reports[0].message).toContain('Consider passing the key directly')
    })

    test('should report weakMap.delete(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...arr);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('arr'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.delete(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...data);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('data'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.delete(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...values);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('values'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.delete(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...list);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('list'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.delete(...elements)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...elements);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('elements'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.delete(...nums)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...nums);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('nums'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.delete(...result)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...result);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('result'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.delete(...collection)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...collection);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('collection'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.delete(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...args);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('args'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.delete(...entries)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...entries);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('entries'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.delete(...chunks)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...chunks);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('chunks'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.delete(...buffer)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...buffer);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('buffer'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.delete(...rows)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...rows);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('rows'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.delete(...options)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...options);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('options'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.delete(...output)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...output);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('output'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.delete(...array)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...array);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('array'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.delete(...tuple)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...tuple);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('tuple'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.delete(...filtered)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...filtered);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('filtered'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.delete(...mapped)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...mapped);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('mapped'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.delete(...nested)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...nested);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('nested'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.delete(...flat)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...flat);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('flat'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.delete(...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...rest);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('rest'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.delete(...extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...extra);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('extra'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.delete(...unique)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...unique);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('unique'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.delete(...source)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...source);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('source'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.delete(...input)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...input);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('input'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.delete(...combined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...combined);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('combined'))]))

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting non-matching calls', () => {
    test('should not report weakMap.delete(1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(1);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createLiteral(1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.delete("hello")', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete("hello");' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createLiteral('hello')]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.delete(item)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(item);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createIdentifier('item')]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.delete(1, 2)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(1, 2);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createLiteral(1), createLiteral(2)]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.delete(a, b)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(a, b);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createIdentifier('a'), createIdentifier('b')]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.delete(1, 2, 3)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(1, 2, 3);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createLiteral(1), createLiteral(2), createLiteral(3)]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.delete(...items, extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...items, extra);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('items')), createIdentifier('extra')]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.delete(first, ...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(first, ...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createIdentifier('first'), createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.delete()', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete();' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([]))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.delete(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.delete(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'obj',
            type: 'Identifier',
          },
          property: {
            name: 'delete',
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

    test('should not report myWeakMap.delete(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'myWeakMap.delete(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'myWeakMap',
            type: 'Identifier',
          },
          property: {
            name: 'delete',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 30, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 30],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.set(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.set(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'weakMap',
            type: 'Identifier',
          },
          property: {
            name: 'set',
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

    test('should not report weakMap.get(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.get(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'weakMap',
            type: 'Identifier',
          },
          property: {
            name: 'get',
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

    test('should not report weakMap.has(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

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
        loc: { end: { column: 24, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 24],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.clear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.clear(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'weakMap',
            type: 'Identifier',
          },
          property: {
            name: 'clear',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 26, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 26],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.forEach(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.forEach(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'weakMap',
            type: 'Identifier',
          },
          property: {
            name: 'forEach',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 28, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 28],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.entries(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.entries(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'weakMap',
            type: 'Identifier',
          },
          property: {
            name: 'entries',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 28, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 28],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.values(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.values(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'weakMap',
            type: 'Identifier',
          },
          property: {
            name: 'values',
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

    test('should not report weakMap.keys(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.keys(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'weakMap',
            type: 'Identifier',
          },
          property: {
            name: 'keys',
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

    test('should not report weakMap.size(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.size(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'weakMap',
            type: 'Identifier',
          },
          property: {
            name: 'size',
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

    test('should not report arr.map(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.map(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

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
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

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
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

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

    test('should not report direct delete(...items) call', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          name: 'delete',
          type: 'Identifier',
        },
        loc: { end: { column: 18, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 18],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.delete(true)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(true);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createLiteral(true)]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.delete(null)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(null);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createLiteral(null)]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.delete(42)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(42);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createLiteral(42)]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.delete(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(0);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createLiteral(0)]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.delete(-1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(-1);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createLiteral(-1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.delete(value)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(value);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createIdentifier('value')]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.delete(x, y)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(x, y);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createIdentifier('x'), createIdentifier('y')]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.delete(foo, bar, baz)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(foo, bar, baz);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createIdentifier('foo'), createIdentifier('bar'), createIdentifier('baz')]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.delete(item, ...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(item, ...rest);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createIdentifier('item'), createSpreadElement(createIdentifier('rest'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap["delete"](...items) with computed property', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap["delete"](...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: true,
          object: {
            name: 'weakMap',
            type: 'Identifier',
          },
          property: {
            type: 'Literal',
            value: 'delete',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 29, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 29],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report map.delete(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

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
        loc: { end: { column: 23, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 23],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report set.delete(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'set',
            type: 'Identifier',
          },
          property: {
            name: 'delete',
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

    test('should not report collection.delete(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'collection.delete(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'collection',
            type: 'Identifier',
          },
          property: {
            name: 'delete',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 29, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 29],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report arr.includes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.includes(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

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

    test('should not report weakMap.indexOf(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.indexOf(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'weakMap',
            type: 'Identifier',
          },
          property: {
            name: 'indexOf',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 28, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 28],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report arr.concat(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.concat(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

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
      const { context } = createMockRuleContext({ source: 'weakMap.delete(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'weakMap.delete(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      expect(() => visitor.CallExpression()).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'weakMap.delete(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle boolean node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'weakMap.delete(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle empty object node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          name: 'delete',
          type: 'Identifier',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      const node = {
        callee: {
          computed: false,
          object: {
            name: 'weakMap',
            type: 'Identifier',
          },
          property: {
            name: 'delete',
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
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          object: {
            name: 'weakMap',
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
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          property: {
            name: 'delete',
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
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            type: 'CallExpression',
          },
          property: {
            name: 'delete',
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
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'weakMap',
            type: 'Identifier',
          },
          property: {
            type: 'Literal',
            value: 'delete',
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
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('items'))], 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle multiple calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('items'))]))
      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createIdentifier('arr'))]))
      visitor.CallExpression(makeWeakMapDeleteCall([createIdentifier('value')]))

      expect(reports.length).toBe(2)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'weakMap',
            type: 'Identifier',
          },
          property: {
            name: 'delete',
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
      const { context } = createMockRuleContext({ source: 'weakMap.delete(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should handle spread of literal value', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...items);' })
      const visitor = noUnnecessaryWeakMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapDeleteCall([createSpreadElement(createLiteral(42))]))

      expect(reports.length).toBe(1)
    })
  })
})

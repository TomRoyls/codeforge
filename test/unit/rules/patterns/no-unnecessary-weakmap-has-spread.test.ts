


import { noUnnecessaryWeakMapHasSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-weakmap-has-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function makeWeakMapHasCall(args: unknown[], line = 1, column = 0): unknown {
  const objectEnd = column + 'weakMap'.length
  const propertyEnd = objectEnd + '.has'.length
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

describe('no-unnecessary-weakmap-has-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryWeakMapHasSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryWeakMapHasSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryWeakMapHasSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryWeakMapHasSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryWeakMapHasSpreadRule.meta.schema).toBeDefined()
    })

    test('should have empty schema array', () => {
      expect(noUnnecessaryWeakMapHasSpreadRule.meta.schema).toEqual([])
    })

    test('should mention weakMap.has in description', () => {
      expect(noUnnecessaryWeakMapHasSpreadRule.meta.docs?.description.toLowerCase()).toContain('weakMap.has'.toLowerCase())
    })

    test('should mention spread in description', () => {
      expect(noUnnecessaryWeakMapHasSpreadRule.meta.docs?.description.toLowerCase()).toContain('spread')
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'weakMap.has(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'weakMap.has(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detecting weakMap.has with single spread argument', () => {
    test('should report weakMap.has(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('weakMap.has(...items)')
      expect(reports[0].message).toContain('Consider passing the key directly')
    })

    test('should report weakMap.has(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...arr);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('arr'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.has(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...data);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('data'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.has(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...values);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('values'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.has(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...list);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('list'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.has(...elements)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...elements);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('elements'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.has(...nums)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...nums);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('nums'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.has(...result)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...result);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('result'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.has(...collection)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...collection);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('collection'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.has(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...args);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('args'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.has(...entries)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...entries);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('entries'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.has(...chunks)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...chunks);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('chunks'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.has(...buffer)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...buffer);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('buffer'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.has(...rows)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...rows);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('rows'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.has(...options)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...options);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('options'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.has(...output)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...output);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('output'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.has(...array)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...array);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('array'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.has(...tuple)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...tuple);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('tuple'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.has(...filtered)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...filtered);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('filtered'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.has(...mapped)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...mapped);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('mapped'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.has(...nested)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...nested);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('nested'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.has(...flat)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...flat);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('flat'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.has(...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...rest);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('rest'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.has(...extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...extra);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('extra'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.has(...unique)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...unique);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('unique'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.has(...source)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...source);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('source'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.has(...input)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...input);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('input'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakMap.has(...combined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...combined);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('combined'))]))

      expect(reports.length).toBe(1)
    })

  })

  describe('not reporting non-matching calls', () => {
    test('should not report weakMap.has(1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(1);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createLiteral(1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.has("hello")', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has("hello");' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createLiteral('hello')]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.has(item)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(item);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createIdentifier('item')]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.has(1, 2)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(1, 2);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createLiteral(1), createLiteral(2)]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.has(a, b)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(a, b);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createIdentifier('a'), createIdentifier('b')]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.has(1, 2, 3)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(1, 2, 3);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createLiteral(1), createLiteral(2), createLiteral(3)]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.has(...items, extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...items, extra);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('items')), createIdentifier('extra')]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.has(first, ...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(first, ...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createIdentifier('first'), createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.has()', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has();' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([]))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.has(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.has(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

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

    test('should not report myWeakMap.has(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'myWeakMap.has(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'myWeakMap',
            type: 'Identifier',
          },
          property: {
            name: 'has',
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

    test('should not report weakMap.push(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.push(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'weakMap',
            type: 'Identifier',
          },
          property: {
            name: 'push',
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

    test('should not report weakMap.set(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.set(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

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

    test('should not report weakMap.delete(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression({
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
        loc: { end: { column: 27, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 27],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.clear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.clear(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

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
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

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
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

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
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

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
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

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
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

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
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

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
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

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
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

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
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

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

    test('should not report weakMap.has(true)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(true);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createLiteral(true)]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.has(null)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(null);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createLiteral(null)]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.has(42)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(42);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createLiteral(42)]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.has(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(0);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createLiteral(0)]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.has(-1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(-1);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createLiteral(-1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.has(value)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(value);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createIdentifier('value')]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.has(x, y)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(x, y);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createIdentifier('x'), createIdentifier('y')]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.has(foo, bar, baz)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(foo, bar, baz);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createIdentifier('foo'), createIdentifier('bar'), createIdentifier('baz')]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.has(item, ...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(item, ...rest);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createIdentifier('item'), createSpreadElement(createIdentifier('rest'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap["has"](...items) with computed property', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap["has"](...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

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
            value: 'has',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 26, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 26],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report map.has(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression({
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
        loc: { end: { column: 21, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 21],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report set.has(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

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

    test('should not report collection.has(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'collection.has(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

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
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

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
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

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
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

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
      const { context } = createMockRuleContext({ source: 'weakMap.has(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'weakMap.has(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      expect(() => visitor.CallExpression()).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'weakMap.has(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle boolean node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'weakMap.has(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle empty object node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

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
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      const node = {
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
        loc: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 10],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without property on callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

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
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

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
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

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
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

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
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('items'))], 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle multiple calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('items'))]))
      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createIdentifier('arr'))]))
      visitor.CallExpression(makeWeakMapHasCall([createIdentifier('value')]))

      expect(reports.length).toBe(2)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      const node = {
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
        range: [0, 18],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle number node', () => {
      const { context } = createMockRuleContext({ source: 'weakMap.has(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should handle spread of literal value', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.has(...items);' })
      const visitor = noUnnecessaryWeakMapHasSpreadRule.create(context)

      visitor.CallExpression(makeWeakMapHasCall([createSpreadElement(createLiteral(42))]))

      expect(reports.length).toBe(1)
    })
  })
})

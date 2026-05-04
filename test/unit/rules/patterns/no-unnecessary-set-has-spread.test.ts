

import { noUnnecessarySetHasSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-set-has-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function makeSetHasCall(args: unknown[], line = 1, column = 0): unknown {
  const objectEnd = column + 'set'.length
  const propertyEnd = objectEnd + '.has'.length
  const callEnd = propertyEnd + '(...)'.length

  return {
    arguments: args,
    callee: {
      computed: false,
      object: {
        name: 'set',
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

describe('no-unnecessary-set-has-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessarySetHasSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessarySetHasSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessarySetHasSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessarySetHasSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessarySetHasSpreadRule.meta.schema).toBeDefined()
    })

    test('should have empty schema array', () => {
      expect(noUnnecessarySetHasSpreadRule.meta.schema).toEqual([])
    })

    test('should mention set.has in description', () => {
      expect(noUnnecessarySetHasSpreadRule.meta.docs?.description.toLowerCase()).toContain('set.has')
    })

    test('should mention spread in description', () => {
      expect(noUnnecessarySetHasSpreadRule.meta.docs?.description.toLowerCase()).toContain('spread')
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'set.has(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'set.has(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detecting set.has with single spread argument', () => {
    test('should report set.has(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('set.has(...items)')
      expect(reports[0].message).toContain('Consider passing the value directly')
    })

    test('should report set.has(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...arr);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('arr'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.has(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...data);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('data'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.has(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...values);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('values'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.has(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...list);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('list'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.has(...elements)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...elements);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('elements'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.has(...nums)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...nums);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('nums'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.has(...result)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...result);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('result'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.has(...collection)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...collection);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('collection'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.has(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...args);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('args'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.has(...entries)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...entries);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('entries'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.has(...chunks)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...chunks);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('chunks'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.has(...buffer)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...buffer);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('buffer'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.has(...rows)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...rows);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('rows'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.has(...options)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...options);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('options'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.has(...output)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...output);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('output'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.has(...array)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...array);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('array'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.has(...tuple)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...tuple);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('tuple'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.has(...filtered)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...filtered);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('filtered'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.has(...mapped)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...mapped);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('mapped'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.has(...nested)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...nested);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('nested'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.has(...flat)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...flat);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('flat'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.has(...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...rest);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('rest'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.has(...extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...extra);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('extra'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.has(...unique)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...unique);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('unique'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.has(...source)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...source);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('source'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.has(...input)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...input);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('input'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.has(...combined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...combined);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('combined'))]))

      expect(reports.length).toBe(1)
    })

  })

  describe('not reporting non-matching calls', () => {
    test('should not report set.has(1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(1);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createLiteral(1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.has("hello")', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has("hello");' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createLiteral('hello')]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.has(item)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(item);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createIdentifier('item')]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.has(1, 2)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(1, 2);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createLiteral(1), createLiteral(2)]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.has(a, b)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(a, b);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createIdentifier('a'), createIdentifier('b')]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.has(1, 2, 3)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(1, 2, 3);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createLiteral(1), createLiteral(2), createLiteral(3)]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.has(...items, extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...items, extra);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('items')), createIdentifier('extra')]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.has(first, ...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(first, ...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createIdentifier('first'), createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.has()', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has();' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([]))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.has(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.has(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

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

    test('should not report mySet.has(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'mySet.has(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'mySet',
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

    test('should not report set.push(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.push(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'set',
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

    test('should not report set.add(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'set',
            type: 'Identifier',
          },
          property: {
            name: 'add',
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

    test('should not report set.delete(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

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
        loc: { end: { column: 24, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 24],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report set.clear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.clear(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'set',
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

    test('should not report set.forEach(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.forEach(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'set',
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

    test('should not report set.entries(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.entries(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'set',
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

    test('should not report set.values(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.values(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'set',
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

    test('should not report set.keys(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.keys(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'set',
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

    test('should not report set.size(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.size(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'set',
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
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

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
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

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
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

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
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

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

    test('should not report set.has(true)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(true);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createLiteral(true)]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.has(null)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(null);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createLiteral(null)]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.has(42)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(42);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createLiteral(42)]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.has(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(0);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createLiteral(0)]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.has(-1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(-1);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createLiteral(-1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.has(value)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(value);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createIdentifier('value')]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.has(x, y)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(x, y);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createIdentifier('x'), createIdentifier('y')]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.has(foo, bar, baz)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(foo, bar, baz);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createIdentifier('foo'), createIdentifier('bar'), createIdentifier('baz')]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.has(item, ...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(item, ...rest);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createIdentifier('item'), createSpreadElement(createIdentifier('rest'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report set["has"](...items) with computed property', () => {
      const { context, reports } = createMockRuleContext({ source: 'set["has"](...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: true,
          object: {
            name: 'set',
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

    test('should not report map.has(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

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

    test('should not report weakSet.has(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.has(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'weakSet',
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
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

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
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

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

    test('should not report set.indexOf(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.indexOf(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'set',
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
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

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
      const { context } = createMockRuleContext({ source: 'set.has(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'set.has(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      expect(() => visitor.CallExpression()).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'set.has(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle boolean node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'set.has(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle empty object node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

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
      const { context, reports } = createMockRuleContext({ source: 'set.has(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      const node = {
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
        loc: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 10],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without property on callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          object: {
            name: 'set',
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
      const { context, reports } = createMockRuleContext({ source: 'set.has(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

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
      const { context, reports } = createMockRuleContext({ source: 'set.has(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

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
      const { context, reports } = createMockRuleContext({ source: 'set.has(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'set',
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
      const { context, reports } = createMockRuleContext({ source: 'set.has(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('items'))], 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle multiple calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('items'))]))
      visitor.CallExpression(makeSetHasCall([createSpreadElement(createIdentifier('arr'))]))
      visitor.CallExpression(makeSetHasCall([createIdentifier('value')]))

      expect(reports.length).toBe(2)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      const node = {
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
        range: [0, 18],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle number node', () => {
      const { context } = createMockRuleContext({ source: 'set.has(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should handle spread of literal value', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...items);' })
      const visitor = noUnnecessarySetHasSpreadRule.create(context)

      visitor.CallExpression(makeSetHasCall([createSpreadElement(createLiteral(42))]))

      expect(reports.length).toBe(1)
    })
  })
})

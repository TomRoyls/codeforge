

import { noUnnecessarySetDeleteSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-set-delete-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function makeSetDeleteCall(args: unknown[], line = 1, column = 0): unknown {
  const objectEnd = column + 'set'.length
  const propertyEnd = objectEnd + '.delete'.length
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

describe('no-unnecessary-set-delete-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessarySetDeleteSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessarySetDeleteSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessarySetDeleteSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessarySetDeleteSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessarySetDeleteSpreadRule.meta.schema).toBeDefined()
    })

    test('should have empty schema array', () => {
      expect(noUnnecessarySetDeleteSpreadRule.meta.schema).toEqual([])
    })

    test('should mention set.delete in description', () => {
      expect(noUnnecessarySetDeleteSpreadRule.meta.docs?.description.toLowerCase()).toContain('set.delete')
    })

    test('should mention spread in description', () => {
      expect(noUnnecessarySetDeleteSpreadRule.meta.docs?.description.toLowerCase()).toContain('spread')
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'set.delete(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'set.delete(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detecting set.delete with single spread argument', () => {
    test('should report set.delete(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('set.delete(...items)')
      expect(reports[0].message).toContain('Consider passing the value directly')
    })

    test('should report set.delete(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...arr);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('arr'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.delete(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...data);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('data'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.delete(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...values);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('values'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.delete(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...list);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('list'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.delete(...elements)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...elements);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('elements'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.delete(...nums)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...nums);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('nums'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.delete(...result)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...result);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('result'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.delete(...collection)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...collection);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('collection'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.delete(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...args);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('args'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.delete(...entries)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...entries);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('entries'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.delete(...chunks)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...chunks);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('chunks'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.delete(...buffer)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...buffer);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('buffer'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.delete(...rows)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...rows);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('rows'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.delete(...options)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...options);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('options'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.delete(...output)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...output);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('output'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.delete(...array)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...array);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('array'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.delete(...tuple)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...tuple);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('tuple'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.delete(...filtered)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...filtered);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('filtered'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.delete(...mapped)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...mapped);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('mapped'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.delete(...nested)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...nested);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('nested'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.delete(...flat)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...flat);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('flat'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.delete(...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...rest);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('rest'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.delete(...extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...extra);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('extra'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.delete(...unique)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...unique);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('unique'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.delete(...source)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...source);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('source'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.delete(...input)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...input);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('input'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.delete(...combined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...combined);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('combined'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.delete(...all)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...all);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('all'))]))

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting non-matching calls', () => {
    test('should not report set.delete(1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(1);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createLiteral(1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.delete("hello")', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete("hello");' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createLiteral('hello')]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.delete(item)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(item);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createIdentifier('item')]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.delete(1, 2)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(1, 2);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createLiteral(1), createLiteral(2)]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.delete(a, b)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(a, b);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createIdentifier('a'), createIdentifier('b')]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.delete(1, 2, 3)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(1, 2, 3);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createLiteral(1), createLiteral(2), createLiteral(3)]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.delete(...items, extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...items, extra);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('items')), createIdentifier('extra')]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.delete(first, ...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(first, ...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createIdentifier('first'), createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.delete()', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete();' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([]))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.delete(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.delete(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

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
        loc: { end: { column: 22, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 22],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report mySet.delete(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'mySet.delete(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'mySet',
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

    test('should not report set.push(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.push(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

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
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

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

    test('should not report set.has(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

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
        loc: { end: { column: 22, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 22],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report set.clear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.clear(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

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
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

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
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

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
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

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
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

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
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

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
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

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
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

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
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

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
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          name: 'delete',
          type: 'Identifier',
        },
        loc: { end: { column: 19, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 19],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report set.delete(true)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(true);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createLiteral(true)]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.delete(null)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(null);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createLiteral(null)]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.delete(42)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(42);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createLiteral(42)]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.delete(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(0);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createLiteral(0)]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.delete(-1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(-1);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createLiteral(-1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.delete(value)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(value);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createIdentifier('value')]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.delete(x, y)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(x, y);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createIdentifier('x'), createIdentifier('y')]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.delete(foo, bar, baz)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(foo, bar, baz);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createIdentifier('foo'), createIdentifier('bar'), createIdentifier('baz')]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.delete(item, ...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(item, ...rest);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createIdentifier('item'), createSpreadElement(createIdentifier('rest'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report set["delete"](...items) with computed property', () => {
      const { context, reports } = createMockRuleContext({ source: 'set["delete"](...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

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
            value: 'delete',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 26, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 26],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report map.delete(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

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

    test('should not report weakSet.delete(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'weakSet',
            type: 'Identifier',
          },
          property: {
            name: 'delete',
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

    test('should not report collection.delete(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'collection.delete(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

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
        loc: { end: { column: 30, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 30],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report arr.includes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.includes(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

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

    test('should not report set.splice(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.splice(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'set',
            type: 'Identifier',
          },
          property: {
            name: 'splice',
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
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'set.delete(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'set.delete(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      expect(() => visitor.CallExpression()).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'set.delete(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle boolean node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'set.delete(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle empty object node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { end: { column: 22, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          name: 'delete',
          type: 'Identifier',
        },
        loc: { end: { column: 22, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      const node = {
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
        loc: { end: { column: 12, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 12],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without property on callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          object: {
            name: 'set',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 22, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without object on callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          property: {
            name: 'delete',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 22, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-identifier object in callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

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
        loc: { end: { column: 22, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-identifier property in callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

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
            value: 'delete',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 22, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('items'))], 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle multiple calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('items'))]))
      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createIdentifier('arr'))]))
      visitor.CallExpression(makeSetDeleteCall([createIdentifier('value')]))

      expect(reports.length).toBe(2)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      const node = {
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
        range: [0, 20],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle number node', () => {
      const { context } = createMockRuleContext({ source: 'set.delete(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should handle spread of literal value', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...items);' })
      const visitor = noUnnecessarySetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeSetDeleteCall([createSpreadElement(createLiteral(42))]))

      expect(reports.length).toBe(1)
    })
  })
})

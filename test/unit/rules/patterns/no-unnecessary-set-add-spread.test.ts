

import { noUnnecessarySetAddSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-set-add-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function makeSetAddCall(args: unknown[], line = 1, column = 0): unknown {
  const objectEnd = column + 'set'.length
  const propertyEnd = objectEnd + '.add'.length
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
        name: 'add',
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

describe('no-unnecessary-set-add-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessarySetAddSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessarySetAddSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessarySetAddSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessarySetAddSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessarySetAddSpreadRule.meta.schema).toBeDefined()
    })

    test('should have empty schema array', () => {
      expect(noUnnecessarySetAddSpreadRule.meta.schema).toEqual([])
    })

    test('should mention set.add in description', () => {
      expect(noUnnecessarySetAddSpreadRule.meta.docs?.description.toLowerCase()).toContain('set.add')
    })

    test('should mention spread in description', () => {
      expect(noUnnecessarySetAddSpreadRule.meta.docs?.description.toLowerCase()).toContain('spread')
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'set.add(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'set.add(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detecting set.add with single spread argument', () => {
    test('should report set.add(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('set.add(...items)')
      expect(reports[0].message).toContain('Consider passing arguments directly')
    })

    test('should report set.add(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...arr);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('arr'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.add(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...data);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('data'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.add(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...values);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('values'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.add(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...list);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('list'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.add(...elements)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...elements);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('elements'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.add(...nums)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...nums);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('nums'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.add(...result)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...result);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('result'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.add(...collection)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...collection);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('collection'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.add(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...args);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('args'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.add(...entries)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...entries);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('entries'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.add(...chunks)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...chunks);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('chunks'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.add(...buffer)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...buffer);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('buffer'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.add(...rows)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...rows);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('rows'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.add(...options)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...options);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('options'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.add(...output)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...output);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('output'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.add(...array)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...array);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('array'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.add(...tuple)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...tuple);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('tuple'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.add(...filtered)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...filtered);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('filtered'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.add(...mapped)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...mapped);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('mapped'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.add(...nested)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...nested);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('nested'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.add(...flat)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...flat);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('flat'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.add(...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...rest);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('rest'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.add(...extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...extra);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('extra'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.add(...unique)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...unique);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('unique'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.add(...source)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...source);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('source'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.add(...input)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...input);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('input'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.add(...combined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...combined);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('combined'))]))

      expect(reports.length).toBe(1)
    })

    test('should report set.add(...all)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...all);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('all'))]))

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting non-matching calls', () => {
    test('should not report set.add(1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(1);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createLiteral(1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.add("hello")', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add("hello");' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createLiteral('hello')]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.add(item)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(item);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createIdentifier('item')]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.add(1, 2)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(1, 2);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createLiteral(1), createLiteral(2)]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.add(a, b)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(a, b);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createIdentifier('a'), createIdentifier('b')]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.add(1, 2, 3)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(1, 2, 3);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createLiteral(1), createLiteral(2), createLiteral(3)]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.add(...items, extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...items, extra);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('items')), createIdentifier('extra')]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.add(first, ...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(first, ...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createIdentifier('first'), createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.add()', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add();' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([]))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.add(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.add(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'obj',
            type: 'Identifier',
          },
          property: {
            name: 'add',
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

    test('should not report mySet.add(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'mySet.add(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'mySet',
            type: 'Identifier',
          },
          property: {
            name: 'add',
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
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

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

    test('should not report set.has(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.has(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

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

    test('should not report set.delete(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

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
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

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
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

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
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

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
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

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
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

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
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

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
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

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
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

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
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

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

    test('should not report direct add(...items) call', () => {
      const { context, reports } = createMockRuleContext({ source: 'add(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          name: 'add',
          type: 'Identifier',
        },
        loc: { end: { column: 16, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 16],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report set.add(true)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(true);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createLiteral(true)]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.add(null)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(null);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createLiteral(null)]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.add(42)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(42);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createLiteral(42)]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.add(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(0);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createLiteral(0)]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.add(-1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(-1);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createLiteral(-1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.add(value)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(value);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createIdentifier('value')]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.add(x, y)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(x, y);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createIdentifier('x'), createIdentifier('y')]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.add(foo, bar, baz)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(foo, bar, baz);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createIdentifier('foo'), createIdentifier('bar'), createIdentifier('baz')]))

      expect(reports.length).toBe(0)
    })

    test('should not report set.add(item, ...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(item, ...rest);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createIdentifier('item'), createSpreadElement(createIdentifier('rest'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report set["add"](...items) with computed property', () => {
      const { context, reports } = createMockRuleContext({ source: 'set["add"](...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

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
            value: 'add',
          },
          type: 'MemberExpression',
        },
        loc: { end: { column: 23, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 23],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report map.add(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.add(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'map',
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

    test('should not report weakSet.add(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.add(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'weakSet',
            type: 'Identifier',
          },
          property: {
            name: 'add',
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

    test('should not report collection.add(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'collection.add(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'collection',
            type: 'Identifier',
          },
          property: {
            name: 'add',
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

    test('should not report arr.concat(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.concat(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

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

    test('should not report set.includes(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.includes(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            name: 'set',
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
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'set.add(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'set.add(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      expect(() => visitor.CallExpression()).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'set.add(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle boolean node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'set.add(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle empty object node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          name: 'add',
          type: 'Identifier',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      const node = {
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
        loc: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 10],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without property on callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

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
      const { context, reports } = createMockRuleContext({ source: 'set.add(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          property: {
            name: 'add',
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
      const { context, reports } = createMockRuleContext({ source: 'set.add(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: {
            type: 'CallExpression',
          },
          property: {
            name: 'add',
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
      const { context, reports } = createMockRuleContext({ source: 'set.add(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

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
            value: 'add',
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
      const { context, reports } = createMockRuleContext({ source: 'set.add(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('items'))], 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle multiple calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('items'))]))
      visitor.CallExpression(makeSetAddCall([createSpreadElement(createIdentifier('arr'))]))
      visitor.CallExpression(makeSetAddCall([createIdentifier('value')]))

      expect(reports.length).toBe(2)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      const node = {
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
        range: [0, 18],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle number node', () => {
      const { context } = createMockRuleContext({ source: 'set.add(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should handle spread of literal value', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.add(...items);' })
      const visitor = noUnnecessarySetAddSpreadRule.create(context)

      visitor.CallExpression(makeSetAddCall([createSpreadElement(createLiteral(42))]))

      expect(reports.length).toBe(1)
    })
  })
})


import { noUnnecessaryWeakSetDeleteSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-weakset-delete-spread.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function makeWeakSetDeleteCall(args: unknown[], line = 1, column = 0): unknown {
  const objectEnd = column + 'weakSet'.length
  const propertyEnd = objectEnd + '.delete'.length
  const callEnd = propertyEnd + '(...)'.length

  return {
    arguments: args,
    callee: {
      computed: false,
      object: {
        name: 'weakSet',
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

describe('no-unnecessary-weakset-delete-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryWeakSetDeleteSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryWeakSetDeleteSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryWeakSetDeleteSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryWeakSetDeleteSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryWeakSetDeleteSpreadRule.meta.schema).toBeDefined()
    })

    test('should have empty schema array', () => {
      expect(noUnnecessaryWeakSetDeleteSpreadRule.meta.schema).toEqual([])
    })

    test('should mention weakSet.delete in description', () => {
      expect(noUnnecessaryWeakSetDeleteSpreadRule.meta.docs?.description.toLowerCase()).toContain('weakset.delete')
    })

    test('should mention spread in description', () => {
      expect(noUnnecessaryWeakSetDeleteSpreadRule.meta.docs?.description.toLowerCase()).toContain('spread')
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'weakSet.delete(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'weakSet.delete(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detecting weakSet.delete with single spread argument', () => {
    test('should report weakSet.delete(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('weakSet.delete(...items)')
      expect(reports[0].message).toContain('Consider passing the value directly')
    })

    test('should report weakSet.delete(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...arr);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('arr'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakSet.delete(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...data);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('data'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakSet.delete(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...values);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('values'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakSet.delete(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...list);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('list'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakSet.delete(...elements)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...elements);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('elements'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakSet.delete(...nums)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...nums);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('nums'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakSet.delete(...result)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...result);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('result'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakSet.delete(...collection)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...collection);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('collection'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakSet.delete(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...args);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('args'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakSet.delete(...entries)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...entries);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('entries'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakSet.delete(...chunks)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...chunks);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('chunks'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakSet.delete(...buffer)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...buffer);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('buffer'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakSet.delete(...rows)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...rows);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('rows'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakSet.delete(...options)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...options);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('options'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakSet.delete(...output)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...output);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('output'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakSet.delete(...array)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...array);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('array'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakSet.delete(...tuple)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...tuple);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('tuple'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakSet.delete(...filtered)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...filtered);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('filtered'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakSet.delete(...mapped)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...mapped);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('mapped'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakSet.delete(...nested)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...nested);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('nested'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakSet.delete(...flat)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...flat);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('flat'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakSet.delete(...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...rest);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('rest'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakSet.delete(...extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...extra);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('extra'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakSet.delete(...unique)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...unique);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('unique'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakSet.delete(...source)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...source);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('source'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakSet.delete(...input)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...input);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('input'))]))

      expect(reports.length).toBe(1)
    })

    test('should report weakSet.delete(...combined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...combined);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('combined'))]))

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting non-matching calls', () => {
    test('should not report weakSet.delete(1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(1);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createLiteral(1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakSet.delete("hello")', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete("hello");' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createLiteral('hello')]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakSet.delete(item)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(item);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createIdentifier('item')]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakSet.delete(1, 2)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(1, 2);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createLiteral(1), createLiteral(2)]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakSet.delete(a, b)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(a, b);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createIdentifier('a'), createIdentifier('b')]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakSet.delete(1, 2, 3)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(1, 2, 3);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createLiteral(1), createLiteral(2), createLiteral(3)]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakSet.delete(...items, extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...items, extra);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('items')), createIdentifier('extra')]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakSet.delete(first, ...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(first, ...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createIdentifier('first'), createSpreadElement(createIdentifier('items'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakSet.delete()', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete();' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([]))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.delete(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.delete(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'obj', type: 'Identifier' },
          property: { name: 'delete', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 22, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 22],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report myWeakSet.delete(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'myWeakSet.delete(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'myWeakSet', type: 'Identifier' },
          property: { name: 'delete', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 28, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 28],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report weakSet.push(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.push(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'weakSet', type: 'Identifier' },
          property: { name: 'push', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 25, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 25],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report weakSet.add(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.add(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'weakSet', type: 'Identifier' },
          property: { name: 'add', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 24, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 24],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report weakSet.has(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.has(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'weakSet', type: 'Identifier' },
          property: { name: 'has', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 25, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 25],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report weakSet.clear(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.clear(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'weakSet', type: 'Identifier' },
          property: { name: 'clear', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 26, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 26],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report weakSet.forEach(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.forEach(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'weakSet', type: 'Identifier' },
          property: { name: 'forEach', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 28, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 28],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report weakSet.entries(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.entries(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'weakSet', type: 'Identifier' },
          property: { name: 'entries', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 28, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 28],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report weakSet.values(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.values(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'weakSet', type: 'Identifier' },
          property: { name: 'values', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 27, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 27],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report weakSet.keys(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.keys(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'weakSet', type: 'Identifier' },
          property: { name: 'keys', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 25, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 25],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report weakSet.size(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.size(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'weakSet', type: 'Identifier' },
          property: { name: 'size', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 25, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 25],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.delete(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'weakMap', type: 'Identifier' },
          property: { name: 'delete', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 27, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 27],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report arr.map(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.map(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'arr', type: 'Identifier' },
          property: { name: 'map', type: 'Identifier' },
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
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'arr', type: 'Identifier' },
          property: { name: 'filter', type: 'Identifier' },
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
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'arr', type: 'Identifier' },
          property: { name: 'reduce', type: 'Identifier' },
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
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: { name: 'delete', type: 'Identifier' },
        loc: { end: { column: 19, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 19],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report weakSet.delete(true)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(true);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createLiteral(true)]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakSet.delete(null)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(null);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createLiteral(null)]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakSet.delete(42)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(42);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createLiteral(42)]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakSet.delete(0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(0);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createLiteral(0)]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakSet.delete(-1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(-1);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createLiteral(-1)]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakSet.delete(value)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(value);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createIdentifier('value')]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakSet.delete(x, y)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(x, y);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createIdentifier('x'), createIdentifier('y')]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakSet.delete(foo, bar, baz)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(foo, bar, baz);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createIdentifier('foo'), createIdentifier('bar'), createIdentifier('baz')]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakSet.delete(item, ...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(item, ...rest);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createIdentifier('item'), createSpreadElement(createIdentifier('rest'))]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakSet["delete"](...items) with computed property', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet["delete"](...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: true,
          object: { name: 'weakSet', type: 'Identifier' },
          property: { type: 'Literal', value: 'delete' },
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
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'map', type: 'Identifier' },
          property: { name: 'delete', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 24, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 24],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report set.delete(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'set.delete(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'set', type: 'Identifier' },
          property: { name: 'delete', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 24, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 24],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report collection.delete(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'collection.delete(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'collection', type: 'Identifier' },
          property: { name: 'delete', type: 'Identifier' },
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
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'arr', type: 'Identifier' },
          property: { name: 'includes', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 25, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 25],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })

    test('should not report weakSet.splice(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.splice(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression({
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'weakSet', type: 'Identifier' },
          property: { name: 'splice', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 27, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 27],
        type: 'CallExpression',
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'weakSet.delete(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'weakSet.delete(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      expect(() => visitor.CallExpression()).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'weakSet.delete(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle boolean node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'weakSet.delete(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle empty object node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        loc: { end: { column: 25, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: { name: 'delete', type: 'Identifier' },
        loc: { end: { column: 25, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      const node = {
        callee: {
          computed: false,
          object: { name: 'weakSet', type: 'Identifier' },
          property: { name: 'delete', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 15, line: 1 }, start: { column: 0, line: 1 } },
        range: [0, 15],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without property on callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          object: { name: 'weakSet', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 25, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without object on callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          property: { name: 'delete', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 25, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-identifier object in callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { type: 'CallExpression' },
          property: { name: 'delete', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 25, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-identifier property in callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'weakSet', type: 'Identifier' },
          property: { type: 'Literal', value: 'delete' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 25, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('items'))], 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle multiple calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('items'))]))
      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createIdentifier('arr'))]))
      visitor.CallExpression(makeWeakSetDeleteCall([createIdentifier('value')]))

      expect(reports.length).toBe(2)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      const node = {
        arguments: [createSpreadElement(createIdentifier('items'))],
        callee: {
          computed: false,
          object: { name: 'weakSet', type: 'Identifier' },
          property: { name: 'delete', type: 'Identifier' },
          type: 'MemberExpression',
        },
        range: [0, 25],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle number node', () => {
      const { context } = createMockRuleContext({ source: 'weakSet.delete(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should handle spread of literal value', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakSet.delete(...items);' })
      const visitor = noUnnecessaryWeakSetDeleteSpreadRule.create(context)

      visitor.CallExpression(makeWeakSetDeleteCall([createSpreadElement(createLiteral(42))]))

      expect(reports.length).toBe(1)
    })
  })
})


import { noUnnecessaryMapDeleteSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-map-delete-spread.js'
import { createMockRuleContext } from '../../../helpers/ast-helpers.js'

function makeMapDeleteCall(args: unknown[] = [], line = 1, column = 0): unknown {
  return {
    arguments: args,
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
    loc: {
      end: { column: column + 20, line },
      start: { column, line },
    },
    range: [column, column + 20],
    type: 'CallExpression',
  }
}

function makeSpreadArg(argName = 'items'): unknown {
  return {
    argument: {
      name: argName,
      type: 'Identifier',
    },
    type: 'SpreadElement',
  }
}

function makeIdentifierArg(name: string): unknown {
  return {
    name,
    type: 'Identifier',
  }
}

function makeLiteralArg(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function makeCallWithObjectName(objectName: string, args: unknown[] = []): unknown {
  return {
    arguments: args,
    callee: {
      computed: false,
      object: {
        name: objectName,
        type: 'Identifier',
      },
      property: {
        name: 'delete',
        type: 'Identifier',
      },
      type: 'MemberExpression',
    },
    loc: {
      end: { column: 20, line: 1 },
      start: { column: 0, line: 1 },
    },
    type: 'CallExpression',
  }
}

function makeCallWithMethodName(methodName: string, args: unknown[] = []): unknown {
  return {
    arguments: args,
    callee: {
      computed: false,
      object: {
        name: 'map',
        type: 'Identifier',
      },
      property: {
        name: methodName,
        type: 'Identifier',
      },
      type: 'MemberExpression',
    },
    loc: {
      end: { column: 20, line: 1 },
      start: { column: 0, line: 1 },
    },
    type: 'CallExpression',
  }
}

function makeCallWithComputedProperty(args: unknown[] = []): unknown {
  return {
    arguments: args,
    callee: {
      computed: true,
      object: {
        name: 'map',
        type: 'Identifier',
      },
      property: {
        type: 'Literal',
        value: 'delete',
      },
      type: 'MemberExpression',
    },
    loc: {
      end: { column: 20, line: 1 },
      start: { column: 0, line: 1 },
    },
    type: 'CallExpression',
  }
}

function makeDirectCall(args: unknown[] = []): unknown {
  return {
    arguments: args,
    callee: {
      name: 'delete',
      type: 'Identifier',
    },
    loc: {
      end: { column: 20, line: 1 },
      start: { column: 0, line: 1 },
    },
    type: 'CallExpression',
  }
}

describe('no-unnecessary-map-delete-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryMapDeleteSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryMapDeleteSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryMapDeleteSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryMapDeleteSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryMapDeleteSpreadRule.meta.schema).toBeDefined()
    })

    test('should have meta property', () => {
      expect(noUnnecessaryMapDeleteSpreadRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(noUnnecessaryMapDeleteSpreadRule).toHaveProperty('create')
    })

    test('should have docs with url', () => {
      expect(noUnnecessaryMapDeleteSpreadRule.meta.docs?.url).toBeDefined()
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'map.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'map.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detecting map.delete with single spread argument', () => {
    test('should report map.delete(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('items')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('map.delete')
      expect(reports[0].message).toContain('spread')
    })

    test('should report map.delete(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...args);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('args')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.delete(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...data);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('data')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.delete(...params)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...params);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('params')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.delete(...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...rest);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('rest')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.delete(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...values);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('values')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.delete(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...arr);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('arr')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.delete(...options)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...options);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('options')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.delete(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...list);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('list')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.delete(...extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...extra);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('extra')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.delete(...obj)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...obj);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('obj')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.delete(...config)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...config);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('config')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.delete(...result)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...result);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('result')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.delete(...payload)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...payload);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('payload')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.delete(...input)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...input);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('input')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.delete(...stuff)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...stuff);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('stuff')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.delete(...elements)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...elements);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('elements')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.delete(...chunks)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...chunks);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('chunks')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.delete(...entries)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...entries);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('entries')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.delete(...rows)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...rows);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('rows')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.delete(...buffer)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...buffer);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('buffer')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.delete(...collection)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...collection);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('collection')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.delete(...nums)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...nums);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('nums')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.delete(...fields)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...fields);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('fields')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.delete(...parts)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...parts);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('parts')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.delete(...segments)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...segments);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('segments')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.delete(...pieces)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...pieces);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('pieces')]))

      expect(reports.length).toBe(1)
    })

    test('should report map.delete(...bits)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...bits);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('bits')]))

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting valid map.delete calls', () => {
    test('should not report map.delete() with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete();' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.delete(...items, extra) with two arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...items, extra);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('items'), makeIdentifierArg('extra')]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.delete(arg) with identifier argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(arg);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeIdentifierArg('arg')]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.delete("key") with literal argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete("key");' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeLiteralArg('key')]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.delete(42) with numeric literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(42);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeLiteralArg(42)]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.delete(true) with boolean literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(true);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeLiteralArg(true)]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.delete(null) with null literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(null);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeLiteralArg(null)]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.delete(undefined) with undefined literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(undefined);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeIdentifierArg('undefined')]))

      expect(reports.length).toBe(0)
    })

    test('should not report myMap.delete(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'myMap.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('myMap', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report m.delete(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'm.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('m', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report cache.delete(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'cache.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('cache', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report store.delete(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'store.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('store', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.set(...items) with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithMethodName('set', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.get(...items) with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithMethodName('get', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.has(...items) with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithMethodName('has', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.clear(...items) with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.clear(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithMethodName('clear', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.forEach(...items) with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithMethodName('forEach', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.entries(...items) with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.entries(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithMethodName('entries', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.keys(...items) with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.keys(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithMethodName('keys', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.values(...items) with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.values(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithMethodName('values', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.size(...items) with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.size(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithMethodName('size', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report computed property access map["delete"](...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map["delete"](...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithComputedProperty([makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report direct function call delete(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeDirectCall([makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report map.delete() with empty args', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete();' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([]))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.delete(...items) with non-map object', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('obj', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report data.delete(...items) with data object', () => {
      const { context, reports } = createMockRuleContext({ source: 'data.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('data', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report item.delete(...items) with item object', () => {
      const { context, reports } = createMockRuleContext({ source: 'item.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('item', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report result.delete(...items) with result object', () => {
      const { context, reports } = createMockRuleContext({ source: 'result.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('result', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report value.delete(...items) with value object', () => {
      const { context, reports } = createMockRuleContext({ source: 'value.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('value', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report element.delete(...items) with element object', () => {
      const { context, reports } = createMockRuleContext({ source: 'element.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('element', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report entry.delete(...items) with entry object', () => {
      const { context, reports } = createMockRuleContext({ source: 'entry.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('entry', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report node.delete(...items) with node object', () => {
      const { context, reports } = createMockRuleContext({ source: 'node.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('node', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report self.delete(...items) with self object', () => {
      const { context, reports } = createMockRuleContext({ source: 'self.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('self', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report this.delete(...items) with this object', () => {
      const { context, reports } = createMockRuleContext({ source: 'this.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('this', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report record.delete(...items) with record object', () => {
      const { context, reports } = createMockRuleContext({ source: 'record.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('record', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report row.delete(...items) with row object', () => {
      const { context, reports } = createMockRuleContext({ source: 'row.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('row', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.delete(...items) with weakMap object', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('weakMap', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report registry.delete(...items) with registry object', () => {
      const { context, reports } = createMockRuleContext({ source: 'registry.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('registry', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report dict.delete(...items) with dict object', () => {
      const { context, reports } = createMockRuleContext({ source: 'dict.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('dict', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report instance.delete(...items) with instance object', () => {
      const { context, reports } = createMockRuleContext({ source: 'instance.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('instance', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadArg('items')],
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      const node = {
        callee: {
          computed: false,
          object: { name: 'map', type: 'Identifier' },
          property: { name: 'delete', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadArg('items')],
        callee: {
          computed: false,
          object: { name: 'map', type: 'Identifier' },
          property: { name: 'delete', type: 'Identifier' },
          type: 'MemberExpression',
        },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with non-Identifier object', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadArg('items')],
        callee: {
          computed: false,
          object: { type: 'ThisExpression' },
          property: { name: 'delete', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier property', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadArg('items')],
        callee: {
          computed: false,
          object: { name: 'map', type: 'Identifier' },
          property: { type: 'Literal', value: 'delete' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext({ source: 'map.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle number node', () => {
      const { context } = createMockRuleContext({ source: 'map.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should handle non-CallExpression type', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadArg('items')],
        callee: {
          computed: false,
          object: { name: 'map', type: 'Identifier' },
          property: { name: 'delete', type: 'Identifier' },
          type: 'MemberExpression',
        },
        type: 'NewExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('items')], 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle multiple calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('items')]))
      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('args')]))
      visitor.CallExpression(makeMapDeleteCall([makeIdentifierArg('value')]))
      visitor.CallExpression(makeMapDeleteCall([]))

      expect(reports.length).toBe(2)
    })

    test('should contain the expected message', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      visitor.CallExpression(makeMapDeleteCall([makeSpreadArg('items')]))

      expect(reports[0].message).toBe(
        'map.delete(...items) with a single spread is unusual. Consider passing the key directly.',
      )
    })

    test('should handle node without callee property', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...items);' })
      const visitor = noUnnecessaryMapDeleteSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadArg('items')],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should return new visitor each time create is called', () => {
      const { context } = createMockRuleContext({ source: 'map.delete(...items);' })
      const visitor1 = noUnnecessaryMapDeleteSpreadRule.create(context)
      const visitor2 = noUnnecessaryMapDeleteSpreadRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })
  })
})


import { noUnnecessaryDateToJSONSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-to-json-spread.js'
import { createMockRuleContext } from '../../../helpers/ast-helpers.js'

function makeDateToJSONCall(args: unknown[] = [], line = 1, column = 0): unknown {
  return {
    arguments: args,
    callee: {
      computed: false,
      object: {
        name: 'date',
        type: 'Identifier',
      },
      property: {
        name: 'toJSON',
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
        name: 'toJSON',
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
        name: 'date',
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
        name: 'date',
        type: 'Identifier',
      },
      property: {
        type: 'Literal',
        value: 'toJSON',
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
      name: 'toJSON',
      type: 'Identifier',
    },
    loc: {
      end: { column: 20, line: 1 },
      start: { column: 0, line: 1 },
    },
    type: 'CallExpression',
  }
}

describe('no-unnecessary-date-to-json-spread rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryDateToJSONSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryDateToJSONSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryDateToJSONSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryDateToJSONSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryDateToJSONSpreadRule.meta.schema).toBeDefined()
    })

    test('should have meta property', () => {
      expect(noUnnecessaryDateToJSONSpreadRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(noUnnecessaryDateToJSONSpreadRule).toHaveProperty('create')
    })

    test('should have docs with url', () => {
      expect(noUnnecessaryDateToJSONSpreadRule.meta.docs?.url).toBeDefined()
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'date.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'date.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('detecting date.toJSON with single spread argument', () => {
    test('should report date.toJSON(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('items')]))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('date.toJSON')
      expect(reports[0].message).toContain('spread')
    })

    test('should report date.toJSON(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...args);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('args')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toJSON(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...data);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('data')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toJSON(...params)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...params);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('params')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toJSON(...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...rest);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('rest')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toJSON(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...values);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('values')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toJSON(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...arr);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('arr')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toJSON(...options)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...options);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('options')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toJSON(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...list);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('list')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toJSON(...extra)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...extra);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('extra')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toJSON(...obj)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...obj);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('obj')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toJSON(...config)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...config);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('config')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toJSON(...result)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...result);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('result')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toJSON(...payload)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...payload);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('payload')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toJSON(...input)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...input);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('input')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toJSON(...stuff)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...stuff);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('stuff')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toJSON(...elements)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...elements);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('elements')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toJSON(...chunks)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...chunks);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('chunks')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toJSON(...entries)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...entries);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('entries')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toJSON(...rows)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...rows);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('rows')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toJSON(...buffer)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...buffer);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('buffer')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toJSON(...collection)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...collection);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('collection')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toJSON(...nums)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...nums);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('nums')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toJSON(...fields)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...fields);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('fields')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toJSON(...parts)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...parts);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('parts')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toJSON(...segments)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...segments);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('segments')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toJSON(...pieces)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...pieces);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('pieces')]))

      expect(reports.length).toBe(1)
    })

    test('should report date.toJSON(...bits)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...bits);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('bits')]))

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting valid date.toJSON calls', () => {
    test('should not report date.toJSON() with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON();' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toJSON(...items, extra) with two arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...items, extra);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('items'), makeIdentifierArg('extra')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toJSON(arg) with identifier argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(arg);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeIdentifierArg('arg')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toJSON("key") with literal argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON("key");' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeLiteralArg('key')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toJSON(42) with numeric literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(42);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeLiteralArg(42)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toJSON(true) with boolean literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(true);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeLiteralArg(true)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toJSON(null) with null literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(null);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeLiteralArg(null)]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toJSON(undefined) with undefined literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(undefined);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeIdentifierArg('undefined')]))

      expect(reports.length).toBe(0)
    })

    test('should not report myDate.toJSON(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'myDate.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('myDate', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report d.toJSON(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'd.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('d', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report dt.toJSON(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'dt.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('dt', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report timestamp.toJSON(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'timestamp.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('timestamp', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toString(...items) with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toString(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithMethodName('toString', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toISOString(...items) with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toISOString(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithMethodName('toISOString', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toLocaleString(...items) with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toLocaleString(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithMethodName('toLocaleString', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toDateString(...items) with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toDateString(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithMethodName('toDateString', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toTimeString(...items) with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toTimeString(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithMethodName('toTimeString', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getTime(...items) with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getTime(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithMethodName('getTime', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.valueOf(...items) with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.valueOf(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithMethodName('valueOf', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.getFullYear(...items) with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.getFullYear(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithMethodName('getFullYear', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.setFullYear(...items) with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.setFullYear(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithMethodName('setFullYear', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report computed property access date["toJSON"](...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'date["toJSON"](...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithComputedProperty([makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report direct function call toJSON(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDirectCall([makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report date.toJSON() with empty args', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON();' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([]))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.toJSON(...items) with non-date object', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('obj', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report data.toJSON(...items) with data object', () => {
      const { context, reports } = createMockRuleContext({ source: 'data.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('data', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report item.toJSON(...items) with item object', () => {
      const { context, reports } = createMockRuleContext({ source: 'item.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('item', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report result.toJSON(...items) with result object', () => {
      const { context, reports } = createMockRuleContext({ source: 'result.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('result', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report value.toJSON(...items) with value object', () => {
      const { context, reports } = createMockRuleContext({ source: 'value.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('value', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report element.toJSON(...items) with element object', () => {
      const { context, reports } = createMockRuleContext({ source: 'element.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('element', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report entry.toJSON(...items) with entry object', () => {
      const { context, reports } = createMockRuleContext({ source: 'entry.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('entry', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report node.toJSON(...items) with node object', () => {
      const { context, reports } = createMockRuleContext({ source: 'node.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('node', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report self.toJSON(...items) with self object', () => {
      const { context, reports } = createMockRuleContext({ source: 'self.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('self', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report this.toJSON(...items) with this object', () => {
      const { context, reports } = createMockRuleContext({ source: 'this.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('this', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report record.toJSON(...items) with record object', () => {
      const { context, reports } = createMockRuleContext({ source: 'record.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('record', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report row.toJSON(...items) with row object', () => {
      const { context, reports } = createMockRuleContext({ source: 'row.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('row', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report document.toJSON(...items) with document object', () => {
      const { context, reports } = createMockRuleContext({ source: 'document.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('document', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report entity.toJSON(...items) with entity object', () => {
      const { context, reports } = createMockRuleContext({ source: 'entity.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('entity', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report model.toJSON(...items) with model object', () => {
      const { context, reports } = createMockRuleContext({ source: 'model.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('model', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report instance.toJSON(...items) with instance object', () => {
      const { context, reports } = createMockRuleContext({ source: 'instance.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('instance', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })

    test('should not report prototype.toJSON(...items) with prototype object', () => {
      const { context, reports } = createMockRuleContext({ source: 'prototype.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeCallWithObjectName('prototype', [makeSpreadArg('items')]))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadArg('items')],
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      const node = {
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'toJSON', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadArg('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'toJSON', type: 'Identifier' },
          type: 'MemberExpression',
        },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with non-Identifier object', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadArg('items')],
        callee: {
          computed: false,
          object: { type: 'ThisExpression' },
          property: { name: 'toJSON', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadArg('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { type: 'Literal', value: 'toJSON' },
          type: 'MemberExpression',
        },
        loc: { end: { column: 20, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext({ source: 'date.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle number node', () => {
      const { context } = createMockRuleContext({ source: 'date.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should handle non-CallExpression type', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadArg('items')],
        callee: {
          computed: false,
          object: { name: 'date', type: 'Identifier' },
          property: { name: 'toJSON', type: 'Identifier' },
          type: 'MemberExpression',
        },
        type: 'NewExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('items')], 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle multiple calls correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('items')]))
      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('args')]))
      visitor.CallExpression(makeDateToJSONCall([makeIdentifierArg('value')]))
      visitor.CallExpression(makeDateToJSONCall([]))

      expect(reports.length).toBe(2)
    })

    test('should contain the expected message', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      visitor.CallExpression(makeDateToJSONCall([makeSpreadArg('items')]))

      expect(reports[0].message).toBe(
        'date.toJSON(...items) with a single spread is unusual. Consider calling date.toJSON() directly.',
      )
    })

    test('should handle node without callee property', () => {
      const { context, reports } = createMockRuleContext({ source: 'date.toJSON(...items);' })
      const visitor = noUnnecessaryDateToJSONSpreadRule.create(context)

      const node = {
        arguments: [makeSpreadArg('items')],
        type: 'CallExpression',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should return new visitor each time create is called', () => {
      const { context } = createMockRuleContext({ source: 'date.toJSON(...items);' })
      const visitor1 = noUnnecessaryDateToJSONSpreadRule.create(context)
      const visitor2 = noUnnecessaryDateToJSONSpreadRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })
  })
})

import { describe, expect, test } from 'vitest'
import { noUnnecessaryMapGetSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-map-get-spread.js'
import { createMockRuleContext } from '../../../helpers/ast-helpers.js'

function makeMapGetCall(overrides: {
  objectName?: string
  propertyName?: string
  args?: unknown[]
  computed?: boolean
  calleeType?: string
  objectType?: string
  propertyType?: string
  loc?: unknown
} = {}): unknown {
  const {
    objectName = 'map',
    propertyName = 'get',
    args = [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
    computed = false,
    calleeType = 'MemberExpression',
    objectType = 'Identifier',
    propertyType = 'Identifier',
  } = overrides

  return {
    type: 'CallExpression',
    callee: {
      type: calleeType,
      computed,
      object: {
        type: objectType,
        name: objectName,
      },
      property: {
        type: propertyType,
        name: propertyName,
      },
    },
    arguments: args,
    loc: overrides.loc ?? {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 20 },
    },
  }
}

function createSpreadArg(name: string): unknown {
  return { type: 'SpreadElement', argument: { type: 'Identifier', name } }
}

function createIdentifierArg(name: string): unknown {
  return { type: 'Identifier', name }
}

function createLiteralArg(value: unknown): unknown {
  return { type: 'Literal', value }
}

describe('no-unnecessary-map-get-spread rule', () => {
  // 8 meta tests
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryMapGetSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryMapGetSpreadRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryMapGetSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryMapGetSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryMapGetSpreadRule.meta.schema).toBeDefined()
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryMapGetSpreadRule.meta.schema).toEqual([])
    })

    test('should mention map.get in description', () => {
      expect(noUnnecessaryMapGetSpreadRule.meta.docs?.description.toLowerCase()).toContain('map.get')
    })

    test('should have docs url', () => {
      expect(noUnnecessaryMapGetSpreadRule.meta.docs?.url).toBeDefined()
    })
  })

  // 2 structure tests
  describe('structure', () => {
    test('should return visitor with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'map.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'map.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  // 28 positive tests — should report
  describe('detecting map.get with single spread argument', () => {
    test('should report map.get(...items)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('map.get(...items)')
      expect(reports[0].message).toContain('spread')
    })

    test('should report map.get(...keys)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...keys)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('keys')] }))

      expect(reports.length).toBe(1)
    })

    test('should report map.get(...args)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...args)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('args')] }))

      expect(reports.length).toBe(1)
    })

    test('should report map.get(...data)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...data)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('data')] }))

      expect(reports.length).toBe(1)
    })

    test('should report map.get(...params)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...params)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('params')] }))

      expect(reports.length).toBe(1)
    })

    test('should report map.get(...list)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...list)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('list')] }))

      expect(reports.length).toBe(1)
    })

    test('should report map.get(...values)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...values)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('values')] }))

      expect(reports.length).toBe(1)
    })

    test('should report map.get(...arr)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...arr)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('arr')] }))

      expect(reports.length).toBe(1)
    })

    test('should report map.get(...result)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...result)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('result')] }))

      expect(reports.length).toBe(1)
    })

    test('should report map.get(...entries)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...entries)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('entries')] }))

      expect(reports.length).toBe(1)
    })

    test('should report map.get(...x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...x)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('x')] }))

      expect(reports.length).toBe(1)
    })

    test('should report map.get(...tuple)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...tuple)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('tuple')] }))

      expect(reports.length).toBe(1)
    })

    test('should report map.get(...pair)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...pair)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('pair')] }))

      expect(reports.length).toBe(1)
    })

    test('should report map.get(...record)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...record)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('record')] }))

      expect(reports.length).toBe(1)
    })

    test('should report map.get(...cell)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...cell)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('cell')] }))

      expect(reports.length).toBe(1)
    })

    test('should report map.get(...entry)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...entry)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('entry')] }))

      expect(reports.length).toBe(1)
    })

    test('should report map.get(...row)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...row)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('row')] }))

      expect(reports.length).toBe(1)
    })

    test('should report map.get(...chunk)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...chunk)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('chunk')] }))

      expect(reports.length).toBe(1)
    })

    test('should report map.get(...buffer)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...buffer)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('buffer')] }))

      expect(reports.length).toBe(1)
    })

    test('should report map.get(...collection)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...collection)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('collection')] }))

      expect(reports.length).toBe(1)
    })

    test('should report map.get(...input)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...input)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('input')] }))

      expect(reports.length).toBe(1)
    })

    test('should report map.get(...payload)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...payload)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('payload')] }))

      expect(reports.length).toBe(1)
    })

    test('should report map.get(...opts)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...opts)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('opts')] }))

      expect(reports.length).toBe(1)
    })

    test('should report map.get(...rest)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...rest)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('rest')] }))

      expect(reports.length).toBe(1)
    })

    test('should report map.get(...parts)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...parts)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('parts')] }))

      expect(reports.length).toBe(1)
    })

    test('should report map.get(...segments)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...segments)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('segments')] }))

      expect(reports.length).toBe(1)
    })

    test('should report map.get(...nested)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...nested)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('nested')] }))

      expect(reports.length).toBe(1)
    })

    test('should report map.get(...ref)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...ref)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('ref')] }))

      expect(reports.length).toBe(1)
    })
  })

  // 40 negative tests — should NOT report
  describe('not reporting non-matching patterns', () => {
    test('should not report map.get(key) with identifier argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(key)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createIdentifierArg('key')] }))

      expect(reports.length).toBe(0)
    })

    test('should not report map.get("key") with literal argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get("key")' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createLiteralArg('key')] }))

      expect(reports.length).toBe(0)
    })

    test('should not report map.get(0) with numeric literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(0)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createLiteralArg(0)] }))

      expect(reports.length).toBe(0)
    })

    test('should not report map.get(null)', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(null)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createLiteralArg(null)] }))

      expect(reports.length).toBe(0)
    })

    test('should not report map.get() with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get()' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [] }))

      expect(reports.length).toBe(0)
    })

    test('should not report map.get(...a, ...b) with two spreads', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...a, ...b)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('a'), createSpreadArg('b')] }))

      expect(reports.length).toBe(0)
    })

    test('should not report map.get(key, defaultValue) with two arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(key, defaultValue)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(
        makeMapGetCall({ args: [createIdentifierArg('key'), createIdentifierArg('defaultValue')] }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report cache.get(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'cache.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ objectName: 'cache' }))

      expect(reports.length).toBe(0)
    })

    test('should not report store.get(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'store.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ objectName: 'store' }))

      expect(reports.length).toBe(0)
    })

    test('should not report dict.get(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'dict.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ objectName: 'dict' }))

      expect(reports.length).toBe(0)
    })

    test('should not report registry.get(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'registry.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ objectName: 'registry' }))

      expect(reports.length).toBe(0)
    })

    test('should not report weakMap.get(...items) with different object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'weakMap.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ objectName: 'weakMap' }))

      expect(reports.length).toBe(0)
    })

    test('should not report map.set(...items) with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.set(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ propertyName: 'set' }))

      expect(reports.length).toBe(0)
    })

    test('should not report map.has(...items) with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.has(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ propertyName: 'has' }))

      expect(reports.length).toBe(0)
    })

    test('should not report map.delete(...items) with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.delete(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ propertyName: 'delete' }))

      expect(reports.length).toBe(0)
    })

    test('should not report map.forEach(...items) with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.forEach(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ propertyName: 'forEach' }))

      expect(reports.length).toBe(0)
    })

    test('should not report map.keys(...items) with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.keys(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ propertyName: 'keys' }))

      expect(reports.length).toBe(0)
    })

    test('should not report map.values(...items) with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.values(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ propertyName: 'values' }))

      expect(reports.length).toBe(0)
    })

    test('should not report map.entries(...items) with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.entries(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ propertyName: 'entries' }))

      expect(reports.length).toBe(0)
    })

    test('should not report map.clear(...items) with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.clear(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ propertyName: 'clear' }))

      expect(reports.length).toBe(0)
    })

    test('should not report map.size with different method name', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.size' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ propertyName: 'size' }))

      expect(reports.length).toBe(0)
    })

    test('should not report get(...items) as direct call', () => {
      const { context, reports } = createMockRuleContext({ source: 'get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'get' },
        arguments: [createSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report map["get"](...items) with computed access', () => {
      const { context, reports } = createMockRuleContext({ source: 'map["get"](...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ computed: true }))

      expect(reports.length).toBe(0)
    })

    test('should not report arr.map(...items) with arr object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.map(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ objectName: 'arr', propertyName: 'map' }))

      expect(reports.length).toBe(0)
    })

    test('should not report obj.get(...items) with obj object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'obj.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ objectName: 'obj' }))

      expect(reports.length).toBe(0)
    })

    test('should not report data.get(...items) with data object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'data.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ objectName: 'data' }))

      expect(reports.length).toBe(0)
    })

    test('should not report items.get(...items) with items object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'items.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ objectName: 'items' }))

      expect(reports.length).toBe(0)
    })

    test('should not report result.get(...items) with result object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'result.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ objectName: 'result' }))

      expect(reports.length).toBe(0)
    })

    test('should not report config.get(...items) with config object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'config.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ objectName: 'config' }))

      expect(reports.length).toBe(0)
    })

    test('should not report m.get(...items) with single-letter object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'm.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ objectName: 'm' }))

      expect(reports.length).toBe(0)
    })

    test('should not report map.get(...items, extra) with two arguments where first is spread', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...items, extra)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(
        makeMapGetCall({ args: [createSpreadArg('items'), createIdentifierArg('extra')] }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report map.get(expr) with expression argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(a + b)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(
        makeMapGetCall({
          args: [{ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report map.call(...items) with call method', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.call(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ propertyName: 'call' }))

      expect(reports.length).toBe(0)
    })

    test('should not report map.apply(...items) with apply method', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.apply(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ propertyName: 'apply' }))

      expect(reports.length).toBe(0)
    })

    test('should not report map.bind(...items) with bind method', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.bind(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ propertyName: 'bind' }))

      expect(reports.length).toBe(0)
    })

    test('should not report myMap.get(...items) with myMap object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'myMap.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ objectName: 'myMap' }))

      expect(reports.length).toBe(0)
    })

    test('should not report map.find(...items) with find method', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.find(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ propertyName: 'find' }))

      expect(reports.length).toBe(0)
    })

    test('should not report map.filter(...items) with filter method', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.filter(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ propertyName: 'filter' }))

      expect(reports.length).toBe(0)
    })

    test('should not report table.get(...items) with table object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'table.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ objectName: 'table' }))

      expect(reports.length).toBe(0)
    })

    test('should not report graph.get(...items) with graph object name', () => {
      const { context, reports } = createMockRuleContext({ source: 'graph.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall({ objectName: 'graph' }))

      expect(reports.length).toBe(0)
    })
  })

  // 17 edge case tests
  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'map.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'map.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle string node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'map.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      expect(() => visitor.CallExpression('map.get(...items)')).not.toThrow()
    })

    test('should handle number node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'map.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should handle boolean node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'map.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get()' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: 'get' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      const node = makeMapGetCall()
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with non-Identifier callee object', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'foo' }, property: { type: 'Identifier', name: 'bar' } },
          property: { type: 'Identifier', name: 'get' },
        },
        arguments: [createSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier callee property', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Literal', value: 'get' },
        },
        arguments: [createSpreadArg('items')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong callee type', () => {
      const { context, reports } = createMockRuleContext({ source: 'get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      const node = makeMapGetCall({ calleeType: 'Identifier' })

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong object type', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      const node = makeMapGetCall({ objectType: 'Literal' })

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong property type', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      const node = makeMapGetCall({ propertyType: 'Literal' })

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle multiple invocations correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall())
      visitor.CallExpression(makeMapGetCall({ args: [createSpreadArg('keys')] }))
      visitor.CallExpression(makeMapGetCall({ args: [createIdentifierArg('key')] }))
      visitor.CallExpression(makeMapGetCall({ objectName: 'cache' }))

      expect(reports.length).toBe(2)
    })

    test('should handle SpreadElement with non-Identifier argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...[1,2,3])' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(
        makeMapGetCall({
          args: [{ type: 'SpreadElement', argument: { type: 'ArrayExpression', elements: [] } }],
        }),
      )

      expect(reports.length).toBe(1)
    })

    test('should report correct message text', () => {
      const { context, reports } = createMockRuleContext({ source: 'map.get(...items)' })
      const visitor = noUnnecessaryMapGetSpreadRule.create(context)

      visitor.CallExpression(makeMapGetCall())

      expect(reports[0].message).toBe(
        'map.get(...items) with a single spread is unusual. Consider passing the key directly.',
      )
    })
  })
})

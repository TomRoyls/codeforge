import { describe, expect, test, vi } from 'vitest'

import type { RuleContext } from '../../../../src/plugins/types.js'

import { noPrototypeBuiltinsRule } from '../../../../src/rules/patterns/no-prototype-builtins.js'

interface ReportDescriptor {
  loc?: { end: { column: number; line: number }; start: { column: number; line: number } }
  message: string
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'obj.hasOwnProperty("key")',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    config: { options: [options] },
    getAST: () => null,
    getComments: () => [],
    getFilePath: () => filePath,
    getSource: () => source,
    getTokens: () => [],
    logger: {
      debug: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    },
    report(descriptor: ReportDescriptor) {
      reports.push({
        loc: descriptor.loc,
        message: descriptor.message,
      })
    },
    workspaceRoot: '/src',
  } as unknown as RuleContext

  return { context, reports }
}

function createIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    loc: {
      end: { column: column + name.length, line },
      start: { column, line },
    },
    name,
    type: 'Identifier',
  }
}

function createMemberExpression(object: unknown, property: unknown, line = 1, column = 0): unknown {
  return {
    computed: false,
    loc: {
      end: { column: column + 10, line },
      start: { column, line },
    },
    object,
    property,
    type: 'MemberExpression',
  }
}

function createCallExpression(
  callee: unknown,
  args: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    arguments: args,
    callee,
    loc: {
      end: { column: column + 20, line },
      start: { column, line },
    },
    type: 'CallExpression',
  }
}

function createPrototypeCall(methodName: string, objectName = 'obj') {
  return createCallExpression(
    createMemberExpression(createIdentifier(objectName), createIdentifier(methodName)),
  )
}

describe('no-prototype-builtins rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noPrototypeBuiltinsRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noPrototypeBuiltinsRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noPrototypeBuiltinsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noPrototypeBuiltinsRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention prototype in description', () => {
      expect(noPrototypeBuiltinsRule.meta.docs?.description.toLowerCase()).toContain('prototype')
    })

    test('should mention methods in description', () => {
      expect(noPrototypeBuiltinsRule.meta.docs?.description.toLowerCase()).toContain('methods')
    })

    test('should have empty schema array', () => {
      expect(noPrototypeBuiltinsRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(noPrototypeBuiltinsRule.meta.fixable).toBeUndefined()
    })

    test('should mention Object.prototype in description', () => {
      expect(noPrototypeBuiltinsRule.meta.docs?.description).toContain('Object.prototype')
    })

    test('should have a description that is a non-empty string', () => {
      expect(typeof noPrototypeBuiltinsRule.meta.docs?.description).toBe('string')
      expect(noPrototypeBuiltinsRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have meta object defined', () => {
      expect(noPrototypeBuiltinsRule.meta).toBeDefined()
      expect(typeof noPrototypeBuiltinsRule.meta).toBe('object')
    })

    test('should have type as a valid RuleType', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noPrototypeBuiltinsRule.meta.type)
    })

    test('should have severity as a valid Severity', () => {
      expect(['off', 'warn', 'error']).toContain(noPrototypeBuiltinsRule.meta.severity)
    })

    test('should not be deprecated', () => {
      expect(noPrototypeBuiltinsRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noPrototypeBuiltinsRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noPrototypeBuiltinsRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have docs object defined', () => {
      expect(noPrototypeBuiltinsRule.meta.docs).toBeDefined()
      expect(typeof noPrototypeBuiltinsRule.meta.docs).toBe('object')
    })

    test('should have category as a string', () => {
      expect(typeof noPrototypeBuiltinsRule.meta.docs?.category).toBe('string')
    })

    test('should have recommended as boolean true', () => {
      expect(noPrototypeBuiltinsRule.meta.docs?.recommended).toBe(true)
      expect(typeof noPrototypeBuiltinsRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have description that is a string', () => {
      expect(typeof noPrototypeBuiltinsRule.meta.docs?.description).toBe('string')
    })

    test('should have schema defined', () => {
      expect(noPrototypeBuiltinsRule.meta.schema).toBeDefined()
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noPrototypeBuiltinsRule.meta.schema)).toBe(true)
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return an object from create', () => {
      const { context } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)
      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('should return a visitor with exactly CallExpression key', () => {
      const { context } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)
      expect(Object.keys(visitor)).toContain('CallExpression')
    })

    test('should have CallExpression as a function', () => {
      const { context } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockContext()
      const visitor1 = noPrototypeBuiltinsRule.create(context)
      const visitor2 = noPrototypeBuiltinsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should create visitor with different context options', () => {
      const { context: ctx1 } = createMockContext({ strict: true })
      const { context: ctx2 } = createMockContext({ strict: false })
      const visitor1 = noPrototypeBuiltinsRule.create(ctx1)
      const visitor2 = noPrototypeBuiltinsRule.create(ctx2)
      expect(typeof visitor1.CallExpression).toBe('function')
      expect(typeof visitor2.CallExpression).toBe('function')
    })

    test('should have create as a function on the rule', () => {
      expect(typeof noPrototypeBuiltinsRule.create).toBe('function')
    })

    test('should accept context with empty options', () => {
      const { context } = createMockContext({})
      expect(() => noPrototypeBuiltinsRule.create(context)).not.toThrow()
    })

    test('should accept context with no options', () => {
      const { context } = createMockContext()
      expect(() => noPrototypeBuiltinsRule.create(context)).not.toThrow()
    })
  })

  describe('detecting hasOwnProperty calls', () => {
    test('should report hasOwnProperty called on object', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('hasOwnProperty'))
      expect(reports.length).toBe(1)
    })

    test('should report with correct message for hasOwnProperty', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('hasOwnProperty', 'myObj'))
      expect(reports[0].message).toContain('hasOwnProperty')
    })

    test('should report with suggestion to use call()', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('hasOwnProperty'))
      expect(reports[0].message).toContain('Object.prototype.hasOwnProperty.call()')
    })

    test('should report hasOwnProperty on variable named foo', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('hasOwnProperty', 'foo'))
      expect(reports.length).toBe(1)
    })

    test('should report hasOwnProperty on variable named obj', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('hasOwnProperty', 'obj'))
      expect(reports.length).toBe(1)
    })

    test('should report hasOwnProperty on variable named myObject', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('hasOwnProperty', 'myObject'))
      expect(reports.length).toBe(1)
    })

    test('should report hasOwnProperty with arguments', () => {
      const { context, reports } = createMockContext()
      const obj = createIdentifier('obj')
      const prop = createIdentifier('hasOwnProperty')
      const member = createMemberExpression(obj, prop)
      const arg = createIdentifier('key')
      const call = createCallExpression(member, [arg])
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
    })

    test('should report hasOwnProperty with string literal argument', () => {
      const { context, reports } = createMockContext()
      const obj = createIdentifier('data')
      const prop = createIdentifier('hasOwnProperty')
      const member = createMemberExpression(obj, prop)
      const arg = { type: 'Literal', value: 'name' }
      const call = createCallExpression(member, [arg])
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
    })

    test('should report hasOwnProperty on this', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('hasOwnProperty', 'this'))
      expect(reports.length).toBe(1)
    })
  })

  describe('detecting isPrototypeOf calls', () => {
    test('should report isPrototypeOf called on object', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('isPrototypeOf'))
      expect(reports.length).toBe(1)
    })

    test('should report with correct message for isPrototypeOf', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('isPrototypeOf', 'parent'))
      expect(reports[0].message).toContain('isPrototypeOf')
    })

    test('should report with suggestion to use call()', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('isPrototypeOf'))
      expect(reports[0].message).toContain('Object.prototype.isPrototypeOf.call()')
    })

    test('should report isPrototypeOf on variable named foo', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('isPrototypeOf', 'foo'))
      expect(reports.length).toBe(1)
    })

    test('should report isPrototypeOf with an argument', () => {
      const { context, reports } = createMockContext()
      const obj = createIdentifier('proto')
      const prop = createIdentifier('isPrototypeOf')
      const member = createMemberExpression(obj, prop)
      const arg = createIdentifier('instance')
      const call = createCallExpression(member, [arg])
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
    })

    test('should report isPrototypeOf on this', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('isPrototypeOf', 'this'))
      expect(reports.length).toBe(1)
    })
  })

  describe('detecting propertyIsEnumerable calls', () => {
    test('should report propertyIsEnumerable called on object', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('propertyIsEnumerable'))
      expect(reports.length).toBe(1)
    })

    test('should report with correct message for propertyIsEnumerable', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('propertyIsEnumerable'))
      expect(reports[0].message).toContain('propertyIsEnumerable')
    })

    test('should report with suggestion to use call()', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('propertyIsEnumerable'))
      expect(reports[0].message).toContain('Object.prototype.propertyIsEnumerable.call()')
    })

    test('should report propertyIsEnumerable on variable named config', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('propertyIsEnumerable', 'config'))
      expect(reports.length).toBe(1)
    })

    test('should report propertyIsEnumerable with an argument', () => {
      const { context, reports } = createMockContext()
      const obj = createIdentifier('obj')
      const prop = createIdentifier('propertyIsEnumerable')
      const member = createMemberExpression(obj, prop)
      const arg = createIdentifier('propName')
      const call = createCallExpression(member, [arg])
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
    })

    test('should report propertyIsEnumerable on this', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('propertyIsEnumerable', 'this'))
      expect(reports.length).toBe(1)
    })
  })

  describe('valid code cases', () => {
    test('should not report call to non-prototype method toString', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('toString'))
      expect(reports.length).toBe(0)
    })

    test('should not report call to custom method', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('customMethod'))
      expect(reports.length).toBe(0)
    })

    test('should not report Object.prototype method with call', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)
      const objProto = createIdentifier('Object')
      const protoProp = createIdentifier('prototype')
      const objProtoMember = createMemberExpression(objProto, protoProp)
      const hasOwn = createIdentifier('hasOwnProperty')
      const hasOwnMember = createMemberExpression(objProtoMember, hasOwn)
      const callProp = createIdentifier('call')
      const callMember = createMemberExpression(hasOwnMember, callProp)
      const call = createCallExpression(callMember)
      visitor.CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report simple function call', () => {
      const { context, reports } = createMockContext()
      const call = createCallExpression(createIdentifier('myFunction'))
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report method call on this for non-prototype method', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('customMethod', 'this'))
      expect(reports.length).toBe(0)
    })

    test('should not report call to valueOf', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('valueOf'))
      expect(reports.length).toBe(0)
    })

    test('should not report call to toLocaleString', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('toLocaleString'))
      expect(reports.length).toBe(0)
    })

    test('should not report call to constructor', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('constructor'))
      expect(reports.length).toBe(0)
    })

    test('should not report call to map', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('map'))
      expect(reports.length).toBe(0)
    })

    test('should not report call to filter', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('filter'))
      expect(reports.length).toBe(0)
    })

    test('should not report call to reduce', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('reduce'))
      expect(reports.length).toBe(0)
    })

    test('should not report call to push', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('push'))
      expect(reports.length).toBe(0)
    })

    test('should not report call to forEach', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('forEach'))
      expect(reports.length).toBe(0)
    })

    test('should not report call to split', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('split'))
      expect(reports.length).toBe(0)
    })
  })

  describe('safe method names batch 1', () => {
    const safeMethods = [
      'toString',
      'valueOf',
      'toLocaleString',
      'constructor',
      'map',
      'filter',
      'reduce',
      'push',
      'pop',
      'shift',
      'unshift',
      'slice',
      'splice',
      'concat',
      'join',
      'indexOf',
      'lastIndexOf',
      'forEach',
      'every',
      'some',
      'find',
      'findIndex',
      'includes',
      'sort',
      'reverse',
      'flatMap',
      'fill',
      'copyWithin',
      'entries',
      'keys',
      'values',
      'length',
      'charAt',
      'charCodeAt',
      'split',
      'substring',
      'toLowerCase',
      'toUpperCase',
      'trim',
      'match',
      'replace',
      'search',
      'startsWith',
      'endsWith',
      'repeat',
      'padStart',
      'padEnd',
      'customMethod',
      'myFunction',
      'getData',
      'setData',
      'init',
      'destroy',
      'render',
      'update',
    ]
    for (const methodName of safeMethods) {
      test(`should not report "${methodName}" method call`, () => {
        const { context, reports } = createMockContext()
        noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall(methodName))
        expect(reports.length).toBe(0)
      })
    }
  })

  describe('non-matching callee types', () => {
    test('should not report when callee type is ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const call = createCallExpression({ type: 'ArrowFunctionExpression' })
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report when callee type is FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const call = createCallExpression({ type: 'FunctionExpression' })
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report when callee type is Super', () => {
      const { context, reports } = createMockContext()
      const call = createCallExpression({ type: 'Super' })
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report when callee type is Import', () => {
      const { context, reports } = createMockContext()
      const call = createCallExpression({ type: 'Import' })
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should not report when callee type is ThisExpression', () => {
      const { context, reports } = createMockContext()
      const call = createCallExpression({ type: 'ThisExpression' })
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })
  })

  describe('case sensitivity', () => {
    test('should not report HasOwnProperty', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('HasOwnProperty'))
      expect(reports.length).toBe(0)
    })

    test('should not report hasownproperty', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('hasownproperty'))
      expect(reports.length).toBe(0)
    })

    test('should not report HASOWNPROPERTY', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('HASOWNPROPERTY'))
      expect(reports.length).toBe(0)
    })

    test('should not report IsPrototypeOf', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('IsPrototypeOf'))
      expect(reports.length).toBe(0)
    })

    test('should not report isprototypeof', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('isprototypeof'))
      expect(reports.length).toBe(0)
    })

    test('should not report ISPROTOOTYPEOF', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('ISPROTOOTYPEOF'))
      expect(reports.length).toBe(0)
    })

    test('should not report PropertyIsEnumerable', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('PropertyIsEnumerable'))
      expect(reports.length).toBe(0)
    })

    test('should not report propertyisenumerable', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('propertyisenumerable'))
      expect(reports.length).toBe(0)
    })

    test('should not report PROPERTYISENUMERABLE', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('PROPERTYISENUMERABLE'))
      expect(reports.length).toBe(0)
    })
  })

  describe('matching prototype methods', () => {
    test('should report prototype method hasOwnProperty', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('hasOwnProperty'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('hasOwnProperty')
    })

    test('should report prototype method isPrototypeOf', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('isPrototypeOf'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('isPrototypeOf')
    })

    test('should report prototype method propertyIsEnumerable', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('propertyIsEnumerable'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('propertyIsEnumerable')
    })
  })

  describe('edge cases', () => {
    test('should handle null node in CallExpression', () => {
      const { context, reports } = createMockContext()
      expect(() => noPrototypeBuiltinsRule.create(context).CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in CallExpression', () => {
      const { context, reports } = createMockContext()
      expect(() => noPrototypeBuiltinsRule.create(context).CallExpression()).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node in CallExpression (string)', () => {
      const { context, reports } = createMockContext()
      expect(() => noPrototypeBuiltinsRule.create(context).CallExpression('string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node in CallExpression (number)', () => {
      const { context, reports } = createMockContext()
      expect(() => noPrototypeBuiltinsRule.create(context).CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node in CallExpression (boolean)', () => {
      const { context, reports } = createMockContext()
      expect(() => noPrototypeBuiltinsRule.create(context).CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression without callee', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression({ arguments: [], type: 'CallExpression' })
      expect(reports.length).toBe(0)
    })

    test('should handle non-MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const call = createCallExpression(createIdentifier('myFunction'))
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression without property', () => {
      const { context, reports } = createMockContext()
      const member = { object: createIdentifier('obj'), type: 'MemberExpression' }
      const call = createCallExpression(member)
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should handle non-Identifier property', () => {
      const { context, reports } = createMockContext()
      const prop = { type: 'Literal', value: 'hasOwnProperty' }
      const member = createMemberExpression(createIdentifier('obj'), prop)
      const call = createCallExpression(member)
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should handle property without name', () => {
      const { context, reports } = createMockContext()
      const prop = { type: 'Identifier' }
      const member = createMemberExpression(createIdentifier('obj'), prop)
      const call = createCallExpression(member)
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      expect(() => noPrototypeBuiltinsRule.create(context).CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with type but no callee', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression({ type: 'CallExpression' })
      expect(reports.length).toBe(0)
    })

    test('should handle node with callee being null', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression({ type: 'CallExpression', callee: null })
      expect(reports.length).toBe(0)
    })

    test('should handle node with callee being a string', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression({ type: 'CallExpression', callee: 'someString' })
      expect(reports.length).toBe(0)
    })

    test('should handle node with callee being a number', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression({ type: 'CallExpression', callee: 42 })
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression with null property', () => {
      const { context, reports } = createMockContext()
      const member = { object: createIdentifier('obj'), property: null, type: 'MemberExpression' }
      const call = createCallExpression(member)
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression with undefined property', () => {
      const { context, reports } = createMockContext()
      const member = {
        object: createIdentifier('obj'),
        property: undefined,
        type: 'MemberExpression',
      }
      const call = createCallExpression(member)
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression with empty object property', () => {
      const { context, reports } = createMockContext()
      const member = { object: createIdentifier('obj'), property: {}, type: 'MemberExpression' }
      const call = createCallExpression(member)
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression with numeric name property', () => {
      const { context, reports } = createMockContext()
      const member = {
        object: createIdentifier('obj'),
        property: { type: 'Identifier', name: 123 },
        type: 'MemberExpression',
      }
      const call = createCallExpression(member)
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested member expression as callee object', () => {
      const { context, reports } = createMockContext()
      const deep1 = createIdentifier('a')
      const deep2 = createMemberExpression(deep1, createIdentifier('b'))
      const deep3 = createMemberExpression(deep2, createIdentifier('c'))
      const member = createMemberExpression(deep3, createIdentifier('hasOwnProperty'))
      const call = createCallExpression(member)
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
    })

    test('should handle computed member expression with hasOwnProperty', () => {
      const { context, reports } = createMockContext()
      const member = {
        computed: true,
        loc: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
        object: createIdentifier('obj'),
        property: createIdentifier('hasOwnProperty'),
        type: 'MemberExpression',
      }
      const call = createCallExpression(member)
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for hasOwnProperty call', () => {
      const { context, reports } = createMockContext()
      const obj = createIdentifier('obj')
      const prop = createIdentifier('hasOwnProperty')
      const member = createMemberExpression(obj, prop, 10, 5)
      const call = createCallExpression(member, [], 10, 5)
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct location for isPrototypeOf call', () => {
      const { context, reports } = createMockContext()
      const obj = createIdentifier('parent')
      const prop = createIdentifier('isPrototypeOf')
      const member = createMemberExpression(obj, prop, 20, 10)
      const call = createCallExpression(member, [], 20, 10)
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location for propertyIsEnumerable call', () => {
      const { context, reports } = createMockContext()
      const obj = createIdentifier('obj')
      const prop = createIdentifier('propertyIsEnumerable')
      const member = createMemberExpression(obj, prop, 30, 15)
      const call = createCallExpression(member, [], 30, 15)
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports[0].loc?.start.line).toBe(30)
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should include end location in report', () => {
      const { context, reports } = createMockContext()
      const obj = createIdentifier('obj')
      const prop = createIdentifier('hasOwnProperty')
      const member = createMemberExpression(obj, prop, 5, 2)
      const call = createCallExpression(member, [], 5, 2)
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports[0].loc?.end).toBeDefined()
      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('hasOwnProperty'))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const member = createMemberExpression(
        createIdentifier('obj'),
        createIdentifier('hasOwnProperty'),
      )
      const call = { arguments: [] as unknown[], callee: member, type: 'CallExpression' }
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with partial loc missing end', () => {
      const { context, reports } = createMockContext()
      const member = createMemberExpression(
        createIdentifier('obj'),
        createIdentifier('hasOwnProperty'),
      )
      const call = {
        arguments: [] as unknown[],
        callee: member,
        loc: { start: { line: 5, column: 10 } },
        type: 'CallExpression',
      }
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle node with partial loc missing start', () => {
      const { context, reports } = createMockContext()
      const member = createMemberExpression(
        createIdentifier('obj'),
        createIdentifier('hasOwnProperty'),
      )
      const call = {
        arguments: [] as unknown[],
        callee: member,
        loc: { end: { line: 5, column: 20 } },
        type: 'CallExpression',
      }
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
    })

    test('should report location on line 100', () => {
      const { context, reports } = createMockContext()
      const obj = createIdentifier('obj')
      const prop = createIdentifier('hasOwnProperty')
      const member = createMemberExpression(obj, prop, 100, 0)
      const call = createCallExpression(member, [], 100, 0)
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports[0].loc?.start.line).toBe(100)
    })

    test('should report location with column offset 50', () => {
      const { context, reports } = createMockContext()
      const obj = createIdentifier('obj')
      const prop = createIdentifier('hasOwnProperty')
      const member = createMemberExpression(obj, prop, 1, 50)
      const call = createCallExpression(member, [], 1, 50)
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should handle node with null loc', () => {
      const { context, reports } = createMockContext()
      const member = createMemberExpression(
        createIdentifier('obj'),
        createIdentifier('hasOwnProperty'),
      )
      const call = { arguments: [] as unknown[], callee: member, loc: null, type: 'CallExpression' }
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle node with undefined loc', () => {
      const { context, reports } = createMockContext()
      const member = createMemberExpression(
        createIdentifier('obj'),
        createIdentifier('hasOwnProperty'),
      )
      const call = {
        arguments: [] as unknown[],
        callee: member,
        loc: undefined,
        type: 'CallExpression',
      }
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })
  })

  describe('locations at various lines and columns', () => {
    test('should report correct location at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const obj = createIdentifier('obj')
      const prop = createIdentifier('hasOwnProperty')
      const member = createMemberExpression(obj, prop, 1, 0)
      const call = createCallExpression(member, [], 1, 0)
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location at line 1 column 50', () => {
      const { context, reports } = createMockContext()
      const obj = createIdentifier('obj')
      const prop = createIdentifier('hasOwnProperty')
      const member = createMemberExpression(obj, prop, 1, 50)
      const call = createCallExpression(member, [], 1, 50)
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report correct location at line 10 column 0', () => {
      const { context, reports } = createMockContext()
      const obj = createIdentifier('obj')
      const prop = createIdentifier('hasOwnProperty')
      const member = createMemberExpression(obj, prop, 10, 0)
      const call = createCallExpression(member, [], 10, 0)
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location at line 10 column 20', () => {
      const { context, reports } = createMockContext()
      const obj = createIdentifier('obj')
      const prop = createIdentifier('hasOwnProperty')
      const member = createMemberExpression(obj, prop, 10, 20)
      const call = createCallExpression(member, [], 10, 20)
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report correct location at line 50 column 100', () => {
      const { context, reports } = createMockContext()
      const obj = createIdentifier('obj')
      const prop = createIdentifier('hasOwnProperty')
      const member = createMemberExpression(obj, prop, 50, 100)
      const call = createCallExpression(member, [], 50, 100)
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports[0].loc?.start.line).toBe(50)
      expect(reports[0].loc?.start.column).toBe(100)
    })

    test('should report correct location at line 100 column 0', () => {
      const { context, reports } = createMockContext()
      const obj = createIdentifier('obj')
      const prop = createIdentifier('hasOwnProperty')
      const member = createMemberExpression(obj, prop, 100, 0)
      const call = createCallExpression(member, [], 100, 0)
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location at line 500 column 500', () => {
      const { context, reports } = createMockContext()
      const obj = createIdentifier('obj')
      const prop = createIdentifier('hasOwnProperty')
      const member = createMemberExpression(obj, prop, 500, 500)
      const call = createCallExpression(member, [], 500, 500)
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(500)
    })
  })

  describe('message content', () => {
    test('should mention method name in message', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('hasOwnProperty'))
      expect(reports[0].message).toContain('hasOwnProperty')
    })

    test('should mention Object.prototype in message', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('hasOwnProperty'))
      expect(reports[0].message).toContain('Object.prototype')
    })

    test('should suggest using call() method', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('hasOwnProperty'))
      expect(reports[0].message).toContain('.call()')
    })

    test('should use single quotes around method name', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('hasOwnProperty'))
      expect(reports[0].message).toContain("'hasOwnProperty'")
    })

    test('should have consistent message format across all methods', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)
      visitor.CallExpression(createPrototypeCall('hasOwnProperty'))
      visitor.CallExpression(createPrototypeCall('isPrototypeOf'))
      visitor.CallExpression(createPrototypeCall('propertyIsEnumerable'))
      expect(reports[0].message).toContain('Do not call')
      expect(reports[1].message).toContain('Do not call')
      expect(reports[2].message).toContain('Do not call')
    })

    test('should have "Do not call" prefix in message', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('hasOwnProperty'))
      expect(reports[0].message).toMatch(/^Do not call/)
    })

    test('should have "instead" suffix in message', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('hasOwnProperty'))
      expect(reports[0].message).toContain('instead')
    })

    test('should have "directly on an object" in message', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('hasOwnProperty'))
      expect(reports[0].message).toContain('directly on an object')
    })

    test('should use single quotes around isPrototypeOf', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('isPrototypeOf'))
      expect(reports[0].message).toContain("'isPrototypeOf'")
    })

    test('should use single quotes around propertyIsEnumerable', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('propertyIsEnumerable'))
      expect(reports[0].message).toContain("'propertyIsEnumerable'")
    })

    test('should have exact message for hasOwnProperty', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('hasOwnProperty'))
      expect(reports[0].message).toBe(
        "Do not call 'hasOwnProperty' directly on an object. Use Object.prototype.hasOwnProperty.call() instead.",
      )
    })

    test('should have exact message for isPrototypeOf', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('isPrototypeOf'))
      expect(reports[0].message).toBe(
        "Do not call 'isPrototypeOf' directly on an object. Use Object.prototype.isPrototypeOf.call() instead.",
      )
    })

    test('should have exact message for propertyIsEnumerable', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('propertyIsEnumerable'))
      expect(reports[0].message).toBe(
        "Do not call 'propertyIsEnumerable' directly on an object. Use Object.prototype.propertyIsEnumerable.call() instead.",
      )
    })
  })

  describe('multiple violations', () => {
    test('should report multiple prototype method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)
      visitor.CallExpression(createPrototypeCall('hasOwnProperty'))
      visitor.CallExpression(createPrototypeCall('isPrototypeOf'))
      visitor.CallExpression(createPrototypeCall('propertyIsEnumerable'))
      expect(reports.length).toBe(3)
    })

    test('should report prototype method calls on different objects', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)
      visitor.CallExpression(createPrototypeCall('hasOwnProperty', 'obj1'))
      visitor.CallExpression(createPrototypeCall('hasOwnProperty', 'obj2'))
      expect(reports.length).toBe(2)
    })

    test('should report 5 hasOwnProperty calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)
      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(createPrototypeCall('hasOwnProperty', `obj${i}`))
      }
      expect(reports.length).toBe(5)
    })

    test('should report 10 mixed prototype method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)
      const methods = ['hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable']
      for (let i = 0; i < 10; i++) {
        visitor.CallExpression(createPrototypeCall(methods[i % 3], `obj${i}`))
      }
      expect(reports.length).toBe(10)
    })

    test('should not report interleaved safe and unsafe calls mixed', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)
      visitor.CallExpression(createPrototypeCall('toString'))
      visitor.CallExpression(createPrototypeCall('hasOwnProperty'))
      visitor.CallExpression(createPrototypeCall('map'))
      visitor.CallExpression(createPrototypeCall('isPrototypeOf'))
      visitor.CallExpression(createPrototypeCall('customMethod'))
      expect(reports.length).toBe(2)
    })

    test('should report correct message for each violation', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)
      visitor.CallExpression(createPrototypeCall('hasOwnProperty'))
      visitor.CallExpression(createPrototypeCall('isPrototypeOf'))
      visitor.CallExpression(createPrototypeCall('propertyIsEnumerable'))
      expect(reports[0].message).toContain('hasOwnProperty')
      expect(reports[1].message).toContain('isPrototypeOf')
      expect(reports[2].message).toContain('propertyIsEnumerable')
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/project/src/utils.ts')
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('hasOwnProperty'))
      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'obj.hasOwnProperty("key")',
      )
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('hasOwnProperty'))
      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('hasOwnProperty'))
      expect(reports.length).toBe(1)
    })

    test('should work with empty options', () => {
      const { context, reports } = createMockContext({})
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('hasOwnProperty'))
      expect(reports.length).toBe(1)
    })

    test('should work with options containing extra keys', () => {
      const { context, reports } = createMockContext({ extra: true, mode: 'strict' })
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('hasOwnProperty'))
      expect(reports.length).toBe(1)
    })

    test('should work with .js file extension', () => {
      const { context, reports } = createMockContext({}, '/src/file.js')
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('hasOwnProperty'))
      expect(reports.length).toBe(1)
    })

    test('should work with .tsx file extension', () => {
      const { context, reports } = createMockContext({}, '/src/component.tsx')
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('hasOwnProperty'))
      expect(reports.length).toBe(1)
    })

    test('should work with nested directory path', () => {
      const { context, reports } = createMockContext({}, '/project/src/deep/nested/path/file.ts')
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('hasOwnProperty'))
      expect(reports.length).toBe(1)
    })

    test('should work with different workspace root', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        config: { options: [{}] },
        getAST: () => null,
        getComments: () => [],
        getFilePath: () => '/home/user/project/src/file.ts',
        getSource: () => 'obj.hasOwnProperty("key")',
        getTokens: () => [],
        logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), warn: vi.fn() },
        report(descriptor: ReportDescriptor) {
          reports.push({ loc: descriptor.loc, message: descriptor.message })
        },
        workspaceRoot: '/home/user/project',
      } as unknown as RuleContext
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('hasOwnProperty'))
      expect(reports.length).toBe(1)
    })
  })

  describe('rule definition', () => {
    test('should export default the same rule', async () => {
      const mod = await import('../../../../src/rules/patterns/no-prototype-builtins.js')
      expect(mod.default).toBe(noPrototypeBuiltinsRule)
    })

    test('should have meta and create as only top-level properties', () => {
      expect(noPrototypeBuiltinsRule).toHaveProperty('meta')
      expect(noPrototypeBuiltinsRule).toHaveProperty('create')
    })

    test('should not have deprecated set to true', () => {
      expect(noPrototypeBuiltinsRule.meta.deprecated).toBeFalsy()
    })

    test('should be a valid RuleDefinition object', () => {
      expect(noPrototypeBuiltinsRule).toBeDefined()
      expect(typeof noPrototypeBuiltinsRule.meta).toBe('object')
      expect(typeof noPrototypeBuiltinsRule.create).toBe('function')
    })
  })

  describe('hasOwnProperty on various object names', () => {
    test('should report hasOwnProperty on variable "obj"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('hasOwnProperty', 'obj'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('hasOwnProperty')
    })

    test('should report hasOwnProperty on variable "foo"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('hasOwnProperty', 'foo'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('hasOwnProperty')
    })

    test('should report hasOwnProperty on variable "bar"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('hasOwnProperty', 'bar'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('hasOwnProperty')
    })

    test('should report hasOwnProperty on variable "data"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('hasOwnProperty', 'data'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('hasOwnProperty')
    })

    test('should report hasOwnProperty on variable "config"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('hasOwnProperty', 'config'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('hasOwnProperty')
    })

    test('should report hasOwnProperty on variable "item"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('hasOwnProperty', 'item'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('hasOwnProperty')
    })

    test('should report hasOwnProperty on variable "result"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('hasOwnProperty', 'result'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('hasOwnProperty')
    })

    test('should report hasOwnProperty on variable "options"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('hasOwnProperty', 'options'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('hasOwnProperty')
    })

    test('should report hasOwnProperty on variable "props"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('hasOwnProperty', 'props'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('hasOwnProperty')
    })

    test('should report hasOwnProperty on variable "state"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('hasOwnProperty', 'state'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('hasOwnProperty')
    })
  })

  describe('isPrototypeOf on various object names', () => {
    test('should report isPrototypeOf on variable "obj"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('isPrototypeOf', 'obj'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('isPrototypeOf')
    })

    test('should report isPrototypeOf on variable "foo"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('isPrototypeOf', 'foo'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('isPrototypeOf')
    })

    test('should report isPrototypeOf on variable "bar"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('isPrototypeOf', 'bar'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('isPrototypeOf')
    })

    test('should report isPrototypeOf on variable "data"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('isPrototypeOf', 'data'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('isPrototypeOf')
    })

    test('should report isPrototypeOf on variable "config"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('isPrototypeOf', 'config'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('isPrototypeOf')
    })

    test('should report isPrototypeOf on variable "item"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('isPrototypeOf', 'item'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('isPrototypeOf')
    })

    test('should report isPrototypeOf on variable "result"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('isPrototypeOf', 'result'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('isPrototypeOf')
    })

    test('should report isPrototypeOf on variable "options"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('isPrototypeOf', 'options'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('isPrototypeOf')
    })

    test('should report isPrototypeOf on variable "props"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('isPrototypeOf', 'props'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('isPrototypeOf')
    })

    test('should report isPrototypeOf on variable "state"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('isPrototypeOf', 'state'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('isPrototypeOf')
    })
  })

  describe('propertyIsEnumerable on various object names', () => {
    test('should report propertyIsEnumerable on variable "obj"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('propertyIsEnumerable', 'obj'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('propertyIsEnumerable')
    })

    test('should report propertyIsEnumerable on variable "foo"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('propertyIsEnumerable', 'foo'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('propertyIsEnumerable')
    })

    test('should report propertyIsEnumerable on variable "bar"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('propertyIsEnumerable', 'bar'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('propertyIsEnumerable')
    })

    test('should report propertyIsEnumerable on variable "data"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('propertyIsEnumerable', 'data'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('propertyIsEnumerable')
    })

    test('should report propertyIsEnumerable on variable "config"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('propertyIsEnumerable', 'config'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('propertyIsEnumerable')
    })

    test('should report propertyIsEnumerable on variable "item"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('propertyIsEnumerable', 'item'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('propertyIsEnumerable')
    })

    test('should report propertyIsEnumerable on variable "result"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('propertyIsEnumerable', 'result'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('propertyIsEnumerable')
    })

    test('should report propertyIsEnumerable on variable "options"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('propertyIsEnumerable', 'options'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('propertyIsEnumerable')
    })

    test('should report propertyIsEnumerable on variable "props"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('propertyIsEnumerable', 'props'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('propertyIsEnumerable')
    })

    test('should report propertyIsEnumerable on variable "state"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('propertyIsEnumerable', 'state'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('propertyIsEnumerable')
    })
  })

  describe('safe method names batch 2', () => {
    test('should not report built-in method "addEventListener"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('addEventListener'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "removeEventListener"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('removeEventListener'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "getAttribute"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('getAttribute'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "setAttribute"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('setAttribute'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "removeAttribute"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('removeAttribute'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "querySelector"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('querySelector'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "querySelectorAll"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('querySelectorAll'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "createElement"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('createElement'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "appendChild"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('appendChild'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "removeChild"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('removeChild'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "then"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('then'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "catch"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('catch'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "finally"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('finally'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "pipe"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('pipe'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "subscribe"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('subscribe'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "next"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('next'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "error"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('error'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "complete"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('complete'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "emit"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('emit'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "on"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('on'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "off"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('off'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "once"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('once'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "bind"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('bind'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "apply"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('apply'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "call"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('call'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "freeze"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('freeze'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "assign"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('assign'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "keys"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('keys'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "values"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('values'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "entries"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('entries'))
      expect(reports.length).toBe(0)
    })

    test('should not report built-in method "getPrototypeOf"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('getPrototypeOf'))
      expect(reports.length).toBe(0)
    })
  })

  describe('repeated visitor calls', () => {
    test('should report same violation on repeated calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)
      const call = createPrototypeCall('hasOwnProperty')
      visitor.CallExpression(call)
      visitor.CallExpression(call)
      visitor.CallExpression(call)
      expect(reports.length).toBe(3)
    })

    test('should not accumulate reports from safe calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)
      const call = createPrototypeCall('toString')
      visitor.CallExpression(call)
      visitor.CallExpression(call)
      expect(reports.length).toBe(0)
    })

    test('should handle 50 sequential calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)
      for (let i = 0; i < 50; i++) {
        visitor.CallExpression(createPrototypeCall('hasOwnProperty', `obj${i}`))
      }
      expect(reports.length).toBe(50)
    })

    test('should handle 100 sequential safe calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)
      for (let i = 0; i < 100; i++) {
        visitor.CallExpression(createPrototypeCall('toString', `obj${i}`))
      }
      expect(reports.length).toBe(0)
    })
  })

  describe('chained calls', () => {
    test('should report hasOwnProperty on chained member expression', () => {
      const { context, reports } = createMockContext()
      const obj = createIdentifier('obj')
      const nested = createMemberExpression(obj, createIdentifier('nested'))
      const member = createMemberExpression(nested, createIdentifier('hasOwnProperty'))
      const call = createCallExpression(member)
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
    })

    test('should report isPrototypeOf on triple-chained member expression', () => {
      const { context, reports } = createMockContext()
      const level1 = createMemberExpression(createIdentifier('a'), createIdentifier('b'))
      const level2 = createMemberExpression(level1, createIdentifier('c'))
      const member = createMemberExpression(level2, createIdentifier('isPrototypeOf'))
      const call = createCallExpression(member)
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports.length).toBe(1)
    })

    test('should not report safe method on chained member expression', () => {
      const { context, reports } = createMockContext()
      const obj = createIdentifier('obj')
      const nested = createMemberExpression(obj, createIdentifier('nested'))
      const member = createMemberExpression(nested, createIdentifier('toString'))
      const call = createCallExpression(member)
      noPrototypeBuiltinsRule.create(context).CallExpression(call)
      expect(reports.length).toBe(0)
    })
  })

  describe('similar but different method names', () => {
    test('should not report similar-but-different method "hasOwn"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('hasOwn'))
      expect(reports.length).toBe(0)
    })

    test('should not report similar-but-different method "hasOwnProp"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('hasOwnProp'))
      expect(reports.length).toBe(0)
    })

    test('should not report similar-but-different method "ownProperty"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('ownProperty'))
      expect(reports.length).toBe(0)
    })

    test('should not report similar-but-different method "protoIsOf"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('protoIsOf'))
      expect(reports.length).toBe(0)
    })

    test('should not report similar-but-different method "isEnum"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('isEnum'))
      expect(reports.length).toBe(0)
    })

    test('should not report similar-but-different method "isPropertyEnumerable"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('isPropertyEnumerable'))
      expect(reports.length).toBe(0)
    })

    test('should not report similar-but-different method "propertyEnumerable"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule
        .create(context)
        .CallExpression(createPrototypeCall('propertyEnumerable'))
      expect(reports.length).toBe(0)
    })

    test('should not report similar-but-different method "enumerable"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('enumerable'))
      expect(reports.length).toBe(0)
    })

    test('should not report similar-but-different method "protoType"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('protoType'))
      expect(reports.length).toBe(0)
    })

    test('should not report similar-but-different method "proto"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('proto'))
      expect(reports.length).toBe(0)
    })

    test('should not report similar-but-different method "has"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('has'))
      expect(reports.length).toBe(0)
    })

    test('should not report similar-but-different method "own"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('own'))
      expect(reports.length).toBe(0)
    })

    test('should not report similar-but-different method "property"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('property'))
      expect(reports.length).toBe(0)
    })

    test('should not report similar-but-different method "is"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('is'))
      expect(reports.length).toBe(0)
    })

    test('should not report similar-but-different method "of"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('of'))
      expect(reports.length).toBe(0)
    })
  })

  describe('safe method names batch 3 misc', () => {
    test('should not report misc method "log"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('log'))
      expect(reports.length).toBe(0)
    })

    test('should not report misc method "warn"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('warn'))
      expect(reports.length).toBe(0)
    })

    test('should not report misc method "error"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('error'))
      expect(reports.length).toBe(0)
    })

    test('should not report misc method "info"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('info'))
      expect(reports.length).toBe(0)
    })

    test('should not report misc method "debug"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('debug'))
      expect(reports.length).toBe(0)
    })

    test('should not report misc method "assert"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('assert'))
      expect(reports.length).toBe(0)
    })

    test('should not report misc method "time"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('time'))
      expect(reports.length).toBe(0)
    })

    test('should not report misc method "timeEnd"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('timeEnd'))
      expect(reports.length).toBe(0)
    })

    test('should not report misc method "parse"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('parse'))
      expect(reports.length).toBe(0)
    })

    test('should not report misc method "stringify"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('stringify'))
      expect(reports.length).toBe(0)
    })

    test('should not report misc method "fetch"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('fetch'))
      expect(reports.length).toBe(0)
    })

    test('should not report misc method "json"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('json'))
      expect(reports.length).toBe(0)
    })

    test('should not report misc method "text"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('text'))
      expect(reports.length).toBe(0)
    })

    test('should not report misc method "blob"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('blob'))
      expect(reports.length).toBe(0)
    })

    test('should not report misc method "arrayBuffer"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('arrayBuffer'))
      expect(reports.length).toBe(0)
    })

    test('should not report misc method "formData"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('formData'))
      expect(reports.length).toBe(0)
    })

    test('should not report misc method "clone"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('clone'))
      expect(reports.length).toBe(0)
    })

    test('should not report misc method "abort"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('abort'))
      expect(reports.length).toBe(0)
    })

    test('should not report misc method "resolve"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('resolve'))
      expect(reports.length).toBe(0)
    })

    test('should not report misc method "reject"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('reject'))
      expect(reports.length).toBe(0)
    })

    test('should not report misc method "all"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('all'))
      expect(reports.length).toBe(0)
    })

    test('should not report misc method "race"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('race'))
      expect(reports.length).toBe(0)
    })

    test('should not report misc method "allSettled"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('allSettled'))
      expect(reports.length).toBe(0)
    })

    test('should not report misc method "any"', () => {
      const { context, reports } = createMockContext()
      noPrototypeBuiltinsRule.create(context).CallExpression(createPrototypeCall('any'))
      expect(reports.length).toBe(0)
    })
  })
})

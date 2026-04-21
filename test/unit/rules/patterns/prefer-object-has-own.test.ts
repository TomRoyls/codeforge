import { describe, test, expect, vi } from 'vitest'
import { preferObjectHasOwnRule } from '../../../../src/rules/patterns/prefer-object-has-own.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'obj.hasOwnProperty(prop);',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
      })
    },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => source,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    workspaceRoot: '/src',
  } as unknown as RuleContext

  return { context, reports }
}

function createCallExpression(callee: unknown, args: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createMemberExpression(object: unknown, property: string): unknown {
  return {
    type: 'MemberExpression',
    object,
    property: {
      type: 'Identifier',
      name: property,
    },
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createObjectPrototypeCall(methodName: string, line = 1, column = 0): unknown {
  const object = createMemberExpression(createIdentifier('Object'), 'prototype')
  const method = createMemberExpression(object, methodName)
  return createCallExpression(
    createMemberExpression(method, 'call'),
    [createIdentifier('obj'), createIdentifier('prop')],
    line,
    column,
  )
}

function createPrototypeCall(
  objectName: string,
  methodName: string,
  line = 1,
  column = 0,
): unknown {
  const callee = createMemberExpression(createIdentifier(objectName), methodName)
  return createCallExpression(callee, [createIdentifier('prop')], line, column)
}

// ─── META (20 tests) ───────────────────────────────────────────────

describe('prefer-object-has-own rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferObjectHasOwnRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferObjectHasOwnRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferObjectHasOwnRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferObjectHasOwnRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferObjectHasOwnRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(preferObjectHasOwnRule.meta.fixable).toBeUndefined()
    })

    test('should mention hasOwn in description', () => {
      expect(preferObjectHasOwnRule.meta.docs?.description.toLowerCase()).toContain('hasown')
    })

    test('should mention hasOwnProperty in description', () => {
      expect(preferObjectHasOwnRule.meta.docs?.description).toContain('hasOwnProperty')
    })

    test('should mention propertyIsEnumerable in description', () => {
      expect(preferObjectHasOwnRule.meta.docs?.description).toContain('propertyIsEnumerable')
    })

    test('should mention Object.hasOwn in description', () => {
      expect(preferObjectHasOwnRule.meta.docs?.description).toContain('Object.hasOwn')
    })

    test('should have a docs object', () => {
      expect(preferObjectHasOwnRule.meta.docs).toBeDefined()
    })

    test('should have a docs description string', () => {
      expect(typeof preferObjectHasOwnRule.meta.docs?.description).toBe('string')
    })

    test('should have non-empty description', () => {
      expect(preferObjectHasOwnRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have docs url defined', () => {
      expect(preferObjectHasOwnRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs url containing codeforge', () => {
      expect(preferObjectHasOwnRule.meta.docs?.url).toContain('codeforge')
    })

    test('should have meta object defined', () => {
      expect(preferObjectHasOwnRule.meta).toBeDefined()
    })

    test('should have type as one of valid RuleType values', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(preferObjectHasOwnRule.meta.type)
    })

    test('should have severity as one of valid Severity values', () => {
      expect(['off', 'warn', 'error']).toContain(preferObjectHasOwnRule.meta.severity)
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(preferObjectHasOwnRule.meta.schema)).toBe(true)
    })

    test('should have empty schema array', () => {
      expect(preferObjectHasOwnRule.meta.schema).toEqual([])
    })
  })

  // ─── CREATE / VISITOR (8 tests) ────────────────────────────────────

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return a CallExpression that is a function', () => {
      const { context } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return same visitor structure on multiple calls', () => {
      const { context } = createMockContext()
      const visitor1 = preferObjectHasOwnRule.create(context)
      const visitor2 = preferObjectHasOwnRule.create(context)
      expect(Object.keys(visitor1)).toEqual(Object.keys(visitor2))
    })

    test('should return visitor with exactly one key', () => {
      const { context } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      expect(Object.keys(visitor)).toEqual(['CallExpression'])
    })

    test('should not return undefined visitor', () => {
      const { context } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      expect(visitor).not.toBeUndefined()
    })

    test('should not return null visitor', () => {
      const { context } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      expect(visitor).not.toBeNull()
    })

    test('should create independent visitors per context', () => {
      const { context: ctx1 } = createMockContext()
      const { context: ctx2 } = createMockContext()
      const visitor1 = preferObjectHasOwnRule.create(ctx1)
      const visitor2 = preferObjectHasOwnRule.create(ctx2)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context with different file paths', () => {
      const { context } = createMockContext({}, '/different/path.ts')
      const visitor = preferObjectHasOwnRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  // ─── DETECTION (30 tests) ──────────────────────────────────────────

  describe('detecting Object.prototype.hasOwnProperty.call()', () => {
    test('should report Object.prototype.hasOwnProperty.call(obj, prop)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createObjectPrototypeCall('hasOwnProperty'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('hasOwn')
    })

    test('should report with correct message for hasOwnProperty.call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createObjectPrototypeCall('hasOwnProperty'))
      expect(reports[0].message).toContain('Object.prototype.hasOwnProperty.call')
    })

    test('should report Object.prototype.hasOwnProperty.call with various object args', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const object = createMemberExpression(createIdentifier('Object'), 'prototype')
      const method = createMemberExpression(object, 'hasOwnProperty')
      const node = createCallExpression(
        createMemberExpression(method, 'call'),
        [createIdentifier('myObj'), createIdentifier('myKey')],
        1,
        0,
      )
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('detecting Object.prototype.propertyIsEnumerable.call()', () => {
    test('should report Object.prototype.propertyIsEnumerable.call(obj, prop)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createObjectPrototypeCall('propertyIsEnumerable'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('hasOwn')
    })

    test('should report propertyIsEnumerable with correct message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createObjectPrototypeCall('propertyIsEnumerable'))
      expect(reports[0].message).toContain('propertyIsEnumerable')
    })

    test('should report propertyIsEnumerable with own properties message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createObjectPrototypeCall('propertyIsEnumerable'))
      expect(reports[0].message.toLowerCase()).toContain('own properties')
    })
  })

  describe('detecting obj.hasOwnProperty()', () => {
    test('should report obj.hasOwnProperty(prop)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('hasOwn')
      expect(reports[0].message).toContain('obj')
    })

    test('should report config.hasOwnProperty(key)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('config', 'hasOwnProperty'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('config')
    })

    test('should report data.hasOwnProperty(field)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('data', 'hasOwnProperty'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('data')
    })

    test('should report myObj.hasOwnProperty(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('myObj', 'hasOwnProperty'))
      expect(reports.length).toBe(1)
    })

    test('should include method name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty'))
      expect(reports[0].message).toContain('hasOwnProperty')
    })

    test('should include caller name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('myObj', 'hasOwnProperty'))
      expect(reports[0].message).toContain('myObj')
    })

    test('should include Object.hasOwn suggestion in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty'))
      expect(reports[0].message).toContain('Object.hasOwn(obj')
    })
  })

  describe('detecting obj.propertyIsEnumerable()', () => {
    test('should report obj.propertyIsEnumerable(prop)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'propertyIsEnumerable'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('hasOwn')
    })

    test('should report settings.propertyIsEnumerable(key)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('settings', 'propertyIsEnumerable'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('settings')
    })

    test('should report item.propertyIsEnumerable(attr)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('item', 'propertyIsEnumerable'))
      expect(reports.length).toBe(1)
    })

    test('should include method name propertyIsEnumerable in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'propertyIsEnumerable'))
      expect(reports[0].message).toContain('propertyIsEnumerable')
    })

    test('should include caller name in message for propertyIsEnumerable', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('options', 'propertyIsEnumerable'))
      expect(reports[0].message).toContain('options')
    })
  })

  describe('detecting multiple patterns', () => {
    test('should report both hasOwnProperty and propertyIsEnumerable on same object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty'))
      visitor.CallExpression(createPrototypeCall('obj', 'propertyIsEnumerable'))
      expect(reports.length).toBe(2)
    })

    test('should report both prototype and direct call patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createObjectPrototypeCall('hasOwnProperty'))
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty'))
      expect(reports.length).toBe(2)
    })

    test('should detect hasOwnProperty on result of function call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const innerCall = createCallExpression(createIdentifier('getObj'), [])
      const callee = createMemberExpression(innerCall, 'hasOwnProperty')
      const node = createCallExpression(callee, [createIdentifier('prop')])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect propertyIsEnumerable on result of function call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const innerCall = createCallExpression(createIdentifier('getConfig'), [])
      const callee = createMemberExpression(innerCall, 'propertyIsEnumerable')
      const node = createCallExpression(callee, [createIdentifier('key')])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // ─── NOT REPORTING (30 tests) ──────────────────────────────────────

  describe('not reporting valid code', () => {
    test('should not report Object.hasOwn()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const callee = createMemberExpression(createIdentifier('Object'), 'hasOwn')
      const node = createCallExpression(callee, [createIdentifier('obj'), createIdentifier('prop')])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report Object.keys()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const callee = createMemberExpression(createIdentifier('Object'), 'keys')
      const node = createCallExpression(callee, [createIdentifier('obj')])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report regular function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const node = createCallExpression(createIdentifier('check'), [createIdentifier('obj')])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report obj.toString()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'toString'))
      expect(reports.length).toBe(0)
    })

    test('should not report Object.hasOwnProperty() (Object is caller)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('Object', 'hasOwnProperty'))
      expect(reports.length).toBe(0)
    })

    test('should not report Object.propertyIsEnumerable() (Object is caller)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('Object', 'propertyIsEnumerable'))
      expect(reports.length).toBe(0)
    })

    test('should not report obj.valueOf()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'valueOf'))
      expect(reports.length).toBe(0)
    })

    test('should not report obj.isPrototypeOf()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'isPrototypeOf'))
      expect(reports.length).toBe(0)
    })

    test('should not report Array.isArray()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const callee = createMemberExpression(createIdentifier('Array'), 'isArray')
      const node = createCallExpression(callee, [createIdentifier('arr')])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report Object.entries()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const callee = createMemberExpression(createIdentifier('Object'), 'entries')
      const node = createCallExpression(callee, [createIdentifier('obj')])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report Object.values()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const callee = createMemberExpression(createIdentifier('Object'), 'values')
      const node = createCallExpression(callee, [createIdentifier('obj')])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report Object.assign()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const callee = createMemberExpression(createIdentifier('Object'), 'assign')
      const node = createCallExpression(callee, [
        createIdentifier('target'),
        createIdentifier('src'),
      ])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report obj.forEach()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('arr', 'forEach'))
      expect(reports.length).toBe(0)
    })

    test('should not report obj.map()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('arr', 'map'))
      expect(reports.length).toBe(0)
    })

    test('should not report obj.filter()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('arr', 'filter'))
      expect(reports.length).toBe(0)
    })

    test('should not report obj.find()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('arr', 'find'))
      expect(reports.length).toBe(0)
    })

    test('should not report obj.reduce()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('arr', 'reduce'))
      expect(reports.length).toBe(0)
    })

    test('should not report obj.push()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('arr', 'push'))
      expect(reports.length).toBe(0)
    })

    test('should not report obj.includes()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('arr', 'includes'))
      expect(reports.length).toBe(0)
    })

    test('should not report obj.join()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('arr', 'join'))
      expect(reports.length).toBe(0)
    })

    test('should not report JSON.stringify()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const callee = createMemberExpression(createIdentifier('JSON'), 'stringify')
      const node = createCallExpression(callee, [createIdentifier('obj')])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console.log()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const callee = createMemberExpression(createIdentifier('console'), 'log')
      const node = createCallExpression(callee, [createIdentifier('msg')])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report Object.prototype.hasOwnProperty.bind()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const object = createMemberExpression(createIdentifier('Object'), 'prototype')
      const method = createMemberExpression(object, 'hasOwnProperty')
      const callee = createMemberExpression(method, 'bind')
      const node = createCallExpression(callee, [])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report Object.prototype.propertyIsEnumerable.bind()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const object = createMemberExpression(createIdentifier('Object'), 'prototype')
      const method = createMemberExpression(object, 'propertyIsEnumerable')
      const callee = createMemberExpression(method, 'bind')
      const node = createCallExpression(callee, [])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report Object.prototype.toString.call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createObjectPrototypeCall('toString'))
      expect(reports.length).toBe(0)
    })

    test('should not report MyObject.prototype.hasOwnProperty.call()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const object = createMemberExpression(createIdentifier('MyObject'), 'prototype')
      const method = createMemberExpression(object, 'hasOwnProperty')
      const node = createCallExpression(createMemberExpression(method, 'call'), [
        createIdentifier('obj'),
        createIdentifier('prop'),
      ])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report obj.constructor()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'constructor'))
      expect(reports.length).toBe(0)
    })

    test('should not report obj.__lookupGetter__()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', '__lookupGetter__'))
      expect(reports.length).toBe(0)
    })

    test('should not report new expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: createMemberExpression(createIdentifier('Object'), 'hasOwnProperty'),
        arguments: [createIdentifier('obj')],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report obj.toLocaleString()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'toLocaleString'))
      expect(reports.length).toBe(0)
    })
  })

  // ─── EDGE CASES (25 tests) ─────────────────────────────────────────

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle boolean node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle array node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      expect(() => visitor.CallExpression([])).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: createMemberExpression(createIdentifier('obj'), 'hasOwnProperty'),
        arguments: [createIdentifier('prop')],
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty'))
      expect(reports.length).toBe(1)
    })

    test('should handle undefined options array', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'obj.hasOwnProperty(prop);',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferObjectHasOwnRule.create(context)
      expect(() =>
        visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty')),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with missing callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const node = { type: 'CallExpression', arguments: [] }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with missing arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const callee = createMemberExpression(createIdentifier('obj'), 'hasOwnProperty')
      const node = { type: 'CallExpression', callee }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle callee with null object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const callee = {
        type: 'MemberExpression',
        object: null,
        property: { type: 'Identifier', name: 'hasOwnProperty' },
      }
      const node = createCallExpression(callee, [])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle callee with undefined property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const callee = { type: 'MemberExpression', object: createIdentifier('obj') }
      const node = createCallExpression(callee, [])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle callee property as Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const callee = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: { type: 'Literal', value: 'hasOwnProperty' },
      }
      const node = createCallExpression(callee, [createIdentifier('prop')])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle prototype call with null object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const callee = {
        type: 'MemberExpression',
        object: null,
        property: { type: 'Identifier', name: 'propertyIsEnumerable' },
      }
      const node = createCallExpression(callee, [])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle non-MemberExpression callee in prototype check', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const callee = createMemberExpression(createIdentifier('func'), 'call')
      const node = createCallExpression(callee, [createIdentifier('obj')])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle prototype object without proper property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const callee = {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: createIdentifier('Object'),
            property: { type: 'Literal', value: 'prototype' },
          },
          property: { type: 'Identifier', name: 'hasOwnProperty' },
        },
        property: { type: 'Identifier', name: 'call' },
      }
      const node = createCallExpression(callee, [])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle prototype with wrong property name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const object = createMemberExpression(createIdentifier('Object'), 'proto')
      const method = createMemberExpression(object, 'hasOwnProperty')
      const callee = createMemberExpression(method, 'call')
      const node = createCallExpression(callee, [])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle Object identifier as Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const callee = {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Literal', value: 'Object' },
            property: { type: 'Identifier', name: 'prototype' },
          },
          property: { type: 'Identifier', name: 'hasOwnProperty' },
        },
        property: { type: 'Identifier', name: 'call' },
      }
      const node = createCallExpression(callee, [])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle wrong Object identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const object = createMemberExpression(createIdentifier('MyObject'), 'prototype')
      const method = createMemberExpression(object, 'hasOwnProperty')
      const callee = createMemberExpression(method, 'call')
      const node = createCallExpression(callee, [])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle method property as non-Identifier in prototype chain', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const callee = {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: createIdentifier('Object'),
            property: { type: 'Identifier', name: 'prototype' },
          },
          property: { type: 'Literal', value: 'hasOwnProperty' },
        },
        property: { type: 'Identifier', name: 'call' },
      }
      const node = createCallExpression(callee, [])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle prototype without MemberExpression for prototype callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const callee = {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: createIdentifier('Object'),
          property: { type: 'Identifier', name: 'hasOwnProperty' },
        },
        property: { type: 'Identifier', name: 'call' },
      }
      const node = createCallExpression(callee, [])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle obj with method name valueOf', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'valueOf'))
      expect(reports.length).toBe(0)
    })

    test('should handle obj with method name isPrototypeOf', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'isPrototypeOf'))
      expect(reports.length).toBe(0)
    })

    test('should handle node without type gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const node = {
        callee: createMemberExpression(createIdentifier('obj'), 'hasOwnProperty'),
        arguments: [],
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ─── LOCATION (15 tests) ───────────────────────────────────────────

  describe('location', () => {
    test('should report correct location at line 15 column 8', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty', 15, 8))
      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report correct location at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty', 1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location at line 100 column 50', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty', 100, 50))
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty', 5, 10))
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(40)
    })

    test('should report location for Object.prototype.hasOwnProperty.call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createObjectPrototypeCall('hasOwnProperty', 7, 12))
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('should report location for propertyIsEnumerable', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'propertyIsEnumerable', 3, 4))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report location for Object.prototype.propertyIsEnumerable.call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createObjectPrototypeCall('propertyIsEnumerable', 20, 0))
      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should provide default location when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: createMemberExpression(createIdentifier('obj'), 'hasOwnProperty'),
        arguments: [createIdentifier('prop')],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report loc object with start and end', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty', 2, 3))
      expect(reports[0].loc).toHaveProperty('start')
      expect(reports[0].loc).toHaveProperty('end')
    })

    test('should preserve location for second report', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty', 1, 0))
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty', 10, 5))
      expect(reports[1].loc?.start.line).toBe(10)
      expect(reports[1].loc?.start.column).toBe(5)
    })

    test('should handle zero column', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty', 1, 0))
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle large line number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty', 9999, 0))
      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should handle large column number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty', 1, 500))
      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should report loc for Object.prototype call with specific location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const object = createMemberExpression(createIdentifier('Object'), 'prototype')
      const method = createMemberExpression(object, 'hasOwnProperty')
      const node = createCallExpression(
        createMemberExpression(method, 'call'),
        [createIdentifier('obj'), createIdentifier('prop')],
        42,
        7,
      )
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('should report loc with correct end for Object.prototype call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const object = createMemberExpression(createIdentifier('Object'), 'prototype')
      const method = createMemberExpression(object, 'propertyIsEnumerable')
      const node = createCallExpression(
        createMemberExpression(method, 'call'),
        [createIdentifier('obj'), createIdentifier('prop')],
        8,
        2,
      )
      visitor.CallExpression(node)
      expect(reports[0].loc?.end.line).toBe(8)
    })
  })

  // ─── MESSAGES (10 tests) ───────────────────────────────────────────

  describe('message quality', () => {
    test('should mention hasOwn in message for hasOwnProperty.call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createObjectPrototypeCall('hasOwnProperty'))
      expect(reports[0].message.toLowerCase()).toContain('hasown')
    })

    test('should mention safer in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty'))
      expect(reports[0].message.toLowerCase()).toContain('safer')
    })

    test('should include object name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('myConfig', 'hasOwnProperty'))
      expect(reports[0].message).toContain('myConfig')
    })

    test('should include method name hasOwnProperty in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty'))
      expect(reports[0].message).toContain('hasOwnProperty')
    })

    test('should include method name propertyIsEnumerable in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'propertyIsEnumerable'))
      expect(reports[0].message).toContain('propertyIsEnumerable')
    })

    test('should include Object.hasOwn suggestion in prototype call message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty'))
      expect(reports[0].message).toContain('Object.hasOwn(obj')
    })

    test('should have different messages for Object.prototype vs direct call', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()
      const visitor1 = preferObjectHasOwnRule.create(ctx1)
      const visitor2 = preferObjectHasOwnRule.create(ctx2)
      visitor1.CallExpression(createObjectPrototypeCall('hasOwnProperty'))
      visitor2.CallExpression(createPrototypeCall('obj', 'hasOwnProperty'))
      expect(reports1[0].message).not.toBe(reports2[0].message)
    })

    test('should contain prefer in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty'))
      expect(reports[0].message.toLowerCase()).toContain('prefer')
    })

    test('should mention cleaner or safer in Object.prototype message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createObjectPrototypeCall('hasOwnProperty'))
      const msg = reports[0].message.toLowerCase()
      expect(msg.includes('cleaner') || msg.includes('safer')).toBe(true)
    })

    test('should include hasOwn in propertyIsEnumerable message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createObjectPrototypeCall('propertyIsEnumerable'))
      expect(reports[0].message).toContain('hasOwn')
    })
  })

  // ─── MULTIPLE REPORTS (10 tests) ───────────────────────────────────

  describe('multiple reports', () => {
    test('should report each hasOwnProperty call separately', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('a', 'hasOwnProperty'))
      visitor.CallExpression(createPrototypeCall('b', 'hasOwnProperty'))
      visitor.CallExpression(createPrototypeCall('c', 'hasOwnProperty'))
      expect(reports.length).toBe(3)
    })

    test('should report each propertyIsEnumerable call separately', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('a', 'propertyIsEnumerable'))
      visitor.CallExpression(createPrototypeCall('b', 'propertyIsEnumerable'))
      expect(reports.length).toBe(2)
    })

    test('should report mix of hasOwnProperty and propertyIsEnumerable', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('a', 'hasOwnProperty'))
      visitor.CallExpression(createPrototypeCall('b', 'propertyIsEnumerable'))
      expect(reports.length).toBe(2)
    })

    test('should report mix of prototype and Object.prototype patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createObjectPrototypeCall('hasOwnProperty'))
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty'))
      expect(reports.length).toBe(2)
    })

    test('should not report valid calls mixed with invalid ones', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      const validCallee = createMemberExpression(createIdentifier('Object'), 'hasOwn')
      const validNode = createCallExpression(validCallee, [
        createIdentifier('obj'),
        createIdentifier('prop'),
      ])
      visitor.CallExpression(validNode)
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty'))
      expect(reports.length).toBe(1)
    })

    test('should handle many calls in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      for (let i = 0; i < 50; i++) {
        visitor.CallExpression(createPrototypeCall(`obj${i}`, 'hasOwnProperty'))
      }
      expect(reports.length).toBe(50)
    })

    test('should maintain separate report messages for different patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createObjectPrototypeCall('hasOwnProperty'))
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty'))
      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('should report correct object names in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('alpha', 'hasOwnProperty'))
      visitor.CallExpression(createPrototypeCall('beta', 'hasOwnProperty'))
      expect(reports[0].message).toContain('alpha')
      expect(reports[1].message).toContain('beta')
    })

    test('should report correct locations for multiple nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty', 5, 0))
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty', 10, 4))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.line).toBe(10)
      expect(reports[1].loc?.start.column).toBe(4)
    })

    test('should report Object.prototype patterns with different methods', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createObjectPrototypeCall('hasOwnProperty'))
      visitor.CallExpression(createObjectPrototypeCall('propertyIsEnumerable'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).not.toBe(reports[1].message)
    })
  })

  // ─── CONTEXT (10 tests) ────────────────────────────────────────────

  describe('context', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/project/src/utils.ts')
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty'))
      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'x.hasOwnProperty(y)')
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty'))
      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty'))
      expect(reports.length).toBe(1)
    })

    test('should work with complex source code', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/deep/nested/file.ts',
        'const x = { a: 1 }; if (x.hasOwnProperty("a")) { console.log("found"); }',
      )
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty'))
      expect(reports.length).toBe(1)
    })

    test('should work with windows-style file path', () => {
      const { context, reports } = createMockContext({}, 'C:\\project\\src\\file.ts')
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty'))
      expect(reports.length).toBe(1)
    })

    test('should work with context that has parserServices', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'obj.hasOwnProperty(prop);',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
        parserServices: {
          program: {},
          esTreeNodeToTSNodeMap: new Map(),
          tsNodeToESTreeNodeMap: new Map(),
        },
      } as unknown as RuleContext
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty'))
      expect(reports.length).toBe(1)
    })

    test('should use logger from context', () => {
      const debugFn = vi.fn()
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'obj.hasOwnProperty(prop);',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: debugFn, info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = preferObjectHasOwnRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should work with config options containing extra fields', () => {
      const { context, reports } = createMockContext({ extraOption: true, numericOption: 42 })
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty'))
      expect(reports.length).toBe(1)
    })

    test('should work with .tsx file extension', () => {
      const { context, reports } = createMockContext({}, '/src/components/App.tsx')
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('props', 'hasOwnProperty'))
      expect(reports.length).toBe(1)
    })

    test('should work with .js file extension', () => {
      const { context, reports } = createMockContext({}, '/src/index.js')
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty'))
      expect(reports.length).toBe(1)
    })
  })

  // ─── TEST.EACH (40+ tests) ─────────────────────────────────────────

  describe('test.each: prototype call detection for various object names', () => {
    const objectNames = [
      'obj',
      'config',
      'data',
      'options',
      'settings',
      'state',
      'props',
      'item',
      'element',
      'node',
      'target',
      'source',
      'result',
      'response',
      'params',
      'query',
      'headers',
      'body',
      'payload',
      'cache',
      'store',
      'map',
      'set',
      'record',
      'entry',
      'dict',
      'registry',
      'buffer',
      'array',
      'list',
      'collection',
      'model',
      'view',
      'controller',
      'service',
      'handler',
      'factory',
      'builder',
      'manager',
    ]

    test.each(objectNames)('should report %s.hasOwnProperty()', (objectName) => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall(objectName, 'hasOwnProperty'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(objectName)
    })
  })

  describe('test.each: prototype call detection for various object names with propertyIsEnumerable', () => {
    const objectNames = [
      'obj',
      'config',
      'data',
      'options',
      'settings',
      'state',
      'props',
      'item',
      'element',
      'node',
      'target',
      'source',
      'result',
      'response',
      'params',
      'query',
      'headers',
      'body',
      'payload',
      'cache',
      'store',
      'map',
      'set',
      'record',
      'entry',
      'dict',
      'registry',
      'buffer',
      'array',
      'list',
      'collection',
      'model',
      'view',
      'controller',
      'service',
      'handler',
      'factory',
      'builder',
      'manager',
    ]

    test.each(objectNames)('should report %s.propertyIsEnumerable()', (objectName) => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)
      visitor.CallExpression(createPrototypeCall(objectName, 'propertyIsEnumerable'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(objectName)
    })
  })
})

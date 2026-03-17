import { describe, test, expect, vi } from 'vitest'
import { noPrototypeBuiltinsRule } from '../../../../src/rules/patterns/no-prototype-builtins.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'obj.hasOwnProperty("key")',
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

function createIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name: name,
    loc: {
      start: { line, column },
      end: { line, column: column + name.length },
    },
  }
}

function createMemberExpression(object: unknown, property: unknown, line = 1, column = 0): unknown {
  return {
    type: 'MemberExpression',
    object,
    property,
    computed: false,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createCallExpression(
  callee: unknown,
  args: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
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
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })
  })

  describe('detecting hasOwnProperty calls', () => {
    test('should report hasOwnProperty called on object', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('hasOwnProperty')
      const member = createMemberExpression(obj, prop)
      const call = createCallExpression(member)

      visitor.CallExpression(call)

      expect(reports.length).toBe(1)
    })

    test('should report with correct message for hasOwnProperty', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      const obj = createIdentifier('myObj')
      const prop = createIdentifier('hasOwnProperty')
      const member = createMemberExpression(obj, prop)
      const call = createCallExpression(member)

      visitor.CallExpression(call)

      expect(reports[0].message).toContain('hasOwnProperty')
    })

    test('should report with suggestion to use call()', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('hasOwnProperty')
      const member = createMemberExpression(obj, prop)
      const call = createCallExpression(member)

      visitor.CallExpression(call)

      expect(reports[0].message).toContain('Object.prototype.hasOwnProperty.call()')
    })
  })

  describe('detecting isPrototypeOf calls', () => {
    test('should report isPrototypeOf called on object', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('isPrototypeOf')
      const member = createMemberExpression(obj, prop)
      const call = createCallExpression(member)

      visitor.CallExpression(call)

      expect(reports.length).toBe(1)
    })

    test('should report with correct message for isPrototypeOf', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      const obj = createIdentifier('parent')
      const prop = createIdentifier('isPrototypeOf')
      const member = createMemberExpression(obj, prop)
      const call = createCallExpression(member)

      visitor.CallExpression(call)

      expect(reports[0].message).toContain('isPrototypeOf')
    })

    test('should report with suggestion to use call()', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('isPrototypeOf')
      const member = createMemberExpression(obj, prop)
      const call = createCallExpression(member)

      visitor.CallExpression(call)

      expect(reports[0].message).toContain('Object.prototype.isPrototypeOf.call()')
    })
  })

  describe('detecting propertyIsEnumerable calls', () => {
    test('should report propertyIsEnumerable called on object', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('propertyIsEnumerable')
      const member = createMemberExpression(obj, prop)
      const call = createCallExpression(member)

      visitor.CallExpression(call)

      expect(reports.length).toBe(1)
    })

    test('should report with correct message for propertyIsEnumerable', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('propertyIsEnumerable')
      const member = createMemberExpression(obj, prop)
      const call = createCallExpression(member)

      visitor.CallExpression(call)

      expect(reports[0].message).toContain('propertyIsEnumerable')
    })

    test('should report with suggestion to use call()', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('propertyIsEnumerable')
      const member = createMemberExpression(obj, prop)
      const call = createCallExpression(member)

      visitor.CallExpression(call)

      expect(reports[0].message).toContain('Object.prototype.propertyIsEnumerable.call()')
    })
  })

  describe('valid code cases', () => {
    test('should not report call to non-prototype method', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('toString')
      const member = createMemberExpression(obj, prop)
      const call = createCallExpression(member)

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report call to custom method', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('customMethod')
      const member = createMemberExpression(obj, prop)
      const call = createCallExpression(member)

      visitor.CallExpression(call)

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
      const visitor = noPrototypeBuiltinsRule.create(context)

      const func = createIdentifier('myFunction')
      const call = createCallExpression(func)

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should not report method call on this', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      const obj = createIdentifier('this')
      const prop = createIdentifier('customMethod')
      const member = createMemberExpression(obj, prop)
      const call = createCallExpression(member)

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [],
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle non-MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      const callee = createIdentifier('myFunction')
      const call = createCallExpression(callee)

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression without property', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      const obj = createIdentifier('obj')
      const member = {
        type: 'MemberExpression',
        object: obj,
      }
      const call = createCallExpression(member)

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should handle non-Identifier property', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      const obj = createIdentifier('obj')
      const prop = { type: 'Literal', value: 'hasOwnProperty' }
      const member = createMemberExpression(obj, prop)
      const call = createCallExpression(member)

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should handle property without name', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      const obj = createIdentifier('obj')
      const prop = { type: 'Identifier' }
      const member = createMemberExpression(obj, prop)
      const call = createCallExpression(member)

      visitor.CallExpression(call)

      expect(reports.length).toBe(0)
    })

    test('should report correct location for hasOwnProperty call', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('hasOwnProperty')
      const member = createMemberExpression(obj, prop, 10, 5)
      const call = createCallExpression(member, [], 10, 5)

      visitor.CallExpression(call)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct location for isPrototypeOf call', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      const obj = createIdentifier('parent')
      const prop = createIdentifier('isPrototypeOf')
      const member = createMemberExpression(obj, prop, 20, 10)
      const call = createCallExpression(member, [], 20, 10)

      visitor.CallExpression(call)

      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location for propertyIsEnumerable call', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('propertyIsEnumerable')
      const member = createMemberExpression(obj, prop, 30, 15)
      const call = createCallExpression(member, [], 30, 15)

      visitor.CallExpression(call)

      expect(reports[0].loc?.start.line).toBe(30)
      expect(reports[0].loc?.start.column).toBe(15)
    })
  })

  describe('multiple violations', () => {
    test('should report multiple prototype method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      const obj = createIdentifier('obj')
      const hasOwn = createIdentifier('hasOwnProperty')
      const isProto = createIdentifier('isPrototypeOf')
      const propEnum = createIdentifier('propertyIsEnumerable')

      visitor.CallExpression(createCallExpression(createMemberExpression(obj, hasOwn)))
      visitor.CallExpression(createCallExpression(createMemberExpression(obj, isProto)))
      visitor.CallExpression(createCallExpression(createMemberExpression(obj, propEnum)))

      expect(reports.length).toBe(3)
    })

    test('should report prototype method calls on different objects', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      const obj1 = createIdentifier('obj1')
      const obj2 = createIdentifier('obj2')
      const hasOwn = createIdentifier('hasOwnProperty')

      visitor.CallExpression(createCallExpression(createMemberExpression(obj1, hasOwn)))
      visitor.CallExpression(createCallExpression(createMemberExpression(obj2, hasOwn)))

      expect(reports.length).toBe(2)
    })
  })

  describe('message quality', () => {
    test('should mention method name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('hasOwnProperty')
      const member = createMemberExpression(obj, prop)
      const call = createCallExpression(member)

      visitor.CallExpression(call)

      expect(reports[0].message).toContain('hasOwnProperty')
    })

    test('should mention Object.prototype in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('hasOwnProperty')
      const member = createMemberExpression(obj, prop)
      const call = createCallExpression(member)

      visitor.CallExpression(call)

      expect(reports[0].message).toContain('Object.prototype')
    })

    test('should suggest using call() method', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('hasOwnProperty')
      const member = createMemberExpression(obj, prop)
      const call = createCallExpression(member)

      visitor.CallExpression(call)

      expect(reports[0].message).toContain('.call()')
    })

    test('should use single quotes around method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      const obj = createIdentifier('obj')
      const prop = createIdentifier('hasOwnProperty')
      const member = createMemberExpression(obj, prop)
      const call = createCallExpression(member)

      visitor.CallExpression(call)

      expect(reports[0].message).toContain("'hasOwnProperty'")
    })

    test('should have consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noPrototypeBuiltinsRule.create(context)

      const obj = createIdentifier('obj')
      const hasOwn = createIdentifier('hasOwnProperty')
      const isProto = createIdentifier('isPrototypeOf')
      const propEnum = createIdentifier('propertyIsEnumerable')

      visitor.CallExpression(createCallExpression(createMemberExpression(obj, hasOwn)))
      visitor.CallExpression(createCallExpression(createMemberExpression(obj, isProto)))
      visitor.CallExpression(createCallExpression(createMemberExpression(obj, propEnum)))

      expect(reports[0].message).toContain('Do not call')
      expect(reports[1].message).toContain('Do not call')
      expect(reports[2].message).toContain('Do not call')
    })
  })
})

import { describe, test, expect, vi } from 'vitest'
import { noExtendNativeRule } from '../../../../src/rules/patterns/no-extend-native.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'Object.prototype.foo = function() {}',
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
    config: { rules: { 'no-extend-native': ['error', options] } },
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

// Factory functions for creating AST nodes
function createAssignmentExpression(
  left: unknown,
  right: unknown = { type: 'Literal', value: 1 },
  lineNumber = 1,
  column = 0,
): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left,
    right,
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: 50 },
    },
  }
}

function createMemberExpression(object: unknown, property: unknown, computed = false): unknown {
  return {
    type: 'MemberExpression',
    object,
    property,
    computed,
    optional: false,
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createPrototypeExtension(
  nativeName: string,
  propertyName = 'customMethod',
  lineNumber = 1,
  column = 0,
): unknown {
  // Object.prototype.customMethod = function() {}
  const nativeObj = createIdentifier(nativeName)
  const prototypeProp = createIdentifier('prototype')
  const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
  const property = createIdentifier(propertyName)
  const left = createMemberExpression(prototypeAccess, property)

  return createAssignmentExpression(left, undefined, lineNumber, column)
}

describe('no-extend-native rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noExtendNativeRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noExtendNativeRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noExtendNativeRule.meta.docs?.recommended).toBe(true)
    })

    test('should have security category', () => {
      expect(noExtendNativeRule.meta.docs?.category).toBe('security')
    })

    test('should have schema defined', () => {
      expect(noExtendNativeRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noExtendNativeRule.meta.fixable).toBeUndefined()
    })

    test('should mention native in description', () => {
      const desc = noExtendNativeRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('native')
    })

    test('should mention prototype in description', () => {
      const desc = noExtendNativeRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('prototype')
    })

    test('should have empty schema array', () => {
      expect(noExtendNativeRule.meta.schema).toEqual([])
    })

    test('should have documentation URL', () => {
      expect(noExtendNativeRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-extend-native',
      )
    })
  })

  describe('create', () => {
    test('should return visitor object with AssignmentExpression method', () => {
      const { context } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      expect(visitor).toHaveProperty('AssignmentExpression')
      expect(typeof visitor.AssignmentExpression).toBe('function')
    })
  })

  describe('detecting Object prototype extension', () => {
    test('should report Object.prototype.customMethod assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Object')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report correct message for Object prototype extension', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Object')
      visitor.AssignmentExpression(node)

      expect(reports[0].message).toContain('Object')
      expect(reports[0].message).toContain('native object')
    })

    test('should include utility suggestion in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Object')
      visitor.AssignmentExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('utility')
    })
  })

  describe('detecting Array prototype extension', () => {
    test('should report Array.prototype.customMethod assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Array')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report correct message for Array prototype extension', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Array')
      visitor.AssignmentExpression(node)

      expect(reports[0].message).toContain('Array')
    })
  })

  describe('detecting String prototype extension', () => {
    test('should report String.prototype.customMethod assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('String')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting Number prototype extension', () => {
    test('should report Number.prototype.customMethod assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Number')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting Boolean prototype extension', () => {
    test('should report Boolean.prototype.customMethod assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Boolean')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting Function prototype extension', () => {
    test('should report Function.prototype.customMethod assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Function')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting Symbol prototype extension', () => {
    test('should report Symbol.prototype.customMethod assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Symbol')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting RegExp prototype extension', () => {
    test('should report RegExp.prototype.customMethod assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('RegExp')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting Date prototype extension', () => {
    test('should report Date.prototype.customMethod assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Date')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting Math prototype extension', () => {
    test('should report Math.prototype.customMethod assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Math')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting JSON prototype extension', () => {
    test('should report JSON.prototype.customMethod assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('JSON')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting Promise prototype extension', () => {
    test('should report Promise.prototype.customMethod assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Promise')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting Map prototype extension', () => {
    test('should report Map.prototype.customMethod assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Map')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting Set prototype extension', () => {
    test('should report Set.prototype.customMethod assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Set')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting WeakMap prototype extension', () => {
    test('should report WeakMap.prototype.customMethod assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('WeakMap')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting WeakSet prototype extension', () => {
    test('should report WeakSet.prototype.customMethod assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('WeakSet')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting Proxy prototype extension', () => {
    test('should report Proxy.prototype.customMethod assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Proxy')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting Reflect prototype extension', () => {
    test('should report Reflect.prototype.customMethod assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Reflect')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting Error prototype extensions', () => {
    test('should report Error.prototype.customMethod assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Error')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report TypeError.prototype.customMethod assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('TypeError')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report ReferenceError.prototype.customMethod assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('ReferenceError')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report SyntaxError.prototype.customMethod assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('SyntaxError')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report RangeError.prototype.customMethod assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('RangeError')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report URIError.prototype.customMethod assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('URIError')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report EvalError.prototype.customMethod assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('EvalError')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('non-reporting cases', () => {
    test('should not report assignment to custom object prototype', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('MyCustomClass')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to non-prototype property', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      // Object.customMethod = function() {} (static method, not prototype)
      const nativeObj = createIdentifier('Object')
      const property = createIdentifier('customMethod')
      const left = createMemberExpression(nativeObj, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to prototype itself', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      // Object.prototype = {} (reassigning prototype itself)
      const nativeObj = createIdentifier('Object')
      const prototypeProp = createIdentifier('prototype')
      const left = createMemberExpression(nativeObj, prototypeProp)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regular variable assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      // const foo = 'bar' (not a MemberExpression)
      const left = createIdentifier('foo')
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report nested property assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      // obj.nested.prop = 1
      const nested = createMemberExpression(createIdentifier('obj'), createIdentifier('nested'))
      const left = createMemberExpression(nested, createIdentifier('prop'))
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      expect(() => visitor.AssignmentExpression('string')).not.toThrow()
      expect(() => visitor.AssignmentExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = { left: {}, right: {} }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without left property', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = { type: 'AssignmentExpression', right: {} }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with null left', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = { type: 'AssignmentExpression', left: null, right: {} }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression without object', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const left = { type: 'MemberExpression', property: createIdentifier('prop') }
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression without property', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const left = { type: 'MemberExpression', object: createIdentifier('obj') }
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle prototype access with non-Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      // someExpr.prototype.customMethod = fn
      const prototypeAccess = createMemberExpression(
        createIdentifier('someExpr'),
        createIdentifier('prototype'),
      )
      const left = createMemberExpression(prototypeAccess, createIdentifier('customMethod'))
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      // Should not report because 'someExpr' is not a native object
      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Object')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle undefined rule config', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({
            message: descriptor.message,
            loc: descriptor.loc,
          })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'Object.prototype.foo = function() {}',
        getTokens: () => [],
        getComments: () => [],
        config: { rules: {} },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noExtendNativeRule.create(context)
      const node = createPrototypeExtension('Object')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle different property names', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Array', 'myCustomMap')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Array')
    })
  })

  describe('location reporting', () => {
    test('should report correct location for prototype extension', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Object', 'customMethod', 10, 5)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Array', 'customMethod', 5, 10)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report correct location for different native objects', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node1 = createPrototypeExtension('String', 'customMethod', 1, 0)
      const node2 = createPrototypeExtension('Number', 'customMethod', 5, 10)
      const node3 = createPrototypeExtension('Boolean', 'customMethod', 10, 20)

      visitor.AssignmentExpression(node1)
      visitor.AssignmentExpression(node2)
      visitor.AssignmentExpression(node3)

      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(10)
    })
  })

  describe('message quality', () => {
    test('should mention native object name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Array')
      visitor.AssignmentExpression(node)

      expect(reports[0].message).toContain('Array')
    })

    test('should mention extending in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Object')
      visitor.AssignmentExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('extending')
    })

    test('should mention not allowed in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Object')
      visitor.AssignmentExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('not allowed')
    })

    test('should suggest alternative in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Object')
      visitor.AssignmentExpression(node)

      // Should mention utility function or wrapper as alternative
      const msg = reports[0].message.toLowerCase()
      expect(msg.includes('utility') || msg.includes('wrapper')).toBe(true)
    })

    test('should have unique messages for different native objects', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension('Object'))
      visitor.AssignmentExpression(createPrototypeExtension('Array'))
      visitor.AssignmentExpression(createPrototypeExtension('String'))

      expect(reports.length).toBe(3)
      // Each message should mention the specific native object
      expect(reports[0].message).toContain('Object')
      expect(reports[1].message).toContain('Array')
      expect(reports[2].message).toContain('String')
    })
  })

  describe('multiple extensions in same context', () => {
    test('should report each extension independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension('Object'))
      visitor.AssignmentExpression(createPrototypeExtension('Array'))
      visitor.AssignmentExpression(createPrototypeExtension('String'))

      expect(reports.length).toBe(3)
    })

    test('should only report prototype extensions, not other assignments', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      // Valid assignment
      const validLeft = createIdentifier('myVar')
      visitor.AssignmentExpression(createAssignmentExpression(validLeft))

      // Invalid assignment
      visitor.AssignmentExpression(createPrototypeExtension('Object'))

      // Another valid assignment
      const staticMethod = createMemberExpression(
        createIdentifier('MyClass'),
        createIdentifier('staticMethod'),
      )
      visitor.AssignmentExpression(createAssignmentExpression(staticMethod))

      expect(reports.length).toBe(1)
    })
  })
})

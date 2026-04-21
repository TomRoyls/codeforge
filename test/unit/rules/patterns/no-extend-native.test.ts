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

    test('should have docs property', () => {
      expect(noExtendNativeRule.meta.docs).toBeDefined()
    })

    test('should have description in docs', () => {
      expect(noExtendNativeRule.meta.docs?.description).toBeDefined()
      expect(typeof noExtendNativeRule.meta.docs?.description).toBe('string')
    })

    test('should have category string in docs', () => {
      expect(typeof noExtendNativeRule.meta.docs?.category).toBe('string')
    })

    test('should have url string in docs', () => {
      expect(typeof noExtendNativeRule.meta.docs?.url).toBe('string')
    })

    test('should have recommended boolean in docs', () => {
      expect(typeof noExtendNativeRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have type as string', () => {
      expect(typeof noExtendNativeRule.meta.type).toBe('string')
    })

    test('should have severity as string', () => {
      expect(typeof noExtendNativeRule.meta.severity).toBe('string')
    })

    test('should have non-empty description', () => {
      expect(noExtendNativeRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have valid URL format', () => {
      const url = noExtendNativeRule.meta.docs?.url
      expect(url).toMatch(/^https?:\/\//)
    })

    test('should mention extending or modifying in description', () => {
      const desc = noExtendNativeRule.meta.docs?.description.toLowerCase()
      expect(desc?.includes('extend') || desc?.includes('modif')).toBe(true)
    })

    test('should have meta object defined', () => {
      expect(noExtendNativeRule.meta).toBeDefined()
      expect(typeof noExtendNativeRule.meta).toBe('object')
    })
  })

  describe('create', () => {
    test('should return visitor object with AssignmentExpression method', () => {
      const { context } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      expect(visitor).toHaveProperty('AssignmentExpression')
      expect(typeof visitor.AssignmentExpression).toBe('function')
    })

    test('should return a new visitor for each create call', () => {
      const { context } = createMockContext()
      const visitor1 = noExtendNativeRule.create(context)
      const visitor2 = noExtendNativeRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should return visitor with only AssignmentExpression key', () => {
      const { context } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const keys = Object.keys(visitor)
      expect(keys).toEqual(['AssignmentExpression'])
    })

    test('should return non-null visitor', () => {
      const { context } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      expect(visitor).not.toBeNull()
    })

    test('should accept context with empty config', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/test.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { rules: {} },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noExtendNativeRule.create(context)
      expect(visitor).toHaveProperty('AssignmentExpression')
    })

    test('should have create as a function', () => {
      expect(typeof noExtendNativeRule.create).toBe('function')
    })

    test('should handle being called with different file paths', () => {
      const { context } = createMockContext({}, '/different/path.ts')
      const visitor = noExtendNativeRule.create(context)

      expect(typeof visitor.AssignmentExpression).toBe('function')
    })

    test('should handle being called with different source code', () => {
      const { context } = createMockContext({}, '/src/file.ts', 'Array.prototype.foo = 1')
      const visitor = noExtendNativeRule.create(context)

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

    test('should not report assignment to HTMLElement prototype', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('HTMLElement')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to Document prototype', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Document')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to Window prototype', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Window')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to NodeList prototype', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('NodeList')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to Element prototype', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Element')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to Event prototype', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Event')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to lowerCase native name', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      // 'object' (lowercase) is not the native Object
      const node = createPrototypeExtension('object')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to array (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('array')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to Observable prototype', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Observable')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to Iterator prototype', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Iterator')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to MyError prototype', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('MyError')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to AppError prototype', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('AppError')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to User prototype', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('User')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to Config prototype', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Config')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to Record prototype', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Record')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to Result prototype', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Result')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to Handler prototype', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Handler')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to Service prototype', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Service')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to Controller prototype', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Controller')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to EventEmitter prototype', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('EventEmitter')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to Stream prototype', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Stream')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to Buffer prototype', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Buffer')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to Request prototype', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Request')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to Response prototype', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Response')
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to Promise prototype with mismatched case', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('PROMISE')
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

    test('should handle node with left as non-MemberExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with left as CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'CallExpression', callee: createIdentifier('fn') },
        right: { type: 'Literal', value: 1 },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with left as ArrayPattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'ArrayPattern', elements: [] },
        right: { type: 'Literal', value: 1 },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with left as ObjectPattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: { type: 'ObjectPattern', properties: [] },
        right: { type: 'Literal', value: 1 },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      // a.b.c.d = 1
      const d = createMemberExpression(createIdentifier('a'), createIdentifier('b'))
      const c = createMemberExpression(d, createIdentifier('c'))
      const left = createMemberExpression(c, createIdentifier('d'))
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      expect(() => visitor.AssignmentExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle numeric node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      expect(() => visitor.AssignmentExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty object left', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: {},
        right: { type: 'Literal', value: 1 },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with array left', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: [],
        right: { type: 'Literal', value: 1 },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with number left', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: 42,
        right: { type: 'Literal', value: 1 },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with string left', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: 'foo',
        right: { type: 'Literal', value: 1 },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle object with prototype property but no MemberExpression chain', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      // Object['prototype'] (Identifier native + Identifier 'prototype') - should not report
      const nativeObj = createIdentifier('Object')
      const prop = createIdentifier('prototype')
      const left = createMemberExpression(nativeObj, prop)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
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

    test('should report location at line 1 column 0 for default', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Object')
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct column for different columns', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Object', 'customMethod', 3, 15)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should report correct end position', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Array', 'customMethod', 7, 3)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(7)
    })

    test('should report location for high line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Object', 'customMethod', 999, 0)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(999)
    })

    test('should report location for high column numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Object', 'customMethod', 1, 80)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.column).toBe(80)
    })

    test('should report unique locations for multiple extensions', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension('Object', 'a', 1, 0))
      visitor.AssignmentExpression(createPrototypeExtension('Array', 'b', 2, 5))
      visitor.AssignmentExpression(createPrototypeExtension('String', 'c', 3, 10))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[2].loc?.start.line).toBe(3)
    })

    test('should report location with zero column', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Number', 'test', 5, 0)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for Error types', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('TypeError', 'test', 42, 7)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('should report location for Date', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Date', 'format', 100, 50)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location for Promise', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Promise', 'finally2', 25, 12)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('should report location for Map', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('Map', 'mapValues', 8, 4)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report location for RegExp', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = createPrototypeExtension('RegExp', 'escape', 15, 20)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(20)
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

    test('should mention native object name for Function', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension('Function'))

      expect(reports[0].message).toContain('Function')
    })

    test('should mention native object name for Symbol', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension('Symbol'))

      expect(reports[0].message).toContain('Symbol')
    })

    test('should mention native object name for RegExp', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension('RegExp'))

      expect(reports[0].message).toContain('RegExp')
    })

    test('should include wrapping suggestion', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension('Date'))

      expect(reports[0].message.toLowerCase()).toContain('wrapper')
    })

    test('should produce non-empty message', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension('Map'))

      expect(reports[0].message.length).toBeGreaterThan(0)
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

    test('should report all native extensions in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension('Object'))
      visitor.AssignmentExpression(createPrototypeExtension('Array'))
      visitor.AssignmentExpression(createPrototypeExtension('String'))
      visitor.AssignmentExpression(createPrototypeExtension('Number'))
      visitor.AssignmentExpression(createPrototypeExtension('Boolean'))

      expect(reports.length).toBe(5)
    })

    test('should report extensions interspersed with non-extensions', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension('Object'))
      visitor.AssignmentExpression(createAssignmentExpression(createIdentifier('x')))
      visitor.AssignmentExpression(createPrototypeExtension('Array'))
      visitor.AssignmentExpression(createAssignmentExpression(createIdentifier('y')))
      visitor.AssignmentExpression(createPrototypeExtension('String'))

      expect(reports.length).toBe(3)
    })

    test('should report same native object extended multiple times', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension('Object', 'method1'))
      visitor.AssignmentExpression(createPrototypeExtension('Object', 'method2'))
      visitor.AssignmentExpression(createPrototypeExtension('Object', 'method3'))

      expect(reports.length).toBe(3)
    })

    test('should handle 10 consecutive extensions', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const natives = [
        'Object',
        'Array',
        'String',
        'Number',
        'Boolean',
        'Function',
        'Symbol',
        'RegExp',
        'Date',
        'Math',
      ]
      for (const native of natives) {
        visitor.AssignmentExpression(createPrototypeExtension(native))
      }

      expect(reports.length).toBe(10)
    })

    test('should handle mixed extensions and null nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension('Object'))
      visitor.AssignmentExpression(null)
      visitor.AssignmentExpression(createPrototypeExtension('Array'))

      expect(reports.length).toBe(2)
    })

    test('should report all Error type extensions', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension('Error'))
      visitor.AssignmentExpression(createPrototypeExtension('TypeError'))
      visitor.AssignmentExpression(createPrototypeExtension('ReferenceError'))
      visitor.AssignmentExpression(createPrototypeExtension('SyntaxError'))
      visitor.AssignmentExpression(createPrototypeExtension('RangeError'))
      visitor.AssignmentExpression(createPrototypeExtension('URIError'))
      visitor.AssignmentExpression(createPrototypeExtension('EvalError'))

      expect(reports.length).toBe(7)
    })

    test('should correctly count reports with many safe assignments', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      // 10 safe assignments
      for (let i = 0; i < 10; i++) {
        visitor.AssignmentExpression(createAssignmentExpression(createIdentifier(`var${i}`)))
      }
      // 3 violations
      visitor.AssignmentExpression(createPrototypeExtension('Object'))
      visitor.AssignmentExpression(createPrototypeExtension('Array'))
      visitor.AssignmentExpression(createPrototypeExtension('String'))

      expect(reports.length).toBe(3)
    })

    test('should handle all collection type extensions', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension('Map'))
      visitor.AssignmentExpression(createPrototypeExtension('Set'))
      visitor.AssignmentExpression(createPrototypeExtension('WeakMap'))
      visitor.AssignmentExpression(createPrototypeExtension('WeakSet'))

      expect(reports.length).toBe(4)
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/project/src/utils.ts')
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension('Object'))

      expect(reports.length).toBe(1)
    })

    test('should work with test file path', () => {
      const { context, reports } = createMockContext({}, '/project/test/foo.test.ts')
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension('Array'))

      expect(reports.length).toBe(1)
    })

    test('should work with config file path', () => {
      const { context, reports } = createMockContext({}, '/project/.codeforgerc.json')
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension('String'))

      expect(reports.length).toBe(1)
    })

    test('should work with empty source', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension('Object'))

      expect(reports.length).toBe(1)
    })

    test('should work with long source code', () => {
      const source = 'a'.repeat(10000)
      const { context, reports } = createMockContext({}, '/src/file.ts', source)
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension('Object'))

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace root', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/home/user/project/src/file.ts',
        getAST: () => null,
        getSource: () => 'Object.prototype.foo = function() {}',
        getTokens: () => [],
        getComments: () => [],
        config: { rules: { 'no-extend-native': ['error'] } },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/home/user/project',
      } as unknown as RuleContext

      const visitor = noExtendNativeRule.create(context)
      visitor.AssignmentExpression(createPrototypeExtension('Object'))

      expect(reports.length).toBe(1)
    })

    test('should work when config has multiple rules', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'Object.prototype.foo = function() {}',
        getTokens: () => [],
        getComments: () => [],
        config: {
          rules: {
            'no-extend-native': ['error'],
            'no-eval': ['warn'],
            'no-console': ['off'],
          },
        },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noExtendNativeRule.create(context)
      visitor.AssignmentExpression(createPrototypeExtension('Array'))

      expect(reports.length).toBe(1)
    })

    test('should work with null options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'Object.prototype.foo = function() {}',
        getTokens: () => [],
        getComments: () => [],
        config: { rules: { 'no-extend-native': ['error', null] } },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noExtendNativeRule.create(context)
      visitor.AssignmentExpression(createPrototypeExtension('Object'))

      expect(reports.length).toBe(1)
    })

    test('should work with Windows-style file path', () => {
      const { context, reports } = createMockContext({}, 'C:\\project\\src\\file.ts')
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension('Promise'))

      expect(reports.length).toBe(1)
    })

    test('should work with relative file path', () => {
      const { context, reports } = createMockContext({}, './src/file.ts')
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension('Set'))

      expect(reports.length).toBe(1)
    })
  })

  describe('test.each - all native objects', () => {
    const nativeObjects = [
      'Object',
      'Array',
      'String',
      'Number',
      'Boolean',
      'Function',
      'Symbol',
      'RegExp',
      'Date',
      'Math',
      'JSON',
      'Promise',
      'Map',
      'Set',
      'WeakMap',
      'WeakSet',
      'Proxy',
      'Reflect',
      'Error',
      'TypeError',
      'ReferenceError',
      'SyntaxError',
      'RangeError',
      'URIError',
      'EvalError',
    ]

    test.each(nativeObjects)('should report %s.prototype extension', (nativeName) => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension(nativeName))

      expect(reports.length).toBe(1)
    })

    test.each(nativeObjects)('should include %s in report message', (nativeName) => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension(nativeName))

      expect(reports[0].message).toContain(nativeName)
    })

    test.each(nativeObjects)('should report location for %s prototype extension', (nativeName) => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension(nativeName, 'test', 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test.each(nativeObjects)('should have extending in message for %s', (nativeName) => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension(nativeName))

      expect(reports[0].message.toLowerCase()).toContain('extending')
    })

    test.each(nativeObjects)('should have not allowed in message for %s', (nativeName) => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension(nativeName))

      expect(reports[0].message.toLowerCase()).toContain('not allowed')
    })

    test.each(nativeObjects)('should have utility or wrapper in message for %s', (nativeName) => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension(nativeName))

      const msg = reports[0].message.toLowerCase()
      expect(msg.includes('utility') || msg.includes('wrapper')).toBe(true)
    })

    test.each(nativeObjects)('should have loc with start and end for %s', (nativeName) => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension(nativeName))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test.each(nativeObjects)('should report with different property names for %s', (nativeName) => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension(nativeName, 'myProp'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(nativeName)
    })
  })

  describe('test.each - non-native objects', () => {
    const nonNativeObjects = [
      'MyClass',
      'HTMLElement',
      'Document',
      'Window',
      'NodeList',
      'Element',
      'Event',
      'custom',
      'Foo',
      'Bar',
      'Baz',
      'MyArray',
      'MyString',
      'MyObject',
      'Observable',
      'Iterator',
      'Stream',
      'Buffer',
      'Request',
      'Response',
    ]

    test.each(nonNativeObjects)('should not report %s.prototype extension', (name) => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension(name))

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - edge case property names', () => {
    const propertyNames = [
      'customMethod',
      'myHelper',
      'decorate',
      'mixin',
      'extend',
      'patch',
      'hack',
      'polyfill',
      'shim',
      'foo',
      'bar',
      'baz',
      'qux',
      'test',
      'util',
    ]

    test.each(propertyNames)('should report Object.prototype.%s assignment', (propName) => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension('Object', propName))

      expect(reports.length).toBe(1)
    })

    test.each(propertyNames)('should report Array.prototype.%s assignment', (propName) => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      visitor.AssignmentExpression(createPrototypeExtension('Array', propName))

      expect(reports.length).toBe(1)
    })
  })

  describe('rule export', () => {
    test('should have default export', () => {
      const defaultExport = noExtendNativeRule
      expect(defaultExport).toBeDefined()
    })

    test('should have meta on default export', () => {
      expect(noExtendNativeRule.meta).toBeDefined()
      expect(noExtendNativeRule.meta.type).toBe('problem')
    })
  })

  describe('additional detection tests', () => {
    test('should detect Object.prototype extension with function value', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const fnRight = {
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      const nativeObj = createIdentifier('Object')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('myFunc')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left, fnRight)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect Array.prototype extension with arrow function value', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const arrowRight = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      const nativeObj = createIdentifier('Array')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('filter2')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left, arrowRight)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect String.prototype extension with object value', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const objRight = { type: 'ObjectExpression', properties: [] }
      const nativeObj = createIdentifier('String')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('myObj')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left, objRight)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect Number.prototype extension with numeric literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('Number')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('VERSION')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left, createLiteral(42))

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect Boolean.prototype extension with boolean literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('Boolean')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('flag')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left, createLiteral(true))

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect Function.prototype extension', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('Function')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('before')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Function')
    })

    test('should detect Symbol.prototype extension', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('Symbol')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('customToString')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Symbol')
    })

    test('should detect RegExp.prototype extension', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('RegExp')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('matchAll2')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect Date.prototype extension', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('Date')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('formatDate')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect Math.prototype extension', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('Math')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('clamp')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect JSON.prototype extension', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('JSON')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('safeParse')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect Promise.prototype extension', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('Promise')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('always')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect Map.prototype extension', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('Map')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('getOrDefault')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect Set.prototype extension', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('Set')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('toArray')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect WeakMap.prototype extension', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('WeakMap')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('getOrAdd')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect WeakSet.prototype extension', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('WeakSet')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('hasOrAdd')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect Proxy.prototype extension', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('Proxy')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('revoke2')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect Reflect.prototype extension', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('Reflect')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('apply2')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect Error.prototype extension', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('Error')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('toJSON')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect TypeError.prototype extension', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('TypeError')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('getDetails')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect ReferenceError.prototype extension', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('ReferenceError')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('getVarName')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect SyntaxError.prototype extension', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('SyntaxError')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('getLine')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect RangeError.prototype extension', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('RangeError')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('getRange')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect URIError.prototype extension', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('URIError')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('getURI')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should detect EvalError.prototype extension', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('EvalError')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('getExpr')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report when prototype is assigned to a native identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('Array')
      const prop = createIdentifier('prototype')
      const left = createMemberExpression(nativeObj, prop)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for undefined identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('undefined')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('test')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for null identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('null')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('test')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for window identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('window')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('test')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for global identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('global')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('test')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for console identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('console')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('test')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for process identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('process')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('test')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for module identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('module')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('test')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for exports identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('exports')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('test')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for require identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('require')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('test')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for document identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('document')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('test')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for XMLHttpRequest identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('XMLHttpRequest')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('test')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for fetch identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('fetch')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('test')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for setTimeout identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('setTimeout')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('test')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for setInterval identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('setInterval')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('test')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for parseInt identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('parseInt')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('test')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for parseFloat identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('parseFloat')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = createMemberExpression(nativeObj, prototypeProp)
      const property = createIdentifier('test')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with optional MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const nativeObj = createIdentifier('Object')
      const prototypeProp = createIdentifier('prototype')
      const prototypeAccess = {
        type: 'MemberExpression',
        object: nativeObj,
        property: prototypeProp,
        computed: false,
        optional: true,
      }
      const property = createIdentifier('customMethod')
      const left = createMemberExpression(prototypeAccess, property)
      const node = createAssignmentExpression(left)

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle CallExpression node type without crashing', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = { type: 'CallExpression', callee: createIdentifier('fn'), arguments: [] }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle BinaryExpression node type without crashing', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
        operator: '+',
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle UpdateExpression node type without crashing', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = { type: 'UpdateExpression', argument: createIdentifier('x'), operator: '++' }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle ConditionalExpression node type without crashing', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtendNativeRule.create(context)

      const node = {
        type: 'ConditionalExpression',
        test: createLiteral(true),
        consequent: createLiteral(1),
        alternate: createLiteral(2),
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })
  })
})

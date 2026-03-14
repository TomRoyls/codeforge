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
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })
  })

  describe('detecting Object.prototype.hasOwnProperty.call()', () => {
    test('should report Object.prototype.hasOwnProperty.call(obj, prop)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)

      const node = createObjectPrototypeCall('hasOwnProperty')

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('hasOwn')
    })
  })

  describe('detecting Object.prototype.propertyIsEnumerable.call()', () => {
    test('should report Object.prototype.propertyIsEnumerable.call(obj, prop)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)

      const node = createObjectPrototypeCall('propertyIsEnumerable')

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('hasOwn')
    })
  })

  describe('detecting obj.hasOwnProperty()', () => {
    test('should report obj.hasOwnProperty(prop)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)

      const node = createPrototypeCall('obj', 'hasOwnProperty')

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('hasOwn')
      expect(reports[0].message).toContain('obj')
    })

    test('should report config.hasOwnProperty(key)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)

      const node = createPrototypeCall('config', 'hasOwnProperty')

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('config')
    })
  })

  describe('detecting obj.propertyIsEnumerable()', () => {
    test('should report obj.propertyIsEnumerable(prop)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)

      const node = createPrototypeCall('obj', 'propertyIsEnumerable')

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('hasOwn')
    })
  })

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

      const node = createPrototypeCall('obj', 'toString')

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

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

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)

      const node = createPrototypeCall('obj', 'hasOwnProperty', 15, 8)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(8)
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
          reports.push({
            message: descriptor.message,
            loc: descriptor.loc,
          })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'obj.hasOwnProperty(prop);',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferObjectHasOwnRule.create(context)

      expect(() =>
        visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty')),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention hasOwn in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)

      visitor.CallExpression(createPrototypeCall('obj', 'hasOwnProperty'))

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
  })

  describe('isObjectPrototypeMethod edge cases', () => {
    test('should not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)

      const node = createCallExpression(createIdentifier('func'), [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when property type is not Identifier', () => {
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
          property: { type: 'Identifier', name: 'hasOwnProperty' },
        },
        property: { type: 'Literal', value: 'call' },
      }
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when property name is not call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)

      const object = createMemberExpression(createIdentifier('Object'), 'prototype')
      const method = createMemberExpression(object, 'hasOwnProperty')
      const callee = createMemberExpression(method, 'bind')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when method callee object is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)

      const callee = createMemberExpression(createIdentifier('hasOwnProperty'), 'call')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when method property is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)

      const callee = {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: createMemberExpression(createIdentifier('Object'), 'prototype'),
          property: { type: 'Literal', value: 'hasOwnProperty' },
        },
        property: { type: 'Identifier', name: 'call' },
      }
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when method name is wrong', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)

      const object = createMemberExpression(createIdentifier('Object'), 'prototype')
      const method = createMemberExpression(object, 'toString')
      const callee = createMemberExpression(method, 'call')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when prototype callee is not MemberExpression', () => {
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

    test('should not report when prototype property is not Identifier', () => {
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

    test('should not report when prototype property name is not prototype', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)

      const object = createMemberExpression(createIdentifier('Object'), 'proto')
      const method = createMemberExpression(object, 'hasOwnProperty')
      const callee = createMemberExpression(method, 'call')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when object identifier is not Identifier', () => {
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

    test('should not report when object identifier name is not Object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)

      const object = createMemberExpression(createIdentifier('MyObject'), 'prototype')
      const method = createMemberExpression(object, 'hasOwnProperty')
      const callee = createMemberExpression(method, 'call')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('isPrototypeCall edge cases', () => {
    test('should not report when object is null', () => {
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

    test('should not report when method name is neither hasOwnProperty nor propertyIsEnumerable', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)

      const node = createPrototypeCall('obj', 'valueOf')

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when caller is Object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)

      const node = createPrototypeCall('Object', 'hasOwnProperty')

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('getCallerName edge cases', () => {
    test('should return obj when callee object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)

      const callee = {
        type: 'MemberExpression',
        object: null,
        property: { type: 'Identifier', name: 'hasOwnProperty' },
      }

      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createIdentifier('prop')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should return obj when callee object is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferObjectHasOwnRule.create(context)

      const innerCall = createCallExpression(createIdentifier('getObj'), [])
      const callee = createMemberExpression(innerCall, 'hasOwnProperty')
      const node = createCallExpression(callee, [createIdentifier('prop')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('obj')
    })
  })
})

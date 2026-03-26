import { describe, test, expect, vi } from 'vitest'
import { noCallerRule } from '../../../../src/rules/patterns/no-caller.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x = 1;',
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
    config: { rules: { 'no-caller': ['error', options] } },
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

function createMemberExpression(
  object: string,
  property: string,
  computed = false,
  lineNumber = 1,
  column = 0,
): unknown {
  return {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: object },
    property: { type: 'Identifier', name: property },
    computed: computed,
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: object.length + property.length + 2 },
    },
  }
}

function createComputedMemberExpression(object: string, lineNumber = 1, column = 0): unknown {
  return {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: object },
    property: { type: 'Literal', value: 'callee' },
    computed: true,
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: object.length + 10 },
    },
  }
}

describe('no-caller rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noCallerRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noCallerRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noCallerRule.meta.docs?.recommended).toBe(true)
    })

    test('should have security category', () => {
      expect(noCallerRule.meta.docs?.category).toBe('security')
    })

    test('should have schema defined', () => {
      expect(noCallerRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noCallerRule.meta.fixable).toBeUndefined()
    })

    test('should mention caller in description', () => {
      const desc = noCallerRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('caller')
    })

    test('should mention callee in description', () => {
      const desc = noCallerRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('callee')
    })

    test('should mention arguments in description', () => {
      const desc = noCallerRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('arguments')
    })

    test('should have empty schema array', () => {
      expect(noCallerRule.meta.schema).toEqual([])
    })
  })

  describe('create', () => {
    test('should return visitor object with MemberExpression method', () => {
      const { context } = createMockContext()
      const visitor = noCallerRule.create(context)

      expect(visitor).toHaveProperty('MemberExpression')
    })
  })

  describe('detecting arguments.caller', () => {
    test('should report arguments.caller', () => {
      const { context, reports } = createMockContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for arguments.caller', () => {
      const { context, reports } = createMockContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports[0].message).toBe('Avoid arguments.caller and arguments.callee.')
    })

    test('should report multiple arguments.caller usages', () => {
      const { context, reports } = createMockContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller', false, 1, 0))
      visitor.MemberExpression(createMemberExpression('arguments', 'caller', false, 2, 0))
      visitor.MemberExpression(createMemberExpression('arguments', 'caller', false, 3, 0))

      expect(reports.length).toBe(3)
    })
  })

  describe('detecting arguments.callee', () => {
    test('should report arguments["callee"]', () => {
      const { context, reports } = createMockContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createComputedMemberExpression('arguments'))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for arguments.callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createComputedMemberExpression('arguments'))

      expect(reports[0].message).toBe('Avoid arguments.caller and arguments.callee.')
    })

    test('should report multiple arguments.callee usages', () => {
      const { context, reports } = createMockContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createComputedMemberExpression('arguments', 1, 0))
      visitor.MemberExpression(createComputedMemberExpression('arguments', 2, 0))
      visitor.MemberExpression(createComputedMemberExpression('arguments', 3, 0))

      expect(reports.length).toBe(3)
    })
  })

  describe('not reporting regular property access', () => {
    test('should not report regular property access on arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'length'))

      expect(reports.length).toBe(0)
    })

    test('should not report property access on non-arguments object', () => {
      const { context, reports } = createMockContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('obj', 'caller'))
      visitor.MemberExpression(createMemberExpression('foo', 'callee'))

      expect(reports.length).toBe(0)
    })

    test('should not report non-computed callee property on arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'callee', false))

      expect(reports.length).toBe(0)
    })

    test('should not report computed property access on non-arguments object', () => {
      const { context, reports } = createMockContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Literal', value: 'callee' },
        computed: true,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report computed property access on arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Literal', value: 'length' },
        computed: true,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noCallerRule.create(context)

      expect(() => visitor.MemberExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noCallerRule.create(context)

      expect(() => visitor.MemberExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noCallerRule.create(context)

      expect(() => visitor.MemberExpression('string')).not.toThrow()
      expect(() => visitor.MemberExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noCallerRule.create(context)

      const node = {
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Identifier', name: 'caller' },
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression without object', () => {
      const { context, reports } = createMockContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        property: { type: 'Identifier', name: 'caller' },
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression without property', () => {
      const { context, reports } = createMockContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without computed property', () => {
      const { context, reports } = createMockContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Literal', value: 'callee' },
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle non-Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Literal', value: 'arguments' },
        property: { type: 'Identifier', name: 'caller' },
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle non-Identifier property', () => {
      const { context, reports } = createMockContext()
      const visitor = noCallerRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arguments' },
        property: { type: 'Literal', value: 'caller' },
        computed: false,
      }
      visitor.MemberExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

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
        getSource: () => 'arguments.caller',
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

      const visitor = noCallerRule.create(context)
      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports.length).toBe(1)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for arguments.caller', () => {
      const { context, reports } = createMockContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller', false, 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position for arguments.caller', () => {
      const { context, reports } = createMockContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller', false, 5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report correct location for arguments.callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createComputedMemberExpression('arguments', 15, 8))

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(8)
    })
  })

  describe('message quality', () => {
    test('should mention arguments in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports[0].message).toContain('arguments')
    })

    test('should mention caller in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))

      expect(reports[0].message).toContain('caller')
    })

    test('should mention callee in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createComputedMemberExpression('arguments'))

      expect(reports[0].message).toContain('callee')
    })

    test('should have consistent message format for both violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noCallerRule.create(context)

      visitor.MemberExpression(createMemberExpression('arguments', 'caller'))
      visitor.MemberExpression(createComputedMemberExpression('arguments'))

      expect(reports[0].message).toBe('Avoid arguments.caller and arguments.callee.')
      expect(reports[1].message).toBe('Avoid arguments.caller and arguments.callee.')
    })
  })
})

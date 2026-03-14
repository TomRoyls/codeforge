import { describe, test, expect, vi } from 'vitest'
import { preferStringSliceRule } from '../../../../src/rules/patterns/prefer-string-slice.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'str.substring(0, 5);',
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
      end: { line, column: column + 15 },
    },
  }
}

function createMemberExpression(object: unknown, property: string): unknown {
  return {
    type: 'MemberExpression',
    object,
    property: createIdentifier(property),
    computed: false,
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

describe('prefer-string-slice rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferStringSliceRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferStringSliceRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferStringSliceRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferStringSliceRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferStringSliceRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(preferStringSliceRule.meta.fixable).toBeUndefined()
    })

    test('should mention slice in description', () => {
      expect(preferStringSliceRule.meta.docs?.description.toLowerCase()).toContain('slice')
    })

    test('should mention substring in description', () => {
      expect(preferStringSliceRule.meta.docs?.description.toLowerCase()).toContain('substring')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })
  })

  describe('detecting substring() calls', () => {
    test('should report str.substring(0, 5)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(5)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('slice')
      expect(reports[0].message).toContain('substring')
    })

    test('should report str.substring(start)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = createCallExpression(callee, [createIdentifier('start')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report str.substring(start, end)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = createCallExpression(callee, [
        createIdentifier('start'),
        createIdentifier('end'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report text.substring()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('text'), 'substring')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting substr() calls', () => {
    test('should report str.substr(0, 5)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substr')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(5)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('slice')
      expect(reports[0].message).toContain('substr')
    })

    test('should report str.substr(start)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substr')
      const node = createCallExpression(callee, [createIdentifier('start')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report str.substr(start, length)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substr')
      const node = createCallExpression(callee, [
        createIdentifier('start'),
        createIdentifier('length'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting valid slice() calls', () => {
    test('should not report str.slice(0, 5)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'slice')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(5)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.slice(start)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'slice')
      const node = createCallExpression(callee, [createIdentifier('start')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.slice(-5)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'slice')
      const node = createCallExpression(callee, [createLiteral(-5)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report other method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'toUpperCase')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.split()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'split')
      const node = createCallExpression(callee, [createLiteral(',')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.includes()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'includes')
      const node = createCallExpression(callee, [createLiteral('test')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.indexOf()', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'indexOf')
      const node = createCallExpression(callee, [createLiteral('test')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regular function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const node = createCallExpression(createIdentifier('substring'), [
        createLiteral(0),
        createLiteral(5),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createMemberExpression(createIdentifier('str'), 'substring'),
        arguments: [createLiteral(0), createLiteral(5)],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(5)], 25, 10)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports.length).toBe(1)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createLiteral(0)],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createMemberExpression(createIdentifier('str'), 'substring'),
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: createIdentifier('str'),
          property: createLiteral('substring'),
          computed: true,
        },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention slice in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports[0].message).toContain('slice')
    })

    test('should mention the deprecated method in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports[0].message).toContain('substring')
    })

    test('should mention negative indices in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports[0].message.toLowerCase()).toContain('negative')
    })

    test('should mention consistent in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferStringSliceRule.create(context)

      const callee = createMemberExpression(createIdentifier('str'), 'substring')
      visitor.CallExpression(createCallExpression(callee, []))

      expect(reports[0].message.toLowerCase()).toContain('consistent')
    })
  })
})

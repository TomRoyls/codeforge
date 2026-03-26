import { describe, test, expect, vi } from 'vitest'
import { noThenableRule } from '../../../../src/rules/patterns/no-thenable.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'promise.then(() => {});',
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

function createCallExpression(propertyName: string, lineNumber = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      property: {
        type: 'Identifier',
        name: propertyName,
      },
    },
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: propertyName.length + 10 },
    },
  }
}

function createNonMemberExpressionCall(lineNumber = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'then',
    },
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: column + 10 },
    },
  }
}

describe('no-thenable rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noThenableRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noThenableRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noThenableRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noThenableRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noThenableRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noThenableRule.meta.fixable).toBeUndefined()
    })

    test('should mention then in description', () => {
      expect(noThenableRule.meta.docs?.description.toLowerCase()).toContain('then')
    })

    test('should mention async/await in description', () => {
      const desc = noThenableRule.meta.docs?.description.toLowerCase()
      expect(desc).toMatch(/async|await/)
    })

    test('should have empty schema array', () => {
      expect(noThenableRule.meta.schema).toEqual([])
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noThenableRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })
  })

  describe('detecting .then() calls', () => {
    test('should report .then() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports.length).toBe(1)
    })

    test('should not report other method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('catch'))
      visitor.CallExpression(createCallExpression('finally'))
      visitor.CallExpression(createCallExpression('map'))

      expect(reports.length).toBe(0)
    })

    test('should not report non-member expression calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createNonMemberExpressionCall())

      expect(reports.length).toBe(0)
    })

    test('should report correct message for .then() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports[0].message).toBe('Prefer async/await over .then() method.')
    })

    test('should report multiple .then() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then', 1, 0))
      visitor.CallExpression(createCallExpression('then', 2, 0))
      visitor.CallExpression(createCallExpression('then', 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report .then() among other method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('catch'))
      visitor.CallExpression(createCallExpression('then'))
      visitor.CallExpression(createCallExpression('finally'))
      visitor.CallExpression(createCallExpression('then'))

      expect(reports.length).toBe(2)
    })
  })

  describe('edge cases', () => {
    test('should handle null node in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node in CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'then' },
        },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without callee property', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: null,
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'then' },
        },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle callee without property', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
        },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

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
        getSource: () => 'promise.then(() => {});',
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

      const visitor = noThenableRule.create(context)
      visitor.CallExpression(createCallExpression('then'))

      expect(reports.length).toBe(1)
    })

    test('should handle property without name', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: {
            type: 'Identifier',
          },
        },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle property with non-identifier type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: {
            type: 'Literal',
            value: 'then',
          },
        },
      }
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention async in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports[0].message).toContain('async')
    })

    test('should mention await in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports[0].message).toContain('await')
    })

    test('should mention then in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports[0].message).toContain('then')
    })

    test('should use .then() in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))

      expect(reports[0].message).toContain('.then()')
    })

    test('should have consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then'))
      visitor.CallExpression(createCallExpression('then', 2, 0))

      expect(reports[0].message).toBe('Prefer async/await over .then() method.')
      expect(reports[1].message).toBe('Prefer async/await over .then() method.')
    })
  })

  describe('location reporting', () => {
    test('should report correct location for .then() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockContext()
      const visitor = noThenableRule.create(context)

      visitor.CallExpression(createCallExpression('then', 5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })
  })
})

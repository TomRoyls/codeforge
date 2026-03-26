import { describe, test, expect, vi } from 'vitest'
import { preferPromiseRejectErrorsRule } from '../../../../src/rules/patterns/prefer-promise-reject-errors.js'
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

function createNewExpression(
  calleeName: string,
  hasExecutor = true,
  hasReject = false,
  lineNumber = 1,
  column = 0,
): unknown {
  const executor = hasExecutor
    ? {
        type: 'FunctionExpression',
        params: hasReject
          ? [
              { type: 'Identifier', name: 'resolve' },
              { type: 'Identifier', name: 'reject' },
            ]
          : [{ type: 'Identifier', name: 'resolve' }],
      }
    : null

  return {
    type: 'NewExpression',
    callee: {
      type: 'Identifier',
      name: calleeName,
    },
    arguments: hasExecutor ? [executor] : [],
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: 20 },
    },
  }
}

describe('prefer-promise-reject-errors rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferPromiseRejectErrorsRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferPromiseRejectErrorsRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferPromiseRejectErrorsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferPromiseRejectErrorsRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferPromiseRejectErrorsRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(preferPromiseRejectErrorsRule.meta.fixable).toBeUndefined()
    })

    test('should mention promise in description', () => {
      const desc = preferPromiseRejectErrorsRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('promise')
    })

    test('should mention reject in description', () => {
      const desc = preferPromiseRejectErrorsRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('reject')
    })

    test('should mention error in description', () => {
      const desc = preferPromiseRejectErrorsRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('error')
    })

    test('should have empty schema array', () => {
      expect(preferPromiseRejectErrorsRule.meta.schema).toEqual([])
    })
  })

  describe('create', () => {
    test('should return visitor object with NewExpression method', () => {
      const { context } = createMockContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      expect(visitor).toHaveProperty('NewExpression')
    })
  })

  describe('detecting promises without reject', () => {
    test('should report Promise without reject handler', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports.length).toBe(1)
    })

    test('should not report Promise with reject handler', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, true))

      expect(reports.length).toBe(0)
    })

    test('should not report non-Promise NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Other', true, false))

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression without executor', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', false, false))

      expect(reports.length).toBe(0)
    })

    test('should report correct message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports[0].message).toBe('Promise executor should handle errors with reject().')
    })

    test('should report multiple promises without reject', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false, 1, 0))
      visitor.NewExpression(createNewExpression('Promise', true, false, 2, 0))
      visitor.NewExpression(createNewExpression('Promise', true, false, 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report only promises without reject among others', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, true))
      visitor.NewExpression(createNewExpression('Promise', true, false))
      visitor.NewExpression(createNewExpression('Promise', true, true))
      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports.length).toBe(2)
    })
  })

  describe('edge cases', () => {
    test('should handle null node in NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      expect(() => visitor.NewExpression(null)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      expect(() => visitor.NewExpression(undefined)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node in NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      expect(() => visitor.NewExpression('string')).not.toThrow()
      expect(() => visitor.NewExpression(123)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without callee property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        arguments: [],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [
          {
            type: 'FunctionExpression',
            params: [{ type: 'Identifier', name: 'resolve' }],
          },
        ],
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle executor without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ name: 'executor' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle executor without params property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'FunctionExpression' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle non-FunctionExpression executor', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'ArrowFunctionExpression', params: [] }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }
      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))

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
        getSource: () => 'new Promise()',
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

      const visitor = preferPromiseRejectErrorsRule.create(context)
      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention reject in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports[0].message).toContain('reject')
    })

    test('should mention promise in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports[0].message).toContain('Promise')
    })

    test('should mention error in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports[0].message).toContain('error')
    })

    test('should use parentheses around reject', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false))

      expect(reports[0].message).toContain('reject()')
    })

    test('should have consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false, 1, 0))
      visitor.NewExpression(createNewExpression('Promise', true, false, 2, 0))

      expect(reports[0].message).toBe('Promise executor should handle errors with reject().')
      expect(reports[1].message).toBe('Promise executor should handle errors with reject().')
    })
  })

  describe('location reporting', () => {
    test('should report correct location for promise without reject', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false, 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockContext()
      const visitor = preferPromiseRejectErrorsRule.create(context)

      visitor.NewExpression(createNewExpression('Promise', true, false, 5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })
  })
})

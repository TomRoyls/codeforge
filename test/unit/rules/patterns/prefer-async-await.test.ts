import { describe, test, expect, vi } from 'vitest'
import { preferAsyncAwaitRule } from '../../../../src/rules/patterns/prefer-async-await.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'promise.then(x => x);',
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

function createPromiseThenCall(method: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'promise',
      },
      property: {
        type: 'Identifier',
        name: method,
      },
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createNonPromiseCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'asyncFunction',
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createMethodCall(method: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'obj',
      },
      property: {
        type: 'Identifier',
        name: method,
      },
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

describe('prefer-async-await rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferAsyncAwaitRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferAsyncAwaitRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferAsyncAwaitRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferAsyncAwaitRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferAsyncAwaitRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(preferAsyncAwaitRule.meta.fixable).toBeUndefined()
    })

    test('should mention async/await in description', () => {
      expect(preferAsyncAwaitRule.meta.docs?.description.toLowerCase()).toContain('async')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = preferAsyncAwaitRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })
  })

  describe('detecting promise methods', () => {
    test('should report .then() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAsyncAwaitRule.create(context)

      visitor.CallExpression(createPromiseThenCall('then'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('then')
    })

    test('should report .catch() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAsyncAwaitRule.create(context)

      visitor.CallExpression(createPromiseThenCall('catch'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('catch')
    })

    test('should report .finally() calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAsyncAwaitRule.create(context)

      visitor.CallExpression(createPromiseThenCall('finally'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('finally')
    })

    test('should not report non-promise method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAsyncAwaitRule.create(context)

      visitor.CallExpression(createMethodCall('map'))

      expect(reports.length).toBe(0)
    })

    test('should not report direct function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAsyncAwaitRule.create(context)

      visitor.CallExpression(createNonPromiseCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('options - allowPromiseMethods', () => {
    test('should allow promise methods when option is true', () => {
      const { context, reports } = createMockContext({ allowPromiseMethods: true })
      const visitor = preferAsyncAwaitRule.create(context)

      visitor.CallExpression(createPromiseThenCall('then'))

      expect(reports.length).toBe(0)
    })

    test('should still report when option is false', () => {
      const { context, reports } = createMockContext({ allowPromiseMethods: false })
      const visitor = preferAsyncAwaitRule.create(context)

      visitor.CallExpression(createPromiseThenCall('then'))

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferAsyncAwaitRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferAsyncAwaitRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferAsyncAwaitRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAsyncAwaitRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'promise',
          },
          property: {
            type: 'Identifier',
            name: 'then',
          },
        },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAsyncAwaitRule.create(context)

      visitor.CallExpression(createPromiseThenCall('then', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferAsyncAwaitRule.create(context)

      visitor.CallExpression(createPromiseThenCall('then'))

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
        getSource: () => 'promise.then(x => x);',
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

      const visitor = preferAsyncAwaitRule.create(context)

      expect(() => visitor.CallExpression(createPromiseThenCall('then'))).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAsyncAwaitRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAsyncAwaitRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'then',
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAsyncAwaitRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'promise',
          },
          property: {
            type: 'Literal',
            value: 'then',
          },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention async/await in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAsyncAwaitRule.create(context)

      visitor.CallExpression(createPromiseThenCall('then'))

      expect(reports[0].message.toLowerCase()).toContain('async/await')
    })

    test('should mention readability in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferAsyncAwaitRule.create(context)

      visitor.CallExpression(createPromiseThenCall('then'))

      expect(reports[0].message.toLowerCase()).toContain('readability')
    })
  })
})

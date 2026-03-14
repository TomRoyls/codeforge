import { describe, test, expect, vi } from 'vitest'
import { noConsoleLogRule } from '../../../../src/rules/patterns/no-console-log.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'console.log("test");',
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

function createConsoleCall(method: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'console',
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

function createNonConsoleCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'logger',
      },
      property: {
        type: 'Identifier',
        name: 'info',
      },
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createDirectCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'log',
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

describe('no-console-log rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noConsoleLogRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noConsoleLogRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noConsoleLogRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noConsoleLogRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noConsoleLogRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noConsoleLogRule.meta.fixable).toBe('code')
    })

    test('should mention console in description', () => {
      expect(noConsoleLogRule.meta.docs?.description.toLowerCase()).toContain('console')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })
  })

  describe('detecting console methods', () => {
    test('should report console.log', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.log')
    })

    test('should report console.warn', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('warn'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.warn')
    })

    test('should report console.error', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('error'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.error')
    })

    test('should report console.info', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('info'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.info')
    })

    test('should report console.debug', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('debug'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.debug')
    })

    test('should report console.trace', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('trace'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.trace')
    })

    test('should report console.table', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('table'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.table')
    })

    test('should not report non-console calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createNonConsoleCall())

      expect(reports.length).toBe(0)
    })

    test('should not report direct function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createDirectCall())

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention logging library in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports[0].message).toContain('logging library')
    })

    test('should mention production code in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports[0].message).toContain('production')
    })
  })

  describe('options - allow', () => {
    test('should allow console.warn when specified', () => {
      const { context, reports } = createMockContext({ allow: ['warn'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('warn'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.error when specified', () => {
      const { context, reports } = createMockContext({ allow: ['error'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('error'))

      expect(reports.length).toBe(0)
    })

    test('should allow multiple methods', () => {
      const { context, reports } = createMockContext({ allow: ['warn', 'error'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('warn'))
      visitor.CallExpression(createConsoleCall('error'))

      expect(reports.length).toBe(0)
    })

    test('should still report non-allowed methods', () => {
      const { context, reports } = createMockContext({ allow: ['warn'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'console',
          },
          property: {
            type: 'Identifier',
            name: 'log',
          },
        },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

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
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'log',
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Literal',
            value: 'console',
          },
          property: {
            type: 'Identifier',
            name: 'log',
          },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier property', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'console',
          },
          property: {
            type: 'Literal',
            value: 'log',
          },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

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
        getSource: () => 'console.log("test");',
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

      const visitor = noConsoleLogRule.create(context)

      expect(() => visitor.CallExpression(createConsoleCall('log'))).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'console',
          },
          property: {
            type: 'Identifier',
            name: 'log',
          },
        },
        arguments: [],
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle computed property access', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: {
            type: 'Identifier',
            name: 'console',
          },
          property: {
            type: 'Literal',
            value: 'log',
          },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })
})

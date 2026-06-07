import { describe, test, expect, vi } from 'vitest'
import { noConsoleLogRule } from '../../../../src/rules/patterns/no-console-log.js'
import type { RuleContext, ReportDescriptor } from '../../../../src/plugins/types.js'

interface TestReport {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  fix?: { range: readonly [number, number]; text: string }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'console.log("test");',
): { context: RuleContext; reports: TestReport[] } {
  const reports: TestReport[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        fix: descriptor.fix as { range: readonly [number, number]; text: string } | undefined,
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

function createConsoleCallWithRange(
  method: string,
  line = 1,
  column = 0,
  rangeStart = 0,
  rangeEnd = 20,
): unknown {
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
    range: [rangeStart, rangeEnd] as [number, number],
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

    test('should have a docs URL', () => {
      expect(noConsoleLogRule.meta.docs?.url).toBeDefined()
      expect(noConsoleLogRule.meta.docs?.url).toContain('codeforge.dev')
    })

    test('should not be deprecated', () => {
      expect(noConsoleLogRule.meta.deprecated).toBeUndefined()
    })

    test('should have description mentioning logging library', () => {
      expect(noConsoleLogRule.meta.docs?.description.toLowerCase()).toContain('logging')
    })
  })

  describe('schema', () => {
    test('should define allow property in schema', () => {
      const schema = noConsoleLogRule.meta.schema as ReadonlyArray<unknown>
      const firstSchema = schema[0] as Record<string, unknown>
      const properties = firstSchema.properties as Record<string, unknown>
      expect(properties).toHaveProperty('allow')
    })

    test('should set additionalProperties to false', () => {
      const schema = noConsoleLogRule.meta.schema as ReadonlyArray<unknown>
      const firstSchema = schema[0] as Record<string, unknown>
      expect(firstSchema.additionalProperties).toBe(false)
    })

    test('should define schema as object type', () => {
      const schema = noConsoleLogRule.meta.schema as ReadonlyArray<unknown>
      const firstSchema = schema[0] as Record<string, unknown>
      expect(firstSchema.type).toBe('object')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockContext()
      const visitor1 = noConsoleLogRule.create(context)
      const visitor2 = noConsoleLogRule.create(context)

      expect(visitor1).not.toBe(visitor2)
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

    test('should report console.dir', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('dir'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.dir')
    })

    test('should report console.group', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('group'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.group')
    })

    test('should report console.groupEnd', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('groupEnd'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.groupEnd')
    })

    test('should report console.time', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('time'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.time')
    })

    test('should report console.timeEnd', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('timeEnd'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.timeEnd')
    })

    test('should report console.clear', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('clear'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.clear')
    })

    test('should report console.count', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('count'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.count')
    })

    test('should report console.countReset', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('countReset'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.countReset')
    })

    test('should report console.assert', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('assert'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.assert')
    })

    test('should report console.profile', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('profile'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.profile')
    })

    test('should report console.profileEnd', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('profileEnd'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.profileEnd')
    })

    test('should report console.timestamp', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('timestamp'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.timestamp')
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

    test('should not report console with unknown method', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('customMethod'))

      expect(reports.length).toBe(0)
    })

    test('should not report console.foo()', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('foo'))

      expect(reports.length).toBe(0)
    })

    test('should report multiple different console calls independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))
      visitor.CallExpression(createConsoleCall('warn'))
      visitor.CallExpression(createConsoleCall('error'))

      expect(reports.length).toBe(3)
      expect(reports[0].message).toContain('console.log')
      expect(reports[1].message).toContain('console.warn')
      expect(reports[2].message).toContain('console.error')
    })

    test('should report same console method multiple times', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log', 1, 0))
      visitor.CallExpression(createConsoleCall('log', 2, 0))
      visitor.CallExpression(createConsoleCall('log', 3, 0))

      expect(reports.length).toBe(3)
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

    test('should include "Unexpected" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports[0].message).toContain('Unexpected')
    })

    test('should include the specific method name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('error'))

      expect(reports[0].message).toContain('console.error')
    })

    test('should include winston or pino suggestion in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      const msg = reports[0].message.toLowerCase()
      expect(msg.includes('winston') || msg.includes('pino')).toBe(true)
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

    test('should allow console.log when specified', () => {
      const { context, reports } = createMockContext({ allow: ['log'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.info when specified', () => {
      const { context, reports } = createMockContext({ allow: ['info'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('info'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.debug when specified', () => {
      const { context, reports } = createMockContext({ allow: ['debug'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('debug'))

      expect(reports.length).toBe(0)
    })

    test('should allow all known console methods', () => {
      const allMethods = [
        'log',
        'warn',
        'error',
        'info',
        'debug',
        'trace',
        'table',
        'dir',
        'time',
        'timeEnd',
        'group',
        'groupEnd',
        'clear',
        'count',
        'countReset',
        'assert',
        'profile',
        'profileEnd',
        'timestamp',
      ]
      const { context, reports } = createMockContext({ allow: allMethods })
      const visitor = noConsoleLogRule.create(context)

      for (const method of allMethods) {
        visitor.CallExpression(createConsoleCall(method))
      }

      expect(reports.length).toBe(0)
    })

    test('should handle empty allow array', () => {
      const { context, reports } = createMockContext({ allow: [] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports.length).toBe(1)
    })

    test('should only allow specified methods and report the rest', () => {
      const { context, reports } = createMockContext({ allow: ['warn', 'error'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('warn'))
      visitor.CallExpression(createConsoleCall('log'))
      visitor.CallExpression(createConsoleCall('error'))
      visitor.CallExpression(createConsoleCall('info'))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('console.log')
      expect(reports[1].message).toContain('console.info')
    })
  })

  describe('fix output', () => {
    test('should provide a fix with empty text when range exists', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCallWithRange('log', 1, 0, 0, 18))

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('')
      expect(reports[0].fix?.range[0]).toBe(0)
      expect(reports[0].fix?.range[1]).toBe(18)
    })

    test('should not provide fix when range is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports[0].fix).toBeUndefined()
    })

    test('should provide fix with correct range for different positions', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCallWithRange('log', 5, 10, 50, 68))

      expect(reports[0].fix?.range[0]).toBe(50)
      expect(reports[0].fix?.range[1]).toBe(68)
    })

    test('should provide fix for every reported console call with range', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCallWithRange('log', 1, 0, 0, 10))
      visitor.CallExpression(createConsoleCallWithRange('warn', 2, 0, 11, 25))

      expect(reports.length).toBe(2)
      expect(reports[0].fix).toBeDefined()
      expect(reports[1].fix).toBeDefined()
    })
  })

  describe('location reporting', () => {
    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log', 3, 4))

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(24)
    })

    test('should report different locations for different calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log', 1, 0))
      visitor.CallExpression(createConsoleCall('warn', 5, 10))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.column).toBe(10)
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

    test('should handle boolean node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(() => visitor.CallExpression(false)).not.toThrow()
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

    test('should handle node with null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: null,
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

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options array', () => {
      const reports: TestReport[] = []
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

    test('should not report non-CallExpression nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'console' },
            property: { type: 'Identifier', name: 'log' },
          },
        },
      }

      // CallExpression visitor is called by AST walker with CallExpression nodes only,
      // but the isConsoleCall function checks type === 'CallExpression'
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with callee having undefined type', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: undefined,
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty object as callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {},
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle logger.log with same method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createNonConsoleCall())

      expect(reports.length).toBe(0)
    })

    test('should not report window.console.log', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'window' },
            property: { type: 'Identifier', name: 'console' },
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

    test('should handle node with missing object in callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
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

    test('should handle node with missing property in callee', () => {
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
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with arguments that look like console', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'someFunction',
        },
        arguments: [{ type: 'Identifier', name: 'console' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('schema deep inspection', () => {
    test('should define allow as array type', () => {
      const schema = noConsoleLogRule.meta.schema as ReadonlyArray<unknown>
      const firstSchema = schema[0] as Record<string, unknown>
      const properties = firstSchema.properties as Record<string, unknown>
      const allowSchema = properties.allow as Record<string, unknown>
      expect(allowSchema.type).toBe('array')
    })

    test('should define allow items as string type', () => {
      const schema = noConsoleLogRule.meta.schema as ReadonlyArray<unknown>
      const firstSchema = schema[0] as Record<string, unknown>
      const properties = firstSchema.properties as Record<string, unknown>
      const allowSchema = properties.allow as Record<string, unknown>
      const items = allowSchema.items as Record<string, unknown>
      expect(items.type).toBe('string')
    })

    test('should restrict allow enum values to known console methods', () => {
      const knownMethods = [
        'log',
        'warn',
        'error',
        'info',
        'debug',
        'trace',
        'table',
        'dir',
        'time',
        'timeEnd',
        'group',
        'groupEnd',
        'clear',
        'count',
        'countReset',
        'assert',
        'profile',
        'profileEnd',
        'timestamp',
      ]
      const schema = noConsoleLogRule.meta.schema as ReadonlyArray<unknown>
      const firstSchema = schema[0] as Record<string, unknown>
      const properties = firstSchema.properties as Record<string, unknown>
      const allowSchema = properties.allow as Record<string, unknown>
      const items = allowSchema.items as Record<string, unknown>
      const enumValues = items.enum as string[]
      for (const method of knownMethods) {
        expect(enumValues).toContain(method)
      }
    })

    test('should have exactly 19 enum values for allow items', () => {
      const schema = noConsoleLogRule.meta.schema as ReadonlyArray<unknown>
      const firstSchema = schema[0] as Record<string, unknown>
      const properties = firstSchema.properties as Record<string, unknown>
      const allowSchema = properties.allow as Record<string, unknown>
      const items = allowSchema.items as Record<string, unknown>
      expect((items.enum as string[]).length).toBe(19)
    })
  })

  describe('options - allow specific methods individually', () => {
    test('should allow console.trace when specified', () => {
      const { context, reports } = createMockContext({ allow: ['trace'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('trace'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.table when specified', () => {
      const { context, reports } = createMockContext({ allow: ['table'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('table'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.dir when specified', () => {
      const { context, reports } = createMockContext({ allow: ['dir'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('dir'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.time when specified', () => {
      const { context, reports } = createMockContext({ allow: ['time'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('time'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.timeEnd when specified', () => {
      const { context, reports } = createMockContext({ allow: ['timeEnd'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('timeEnd'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.group when specified', () => {
      const { context, reports } = createMockContext({ allow: ['group'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('group'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.groupEnd when specified', () => {
      const { context, reports } = createMockContext({ allow: ['groupEnd'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('groupEnd'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.clear when specified', () => {
      const { context, reports } = createMockContext({ allow: ['clear'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('clear'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.count when specified', () => {
      const { context, reports } = createMockContext({ allow: ['count'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('count'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.countReset when specified', () => {
      const { context, reports } = createMockContext({ allow: ['countReset'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('countReset'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.assert when specified', () => {
      const { context, reports } = createMockContext({ allow: ['assert'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('assert'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.profile when specified', () => {
      const { context, reports } = createMockContext({ allow: ['profile'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('profile'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.profileEnd when specified', () => {
      const { context, reports } = createMockContext({ allow: ['profileEnd'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('profileEnd'))

      expect(reports.length).toBe(0)
    })

    test('should allow console.timestamp when specified', () => {
      const { context, reports } = createMockContext({ allow: ['timestamp'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('timestamp'))

      expect(reports.length).toBe(0)
    })
  })

  describe('options - mixed allow scenarios', () => {
    test('should allow warn and error but report log', () => {
      const { context, reports } = createMockContext({ allow: ['warn', 'error'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('warn'))
      visitor.CallExpression(createConsoleCall('error'))
      visitor.CallExpression(createConsoleCall('log'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.log')
    })

    test('should allow log and warn but report info and debug', () => {
      const { context, reports } = createMockContext({ allow: ['log', 'warn'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))
      visitor.CallExpression(createConsoleCall('warn'))
      visitor.CallExpression(createConsoleCall('info'))
      visitor.CallExpression(createConsoleCall('debug'))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('console.info')
      expect(reports[1].message).toContain('console.debug')
    })

    test('should allow debug but not table', () => {
      const { context, reports } = createMockContext({ allow: ['debug'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('debug'))
      visitor.CallExpression(createConsoleCall('table'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.table')
    })

    test('should allow trace but not log', () => {
      const { context, reports } = createMockContext({ allow: ['trace'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('trace'))
      visitor.CallExpression(createConsoleCall('log'))

      expect(reports.length).toBe(1)
    })

    test('should allow all timing methods but report log', () => {
      const { context, reports } = createMockContext({ allow: ['time', 'timeEnd'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('time'))
      visitor.CallExpression(createConsoleCall('timeEnd'))
      visitor.CallExpression(createConsoleCall('log'))

      expect(reports.length).toBe(1)
    })

    test('should allow grouping methods but report log', () => {
      const { context, reports } = createMockContext({ allow: ['group', 'groupEnd'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('group'))
      visitor.CallExpression(createConsoleCall('groupEnd'))
      visitor.CallExpression(createConsoleCall('log'))

      expect(reports.length).toBe(1)
    })

    test('should allow profiling methods but report log', () => {
      const { context, reports } = createMockContext({ allow: ['profile', 'profileEnd'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('profile'))
      visitor.CallExpression(createConsoleCall('profileEnd'))
      visitor.CallExpression(createConsoleCall('log'))

      expect(reports.length).toBe(1)
    })

    test('should report all methods when allow list contains only unknown methods', () => {
      const { context, reports } = createMockContext({ allow: ['customMethod'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))
      visitor.CallExpression(createConsoleCall('warn'))

      expect(reports.length).toBe(2)
    })

    test('should handle allow with single element', () => {
      const { context, reports } = createMockContext({ allow: ['error'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('error'))
      visitor.CallExpression(createConsoleCall('log'))
      visitor.CallExpression(createConsoleCall('warn'))

      expect(reports.length).toBe(2)
    })
  })

  describe('fix output - additional scenarios', () => {
    test('should provide fix with empty string text', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCallWithRange('log', 1, 0, 0, 18))

      expect(reports[0].fix?.text).toBe('')
    })

    test('should provide fix that removes entire call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCallWithRange('warn', 1, 0, 10, 30))

      expect(reports[0].fix?.range).toEqual([10, 30])
      expect(reports[0].fix?.text).toBe('')
    })

    test('should provide fix for console.error with range', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCallWithRange('error', 1, 0, 100, 120))

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.range[0]).toBe(100)
      expect(reports[0].fix?.range[1]).toBe(120)
    })

    test('should provide fix for console.info with range', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCallWithRange('info', 1, 0, 5, 15))

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('')
    })

    test('should provide fix for console.debug with range', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCallWithRange('debug', 1, 0, 0, 25))

      expect(reports[0].fix).toBeDefined()
    })

    test('should provide fix for console.trace with range', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCallWithRange('trace', 1, 0, 0, 20))

      expect(reports[0].fix).toBeDefined()
    })

    test('should provide fix for console.table with range', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCallWithRange('table', 1, 0, 0, 20))

      expect(reports[0].fix).toBeDefined()
    })

    test('should not provide fix when node lacks range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))

      expect(reports[0].fix).toBeUndefined()
    })

    test('should not provide fix when node has range but is allowed', () => {
      const { context, reports } = createMockContext({ allow: ['log'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCallWithRange('log', 1, 0, 0, 18))

      expect(reports.length).toBe(0)
    })

    test('should provide fix at zero-indexed range', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCallWithRange('log', 1, 0, 0, 0))

      expect(reports[0].fix?.range).toEqual([0, 0])
    })
  })

  describe('location reporting - additional scenarios', () => {
    test('should report location for console.warn', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('warn', 7, 3))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report location for console.error', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('error', 15, 20))

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report location for console.info', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('info', 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 0 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log', 0, 0))

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at large line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log', 999, 500))

      expect(reports[0].loc?.start.line).toBe(999)
      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should report end column offset by 20 from start column', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log', 1, 8))

      expect(reports[0].loc?.end.column).toBe(28)
    })
  })

  describe('edge cases - additional malformed nodes', () => {
    test('should handle number node', () => {
      const { context } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with callee type Identifier named console', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'console',
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with object named Console (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null object in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null property in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: null,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle global.console.log', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'global' },
            property: { type: 'Identifier', name: 'console' },
          },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle self.console.log', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'self' },
            property: { type: 'Identifier', name: 'console' },
          },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report foo.console.log', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'foo' },
            property: { type: 'Identifier', name: 'console' },
          },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report console.hasOwnProperty', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('hasOwnProperty'))

      expect(reports.length).toBe(0)
    })

    test('should not report console.toString', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('toString'))

      expect(reports.length).toBe(0)
    })

    test('should not report console.valueOf', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('valueOf'))

      expect(reports.length).toBe(0)
    })

    test('should not report console.constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('constructor'))

      expect(reports.length).toBe(0)
    })

    test('should handle Symbol node', () => {
      const { context } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      expect(() => visitor.CallExpression(Symbol('node'))).not.toThrow()
    })

    test('should handle node with type that is not CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        declarations: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'FunctionExpression',
        params: [],
        body: {},
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('visitor independence', () => {
    test('should not share reports between different visitors', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()

      const visitor1 = noConsoleLogRule.create(ctx1)
      const visitor2 = noConsoleLogRule.create(ctx2)

      visitor1.CallExpression(createConsoleCall('log'))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('should track reports independently across visitors', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()

      const visitor1 = noConsoleLogRule.create(ctx1)
      const visitor2 = noConsoleLogRule.create(ctx2)

      visitor1.CallExpression(createConsoleCall('log'))
      visitor2.CallExpression(createConsoleCall('warn'))
      visitor2.CallExpression(createConsoleCall('error'))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(2)
    })
  })

  describe('visitor with different options', () => {
    test('should create visitor with allow option and still report non-allowed', () => {
      const { context, reports } = createMockContext({ allow: ['warn'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('warn'))
      visitor.CallExpression(createConsoleCall('log'))
      visitor.CallExpression(createConsoleCall('error'))
      visitor.CallExpression(createConsoleCall('info'))

      expect(reports.length).toBe(3)
    })

    test('should handle options with allow containing only log', () => {
      const { context, reports } = createMockContext({ allow: ['log'] })
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))
      visitor.CallExpression(createConsoleCall('warn'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.warn')
    })
  })

  describe('message quality per method', () => {
    test('should include method name in warn message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('warn'))

      expect(reports[0].message).toContain('console.warn')
    })

    test('should include method name in error message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('error'))

      expect(reports[0].message).toContain('console.error')
    })

    test('should include method name in debug message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('debug'))

      expect(reports[0].message).toContain('console.debug')
    })

    test('should include method name in trace message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('trace'))

      expect(reports[0].message).toContain('console.trace')
    })

    test('should include method name in table message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('table'))

      expect(reports[0].message).toContain('console.table')
    })

    test('should include method name in dir message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('dir'))

      expect(reports[0].message).toContain('console.dir')
    })

    test('should include method name in time message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('time'))

      expect(reports[0].message).toContain('console.time')
    })

    test('should include method name in assert message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('assert'))

      expect(reports[0].message).toContain('console.assert')
    })
  })

  describe('default export', () => {
    test('should export the rule as default', () => {
      const defaultExport = noConsoleLogRule
      expect(defaultExport).toBeDefined()
      expect(defaultExport.meta).toBeDefined()
      expect(defaultExport.create).toBeDefined()
    })
  })

  describe('batch console method detection', () => {
    test('should report all 19 console methods', () => {
      const allMethods = [
        'log',
        'warn',
        'error',
        'info',
        'debug',
        'trace',
        'table',
        'dir',
        'time',
        'timeEnd',
        'group',
        'groupEnd',
        'clear',
        'count',
        'countReset',
        'assert',
        'profile',
        'profileEnd',
        'timestamp',
      ]
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      for (const method of allMethods) {
        visitor.CallExpression(createConsoleCall(method))
      }

      expect(reports.length).toBe(19)
    })

    test('should report each method with correct name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      visitor.CallExpression(createConsoleCall('log'))
      visitor.CallExpression(createConsoleCall('warn'))
      visitor.CallExpression(createConsoleCall('error'))

      expect(reports[0].message).toContain('console.log')
      expect(reports[1].message).toContain('console.warn')
      expect(reports[2].message).toContain('console.error')
    })
  })

  describe('non-console objects with log-like methods', () => {
    test('should not report process.log', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'process' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report myLogger.warn', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myLogger' },
          property: { type: 'Identifier', name: 'warn' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report obj.error', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Logger.info', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleLogRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Logger' },
          property: { type: 'Identifier', name: 'info' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })
})

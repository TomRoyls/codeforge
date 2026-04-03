import { describe, test, expect, vi } from 'vitest'
import { noConsoleRule } from '../../../../src/rules/best-practices/no-console.js'
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

function createConsoleLog(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'console' },
      property: { type: 'Identifier', name: 'log' },
    },
    arguments: [{ type: 'Literal', value: 'test message' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createConsoleWarn(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'console' },
      property: { type: 'Identifier', name: 'warn' },
    },
    arguments: [{ type: 'Literal', value: 'warning message' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 22 },
    },
  }
}

function createConsoleError(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'console' },
      property: { type: 'Identifier', name: 'error' },
    },
    arguments: [{ type: 'Literal', value: 'error message' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 23 },
    },
  }
}

function createConsoleInfo(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'console' },
      property: { type: 'Identifier', name: 'info' },
    },
    arguments: [{ type: 'Literal', value: 'info message' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 22 },
    },
  }
}

function createConsoleDebug(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'console' },
      property: { type: 'Identifier', name: 'debug' },
    },
    arguments: [{ type: 'Literal', value: 'debug message' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 23 },
    },
  }
}

function createConsoleTrace(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'console' },
      property: { type: 'Identifier', name: 'trace' },
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createOtherObjectLog(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'logger' },
      property: { type: 'Identifier', name: 'log' },
    },
    arguments: [{ type: 'Literal', value: 'log message' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createRegularFunctionCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'someFunction' },
    arguments: [{ type: 'Literal', value: 'test' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

describe('no-console rule', () => {
  describe('meta', () => {
    test('should have suggestion rule type', () => {
      expect(noConsoleRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noConsoleRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noConsoleRule.meta.docs?.recommended).toBe(true)
    })

    test('should have correct category', () => {
      expect(noConsoleRule.meta.docs?.category).toBe('best-practices')
    })

    test('should have schema defined', () => {
      expect(noConsoleRule.meta.schema).toBeDefined()
    })

    test('should have correct description mentioning console', () => {
      expect(noConsoleRule.meta.docs?.description.toLowerCase()).toContain('console')
    })

    test('should have correct description mentioning logging', () => {
      expect(noConsoleRule.meta.docs?.description.toLowerCase()).toContain('logging')
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noConsoleRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })
  })

  describe('detecting console.log', () => {
    test('should report console.log() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.log')
    })

    test('should report correct location for console.log', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report console.log with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [
          { type: 'Literal', value: 'value:' },
          { type: 'Identifier', name: 'x' },
        ],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 25 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting console.warn', () => {
    test('should report console.warn() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleWarn())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.warn')
    })
  })

  describe('detecting console.error', () => {
    test('should report console.error() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleError())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.error')
    })
  })

  describe('detecting console.info', () => {
    test('should report console.info() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleInfo())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.info')
    })
  })

  describe('detecting console.debug', () => {
    test('should report console.debug() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleDebug())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.debug')
    })
  })

  describe('detecting console.trace', () => {
    test('should report console.trace() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleTrace())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.trace')
    })
  })

  describe('NOT flagging non-console calls', () => {
    test('should not report logger.log() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createOtherObjectLog())

      expect(reports.length).toBe(0)
    })

    test('should not report regular function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createRegularFunctionCall())

      expect(reports.length).toBe(0)
    })

    test('should not report console.time() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'time' },
        },
        arguments: [{ type: 'Literal', value: 'timer' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report console.table() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'table' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [] }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report console.dir() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'dir' },
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noConsoleRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noConsoleRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noConsoleRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = { type: 'CallExpression', arguments: [] }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle member expression without property', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
        },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle member expression with non-Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle member expression with non-Identifier property', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Literal', value: 'log' },
        },
        arguments: [],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 15 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('options: allow', () => {
    test('should not report console.warn when allow includes warn', () => {
      const { context, reports } = createMockContext({ allow: ['warn'] })
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleWarn())

      expect(reports.length).toBe(0)
    })

    test('should not report console.error when allow includes error', () => {
      const { context, reports } = createMockContext({ allow: ['error'] })
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleError())

      expect(reports.length).toBe(0)
    })

    test('should not report console.log when allow includes log', () => {
      const { context, reports } = createMockContext({ allow: ['log'] })
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog())

      expect(reports.length).toBe(0)
    })

    test('should not report console.info when allow includes info', () => {
      const { context, reports } = createMockContext({ allow: ['info'] })
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleInfo())

      expect(reports.length).toBe(0)
    })

    test('should not report console.debug when allow includes debug', () => {
      const { context, reports } = createMockContext({ allow: ['debug'] })
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleDebug())

      expect(reports.length).toBe(0)
    })

    test('should not report console.trace when allow includes trace', () => {
      const { context, reports } = createMockContext({ allow: ['trace'] })
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleTrace())

      expect(reports.length).toBe(0)
    })

    test('should allow multiple methods', () => {
      const { context, reports } = createMockContext({ allow: ['warn', 'error'] })
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleWarn())
      visitor.CallExpression(createConsoleError())

      expect(reports.length).toBe(0)
    })

    test('should still report non-allowed methods', () => {
      const { context, reports } = createMockContext({ allow: ['warn', 'error'] })
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog())
      visitor.CallExpression(createConsoleInfo())

      expect(reports.length).toBe(2)
    })

    test('should handle empty allow array', () => {
      const { context, reports } = createMockContext({ allow: [] })
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog())

      expect(reports.length).toBe(1)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog())

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options', () => {
      const context: RuleContext = {
        report: vi.fn(),
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

      const visitor = noConsoleRule.create(context)

      expect(() => visitor.CallExpression(createConsoleLog())).not.toThrow()
    })
  })

  describe('location reporting', () => {
    test('should report correct start line', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
    })

    test('should report correct start column', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog(10, 5))

      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct end line', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog(10, 5))

      expect(reports[0].loc?.end.line).toBe(10)
    })

    test('should report correct end column', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog(10, 5))

      expect(reports[0].loc?.end.column).toBe(25)
    })
  })

  describe('message format', () => {
    test('should include method name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog())

      expect(reports[0].message).toContain('console.log')
    })

    test('should suggest using proper logging', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog())

      expect(reports[0].message.toLowerCase()).toContain('logging')
    })
  })
})

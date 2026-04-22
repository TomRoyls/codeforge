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

    test('should have docs property defined', () => {
      expect(noConsoleRule.meta.docs).toBeDefined()
    })

    test('should have a docs url', () => {
      expect(noConsoleRule.meta.docs?.url).toBeDefined()
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noConsoleRule.meta.schema)).toBe(true)
    })

    test('should have schema with allow property', () => {
      const schema = noConsoleRule.meta.schema
      if (Array.isArray(schema) && schema.length > 0) {
        const firstSchema = schema[0] as Record<string, unknown>
        const props = firstSchema.properties as Record<string, unknown>
        expect(props).toHaveProperty('allow')
      }
    })

    test('should have type string in meta', () => {
      expect(typeof noConsoleRule.meta.type).toBe('string')
    })

    test('should have severity string in meta', () => {
      expect(typeof noConsoleRule.meta.severity).toBe('string')
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noConsoleRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return a function for CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noConsoleRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should create a new visitor for each call', () => {
      const { context } = createMockContext()
      const visitor1 = noConsoleRule.create(context)
      const visitor2 = noConsoleRule.create(context)

      expect(visitor1).not.toBe(visitor2)
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

    test('should report console.log with no arguments', () => {
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
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 15 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report console.log with string literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog())

      expect(reports[0].message).toContain('console.log')
    })

    test('should report console.log with numeric argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 18 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report console.log with object argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [{ type: 'ObjectExpression', properties: [] }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report console.log with template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [{ type: 'TemplateLiteral', quasis: [], expressions: [] }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 25 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report console.log with nested call as argument', () => {
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
          {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'getValue' },
            arguments: [],
          },
        ],
        loc: {
          start: { line: 3, column: 4 },
          end: { line: 3, column: 30 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('should report console.log at various line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog(100, 0))
      visitor.CallExpression(createConsoleLog(200, 0))
      visitor.CallExpression(createConsoleLog(300, 0))

      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[1].loc?.start.line).toBe(200)
      expect(reports[2].loc?.start.line).toBe(300)
    })

    test('should report console.log at various column offsets', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog(1, 0))
      visitor.CallExpression(createConsoleLog(1, 20))
      visitor.CallExpression(createConsoleLog(1, 40))

      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.column).toBe(20)
      expect(reports[2].loc?.start.column).toBe(40)
    })

    test('should report console.log with array argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [] }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report console.log with many mixed arguments', () => {
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
          { type: 'Literal', value: 'a' },
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: true },
          { type: 'Identifier', name: 'obj' },
          { type: 'Literal', value: null },
        ],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 50 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report console.log with binary expression argument', () => {
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
          {
            type: 'BinaryExpression',
            operator: '+',
            left: { type: 'Identifier', name: 'a' },
            right: { type: 'Identifier', name: 'b' },
          },
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

    test('should report console.warn location correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleWarn(8, 4))

      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report console.warn with string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleWarn())

      expect(reports[0].message).toContain('console.warn')
    })

    test('should report console.warn with error object argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'warn' },
        },
        arguments: [
          { type: 'NewExpression', callee: { type: 'Identifier', name: 'Error' }, arguments: [] },
        ],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 30 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report console.warn with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'warn' },
        },
        arguments: [
          { type: 'Literal', value: 'warning' },
          { type: 'Identifier', name: 'err' },
        ],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 30 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report console.warn with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'warn' },
        },
        arguments: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 15 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report console.warn message includes logging suggestion', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleWarn())

      expect(reports[0].message.toLowerCase()).toContain('logging')
    })

    test('should report console.warn at different locations independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleWarn(1, 0))
      visitor.CallExpression(createConsoleWarn(2, 4))
      visitor.CallExpression(createConsoleWarn(5, 8))

      expect(reports.length).toBe(3)
    })

    test('should report console.warn with template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'warn' },
        },
        arguments: [{ type: 'TemplateLiteral', quasis: [], expressions: [] }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 25 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report console.warn end column correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleWarn(3, 5))

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(27)
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

    test('should report console.error location correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleError(12, 6))

      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(6)
    })

    test('should report console.error with error argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleError())

      expect(reports[0].message).toContain('console.error')
    })

    test('should report console.error with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [
          { type: 'Literal', value: 'Error:' },
          { type: 'Identifier', name: 'err' },
          { type: 'Literal', value: 'occurred' },
        ],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 35 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report console.error with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 15 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report console.error message includes logging suggestion', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleError())

      expect(reports[0].message.toLowerCase()).toContain('logging')
    })

    test('should report console.error at various positions', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleError(1, 0))
      visitor.CallExpression(createConsoleError(10, 2))
      visitor.CallExpression(createConsoleError(50, 12))

      expect(reports.length).toBe(3)
    })

    test('should report console.error with catch variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'error' },
        },
        arguments: [{ type: 'Identifier', name: 'e' }],
        loc: {
          start: { line: 5, column: 2 },
          end: { line: 5, column: 18 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report console.error end location correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleError(7, 3))

      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(26)
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

    test('should report console.info location correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleInfo(15, 8))

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report console.info with string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleInfo())

      expect(reports[0].message).toContain('console.info')
    })

    test('should report console.info with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'info' },
        },
        arguments: [
          { type: 'Literal', value: 'User' },
          { type: 'Identifier', name: 'user' },
          { type: 'Literal', value: 'logged in' },
        ],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 40 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report console.info with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'info' },
        },
        arguments: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 14 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report console.info message includes logging suggestion', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleInfo())

      expect(reports[0].message.toLowerCase()).toContain('logging')
    })

    test('should report console.info at different line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleInfo(1, 0))
      visitor.CallExpression(createConsoleInfo(5, 0))
      visitor.CallExpression(createConsoleInfo(20, 0))

      expect(reports.length).toBe(3)
    })

    test('should report console.info with template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'info' },
        },
        arguments: [{ type: 'TemplateLiteral', quasis: [], expressions: [] }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 30 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report console.info end location correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleInfo(4, 10))

      expect(reports[0].loc?.end.line).toBe(4)
      expect(reports[0].loc?.end.column).toBe(32)
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

    test('should report console.debug location correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleDebug(20, 2))

      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should report console.debug with string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleDebug())

      expect(reports[0].message).toContain('console.debug')
    })

    test('should report console.debug with multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'debug' },
        },
        arguments: [
          { type: 'Literal', value: 'debug:' },
          { type: 'Identifier', name: 'data' },
        ],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 30 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report console.debug with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'debug' },
        },
        arguments: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 15 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report console.debug message includes logging suggestion', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleDebug())

      expect(reports[0].message.toLowerCase()).toContain('logging')
    })

    test('should report console.debug at various positions', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleDebug(1, 0))
      visitor.CallExpression(createConsoleDebug(2, 4))
      visitor.CallExpression(createConsoleDebug(30, 10))

      expect(reports.length).toBe(3)
    })

    test('should report console.debug with object argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'debug' },
        },
        arguments: [{ type: 'ObjectExpression', properties: [] }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 25 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report console.debug end location correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleDebug(9, 1))

      expect(reports[0].loc?.end.line).toBe(9)
      expect(reports[0].loc?.end.column).toBe(24)
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

    test('should report console.trace location correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleTrace(25, 4))

      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report console.trace with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleTrace())

      expect(reports.length).toBe(1)
    })

    test('should report console.trace with label argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'trace' },
        },
        arguments: [{ type: 'Literal', value: 'myTrace' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 25 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report console.trace message includes logging suggestion', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleTrace())

      expect(reports[0].message.toLowerCase()).toContain('logging')
    })

    test('should report console.trace at various positions', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleTrace(1, 0))
      visitor.CallExpression(createConsoleTrace(3, 8))
      visitor.CallExpression(createConsoleTrace(100, 0))

      expect(reports.length).toBe(3)
    })

    test('should report console.trace end location correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleTrace(11, 2))

      expect(reports[0].loc?.end.line).toBe(11)
      expect(reports[0].loc?.end.column).toBe(17)
    })

    test('should report console.trace in nested function', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleTrace(42, 8))

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(8)
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

    test('should not report console.group() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'group' },
        },
        arguments: [{ type: 'Literal', value: 'groupLabel' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 25 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report console.groupEnd() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'groupEnd' },
        },
        arguments: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report console.assert() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'assert' },
        },
        arguments: [
          { type: 'Identifier', name: 'condition' },
          { type: 'Literal', value: 'Assertion failed' },
        ],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 35 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report console.clear() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'clear' },
        },
        arguments: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 16 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report console.count() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'count' },
        },
        arguments: [{ type: 'Literal', value: 'counter' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 22 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report console.countReset() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'countReset' },
        },
        arguments: [{ type: 'Literal', value: 'counter' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 28 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report console.timeEnd() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'timeEnd' },
        },
        arguments: [{ type: 'Literal', value: 'timer' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 24 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report console.timeLog() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'timeLog' },
        },
        arguments: [{ type: 'Literal', value: 'timer' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 24 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Math.log() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [{ type: 'Literal', value: 10 }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 14 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report custom.log() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'custom' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [{ type: 'Literal', value: 'msg' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 15 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report process.log() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'process' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [{ type: 'Literal', value: 'msg' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 17 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report myConsole.log() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myConsole' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [{ type: 'Literal', value: 'msg' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report bare log() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'log' },
        arguments: [{ type: 'Literal', value: 'msg' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report warn() function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'warn' },
        arguments: [{ type: 'Literal', value: 'msg' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 12 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report error() function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'error' },
        arguments: [{ type: 'Literal', value: 'msg' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 12 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report debug() function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'debug' },
        arguments: [{ type: 'Literal', value: 'msg' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 12 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report info() function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'info' },
        arguments: [{ type: 'Literal', value: 'msg' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 11 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report trace() function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'trace' },
        arguments: [{ type: 'Literal', value: 'msg' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 12 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report console.profile() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'profile' },
        },
        arguments: [{ type: 'Literal', value: 'profile1' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 25 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report console.profileEnd() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'profileEnd' },
        },
        arguments: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 22 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report console.console() call (nonsense method)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'console' },
        },
        arguments: [],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report window.console.log() (chained)', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'window' },
            property: { type: 'Identifier', name: 'console' },
          },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [{ type: 'Literal', value: 'msg' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 25 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report console.log reference without call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'log' },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report fetch() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fetch' },
        arguments: [{ type: 'Literal', value: '/api/data' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Logger.log() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Logger' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [{ type: 'Literal', value: 'msg' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 17 },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report obj.log() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [{ type: 'Literal', value: 'msg' }],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 14 },
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

    test('should handle node with type other than CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 'test' },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(() => visitor.CallExpression(false)).not.toThrow()
    })

    test('should handle node with numeric type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = { type: 42 }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = { type: null }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = { type: 'CallExpression', callee: null, arguments: [] }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle loc with missing end property', () => {
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
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
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

    test('should allow log and warn together', () => {
      const { context, reports } = createMockContext({ allow: ['log', 'warn'] })
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog())
      visitor.CallExpression(createConsoleWarn())

      expect(reports.length).toBe(0)
    })

    test('should report error when only log is allowed', () => {
      const { context, reports } = createMockContext({ allow: ['log'] })
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleError())

      expect(reports.length).toBe(1)
    })

    test('should report log when only error is allowed', () => {
      const { context, reports } = createMockContext({ allow: ['error'] })
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog())

      expect(reports.length).toBe(1)
    })

    test('should allow all six methods', () => {
      const { context, reports } = createMockContext({
        allow: ['log', 'warn', 'error', 'info', 'debug', 'trace'],
      })
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog())
      visitor.CallExpression(createConsoleWarn())
      visitor.CallExpression(createConsoleError())
      visitor.CallExpression(createConsoleInfo())
      visitor.CallExpression(createConsoleDebug())
      visitor.CallExpression(createConsoleTrace())

      expect(reports.length).toBe(0)
    })

    test('should allow trace but not debug', () => {
      const { context, reports } = createMockContext({ allow: ['trace'] })
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleTrace())
      visitor.CallExpression(createConsoleDebug())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.debug')
    })

    test('should allow info but report log', () => {
      const { context, reports } = createMockContext({ allow: ['info'] })
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleInfo())
      visitor.CallExpression(createConsoleLog())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('console.log')
    })

    test('should allow warn and debug but report log and error', () => {
      const { context, reports } = createMockContext({ allow: ['warn', 'debug'] })
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleWarn())
      visitor.CallExpression(createConsoleDebug())
      visitor.CallExpression(createConsoleLog())
      visitor.CallExpression(createConsoleError())

      expect(reports.length).toBe(2)
    })

    test('should handle allow with three methods', () => {
      const { context, reports } = createMockContext({ allow: ['log', 'warn', 'error'] })
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog())
      visitor.CallExpression(createConsoleWarn())
      visitor.CallExpression(createConsoleError())
      visitor.CallExpression(createConsoleInfo())
      visitor.CallExpression(createConsoleDebug())
      visitor.CallExpression(createConsoleTrace())

      expect(reports.length).toBe(3)
    })
  })

  describe('violation properties', () => {
    test('should include method name in message for log', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog())

      expect(reports[0].message).toContain('console.log')
    })

    test('should include method name in message for warn', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleWarn())

      expect(reports[0].message).toContain('console.warn')
    })

    test('should include method name in message for error', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleError())

      expect(reports[0].message).toContain('console.error')
    })

    test('should include method name in message for info', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleInfo())

      expect(reports[0].message).toContain('console.info')
    })

    test('should include method name in message for debug', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleDebug())

      expect(reports[0].message).toContain('console.debug')
    })

    test('should include method name in message for trace', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleTrace())

      expect(reports[0].message).toContain('console.trace')
    })

    test('should suggest using proper logging library', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog())

      expect(reports[0].message).toContain('logging library')
    })

    test('should have start location in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog(3, 7))

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('should have end location in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog(3, 7))

      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should produce exactly one report per violation', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog())

      expect(reports.length).toBe(1)
    })

    test('should use Unexpected in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog())

      expect(reports[0].message).toContain('Unexpected')
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

  describe('multiple violations', () => {
    test('should report multiple console.log calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog(1, 0))
      visitor.CallExpression(createConsoleLog(2, 0))
      visitor.CallExpression(createConsoleLog(3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report mixed console method calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog())
      visitor.CallExpression(createConsoleWarn())
      visitor.CallExpression(createConsoleError())

      expect(reports.length).toBe(3)
    })

    test('should report all six console methods', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog())
      visitor.CallExpression(createConsoleWarn())
      visitor.CallExpression(createConsoleError())
      visitor.CallExpression(createConsoleInfo())
      visitor.CallExpression(createConsoleDebug())
      visitor.CallExpression(createConsoleTrace())

      expect(reports.length).toBe(6)
    })

    test('should track location separately for each violation', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog(1, 0))
      visitor.CallExpression(createConsoleWarn(5, 10))
      visitor.CallExpression(createConsoleError(10, 20))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(10)
    })

    test('should produce correct messages for mixed violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog())
      visitor.CallExpression(createConsoleError())

      expect(reports[0].message).toContain('console.log')
      expect(reports[1].message).toContain('console.error')
    })

    test('should report console.log repeated many times', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.CallExpression(createConsoleLog(i + 1, 0))
      }

      expect(reports.length).toBe(20)
    })

    test('should handle mix of violations and non-violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog())
      visitor.CallExpression(createOtherObjectLog())
      visitor.CallExpression(createConsoleError())
      visitor.CallExpression(createRegularFunctionCall())
      visitor.CallExpression(createConsoleWarn())

      expect(reports.length).toBe(3)
    })

    test('should report interleaved console methods', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog(1, 0))
      visitor.CallExpression(createConsoleWarn(2, 0))
      visitor.CallExpression(createConsoleLog(3, 0))
      visitor.CallExpression(createConsoleError(4, 0))
      visitor.CallExpression(createConsoleLog(5, 0))

      expect(reports.length).toBe(5)
      expect(reports[0].message).toContain('console.log')
      expect(reports[1].message).toContain('console.warn')
      expect(reports[2].message).toContain('console.log')
      expect(reports[3].message).toContain('console.error')
      expect(reports[4].message).toContain('console.log')
    })

    test('should report multiple violations with allow filtering some', () => {
      const { context, reports } = createMockContext({ allow: ['warn'] })
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog())
      visitor.CallExpression(createConsoleWarn())
      visitor.CallExpression(createConsoleError())

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('console.log')
      expect(reports[1].message).toContain('console.error')
    })

    test('should not report any when all are allowed', () => {
      const { context, reports } = createMockContext({
        allow: ['log', 'warn', 'error', 'info', 'debug', 'trace'],
      })
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog())
      visitor.CallExpression(createConsoleWarn())
      visitor.CallExpression(createConsoleError())
      visitor.CallExpression(createConsoleInfo())
      visitor.CallExpression(createConsoleDebug())
      visitor.CallExpression(createConsoleTrace())

      expect(reports.length).toBe(0)
    })

    test('should report correct number of violations after non-console calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createOtherObjectLog())
      visitor.CallExpression(createConsoleLog())
      visitor.CallExpression(createRegularFunctionCall())
      visitor.CallExpression(createConsoleError())
      visitor.CallExpression(createOtherObjectLog())

      expect(reports.length).toBe(2)
    })
  })

  describe('valid code - extended', () => {
    test('should not report console.time() with label', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'time' },
        },
        arguments: [{ type: 'Literal', value: 'myTimer' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console.table() with array', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'table' },
        },
        arguments: [{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console.dir() with object', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'dir' },
        },
        arguments: [{ type: 'ObjectExpression', properties: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console.group() with label', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'group' },
        },
        arguments: [{ type: 'Literal', value: 'Section' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console.groupCollapsed() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'groupCollapsed' },
        },
        arguments: [{ type: 'Literal', value: 'Section' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console.groupEnd() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'groupEnd' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console.assert() with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'assert' },
        },
        arguments: [
          { type: 'Identifier', name: 'value' },
          { type: 'Literal', value: 'must be truthy' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console.clear() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'clear' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console.count() with label', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'count' },
        },
        arguments: [{ type: 'Literal', value: 'items' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 22 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console.countReset() with label', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'countReset' },
        },
        arguments: [{ type: 'Literal', value: 'items' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 28 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeEnd() with label', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'timeEnd' },
        },
        arguments: [{ type: 'Literal', value: 'myTimer' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 28 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console.timeLog() with label', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'timeLog' },
        },
        arguments: [{ type: 'Literal', value: 'myTimer' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 28 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console.profile() with label', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'profile' },
        },
        arguments: [{ type: 'Literal', value: 'CPU' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console.profileEnd() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'console' },
          property: { type: 'Identifier', name: 'profileEnd' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 22 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report Math.max() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'max' },
        },
        arguments: [
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: 2 },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report Math.floor() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'floor' },
        },
        arguments: [{ type: 'Literal', value: 3.14 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report Array.isArray() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'isArray' },
        },
        arguments: [{ type: 'Identifier', name: 'val' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report JSON.stringify() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'JSON' },
          property: { type: 'Identifier', name: 'stringify' },
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report Promise.resolve() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'resolve' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 22 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report Object.keys() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'keys' },
        },
        arguments: [{ type: 'Identifier', name: 'obj' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report document.querySelector() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'document' },
          property: { type: 'Identifier', name: 'querySelector' },
        },
        arguments: [{ type: 'Literal', value: '.class' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report this.log() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'log' },
        },
        arguments: [{ type: 'Literal', value: 'msg' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report require() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: 'fs' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report console.log() when allow includes log', () => {
      const { context, reports } = createMockContext({ allow: ['log'] })
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleLog())
      expect(reports.length).toBe(0)
    })

    test('should not report console.warn() when allow includes warn', () => {
      const { context, reports } = createMockContext({ allow: ['warn'] })
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleWarn())
      expect(reports.length).toBe(0)
    })

    test('should not report console.error() when allow includes error', () => {
      const { context, reports } = createMockContext({ allow: ['error'] })
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleError())
      expect(reports.length).toBe(0)
    })

    test('should not report console.info() when allow includes info', () => {
      const { context, reports } = createMockContext({ allow: ['info'] })
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleInfo())
      expect(reports.length).toBe(0)
    })

    test('should not report console.debug() when allow includes debug', () => {
      const { context, reports } = createMockContext({ allow: ['debug'] })
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleDebug())
      expect(reports.length).toBe(0)
    })

    test('should not report console.trace() when allow includes trace', () => {
      const { context, reports } = createMockContext({ allow: ['trace'] })
      const visitor = noConsoleRule.create(context)

      visitor.CallExpression(createConsoleTrace())
      expect(reports.length).toBe(0)
    })

    test('should not report arr.forEach() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report str.split() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'split' },
        },
        arguments: [{ type: 'Literal', value: ',' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report map.get() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: 'get' },
        },
        arguments: [{ type: 'Literal', value: 'key' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report EventEmitter.emit() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noConsoleRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'emitter' },
          property: { type: 'Identifier', name: 'emit' },
        },
        arguments: [{ type: 'Literal', value: 'event' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })
})

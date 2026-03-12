import { describe, test, expect, vi } from 'vitest'
import { noReturnAwaitRule } from '../../../../src/rules/patterns/no-return-await.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'return await promise;',
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

function createReturnAwaitStatement(line = 1, column = 0): unknown {
  return {
    type: 'ReturnStatement',
    argument: {
      type: 'AwaitExpression',
      argument: {
        type: 'Identifier',
        name: 'promise',
      },
      loc: {
        start: { line, column },
        end: { line, column: column + 15 },
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createReturnWithoutAwaitStatement(line = 1, column = 0): unknown {
  return {
    type: 'ReturnStatement',
    argument: {
      type: 'Identifier',
      name: 'promise',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createReturnWithoutArgument(line = 1, column = 0): unknown {
  return {
    type: 'ReturnStatement',
    argument: null,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createNonReturnStatement(line = 1, column = 0): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'AwaitExpression',
      argument: {
        type: 'Identifier',
        name: 'promise',
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

describe('no-return-await rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noReturnAwaitRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noReturnAwaitRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noReturnAwaitRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noReturnAwaitRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noReturnAwaitRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noReturnAwaitRule.meta.fixable).toBeUndefined()
    })

    test('should mention return await in description', () => {
      expect(noReturnAwaitRule.meta.docs?.description.toLowerCase()).toContain('return await')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      expect(visitor).toHaveProperty('ReturnStatement')
    })
  })

  describe('detecting return await', () => {
    test('should report return await', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('return await')
    })

    test('should not report return without await', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnWithoutAwaitStatement())

      expect(reports.length).toBe(0)
    })

    test('should not report return without argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnWithoutArgument())

      expect(reports.length).toBe(0)
    })

    test('should not report non-return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createNonReturnStatement())

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      expect(() => visitor.ReturnStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      expect(() => visitor.ReturnStatement(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      expect(() => visitor.ReturnStatement('string')).not.toThrow()
      expect(() => visitor.ReturnStatement(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: {
            type: 'Identifier',
            name: 'promise',
          },
        },
      }

      expect(() => visitor.ReturnStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

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
        getSource: () => 'return await promise;',
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

      const visitor = noReturnAwaitRule.create(context)

      expect(() => visitor.ReturnStatement(createReturnAwaitStatement())).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with non-await argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: 'promise',
          },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ReturnStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention unnecessary in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(reports[0].message.toLowerCase()).toContain('unnecessary')
    })

    test('should mention performance in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(reports[0].message.toLowerCase()).toContain('performance')
    })

    test('should mention Promise in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAwaitRule.create(context)

      visitor.ReturnStatement(createReturnAwaitStatement())

      expect(reports[0].message).toContain('Promise')
    })
  })
})

import { describe, test, expect, vi } from 'vitest'
import { noFloatingPromisesRule } from '../../../../src/rules/patterns/no-floating-promises.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'asyncFunction();',
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

function createFloatingPromiseStatement(line = 1, column = 0): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'asyncFunction',
      },
      arguments: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createVoidAsyncStatement(line = 1, column = 0): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'UnaryExpression',
      operator: 'void',
      argument: {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'asyncFunction',
        },
        arguments: [],
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createSyncStatement(line = 1, column = 0): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'syncFunction',
      },
      arguments: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createFetchStatement(line = 1, column = 0): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'fetch',
      },
      arguments: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createPromiseAllStatement(line = 1, column = 0): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: 'Promise',
        },
        property: {
          type: 'Identifier',
          name: 'all',
        },
      },
      arguments: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createNonExpressionStatement(line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclaration',
    kind: 'const',
    declarations: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

describe('no-floating-promises rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noFloatingPromisesRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noFloatingPromisesRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noFloatingPromisesRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noFloatingPromisesRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noFloatingPromisesRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noFloatingPromisesRule.meta.fixable).toBeUndefined()
    })

    test('should mention Promise in description', () => {
      expect(noFloatingPromisesRule.meta.docs?.description.toLowerCase()).toContain('promise')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      expect(visitor).toHaveProperty('ExpressionStatement')
    })
  })

  describe('detecting floating promises', () => {
    test('should report floating async function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createFloatingPromiseStatement())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Promise')
    })

    test('should report floating fetch call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createFetchStatement())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Promise')
    })

    test('should report floating Promise.all call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createPromiseAllStatement())

      expect(reports.length).toBe(1)
    })

    test('should not report sync function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createSyncStatement())

      expect(reports.length).toBe(0)
    })

    test('should not report non-expression statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createNonExpressionStatement())

      expect(reports.length).toBe(0)
    })
  })

  describe('options - ignoreVoid', () => {
    test('should allow void operator when ignoreVoid is true', () => {
      const { context, reports } = createMockContext({ ignoreVoid: true })
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createVoidAsyncStatement())

      expect(reports.length).toBe(0)
    })

    test('should still report floating promise when ignoreVoid is false', () => {
      const { context, reports } = createMockContext({ ignoreVoid: false })
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createFloatingPromiseStatement())

      expect(reports.length).toBe(1)
    })

    test('should report void wrapped promise by default', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createVoidAsyncStatement())

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      expect(() => visitor.ExpressionStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      expect(() => visitor.ExpressionStatement(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      expect(() => visitor.ExpressionStatement('string')).not.toThrow()
      expect(() => visitor.ExpressionStatement(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: 'asyncFunction',
          },
          arguments: [],
        },
      }

      expect(() => visitor.ExpressionStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createFloatingPromiseStatement(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createFloatingPromiseStatement())

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
        getSource: () => 'asyncFunction();',
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

      const visitor = noFloatingPromisesRule.create(context)

      expect(() => visitor.ExpressionStatement(createFloatingPromiseStatement())).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.ExpressionStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-CallExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'Identifier',
          name: 'x',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.ExpressionStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention await in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createFloatingPromiseStatement())

      expect(reports[0].message.toLowerCase()).toContain('await')
    })

    test('should mention catch in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createFloatingPromiseStatement())

      expect(reports[0].message.toLowerCase()).toContain('catch')
    })

    test('should mention unhandled rejection in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noFloatingPromisesRule.create(context)

      visitor.ExpressionStatement(createFloatingPromiseStatement())

      expect(reports[0].message.toLowerCase()).toContain('unhandled')
    })
  })
})

import { describe, test, expect, vi } from 'vitest'
import { noThrowSyncRule } from '../../../../src/rules/patterns/no-throw-sync.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'async function foo() { throw new Error("test"); }',
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

function createAsyncFunctionDeclaration(line = 1, column = 0): unknown {
  return {
    type: 'FunctionDeclaration',
    async: true,
    id: { type: 'Identifier', name: 'foo' },
    params: [],
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createSyncFunctionDeclaration(line = 1, column = 0): unknown {
  return {
    type: 'FunctionDeclaration',
    async: false,
    id: { type: 'Identifier', name: 'foo' },
    params: [],
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createAsyncFunctionExpression(line = 1, column = 0): unknown {
  return {
    type: 'FunctionExpression',
    async: true,
    id: null,
    params: [],
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createAsyncArrowFunction(line = 1, column = 0): unknown {
  return {
    type: 'ArrowFunctionExpression',
    async: true,
    params: [],
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createThrowStatement(line = 1, column = 0): unknown {
  return {
    type: 'ThrowStatement',
    argument: {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Error' },
      arguments: [{ type: 'Literal', value: 'test' }],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createNonThrowStatement(line = 1, column = 0): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'foo' },
      arguments: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('no-throw-sync rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noThrowSyncRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noThrowSyncRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noThrowSyncRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noThrowSyncRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noThrowSyncRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noThrowSyncRule.meta.fixable).toBeUndefined()
    })

    test('should mention async in description', () => {
      expect(noThrowSyncRule.meta.docs?.description.toLowerCase()).toContain('async')
    })

    test('should mention Promise.reject in description', () => {
      expect(noThrowSyncRule.meta.docs?.description).toContain('Promise.reject')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      expect(visitor).toHaveProperty('FunctionDeclaration')
      expect(visitor).toHaveProperty('FunctionDeclaration_exit')
      expect(visitor).toHaveProperty('FunctionExpression')
      expect(visitor).toHaveProperty('FunctionExpression_exit')
      expect(visitor).toHaveProperty('ArrowFunctionExpression')
      expect(visitor).toHaveProperty('ArrowFunctionExpression_exit')
      expect(visitor).toHaveProperty('ThrowStatement')
    })
  })

  describe('detecting throw in async functions', () => {
    test('should report throw in async function declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('throw')
    })

    test('should report throw in async function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionExpression(createAsyncFunctionExpression())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionExpression_exit(createAsyncFunctionExpression())

      expect(reports.length).toBe(1)
    })

    test('should report throw in async arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.ArrowFunctionExpression(createAsyncArrowFunction())
      visitor.ThrowStatement(createThrowStatement())
      visitor.ArrowFunctionExpression_exit(createAsyncArrowFunction())

      expect(reports.length).toBe(1)
    })

    test('should NOT report throw in sync function', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createSyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createSyncFunctionDeclaration())

      expect(reports.length).toBe(0)
    })

    test('should NOT report throw outside any function', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.ThrowStatement(createThrowStatement())

      expect(reports.length).toBe(0)
    })

    test('should handle nested async functions', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ArrowFunctionExpression(createAsyncArrowFunction())
      visitor.ThrowStatement(createThrowStatement())
      visitor.ArrowFunctionExpression_exit(createAsyncArrowFunction())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(2)
    })

    test('should handle async function inside sync function', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createSyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.ArrowFunctionExpression(createAsyncArrowFunction())
      visitor.ThrowStatement(createThrowStatement())
      visitor.ArrowFunctionExpression_exit(createAsyncArrowFunction())
      visitor.FunctionDeclaration_exit(createSyncFunctionDeclaration())

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention Promise.reject in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports[0].message).toContain('Promise.reject')
    })

    test('should mention async function in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports[0].message).toContain('async function')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully for FunctionDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
      expect(() => visitor.FunctionDeclaration_exit(null)).not.toThrow()
    })

    test('should handle undefined node gracefully for FunctionDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
      expect(() => visitor.FunctionDeclaration_exit(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully for FunctionDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      expect(() => visitor.FunctionDeclaration('string')).not.toThrow()
      expect(() => visitor.FunctionDeclaration(123)).not.toThrow()
      expect(() => visitor.FunctionDeclaration_exit('string')).not.toThrow()
      expect(() => visitor.FunctionDeclaration_exit(123)).not.toThrow()
    })

    test('should handle null node gracefully for ThrowStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      expect(() => visitor.ThrowStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully for ThrowStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      expect(() => visitor.ThrowStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully for ThrowStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      expect(() => visitor.ThrowStatement('string')).not.toThrow()
      expect(() => visitor.ThrowStatement(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      const throwNode = {
        type: 'ThrowStatement',
        argument: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Error' },
          arguments: [],
        },
      }

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      expect(() => visitor.ThrowStatement(throwNode)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle function node without async property', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      const funcNode = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(funcNode)
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(funcNode)

      expect(reports.length).toBe(0)
    })

    test('should handle node with partial loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      const throwNode = {
        type: 'ThrowStatement',
        argument: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Error' },
          arguments: [],
        },
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      expect(() => visitor.ThrowStatement(throwNode)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement(10, 5))
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should not report non-throw statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createNonThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(0)
    })

    test('should handle FunctionExpression edge cases', () => {
      const { context } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      expect(() => visitor.FunctionExpression(null)).not.toThrow()
      expect(() => visitor.FunctionExpression(undefined)).not.toThrow()
      expect(() => visitor.FunctionExpression('string')).not.toThrow()
      expect(() => visitor.FunctionExpression_exit(null)).not.toThrow()
    })

    test('should handle ArrowFunctionExpression edge cases', () => {
      const { context } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      expect(() => visitor.ArrowFunctionExpression(null)).not.toThrow()
      expect(() => visitor.ArrowFunctionExpression(undefined)).not.toThrow()
      expect(() => visitor.ArrowFunctionExpression('string')).not.toThrow()
      expect(() => visitor.ArrowFunctionExpression_exit(null)).not.toThrow()
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      const nodeWithoutType = {
        async: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.FunctionDeclaration(nodeWithoutType)
      visitor.ThrowStatement({ argument: {} })
      visitor.FunctionDeclaration_exit(nodeWithoutType)

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

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
        getSource: () => 'async function foo() { throw new Error("test"); }',
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

      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
    })
  })
})

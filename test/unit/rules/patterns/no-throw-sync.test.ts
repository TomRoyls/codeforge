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

function createSyncFunctionExpression(line = 1, column = 0): unknown {
  return {
    type: 'FunctionExpression',
    async: false,
    id: null,
    params: [],
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createSyncArrowFunction(line = 1, column = 0): unknown {
  return {
    type: 'ArrowFunctionExpression',
    async: false,
    params: [],
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
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

  describe('meta - extended', () => {
    test('should have docs property', () => {
      expect(noThrowSyncRule.meta.docs).toBeDefined()
    })

    test('should have docs.url property', () => {
      expect(noThrowSyncRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs.url containing rule name', () => {
      expect(noThrowSyncRule.meta.docs?.url).toContain('no-throw-sync')
    })

    test('should have description as non-empty string', () => {
      expect(typeof noThrowSyncRule.meta.docs?.description).toBe('string')
      expect((noThrowSyncRule.meta.docs?.description as string).length).toBeGreaterThan(0)
    })

    test('should have description mentioning throw', () => {
      expect(noThrowSyncRule.meta.docs?.description.toLowerCase()).toContain('throw')
    })

    test('should have description mentioning sync', () => {
      expect(noThrowSyncRule.meta.docs?.description.toLowerCase()).toContain('sync')
    })

    test('should have schema as empty array', () => {
      expect(noThrowSyncRule.meta.schema).toEqual([])
    })

    test('should have type as string', () => {
      expect(typeof noThrowSyncRule.meta.type).toBe('string')
    })

    test('should have severity as string', () => {
      expect(typeof noThrowSyncRule.meta.severity).toBe('string')
    })

    test('should have recommended as boolean true', () => {
      expect(noThrowSyncRule.meta.docs?.recommended).toBe(true)
      expect(typeof noThrowSyncRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have category as string', () => {
      expect(typeof noThrowSyncRule.meta.docs?.category).toBe('string')
    })

    test('should have description mentioning error handling', () => {
      expect(noThrowSyncRule.meta.docs?.description.toLowerCase()).toContain('error')
    })

    test('should have description mentioning consistent', () => {
      expect(noThrowSyncRule.meta.docs?.description.toLowerCase()).toContain('consistent')
    })

    test('should have docs.description mentioning rejected Promise', () => {
      expect(noThrowSyncRule.meta.docs?.description).toContain('rejected Promise')
    })

    test('should not have meta.fixable set to any value', () => {
      expect(noThrowSyncRule.meta.fixable).toBeUndefined()
    })
  })

  describe('create - visitor structure', () => {
    test('should return an object from create', () => {
      const { context } = createMockContext()
      const visitor = noThrowSyncRule.create(context)
      expect(typeof visitor).toBe('object')
    })

    test('should have FunctionDeclaration as a function', () => {
      const { context } = createMockContext()
      const visitor = noThrowSyncRule.create(context)
      expect(typeof visitor.FunctionDeclaration).toBe('function')
    })

    test('should have FunctionDeclaration_exit as a function', () => {
      const { context } = createMockContext()
      const visitor = noThrowSyncRule.create(context)
      expect(typeof visitor.FunctionDeclaration_exit).toBe('function')
    })

    test('should have FunctionExpression as a function', () => {
      const { context } = createMockContext()
      const visitor = noThrowSyncRule.create(context)
      expect(typeof visitor.FunctionExpression).toBe('function')
    })

    test('should have FunctionExpression_exit as a function', () => {
      const { context } = createMockContext()
      const visitor = noThrowSyncRule.create(context)
      expect(typeof visitor.FunctionExpression_exit).toBe('function')
    })

    test('should have ArrowFunctionExpression as a function', () => {
      const { context } = createMockContext()
      const visitor = noThrowSyncRule.create(context)
      expect(typeof visitor.ArrowFunctionExpression).toBe('function')
    })

    test('should have ArrowFunctionExpression_exit as a function', () => {
      const { context } = createMockContext()
      const visitor = noThrowSyncRule.create(context)
      expect(typeof visitor.ArrowFunctionExpression_exit).toBe('function')
    })

    test('should have ThrowStatement as a function', () => {
      const { context } = createMockContext()
      const visitor = noThrowSyncRule.create(context)
      expect(typeof visitor.ThrowStatement).toBe('function')
    })

    test('should return exactly 7 visitor methods', () => {
      const { context } = createMockContext()
      const visitor = noThrowSyncRule.create(context)
      expect(Object.keys(visitor).length).toBe(7)
    })

    test('should create independent visitors per call', () => {
      const { context } = createMockContext()
      const visitor1 = noThrowSyncRule.create(context)
      const visitor2 = noThrowSyncRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should create fresh state per visitor', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext()
      const v1 = noThrowSyncRule.create(ctx1)
      const v2 = noThrowSyncRule.create(ctx2)

      v1.FunctionDeclaration(createAsyncFunctionDeclaration())
      v1.ThrowStatement(createThrowStatement())
      v1.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      v2.ThrowStatement(createThrowStatement())

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })
  })

  describe('detection - sync functions should not report', () => {
    test('should NOT report throw in sync FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createSyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createSyncFunctionDeclaration())

      expect(reports.length).toBe(0)
    })

    test('should NOT report throw in sync FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionExpression(createSyncFunctionExpression())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionExpression_exit(createSyncFunctionExpression())

      expect(reports.length).toBe(0)
    })

    test('should NOT report throw in sync ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.ArrowFunctionExpression(createSyncArrowFunction())
      visitor.ThrowStatement(createThrowStatement())
      visitor.ArrowFunctionExpression_exit(createSyncArrowFunction())

      expect(reports.length).toBe(0)
    })

    test('should NOT report throw at top level with no functions entered', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.ThrowStatement(createThrowStatement())
      visitor.ThrowStatement(createThrowStatement())
      visitor.ThrowStatement(createThrowStatement())

      expect(reports.length).toBe(0)
    })

    test('should NOT report after exiting all async functions', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())

      expect(reports.length).toBe(1)
    })

    test('should NOT report after async function fully exits and throw is at top level', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.ArrowFunctionExpression(createAsyncArrowFunction())
      visitor.ThrowStatement(createThrowStatement(1, 0))
      visitor.ArrowFunctionExpression_exit(createAsyncArrowFunction())
      visitor.ThrowStatement(createThrowStatement(5, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })
  })

  describe('detection - async function declarations', () => {
    test('should report single throw in async FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
    })

    test('should report multiple throws in async FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement(3, 4))
      visitor.ThrowStatement(createThrowStatement(5, 8))
      visitor.ThrowStatement(createThrowStatement(7, 2))
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(3)
    })

    test('should report throw at various locations in async FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement(1, 0))
      visitor.ThrowStatement(createThrowStatement(50, 100))
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(50)
    })
  })

  describe('detection - async function expressions', () => {
    test('should report single throw in async FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionExpression(createAsyncFunctionExpression())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionExpression_exit(createAsyncFunctionExpression())

      expect(reports.length).toBe(1)
    })

    test('should report multiple throws in async FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionExpression(createAsyncFunctionExpression())
      visitor.ThrowStatement(createThrowStatement(2, 0))
      visitor.ThrowStatement(createThrowStatement(4, 0))
      visitor.FunctionExpression_exit(createAsyncFunctionExpression())

      expect(reports.length).toBe(2)
    })

    test('should NOT report throw in sync FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionExpression(createSyncFunctionExpression())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionExpression_exit(createSyncFunctionExpression())

      expect(reports.length).toBe(0)
    })
  })

  describe('detection - async arrow functions', () => {
    test('should report single throw in async ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.ArrowFunctionExpression(createAsyncArrowFunction())
      visitor.ThrowStatement(createThrowStatement())
      visitor.ArrowFunctionExpression_exit(createAsyncArrowFunction())

      expect(reports.length).toBe(1)
    })

    test('should report multiple throws in async ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.ArrowFunctionExpression(createAsyncArrowFunction())
      visitor.ThrowStatement(createThrowStatement(10, 0))
      visitor.ThrowStatement(createThrowStatement(20, 0))
      visitor.ThrowStatement(createThrowStatement(30, 0))
      visitor.ArrowFunctionExpression_exit(createAsyncArrowFunction())

      expect(reports.length).toBe(3)
    })

    test('should NOT report throw in sync ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.ArrowFunctionExpression(createSyncArrowFunction())
      visitor.ThrowStatement(createThrowStatement())
      visitor.ArrowFunctionExpression_exit(createSyncArrowFunction())

      expect(reports.length).toBe(0)
    })
  })

  describe('detection - mixed function types', () => {
    test('should report in async FunctionDeclaration but not sync FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement(2, 0))
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      visitor.FunctionDeclaration(createSyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement(6, 0))
      visitor.FunctionDeclaration_exit(createSyncFunctionDeclaration())

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(2)
    })

    test('should report in async FunctionExpression but not sync FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionExpression(createSyncFunctionExpression())
      visitor.ThrowStatement(createThrowStatement(2, 0))
      visitor.FunctionExpression_exit(createSyncFunctionExpression())

      visitor.FunctionExpression(createAsyncFunctionExpression())
      visitor.ThrowStatement(createThrowStatement(5, 0))
      visitor.FunctionExpression_exit(createAsyncFunctionExpression())

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should report in async arrow but not sync arrow', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.ArrowFunctionExpression(createSyncArrowFunction())
      visitor.ThrowStatement(createThrowStatement(3, 0))
      visitor.ArrowFunctionExpression_exit(createSyncArrowFunction())

      visitor.ArrowFunctionExpression(createAsyncArrowFunction())
      visitor.ThrowStatement(createThrowStatement(7, 0))
      visitor.ArrowFunctionExpression_exit(createAsyncArrowFunction())

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(7)
    })

    test('should handle sequential async functions of different types', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement(2, 0))
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      visitor.FunctionExpression(createAsyncFunctionExpression())
      visitor.ThrowStatement(createThrowStatement(5, 0))
      visitor.FunctionExpression_exit(createAsyncFunctionExpression())

      visitor.ArrowFunctionExpression(createAsyncArrowFunction())
      visitor.ThrowStatement(createThrowStatement(8, 0))
      visitor.ArrowFunctionExpression_exit(createAsyncArrowFunction())

      expect(reports.length).toBe(3)
    })
  })

  describe('nested functions', () => {
    test('should report throw in deeply nested async functions', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.FunctionExpression(createAsyncFunctionExpression())
      visitor.ArrowFunctionExpression(createAsyncArrowFunction())
      visitor.ThrowStatement(createThrowStatement())
      visitor.ArrowFunctionExpression_exit(createAsyncArrowFunction())
      visitor.FunctionExpression_exit(createAsyncFunctionExpression())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
    })

    test('should track async depth correctly through nested sync functions', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.FunctionDeclaration(createSyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement(5, 0))
      visitor.FunctionDeclaration_exit(createSyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement(10, 0))
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(2)
    })

    test('should handle async inside sync inside async', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement(2, 0))
      visitor.FunctionExpression(createSyncFunctionExpression())
      visitor.ThrowStatement(createThrowStatement(4, 0))
      visitor.ArrowFunctionExpression(createAsyncArrowFunction())
      visitor.ThrowStatement(createThrowStatement(6, 0))
      visitor.ArrowFunctionExpression_exit(createAsyncArrowFunction())
      visitor.ThrowStatement(createThrowStatement(8, 0))
      visitor.FunctionExpression_exit(createSyncFunctionExpression())
      visitor.ThrowStatement(createThrowStatement(10, 0))
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(5)
    })

    test('should handle multiple nested async arrows', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.ArrowFunctionExpression(createAsyncArrowFunction())
      visitor.ArrowFunctionExpression(createAsyncArrowFunction())
      visitor.ArrowFunctionExpression(createAsyncArrowFunction())
      visitor.ThrowStatement(createThrowStatement())
      visitor.ArrowFunctionExpression_exit(createAsyncArrowFunction())
      visitor.ArrowFunctionExpression_exit(createAsyncArrowFunction())
      visitor.ArrowFunctionExpression_exit(createAsyncArrowFunction())

      expect(reports.length).toBe(1)
    })

    test('should handle entering and exiting same function type multiple times', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement(3, 0))
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement(5, 0))
      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement(7, 0))
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[1].loc?.start.line).toBe(7)
    })

    test('should handle exit without matching enter gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())

      expect(reports.length).toBe(0)
    })

    test('should handle enter without matching exit', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())

      expect(reports.length).toBe(1)
    })
  })

  describe('location reporting accuracy', () => {
    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement(1, 0))
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement(999, 50))
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports[0].loc?.start.line).toBe(999)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report end location correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement(5, 10))
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(35)
    })

    test('should report default location when throw node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement({ type: 'ThrowStatement', argument: {} })
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location with zero values', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement(0, 0))
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report each throw at its own location', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement(3, 4))
      visitor.ThrowStatement(createThrowStatement(7, 12))
      visitor.ThrowStatement(createThrowStatement(15, 6))
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[1].loc?.start.line).toBe(7)
      expect(reports[2].loc?.start.line).toBe(15)
    })
  })

  describe('message content verification', () => {
    test('should contain "Unexpected" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports[0].message).toContain('Unexpected')
    })

    test('should contain "throw" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports[0].message).toContain('throw')
    })

    test('should contain "Promise.reject()" in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports[0].message).toContain('Promise.reject()')
    })

    test('should produce consistent messages for all function types', () => {
      const contexts = [
        () => {
          const { context, reports } = createMockContext()
          const visitor = noThrowSyncRule.create(context)
          visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
          visitor.ThrowStatement(createThrowStatement())
          visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())
          return reports
        },
        () => {
          const { context, reports } = createMockContext()
          const visitor = noThrowSyncRule.create(context)
          visitor.FunctionExpression(createAsyncFunctionExpression())
          visitor.ThrowStatement(createThrowStatement())
          visitor.FunctionExpression_exit(createAsyncFunctionExpression())
          return reports
        },
        () => {
          const { context, reports } = createMockContext()
          const visitor = noThrowSyncRule.create(context)
          visitor.ArrowFunctionExpression(createAsyncArrowFunction())
          visitor.ThrowStatement(createThrowStatement())
          visitor.ArrowFunctionExpression_exit(createAsyncArrowFunction())
          return reports
        },
      ]

      const messages = contexts.map((fn) => fn()[0].message)
      expect(messages[0]).toBe(messages[1])
      expect(messages[1]).toBe(messages[2])
    })

    test('should produce same message for every throw in same function', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement(1, 0))
      visitor.ThrowStatement(createThrowStatement(2, 0))
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  describe('report descriptor structure', () => {
    test('should have message property in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports[0]).toHaveProperty('message')
    })

    test('should have loc property in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports[0]).toHaveProperty('loc')
    })

    test('should have loc.start in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports[0].loc).toHaveProperty('start')
    })

    test('should have loc.end in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports[0].loc).toHaveProperty('end')
    })

    test('should have start.line as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('should have start.column as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should have end.line as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(typeof reports[0].loc?.end.line).toBe('number')
    })

    test('should have end.column as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should have message as non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })
  })

  describe('multiple reports', () => {
    test('should report 5 throws in single async function', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      for (let i = 0; i < 5; i++) {
        visitor.ThrowStatement(createThrowStatement(i + 1, 0))
      }
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(5)
    })

    test('should report 10 throws in single async function', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      for (let i = 0; i < 10; i++) {
        visitor.ThrowStatement(createThrowStatement(i + 1, 0))
      }
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(10)
    })

    test('should accumulate reports across sequential async functions', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      for (let i = 0; i < 3; i++) {
        visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
        visitor.ThrowStatement(createThrowStatement(i * 10 + 1, 0))
        visitor.ThrowStatement(createThrowStatement(i * 10 + 5, 0))
        visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())
      }

      expect(reports.length).toBe(6)
    })

    test('should handle mix of throws and non-throws in async function', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.ThrowStatement(createNonThrowStatement())
      visitor.ThrowStatement(createThrowStatement())
      visitor.ThrowStatement(createNonThrowStatement())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(3)
    })
  })

  describe('non-throw statement types', () => {
    test('should NOT report ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createNonThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(0)
    })

    test('should NOT report ReturnStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement({ type: 'ReturnStatement', argument: null })
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(0)
    })

    test('should NOT report VariableDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement({ type: 'VariableDeclaration', declarations: [] })
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(0)
    })

    test('should NOT report IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement({ type: 'IfStatement', test: null, consequent: null })
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(0)
    })

    test('should NOT report ForStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement({
        type: 'ForStatement',
        init: null,
        test: null,
        update: null,
        body: null,
      })
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(0)
    })

    test('should NOT report WhileStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement({ type: 'WhileStatement', test: null, body: null })
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(0)
    })

    test('should NOT report TryStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement({ type: 'TryStatement', block: null })
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases - null and undefined nodes', () => {
    test('should handle null for all visitor methods without throwing', () => {
      const { context } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
      expect(() => visitor.FunctionExpression(null)).not.toThrow()
      expect(() => visitor.ArrowFunctionExpression(null)).not.toThrow()
      expect(() => visitor.ThrowStatement(null)).not.toThrow()
      expect(() => visitor.FunctionDeclaration_exit(null)).not.toThrow()
      expect(() => visitor.FunctionExpression_exit(null)).not.toThrow()
      expect(() => visitor.ArrowFunctionExpression_exit(null)).not.toThrow()
    })

    test('should handle undefined for all visitor methods without throwing', () => {
      const { context } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
      expect(() => visitor.FunctionExpression(undefined)).not.toThrow()
      expect(() => visitor.ArrowFunctionExpression(undefined)).not.toThrow()
      expect(() => visitor.ThrowStatement(undefined)).not.toThrow()
      expect(() => visitor.FunctionDeclaration_exit(undefined)).not.toThrow()
      expect(() => visitor.FunctionExpression_exit(undefined)).not.toThrow()
      expect(() => visitor.ArrowFunctionExpression_exit(undefined)).not.toThrow()
    })

    test('should not report for null ThrowStatement in async context', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(null)
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(0)
    })

    test('should not report for undefined ThrowStatement in async context', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionExpression(createAsyncFunctionExpression())
      visitor.ThrowStatement(undefined)
      visitor.FunctionExpression_exit(createAsyncFunctionExpression())

      expect(reports.length).toBe(0)
    })

    test('should handle boolean node for ThrowStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.ArrowFunctionExpression(createAsyncArrowFunction())
      expect(() => visitor.ThrowStatement(true)).not.toThrow()
      expect(() => visitor.ThrowStatement(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases - malformed nodes', () => {
    test('should handle node with async as string "true"', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        async: 'true',
        id: { type: 'Identifier', name: 'foo' },
      })
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit({
        type: 'FunctionDeclaration',
        async: 'true',
        id: { type: 'Identifier', name: 'foo' },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with async as number 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        async: 1,
      })
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit({
        type: 'FunctionDeclaration',
        async: 1,
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with async as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        async: null,
      })
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit({
        type: 'FunctionDeclaration',
        async: null,
      })

      expect(reports.length).toBe(0)
    })

    test('should handle empty object as function node', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration({})
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit({})

      expect(reports.length).toBe(0)
    })

    test('should handle empty object as throw node', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement({})
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(0)
    })

    test('should handle node with loc containing non-numeric values', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement({
        type: 'ThrowStatement',
        argument: {},
        loc: { start: { line: 'abc', column: 'def' }, end: { line: 'xyz', column: 'uvw' } },
      })
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
    })

    test('should handle node with loc.start as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement({
        type: 'ThrowStatement',
        argument: {},
        loc: { start: null, end: null },
      })
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        async: true,
        extra: 'data',
        body: {},
      })
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit({
        type: 'FunctionDeclaration',
        async: true,
        extra: 'data',
        body: {},
      })

      expect(reports.length).toBe(1)
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/custom/path/file.ts')
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'const x = 1')
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
    })

    test('should work with options containing extra properties', () => {
      const { context, reports } = createMockContext({ extra: true, nested: { value: 42 } })
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
    })

    test('should work with config having no options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace roots', () => {
      const { context, reports } = createMockContext()
      const ctx = { ...context, workspaceRoot: '/different/workspace' } as unknown as RuleContext
      const visitor = noThrowSyncRule.create(ctx)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
    })
  })

  describe('export verification', () => {
    test('should export noThrowSyncRule as named export', () => {
      expect(noThrowSyncRule).toBeDefined()
    })

    test('should export a rule with meta property', () => {
      expect(noThrowSyncRule.meta).toBeDefined()
    })

    test('should export a rule with create property', () => {
      expect(noThrowSyncRule.create).toBeDefined()
      expect(typeof noThrowSyncRule.create).toBe('function')
    })

    test('should have meta and create as only top-level properties', () => {
      expect(Object.keys(noThrowSyncRule).sort()).toEqual(['create', 'meta'])
    })
  })

  describe('async depth tracking', () => {
    test('should increment depth for each async function entered', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.FunctionExpression(createAsyncFunctionExpression())
      visitor.ArrowFunctionExpression(createAsyncArrowFunction())
      visitor.ThrowStatement(createThrowStatement())

      expect(reports.length).toBe(1)
    })

    test('should decrement depth when async function exits', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.FunctionExpression(createAsyncFunctionExpression())
      visitor.ThrowStatement(createThrowStatement(1, 0))
      visitor.FunctionExpression_exit(createAsyncFunctionExpression())
      visitor.ThrowStatement(createThrowStatement(2, 0))
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement(3, 0))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
    })

    test('should not increment depth for sync function enter', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.FunctionDeclaration(createSyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createSyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(2)
    })

    test('should not decrement depth for sync function exit', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.FunctionDeclaration_exit(createSyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
    })

    test('should handle rapid enter/exit of async functions', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
        visitor.ThrowStatement(createThrowStatement(i + 1, 0))
        visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())
      }

      expect(reports.length).toBe(20)
    })

    test('should handle enter/exit mismatch with different function types', () => {
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
  })

  describe('partial loc handling', () => {
    test('should handle node with loc.start only', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement({
        type: 'ThrowStatement',
        argument: {},
        loc: { start: { line: 5, column: 3 } },
      })
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should handle node with loc containing empty objects', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement({
        type: 'ThrowStatement',
        argument: {},
        loc: { start: {}, end: {} },
      })
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with loc.start having missing column', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement({
        type: 'ThrowStatement',
        argument: {},
        loc: { start: { line: 7 }, end: { line: 7 } },
      })
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with loc as non-object', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement({
        type: 'ThrowStatement',
        argument: {},
        loc: 'invalid',
      })
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })
  })

  describe('method shorthand patterns', () => {
    test('should treat method with async:true as async FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      const methodNode = {
        type: 'FunctionExpression',
        async: true,
        id: { type: 'Identifier', name: 'myMethod' },
        params: [{ type: 'Identifier', name: 'arg' }],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        method: true,
      }

      visitor.FunctionExpression(methodNode)
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionExpression_exit(methodNode)

      expect(reports.length).toBe(1)
    })

    test('should treat method with async:false as sync FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      const methodNode = {
        type: 'FunctionExpression',
        async: false,
        id: { type: 'Identifier', name: 'myMethod' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
        method: true,
      }

      visitor.FunctionExpression(methodNode)
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionExpression_exit(methodNode)

      expect(reports.length).toBe(0)
    })

    test('should handle generator function (not async) with throw', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      const genNode = {
        type: 'FunctionDeclaration',
        async: false,
        generator: true,
        id: { type: 'Identifier', name: 'gen' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(genNode)
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(genNode)

      expect(reports.length).toBe(0)
    })

    test('should handle async generator function with throw', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      const asyncGenNode = {
        type: 'FunctionDeclaration',
        async: true,
        generator: true,
        id: { type: 'Identifier', name: 'asyncGen' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.FunctionDeclaration(asyncGenNode)
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(asyncGenNode)

      expect(reports.length).toBe(1)
    })
  })

  describe('different throw argument types', () => {
    test('should report throw new Error()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement({
        type: 'ThrowStatement',
        argument: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Error' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
    })

    test('should report throw new TypeError()', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement({
        type: 'ThrowStatement',
        argument: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'TypeError' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
    })

    test('should report throw literal string', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement({
        type: 'ThrowStatement',
        argument: { type: 'Literal', value: 'error' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
    })

    test('should report throw identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement({
        type: 'ThrowStatement',
        argument: { type: 'Identifier', name: 'err' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
    })

    test('should report throw with no argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement({
        type: 'ThrowStatement',
        argument: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
    })
  })

  describe('isolation between visitors', () => {
    test('should not share state between two visitor instances', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext()
      const v1 = noThrowSyncRule.create(ctx1)
      const v2 = noThrowSyncRule.create(ctx2)

      v1.FunctionDeclaration(createAsyncFunctionDeclaration())
      v1.ThrowStatement(createThrowStatement())

      v2.ThrowStatement(createThrowStatement())

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('should allow independent depth tracking per visitor', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext()
      const v1 = noThrowSyncRule.create(ctx1)
      const v2 = noThrowSyncRule.create(ctx2)

      v1.FunctionDeclaration(createAsyncFunctionDeclaration())
      v1.ArrowFunctionExpression(createAsyncArrowFunction())

      v2.FunctionDeclaration(createAsyncFunctionDeclaration())

      v1.ThrowStatement(createThrowStatement(1, 0))
      v2.ThrowStatement(createThrowStatement(2, 0))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(1)
    })
  })

  describe('stress tests', () => {
    test('should handle 50 sequential async functions each with a throw', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
        visitor.ThrowStatement(createThrowStatement(i + 1, 0))
        visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())
      }

      expect(reports.length).toBe(50)
    })

    test('should handle deeply nested 10-level async functions', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      }
      visitor.ThrowStatement(createThrowStatement())
      for (let i = 0; i < 10; i++) {
        visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())
      }

      expect(reports.length).toBe(1)
    })

    test('should handle alternating async and sync functions at same depth', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement(1, 0))

      visitor.FunctionExpression(createSyncFunctionExpression())
      visitor.ThrowStatement(createThrowStatement(2, 0))
      visitor.FunctionExpression_exit(createSyncFunctionExpression())

      visitor.ThrowStatement(createThrowStatement(3, 0))
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(3)
    })

    test('should handle interleaved function enter/exit of different types', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.FunctionExpression(createAsyncFunctionExpression())
      visitor.ArrowFunctionExpression(createAsyncArrowFunction())
      visitor.ThrowStatement(createThrowStatement(5, 0))
      visitor.ArrowFunctionExpression_exit(createAsyncArrowFunction())
      visitor.ThrowStatement(createThrowStatement(10, 0))
      visitor.FunctionExpression_exit(createAsyncFunctionExpression())
      visitor.ThrowStatement(createThrowStatement(15, 0))
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(3)
    })

    test('should handle only sync functions with throws', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createSyncFunctionDeclaration())
      visitor.FunctionExpression(createSyncFunctionExpression())
      visitor.ArrowFunctionExpression(createSyncArrowFunction())
      visitor.ThrowStatement(createThrowStatement())
      visitor.ThrowStatement(createThrowStatement())
      visitor.ThrowStatement(createThrowStatement())
      visitor.ArrowFunctionExpression_exit(createSyncArrowFunction())
      visitor.FunctionExpression_exit(createSyncFunctionExpression())
      visitor.FunctionDeclaration_exit(createSyncFunctionDeclaration())

      expect(reports.length).toBe(0)
    })

    test('should handle visitor methods called with numeric zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      expect(() => visitor.FunctionDeclaration(0)).not.toThrow()
      expect(() => visitor.FunctionExpression(0)).not.toThrow()
      expect(() => visitor.ArrowFunctionExpression(0)).not.toThrow()
      expect(() => visitor.ThrowStatement(0)).not.toThrow()
      expect(() => visitor.FunctionDeclaration_exit(0)).not.toThrow()
      expect(() => visitor.FunctionExpression_exit(0)).not.toThrow()
      expect(() => visitor.ArrowFunctionExpression_exit(0)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle visitor methods called with empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      expect(() => visitor.FunctionDeclaration([])).not.toThrow()
      expect(() => visitor.ThrowStatement([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle many throws with only some in async context', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.ThrowStatement(createThrowStatement(1, 0))
      visitor.ThrowStatement(createThrowStatement(2, 0))

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement(3, 0))
      visitor.ThrowStatement(createThrowStatement(4, 0))
      visitor.ThrowStatement(createThrowStatement(5, 0))
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      visitor.ThrowStatement(createThrowStatement(6, 0))
      visitor.ThrowStatement(createThrowStatement(7, 0))

      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[1].loc?.start.line).toBe(4)
      expect(reports[2].loc?.start.line).toBe(5)
    })

    test('should handle node with prototype properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      class CustomNode {
        type = 'FunctionDeclaration'
        async = true
      }
      const node = new CustomNode()

      visitor.FunctionDeclaration(node)
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(node)

      expect(reports.length).toBe(1)
    })

    test('should handle all function types entered then all exited', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.FunctionExpression(createAsyncFunctionExpression())
      visitor.ArrowFunctionExpression(createAsyncArrowFunction())

      visitor.ThrowStatement(createThrowStatement(1, 0))

      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement(2, 0))
      visitor.FunctionExpression_exit(createAsyncFunctionExpression())
      visitor.ThrowStatement(createThrowStatement(3, 0))
      visitor.ArrowFunctionExpression_exit(createAsyncArrowFunction())
      visitor.ThrowStatement(createThrowStatement(4, 0))

      expect(reports.length).toBe(3)
    })
  })

  describe('function type edge cases', () => {
    test('should not treat unknown function type as async', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration({
        type: 'UnknownFunctionType',
        async: true,
      })
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit({
        type: 'UnknownFunctionType',
        async: true,
      })

      expect(reports.length).toBe(0)
    })

    test('should handle FunctionDeclaration with async as object', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        async: { value: true },
      })
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit({
        type: 'FunctionDeclaration',
        async: { value: true },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle FunctionExpression with async as undefined explicitly', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionExpression({
        type: 'FunctionExpression',
        async: undefined,
      })
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionExpression_exit({
        type: 'FunctionExpression',
        async: undefined,
      })

      expect(reports.length).toBe(0)
    })

    test('should handle ArrowFunctionExpression with async as empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.ArrowFunctionExpression({
        type: 'ArrowFunctionExpression',
        async: '',
      })
      visitor.ThrowStatement(createThrowStatement())
      visitor.ArrowFunctionExpression_exit({
        type: 'ArrowFunctionExpression',
        async: '',
      })

      expect(reports.length).toBe(0)
    })

    test('should detect async FunctionDeclaration regardless of other properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      const minimalAsync = { type: 'FunctionDeclaration', async: true }
      visitor.FunctionDeclaration(minimalAsync)
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(minimalAsync)

      expect(reports.length).toBe(1)
    })

    test('should detect async FunctionExpression regardless of other properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      const minimalAsync = { type: 'FunctionExpression', async: true }
      visitor.FunctionExpression(minimalAsync)
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionExpression_exit(minimalAsync)

      expect(reports.length).toBe(1)
    })

    test('should detect async ArrowFunctionExpression regardless of other properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      const minimalAsync = { type: 'ArrowFunctionExpression', async: true }
      visitor.ArrowFunctionExpression(minimalAsync)
      visitor.ThrowStatement(createThrowStatement())
      visitor.ArrowFunctionExpression_exit(minimalAsync)

      expect(reports.length).toBe(1)
    })
  })

  describe('report callback verification', () => {
    test('should call context.report exactly once for single throw', () => {
      let reportCount = 0
      const context: RuleContext = {
        report: () => {
          reportCount++
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noThrowSyncRule.create(context)
      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reportCount).toBe(1)
    })

    test('should call context.report for each throw in async context', () => {
      let reportCount = 0
      const context: RuleContext = {
        report: () => {
          reportCount++
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noThrowSyncRule.create(context)
      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.ThrowStatement(createThrowStatement())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reportCount).toBe(3)
    })

    test('should not call context.report for throw in sync function', () => {
      let reportCount = 0
      const context: RuleContext = {
        report: () => {
          reportCount++
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noThrowSyncRule.create(context)
      visitor.FunctionDeclaration(createSyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createSyncFunctionDeclaration())

      expect(reportCount).toBe(0)
    })
  })

  describe('throw at boundaries', () => {
    test('should report throw immediately after entering async function', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
    })

    test('should report throw immediately before exiting async function', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
    })

    test('should not report throw immediately before entering async function', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
    })

    test('should not report throw immediately after exiting async function', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())

      expect(reports.length).toBe(1)
    })

    test('should handle throw between two async functions', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement(2, 0))
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement(4, 0))
      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement(6, 0))
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[1].loc?.start.line).toBe(6)
    })

    test('should handle throw in overlapping function scopes', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement(2, 0))
      visitor.FunctionExpression(createAsyncFunctionExpression())
      visitor.ThrowStatement(createThrowStatement(4, 0))
      visitor.ArrowFunctionExpression(createSyncArrowFunction())
      visitor.ThrowStatement(createThrowStatement(6, 0))
      visitor.ArrowFunctionExpression_exit(createSyncArrowFunction())
      visitor.ThrowStatement(createThrowStatement(8, 0))
      visitor.FunctionExpression_exit(createAsyncFunctionExpression())
      visitor.ThrowStatement(createThrowStatement(10, 0))
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(5)
    })
  })

  describe('meta schema and configuration', () => {
    test('should have schema as an array', () => {
      expect(Array.isArray(noThrowSyncRule.meta.schema)).toBe(true)
    })

    test('should have empty schema array', () => {
      expect(noThrowSyncRule.meta.schema).toEqual([])
    })

    test('should have schema length of 0', () => {
      expect(noThrowSyncRule.meta.schema.length).toBe(0)
    })

    test('should work regardless of options passed', () => {
      const { context, reports } = createMockContext({ checkAll: true, strict: false })
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
    })

    test('should ignore unknown options without error', () => {
      const { context, reports } = createMockContext({ unknownOption: 42 })
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
    })
  })

  describe('non-standard node shapes', () => {
    test('should handle ThrowStatement with function type argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement({
        type: 'ThrowStatement',
        argument: {
          type: 'FunctionExpression',
          async: false,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
    })

    test('should handle ThrowStatement with object expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement({
        type: 'ThrowStatement',
        argument: { type: 'ObjectExpression', properties: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
    })

    test('should handle ThrowStatement with call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement({
        type: 'ThrowStatement',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getError' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(1)
    })

    test('should handle node with Symbol properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      const sym = Symbol('test')
      const node = { type: 'FunctionDeclaration', async: true, [sym]: 'value' }

      visitor.FunctionDeclaration(node)
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with numeric type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.ThrowStatement({ type: 42, argument: {} })

      expect(reports.length).toBe(0)
    })
  })

  describe('concurrent visitor usage simulation', () => {
    test('should handle enter/exit across multiple function types in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement(3, 0))

      visitor.FunctionExpression(createSyncFunctionExpression())
      visitor.ThrowStatement(createThrowStatement(5, 0))
      visitor.FunctionExpression_exit(createSyncFunctionExpression())

      visitor.FunctionExpression(createAsyncFunctionExpression())
      visitor.ThrowStatement(createThrowStatement(8, 0))
      visitor.FunctionExpression_exit(createAsyncFunctionExpression())

      visitor.ThrowStatement(createThrowStatement(11, 0))

      visitor.ArrowFunctionExpression(createAsyncArrowFunction())
      visitor.ThrowStatement(createThrowStatement(13, 0))
      visitor.ArrowFunctionExpression_exit(createAsyncArrowFunction())

      visitor.ThrowStatement(createThrowStatement(16, 0))

      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(6)
    })

    test('should handle only enter no exit across multiple function types', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.FunctionExpression(createAsyncFunctionExpression())
      visitor.ArrowFunctionExpression(createAsyncArrowFunction())
      visitor.ThrowStatement(createThrowStatement())
      visitor.ThrowStatement(createThrowStatement())

      expect(reports.length).toBe(2)
    })

    test('should handle double enter without matching exits for same type', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createThrowStatement())

      expect(reports.length).toBe(2)
    })

    test('should handle many non-throw nodes mixed with throws', () => {
      const { context, reports } = createMockContext()
      const visitor = noThrowSyncRule.create(context)

      visitor.FunctionDeclaration(createAsyncFunctionDeclaration())
      visitor.ThrowStatement(createNonThrowStatement())
      visitor.ThrowStatement(createNonThrowStatement())
      visitor.ThrowStatement(createThrowStatement(3, 0))
      visitor.ThrowStatement(createNonThrowStatement())
      visitor.ThrowStatement(createThrowStatement(5, 0))
      visitor.ThrowStatement(createNonThrowStatement())
      visitor.ThrowStatement(createNonThrowStatement())
      visitor.FunctionDeclaration_exit(createAsyncFunctionDeclaration())

      expect(reports.length).toBe(2)
    })
  })
})

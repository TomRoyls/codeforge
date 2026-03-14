import { describe, test, expect, vi } from 'vitest'
import { noAsyncPromiseExecutorRule } from '../../../../src/rules/patterns/no-async-promise-executor.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'new Promise(async (resolve) => {});',
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

function createNewExpression(callee: unknown, args: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'NewExpression',
    callee,
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createAsyncFunctionExpression(): unknown {
  return {
    type: 'FunctionExpression',
    async: true,
    params: [
      { type: 'Identifier', name: 'resolve' },
      { type: 'Identifier', name: 'reject' },
    ],
    body: {
      type: 'BlockStatement',
      body: [],
    },
  }
}

function createAsyncArrowFunction(): unknown {
  return {
    type: 'ArrowFunctionExpression',
    async: true,
    params: [{ type: 'Identifier', name: 'resolve' }],
    body: {
      type: 'BlockStatement',
      body: [],
    },
  }
}

function createSyncFunctionExpression(): unknown {
  return {
    type: 'FunctionExpression',
    async: false,
    params: [
      { type: 'Identifier', name: 'resolve' },
      { type: 'Identifier', name: 'reject' },
    ],
    body: {
      type: 'BlockStatement',
      body: [],
    },
  }
}

function createSyncArrowFunction(): unknown {
  return {
    type: 'ArrowFunctionExpression',
    async: false,
    params: [{ type: 'Identifier', name: 'resolve' }],
    body: {
      type: 'BlockStatement',
      body: [],
    },
  }
}

describe('no-async-promise-executor rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noAsyncPromiseExecutorRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noAsyncPromiseExecutorRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noAsyncPromiseExecutorRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noAsyncPromiseExecutorRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noAsyncPromiseExecutorRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noAsyncPromiseExecutorRule.meta.fixable).toBe('code')
    })

    test('should mention async in description', () => {
      expect(noAsyncPromiseExecutorRule.meta.docs?.description.toLowerCase()).toContain('async')
    })

    test('should mention promise in description', () => {
      expect(noAsyncPromiseExecutorRule.meta.docs?.description.toLowerCase()).toContain('promise')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      expect(visitor).toHaveProperty('NewExpression')
    })
  })

  describe('detecting async promise executors', () => {
    test('should report new Promise(async function() {})', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('Promise'), [
        createAsyncFunctionExpression(),
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('async')
    })

    test('should report new Promise(async () => {})', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('Promise'), [createAsyncArrowFunction()])

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report new Promise(function() {})', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('Promise'), [
        createSyncFunctionExpression(),
      ])

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Promise(() => {})', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('Promise'), [createSyncArrowFunction()])

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Other(async function() {})', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('Other'), [createAsyncFunctionExpression()])

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Promise() without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(createIdentifier('Promise'), [])

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report new Promise(resolve => resolve())', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const syncFn = {
        type: 'ArrowFunctionExpression',
        async: false,
        params: [{ type: 'Identifier', name: 'resolve' }],
        body: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'resolve' },
          arguments: [],
        },
      }
      const node = createNewExpression(createIdentifier('Promise'), [syncFn])

      visitor.NewExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      expect(() => visitor.NewExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      expect(() => visitor.NewExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      expect(() => visitor.NewExpression('string')).not.toThrow()
      expect(() => visitor.NewExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Promise'),
        arguments: [createAsyncFunctionExpression()],
      }

      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = createNewExpression(
        createIdentifier('Promise'),
        [createAsyncFunctionExpression()],
        20,
        10,
      )

      visitor.NewExpression(node)

      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )

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
        getSource: () => 'new Promise(async (resolve) => {});',
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

      const visitor = noAsyncPromiseExecutorRule.create(context)

      expect(() =>
        visitor.NewExpression(
          createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention async in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )

      expect(reports[0].message.toLowerCase()).toContain('async')
    })

    test('should mention promise in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )

      expect(reports[0].message.toLowerCase()).toContain('promise')
    })

    test('should mention executor in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      visitor.NewExpression(
        createNewExpression(createIdentifier('Promise'), [createAsyncFunctionExpression()]),
      )

      expect(reports[0].message.toLowerCase()).toContain('executor')
    })
  })

  describe('loc edge cases', () => {
    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Promise'),
        arguments: [createAsyncFunctionExpression()],
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Promise'),
        arguments: [createAsyncFunctionExpression()],
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 'not-a-number' as unknown as number },
        },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Promise'),
        arguments: [createAsyncFunctionExpression()],
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Promise'),
        arguments: [createAsyncFunctionExpression()],
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncPromiseExecutorRule.create(context)

      const node = {
        type: 'NewExpression',
        callee: createIdentifier('Promise'),
        arguments: [createAsyncFunctionExpression()],
        loc: {},
      }

      visitor.NewExpression(node)

      expect(reports.length).toBe(1)
    })
  })
})

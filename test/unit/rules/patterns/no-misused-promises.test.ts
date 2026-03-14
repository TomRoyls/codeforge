import { describe, test, expect, vi } from 'vitest'
import { noMisusedPromisesRule } from '../../../../src/rules/patterns/no-misused-promises.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'array.forEach(async (x) => {});',
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

function createAsyncForEachCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'array',
      },
      property: {
        type: 'Identifier',
        name: 'forEach',
      },
      computed: false,
    },
    arguments: [
      {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BlockStatement', body: [] },
        loc: {
          start: { line, column: column + 15 },
          end: { line, column: column + 35 },
        },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 40 },
    },
  }
}

function createSyncForEachCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'array',
      },
      property: {
        type: 'Identifier',
        name: 'forEach',
      },
      computed: false,
    },
    arguments: [
      {
        type: 'ArrowFunctionExpression',
        async: false,
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BlockStatement', body: [] },
        loc: {
          start: { line, column: column + 15 },
          end: { line, column: column + 35 },
        },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 40 },
    },
  }
}

function createAsyncMapCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'array',
      },
      property: {
        type: 'Identifier',
        name: 'map',
      },
      computed: false,
    },
    arguments: [
      {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BlockStatement', body: [] },
        loc: {
          start: { line, column: column + 10 },
          end: { line, column: column + 30 },
        },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 35 },
    },
  }
}

function createAwaitExpression(line = 1, column = 0, parentAsync = false): unknown {
  const awaitNode: Record<string, unknown> = {
    type: 'AwaitExpression',
    argument: {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'promise' },
      arguments: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }

  if (parentAsync) {
    awaitNode.parent = {
      type: 'ArrowFunctionExpression',
      async: true,
      params: [],
      body: { type: 'BlockStatement', body: [] },
    }
  } else {
    awaitNode.parent = {
      type: 'ArrowFunctionExpression',
      async: false,
      params: [],
      body: { type: 'BlockStatement', body: [] },
    }
  }

  return awaitNode
}

function createNonCallExpression(line = 1, column = 0): unknown {
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

describe('no-misused-promises rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noMisusedPromisesRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noMisusedPromisesRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noMisusedPromisesRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noMisusedPromisesRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noMisusedPromisesRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noMisusedPromisesRule.meta.fixable).toBeUndefined()
    })

    test('should mention Promise in description', () => {
      expect(noMisusedPromisesRule.meta.docs?.description.toLowerCase()).toContain('promise')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(visitor).toHaveProperty('AwaitExpression')
    })
  })

  describe('detecting async callbacks in non-Promise-aware methods', () => {
    test('should report async forEach callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncForEachCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('forEach')
      expect(reports[0].message).toContain('Promise')
    })

    test('should report async map callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMapCall())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('map')
    })

    test('should not report sync forEach callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createSyncForEachCall())

      expect(reports.length).toBe(0)
    })

    test('should not report non-call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createNonCallExpression())

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting await in non-async functions', () => {
    test('should report await in non-async function', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.AwaitExpression(createAwaitExpression(1, 0, false))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('await')
      expect(reports[0].message).toContain('non-async')
    })

    test('should not report await in async function', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.AwaitExpression(createAwaitExpression(1, 0, true))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(() => visitor.AwaitExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(() => visitor.AwaitExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(() => visitor.AwaitExpression('string')).not.toThrow()
      expect(() => visitor.AwaitExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
          computed: false,
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            async: true,
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncForEachCall(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncForEachCall())

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
        getSource: () => 'array.forEach(async (x) => {});',
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

      const visitor = noMisusedPromisesRule.create(context)

      expect(() => visitor.CallExpression(createAsyncForEachCall())).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle call without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
          computed: false,
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle call with non-member callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'func' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            async: true,
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention for-of in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncForEachCall())

      expect(reports[0].message.toLowerCase()).toContain('for-of')
    })

    test('should mention async in await message', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.AwaitExpression(createAwaitExpression(1, 0, false))

      expect(reports[0].message.toLowerCase()).toContain('async')
    })
  })
})

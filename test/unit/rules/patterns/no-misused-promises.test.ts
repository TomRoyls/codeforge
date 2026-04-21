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

function createAsyncMethodCall(
  methodName: string,
  line = 1,
  column = 0,
  functionType: 'ArrowFunctionExpression' | 'FunctionExpression' = 'ArrowFunctionExpression',
): unknown {
  const callbackLoc = {
    start: { line, column: column + 10 },
    end: { line, column: column + 30 },
  }
  const callback =
    functionType === 'ArrowFunctionExpression'
      ? {
          type: 'ArrowFunctionExpression',
          async: true,
          params: [{ type: 'Identifier', name: 'x' }],
          body: { type: 'BlockStatement', body: [] },
          loc: callbackLoc,
        }
      : {
          type: 'FunctionExpression',
          async: true,
          id: { type: 'Identifier', name: 'callback' },
          params: [{ type: 'Identifier', name: 'x' }],
          body: { type: 'BlockStatement', body: [] },
          loc: callbackLoc,
        }

  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'array' },
      property: { type: 'Identifier', name: methodName },
      computed: false,
    },
    arguments: [callback],
    loc: {
      start: { line, column },
      end: { line, column: column + 40 },
    },
  }
}

function createSyncMethodCall(methodName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'array' },
      property: { type: 'Identifier', name: methodName },
      computed: false,
    },
    arguments: [
      {
        type: 'ArrowFunctionExpression',
        async: false,
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
      end: { line, column: column + 40 },
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

    test('should have a non-empty description', () => {
      expect(noMisusedPromisesRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have docs object defined', () => {
      expect(noMisusedPromisesRule.meta.docs).toBeDefined()
    })

    test('should have description string in docs', () => {
      expect(typeof noMisusedPromisesRule.meta.docs?.description).toBe('string')
    })

    test('should have type as a string', () => {
      expect(typeof noMisusedPromisesRule.meta.type).toBe('string')
    })

    test('should have severity as a string', () => {
      expect(typeof noMisusedPromisesRule.meta.severity).toBe('string')
    })

    test('should have valid rule type', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noMisusedPromisesRule.meta.type)
    })

    test('should have valid severity level', () => {
      expect(['off', 'warn', 'error']).toContain(noMisusedPromisesRule.meta.severity)
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noMisusedPromisesRule.meta.schema)).toBe(true)
    })

    test('should have schema with at least one entry', () => {
      const schema = noMisusedPromisesRule.meta.schema
      if (Array.isArray(schema)) {
        expect(schema.length).toBeGreaterThanOrEqual(1)
      }
    })

    test('should have checksConditionals in schema', () => {
      const schema = noMisusedPromisesRule.meta.schema
      if (Array.isArray(schema) && schema[0] && typeof schema[0] === 'object') {
        const props = (schema[0] as Record<string, unknown>).properties as
          | Record<string, unknown>
          | undefined
        expect(props).toHaveProperty('checksConditionals')
      }
    })

    test('should have checksVoidReturn in schema', () => {
      const schema = noMisusedPromisesRule.meta.schema
      if (Array.isArray(schema) && schema[0] && typeof schema[0] === 'object') {
        const props = (schema[0] as Record<string, unknown>).properties as
          | Record<string, unknown>
          | undefined
        expect(props).toHaveProperty('checksVoidReturn')
      }
    })

    test('should have docs url defined', () => {
      expect(noMisusedPromisesRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs url as a string', () => {
      expect(typeof noMisusedPromisesRule.meta.docs?.url).toBe('string')
    })

    test('should not be deprecated', () => {
      expect(noMisusedPromisesRule.meta.deprecated).toBeUndefined()
    })

    test('should have description mentioning async', () => {
      expect(noMisusedPromisesRule.meta.docs?.description.toLowerCase()).toContain('async')
    })

    test('should have description mentioning callback or await', () => {
      const desc = noMisusedPromisesRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc.includes('callback') || desc.includes('await')).toBe(true)
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(visitor).toHaveProperty('AwaitExpression')
    })

    test('should return visitor with exactly two methods', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      expect(Object.keys(visitor)).toHaveLength(2)
    })

    test('should return visitor with callable CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return visitor with callable AwaitExpression', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      expect(typeof visitor.AwaitExpression).toBe('function')
    })

    test('should return a new visitor on each call', () => {
      const { context } = createMockContext()
      const visitor1 = noMisusedPromisesRule.create(context)
      const visitor2 = noMisusedPromisesRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context with empty options', () => {
      const { context } = createMockContext()
      expect(() => noMisusedPromisesRule.create(context)).not.toThrow()
    })

    test('should accept context with populated options', () => {
      const { context } = createMockContext({ checksConditionals: true, checksVoidReturn: true })
      expect(() => noMisusedPromisesRule.create(context)).not.toThrow()
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

    test('should report async filter callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMethodCall('filter'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('filter')
    })

    test('should report async reduce callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMethodCall('reduce'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('reduce')
    })

    test('should report async reduceRight callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMethodCall('reduceRight'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('reduceRight')
    })

    test('should report async find callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMethodCall('find'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('find')
    })

    test('should report async findIndex callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMethodCall('findIndex'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('findIndex')
    })

    test('should report async findLast callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMethodCall('findLast'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('findLast')
    })

    test('should report async findLastIndex callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMethodCall('findLastIndex'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('findLastIndex')
    })

    test('should report async every callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMethodCall('every'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('every')
    })

    test('should report async some callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMethodCall('some'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('some')
    })

    test('should report async sort callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMethodCall('sort'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('sort')
    })

    test('should report async flatMap callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMethodCall('flatMap'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('flatMap')
    })

    test('should not report sync map callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createSyncMethodCall('map'))

      expect(reports.length).toBe(0)
    })

    test('should not report sync filter callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createSyncMethodCall('filter'))

      expect(reports.length).toBe(0)
    })

    test('should not report sync reduce callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createSyncMethodCall('reduce'))

      expect(reports.length).toBe(0)
    })

    test('should not report sync reduceRight callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createSyncMethodCall('reduceRight'))

      expect(reports.length).toBe(0)
    })

    test('should not report sync find callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createSyncMethodCall('find'))

      expect(reports.length).toBe(0)
    })

    test('should not report sync findIndex callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createSyncMethodCall('findIndex'))

      expect(reports.length).toBe(0)
    })

    test('should not report sync findLast callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createSyncMethodCall('findLast'))

      expect(reports.length).toBe(0)
    })

    test('should not report sync findLastIndex callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createSyncMethodCall('findLastIndex'))

      expect(reports.length).toBe(0)
    })

    test('should not report sync every callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createSyncMethodCall('every'))

      expect(reports.length).toBe(0)
    })

    test('should not report sync some callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createSyncMethodCall('some'))

      expect(reports.length).toBe(0)
    })

    test('should not report sync sort callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createSyncMethodCall('sort'))

      expect(reports.length).toBe(0)
    })

    test('should not report sync flatMap callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createSyncMethodCall('flatMap'))

      expect(reports.length).toBe(0)
    })

    test('should report async FunctionExpression in forEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMethodCall('forEach', 1, 0, 'FunctionExpression'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('forEach')
    })

    test('should report async FunctionExpression in map', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMethodCall('map', 1, 0, 'FunctionExpression'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('map')
    })

    test('should report async FunctionExpression in filter', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMethodCall('filter', 1, 0, 'FunctionExpression'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('filter')
    })

    test('should report async FunctionExpression in reduce', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMethodCall('reduce', 1, 0, 'FunctionExpression'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('reduce')
    })

    test('should report async FunctionExpression in every', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMethodCall('every', 1, 0, 'FunctionExpression'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('every')
    })

    test('should report async FunctionExpression in some', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMethodCall('some', 1, 0, 'FunctionExpression'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('some')
    })

    test('should not report async callback in non-tracked method "then"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMethodCall('then'))

      expect(reports.length).toBe(0)
    })

    test('should not report async callback in non-tracked method "catch"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMethodCall('catch'))

      expect(reports.length).toBe(0)
    })

    test('should not report async callback in non-tracked method "finally"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMethodCall('finally'))

      expect(reports.length).toBe(0)
    })

    test('should not report async callback in non-tracked method "subscribe"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMethodCall('subscribe'))

      expect(reports.length).toBe(0)
    })

    test('should not report async callback in non-tracked method "addEventListener"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMethodCall('addEventListener'))

      expect(reports.length).toBe(0)
    })

    test('should not report async callback in non-tracked method "on"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMethodCall('on'))

      expect(reports.length).toBe(0)
    })

    test('should not report non-async FunctionExpression in forEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'array' },
          property: { type: 'Identifier', name: 'forEach' },
          computed: false,
        },
        arguments: [
          {
            type: 'FunctionExpression',
            async: false,
            id: { type: 'Identifier', name: 'cb' },
            params: [{ type: 'Identifier', name: 'x' }],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when first argument is Identifier not function', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'array' },
          property: { type: 'Identifier', name: 'forEach' },
          computed: false,
        },
        arguments: [{ type: 'Identifier', name: 'myCallback' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'array' },
          property: { type: 'Literal', value: 'forEach' },
          computed: true,
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            async: true,
            params: [{ type: 'Identifier', name: 'x' }],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.CallExpression(node)
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

    test('should report await in non-async FunctionExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'AwaitExpression',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        parent: {
          type: 'FunctionExpression',
          async: false,
          id: { type: 'Identifier', name: 'myFunc' },
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 5, column: 2 }, end: { line: 5, column: 12 } },
      }

      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('non-async')
    })

    test('should not report await in async FunctionExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'AwaitExpression',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        parent: {
          type: 'FunctionExpression',
          async: true,
          id: { type: 'Identifier', name: 'myFunc' },
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 5, column: 2 }, end: { line: 5, column: 12 } },
      }

      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report await in non-async FunctionDeclaration parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'AwaitExpression',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        parent: {
          type: 'FunctionDeclaration',
          async: false,
          id: { type: 'Identifier', name: 'myFunc' },
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 3, column: 4 }, end: { line: 3, column: 14 } },
      }

      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report await in async FunctionDeclaration parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'AwaitExpression',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        parent: {
          type: 'FunctionDeclaration',
          async: true,
          id: { type: 'Identifier', name: 'myFunc' },
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 3, column: 4 }, end: { line: 3, column: 14 } },
      }

      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report await with no parent at all', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'AwaitExpression',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report await with null parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'AwaitExpression',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        parent: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report await with undefined parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'AwaitExpression',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        parent: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should find async ancestor through multiple levels', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const asyncParent = {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      const blockParent = {
        type: 'BlockStatement',
        body: [],
        parent: asyncParent,
      }
      const node = {
        type: 'AwaitExpression',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        parent: blockParent,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report await when async ancestor is deep but not present', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const nonAsyncParent = {
        type: 'ArrowFunctionExpression',
        async: false,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        parent: { type: 'Program', body: [] },
      }
      const blockParent = {
        type: 'BlockStatement',
        body: [],
        parent: nonAsyncParent,
      }
      const node = {
        type: 'AwaitExpression',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        parent: blockParent,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should find async FunctionDeclaration through intermediate nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const asyncDecl = {
        type: 'FunctionDeclaration',
        async: true,
        id: { type: 'Identifier', name: 'main' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      const block = {
        type: 'BlockStatement',
        body: [],
        parent: asyncDecl,
      }
      const node = {
        type: 'AwaitExpression',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        parent: block,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully for CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle null node gracefully for AwaitExpression', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      expect(() => visitor.AwaitExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully for CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle undefined node gracefully for AwaitExpression', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      expect(() => visitor.AwaitExpression(undefined)).not.toThrow()
    })

    test('should handle string node gracefully for CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
    })

    test('should handle number node gracefully for CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle string node gracefully for AwaitExpression', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      expect(() => visitor.AwaitExpression('string')).not.toThrow()
    })

    test('should handle number node gracefully for AwaitExpression', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      expect(() => visitor.AwaitExpression(123)).not.toThrow()
    })

    test('should handle boolean node gracefully for CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle boolean node gracefully for AwaitExpression', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      expect(() => visitor.AwaitExpression(false)).not.toThrow()
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

    test('should handle await node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'AwaitExpression',
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        parent: {
          type: 'ArrowFunctionExpression',
          async: false,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
      }

      expect(() => visitor.AwaitExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location for forEach callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncForEachCall(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report correct end location for forEach callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncForEachCall(10, 5))

      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(40)
    })

    test('should report correct location for await in sync function', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.AwaitExpression(createAwaitExpression(7, 4, false))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(19)
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

    test('should handle call with null arguments array', () => {
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
        arguments: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle call with undefined arguments array', () => {
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
        arguments: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee with null property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: null,
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
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty object as callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {},
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with property being non-Identifier type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'forEach' },
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
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node for AwaitExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      expect(() => visitor.AwaitExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with loc but missing start', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'x' },
        parent: {
          type: 'ArrowFunctionExpression',
          async: false,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { end: { line: 1, column: 10 } },
      }

      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with loc but missing end', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'x' },
        parent: {
          type: 'ArrowFunctionExpression',
          async: false,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 3, column: 2 } },
      }

      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle AwaitExpression with non-AwaitExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }

      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when callback async is undefined', () => {
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
            async: undefined,
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when callback async is false string', () => {
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
            async: 'false',
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested node with depth exceeding 50', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      let current: Record<string, unknown> = {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }

      for (let i = 0; i < 55; i++) {
        current = { type: 'BlockStatement', body: [], parent: current }
      }

      const node = {
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'x' },
        parent: current,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
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

    test('should mention method name in forEach report', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncForEachCall())

      expect(reports[0].message).toContain('forEach')
    })

    test('should mention method name in map report', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMapCall())

      expect(reports[0].message).toContain('map')
    })

    test('should mention method name in filter report', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMethodCall('filter'))

      expect(reports[0].message).toContain('filter')
    })

    test('should mention method name in reduce report', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMethodCall('reduce'))

      expect(reports[0].message).toContain('reduce')
    })

    test('should mention method name in every report', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMethodCall('every'))

      expect(reports[0].message).toContain('every')
    })

    test('should mention callback in forEach message', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncForEachCall())

      expect(reports[0].message.toLowerCase()).toContain('callback')
    })

    test('should mention unhandled in forEach message', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncForEachCall())

      expect(reports[0].message.toLowerCase()).toContain('unhandled')
    })

    test('should mention rejection in forEach message', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncForEachCall())

      expect(reports[0].message.toLowerCase()).toContain('rejection')
    })

    test('should mention sequential in forEach message', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncForEachCall())

      expect(reports[0].message.toLowerCase()).toContain('sequential')
    })

    test('should mention await keyword in await message', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.AwaitExpression(createAwaitExpression(1, 0, false))

      expect(reports[0].message.toLowerCase()).toContain('await')
    })

    test('should mention non-async in await message', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.AwaitExpression(createAwaitExpression(1, 0, false))

      expect(reports[0].message.toLowerCase()).toContain('non-async')
    })

    test('should mention keyword in await message', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.AwaitExpression(createAwaitExpression(1, 0, false))

      expect(reports[0].message.toLowerCase()).toContain('keyword')
    })

    test('should mention function in await message', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.AwaitExpression(createAwaitExpression(1, 0, false))

      expect(reports[0].message.toLowerCase()).toContain('function')
    })

    test('should have non-empty message for forEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncForEachCall())

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have non-empty message for await', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.AwaitExpression(createAwaitExpression(1, 0, false))

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should mention Promise returned in forEach message', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncForEachCall())

      expect(reports[0].message).toContain('Promise')
      expect(reports[0].message.toLowerCase()).toContain('returned')
    })

    test('should mention ignored in forEach message', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncForEachCall())

      expect(reports[0].message.toLowerCase()).toContain('ignored')
    })
  })

  describe('location reporting', () => {
    test('should report location of callback not call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncForEachCall(1, 0))

      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should report location of await expression itself', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.AwaitExpression(createAwaitExpression(5, 10, false))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report default location when callback has no loc', () => {
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

      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle location with zero line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncForEachCall(0, 0))

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should handle location with large line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncForEachCall(9999, 0))

      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should handle location with large column numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncForEachCall(1, 500))

      expect(reports[0].loc?.start.column).toBe(515)
    })
  })

  describe('multiple reports', () => {
    test('should report multiple forEach violations independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncForEachCall(1, 0))
      visitor.CallExpression(createAsyncForEachCall(2, 0))

      expect(reports.length).toBe(2)
    })

    test('should report multiple await violations independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.AwaitExpression(createAwaitExpression(1, 0, false))
      visitor.AwaitExpression(createAwaitExpression(5, 3, false))

      expect(reports.length).toBe(2)
    })

    test('should report both forEach and await violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncForEachCall())
      visitor.AwaitExpression(createAwaitExpression(1, 0, false))

      expect(reports.length).toBe(2)
    })

    test('should accumulate reports across mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncForEachCall())
      visitor.CallExpression(createSyncForEachCall())
      visitor.AwaitExpression(createAwaitExpression(1, 0, false))
      visitor.AwaitExpression(createAwaitExpression(1, 0, true))

      expect(reports.length).toBe(2)
    })

    test('should handle ten forEach violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.CallExpression(createAsyncForEachCall(i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })

    test('should handle ten await violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.AwaitExpression(createAwaitExpression(i + 1, 0, false))
      }

      expect(reports.length).toBe(10)
    })

    test('should track correct locations for multiple reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncForEachCall(1, 0))
      visitor.CallExpression(createAsyncForEachCall(5, 10))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
    })
  })

  describe('export verification', () => {
    test('should export the rule as named export', () => {
      expect(noMisusedPromisesRule).toBeDefined()
    })

    test('should export an object with meta property', () => {
      expect(noMisusedPromisesRule).toHaveProperty('meta')
    })

    test('should export an object with create method', () => {
      expect(noMisusedPromisesRule).toHaveProperty('create')
      expect(typeof noMisusedPromisesRule.create).toBe('function')
    })

    test('should have create that returns a non-null visitor', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      expect(visitor).not.toBeNull()
      expect(visitor).not.toBeUndefined()
    })
  })

  describe('context handling', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/project/src/utils.ts')
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncForEachCall())

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'items.map(async x => x)')
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncMapCall())

      expect(reports.length).toBe(1)
    })

    test('should work with checksConditionals true', () => {
      const { context, reports } = createMockContext({ checksConditionals: true })
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncForEachCall())

      expect(reports.length).toBe(1)
    })

    test('should work with checksVoidReturn true', () => {
      const { context, reports } = createMockContext({ checksVoidReturn: true })
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncForEachCall())

      expect(reports.length).toBe(1)
    })

    test('should work with both options false', () => {
      const { context, reports } = createMockContext({
        checksConditionals: false,
        checksVoidReturn: false,
      })
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncForEachCall())

      expect(reports.length).toBe(1)
    })

    test('should work with extra unknown options', () => {
      const { context, reports } = createMockContext({ unknownOption: true })
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncForEachCall())

      expect(reports.length).toBe(1)
    })
  })

  describe('rule structure', () => {
    test('should have exactly two visitor keys', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)
      const keys = Object.keys(visitor)

      expect(keys).toEqual(['CallExpression', 'AwaitExpression'])
    })

    test('should not have additional visitor keys', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      expect(visitor).not.toHaveProperty('VariableDeclaration')
      expect(visitor).not.toHaveProperty('FunctionDeclaration')
      expect(visitor).not.toHaveProperty('ImportDeclaration')
    })

    test('visitor CallExpression should return void', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const result = visitor.CallExpression(createAsyncForEachCall())
      expect(result).toBeUndefined()
    })

    test('visitor AwaitExpression should return void', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const result = visitor.AwaitExpression(createAwaitExpression(1, 0, false))
      expect(result).toBeUndefined()
    })
  })

  describe('all tracked methods with async FunctionExpression', () => {
    const methods = [
      'forEach',
      'map',
      'filter',
      'reduce',
      'reduceRight',
      'find',
      'findIndex',
      'findLast',
      'findLastIndex',
      'every',
      'some',
      'sort',
      'flatMap',
    ]

    for (const method of methods) {
      test(`should report async FunctionExpression in ${method}`, () => {
        const { context, reports } = createMockContext()
        const visitor = noMisusedPromisesRule.create(context)

        visitor.CallExpression(createAsyncMethodCall(method, 1, 0, 'FunctionExpression'))

        expect(reports.length).toBe(1)
        expect(reports[0].message).toContain(method)
      })
    }
  })

  describe('visitor independence', () => {
    test('should not mix CallExpression and AwaitExpression reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.CallExpression(createAsyncForEachCall())
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('forEach')

      visitor.AwaitExpression(createAwaitExpression(1, 0, false))
      expect(reports.length).toBe(2)
      expect(reports[1].message).toContain('await')
    })

    test('should maintain separate report order', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      visitor.AwaitExpression(createAwaitExpression(1, 0, false))
      visitor.CallExpression(createAsyncForEachCall())
      visitor.AwaitExpression(createAwaitExpression(2, 0, false))

      expect(reports.length).toBe(3)
      expect(reports[0].message).toContain('await')
      expect(reports[1].message).toContain('forEach')
      expect(reports[2].message).toContain('await')
    })

    test('multiple visitors from same context work independently', () => {
      const { context, reports } = createMockContext()
      const visitor1 = noMisusedPromisesRule.create(context)
      const visitor2 = noMisusedPromisesRule.create(context)

      visitor1.CallExpression(createAsyncForEachCall())
      visitor2.CallExpression(createAsyncForEachCall())

      expect(reports.length).toBe(2)
    })
  })

  describe('callback position in arguments', () => {
    test('should report when async callback is first argument of forEach', () => {
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
            params: [{ type: 'Identifier', name: 'item' }],
            body: { type: 'BlockStatement', body: [] },
            loc: { start: { line: 1, column: 5 }, end: { line: 1, column: 25 } },
          },
          { type: 'Identifier', name: 'thisArg' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report when first argument is sync and second is async', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'reduce' },
          computed: false,
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            async: false,
            params: [{ type: 'Identifier', name: 'acc' }],
            body: { type: 'BlockStatement', body: [] },
          },
          {
            type: 'ArrowFunctionExpression',
            async: true,
            params: [{ type: 'Identifier', name: 'item' }],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report when only argument is async callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'items' },
          property: { type: 'Identifier', name: 'map' },
          computed: false,
        },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            async: true,
            params: [{ type: 'Identifier', name: 'x' }],
            body: { type: 'BlockStatement', body: [] },
            loc: { start: { line: 1, column: 2 }, end: { line: 1, column: 20 } },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('node with only type field', () => {
    test('should not crash on CallExpression node with only type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      expect(() => visitor.CallExpression({ type: 'CallExpression' })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not crash on AwaitExpression node with only type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      expect(() => visitor.AwaitExpression({ type: 'AwaitExpression' })).not.toThrow()
    })

    test('should not crash on node with type set to null', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      expect(() => visitor.CallExpression({ type: null })).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('callee edge cases', () => {
    test('should not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report when callee is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: undefined,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Super callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Super' },
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

    test('should handle Import callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Import' },
        arguments: [{ type: 'Literal', value: './module' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('await parent traversal edge cases', () => {
    test('should not report when parent chain leads to async FunctionDeclaration at depth 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'x' },
        parent: {
          type: 'FunctionDeclaration',
          async: true,
          id: { type: 'Identifier', name: 'run' },
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report when parent is non-async FunctionDeclaration at depth 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'x' },
        parent: {
          type: 'FunctionDeclaration',
          async: false,
          id: { type: 'Identifier', name: 'run' },
          params: [],
          body: { type: 'BlockStatement', body: [] },
          parent: { type: 'Program', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should find async parent at exactly depth 50', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      let current: Record<string, unknown> = {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }

      for (let i = 0; i < 50; i++) {
        current = { type: 'BlockStatement', body: [], parent: current }
      }

      const node = {
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'x' },
        parent: current,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should stop searching when parent chain ends with null', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'x' },
        parent: {
          type: 'BlockStatement',
          body: [],
          parent: null,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should stop searching when parent chain ends with undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'x' },
        parent: {
          type: 'BlockStatement',
          body: [],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle parent that is not a function type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'x' },
        parent: {
          type: 'ExpressionStatement',
          expression: { type: 'AwaitExpression' },
          parent: { type: 'Program', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should find async through CallExpression parent chain', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const asyncFunc = {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      const callExpr = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
        parent: asyncFunc,
      }
      const node = {
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'x' },
        parent: callExpr,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.AwaitExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report when parent chain has non-async function then ends', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const nonAsyncFunc = {
        type: 'FunctionExpression',
        async: false,
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        parent: { type: 'CallExpression' },
      }
      const node = {
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'x' },
        parent: nonAsyncFunc,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle await node with parent that is an object without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'x' },
        parent: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle await with parent async being truthy non-boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'x' },
        parent: {
          type: 'ArrowFunctionExpression',
          async: 1,
          params: [],
          body: { type: 'BlockStatement', body: [] },
          parent: { type: 'Program', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle await with parent async being empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const node = {
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'x' },
        parent: {
          type: 'ArrowFunctionExpression',
          async: '',
          params: [],
          body: { type: 'BlockStatement', body: [] },
          parent: { type: 'Program', body: [] },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report for deeply nested non-async with Program at root', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromisesRule.create(context)

      const program = { type: 'Program', body: [] }
      const funcExpr = {
        type: 'FunctionExpression',
        async: false,
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        parent: program,
      }
      const block = {
        type: 'BlockStatement',
        body: [],
        parent: funcExpr,
      }
      const node = {
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'x' },
        parent: block,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.AwaitExpression(node)
      expect(reports.length).toBe(1)
    })
  })
})

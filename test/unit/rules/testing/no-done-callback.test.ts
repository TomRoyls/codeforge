import { describe, expect, test, vi } from 'vitest'
import { noDoneCallbackRule } from '../../../../src/rules/testing/no-done-callback.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context: RuleContext = {
    report: (descriptor) => {
      reports.push({ message: descriptor.message, loc: descriptor.loc })
    },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => '',
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    workspaceRoot: '/src',
  } as unknown as RuleContext
  return { context, reports }
}

function createTestWithDone(callName: string, paramName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: callName },
    arguments: [
      { type: 'Literal', value: 'test name' },
      {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: paramName }],
        body: { type: 'BlockStatement', body: [] },
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createTestWithoutDone(callName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: callName },
    arguments: [
      { type: 'Literal', value: 'test name' },
      {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 25 } },
  }
}

function createMemberTestWithDone(
  objectName: string,
  method: string,
  paramName: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: method },
    },
    arguments: [
      { type: 'Literal', value: 'test name' },
      {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: paramName }],
        body: { type: 'BlockStatement', body: [] },
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 35 } },
  }
}

function createTestWithFunctionExprDone(
  callName: string,
  paramName: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: callName },
    arguments: [
      { type: 'Literal', value: 'test name' },
      {
        type: 'FunctionExpression',
        id: null,
        params: [{ type: 'Identifier', name: paramName }],
        body: { type: 'BlockStatement', body: [] },
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 35 } },
  }
}

describe('no-done-callback rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noDoneCallbackRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noDoneCallbackRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noDoneCallbackRule.meta.docs?.recommended).toBe(false)
    })

    test('should have correct category', () => {
      expect(noDoneCallbackRule.meta.docs?.category).toBe('testing')
    })

    test('should have schema defined', () => {
      expect(noDoneCallbackRule.meta.schema).toBeDefined()
    })

    test('should have correct description mentioning done callback', () => {
      const desc = noDoneCallbackRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc).toContain('done')
    })

    test('should have docs.url property', () => {
      expect(noDoneCallbackRule.meta.docs?.url).toBeDefined()
      expect(noDoneCallbackRule.meta.docs?.url).toContain('github.com')
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return a function for CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('valid: no done callback', () => {
    test('should not report it() without done param', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithoutDone('it'))

      expect(reports.length).toBe(0)
    })

    test('should not report test() without done param', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithoutDone('test'))

      expect(reports.length).toBe(0)
    })

    test('should not report beforeEach() without done param', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithoutDone('beforeEach'))

      expect(reports.length).toBe(0)
    })

    test('should not report afterEach() without done param', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithoutDone('afterEach'))

      expect(reports.length).toBe(0)
    })

    test('should not report async arrow function without done param', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'test name' },
          {
            type: 'ArrowFunctionExpression',
            async: true,
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid: done callback in tests', () => {
    test('should report it() with done parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('it', 'done'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('done')
      expect(reports[0].message).toContain('it()')
    })

    test('should report test() with done parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('test', 'done'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('done')
      expect(reports[0].message).toContain('test()')
    })

    test('should report it() with cb parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('it', 'cb'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('cb')
    })

    test('should report test() with callback parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('test', 'callback'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('callback')
    })
  })

  describe('invalid: done callback in hooks', () => {
    test('should report beforeEach() with done parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('beforeEach', 'done'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach()')
    })

    test('should report afterEach() with done parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('afterEach', 'done'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterEach()')
    })

    test('should report beforeAll() with done parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('beforeAll', 'done'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeAll()')
    })

    test('should report afterAll() with done parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('afterAll', 'done'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterAll()')
    })
  })

  describe('all callback name variants', () => {
    test('should report when first param is named "done"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('it', 'done'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'done'")
    })

    test('should report when first param is named "cb"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('it', 'cb'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'cb'")
    })

    test('should report when first param is named "callback"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('it', 'callback'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'callback'")
    })

    test('should report when first param is named "next"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('it', 'next'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'next'")
    })

    test('should report when first param is named "finish"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('it', 'finish'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'finish'")
    })

    test('should report when first param is named "finished"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('it', 'finished'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'finished'")
    })
  })

  describe('member expression calls', () => {
    test('should report it.only() with done parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createMemberTestWithDone('it', 'only', 'done'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('it()')
    })

    test('should report test.skip() with done parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createMemberTestWithDone('test', 'skip', 'done'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('test()')
    })

    test('should report beforeEach with member expression and done', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createMemberTestWithDone('beforeEach', 'only', 'done'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach()')
    })
  })

  describe('function expression callbacks', () => {
    test('should report function expression with done parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithFunctionExprDone('it', 'done'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('done')
    })

    test('should report function expression with cb parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithFunctionExprDone('test', 'cb'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('cb')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-CallExpression types', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      expect(() => visitor.CallExpression({ type: 'Literal', value: 42 })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report unrelated function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'console' },
        arguments: [
          { type: 'Literal', value: 'log' },
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'done' }],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callback has non-done param name', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('it', 'result'))

      expect(reports.length).toBe(0)
    })

    test('should handle empty arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      const node = { type: 'CallExpression', arguments: [] }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'test' },
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'done' }],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle member expression with non-Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [
          { type: 'Literal', value: 'test' },
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'done' }],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('report message content', () => {
    test('should include parameter name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('it', 'done'))

      expect(reports[0].message).toBe(
        "Unexpected 'done' callback parameter in it(). Use async/await instead of the done callback pattern.",
      )
    })

    test('should include call name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('test', 'cb'))

      expect(reports[0].message).toBe(
        "Unexpected 'cb' callback parameter in test(). Use async/await instead of the done callback pattern.",
      )
    })
  })

  describe('location reporting', () => {
    test('should report correct start location', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('it', 'done', 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('it', 'done', 3, 8))

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(38)
    })
  })

  describe('independent visitors', () => {
    test('should return independent visitors for different contexts', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noDoneCallbackRule.create(ctx1)
      const visitor2 = noDoneCallbackRule.create(ctx2)

      visitor1.CallExpression(createTestWithDone('it', 'done'))
      visitor2.CallExpression(createTestWithDone('it', 'done'))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(1)
    })
  })

  describe('multiple violations in one file', () => {
    test('should report each done callback independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('it', 'done', 1, 0))
      visitor.CallExpression(createTestWithDone('test', 'cb', 5, 0))
      visitor.CallExpression(createTestWithDone('beforeEach', 'done', 10, 0))

      expect(reports.length).toBe(3)
    })

    test('should report correct lines for multiple violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('it', 'done', 2, 0))
      visitor.CallExpression(createTestWithDone('it', 'done', 8, 0))

      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[1].loc?.start.line).toBe(8)
    })
  })

  describe('mixed calls in sequence', () => {
    test('should report only done callback tests, not clean ones', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithoutDone('it'))
      visitor.CallExpression(createTestWithDone('it', 'done'))
      visitor.CallExpression(createTestWithoutDone('test'))

      expect(reports.length).toBe(1)
    })
  })

  describe('valid: non-test functions with done param', () => {
    test('should not report describe() with done parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('describe', 'done'))

      expect(reports.length).toBe(0)
    })

    test('should not report suite() with done parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('suite', 'done'))

      expect(reports.length).toBe(0)
    })

    test('should not report custom function with done parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('myHelper', 'done'))

      expect(reports.length).toBe(0)
    })
  })

  describe('valid: function expressions without done', () => {
    test('should not report function expression it() without done', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'test name' },
          {
            type: 'FunctionExpression',
            id: null,
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function expression beforeEach() without done', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [
          {
            type: 'FunctionExpression',
            id: null,
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid: hooks with all callback name variants', () => {
    test('should report beforeEach() with cb parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('beforeEach', 'cb'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'cb'")
      expect(reports[0].message).toContain('beforeEach()')
    })

    test('should report beforeEach() with callback parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('beforeEach', 'callback'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'callback'")
    })

    test('should report beforeEach() with next parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('beforeEach', 'next'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'next'")
    })

    test('should report beforeEach() with finish parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('beforeEach', 'finish'))

      expect(reports.length).toBe(1)
    })

    test('should report beforeEach() with finished parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('beforeEach', 'finished'))

      expect(reports.length).toBe(1)
    })

    test('should report afterEach() with cb parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('afterEach', 'cb'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterEach()')
    })

    test('should report beforeAll() with next parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('beforeAll', 'next'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeAll()')
    })

    test('should report afterAll() with finish parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('afterAll', 'finish'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterAll()')
    })

    test('should report test() with next parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('test', 'next'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'next'")
    })

    test('should report test() with finish parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('test', 'finish'))

      expect(reports.length).toBe(1)
    })

    test('should report test() with finished parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithDone('test', 'finished'))

      expect(reports.length).toBe(1)
    })
  })

  describe('invalid: function expressions for hooks', () => {
    test('should report function expression beforeEach() with done', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithFunctionExprDone('beforeEach', 'done'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeEach()')
    })

    test('should report function expression afterEach() with done', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithFunctionExprDone('afterEach', 'done'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterEach()')
    })

    test('should report function expression beforeAll() with done', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithFunctionExprDone('beforeAll', 'done'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeAll()')
    })

    test('should report function expression afterAll() with done', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithFunctionExprDone('afterAll', 'done'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterAll()')
    })
  })

  describe('invalid: member expressions with more methods', () => {
    test('should report it.skip() with done parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createMemberTestWithDone('it', 'skip', 'done'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('it()')
    })

    test('should report test.only() with done parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createMemberTestWithDone('test', 'only', 'done'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('test()')
    })

    test('should report test.each() with done parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createMemberTestWithDone('test', 'each', 'done'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('test()')
    })

    test('should report it.each() with done parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createMemberTestWithDone('it', 'each', 'done'))

      expect(reports.length).toBe(1)
    })

    test('should report test.concurrent() with done parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createMemberTestWithDone('test', 'concurrent', 'done'))

      expect(reports.length).toBe(1)
    })

    test('should report it.failing() with done parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createMemberTestWithDone('it', 'failing', 'done'))

      expect(reports.length).toBe(1)
    })

    test('should report test.failing() with done parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createMemberTestWithDone('test', 'failing', 'done'))

      expect(reports.length).toBe(1)
    })

    test('should report afterEach.skip() with done parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createMemberTestWithDone('afterEach', 'skip', 'done'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterEach()')
    })

    test('should report beforeAll.only() with done parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createMemberTestWithDone('beforeAll', 'only', 'done'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('beforeAll()')
    })

    test('should report afterAll.skip() with done parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createMemberTestWithDone('afterAll', 'skip', 'done'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('afterAll()')
    })
  })

  describe('edge cases: last argument handling', () => {
    test('should not report when last argument is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'test name' },
          { type: 'Literal', value: 'extra string' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when last argument is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [
          { type: 'Literal', value: 'test name' },
          { type: 'Literal', value: 5000 },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when last argument is an object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'test name' },
          { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
          { type: 'ObjectExpression', properties: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report when callback is the last argument after options object', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'test name' },
          { type: 'ObjectExpression', properties: [] },
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'done' }],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('done')
    })
  })

  describe('edge cases: function params handling', () => {
    test('should report with multiple params where first is done', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'test name' },
          {
            type: 'ArrowFunctionExpression',
            params: [
              { type: 'Identifier', name: 'done' },
              { type: 'Identifier', name: 'extra' },
            ],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'done'")
    })

    test('should not report when first param is not a done name with multiple params', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'test name' },
          {
            type: 'ArrowFunctionExpression',
            params: [
              { type: 'Identifier', name: 'result' },
              { type: 'Identifier', name: 'done' },
            ],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when function has empty params array', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'test name' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('async function expressions with done', () => {
    test('should report async arrow function with done parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'test name' },
          {
            type: 'ArrowFunctionExpression',
            async: true,
            params: [{ type: 'Identifier', name: 'done' }],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'done'")
    })

    test('should report async function expression with done parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [
          { type: 'Literal', value: 'test name' },
          {
            type: 'FunctionExpression',
            id: null,
            async: true,
            params: [{ type: 'Identifier', name: 'done' }],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'done'")
    })

    test('should report async arrow function with cb parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            async: true,
            params: [{ type: 'Identifier', name: 'cb' }],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'cb'")
    })
  })

  describe('edge cases: param types', () => {
    test('should not report when first param is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'test name' },
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'RestElement', argument: { type: 'Identifier', name: 'args' } }],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when params is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'test name' },
          {
            type: 'ArrowFunctionExpression',
            params: null,
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should not report when callback has no params property', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'test name' },
          {
            type: 'ArrowFunctionExpression',
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases: callee types', () => {
    test('should not report for member expression with non-Identifier property', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'it' },
          property: { type: 'Literal', value: 'skip' },
        },
        arguments: [
          { type: 'Literal', value: 'test name' },
          {
            type: 'ArrowFunctionExpression',
            params: [{ type: 'Identifier', name: 'done' }],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })

    test('should handle single argument (no callback)', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [{ type: 'Literal', value: 'test name' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('report descriptor', () => {
    test('should pass node to report', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      const node = createTestWithDone('it', 'done')

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should have consistent message format across call names', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()

      const v1 = noDoneCallbackRule.create(ctx1)
      const v2 = noDoneCallbackRule.create(ctx2)

      v1.CallExpression(createTestWithDone('it', 'done'))
      v2.CallExpression(createTestWithDone('test', 'done'))

      expect(rep1[0].message).toContain('Use async/await instead')
      expect(rep2[0].message).toContain('Use async/await instead')
    })
  })

  describe('valid: hook-only calls', () => {
    test('should not report beforeEach() with only a callback and no done param', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report afterEach() with only a callback and no done param', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'afterEach' },
        arguments: [
          {
            type: 'FunctionExpression',
            id: null,
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report beforeAll() with only a callback and no done param', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithoutDone('beforeAll'))

      expect(reports.length).toBe(0)
    })

    test('should not report afterAll() with only a callback and no done param', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoneCallbackRule.create(context)

      visitor.CallExpression(createTestWithoutDone('afterAll'))

      expect(reports.length).toBe(0)
    })
  })

  describe('rule meta expanded', () => {
    test('should have schema as an array', () => {
      expect(Array.isArray(noDoneCallbackRule.meta.schema)).toBe(true)
    })

    test('should have empty schema', () => {
      expect(noDoneCallbackRule.meta.schema).toHaveLength(0)
    })

    test('should have meta as a plain object', () => {
      expect(typeof noDoneCallbackRule.meta).toBe('object')
      expect(noDoneCallbackRule.meta).not.toBeNull()
      expect(Array.isArray(noDoneCallbackRule.meta)).toBe(false)
    })
  })
})

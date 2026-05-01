import { describe, test, expect, vi } from 'vitest'
import { preferExpectAssertionsRule } from '../../../../src/rules/testing/prefer-expect-assertions.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = "it('works', async () => { await fn(); expect(x).toBe(1); });",
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => { reports.push({ message: descriptor.message, loc: descriptor.loc }) },
    getFilePath: () => filePath,
    getSource: () => source,
    getAST: () => null,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
    logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), warn: vi.fn() },
    settings: {},
    ruleId: 'prefer-expect-assertions',
  }
  return { context, reports }
}

function createAsyncItCall(bodyStatements: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'it' },
    arguments: [
      { type: 'Literal', value: 'test name' },
      {
        type: 'ArrowFunctionExpression',
        async: true,
        body: { type: 'BlockStatement', body: bodyStatements },
        params: [],
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 50 } },
  }
}

function createAsyncTestCall(bodyStatements: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'test' },
    arguments: [
      { type: 'Literal', value: 'test name' },
      {
        type: 'ArrowFunctionExpression',
        async: true,
        body: { type: 'BlockStatement', body: bodyStatements },
        params: [],
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 50 } },
  }
}

function createSyncItCall(bodyStatements: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'it' },
    arguments: [
      { type: 'Literal', value: 'test name' },
      {
        type: 'ArrowFunctionExpression',
        async: false,
        body: { type: 'BlockStatement', body: bodyStatements },
        params: [],
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 50 } },
  }
}

function createAwaitExpr(): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'AwaitExpression',
      argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
    },
  }
}

function createExpectCall(): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'expect' },
          arguments: [{ type: 'Identifier', name: 'x' }],
        },
        property: { type: 'Identifier', name: 'toBe' },
      },
      arguments: [{ type: 'Literal', value: 1 }],
    },
  }
}

function createExpectAssertionsCall(): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'expect' },
        property: { type: 'Identifier', name: 'assertions' },
      },
      arguments: [{ type: 'Literal', value: 1 }],
    },
  }
}

function createExpectHasAssertionsCall(): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'expect' },
        property: { type: 'Identifier', name: 'hasAssertions' },
      },
      arguments: [],
    },
  }
}

function createDescribeCall(): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'describe' },
    arguments: [
      { type: 'Literal', value: 'suite' },
      {
        type: 'ArrowFunctionExpression',
        async: true,
        body: {
          type: 'BlockStatement',
          body: [createAwaitExpr(), createExpectCall()],
        },
        params: [],
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
  }
}

function createBeforeEachCall(): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'beforeEach' },
    arguments: [
      {
        type: 'ArrowFunctionExpression',
        async: true,
        body: {
          type: 'BlockStatement',
          body: [createAwaitExpr(), createExpectCall()],
        },
        params: [],
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
  }
}

function createAsyncFunctionExprCall(bodyStatements: unknown[]): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'it' },
    arguments: [
      { type: 'Literal', value: 'test name' },
      {
        type: 'FunctionExpression',
        async: true,
        body: { type: 'BlockStatement', body: bodyStatements },
        params: [],
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
  }
}

function createItSkipCall(bodyStatements: unknown[]): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'it' },
      property: { type: 'Identifier', name: 'skip' },
    },
    arguments: [
      { type: 'Literal', value: 'test name' },
      {
        type: 'ArrowFunctionExpression',
        async: true,
        body: { type: 'BlockStatement', body: bodyStatements },
        params: [],
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
  }
}

function createTestOnlyCall(bodyStatements: unknown[]): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'test' },
      property: { type: 'Identifier', name: 'only' },
    },
    arguments: [
      { type: 'Literal', value: 'test name' },
      {
        type: 'ArrowFunctionExpression',
        async: true,
        body: { type: 'BlockStatement', body: bodyStatements },
        params: [],
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
  }
}

function createItEachCall(bodyStatements: unknown[]): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'it' },
      property: { type: 'Identifier', name: 'each' },
    },
    arguments: [
      { type: 'ArrayExpression', elements: [] },
      {
        type: 'ArrowFunctionExpression',
        async: true,
        body: { type: 'BlockStatement', body: bodyStatements },
        params: [],
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
  }
}

describe('prefer-expect-assertions rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferExpectAssertionsRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferExpectAssertionsRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(preferExpectAssertionsRule.meta.docs?.recommended).toBe(false)
    })

    test('should have testing category', () => {
      expect(preferExpectAssertionsRule.meta.docs?.category).toBe('testing')
    })

    test('should have correct docs URL', () => {
      expect(preferExpectAssertionsRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/prefer-expect-assertions',
      )
    })

    test('should have description mentioning expect.assertions', () => {
      expect(preferExpectAssertionsRule.meta.docs?.description).toContain('expect.assertions')
    })

    test('should have description mentioning async tests', () => {
      expect(preferExpectAssertionsRule.meta.docs?.description).toContain('async tests')
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = preferExpectAssertionsRule.create(context)
      const visitor2 = preferExpectAssertionsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('valid cases — has expect.assertions', () => {
    test('should not report async it() with expect.assertions and await', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncItCall([createExpectAssertionsCall(), createAwaitExpr(), createExpectCall()])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report async test() with expect.assertions and await', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncTestCall([createExpectAssertionsCall(), createAwaitExpr(), createExpectCall()])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when expect.assertions appears after await', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncItCall([createAwaitExpr(), createExpectAssertionsCall(), createExpectCall()])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when expect.assertions appears at the end', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncItCall([createAwaitExpr(), createExpectCall(), createExpectAssertionsCall()])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('valid cases — has expect.hasAssertions', () => {
    test('should not report async it() with expect.hasAssertions and await', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncItCall([createExpectHasAssertionsCall(), createAwaitExpr(), createExpectCall()])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report async test() with expect.hasAssertions', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncTestCall([createExpectHasAssertionsCall(), createAwaitExpr(), createExpectCall()])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when expect.hasAssertions appears after await', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncItCall([createAwaitExpr(), createExpectHasAssertionsCall(), createExpectCall()])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('valid cases — sync tests', () => {
    test('should not report sync it() with expect but no async', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createSyncItCall([createExpectCall()])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report sync test() with expect calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [
          { type: 'Literal', value: 'sync test' },
          {
            type: 'ArrowFunctionExpression',
            async: false,
            body: { type: 'BlockStatement', body: [createExpectCall()] },
            params: [],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('valid cases — no expect calls', () => {
    test('should not report async it() with await but no expect', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncItCall([createAwaitExpr()])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report async test() with await but no expect', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncTestCall([createAwaitExpr()])
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('valid cases — non-test functions', () => {
    test('should not report describe() with async callback and expect', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      visitor.CallExpression(createDescribeCall())
      expect(reports.length).toBe(0)
    })

    test('should not report beforeEach() with async callback and expect', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      visitor.CallExpression(createBeforeEachCall())
      expect(reports.length).toBe(0)
    })

    test('should not report regular function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'someFunction' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })
  })

  describe('invalid cases — it() async with await + expect but no assertions count', () => {
    test('should report async it() with await and expect but no assertions count', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncItCall([createAwaitExpr(), createExpectCall()])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report async test() with await and expect but no assertions count', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncTestCall([createAwaitExpr(), createExpectCall()])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report async it() with multiple awaits and expects', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncItCall([createAwaitExpr(), createExpectCall(), createAwaitExpr(), createExpectCall()])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report async it() with expect before await', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncItCall([createExpectCall(), createAwaitExpr()])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report async test() using fetch pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncTestCall([
        {
          type: 'VariableDeclaration',
          declarations: [{
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'result' },
            init: {
              type: 'AwaitExpression',
              argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fetch' }, arguments: [] },
            },
          }],
        },
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'Identifier', name: 'result' }],
              },
              property: { type: 'Identifier', name: 'toBeDefined' },
            },
            arguments: [],
          },
        },
      ])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report async it() with toHaveBeenCalled matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncItCall([
        createAwaitExpr(),
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'Identifier', name: 'mock' }],
              },
              property: { type: 'Identifier', name: 'toHaveBeenCalled' },
            },
            arguments: [],
          },
        },
      ])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report when async callback uses FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncFunctionExprCall([createAwaitExpr(), createExpectCall()])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report async it() with only await in a try-catch with expect', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncItCall([
        {
          type: 'TryStatement',
          block: {
            type: 'BlockStatement',
            body: [createAwaitExpr()],
          },
          handler: {
            type: 'CatchClause',
            body: {
              type: 'BlockStatement',
              body: [createExpectCall()],
            },
          },
        },
      ])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report with deeply nested expect call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncItCall([
        createAwaitExpr(),
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'expect' },
                    arguments: [{ type: 'Identifier', name: 'x' }],
                  },
                  property: { type: 'Identifier', name: 'not' },
                },
                arguments: [],
              },
              property: { type: 'Identifier', name: 'toBeNull' },
            },
            arguments: [],
          },
        },
      ])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report it.skip() async with await and expect', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createItSkipCall([createAwaitExpr(), createExpectCall()])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report test.only() async with await and expect', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createTestOnlyCall([createAwaitExpr(), createExpectCall()])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report it.each() async with await and expect', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createItEachCall([createAwaitExpr(), createExpectCall()])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report with a single expect and a single await', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncItCall([createAwaitExpr(), createExpectCall()])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report with chained matchers like toEqual', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncItCall([
        createAwaitExpr(),
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'Identifier', name: 'result' }],
              },
              property: { type: 'Identifier', name: 'toEqual' },
            },
            arguments: [{ type: 'Literal', value: 42 }],
          },
        },
      ])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report with resolves matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncItCall([
        createAwaitExpr(),
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'expect' },
                    arguments: [{ type: 'Identifier', name: 'promise' }],
                  },
                  property: { type: 'Identifier', name: 'resolves' },
                },
                arguments: [],
              },
              property: { type: 'Identifier', name: 'toBe' },
            },
            arguments: [{ type: 'Literal', value: true }],
          },
        },
      ])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report when there are many awaits and expects', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncItCall([
        createAwaitExpr(),
        createExpectCall(),
        createAwaitExpr(),
        createExpectCall(),
        createAwaitExpr(),
        createExpectCall(),
      ])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report async test with inline arrow body returning await', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'test name' },
          {
            type: 'ArrowFunctionExpression',
            async: true,
            body: {
              type: 'BlockStatement',
              body: [
                createAwaitExpr(),
                createExpectCall(),
              ],
            },
            params: [],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report with toThrow matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncItCall([
        createAwaitExpr(),
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'Identifier', name: 'fn' }],
              },
              property: { type: 'Identifier', name: 'toThrow' },
            },
            arguments: [],
          },
        },
      ])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report with toContain matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncItCall([
        createAwaitExpr(),
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'Identifier', name: 'arr' }],
              },
              property: { type: 'Identifier', name: 'toContain' },
            },
            arguments: [{ type: 'Literal', value: 'item' }],
          },
        },
      ])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report async it() with toHaveLength matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncItCall([
        createAwaitExpr(),
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'Identifier', name: 'arr' }],
              },
              property: { type: 'Identifier', name: 'toHaveLength' },
            },
            arguments: [{ type: 'Literal', value: 3 }],
          },
        },
      ])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report async it() with toBeTruthy matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncItCall([
        createAwaitExpr(),
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'Identifier', name: 'val' }],
              },
              property: { type: 'Identifier', name: 'toBeTruthy' },
            },
            arguments: [],
          },
        },
      ])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report async it() with toBeFalsy matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncItCall([
        createAwaitExpr(),
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'Identifier', name: 'val' }],
              },
              property: { type: 'Identifier', name: 'toBeFalsy' },
            },
            arguments: [],
          },
        },
      ])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report async test() with toBeNull matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncTestCall([
        createAwaitExpr(),
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'Identifier', name: 'val' }],
              },
              property: { type: 'Identifier', name: 'toBeNull' },
            },
            arguments: [],
          },
        },
      ])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report async test() with toBeUndefined matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncTestCall([
        createAwaitExpr(),
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'Identifier', name: 'val' }],
              },
              property: { type: 'Identifier', name: 'toBeUndefined' },
            },
            arguments: [],
          },
        },
      ])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report async test() with toBeDefined matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncTestCall([
        createAwaitExpr(),
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'Identifier', name: 'val' }],
              },
              property: { type: 'Identifier', name: 'toBeDefined' },
            },
            arguments: [],
          },
        },
      ])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report with snapshot matcher toMatchSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncItCall([
        createAwaitExpr(),
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'expect' },
                arguments: [{ type: 'Identifier', name: 'result' }],
              },
              property: { type: 'Identifier', name: 'toMatchSnapshot' },
            },
            arguments: [],
          },
        },
      ])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report with rejects.toThrow matcher', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncItCall([
        createAwaitExpr(),
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'expect' },
                    arguments: [{ type: 'Identifier', name: 'promise' }],
                  },
                  property: { type: 'Identifier', name: 'rejects' },
                },
                arguments: [],
              },
              property: { type: 'Identifier', name: 'toThrow' },
            },
            arguments: [],
          },
        },
      ])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report when await is in variable declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncItCall([
        {
          type: 'VariableDeclaration',
          declarations: [{
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'data' },
            init: {
              type: 'AwaitExpression',
              argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getData' }, arguments: [] },
            },
          }],
        },
        createExpectCall(),
      ])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report when there is an if statement with expect inside', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncItCall([
        createAwaitExpr(),
        {
          type: 'IfStatement',
          test: { type: 'Identifier', name: 'condition' },
          consequent: { type: 'BlockStatement', body: [createExpectCall()] },
        },
      ])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report with a for-loop containing await and expect', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncItCall([
        {
          type: 'ForStatement',
          init: null,
          test: { type: 'Identifier', name: 'condition' },
          update: null,
          body: {
            type: 'BlockStatement',
            body: [createAwaitExpr(), createExpectCall()],
          },
        },
      ])
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report when async callback has no function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [{ type: 'Literal', value: 'test name' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when callback body is not BlockStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'Literal', value: 'test' },
          {
            type: 'ArrowFunctionExpression',
            async: true,
            body: { type: 'Identifier', name: 'result' },
            params: [],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const node = createAsyncItCall([createAwaitExpr(), createExpectCall()])
      delete (node as Record<string, unknown>).loc
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle multiple separate test calls independently', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      const valid = createAsyncItCall([createExpectAssertionsCall(), createAwaitExpr(), createExpectCall()])
      const invalid = createAsyncItCall([createAwaitExpr(), createExpectCall()])
      visitor.CallExpression(valid)
      visitor.CallExpression(invalid)
      expect(reports.length).toBe(1)
    })

    test('should not report afterEach() with async callback and expect', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'afterEach' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            async: true,
            body: { type: 'BlockStatement', body: [createAwaitExpr(), createExpectCall()] },
            params: [],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report afterAll() with async callback and expect', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'afterAll' },
        arguments: [
          {
            type: 'ArrowFunctionExpression',
            async: true,
            body: { type: 'BlockStatement', body: [createAwaitExpr(), createExpectCall()] },
            params: [],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      })
      expect(reports.length).toBe(0)
    })
  })

  describe('error message format', () => {
    test('message mentions expect.assertions', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      visitor.CallExpression(createAsyncItCall([createAwaitExpr(), createExpectCall()]))
      expect(reports[0].message).toContain('expect.assertions')
    })

    test('message mentions expect.hasAssertions', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      visitor.CallExpression(createAsyncItCall([createAwaitExpr(), createExpectCall()]))
      expect(reports[0].message).toContain('expect.hasAssertions')
    })

    test('message mentions async tests', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      visitor.CallExpression(createAsyncItCall([createAwaitExpr(), createExpectCall()]))
      expect(reports[0].message).toContain('async tests')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      visitor.CallExpression(createAsyncItCall([createAwaitExpr(), createExpectCall()], 5, 10))
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('message ends with period', () => {
      const { context, reports } = createMockContext()
      const visitor = preferExpectAssertionsRule.create(context)
      visitor.CallExpression(createAsyncItCall([createAwaitExpr(), createExpectCall()]))
      expect(reports[0].message).toMatch(/\.$/)
    })
  })

  describe('default export', () => {
    test('rule should be the default export', () => {
      expect(preferExpectAssertionsRule).toBeDefined()
      expect(preferExpectAssertionsRule.meta).toBeDefined()
      expect(preferExpectAssertionsRule.create).toBeDefined()
    })
  })

  describe('docs URL', () => {
    test('should have valid URL format', () => {
      const url = preferExpectAssertionsRule.meta.docs?.url
      expect(url).toMatch(/^https?:\/\/.+/)
      expect(url).toContain('prefer-expect-assertions')
    })
  })

   describe('state isolation between visitors', () => {
     test('separate visitors have independent reports', () => {
       const { context: ctx1, reports: rep1 } = createMockContext()
       const { context: ctx2, reports: rep2 } = createMockContext()
       const visitor1 = preferExpectAssertionsRule.create(ctx1)
       const visitor2 = preferExpectAssertionsRule.create(ctx2)
       visitor1.CallExpression(createAsyncItCall([createAwaitExpr(), createExpectCall()]))
       visitor2.CallExpression(createAsyncItCall([createExpectAssertionsCall(), createAwaitExpr(), createExpectCall()]))
       expect(rep1.length).toBe(1)
       expect(rep2.length).toBe(0)
     })
   })

   describe('additional edge cases', () => {
     test('should handle null node gracefully', () => {
       const { context, reports } = createMockContext()
       const visitor = preferExpectAssertionsRule.create(context)
       expect(() => visitor.CallExpression(null)).not.toThrow()
       expect(reports.length).toBe(0)
     })

     test('should handle undefined node gracefully', () => {
       const { context, reports } = createMockContext()
       const visitor = preferExpectAssertionsRule.create(context)
       expect(() => visitor.CallExpression(undefined)).not.toThrow()
       expect(reports.length).toBe(0)
     })

     test('should handle empty object node gracefully', () => {
       const { context, reports } = createMockContext()
       const visitor = preferExpectAssertionsRule.create(context)
       expect(() => visitor.CallExpression({})).not.toThrow()
       expect(reports.length).toBe(0)
     })

     test('should not report test() with FunctionExpression callback', () => {
       const { context, reports } = createMockContext()
       const visitor = preferExpectAssertionsRule.create(context)
       visitor.CallExpression({
         type: 'CallExpression',
         callee: { type: 'Identifier', name: 'test' },
         arguments: [
           { type: 'Literal', value: 'works' },
           {
             type: 'FunctionExpression',
             async: true,
             params: [],
             body: {
               type: 'BlockStatement',
               body: [
                 { type: 'ExpressionStatement', expression: createAwaitExpr() },
                 { type: 'ExpressionStatement', expression: createExpectCall() },
               ],
             },
           },
         ],
       })
       expect(reports.length).toBe(1)
     })

     test('should not report async test with expect.assertions and FunctionExpression', () => {
       const { context, reports } = createMockContext()
       const visitor = preferExpectAssertionsRule.create(context)
       visitor.CallExpression({
         type: 'CallExpression',
         callee: { type: 'Identifier', name: 'it' },
         arguments: [
           { type: 'Literal', value: 'works' },
           {
             type: 'FunctionExpression',
             async: true,
             params: [],
             body: {
               type: 'BlockStatement',
               body: [
                 { type: 'ExpressionStatement', expression: createExpectAssertionsCall() },
                 { type: 'ExpressionStatement', expression: createAwaitExpr() },
                 { type: 'ExpressionStatement', expression: createExpectCall() },
               ],
             },
           },
         ],
       })
       expect(reports.length).toBe(0)
     })

     test('should not report async test with no expect calls at all', () => {
       const { context, reports } = createMockContext()
       const visitor = preferExpectAssertionsRule.create(context)
       visitor.CallExpression(createAsyncItCall([createAwaitExpr()]))
       expect(reports.length).toBe(0)
     })

     test('should report it.only() async without assertions count', () => {
       const { context, reports } = createMockContext()
       const visitor = preferExpectAssertionsRule.create(context)
       visitor.CallExpression({
         type: 'CallExpression',
         callee: {
           type: 'MemberExpression',
           object: { type: 'Identifier', name: 'it' },
           property: { type: 'Identifier', name: 'only' },
         },
         arguments: [
           { type: 'Literal', value: 'works' },
           {
             type: 'ArrowFunctionExpression',
             async: true,
             params: [],
             body: {
               type: 'BlockStatement',
               body: [
                 { type: 'ExpressionStatement', expression: createAwaitExpr() },
                 { type: 'ExpressionStatement', expression: createExpectCall() },
               ],
             },
           },
         ],
       })
       expect(reports.length).toBe(1)
     })

     test('should report test.skip() async without assertions count', () => {
       const { context, reports } = createMockContext()
       const visitor = preferExpectAssertionsRule.create(context)
       visitor.CallExpression({
         type: 'CallExpression',
         callee: {
           type: 'MemberExpression',
           object: { type: 'Identifier', name: 'test' },
           property: { type: 'Identifier', name: 'skip' },
         },
         arguments: [
           { type: 'Literal', value: 'works' },
           {
             type: 'ArrowFunctionExpression',
             async: true,
             params: [],
             body: {
               type: 'BlockStatement',
               body: [
                 { type: 'ExpressionStatement', expression: createAwaitExpr() },
                 { type: 'ExpressionStatement', expression: createExpectCall() },
               ],
             },
           },
         ],
       })
       expect(reports.length).toBe(1)
     })

     test('should not report test.each() with async callback', () => {
       const { context, reports } = createMockContext()
       const visitor = preferExpectAssertionsRule.create(context)
       visitor.CallExpression({
         type: 'CallExpression',
         callee: {
           type: 'MemberExpression',
           object: { type: 'Identifier', name: 'test' },
           property: { type: 'Identifier', name: 'each' },
         },
         arguments: [
           { type: 'Literal', value: 'works' },
           {
             type: 'ArrowFunctionExpression',
             async: true,
             params: [],
             body: {
               type: 'BlockStatement',
               body: [
                 { type: 'ExpressionStatement', expression: createExpectAssertionsCall() },
                 { type: 'ExpressionStatement', expression: createAwaitExpr() },
                 { type: 'ExpressionStatement', expression: createExpectCall() },
               ],
             },
           },
         ],
       })
       expect(reports.length).toBe(0)
     })

     test('should not report non-async test with await in body', () => {
       const { context, reports } = createMockContext()
       const visitor = preferExpectAssertionsRule.create(context)
       visitor.CallExpression({
         type: 'CallExpression',
         callee: { type: 'Identifier', name: 'it' },
         arguments: [
           { type: 'Literal', value: 'works' },
           {
             type: 'ArrowFunctionExpression',
             async: false,
             params: [],
             body: {
               type: 'BlockStatement',
               body: [
                 { type: 'ExpressionStatement', expression: createAwaitExpr() },
                 { type: 'ExpressionStatement', expression: createExpectCall() },
               ],
             },
           },
         ],
       })
       expect(reports.length).toBe(0)
     })

     test('should handle CallExpression with no arguments', () => {
       const { context, reports } = createMockContext()
       const visitor = preferExpectAssertionsRule.create(context)
       visitor.CallExpression({
         type: 'CallExpression',
         callee: { type: 'Identifier', name: 'it' },
         arguments: [],
       })
       expect(reports.length).toBe(0)
     })

     test('should handle CallExpression with string arguments only', () => {
       const { context, reports } = createMockContext()
       const visitor = preferExpectAssertionsRule.create(context)
       visitor.CallExpression({
         type: 'CallExpression',
         callee: { type: 'Identifier', name: 'it' },
         arguments: [{ type: 'Literal', value: 'just a title' }],
       })
       expect(reports.length).toBe(0)
     })

     test('should handle CallExpression with missing callee', () => {
       const { context, reports } = createMockContext()
       const visitor = preferExpectAssertionsRule.create(context)
       visitor.CallExpression({
         type: 'CallExpression',
         arguments: [],
       })
       expect(reports.length).toBe(0)
     })

     test('create returns new visitor each call', () => {
       const { context } = createMockContext()
       const v1 = preferExpectAssertionsRule.create(context)
       const v2 = preferExpectAssertionsRule.create(context)
       expect(v1).not.toBe(v2)
     })

     test('meta docs category is testing', () => {
       expect(preferExpectAssertionsRule.meta.docs?.category).toBe('testing')
       expect(preferExpectAssertionsRule.meta.docs?.recommended).toBe(false)
     })

     test('meta type is suggestion', () => {
       expect(preferExpectAssertionsRule.meta.type).toBe('suggestion')
       expect(preferExpectAssertionsRule.meta.severity).toBe('warn')
       expect(preferExpectAssertionsRule.meta.fixable).toBeUndefined()
     })

      test('default export matches named export', async () => {
        const mod = await import('../../../../src/rules/testing/prefer-expect-assertions.js')
        expect(mod.default).toBe(preferExpectAssertionsRule)
      })

      test('reports async test with await and nested expect call', () => {
        const nestedExpect = {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'expect' }, arguments: [{ type: 'Identifier', name: 'result' }] },
                  property: { type: 'Identifier', name: 'not' },
                },
                arguments: [],
              },
              property: { type: 'Identifier', name: 'toBe' },
            },
            arguments: [{ type: 'Literal', value: null }],
          },
        }
        const { context, reports } = createMockContext()
        const visitor = preferExpectAssertionsRule.create(context)
        visitor.CallExpression(createAsyncTestCall([createAwaitExpr(), nestedExpect]))
        expect(reports.length).toBe(1)
      })

      test('does not report when async test has expect.assertions() call', () => {
        const { context, reports } = createMockContext()
        const visitor = preferExpectAssertionsRule.create(context)
        visitor.CallExpression(createAsyncTestCall([createExpectAssertionsCall(), createAwaitExpr(), createExpectCall()]))
        expect(reports.length).toBe(0)
      })

      test('does not report when async test has expect.hasAssertions() call', () => {
        const { context, reports } = createMockContext()
        const visitor = preferExpectAssertionsRule.create(context)
        visitor.CallExpression(createAsyncTestCall([createExpectHasAssertionsCall(), createAwaitExpr(), createExpectCall()]))
        expect(reports.length).toBe(0)
      })

      test('reports for test.each with async callback containing await and expect', () => {
        const testEachCall = {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'test' },
            property: { type: 'Identifier', name: 'each' },
          },
          arguments: [
            { type: 'ArrayExpression', elements: [] },
            {
              type: 'ArrowFunctionExpression',
              async: true,
              body: { type: 'BlockStatement', body: [createAwaitExpr(), createExpectCall()] },
              params: [],
            },
          ],
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
        }
        const { context, reports } = createMockContext()
        const visitor = preferExpectAssertionsRule.create(context)
        visitor.CallExpression(testEachCall)
        expect(reports.length).toBe(1)
      })

      test('does not report when sync test has expect call without await', () => {
        const { context, reports } = createMockContext()
        const visitor = preferExpectAssertionsRule.create(context)
        visitor.CallExpression(createSyncItCall([createExpectCall()]))
        expect(reports.length).toBe(0)
      })
    })
  })

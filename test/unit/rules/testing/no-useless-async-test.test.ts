import { describe, test, expect, vi } from 'vitest'
import { noUselessAsyncTestRule } from '../../../../src/rules/testing/no-useless-async-test.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = "it('works', async () => { expect(1).toBe(1); });",
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
    ruleId: 'no-useless-async-test',
    workspaceRoot: '/src',
  }
  return { context, reports }
}

function createAsyncArrowCallback(
  bodyStatements: unknown[] = [],
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } },
): unknown {
  return {
    type: 'ArrowFunctionExpression',
    async: true,
    params: [],
    body: { type: 'BlockStatement', body: bodyStatements },
    loc: loc ?? { start: { line: 1, column: 10 }, end: { line: 1, column: 50 } },
  }
}

function createSyncArrowCallback(
  bodyStatements: unknown[] = [],
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } },
): unknown {
  return {
    type: 'ArrowFunctionExpression',
    async: false,
    params: [],
    body: { type: 'BlockStatement', body: bodyStatements },
    loc: loc ?? { start: { line: 1, column: 10 }, end: { line: 1, column: 50 } },
  }
}

function createAsyncFunctionCallback(
  bodyStatements: unknown[] = [],
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } },
): unknown {
  return {
    type: 'FunctionExpression',
    async: true,
    id: null,
    params: [],
    body: { type: 'BlockStatement', body: bodyStatements },
    loc: loc ?? { start: { line: 1, column: 10 }, end: { line: 1, column: 50 } },
  }
}

function createSyncFunctionCallback(
  bodyStatements: unknown[] = [],
): unknown {
  return {
    type: 'FunctionExpression',
    async: false,
    id: null,
    params: [],
    body: { type: 'BlockStatement', body: bodyStatements },
    loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 50 } },
  }
}

function createTestCall(
  functionName: string,
  callback: unknown,
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } },
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: functionName },
    arguments: [{ type: 'Literal', value: 'test name' }, callback],
    loc: loc ?? { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
  }
}

function createMemberTestCall(
  objectName: string,
  propertyName: string,
  callback: unknown,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: propertyName },
    },
    arguments: [{ type: 'Literal', value: 'test name' }, callback],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 70 } },
  }
}

function createAwaitExpression(argumentName = 'something'): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'AwaitExpression',
      argument: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: argumentName },
        arguments: [],
      },
    },
  }
}

function createExpressionStatement(name: string): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: { type: 'Identifier', name },
      arguments: [],
    },
  }
}

describe('no-useless-async-test rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noUselessAsyncTestRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUselessAsyncTestRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noUselessAsyncTestRule.meta.docs?.recommended).toBe(false)
    })

    test('should have correct category', () => {
      expect(noUselessAsyncTestRule.meta.docs?.category).toBe('testing')
    })

    test('should have description mentioning async', () => {
      expect(noUselessAsyncTestRule.meta.docs?.description.toLowerCase()).toContain('async')
    })

    test('should have description mentioning await', () => {
      expect(noUselessAsyncTestRule.meta.docs?.description.toLowerCase()).toContain('await')
    })

    test('should have correct docs URL', () => {
      expect(noUselessAsyncTestRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-useless-async-test',
      )
    })

    test('should not have fixable field', () => {
      expect(noUselessAsyncTestRule.meta.fixable).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUselessAsyncTestRule.create(context)
      const visitor2 = noUselessAsyncTestRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('create returns object with only CallExpression key', () => {
      const { context } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      expect(Object.keys(visitor)).toEqual(['CallExpression'])
    })

    test('CallExpression should be a function', () => {
      const { context } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })
  })

  describe('valid: sync callbacks should not report', () => {
    test('should not report sync it callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('it', createSyncArrowCallback()))
      expect(reports.length).toBe(0)
    })

    test('should not report sync test callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('test', createSyncArrowCallback()))
      expect(reports.length).toBe(0)
    })

    test('should not report sync describe callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('describe', createSyncArrowCallback()))
      expect(reports.length).toBe(0)
    })

    test('should not report sync beforeEach callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('beforeEach', createSyncArrowCallback()))
      expect(reports.length).toBe(0)
    })

    test('should not report sync afterEach callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('afterEach', createSyncArrowCallback()))
      expect(reports.length).toBe(0)
    })

    test('should not report sync beforeAll callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('beforeAll', createSyncArrowCallback()))
      expect(reports.length).toBe(0)
    })

    test('should not report sync afterAll callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('afterAll', createSyncArrowCallback()))
      expect(reports.length).toBe(0)
    })

    test('should not report sync FunctionExpression callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('it', createSyncFunctionCallback()))
      expect(reports.length).toBe(0)
    })

    test('should not report sync callback with statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(
        createTestCall('it', createSyncArrowCallback([createExpressionStatement('setup')])),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report empty sync callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('test', createSyncArrowCallback([])))
      expect(reports.length).toBe(0)
    })
  })

  describe('valid: async callbacks with await should not report', () => {
    test('should not report async it callback with await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(
        createTestCall('it', createAsyncArrowCallback([createAwaitExpression('fetch')])),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report async test callback with await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(
        createTestCall('test', createAsyncArrowCallback([createAwaitExpression('setup')])),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report async describe callback with await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(
        createTestCall('describe', createAsyncArrowCallback([createAwaitExpression('load')])),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report async beforeEach callback with await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(
        createTestCall('beforeEach', createAsyncArrowCallback([createAwaitExpression('init')])),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report async afterEach callback with await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(
        createTestCall('afterEach', createAsyncArrowCallback([createAwaitExpression('cleanup')])),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report async beforeAll callback with await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(
        createTestCall('beforeAll', createAsyncArrowCallback([createAwaitExpression('connect')])),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report async afterAll callback with await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(
        createTestCall('afterAll', createAsyncArrowCallback([createAwaitExpression('disconnect')])),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report async FunctionExpression callback with await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(
        createTestCall('it', createAsyncFunctionCallback([createAwaitExpression('query')])),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report async callback with await as sole body expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      const callback = {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: {
          type: 'AwaitExpression',
          argument: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'getData' },
            arguments: [],
          },
        },
        loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(createTestCall('it', callback))
      expect(reports.length).toBe(0)
    })
  })

  describe('valid: non-test function calls should not report', () => {
    test('should not report async callback in non-test function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('myCustomFn', createAsyncArrowCallback()))
      expect(reports.length).toBe(0)
    })

    test('should not report async callback in Promise.all', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('Promise.all', createAsyncArrowCallback()))
      expect(reports.length).toBe(0)
    })

    test('should not report async callback in setTimeout', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('setTimeout', createAsyncArrowCallback()))
      expect(reports.length).toBe(0)
    })

    test('should not report async callback in addEventListener', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('addEventListener', createAsyncArrowCallback()))
      expect(reports.length).toBe(0)
    })
  })

  describe('invalid: async it/test without await should report', () => {
    test('should report async it callback with no await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('it', createAsyncArrowCallback()))
      expect(reports.length).toBe(1)
    })

    test('should report async test callback with no await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('test', createAsyncArrowCallback()))
      expect(reports.length).toBe(1)
    })

    test('should report async it callback with statements but no await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(
        createTestCall('it', createAsyncArrowCallback([createExpressionStatement('expect')])),
      )
      expect(reports.length).toBe(1)
    })

    test('should report async test callback with empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('test', createAsyncArrowCallback([])))
      expect(reports.length).toBe(1)
    })

    test('should report async FunctionExpression it callback with no await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('it', createAsyncFunctionCallback()))
      expect(reports.length).toBe(1)
    })

    test('should report async FunctionExpression test callback with no await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('test', createAsyncFunctionCallback()))
      expect(reports.length).toBe(1)
    })

    test('should report async it with multiple statements but no await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(
        createTestCall('it', createAsyncArrowCallback([
          createExpressionStatement('setup'),
          createExpressionStatement('expect'),
          createExpressionStatement('teardown'),
        ])),
      )
      expect(reports.length).toBe(1)
    })

    test('should report async test with only a return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(
        createTestCall('test', createAsyncArrowCallback([
          { type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } },
        ])),
      )
      expect(reports.length).toBe(1)
    })

    test('should report async it with multiple sync calls but no await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(
        createTestCall('it', createAsyncArrowCallback([
          createExpressionStatement('arrange'),
          createExpressionStatement('act'),
          createExpressionStatement('assert'),
        ])),
      )
      expect(reports.length).toBe(1)
    })

    test('should report async it with object expression but no await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      const objExpr = {
        type: 'ExpressionStatement',
        expression: {
          type: 'ObjectExpression',
          properties: [
            {
              type: 'Property',
              key: { type: 'Identifier', name: 'a' },
              value: { type: 'Literal', value: 1 },
              method: false,
              shorthand: false,
              computed: false,
              kind: 'init',
            },
          ],
        },
      }
      visitor.CallExpression(
        createTestCall('it', createAsyncArrowCallback([objExpr])),
      )
      expect(reports.length).toBe(1)
    })

    test('should report async it with array expression but no await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      const arrExpr = {
        type: 'ExpressionStatement',
        expression: {
          type: 'ArrayExpression',
          elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }],
        },
      }
      visitor.CallExpression(
        createTestCall('it', createAsyncArrowCallback([arrExpr])),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('invalid: async hooks without await should report', () => {
    test('should report async beforeEach callback with no await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('beforeEach', createAsyncArrowCallback()))
      expect(reports.length).toBe(1)
    })

    test('should report async afterEach callback with no await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('afterEach', createAsyncArrowCallback()))
      expect(reports.length).toBe(1)
    })

    test('should report async beforeAll callback with no await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('beforeAll', createAsyncArrowCallback()))
      expect(reports.length).toBe(1)
    })

    test('should report async afterAll callback with no await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('afterAll', createAsyncArrowCallback()))
      expect(reports.length).toBe(1)
    })

    test('should report async beforeEach with setup call but no await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(
        createTestCall('beforeEach', createAsyncArrowCallback([createExpressionStatement('setup')])),
      )
      expect(reports.length).toBe(1)
    })

    test('should report async afterAll with cleanup call but no await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(
        createTestCall('afterAll', createAsyncArrowCallback([createExpressionStatement('cleanup')])),
      )
      expect(reports.length).toBe(1)
    })

    test('should report async FunctionExpression beforeEach with no await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('beforeEach', createAsyncFunctionCallback()))
      expect(reports.length).toBe(1)
    })

    test('should report async FunctionExpression afterAll with no await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('afterAll', createAsyncFunctionCallback()))
      expect(reports.length).toBe(1)
    })
  })

  describe('invalid: async describe without await should report', () => {
    test('should report async describe callback with no await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('describe', createAsyncArrowCallback()))
      expect(reports.length).toBe(1)
    })

    test('should report async describe with statements but no await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(
        createTestCall('describe', createAsyncArrowCallback([createExpressionStatement('setup')])),
      )
      expect(reports.length).toBe(1)
    })

    test('should report async FunctionExpression describe with no await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('describe', createAsyncFunctionCallback()))
      expect(reports.length).toBe(1)
    })

    test('should report async describe with empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('describe', createAsyncArrowCallback([])))
      expect(reports.length).toBe(1)
    })
  })

  describe('invalid: member expression callee patterns', () => {
    test('should report it.only with async callback without await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createMemberTestCall('it', 'only', createAsyncArrowCallback()))
      expect(reports.length).toBe(1)
    })

    test('should report test.skip with async callback without await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createMemberTestCall('test', 'skip', createAsyncArrowCallback()))
      expect(reports.length).toBe(1)
    })

    test('should not report it.only with async callback with await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(
        createMemberTestCall('it', 'only', createAsyncArrowCallback([createAwaitExpression()])),
      )
      expect(reports.length).toBe(0)
    })

    test('should report describe.each with async callback without await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createMemberTestCall('describe', 'each', createAsyncArrowCallback()))
      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases: null and undefined handling', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [],
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [createAsyncArrowCallback()],
      })
      expect(reports.length).toBe(0)
    })

    test('should handle callback that is not a function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [{ type: 'Literal', value: 'not a function' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // =========================================================================
  // Edge cases — nested functions and complex bodies (8 tests)
  // =========================================================================
  describe('edge cases: nested functions and complex bodies', () => {
    test('should report when await is in nested function not in direct body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      const nestedFn = {
        type: 'ExpressionStatement',
        expression: {
          type: 'ArrowFunctionExpression',
          async: true,
          params: [],
          body: {
            type: 'BlockStatement',
            body: [createAwaitExpression()],
          },
        },
      }
      visitor.CallExpression(
        createTestCall('it', createAsyncArrowCallback([nestedFn])),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report async callback with await in if statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      const ifStmt = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'cond' },
        consequent: {
          type: 'BlockStatement',
          body: [createAwaitExpression('maybeFetch')],
        },
        alternate: null,
      }
      visitor.CallExpression(
        createTestCall('it', createAsyncArrowCallback([ifStmt])),
      )
      expect(reports.length).toBe(0)
    })

    test('should report async callback with no await in try-catch', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      const tryCatch = {
        type: 'TryStatement',
        block: {
          type: 'BlockStatement',
          body: [createExpressionStatement('doSomething')],
        },
        handler: {
          type: 'CatchClause',
          param: { type: 'Identifier', name: 'e' },
          body: { type: 'BlockStatement', body: [] },
        },
        finalizer: null,
      }
      visitor.CallExpression(
        createTestCall('it', createAsyncArrowCallback([tryCatch])),
      )
      expect(reports.length).toBe(1)
    })

    test('should not report async callback with await in catch block', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      const tryCatch = {
        type: 'TryStatement',
        block: {
          type: 'BlockStatement',
          body: [createExpressionStatement('doSomething')],
        },
        handler: {
          type: 'CatchClause',
          param: { type: 'Identifier', name: 'e' },
          body: {
            type: 'BlockStatement',
            body: [createAwaitExpression('recover')],
          },
        },
        finalizer: null,
      }
      visitor.CallExpression(
        createTestCall('it', createAsyncArrowCallback([tryCatch])),
      )
      expect(reports.length).toBe(0)
    })

    test('should report async callback with only sync for-of loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      const forOf = {
        type: 'ForOfStatement',
        left: { type: 'Identifier', name: 'item' },
        right: { type: 'Identifier', name: 'items' },
        body: {
          type: 'BlockStatement',
          body: [createExpressionStatement('process')],
        },
      }
      visitor.CallExpression(
        createTestCall('test', createAsyncArrowCallback([forOf])),
      )
      expect(reports.length).toBe(1)
    })

    test('should not report async callback with await in variable declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      const varDecl = {
        type: 'VariableDeclaration',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'data' },
            init: {
              type: 'AwaitExpression',
              argument: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'fetchData' },
                arguments: [],
              },
            },
          },
        ],
        kind: 'const',
      }
      visitor.CallExpression(
        createTestCall('it', createAsyncArrowCallback([varDecl])),
      )
      expect(reports.length).toBe(0)
    })

    test('should report async callback with sync ternary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      const ternary = {
        type: 'ExpressionStatement',
        expression: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'flag' },
          consequent: { type: 'Literal', value: 1 },
          alternate: { type: 'Literal', value: 2 },
        },
      }
      visitor.CallExpression(
        createTestCall('it', createAsyncArrowCallback([ternary])),
      )
      expect(reports.length).toBe(1)
    })

    test('should report async callback with switch but no await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      const switchStmt = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'val' },
        cases: [
          {
            type: 'SwitchCase',
            test: { type: 'Literal', value: 'a' },
            consequent: [createExpressionStatement('handleA')],
          },
        ],
      }
      visitor.CallExpression(
        createTestCall('test', createAsyncArrowCallback([switchStmt])),
      )
      expect(reports.length).toBe(1)
    })

    test('should report async it with template literal expression but no await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      const tplExpr = {
        type: 'ExpressionStatement',
        expression: {
          type: 'TemplateLiteral',
          quasis: [{ type: 'TemplateElement', value: { raw: 'hello ', cooked: 'hello ' } }],
          expressions: [{ type: 'Identifier', name: 'name' }],
        },
      }
      visitor.CallExpression(
        createTestCall('it', createAsyncArrowCallback([tplExpr])),
      )
      expect(reports.length).toBe(1)
    })

    test('should not report async it with await deep in logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      const logicalExpr = {
        type: 'ExpressionStatement',
        expression: {
          type: 'LogicalExpression',
          operator: '&&',
          left: { type: 'Identifier', name: 'flag' },
          right: {
            type: 'AwaitExpression',
            argument: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'check' },
              arguments: [],
            },
          },
        },
      }
      visitor.CallExpression(
        createTestCall('it', createAsyncArrowCallback([logicalExpr])),
      )
      expect(reports.length).toBe(0)
    })
  })

  // =========================================================================
  // Edge cases — location and message (4 tests)
  // =========================================================================
  describe('edge cases: location and message format', () => {
    test('report should include location from callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      const cbLoc = { start: { line: 5, column: 12 }, end: { line: 5, column: 40 } }
      visitor.CallExpression(createTestCall('it', createAsyncArrowCallback([], cbLoc)))
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('report message mentions async', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('it', createAsyncArrowCallback()))
      expect(reports[0].message.toLowerCase()).toContain('async')
    })

    test('report message mentions await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('it', createAsyncArrowCallback()))
      expect(reports[0].message.toLowerCase()).toContain('await')
    })

    test('report message starts with Unexpected', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('it', createAsyncArrowCallback()))
      expect(reports[0].message).toMatch(/^Unexpected/)
    })
  })

  // =========================================================================
  // Edge cases — state isolation and multiple calls (4 tests)
  // =========================================================================
  describe('edge cases: state isolation', () => {
    test('separate visitors have separate state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUselessAsyncTestRule.create(ctx1)
      const visitor2 = noUselessAsyncTestRule.create(ctx2)

      visitor1.CallExpression(createTestCall('it', createAsyncArrowCallback()))
      visitor2.CallExpression(createTestCall('it', createSyncArrowCallback()))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)

      visitor.CallExpression(createTestCall('it', createAsyncArrowCallback()))
      visitor.CallExpression(createTestCall('test', createAsyncArrowCallback()))

      expect(reports.length).toBe(2)
    })

    test('visitor correctly handles mix of valid and invalid calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)

      visitor.CallExpression(createTestCall('it', createAsyncArrowCallback([createAwaitExpression()])))
      visitor.CallExpression(createTestCall('test', createAsyncArrowCallback()))
      visitor.CallExpression(createTestCall('beforeEach', createSyncArrowCallback()))

      expect(reports.length).toBe(1)
    })

    test('visitor handles same function called multiple times', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(createTestCall('it', createAsyncArrowCallback()))
      }

      expect(reports.length).toBe(5)
    })

    test('does not report async callback with await inside try block', () => {
      const tryBlock = {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'TryStatement',
            block: {
              type: 'BlockStatement',
              body: [{
                type: 'ExpressionStatement',
                expression: {
                  type: 'AwaitExpression',
                  argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
                },
              }],
            },
            handler: null,
            finalizer: null,
          }],
        },
      }
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('it', tryBlock))
      expect(reports.length).toBe(0)
    })

    test('does not report async callback with await inside if statement', () => {
      const ifBody = {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'IfStatement',
            test: { type: 'Literal', value: true },
            consequent: {
              type: 'BlockStatement',
              body: [{
                type: 'ExpressionStatement',
                expression: {
                  type: 'AwaitExpression',
                  argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
                },
              }],
            },
            alternate: null,
          }],
        },
      }
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('it', ifBody))
      expect(reports.length).toBe(0)
    })

    test('reports async callback with only return statement (no await)', () => {
      const returnOnly = {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ReturnStatement',
            argument: { type: 'Literal', value: 42 },
          }],
        },
      }
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('it', returnOnly))
      expect(reports.length).toBe(1)
    })

    test('reports async FunctionExpression callback without await', () => {
      const funcExpr = {
        type: 'FunctionExpression',
        async: true,
        params: [],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'syncFn' },
              arguments: [],
            },
          }],
        },
      }
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('test', funcExpr))
      expect(reports.length).toBe(1)
    })

    test('does not report async callback with for-of containing await', () => {
      const forOfBody = {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ForOfStatement',
            left: { type: 'Identifier', name: 'item' },
            right: { type: 'Identifier', name: 'items' },
            body: {
              type: 'BlockStatement',
              body: [{
                type: 'ExpressionStatement',
                expression: {
                  type: 'AwaitExpression',
                  argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'processItem' }, arguments: [] },
                },
              }],
            },
          }],
        },
      }
      const { context, reports } = createMockContext()
      const visitor = noUselessAsyncTestRule.create(context)
      visitor.CallExpression(createTestCall('it', forOfBody))
      expect(reports.length).toBe(0)
    })
  })

  // =========================================================================
  // Default export (2 tests)
  // =========================================================================
  describe('default export', () => {
    test('rule should be the default export', () => {
      expect(noUselessAsyncTestRule).toBeDefined()
      expect(noUselessAsyncTestRule.meta).toBeDefined()
      expect(noUselessAsyncTestRule.create).toBeDefined()
    })

    test('rule should have correct docs URL format', () => {
      const url = noUselessAsyncTestRule.meta.docs?.url
      expect(url).toMatch(/^https?:\/\/.+/)
      expect(url).toContain('no-useless-async-test')
    })
  })
})

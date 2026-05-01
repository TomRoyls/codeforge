import { describe, expect, test, vi } from 'vitest'
import { noAsyncSnapshotRule } from '../../../../src/rules/testing/no-async-snapshot.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  node?: unknown
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  filePath = '/src/file.test.ts',
  source = "beforeEach(async () => { expect(x).toMatchSnapshot(); });",
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({ message: descriptor.message, node: descriptor.node, loc: descriptor.loc })
    },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => source,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [{}] },
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    workspaceRoot: '/src',
  } as unknown as RuleContext
  return { context, reports }
}

// ---------------------------------------------------------------------------
// Node helpers
// ---------------------------------------------------------------------------

function createAsyncHookWithSnapshot(hookName: string, matcherName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: hookName },
    arguments: [
      {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: {
          type: 'BlockStatement',
          body: [{
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
                property: { type: 'Identifier', name: matcherName },
              },
              arguments: [],
            },
          }],
        },
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 50 } },
  }
}

function createSyncHookWithSnapshot(hookName: string, matcherName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: hookName },
    arguments: [
      {
        type: 'ArrowFunctionExpression',
        async: false,
        params: [],
        body: {
          type: 'BlockStatement',
          body: [{
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
                property: { type: 'Identifier', name: matcherName },
              },
              arguments: [],
            },
          }],
        },
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 50 } },
  }
}

function createAsyncHookNoSnapshot(hookName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: hookName },
    arguments: [
      {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'doSomething' },
              arguments: [],
            },
          }],
        },
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

// ANY expect() in async hook triggers report (due to isExpectCall check)
function createAsyncHookWithExpect(hookName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: hookName },
    arguments: [
      {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: {
          type: 'BlockStatement',
          body: [{
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
          }],
        },
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 50 } },
  }
}

function createAsyncHookWithMatcher(hookName: string, matcherName: string): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: hookName },
    arguments: [
      {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: {
          type: 'BlockStatement',
          body: [{
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
                property: { type: 'Identifier', name: matcherName },
              },
              arguments: [{ type: 'Literal', value: 1 }],
            },
          }],
        },
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
  }
}

function createNonHookCall(funcName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: funcName },
    arguments: [
      {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: {
          type: 'BlockStatement',
          body: [{
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
                property: { type: 'Identifier', name: 'toMatchSnapshot' },
              },
              arguments: [],
            },
          }],
        },
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 50 } },
  }
}

function createAsyncHookWithFunctionExpr(hookName: string, matcherName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: hookName },
    arguments: [
      {
        type: 'FunctionExpression',
        async: true,
        params: [],
        body: {
          type: 'BlockStatement',
          body: [{
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
                property: { type: 'Identifier', name: matcherName },
              },
              arguments: [],
            },
          }],
        },
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 50 } },
  }
}

function createAsyncHookWithMethodCall(hookName: string, objName: string, propName: string): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: hookName },
    arguments: [
      {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: objName },
                property: { type: 'Identifier', name: propName },
              },
              arguments: [],
            },
          }],
        },
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
  }
}

function createAsyncHookWithCall(hookName: string, calleeName: string): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: hookName },
    arguments: [
      {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: calleeName },
              arguments: [],
            },
          }],
        },
      },
    ],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
  }
}

const HOOK_NAMES = ['beforeEach', 'afterEach', 'beforeAll', 'afterAll'] as const

// ===========================================================================
// Tests
// ===========================================================================

describe('no-async-snapshot', () => {

  // -------------------------------------------------------------------------
  // Category 1: Async hooks + toMatchSnapshot — should report (4 tests)
  // -------------------------------------------------------------------------
  describe('async hook with toMatchSnapshot', () => {
    test('reports for beforeEach with async arrow and toMatchSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithSnapshot('beforeEach', 'toMatchSnapshot'))
      expect(reports).toHaveLength(1)
    })

    test('reports for afterEach with async arrow and toMatchSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithSnapshot('afterEach', 'toMatchSnapshot'))
      expect(reports).toHaveLength(1)
    })

    test('reports for beforeAll with async arrow and toMatchSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithSnapshot('beforeAll', 'toMatchSnapshot'))
      expect(reports).toHaveLength(1)
    })

    test('reports for afterAll with async arrow and toMatchSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithSnapshot('afterAll', 'toMatchSnapshot'))
      expect(reports).toHaveLength(1)
    })
  })

  // -------------------------------------------------------------------------
  // Category 2: Async hooks + toThrowErrorMatchingSnapshot — should report (4 tests)
  // -------------------------------------------------------------------------
  describe('async hook with toThrowErrorMatchingSnapshot', () => {
    test('reports for beforeEach with async arrow and toThrowErrorMatchingSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithSnapshot('beforeEach', 'toThrowErrorMatchingSnapshot'))
      expect(reports).toHaveLength(1)
    })

    test('reports for afterEach with async arrow and toThrowErrorMatchingSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithSnapshot('afterEach', 'toThrowErrorMatchingSnapshot'))
      expect(reports).toHaveLength(1)
    })

    test('reports for beforeAll with async arrow and toThrowErrorMatchingSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithSnapshot('beforeAll', 'toThrowErrorMatchingSnapshot'))
      expect(reports).toHaveLength(1)
    })

    test('reports for afterAll with async arrow and toThrowErrorMatchingSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithSnapshot('afterAll', 'toThrowErrorMatchingSnapshot'))
      expect(reports).toHaveLength(1)
    })
  })

  // -------------------------------------------------------------------------
  // Category 3: Sync hooks + toMatchSnapshot — should NOT report (4 tests)
  // -------------------------------------------------------------------------
  describe('sync hook with toMatchSnapshot', () => {
    test('does not report for sync beforeEach with toMatchSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createSyncHookWithSnapshot('beforeEach', 'toMatchSnapshot'))
      expect(reports).toHaveLength(0)
    })

    test('does not report for sync afterEach with toMatchSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createSyncHookWithSnapshot('afterEach', 'toMatchSnapshot'))
      expect(reports).toHaveLength(0)
    })

    test('does not report for sync beforeAll with toMatchSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createSyncHookWithSnapshot('beforeAll', 'toMatchSnapshot'))
      expect(reports).toHaveLength(0)
    })

    test('does not report for sync afterAll with toMatchSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createSyncHookWithSnapshot('afterAll', 'toMatchSnapshot'))
      expect(reports).toHaveLength(0)
    })
  })

  // -------------------------------------------------------------------------
  // Category 4: Sync hooks + toThrowErrorMatchingSnapshot — should NOT report (4 tests)
  // -------------------------------------------------------------------------
  describe('sync hook with toThrowErrorMatchingSnapshot', () => {
    test('does not report for sync beforeEach with toThrowErrorMatchingSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createSyncHookWithSnapshot('beforeEach', 'toThrowErrorMatchingSnapshot'))
      expect(reports).toHaveLength(0)
    })

    test('does not report for sync afterEach with toThrowErrorMatchingSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createSyncHookWithSnapshot('afterEach', 'toThrowErrorMatchingSnapshot'))
      expect(reports).toHaveLength(0)
    })

    test('does not report for sync beforeAll with toThrowErrorMatchingSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createSyncHookWithSnapshot('beforeAll', 'toThrowErrorMatchingSnapshot'))
      expect(reports).toHaveLength(0)
    })

    test('does not report for sync afterAll with toThrowErrorMatchingSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createSyncHookWithSnapshot('afterAll', 'toThrowErrorMatchingSnapshot'))
      expect(reports).toHaveLength(0)
    })
  })

  // -------------------------------------------------------------------------
  // Category 5: Async hooks with ANY expect() — should report (10 tests)
  // Due to isExpectCall, any expect() call inside async hook triggers report
  // -------------------------------------------------------------------------
  describe('async hook with any expect call', () => {
    test('reports for beforeEach async with expect().toBe()', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithExpect('beforeEach'))
      expect(reports).toHaveLength(1)
    })

    test('reports for afterEach async with expect().toBe()', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithExpect('afterEach'))
      expect(reports).toHaveLength(1)
    })

    test('reports for beforeAll async with expect().toBe()', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithExpect('beforeAll'))
      expect(reports).toHaveLength(1)
    })

    test('reports for afterAll async with expect().toBe()', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithExpect('afterAll'))
      expect(reports).toHaveLength(1)
    })

    test('reports for beforeEach async with expect().toEqual()', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithMatcher('beforeEach', 'toEqual'))
      expect(reports).toHaveLength(1)
    })

    test('reports for afterEach async with expect().toBeTruthy()', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithMatcher('afterEach', 'toBeTruthy'))
      expect(reports).toHaveLength(1)
    })

    test('reports for beforeAll async with expect().toBeFalsy()', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithMatcher('beforeAll', 'toBeFalsy'))
      expect(reports).toHaveLength(1)
    })

    test('reports for afterAll async with expect().toBeDefined()', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithMatcher('afterAll', 'toBeDefined'))
      expect(reports).toHaveLength(1)
    })

    test('reports for beforeEach async with expect().toBeNull()', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithMatcher('beforeEach', 'toBeNull'))
      expect(reports).toHaveLength(1)
    })

    test('reports for afterEach async with expect().toBeGreaterThan()', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithMatcher('afterEach', 'toBeGreaterThan'))
      expect(reports).toHaveLength(1)
    })
  })

  // -------------------------------------------------------------------------
  // Category 6: Async hooks without expect/snapshot — should NOT report (8 tests)
  // -------------------------------------------------------------------------
  describe('async hook without expect or snapshot', () => {
    test('does not report for beforeEach async with doSomething()', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookNoSnapshot('beforeEach'))
      expect(reports).toHaveLength(0)
    })

    test('does not report for afterEach async with doSomething()', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookNoSnapshot('afterEach'))
      expect(reports).toHaveLength(0)
    })

    test('does not report for beforeAll async with doSomething()', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookNoSnapshot('beforeAll'))
      expect(reports).toHaveLength(0)
    })

    test('does not report for afterAll async with doSomething()', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookNoSnapshot('afterAll'))
      expect(reports).toHaveLength(0)
    })

    test('does not report for beforeEach async with console.log()', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithMethodCall('beforeEach', 'console', 'log'))
      expect(reports).toHaveLength(0)
    })

    test('does not report for afterEach async with Promise.resolve()', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithMethodCall('afterEach', 'Promise', 'resolve'))
      expect(reports).toHaveLength(0)
    })

    test('does not report for beforeAll async with fetch()', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithCall('beforeAll', 'fetch'))
      expect(reports).toHaveLength(0)
    })

    test('does not report for afterAll async with cleanup()', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithCall('afterAll', 'cleanup'))
      expect(reports).toHaveLength(0)
    })
  })

  // -------------------------------------------------------------------------
  // Category 7: Non-hook calls — should NOT report (10 tests)
  // -------------------------------------------------------------------------
  describe('non-hook calls', () => {
    test('does not report for test() with async snapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createNonHookCall('test'))
      expect(reports).toHaveLength(0)
    })

    test('does not report for it() with async snapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createNonHookCall('it'))
      expect(reports).toHaveLength(0)
    })

    test('does not report for describe() with async snapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createNonHookCall('describe'))
      expect(reports).toHaveLength(0)
    })

    test('does not report for suite() with async snapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createNonHookCall('suite'))
      expect(reports).toHaveLength(0)
    })

    test('does not report for context() with async snapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createNonHookCall('context'))
      expect(reports).toHaveLength(0)
    })

    test('does not report for myFunction() with async snapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createNonHookCall('myFunction'))
      expect(reports).toHaveLength(0)
    })

    test('does not report for runTest() with async snapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createNonHookCall('runTest'))
      expect(reports).toHaveLength(0)
    })

    test('does not report for setup() with async snapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createNonHookCall('setup'))
      expect(reports).toHaveLength(0)
    })

    test('does not report for init() with async snapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createNonHookCall('init'))
      expect(reports).toHaveLength(0)
    })

    test('does not report for wrapper() with async snapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createNonHookCall('wrapper'))
      expect(reports).toHaveLength(0)
    })
  })

  // -------------------------------------------------------------------------
  // Category 8: FunctionExpression variants — should report (8 tests)
  // -------------------------------------------------------------------------
  describe('FunctionExpression variants', () => {
    test('reports for beforeEach with async FunctionExpression and toMatchSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithFunctionExpr('beforeEach', 'toMatchSnapshot'))
      expect(reports).toHaveLength(1)
    })

    test('reports for afterEach with async FunctionExpression and toMatchSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithFunctionExpr('afterEach', 'toMatchSnapshot'))
      expect(reports).toHaveLength(1)
    })

    test('reports for beforeAll with async FunctionExpression and toMatchSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithFunctionExpr('beforeAll', 'toMatchSnapshot'))
      expect(reports).toHaveLength(1)
    })

    test('reports for afterAll with async FunctionExpression and toMatchSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithFunctionExpr('afterAll', 'toMatchSnapshot'))
      expect(reports).toHaveLength(1)
    })

    test('reports for beforeEach with async FunctionExpression and toThrowErrorMatchingSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithFunctionExpr('beforeEach', 'toThrowErrorMatchingSnapshot'))
      expect(reports).toHaveLength(1)
    })

    test('reports for afterEach with async FunctionExpression and toThrowErrorMatchingSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithFunctionExpr('afterEach', 'toThrowErrorMatchingSnapshot'))
      expect(reports).toHaveLength(1)
    })

    test('reports for beforeAll with async FunctionExpression and toThrowErrorMatchingSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithFunctionExpr('beforeAll', 'toThrowErrorMatchingSnapshot'))
      expect(reports).toHaveLength(1)
    })

    test('reports for afterAll with async FunctionExpression and toThrowErrorMatchingSnapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithFunctionExpr('afterAll', 'toThrowErrorMatchingSnapshot'))
      expect(reports).toHaveLength(1)
    })
  })

  // -------------------------------------------------------------------------
  // Category 9: Error message format (4 tests)
  // -------------------------------------------------------------------------
  describe('error message format', () => {
    test('message includes beforeEach for beforeEach hook', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithSnapshot('beforeEach', 'toMatchSnapshot'))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain("Async 'beforeEach' hook")
    })

    test('message includes afterEach for afterEach hook', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithSnapshot('afterEach', 'toMatchSnapshot'))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain("Async 'afterEach' hook")
    })

    test('message includes beforeAll for beforeAll hook', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithSnapshot('beforeAll', 'toMatchSnapshot'))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain("Async 'beforeAll' hook")
    })

    test('message includes afterAll for afterAll hook', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithSnapshot('afterAll', 'toMatchSnapshot'))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toContain("Async 'afterAll' hook")
    })
  })

  // -------------------------------------------------------------------------
  // Category 10: Edge cases (19 tests)
  // -------------------------------------------------------------------------
  describe('edge cases', () => {
    test('does not report when hook has no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does not report when node is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(null)
      expect(reports).toHaveLength(0)
    })

    test('does not report for non-CallExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo' })
      expect(reports).toHaveLength(0)
    })

    test('does not report when async property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [{
          type: 'ArrowFunctionExpression',
          params: [],
          body: {
            type: 'BlockStatement',
            body: [{
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
                  property: { type: 'Identifier', name: 'toMatchSnapshot' },
                },
                arguments: [],
              },
            }],
          },
        }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does not report when async is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [{
          type: 'ArrowFunctionExpression',
          async: null,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does not report for async hook with empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [{
          type: 'ArrowFunctionExpression',
          async: true,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('reports when multiple args and last is async callback with snapshot', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [
          { type: 'Literal', value: 'description' },
          {
            type: 'ArrowFunctionExpression',
            async: true,
            params: [],
            body: {
              type: 'BlockStatement',
              body: [{
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
                    property: { type: 'Identifier', name: 'toMatchSnapshot' },
                  },
                  arguments: [],
                },
              }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
      })
      expect(reports).toHaveLength(1)
    })

    test('does not report when multiple args and last is not a function', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [
          { type: 'Literal', value: 'timeout' },
          { type: 'Literal', value: 5000 },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('reports for MemberExpression callee with hook root name (beforeEach.skip)', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'beforeEach' },
          property: { type: 'Identifier', name: 'skip' },
        },
        arguments: [{
          type: 'ArrowFunctionExpression',
          async: true,
          params: [],
          body: {
            type: 'BlockStatement',
            body: [{
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
                  property: { type: 'Identifier', name: 'toMatchSnapshot' },
                },
                arguments: [],
              },
            }],
          },
        }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      })
      expect(reports).toHaveLength(1)
    })

    test('does not report for MemberExpression callee with non-hook root name', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'someObj' },
          property: { type: 'Identifier', name: 'beforeEach' },
        },
        arguments: [{
          type: 'ArrowFunctionExpression',
          async: true,
          params: [],
          body: {
            type: 'BlockStatement',
            body: [{
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
                  property: { type: 'Identifier', name: 'toMatchSnapshot' },
                },
                arguments: [],
              },
            }],
          },
        }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('reports with 3 args: description, timeout, async callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [
          { type: 'Literal', value: 'setup' },
          { type: 'Literal', value: 5000 },
          {
            type: 'ArrowFunctionExpression',
            async: true,
            params: [],
            body: {
              type: 'BlockStatement',
              body: [{
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
                    property: { type: 'Identifier', name: 'toMatchSnapshot' },
                  },
                  arguments: [],
                },
              }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 70 } },
      })
      expect(reports).toHaveLength(1)
    })

    test('report includes the node reference', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      const node = createAsyncHookWithSnapshot('beforeEach', 'toMatchSnapshot', 5, 10)
      visitor.CallExpression(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].node).toBe(node)
    })

    test('report includes correct loc from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithSnapshot('beforeEach', 'toMatchSnapshot', 7, 15))
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('reports when async hook has expect inside nested function declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [{
          type: 'ArrowFunctionExpression',
          async: true,
          params: [],
          body: {
            type: 'BlockStatement',
            body: [{
              type: 'FunctionDeclaration',
              id: { type: 'Identifier', name: 'inner' },
              params: [],
              body: {
                type: 'BlockStatement',
                body: [{
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'expect' },
                    arguments: [{ type: 'Identifier', name: 'x' }],
                  },
                }],
              },
            }],
          },
        }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
      })
      expect(reports).toHaveLength(1)
    })

    test('does not report when callback type is not function (Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [{ type: 'Identifier', name: 'someCallback' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does not report when callback is an ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [{ type: 'ObjectExpression', properties: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does not report when callback is a string Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [{ type: 'Literal', value: 'just a string' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does not report when callback is a numeric Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(undefined)
      expect(reports).toHaveLength(0)
    })
  })

  // -------------------------------------------------------------------------
  // Category 11: Different positions (10 tests)
  // -------------------------------------------------------------------------
  describe('different source positions', () => {
    test('reports correct position for beforeEach at line 5, column 10', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithSnapshot('beforeEach', 'toMatchSnapshot', 5, 10))
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('reports correct position for afterEach at line 1, column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithSnapshot('afterEach', 'toMatchSnapshot', 1, 0))
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports correct position for beforeAll at line 100, column 50', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithSnapshot('beforeAll', 'toMatchSnapshot', 100, 50))
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('reports correct position for afterAll at line 10, column 5', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithSnapshot('afterAll', 'toMatchSnapshot', 10, 5))
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('reports correct position for beforeEach at line 1, column 100', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithSnapshot('beforeEach', 'toMatchSnapshot', 1, 100))
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.column).toBe(100)
    })

    test('reports correct position for afterEach at line 42, column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithSnapshot('afterEach', 'toMatchSnapshot', 42, 0))
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(42)
    })

    test('reports correct position for beforeAll at line 999, column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithSnapshot('beforeAll', 'toMatchSnapshot', 999, 0))
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(999)
    })

    test('reports correct position for afterAll at line 0, column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithSnapshot('afterAll', 'toMatchSnapshot', 0, 0))
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports correct position for beforeEach at line 3, column 8', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithSnapshot('beforeEach', 'toMatchSnapshot', 3, 8))
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('reports correct position for afterEach at line 7, column 12', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithSnapshot('afterEach', 'toMatchSnapshot', 7, 12))
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(12)
    })
  })

  // -------------------------------------------------------------------------
  // Category 12: Additional coverage (10 tests)
  // -------------------------------------------------------------------------
  describe('additional coverage', () => {
    test('reports for async hook with expect().not.toBe()', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [{
          type: 'ArrowFunctionExpression',
          async: true,
          params: [],
          body: {
            type: 'BlockStatement',
            body: [{
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
                  property: { type: 'Identifier', name: 'toBe' },
                },
                arguments: [{ type: 'Literal', value: 1 }],
              },
            }],
          },
        }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
      })
      expect(reports).toHaveLength(1)
    })

    test('reports for async hook with expect().resolves.toBe()', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [{
          type: 'ArrowFunctionExpression',
          async: true,
          params: [],
          body: {
            type: 'BlockStatement',
            body: [{
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
                      property: { type: 'Identifier', name: 'resolves' },
                    },
                    arguments: [],
                  },
                  property: { type: 'Identifier', name: 'toBe' },
                },
                arguments: [{ type: 'Literal', value: 1 }],
              },
            }],
          },
        }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
      })
      expect(reports).toHaveLength(1)
    })

    test('reports for async hook with snapshot in nested object property', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [{
          type: 'ArrowFunctionExpression',
          async: true,
          params: [],
          body: {
            type: 'BlockStatement',
            body: [{
              type: 'VariableDeclaration',
              declarations: [{
                type: 'VariableDeclarator',
                id: { type: 'Identifier', name: 'obj' },
                init: {
                  type: 'ObjectExpression',
                  properties: [{
                    type: 'Property',
                    key: { type: 'Identifier', name: 'fn' },
                    value: {
                      type: 'ArrowFunctionExpression',
                      async: false,
                      params: [],
                      body: {
                        type: 'BlockStatement',
                        body: [{
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
                              property: { type: 'Identifier', name: 'toMatchSnapshot' },
                            },
                            arguments: [],
                          },
                        }],
                      },
                    },
                  }],
                },
              }],
            }],
          },
        }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 80 } },
      })
      expect(reports).toHaveLength(1)
    })

    test('does not report for async hook with only params, no snapshot in body', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [{
          type: 'ArrowFunctionExpression',
          async: true,
          params: [{ type: 'Identifier', name: 'done' }],
          body: { type: 'BlockStatement', body: [] },
        }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      })
      expect(reports).toHaveLength(0)
    })

    test('reports for async hook with snapshot in variable declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [{
          type: 'ArrowFunctionExpression',
          async: true,
          params: [],
          body: {
            type: 'BlockStatement',
            body: [{
              type: 'VariableDeclaration',
              declarations: [{
                type: 'VariableDeclarator',
                id: { type: 'Identifier', name: 'result' },
                init: {
                  type: 'CallExpression',
                  callee: {
                    type: 'MemberExpression',
                    object: {
                      type: 'CallExpression',
                      callee: { type: 'Identifier', name: 'expect' },
                      arguments: [{ type: 'Identifier', name: 'x' }],
                    },
                    property: { type: 'Identifier', name: 'toMatchSnapshot' },
                  },
                  arguments: [],
                },
              }],
            }],
          },
        }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 60 } },
      })
      expect(reports).toHaveLength(1)
    })

    test('rule meta category is testing', () => {
      expect(noAsyncSnapshotRule.meta.docs?.category).toBe('testing')
    })

    test('rule meta severity is warn', () => {
      expect(noAsyncSnapshotRule.meta.severity).toBe('warn')
    })

    test('rule meta type is suggestion', () => {
      expect(noAsyncSnapshotRule.meta.type).toBe('suggestion')
    })

    test('rule creates visitor with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('full error message matches expected format', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncSnapshotRule.create(context)
      visitor.CallExpression(createAsyncHookWithSnapshot('beforeEach', 'toMatchSnapshot'))
      expect(reports).toHaveLength(1)
      expect(reports[0].message).toBe(
        "Async 'beforeEach' hook contains snapshot matchers which can lead to unreliable tests. Use synchronous hooks for snapshot testing.",
      )
    })
  })
})

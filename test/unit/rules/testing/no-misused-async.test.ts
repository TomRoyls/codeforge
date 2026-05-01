import { describe, expect, test, vi } from 'vitest'
import { noMisusedAsyncRule } from '../../../../src/rules/testing/no-misused-async.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  node?: unknown
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  filePath = '/src/file.test.ts',
  source = "test('foo', async () => { expect(1).toBe(1); });",
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

function createAsyncCallbackWithoutAwait(bodyItems: unknown[] = []): unknown {
  return {
    type: 'ArrowFunctionExpression',
    async: true,
    params: [],
    body: { type: 'BlockStatement', body: bodyItems },
  }
}

function createAsyncCallbackWithAwait(): unknown {
  return {
    type: 'ArrowFunctionExpression',
    async: true,
    params: [],
    body: {
      type: 'BlockStatement',
      body: [{
        type: 'ExpressionStatement',
        expression: {
          type: 'AwaitExpression',
          argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        },
      }],
    },
  }
}

function createSyncCallback(bodyItems: unknown[] = []): unknown {
  return {
    type: 'ArrowFunctionExpression',
    async: false,
    params: [],
    body: { type: 'BlockStatement', body: bodyItems },
  }
}

function createTestCall(funcName: string, callback: unknown, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: funcName },
    arguments: [{ type: 'StringLiteral', value: 'test name' }, callback],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createExpectStatement(): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'expect' }, arguments: [{ type: 'Identifier', name: 'x' }] },
        property: { type: 'Identifier', name: 'toBe' },
      },
      arguments: [{ type: 'Literal', value: 1 }],
    },
  }
}

function createNonTestCall(funcName: string, callback: unknown, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: funcName },
    arguments: [callback],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

describe('no-misused-async', () => {
  // ============================================================================
  // Category 1: Async test/it without await - reports (10 tests)
  // ============================================================================
  test('reports async test() with no await', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('test', createAsyncCallbackWithoutAwait()))
    expect(reports).toHaveLength(1)
  })

  test('reports async it() with no await', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('it', createAsyncCallbackWithoutAwait()))
    expect(reports).toHaveLength(1)
  })

  test('reports async test() with expect statements but no await', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('test', createAsyncCallbackWithoutAwait([createExpectStatement()])))
    expect(reports).toHaveLength(1)
  })

  test('reports async it() with expect statements but no await', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('it', createAsyncCallbackWithoutAwait([createExpectStatement()])))
    expect(reports).toHaveLength(1)
  })

  test('reports async test() with multiple statements but no await', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('test', createAsyncCallbackWithoutAwait([createExpectStatement(), createExpectStatement()])))
    expect(reports).toHaveLength(1)
  })

  test('reports async it() with multiple statements but no await', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('it', createAsyncCallbackWithoutAwait([createExpectStatement(), createExpectStatement()])))
    expect(reports).toHaveLength(1)
  })

  test('reports async test() with empty body', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('test', createAsyncCallbackWithoutAwait([])))
    expect(reports).toHaveLength(1)
  })

  test('reports async it() with empty body', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('it', createAsyncCallbackWithoutAwait([])))
    expect(reports).toHaveLength(1)
  })

  test('reports async test() callback with variable declaration but no await', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    const varDecl = {
      type: 'VariableDeclaration',
      declarations: [{
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: { type: 'Literal', value: 42 },
      }],
    }
    visitor.CallExpression(createTestCall('test', createAsyncCallbackWithoutAwait([varDecl])))
    expect(reports).toHaveLength(1)
  })

  test('reports async it() callback with return statement but no await', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    const returnStmt = {
      type: 'ReturnStatement',
      argument: { type: 'Literal', value: 42 },
    }
    visitor.CallExpression(createTestCall('it', createAsyncCallbackWithoutAwait([returnStmt])))
    expect(reports).toHaveLength(1)
  })

  // ============================================================================
  // Category 2: Async hooks without await - reports (8 tests)
  // ============================================================================
  test('reports async beforeEach() with no await', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('beforeEach', createAsyncCallbackWithoutAwait()))
    expect(reports).toHaveLength(1)
  })

  test('reports async afterEach() with no await', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('afterEach', createAsyncCallbackWithoutAwait()))
    expect(reports).toHaveLength(1)
  })

  test('reports async beforeAll() with no await', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('beforeAll', createAsyncCallbackWithoutAwait()))
    expect(reports).toHaveLength(1)
  })

  test('reports async afterAll() with no await', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('afterAll', createAsyncCallbackWithoutAwait()))
    expect(reports).toHaveLength(1)
  })

  test('reports async beforeEach() with expect but no await', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('beforeEach', createAsyncCallbackWithoutAwait([createExpectStatement()])))
    expect(reports).toHaveLength(1)
  })

  test('reports async afterEach() with expect but no await', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('afterEach', createAsyncCallbackWithoutAwait([createExpectStatement()])))
    expect(reports).toHaveLength(1)
  })

  test('reports async beforeAll() with empty body', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('beforeAll', createAsyncCallbackWithoutAwait([])))
    expect(reports).toHaveLength(1)
  })

  test('reports async afterAll() with empty body', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('afterAll', createAsyncCallbackWithoutAwait([])))
    expect(reports).toHaveLength(1)
  })

  // ============================================================================
  // Category 3: Async test/it with await - no report (8 tests)
  // ============================================================================
  test('does not report async test() with await', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('test', createAsyncCallbackWithAwait()))
    expect(reports).toHaveLength(0)
  })

  test('does not report async it() with await', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('it', createAsyncCallbackWithAwait()))
    expect(reports).toHaveLength(0)
  })

  test('does not report async test() with await and other statements', () => {
    const callback = createAsyncCallbackWithoutAwait([
      createExpectStatement(),
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'AwaitExpression',
          argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        },
      },
    ])
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('test', callback))
    expect(reports).toHaveLength(0)
  })

  test('does not report async it() with await and other statements', () => {
    const callback = createAsyncCallbackWithoutAwait([
      createExpectStatement(),
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'AwaitExpression',
          argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        },
      },
    ])
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('it', callback))
    expect(reports).toHaveLength(0)
  })

  test('does not report async test() with await as only statement', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('test', createAsyncCallbackWithAwait()))
    expect(reports).toHaveLength(0)
  })

  test('does not report async it() with await as only statement', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('it', createAsyncCallbackWithAwait()))
    expect(reports).toHaveLength(0)
  })

  test('does not report async test() with await inside if statement', () => {
    const callback = createAsyncCallbackWithoutAwait([{
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
    }])
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('test', callback))
    expect(reports).toHaveLength(0)
  })

  test('does not report async it() with await inside try-catch', () => {
    const callback = createAsyncCallbackWithoutAwait([{
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
      handler: {
        type: 'CatchClause',
        body: { type: 'BlockStatement', body: [] },
      },
    }])
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('it', callback))
    expect(reports).toHaveLength(0)
  })

  // ============================================================================
  // Category 4: Async hooks with await - no report (8 tests)
  // ============================================================================
  test('does not report async beforeEach() with await', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('beforeEach', createAsyncCallbackWithAwait()))
    expect(reports).toHaveLength(0)
  })

  test('does not report async afterEach() with await', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('afterEach', createAsyncCallbackWithAwait()))
    expect(reports).toHaveLength(0)
  })

  test('does not report async beforeAll() with await', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('beforeAll', createAsyncCallbackWithAwait()))
    expect(reports).toHaveLength(0)
  })

  test('does not report async afterAll() with await', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('afterAll', createAsyncCallbackWithAwait()))
    expect(reports).toHaveLength(0)
  })

  test('does not report async beforeEach() with await and expect statements', () => {
    const callback = createAsyncCallbackWithoutAwait([
      createExpectStatement(),
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'AwaitExpression',
          argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        },
      },
    ])
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('beforeEach', callback))
    expect(reports).toHaveLength(0)
  })

  test('does not report async afterEach() with await and expect statements', () => {
    const callback = createAsyncCallbackWithoutAwait([
      createExpectStatement(),
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'AwaitExpression',
          argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        },
      },
    ])
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('afterEach', callback))
    expect(reports).toHaveLength(0)
  })

  test('does not report async beforeAll() with await inside nested call', () => {
    const callback = createAsyncCallbackWithoutAwait([{
      type: 'ExpressionStatement',
      expression: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'wrapper' },
        arguments: [{
          type: 'ArrowFunctionExpression',
          params: [],
          body: {
            type: 'BlockStatement',
            body: [{
              type: 'ExpressionStatement',
              expression: {
                type: 'AwaitExpression',
                argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
              },
            }],
          },
        }],
      },
    }])
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('beforeAll', callback))
    expect(reports).toHaveLength(0)
  })

  test('does not report async afterAll() with await in assignment', () => {
    const callback = createAsyncCallbackWithoutAwait([{
      type: 'VariableDeclaration',
      declarations: [{
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'result' },
        init: {
          type: 'AwaitExpression',
          argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        },
      }],
    }])
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('afterAll', callback))
    expect(reports).toHaveLength(0)
  })

  // ============================================================================
  // Category 5: Sync callbacks - no report (8 tests)
  // ============================================================================
  test('does not report sync test() callback', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('test', createSyncCallback()))
    expect(reports).toHaveLength(0)
  })

  test('does not report sync it() callback', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('it', createSyncCallback()))
    expect(reports).toHaveLength(0)
  })

  test('does not report sync beforeEach() callback', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('beforeEach', createSyncCallback()))
    expect(reports).toHaveLength(0)
  })

  test('does not report sync afterEach() callback', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('afterEach', createSyncCallback()))
    expect(reports).toHaveLength(0)
  })

  test('does not report sync beforeAll() callback', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('beforeAll', createSyncCallback()))
    expect(reports).toHaveLength(0)
  })

  test('does not report sync afterAll() callback', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('afterAll', createSyncCallback()))
    expect(reports).toHaveLength(0)
  })

  test('does not report sync test() with expect statements', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('test', createSyncCallback([createExpectStatement()])))
    expect(reports).toHaveLength(0)
  })

  test('does not report sync describe() callback', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('describe', createSyncCallback()))
    expect(reports).toHaveLength(0)
  })

  // ============================================================================
  // Category 6: Non-test/hook calls - no report (8 tests)
  // ============================================================================
  test('does not report async myFunc() callback', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createNonTestCall('myFunc', createAsyncCallbackWithoutAwait()))
    expect(reports).toHaveLength(0)
  })

  test('does not report async otherFunction() callback', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createNonTestCall('otherFunction', createAsyncCallbackWithoutAwait()))
    expect(reports).toHaveLength(0)
  })

  test('does not report async setTimeout() callback', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createNonTestCall('setTimeout', createAsyncCallbackWithoutAwait()))
    expect(reports).toHaveLength(0)
  })

  test('does not report async someHelper() callback', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createNonTestCall('someHelper', createAsyncCallbackWithoutAwait()))
    expect(reports).toHaveLength(0)
  })

  test('does not report async wrapper() callback', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createNonTestCall('wrapper', createAsyncCallbackWithoutAwait()))
    expect(reports).toHaveLength(0)
  })

  test('does not report async runTest() callback', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createNonTestCall('runTest', createAsyncCallbackWithoutAwait()))
    expect(reports).toHaveLength(0)
  })

  test('does not report async callback() callback', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createNonTestCall('callback', createAsyncCallbackWithoutAwait()))
    expect(reports).toHaveLength(0)
  })

  test('does not report async process() callback', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createNonTestCall('process', createAsyncCallbackWithoutAwait()))
    expect(reports).toHaveLength(0)
  })

  // ============================================================================
  // Category 7: Nested await expressions (8 tests)
  // ============================================================================
  test('detects await nested inside CallExpression argument', () => {
    const callback = createAsyncCallbackWithoutAwait([{
      type: 'ExpressionStatement',
      expression: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'wrapper' },
        arguments: [{
          type: 'AwaitExpression',
          argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        }],
      },
    }])
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('test', callback))
    expect(reports).toHaveLength(0)
  })

  test('detects await nested inside MemberExpression object', () => {
    const callback = createAsyncCallbackWithoutAwait([{
      type: 'ExpressionStatement',
      expression: {
        type: 'MemberExpression',
        object: {
          type: 'AwaitExpression',
          argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        },
        property: { type: 'Identifier', name: 'prop' },
      },
    }])
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('test', callback))
    expect(reports).toHaveLength(0)
  })

  test('detects await nested inside array element', () => {
    const callback = createAsyncCallbackWithoutAwait([{
      type: 'ExpressionStatement',
      expression: {
        type: 'ArrayExpression',
        elements: [{
          type: 'AwaitExpression',
          argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        }],
      },
    }])
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('test', callback))
    expect(reports).toHaveLength(0)
  })

  test('detects await nested inside BinaryExpression left', () => {
    const callback = createAsyncCallbackWithoutAwait([{
      type: 'ExpressionStatement',
      expression: {
        type: 'BinaryExpression',
        operator: '+',
        left: {
          type: 'AwaitExpression',
          argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        },
        right: { type: 'Literal', value: 1 },
      },
    }])
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('it', callback))
    expect(reports).toHaveLength(0)
  })

  test('reports when nested structure has no await', () => {
    const callback = createAsyncCallbackWithoutAwait([{
      type: 'ExpressionStatement',
      expression: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'wrapper' },
        arguments: [{ type: 'Literal', value: 42 }],
      },
    }])
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('test', callback))
    expect(reports).toHaveLength(1)
  })

  test('detects await nested inside ConditionalExpression consequent', () => {
    const callback = createAsyncCallbackWithoutAwait([{
      type: 'ExpressionStatement',
      expression: {
        type: 'ConditionalExpression',
        test: { type: 'Literal', value: true },
        consequent: {
          type: 'AwaitExpression',
          argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        },
        alternate: { type: 'Literal', value: 0 },
      },
    }])
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('test', callback))
    expect(reports).toHaveLength(0)
  })

  test('detects await nested inside object property value', () => {
    const callback = createAsyncCallbackWithoutAwait([{
      type: 'ExpressionStatement',
      expression: {
        type: 'ObjectExpression',
        properties: [{
          type: 'Property',
          key: { type: 'Identifier', name: 'val' },
          value: {
            type: 'AwaitExpression',
            argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
          },
        }],
      },
    }])
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('it', callback))
    expect(reports).toHaveLength(0)
  })

  test('reports async callback with deep nesting but no await', () => {
    const callback = createAsyncCallbackWithoutAwait([{
      type: 'ExpressionStatement',
      expression: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'wrapper' },
            arguments: [{ type: 'Literal', value: 1 }],
          },
          property: { type: 'Identifier', name: 'method' },
        },
        arguments: [],
      },
    }])
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('test', callback))
    expect(reports).toHaveLength(1)
  })

  // ============================================================================
  // Category 8: Error message format (8 tests)
  // ============================================================================
  test('error message contains "test" for test()', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('test', createAsyncCallbackWithoutAwait()))
    expect(reports[0].message).toBe("Async 'test' callback has no await expressions. Remove the async keyword or add await.")
  })

  test('error message contains "it" for it()', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('it', createAsyncCallbackWithoutAwait()))
    expect(reports[0].message).toBe("Async 'it' callback has no await expressions. Remove the async keyword or add await.")
  })

  test('error message contains "beforeEach" for beforeEach()', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('beforeEach', createAsyncCallbackWithoutAwait()))
    expect(reports[0].message).toBe("Async 'beforeEach' callback has no await expressions. Remove the async keyword or add await.")
  })

  test('error message contains "afterEach" for afterEach()', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('afterEach', createAsyncCallbackWithoutAwait()))
    expect(reports[0].message).toBe("Async 'afterEach' callback has no await expressions. Remove the async keyword or add await.")
  })

  test('error message contains "beforeAll" for beforeAll()', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('beforeAll', createAsyncCallbackWithoutAwait()))
    expect(reports[0].message).toBe("Async 'beforeAll' callback has no await expressions. Remove the async keyword or add await.")
  })

  test('error message contains "afterAll" for afterAll()', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('afterAll', createAsyncCallbackWithoutAwait()))
    expect(reports[0].message).toBe("Async 'afterAll' callback has no await expressions. Remove the async keyword or add await.")
  })

  test('error message contains "describe" for describe()', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('describe', createAsyncCallbackWithoutAwait()))
    expect(reports).toHaveLength(0)
  })

  test('error message format is consistent across all function types', () => {
    const funcNames = ['test', 'it', 'beforeEach', 'afterEach', 'beforeAll', 'afterAll']
    for (const funcName of funcNames) {
      const { context, reports } = createMockContext()
      const visitor = noMisusedAsyncRule.create(context)
      visitor.CallExpression(createTestCall(funcName, createAsyncCallbackWithoutAwait()))
      expect(reports[0].message).toContain(`Async '${funcName}'`)
      expect(reports[0].message).toContain('no await expressions')
      expect(reports[0].message).toContain('Remove the async keyword or add await.')
    }
  })

  // ============================================================================
  // Category 9: Edge cases (10 tests)
  // ============================================================================
  test('does not crash on node with no arguments', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'test' },
      arguments: [],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('does not crash on null node', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(null)
    expect(reports).toHaveLength(0)
  })

  test('does not crash on undefined node', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(undefined)
    expect(reports).toHaveLength(0)
  })

  test('handles FunctionExpression async callback without await', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    const fnExprCallback = {
      type: 'FunctionExpression',
      async: true,
      params: [],
      body: { type: 'BlockStatement', body: [createExpectStatement()] },
    }
    visitor.CallExpression(createTestCall('test', fnExprCallback))
    expect(reports).toHaveLength(1)
  })

  test('handles FunctionExpression async callback with await', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    const fnExprCallback = {
      type: 'FunctionExpression',
      async: true,
      params: [],
      body: {
        type: 'BlockStatement',
        body: [{
          type: 'ExpressionStatement',
          expression: {
            type: 'AwaitExpression',
            argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
          },
        }],
      },
    }
    visitor.CallExpression(createTestCall('test', fnExprCallback))
    expect(reports).toHaveLength(0)
  })

  test('does not report for non-CallExpression node type', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression({
      type: 'ExpressionStatement',
      expression: { type: 'Literal', value: 42 },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('handles async callback with empty body', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    const emptyBodyCallback = {
      type: 'ArrowFunctionExpression',
      async: true,
      params: [],
      body: { type: 'BlockStatement', body: [] },
    }
    visitor.CallExpression(createTestCall('test', emptyBodyCallback))
    expect(reports).toHaveLength(1)
  })

  test('handles callback that is not a function expression (string)', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'test' },
      arguments: [{ type: 'StringLiteral', value: 'test name' }, { type: 'Literal', value: 42 }],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    })
    expect(reports).toHaveLength(0)
  })

  test('handles MemberExpression callee with test function name', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'test' },
        property: { type: 'Identifier', name: 'only' },
      },
      arguments: [{ type: 'StringLiteral', value: 'test name' }, createAsyncCallbackWithoutAwait()],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
    })
    expect(reports).toHaveLength(1)
  })

  test('does not crash on node with arguments containing null', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'test' },
      arguments: [{ type: 'StringLiteral', value: 'test name' }, null],
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    })
    expect(reports).toHaveLength(0)
  })

  // ============================================================================
  // Category 10: Multiple awaits (8 tests)
  // ============================================================================
  test('does not report async test() with multiple awaits', () => {
    const awaitStmt = {
      type: 'ExpressionStatement',
      expression: {
        type: 'AwaitExpression',
        argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
      },
    }
    const callback = createAsyncCallbackWithoutAwait([awaitStmt, createExpectStatement(), awaitStmt])
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('test', callback))
    expect(reports).toHaveLength(0)
  })

  test('does not report async it() with multiple awaits', () => {
    const awaitStmt = {
      type: 'ExpressionStatement',
      expression: {
        type: 'AwaitExpression',
        argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
      },
    }
    const callback = createAsyncCallbackWithoutAwait([awaitStmt, awaitStmt])
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('it', callback))
    expect(reports).toHaveLength(0)
  })

  test('does not report async beforeEach() with multiple awaits', () => {
    const awaitStmt = {
      type: 'ExpressionStatement',
      expression: {
        type: 'AwaitExpression',
        argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
      },
    }
    const callback = createAsyncCallbackWithoutAwait([awaitStmt, awaitStmt, createExpectStatement()])
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('beforeEach', callback))
    expect(reports).toHaveLength(0)
  })

  test('does not report async afterEach() with multiple awaits', () => {
    const awaitStmt = {
      type: 'ExpressionStatement',
      expression: {
        type: 'AwaitExpression',
        argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
      },
    }
    const callback = createAsyncCallbackWithoutAwait([createExpectStatement(), awaitStmt, awaitStmt])
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('afterEach', callback))
    expect(reports).toHaveLength(0)
  })

  test('does not report async beforeAll() with three awaits', () => {
    const awaitStmt = {
      type: 'ExpressionStatement',
      expression: {
        type: 'AwaitExpression',
        argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
      },
    }
    const callback = createAsyncCallbackWithoutAwait([awaitStmt, awaitStmt, awaitStmt])
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('beforeAll', callback))
    expect(reports).toHaveLength(0)
  })

  test('does not report async afterAll() with three awaits', () => {
    const awaitStmt = {
      type: 'ExpressionStatement',
      expression: {
        type: 'AwaitExpression',
        argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
      },
    }
    const callback = createAsyncCallbackWithoutAwait([awaitStmt, awaitStmt, awaitStmt])
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('afterAll', callback))
    expect(reports).toHaveLength(0)
  })

  test('reports async test() with multiple statements but no await', () => {
    const callback = createAsyncCallbackWithoutAwait([
      createExpectStatement(),
      createExpectStatement(),
      createExpectStatement(),
    ])
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('test', callback))
    expect(reports).toHaveLength(1)
  })

  test('reports async it() with multiple expect chains but no await', () => {
    const callback = createAsyncCallbackWithoutAwait([
      createExpectStatement(),
      createExpectStatement(),
      createExpectStatement(),
      createExpectStatement(),
    ])
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('it', callback))
    expect(reports).toHaveLength(1)
  })

  // ============================================================================
  // Category 11: Different positions (13 tests)
  // ============================================================================
  test('reports async test() at line 1, column 0', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('test', createAsyncCallbackWithoutAwait(), 1, 0))
    expect(reports).toHaveLength(1)
    expect(reports[0].loc?.start.line).toBe(1)
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('reports async test() at line 5, column 10', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('test', createAsyncCallbackWithoutAwait(), 5, 10))
    expect(reports).toHaveLength(1)
    expect(reports[0].loc?.start.line).toBe(5)
    expect(reports[0].loc?.start.column).toBe(10)
  })

  test('reports async it() at line 10, column 0', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('it', createAsyncCallbackWithoutAwait(), 10, 0))
    expect(reports).toHaveLength(1)
    expect(reports[0].loc?.start.line).toBe(10)
  })

  test('reports async beforeEach() at line 20, column 4', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('beforeEach', createAsyncCallbackWithoutAwait(), 20, 4))
    expect(reports).toHaveLength(1)
    expect(reports[0].loc?.start.line).toBe(20)
    expect(reports[0].loc?.start.column).toBe(4)
  })

  test('reports async afterEach() at line 1, column 20', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('afterEach', createAsyncCallbackWithoutAwait(), 1, 20))
    expect(reports).toHaveLength(1)
    expect(reports[0].loc?.start.column).toBe(20)
  })

  test('reports async beforeAll() at line 100, column 0', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('beforeAll', createAsyncCallbackWithoutAwait(), 100, 0))
    expect(reports).toHaveLength(1)
    expect(reports[0].loc?.start.line).toBe(100)
  })

  test('reports async afterAll() at line 50, column 8', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('afterAll', createAsyncCallbackWithoutAwait(), 50, 8))
    expect(reports).toHaveLength(1)
    expect(reports[0].loc?.start.line).toBe(50)
    expect(reports[0].loc?.start.column).toBe(8)
  })

  test('reports multiple async test() calls independently', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('test', createAsyncCallbackWithoutAwait(), 1, 0))
    visitor.CallExpression(createTestCall('test', createAsyncCallbackWithoutAwait(), 5, 0))
    expect(reports).toHaveLength(2)
  })

  test('reports async test() but not async test() with await', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression(createTestCall('test', createAsyncCallbackWithoutAwait(), 1, 0))
    visitor.CallExpression(createTestCall('test', createAsyncCallbackWithAwait(), 2, 0))
    expect(reports).toHaveLength(1)
    expect(reports[0].loc?.start.line).toBe(1)
  })

  test('handles test.only with MemberExpression callee at specific position', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'test' },
        property: { type: 'Identifier', name: 'skip' },
      },
      arguments: [{ type: 'StringLiteral', value: 'test name' }, createAsyncCallbackWithoutAwait()],
      loc: { start: { line: 7, column: 4 }, end: { line: 7, column: 50 } },
    })
    expect(reports).toHaveLength(1)
    expect(reports[0].loc?.start.line).toBe(7)
  })

  test('loc defaults correctly when node has no loc', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisusedAsyncRule.create(context)
    visitor.CallExpression({
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'test' },
      arguments: [{ type: 'StringLiteral', value: 'test name' }, createAsyncCallbackWithoutAwait()],
    })
    expect(reports).toHaveLength(1)
    expect(reports[0].loc?.start.line).toBe(1)
    expect(reports[0].loc?.start.column).toBe(0)
  })
})

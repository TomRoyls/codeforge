import { describe, expect, test, vi } from 'vitest'
import { noMisplacedHookRule } from '../../../../src/rules/testing/no-misplaced-hook.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  node?: unknown
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  filePath = '/src/file.test.ts',
  source = 'beforeEach(() => {});',
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

function createHookCallNode(hookName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: hookName },
    arguments: [{ type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } }],
    loc: { start: { line, column }, end: { line, column: column + hookName.length + 10 } },
  }
}

function createDescribeCallNode(describeName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: describeName },
    arguments: [
      { type: 'Literal', value: 'test suite' },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function createMemberDescribeCallNode(describeName: string, method: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: describeName },
      property: { type: 'Identifier', name: method },
    },
    arguments: [
      { type: 'Literal', value: 'test suite' },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] } },
    ],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createNonCallNode(): unknown {
  return {
    type: 'ExpressionStatement',
    expression: { type: 'Literal', value: 42 },
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
  }
}

function createOtherCallNode(funcName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: funcName },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + funcName.length + 2 } },
  }
}

describe('no-misplaced-hook', () => {
  // ============================================================================
  // Category 1: Basic hook detection (20 tests)
  // ============================================================================
  test('reports beforeEach at top level (depth 0)', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('beforeEach'))
    expect(reports).toHaveLength(1)
  })

  test('reports afterEach at top level (depth 0)', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('afterEach'))
    expect(reports).toHaveLength(1)
  })

  test('reports beforeAll at top level (depth 0)', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('beforeAll'))
    expect(reports).toHaveLength(1)
  })

  test('reports afterAll at top level (depth 0)', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('afterAll'))
    expect(reports).toHaveLength(1)
  })

  test('reports multiple beforeEach calls at top level', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('beforeEach', 1, 0))
    visitor.CallExpression(createHookCallNode('beforeEach', 2, 0))
    visitor.CallExpression(createHookCallNode('beforeEach', 3, 0))
    expect(reports).toHaveLength(3)
  })

  test('reports different hooks at top level', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('beforeEach'))
    visitor.CallExpression(createHookCallNode('afterEach'))
    expect(reports).toHaveLength(2)
  })

  test('reports beforeEach at line 5 column 10', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('beforeEach', 5, 10))
    expect(reports).toHaveLength(1)
    expect(reports[0].loc?.start.line).toBe(5)
    expect(reports[0].loc?.start.column).toBe(10)
  })

  test('reports afterEach at line 1 column 0', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('afterEach', 1, 0))
    expect(reports).toHaveLength(1)
    expect(reports[0].loc?.start.line).toBe(1)
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('reports beforeAll at line 20 column 5', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('beforeAll', 20, 5))
    expect(reports).toHaveLength(1)
    expect(reports[0].loc?.start.line).toBe(20)
    expect(reports[0].loc?.start.column).toBe(5)
  })

  test('reports afterAll at line 100 column 50', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('afterAll', 100, 50))
    expect(reports).toHaveLength(1)
    expect(reports[0].loc?.start.line).toBe(100)
    expect(reports[0].loc?.start.column).toBe(50)
  })

  test('report includes the node reference for beforeEach', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const node = createHookCallNode('beforeEach')
    visitor.CallExpression(node)
    expect(reports[0].node).toBe(node)
  })

  test('report includes the node reference for afterEach', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const node = createHookCallNode('afterEach')
    visitor.CallExpression(node)
    expect(reports[0].node).toBe(node)
  })

  test('report includes the node reference for beforeAll', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const node = createHookCallNode('beforeAll')
    visitor.CallExpression(node)
    expect(reports[0].node).toBe(node)
  })

  test('report includes the node reference for afterAll', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const node = createHookCallNode('afterAll')
    visitor.CallExpression(node)
    expect(reports[0].node).toBe(node)
  })

  test('reports hook with loc containing end position', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('beforeEach', 3, 4))
    expect(reports[0].loc?.end).toBeDefined()
    expect(reports[0].loc?.end.line).toBe(3)
  })

  test('reports beforeEach on first call only when followed by describe', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const hookNode = createHookCallNode('beforeEach')
    const describeNode = createDescribeCallNode('describe')
    visitor.CallExpression(hookNode)
    visitor.CallExpression(describeNode)
    expect(reports).toHaveLength(1)
  })

  test('reports beforeAll twice at top level in sequence', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('beforeAll', 1, 0))
    visitor.CallExpression(createHookCallNode('beforeAll', 2, 0))
    expect(reports).toHaveLength(2)
  })

  test('reports afterAll twice at top level in sequence', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('afterAll', 1, 0))
    visitor.CallExpression(createHookCallNode('afterAll', 2, 0))
    expect(reports).toHaveLength(2)
  })

  test('reports hook when called with default line and column', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('beforeEach'))
    expect(reports[0].loc?.start.line).toBe(1)
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('reports all four hooks at top level in sequence', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('beforeAll'))
    visitor.CallExpression(createHookCallNode('beforeEach'))
    visitor.CallExpression(createHookCallNode('afterEach'))
    visitor.CallExpression(createHookCallNode('afterAll'))
    expect(reports).toHaveLength(4)
  })

  // ============================================================================
  // Category 2: Hook inside describe - no report (15 tests)
  // ============================================================================
  test('does not report beforeEach inside describe', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createDescribeCallNode('describe'))
    visitor.CallExpression(createHookCallNode('beforeEach'))
    expect(reports).toHaveLength(0)
  })

  test('does not report afterEach inside describe', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createDescribeCallNode('describe'))
    visitor.CallExpression(createHookCallNode('afterEach'))
    expect(reports).toHaveLength(0)
  })

  test('does not report beforeAll inside describe', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createDescribeCallNode('describe'))
    visitor.CallExpression(createHookCallNode('beforeAll'))
    expect(reports).toHaveLength(0)
  })

  test('does not report afterAll inside describe', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createDescribeCallNode('describe'))
    visitor.CallExpression(createHookCallNode('afterAll'))
    expect(reports).toHaveLength(0)
  })

  test('does not report beforeEach inside context', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createDescribeCallNode('context'))
    visitor.CallExpression(createHookCallNode('beforeEach'))
    expect(reports).toHaveLength(0)
  })

  test('does not report afterEach inside context', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createDescribeCallNode('context'))
    visitor.CallExpression(createHookCallNode('afterEach'))
    expect(reports).toHaveLength(0)
  })

  test('does not report beforeAll inside suite', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createDescribeCallNode('suite'))
    visitor.CallExpression(createHookCallNode('beforeAll'))
    expect(reports).toHaveLength(0)
  })

  test('does not report afterAll inside suite', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createDescribeCallNode('suite'))
    visitor.CallExpression(createHookCallNode('afterAll'))
    expect(reports).toHaveLength(0)
  })

  test('does not report multiple hooks inside describe', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createDescribeCallNode('describe'))
    visitor.CallExpression(createHookCallNode('beforeAll'))
    visitor.CallExpression(createHookCallNode('beforeEach'))
    visitor.CallExpression(createHookCallNode('afterEach'))
    visitor.CallExpression(createHookCallNode('afterAll'))
    expect(reports).toHaveLength(0)
  })

  test('does not report hook after entering and exiting describe with new visitor', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createDescribeCallNode('describe'))
    visitor.CallExpression(createHookCallNode('beforeEach'))
    visitor['CallExpression:exit'](createDescribeCallNode('describe'))
    // Hook was inside describe, so no report
    expect(reports).toHaveLength(0)
  })

  test('does not report hook inside context with full enter/exit cycle', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const describeNode = createDescribeCallNode('context')
    visitor.CallExpression(describeNode)
    visitor.CallExpression(createHookCallNode('beforeEach'))
    visitor['CallExpression:exit'](describeNode)
    expect(reports).toHaveLength(0)
  })

  test('does not report hook inside suite with full enter/exit cycle', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const describeNode = createDescribeCallNode('suite')
    visitor.CallExpression(describeNode)
    visitor.CallExpression(createHookCallNode('afterAll'))
    visitor['CallExpression:exit'](describeNode)
    expect(reports).toHaveLength(0)
  })

  test('does not report beforeEach inside describe on different lines', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createDescribeCallNode('describe', 1, 0))
    visitor.CallExpression(createHookCallNode('beforeEach', 2, 2))
    expect(reports).toHaveLength(0)
  })

  test('does not report hook inside describe when describe has no exit', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createDescribeCallNode('describe'))
    visitor.CallExpression(createHookCallNode('beforeEach'))
    visitor.CallExpression(createHookCallNode('afterEach'))
    visitor.CallExpression(createHookCallNode('beforeAll'))
    visitor.CallExpression(createHookCallNode('afterAll'))
    expect(reports).toHaveLength(0)
  })

  test('does not report any hook when all are inside describe block', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const describeNode = createDescribeCallNode('describe')
    visitor.CallExpression(describeNode)
    visitor.CallExpression(createHookCallNode('beforeEach'))
    visitor.CallExpression(createHookCallNode('afterEach'))
    visitor['CallExpression:exit'](describeNode)
    expect(reports).toHaveLength(0)
  })

  // ============================================================================
  // Category 3: Nested describe tracking (15 tests)
  // ============================================================================
  test('does not report hook inside 2-level nested describe', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createDescribeCallNode('describe'))
    visitor.CallExpression(createDescribeCallNode('describe'))
    visitor.CallExpression(createHookCallNode('beforeEach'))
    expect(reports).toHaveLength(0)
  })

  test('does not report hook inside 3-level nested describe', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createDescribeCallNode('describe'))
    visitor.CallExpression(createDescribeCallNode('describe'))
    visitor.CallExpression(createDescribeCallNode('describe'))
    visitor.CallExpression(createHookCallNode('beforeEach'))
    expect(reports).toHaveLength(0)
  })

  test('reports hook between two separate describe blocks', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const desc1 = createDescribeCallNode('describe')
    visitor.CallExpression(desc1)
    visitor['CallExpression:exit'](desc1)
    visitor.CallExpression(createHookCallNode('beforeEach'))
    expect(reports).toHaveLength(1)
  })

  test('does not report hook in inner describe when outer is exited after', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const outer = createDescribeCallNode('describe')
    const inner = createDescribeCallNode('describe', 2, 2)
    visitor.CallExpression(outer)
    visitor.CallExpression(inner)
    visitor.CallExpression(createHookCallNode('beforeEach'))
    visitor['CallExpression:exit'](inner)
    visitor['CallExpression:exit'](outer)
    expect(reports).toHaveLength(0)
  })

  test('does not report hook in describe-context nesting', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createDescribeCallNode('describe'))
    visitor.CallExpression(createDescribeCallNode('context'))
    visitor.CallExpression(createHookCallNode('afterEach'))
    expect(reports).toHaveLength(0)
  })

  test('does not report hook in context-describe nesting', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createDescribeCallNode('context'))
    visitor.CallExpression(createDescribeCallNode('describe'))
    visitor.CallExpression(createHookCallNode('beforeAll'))
    expect(reports).toHaveLength(0)
  })

  test('reports hook at depth 0 after exiting nested describes', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const outer = createDescribeCallNode('describe')
    const inner = createDescribeCallNode('describe')
    visitor.CallExpression(outer)
    visitor.CallExpression(inner)
    visitor['CallExpression:exit'](inner)
    visitor['CallExpression:exit'](outer)
    visitor.CallExpression(createHookCallNode('afterAll'))
    expect(reports).toHaveLength(1)
  })

  test('tracks depth correctly through partial exit of nested describes', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const outer = createDescribeCallNode('describe')
    const inner = createDescribeCallNode('context')
    visitor.CallExpression(outer)
    visitor.CallExpression(inner)
    visitor['CallExpression:exit'](inner)
    // Now at depth 1, hook should not report
    visitor.CallExpression(createHookCallNode('beforeEach'))
    expect(reports).toHaveLength(0)
  })

  test('reports hook at depth 0 after full exit of 3-level nesting', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const d1 = createDescribeCallNode('describe')
    const d2 = createDescribeCallNode('describe')
    const d3 = createDescribeCallNode('describe')
    visitor.CallExpression(d1)
    visitor.CallExpression(d2)
    visitor.CallExpression(d3)
    visitor['CallExpression:exit'](d3)
    visitor['CallExpression:exit'](d2)
    visitor['CallExpression:exit'](d1)
    visitor.CallExpression(createHookCallNode('beforeEach'))
    expect(reports).toHaveLength(1)
  })

  test('does not report hook inside suite nested in describe', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createDescribeCallNode('describe'))
    visitor.CallExpression(createDescribeCallNode('suite'))
    visitor.CallExpression(createHookCallNode('beforeEach'))
    expect(reports).toHaveLength(0)
  })

  test('reports hook between two sequential describe blocks at depth 0', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const d1 = createDescribeCallNode('describe')
    visitor.CallExpression(d1)
    visitor['CallExpression:exit'](d1)
    visitor.CallExpression(createHookCallNode('beforeEach'))
    const d2 = createDescribeCallNode('describe')
    visitor.CallExpression(d2)
    visitor['CallExpression:exit'](d2)
    expect(reports).toHaveLength(1)
  })

  test('does not report hook inside second nested describe after first exits', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const outer = createDescribeCallNode('describe')
    const inner1 = createDescribeCallNode('context')
    const inner2 = createDescribeCallNode('describe')
    visitor.CallExpression(outer)
    visitor.CallExpression(inner1)
    visitor['CallExpression:exit'](inner1)
    visitor.CallExpression(inner2)
    visitor.CallExpression(createHookCallNode('beforeEach'))
    expect(reports).toHaveLength(0)
  })

  test('tracks context block depth the same as describe', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createDescribeCallNode('context'))
    visitor.CallExpression(createDescribeCallNode('context'))
    visitor.CallExpression(createHookCallNode('afterEach'))
    expect(reports).toHaveLength(0)
  })

  test('tracks suite block depth the same as describe', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createDescribeCallNode('suite'))
    visitor.CallExpression(createDescribeCallNode('suite'))
    visitor.CallExpression(createHookCallNode('beforeAll'))
    expect(reports).toHaveLength(0)
  })

  test('reports hook at depth 0 after exit from context block', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const ctx = createDescribeCallNode('context')
    visitor.CallExpression(ctx)
    visitor['CallExpression:exit'](ctx)
    visitor.CallExpression(createHookCallNode('afterAll'))
    expect(reports).toHaveLength(1)
  })

  // ============================================================================
  // Category 4: Describe depth exit tracking (10 tests)
  // ============================================================================
  test('reports beforeEach after describe exits back to depth 0', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const desc = createDescribeCallNode('describe')
    visitor.CallExpression(desc)
    visitor['CallExpression:exit'](desc)
    visitor.CallExpression(createHookCallNode('beforeEach'))
    expect(reports).toHaveLength(1)
  })

  test('reports afterEach after describe exits back to depth 0', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const desc = createDescribeCallNode('describe')
    visitor.CallExpression(desc)
    visitor['CallExpression:exit'](desc)
    visitor.CallExpression(createHookCallNode('afterEach'))
    expect(reports).toHaveLength(1)
  })

  test('reports beforeAll after describe exits back to depth 0', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const desc = createDescribeCallNode('describe')
    visitor.CallExpression(desc)
    visitor['CallExpression:exit'](desc)
    visitor.CallExpression(createHookCallNode('beforeAll'))
    expect(reports).toHaveLength(1)
  })

  test('reports afterAll after describe exits back to depth 0', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const desc = createDescribeCallNode('describe')
    visitor.CallExpression(desc)
    visitor['CallExpression:exit'](desc)
    visitor.CallExpression(createHookCallNode('afterAll'))
    expect(reports).toHaveLength(1)
  })

  test('reports hook before and after a single describe block', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('beforeEach', 1, 0))
    const desc = createDescribeCallNode('describe', 2, 0)
    visitor.CallExpression(desc)
    visitor['CallExpression:exit'](desc)
    visitor.CallExpression(createHookCallNode('afterEach', 10, 0))
    expect(reports).toHaveLength(2)
  })

  test('does not report hook inside describe even after exit and re-enter', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const desc1 = createDescribeCallNode('describe')
    visitor.CallExpression(desc1)
    visitor['CallExpression:exit'](desc1)
    const desc2 = createDescribeCallNode('describe')
    visitor.CallExpression(desc2)
    visitor.CallExpression(createHookCallNode('beforeEach'))
    expect(reports).toHaveLength(0)
  })

  test('reports multiple hooks after exiting describe', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const desc = createDescribeCallNode('describe')
    visitor.CallExpression(desc)
    visitor['CallExpression:exit'](desc)
    visitor.CallExpression(createHookCallNode('beforeEach'))
    visitor.CallExpression(createHookCallNode('afterEach'))
    visitor.CallExpression(createHookCallNode('beforeAll'))
    visitor.CallExpression(createHookCallNode('afterAll'))
    expect(reports).toHaveLength(4)
  })

  test('exit handler ignores non-describe calls', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const desc = createDescribeCallNode('describe')
    visitor.CallExpression(desc)
    // Exiting a non-describe call should not change depth
    visitor['CallExpression:exit'](createOtherCallNode('someFunction'))
    visitor.CallExpression(createHookCallNode('beforeEach'))
    // Still inside describe, should not report
    expect(reports).toHaveLength(0)
  })

  test('reports hook after suite exits back to depth 0', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const suite = createDescribeCallNode('suite')
    visitor.CallExpression(suite)
    visitor['CallExpression:exit'](suite)
    visitor.CallExpression(createHookCallNode('beforeEach'))
    expect(reports).toHaveLength(1)
  })

  test('reports hook after context exits back to depth 0', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const ctx = createDescribeCallNode('context')
    visitor.CallExpression(ctx)
    visitor['CallExpression:exit'](ctx)
    visitor.CallExpression(createHookCallNode('afterEach'))
    expect(reports).toHaveLength(1)
  })

  // ============================================================================
  // Category 5: Mixed hooks and describes (10 tests)
  // ============================================================================
  test('reports hook before describe but not inside', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('beforeEach'))
    visitor.CallExpression(createDescribeCallNode('describe'))
    visitor.CallExpression(createHookCallNode('beforeEach'))
    expect(reports).toHaveLength(1)
  })

  test('reports hook after describe but not inside', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const desc = createDescribeCallNode('describe')
    visitor.CallExpression(desc)
    visitor.CallExpression(createHookCallNode('beforeEach'))
    visitor['CallExpression:exit'](desc)
    visitor.CallExpression(createHookCallNode('afterEach'))
    expect(reports).toHaveLength(1)
  })

  test('reports hooks outside but not inside two describe blocks', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('beforeAll'))
    const d1 = createDescribeCallNode('describe')
    visitor.CallExpression(d1)
    visitor.CallExpression(createHookCallNode('beforeEach'))
    visitor['CallExpression:exit'](d1)
    visitor.CallExpression(createHookCallNode('afterEach'))
    const d2 = createDescribeCallNode('describe')
    visitor.CallExpression(d2)
    visitor.CallExpression(createHookCallNode('beforeEach'))
    visitor['CallExpression:exit'](d2)
    visitor.CallExpression(createHookCallNode('afterAll'))
    expect(reports).toHaveLength(3)
  })

  test('reports alternating hooks and describes correctly', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('beforeEach')) // report
    const desc = createDescribeCallNode('describe')
    visitor.CallExpression(desc)
    visitor.CallExpression(createHookCallNode('beforeEach')) // no report
    visitor['CallExpression:exit'](desc)
    visitor.CallExpression(createHookCallNode('afterEach')) // report
    expect(reports).toHaveLength(2)
  })

  test('reports hook between nested describe enter and exit', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const outer = createDescribeCallNode('describe')
    visitor.CallExpression(outer)
    const inner = createDescribeCallNode('describe')
    visitor.CallExpression(inner)
    visitor['CallExpression:exit'](inner)
    // Still at depth 1, no report
    visitor.CallExpression(createHookCallNode('beforeEach'))
    visitor['CallExpression:exit'](outer)
    expect(reports).toHaveLength(0)
  })

  test('reports only top-level hooks in complex scenario', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('beforeAll')) // report (depth 0)
    const d1 = createDescribeCallNode('describe')
    visitor.CallExpression(d1)
    visitor.CallExpression(createHookCallNode('beforeEach')) // no report (depth 1)
    const d2 = createDescribeCallNode('context')
    visitor.CallExpression(d2)
    visitor.CallExpression(createHookCallNode('afterEach')) // no report (depth 2)
    visitor['CallExpression:exit'](d2)
    visitor['CallExpression:exit'](d1)
    visitor.CallExpression(createHookCallNode('afterAll')) // report (depth 0)
    expect(reports).toHaveLength(2)
  })

  test('no reports when all hooks are inside describe blocks', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const d1 = createDescribeCallNode('describe')
    visitor.CallExpression(d1)
    visitor.CallExpression(createHookCallNode('beforeAll'))
    visitor.CallExpression(createHookCallNode('beforeEach'))
    visitor['CallExpression:exit'](d1)
    const d2 = createDescribeCallNode('describe')
    visitor.CallExpression(d2)
    visitor.CallExpression(createHookCallNode('afterEach'))
    visitor.CallExpression(createHookCallNode('afterAll'))
    visitor['CallExpression:exit'](d2)
    expect(reports).toHaveLength(0)
  })

  test('reports hook at top level after multiple describe cycles', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const d1 = createDescribeCallNode('describe')
    visitor.CallExpression(d1)
    visitor['CallExpression:exit'](d1)
    const d2 = createDescribeCallNode('describe')
    visitor.CallExpression(d2)
    visitor['CallExpression:exit'](d2)
    const d3 = createDescribeCallNode('describe')
    visitor.CallExpression(d3)
    visitor['CallExpression:exit'](d3)
    visitor.CallExpression(createHookCallNode('beforeEach'))
    expect(reports).toHaveLength(1)
  })

  test('handles hook inside describe with hook outside in correct order', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('beforeEach', 1, 0)) // report
    const desc = createDescribeCallNode('describe', 2, 0)
    visitor.CallExpression(desc)
    visitor.CallExpression(createHookCallNode('beforeEach', 3, 0)) // no report
    visitor['CallExpression:exit'](desc)
    expect(reports).toHaveLength(1)
    expect(reports[0].loc?.start.line).toBe(1)
  })

  test('reports hook after exiting context and entering describe', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const ctx = createDescribeCallNode('context')
    visitor.CallExpression(ctx)
    visitor['CallExpression:exit'](ctx)
    const desc = createDescribeCallNode('describe')
    visitor.CallExpression(desc)
    visitor['CallExpression:exit'](desc)
    visitor.CallExpression(createHookCallNode('beforeEach'))
    expect(reports).toHaveLength(1)
  })

  // ============================================================================
  // Category 6: Edge cases (10 tests)
  // ============================================================================
  test('does not report test() call at top level', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createOtherCallNode('test'))
    expect(reports).toHaveLength(0)
  })

  test('does not report it() call at top level', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createOtherCallNode('it'))
    expect(reports).toHaveLength(0)
  })

  test('does not report arbitrary function call at top level', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createOtherCallNode('myFunction'))
    expect(reports).toHaveLength(0)
  })

  test('does not report when node is null', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(null)
    expect(reports).toHaveLength(0)
  })

  test('does not report when node is undefined', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(undefined)
    expect(reports).toHaveLength(0)
  })

  test('does not report when node type is not CallExpression', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createNonCallNode())
    expect(reports).toHaveLength(0)
  })

  test('non-describe function does not affect depth', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createOtherCallNode('someFunction'))
    visitor.CallExpression(createHookCallNode('beforeEach'))
    expect(reports).toHaveLength(1)
  })

  test('non-describe exit does not affect depth', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const desc = createDescribeCallNode('describe')
    visitor.CallExpression(desc)
    visitor['CallExpression:exit'](createOtherCallNode('someFunction'))
    visitor.CallExpression(createHookCallNode('beforeEach'))
    expect(reports).toHaveLength(0)
  })

  test('does not report console.log call at top level', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createOtherCallNode('console'))
    expect(reports).toHaveLength(0)
  })

  test('does not report expect call at top level', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createOtherCallNode('expect'))
    expect(reports).toHaveLength(0)
  })

  // ============================================================================
  // Category 7: Error message format (5 tests)
  // ============================================================================
  test('error message contains beforeEach', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('beforeEach'))
    expect(reports[0].message).toContain('beforeEach')
    expect(reports[0].message).toContain('outside of a describe block')
  })

  test('error message contains afterEach', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('afterEach'))
    expect(reports[0].message).toContain('afterEach')
    expect(reports[0].message).toContain('outside of a describe block')
  })

  test('error message contains beforeAll', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('beforeAll'))
    expect(reports[0].message).toContain('beforeAll')
    expect(reports[0].message).toContain('outside of a describe block')
  })

  test('error message contains afterAll', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('afterAll'))
    expect(reports[0].message).toContain('afterAll')
    expect(reports[0].message).toContain('outside of a describe block')
  })

  test('error message has full expected format', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('beforeEach'))
    expect(reports[0].message).toBe(
      "Unexpected 'beforeEach' hook outside of a describe block. Move it inside a describe() to keep tests organized.",
    )
  })

  // ============================================================================
  // Category 8: Multiple hooks at top level (5 tests)
  // ============================================================================
  test('reports all four hooks when all at top level', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('beforeAll'))
    visitor.CallExpression(createHookCallNode('beforeEach'))
    visitor.CallExpression(createHookCallNode('afterEach'))
    visitor.CallExpression(createHookCallNode('afterAll'))
    expect(reports).toHaveLength(4)
  })

  test('reports all hooks with correct names in order', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('beforeAll'))
    visitor.CallExpression(createHookCallNode('beforeEach'))
    expect(reports[0].message).toContain('beforeAll')
    expect(reports[1].message).toContain('beforeEach')
  })

  test('reports 5 hooks all at top level', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('beforeEach', 1))
    visitor.CallExpression(createHookCallNode('afterEach', 2))
    visitor.CallExpression(createHookCallNode('beforeAll', 3))
    visitor.CallExpression(createHookCallNode('afterAll', 4))
    visitor.CallExpression(createHookCallNode('beforeEach', 5))
    expect(reports).toHaveLength(5)
  })

  test('reports duplicate hook names at top level separately', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('beforeEach', 1, 0))
    visitor.CallExpression(createHookCallNode('beforeEach', 5, 0))
    visitor.CallExpression(createHookCallNode('beforeEach', 10, 0))
    expect(reports).toHaveLength(3)
    expect(reports[0].loc?.start.line).toBe(1)
    expect(reports[1].loc?.start.line).toBe(5)
    expect(reports[2].loc?.start.line).toBe(10)
  })

  test('reports all hooks and each report has location info', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createHookCallNode('beforeAll', 1, 0))
    visitor.CallExpression(createHookCallNode('afterAll', 2, 0))
    for (const report of reports) {
      expect(report.loc).toBeDefined()
      expect(report.loc?.start).toBeDefined()
      expect(report.loc?.end).toBeDefined()
    }
    expect(reports).toHaveLength(2)
  })

  // ============================================================================
  // Category 9: describe.each / describe.only / describe.skip (5 tests)
  // ============================================================================
  test('does not report hook inside describe.only', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createMemberDescribeCallNode('describe', 'only'))
    visitor.CallExpression(createHookCallNode('beforeEach'))
    expect(reports).toHaveLength(0)
  })

  test('does not report hook inside describe.skip', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createMemberDescribeCallNode('describe', 'skip'))
    visitor.CallExpression(createHookCallNode('afterEach'))
    expect(reports).toHaveLength(0)
  })

  test('does not report hook inside describe.each', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createMemberDescribeCallNode('describe', 'each'))
    visitor.CallExpression(createHookCallNode('beforeAll'))
    expect(reports).toHaveLength(0)
  })

  test('does not report hook inside context.only', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    visitor.CallExpression(createMemberDescribeCallNode('context', 'only'))
    visitor.CallExpression(createHookCallNode('afterAll'))
    expect(reports).toHaveLength(0)
  })

  test('reports hook after exiting describe.only back to depth 0', () => {
    const { context, reports } = createMockContext()
    const visitor = noMisplacedHookRule.create(context)
    const desc = createMemberDescribeCallNode('describe', 'only')
    visitor.CallExpression(desc)
    visitor['CallExpression:exit'](desc)
    visitor.CallExpression(createHookCallNode('beforeEach'))
    expect(reports).toHaveLength(1)
  })
})

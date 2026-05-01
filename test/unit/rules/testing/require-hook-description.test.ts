import { describe, expect, test, vi } from 'vitest'
import { requireHookDescriptionRule } from '../../../../src/rules/testing/require-hook-description.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  node?: unknown
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  filePath = '/src/file.test.ts',
  source = "beforeEach(() => { setup(); });",
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

// Hook WITHOUT description (should report)
function createHookWithoutDesc(hookName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: hookName },
    arguments: [
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [{ type: 'ExpressionStatement' }] }, params: [] },
    ],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

// Hook WITH StringLiteral description (should NOT report)
function createHookWithDesc(hookName: string, desc: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: hookName },
    arguments: [
      { type: 'StringLiteral', value: desc },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [{ type: 'ExpressionStatement' }] }, params: [] },
    ],
    loc: { start: { line, column }, end: { line, column: column + 50 } },
  }
}

// Hook WITH Literal string description
function createHookWithLiteralDesc(hookName: string, desc: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: hookName },
    arguments: [
      { type: 'Literal', value: desc, raw: `'${desc}'` },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [{ type: 'ExpressionStatement' }] }, params: [] },
    ],
    loc: { start: { line, column }, end: { line, column: column + 50 } },
  }
}

// Hook with FunctionExpression (not arrow)
function createHookWithFunctionExpr(hookName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: hookName },
    arguments: [
      { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [{ type: 'ExpressionStatement' }] }, params: [] },
    ],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

// Hook with empty callback body (should NOT report)
function createHookWithEmptyBody(hookName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: hookName },
    arguments: [
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [] }, params: [] },
    ],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

// Non-hook call (should NOT report)
function createNonHookCall(funcName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: funcName },
    arguments: [
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [{ type: 'ExpressionStatement' }] }, params: [] },
    ],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

// Hook with no arguments
function createHookNoArgs(hookName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: hookName },
    arguments: [],
    loc: { start: { line, column }, end: { line, column: column + 15 } },
  }
}

// Hook with FunctionExpression AND StringLiteral description (should NOT report)
function createFunctionExprWithDesc(hookName: string, desc: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: hookName },
    arguments: [
      { type: 'StringLiteral', value: desc },
      { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [{ type: 'ExpressionStatement' }] }, params: [] },
    ],
    loc: { start: { line, column }, end: { line, column: column + 50 } },
  }
}

// Hook with non-string first argument (should report)
function createHookWithNonStringFirstArg(hookName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: hookName },
    arguments: [
      { type: 'Literal', value: 42 },
      { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [{ type: 'ExpressionStatement' }] }, params: [] },
    ],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

// Hook with FunctionExpression and empty body (should NOT report)
function createFunctionExprEmptyBody(hookName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: hookName },
    arguments: [
      { type: 'FunctionExpression', body: { type: 'BlockStatement', body: [] }, params: [] },
    ],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

describe('require-hook-description', () => {
  const rule = requireHookDescriptionRule

  // ==========================================================================
  // Category 1: Hook without description - reports (20 tests)
  // 4 hooks × 5 variations each = 20
  // ==========================================================================

  describe('hook without description - reports', () => {
    // beforeEach variations (5)
    test('reports beforeEach without description (arrow callback)', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithoutDesc('beforeEach'))
      expect(reports).toHaveLength(1)
    })

    test('reports beforeEach without description with numeric first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithNonStringFirstArg('beforeEach'))
      expect(reports).toHaveLength(1)
    })

    test('reports beforeEach with identifier first arg (not a string)', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [
          { type: 'Identifier', name: 'someVar' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [{ type: 'ExpressionStatement' }] }, params: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const visitor = rule.create(context)
      visitor.CallExpression(node)
      expect(reports).toHaveLength(1)
    })

    test('reports beforeEach with object first arg (not a string)', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [
          { type: 'ObjectExpression', properties: [] },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [{ type: 'ExpressionStatement' }] }, params: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      const visitor = rule.create(context)
      visitor.CallExpression(node)
      expect(reports).toHaveLength(1)
    })

    test('reports beforeEach with array first arg (not a string)', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [
          { type: 'ArrayExpression', elements: [] },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [{ type: 'ExpressionStatement' }] }, params: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const visitor = rule.create(context)
      visitor.CallExpression(node)
      expect(reports).toHaveLength(1)
    })

    // afterEach variations (5)
    test('reports afterEach without description (arrow callback)', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithoutDesc('afterEach'))
      expect(reports).toHaveLength(1)
    })

    test('reports afterEach without description with numeric first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithNonStringFirstArg('afterEach'))
      expect(reports).toHaveLength(1)
    })

    test('reports afterEach with identifier first arg (not a string)', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'afterEach' },
        arguments: [
          { type: 'Identifier', name: 'someVar' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [{ type: 'ExpressionStatement' }] }, params: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const visitor = rule.create(context)
      visitor.CallExpression(node)
      expect(reports).toHaveLength(1)
    })

    test('reports afterEach with object first arg (not a string)', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'afterEach' },
        arguments: [
          { type: 'ObjectExpression', properties: [] },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [{ type: 'ExpressionStatement' }] }, params: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      const visitor = rule.create(context)
      visitor.CallExpression(node)
      expect(reports).toHaveLength(1)
    })

    test('reports afterEach with array first arg (not a string)', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'afterEach' },
        arguments: [
          { type: 'ArrayExpression', elements: [] },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [{ type: 'ExpressionStatement' }] }, params: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const visitor = rule.create(context)
      visitor.CallExpression(node)
      expect(reports).toHaveLength(1)
    })

    // beforeAll variations (5)
    test('reports beforeAll without description (arrow callback)', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithoutDesc('beforeAll'))
      expect(reports).toHaveLength(1)
    })

    test('reports beforeAll without description with numeric first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithNonStringFirstArg('beforeAll'))
      expect(reports).toHaveLength(1)
    })

    test('reports beforeAll with identifier first arg (not a string)', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeAll' },
        arguments: [
          { type: 'Identifier', name: 'someVar' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [{ type: 'ExpressionStatement' }] }, params: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const visitor = rule.create(context)
      visitor.CallExpression(node)
      expect(reports).toHaveLength(1)
    })

    test('reports beforeAll with object first arg (not a string)', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeAll' },
        arguments: [
          { type: 'ObjectExpression', properties: [] },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [{ type: 'ExpressionStatement' }] }, params: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      const visitor = rule.create(context)
      visitor.CallExpression(node)
      expect(reports).toHaveLength(1)
    })

    test('reports beforeAll with array first arg (not a string)', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeAll' },
        arguments: [
          { type: 'ArrayExpression', elements: [] },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [{ type: 'ExpressionStatement' }] }, params: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const visitor = rule.create(context)
      visitor.CallExpression(node)
      expect(reports).toHaveLength(1)
    })

    // afterAll variations (5)
    test('reports afterAll without description (arrow callback)', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithoutDesc('afterAll'))
      expect(reports).toHaveLength(1)
    })

    test('reports afterAll without description with numeric first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithNonStringFirstArg('afterAll'))
      expect(reports).toHaveLength(1)
    })

    test('reports afterAll with identifier first arg (not a string)', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'afterAll' },
        arguments: [
          { type: 'Identifier', name: 'someVar' },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [{ type: 'ExpressionStatement' }] }, params: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const visitor = rule.create(context)
      visitor.CallExpression(node)
      expect(reports).toHaveLength(1)
    })

    test('reports afterAll with object first arg (not a string)', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'afterAll' },
        arguments: [
          { type: 'ObjectExpression', properties: [] },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [{ type: 'ExpressionStatement' }] }, params: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      const visitor = rule.create(context)
      visitor.CallExpression(node)
      expect(reports).toHaveLength(1)
    })

    test('reports afterAll with array first arg (not a string)', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'afterAll' },
        arguments: [
          { type: 'ArrayExpression', elements: [] },
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [{ type: 'ExpressionStatement' }] }, params: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const visitor = rule.create(context)
      visitor.CallExpression(node)
      expect(reports).toHaveLength(1)
    })
  })

  // ==========================================================================
  // Category 2: Hook with StringLiteral description - no report (10 tests)
  // ==========================================================================

  describe('hook with StringLiteral description - no report', () => {
    test('does not report beforeEach with StringLiteral description', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithDesc('beforeEach', 'setup database'))
      expect(reports).toHaveLength(0)
    })

    test('does not report afterEach with StringLiteral description', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithDesc('afterEach', 'cleanup database'))
      expect(reports).toHaveLength(0)
    })

    test('does not report beforeAll with StringLiteral description', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithDesc('beforeAll', 'initialize server'))
      expect(reports).toHaveLength(0)
    })

    test('does not report afterAll with StringLiteral description', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithDesc('afterAll', 'shutdown server'))
      expect(reports).toHaveLength(0)
    })

    test('does not report beforeEach with empty string StringLiteral description', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithDesc('beforeEach', ''))
      expect(reports).toHaveLength(0)
    })

    test('does not report afterEach with empty string StringLiteral description', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithDesc('afterEach', ''))
      expect(reports).toHaveLength(0)
    })

    test('does not report beforeAll with empty string StringLiteral description', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithDesc('beforeAll', ''))
      expect(reports).toHaveLength(0)
    })

    test('does not report afterAll with empty string StringLiteral description', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithDesc('afterAll', ''))
      expect(reports).toHaveLength(0)
    })

    test('does not report beforeEach with long StringLiteral description', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithDesc('beforeEach', 'this is a very long description for the hook'))
      expect(reports).toHaveLength(0)
    })

    test('does not report afterAll with multi-word StringLiteral description', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithDesc('afterAll', 'clean up all test resources'))
      expect(reports).toHaveLength(0)
    })
  })

  // ==========================================================================
  // Category 3: Hook with Literal string description - no report (10 tests)
  // ==========================================================================

  describe('hook with Literal string description - no report', () => {
    test('does not report beforeEach with Literal string description', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithLiteralDesc('beforeEach', 'setup database'))
      expect(reports).toHaveLength(0)
    })

    test('does not report afterEach with Literal string description', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithLiteralDesc('afterEach', 'cleanup database'))
      expect(reports).toHaveLength(0)
    })

    test('does not report beforeAll with Literal string description', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithLiteralDesc('beforeAll', 'initialize server'))
      expect(reports).toHaveLength(0)
    })

    test('does not report afterAll with Literal string description', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithLiteralDesc('afterAll', 'shutdown server'))
      expect(reports).toHaveLength(0)
    })

    test('does not report beforeEach with empty Literal string description', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithLiteralDesc('beforeEach', ''))
      expect(reports).toHaveLength(0)
    })

    test('does not report afterEach with empty Literal string description', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithLiteralDesc('afterEach', ''))
      expect(reports).toHaveLength(0)
    })

    test('does not report beforeAll with empty Literal string description', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithLiteralDesc('beforeAll', ''))
      expect(reports).toHaveLength(0)
    })

    test('does not report afterAll with empty Literal string description', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithLiteralDesc('afterAll', ''))
      expect(reports).toHaveLength(0)
    })

    test('does not report beforeEach with Literal string containing special chars', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithLiteralDesc('beforeEach', 'setup with "quotes" and \\n'))
      expect(reports).toHaveLength(0)
    })

    test('does not report afterAll with Literal string containing unicode', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithLiteralDesc('afterAll', 'クリーンアップ'))
      expect(reports).toHaveLength(0)
    })
  })

  // ==========================================================================
  // Category 4: Non-hook calls - no report (10 tests)
  // ==========================================================================

  describe('non-hook calls - no report', () => {
    test('does not report test() call', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createNonHookCall('test'))
      expect(reports).toHaveLength(0)
    })

    test('does not report it() call', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createNonHookCall('it'))
      expect(reports).toHaveLength(0)
    })

    test('does not report describe() call', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createNonHookCall('describe'))
      expect(reports).toHaveLength(0)
    })

    test('does not report customFunction() call', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createNonHookCall('customFunction'))
      expect(reports).toHaveLength(0)
    })

    test('does not report setup() call', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createNonHookCall('setup'))
      expect(reports).toHaveLength(0)
    })

    test('does not report run() call', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createNonHookCall('run'))
      expect(reports).toHaveLength(0)
    })

    test('does not report expect() call', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createNonHookCall('expect'))
      expect(reports).toHaveLength(0)
    })

    test('does not report context() call', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createNonHookCall('context'))
      expect(reports).toHaveLength(0)
    })

    test('does not report suite() call', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createNonHookCall('suite'))
      expect(reports).toHaveLength(0)
    })

    test('does not report initialize() call', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createNonHookCall('initialize'))
      expect(reports).toHaveLength(0)
    })
  })

  // ==========================================================================
  // Category 5: Empty callback body - no report (8 tests)
  // ==========================================================================

  describe('empty callback body - no report', () => {
    test('does not report beforeEach with empty arrow function body', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithEmptyBody('beforeEach'))
      expect(reports).toHaveLength(0)
    })

    test('does not report afterEach with empty arrow function body', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithEmptyBody('afterEach'))
      expect(reports).toHaveLength(0)
    })

    test('does not report beforeAll with empty arrow function body', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithEmptyBody('beforeAll'))
      expect(reports).toHaveLength(0)
    })

    test('does not report afterAll with empty arrow function body', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithEmptyBody('afterAll'))
      expect(reports).toHaveLength(0)
    })

    test('does not report beforeEach with empty FunctionExpression body', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createFunctionExprEmptyBody('beforeEach'))
      expect(reports).toHaveLength(0)
    })

    test('does not report afterEach with empty FunctionExpression body', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createFunctionExprEmptyBody('afterEach'))
      expect(reports).toHaveLength(0)
    })

    test('does not report beforeAll with empty FunctionExpression body', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createFunctionExprEmptyBody('beforeAll'))
      expect(reports).toHaveLength(0)
    })

    test('does not report afterAll with empty FunctionExpression body', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createFunctionExprEmptyBody('afterAll'))
      expect(reports).toHaveLength(0)
    })
  })

  // ==========================================================================
  // Category 6: No arguments - no report (5 tests)
  // ==========================================================================

  describe('no arguments - no report', () => {
    test('does not report beforeEach with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookNoArgs('beforeEach'))
      expect(reports).toHaveLength(0)
    })

    test('does not report afterEach with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookNoArgs('afterEach'))
      expect(reports).toHaveLength(0)
    })

    test('does not report beforeAll with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookNoArgs('beforeAll'))
      expect(reports).toHaveLength(0)
    })

    test('does not report afterAll with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookNoArgs('afterAll'))
      expect(reports).toHaveLength(0)
    })

    test('does not report hook call with undefined arguments property', () => {
      const { context, reports } = createMockContext()
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      const visitor = rule.create(context)
      visitor.CallExpression(node)
      expect(reports).toHaveLength(0)
    })
  })

  // ==========================================================================
  // Category 7: FunctionExpression callback (8 tests)
  // ==========================================================================

  describe('FunctionExpression callback', () => {
    test('reports beforeEach with FunctionExpression and no description', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithFunctionExpr('beforeEach'))
      expect(reports).toHaveLength(1)
    })

    test('reports afterEach with FunctionExpression and no description', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithFunctionExpr('afterEach'))
      expect(reports).toHaveLength(1)
    })

    test('reports beforeAll with FunctionExpression and no description', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithFunctionExpr('beforeAll'))
      expect(reports).toHaveLength(1)
    })

    test('reports afterAll with FunctionExpression and no description', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithFunctionExpr('afterAll'))
      expect(reports).toHaveLength(1)
    })

    test('does not report beforeEach with FunctionExpression and StringLiteral description', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createFunctionExprWithDesc('beforeEach', 'setup'))
      expect(reports).toHaveLength(0)
    })

    test('does not report afterEach with FunctionExpression and StringLiteral description', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createFunctionExprWithDesc('afterEach', 'cleanup'))
      expect(reports).toHaveLength(0)
    })

    test('does not report beforeAll with FunctionExpression and StringLiteral description', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createFunctionExprWithDesc('beforeAll', 'initialize'))
      expect(reports).toHaveLength(0)
    })

    test('does not report afterAll with FunctionExpression and StringLiteral description', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createFunctionExprWithDesc('afterAll', 'shutdown'))
      expect(reports).toHaveLength(0)
    })
  })

  // ==========================================================================
  // Category 8: Error message format (8 tests)
  // ==========================================================================

  describe('error message format', () => {
    test('error message includes beforeEach for beforeEach hook', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithoutDesc('beforeEach'))
      expect(reports[0].message).toBe("Hook 'beforeEach' should have a description string as the first argument for clarity.")
    })

    test('error message includes afterEach for afterEach hook', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithoutDesc('afterEach'))
      expect(reports[0].message).toBe("Hook 'afterEach' should have a description string as the first argument for clarity.")
    })

    test('error message includes beforeAll for beforeAll hook', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithoutDesc('beforeAll'))
      expect(reports[0].message).toBe("Hook 'beforeAll' should have a description string as the first argument for clarity.")
    })

    test('error message includes afterAll for afterAll hook', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithoutDesc('afterAll'))
      expect(reports[0].message).toBe("Hook 'afterAll' should have a description string as the first argument for clarity.")
    })

    test('error report includes the node reference', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      const node = createHookWithoutDesc('beforeEach')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('error report includes location from node', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithoutDesc('beforeEach', 5, 10))
      expect(reports[0].loc).toEqual({ start: { line: 5, column: 10 }, end: { line: 5, column: 40 } })
    })

    test('error report includes location for afterEach', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithoutDesc('afterEach', 3, 4))
      expect(reports[0].loc).toEqual({ start: { line: 3, column: 4 }, end: { line: 3, column: 34 } })
    })

    test('error report includes location for afterAll', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithoutDesc('afterAll', 10, 0))
      expect(reports[0].loc).toEqual({ start: { line: 10, column: 0 }, end: { line: 10, column: 30 } })
    })
  })

  // ==========================================================================
  // Category 9: Edge cases (8 tests)
  // ==========================================================================

  describe('edge cases', () => {
    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(null)
      expect(reports).toHaveLength(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(undefined)
      expect(reports).toHaveLength(0)
    })

    test('does not report for non-CallExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 42 },
      }
      visitor.CallExpression(node)
      expect(reports).toHaveLength(0)
    })

    test('does not report for MemberExpression callee with non-Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
          property: { type: 'Identifier', name: 'beforeEach' },
        },
        arguments: [
          { type: 'ArrowFunctionExpression', body: { type: 'BlockStatement', body: [{ type: 'ExpressionStatement' }] }, params: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)
      expect(reports).toHaveLength(0)
    })

    test('does not report when callback body has null body property', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [
          { type: 'ArrowFunctionExpression', body: null, params: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(reports).toHaveLength(0)
    })

    test('does not report when callback last argument is not a function type', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [
          { type: 'Literal', value: 42 },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports).toHaveLength(0)
    })

    test('does not report when callback body is non-BlockStatement (e.g. expression body)', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'beforeEach' },
        arguments: [
          { type: 'ArrowFunctionExpression', body: { type: 'Literal', value: 42 }, params: [] },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(reports).toHaveLength(1)
    })

    test('reports exactly once for a single violating hook', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithoutDesc('beforeAll'))
      expect(reports).toHaveLength(1)
    })
  })

  // ==========================================================================
  // Category 10: Different positions (8 tests)
  // ==========================================================================

  describe('different positions', () => {
    test('reports beforeEach at line 1, column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithoutDesc('beforeEach', 1, 0))
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start).toEqual({ line: 1, column: 0 })
    })

    test('reports afterEach at line 5, column 10', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithoutDesc('afterEach', 5, 10))
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start).toEqual({ line: 5, column: 10 })
    })

    test('reports beforeAll at line 100, column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithoutDesc('beforeAll', 100, 0))
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start).toEqual({ line: 100, column: 0 })
    })

    test('reports afterAll at line 50, column 25', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithoutDesc('afterAll', 50, 25))
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start).toEqual({ line: 50, column: 25 })
    })

    test('reports beforeEach with StringLiteral description at custom position - no report', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithDesc('beforeEach', 'desc', 10, 5))
      expect(reports).toHaveLength(0)
    })

    test('reports afterEach at line 999, column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithoutDesc('afterEach', 999, 0))
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start).toEqual({ line: 999, column: 0 })
    })

    test('does not report hook with Literal description at line 2, column 8', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithLiteralDesc('beforeAll', 'init', 2, 8))
      expect(reports).toHaveLength(0)
    })

    test('does not report hook with empty body at line 3, column 4', () => {
      const { context, reports } = createMockContext()
      const visitor = rule.create(context)
      visitor.CallExpression(createHookWithEmptyBody('afterAll', 3, 4))
      expect(reports).toHaveLength(0)
    })
  })
})

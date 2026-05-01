import { describe, expect, test, vi } from 'vitest'
import { noExcessiveComplexityRule } from '../../../../src/rules/patterns/no-excessive-complexity.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { end: { column: number; line: number }; start: { column: number; line: number } }
  node?: unknown
}

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        node: descriptor.node,
      })
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => '',
    getTokens: () => [],
    getComments: () => [],
    config: { options: [{}] },
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

function makeBranchingNodes(type: string, count: number): Record<string, unknown>[] {
  const nodes: Record<string, unknown>[] = []
  for (let i = 0; i < count; i++) {
    nodes.push({ type, test: {}, consequent: {}, alternate: {} })
  }
  return nodes
}

function makeFuncDecl(
  branchingNodes: Record<string, unknown>[],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 10,
  locEndCol = 5,
): unknown {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name: 'myFunc' },
    params: [],
    body: {
      type: 'BlockStatement',
      body: branchingNodes,
    },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeFuncExpr(
  branchingNodes: Record<string, unknown>[],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 10,
  locEndCol = 5,
): unknown {
  return {
    type: 'FunctionExpression',
    id: { type: 'Identifier', name: 'myFunc' },
    params: [],
    body: {
      type: 'BlockStatement',
      body: branchingNodes,
    },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeArrowFunc(
  branchingNodes: Record<string, unknown>[],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 10,
  locEndCol = 5,
): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [],
    body: {
      type: 'BlockStatement',
      body: branchingNodes,
    },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

describe('no-excessive-complexity rule', () => {
  // ===== META TESTS (8) =====

  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noExcessiveComplexityRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noExcessiveComplexityRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noExcessiveComplexityRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noExcessiveComplexityRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noExcessiveComplexityRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning complexity', () => {
      const desc = noExcessiveComplexityRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/complex/)
    })

    test('should have correct docs URL', () => {
      expect(noExcessiveComplexityRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-excessive-complexity',
      )
    })

    test('should have empty schema', () => {
      expect(noExcessiveComplexityRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (4) =====

  describe('structure', () => {
    test('create() returns visitor with FunctionDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      expect(visitor).toHaveProperty('FunctionDeclaration')
      expect(typeof visitor.FunctionDeclaration).toBe('function')
    })

    test('create() returns visitor with FunctionExpression', () => {
      const { context } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      expect(visitor).toHaveProperty('FunctionExpression')
      expect(typeof visitor.FunctionExpression).toBe('function')
    })

    test('create() returns visitor with ArrowFunctionExpression', () => {
      const { context } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      expect(visitor).toHaveProperty('ArrowFunctionExpression')
      expect(typeof visitor.ArrowFunctionExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noExcessiveComplexityRule).toBeDefined()
      expect(noExcessiveComplexityRule.meta).toBeDefined()
      expect(noExcessiveComplexityRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE - FUNCTION DECLARATION (12) =====

  describe('positive — FunctionDeclaration reports', () => {
    test('reports FunctionDeclaration with 11 IfStatements', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('IfStatement', 11)))
      expect(reports.length).toBe(1)
    })

    test('reports FunctionDeclaration with 15 IfStatements', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('IfStatement', 15)))
      expect(reports.length).toBe(1)
    })

    test('reports FunctionDeclaration with 11 ForStatements', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('ForStatement', 11)))
      expect(reports.length).toBe(1)
    })

    test('reports FunctionDeclaration with 11 WhileStatements', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('WhileStatement', 11)))
      expect(reports.length).toBe(1)
    })

    test('reports FunctionDeclaration with 11 DoWhileStatements', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('DoWhileStatement', 11)))
      expect(reports.length).toBe(1)
    })

    test('reports FunctionDeclaration with 11 ForInStatements', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('ForInStatement', 11)))
      expect(reports.length).toBe(1)
    })

    test('reports FunctionDeclaration with 11 ForOfStatements', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('ForOfStatement', 11)))
      expect(reports.length).toBe(1)
    })

    test('reports FunctionDeclaration with 11 SwitchCase nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('SwitchCase', 11)))
      expect(reports.length).toBe(1)
    })

    test('reports FunctionDeclaration with 11 CatchClause nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('CatchClause', 11)))
      expect(reports.length).toBe(1)
    })

    test('reports FunctionDeclaration with 11 ConditionalExpressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('ConditionalExpression', 11)))
      expect(reports.length).toBe(1)
    })

    test('reports FunctionDeclaration with 11 LogicalExpressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('LogicalExpression', 11)))
      expect(reports.length).toBe(1)
    })

    test('report message contains correct complexity value', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('IfStatement', 15)))
      expect(reports[0].message).toContain('15')
    })
  })

  // ===== POSITIVE - FUNCTION EXPRESSION (10) =====

  describe('positive — FunctionExpression reports', () => {
    test('reports FunctionExpression with 11 IfStatements', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionExpression(makeFuncExpr(makeBranchingNodes('IfStatement', 11)))
      expect(reports.length).toBe(1)
    })

    test('reports FunctionExpression with mixed branching types totaling 11', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      const nodes = [
        ...makeBranchingNodes('IfStatement', 3),
        ...makeBranchingNodes('ForStatement', 3),
        ...makeBranchingNodes('WhileStatement', 3),
        ...makeBranchingNodes('CatchClause', 2),
      ]
      visitor.FunctionExpression(makeFuncExpr(nodes))
      expect(reports.length).toBe(1)
    })

    test('reports FunctionExpression with 20 IfStatements', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionExpression(makeFuncExpr(makeBranchingNodes('IfStatement', 20)))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('20')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionExpression(makeFuncExpr(makeBranchingNodes('IfStatement', 11)))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionExpression(makeFuncExpr(makeBranchingNodes('IfStatement', 11)))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      const node = makeFuncExpr(makeBranchingNodes('IfStatement', 11))
      visitor.FunctionExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report message format is correct for complexity 11', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionExpression(makeFuncExpr(makeBranchingNodes('IfStatement', 11)))
      expect(reports[0].message).toBe(
        'Function has a complexity of 11. Maximum allowed is 10.',
      )
    })

    test('reports FunctionExpression with exactly complexity 11 via mixed types', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      const nodes = [
        ...makeBranchingNodes('IfStatement', 5),
        ...makeBranchingNodes('ForStatement', 4),
        ...makeBranchingNodes('ConditionalExpression', 2),
      ]
      visitor.FunctionExpression(makeFuncExpr(nodes))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('11')
    })

    test('reports FunctionExpression with deeply nested branching', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      let nested: Record<string, unknown> = { type: 'IfStatement', test: {}, consequent: {} }
      for (let i = 0; i < 10; i++) {
        nested = { type: 'IfStatement', test: {}, consequent: nested }
      }
      visitor.FunctionExpression(makeFuncExpr([nested]))
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionExpression(makeFuncExpr(makeBranchingNodes('IfStatement', 11)))
      visitor.FunctionExpression(makeFuncExpr(makeBranchingNodes('IfStatement', 11)))
      expect(reports.length).toBe(2)
    })
  })

  // ===== POSITIVE - ARROW FUNCTION (10) =====

  describe('positive — ArrowFunctionExpression reports', () => {
    test('reports ArrowFunctionExpression with 11 IfStatements', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowFunc(makeBranchingNodes('IfStatement', 11)))
      expect(reports.length).toBe(1)
    })

    test('reports ArrowFunctionExpression with mixed types totaling 11', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      const nodes = [
        ...makeBranchingNodes('IfStatement', 4),
        ...makeBranchingNodes('ForStatement', 3),
        ...makeBranchingNodes('WhileStatement', 2),
        ...makeBranchingNodes('LogicalExpression', 2),
      ]
      visitor.ArrowFunctionExpression(makeArrowFunc(nodes))
      expect(reports.length).toBe(1)
    })

    test('reports ArrowFunctionExpression with complexity 12', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowFunc(makeBranchingNodes('IfStatement', 12)))
      expect(reports[0].message).toContain('12')
    })

    test('reports ArrowFunctionExpression with complexity 50', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowFunc(makeBranchingNodes('IfStatement', 50)))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('50')
    })

    test('report loc values preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowFunc(makeBranchingNodes('IfStatement', 11), 5, 10, 5, 50))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowFunc(makeBranchingNodes('IfStatement', 11)))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports ArrowFunctionExpression with nested branches', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      const innerNodes = makeBranchingNodes('IfStatement', 10)
      const outerIf = { type: 'IfStatement', test: {}, consequent: { type: 'BlockStatement', body: innerNodes } }
      visitor.ArrowFunctionExpression(makeArrowFunc([outerIf]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('11')
    })

    test('correct message format for ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowFunc(makeBranchingNodes('IfStatement', 11)))
      expect(reports[0].message).toBe(
        'Function has a complexity of 11. Maximum allowed is 10.',
      )
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      const node = makeArrowFunc(makeBranchingNodes('IfStatement', 11))
      visitor.ArrowFunctionExpression(node)
      visitor.ArrowFunctionExpression(node)
      visitor.ArrowFunctionExpression(node)
      expect(reports.length).toBe(3)
    })

    test('accumulates across all three visitor methods', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('IfStatement', 11)))
      visitor.FunctionExpression(makeFuncExpr(makeBranchingNodes('IfStatement', 11)))
      visitor.ArrowFunctionExpression(makeArrowFunc(makeBranchingNodes('IfStatement', 11)))
      expect(reports.length).toBe(3)
    })
  })

  // ===== NEGATIVE - NO REPORT (20) =====

  describe('negative — does NOT report', () => {
    test('does not report for null node via FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(null)
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node via FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(undefined)
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object via FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration({})
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive via FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration('not a node')
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive via FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(42)
      expect(reports.length).toBe(0)
    })

    test('does not report FunctionDeclaration with 0 branches', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl([]))
      expect(reports.length).toBe(0)
    })

    test('does not report FunctionDeclaration with 5 branches', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('IfStatement', 5)))
      expect(reports.length).toBe(0)
    })

    test('does not report FunctionDeclaration with exactly 10 branches', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('IfStatement', 10)))
      expect(reports.length).toBe(0)
    })

    test('does not report FunctionExpression with 10 branches', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionExpression(makeFuncExpr(makeBranchingNodes('IfStatement', 10)))
      expect(reports.length).toBe(0)
    })

    test('does not report ArrowFunctionExpression with 10 branches', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowFunc(makeBranchingNodes('IfStatement', 10)))
      expect(reports.length).toBe(0)
    })

    test('does not report FunctionDeclaration with only non-branching types', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      const nodes = Array.from({ length: 20 }, () => ({ type: 'ExpressionStatement', expression: {} }))
      visitor.FunctionDeclaration(makeFuncDecl(nodes))
      expect(reports.length).toBe(0)
    })

    test('does not report node without body property', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration({ type: 'FunctionDeclaration', id: {}, params: [], loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report node with empty body array', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: {},
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report FunctionExpression with 8 branches', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionExpression(makeFuncExpr(makeBranchingNodes('IfStatement', 8)))
      expect(reports.length).toBe(0)
    })

    test('does not report ArrowFunctionExpression with 9 branches', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.ArrowFunctionExpression(makeArrowFunc(makeBranchingNodes('IfStatement', 9)))
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive via FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(true)
      expect(reports.length).toBe(0)
    })

    test('does not report for array primitive via FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration([])
      expect(reports.length).toBe(0)
    })

    test('does not report FunctionDeclaration with 3 branches', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('IfStatement', 3)))
      expect(reports.length).toBe(0)
    })

    test('does not report FunctionDeclaration with 1 branch', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('IfStatement', 1)))
      expect(reports.length).toBe(0)
    })

    test('does not report FunctionExpression with 0 branches', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionExpression(makeFuncExpr([]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: {},
        params: [],
        body: { type: 'BlockStatement', body: makeBranchingNodes('IfStatement', 11) },
        loc: makeLoc(1, 0, 10, 5),
        range: [0, 100],
        extra: true,
        async: false,
        generator: false,
      })
      expect(reports.length).toBe(1)
    })

    test('handles node without loc (default location)', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: {},
        params: [],
        body: { type: 'BlockStatement', body: makeBranchingNodes('IfStatement', 11) },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('handles node with partial loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: {},
        params: [],
        body: { type: 'BlockStatement', body: makeBranchingNodes('IfStatement', 11) },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noExcessiveComplexityRule.create(ctx1)
      const visitor2 = noExcessiveComplexityRule.create(ctx2)
      visitor1.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('IfStatement', 11)))
      visitor2.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('IfStatement', 5)))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('creates new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noExcessiveComplexityRule.create(context)
      const visitor2 = noExcessiveComplexityRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noExcessiveComplexityRule.meta
      const meta2 = noExcessiveComplexityRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: {},
        params: [],
        body: { type: 'BlockStatement', body: makeBranchingNodes('IfStatement', 11) },
        loc: makeLoc(1, 0, 10, 5),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('deeply nested branching counts correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      const innerNodes = makeBranchingNodes('IfStatement', 6)
      const outerIfsWithNested = {
        type: 'IfStatement',
        test: {},
        consequent: { type: 'BlockStatement', body: innerNodes },
      }
      const otherIfs = makeBranchingNodes('IfStatement', 4)
      visitor.FunctionDeclaration(makeFuncDecl([outerIfsWithNested, ...otherIfs]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('11')
    })

    test('mixed branching types count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      const nodes = [
        ...makeBranchingNodes('IfStatement', 2),
        ...makeBranchingNodes('ForStatement', 2),
        ...makeBranchingNodes('WhileStatement', 2),
        ...makeBranchingNodes('DoWhileStatement', 2),
        ...makeBranchingNodes('ForInStatement', 1),
        ...makeBranchingNodes('ForOfStatement', 1),
        ...makeBranchingNodes('SwitchCase', 1),
      ]
      visitor.FunctionDeclaration(makeFuncDecl(nodes))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('11')
    })

    test('report loc reflects specific node values', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('IfStatement', 11), 10, 4, 10, 50))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(50)
    })

    test('complexity 11 reports exactly once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('IfStatement', 11)))
      expect(reports.length).toBe(1)
    })

    test('complexity 12 report message says 12', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('IfStatement', 12)))
      expect(reports[0].message).toBe(
        'Function has a complexity of 12. Maximum allowed is 10.',
      )
    })

    test('handles node with null body', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: {},
        params: [],
        body: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles large complexity (100)', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('IfStatement', 100)))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('100')
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: {},
        params: [],
        body: { type: 'BlockStatement', body: makeBranchingNodes('IfStatement', 11) },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })
  })

  // ===== BRANCHING TYPE COVERAGE (10) =====

  describe('branching type coverage', () => {
    test('IfStatement is counted as branching', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('IfStatement', 11)))
      expect(reports.length).toBe(1)
    })

    test('ForStatement is counted as branching', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('ForStatement', 11)))
      expect(reports.length).toBe(1)
    })

    test('ForInStatement is counted as branching', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('ForInStatement', 11)))
      expect(reports.length).toBe(1)
    })

    test('ForOfStatement is counted as branching', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('ForOfStatement', 11)))
      expect(reports.length).toBe(1)
    })

    test('WhileStatement is counted as branching', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('WhileStatement', 11)))
      expect(reports.length).toBe(1)
    })

    test('DoWhileStatement is counted as branching', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('DoWhileStatement', 11)))
      expect(reports.length).toBe(1)
    })

    test('SwitchCase is counted as branching', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('SwitchCase', 11)))
      expect(reports.length).toBe(1)
    })

    test('CatchClause is counted as branching', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('CatchClause', 11)))
      expect(reports.length).toBe(1)
    })

    test('ConditionalExpression is counted as branching', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('ConditionalExpression', 11)))
      expect(reports.length).toBe(1)
    })

    test('LogicalExpression is counted as branching', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('LogicalExpression', 11)))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT DETAILS (6) =====

  describe('report details', () => {
    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('IfStatement', 15)))
      visitor.FunctionExpression(makeFuncExpr(makeBranchingNodes('IfStatement', 15)))
      expect(reports[0].message).toMatch(/^Function has a complexity of \d+\. Maximum allowed is 10\.$/)
      expect(reports[1].message).toMatch(/^Function has a complexity of \d+\. Maximum allowed is 10\.$/)
    })

    test('rule exports are correct', () => {
      expect(noExcessiveComplexityRule).toBeDefined()
      expect(typeof noExcessiveComplexityRule.create).toBe('function')
      expect(typeof noExcessiveComplexityRule.meta).toBe('object')
    })

    test('handles mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('IfStatement', 5)))
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('IfStatement', 11)))
      visitor.FunctionDeclaration(makeFuncDecl([]))
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('IfStatement', 10)))
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('IfStatement', 12)))
      expect(reports.length).toBe(2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('IfStatement', 11)))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with null id', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: makeBranchingNodes('IfStatement', 11) },
        loc: makeLoc(1, 0, 10, 5),
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noExcessiveComplexityRule.create(context)
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('IfStatement', 11)))
      visitor.FunctionDeclaration(makeFuncDecl(makeBranchingNodes('IfStatement', 20)))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('11')
      expect(reports[1].message).toContain('20')
    })
  })
})

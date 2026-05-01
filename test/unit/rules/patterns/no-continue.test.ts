import { describe, expect, test, vi } from 'vitest'
import { noContinueRule } from '../../../../src/rules/patterns/no-continue.js'
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
    getSource: () => 'continue;',
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

function makeContinueNode(
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 9,
): unknown {
  return {
    type: 'ContinueStatement',
    label: null,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-continue rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noContinueRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noContinueRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noContinueRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noContinueRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noContinueRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning continue', () => {
      const desc = noContinueRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/continue/)
    })

    test('should have correct docs URL', () => {
      expect(noContinueRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-continue',
      )
    })

    test('should have empty schema', () => {
      expect(noContinueRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ContinueStatement', () => {
      const { context } = createMockContext()
      const visitor = noContinueRule.create(context)
      expect(visitor).toHaveProperty('ContinueStatement')
      expect(typeof visitor.ContinueStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noContinueRule).toBeDefined()
      expect(noContinueRule.meta).toBeDefined()
      expect(noContinueRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS CONTINUE STATEMENT (30) =====

  describe('positive cases — reports ContinueStatement', () => {
    test('reports for basic ContinueStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement(makeContinueNode())
      expect(reports.length).toBe(1)
    })

    test('reports for ContinueStatement with null label', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ContinueStatement', label: null, loc: makeLoc(1, 0, 1, 9) })
      expect(reports.length).toBe(1)
    })

    test('reports for ContinueStatement with a label', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ContinueStatement', label: { type: 'Identifier', name: 'outerLoop' }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(1)
    })

    test('reports for ContinueStatement at different line', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement(makeContinueNode(5, 4, 5, 13))
      expect(reports.length).toBe(1)
    })

    test('reports for ContinueStatement at column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement(makeContinueNode(1, 0, 1, 9))
      expect(reports.length).toBe(1)
    })

    test('reports for ContinueStatement at high line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement(makeContinueNode(100, 8, 100, 17))
      expect(reports.length).toBe(1)
    })

    test('report message is "Unexpected continue statement."', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement(makeContinueNode())
      expect(reports[0].message).toBe('Unexpected continue statement.')
    })

    test('report message contains "continue"', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement(makeContinueNode())
      expect(reports[0].message.toLowerCase()).toContain('continue')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement(makeContinueNode())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement(makeContinueNode())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input ContinueStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      const node = makeContinueNode()
      visitor.ContinueStatement(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement(makeContinueNode(5, 10, 5, 19))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement(makeContinueNode(2, 4, 2, 13))
      expect(reports[0].loc?.end.line).toBe(2)
      expect(reports[0].loc?.end.column).toBe(13)
    })

    test('reports for ContinueStatement with undefined label', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ContinueStatement', label: undefined, loc: makeLoc(1, 0, 1, 9) })
      expect(reports.length).toBe(1)
    })

    test('reports for ContinueStatement with empty loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ContinueStatement', label: null, loc: makeLoc(0, 0, 0, 0) })
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement(makeContinueNode())
      visitor.ContinueStatement(makeContinueNode())
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement(makeContinueNode())
      visitor.ContinueStatement(makeContinueNode(3, 0, 3, 9))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for ContinueStatement inside for-loop context', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ContinueStatement', label: null, loc: makeLoc(3, 6, 3, 15), parent: { type: 'ForStatement' } })
      expect(reports.length).toBe(1)
    })

    test('reports for ContinueStatement inside while-loop context', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ContinueStatement', label: null, loc: makeLoc(7, 8, 7, 17), parent: { type: 'WhileStatement' } })
      expect(reports.length).toBe(1)
    })

    test('reports for ContinueStatement inside do-while context', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ContinueStatement', label: null, loc: makeLoc(4, 4, 4, 13), parent: { type: 'DoWhileStatement' } })
      expect(reports.length).toBe(1)
    })

    test('reports for ContinueStatement inside for-in context', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ContinueStatement', label: null, loc: makeLoc(2, 2, 2, 11), parent: { type: 'ForInStatement' } })
      expect(reports.length).toBe(1)
    })

    test('reports for ContinueStatement inside for-of context', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ContinueStatement', label: null, loc: makeLoc(6, 10, 6, 19), parent: { type: 'ForOfStatement' } })
      expect(reports.length).toBe(1)
    })

    test('reports for ContinueStatement with range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ContinueStatement', label: null, loc: makeLoc(1, 0, 1, 9), range: [0, 9] })
      expect(reports.length).toBe(1)
    })

    test('reports for ContinueStatement with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      const node = {
        type: 'ContinueStatement',
        label: null,
        loc: makeLoc(1, 0, 1, 9),
        range: [0, 9],
        extra: true,
        _parent: {},
      }
      visitor.ContinueStatement(node)
      expect(reports.length).toBe(1)
    })

    test('reports for ContinueStatement with multi-char label', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ContinueStatement', label: { type: 'Identifier', name: 'outerLoop' }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement(makeContinueNode())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement(makeContinueNode())
      expect(reports[0].message).toBe('Unexpected continue statement.')
    })

    test('reports for ContinueStatement spanning multiple lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement(makeContinueNode(1, 8, 2, 0))
      expect(reports.length).toBe(1)
    })

    test('reports for ContinueStatement at end of file location', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement(makeContinueNode(500, 0, 500, 9))
      expect(reports.length).toBe(1)
    })

    test('reports for ContinueStatement inside nested loop context', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({
        type: 'ContinueStatement',
        label: null,
        loc: makeLoc(10, 12, 10, 21),
        parent: { type: 'ForStatement', parent: { type: 'WhileStatement' } },
      })
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      expect(() => visitor.ContinueStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      expect(() => visitor.ContinueStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      expect(() => visitor.ContinueStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BreakStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'BreakStatement', label: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 7) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ForStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ForStatement', init: null, test: null, update: null, body: {}, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for WhileStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'WhileStatement', test: {}, body: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for DoWhileStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'DoWhileStatement', test: {}, body: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ForInStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ForInStatement', left: {}, right: {}, body: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ForOfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ForOfStatement', left: {}, right: {}, body: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for SwitchStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'SwitchStatement', discriminant: {}, cases: [], loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ThrowStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ThrowStatement', argument: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for TryStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'TryStatement', block: {}, handler: null, finalizer: null, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ConditionalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      expect(() => visitor.ContinueStatement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      expect(() => visitor.ContinueStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      expect(() => visitor.ContinueStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      expect(() => visitor.ContinueStatement([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for node with lowercase "continuestatement" type', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'continuestatement', label: null, loc: makeLoc(1, 0, 1, 9) })
      expect(reports.length).toBe(0)
    })

    test('does not report for node with partial type "Continue"', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'Continue', label: null, loc: makeLoc(1, 0, 1, 8) })
      expect(reports.length).toBe(0)
    })

    test('does not report for LabeledStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'LabeledStatement', label: { type: 'Identifier', name: 'loop' }, body: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noContinueRule.create(ctx1)
      const visitor2 = noContinueRule.create(ctx2)
      visitor1.ContinueStatement(makeContinueNode())
      visitor2.ContinueStatement({ type: 'Identifier', name: 'x', loc: makeLoc(1, 0, 1, 1) })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement(makeContinueNode())
      visitor.ContinueStatement({ type: 'Identifier', name: 'x', loc: makeLoc(1, 0, 1, 1) })
      visitor.ContinueStatement(makeContinueNode())
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      const node = { type: 'ContinueStatement', label: null }
      visitor.ContinueStatement(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      const node = { type: 'ContinueStatement', label: null }
      visitor.ContinueStatement(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'Identifier', name: 'x' })
      visitor.ContinueStatement(makeContinueNode())
      visitor.ContinueStatement({ type: 'BreakStatement', label: null })
      visitor.ContinueStatement(makeContinueNode())
      visitor.ContinueStatement({ type: 'ReturnStatement', argument: null })
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noContinueRule.create(context)
      const visitor2 = noContinueRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noContinueRule.meta
      const meta2 = noContinueRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      const node = {
        type: 'ContinueStatement',
        label: null,
        loc: makeLoc(1, 0, 1, 9),
        range: [0, 9],
        extra: true,
        _parent: {},
      }
      visitor.ContinueStatement(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ContinueStatement', label: null, loc: {} })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ContinueStatement', label: null, loc: { start: { line: 3, column: 5 } } })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      const node = makeContinueNode()
      visitor.ContinueStatement(node)
      visitor.ContinueStatement(node)
      visitor.ContinueStatement(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noContinueRule).toBeDefined()
      expect(typeof noContinueRule.create).toBe('function')
      expect(typeof noContinueRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ContinueStatement', label: null, loc: makeLoc(1, 0, 1, 9), _parent: {} })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement(makeContinueNode())
      visitor.ContinueStatement(makeContinueNode(5, 2, 5, 11))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('node without label property still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ContinueStatement', loc: makeLoc(1, 0, 1, 9) })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement(makeContinueNode(10, 4, 10, 13))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(13)
    })

    test('does not report when type property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ label: null, loc: makeLoc(1, 0, 1, 9) })
      expect(reports.length).toBe(0)
    })

    test('does not report when type is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: null, label: null, loc: makeLoc(1, 0, 1, 9) })
      expect(reports.length).toBe(0)
    })

    test('does not report when type is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 42, label: null, loc: makeLoc(1, 0, 1, 9) })
      expect(reports.length).toBe(0)
    })

    test('does not report for node with type "CONTINUESTATEMENT" (all caps)', () => {
      const { context, reports } = createMockContext()
      const visitor = noContinueRule.create(context)
      visitor.ContinueStatement({ type: 'CONTINUESTATEMENT', label: null, loc: makeLoc(1, 0, 1, 9) })
      expect(reports.length).toBe(0)
    })
  })
})

import { describe, expect, test, vi } from 'vitest'
import { noExtraSemiRule } from '../../../../src/rules/patterns/no-extra-semi.js'
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
    getSource: () => ';',
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

function makeEmptyStatementNode(
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 1,
): unknown {
  return {
    type: 'EmptyStatement',
    _parent: { type: 'Program', body: [] },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-extra-semi rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noExtraSemiRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noExtraSemiRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noExtraSemiRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noExtraSemiRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noExtraSemiRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning semicolon', () => {
      const desc = noExtraSemiRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/semicolon/)
    })

    test('should have correct docs URL', () => {
      expect(noExtraSemiRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-extra-semi',
      )
    })

    test('should have empty schema', () => {
      expect(noExtraSemiRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with EmptyStatement', () => {
      const { context } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      expect(visitor).toHaveProperty('EmptyStatement')
      expect(typeof visitor.EmptyStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noExtraSemiRule).toBeDefined()
      expect(noExtraSemiRule.meta).toBeDefined()
      expect(noExtraSemiRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS EXTRA SEMICOLON (30) =====

  describe('positive cases — reports extra semicolon', () => {
    test('reports for basic EmptyStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement(makeEmptyStatementNode())
      expect(reports.length).toBe(1)
    })

    test('report message is "Unnecessary semicolon."', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement(makeEmptyStatementNode())
      expect(reports[0].message).toBe('Unnecessary semicolon.')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement(makeEmptyStatementNode())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement(makeEmptyStatementNode())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input EmptyStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      const node = makeEmptyStatementNode()
      visitor.EmptyStatement(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc reflects node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement(makeEmptyStatementNode(5, 10, 5, 11))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(11)
    })

    test('reports for EmptyStatement at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement(makeEmptyStatementNode(1, 0, 1, 1))
      expect(reports.length).toBe(1)
    })

    test('reports for EmptyStatement at line 10 column 5', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement(makeEmptyStatementNode(10, 5, 10, 6))
      expect(reports.length).toBe(1)
    })

    test('reports for EmptyStatement spanning multiple lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement(makeEmptyStatementNode(3, 0, 4, 1))
      expect(reports.length).toBe(1)
    })

    test('reports for EmptyStatement with _parent BlockStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({
        type: 'EmptyStatement',
        _parent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 1),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for EmptyStatement with _parent FunctionBody', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({
        type: 'EmptyStatement',
        _parent: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        loc: makeLoc(2, 4, 2, 5),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for EmptyStatement with _parent SwitchCase', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({
        type: 'EmptyStatement',
        _parent: { type: 'SwitchCase', consequent: [] },
        loc: makeLoc(7, 8, 7, 9),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for EmptyStatement at end of file (high line number)', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement(makeEmptyStatementNode(100, 0, 100, 1))
      expect(reports.length).toBe(1)
    })

    test('reports for EmptyStatement with range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({
        type: 'EmptyStatement',
        _parent: { type: 'Program', body: [] },
        loc: makeLoc(1, 0, 1, 1),
        range: [0, 1],
      })
      expect(reports.length).toBe(1)
    })

    test('reports for EmptyStatement with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({
        type: 'EmptyStatement',
        _parent: { type: 'Program', body: [] },
        loc: makeLoc(1, 0, 1, 1),
        extra: true,
        leadingComments: [],
        trailingComments: [],
      })
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement(makeEmptyStatementNode())
      visitor.EmptyStatement(makeEmptyStatementNode())
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement(makeEmptyStatementNode())
      visitor.EmptyStatement(makeEmptyStatementNode(2, 3, 2, 4))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for EmptyStatement with empty _parent body', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({
        type: 'EmptyStatement',
        _parent: { type: 'Program', body: [] },
        loc: makeLoc(1, 0, 1, 1),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for EmptyStatement at column 20', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement(makeEmptyStatementNode(1, 20, 1, 21))
      expect(reports.length).toBe(1)
    })

    test('reports for EmptyStatement at line 50 column 30', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement(makeEmptyStatementNode(50, 30, 50, 31))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement(makeEmptyStatementNode())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for EmptyStatement with _parent IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({
        type: 'EmptyStatement',
        _parent: { type: 'IfStatement', test: {}, consequent: {}, alternate: null },
        loc: makeLoc(3, 2, 3, 3),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for EmptyStatement with _parent ForStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({
        type: 'EmptyStatement',
        _parent: { type: 'ForStatement', init: null, test: null, update: null, body: {} },
        loc: makeLoc(4, 0, 4, 1),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for EmptyStatement with _parent WhileStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({
        type: 'EmptyStatement',
        _parent: { type: 'WhileStatement', test: {}, body: {} },
        loc: makeLoc(6, 2, 6, 3),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for EmptyStatement after variable declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({
        type: 'EmptyStatement',
        _parent: { type: 'Program', body: [{ type: 'VariableDeclaration', declarations: [], kind: 'const' }] },
        loc: makeLoc(2, 0, 2, 1),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for EmptyStatement after return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({
        type: 'EmptyStatement',
        _parent: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: null }] },
        loc: makeLoc(5, 4, 5, 5),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for EmptyStatement with zero column location', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement(makeEmptyStatementNode(1, 0, 1, 1))
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports for EmptyStatement with large column offset', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement(makeEmptyStatementNode(3, 80, 3, 81))
      expect(reports[0].loc?.start.column).toBe(80)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      const node = makeEmptyStatementNode()
      visitor.EmptyStatement(node)
      visitor.EmptyStatement(node)
      visitor.EmptyStatement(node)
      expect(reports.length).toBe(3)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement(makeEmptyStatementNode())
      visitor.EmptyStatement(makeEmptyStatementNode(2, 3, 2, 4))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report message is exactly "Unnecessary semicolon." for all cases', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement(makeEmptyStatementNode())
      visitor.EmptyStatement(makeEmptyStatementNode(10, 5, 10, 6))
      expect(reports[0].message).toBe('Unnecessary semicolon.')
      expect(reports[1].message).toBe('Unnecessary semicolon.')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (30) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      expect(() => visitor.EmptyStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      expect(() => visitor.EmptyStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      expect(() => visitor.EmptyStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'FunctionDeclaration', id: { type: 'Identifier', name: 'fn' }, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ForStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'ForStatement', init: null, test: null, update: null, body: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for WhileStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'WhileStatement', test: {}, body: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      expect(() => visitor.EmptyStatement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      expect(() => visitor.EmptyStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      expect(() => visitor.EmptyStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      expect(() => visitor.EmptyStatement([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ConditionalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for SwitchStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'SwitchStatement', discriminant: {}, cases: [], loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for TryStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'TryStatement', block: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ThrowStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'ThrowStatement', argument: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BreakStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'BreakStatement', label: null, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (24) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noExtraSemiRule.create(ctx1)
      const visitor2 = noExtraSemiRule.create(ctx2)
      visitor1.EmptyStatement(makeEmptyStatementNode())
      visitor2.EmptyStatement({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement(makeEmptyStatementNode())
      visitor.EmptyStatement({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      visitor.EmptyStatement(makeEmptyStatementNode(2, 3, 2, 4))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      const node = { type: 'EmptyStatement' }
      visitor.EmptyStatement(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      const node = { type: 'EmptyStatement' }
      visitor.EmptyStatement(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      visitor.EmptyStatement(makeEmptyStatementNode())
      visitor.EmptyStatement({ type: 'Identifier', name: 'x', loc: makeLoc(3, 0, 3, 1) })
      visitor.EmptyStatement(makeEmptyStatementNode(4, 0, 4, 1))
      visitor.EmptyStatement({ type: 'ReturnStatement', argument: null, loc: makeLoc(5, 0, 5, 6) })
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noExtraSemiRule.create(context)
      const visitor2 = noExtraSemiRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noExtraSemiRule.meta
      const meta2 = noExtraSemiRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'EmptyStatement', _parent: { type: 'Program', body: [] }, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'EmptyStatement', loc: {} })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'EmptyStatement', loc: { start: { line: 3, column: 5 } } })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('rule exports are correct', () => {
      expect(noExtraSemiRule).toBeDefined()
      expect(typeof noExtraSemiRule.create).toBe('function')
      expect(typeof noExtraSemiRule.meta).toBe('object')
    })

    test('EmptyStatement handler is synchronous', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      const result = visitor.EmptyStatement(makeEmptyStatementNode())
      expect(reports.length).toBe(1)
      expect(result).toBeUndefined()
    })

    test('handles node with range property alongside loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({
        type: 'EmptyStatement',
        loc: makeLoc(2, 4, 2, 5),
        range: [10, 11],
        _parent: { type: 'Program', body: [] },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(2)
    })

    test('handles node with leadingComments property', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({
        type: 'EmptyStatement',
        loc: makeLoc(1, 0, 1, 1),
        leadingComments: [{ type: 'Line', value: ' extra' }],
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with trailingComments property', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({
        type: 'EmptyStatement',
        loc: makeLoc(1, 0, 1, 1),
        trailingComments: [{ type: 'Block', value: ' extra' }],
      })
      expect(reports.length).toBe(1)
    })

    test('case sensitivity: "emptyStatement" does not match', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'emptyStatement', loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('case sensitivity: "EMPTYSTATEMENT" does not match', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'EMPTYSTATEMENT', loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('case sensitivity: "empty_statement" does not match', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement({ type: 'empty_statement', loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not crash when type is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      expect(() => visitor.EmptyStatement({ type: 42, loc: makeLoc(1, 0, 1, 1) })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not crash when type is a boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      expect(() => visitor.EmptyStatement({ type: true, loc: makeLoc(1, 0, 1, 1) })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not crash when type is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      expect(() => visitor.EmptyStatement({ type: null, loc: makeLoc(1, 0, 1, 1) })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not crash when type is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      expect(() => visitor.EmptyStatement({ type: undefined, loc: makeLoc(1, 0, 1, 1) })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExtraSemiRule.create(context)
      visitor.EmptyStatement(makeEmptyStatementNode(10, 4, 12, 6))
      expect(reports[0].loc?.end.line).toBe(12)
      expect(reports[0].loc?.end.column).toBe(6)
    })

    test('meta severity is not "error"', () => {
      expect(noExtraSemiRule.meta.severity).not.toBe('error')
    })

   })
})

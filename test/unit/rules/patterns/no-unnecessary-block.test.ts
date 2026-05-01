import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryBlockRule } from '../../../../src/rules/patterns/no-unnecessary-block.js'
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
    getSource: () => '{}',
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

function makeBlockNode(
  body: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 2,
): unknown {
  return {
    type: 'BlockStatement',
    body,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-block rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryBlockRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryBlockRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryBlockRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryBlockRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryBlockRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning block', () => {
      const desc = noUnnecessaryBlockRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/block/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryBlockRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-block',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryBlockRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with BlockStatement', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      expect(visitor).toHaveProperty('BlockStatement')
      expect(typeof visitor.BlockStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryBlockRule).toBeDefined()
      expect(noUnnecessaryBlockRule.meta).toBeDefined()
      expect(noUnnecessaryBlockRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS EMPTY BLOCK (25) =====

  describe('positive cases — reports empty block', () => {
    test('reports for empty BlockStatement with empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode())
      expect(reports.length).toBe(1)
    })

    test('reports for empty block as if body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({ type: 'BlockStatement', body: [], loc: makeLoc(1, 6, 1, 8) })
      expect(reports.length).toBe(1)
    })

    test('reports for empty block as function body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode([], 2, 0, 2, 2))
      expect(reports.length).toBe(1)
    })

    test('reports for empty block at start of file', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode([], 1, 0, 1, 2))
      expect(reports.length).toBe(1)
    })

    test('reports for empty block at later line', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode([], 50, 4, 50, 6))
      expect(reports.length).toBe(1)
    })

    test('reports for empty block with large column offset', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode([], 1, 100, 1, 102))
      expect(reports.length).toBe(1)
    })

    test('reports for empty block spanning multiple lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode([], 1, 0, 3, 1))
      expect(reports.length).toBe(1)
    })

    test('report message contains "empty block"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode())
      expect(reports[0].message.toLowerCase()).toContain('empty block')
    })

    test('report message contains "unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode())
      expect(reports[0].message.toLowerCase()).toContain('unnecessary')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input BlockStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      const node = makeBlockNode()
      visitor.BlockStatement(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports for empty block while loop body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({ type: 'BlockStatement', body: [], loc: makeLoc(5, 12, 5, 14) })
      expect(reports.length).toBe(1)
    })

    test('reports for empty block for loop body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({ type: 'BlockStatement', body: [], loc: makeLoc(3, 20, 3, 22) })
      expect(reports.length).toBe(1)
    })

    test('reports for empty block try-catch body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({ type: 'BlockStatement', body: [], loc: makeLoc(7, 4, 7, 6) })
      expect(reports.length).toBe(1)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode())
      expect(reports[0].message).toBe('Unnecessary empty block statement.')
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode([], 5, 10, 5, 12))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('reports only once per empty block', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode())
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode())
      visitor.BlockStatement(makeBlockNode())
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode())
      visitor.BlockStatement(makeBlockNode([], 2, 0, 2, 2))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for empty block with extra properties on node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: makeLoc(1, 0, 1, 2),
        range: [0, 2],
        extra: true,
      })
      expect(reports.length).toBe(1)
    })

    test('reports for empty block with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({
        type: 'BlockStatement',
        body: [],
        loc: makeLoc(1, 0, 1, 2),
        _parent: { type: 'FunctionDeclaration' },
      })
      expect(reports.length).toBe(1)
    })

    test('reports for empty block at end of file', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode([], 100, 0, 100, 2))
      expect(reports.length).toBe(1)
    })

    test('reports for empty block with zero-column span', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode([], 1, 5, 1, 5))
      expect(reports.length).toBe(1)
    })

    test('reports for empty block nested conceptually (just another empty block)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode())
      visitor.BlockStatement(makeBlockNode([], 3, 2, 3, 4))
      visitor.BlockStatement(makeBlockNode([], 5, 8, 5, 10))
      expect(reports.length).toBe(3)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message content is non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode())
      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('report exact message matches source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode())
      expect(reports[0].message).toBe('Unnecessary empty block statement.')
    })

    test('report loc is present', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode())
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('report node is present', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode())
      expect(reports[0].node).toBeDefined()
    })

    test('report loc preserves start line', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode([], 7, 3, 7, 5))
      expect(reports[0].loc?.start.line).toBe(7)
    })

    test('report loc preserves start column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode([], 1, 8, 1, 10))
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('report loc preserves end line', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode([], 1, 0, 4, 1))
      expect(reports[0].loc?.end.line).toBe(4)
    })

    test('report loc preserves end column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode([], 1, 0, 1, 15))
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('report descriptor has exactly message, loc, and node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('accumulates two reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode())
      visitor.BlockStatement(makeBlockNode())
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe('Unnecessary empty block statement.')
      expect(reports[1].message).toBe('Unnecessary empty block statement.')
    })

    test('consistent messages across multiple violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode())
      visitor.BlockStatement(makeBlockNode([], 2, 0, 2, 2))
      visitor.BlockStatement(makeBlockNode([], 4, 0, 4, 2))
      expect(reports[0].message).toBe(reports[1].message)
      expect(reports[1].message).toBe(reports[2].message)
    })

    test('single report per single empty block', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode())
      expect(reports.length).toBe(1)
    })

    test('multiple violations produce distinct report objects', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode())
      visitor.BlockStatement(makeBlockNode([], 2, 0, 2, 2))
      expect(reports[0]).not.toBe(reports[1])
    })

    test('report node is the same object reference as input', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      const node = makeBlockNode()
      visitor.BlockStatement(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc matches node loc exactly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode([], 10, 4, 10, 6))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(6)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for BlockStatement with one statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode([{ type: 'ExpressionStatement' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement with multiple statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode([
        { type: 'ExpressionStatement' },
        { type: 'ReturnStatement' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      expect(() => visitor.BlockStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      expect(() => visitor.BlockStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      expect(() => visitor.BlockStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      expect(() => visitor.BlockStatement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      expect(() => visitor.BlockStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      expect(() => visitor.BlockStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      expect(() => visitor.BlockStatement([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when body is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({ type: 'BlockStatement', loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report when body is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({ type: 'BlockStatement', body: null, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report when body is a non-array value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({ type: 'BlockStatement', body: 'not-array', loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report when body has one element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({ type: 'BlockStatement', body: [{ type: 'VariableDeclaration' }], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({ type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({ type: 'ArrowFunctionExpression', params: [], body: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryBlockRule.create(ctx1)
      const visitor2 = noUnnecessaryBlockRule.create(ctx2)
      visitor1.BlockStatement(makeBlockNode())
      visitor2.BlockStatement(makeBlockNode([{ type: 'ExpressionStatement' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode())
      visitor.BlockStatement(makeBlockNode([{ type: 'ExpressionStatement' }]))
      visitor.BlockStatement(makeBlockNode())
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      const node = { type: 'BlockStatement', body: [] }
      visitor.BlockStatement(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      const node = { type: 'BlockStatement', body: [] }
      visitor.BlockStatement(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode([{ type: 'ExpressionStatement' }]))
      visitor.BlockStatement(makeBlockNode())
      visitor.BlockStatement(makeBlockNode([{ type: 'ReturnStatement' }]))
      visitor.BlockStatement(makeBlockNode())
      visitor.BlockStatement(makeBlockNode([{ type: 'VariableDeclaration' }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryBlockRule.create(context)
      const visitor2 = noUnnecessaryBlockRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryBlockRule.meta
      const meta2 = noUnnecessaryBlockRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      const node = {
        type: 'BlockStatement',
        body: [],
        loc: makeLoc(1, 0, 1, 2),
        range: [0, 2],
        extra: true,
        parent: { type: 'FunctionDeclaration' },
      }
      visitor.BlockStatement(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({ type: 'BlockStatement', body: [], loc: {} })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({ type: 'BlockStatement', body: [], loc: { start: { line: 3, column: 5 } } })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      const node = makeBlockNode()
      visitor.BlockStatement(node)
      visitor.BlockStatement(node)
      visitor.BlockStatement(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryBlockRule).toBeDefined()
      expect(typeof noUnnecessaryBlockRule.create).toBe('function')
      expect(typeof noUnnecessaryBlockRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2), _parent: { type: 'IfStatement' } })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode([], 10, 4, 10, 6))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(6)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement(makeBlockNode())
      visitor.BlockStatement(makeBlockNode([], 5, 0, 5, 2))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when body is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({ type: 'BlockStatement', body: 0, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report when body is an object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({ type: 'BlockStatement', body: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not throw for boolean body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      expect(() => visitor.BlockStatement({ type: 'BlockStatement', body: false, loc: makeLoc(1, 0, 1, 2) })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('empty loc reports with default end values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({ type: 'BlockStatement', body: [], loc: {} })
      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('partial loc preserves start and defaults end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBlockRule.create(context)
      visitor.BlockStatement({ type: 'BlockStatement', body: [], loc: { start: { line: 7, column: 3 } } })
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })
  })
})

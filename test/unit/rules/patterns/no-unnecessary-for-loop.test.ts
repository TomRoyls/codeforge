import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryForLoopRule } from '../../../../src/rules/patterns/no-unnecessary-for-loop.js'
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
    getSource: () => 'for (;;) {}',
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

function makeForStatementNode(
  init: unknown = null,
  test: unknown = null,
  update: unknown = null,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'ForStatement',
    init,
    test,
    update,
    body: { type: 'BlockStatement', body: [] },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-for-loop rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryForLoopRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryForLoopRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryForLoopRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryForLoopRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryForLoopRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning for loop', () => {
      const desc = noUnnecessaryForLoopRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/for/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryForLoopRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-for-loop',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryForLoopRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ForStatement', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      expect(visitor).toHaveProperty('ForStatement')
      expect(typeof visitor.ForStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryForLoopRule).toBeDefined()
      expect(noUnnecessaryForLoopRule.meta).toBeDefined()
      expect(noUnnecessaryForLoopRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY FOR LOOP (25) =====

  describe('positive cases — reports unnecessary for loop', () => {
    test('reports for ForStatement with all null parts', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode())
      expect(reports.length).toBe(1)
    })

    test('reports for ForStatement with undefined init, test, update', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode(undefined, undefined, undefined))
      expect(reports.length).toBe(1)
    })

    test('reports for ForStatement with falsy 0 init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode(0, null, null))
      expect(reports.length).toBe(1)
    })

    test('report message mentions "Unnecessary for loop"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode())
      expect(reports[0].message).toContain('Unnecessary for loop')
    })

    test('report message mentions "no init, test, or update"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode())
      expect(reports[0].message).toContain('no init, test, or update')
    })

    test('report message suggests "while(true)"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode())
      expect(reports[0].message).toContain('while(true)')
    })

    test('report message suggests "refactor"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode())
      expect(reports[0].message.toLowerCase()).toContain('refactor')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode())
      expect(reports[0].message).toBe(
        'Unnecessary for loop with no init, test, or update. Use a while(true) or refactor.',
      )
    })

    test('reports for ForStatement at line 1 col 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode(null, null, null, 1, 0, 1, 10))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports for ForStatement at arbitrary location line 5 col 3', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode(null, null, null, 5, 3, 5, 20))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('reports for ForStatement with falsy empty string init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode('', null, null))
      expect(reports.length).toBe(1)
    })

    test('reports for ForStatement with falsy false init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode(false, null, null))
      expect(reports.length).toBe(1)
    })

    test('reports for node with extra body properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      const node = makeForStatementNode()
      visitor.ForStatement(node)
      expect(reports.length).toBe(1)
    })

    test('reports for node with large line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode(null, null, null, 500, 100, 500, 200))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(500)
    })

    test('reports for node at end of file', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode(null, null, null, 999, 0, 999, 15))
      expect(reports.length).toBe(1)
    })

    test('reports for node spanning multiple lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode(null, null, null, 3, 5, 7, 10))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.end.line).toBe(7)
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input ForStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      const node = makeForStatementNode()
      visitor.ForStatement(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode(null, null, null, 2, 4, 2, 25))
      expect(reports[0].loc?.end.line).toBe(2)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode())
      visitor.ForStatement(makeForStatementNode())
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode())
      visitor.ForStatement(makeForStatementNode())
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for node with only init missing (but test and update also null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode(null, null, null))
      expect(reports.length).toBe(1)
    })

    test('reports exactly once per node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode())
      expect(reports.length).toBe(1)
    })

    test('reports for node with range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      const node = {
        type: 'ForStatement',
        init: null,
        test: null,
        update: null,
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
      }
      visitor.ForStatement(node)
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report descriptor has message property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode())
      expect(reports[0]).toHaveProperty('message')
    })

    test('report descriptor has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode())
      expect(reports[0]).toHaveProperty('loc')
    })

    test('report descriptor has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode())
      expect(reports[0]).toHaveProperty('node')
    })

    test('report loc start has line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode(null, null, null, 4, 2, 4, 15))
      expect(reports[0].loc?.start).toHaveProperty('line', 4)
      expect(reports[0].loc?.start).toHaveProperty('column', 2)
    })

    test('report loc end has line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode(null, null, null, 1, 0, 3, 5))
      expect(reports[0].loc?.end).toHaveProperty('line', 3)
      expect(reports[0].loc?.end).toHaveProperty('column', 5)
    })

    test('report message is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode())
      expect(typeof reports[0].message).toBe('string')
    })

    test('report message is non-empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode())
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('report node is the ForStatement node object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      const node = makeForStatementNode()
      visitor.ForStatement(node)
      expect(typeof reports[0].node).toBe('object')
    })

    test('report loc start line is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode())
      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('report loc start column is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode())
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('report loc end line is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode())
      expect(typeof reports[0].loc?.end.line).toBe('number')
    })

    test('report loc end column is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode())
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('report loc values match node loc values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode(null, null, null, 10, 4, 12, 8))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(12)
      expect(reports[0].loc?.end.column).toBe(8)
    })

    test('multiple reports preserve individual loc values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode(null, null, null, 1, 0, 1, 10))
      visitor.ForStatement(makeForStatementNode(null, null, null, 5, 2, 5, 20))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
    })

    test('report descriptor has exactly three properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode())
      expect(Object.keys(reports[0]).length).toBe(3)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for ForStatement with init only', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode({ type: 'AssignmentExpression' }, null, null))
      expect(reports.length).toBe(0)
    })

    test('does not report for ForStatement with test only', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode(null, { type: 'BinaryExpression' }, null))
      expect(reports.length).toBe(0)
    })

    test('does not report for ForStatement with update only', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode(null, null, { type: 'UpdateExpression' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ForStatement with init and test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode({ type: 'AssignmentExpression' }, { type: 'BinaryExpression' }, null))
      expect(reports.length).toBe(0)
    })

    test('does not report for ForStatement with init and update', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode({ type: 'AssignmentExpression' }, null, { type: 'UpdateExpression' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ForStatement with test and update', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode(null, { type: 'BinaryExpression' }, { type: 'UpdateExpression' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ForStatement with all three parts', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode({ type: 'AssignmentExpression' }, { type: 'BinaryExpression' }, { type: 'UpdateExpression' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      expect(() => visitor.ForStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      expect(() => visitor.ForStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      expect(() => visitor.ForStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for WhileStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement({ type: 'WhileStatement', test: {}, body: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for DoWhileStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement({ type: 'DoWhileStatement', test: {}, body: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ForInStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement({ type: 'ForInStatement', left: {}, right: {}, body: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ForOfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement({ type: 'ForOfStatement', left: {}, right: {}, body: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement({ type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      expect(() => visitor.ForStatement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      expect(() => visitor.ForStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      expect(() => visitor.ForStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      expect(() => visitor.ForStatement([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for ForStatement with object init value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement({
        type: 'ForStatement',
        init: { type: 'Literal', value: 0 },
        test: null,
        update: null,
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ForStatement with object test value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement({
        type: 'ForStatement',
        init: null,
        test: { type: 'Literal', value: 0 },
        update: null,
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ForStatement with object update value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement({
        type: 'ForStatement',
        init: null,
        test: null,
        update: { type: 'Literal', value: 0 },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryForLoopRule.create(ctx1)
      const visitor2 = noUnnecessaryForLoopRule.create(ctx2)
      visitor1.ForStatement(makeForStatementNode())
      visitor2.ForStatement(makeForStatementNode({ type: 'AssignmentExpression' }, null, null))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode())
      visitor.ForStatement(makeForStatementNode({ type: 'AssignmentExpression' }, null, null))
      visitor.ForStatement(makeForStatementNode())
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      const node = { type: 'ForStatement', init: null, test: null, update: null }
      visitor.ForStatement(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      const node = { type: 'ForStatement', init: null, test: null, update: null }
      visitor.ForStatement(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode({ type: 'AssignmentExpression' }, null, null))
      visitor.ForStatement(makeForStatementNode())
      visitor.ForStatement(makeForStatementNode(null, { type: 'BinaryExpression' }, null))
      visitor.ForStatement(makeForStatementNode())
      visitor.ForStatement(makeForStatementNode(null, null, { type: 'UpdateExpression' }))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryForLoopRule.create(context)
      const visitor2 = noUnnecessaryForLoopRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryForLoopRule.meta
      const meta2 = noUnnecessaryForLoopRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      const node = {
        type: 'ForStatement',
        init: null,
        test: null,
        update: null,
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        leadingComments: [],
      }
      visitor.ForStatement(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement({ type: 'ForStatement', init: null, test: null, update: null, loc: {} })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement({ type: 'ForStatement', init: null, test: null, update: null, loc: { start: { line: 3, column: 5 } } })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      const node = makeForStatementNode()
      visitor.ForStatement(node)
      visitor.ForStatement(node)
      visitor.ForStatement(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryForLoopRule).toBeDefined()
      expect(typeof noUnnecessaryForLoopRule.create).toBe('function')
      expect(typeof noUnnecessaryForLoopRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement({ type: 'ForStatement', init: null, test: null, update: null, body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 10), _parent: {} })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode())
      visitor.ForStatement(makeForStatementNode())
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles node with nested body containing statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      const node = {
        type: 'ForStatement',
        init: null,
        test: null,
        update: null,
        body: { type: 'BlockStatement', body: [{ type: 'ExpressionStatement', expression: {} }] },
        loc: makeLoc(1, 0, 3, 1),
      }
      visitor.ForStatement(node)
      expect(reports.length).toBe(1)
    })

    test('does not report for ForStatement with truthy init object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement({
        type: 'ForStatement',
        init: { type: 'Literal', value: '' },
        test: null,
        update: null,
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ForStatement with truthy test object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement({
        type: 'ForStatement',
        init: null,
        test: { type: 'Literal', value: '' },
        update: null,
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ForStatement with truthy update object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement({
        type: 'ForStatement',
        init: null,
        test: null,
        update: { type: 'Literal', value: '' },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForLoopRule.create(context)
      visitor.ForStatement(makeForStatementNode(null, null, null, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })
  })
})

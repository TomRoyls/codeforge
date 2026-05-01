import { describe, expect, test, vi } from 'vitest'
import { noRestrictedSyntaxRule } from '../../../../src/rules/patterns/no-restricted-syntax.js'
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

// ===== META TESTS (8) =====

describe('no-restricted-syntax rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noRestrictedSyntaxRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noRestrictedSyntaxRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noRestrictedSyntaxRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noRestrictedSyntaxRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noRestrictedSyntaxRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning syntax', () => {
      const desc = noRestrictedSyntaxRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/syntax/)
    })

    test('should have correct docs URL', () => {
      expect(noRestrictedSyntaxRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-restricted-syntax',
      )
    })

    test('should have empty schema', () => {
      expect(noRestrictedSyntaxRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with enterNode', () => {
      const { context } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      expect(visitor).toHaveProperty('enterNode')
      expect(typeof visitor.enterNode).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noRestrictedSyntaxRule).toBeDefined()
      expect(noRestrictedSyntaxRule.meta).toBeDefined()
      expect(noRestrictedSyntaxRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — WITH STATEMENT (12) =====

  describe('positive cases — WithStatement', () => {
    test('reports WithStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'WithStatement', object: {}, body: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(1)
    })

    test('report message for WithStatement is correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'WithStatement', object: {}, body: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports[0].message).toBe("Unexpected 'WithStatement' syntax.")
    })

    test('report for WithStatement has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'WithStatement', object: {}, body: {}, loc: makeLoc(2, 5, 2, 15) })
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('report for WithStatement has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      const node = { type: 'WithStatement', object: {}, body: {}, loc: makeLoc(1, 0, 1, 10) }
      visitor.enterNode(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports WithStatement at various line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'WithStatement', object: {}, body: {}, loc: makeLoc(50, 0, 50, 10) })
      expect(reports[0].loc?.start.line).toBe(50)
    })

    test('reports WithStatement with high column offset', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'WithStatement', object: {}, body: {}, loc: makeLoc(1, 100, 1, 120) })
      expect(reports[0].loc?.start.column).toBe(100)
      expect(reports[0].loc?.end.column).toBe(120)
    })

    test('reports WithStatement without loc using default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'WithStatement', object: {}, body: {} })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports WithStatement with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'WithStatement', object: {}, body: {}, loc: makeLoc(1, 0, 1, 10), range: [0, 10], extra: true })
      expect(reports.length).toBe(1)
    })

    test('reports multiple WithStatements in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'WithStatement', object: {}, body: {}, loc: makeLoc(1, 0, 1, 10) })
      visitor.enterNode({ type: 'WithStatement', object: {}, body: {}, loc: makeLoc(2, 0, 2, 10) })
      visitor.enterNode({ type: 'WithStatement', object: {}, body: {}, loc: makeLoc(3, 0, 3, 10) })
      expect(reports.length).toBe(3)
    })

    test('all WithStatement reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'WithStatement', object: {}, body: {}, loc: makeLoc(1, 0, 1, 10) })
      visitor.enterNode({ type: 'WithStatement', object: {}, body: {}, loc: makeLoc(5, 0, 5, 10) })
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor for WithStatement has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'WithStatement', object: {}, body: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('same WithStatement node reported on repeated visits', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      const node = { type: 'WithStatement', object: {}, body: {}, loc: makeLoc(1, 0, 1, 10) }
      visitor.enterNode(node)
      visitor.enterNode(node)
      expect(reports.length).toBe(2)
    })
  })

  // ===== POSITIVE CASES — DEBUGGER STATEMENT (12) =====

  describe('positive cases — DebuggerStatement', () => {
    test('reports DebuggerStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'DebuggerStatement', loc: makeLoc(1, 0, 1, 9) })
      expect(reports.length).toBe(1)
    })

    test('report message for DebuggerStatement is correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'DebuggerStatement', loc: makeLoc(1, 0, 1, 9) })
      expect(reports[0].message).toBe("Unexpected 'DebuggerStatement' syntax.")
    })

    test('report for DebuggerStatement has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'DebuggerStatement', loc: makeLoc(7, 4, 7, 13) })
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('report for DebuggerStatement has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      const node = { type: 'DebuggerStatement', loc: makeLoc(1, 0, 1, 9) }
      visitor.enterNode(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports DebuggerStatement at various line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'DebuggerStatement', loc: makeLoc(99, 0, 99, 9) })
      expect(reports[0].loc?.start.line).toBe(99)
    })

    test('reports DebuggerStatement with zero column offset', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'DebuggerStatement', loc: makeLoc(1, 0, 1, 9) })
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports DebuggerStatement without loc using default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'DebuggerStatement' })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('reports DebuggerStatement with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'DebuggerStatement', loc: makeLoc(1, 0, 1, 9), trailingComments: [] })
      expect(reports.length).toBe(1)
    })

    test('reports multiple DebuggerStatements in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'DebuggerStatement', loc: makeLoc(1, 0, 1, 9) })
      visitor.enterNode({ type: 'DebuggerStatement', loc: makeLoc(2, 0, 2, 9) })
      expect(reports.length).toBe(2)
    })

    test('all DebuggerStatement reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'DebuggerStatement', loc: makeLoc(1, 0, 1, 9) })
      visitor.enterNode({ type: 'DebuggerStatement', loc: makeLoc(5, 0, 5, 9) })
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor for DebuggerStatement has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'DebuggerStatement', loc: makeLoc(1, 0, 1, 9) })
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('same DebuggerStatement node reported on repeated visits', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      const node = { type: 'DebuggerStatement', loc: makeLoc(1, 0, 1, 9) }
      visitor.enterNode(node)
      visitor.enterNode(node)
      visitor.enterNode(node)
      expect(reports.length).toBe(3)
    })
  })

  // ===== POSITIVE CASES — LABELED STATEMENT (12) =====

  describe('positive cases — LabeledStatement', () => {
    test('reports LabeledStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'LabeledStatement', label: { type: 'Identifier', name: 'loop' }, body: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(1)
    })

    test('report message for LabeledStatement is correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'LabeledStatement', label: {}, body: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports[0].message).toBe("Unexpected 'LabeledStatement' syntax.")
    })

    test('report for LabeledStatement has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'LabeledStatement', label: {}, body: {}, loc: makeLoc(3, 8, 3, 20) })
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('report for LabeledStatement has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      const node = { type: 'LabeledStatement', label: {}, body: {}, loc: makeLoc(1, 0, 1, 15) }
      visitor.enterNode(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports LabeledStatement at various line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'LabeledStatement', label: {}, body: {}, loc: makeLoc(42, 0, 42, 10) })
      expect(reports[0].loc?.start.line).toBe(42)
    })

    test('reports LabeledStatement with high column offset', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'LabeledStatement', label: {}, body: {}, loc: makeLoc(1, 80, 1, 100) })
      expect(reports[0].loc?.start.column).toBe(80)
    })

    test('reports LabeledStatement without loc using default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'LabeledStatement', label: {}, body: {} })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports LabeledStatement with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'LabeledStatement', label: {}, body: {}, loc: makeLoc(1, 0, 1, 15), range: [0, 15], innerComments: [] })
      expect(reports.length).toBe(1)
    })

    test('reports multiple LabeledStatements in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'LabeledStatement', label: {}, body: {}, loc: makeLoc(1, 0, 1, 10) })
      visitor.enterNode({ type: 'LabeledStatement', label: {}, body: {}, loc: makeLoc(5, 0, 5, 10) })
      expect(reports.length).toBe(2)
    })

    test('all LabeledStatement reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'LabeledStatement', label: {}, body: {}, loc: makeLoc(1, 0, 1, 10) })
      visitor.enterNode({ type: 'LabeledStatement', label: {}, body: {}, loc: makeLoc(5, 0, 5, 10) })
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor for LabeledStatement has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'LabeledStatement', label: {}, body: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('same LabeledStatement node reported on repeated visits', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      const node = { type: 'LabeledStatement', label: {}, body: {}, loc: makeLoc(1, 0, 1, 15) }
      visitor.enterNode(node)
      visitor.enterNode(node)
      expect(reports.length).toBe(2)
    })
  })

  // ===== MIXED POSITIVE CASES (6) =====

  describe('positive cases — mixed restricted types', () => {
    test('reports all three restricted types together', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'WithStatement', object: {}, body: {}, loc: makeLoc(1, 0, 1, 10) })
      visitor.enterNode({ type: 'DebuggerStatement', loc: makeLoc(2, 0, 2, 9) })
      visitor.enterNode({ type: 'LabeledStatement', label: {}, body: {}, loc: makeLoc(3, 0, 3, 15) })
      expect(reports.length).toBe(3)
    })

    test('each restricted type has correct message', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'WithStatement', object: {}, body: {}, loc: makeLoc(1, 0, 1, 10) })
      visitor.enterNode({ type: 'DebuggerStatement', loc: makeLoc(2, 0, 2, 9) })
      visitor.enterNode({ type: 'LabeledStatement', label: {}, body: {}, loc: makeLoc(3, 0, 3, 15) })
      expect(reports[0].message).toBe("Unexpected 'WithStatement' syntax.")
      expect(reports[1].message).toBe("Unexpected 'DebuggerStatement' syntax.")
      expect(reports[2].message).toBe("Unexpected 'LabeledStatement' syntax.")
    })

    test('accumulates reports across mixed types', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'WithStatement', object: {}, body: {}, loc: makeLoc(1, 0, 1, 10) })
      visitor.enterNode({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(2, 0, 2, 20) })
      visitor.enterNode({ type: 'DebuggerStatement', loc: makeLoc(3, 0, 3, 9) })
      expect(reports.length).toBe(2)
    })

    test('handles empty loc object for restricted types', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'WithStatement', object: {}, body: {}, loc: {} })
      expect(reports.length).toBe(1)
    })

    test('handles partial loc for restricted types', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'DebuggerStatement', loc: { start: { line: 5, column: 3 } } })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'LabeledStatement', label: {}, body: {}, loc: makeLoc(10, 4, 10, 20) })
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(20)
    })
  })

  // ===== NEGATIVE CASES — NON-RESTRICTED NODE TYPES (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ForStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'ForStatement', init: null, test: null, update: null, body: {}, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for WhileStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'WhileStatement', test: {}, body: {}, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ForInStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'ForInStatement', left: {}, right: {}, body: {}, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ForOfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'ForOfStatement', left: {}, right: {}, body: {}, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for DoWhileStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'DoWhileStatement', test: {}, body: {}, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for SwitchStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'SwitchStatement', discriminant: {}, cases: [], loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for TryStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'TryStatement', block: {}, handler: null, finalizer: null, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ThrowStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'ThrowStatement', argument: {}, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BreakStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'BreakStatement', label: null, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ContinueStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'ContinueStatement', label: null, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'VariableDeclaration', declarations: [], kind: 'let', loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'FunctionDeclaration', id: null, params: [], body: {}, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ClassDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'ClassDeclaration', id: null, superClass: null, body: {}, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'ArrowFunctionExpression', params: [], body: {}, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — EDGE / INVALID INPUTS (10) =====

  describe('negative cases — edge inputs', () => {
    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode(null)
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode(undefined)
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode('not a node')
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode(42)
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode(true)
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({})
      expect(reports.length).toBe(0)
    })

    test('does not report for array', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode([])
      expect(reports.length).toBe(0)
    })

    test('does not report for case-variant "withstatement"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'withstatement', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for case-variant "DEBUGGERSTATEMENT"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'DEBUGGERSTATEMENT', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for node with null type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: null, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (8) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noRestrictedSyntaxRule.create(ctx1)
      const visitor2 = noRestrictedSyntaxRule.create(ctx2)
      visitor1.enterNode({ type: 'WithStatement', object: {}, body: {}, loc: makeLoc(1, 0, 1, 10) })
      visitor2.enterNode({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 20) })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noRestrictedSyntaxRule.create(context)
      const visitor2 = noRestrictedSyntaxRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noRestrictedSyntaxRule.meta
      const meta2 = noRestrictedSyntaxRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule exports are correct', () => {
      expect(noRestrictedSyntaxRule).toBeDefined()
      expect(typeof noRestrictedSyntaxRule.create).toBe('function')
      expect(typeof noRestrictedSyntaxRule.meta).toBe('object')
    })

    test('mixed valid/invalid nodes count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 20) })
      visitor.enterNode({ type: 'WithStatement', object: {}, body: {}, loc: makeLoc(2, 0, 2, 10) })
      visitor.enterNode({ type: 'ForStatement', init: null, test: null, update: null, body: {}, loc: makeLoc(3, 0, 3, 20) })
      visitor.enterNode({ type: 'DebuggerStatement', loc: makeLoc(4, 0, 4, 9) })
      visitor.enterNode({ type: 'ReturnStatement', argument: null, loc: makeLoc(5, 0, 5, 20) })
      expect(reports.length).toBe(2)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: 'WithStatement', object: {}, body: {}, loc: makeLoc(1, 0, 1, 10), _parent: {} })
      expect(reports.length).toBe(1)
    })

    test('enterNode does not throw for any input', () => {
      const { context } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      expect(() => visitor.enterNode(null)).not.toThrow()
      expect(() => visitor.enterNode(undefined)).not.toThrow()
      expect(() => visitor.enterNode('string')).not.toThrow()
      expect(() => visitor.enterNode(123)).not.toThrow()
      expect(() => visitor.enterNode({})).not.toThrow()
    })

    test('does not report for node with undefined type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedSyntaxRule.create(context)
      visitor.enterNode({ type: undefined, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })
  })
})

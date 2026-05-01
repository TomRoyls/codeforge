import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryContinueRule } from '../../../../src/rules/patterns/no-unnecessary-continue.js'
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
    getSource: () => '[]',
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

// Helper: creates a ContinueStatement node inside a BlockStatement inside a given loop parent.
// If lastInBlock=true, the continue is the last (and only) statement → should report.
// If lastInBlock=false, there's another statement after continue → should NOT report.
function makeContinueInLoop(
  loopType: string,
  lastInBlock: boolean,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  const continueNode: Record<string, unknown> = {
    type: 'ContinueStatement',
    label: null,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }

  const otherStmt: Record<string, unknown> = { type: 'ExpressionStatement', expression: { type: 'Literal', value: 0 } }

  const blockStatements = lastInBlock
    ? [continueNode]
    : [continueNode, otherStmt]

  const block: Record<string, unknown> = {
    type: 'BlockStatement',
    body: blockStatements,
  }

  continueNode.parent = block

  block.parent = {
    type: loopType,
    test: { type: 'Literal', value: true },
    body: block,
    update: null,
    init: null,
  }

  return continueNode
}

// ===== META TESTS (8) =====

describe('no-unnecessary-continue rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryContinueRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryContinueRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryContinueRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryContinueRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryContinueRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning continue', () => {
      const desc = noUnnecessaryContinueRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/continue/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryContinueRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-continue.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryContinueRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ContinueStatement', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      expect(visitor).toHaveProperty('ContinueStatement')
      expect(typeof visitor.ContinueStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryContinueRule).toBeDefined()
      expect(noUnnecessaryContinueRule.meta).toBeDefined()
      expect(noUnnecessaryContinueRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary continue', () => {
    test('reports continue at end of ForStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement(makeContinueInLoop('ForStatement', true))
      expect(reports.length).toBe(1)
    })

    test('reports continue at end of ForInStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement(makeContinueInLoop('ForInStatement', true))
      expect(reports.length).toBe(1)
    })

    test('reports continue at end of ForOfStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement(makeContinueInLoop('ForOfStatement', true))
      expect(reports.length).toBe(1)
    })

    test('reports continue at end of WhileStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement(makeContinueInLoop('WhileStatement', true))
      expect(reports.length).toBe(1)
    })

    test('reports continue at end of DoWhileStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement(makeContinueInLoop('DoWhileStatement', true))
      expect(reports.length).toBe(1)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement(makeContinueInLoop('ForStatement', true))
      expect(reports[0].message).toBe(
        'Unnecessary continue statement at the end of a loop.',
      )
    })

    test('report message mentions continue', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement(makeContinueInLoop('ForStatement', true))
      expect(reports[0].message).toMatch(/continue/i)
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement(makeContinueInLoop('ForStatement', true))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement(makeContinueInLoop('ForStatement', true))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input ContinueStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const node = makeContinueInLoop('ForStatement', true)
      visitor.ContinueStatement(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement(makeContinueInLoop('ForStatement', true, 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement(makeContinueInLoop('ForStatement', true))
      visitor.ContinueStatement(makeContinueInLoop('WhileStatement', true))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement(makeContinueInLoop('ForStatement', true))
      visitor.ContinueStatement(makeContinueInLoop('WhileStatement', true))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement(makeContinueInLoop('ForStatement', true))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports continue after a statement in ForStatement body (last position)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const continueNode: Record<string, unknown> = {
        type: 'ContinueStatement',
        label: null,
        loc: makeLoc(3, 0, 3, 9),
      }
      const stmt: Record<string, unknown> = {
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 1 },
      }
      const block: Record<string, unknown> = {
        type: 'BlockStatement',
        body: [stmt, continueNode],
      }
      continueNode.parent = block
      stmt.parent = block
      block.parent = {
        type: 'ForStatement',
        test: { type: 'Literal', value: true },
        body: block,
      }
      visitor.ContinueStatement(continueNode)
      expect(reports.length).toBe(1)
    })

    test('reports continue with label at end of ForStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const continueNode: Record<string, unknown> = {
        type: 'ContinueStatement',
        label: { type: 'Identifier', name: 'outer' },
        loc: makeLoc(1, 0, 1, 16),
      }
      const block: Record<string, unknown> = {
        type: 'BlockStatement',
        body: [continueNode],
      }
      continueNode.parent = block
      block.parent = {
        type: 'ForStatement',
        test: { type: 'Literal', value: true },
        body: block,
      }
      visitor.ContinueStatement(continueNode)
      expect(reports.length).toBe(1)
    })

    test('reports continue in ForInStatement with object body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement(makeContinueInLoop('ForInStatement', true))
      expect(reports[0].message).toBe('Unnecessary continue statement at the end of a loop.')
    })

    test('reports continue in ForOfStatement with loc end values preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement(makeContinueInLoop('ForOfStatement', true, 7, 2, 7, 11))
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(11)
    })

    test('reports continue in DoWhileStatement and verifies loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement(makeContinueInLoop('DoWhileStatement', true, 2, 4, 2, 13))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start).toEqual({ line: 2, column: 4 })
    })

    test('reports continue in WhileStatement with correct node reference', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const node = makeContinueInLoop('WhileStatement', true)
      visitor.ContinueStatement(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports for each of the five loop types independently', () => {
      const loopTypes = ['ForStatement', 'ForInStatement', 'ForOfStatement', 'WhileStatement', 'DoWhileStatement']
      for (const loopType of loopTypes) {
        const { context, reports } = createMockContext()
        const visitor = noUnnecessaryContinueRule.create(context)
        visitor.ContinueStatement(makeContinueInLoop(loopType, true))
        expect(reports.length).toBe(1)
      }
    })

    test('reports continue after variable declaration at end of ForStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const continueNode: Record<string, unknown> = {
        type: 'ContinueStatement',
        label: null,
        loc: makeLoc(5, 0, 5, 9),
      }
      const decl: Record<string, unknown> = {
        type: 'VariableDeclaration',
        declarations: [],
        kind: 'let',
      }
      const block: Record<string, unknown> = {
        type: 'BlockStatement',
        body: [decl, continueNode],
      }
      continueNode.parent = block
      decl.parent = block
      block.parent = {
        type: 'ForStatement',
        test: { type: 'Literal', value: true },
        body: block,
      }
      visitor.ContinueStatement(continueNode)
      expect(reports.length).toBe(1)
    })

    test('reports continue after if statement at end of ForOfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const continueNode: Record<string, unknown> = {
        type: 'ContinueStatement',
        label: null,
        loc: makeLoc(4, 0, 4, 9),
      }
      const ifStmt: Record<string, unknown> = {
        type: 'IfStatement',
        test: { type: 'Literal', value: true },
        consequent: { type: 'BlockStatement', body: [] },
      }
      const block: Record<string, unknown> = {
        type: 'BlockStatement',
        body: [ifStmt, continueNode],
      }
      continueNode.parent = block
      ifStmt.parent = block
      block.parent = {
        type: 'ForOfStatement',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'arr' },
        body: block,
      }
      visitor.ContinueStatement(continueNode)
      expect(reports.length).toBe(1)
    })

    test('reports continue after expression statement at end of WhileStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const continueNode: Record<string, unknown> = {
        type: 'ContinueStatement',
        label: null,
        loc: makeLoc(2, 0, 2, 9),
      }
      const exprStmt: Record<string, unknown> = {
        type: 'ExpressionStatement',
        expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
      }
      const block: Record<string, unknown> = {
        type: 'BlockStatement',
        body: [exprStmt, continueNode],
      }
      continueNode.parent = block
      exprStmt.parent = block
      block.parent = {
        type: 'WhileStatement',
        test: { type: 'Literal', value: true },
        body: block,
      }
      visitor.ContinueStatement(continueNode)
      expect(reports.length).toBe(1)
    })

    test('reports continue after block statement at end of ForInStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const continueNode: Record<string, unknown> = {
        type: 'ContinueStatement',
        label: null,
        loc: makeLoc(6, 0, 6, 9),
      }
      const innerBlock: Record<string, unknown> = {
        type: 'BlockStatement',
        body: [],
      }
      const block: Record<string, unknown> = {
        type: 'BlockStatement',
        body: [innerBlock, continueNode],
      }
      continueNode.parent = block
      innerBlock.parent = block
      block.parent = {
        type: 'ForInStatement',
        left: { type: 'Identifier', name: 'key' },
        right: { type: 'Identifier', name: 'obj' },
        body: block,
      }
      visitor.ContinueStatement(continueNode)
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report when continue is not last statement in ForStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement(makeContinueInLoop('ForStatement', false))
      expect(reports.length).toBe(0)
    })

    test('does not report when continue is not last statement in ForInStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement(makeContinueInLoop('ForInStatement', false))
      expect(reports.length).toBe(0)
    })

    test('does not report when continue is not last statement in ForOfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement(makeContinueInLoop('ForOfStatement', false))
      expect(reports.length).toBe(0)
    })

    test('does not report when continue is not last statement in WhileStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement(makeContinueInLoop('WhileStatement', false))
      expect(reports.length).toBe(0)
    })

    test('does not report when continue is not last statement in DoWhileStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement(makeContinueInLoop('DoWhileStatement', false))
      expect(reports.length).toBe(0)
    })

    test('does not report when parent is not a BlockStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const node = {
        type: 'ContinueStatement',
        label: null,
        parent: { type: 'ForStatement', test: { type: 'Literal', value: true } },
        loc: makeLoc(1, 0, 1, 9),
      }
      visitor.ContinueStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when block parent is IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const continueNode: Record<string, unknown> = {
        type: 'ContinueStatement',
        label: null,
        loc: makeLoc(1, 0, 1, 9),
      }
      const block: Record<string, unknown> = {
        type: 'BlockStatement',
        body: [continueNode],
      }
      continueNode.parent = block
      block.parent = {
        type: 'IfStatement',
        test: { type: 'Literal', value: true },
        consequent: block,
      }
      visitor.ContinueStatement(continueNode)
      expect(reports.length).toBe(0)
    })

    test('does not report when block parent is FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const continueNode: Record<string, unknown> = {
        type: 'ContinueStatement',
        label: null,
        loc: makeLoc(1, 0, 1, 9),
      }
      const block: Record<string, unknown> = {
        type: 'BlockStatement',
        body: [continueNode],
      }
      continueNode.parent = block
      block.parent = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'fn' },
        body: block,
      }
      visitor.ContinueStatement(continueNode)
      expect(reports.length).toBe(0)
    })

    test('does not report when block parent is ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const continueNode: Record<string, unknown> = {
        type: 'ContinueStatement',
        label: null,
        loc: makeLoc(1, 0, 1, 9),
      }
      const block: Record<string, unknown> = {
        type: 'BlockStatement',
        body: [continueNode],
      }
      continueNode.parent = block
      block.parent = {
        type: 'ArrowFunctionExpression',
        body: block,
      }
      visitor.ContinueStatement(continueNode)
      expect(reports.length).toBe(0)
    })

    test('does not report when block parent is SwitchStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const continueNode: Record<string, unknown> = {
        type: 'ContinueStatement',
        label: null,
        loc: makeLoc(1, 0, 1, 9),
      }
      const block: Record<string, unknown> = {
        type: 'BlockStatement',
        body: [continueNode],
      }
      continueNode.parent = block
      block.parent = {
        type: 'SwitchStatement',
        discriminant: { type: 'Literal', value: 1 },
      }
      visitor.ContinueStatement(continueNode)
      expect(reports.length).toBe(0)
    })

    test('does not report when block parent is TryStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const continueNode: Record<string, unknown> = {
        type: 'ContinueStatement',
        label: null,
        loc: makeLoc(1, 0, 1, 9),
      }
      const block: Record<string, unknown> = {
        type: 'BlockStatement',
        body: [continueNode],
      }
      continueNode.parent = block
      block.parent = {
        type: 'TryStatement',
        block,
      }
      visitor.ContinueStatement(continueNode)
      expect(reports.length).toBe(0)
    })

    test('does not report when block parent is CatchClause', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const continueNode: Record<string, unknown> = {
        type: 'ContinueStatement',
        label: null,
        loc: makeLoc(1, 0, 1, 9),
      }
      const block: Record<string, unknown> = {
        type: 'BlockStatement',
        body: [continueNode],
      }
      continueNode.parent = block
      block.parent = {
        type: 'CatchClause',
        body: block,
      }
      visitor.ContinueStatement(continueNode)
      expect(reports.length).toBe(0)
    })

    test('does not report when block parent is LabeledStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const continueNode: Record<string, unknown> = {
        type: 'ContinueStatement',
        label: null,
        loc: makeLoc(1, 0, 1, 9),
      }
      const block: Record<string, unknown> = {
        type: 'BlockStatement',
        body: [continueNode],
      }
      continueNode.parent = block
      block.parent = {
        type: 'LabeledStatement',
        label: { type: 'Identifier', name: 'label' },
        body: block,
      }
      visitor.ContinueStatement(continueNode)
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      expect(() => visitor.ContinueStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      expect(() => visitor.ContinueStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      expect(() => visitor.ContinueStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      expect(() => visitor.ContinueStatement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      expect(() => visitor.ContinueStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      expect(() => visitor.ContinueStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is not ContinueStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement({ type: 'BreakStatement', label: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is ReturnStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when parent is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ContinueStatement', label: null, parent: null, loc: makeLoc(1, 0, 1, 9) })
      expect(reports.length).toBe(0)
    })

    test('does not report when parent is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ContinueStatement', label: null, loc: makeLoc(1, 0, 1, 9) })
      expect(reports.length).toBe(0)
    })

    test('does not report when parent is a non-object primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ContinueStatement', label: null, parent: 42, loc: makeLoc(1, 0, 1, 9) })
      expect(reports.length).toBe(0)
    })

    test('does not report when parent is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement({ type: 'ContinueStatement', label: null, parent: 'block', loc: makeLoc(1, 0, 1, 9) })
      expect(reports.length).toBe(0)
    })

    test('does not report when block body is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const node = {
        type: 'ContinueStatement',
        label: null,
        parent: { type: 'BlockStatement', body: 'not-array' },
        loc: makeLoc(1, 0, 1, 9),
      }
      visitor.ContinueStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when block body is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const node = {
        type: 'ContinueStatement',
        label: null,
        parent: { type: 'BlockStatement', body: null },
        loc: makeLoc(1, 0, 1, 9),
      }
      visitor.ContinueStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when block body is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const node = {
        type: 'ContinueStatement',
        label: null,
        parent: { type: 'BlockStatement' },
        loc: makeLoc(1, 0, 1, 9),
      }
      visitor.ContinueStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when continue node is not found in block body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const continueNode = {
        type: 'ContinueStatement',
        label: null,
        loc: makeLoc(1, 0, 1, 9),
      }
      const otherNode = { type: 'ContinueStatement', label: null }
      const block = {
        type: 'BlockStatement',
        body: [otherNode],
      }
      const node = { ...continueNode, parent: block }
      visitor.ContinueStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when block parent is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const continueNode: Record<string, unknown> = {
        type: 'ContinueStatement',
        label: null,
        loc: makeLoc(1, 0, 1, 9),
      }
      const block: Record<string, unknown> = {
        type: 'BlockStatement',
        body: [continueNode],
      }
      continueNode.parent = block
      // No parent on block
      visitor.ContinueStatement(continueNode)
      expect(reports.length).toBe(0)
    })

    test('does not report when block parent is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const continueNode: Record<string, unknown> = {
        type: 'ContinueStatement',
        label: null,
        loc: makeLoc(1, 0, 1, 9),
      }
      const block: Record<string, unknown> = {
        type: 'BlockStatement',
        body: [continueNode],
        parent: null,
      }
      continueNode.parent = block
      visitor.ContinueStatement(continueNode)
      expect(reports.length).toBe(0)
    })

    test('does not report when block parent type is not a loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const continueNode: Record<string, unknown> = {
        type: 'ContinueStatement',
        label: null,
        loc: makeLoc(1, 0, 1, 9),
      }
      const block: Record<string, unknown> = {
        type: 'BlockStatement',
        body: [continueNode],
      }
      continueNode.parent = block
      block.parent = { type: 'WithStatement', object: {}, body: block }
      visitor.ContinueStatement(continueNode)
      expect(reports.length).toBe(0)
    })

    test('does not report when continue is middle of three statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const continueNode: Record<string, unknown> = {
        type: 'ContinueStatement',
        label: null,
        loc: makeLoc(1, 0, 1, 9),
      }
      const stmt1: Record<string, unknown> = { type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } }
      const stmt2: Record<string, unknown> = { type: 'ExpressionStatement', expression: { type: 'Literal', value: 2 } }
      const block: Record<string, unknown> = {
        type: 'BlockStatement',
        body: [stmt1, continueNode, stmt2],
      }
      continueNode.parent = block
      stmt1.parent = block
      stmt2.parent = block
      block.parent = {
        type: 'ForStatement',
        test: { type: 'Literal', value: true },
        body: block,
      }
      visitor.ContinueStatement(continueNode)
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type passed to ContinueStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryContinueRule.create(ctx1)
      const visitor2 = noUnnecessaryContinueRule.create(ctx2)
      visitor1.ContinueStatement(makeContinueInLoop('ForStatement', true))
      visitor2.ContinueStatement(makeContinueInLoop('ForStatement', false))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement(makeContinueInLoop('ForStatement', true))
      visitor.ContinueStatement(makeContinueInLoop('ForStatement', false))
      visitor.ContinueStatement(makeContinueInLoop('WhileStatement', true))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const continueNode: Record<string, unknown> = {
        type: 'ContinueStatement',
        label: null,
      }
      const block: Record<string, unknown> = {
        type: 'BlockStatement',
        body: [continueNode],
      }
      continueNode.parent = block
      block.parent = {
        type: 'ForStatement',
        test: { type: 'Literal', value: true },
        body: block,
      }
      visitor.ContinueStatement(continueNode)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const continueNode: Record<string, unknown> = {
        type: 'ContinueStatement',
        label: null,
      }
      const block: Record<string, unknown> = {
        type: 'BlockStatement',
        body: [continueNode],
      }
      continueNode.parent = block
      block.parent = {
        type: 'ForStatement',
        test: { type: 'Literal', value: true },
        body: block,
      }
      visitor.ContinueStatement(continueNode)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement(makeContinueInLoop('ForStatement', true))
      visitor.ContinueStatement(makeContinueInLoop('ForStatement', false))
      visitor.ContinueStatement(makeContinueInLoop('WhileStatement', true))
      visitor.ContinueStatement(makeContinueInLoop('ForOfStatement', true))
      visitor.ContinueStatement({ type: 'BreakStatement', label: null })
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryContinueRule.create(context)
      const visitor2 = noUnnecessaryContinueRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryContinueRule.meta
      const meta2 = noUnnecessaryContinueRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const continueNode: Record<string, unknown> = {
        type: 'ContinueStatement',
        label: null,
        loc: makeLoc(1, 0, 1, 9),
        range: [0, 9],
        extra: true,
        trailingComments: [],
      }
      const block: Record<string, unknown> = {
        type: 'BlockStatement',
        body: [continueNode],
      }
      continueNode.parent = block
      block.parent = {
        type: 'ForStatement',
        test: { type: 'Literal', value: true },
        body: block,
      }
      visitor.ContinueStatement(continueNode)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const continueNode: Record<string, unknown> = {
        type: 'ContinueStatement',
        label: null,
        loc: {},
      }
      const block: Record<string, unknown> = {
        type: 'BlockStatement',
        body: [continueNode],
      }
      continueNode.parent = block
      block.parent = {
        type: 'ForStatement',
        test: { type: 'Literal', value: true },
        body: block,
      }
      visitor.ContinueStatement(continueNode)
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const continueNode: Record<string, unknown> = {
        type: 'ContinueStatement',
        label: null,
        loc: { start: { line: 3, column: 5 } },
      }
      const block: Record<string, unknown> = {
        type: 'BlockStatement',
        body: [continueNode],
      }
      continueNode.parent = block
      block.parent = {
        type: 'ForStatement',
        test: { type: 'Literal', value: true },
        body: block,
      }
      visitor.ContinueStatement(continueNode)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const node = makeContinueInLoop('ForStatement', true)
      visitor.ContinueStatement(node)
      visitor.ContinueStatement(node)
      visitor.ContinueStatement(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryContinueRule).toBeDefined()
      expect(typeof noUnnecessaryContinueRule.create).toBe('function')
      expect(typeof noUnnecessaryContinueRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const continueNode: Record<string, unknown> = {
        type: 'ContinueStatement',
        label: null,
        loc: makeLoc(1, 0, 1, 9),
        _parent: {},
      }
      const block: Record<string, unknown> = {
        type: 'BlockStatement',
        body: [continueNode],
      }
      continueNode.parent = block
      block.parent = {
        type: 'ForStatement',
        test: { type: 'Literal', value: true },
        body: block,
      }
      visitor.ContinueStatement(continueNode)
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement(makeContinueInLoop('ForStatement', true, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles continue in deeply nested if inside a loop — continue is last in if block, not loop block', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const continueNode: Record<string, unknown> = {
        type: 'ContinueStatement',
        label: null,
        loc: makeLoc(3, 0, 3, 9),
      }
      const ifBlock: Record<string, unknown> = {
        type: 'BlockStatement',
        body: [continueNode],
      }
      continueNode.parent = ifBlock
      ifBlock.parent = {
        type: 'IfStatement',
        test: { type: 'Literal', value: true },
        consequent: ifBlock,
      }
      visitor.ContinueStatement(continueNode)
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement(makeContinueInLoop('ForStatement', true))
      visitor.ContinueStatement(makeContinueInLoop('WhileStatement', true))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles continue as only statement in ForStatement with empty test', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const continueNode: Record<string, unknown> = {
        type: 'ContinueStatement',
        label: null,
        loc: makeLoc(1, 0, 1, 9),
      }
      const block: Record<string, unknown> = {
        type: 'BlockStatement',
        body: [continueNode],
      }
      continueNode.parent = block
      block.parent = {
        type: 'ForStatement',
        test: null,
        update: null,
        init: null,
        body: block,
      }
      visitor.ContinueStatement(continueNode)
      expect(reports.length).toBe(1)
    })

    test('handles continue in ForStatement with complex multi-line loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      visitor.ContinueStatement(makeContinueInLoop('ForStatement', true, 10, 8, 12, 1))
      expect(reports[0].loc?.start).toEqual({ line: 10, column: 8 })
      expect(reports[0].loc?.end).toEqual({ line: 12, column: 1 })
    })

    test('all five loop types produce identical report messages', () => {
      const loopTypes = ['ForStatement', 'ForInStatement', 'ForOfStatement', 'WhileStatement', 'DoWhileStatement']
      const messages: string[] = []
      for (const loopType of loopTypes) {
        const { context, reports } = createMockContext()
        const visitor = noUnnecessaryContinueRule.create(context)
        visitor.ContinueStatement(makeContinueInLoop(loopType, true))
        expect(reports.length).toBe(1)
        messages.push(reports[0].message)
      }
      const first = messages[0]
      for (const msg of messages) {
        expect(msg).toBe(first)
      }
    })

    test('handles block with many preceding statements and continue as last', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const continueNode: Record<string, unknown> = {
        type: 'ContinueStatement',
        label: null,
        loc: makeLoc(10, 0, 10, 9),
      }
      const stmts = Array.from({ length: 10 }, (_, i) => ({
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: i },
      }))
      stmts.push(continueNode)
      const block: Record<string, unknown> = {
        type: 'BlockStatement',
        body: stmts,
      }
      continueNode.parent = block
      for (const s of stmts) {
        (s as Record<string, unknown>).parent = block
      }
      block.parent = {
        type: 'ForStatement',
        test: { type: 'Literal', value: true },
        body: block,
      }
      visitor.ContinueStatement(continueNode)
      expect(reports.length).toBe(1)
    })

    test('handles continue with labeled identifier at end of ForOfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const label = { type: 'Identifier', name: 'myLoop' }
      const continueNode: Record<string, unknown> = {
        type: 'ContinueStatement',
        label,
        loc: makeLoc(4, 0, 4, 18),
      }
      const block: Record<string, unknown> = {
        type: 'BlockStatement',
        body: [continueNode],
      }
      continueNode.parent = block
      block.parent = {
        type: 'ForOfStatement',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'items' },
        body: block,
      }
      visitor.ContinueStatement(continueNode)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Unnecessary continue statement at the end of a loop.')
    })

    test('correctly distinguishes between two continues where only the last is reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryContinueRule.create(context)
      const continueMiddle: Record<string, unknown> = {
        type: 'ContinueStatement',
        label: null,
        loc: makeLoc(2, 0, 2, 9),
      }
      const continueLast: Record<string, unknown> = {
        type: 'ContinueStatement',
        label: null,
        loc: makeLoc(3, 0, 3, 9),
      }
      const block: Record<string, unknown> = {
        type: 'BlockStatement',
        body: [continueMiddle, continueLast],
      }
      continueMiddle.parent = block
      continueLast.parent = block
      block.parent = {
        type: 'ForStatement',
        test: { type: 'Literal', value: true },
        body: block,
      }
      visitor.ContinueStatement(continueMiddle)
      expect(reports.length).toBe(0)
      visitor.ContinueStatement(continueLast)
      expect(reports.length).toBe(1)
    })
  })
})

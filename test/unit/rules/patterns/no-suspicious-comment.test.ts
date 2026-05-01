import { describe, expect, test, vi } from 'vitest'
import { noSuspiciousCommentRule } from '../../../../src/rules/patterns/no-suspicious-comment.js'
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
    getSource: () => '// TODO: fix this',
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

function makeCommentNode(
  value: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 5,
): unknown {
  return {
    type: 'Comment',
    value,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-suspicious-comment rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noSuspiciousCommentRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noSuspiciousCommentRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noSuspiciousCommentRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noSuspiciousCommentRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noSuspiciousCommentRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning suspicious comments', () => {
      const desc = noSuspiciousCommentRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/suspicious|todo|fixme/)
    })

    test('should have correct docs URL', () => {
      expect(noSuspiciousCommentRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-suspicious-comment',
      )
    })

    test('should have empty schema', () => {
      expect(noSuspiciousCommentRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with Comment', () => {
      const { context } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      expect(visitor).toHaveProperty('Comment')
      expect(typeof visitor.Comment).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noSuspiciousCommentRule).toBeDefined()
      expect(noSuspiciousCommentRule.meta).toBeDefined()
      expect(noSuspiciousCommentRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — TODO (8) =====

  describe('positive cases — TODO keyword', () => {
    test('reports for comment with TODO', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('TODO: fix this'))
      expect(reports.length).toBe(1)
    })

    test('report message includes TODO', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('TODO: fix this'))
      expect(reports[0].message).toContain('TODO')
    })

    test('reports for lowercase todo', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('todo: lowercase'))
      expect(reports.length).toBe(1)
    })

    test('reports for mixed case ToDo', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('ToDo: mixed case'))
      expect(reports.length).toBe(1)
    })

    test('reports for TODO embedded in sentence', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('This is a TODO for later'))
      expect(reports.length).toBe(1)
    })

    test('reports for TODO at end of comment', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('Fix later TODO'))
      expect(reports.length).toBe(1)
    })

    test('reports for TODO with colon separator', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('TODO: implement feature'))
      expect(reports.length).toBe(1)
    })

    test('report message is exactly as defined in rule source for TODO', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('TODO: fix this'))
      expect(reports[0].message).toBe(
        'Suspicious comment found: "TODO". Consider resolving or tracking this item.',
      )
    })
  })

  // ===== POSITIVE CASES — FIXME (6) =====

  describe('positive cases — FIXME keyword', () => {
    test('reports for comment with FIXME', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('FIXME: broken code'))
      expect(reports.length).toBe(1)
    })

    test('report message includes FIXME', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('FIXME: broken code'))
      expect(reports[0].message).toContain('FIXME')
    })

    test('reports for lowercase fixme', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('fixme: broken'))
      expect(reports.length).toBe(1)
    })

    test('reports for FIXME embedded in sentence', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('This is a FIXME for the bug'))
      expect(reports.length).toBe(1)
    })

    test('report message is exactly as defined in rule source for FIXME', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('FIXME: fix'))
      expect(reports[0].message).toBe(
        'Suspicious comment found: "FIXME". Consider resolving or tracking this item.',
      )
    })

    test('reports for FixMe mixed case', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('FixMe: mixed'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== POSITIVE CASES — HACK (5) =====

  describe('positive cases — HACK keyword', () => {
    test('reports for comment with HACK', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('HACK: workaround'))
      expect(reports.length).toBe(1)
    })

    test('report message includes HACK', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('HACK: workaround'))
      expect(reports[0].message).toContain('HACK')
    })

    test('reports for lowercase hack', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('hack: temp fix'))
      expect(reports.length).toBe(1)
    })

    test('reports for HACK embedded in sentence', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('This is a HACK for now'))
      expect(reports.length).toBe(1)
    })

    test('report message is exactly as defined in rule source for HACK', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('HACK: workaround'))
      expect(reports[0].message).toBe(
        'Suspicious comment found: "HACK". Consider resolving or tracking this item.',
      )
    })
  })

  // ===== POSITIVE CASES — XXX (5) =====

  describe('positive cases — XXX keyword', () => {
    test('reports for comment with XXX', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('XXX: needs attention'))
      expect(reports.length).toBe(1)
    })

    test('report message includes XXX', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('XXX: needs attention'))
      expect(reports[0].message).toContain('XXX')
    })

    test('reports for lowercase xxx', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('xxx: warning'))
      expect(reports.length).toBe(1)
    })

    test('reports for XXX embedded in sentence', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('This is XXX mark it'))
      expect(reports.length).toBe(1)
    })

    test('report message is exactly as defined in rule source for XXX', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('XXX: needs attention'))
      expect(reports[0].message).toBe(
        'Suspicious comment found: "XXX". Consider resolving or tracking this item.',
      )
    })
  })

  // ===== POSITIVE CASES — BUG (5) =====

  describe('positive cases — BUG keyword', () => {
    test('reports for comment with BUG', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('BUG: known issue'))
      expect(reports.length).toBe(1)
    })

    test('report message includes BUG', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('BUG: known issue'))
      expect(reports[0].message).toContain('BUG')
    })

    test('reports for lowercase bug', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('bug: crash here'))
      expect(reports.length).toBe(1)
    })

    test('reports for BUG embedded in sentence', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('There is a BUG in this code'))
      expect(reports.length).toBe(1)
    })

    test('report message is exactly as defined in rule source for BUG', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('BUG: issue'))
      expect(reports[0].message).toBe(
        'Suspicious comment found: "BUG". Consider resolving or tracking this item.',
      )
    })
  })

  // ===== POSITIVE CASES — WORKAROUND (5) =====

  describe('positive cases — WORKAROUND keyword', () => {
    test('reports for comment with WORKAROUND', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('WORKAROUND: temp fix'))
      expect(reports.length).toBe(1)
    })

    test('report message includes WORKAROUND', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('WORKAROUND: temp fix'))
      expect(reports[0].message).toContain('WORKAROUND')
    })

    test('reports for lowercase workaround', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('workaround: for issue'))
      expect(reports.length).toBe(1)
    })

    test('reports for WORKAROUND embedded in sentence', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('This is a WORKAROUND for now'))
      expect(reports.length).toBe(1)
    })

    test('report message is exactly as defined in rule source for WORKAROUND', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('WORKAROUND: fix'))
      expect(reports[0].message).toBe(
        'Suspicious comment found: "WORKAROUND". Consider resolving or tracking this item.',
      )
    })
  })

  // ===== POSITIVE CASES — REPORT PROPERTIES (4) =====

  describe('positive cases — report properties', () => {
    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('TODO: fix'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('TODO: fix'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input Comment node', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      const node = makeCommentNode('TODO: fix')
      visitor.Comment(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('TODO: fix', 5, 10, 5, 25))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for clean comment', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('This is a clean comment'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      expect(() => visitor.Comment(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      expect(() => visitor.Comment(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      expect(() => visitor.Comment({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      expect(() => visitor.Comment('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      expect(() => visitor.Comment(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      expect(() => visitor.Comment(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      expect(() => visitor.Comment([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when value property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment({ type: 'Comment', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when value is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment({ type: 'Comment', value: null, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when value is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment({ type: 'Comment', value: 123, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when value is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode(''))
      expect(reports.length).toBe(0)
    })

    test('does not report for comment without suspicious keywords', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('Normal explanatory comment'))
      expect(reports.length).toBe(0)
    })

    test('does not report for comment with only TOTALLY word', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('TOTALLY fine comment'))
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type with TODO-like value', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment({ type: 'CallExpression', value: 'TODO', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for comment with word containing todo substring but not word boundary', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('STODOM is a place'))
      expect(reports.length).toBe(0)
    })

    test('does not report when value is a boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment({ type: 'Comment', value: true, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noSuspiciousCommentRule.create(ctx1)
      const visitor2 = noSuspiciousCommentRule.create(ctx2)
      visitor1.Comment(makeCommentNode('TODO: fix'))
      visitor2.Comment(makeCommentNode('Clean comment'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('TODO: fix'))
      visitor.Comment(makeCommentNode('Clean'))
      visitor.Comment(makeCommentNode('FIXME: broken'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      const node = { type: 'Comment', value: 'TODO: fix' }
      visitor.Comment(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      const node = { type: 'Comment', value: 'TODO: fix' }
      visitor.Comment(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('Clean comment'))
      visitor.Comment(makeCommentNode('TODO: fix'))
      visitor.Comment(makeCommentNode('Another clean'))
      visitor.Comment(makeCommentNode('FIXME: broken'))
      visitor.Comment(makeCommentNode('Normal'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noSuspiciousCommentRule.create(context)
      const visitor2 = noSuspiciousCommentRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noSuspiciousCommentRule.meta
      const meta2 = noSuspiciousCommentRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('TODO: fix'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      const node = {
        type: 'Comment',
        value: 'TODO: fix',
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        leading: true,
      }
      visitor.Comment(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment({ type: 'Comment', value: 'TODO: fix', loc: {} })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment({ type: 'Comment', value: 'TODO: fix', loc: { start: { line: 3, column: 5 } } })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      const node = makeCommentNode('TODO: fix')
      visitor.Comment(node)
      visitor.Comment(node)
      visitor.Comment(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noSuspiciousCommentRule).toBeDefined()
      expect(typeof noSuspiciousCommentRule.create).toBe('function')
      expect(typeof noSuspiciousCommentRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment({ type: 'Comment', value: 'TODO: fix', loc: makeLoc(1, 0, 1, 10), _parent: {} })
      expect(reports.length).toBe(1)
    })

    test('reports only first keyword match when multiple are present', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('TODO FIXME HACK'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('TODO')
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('TODO: fix', 10, 4, 10, 14))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(14)
    })

    test('accumulates reports with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('TODO: fix'))
      visitor.Comment(makeCommentNode('FIXME: broken'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('TODO')
      expect(reports[1].message).toContain('FIXME')
    })

    test('does not report for wordTodocument without word boundary', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('Todocument the process'))
      expect(reports.length).toBe(0)
    })

    test('reports for TODO followed by issue number', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('TODO(#123): fix issue'))
      expect(reports.length).toBe(1)
    })

    test('reports for HACK with exclamation', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('HACK! temp fix'))
      expect(reports.length).toBe(1)
    })

    test('reports for BUG at start of long comment', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment(makeCommentNode('BUG: this is a known issue that needs resolution'))
      expect(reports.length).toBe(1)
    })

    test('does not report when value is an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noSuspiciousCommentRule.create(context)
      visitor.Comment({ type: 'Comment', value: ['TODO'], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })
  })
})

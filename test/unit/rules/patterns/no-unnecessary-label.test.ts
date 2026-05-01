import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryLabelRule } from '../../../../src/rules/patterns/no-unnecessary-label.js'
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
    getSource: () => 'loop1: break loop1;',
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

function makeLabeledNode(
  labelName: string,
  bodyType: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 15,
): unknown {
  return {
    type: 'LabeledStatement',
    label: { type: 'Identifier', name: labelName },
    body: { type: bodyType },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-label rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryLabelRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryLabelRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryLabelRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryLabelRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryLabelRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning label', () => {
      const desc = noUnnecessaryLabelRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/label/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryLabelRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-label',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryLabelRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with LabeledStatement', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      expect(visitor).toHaveProperty('LabeledStatement')
      expect(typeof visitor.LabeledStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryLabelRule).toBeDefined()
      expect(noUnnecessaryLabelRule.meta).toBeDefined()
      expect(noUnnecessaryLabelRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY LABEL (25) =====

  describe('positive cases — reports unnecessary label', () => {
    test('reports for LabeledStatement with BreakStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('loop1', 'BreakStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for LabeledStatement with ContinueStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('loop1', 'ContinueStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for label name "loop1" with BreakStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('loop1', 'BreakStatement'))
      expect(reports[0].message).toContain('loop1')
    })

    test('reports for label name "outer" with BreakStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('outer', 'BreakStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for label name "inner" with ContinueStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('inner', 'ContinueStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for label name "a" with BreakStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('a', 'BreakStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for label name "myLabel" with BreakStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('myLabel', 'BreakStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for label name "label123" with ContinueStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('label123', 'ContinueStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for label name "_private" with BreakStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('_private', 'BreakStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for label name "$dollar" with ContinueStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('$dollar', 'ContinueStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for label name "x" with BreakStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('x', 'BreakStatement'))
      expect(reports.length).toBe(1)
    })

    test('report message includes label name "loop1"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('loop1', 'BreakStatement'))
      expect(reports[0].message).toContain('loop1')
    })

    test('report message includes label name "outer"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('outer', 'ContinueStatement'))
      expect(reports[0].message).toContain('outer')
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('a', 'BreakStatement'))
      visitor.LabeledStatement(makeLabeledNode('b', 'ContinueStatement'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format for different labels', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('foo', 'BreakStatement'))
      visitor.LabeledStatement(makeLabeledNode('bar', 'BreakStatement'))
      expect(reports[0].message).toMatch(/Unnecessary label '/)
      expect(reports[1].message).toMatch(/Unnecessary label '/)
    })

    test('reports for label name "top" with BreakStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('top', 'BreakStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for label name "bottom" with ContinueStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('bottom', 'ContinueStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for label name "LOOP" with BreakStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('LOOP', 'BreakStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for label name "loop2" with ContinueStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('loop2', 'ContinueStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for label name "restart" with BreakStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('restart', 'BreakStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for label name "retry" with ContinueStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('retry', 'ContinueStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for label name "exit" with BreakStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('exit', 'BreakStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for label name "skip" with ContinueStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('skip', 'ContinueStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for label name "next" with ContinueStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('next', 'ContinueStatement'))
      expect(reports.length).toBe(1)
    })

    test('reports for label name "done" with BreakStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('done', 'BreakStatement'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message matches expected format for label "loop1"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('loop1', 'BreakStatement'))
      expect(reports[0].message).toBe("Unnecessary label 'loop1'.")
    })

    test('report message matches expected format for label "outer"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('outer', 'ContinueStatement'))
      expect(reports[0].message).toBe("Unnecessary label 'outer'.")
    })

    test('report message matches expected format for label "x"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('x', 'BreakStatement'))
      expect(reports[0].message).toBe("Unnecessary label 'x'.")
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('loop1', 'BreakStatement'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('loop1', 'BreakStatement'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input LabeledStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      const node = makeLabeledNode('loop1', 'BreakStatement')
      visitor.LabeledStatement(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('loop1', 'BreakStatement', 5, 10, 5, 25))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('loop1', 'BreakStatement', 3, 4, 7, 12))
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('report message for ContinueStatement body has correct label name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('myLabel', 'ContinueStatement'))
      expect(reports[0].message).toBe("Unnecessary label 'myLabel'.")
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('loop1', 'BreakStatement'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report message is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('loop1', 'BreakStatement'))
      expect(typeof reports[0].message).toBe('string')
    })

    test('report message starts with "Unnecessary label"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('test', 'BreakStatement'))
      expect(reports[0].message).toMatch(/^Unnecessary label/)
    })

    test('report message ends with period', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('test', 'BreakStatement'))
      expect(reports[0].message).toMatch(/\.$/)
    })

    test('report message wraps label name in single quotes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('test', 'BreakStatement'))
      expect(reports[0].message).toContain("'test'")
    })

    test('report loc start is at line 1 column 0 for default node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('loop1', 'BreakStatement'))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for ExpressionStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('loop1', 'ExpressionStatement'))
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('loop1', 'BlockStatement'))
      expect(reports.length).toBe(0)
    })

    test('does not report for ForStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('loop1', 'ForStatement'))
      expect(reports.length).toBe(0)
    })

    test('does not report for WhileStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('loop1', 'WhileStatement'))
      expect(reports.length).toBe(0)
    })

    test('does not report for DoWhileStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('loop1', 'DoWhileStatement'))
      expect(reports.length).toBe(0)
    })

    test('does not report for ForInStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('loop1', 'ForInStatement'))
      expect(reports.length).toBe(0)
    })

    test('does not report for ForOfStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('loop1', 'ForOfStatement'))
      expect(reports.length).toBe(0)
    })

    test('does not report for SwitchStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('loop1', 'SwitchStatement'))
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('loop1', 'IfStatement'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      expect(() => visitor.LabeledStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      expect(() => visitor.LabeledStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      expect(() => visitor.LabeledStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement({ type: 'ExpressionStatement', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when label is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement({
        type: 'LabeledStatement',
        label: null,
        body: { type: 'BreakStatement' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when label is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement({
        type: 'LabeledStatement',
        label: undefined,
        body: { type: 'BreakStatement' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when label type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement({
        type: 'LabeledStatement',
        label: { type: 'Literal', value: 'loop1' },
        body: { type: 'BreakStatement' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when label name is not a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement({
        type: 'LabeledStatement',
        label: { type: 'Identifier', name: 123 },
        body: { type: 'BreakStatement' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when body is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement({
        type: 'LabeledStatement',
        label: { type: 'Identifier', name: 'loop1' },
        body: null,
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when body is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement({
        type: 'LabeledStatement',
        label: { type: 'Identifier', name: 'loop1' },
        body: undefined,
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      expect(() => visitor.LabeledStatement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      expect(() => visitor.LabeledStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      expect(() => visitor.LabeledStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for TryStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('loop1', 'TryStatement'))
      expect(reports.length).toBe(0)
    })

    test('does not report for WithStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('loop1', 'WithStatement'))
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('loop1', 'ReturnStatement'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryLabelRule.create(ctx1)
      const visitor2 = noUnnecessaryLabelRule.create(ctx2)
      visitor1.LabeledStatement(makeLabeledNode('loop1', 'BreakStatement'))
      visitor2.LabeledStatement(makeLabeledNode('loop1', 'ForStatement'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('a', 'BreakStatement'))
      visitor.LabeledStatement(makeLabeledNode('b', 'ForStatement'))
      visitor.LabeledStatement(makeLabeledNode('c', 'ContinueStatement'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      const node = {
        type: 'LabeledStatement',
        label: { type: 'Identifier', name: 'loop1' },
        body: { type: 'BreakStatement' },
      }
      visitor.LabeledStatement(node)
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('a', 'ForStatement'))
      visitor.LabeledStatement(makeLabeledNode('b', 'BreakStatement'))
      visitor.LabeledStatement(makeLabeledNode('c', 'WhileStatement'))
      visitor.LabeledStatement(makeLabeledNode('d', 'ContinueStatement'))
      visitor.LabeledStatement(makeLabeledNode('e', 'BlockStatement'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryLabelRule.create(context)
      const visitor2 = noUnnecessaryLabelRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryLabelRule.meta
      const meta2 = noUnnecessaryLabelRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      const node = {
        type: 'LabeledStatement',
        label: { type: 'Identifier', name: 'loop1' },
        body: { type: 'BreakStatement' },
        loc: makeLoc(1, 0, 1, 5),
        range: [0, 5],
        extra: true,
      }
      visitor.LabeledStatement(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement({
        type: 'LabeledStatement',
        label: { type: 'Identifier', name: 'loop1' },
        body: { type: 'BreakStatement' },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement({
        type: 'LabeledStatement',
        label: { type: 'Identifier', name: 'loop1' },
        body: { type: 'ContinueStatement' },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      const node = makeLabeledNode('loop1', 'BreakStatement')
      visitor.LabeledStatement(node)
      visitor.LabeledStatement(node)
      visitor.LabeledStatement(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryLabelRule).toBeDefined()
      expect(typeof noUnnecessaryLabelRule.create).toBe('function')
      expect(typeof noUnnecessaryLabelRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement({
        type: 'LabeledStatement',
        label: { type: 'Identifier', name: 'loop1' },
        body: { type: 'BreakStatement' },
        loc: makeLoc(1, 0, 1, 5),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('a', 'BreakStatement'))
      visitor.LabeledStatement(makeLabeledNode('b', 'ContinueStatement'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe("Unnecessary label 'a'.")
      expect(reports[1].message).toBe("Unnecessary label 'b'.")
    })

    test('handles label with empty string name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement({
        type: 'LabeledStatement',
        label: { type: 'Identifier', name: '' },
        body: { type: 'BreakStatement' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe("Unnecessary label ''.")
    })

    test('does not report when label is a string instead of object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement({
        type: 'LabeledStatement',
        label: 'loop1',
        body: { type: 'BreakStatement' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when label is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement({
        type: 'LabeledStatement',
        label: 42,
        body: { type: 'BreakStatement' },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement(makeLabeledNode('loop1', 'BreakStatement', 10, 4, 10, 20))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('does not report when body is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement({
        type: 'LabeledStatement',
        label: { type: 'Identifier', name: 'loop1' },
        body: 'BreakStatement',
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when body is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      visitor.LabeledStatement({
        type: 'LabeledStatement',
        label: { type: 'Identifier', name: 'loop1' },
        body: 123,
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('handles array node without throwing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryLabelRule.create(context)
      expect(() => visitor.LabeledStatement([])).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })
})

import { describe, expect, test, vi } from 'vitest'
import { noRedundantUseStrictRule } from '../../../../src/rules/patterns/no-redundant-use-strict.js'
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
    getSource: () => '/regex/',
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

function makeUseStrictNode(
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 14,
): unknown {
  return {
    type: 'ExpressionStatement',
    expression: { type: 'Literal', value: 'use strict' },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-redundant-use-strict rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noRedundantUseStrictRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noRedundantUseStrictRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noRedundantUseStrictRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noRedundantUseStrictRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noRedundantUseStrictRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning use strict', () => {
      const desc = noRedundantUseStrictRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/use strict/)
    })

    test('should have correct docs URL', () => {
      expect(noRedundantUseStrictRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-redundant-use-strict',
      )
    })

    test('should have empty schema', () => {
      expect(noRedundantUseStrictRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ExpressionStatement', () => {
      const { context } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      expect(visitor).toHaveProperty('ExpressionStatement')
      expect(typeof visitor.ExpressionStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noRedundantUseStrictRule).toBeDefined()
      expect(noRedundantUseStrictRule.meta).toBeDefined()
      expect(noRedundantUseStrictRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS REDUNDANT USE STRICT (25) =====

  describe('positive cases — reports redundant use strict', () => {
    test('reports second "use strict" directive', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      expect(reports.length).toBe(1)
    })

    test('first "use strict" produces zero reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      expect(reports.length).toBe(0)
    })

    test('reports third "use strict" directive as well', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      expect(reports.length).toBe(2)
    })

    test('reports fourth "use strict" directive', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      expect(reports.length).toBe(3)
    })

    test('reports five consecutive "use strict" directives', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      for (let i = 0; i < 5; i++) {
        visitor.ExpressionStatement(makeUseStrictNode())
      }
      expect(reports.length).toBe(4)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      expect(reports[0].message).toBe('Redundant "use strict" directive.')
    })

    test('report message mentions redundant', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      expect(reports[0].message.toLowerCase()).toContain('redundant')
    })

    test('report message mentions use strict', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      expect(reports[0].message.toLowerCase()).toContain('use strict')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input ExpressionStatement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      const secondNode = makeUseStrictNode()
      visitor.ExpressionStatement(secondNode)
      expect(reports[0].node).toBe(secondNode)
    })

    test('report loc reflects node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode(5, 10, 5, 24))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('second report node matches second redundant node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      const secondNode = makeUseStrictNode()
      const thirdNode = makeUseStrictNode()
      visitor.ExpressionStatement(secondNode)
      visitor.ExpressionStatement(thirdNode)
      expect(reports[0].node).toBe(secondNode)
      expect(reports[1].node).toBe(thirdNode)
    })

    test('reports with nodes at different line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode(1, 0, 1, 14))
      visitor.ExpressionStatement(makeUseStrictNode(10, 0, 10, 14))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
    })

    test('reports with nodes at different column numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode(1, 0, 1, 14))
      visitor.ExpressionStatement(makeUseStrictNode(1, 20, 1, 34))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode(3, 5, 3, 19))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(19)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for second use strict at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode(1, 0, 1, 14))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('accumulates reports correctly across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      expect(reports.length).toBe(3)
    })

    test('reports with large line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode(500, 0, 500, 14))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(500)
    })

    test('reports with large column numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode(1, 200, 1, 214))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(200)
    })

    test('ten consecutive use strict directives produce nine reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      for (let i = 0; i < 10; i++) {
        visitor.ExpressionStatement(makeUseStrictNode())
      }
      expect(reports.length).toBe(9)
    })

    test('report for second directive has correct message only once', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Redundant "use strict" directive.')
    })

    test('second and third reports have identical messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe('Redundant "use strict" directive.')
      expect(reports[1].message).toBe('Redundant "use strict" directive.')
    })

    test('report node is the AST node object not the expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      const node = makeUseStrictNode() as Record<string, unknown>
      visitor.ExpressionStatement(node)
      const reportNode = reports[0].node as Record<string, unknown>
      expect(reportNode.type).toBe('ExpressionStatement')
      expect(reportNode).toBe(node)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message contains directive word', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      expect(reports[0].message).toContain('directive')
    })

    test('report loc start has line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode(7, 3, 7, 17))
      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('report loc end has line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode(7, 3, 7, 17))
      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('report message does not contain newline', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      expect(reports[0].message).not.toContain('\n')
    })

    test('report message ends with period', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      expect(reports[0].message).toMatch(/\.$/)
    })

    test('report loc is an object with start and end', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      expect(reports[0].loc).toHaveProperty('start')
      expect(reports[0].loc).toHaveProperty('end')
    })

    test('report loc start is before or at end', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode(2, 0, 4, 14))
      const loc = reports[0].loc!
      expect(loc.start.line).toBeLessThanOrEqual(loc.end.line)
    })

    test('report node has type ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      const reportNode = reports[0].node as Record<string, unknown>
      expect(reportNode.type).toBe('ExpressionStatement')
    })

    test('report node has expression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      const reportNode = reports[0].node as Record<string, unknown>
      expect(reportNode).toHaveProperty('expression')
    })

    test('report node expression has value "use strict"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      const reportNode = reports[0].node as Record<string, unknown>
      const expr = reportNode.expression as Record<string, unknown>
      expect(expr.value).toBe('use strict')
    })

    test('report node expression has type Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      const reportNode = reports[0].node as Record<string, unknown>
      const expr = reportNode.expression as Record<string, unknown>
      expect(expr.type).toBe('Literal')
    })

    test('report preserves exact loc start column', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode(1, 8, 1, 22))
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('report preserves exact loc end column', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode(1, 8, 1, 22))
      expect(reports[0].loc?.end.column).toBe(22)
    })

    test('report preserves exact loc multi-line span', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode(2, 4, 6, 18))
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.end.line).toBe(6)
    })

    test('report message is a non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for single "use strict"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      expect(() => visitor.ExpressionStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      expect(() => visitor.ExpressionStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      expect(() => visitor.ExpressionStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal expression with different value', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 'hello' },
        loc: makeLoc(1, 0, 1, 7),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal expression with number value', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 42 },
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal expression with boolean value', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: true },
        loc: makeLoc(1, 0, 1, 4),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal expression with null value', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: null },
        loc: makeLoc(1, 0, 1, 4),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'CallExpression', callee: {}, arguments: [] },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'MemberExpression', object: {}, property: {} },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'BinaryExpression', operator: '+', left: {}, right: {} },
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'ArrowFunctionExpression', params: [], body: {} },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      expect(() => visitor.ExpressionStatement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      expect(() => visitor.ExpressionStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: null,
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier expression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'Identifier', name: 'foo' },
        loc: makeLoc(1, 0, 1, 3),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement({ type: 'FunctionDeclaration', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for expression with type but no value', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'Literal' },
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for expression with case-sensitive mismatch "Use Strict"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 'Use Strict' },
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for expression value "use strict " (trailing space)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 'use strict ' },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for expression value " use strict" (leading space)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: ' use strict' },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noRedundantUseStrictRule.create(ctx1)
      const visitor2 = noRedundantUseStrictRule.create(ctx2)
      visitor1.ExpressionStatement(makeUseStrictNode())
      visitor1.ExpressionStatement(makeUseStrictNode())
      visitor2.ExpressionStatement(makeUseStrictNode())
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noRedundantUseStrictRule.create(context)
      const visitor2 = noRedundantUseStrictRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noRedundantUseStrictRule.meta
      const meta2 = noRedundantUseStrictRule.meta
      expect(meta1).toBe(meta2)
    })

    test('node without loc still reports second use strict', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      const node = { type: 'ExpressionStatement', expression: { type: 'Literal', value: 'use strict' } }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      const node = { type: 'ExpressionStatement', expression: { type: 'Literal', value: 'use strict' } }
      visitor.ExpressionStatement(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      const node = {
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 'use strict' },
        loc: makeLoc(1, 0, 1, 14),
        range: [0, 14],
        extra: true,
        leadingComments: [],
        trailingComments: [],
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 'use strict' },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 'use strict' },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('rule exports are correct', () => {
      expect(noRedundantUseStrictRule).toBeDefined()
      expect(typeof noRedundantUseStrictRule.create).toBe('function')
      expect(typeof noRedundantUseStrictRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 'use strict' },
        loc: makeLoc(1, 0, 1, 14),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('mixed valid and invalid nodes count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 'hello' },
        loc: makeLoc(1, 0, 1, 7),
      })
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      expect(reports.length).toBe(1)
    })

    test('use strict after non-directive expression still works', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'CallExpression', callee: {}, arguments: [] },
        loc: makeLoc(1, 0, 1, 10),
      })
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode())
      expect(reports.length).toBe(1)
    })

    test('does not report when calling with non-use-strict then use-strict once', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 'not strict' },
        loc: makeLoc(1, 0, 1, 11),
      })
      visitor.ExpressionStatement(makeUseStrictNode())
      expect(reports.length).toBe(0)
    })

    test('boolean primitive node does not throw', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      expect(() => visitor.ExpressionStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('array node does not throw', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      expect(() => visitor.ExpressionStatement([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('expression as string primitive does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: 'use strict',
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(0)
    })

    test('expression as number does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: 42,
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('same node object passed twice still reports on second call', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      const node = makeUseStrictNode()
      visitor.ExpressionStatement(node)
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantUseStrictRule.create(context)
      visitor.ExpressionStatement(makeUseStrictNode())
      visitor.ExpressionStatement(makeUseStrictNode(10, 4, 10, 18))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(18)
    })
  })
})

import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryAsExpressionRule } from '../../../../src/rules/patterns/no-unnecessary-as-expression.js'
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

function makeTSAsNode(
  exprValue: number,
  literalValue: number,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'TSAsExpression',
    expression: { type: 'Literal', value: exprValue },
    typeAnnotation: {
      type: 'TSLiteralType',
      literal: { type: 'Literal', value: literalValue },
    },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-as-expression rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryAsExpressionRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryAsExpressionRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryAsExpressionRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryAsExpressionRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryAsExpressionRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning type assertion', () => {
      const desc = noUnnecessaryAsExpressionRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/assert/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryAsExpressionRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-as-expression',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryAsExpressionRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with TSAsExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      expect(visitor).toHaveProperty('TSAsExpression')
      expect(typeof visitor.TSAsExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryAsExpressionRule).toBeDefined()
      expect(noUnnecessaryAsExpressionRule.meta).toBeDefined()
      expect(noUnnecessaryAsExpressionRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY AS (25) =====

  describe('positive cases — reports unnecessary as expression', () => {
    test('reports for 42 as 42', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(42, 42))
      expect(reports.length).toBe(1)
    })

    test('reports for 0 as 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(0, 0))
      expect(reports.length).toBe(1)
    })

    test('reports for -1 as -1', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(-1, -1))
      expect(reports.length).toBe(1)
    })

    test('reports for 3.14 as 3.14', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(3.14, 3.14))
      expect(reports.length).toBe(1)
    })

    test('reports for 100 as 100', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(100, 100))
      expect(reports.length).toBe(1)
    })

    test('reports for -99.99 as -99.99', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(-99.99, -99.99))
      expect(reports.length).toBe(1)
    })

    test('reports for 1 as 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(1, 1))
      expect(reports.length).toBe(1)
    })

    test('reports for 999 as 999', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(999, 999))
      expect(reports.length).toBe(1)
    })

    test('reports for 0.5 as 0.5', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(0.5, 0.5))
      expect(reports.length).toBe(1)
    })

    test('reports for -0 as -0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(-0, -0))
      expect(reports.length).toBe(1)
    })

    test('reports for 255 as 255', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(255, 255))
      expect(reports.length).toBe(1)
    })

    test('reports for 2.718 as 2.718', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(2.718, 2.718))
      expect(reports.length).toBe(1)
    })

    test('reports for 1e5 as 1e5', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(1e5, 1e5))
      expect(reports.length).toBe(1)
    })

    test('reports for -3 as -3', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(-3, -3))
      expect(reports.length).toBe(1)
    })

    test('reports for 7 as 7', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(7, 7))
      expect(reports.length).toBe(1)
    })

    test('reports for 123456789 as 123456789', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(123456789, 123456789))
      expect(reports.length).toBe(1)
    })

    test('reports for 0.001 as 0.001', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(0.001, 0.001))
      expect(reports.length).toBe(1)
    })

    test('reports for -50.5 as -50.5', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(-50.5, -50.5))
      expect(reports.length).toBe(1)
    })

    test('reports for 2048 as 2048', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(2048, 2048))
      expect(reports.length).toBe(1)
    })

    test('reports for 88.8 as 88.8', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(88.8, 88.8))
      expect(reports.length).toBe(1)
    })

    test('reports for 33 as 33', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(33, 33))
      expect(reports.length).toBe(1)
    })

    test('reports for 1.414 as 1.414', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(1.414, 1.414))
      expect(reports.length).toBe(1)
    })

    test('reports for -7.5 as -7.5', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(-7.5, -7.5))
      expect(reports.length).toBe(1)
    })

    test('reports for 5000 as 5000', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(5000, 5000))
      expect(reports.length).toBe(1)
    })

    test('reports for 6.28 as 6.28', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(6.28, 6.28))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message matches expected text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(42, 42))
      expect(reports[0].message).toBe(
        'Unnecessary type assertion: value is already the target type.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(42, 42))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(42, 42))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      const node = makeTSAsNode(42, 42)
      visitor.TSAsExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc reflects node location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(42, 42, 5, 10, 5, 20))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end values are preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(42, 42, 2, 4, 2, 15))
      expect(reports[0].loc?.end.line).toBe(2)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('report message contains "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(42, 42))
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('report message contains "assertion"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(42, 42))
      expect(reports[0].message).toContain('assertion')
    })

    test('report message contains "already"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(42, 42))
      expect(reports[0].message).toContain('already')
    })

    test('report message contains "target type"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(42, 42))
      expect(reports[0].message).toContain('target type')
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(42, 42))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(42, 42))
      visitor.TSAsExpression(makeTSAsNode(10, 10))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(42, 42))
      visitor.TSAsExpression(makeTSAsNode(0, 0))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports two violations with correct individual locs', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(42, 42, 1, 0, 1, 10))
      visitor.TSAsExpression(makeTSAsNode(7, 7, 3, 5, 3, 15))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(3)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      const node = makeTSAsNode(42, 42)
      visitor.TSAsExpression(node)
      visitor.TSAsExpression(node)
      visitor.TSAsExpression(node)
      expect(reports.length).toBe(3)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for different values 42 as 10', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(42, 10))
      expect(reports.length).toBe(0)
    })

    test('does not report for different values 0 as 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(0, 1))
      expect(reports.length).toBe(0)
    })

    test('does not report for different values 3.14 as 2.71', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(3.14, 2.71))
      expect(reports.length).toBe(0)
    })

    test('does not report for different values -1 as 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(-1, 1))
      expect(reports.length).toBe(0)
    })

    test('does not report for different values 100 as 200', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(100, 200))
      expect(reports.length).toBe(0)
    })

    test('does not report for string expression value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression({
        type: 'TSAsExpression',
        expression: { type: 'Literal', value: 'hello' },
        typeAnnotation: {
          type: 'TSLiteralType',
          literal: { type: 'Literal', value: 'hello' },
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      expect(() => visitor.TSAsExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      expect(() => visitor.TSAsExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      expect(() => visitor.TSAsExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression({ type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      expect(() => visitor.TSAsExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      expect(() => visitor.TSAsExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      expect(() => visitor.TSAsExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      expect(() => visitor.TSAsExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression({
        type: 'TSAsExpression',
        typeAnnotation: {
          type: 'TSLiteralType',
          literal: { type: 'Literal', value: 42 },
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when typeAnnotation is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression({
        type: 'TSAsExpression',
        expression: { type: 'Literal', value: 42 },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when expression type is not Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression({
        type: 'TSAsExpression',
        expression: { type: 'Identifier', name: 'x' },
        typeAnnotation: {
          type: 'TSLiteralType',
          literal: { type: 'Literal', value: 42 },
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when typeAnnotation type is not TSLiteralType', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression({
        type: 'TSAsExpression',
        expression: { type: 'Literal', value: 42 },
        typeAnnotation: {
          type: 'TSNumberKeyword',
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when literal type is not Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression({
        type: 'TSAsExpression',
        expression: { type: 'Literal', value: 42 },
        typeAnnotation: {
          type: 'TSLiteralType',
          literal: { type: 'Identifier', name: 'Int' },
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when expression value is string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression({
        type: 'TSAsExpression',
        expression: { type: 'Literal', value: '42' },
        typeAnnotation: {
          type: 'TSLiteralType',
          literal: { type: 'Literal', value: '42' },
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when literal value is string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression({
        type: 'TSAsExpression',
        expression: { type: 'Literal', value: 42 },
        typeAnnotation: {
          type: 'TSLiteralType',
          literal: { type: 'Literal', value: '42' },
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when literal is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression({
        type: 'TSAsExpression',
        expression: { type: 'Literal', value: 42 },
        typeAnnotation: {
          type: 'TSLiteralType',
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryAsExpressionRule.create(ctx1)
      const visitor2 = noUnnecessaryAsExpressionRule.create(ctx2)
      visitor1.TSAsExpression(makeTSAsNode(42, 42))
      visitor2.TSAsExpression(makeTSAsNode(42, 10))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(42, 42))
      visitor.TSAsExpression(makeTSAsNode(42, 10))
      visitor.TSAsExpression(makeTSAsNode(0, 0))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      const node = {
        type: 'TSAsExpression',
        expression: { type: 'Literal', value: 42 },
        typeAnnotation: {
          type: 'TSLiteralType',
          literal: { type: 'Literal', value: 42 },
        },
      }
      visitor.TSAsExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      const node = {
        type: 'TSAsExpression',
        expression: { type: 'Literal', value: 42 },
        typeAnnotation: {
          type: 'TSLiteralType',
          literal: { type: 'Literal', value: 42 },
        },
      }
      visitor.TSAsExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(42, 42))
      visitor.TSAsExpression(makeTSAsNode(42, 10))
      visitor.TSAsExpression(makeTSAsNode(0, 1))
      visitor.TSAsExpression(makeTSAsNode(7, 7))
      visitor.TSAsExpression(makeTSAsNode(3, 5))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryAsExpressionRule.create(context)
      const visitor2 = noUnnecessaryAsExpressionRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryAsExpressionRule.meta
      const meta2 = noUnnecessaryAsExpressionRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      const node = {
        type: 'TSAsExpression',
        expression: { type: 'Literal', value: 42 },
        typeAnnotation: {
          type: 'TSLiteralType',
          literal: { type: 'Literal', value: 42 },
        },
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
      }
      visitor.TSAsExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression({
        type: 'TSAsExpression',
        expression: { type: 'Literal', value: 42 },
        typeAnnotation: {
          type: 'TSLiteralType',
          literal: { type: 'Literal', value: 42 },
        },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression({
        type: 'TSAsExpression',
        expression: { type: 'Literal', value: 42 },
        typeAnnotation: {
          type: 'TSLiteralType',
          literal: { type: 'Literal', value: 42 },
        },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(42, 42, 10, 4, 10, 20))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryAsExpressionRule).toBeDefined()
      expect(typeof noUnnecessaryAsExpressionRule.create).toBe('function')
      expect(typeof noUnnecessaryAsExpressionRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression({
        type: 'TSAsExpression',
        expression: { type: 'Literal', value: 42 },
        typeAnnotation: {
          type: 'TSLiteralType',
          literal: { type: 'Literal', value: 42 },
        },
        loc: makeLoc(1, 0, 1, 20),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles NaN values — NaN as NaN does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(NaN, NaN))
      expect(reports.length).toBe(0)
    })

    test('handles Infinity values — Infinity as Infinity reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression(makeTSAsNode(Infinity, Infinity))
      expect(reports.length).toBe(1)
    })

    test('expression value null does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression({
        type: 'TSAsExpression',
        expression: { type: 'Literal', value: null },
        typeAnnotation: {
          type: 'TSLiteralType',
          literal: { type: 'Literal', value: null },
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('expression value boolean does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression({
        type: 'TSAsExpression',
        expression: { type: 'Literal', value: true },
        typeAnnotation: {
          type: 'TSLiteralType',
          literal: { type: 'Literal', value: true },
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('literal value undefined does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression({
        type: 'TSAsExpression',
        expression: { type: 'Literal', value: 42 },
        typeAnnotation: {
          type: 'TSLiteralType',
          literal: { type: 'Literal', value: undefined },
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when literal is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression({
        type: 'TSAsExpression',
        expression: { type: 'Literal', value: 42 },
        typeAnnotation: {
          type: 'TSLiteralType',
          literal: null,
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('expression value as object does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsExpressionRule.create(context)
      visitor.TSAsExpression({
        type: 'TSAsExpression',
        expression: { type: 'Literal', value: { nested: true } },
        typeAnnotation: {
          type: 'TSLiteralType',
          literal: { type: 'Literal', value: { nested: true } },
        },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })
  })
})

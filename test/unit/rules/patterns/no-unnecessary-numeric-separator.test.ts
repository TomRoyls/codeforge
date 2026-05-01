import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryNumericSeparatorRule } from '../../../../src/rules/patterns/no-unnecessary-numeric-separator.js'
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
    getSource: () => '1_00',
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

function makeLiteralNode(
  value: unknown,
  raw: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 5,
): unknown {
  return {
    type: 'Literal',
    value,
    raw,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

describe('no-unnecessary-numeric-separator rule', () => {

  // ===== META TESTS (8) =====

  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryNumericSeparatorRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryNumericSeparatorRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryNumericSeparatorRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryNumericSeparatorRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryNumericSeparatorRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning numeric separator', () => {
      const desc = noUnnecessaryNumericSeparatorRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/numeric|separator/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryNumericSeparatorRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-numeric-separator',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryNumericSeparatorRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with Literal', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      expect(visitor).toHaveProperty('Literal')
      expect(typeof visitor.Literal).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryNumericSeparatorRule).toBeDefined()
      expect(noUnnecessaryNumericSeparatorRule.meta).toBeDefined()
      expect(noUnnecessaryNumericSeparatorRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY SEPARATOR (25) =====

  describe('positive cases — reports unnecessary separator', () => {
    test('reports for value 100 with raw "1_00"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(100, '1_00'))
      expect(reports.length).toBe(1)
    })

    test('reports for value 0 with raw "0_0"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(0, '0_0'))
      expect(reports.length).toBe(1)
    })

    test('reports for value 1 with raw "1_0"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(10, '1_0'))
      expect(reports.length).toBe(1)
    })

    test('reports for value 999 with raw "9_99"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(999, '9_99'))
      expect(reports.length).toBe(1)
    })

    test('reports for value 500 with raw "5_00"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(500, '5_00'))
      expect(reports.length).toBe(1)
    })

    test('reports for value -1 with raw "-1_0"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(-10, '-1_0'))
      expect(reports.length).toBe(1)
    })

    test('reports for value -999 with raw "-9_99"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(-999, '-9_99'))
      expect(reports.length).toBe(1)
    })

    test('reports for value 42 with raw "4_2"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(42, '4_2'))
      expect(reports.length).toBe(1)
    })

    test('reports for value 7 with raw "0_007"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(7, '0_007'))
      expect(reports.length).toBe(1)
    })

    test('reports for value 1 with raw "0_001"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(1, '0_001'))
      expect(reports.length).toBe(1)
    })

    test('reports for value 10 with raw "0_010"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(10, '0_010'))
      expect(reports.length).toBe(1)
    })

    test('reports for value 123 with raw "1_2_3"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(123, '1_2_3'))
      expect(reports.length).toBe(1)
    })

    test('reports for value -1 with raw "-0_001"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(-1, '-0_001'))
      expect(reports.length).toBe(1)
    })

    test('reports for value -500 with raw "-5_00"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(-500, '-5_00'))
      expect(reports.length).toBe(1)
    })

    test('reports for value 100 with raw "0_100"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(100, '0_100'))
      expect(reports.length).toBe(1)
    })

    test('reports for value 200 with raw "2_00"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(200, '2_00'))
      expect(reports.length).toBe(1)
    })

    test('reports for value 300 with raw "3_00"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(300, '3_00'))
      expect(reports.length).toBe(1)
    })

    test('reports for value 50 with raw "5_0"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(50, '5_0'))
      expect(reports.length).toBe(1)
    })

    test('reports for value 5 with raw "0_005"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(5, '0_005'))
      expect(reports.length).toBe(1)
    })

    test('reports for value 250 with raw "2_50"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(250, '2_50'))
      expect(reports.length).toBe(1)
    })

    test('reports for value -42 with raw "-4_2"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(-42, '-4_2'))
      expect(reports.length).toBe(1)
    })

    test('reports for value 1 with raw "0_01"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(1, '0_01'))
      expect(reports.length).toBe(1)
    })

    test('reports for value 800 with raw "8_00"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(800, '8_00'))
      expect(reports.length).toBe(1)
    })

    test('reports for value -100 with raw "-1_00"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(-100, '-1_00'))
      expect(reports.length).toBe(1)
    })

    test('reports for value 750 with raw "7_50"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(750, '7_50'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message contains "Unnecessary numeric separator"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(100, '1_00'))
      expect(reports[0].message).toContain('Unnecessary numeric separator')
    })

    test('report message includes the raw value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(100, '1_00'))
      expect(reports[0].message).toContain('1_00')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(100, '1_00'))
      expect(reports[0].message).toBe(
        "Unnecessary numeric separator in '1_00'.",
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(100, '1_00'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(100, '1_00'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input Literal node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      const node = makeLiteralNode(100, '1_00')
      visitor.Literal(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(100, '1_00', 5, 10, 5, 15))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report message includes raw value for different input', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(42, '4_2'))
      expect(reports[0].message).toContain('4_2')
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(100, '1_00', 2, 3, 2, 8))
      expect(reports[0].loc?.end.line).toBe(2)
      expect(reports[0].loc?.end.column).toBe(8)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(100, '1_00'))
      visitor.Literal(makeLiteralNode(42, '4_2'))
      expect(reports.length).toBe(2)
    })

    test('each accumulated report has correct individual message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(100, '1_00'))
      visitor.Literal(makeLiteralNode(42, '4_2'))
      expect(reports[0].message).toBe("Unnecessary numeric separator in '1_00'.")
      expect(reports[1].message).toBe("Unnecessary numeric separator in '4_2'.")
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(100, '1_00'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report message for negative number includes raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(-100, '-1_00'))
      expect(reports[0].message).toContain('-1_00')
    })

    test('report message is exactly correct for zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(0, '0_0'))
      expect(reports[0].message).toBe("Unnecessary numeric separator in '0_0'.")
    })

    test('report message is exactly correct for boundary value 999', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(999, '9_99'))
      expect(reports[0].message).toBe("Unnecessary numeric separator in '9_99'.")
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for value 1000 with raw "1_000" (at boundary)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(1000, '1_000'))
      expect(reports.length).toBe(0)
    })

    test('does not report for value -1000 with raw "-1_000" (at boundary)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(-1000, '-1_000'))
      expect(reports.length).toBe(0)
    })

    test('does not report for value 10000 with raw "10_000" (above range)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(10000, '10_000'))
      expect(reports.length).toBe(0)
    })

    test('does not report for value 1000000 with raw "1_000_000" (above range)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(1000000, '1_000_000'))
      expect(reports.length).toBe(0)
    })

    test('does not report for value -1001 with raw "-1_001" (below range)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(-1001, '-1_001'))
      expect(reports.length).toBe(0)
    })

    test('does not report for float 1.5 with raw "1_5" (non-integer)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(1.5, '1_5'))
      expect(reports.length).toBe(0)
    })

    test('does not report for float 0.1 with raw "0_1" (non-integer)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(0.1, '0_1'))
      expect(reports.length).toBe(0)
    })

    test('does not report for float 999.5 with raw "9_99.5" (non-integer)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(999.5, '9_99.5'))
      expect(reports.length).toBe(0)
    })

    test('does not report for raw without underscore "100"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(100, '100'))
      expect(reports.length).toBe(0)
    })

    test('does not report for string value with underscore', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode('1_00', '1_00'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      expect(() => visitor.Literal(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      expect(() => visitor.Literal(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      expect(() => visitor.Literal({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when raw is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal({ type: 'Literal', value: 100, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when raw is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal({ type: 'Literal', value: 100, raw: null, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when raw is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal({ type: 'Literal', value: 100, raw: 100, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      expect(() => visitor.Literal('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      expect(() => visitor.Literal(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      expect(() => visitor.Literal(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for raw without underscore even with small value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(1, '1'))
      expect(reports.length).toBe(0)
    })

    test('does not report for value 5000 with raw "5_000"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(5000, '5_000'))
      expect(reports.length).toBe(0)
    })

    test('does not report for value NaN with underscore raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(NaN, 'Na_N'))
      expect(reports.length).toBe(0)
    })

    test('does not report for value Infinity with underscore raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(Infinity, 'In_finity'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryNumericSeparatorRule.create(ctx1)
      const visitor2 = noUnnecessaryNumericSeparatorRule.create(ctx2)
      visitor1.Literal(makeLiteralNode(100, '1_00'))
      visitor2.Literal(makeLiteralNode(10000, '10_000'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly mixed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(100, '1_00'))
      visitor.Literal(makeLiteralNode(1000, '1_000'))
      visitor.Literal(makeLiteralNode(42, '4_2'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      const node = { type: 'Literal', value: 100, raw: '1_00' }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      const node = { type: 'Literal', value: 100, raw: '1_00' }
      visitor.Literal(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(1000, '1_000'))
      visitor.Literal(makeLiteralNode(100, '1_00'))
      visitor.Literal(makeLiteralNode(1.5, '1_5'))
      visitor.Literal(makeLiteralNode(42, '4_2'))
      visitor.Literal(makeLiteralNode(5000, '5_000'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryNumericSeparatorRule.create(context)
      const visitor2 = noUnnecessaryNumericSeparatorRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryNumericSeparatorRule.meta
      const meta2 = noUnnecessaryNumericSeparatorRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      const node = {
        type: 'Literal',
        value: 100,
        raw: '1_00',
        loc: makeLoc(1, 0, 1, 5),
        range: [0, 5],
        extra: true,
        leadingComments: [],
      }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal({ type: 'Literal', value: 100, raw: '1_00', loc: {} })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc missing end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal({ type: 'Literal', value: 100, raw: '1_00', loc: { start: { line: 3, column: 5 } } })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      const node = makeLiteralNode(100, '1_00')
      visitor.Literal(node)
      visitor.Literal(node)
      visitor.Literal(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryNumericSeparatorRule).toBeDefined()
      expect(typeof noUnnecessaryNumericSeparatorRule.create).toBe('function')
      expect(typeof noUnnecessaryNumericSeparatorRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal({ type: 'Literal', value: 100, raw: '1_00', loc: makeLoc(1, 0, 1, 5), _parent: {} })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(100, '1_00'))
      visitor.Literal(makeLiteralNode(42, '4_2'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe("Unnecessary numeric separator in '1_00'.")
      expect(reports[1].message).toBe("Unnecessary numeric separator in '4_2'.")
    })

    test('boundary value 999 reports with separator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(999, '9_99'))
      expect(reports.length).toBe(1)
    })

    test('boundary value 1000 does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(1000, '1_000'))
      expect(reports.length).toBe(0)
    })

    test('boundary value -999 reports with separator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(-999, '-9_99'))
      expect(reports.length).toBe(1)
    })

    test('boundary value -1000 does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(-1000, '-1_000'))
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      visitor.Literal(makeLiteralNode(100, '1_00', 10, 4, 10, 12))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericSeparatorRule.create(context)
      expect(() => visitor.Literal([])).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })
})

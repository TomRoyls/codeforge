import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryIsNanRule } from '../../../../src/rules/patterns/no-unnecessary-is-nan.js'
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
    getSource: () => 'isNaN(42)',
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

function makeCallIsNaN(
  value: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'isNaN' },
    arguments: [{ type: 'Literal', value }],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-is-nan rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryIsNanRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryIsNanRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryIsNanRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryIsNanRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryIsNanRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning isNaN', () => {
      const desc = noUnnecessaryIsNanRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/isnan/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryIsNanRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-is-nan',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryIsNanRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryIsNanRule).toBeDefined()
      expect(noUnnecessaryIsNanRule.meta).toBeDefined()
      expect(noUnnecessaryIsNanRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY ISNAN (25) =====

  describe('positive cases — reports unnecessary isNaN', () => {
    test('reports for isNaN(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(0))
      expect(reports.length).toBe(1)
    })

    test('reports for isNaN(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(42))
      expect(reports.length).toBe(1)
    })

    test('reports for isNaN(3.14)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(3.14))
      expect(reports.length).toBe(1)
    })

    test('reports for isNaN(-1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(-1))
      expect(reports.length).toBe(1)
    })

    test('reports for isNaN(100)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(100))
      expect(reports.length).toBe(1)
    })

    test('reports for isNaN(-999)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(-999))
      expect(reports.length).toBe(1)
    })

    test('reports for isNaN(0.5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(0.5))
      expect(reports.length).toBe(1)
    })

    test('reports for isNaN(1e10)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(1e10))
      expect(reports.length).toBe(1)
    })

    test('reports for isNaN(Infinity)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(Infinity))
      expect(reports.length).toBe(1)
    })

    test('reports for isNaN(-Infinity)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(-Infinity))
      expect(reports.length).toBe(1)
    })

    test('reports for isNaN(123.456)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(123.456))
      expect(reports.length).toBe(1)
    })

    test('reports for isNaN(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(1))
      expect(reports.length).toBe(1)
    })

    test('reports with node that has loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(42, 5, 10, 5, 20))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('reports with node that has extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for isNaN(7)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(7))
      expect(reports.length).toBe(1)
    })

    test('reports for isNaN(-0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(-0))
      expect(reports.length).toBe(1)
    })

    test('reports for isNaN(2e5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(2e5))
      expect(reports.length).toBe(1)
    })

    test('reports for isNaN(0.001)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(0.001))
      expect(reports.length).toBe(1)
    })

    test('reports for isNaN(99999)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(99999))
      expect(reports.length).toBe(1)
    })

    test('reports for isNaN(-3.14)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(-3.14))
      expect(reports.length).toBe(1)
    })

    test('reports for isNaN(1.5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(1.5))
      expect(reports.length).toBe(1)
    })

    test('reports for isNaN(256)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(256))
      expect(reports.length).toBe(1)
    })

    test('reports for isNaN(1e-7)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(1e-7))
      expect(reports.length).toBe(1)
    })

    test('reports for isNaN(42.0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(42.0))
      expect(reports.length).toBe(1)
    })

    test('reports for isNaN(10)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(10))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message mentions "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(42))
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('report message mentions "isNaN()"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(42))
      expect(reports[0].message).toContain('isNaN()')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(42))
      expect(reports[0].message).toBe(
        'Unnecessary isNaN() call on a non-NaN numeric literal. This always returns false.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(42))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(42))
      expect(reports[0].node).toBeDefined()
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(42, 5, 10, 5, 20))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      const node = makeCallIsNaN(42)
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(42))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(0))
      visitor.CallExpression(makeCallIsNaN(42))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(0))
      visitor.CallExpression(makeCallIsNaN(42))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('single report per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(42))
      expect(reports.length).toBe(1)
    })

    test('multiple violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(1))
      visitor.CallExpression(makeCallIsNaN(2))
      visitor.CallExpression(makeCallIsNaN(3))
      expect(reports.length).toBe(3)
    })

    test('report message mentions "non-NaN"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(42))
      expect(reports[0].message).toContain('non-NaN')
    })

    test('report message mentions "numeric literal"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(42))
      expect(reports[0].message).toContain('numeric literal')
    })

    test('report message mentions "always returns false"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(42))
      expect(reports[0].message).toContain('always returns false')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for string argument isNaN("42")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN('42'))
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean argument isNaN(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(true))
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier argument isNaN(x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 9),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for no arguments isNaN()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 8),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for two arguments isNaN(1, 2)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: 2 },
        ],
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for isNaN(NaN) — NaN is a valid use case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(NaN))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-isNaN callee foo(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 7),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression callee Number.isNaN(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 17),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null argument value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(null))
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined argument value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(undefined))
      expect(reports.length).toBe(0)
    })

    test('does not report for array primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal with string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN('hello'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal with boolean value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(false))
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal with null value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(null))
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal with regex value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(/test/))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument has non-Literal type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'BinaryExpression', operator: '+', left: {}, right: {} }],
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for callee with wrong name isNan (typo)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNan' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryIsNanRule.create(ctx1)
      const visitor2 = noUnnecessaryIsNanRule.create(ctx2)
      visitor1.CallExpression(makeCallIsNaN(42))
      visitor2.CallExpression(makeCallIsNaN(NaN))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(42))
      visitor.CallExpression(makeCallIsNaN(NaN))
      visitor.CallExpression(makeCallIsNaN(0))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'Literal', value: 42 }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'Literal', value: 42 }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(42))
      visitor.CallExpression(makeCallIsNaN(NaN))
      visitor.CallExpression(makeCallIsNaN('hello'))
      visitor.CallExpression(makeCallIsNaN(0))
      visitor.CallExpression(makeCallIsNaN(3.14))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryIsNanRule.create(context)
      const visitor2 = noUnnecessaryIsNanRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryIsNanRule.meta
      const meta2 = noUnnecessaryIsNanRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      const node = makeCallIsNaN(42)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryIsNanRule).toBeDefined()
      expect(typeof noUnnecessaryIsNanRule.create).toBe('function')
      expect(typeof noUnnecessaryIsNanRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(0))
      visitor.CallExpression(makeCallIsNaN(42))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(42, 10, 4, 10, 14))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(14)
    })

    test('does not report when first argument is null object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: undefined,
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles Literal with value 0 (falsy but number)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsNanRule.create(context)
      visitor.CallExpression(makeCallIsNaN(0))
      expect(reports.length).toBe(1)
    })

    test('meta docs properties are all defined', () => {
      expect(noUnnecessaryIsNanRule.meta.docs).toBeDefined()
      expect(noUnnecessaryIsNanRule.meta.docs?.category).toBeDefined()
      expect(noUnnecessaryIsNanRule.meta.docs?.description).toBeDefined()
      expect(noUnnecessaryIsNanRule.meta.docs?.url).toBeDefined()
    })
  })
})

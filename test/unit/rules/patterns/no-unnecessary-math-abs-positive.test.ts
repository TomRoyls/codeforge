import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryMathAbsPositiveRule } from '../../../../src/rules/patterns/no-unnecessary-math-abs-positive.js'
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

function makeMathAbsCall(
  argValue: unknown,
  argType = 'NumericLiteral',
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'Math' },
      property: { type: 'Identifier', name: 'abs' },
    },
    arguments: [{ type: argType, value: argValue }],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeCallNode(
  object: unknown,
  methodName: string,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object,
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-math-abs-positive rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryMathAbsPositiveRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryMathAbsPositiveRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryMathAbsPositiveRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryMathAbsPositiveRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryMathAbsPositiveRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Math.abs', () => {
      const desc = noUnnecessaryMathAbsPositiveRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/math\.abs/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryMathAbsPositiveRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-math-abs-positive.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryMathAbsPositiveRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryMathAbsPositiveRule).toBeDefined()
      expect(noUnnecessaryMathAbsPositiveRule.meta).toBeDefined()
      expect(noUnnecessaryMathAbsPositiveRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (35) =====

  describe('positive cases — reports unnecessary Math.abs', () => {
    test('reports for Math.abs(5) — positive integer', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(5))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.abs(0) — zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(0))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.abs(3.14) — positive float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(3.14))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.abs(100) — large positive integer', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(100))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.abs(1) — smallest positive integer', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(1))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.abs(0.5) — small positive float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(0.5))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.abs(999.999) — large positive float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(999.999))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.abs(0.0) — zero float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(0.0))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.abs(42) — common positive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(42))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.abs(7) — another positive integer', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(7))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.abs(0.001) — tiny positive float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(0.001))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.abs(123.456) — mixed float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(123.456))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.abs(1000) — thousand', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(1000))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.abs(255) — byte boundary', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(255))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.abs(10) — round number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(10))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.abs(50) — round number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(50))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.abs(2.718) — euler-like', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(2.718))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.abs(1.414) — sqrt(2)-like', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(1.414))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.abs(100000) — large scientific notation value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(100000))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.abs(3) — small positive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(3))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.abs(8) — power of two', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(8))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.abs(64) — power of two', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(64))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.abs(256) — power of two', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(256))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.abs(1024) — power of two', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(1024))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Math.abs', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(5))
      expect(reports[0].message).toMatch(/Math\.abs/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(5))
      expect(reports[0].message).toBe(
        'Unnecessary Math.abs() on a non-negative literal. Math.abs(n) where n >= 0 returns n.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(5))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(5))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      const node = makeMathAbsCall(5)
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(5, 'NumericLiteral', 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(5))
      visitor.CallExpression(makeMathAbsCall(10))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(5))
      visitor.CallExpression(makeMathAbsCall(100))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(5))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Math.abs(1e10) — very large positive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(1e10))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.abs(0.000001) — very small positive float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(0.000001))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Math.abs(-5) — negative integer', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(-5))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.abs(-3.14) — negative float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(-3.14))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.abs(-1) — negative one', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(-1))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.abs(-0.5) — negative float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(-0.5))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.abs(-100) — large negative', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(-100))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.abs(-999.999) — large negative float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(-999.999))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.abs(x) — variable argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(undefined, 'Identifier'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.abs(foo) — Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'abs' },
        },
        arguments: [{ type: 'Identifier', name: 'foo' }],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.abs() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'abs', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.abs(5, 1) — too many arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'Identifier', name: 'Math' },
          'abs',
          [{ type: 'NumericLiteral', value: 5 }, { type: 'NumericLiteral', value: 1 }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.abs(5, 1, 2) — three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'Identifier', name: 'Math' },
          'abs',
          [
            { type: 'NumericLiteral', value: 5 },
            { type: 'NumericLiteral', value: 1 },
            { type: 'NumericLiteral', value: 2 },
          ],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.ceil(5) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'Math' }, 'ceil', [{ type: 'NumericLiteral', value: 5 }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.floor(5) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'Math' }, 'floor', [{ type: 'NumericLiteral', value: 5 }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.round(5) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'Math' }, 'round', [{ type: 'NumericLiteral', value: 5 }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.max(5) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'Math' }, 'max', [{ type: 'NumericLiteral', value: 5 }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.min(5) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'Math' }, 'min', [{ type: 'NumericLiteral', value: 5 }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sqrt(5) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'Math' }, 'sqrt', [{ type: 'NumericLiteral', value: 5 }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.pow(5) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'Math' }, 'pow', [{ type: 'NumericLiteral', value: 5 }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for SomeObject.abs(5) — wrong object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'SomeObject' }, 'abs', [{ type: 'NumericLiteral', value: 5 }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for console.log(5) — completely different', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'console' }, 'log', [{ type: 'NumericLiteral', value: 5 }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is Identifier (not MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is not "Math"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'Number' }, 'abs', [{ type: 'NumericLiteral', value: 5 }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'abs' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is not "abs"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'Identifier', name: 'Math' }, 'ABS', [{ type: 'NumericLiteral', value: 5 }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall('hello', 'StringLiteral'))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(undefined, 'Identifier'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'abs' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryMathAbsPositiveRule.create(ctx1)
      const visitor2 = noUnnecessaryMathAbsPositiveRule.create(ctx2)
      visitor1.CallExpression(makeMathAbsCall(5))
      visitor2.CallExpression(makeMathAbsCall(-5))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates mixed valid/invalid correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(5))
      visitor.CallExpression(makeMathAbsCall(-3))
      visitor.CallExpression(makeMathAbsCall(10))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'abs' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'abs' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(5))
      visitor.CallExpression(makeMathAbsCall(-5))
      visitor.CallExpression(makeMathAbsCall(undefined, 'Identifier'))
      visitor.CallExpression(makeMathAbsCall(0))
      visitor.CallExpression(makeMathAbsCall(-3.14))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryMathAbsPositiveRule.create(context)
      const visitor2 = noUnnecessaryMathAbsPositiveRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryMathAbsPositiveRule.meta
      const meta2 = noUnnecessaryMathAbsPositiveRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'abs' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
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
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'abs' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'abs' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      const node = makeMathAbsCall(5)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryMathAbsPositiveRule).toBeDefined()
      expect(typeof noUnnecessaryMathAbsPositiveRule.create).toBe('function')
      expect(typeof noUnnecessaryMathAbsPositiveRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'abs' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(5, 'NumericLiteral', 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsPositiveRule.create(context)
      visitor.CallExpression(makeMathAbsCall(5))
      visitor.CallExpression(makeMathAbsCall(100))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})

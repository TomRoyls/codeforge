import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryIsFiniteRule } from '../../../../src/rules/patterns/no-unnecessary-is-finite.js'
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
    getSource: () => 'isFinite(42)',
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

function makeCallExpr(
  calleeName: string,
  args: unknown[],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 14,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeLiteral(value: unknown): unknown {
  return { type: 'Literal', value }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-is-finite rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryIsFiniteRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryIsFiniteRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryIsFiniteRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryIsFiniteRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryIsFiniteRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning isFinite', () => {
      const desc = noUnnecessaryIsFiniteRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/isfinite/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryIsFiniteRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-is-finite',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryIsFiniteRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryIsFiniteRule).toBeDefined()
      expect(noUnnecessaryIsFiniteRule.meta).toBeDefined()
      expect(noUnnecessaryIsFiniteRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (25) =====

  describe('positive cases — reports unnecessary isFinite', () => {
    test('reports for isFinite(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(42)]))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(3.14)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(3.14)]))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(-1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(-1)]))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(-100)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(-100)]))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(0.5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(0.5)]))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(1)]))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(999999)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(999999)]))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(-0.001)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(-0.001)]))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(1e10)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(1e10)]))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(1e-10)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(1e-10)]))
      expect(reports.length).toBe(1)
    })

    test('reports for node with loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(7)], 5, 10, 5, 24))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('reports for node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      const node = makeCallExpr('isFinite', [makeLiteral(42)])
      Object.assign(node as object, { range: [0, 14], extra: true })
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(123.456)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(123.456)]))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(0.0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(0.0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(-3.14)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(-3.14)]))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(2)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(2)]))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(100)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(100)]))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(1.5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(1.5)]))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(255)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(255)]))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(-999)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(-999)]))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(6.022e23)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(6.022e23)]))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(Number.MAX_SAFE_INTEGER)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(Number.MAX_SAFE_INTEGER)]))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(Number.MIN_SAFE_INTEGER)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(Number.MIN_SAFE_INTEGER)]))
      expect(reports.length).toBe(1)
    })

    test('reports for isFinite(Number.MAX_VALUE)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(Number.MAX_VALUE)]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('message mentions isFinite', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(42)]))
      expect(reports[0].message).toContain('isFinite')
    })

    test('message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(42)]))
      expect(reports[0].message).toBe(
        'Unnecessary isFinite() call on a finite numeric literal. This always returns true.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(42)]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(42)]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      const node = makeCallExpr('isFinite', [makeLiteral(42)])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(42)], 5, 10, 5, 24))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(42)]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report message contains "unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(42)]))
      expect(reports[0].message.toLowerCase()).toContain('unnecessary')
    })

    test('report message contains "finite"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(42)]))
      expect(reports[0].message.toLowerCase()).toContain('finite')
    })

    test('report message contains "always returns true"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(42)]))
      expect(reports[0].message).toContain('always returns true')
    })

    test('accumulation of reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(1)]))
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(2)]))
      expect(reports.length).toBe(2)
    })

    test('all reports have consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(1)]))
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(99)]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('single report per isFinite call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(42)]))
      expect(reports.length).toBe(1)
    })

    test('multiple violations each produce a report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(1)]))
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(2)]))
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(3)]))
      expect(reports.length).toBe(3)
    })

    test('report loc has end values preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(42)], 10, 4, 10, 18))
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(18)
    })
  })

  // ===== NEGATIVE CASES (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for isFinite("42") with string arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral('42')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for isFinite(true) with boolean arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(true)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for isFinite(x) with Identifier arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for isFinite() with no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for isFinite(1, 2) with 2 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(1), makeLiteral(2)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for isFinite(NaN) since NaN is not finite', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(NaN)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for isFinite(Infinity) since Infinity is not finite', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(Infinity)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for isFinite(-Infinity) since -Infinity is not finite', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(-Infinity)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-isFinite callee name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isNaN', [makeLiteral(42)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isFinite' },
        },
        arguments: [makeLiteral(42)],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        arguments: [makeLiteral(42)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "parseFloat"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('parseFloat', [makeLiteral(42)]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [null]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [undefined]))
      expect(reports.length).toBe(0)
    })

    test('does not report when literal value is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(null)]))
      expect(reports.length).toBe(0)
    })

    test('does not report when literal value is a string "hello"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral('hello')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal with value type boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(false)]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: 'not-an-array',
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arg type is not Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [{ type: 'BinaryExpression', operator: '+', left: {}, right: {} }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryIsFiniteRule.create(ctx1)
      const visitor2 = noUnnecessaryIsFiniteRule.create(ctx2)
      visitor1.CallExpression(makeCallExpr('isFinite', [makeLiteral(42)]))
      visitor2.CallExpression(makeCallExpr('isFinite', [makeLiteral('x')]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(1)]))
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral('x')]))
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(2)]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [makeLiteral(42)],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [makeLiteral(42)],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(42)]))
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral('x')]))
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(NaN)]))
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(10)]))
      visitor.CallExpression(makeCallExpr('isNaN', [makeLiteral(42)]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryIsFiniteRule.create(context)
      const visitor2 = noUnnecessaryIsFiniteRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryIsFiniteRule.meta
      const meta2 = noUnnecessaryIsFiniteRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [makeLiteral(42)],
        loc: makeLoc(1, 0, 1, 14),
        range: [0, 14],
        extra: true,
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [makeLiteral(42)],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [makeLiteral(42)],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      const node = makeCallExpr('isFinite', [makeLiteral(42)])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryIsFiniteRule).toBeDefined()
      expect(typeof noUnnecessaryIsFiniteRule.create).toBe('function')
      expect(typeof noUnnecessaryIsFiniteRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isFinite' },
        arguments: [makeLiteral(42)],
        loc: makeLoc(1, 0, 1, 14),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(1)]))
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(2)]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(42)], 10, 4, 10, 18))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(18)
    })

    test('does not report for isFinite(Number.POSITIVE_INFINITY)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [makeLiteral(Number.POSITIVE_INFINITY)]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [makeLiteral(42)],
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [makeLiteral(42)],
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', []))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg object has no type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryIsFiniteRule.create(context)
      visitor.CallExpression(makeCallExpr('isFinite', [{ value: 42 }]))
      expect(reports.length).toBe(0)
    })
  })
})

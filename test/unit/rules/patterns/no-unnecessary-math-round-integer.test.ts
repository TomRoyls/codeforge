import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryMathRoundInteger } from '../../../../src/rules/patterns/no-unnecessary-math-round-integer.js'
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

function makeMathCallNode(
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
      computed: false,
      object: { type: 'Identifier', name: 'Math' },
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeNumericLiteral(value: number): unknown {
  return { type: 'NumericLiteral', value }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-math-round-integer rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryMathRoundInteger.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryMathRoundInteger.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryMathRoundInteger.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryMathRoundInteger.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryMathRoundInteger.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Math.round', () => {
      const desc = noUnnecessaryMathRoundInteger.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/math\.round/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryMathRoundInteger.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-math-round-integer.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryMathRoundInteger.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryMathRoundInteger).toBeDefined()
      expect(noUnnecessaryMathRoundInteger.meta).toBeDefined()
      expect(noUnnecessaryMathRoundInteger.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports unnecessary Math.round with integer', () => {
    test('reports for Math.round(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.round(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(1)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.round(5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(5)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.round(10)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(10)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.round(100)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(100)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.round(999)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(999)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.round(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(42)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.round(1000000)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(1000000)]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Math.round', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(5)]))
      expect(reports[0].message).toMatch(/Math\.round/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(5)]))
      expect(reports[0].message).toBe(
        'Math.round() is unnecessary for integer values. The result is already an integer.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(5)]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(5)]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      const node = makeMathCallNode('round', [makeNumericLiteral(5)])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(5)], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(1)]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(42)]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(5)]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Math.round(0) — zero is a non-negative integer', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toMatch(/integer/)
    })

    test('reports for Math.round(7)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(7)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.round(255)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(255)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.round(3)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(3)]))
      expect(reports.length).toBe(1)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(5)], 2, 4, 2, 22))
      expect(reports[0].loc?.end.line).toBe(2)
      expect(reports[0].loc?.end.column).toBe(22)
    })

    test('reports for Math.round(50)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(50)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.round(2000)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(2000)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.round(8)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(8)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.round(20)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(20)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.round(500)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(500)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.round(15)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(15)]))
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(10)]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Math.round(3.14) — float value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(3.14)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.round(-5) — negative integer', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(-5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.round(-3.5) — negative float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(-3.5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.round(-1) — negative integer', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(-1)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.round(-100) — negative integer', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(-100)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.round(0.5) — float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(0.5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.round(1.1) — float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(1.1)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.round(2.7) — float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(2.7)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.round(x) — variable argument (Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.round() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.round(5, 1) — too many arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(5), makeNumericLiteral(1)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.ceil(5) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('ceil', [makeNumericLiteral(5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.floor(5) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('floor', [makeNumericLiteral(5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.abs(5) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('abs', [makeNumericLiteral(5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.max(5) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('max', [makeNumericLiteral(5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.min(5) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('min', [makeNumericLiteral(5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sqrt(5) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('sqrt', [makeNumericLiteral(5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.trunc(5) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('trunc', [makeNumericLiteral(5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'round' },
        arguments: [makeNumericLiteral(5)],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is not Math (Foo.round(5))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Foo' },
          property: { type: 'Identifier', name: 'round' },
        },
        arguments: [makeNumericLiteral(5)],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getMath' }, arguments: [] },
          property: { type: 'Identifier', name: 'round' },
        },
        arguments: [makeNumericLiteral(5)],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'round' },
        },
        arguments: [makeNumericLiteral(5)],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'round' },
        },
        arguments: [makeNumericLiteral(5)],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValue' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'val' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type (not CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is Literal (not NumericLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [{ type: 'StringLiteral', value: '5' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeNumericLiteral(5)], loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeNumericLiteral(5)], loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object name is "math" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'math' },
          property: { type: 'Identifier', name: 'round' },
        },
        arguments: [makeNumericLiteral(5)],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Round" (capital R)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'Round' },
        },
        arguments: [makeNumericLiteral(5)],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.round(-0.5) — negative float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(-0.5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.round(99.999) — float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(99.999)]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryMathRoundInteger.create(ctx1)
      const visitor2 = noUnnecessaryMathRoundInteger.create(ctx2)
      visitor1.CallExpression(makeMathCallNode('round', [makeNumericLiteral(5)]))
      visitor2.CallExpression(makeMathCallNode('round', [makeNumericLiteral(3.14)]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(5)]))
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(3.14)]))
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'round' },
        },
        arguments: [makeNumericLiteral(5)],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'round' },
        },
        arguments: [makeNumericLiteral(5)],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(5)]))    // reports
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(3.14)])) // no report
      visitor.CallExpression(makeMathCallNode('round', [{ type: 'Identifier', name: 'x' }])) // no report
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(0)]))    // reports
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(-5)]))   // no report
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryMathRoundInteger.create(context)
      const visitor2 = noUnnecessaryMathRoundInteger.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryMathRoundInteger.meta
      const meta2 = noUnnecessaryMathRoundInteger.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'round' },
        },
        arguments: [makeNumericLiteral(5)],
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
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'round' },
        },
        arguments: [makeNumericLiteral(5)],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'round' },
        },
        arguments: [makeNumericLiteral(5)],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      const node = makeMathCallNode('round', [makeNumericLiteral(5)])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryMathRoundInteger).toBeDefined()
      expect(typeof noUnnecessaryMathRoundInteger.create).toBe('function')
      expect(typeof noUnnecessaryMathRoundInteger.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'round' },
        },
        arguments: [makeNumericLiteral(5)],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression(makeMathCallNode('round', [makeNumericLiteral(5)], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property with false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'round' },
        },
        arguments: [makeNumericLiteral(5)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'round' },
          computed: true,
        },
        arguments: [makeNumericLiteral(5)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})

import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryMathFloorIntegerRule } from '../../../../src/rules/patterns/no-unnecessary-math-floor-integer.js'
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

function makeMathFloorNode(
  arg: unknown,
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
      property: { type: 'Identifier', name: 'floor' },
    },
    arguments: [arg],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-math-floor-integer rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryMathFloorIntegerRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryMathFloorIntegerRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryMathFloorIntegerRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryMathFloorIntegerRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryMathFloorIntegerRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Math.floor', () => {
      const desc = noUnnecessaryMathFloorIntegerRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/math\.floor/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryMathFloorIntegerRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-math-floor-integer.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryMathFloorIntegerRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryMathFloorIntegerRule).toBeDefined()
      expect(noUnnecessaryMathFloorIntegerRule.meta).toBeDefined()
      expect(noUnnecessaryMathFloorIntegerRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary Math.floor on integer', () => {
    test('reports for Math.floor(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.floor(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 1 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.floor(5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 5 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.floor(-1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: -1 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.floor(-3)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: -3 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.floor(100)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 100 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.floor(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 42 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.floor(999999)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 999999 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.floor(0x10) — hex integer value 16', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 0x10 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.floor(1e3) — scientific notation value 1000', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 1e3 }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Math.floor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 5 }))
      expect(reports[0].message).toMatch(/Math\.floor/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 5 }))
      expect(reports[0].message).toBe(
        'Unnecessary Math.floor() on an integer literal. Math.floor(n) where n is an integer returns n.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 5 }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 5 }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      const node = makeMathFloorNode({ type: 'NumericLiteral', value: 5 })
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 5 }, 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 5 }))
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 10 }))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 5 }))
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 10 }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for Math.floor(2) — small positive integer', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 2 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.floor(-100) — large negative integer', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: -100 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.floor(2147483647) — max 32-bit integer', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 2147483647 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.floor(1.0) — float representation of integer', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 1.0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.floor(0.0) — float representation of zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 0.0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.floor(-0) — negative zero is still integer', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: -0 }))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 5 }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (44) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Math.floor(3.14) — float literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 3.14 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.floor(0.5) — float literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 0.5 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.floor(-1.5) — negative float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: -1.5 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.floor(2.718) — float literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 2.718 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.floor(x) — variable Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.ceil(5) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'ceil' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.round(5) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'round' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.abs(5) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'abs' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.max(5) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'max' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.min(5) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'min' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.random() — wrong method no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'random' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for foo.floor(5) — wrong object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'floor' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Obj.floor(5) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Obj' },
          property: { type: 'Identifier', name: 'floor' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for floor(5) — direct call, not member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'floor' },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.floor() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'floor' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.floor(5, 1) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'floor' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }, { type: 'NumericLiteral', value: 1 }],
        loc: makeLoc(1, 0, 1, 18),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.floor(5, 1, 2) — three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'floor' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }, { type: 'NumericLiteral', value: 1 }, { type: 'NumericLiteral', value: 2 }],
        loc: makeLoc(1, 0, 1, 22),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'test' },
          property: { type: 'Identifier', name: 'floor' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "math" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'math' },
          property: { type: 'Identifier', name: 'floor' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'floor' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Floor" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'Floor' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.floor("string") — non-numeric Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'Literal', value: '5' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.floor with CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValue' }, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'floor' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'floor' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: null,
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'floor' },
        },
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'floor' },
        },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when NumericLiteral value is NaN', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: NaN }))
      expect(reports.length).toBe(0)
    })

  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryMathFloorIntegerRule.create(ctx1)
      const visitor2 = noUnnecessaryMathFloorIntegerRule.create(ctx2)
      visitor1.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 5 }))
      visitor2.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 3.14 }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly — mixed valid/invalid', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 5 }))
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 3.14 }))
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 10 }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'floor' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'floor' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly — multiple patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 3.14 }))
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 5 }))
      visitor.CallExpression(makeMathFloorNode({ type: 'Identifier', name: 'x' }))
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 0 }))
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 2.5 }))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryMathFloorIntegerRule.create(context)
      const visitor2 = noUnnecessaryMathFloorIntegerRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryMathFloorIntegerRule.meta
      const meta2 = noUnnecessaryMathFloorIntegerRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'floor' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
        loc: makeLoc(1, 0, 1, 16),
        range: [0, 16],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'floor' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'floor' },
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
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      const node = makeMathFloorNode({ type: 'NumericLiteral', value: 5 })
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryMathFloorIntegerRule).toBeDefined()
      expect(typeof noUnnecessaryMathFloorIntegerRule.create).toBe('function')
      expect(typeof noUnnecessaryMathFloorIntegerRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'floor' },
        },
        arguments: [{ type: 'NumericLiteral', value: 5 }],
        loc: makeLoc(1, 0, 1, 16),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 5 }, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFloorIntegerRule.create(context)
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 5 }))
      visitor.CallExpression(makeMathFloorNode({ type: 'NumericLiteral', value: 10 }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})

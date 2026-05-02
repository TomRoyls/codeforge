import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryMathCeilInteger } from '../../../../src/rules/patterns/no-unnecessary-math-ceil-integer.js'
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

function makeMathCeilCall(
  arg: unknown,
  computed = false,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed,
      object: { type: 'Identifier', name: 'Math' },
      property: { type: 'Identifier', name: 'ceil' },
    },
    arguments: [arg],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeNumLiteral(value: number): unknown {
  return { type: 'NumericLiteral', value }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-math-ceil-integer rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryMathCeilInteger.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryMathCeilInteger.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryMathCeilInteger.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryMathCeilInteger.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryMathCeilInteger.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Math.ceil', () => {
      const desc = noUnnecessaryMathCeilInteger.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/math\.ceil/)
    })

    test('should have a docs URL', () => {
      expect(noUnnecessaryMathCeilInteger.meta.docs?.url).toBeTruthy()
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryMathCeilInteger.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryMathCeilInteger).toBeDefined()
      expect(noUnnecessaryMathCeilInteger.meta).toBeDefined()
      expect(noUnnecessaryMathCeilInteger.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (32) =====

  describe('positive cases — reports unnecessary Math.ceil', () => {
    test('reports for Math.ceil(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(0)))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.ceil(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(1)))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.ceil(5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(5)))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.ceil(100)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(100)))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.ceil(999)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(999)))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.ceil(42) — non-computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(42), false))
      expect(reports.length).toBe(1)
    })

    test('reports for Math["ceil"](7) — computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(7), true))
      expect(reports.length).toBe(1)
    })

    test('report message mentions integer', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(5)))
      expect(reports[0].message).toMatch(/integer/i)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(5)))
      expect(reports[0].message).toBe(
        'Math.ceil() is unnecessary for integer values. The result is already an integer.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(5)))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(5)))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      const node = makeMathCeilCall(makeNumLiteral(5))
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(5), false, 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(1)))
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(2)))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(1)))
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(99)))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for Math.ceil(1000000) — large integer', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(1000000)))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.ceil(1) — computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(1), true))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.ceil(50) — computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(50), true))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(10)))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Math.ceil(256)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(256)))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.ceil(10) — non-computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(10), false))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.ceil(3)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(3)))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.ceil(20) — computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(20), true))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.ceil(500)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(500)))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.ceil(8)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(8)))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.ceil(15) — computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(15), true))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.ceil(30)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(30)))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.ceil(75)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(75)))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.ceil(200) — computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(200), true))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.ceil(4)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(4)))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.ceil(12) — computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(12), true))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (38) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Math.ceil(3.14) — float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(3.14)))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.ceil(-5) — negative integer', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(-5)))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.ceil(-3.5) — negative float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(-3.5)))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.ceil(x) — variable argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall({ type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.ceil() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'ceil' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.ceil(5, 1) — too many arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'ceil' },
        },
        arguments: [makeNumLiteral(5), makeNumLiteral(1)],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.round(5) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'round' },
        },
        arguments: [makeNumLiteral(5)],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.floor(5) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'floor' },
        },
        arguments: [makeNumLiteral(5)],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [makeNumLiteral(5)],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is an Identifier (not MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'ceil' },
        arguments: [makeNumLiteral(5)],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'ceil' }, arguments: [makeNumLiteral(5)], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'ceil' },
        },
        arguments: [makeNumLiteral(5)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for NotMath.ceil(5) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'NotMath' },
          property: { type: 'Identifier', name: 'ceil' },
        },
        arguments: [makeNumLiteral(5)],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.ceil(-1) — negative integer', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(-1)))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.ceil(-100) — large negative integer', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(-100)))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.ceil(0.5) — positive float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(0.5)))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.ceil(99.99) — positive float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(99.99)))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.ceil("5") — string literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall({ type: 'StringLiteral', value: '5' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.abs(5) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'abs' },
        },
        arguments: [makeNumLiteral(5)],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.max(5) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'max' },
        },
        arguments: [makeNumLiteral(5)],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a CallExpression in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getMath' }, arguments: [] },
          property: { type: 'Identifier', name: 'ceil' },
        },
        arguments: [makeNumLiteral(5)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is another MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'Math' } },
          property: { type: 'Identifier', name: 'ceil' },
        },
        arguments: [makeNumLiteral(5)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "ceil" but object is a Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Literal', value: 'Math' },
          property: { type: 'Identifier', name: 'ceil' },
        },
        arguments: [makeNumLiteral(5)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "ceil" but object is an ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'ObjectExpression', properties: [] },
          property: { type: 'Identifier', name: 'ceil' },
        },
        arguments: [makeNumLiteral(5)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.ceil(-0.1) — negative float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(-0.1)))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.ceil(NaN) — NaN is not an integer', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(NaN)))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.ceil(Infinity) — Infinity is not an integer', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(Infinity)))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryMathCeilInteger.create(ctx1)
      const visitor2 = noUnnecessaryMathCeilInteger.create(ctx2)
      visitor1.CallExpression(makeMathCeilCall(makeNumLiteral(5)))
      visitor2.CallExpression(makeMathCeilCall(makeNumLiteral(3.14)))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed valid/invalid', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(5)))
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(3.14)))
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(10)))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'ceil' },
        },
        arguments: [makeNumLiteral(5)],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryMathCeilInteger.create(context)
      const visitor2 = noUnnecessaryMathCeilInteger.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryMathCeilInteger.meta
      const meta2 = noUnnecessaryMathCeilInteger.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'ceil' },
        },
        arguments: [makeNumLiteral(5)],
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
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'ceil' },
        },
        arguments: [makeNumLiteral(5)],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'ceil' },
        },
        arguments: [makeNumLiteral(5)],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      const node = makeMathCeilCall(makeNumLiteral(5))
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryMathCeilInteger).toBeDefined()
      expect(typeof noUnnecessaryMathCeilInteger.create).toBe('function')
      expect(typeof noUnnecessaryMathCeilInteger.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'ceil' },
        },
        arguments: [makeNumLiteral(5)],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(5), false, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(5)))
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(3.14)))
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(-5)))
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(0)))
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(-3.5)))
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(100)))
      expect(reports.length).toBe(3)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(5)))
      visitor.CallExpression(makeMathCeilCall(makeNumLiteral(10)))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when callee property name is "Ceil" (uppercase C)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilInteger.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'Ceil' },
        },
        arguments: [makeNumLiteral(5)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})

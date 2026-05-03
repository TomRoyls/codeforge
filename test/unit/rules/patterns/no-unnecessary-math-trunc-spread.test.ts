import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryMathTruncSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-math-trunc-spread.js'
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

function makeMathTruncCall(
  args: unknown[],
  objectName = 'Math',
  methodName = 'trunc',
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpreadArg(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-math-trunc-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryMathTruncSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryMathTruncSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryMathTruncSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryMathTruncSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryMathTruncSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Math.trunc', () => {
      const desc = noUnnecessaryMathTruncSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/math/)
      expect(desc).toMatch(/trunc/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryMathTruncSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-math-trunc-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryMathTruncSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryMathTruncSpreadRule).toBeDefined()
      expect(noUnnecessaryMathTruncSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryMathTruncSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Math.trunc(...spread)', () => {
    test('reports for Math.trunc(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.trunc(...arr)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.trunc(...[1, 2, 3])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.trunc(...getNumbers())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getNumbers' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.trunc(...obj.values)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'values' } })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Math.trunc and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/trunc/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'Math.trunc(...items) with spread is unusual. trunc() expects a single number.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      const node = makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 'Math', 'trunc', 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for Math.trunc(...[])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'ArrayExpression', elements: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.trunc(...args) with arrow function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'CallExpression', callee: { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.trunc(...new Set())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.trunc(...someVar) where spread argument is a literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Literal', value: 42 })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Math.trunc(...template)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.trunc(...conditional)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.trunc(...obj[computed])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'key' }, computed: true })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.trunc(...a.b.c) nested member', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } }, property: { type: 'Identifier', name: 'c' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.trunc(...fn())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.trunc(...obj.method())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'method' } }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.trunc(...globalThis.values)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'globalThis' }, property: { type: 'Identifier', name: 'values' } })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Math.trunc(42) — no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.trunc(x) — Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.trunc(x, y) — two arguments with spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' }), { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.trunc() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.trunc(x, y) — two regular arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.floor(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 'Math', 'floor'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.ceil(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 'Math', 'ceil'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.round(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 'Math', 'round'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.abs(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 'Math', 'abs'))
      expect(reports.length).toBe(0)
    })

    test('does not report for MyMath.trunc(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 'MyMath', 'trunc'))
      expect(reports.length).toBe(0)
    })

    test('does not report for math.trunc(...items) — lowercase object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 'math', 'trunc'))
      expect(reports.length).toBe(0)
    })

    test('does not report for MATH.trunc(...items) — uppercase object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 'MATH', 'trunc'))
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.trunc(...items) — non-Math object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 'obj', 'trunc'))
      expect(reports.length).toBe(0)
    })

    test('does not report for trunc(...items) — direct function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'trunc' },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'global' }, property: { type: 'Identifier', name: 'Math' } },
          property: { type: 'Identifier', name: 'trunc' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getMath' }, arguments: [] },
          property: { type: 'Identifier', name: 'trunc' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'trunc' },
          computed: true,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'trunc' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'trunc' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'trunc' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: null,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is not SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.trunc(...items, extra) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' }), { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.max(...items) — wrong method max', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 'Math', 'max'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.min(...items) — wrong method min', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 'Math', 'min'))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.log(...items) — completely different object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 'console', 'log'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryMathTruncSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryMathTruncSpreadRule.create(ctx2)
      visitor1.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor2.CallExpression(makeMathTruncCall([{ type: 'Literal', value: 42 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeMathTruncCall([{ type: 'Literal', value: 42 }]))
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'trunc' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'trunc' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([{ type: 'Literal', value: 42 }]))
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 'MyMath', 'trunc'))
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 'Math', 'floor'))
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryMathTruncSpreadRule.create(context)
      const visitor2 = noUnnecessaryMathTruncSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryMathTruncSpreadRule.meta
      const meta2 = noUnnecessaryMathTruncSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'trunc' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
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
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'trunc' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'trunc' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      const node = makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryMathTruncSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryMathTruncSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryMathTruncSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'trunc' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 'Math', 'trunc', 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property (non-computed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'trunc' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'trunc' },
          computed: true,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report for three spread arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg({ type: 'Identifier', name: 'a' }), makeSpreadArg({ type: 'Identifier', name: 'b' }), makeSpreadArg({ type: 'Identifier', name: 'c' })]))
      expect(reports.length).toBe(0)
    })

    test('reports correctly when argument is SpreadElement with SpreadElement argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTruncSpreadRule.create(context)
      visitor.CallExpression(makeMathTruncCall([makeSpreadArg(makeSpreadArg({ type: 'Identifier', name: 'items' }))]))
      expect(reports.length).toBe(1)
    })
  })
})

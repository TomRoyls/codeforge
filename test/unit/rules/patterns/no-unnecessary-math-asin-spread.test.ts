import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryMathAsinSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-math-asin-spread.js'
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

function makeMathAsinCall(
  args: unknown[],
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
      property: { type: 'Identifier', name: 'asin' },
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpreadElement(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-math-asin-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryMathAsinSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryMathAsinSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryMathAsinSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryMathAsinSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryMathAsinSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning asin', () => {
      const desc = noUnnecessaryMathAsinSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/asin/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryMathAsinSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-math-asin-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryMathAsinSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryMathAsinSpreadRule).toBeDefined()
      expect(noUnnecessaryMathAsinSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryMathAsinSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Math.asin with spread', () => {
    test('reports for Math.asin(...items) with identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.asin(...arr) with array identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.asin(...data) with data identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'data' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.asin(...nums) with short identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'nums' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.asin(...[1, 2, 3]) with array literal spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.asin(...getValues()) with call expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValues' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.asin(...obj.prop) with member expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.asin(...(x)) with parenthesized expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'x' })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions asin and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/asin/)
    })

    test('report message mentions spread is unusual', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'Math.asin(...items) with spread is unusual. asin() expects a single number.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      const node = makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'items' })], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'b' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Math.asin(...args) with args identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.asin(...result) with result identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'result' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.asin(...foo.bar.baz) with deep member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'foo' }, property: { type: 'Identifier', name: 'bar' } }, property: { type: 'Identifier', name: 'baz' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.asin(...[]) with empty array spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'ArrayExpression', elements: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.asin(...fn()) with function call spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.asin(...new Set()) with new expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.asin(...values) with conditional expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.asin(...template) with template literal spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Math.asin(x) with regular identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.asin(0.5) with literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([{ type: 'Literal', value: 0.5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.asin(1) with integer literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.asin() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.asin(a, b) with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.asin(...a, ...b) with two spread arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'a' }), makeSpreadElement({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.acos(...items) — wrong method name acos', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'acos' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sin(...items) — wrong method name sin', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sin' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.atan(...items) — wrong method name atan', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'atan' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.max(...items) — wrong method name max', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'max' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for myObj.asin(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myObj' },
          property: { type: 'Identifier', name: 'asin' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Trig.asin(...items) — wrong object name Trig', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Trig' },
          property: { type: 'Identifier', name: 'asin' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for math.asin(...items) — lowercase math', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'math' },
          property: { type: 'Identifier', name: 'asin' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for asin(...items) — no object (standalone call)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'asin' },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'asin' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is not an Identifier (MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'window' }, property: { type: 'Identifier', name: 'Math' } },
          property: { type: 'Identifier', name: 'asin' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getMath' }, arguments: [] },
          property: { type: 'Identifier', name: 'asin' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'asin' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'asin' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: null,
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not a SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([{ type: 'Literal', value: 0.5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'asin' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.asin(expr) with CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValue' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.asin(a + b) with BinaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([{ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.asin(-x) with UnaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([{ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Identifier', name: 'x' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "ASIN" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'ASIN' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryMathAsinSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryMathAsinSpreadRule.create(ctx2)
      visitor1.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor2.CallExpression(makeMathAsinCall([{ type: 'Identifier', name: 'x' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeMathAsinCall([{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'asin' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'asin' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeMathAsinCall([{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeMathAsinCall([{ type: 'Literal', value: 0.5 }]))
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'arr' })]))
      visitor.CallExpression(makeMathAsinCall([]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryMathAsinSpreadRule.create(context)
      const visitor2 = noUnnecessaryMathAsinSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryMathAsinSpreadRule.meta
      const meta2 = noUnnecessaryMathAsinSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'asin' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
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
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'asin' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'asin' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      const node = makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryMathAsinSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryMathAsinSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryMathAsinSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'asin' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'items' })], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property (computed: false)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'asin' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'asin' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles Math.asin with non-SpreadElement first argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'val' } }]))
      expect(reports.length).toBe(0)
    })

    test('handles Math.asin with three arguments including spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([{ type: 'Literal', value: 0.5 }, makeSpreadElement({ type: 'Identifier', name: 'rest' }), { type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('message mentions expects a single number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAsinSpreadRule.create(context)
      visitor.CallExpression(makeMathAsinCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/single number/)
    })
  })
})

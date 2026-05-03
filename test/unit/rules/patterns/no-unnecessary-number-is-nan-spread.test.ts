import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryNumberIsNanSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-number-is-nan-spread.js'
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

function makeSpreadArg(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
}

function makeNumberIsNanCall(
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
      computed: false,
      object: { type: 'Identifier', name: 'Number' },
      property: { type: 'Identifier', name: 'isNaN' },
    },
    arguments: [arg],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-number-is-nan-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryNumberIsNanSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryNumberIsNanSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryNumberIsNanSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryNumberIsNanSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryNumberIsNanSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Number.isNaN', () => {
      const desc = noUnnecessaryNumberIsNanSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/number\.isnan/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryNumberIsNanSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-number-is-nan-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryNumberIsNanSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryNumberIsNanSpreadRule).toBeDefined()
      expect(noUnnecessaryNumberIsNanSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryNumberIsNanSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Number.isNaN with spread', () => {
    test('reports for Number.isNaN(...items) with identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'Identifier', name: 'items' })))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(...arr) with different variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'Identifier', name: 'arr' })))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(...[1, 2, 3]) with array expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] })))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(...[]) with empty array spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'ArrayExpression', elements: [] })))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(...[x]) with single element array spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'ArrayExpression', elements: [{ type: 'Identifier', name: 'x' }] })))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(...(fn())) with call expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] })))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(...obj.prop) with member expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } })))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(...args) where args is a variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'Identifier', name: 'args' })))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Number.isNaN and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'Identifier', name: 'items' })))
      expect(reports[0].message).toMatch(/Number\.isNaN/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'Identifier', name: 'items' })))
      expect(reports[0].message).toBe(
        'Number.isNaN(...items) with spread is unusual. isNaN() expects a single value.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'Identifier', name: 'items' })))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'Identifier', name: 'items' })))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      const node = makeNumberIsNanCall(makeSpreadArg({ type: 'Identifier', name: 'items' }))
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'Identifier', name: 'items' }), 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'Identifier', name: 'items' })))
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'Identifier', name: 'arr' })))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'Identifier', name: 'items' })))
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'Identifier', name: 'arr' })))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'Identifier', name: 'items' })))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Number.isNaN(...new Set()) with new expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] })))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(...values) with values identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'Identifier', name: 'values' })))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(...getItems()) with function call spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] })))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(...a.b.c) with deep member expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'a' },
          property: { type: 'Identifier', name: 'b' },
        },
        property: { type: 'Identifier', name: 'c' },
      })))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(...template) with template literal spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'TemplateLiteral', quasis: [], expressions: [] })))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(...conditional) with conditional expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
      })))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(...obj) with object spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'Identifier', name: 'obj' })))
      expect(reports.length).toBe(1)
    })

    test('reports for Number.isNaN(...list) with list identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'Identifier', name: 'list' })))
      expect(reports.length).toBe(1)
    })

  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (45) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Number.isNaN(x) without spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall({ type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isNaN(42) with literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isNaN(NaN) with NaN argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall({ type: 'Identifier', name: 'NaN' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isNaN(x, y) with two arguments and first is spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' }), { type: 'Identifier', name: 'y' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isNaN() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.isNaN(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isFinite(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isFinite' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.parseInt(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'parseInt' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isInteger(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isInteger' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for isNaN(...items) — bare function, not Number.isNaN', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number["isNaN"](...items) — computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Literal', value: 'isNaN' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.isNaN(...items) — wrong object identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isNaN(...items) where object is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'global' }, property: { type: 'Identifier', name: 'Number' } },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Literal', value: 'isNaN' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "isnan" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isnan' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "IsNaN" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'IsNaN' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: null,
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Number' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Number' },
          property: null,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isNaN(x + 1) with binary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 1 } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isNaN(-x) with unary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall({ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Identifier', name: 'x' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isNaN(getValue()) with call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValue' }, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isNaN with three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'a' }), { type: 'Identifier', name: 'b' }, { type: 'Identifier', name: 'c' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Literal', value: 42 },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'ObjectExpression', properties: [] },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getNum' }, arguments: [] },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "number" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'number' },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "NUMBER" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'NUMBER' },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Number.isNaN with ArrowFunction expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryNumberIsNanSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryNumberIsNanSpreadRule.create(ctx2)
      visitor1.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'Identifier', name: 'items' })))
      visitor2.CallExpression(makeNumberIsNanCall({ type: 'Identifier', name: 'x' }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed valid/invalid', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'Identifier', name: 'items' })))
      visitor.CallExpression(makeNumberIsNanCall({ type: 'Identifier', name: 'x' }))
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'Identifier', name: 'arr' })))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'Identifier', name: 'items' })))
      visitor.CallExpression(makeNumberIsNanCall({ type: 'Identifier', name: 'x' }))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'isNaN' },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'Identifier', name: 'arr' })))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryNumberIsNanSpreadRule.create(context)
      const visitor2 = noUnnecessaryNumberIsNanSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryNumberIsNanSpreadRule.meta
      const meta2 = noUnnecessaryNumberIsNanSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isNaN' },
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
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isNaN' },
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
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      const node = makeNumberIsNanCall(makeSpreadArg({ type: 'Identifier', name: 'items' }))
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryNumberIsNanSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryNumberIsNanSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryNumberIsNanSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Number' },
          property: { type: 'Identifier', name: 'isNaN' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'Identifier', name: 'items' }), 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumberIsNanSpreadRule.create(context)
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'Identifier', name: 'items' })))
      visitor.CallExpression(makeNumberIsNanCall(makeSpreadArg({ type: 'Identifier', name: 'arr' })))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})

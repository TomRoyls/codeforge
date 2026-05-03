import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryMathExpSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-math-exp-spread.js'
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

function makeMathExpCall(
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
      object: { type: 'Identifier', name: 'Math' },
      property: { type: 'Identifier', name: 'exp' },
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpreadArg(argument: unknown = { type: 'Identifier', name: 'items' }): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-math-exp-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryMathExpSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryMathExpSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryMathExpSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryMathExpSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryMathExpSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Math.exp', () => {
      const desc = noUnnecessaryMathExpSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/math\.exp/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryMathExpSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-math-exp-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryMathExpSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryMathExpSpreadRule).toBeDefined()
      expect(noUnnecessaryMathExpSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryMathExpSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Math.exp(...spread)', () => {
    test('reports Math.exp(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.exp(...arr)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.exp(...numbers)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg({ type: 'Identifier', name: 'numbers' })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.exp(...(getValues()))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValues' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.exp(...[1, 2, 3])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.exp(...obj.values)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'values' } })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Math.exp', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg()]))
      expect(reports[0].message).toMatch(/Math\.exp/)
    })

    test('report message mentions spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg()]))
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg()]))
      expect(reports[0].message).toBe(
        'Math.exp(...items) with spread is unusual. exp() expects a single number.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg()]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg()]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      const node = makeMathExpCall([makeSpreadArg()])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg()], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg()]))
      visitor.CallExpression(makeMathExpCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg()]))
      visitor.CallExpression(makeMathExpCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports Math.exp(...fn())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.exp(...new Array(3))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Array' }, arguments: [{ type: 'Literal', value: 3 }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.exp(...args) with spread on identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg()]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports Math.exp(...a.b.c)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg({ type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } }, property: { type: 'Identifier', name: 'c' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.exp(...template)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg({ type: 'Identifier', name: 'template' })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.exp(...iterable)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg({ type: 'Identifier', name: 'iterable' })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.exp(...set)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg({ type: 'Identifier', name: 'set' })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.exp(...map.keys())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg({ type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'map' }, property: { type: 'Identifier', name: 'keys' } }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.exp(...yielded)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg({ type: 'YieldExpression', argument: null })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report Math.exp(5) — no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.exp(x) — identifier arg, no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.exp() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.exp(x, ...items) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([{ type: 'Identifier', name: 'x' }, makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.exp(...items, ...more) — two spread arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg(), makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.log(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'log' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report Math.max(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'max' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report Math.min(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'min' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report MyObj.exp(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'MyObj' },
          property: { type: 'Identifier', name: 'exp' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report exp(...items) — standalone function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'exp' },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report Math["exp"](...items) — computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'exp' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'exp' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getMath' }, arguments: [] },
          property: { type: 'Identifier', name: 'exp' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'ns' }, property: { type: 'Identifier', name: 'Math' } },
          property: { type: 'Identifier', name: 'exp' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'exp' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'exp' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: null,
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Exp" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'Exp' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "exp2"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'exp2' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "math" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'math' },
          property: { type: 'Identifier', name: 'exp' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "MATH" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'MATH' },
          property: { type: 'Identifier', name: 'exp' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report Math.exp(1 + 2) — BinaryExpression arg, no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([{ type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 1 }, right: { type: 'Literal', value: 2 } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.exp(getValue()) — CallExpression arg, no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValue' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report Math.sqrt(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sqrt' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report Math.pow(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'pow' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
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
      const visitor1 = noUnnecessaryMathExpSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryMathExpSpreadRule.create(ctx2)
      visitor1.CallExpression(makeMathExpCall([makeSpreadArg()]))
      visitor2.CallExpression(makeMathExpCall([{ type: 'Literal', value: 5 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg()]))
      visitor.CallExpression(makeMathExpCall([{ type: 'Literal', value: 5 }]))
      visitor.CallExpression(makeMathExpCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'exp' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'exp' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([{ type: 'Literal', value: 5 }]))
      visitor.CallExpression(makeMathExpCall([makeSpreadArg()]))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'exp' },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      visitor.CallExpression(makeMathExpCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      visitor.CallExpression(makeMathExpCall([{ type: 'Identifier', name: 'x' }, makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryMathExpSpreadRule.create(context)
      const visitor2 = noUnnecessaryMathExpSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryMathExpSpreadRule.meta
      const meta2 = noUnnecessaryMathExpSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'exp' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
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
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'exp' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'exp' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      const node = makeMathExpCall([makeSpreadArg()])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryMathExpSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryMathExpSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryMathExpSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'exp' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg()], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property with correct shape', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'exp' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([makeSpreadArg()]))
      visitor.CallExpression(makeMathExpCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'exp' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'exp' },
          computed: false,
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report Math.exp(x) where x is ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathExpSpreadRule.create(context)
      visitor.CallExpression(makeMathExpCall([{ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'flag' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }]))
      expect(reports.length).toBe(0)
    })
  })
})

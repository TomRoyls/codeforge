import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryMathAbsSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-math-abs-spread.js'
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
      property: { type: 'Identifier', name: 'abs' },
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpreadArg(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-math-abs-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryMathAbsSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryMathAbsSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryMathAbsSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryMathAbsSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryMathAbsSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Math.abs and spread', () => {
      const desc = noUnnecessaryMathAbsSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/math\.abs/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryMathAbsSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-math-abs-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryMathAbsSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryMathAbsSpreadRule).toBeDefined()
      expect(noUnnecessaryMathAbsSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryMathAbsSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Math.abs(...spread)', () => {
    test('reports Math.abs(...items) with identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.abs(...arr) with array identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.abs(...nums) with short variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({ type: 'Identifier', name: 'nums' })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.abs(...getValues()) with call expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValues' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.abs(...obj.prop) with member expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.abs(...[1, 2, 3]) with array expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Math.abs and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/Math\.abs/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'Math.abs(...items) with spread is unusual. abs() expects a single number.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      const node = makeMathAbsCall([makeSpreadArg({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({ type: 'Identifier', name: 'b' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports Math.abs(...args) with member expression from arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.abs(...data) where spread argument is a CallExpression with args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getData' },
        arguments: [{ type: 'Literal', value: 'param' }],
      })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.abs(...nested.obj.prop) with deep member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'nested' },
          property: { type: 'Identifier', name: 'obj' },
        },
        property: { type: 'Identifier', name: 'prop' },
      })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.abs(...(x)) with parenthesized expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({ type: 'Identifier', name: 'x' })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.abs(...condResult) where argument is conditional', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'flag' },
        consequent: { type: 'ArrayExpression', elements: [] },
        alternate: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] },
      })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.abs(...templateResult) with tagged template spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({
        type: 'TaggedTemplateExpression',
        tag: { type: 'Identifier', name: 'tag' },
        quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
      })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.abs(...yielded) where argument is yield expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({
        type: 'YieldExpression',
        argument: { type: 'Identifier', name: 'val' },
      })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.abs(...awaited) where argument is await expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'promise' },
      })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.abs(...fn()) where fn returns a spread of function call result', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }],
      })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.abs(...obj[key]) with computed member expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'key' },
        computed: true,
      })]))
      expect(reports.length).toBe(1)
    })

    test('reports Math.abs(...new Set()) with new expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set' },
        arguments: [],
      })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report Math.abs(x) with regular identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.abs(42) with literal number argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.abs(-5) with negative number argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([{ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Literal', value: 5 } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.abs() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.abs(x, y) with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.abs(x, y, z) with three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }, { type: 'Identifier', name: 'z' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.max(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'max' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report Math.min(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'min' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report Math.ceil(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'ceil' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report Math.floor(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'floor' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report obj.abs(...items) — non-Math object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'abs' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report calculator.abs(...items) — different object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'calculator' },
          property: { type: 'Identifier', name: 'abs' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is MemberExpression (not Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'window' },
            property: { type: 'Identifier', name: 'Math' },
          },
          property: { type: 'Identifier', name: 'abs' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getMath' }, arguments: [] },
          property: { type: 'Identifier', name: 'abs' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'abs' },
          computed: true,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is Identifier (not MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'abs' },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'abs' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: null,
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report Math["abs"](...items) — computed member', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'abs' },
          computed: true,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report Math.abs(calc) with call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([{
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'calc' },
        arguments: [],
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.abs(obj.value) with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([{
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'value' },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.abs(n ?? 0) with binary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([{
        type: 'BinaryExpression',
        operator: '??',
        left: { type: 'Identifier', name: 'n' },
        right: { type: 'Literal', value: 0 },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type (not CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report Math.abs(...items, extra) — two arguments (first is spread)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([
        makeSpreadArg({ type: 'Identifier', name: 'items' }),
        { type: 'Identifier', name: 'extra' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.abs(extra, ...items) — two arguments (second is spread)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([
        { type: 'Identifier', name: 'extra' },
        makeSpreadArg({ type: 'Identifier', name: 'items' }),
      ]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryMathAbsSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryMathAbsSpreadRule.create(ctx2)
      visitor1.CallExpression(makeMathAbsCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor2.CallExpression(makeMathAbsCall([{ type: 'Identifier', name: 'x' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeMathAbsCall([{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({ type: 'Identifier', name: 'more' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'abs' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'abs' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeMathAbsCall([{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeMathAbsCall([{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }]))
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({ type: 'Identifier', name: 'more' })]))
      visitor.CallExpression(makeMathAbsCall([]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryMathAbsSpreadRule.create(context)
      const visitor2 = noUnnecessaryMathAbsSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryMathAbsSpreadRule.meta
      const meta2 = noUnnecessaryMathAbsSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'abs' },
          computed: false,
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
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'abs' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'abs' },
          computed: false,
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
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      const node = makeMathAbsCall([makeSpreadArg({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryMathAbsSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryMathAbsSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryMathAbsSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'abs' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({ type: 'Identifier', name: 'items' })], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeMathAbsCall([makeSpreadArg({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'abs' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'abs' },
          computed: false,
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression(makeMathAbsCall([null]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'abs' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles math with uppercase MATH object name (not Math)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathAbsSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'MATH' },
          property: { type: 'Identifier', name: 'abs' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })
  })
})

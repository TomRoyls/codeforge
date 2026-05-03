import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryMathSignSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-math-sign-spread.js'
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

function makeMathSignSpreadNode(
  spreadArg: unknown = { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 25,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'Math' },
      property: { type: 'Identifier', name: 'sign' },
      computed: false,
    },
    arguments: [spreadArg],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-math-sign-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryMathSignSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryMathSignSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryMathSignSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryMathSignSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryMathSignSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Math.sign and spread', () => {
      const desc = noUnnecessaryMathSignSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/math\.sign/)
      expect(desc).toMatch(/spread/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryMathSignSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-math-sign-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryMathSignSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryMathSignSpreadRule).toBeDefined()
      expect(noUnecessaryMathSignSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryMathSignSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Math.sign(...spread)', () => {
    test('reports for Math.sign(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode())
      expect(reports.length).toBe(1)
    })

    test('reports for Math.sign(...arr)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode({ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.sign(...numbers)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode({ type: 'SpreadElement', argument: { type: 'Identifier', name: 'numbers' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.sign(...[1, 2, 3])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode({ type: 'SpreadElement', argument: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.sign(...getValues())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode({ type: 'SpreadElement', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getValues' }, arguments: [] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.sign(...obj.values)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode({ type: 'SpreadElement', argument: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'values' } } }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Math.sign and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode())
      expect(reports[0].message).toMatch(/Math\.sign/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode())
      expect(reports[0].message).toBe(
        'Math.sign(...items) with spread is unusual. sign() expects a single number.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      const node = makeMathSignSpreadNode()
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode(undefined, 5, 10, 5, 35))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode())
      visitor.CallExpression(makeMathSignSpreadNode())
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode())
      visitor.CallExpression(makeMathSignSpreadNode({ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for SpreadElement with conditional expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode({ type: 'SpreadElement', argument: { type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } } }))
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement with template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode({ type: 'SpreadElement', argument: { type: 'TemplateLiteral', quasis: [], expressions: [] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement with arrow function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode({ type: 'SpreadElement', argument: { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } } }))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for SpreadElement with binary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode({ type: 'SpreadElement', argument: { type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } } }))
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement with array with SpreadElement inside', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode({ type: 'SpreadElement', argument: { type: 'ArrayExpression', elements: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'inner' } }] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement with call expression member argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode({ type: 'SpreadElement', argument: { type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'method' } }, arguments: [] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement with object expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode({ type: 'SpreadElement', argument: { type: 'ObjectExpression', properties: [] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement with unary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode({ type: 'SpreadElement', argument: { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } } }))
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode({ type: 'SpreadElement', argument: null }))
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement with undefined argument property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode({ type: 'SpreadElement' }))
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement with logical expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode({ type: 'SpreadElement', argument: { type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } } }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Math.sign(5) — no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode({ type: 'Literal', value: 5 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(x) — identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode({ type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign() — zero arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sign' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(x, y) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sign' },
        },
        arguments: [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sign(...items, extra) — two arguments with spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sign' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }, { type: 'Identifier', name: 'extra' }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.abs(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'abs' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.max(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'max' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.min(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'min' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.floor(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'floor' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.sign(...items) — non-Math object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'sign' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for myMath.sign(...items) — non-Math identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myMath' },
          property: { type: 'Identifier', name: 'sign' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } },
          property: { type: 'Identifier', name: 'sign' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getMath' }, arguments: [] },
          property: { type: 'Identifier', name: 'sign' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'sign' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "sign" with computed access', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sign' },
          computed: true,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: null,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'sign' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'sign' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not a SpreadElement (is Literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not a SpreadElement (is CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValue' }, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sign' },
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Sign" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'Sign' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "math" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'math' },
          property: { type: 'Identifier', name: 'sign' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryMathSignSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryMathSignSpreadRule.create(ctx2)
      visitor1.CallExpression(makeMathSignSpreadNode())
      visitor2.CallExpression(makeMathSignSpreadNode({ type: 'Literal', value: 5 }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode())
      visitor.CallExpression(makeMathSignSpreadNode({ type: 'Literal', value: 5 }))
      visitor.CallExpression(makeMathSignSpreadNode())
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sign' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sign' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode())
      visitor.CallExpression(makeMathSignSpreadNode({ type: 'Literal', value: 5 }))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'sign' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      visitor.CallExpression(makeMathSignSpreadNode())
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'abs' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryMathSignSpreadRule.create(context)
      const visitor2 = noUnnecessaryMathSignSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryMathSignSpreadRule.meta
      const meta2 = noUnnecessaryMathSignSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sign' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
        range: [0, 25],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sign' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sign' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      const node = makeMathSignSpreadNode()
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryMathSignSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryMathSignSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryMathSignSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sign' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode(undefined, 10, 4, 10, 30))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(30)
    })

    test('handles computed member expression property that is false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sign' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'sign' },
          computed: true,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression(makeMathSignSpreadNode())
      visitor.CallExpression(makeMathSignSpreadNode({ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles three arguments — does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sign' },
        },
        arguments: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: 2 },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('handles arguments property being undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sign' },
        },
        arguments: undefined,
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('handles arguments missing entirely from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSignSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sign' },
        },
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })
  })
})

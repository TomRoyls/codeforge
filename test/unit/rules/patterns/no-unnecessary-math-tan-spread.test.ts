import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryMathTanSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-math-tan-spread.js'
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

function makeMathTanSpreadNode(
  spreadArg: unknown = { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
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
      property: { type: 'Identifier', name: 'tan' },
      computed: false,
    },
    arguments: [spreadArg],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeCallNode(
  object: unknown,
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
      object,
      property: { type: 'Identifier', name: methodName },
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-math-tan-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryMathTanSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryMathTanSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryMathTanSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryMathTanSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryMathTanSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Math.tan and spread', () => {
      const desc = noUnnecessaryMathTanSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/math/)
      expect(desc).toMatch(/tan/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryMathTanSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-math-tan-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryMathTanSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryMathTanSpreadRule).toBeDefined()
      expect(noUnnecessaryMathTanSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryMathTanSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Math.tan(...items) with spread', () => {
    test('reports for Math.tan(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode())
      expect(reports.length).toBe(1)
    })

    test('reports for Math.tan(...arr)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode({ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.tan(...numbers)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode({ type: 'SpreadElement', argument: { type: 'Identifier', name: 'numbers' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.tan(...[1, 2, 3])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode({ type: 'SpreadElement', argument: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.tan(...getAngles())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode({ type: 'SpreadElement', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getAngles' }, arguments: [] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.tan(...obj.angles)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode({ type: 'SpreadElement', argument: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'angles' } } }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Math.tan and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode())
      expect(reports[0].message).toMatch(/Math\.tan/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode())
      expect(reports[0].message).toBe(
        'Math.tan(...items) with spread is unusual. tan() expects a single number.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      const node = makeMathTanSpreadNode()
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode(undefined, 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode())
      visitor.CallExpression(makeMathTanSpreadNode())
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode())
      visitor.CallExpression(makeMathTanSpreadNode())
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Math.tan(...(x ? a : b))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode({ type: 'SpreadElement', argument: { type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.tan(...[x])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode({ type: 'SpreadElement', argument: { type: 'ArrayExpression', elements: [{ type: 'Identifier', name: 'x' }] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.tan(...new Array(3))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode({ type: 'SpreadElement', argument: { type: 'NewExpression', callee: { type: 'Identifier', name: 'Array' }, arguments: [{ type: 'Literal', value: 3 }] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.tan(...data.values())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode({ type: 'SpreadElement', argument: { type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'data' }, property: { type: 'Identifier', name: 'values' }, computed: false }, arguments: [] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.tan(...args) where args is identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode({ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.tan(...[1])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode({ type: 'SpreadElement', argument: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.tan(...(function(){ return [1] })())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode({ type: 'SpreadElement', argument: { type: 'CallExpression', callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, arguments: [] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.tan(...window.angles)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode({ type: 'SpreadElement', argument: { type: 'MemberExpression', object: { type: 'Identifier', name: 'window' }, property: { type: 'Identifier', name: 'angles' } } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.tan(...{a:1,b:2})', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode({ type: 'SpreadElement', argument: { type: 'ObjectExpression', properties: [] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.tan(...vec)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode({ type: 'SpreadElement', argument: { type: 'Identifier', name: 'vec' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.tan(...coords)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode({ type: 'SpreadElement', argument: { type: 'Identifier', name: 'coords' } }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Math.tan(x) — no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'tan', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.tan(0) — literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'tan', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.tan(angle) — identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'tan', [{ type: 'Identifier', name: 'angle' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.tan() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'tan', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.tan(a, b) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'tan', [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sin(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'sin', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.cos(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'cos', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.atan(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'atan', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.floor(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'floor', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.max(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'max', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.tan(...items) — object is not Math', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'obj' }, 'tan', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for myMath.tan(...items) — object is not Math', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'myMath' }, 'tan', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'tan' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'tan' },
          computed: true,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'global' }, property: { type: 'Identifier', name: 'Math' }, computed: false }, 'tan', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'tan' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'tan' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: null,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "tanh"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'tanh', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "atan"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'atan', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'tan', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for three arguments with spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'tan', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }, { type: 'Identifier', name: 'x' }, { type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Tan" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'Tan', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryMathTanSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryMathTanSpreadRule.create(ctx2)
      visitor1.CallExpression(makeMathTanSpreadNode())
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'tan', [{ type: 'Identifier', name: 'x' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode())
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'tan', [{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeMathTanSpreadNode())
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'tan' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode())
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'tan', [{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'obj' }, 'tan', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      visitor.CallExpression(makeMathTanSpreadNode())
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'sin', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryMathTanSpreadRule.create(context)
      const visitor2 = noUnnecessaryMathTanSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryMathTanSpreadRule.meta
      const meta2 = noUnnecessaryMathTanSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'tan' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
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
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'tan' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'tan' },
          computed: false,
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
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      const node = makeMathTanSpreadNode()
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryMathTanSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryMathTanSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryMathTanSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'tan' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode(undefined, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression that is false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'tan' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'tan' },
          computed: true,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeMathTanSpreadNode())
      visitor.CallExpression(makeMathTanSpreadNode())
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report for Math.tan(Math.PI / 4)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'tan', [{ type: 'BinaryExpression', operator: '/', left: { type: 'MemberExpression', object: { type: 'Identifier', name: 'Math' }, property: { type: 'Identifier', name: 'PI' }, computed: false }, right: { type: 'Literal', value: 4 } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'tan' },
          computed: false,
        },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'tan' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "math" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathTanSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'math' }, 'tan', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })
  })
})
